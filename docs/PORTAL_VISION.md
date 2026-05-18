# M+P Client Portal — Vision & Roadmap

*Last updated: May 18, 2026 (after the admin surface + OTP auth fix)*

This document is the north star for `projects.mondayandpartners.com`. It captures what the portal is meant to be, where it falls short today, and how we get from current state to an agency-grade client experience worthy of the M+P brand. Read this before planning any significant work on the portal.

**Status as of May 18, 2026:** the LA.IO bridge is now live and Madeline successfully signed in via the OTP code flow. The portal works for getting this proposal out the door. **It is, in Dylan's words, "duct-taped together":** two unresolved design systems, three-fallback auth code, denormalized schema, a primary-client column kept alongside a collaborators join table, a dead auth-callback route, no tests, no staging, no monitoring. Each duct-tape patch was the right call to ship the LA.IO engagement. Cumulatively, they're the argument for the rebuild. Don't paper-cut them. Plan the rebuild and replace them in one coherent sweep.

---

## What this is meant to be

The portal is the single home for the entire M+P client lifecycle. One URL, one login, one place where a client encounters Monday + Partners across every phase of an engagement:

- **Propose** a project (interactive proposal, signed approval, deposit collection)
- **Track** an active project (milestones, deliverables, notes, schedule)
- **Pay** deposits and balances (Stripe, transparent invoicing)
- **Archive** completed work (reference for both sides)

Every surface should feel like it came from the same studio: the M+P brand voice. Chartreuse-on-ink, Metro Sans body, Bpmf calligraphic display headlines, Karla tracked labels, generous negative space, considered motion. The Louisiana Startup Report 2026 proposal is the current best expression of that brand voice. It is the reference.

The longer-term ambition is that adding a new client engagement becomes data entry against a well-designed proposal renderer, not custom HTML production. Each project's content lives in Supabase (or per-project JSON), the renderer applies M+P brand patterns, and Dylan ships polished proposals in hours rather than days.

---

## What's actually built today (honest)

### Infrastructure (real and working)

- Next.js 16 (Turbopack) on Vercel, deployed at `projects.mondayandpartners.com`
- Supabase auth: 6-digit OTP code emailed to clients (paste into form, no clickable link), email+password for admin (`@mondayandpartners.com` domain)
- RLS-enforced per-collaborator data access via the `project_collaborators` join table (migration 003)
- Schema: `clients`, `projects`, `milestones`, `deliverables`, `notes`, `project_collaborators`, with approval fields on `projects`
- Stripe Checkout integration for deposit/final payments (set up but exercised only for the test project)
- Resend integration for transactional emails — both auth (via Supabase custom SMTP) and approval notifications (direct from API routes)
- Auth middleware that gates `/admin/*` and `/protected/*` with per-project authorization (any collaborator allowed)
- Client area at `/projects` listing all projects the user collaborates on, with status badges
- Admin dashboard at `/admin` listing every project, with per-row Manage link
- Admin `/admin/clients` page for creating clients (auto-creates pre-confirmed `auth.users` record)
- Admin `/admin/projects/[slug]` page for managing collaborators (add/remove with role)
- Approval API at `/api/projects/[slug]/approve` that authorizes any collaborator, persists to Supabase, and fires Resend emails to both admin and approver

### Two design systems coexisting (the honest part)

**Drafting Table.** Mid-century modern palette (black, cream, warm orange, gold, rust) with custom typography (Display sizes, MonoLabel) and components (vertical-rail, feature rows, stat displays, CTA blocks). Built as scaffolding to get the portal stood up. Lives in `src/components/drafting-table/`. Used by `ProposalViewV2` and `DashboardView`. **Not the M+P brand voice.** The login screen and admin dashboard also use this language.

**M+P brand (the LA proposal).** Chartreuse `#C9D92E` on ink `#111111`, Metro Sans body, Bpmf Zihi Kai Std display, Karla micro-caps. Custom stacked-card scroll architecture. Lives only as static HTML inside `public/protected/p/la-startup-2026/` and (canonically) in the Team Drives folder. This is what M+P actually looks like.

These two design languages are not unified. They share no tokens, no fonts, no patterns. A client logging in today encounters the Drafting Table palette on the login screen and client area, then crosses into the M+P brand voice when they open the LA proposal. The transition is jarring.

### The LA proposal bridge

The Louisiana Startup Report proposal (custom HTML, M+P brand) is served as a static asset under `public/protected/p/la-startup-2026/index.html`. The middleware gates access via auth + per-project authorization (admin or the matched client). The proposal's approve modal POSTs to `/api/projects/[slug]/approve` which writes to Supabase and emails Dylan via Resend.

This is bridge work. It gets LA.IO their proposal securely behind login without rebuilding everything first. It is intentionally not the long-term shape.

### Tech debt accumulated through May 18

To ship the LA.IO bridge and the admin surface, we accepted:

- **TS/ESLint build errors are bypassed.** `next.config.ts` has `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` set to true. Reason: pre-existing Framer Motion + React 19 type incompatibilities in Drafting Table components (`cta-block.tsx`, `typography.tsx`) block production builds. These need to be either fixed in place or rendered obsolete by the M+P brand rebuild before the bypass can be removed.
- **`middleware.ts` is the legacy convention.** Next 16 wants this renamed to `proxy.ts`. Deprecation warning is non-blocking but should be addressed.
- **Approval-state schema is grafted on.** Approval lives as a `awaiting_deposit` status + `approved_at` timestamp on the projects table. Works, but a dedicated approvals table (with audit log, version of terms approved, supporting metadata) would be cleaner for serious procurement use.
- **Custom-HTML proposals are listed in a code constant** (`src/lib/proposals.ts: CUSTOM_PROPOSAL_SLUGS`). Adding a new custom-HTML proposal requires a code change. Should be promoted to a column on the projects table when there's a second one.
- **`projects.client_id` is denormalized after the collaborators migration.** The join table is the source of truth for visibility; `client_id` is preserved as a primary-contact pointer. Decide during the rebuild whether to drop it or promote a `primary_collaborator_id` to the join table.
- **Two auth callback routes exist** (`/api/auth/callback` server-side PKCE, `/auth/callback` client-side hash+PKCE). The login form now uses neither (OTP code path); only the admin impersonation script still uses one of them. The server route is essentially dead code. Decide during the rebuild whether to keep one or rip both out.
- **`verifyOtp` cycles through three token types** in the login form (`magiclink`, `signup`, `email`) because Supabase tags OTPs differently based on user state and the docs are ambiguous. Works; not deterministic.
- **The OTP length (6) is hardcoded in the form** (input maxLength, slice, validation). Supabase controls the actual length via dashboard config. If those two ever drift, the form breaks silently.
- **Auth email templates are code-only by design.** No `{{ .ConfirmationURL }}` because email scanners pre-fetch and burn the OTP. Document and preserve this; don't let a future maintainer "improve UX" by adding a clickable button back.

---

## The design standard we want (and haven't achieved)

"Agency-grade" for M+P means:

**Brand consistency end to end.** Every surface from login to dashboard to proposal to invoice uses the same typography, color, motion, and voice. No system seams.

**Considered motion.** Not animation for animation's sake. Scroll-triggered reveals that feel purposeful. Transitions that respect reduced-motion. Page changes that feel like one continuous document, not a navigation event.

**Density when warranted, space when it matters.** The Investment section of a proposal carries dense numerical content and deserves precision. The cover screen earns drama through restraint. The system supports both registers without feeling like two different products.

**Type at scale.** Display sizes that genuinely command attention at 4.5rem. Body that's a pleasure to read at 14-16px. Tracked caps with the right letter-spacing for the eyebrow voice. The LA proposal demonstrates this; the Drafting Table approximates it.

**Microcopy that sounds like Monday + Partners.** Not generic agency talk. Specific, confident, occasionally dry. Sentence rhythm matters. Buttons should not say "Click here."

**Defaults that flatter the work.** Forms that don't look like Bootstrap. Tables that don't look like the back office of a payroll product. Loading states that don't break the spell.

The portal today gets the bones right and the visual surface wrong. That gap is the real work.

---

## The phased path forward

This is the sequence I'd recommend after LA.IO is live. Each phase is its own scoped piece of work. Don't try to do them in one sprint.

### Phase 1: Properly plan the rebuild

**This phase is the most important and the easiest to skip.** Before writing more components, do the design work:

- Define the M+P portal design system formally. Extract the LA proposal's tokens (colors, type, spacing, radii, shadows) into a documented set. Make naming consistent.
- Decide what the portal's information architecture looks like when there are 10 clients with 30 projects between them. Today's two routes (`/projects`, `/admin`) won't scale.
- Sketch the proposal renderer in Figma. Not as the LA proposal specifically, but as a *template* that could carry any project's content. What parts vary, what parts are fixed.
- Sketch the dashboard/active project view in the same design language. Status, milestones, deliverables, notes, payments — all rendered in M+P brand.
- Sketch the admin dashboard. Today's `/admin` is a list; what would it be at scale?
- Sketch the login flow, including the magic-link email itself (currently from Supabase, generic).

Output: a Figma file (or equivalent) showing every screen in the M+P brand voice, with annotations on data sources and interactions. No code yet.

This is the step we keep skipping. Stop skipping it.

### Phase 2: Build the M+P portal design system in code

Once the Figma exists:

- Tokens: colors, fonts, type scale, spacing, radii in `src/styles/` and `tailwind.config` (or v4 equivalent).
- Fonts: PP Neue Montreal stays available, but the proposal-voice fonts (Metro Sans, Bpmf Zihi Kai Std, Karla, Fraunces) need to be set up for use across the portal.
- Components: section card, scope phase block, investment row, terms grid, approval modal, stacked-card scroll, nav, footer, status badge, button (primary/secondary/ghost), input, fee toggle. Each lives in `src/components/proposal/` or `src/components/portal/`. Each is documented with a Storybook-style example or at minimum a usage comment.
- Replace Drafting Table progressively. Don't delete `src/components/drafting-table/` until everything that consumed it has been migrated. Then delete in one sweep.

### Phase 3: Rebuild the proposal renderer

`ProposalViewV2` becomes the proper proposal renderer in M+P brand voice. The LA proposal's content gets migrated from static HTML into either a Supabase row or a per-project JSON file. The renderer reads content and renders sections. The custom-HTML bridge under `public/protected/p/` retires.

At this point, the LA proposal looks identical (or better) to today, but is now data-driven and lives in the proper portal architecture.

### Phase 4: Generalize for new proposals

Admin tooling to author a new proposal: scope phases, investment, terms, Year 1 Support options, custom illustrations. Each proposal becomes a database write, not a code change. Dylan ships a new proposal in hours.

### Phase 5: Active-project surfaces

The dashboard view (post-approval) gets the same M+P brand treatment. Milestones render as M+P brand timeline. Deliverables as M+P brand list. Notes as M+P brand thread. Payment status as M+P brand bar. The Stripe deposit/final flow gets a proper M+P brand checkout experience.

### Phase 6: Admin operating system

Admin views get the M+P brand treatment. Real metrics, real workflows. Multi-client overview. Pipeline view. Revenue projections from in-flight deposits/balances. Notification preferences.

---

## The QA and testing standard we need (and don't have)

Tonight we shipped the LA bridge with "it works for the admin" as the implicit QA bar. That's fine for a transitional bridge. It is not the standard for an agency-grade portal serving $100k+ engagements. Capturing what real QA looks like so the rebuild plans for it from day one rather than bolting it on after launch.

**Email rendering and deliverability.** Every transactional email (magic link, approval notification, deposit reminder, project status digest) needs to be rendered in real inbox clients before it ships. Outlook on Windows. Gmail on web, iOS, and Android. Apple Mail. The new Outlook. Government inboxes specifically (`.gov` and `.edu` filters are aggressive). Litmus or Email on Acid for matrix testing, or at minimum a manual round through three or four real inboxes before sending production traffic. Sender authentication has to pass: SPF, DKIM, DMARC all green on every domain we send from. The magic-link experience is the very first touchpoint a client has with M+P, and it currently arrives from `noreply@mail.app.supabase.io`. That's not the standard.

**Persona-based user-journey walkthroughs.** Before every release, walk the full flow as each persona who'll encounter the system. The new client receiving a proposal cold. The returning client checking on an active project. The stakeholder who isn't the contractual client but is on a viewer list. The admin in the dashboard reviewing pipeline. Each persona on desktop, mobile, and (if relevant) tablet. The script for each walkthrough lives somewhere durable and gets updated as the flow evolves.

**Cross-browser and real-device QA.** Safari, Chrome, Firefox, Edge as a minimum on the desktop side. Real iOS device (not just Safari devtools), real Android device. The portal should feel correct, not "passes the smoke test." Animations don't stutter. Font rendering looks deliberate. Approve buttons hit reliably with thumbs, not just mouse precision.

**Accessibility verification.** WCAG 2.1 AA isn't a marketing claim; it needs to be actually verified. Automated tools (axe, Lighthouse) for the easy catches. Manual keyboard navigation through every flow. Screen reader pass with VoiceOver and NVDA on at least the proposal and the client area. Color contrast measured against tokens, not eyeballed. Reduced-motion users see appropriate fallbacks for the stacked-card scroll. Government clients in particular care about this.

**Performance gates.** Core Web Vitals targets: LCP under 2.5s, INP under 200ms, CLS under 0.1, measured on production with real-user monitoring (Vercel Analytics handles this). A budget for total page weight (the LA proposal at ~60KB HTML + 50KB CSS + 100KB fonts is light; future React-heavy versions should stay under 250KB JS gzipped). Performance regressions block releases.

**Synthetic monitoring in production.** Once the portal is the working operating system for client work, a synthetic check should hit the login flow, the proposal view, and the approval API every few minutes. Alerts go to a real channel that gets watched. We find out about outages before clients do.

**Pre-launch QA checklist.** A real one, with sign-offs, not a sticky note. Lives in the repo. Each release runs through it. Items include all of the above plus things like: are env vars set in Vercel for production, has the migration been run, is the staging environment in a known-good state, has the proposal content been proofed by a second human, has the rollback path been documented.

**Test data and impersonation tooling.** The `generate-magic-link.ts` script we added tonight is the start of this. We need: easy creation of test client accounts, easy cleanup, easy time-travel ("show me what this proposal will look like after approval"), and easy state-of-the-world reset for staging.

The honest version of this list: we have basically none of it today. That's appropriate for a bridge. It is not appropriate for the proper rebuild, and the proper rebuild should plan for QA infrastructure as a first-class part of the build, not as polish at the end.

---

## Open architecture questions

These should be resolved during Phase 1 planning, not assumed:

**~~Multi-user-per-project.~~** **Resolved May 18.** `project_collaborators` join table with role enum. `projects.client_id` retained as denormalized primary pointer; revisit during rebuild whether to keep it.

**Approval state model.** Should approval be a status, a timestamp, or a separate `approvals` table with audit history? For government work, an audit log is probably required. Decide before serious procurement.

**Proposal content storage.** Supabase rows? Per-project JSON files? Markdown with frontmatter? Each has tradeoffs in editing UX, version control, search. Decide before generalizing.

**~~Magic-link email branding.~~** **Resolved May 15-18.** Auth emails route through Resend via Supabase custom SMTP, arrive as `Monday + Partners <notifications@mondayandpartners.com>`. Templates are M+P paper-light and code-only.

**Auth callback consolidation.** Two routes (`/api/auth/callback` server, `/auth/callback` client) currently exist. With the OTP code flow as primary, almost no one hits them. Decide whether to consolidate to one route or remove entirely.

**Stripe checkout styling.** Stripe Checkout's hosted page can be lightly themed but is fundamentally Stripe's UI. For agency-grade, we might want Stripe Elements embedded in our own M+P brand checkout page. Tradeoff: more compliance scope.

---

## Blockers and risks

**Drafting Table type errors block strict builds.** Currently bypassed. If we keep building on Drafting Table, the bypass stays. If we replace it, this resolves naturally.

**Pre-existing CLAUDE.md and the new vision document drift.** This doc captures today's strategic position; CLAUDE.md captures current code behavior. Future maintainers should treat this doc as authoritative for direction, CLAUDE.md as authoritative for current code behavior, and reconcile when they conflict.

**No staging environment.** Today we deploy main directly to production. For a client portal serving government clients, we should add a preview/staging environment (Vercel makes this easy) before next launch.

**No backups verified.** Supabase has automated backups, but we haven't tested restore. Before serious data accrues, run a recovery drill.

**No automated tests on the auth flow.** All the auth tweaks made on May 18 (collaborators, OTP type fallback, code-only emails, 6-digit standardization) were validated manually. A regression in any of them silently breaks sign-in. Test coverage on the auth path is the first thing to add when the rebuild begins — even before redesigning visuals.

**LA.IO is a real procurement client now.** The portal is officially serving a government-adjacent engagement and Madeline has successfully signed in. Standards have implicitly moved up. Don't ship visible changes to production without proper testing.

---

## Existing context worth re-reading

The portal began with substantial planning that's still relevant:

- `docs/background/M+P_client_portal_spec.md` — original spec for the portal
- `docs/background/M+P_sprint_services_spec.md` — sprint/fast-track services definition (the $5-15k engagements the portal was first built for)
- `docs/background/PROJECT_CONTEXT.md` — original project context
- `docs/background/UI_Instructions.md` — early UI direction
- `docs/background/LGM_PPP_proposal.md` — content of the first test proposal
- `docs/background/LGM_PPP_web_proposal_structure.md` — IA for the first proposal
- `bugs.md` — running list of known issues and design gaps

The Phase 1 planning step should fold these in. Some of it is aging (LGM/PPP was the prototype client; LA.IO is the real one) but the agency-grade intent is consistent throughout.

---

## How to use this document

Future planning sessions on the portal: read this doc first. It will tell you whether the work you're about to do is on the bridge or on the proper rebuild. Both are legitimate, but they get measured against different standards. Bridge work optimizes for "get this client served safely." Proper work optimizes for "this stands up to scrutiny as M+P's real product."

If you're about to add a feature to the bridge that should really wait for the proper rebuild, do it intentionally and document the debt here.

If you're about to start the proper rebuild without Phase 1 planning, stop. Plan first.
