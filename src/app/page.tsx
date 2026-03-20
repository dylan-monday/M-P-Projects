import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/layout";
import { Button, Card, CardContent, StatusBadge } from "@/components/ui";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Project } from "@/types";

export default async function HomePage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not authenticated, redirect to login
  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  const isAdmin = user.email === process.env.ADMIN_EMAIL;

  // If admin, redirect to admin dashboard
  if (isAdmin) {
    redirect("/admin");
  }

  // Get client's projects
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

  // If only one project, redirect directly to it
  if (projects && projects.length === 1) {
    redirect(`/${projects[0].slug}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="sm" href={undefined} />
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
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        <h1 className="text-2xl font-semibold mb-8">Your Projects</h1>

        {projects && projects.length > 0 ? (
          <div className="grid gap-4">
            {projects.map((project: Project) => (
              <Link key={project.id} href={`/${project.slug}`}>
                <Card interactive className="flex items-center justify-between">
                  <CardContent className="flex items-center gap-4">
                    <div>
                      <h2 className="font-medium text-foreground">
                        {project.title}
                      </h2>
                      <p className="text-sm text-foreground-muted">
                        {formatDate(project.created_at)}
                        {project.deposit_amount && (
                          <> · {formatCurrency(project.deposit_amount + project.final_amount)}</>
                        )}
                      </p>
                    </div>
                  </CardContent>
                  <StatusBadge status={project.status} />
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-foreground-muted">
                No projects yet. We&apos;ll send you a link when your proposal is ready.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
