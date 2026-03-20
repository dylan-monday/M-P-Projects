import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectList, EmptyState } from "./components/project-list";
import type { Project, Client } from "@/types";

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

  const typedProjects = (projects || []) as (Project & { client: Client })[];

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
            <Image src="/brand/MP26.svg" alt="Monday + Partners" width={44} height={44} className="brightness-0 invert opacity-90" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-white/40">Admin</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm text-white/40 font-light">{user.email}</span>
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
        <div className="mb-12">
          <h1 className="text-3xl font-extralight tracking-tight text-white/90">Projects</h1>
          <p className="text-sm text-white/35 font-light mt-2">Manage client projects and proposals</p>
        </div>

        {typedProjects.length > 0 ? (
          <ProjectList projects={typedProjects} />
        ) : (
          <EmptyState />
        )}
      </main>

      {/* Footer */}
      <footer className="py-16 px-6 mt-auto">
        <div className="flex justify-center">
          <Image
            src="/brand/tagline_bug.svg"
            alt="Clarity - Conjuring - Currency"
            width={150}
            height={150}
            className="brightness-0 invert opacity-50"
          />
        </div>
      </footer>
    </div>
  );
}
