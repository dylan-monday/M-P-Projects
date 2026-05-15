@AGENTS.md

# Monday + Partners — Client Portal

## Project Overview

A client-facing proposal and project management portal for Monday + Partners (M+P), a design/development agency. The system handles the full client lifecycle: proposal → acceptance → project tracking → delivery.

**Target**: $5k-$15k "fast-track/sprint" projects with AI-assisted workflows, ~4 week delivery.

**Live URL**: https://projects.mondayandpartners.com
**Test Project**: `/lgm-ppp` (Looking Glass Media / Pecan Pie Productions)

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
- `/src/app/[slug]/page.tsx` — Dynamic project page (proposal or dashboard)
- `/src/app/[slug]/components/proposal-view-v2.tsx` — New proposal design
- `/src/app/[slug]/components/dashboard-view.tsx` — Post-acceptance project view
- `/src/app/login/page.tsx` — Magic link authentication

### Configuration
- `/src/app/layout.tsx` — Root layout with font loading
- `/src/app/globals.css` — Tailwind imports + design tokens
- `/src/styles/design-system.css` — Drafting Table tokens (colors, spacing)

### Database
- `/scripts/seed.ts` — Creates test project with Stripe products
- `/supabase/` — Schema and migrations

## How It Works

### URL Lifecycle
1. **Proposal** (`status: "proposal"`, `deposit_paid: false`)
   - Publicly accessible, no login required
   - Shows ProposalViewV2 with full pitch
   - CTA triggers Stripe checkout for deposit

2. **Active Project** (`deposit_paid: true`)
   - Requires authentication (client or admin)
   - Shows DashboardView with milestones, notes, deliverables
   - Final payment CTA when ready

3. **Complete** (`status: "complete"`)
   - Archive/reference view

### Authentication
- Magic link via Supabase Auth
- Admin: `ADMIN_EMAIL` env var
- Client: Matched by `project.client.email`

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
```

## Commands

```bash
npm run dev          # Start dev server
npx tsx scripts/seed.ts   # Seed test project (run once)
```

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
