import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { renderEmail } from "@/lib/email/templates";

/**
 * Persist proposal approval to Supabase and send branded emails.
 *
 * On a successful DB write we fire two emails via Resend:
 *
 *   1. Admin notification → ADMIN_EMAIL (Dylan).
 *      Subject: "Proposal approved: {project title}"
 *      Template: docs/email-templates/proposal-approved-admin.html
 *
 *   2. Client confirmation → the approving client's email.
 *      Subject: "Approval confirmed — {project title}"
 *      Template: docs/email-templates/proposal-approved-client.html
 *
 * The templates live alongside the Supabase auth templates (magic-link,
 * confirm-signup) so the whole email family edits and previews in one
 * place. They are NOT Supabase auth templates — Supabase only sends auth
 * emails (magic link, confirm signup, etc.). These are transactional,
 * sent from this route via Resend, and use the same paper-light design
 * system so the user sees one consistent voice.
 *
 * Email failures are logged but never fail the request. Approval is
 * authoritative in Supabase regardless.
 *
 * Body shape:
 *   {
 *     approver_name: string,
 *     approval_total: number,           // dollars in cents
 *     year_1_support_included: boolean,
 *   }
 */

// Format: `Display Name <address@domain>` so inboxes show "Monday + Partners"
// in the sender column. RESEND_FROM_EMAIL can override the address half;
// RESEND_FROM_NAME can override the display name. Defaults match the Supabase
// SMTP "Sender name / Sender email" pair so auth and transactional emails
// look identical in the recipient's inbox.
const RESEND_FROM_NAME = process.env.RESEND_FROM_NAME || "Monday + Partners";
const RESEND_FROM_ADDRESS =
  process.env.RESEND_FROM_EMAIL || "notifications@mondayandpartners.com";
const RESEND_FROM = `${RESEND_FROM_NAME} <${RESEND_FROM_ADDRESS}>`;
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://projects.mondayandpartners.com";

function fmtDollarsFromCents(cents: number | null | undefined): string {
  if (typeof cents !== "number") return "—";
  return "$" + (cents / 100).toLocaleString("en-US");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
  // "Primary client" is the projects.client_id record. Used for the
  // confirmation email recipient when admin acts on the project's behalf,
  // and as a fallback friendly name. Not the only authorized approver
  // anymore — any collaborator can approve.
  const primaryClient = Array.isArray(project.client)
    ? project.client[0]
    : (project.client as { email: string; name: string } | null);

  // Authorization: admin, primary client, or any collaborator on this project.
  let isAuthorized = isAdmin || user.email === primaryClient?.email;
  if (!isAuthorized && user.email) {
    const { data: collaboratorRow } = await adminSupabase
      .from("project_collaborators")
      .select("id, client:clients(email)")
      .eq("project_id", project.id);

    const collaboratorEmails = (collaboratorRow || [])
      .map((row) => {
        const c = Array.isArray(row.client) ? row.client[0] : row.client;
        return (c as { email?: string } | null)?.email;
      })
      .filter(Boolean) as string[];

    isAuthorized = collaboratorEmails.includes(user.email);
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // The confirmation email goes to whoever actually clicked Approve. That's
  // the most defensible default — they performed the action, they get the
  // receipt. Falls back to the primary client when the approver is admin
  // (admin acting on the client's behalf).
  const approverEmail = isAdmin ? primaryClient?.email : user.email;
  const approverDisplayName = primaryClient?.name || null;

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

  // Send both notification emails. Failures are logged, not fatal.
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const proposalUrl = `${APP_URL}/protected/p/${project.slug}/index.html`;
    const approvedAtLabel = new Date(approvedAt).toLocaleString("en-US", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "America/Chicago",
    });
    const totalLabel = fmtDollarsFromCents(totalCents);
    const supportLabel = supportIncluded ? "Included" : "Declined";

    // Common vars shared by both templates.
    const projectTitleSafe = escapeHtml(project.title);
    const approverNameSafe = escapeHtml(approver_name);

    // 1) Admin notification
    if (adminEmail) {
      try {
        const clientNameParen = approverDisplayName
          ? ` (${escapeHtml(approverDisplayName)})`
          : "";
        const approverEmailForDisplay = approverEmail;
        const clientEmailRow = approverEmailForDisplay
          ? `<tr>
              <td style="padding:6px 24px 6px 0; color:#666666; vertical-align:top; white-space:nowrap;">Approver email</td>
              <td style="padding:6px 0; color:#111111;"><a href="mailto:${escapeHtml(approverEmailForDisplay)}" style="color:#9BAB10; text-decoration:underline;">${escapeHtml(approverEmailForDisplay)}</a></td>
            </tr>`
          : "";

        const html = renderEmail("proposal-approved-admin", {
          approver_name: approverNameSafe,
          client_name_paren: clientNameParen,
          project_title: projectTitleSafe,
          total_label: totalLabel,
          support_label: supportLabel,
          approved_at_label: approvedAtLabel,
          client_email: approverEmailForDisplay
            ? escapeHtml(approverEmailForDisplay)
            : "",
          client_email_row: clientEmailRow,
          proposal_url: proposalUrl,
          app_url: APP_URL,
        });

        await resend.emails.send({
          from: RESEND_FROM,
          to: adminEmail,
          subject: `Proposal approved: ${project.title}`,
          html,
        });
      } catch (emailError) {
        console.error("Admin notification failed:", emailError);
      }
    } else {
      console.warn("ADMIN_EMAIL not set; skipping admin notification.");
    }

    // 2) Approver confirmation (whoever clicked Approve; primary client if
    //    admin acted on their behalf)
    if (approverEmail) {
      try {
        const approverFirstComma = approver_name
          ? `, ${escapeHtml(approver_name.split(" ")[0])}`
          : "";

        const html = renderEmail("proposal-approved-client", {
          approver_name: approverNameSafe,
          approver_first_comma: approverFirstComma,
          project_title: projectTitleSafe,
          total_label: totalLabel,
          support_label: supportLabel,
          approved_at_label: approvedAtLabel,
          app_url: APP_URL,
        });

        await resend.emails.send({
          from: RESEND_FROM,
          to: approverEmail,
          subject: `Approval confirmed — ${project.title}`,
          html,
        });
      } catch (emailError) {
        console.error("Approver confirmation failed:", emailError);
      }
    } else {
      console.warn(
        "Approver email not resolved; skipping approver confirmation."
      );
    }
  } else {
    console.warn("RESEND_API_KEY not set; skipping all notification emails.");
  }

  return NextResponse.json({ success: true });
}
