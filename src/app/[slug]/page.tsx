import { notFound, redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { ProposalView } from "./components/proposal-view";
import { DashboardView } from "./components/dashboard-view";
import type { Project, Client, Milestone, Note, Deliverable } from "@/types";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ payment?: string }>;
}

export type ProjectWithRelations = Project & {
  client: Client;
  milestones: Milestone[];
  notes: Note[];
  deliverables: Deliverable[];
};

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const { slug } = await params;
  const { payment } = await searchParams;

  // Use regular client for auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Use admin client to fetch project (bypasses RLS)
  // This allows public access to proposal pages
  const adminSupabase = createAdminClient();
  const { data: project, error } = await adminSupabase
    .from("projects")
    .select(`
      *,
      client:clients(*),
      milestones(*),
      notes(*),
      deliverables(*)
    `)
    .eq("slug", slug)
    .single();

  if (error || !project) {
    notFound();
  }

  // Type assertion
  const typedProject = project as unknown as ProjectWithRelations;

  // Check access: either admin or the client
  const isAdmin = user?.email === process.env.ADMIN_EMAIL;
  const isClient = user?.email === typedProject.client?.email;

  // If not logged in and not in proposal state, redirect to login
  if (!user && typedProject.status !== "proposal") {
    redirect(`/login?redirect=/${slug}`);
  }

  // If logged in but not admin and not the client, show 404
  if (user && !isAdmin && !isClient) {
    notFound();
  }

  // Determine which view to show based on status
  const showProposal = typedProject.status === "proposal" && !typedProject.deposit_paid;

  // Sort milestones by sort_order
  typedProject.milestones = typedProject.milestones?.sort((a, b) => a.sort_order - b.sort_order) || [];

  // Sort notes by created_at descending
  typedProject.notes = typedProject.notes?.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) || [];

  if (showProposal) {
    return (
      <ProposalView
        project={typedProject}
        paymentStatus={payment}
        isAdmin={isAdmin}
      />
    );
  }

  return (
    <DashboardView
      project={typedProject}
      paymentStatus={payment}
      isAdmin={isAdmin}
    />
  );
}
