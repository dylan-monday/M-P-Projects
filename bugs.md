# Bugs and tech debt

*Running list of known issues, design gaps, and tech debt. Most recent items at top.*

The honest framing: the portal as of May 18, 2026 is duct-taped together. It works for getting LA.IO their proposal and approving it. It is not what M+P should be shipping long-term. Almost everything here would resolve in the proper rebuild described in `docs/PORTAL_VISION.md`. Don't paper-cut these one by one. Plan the rebuild.

---

## Active (May 18, 2026 — after admin surface and OTP auth)

### Auth complexity is now load-bearing

- **Two auth callback routes do almost the same thing.** `src/app/api/auth/callback/route.ts` (server, PKCE) and `src/app/auth/callback/page.tsx` (client, hash + PKCE). The login form sends OTP codes (no callback needed); the only consumer of `/auth/callback` is now `scripts/generate-magic-link.ts`. The server route is essentially dead code. Decide: keep both for the rare magic-link case, or rip one out. Worth doing during the rebuild, not before.
- **`verifyOtp` cycles through three token types** (`'magiclink'`, `'signup'`, `'email'`) in the login form because Supabase tags the OTP differently depending on whether the user is new or returning, and the docs are ambiguous. Works, but the right answer is to figure out the deterministic type per state and call it directly. Low priority; the fallback is harmless.
- **OTP length is a magic number.** The form hard-codes 6 digits in three places (input maxLength, slice, validation). Supabase's OTP length is configured in the dashboard. If anyone changes it, the form breaks silently. Either pull it from an env var, or accept that documentation in the form file is the contract.
- **`/api/auth/callback`'s `?error=auth_failed` path is now dead-ish.** No one should hit it because the form doesn't send them through that route anymore. The login form still surfaces `?error=` if it arrives. Leave the safety net, but document that it's defensive.

### Auth email infrastructure (the part that's now correct, but worth knowing)

- **Auth emails are code-only by design.** `magic-link.html` and `confirm-signup.html` intentionally have no `{{ .ConfirmationURL }}`. Email security scanners pre-fetch links and burn the OTP token before the user clicks. Removing the link sidesteps this entirely. **Do not add the URL back to the templates** without a real plan; see `docs/email-templates/SETUP.md` for the reasoning. The "Sign in instead" CTA we shipped once and then removed is the load-bearing absence here.

### Schema and architecture (still valid, partially evolved)

- **Two design systems coexist.** Drafting Table (login, client area, admin, ProposalViewV2) and the M+P brand voice (LA proposal HTML). They share no tokens. This is the single biggest gap between today's portal and an agency-grade product. See `docs/PORTAL_VISION.md` for the rebuild plan.
- **`projects.client_id` is denormalized after migration 003.** The `project_collaborators` join table is now the source of truth for who can see a project, but `projects.client_id` is preserved as a "primary contact" pointer (drives the approval confirmation email recipient when admin acts on behalf). Decide during the rebuild whether to drop `client_id` and promote a `primary_collaborator_id` to the join table, or keep the denormalization for read-performance.
- **TS/ESLint build errors bypassed.** `next.config.ts` sets `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true` because Drafting Table components (`cta-block.tsx`, `typography.tsx`) have Framer Motion + React 19 type incompatibilities. Remove the bypass once Drafting Table is either fixed or rebuilt against M+P brand.
- **`middleware.ts` is the legacy convention.** Next 16 emits a deprecation warning telling us to rename to `proxy.ts`. Non-blocking but should be addressed before Next 17.
- **Approval state in proposal HTML uses localStorage as primary truth.** The HTML restores its "approved" UI from `localStorage.mp-proposal-approved` on load. Supabase is the actual source of truth. If localStorage and DB disagree, the localStorage wins, which is wrong. Fix: have the proposal HTML fetch approval state from the API on load instead of trusting localStorage. Until fixed, clearing test approvals requires both a SQL reset AND clearing localStorage in any browser that's tested.
- **Custom-HTML proposals listed in code constant.** `src/lib/proposals.ts: CUSTOM_PROPOSAL_SLUGS` is a hardcoded set. Adding a new custom-HTML proposal requires a code change. Promote to a column on the projects table (e.g., `custom_proposal_path`) when a second one appears.

### Design / UX

- **`tagline_bug.svg` not used everywhere it should be.** The "CLARITY · CONJURING · CURRENCY" tag appears on the admin pages footer. Should appear consistently across the portal as a brand anchor.
- **Login page is functional but not agency-grade.** Logo size has been bumped (sm/md/lg/xl/2xl now), but the page layout, typography, and tone are still Drafting Table, not M+P brand. The 6-digit code input is functional but generic.
- **Admin pages are functional but not agency-grade.** `/admin`, `/admin/clients`, `/admin/projects/[slug]` all use the deep-navy Drafting Table aesthetic with gold accents. Works for now; not the M+P brand voice.
- **The LA proposal and the rest of the portal are not unified visually.** A client logging in sees Drafting Table on `/login` and `/projects`, then crosses into the M+P brand when they open the LA proposal. The transition is jarring.
- **Overall: the UI is functional, not elevated.** Honest assessment ahead of the proper rebuild.

### Operational

- **No staging environment.** `main` deploys straight to production. Add a Vercel preview branch workflow before next launch.
- **Supabase backups not test-restored.** Automated backups exist; restoration drill never run. Do this before serious data accrues.
- **Resend account is shared with another project.** Same `RESEND_API_KEY` is used elsewhere. If that project hits limits or has an issue, this one is affected. Consider a project-specific API key (Resend supports multiple keys per workspace).
- **No automated tests.** Auth flow, approval flow, RLS policies, and the admin surface all have zero test coverage. Manual smoke tests only.
- **No synthetic monitoring.** Auth callback or approval API could break tomorrow and we'd only find out when a client emailed.

---

## Resolved (May 18, 2026 — admin surface and OTP auth)

- ~~Add admin UI for creating clients and assigning them to projects~~ — Done. `/admin/clients` (create + list) and `/admin/projects/[slug]` (collaborator management).
- ~~Schema is one-client-per-project~~ — Done via migration 003. `project_collaborators` join table; multiple clients per project; RLS extended; backfilled existing assignments as `role='primary'`.
- ~~Approval emails need to be designed in the M+P paper-light family~~ — Done. Templates in `docs/email-templates/proposal-approved-{admin,client}.html`. Loaded at runtime by the approve route via `src/lib/email/templates.ts`.
- ~~Madeline's magic-link click sent her back to login~~ — Diagnosed as a chain of issues: email scanner pre-fetching the verify URL and burning the OTP, wrong `verifyOtp` type, and form truncating the 8-digit code (Supabase was configured for 8) to 6. Fixed end-to-end:
  - Switched primary auth to OTP code (not clickable link)
  - Removed `{{ .ConfirmationURL }}` from auth email templates so scanners have nothing to pre-fetch
  - `verifyOtp` now tries `magiclink` → `signup` → `email` in sequence
  - Form input dynamic length, then standardized at 6 (Supabase OTP Length reset to 6 in dashboard)
  - `?error=auth_failed` is now surfaced on the login form
- ~~Sender name for transactional emails~~ — Done. `RESEND_FROM` formats as `"Monday + Partners <notifications@mondayandpartners.com>"` so the recipient sees the brand name, not the bare address.
- ~~Approve route only authorized primary client~~ — Done. Any collaborator on a project can now approve. Confirmation email goes to whoever clicked Approve (primary client as admin-acting fallback).
- ~~LA proposal "We kick off" copy~~ — Updated to softer language: "We're off and running as soon as the task order is executed."

## Resolved (May 15, 2026 session)

- ~~Login logo needs to be bigger~~ — Done. Logo now supports `sm/md/lg/xl/2xl`. Login uses `2xl` (280×280).
- ~~LA proposal needs to be auth-gated~~ — Done. Hosted at `/protected/p/la-startup-2026/index.html` behind middleware auth.
- ~~Need a client area listing projects~~ — Done. `/projects` route shows projects per logged-in client with status badges.
- ~~Admin password (not magic link) for daily access~~ — Done. `/login` detects `@mondayandpartners.com` emails and switches to password form.
- ~~Approval state persists somewhere~~ — Done. Supabase stores `approved_at`, `approver_name`, `approval_total`, `year_1_support_included` via `/api/projects/[slug]/approve`.
- ~~Email notification on approval~~ — Done. Resend sends to `ADMIN_EMAIL` from `notifications@mondayandpartners.com` after a successful approval write.
- ~~Favicon on the LA proposal~~ — Done. M+P `+` favicon copied to the proposal folder, link tag added to the head.
