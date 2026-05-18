@AGENTS.md

# Monday + Partners — Client Portal

> **Before doing significant work on this portal:** read `docs/PORTAL_VISION.md`. It captures where this is going (agency-grade M+P brand portal serving the full client lifecycle), the gap between current state and target, and the phased rebuild plan. This CLAUDE.md is the operational reference for the code that exists today.

## Project Overview

A client-facing proposal and project management portal for Monday + Partners (M+P), a design/development agency. The system handles the full client lifecycle: proposal → acceptance → project tracking → delivery.

**Originally targeted**: $5k-$15k "fast-track/sprint" projects with AI-assisted workflows, ~4 week delivery.

**Now also serving**: government-adjacent procurement engagements (LA.IO / Louisiana Innovation, $104.8k proposal). Standards have moved up.

**Live URL**: https://projects.mondayandpartners.com
**Test Project**: `/lgm-ppp` (Looking Glass Media / Pecan Pie Productions)
**Active client engagement**: `/protected/p/la-startup-2026/index.html` (Louisiana Startup Report 2026, custom-HTML proposal, auth-gated)

---

## Recent additions (May 18, 2026 — late afternoon, OTP auth fix)

Madeline tried to sign in and bounced back to /login. Diagnosed a chain of three issues with the auth flow and rebuilt the email path end-to-end:

- **OTP code is now the primary auth path, not clickable magic links.** The login form is a two-step state machine: collect email → fire `signInWithOtp` → collect 6-digit code → `verifyOtp`. The form (`src/app/(auth)/login/login-form.tsx`) tries `verifyOtp` against three token types in sequence (`magiclink`, `signup`, `email`) because Supabase tags the OTP differently based on user state and the docs are ambiguous; failed verifies don't consume the token, so the fallback is safe.
- **Auth email templates are code-only.** `docs/email-templates/magic-link.html` and `confirm-signup.html` show `{{ .Token }}` (the 6-digit code) and intentionally omit `{{ .ConfirmationURL }}`. Email security scanners (Gmail, M365 Defender, government inboxes) pre-fetch links and burn the OTP before the user clicks; no URL in the email means nothing to pre-fetch. Do not add the URL back without a real plan; see `docs/email-templates/SETUP.md` for the reasoning.
- **6-digit codes, set in two places.** The login form hard-codes 6 (input maxLength, slice, validation). Supabase Dashboard → Authentication → Providers → Email → OTP Length is also 6. Both must stay in sync.
- **Auth + transactional sender name.** Auth emails come from `Monday + Partners <notifications@mondayandpartners.com>` (Supabase SMTP). Resend transactional emails (approval admin + client confirmation) use the same RFC 5322 format via `RESEND_FROM` so recipients see one brand across the lifecycle. `RESEND_FROM_NAME` env var can override.
- **`?error=auth_failed` surfaced on /login.** The form now reads `searchParams.get("error")` and shows a human-readable message; failed callbacks aren't silent anymore.
- **Two auth callback routes still exist** (`/api/auth/callback` server PKCE, `/auth/callback` client hash+PKCE). With OTP code as primary, the only consumer is `scripts/generate-magic-link.ts`. Treat as legacy; consolidate during rebuild.

To apply this in Supabase: paste `docs/email-templates/magic-link.html` and `confirm-signup.html` into the Magic Link and Confirm Signup template slots respectively, set OTP Length to 6, set SMTP sender name to "Monday + Partners".

## Recent additions (May 18, 2026 — admin surface)

Building out admin client-management and per-project collaborator assignment:

- **Many-to-many project access via `project_collaborators` join table.** Migration 003 (`scripts/migration-003-project-collaborators.sql`) adds the table, backfills existing `projects.client_id` rows as `role = 'primary'`, and extends RLS so any collaborator (not just the primary client) can SELECT the project's rows. `projects.client_id` is preserved as the "primary contact" pointer (drives default email recipient).
- **Approval is now any-collaborator, not just primary-client.** `/api/projects/[slug]/approve` checks `project_collaborators` membership, not just `client_id`. The client confirmation email goes to whoever actually clicked Approve (falls back to primary client when admin acts on their behalf).
- **Admin clients page** at `/admin/clients` lists every client with project count and an inline create form. `POST /api/admin/clients` upserts the clients row and pre-confirms the auth.users record so the new client can magic-link straight in.
- **Admin per-project view** at `/admin/projects/[slug]` shows collaborators with role (primary / collaborator / viewer), an add-by-dropdown form, and per-row remove. API at `/api/admin/projects/[slug]/collaborators` (POST upserts, DELETE by `?client_id=`). The existing admin project list got a `Manage` button on each row that links here.
- **Approval email templates extracted** into `docs/email-templates/proposal-approved-admin.html` and `proposal-approved-client.html`. Same paper-light family as the auth templates; loaded at runtime in the approve route via `src/lib/email/templates.ts`. These are transactional, sent via Resend — NOT Supabase Auth templates (Supabase has no slot for them). `next.config.ts` includes `outputFileTracingIncludes` so the docs folder ships in the Vercel function bundle.
- **Generated previews** in `docs/email-templates/previews/` (gitignored) — open these directly in a browser to see the rendered output with sample data.

To run migration 003: paste `scripts/migration-003-project-collaborators.sql` into Supabase SQL Editor.

## Recent additions (May 15, 2026)

Major bridge build to host the LA.IO proposal under the portal's auth layer:

- **Auth-gated custom-HTML proposals** under `/protected/p/{slug}/`. Static HTML lives in `public/protected/p/{slug}/`. Middleware enforces auth + per-project authorization (admin or matched client). Custom-HTML proposal slugs listed in `src/lib/proposals.ts`.
- **Client area** at `/projects` lists all projects for the logged-in client with status badges (Proposal / Awaiting deposit / In progress / Approved). Admins redirect to `/admin`.
- **Admin email+password auth.** `/login` detects emails ending in `@mondayandpartners.com` and switches from magic-link to password form. Set admin password via `npx tsx scripts/set-admin-password.ts 'your-password'`.
- **Approval API** at `/api/projects/[slug]/approve`. Persists `approved_at`, `approver_name`, `approval_total` (cents), `year_1_support_included` to the projects table. Sends Resend email to `ADMIN_EMAIL` from `notifications@mondayandpartners.com` after successful write.
- **Migration 002** (`scripts/migration-002-add-approval-fields.sql`) added approval columns to the projects table. Run in Supabase SQL Editor.
- **Build bypass.** `next.config.ts` has `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` set to true because Drafting Table components have pre-existing type errors that block production builds. Tech debt; see `bugs.md` and `docs/PORTAL_VISION.md`.
- **Resend integration** for transactional admin emails. `RESEND_API_KEY` in `.env.local` and Vercel env. Optional `RESEND_FROM_EMAIL` defaults to `notifications@mondayandpartners.com`. `mondayandpartners.com` is verified in Resend.

See `docs/PORTAL_VISION.md` for the rebuild plan that turns the bridge into a proper M+P brand portal.

## Tech Stack

- **Framework**: Next.js 16.2.0 (App Router, Turbopack)
- **Styling**: Tailwind CSS 4 (CSS-based config, not JS)
- **Animation**: Framer Motion
- **Database**: Supabase (PostgreSQL + Auth)
- **Payments**: Stripe Checkout
- **Fonts**: PP Neue Montreal (local) + Space Mono (Google)

## Design System: "Drafting Table"

A mid-century modern aesthetic brought to contemporary digital execution. Located in `/src/components/drafting-table/`.

### Core Principles
- Precision and grid discipline
- Asymmetric compositions with intentional tension
- Dramatic negative space
- Typography as architecture

### Color Palette
- **Black**: #000000 (primary background)
- **Cream**: #F5F0E8 (alternate sections)
- **Accent**: #FF6B35 (warm orange - highlights, CTAs)
- **Gold**: #D4A843 (positive indicators)
- **Rust**: #8B5A3C (muted negative indicators)

### Typography Scale (all use `font-sans` class)
- `DisplayXL`: 2.5rem-4.5rem (hero headlines)
- `DisplayLG`: 2.25rem-3.5rem (section headlines)
- `DisplayMD`: 1.5rem-2.25rem (section titles)
- `DisplaySM`: 1.125rem-1.5rem (subsections)
- `MonoLabel`: 10px uppercase tracking (labels, metadata)

### Components
```
/src/components/drafting-table/
├── index.ts              # All exports
├── vertical-rail.tsx     # Left-edge navigation with section dots
├── typography.tsx        # Display, Body, Mono, OutlineText components
├── layout.tsx            # Section, Container, Split, Stack, RailOffset
├── stat-display.tsx      # Animated stats, comparison bars
├── feature-row.tsx       # Numbered feature rows, timelines, checklists
└── cta-block.tsx         # Full-width CTA, PriceDisplay, PaymentSplit
```

## Key Files

### Routes
- `/src/app/[slug]/page.tsx` — Dynamic project page (proposal or dashboard). Redirects to `/protected/p/{slug}/index.html` for custom-HTML proposals.
- `/src/app/[slug]/components/proposal-view-v2.tsx` — Drafting Table proposal view (used by non-custom proposals)
- `/src/app/[slug]/components/dashboard-view.tsx` — Post-acceptance project view (Drafting Table)
- `/src/app/(auth)/login/page.tsx` — Login page (magic link for clients, password for admin)
- `/src/app/(auth)/login/login-form.tsx` — Form with admin-domain detection
- `/src/app/projects/page.tsx` — Client area listing all of a user's projects
- `/src/app/admin/page.tsx` — Admin dashboard listing all projects (Drafting Table)
- `/src/app/admin/clients/page.tsx` — Admin clients page (create + list)
- `/src/app/admin/projects/[slug]/page.tsx` — Admin per-project view (manage collaborators)
- `/src/app/api/admin/clients/route.ts` — POST create-or-upsert a client + pre-confirmed auth user
- `/src/app/api/admin/projects/[slug]/collaborators/route.ts` — POST add / DELETE remove a collaborator
- `/src/app/api/projects/[slug]/approve/route.ts` — Approval API (Supabase write + Resend email; loads templates from `docs/email-templates/`)
- `/src/app/api/auth/callback/route.ts` — Magic-link exchange (redirects to `/projects` by default)
- `/src/app/api/stripe/checkout/route.ts` — Stripe checkout session creation
- `/src/app/api/stripe/webhook/route.ts` — Stripe payment webhook
- `/src/middleware.ts` — Auth + project authorization (gates `/admin/*` and `/protected/*`)

### Custom-HTML proposals (the bridge)
- `/public/protected/p/{slug}/` — Static HTML proposals served behind auth
  - Currently: `la-startup-2026/` (Louisiana Startup Report 2026, M+P brand voice)
- `/src/lib/proposals.ts` — `CUSTOM_PROPOSAL_SLUGS` set + `proposalHref(slug)` helper

### Configuration
- `/src/app/layout.tsx` — Root layout with font loading
- `/src/app/globals.css` — Tailwind imports + design tokens
- `/src/styles/design-system.css` — Drafting Table tokens (colors, spacing)
- `/next.config.ts` — Turbopack root pin + TS/ESLint build bypass (tech debt)
- `/src/components/layout/logo.tsx` — Logo component with `sm/md/lg/xl/2xl` sizes

### Database
- `/scripts/seed.ts` — Creates LGM/PPP test project with Stripe products
- `/scripts/seed-la-startup.ts` — Creates LA.IO client (Madeline Kawanaka) and project record
- `/scripts/set-admin-password.ts` — Sets admin password via Supabase admin API (run once)
- `/scripts/schema.sql` — Original schema (clients, projects, milestones, deliverables, notes + RLS)
- `/scripts/migration-001-add-paid-flags.sql` — Adds `deposit_paid`/`final_paid` booleans
- `/scripts/migration-002-add-approval-fields.sql` — Adds `approved_at`, `approver_name`, `approval_total`, `year_1_support_included`
- `/scripts/migration-003-project-collaborators.sql` — Adds `project_collaborators` join table + RLS so multiple users can be on one project

## How It Works

### URL Lifecycle

There are two flows depending on whether a project has a custom-HTML proposal.

**Standard projects** (no entry in `CUSTOM_PROPOSAL_SLUGS`):

1. **Proposal** (`status: "proposal"`, `deposit_paid: false`)
   - Public via `/[slug]` (no login required for proposal state)
   - Shows ProposalViewV2 (Drafting Table)
   - CTA triggers Stripe checkout for deposit

2. **Active Project** (`deposit_paid: true`)
   - Requires authentication (client or admin)
   - Shows DashboardView with milestones, notes, deliverables
   - Final payment CTA when ready

3. **Complete** (`status: "complete"`)
   - Archive/reference view

**Custom-HTML proposals** (e.g. LA.IO):

1. **Auth required at all times.** `/protected/p/{slug}/index.html` is gated by middleware. `/{slug}` redirects to the protected path.
2. **Sign-in flow.** Client visits `/login`, enters email, gets magic link, lands on `/projects` (client area).
3. **Approval.** From `/projects`, client clicks the project, views the proposal, clicks Approve in the modal. POSTs to `/api/projects/[slug]/approve` which writes to Supabase (`status: "awaiting_deposit"`, approval fields populated) and sends Resend email to admin.
4. **Post-approval.** Client area shows the project with "Approved" badge. Proposal stays viewable.

### Authentication

- **Clients:** 6-digit OTP code via Supabase Auth (custom SMTP through Resend). Two-step form: enter email → enter code. Templates are code-only (no clickable link) so email scanners can't pre-fetch and burn the OTP. `verifyOtp` cycles through `magiclink` → `signup` → `email` token types because Supabase tags OTPs differently based on user state.
- **Admin:** email + password via `supabase.auth.signInWithPassword`. Set via `scripts/set-admin-password.ts`. `/login` detects `@mondayandpartners.com` emails and shows password field.
- **Authorization:** middleware enforces admin-only access to `/admin/*`. For `/protected/p/{slug}/*`, middleware verifies the user is either `ADMIN_EMAIL` or a collaborator on that project (per Supabase RLS on the `project_collaborators` join table from migration 003).
- **Legacy:** `/api/auth/callback` (server PKCE) and `/auth/callback` (client hash+PKCE) routes still exist but the OTP form bypasses them entirely. Only `scripts/generate-magic-link.ts` still uses the client callback.

### Payments
- Stripe Checkout (redirect flow)
- Webhook at `/api/stripe/webhook` updates `deposit_paid`/`final_paid`
- Amounts stored in cents (e.g., 500000 = $5,000)

## What's Been Done (This Session)

### Design System Implementation
- [x] Set up PP Neue Montreal fonts in `/public/fonts/`
- [x] Created design system tokens in `/src/styles/design-system.css`
- [x] Built all Drafting Table components
- [x] Created `proposal-view-v2.tsx` using new design system
- [x] Updated `page.tsx` to use ProposalViewV2

### Refinements
- [x] Fixed typography scale (was too large, overflowing viewport)
- [x] Fixed PriceDisplay cent-to-dollar conversion
- [x] Replaced hard red/green with on-brand rust/gold
- [x] Removed alternating alignment on feature rows
- [x] Fixed font loading (`--font-display` variable conflicts)
- [x] Fixed OutlineText webkit stroke styling

## What Needs To Be Done

### Immediate
- [ ] Verify fonts load correctly after hard refresh
- [ ] Visual QA pass on all sections
- [ ] Test on mobile viewport
- [ ] Test Stripe checkout flow

### Design Polish
- [ ] Review spacing/padding consistency
- [ ] Add subtle scroll-triggered animations
- [ ] Improve OutlineText rendering (may need SVG fallback)
- [ ] Mobile bottom navigation styling

### Functionality
- [ ] Dashboard view needs update to match new design system
- [ ] Admin dashboard/project management UI
- [ ] Smart intake system with Anthropic API (future)

### Cleanup
- [ ] Remove old `proposal-view.tsx` once v2 is confirmed
- [ ] Remove duplicate @font-face declarations (now handled by Next.js)
- [ ] Audit unused CSS in design-system.css

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=
ADMIN_EMAIL=
RESEND_API_KEY=
RESEND_FROM_EMAIL=       # optional; defaults to notifications@mondayandpartners.com
RESEND_FROM_NAME=        # optional; defaults to "Monday + Partners"
```

All of these must also be set in Vercel project settings → Environment Variables for production builds.

## Commands

```bash
npm run dev                                       # Start dev server
npx tsx scripts/seed.ts                           # Seed LGM/PPP test project
npx tsx scripts/seed-la-startup.ts                # Seed LA.IO client + project
npx tsx scripts/set-admin-password.ts 'pwd'       # Set admin password (single-quote to escape !)
```

## Multi-account GitHub note

This repo is on GitHub at `dylan-monday/M-P-Projects`. Dylan also has other GitHub accounts (e.g. `dylan-natrx`). Before pushing, confirm the credentials git uses are for `dylan-monday`. If push fails with 403, clear macOS Keychain entries for `github.com` and re-authenticate with a personal access token tied to `dylan-monday`.

## Font Setup

Fonts are loaded via Next.js `localFont` in `layout.tsx`:
- Sets `--font-display` CSS variable on `<html>`
- `@theme inline` in globals.css maps `--font-sans: var(--font-display)`
- Use `font-sans` class in components (NOT `font-display`)

**Important**: Do NOT define `--font-display` in CSS files — it's set by Next.js.

## Available Tools & Libraries

### Pretext (@chenglou/pretext)
Pure JS/TS library for multiline text measurement & layout WITHOUT DOM operations. Useful for:
- Calculating text height before rendering (virtualization, layout planning)
- Avoiding expensive `getBoundingClientRect` / layout reflows
- Canvas/SVG text rendering with proper line breaks
- Finding optimal "shrink-wrap" widths for text containers

```ts
import { prepare, layout } from '@chenglou/pretext'

const prepared = prepare('Your text', '16px Inter')
const { height, lineCount } = layout(prepared, maxWidth, lineHeight)
```

Key APIs:
- `prepare(text, font)` → one-time measurement
- `layout(prepared, maxWidth, lineHeight)` → returns `{ height, lineCount }`
- `prepareWithSegments()` + `layoutWithLines()` → get line info for custom rendering
- `{ whiteSpace: 'pre-wrap' }` option for textarea-like text

**Note**: Avoid `system-ui` font — use named fonts for accuracy.

### MCP Servers Available
- **21st.dev Magic** — UI component builder, refinement, and inspiration
- **Stitch** — Google's UI design/screen generation
- **GSAP Master** — Animation generation and debugging
- **Tailwind** — Utility lookup, CSS conversion, component templates
- **shadcn/ui** — Component registry search and installation
- **Gemini Image** — AI image generation/editing

### Skills
- **front-end design** — Production-grade frontend interfaces with high design quality
