# M+P Client Portal — Vision & Roadmap

*Last updated: May 15, 2026 (after the LA.IO bridge build)*

This document is the north star for `projects.mondayandpartners.com`. It captures what the portal is meant to be, where it falls short today, and how we get from current state to an agency-grade client experience worthy of the M+P brand. Read this before planning any significant work on the portal.

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
- Supabase auth (magic link for clients, email+password for admin) with RLS-enforced per-client data access
- Schema: `clients`, `projects`, `milestones`, `deliverables`, `notes`, with approval fields added in `migration-002`
- Stripe Checkout integration for deposit/final payments (set up but exercised only for the test project)
- Resend integration for transactional admin notifications (approval emails)
- Auth middleware that gates `/admin/*` and `/protected/*` with per-project authorization
- Client area at `/projects` listing all of a logged-in client's projects with status badges
- Admin dashboard at `/admin` listing every project across every client
- Approval API at `/api/projects/[slug]/approve` that persists to Supabase and fires the Resend email

### Two design systems coexisting (the honest part)

**Drafting Table.** Mid-century modern palette (black, cream, warm orange, gold, rust) with custom typography (Display sizes, MonoLabel) and components (vertical-rail, feature rows, stat displays, CTA blocks). Built as scaffolding to get the portal stood up. Lives in `src/components/drafting-table/`. Used by `ProposalViewV2` and `DashboardView`. **Not the M+P brand voice.** The login screen and admin dashboard also use this language.

**M+P brand (the LA proposal).** Chartreuse `#C9D92E` on ink `#111111`, Metro Sans body, Bpmf Zihi Kai Std display, Karla micro-caps. Custom stacked-card scroll architecture. Lives only as static HTML inside `public/protected/p/la-startup-2026/` and (canonically) in the Team Drives folder. This is what M+P actually looks like.

These two design languages are not unified. They share no tokens, no fonts, no patterns. A client logging in today encounters the Drafting Table palette on the login screen and client area, then crosses into the M+P brand voice when they open the LA proposal. The transition is jarring.

### The LA proposal bridge

The Louisiana Startup Report proposal (custom HTML, M+P brand) is served as a static asset under `public/protected/p/la-startup-2026/index.html`. The middleware gates access via auth + per-project authorization (admin or the matched client). The proposal's approve modal POSTs to `/api/projects/[slug]/approve` which writes to Supabase and emails Dylan via Resend.

This is bridge work. It gets LA.IO their proposal securely behind login without rebuilding everything first. It is intentionally not the long-term shape.

### Tech debt taken on tonight

To ship the LA.IO bridge, we accepted:

- **TS/ESLint build errors are bypassed.** `next.config.ts` has `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` set to true. Reason: pre-existing Framer Motion + React 19 type incompatibilities in Drafting Table components (`cta-block.tsx`, `typography.tsx`) block production builds. These need to be either fixed in place or rendered obsolete by the M+P brand rebuild before the bypass can be removed.
- **`middleware.ts` is the legacy convention.** Next 16 wants this renamed to `proxy.ts`. Deprecation warning is non-blocking but should be addressed.
- **Approval-state schema is grafted on.** Approval lives as a `awaiting_deposit` status + `approved_at` timestamp on the projects table. Works, but a dedicated approvals table (with audit log, version of terms approved, supporting metadata) would be cleaner for serious procurement use.
- **Custom-HTML proposals are listed in a code constant** (`src/lib/proposals.ts: CUSTOM_PROPOSAL_SLUGS`). Adding a new custom-HTML proposal requires a code change. Should be promoted to a column on the projects table when there's a second one.

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

## Open architecture questions

These should be resolved during Phase 1 planning, not assumed:

**Multi-user-per-project.** Today's schema is one client (one email) per project. The LA.IO engagement realistically wants Madeline + a few Tulane staff + an Emily to all view the proposal. The schema needs either a `project_users` join table or an array of authorized emails per project. Resolve before the next government client.

**Approval state model.** Should approval be a status, a timestamp, or a separate `approvals` table with audit history? For government work, an audit log is probably required. Decide before serious procurement.

**Proposal content storage.** Supabase rows? Per-project JSON files? Markdown with frontmatter? Each has tradeoffs in editing UX, version control, search. Decide before generalizing.

**Magic-link email branding.** Currently Supabase sends the magic link from its own domain. For the M+P brand experience, the magic link should come from `notifications@mondayandpartners.com` with an M+P-designed email template. Supabase supports custom SMTP; we should configure Resend as the SMTP provider for auth emails.

**Stripe checkout styling.** Stripe Checkout's hosted page can be lightly themed but is fundamentally Stripe's UI. For agency-grade, we might want Stripe Elements embedded in our own M+P brand checkout page. Tradeoff: more compliance scope.

---

## Blockers and risks

**Drafting Table type errors block strict builds.** Currently bypassed. If we keep building on Drafting Table, the bypass stays. If we replace it, this resolves naturally.

**Pre-existing CLAUDE.md and the new vision document drift.** This doc captures today's strategic position; the older CLAUDE.md captures the original Drafting Table direction. Future maintainers should treat this doc as authoritative for direction, CLAUDE.md as authoritative for current code behavior, and reconcile when they conflict.

**No staging environment.** Today we deploy main directly to production. For a client portal serving government clients, we should add a preview/staging environment (Vercel makes this easy) before next launch.

**No backups verified.** Supabase has automated backups, but we haven't tested restore. Before serious data accrues, run a recovery drill.

**LA.IO is a real procurement client now.** The portal is officially serving a government-adjacent engagement. Standards have implicitly moved up. Don't ship visible changes to production without proper testing.

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
