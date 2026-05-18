import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientsView } from "./components/clients-view";
import type { Client } from "@/types";

/**
 * Admin → Clients page.
 *
 * Lists every client in the system with a project count and the ability to
 * add new clients. Adding a client also seeds their auth.users record so
 * they can magic-link in immediately.
 *
 * Pairs with /admin/projects/[slug] for per-project collaborator
 * management. From here, you create the people; over there, you put them
 * on the projects.
 */
export default async function AdminClientsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/login");
  }

  // Pull each client with a count of project_collaborators rows so the UI
  // can show "0 projects" / "3 projects" without a second roundtrip.
  const { data: clients, error } = await supabase
    .from("clients")
    .select(
      `
      *,
      project_collaborators(count)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching clients:", error);
  }

  type ClientWithCount = Client & {
    project_collaborators: { count: number }[];
  };

  const typedClients: (Client & { project_count: number })[] = (
    (clients as ClientWithCount[]) || []
  ).map((c) => ({
    ...c,
    project_count: c.project_collaborators?.[0]?.count ?? 0,
  }));

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
                className="text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white/70 transition-colors duration-300"
              >
                Projects
              </Link>
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/90">
                Clients
              </span>
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
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extralight tracking-tight text-white/90">
              Clients
            </h1>
            <p className="text-sm text-white/35 font-light mt-2">
              People who can sign in to the portal
            </p>
          </div>
        </div>

        <ClientsView clients={typedClients} />
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
