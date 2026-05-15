import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * Persist proposal approval to Supabase.
 *
 * The proposal HTML posts here when a client clicks Approve in the modal.
 * Auth is enforced via the user's Supabase session; only the matched client
 * or the admin can mark a project approved. Writes use the admin client to
 * bypass RLS (since clients have read-only RLS access to projects).
 *
 * Body shape:
 *   {
 *     approver_name: string,
 *     approval_total: number,           // dollars in cents
 *     year_1_support_included: boolean,
 *   }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Session-bound client to identify the caller
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { approver_name, approval_total, year_1_support_included } = body as {
    approver_name?: string;
    approval_total?: number;
    year_1_support_included?: boolean;
  };

  if (!approver_name || typeof approver_name !== "string") {
    return NextResponse.json(
      { error: "approver_name (string) is required" },
      { status: 400 }
    );
  }

  // Admin client bypasses RLS for the authorization lookup + the write
  const adminSupabase = createAdminClient();
  const { data: project, error: projectError } = await adminSupabase
    .from("projects")
    .select("id, client:clients(email)")
    .eq("slug", slug)
    .maybeSingle();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin = user.email === adminEmail;
  const clientEmail = Array.isArray(project.client)
    ? project.client[0]?.email
    : (project.client as { email: string } | null)?.email;
  const isClient = user.email === clientEmail;

  if (!isAdmin && !isClient) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error: updateError } = await adminSupabase
    .from("projects")
    .update({
      approved_at: new Date().toISOString(),
      approver_name,
      approval_total:
        typeof approval_total === "number" ? approval_total : null,
      year_1_support_included:
        typeof year_1_support_included === "boolean"
          ? year_1_support_included
          : null,
      status: "awaiting_deposit",
    })
    .eq("slug", slug);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
