# M+P email templates

Two kinds of emails live in this folder, and they're routed two different ways. Read this before editing.

## The two kinds

**Supabase auth emails** are sent by Supabase itself when an auth event happens (a user requests a sign-in code, signs up for the first time, resets a password, etc). Supabase has a fixed list of these events and a template slot per event. You paste HTML into the Supabase Dashboard and it gets used.

Templates in this folder that fall into that bucket:

- `magic-link.html` → Supabase Dashboard → Authentication → Email Templates → **Magic Link**
- `confirm-signup.html` → Supabase Dashboard → Authentication → Email Templates → **Confirm Signup**

The folder name "magic-link" is historical (Supabase still calls the template "Magic Link" in its dashboard). The flow today is code-based, not URL-based. The templates intentionally do NOT include `{{ .ConfirmationURL }}` — the 6-digit `{{ .Token }}` is the only auth vector. See "Why code-only" below.

**Transactional emails** are sent by the application via the Resend SDK when a domain event happens (a client approves a proposal, an admin adds someone to a project, etc.). Supabase does not send these — you can't add them as templates in the dashboard, because Supabase Auth has no slot for them. They're emitted from API route handlers.

Templates in this folder that fall into that bucket:

- `proposal-approved-admin.html` → sent to `ADMIN_EMAIL` from `src/app/api/projects/[slug]/approve/route.ts`
- `proposal-approved-client.html` → sent to the approving collaborator from the same route

Both kinds use the same paper-light design system so the recipient sees one consistent voice across the lifecycle.

## Why code-only auth emails

Email security scanners (Gmail's safety scanner, M365 Defender, government mail systems) routinely pre-fetch links in incoming emails to scan them for safety. A pre-fetch of Supabase's verify URL hits `https://[project].supabase.co/auth/v1/verify` with the OTP token, which Supabase treats as a real verification and **consumes the token**. By the time the human clicks the email's button or types the code, the token is already burned and they get "Token has expired or is invalid."

The fix is to never put the link in the email. A 6-digit code has no URL for a scanner to follow, so the token stays alive until the user types it into `/login`. That's why these templates show only `{{ .Token }}` and never `{{ .ConfirmationURL }}`. Do not add the link back; it's load-bearing in its absence.

## How the transactional templates get loaded

The approve route reads the HTML at runtime via `src/lib/email/templates.ts` and replaces `{{ token }}` placeholders with values. The full token list is documented in a comment at the top of each template. Tokens that aren't supplied are silently replaced with the empty string, which is intentional — it lets us conditionally hide details.

For this to work in production on Vercel, the docs folder is bundled into the function via `outputFileTracingIncludes` in `next.config.ts`. If you add a new transactional template, you don't need to update that config — the existing glob (`./docs/email-templates/**/*.html`) picks it up.

## Step 1 — Set up custom SMTP (one-time, already done)

Auth emails go out via Supabase's SMTP, transactional emails go out via the Resend SDK. Both ultimately deliver through Resend.

1. Resend account at https://resend.com
2. Domain `mondayandpartners.com` verified
3. Resend API key in `.env.local` as `RESEND_API_KEY` and in Vercel env

Supabase Dashboard → Project Settings → Authentication → SMTP Settings:

```
Host: smtp.resend.com
Port: 465
Username: resend
Password: [Resend API Key]
Sender email: notifications@mondayandpartners.com
Sender name: Monday + Partners
```

## Step 2 — Confirm the OTP length

The 6-digit code length is configurable. Supabase Dashboard → Authentication → Providers → Email → **OTP Length** → set to `6`. The login form, copy throughout the portal, and these templates all assume 6 digits. If you change this setting, update the form's input length and validation in `src/app/(auth)/login/login-form.tsx` and the copy in `src/app/(auth)/login/page.tsx`.

## Step 3 — Paste auth templates into Supabase

For each auth template:

1. Supabase Dashboard → Authentication → Email Templates → pick the slot
2. Set the subject (Supabase has a separate field):
   - Magic Link: `Your Monday + Partners sign-in code`
   - Confirm Signup: `Welcome to Monday + Partners — confirm your sign-in`
3. Replace the body with the contents of the matching `.html` in this folder

## Step 4 — Nothing for the transactional templates

They're already wired up. Edit the HTML, redeploy, and the next approval-confirmed email picks up the change.

## Supabase template variables (Go template syntax)

- `{{ .Token }}` — 6-digit OTP code (the only auth vector we use)
- `{{ .ConfirmationURL }}` — single-use verify URL (NOT used; see "Why code-only" above)
- `{{ .Email }}` — user's email
- `{{ .SiteURL }}` — configured site URL

## Local preview

The transactional templates are pure HTML — open the file directly in a browser. Tokens like `{{ approver_name }}` will appear as literal text, which is fine for layout review. For a fully rendered preview, run the approve endpoint locally against a test project.

## Troubleshooting

**"Token has expired or is invalid" on the login form.** Order of likely causes:

1. The OTP length in Supabase doesn't match the form's expected length. Check Supabase Dashboard → Authentication → Providers → Email → OTP Length → should be 6.
2. The user requested a code, then requested another. Earlier codes invalidate. Most-recent only.
3. The code expired. Default TTL is 1 hour.
4. Someone added `{{ .ConfirmationURL }}` back to the email template. A scanner pre-fetched it. Remove the URL, kill any open in-flight tokens, request a fresh one.

**Auth emails arriving from the wrong sender name.** Check Supabase Dashboard → Project Settings → Authentication → SMTP Settings. Both Sender name and Sender email need to be M+P-branded for the recipient to see "Monday + Partners" in their inbox.
