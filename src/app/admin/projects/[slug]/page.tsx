import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CollaboratorsView } from "./components/collaborators-view";
import { proposalHref } from "@/lib/proposals";
import type { Client, CollaboratorRole, Project } from "@/types";

/**
 * Admin → Project detail page.
 *
 * The home for "who can see this project?" management. Lists current
 * collaborators with role + remove control, and lets the admin add an
 * existing client by selecting from a dropdown of all clients in the
 * system. Pair with /admin/clients to create a new client first if
 * they're not in the list yet.
 */
export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/login");
  }

  const { data: project } = await supabase
    .from("projects")
    .select("*, client:clients(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (!project) {
    notFound();
  }

  const typedProject = project as Project & { client: Client | null };

  type CollaboratorRow = {
    id: string;
    role: CollaboratorRole;
    added_at: string;
    client: Client;
  };

  const { data: collaborators } = await supabase
    .from("project_collaborators")
    .select("id, role, added_at, client:clients(*)")
    .eq("project_id", typedProject.id)
    .order("added_at", { ascending: true });

  const typedCollaborators: CollaboratorRow[] = (
    (collaborators as unknown as CollaboratorRow[]) || []
  ).map((c) => ({
    ...c,
    client: Array.isArray(c.client) ? c.client[0] : c.client,
  }));

  // All clients for the "add collaborator" picker.
  const { data: allClients } = await supabase
    .from("clients")
    .select("*")
    .order("name", { ascending: true });

  const assignedClientIds = new Set(
    typedCollaborators.map((c) => c.client?.id).filter(Boolean) as string[]
  );
  const availableClients = ((allClients as Client[]) || []).filter(
    (c) => !assignedClientIds.has(c.id)
  );

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#041c45] via-[#020f24] to-[#010812] -z-20" />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gold-500/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-navy-300/[0.03] rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="border-b border-white/[0.04] bg-[#041c45]/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-4">
              <Image
                src="/brand/MP26.svg"
                alt="Monday + Partners"
                width={56}
                height={56}
                className="brightness-0 invert opacity-90"
              />
              <span className="text-[10px] tracking-[0.25em] uppercase text-white/40">
                Admin
              </span>
            </Link>
            <nav className="flex items-center gap-5 ml-8">
              <Link
                href="/admin"
                className="text-[10px] tracking-[0.2em] uppercase text-white/90 hover:text-white transition-colors duration-300"
              >
                Projects
              </Link>
              <Link
                href="/admin/clients"
                className="text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white/70 transition-colors duration-300"
              >
                Clients
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm text-white/40 font-light">
              {user.email}
            </span>
            <form action="/api/auth/logout" method="GET">
              <button
                type="submit"
                className="text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white/70 transition-colors duration-300"
              >
                Log Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-3">
          <Link
            href="/admin"
            className="text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white/70 transition-colors duration-300"
          >
            ← All projects
          </Link>
        </div>

        <div className="mb-12 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extralight tracking-tight text-white/90">
              {typedProject.title}
            </h1>
            <p className="text-sm text-white/35 font-light mt-2">
              /{typedProject.slug}
              {typedProject.client?.name
                ? ` · primary contact ${typedProject.client.name}`
                : ""}
            </p>
          </div>
          <Link
            href={proposalHref(typedProject.slug)}
            className="text-[10px] tracking-[0.2em] uppercase text-white/60 hover:text-gold-200 transition-colors duration-300 border border-white/[0.12] hover:border-gold-400/40 px-4 py-2 rounded-sm"
          >
            View Proposal
          </Link>
        </div>

        <section className="space-y-8">
          <header>
            <h2 className="text-xl font-extralight tracking-tight text-white/85">
              Collaborators
            </h2>
            <p className="text-xs text-white/35 font-light mt-2 max-w-xl">
              Anyone listed here can sign in and see this project. The
              primary collaborator is the named client on the project
              record and the default approval-email recipient.
            </p>
          </header>

          <CollaboratorsView
            slug={typedProject.slug}
            collaborators={typedCollaborators}
            availableClients={availableClients}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="py-16 px-6 mt-auto">
        <div className="flex justify-center">
          <Image
            src="/brand/tagline_bug.svg"
            alt="Clarity - Conjuring - Currency"
            width={80}
            height={80}
            className="brightness-0 invert opacity-75"
          />
        </div>
      </footer>
    </div>
  );
}
