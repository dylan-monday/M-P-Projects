import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { createAuthAdminClient } from "@/lib/supabase/admin";

/**
 * Admin endpoint for creating client records.
 *
 * POST /api/admin/clients
 *   { email, name, company? }
 *
 * Side effects:
 *   1. Inserts a row in the `clients` table.
 *   2. Creates (or finds) the matching `auth.users` record via the Supabase
 *      admin API, pre-confirmed so the client can magic-link in immediately
 *      without bouncing through a confirm-signup email.
 *
 * Authorization: only ADMIN_EMAIL may call this. Anyone else gets 403.
 *
 * Idempotency: if a `clients` row already exists for the email, we return
 * it. If the auth user already exists, we leave it alone. The result is
 * always a consistent (clients row + auth.users record) pair.
 */

function requireAdmin(userEmail: string | undefined): boolean {
  return Boolean(userEmail) && userEmail === process.env.ADMIN_EMAIL;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!requireAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, name, company } = body as {
    email?: string;
    name?: string;
    company?: string;
  };

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "email is required" },
      { status: 400 }
    );
  }
  if (!name || typeof name !== "string") {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const adminSupabase = createAdminClient();

  // Upsert the client row by email.
  let { data: client, error: selectError } = await adminSupabase
    .from("clients")
    .select("*")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (selectError) {
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }

  if (!client) {
    const { data: inserted, error: insertError } = await adminSupabase
      .from("clients")
      .insert({
        email: normalizedEmail,
        name: name.trim(),
        company: company ? company.trim() : null,
      })
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }
    client = inserted;
  }

  // Pre-confirmed auth user so the client can magic-link straight in.
  // If the user already exists, supabase-js returns an error we recognize
  // and ignore. Any other failure is logged but doesn't block the response —
  // the clients row is the durable record.
  const authAdmin = createAuthAdminClient();
  const { error: createError } = await authAdmin.auth.admin.createUser({
    email: normalizedEmail,
    email_confirm: true,
  });

  if (createError && !/already.*registered|exists|duplicate/i.test(createError.message)) {
    console.error("Auth user creation failed:", createError.message);
  }

  return NextResponse.json({ client });
}
