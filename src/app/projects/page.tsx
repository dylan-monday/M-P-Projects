import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/layout";
import { proposalHref } from "@/lib/proposals";
import type { Project, ProjectStatus } from "@/types";

// Project with approval fields surfaced; matches the table after migration-002.
type ProjectWithApproval = Project & {
  approved_at?: string | null;
  approver_name?: string | null;
};

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/projects");
  }

  // Admins land in /admin instead.
  if (user.email === process.env.ADMIN_EMAIL) {
    redirect("/admin");
  }

  // RLS keeps this scoped to the user's own client record + projects.
  const { data: client } = await supabase
    .from("clients")
    .select("*, projects(*)")
    .eq("email", user.email)
    .maybeSingle();

  const projects: ProjectWithApproval[] = client?.projects || [];

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-10">
        <header className="flex items-center justify-between">
          <Logo size="xl" href="/projects" />
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-xs text-foreground-subtle hover:text-foreground"
            >
              Sign out
            </button>
          </form>
        </header>

        <div>
          <h1 className="text-2xl font-semibold">Your projects</h1>
          <p className="text-sm text-foreground-muted mt-1">
            Signed in as {user.email}
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="border border-border rounded-lg p-8 text-center">
            <p className="text-foreground-muted">
              No projects yet. If you think this is a mistake, reach out to{" "}
              <a
                href="mailto:dylan@mondayandpartners.com"
                className="underline"
              >
                dylan@mondayandpartners.com
              </a>
              .
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {projects.map((p) => (
              <li key={p.id}>
                <Link
                  href={proposalHref(p.slug)}
                  className="block border border-border rounded-lg p-5 hover:bg-surface-100 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold">{p.title}</h2>
                      <p className="text-xs text-foreground-subtle mt-0.5">
                        /{p.slug}
                      </p>
                    </div>
                    <StatusBadge
                      status={p.status}
                      approvedAt={p.approved_at ?? null}
                    />
                  </div>
                  {p.approved_at && (
                    <p className="text-xs text-foreground-muted mt-3">
                      Approved{" "}
                      {new Date(p.approved_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {p.approver_name ? ` by ${p.approver_name}` : ""}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  proposal: "Proposal",
  awaiting_deposit: "Awaiting deposit",
  in_progress: "In progress",
  review: "In review",
  complete: "Complete",
};

function StatusBadge({
  status,
  approvedAt,
}: {
  status: ProjectStatus;
  approvedAt: string | null;
}) {
  // Approved trumps everything; even if status has advanced past proposal,
  // we still surface the approved state in the client area.
  if (approvedAt) {
    return (
      <span className="px-3 py-1 text-xs font-medium bg-success/10 text-success rounded-full whitespace-nowrap">
        Approved
      </span>
    );
  }

  return (
    <span className="px-3 py-1 text-xs font-medium bg-surface-200 text-foreground-muted rounded-full whitespace-nowrap">
      {STATUS_LABELS[status] || status}
    </span>
  );
}
