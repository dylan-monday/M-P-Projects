import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * Persist proposal approval to Supabase and send admin notification email.
 *
 * The proposal HTML posts here when a client clicks Approve in the modal.
 * Auth is enforced via the user's Supabase session; only the matched client
 * or the admin can mark a project approved. Writes use the admin client to
 * bypass RLS (since clients have read-only RLS access to projects).
 *
 * After a successful DB write, sends an email via Resend to ADMIN_EMAIL.
 * Email failure is logged but does not fail the request — approval is
 * already recorded in the database (the authoritative source).
 *
 * Body shape:
 *   {
 *     approver_name: string,
 *     approval_total: number,           // dollars in cents
 *     year_1_support_included: boolean,
 *   }
 */

const RESEND_FROM =
  process.env.RESEND_FROM_EMAIL || "notifications@mondayandpartners.com";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://projects.mondayandpartners.com";

function fmtDollarsFromCents(cents: number | null | undefined): string {
  if (typeof cents !== "number") return "—";
  return "$" + (cents / 100).toLocaleString("en-US");
}
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
    .select("id, slug, title, client:clients(email, name)")
    .eq("slug", slug)
    .maybeSingle();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin = user.email === adminEmail;
  const client = Array.isArray(project.client)
    ? project.client[0]
    : (project.client as { email: string; name: string } | null);
  const clientEmail = client?.email;
  const clientName = client?.name;
  const isClient = user.email === clientEmail;

  if (!isAdmin && !isClient) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const approvedAt = new Date().toISOString();
  const supportIncluded =
    typeof year_1_support_included === "boolean"
      ? year_1_support_included
      : null;
  const totalCents =
    typeof approval_total === "number" ? approval_total : null;

  const { error: updateError } = await adminSupabase
    .from("projects")
    .update({
      approved_at: approvedAt,
      approver_name,
      approval_total: totalCents,
      year_1_support_included: supportIncluded,
      status: "awaiting_deposit",
    })
    .eq("slug", slug);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Send admin notification via Resend (best-effort, never blocks the response).
  if (process.env.RESEND_API_KEY && adminEmail) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const proposalUrl = `${APP_URL}/protected/p/${project.slug}/index.html`;
      await resend.emails.send({
        from: RESEND_FROM,
        to: adminEmail,
        subject: `Proposal approved: ${project.title}`,
        html: `
          <h2 style="font-family:system-ui;font-size:18px;margin:0 0 16px;">${project.title}</h2>
          <p style="font-family:system-ui;font-size:14px;line-height:1.5;color:#333;">
            <strong>${approver_name}</strong>${clientName ? ` (${clientName})` : ""} just approved the proposal.
          </p>
          <table style="font-family:system-ui;font-size:14px;line-height:1.7;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding-right:24px;color:#666;">Total approved</td><td><strong>${fmtDollarsFromCents(totalCents)}</strong></td></tr>
            <tr><td style="padding-right:24px;color:#666;">Year 1 Support</td><td>${supportIncluded ? "Included" : "Declined"}</td></tr>
            <tr><td style="padding-right:24px;color:#666;">Approved at</td><td>${new Date(approvedAt).toUTCString()}</td></tr>
            ${clientEmail ? `<tr><td style="padding-right:24px;color:#666;">Client email</td><td>${clientEmail}</td></tr>` : ""}
          </table>
          <p style="font-family:system-ui;font-size:14px;">
            <a href="${proposalUrl}" style="color:#0066cc;">View the proposal</a>
          </p>
          <p style="font-family:system-ui;font-size:12px;color:#999;margin-top:24px;">
            Sent automatically by projects.mondayandpartners.com.
          </p>
        `,
      });
    } catch (emailError) {
      // Approval is already persisted in Supabase. Log and move on.
      console.error("Resend notification failed:", emailError);
    }
  } else {
    console.warn(
      "RESEND_API_KEY or ADMIN_EMAIL not set; skipping notification email."
    );
  }

  return NextResponse.json({ success: true });
}
