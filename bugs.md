# Bugs and tech debt

*Running list of known issues, design gaps, and tech debt. Most recent items at top.*

---

## Active (added May 15, 2026, post-LA.IO bridge)

### Architecture and consistency

- **Two design systems coexist.** Drafting Table (login, client area, admin, ProposalViewV2) and the M+P brand voice (LA proposal HTML). They share no tokens. This is the single biggest gap between today's portal and an agency-grade product. See `docs/PORTAL_VISION.md` for the rebuild plan.
- **TS/ESLint build errors bypassed.** `next.config.ts` sets `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true` because Drafting Table components (`cta-block.tsx`, `typography.tsx`) have Framer Motion + React 19 type incompatibilities. Remove the bypass once Drafting Table is either fixed or rebuilt against M+P brand.
- **`middleware.ts` is the legacy convention.** Next 16 emits a deprecation warning telling us to rename to `proxy.ts`. Non-blocking but should be addressed before Next 17.
- **Approval state in proposal HTML uses localStorage as primary truth.** The HTML restores its "approved" UI from `localStorage.mp-proposal-approved` on load. Supabase is the actual source of truth. If localStorage and DB disagree, the localStorage wins, which is wrong. Fix: have the proposal HTML fetch approval state from the API on load instead of trusting localStorage. Until fixed, clearing test approvals requires both a SQL reset AND clearing localStorage in any browser that's tested.
- **Custom-HTML proposals listed in code constant.** `src/lib/proposals.ts: CUSTOM_PROPOSAL_SLUGS` is a hardcoded set. Adding a new custom-HTML proposal requires a code change. Promote to a column on the projects table (e.g., `custom_proposal_path`) when a second one appears.
- **One client per project.** Schema enforces a single email per project. The LA.IO engagement realistically wants Madeline plus Tulane staff plus an Emily to view. Add a `project_users` join table (or array of authorized emails) before next government client.

### Design / UX (still from earlier list, still valid)

- **Magic link comes from Supabase, not from M+P.** Sender domain and email design are generic. Should send from `notifications@mondayandpartners.com` via Resend SMTP, with M+P-designed email template.
- **`tagline_bug.svg` not used anywhere.** The "CLARITY · CONJURING · CURRENCY" tag should appear at the bottom of pages and on proposals.
- **Login page is functional but not agency-grade.** Logo size has been bumped (sm/md/lg/xl/2xl now), but the page layout, typography, and tone are still Drafting Table, not M+P brand.
- **Overall: the UI is functional, not elevated.** Honest assessment ahead of the proper rebuild.

### Operational

- **No staging environment.** `main` deploys straight to production. Add a Vercel preview branch workflow before next launch.
- **Supabase backups not test-restored.** Automated backups exist; restoration drill never run. Do this before serious data accrues.
- **Resend account is shared with another project.** Same `RESEND_API_KEY` is used elsewhere. If that project hits limits or has an issue, this one is affected. Consider a project-specific API key (Resend supports multiple keys per workspace).

---

## Resolved (May 15, 2026 session)

- ~~Login logo needs to be bigger~~ — Done. Logo now supports `sm/md/lg/xl/2xl`. Login uses `2xl` (280×280).
- ~~LA proposal needs to be auth-gated~~ — Done. Hosted at `/protected/p/la-startup-2026/index.html` behind middleware auth.
- ~~Need a client area listing projects~~ — Done. `/projects` route shows projects per logged-in client with status badges.
- ~~Admin password (not magic link) for daily access~~ — Done. `/login` detects `@mondayandpartners.com` emails and switches to password form.
- ~~Approval state persists somewhere~~ — Done. Supabase stores `approved_at`, `approver_name`, `approval_total`, `year_1_support_included` via `/api/projects/[slug]/approve`.
- ~~Email notification on approval~~ — Done. Resend sends to `ADMIN_EMAIL` from `notifications@mondayandpartners.com` after a successful approval write.
- ~~Favicon on the LA proposal~~ — Done. M+P `+` favicon copied to the proposal folder, link tag added to the head.
