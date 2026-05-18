# M+P email templates

Two kinds of emails live in this folder, and they're routed two different ways. Read this before editing.

## The two kinds

**Supabase auth emails** are sent by Supabase itself when an auth event happens (a user requests a magic link, signs up for the first time, resets a password, etc). Supabase has a fixed list of these events and a template slot per event. You paste HTML into the Supabase Dashboard and it gets used.

Templates in this folder that fall into that bucket:

- `magic-link.html` → Supabase Dashboard → Authentication → Email Templates → **Magic Link**
- `confirm-signup.html` → Supabase Dashboard → Authentication → Email Templates → **Confirm Signup**

**Transactional emails** are sent by the application via the Resend SDK when a domain event happens (a client approves a proposal, an admin adds someone to a project, etc.). Supabase does not send these — you can't add them as templates in the dashboard, because Supabase Auth has no slot for them. They're emitted from API route handlers.

Templates in this folder that fall into that bucket:

- `proposal-approved-admin.html` → sent to `ADMIN_EMAIL` from `src/app/api/projects/[slug]/approve/route.ts`
- `proposal-approved-client.html` → sent to the approving client from the same route

Both kinds use the same paper-light design system so the recipient sees one consistent voice across the lifecycle.

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

## Step 2 — Paste auth templates into Supabase

For each auth template:

1. Supabase Dashboard → Authentication → Email Templates → pick the slot
2. Set the subject (Supabase has a separate field):
   - Magic Link: `Access your Monday + Partners portal`
   - Confirm Signup: `Welcome to Monday + Partners — confirm your sign-in`
3. Replace the body with the contents of the matching `.html` in this folder

## Step 3 — Nothing for the transactional templates

They're already wired up. Edit the HTML, redeploy, and the next approval-confirmed email picks up the change.

## Supabase template variables (Go template syntax)

- `{{ .ConfirmationURL }}` — single-use confirm/sign-in URL
- `{{ .Email }}` — user's email
- `{{ .SiteURL }}` — configured site URL

## Local preview

The transactional templates are pure HTML — open the file directly in a browser. Tokens like `{{ approver_name }}` will appear as literal text, which is fine for layout review. For a fully rendered preview, run the approve endpoint locally against a test project.

## Troubleshooting the favicon image

If the email shows the chartreuse `MP26` wordmark instead of the gold `+` favicon, Gmail's image proxy is probably caching an older version of `https://projects.mondayandpartners.com/favicon.png`. Force a refresh by:

1. Confirming the file at that URL is the gold `+`
2. Bumping the URL with a cache-buster (`/favicon.png?v=2`) in the template and pasting the new HTML into Supabase
3. Sending a fresh email and checking "Show original" to see the actual src in the delivered message
