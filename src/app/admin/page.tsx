import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/layout";
import { Button, Card, CardContent, StatusBadge } from "@/components/ui";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Project } from "@/types";

export default async function AdminPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Verify admin
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/login");
  }

  // Get all projects
  const { data: projects, error } = await supabase
    .from("projects")
    .select(`
      *,
      client:clients(*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" href="/admin" />
            <span className="text-sm text-foreground-muted">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-foreground-muted">{user.email}</span>
            <form action="/api/auth/logout" method="GET">
              <Button variant="ghost" size="sm" type="submit">
                Log Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Projects</h1>
          <Link href="/admin/new">
            <Button>+ New Project</Button>
          </Link>
        </div>

        {projects && projects.length > 0 ? (
          <div className="grid gap-4">
            {projects.map((project: Project & { client: { name: string; email: string; company: string } }) => (
              <Link key={project.id} href={`/admin/${project.slug}`}>
                <Card interactive className="flex items-center justify-between">
                  <CardContent className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-medium text-foreground">
                          {project.title}
                        </h2>
                        <p className="text-sm text-foreground-muted">
                          {project.client?.name} · {project.client?.company}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {formatCurrency((project.deposit_amount || 0) + (project.final_amount || 0))}
                          </p>
                          <p className="text-xs text-foreground-muted">
                            {formatDate(project.created_at)}
                          </p>
                        </div>
                        <StatusBadge status={project.status} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-foreground-muted mb-4">
                No projects yet.
              </p>
              <Link href="/admin/new">
                <Button>Create First Project</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
