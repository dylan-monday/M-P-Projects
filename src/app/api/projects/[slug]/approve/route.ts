import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * Persist proposal approval to Supabase and send branded emails.
 *
 * On a successful DB write we fire two emails via Resend:
 *
 *   1. Admin notification → ADMIN_EMAIL (Dylan).
 *      Subject: "Proposal approved: {project title}"
 *      Body: M+P paper-light, summarizes who approved, total, support choice,
 *      timestamp, link back to the proposal.
 *
 *   2. Client confirmation → the approving client's email.
 *      Subject: "Your Monday + Partners proposal — approval confirmed"
 *      Body: M+P paper-light, confirms what they approved, reassures about
 *      next steps, provides Dylan's direct contact.
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

const RESEND_FROM =
  process.env.RESEND_FROM_EMAIL || "notifications@mondayandpartners.com";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://projects.mondayandpartners.com";

function fmtDollarsFromCents(cents: number | null | undefined): string {
  if (typeof cents !== "number") return "—";
  return "$" + (cents / 100).toLocaleString("en-US");
}

/**
 * M+P paper-light email shell. Wraps an inner content fragment in the
 * brand-consistent layout used across all portal emails. The shell mirrors
 * the magic-link template at docs/email-templates/magic-link.html so every
 * email the client sees feels like the same family.
 */
function brandedEmailShell({
  preheader,
  eyebrow,
  headline,
  body,
}: {
  preheader: string;
  eyebrow: string;
  headline: string;
  body: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(headline)}</title>
</head>
<body style="margin:0; padding:0; background:#FAFAF7; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color:#111111; -webkit-font-smoothing:antialiased;">
  <div style="display:none; max-height:0; overflow:hidden; visibility:hidden; mso-hide:all;">${escapeHtml(preheader)}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAFAF7;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px; margin:0 auto; background:#FAFAF7;">
          <tr><td style="height:4px; background:#C9D92E; line-height:1px; font-size:1px;">&nbsp;</td></tr>
          <tr>
            <td style="padding:32px 0 28px;">
              <img src="${APP_URL}/favicon.png" alt="Monday + Partners" width="56" height="56" style="display:block; border:0; outline:none; text-decoration:none;">
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 24px;">
              <p style="margin:0 0 12px; font-size:11px; letter-spacing:0.2em; text-transform:uppercase; color:#555555;">${escapeHtml(eyebrow)}</p>
              <h1 style="margin:0; font-size:26px; font-weight:500; line-height:1.25; color:#111111;">${escapeHtml(headline)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 32px; font-size:16px; line-height:1.6; color:#333333;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px; border-top:1px solid #E5E2D8;">
              <p style="margin:0 0 4px; font-size:10px; letter-spacing:0.25em; text-transform:uppercase; color:#555555;">Clarity · Conjuring · Currency</p>
              <p style="margin:6px 0 0; font-size:11px; color:#888888;">Monday + Partners · New Orleans</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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

    // 1) Admin notification
    if (adminEmail) {
      try {
        const adminBody = `
          <p style="margin:0 0 16px;"><strong>${escapeHtml(approver_name)}</strong>${clientName ? ` (${escapeHtml(clientName)})` : ""} approved the proposal.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; font-size:14px; line-height:1.7;">
            <tr>
              <td style="padding:6px 24px 6px 0; color:#666666; vertical-align:top; white-space:nowrap;">Total approved</td>
              <td style="padding:6px 0; color:#111111; font-weight:600;">${totalLabel}</td>
            </tr>
            <tr>
              <td style="padding:6px 24px 6px 0; color:#666666; vertical-align:top; white-space:nowrap;">Year 1 Support</td>
              <td style="padding:6px 0; color:#111111;">${supportLabel}</td>
            </tr>
            <tr>
              <td style="padding:6px 24px 6px 0; color:#666666; vertical-align:top; white-space:nowrap;">Approved at</td>
              <td style="padding:6px 0; color:#111111;">${approvedAtLabel} CT</td>
            </tr>
            ${clientEmail ? `<tr>
              <td style="padding:6px 24px 6px 0; color:#666666; vertical-align:top; white-space:nowrap;">Client email</td>
              <td style="padding:6px 0; color:#111111;"><a href="mailto:${escapeHtml(clientEmail)}" style="color:#9BAB10; text-decoration:underline;">${escapeHtml(clientEmail)}</a></td>
            </tr>` : ""}
          </table>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background:#111111;">
                <a href="${proposalUrl}" style="display:inline-block; padding:14px 26px; color:#FAFAF7; text-decoration:none; font-size:12px; letter-spacing:0.18em; text-transform:uppercase; font-weight:500;">View the proposal</a>
              </td>
            </tr>
          </table>
        `;

        await resend.emails.send({
          from: RESEND_FROM,
          to: adminEmail,
          subject: `Proposal approved: ${project.title}`,
          html: brandedEmailShell({
            preheader: `${approver_name} approved ${project.title} for ${totalLabel}.`,
            eyebrow: "Monday + Partners · Approval",
            headline: project.title,
            body: adminBody,
          }),
        });
      } catch (emailError) {
        console.error("Admin notification failed:", emailError);
      }
    } else {
      console.warn("ADMIN_EMAIL not set; skipping admin notification.");
    }

    // 2) Client confirmation
    if (clientEmail) {
      try {
        const clientBody = `
          <p style="margin:0 0 16px;">Thanks${clientName ? `, ${escapeHtml(clientName.split(" ")[0])}` : ""}. Your approval of <strong>${escapeHtml(project.title)}</strong> is confirmed and recorded.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; font-size:14px; line-height:1.7;">
            <tr>
              <td style="padding:6px 24px 6px 0; color:#666666; vertical-align:top; white-space:nowrap;">Total approved</td>
              <td style="padding:6px 0; color:#111111; font-weight:600;">${totalLabel}</td>
            </tr>
            <tr>
              <td style="padding:6px 24px 6px 0; color:#666666; vertical-align:top; white-space:nowrap;">Year 1 Support</td>
              <td style="padding:6px 0; color:#111111;">${supportLabel}</td>
            </tr>
            <tr>
              <td style="padding:6px 24px 6px 0; color:#666666; vertical-align:top; white-space:nowrap;">Approved by</td>
              <td style="padding:6px 0; color:#111111;">${escapeHtml(approver_name)}</td>
            </tr>
            <tr>
              <td style="padding:6px 24px 6px 0; color:#666666; vertical-align:top; white-space:nowrap;">Recorded at</td>
              <td style="padding:6px 0; color:#111111;">${approvedAtLabel} CT</td>
            </tr>
          </table>
          <p style="margin:0 0 16px;">Here's what happens next. We'll prepare the task order and follow up within one to two business days. The proposal stays available at your portal for reference.</p>
          <p style="margin:0 0 24px;">If anything looks off, or if you'd like to talk through scheduling, reply to this email or reach Dylan directly.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background:#111111;">
                <a href="${APP_URL}/projects" style="display:inline-block; padding:14px 26px; color:#FAFAF7; text-decoration:none; font-size:12px; letter-spacing:0.18em; text-transform:uppercase; font-weight:500;">Open the portal</a>
              </td>
            </tr>
          </table>
          <p style="margin:32px 0 0; font-size:13px; line-height:1.6; color:#666666;">
            <strong style="color:#111111;">Dylan DiBona</strong> &nbsp;·&nbsp; Chief Creative Partner<br>
            <a href="mailto:dylan@mondayandpartners.com" style="color:#9BAB10; text-decoration:underline;">dylan@mondayandpartners.com</a>
          </p>
        `;

        await resend.emails.send({
          from: RESEND_FROM,
          to: clientEmail,
          subject: `Approval confirmed — ${project.title}`,
          html: brandedEmailShell({
            preheader: `Your approval of ${project.title} (${totalLabel}) is recorded.`,
            eyebrow: "Monday + Partners · Approval Confirmed",
            headline: "Thank you. Your approval is in.",
            body: clientBody,
          }),
        });
      } catch (emailError) {
        console.error("Client confirmation failed:", emailError);
      }
    } else {
      console.warn("clientEmail not found; skipping client confirmation.");
    }
  } else {
    console.warn("RESEND_API_KEY not set; skipping all notification emails.");
  }

  return NextResponse.json({ success: true });
}
