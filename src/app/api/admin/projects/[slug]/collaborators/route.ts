import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { CollaboratorRole } from "@/types";

/**
 * Admin endpoints for managing project collaborators.
 *
 * POST   /api/admin/projects/[slug]/collaborators
 *   body: { client_id: string, role?: 'primary' | 'collaborator' | 'viewer' }
 *
 * DELETE /api/admin/projects/[slug]/collaborators?client_id=<uuid>
 *
 * Authorization: ADMIN_EMAIL only. Service-role client used for the writes
 * so we bypass RLS but still apply our own admin check.
 */

const VALID_ROLES: CollaboratorRole[] = ["primary", "collaborator", "viewer"];

function isAdminEmail(email: string | undefined): boolean {
  return Boolean(email) && email === process.env.ADMIN_EMAIL;
}

async function getProjectIdBySlug(slug: string): Promise<string | null> {
  const adminSupabase = createAdminClient();
  const { data } = await adminSupabase
    .from("projects")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  return data?.id ?? null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { client_id, role } = body as {
    client_id?: string;
    role?: CollaboratorRole;
  };

  if (!client_id) {
    return NextResponse.json(
      { error: "client_id is required" },
      { status: 400 }
    );
  }
  const safeRole: CollaboratorRole =
    role && VALID_ROLES.includes(role) ? role : "collaborator";

  const projectId = await getProjectIdBySlug(slug);
  if (!projectId) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("project_collaborators")
    .upsert(
      {
        project_id: projectId,
        client_id,
        role: safeRole,
        added_by_email: user.email ?? null,
      },
      { onConflict: "project_id,client_id" }
    )
    .select("*, client:clients(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ collaborator: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const clientId = url.searchParams.get("client_id");
  if (!clientId) {
    return NextResponse.json(
      { error: "client_id query parameter is required" },
      { status: 400 }
    );
  }

  const projectId = await getProjectIdBySlug(slug);
  if (!projectId) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("project_collaborators")
    .delete()
    .eq("project_id", projectId)
    .eq("client_id", clientId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
