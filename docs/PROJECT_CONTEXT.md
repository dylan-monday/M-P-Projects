# Project Context — Monday + Partners Client Portal

## What We're Building

A client proposal and project portal at `projects.mondayandpartners.com`. This is a system for Monday + Partners to present proposals, collect payments, and manage client projects — starting with the LGM/PPP cinema advertising website rebuild, but designed to handle any number of future projects.

### The System Has Two Modes

**Mode 1: The Proposal (pre-payment)**
This is a sales tool. The client receives a link, logs in, and reads a beautifully designed proposal — broken into clearly navigable sections, scroll-driven, cinematic, and designed to persuade. Think of it as a keynote deck that lives in the browser. It should be:

- **Easy to navigate** — sticky section nav or table of contents so the client can jump between sections (The Problem, The Vision, What You Get, The Numbers, etc.) without scrolling the entire page
- **Delightful to read** — animated stats, confident typography, rhythm between sections, generous whitespace. This is the first impression of the quality of work being proposed.
- **Downloadable** — a "Download Proposal" button generates an elegantly simple, branded PDF document. Clean layout, proper page breaks, M+P branding. Not a screenshot of the web page — a properly formatted document.
- **Actionable** — ends with a clear scope summary, terms, and an "Accept & Pay Deposit" button that triggers Stripe Checkout

The proposal IS the pitch. It demonstrates the caliber of work the client is buying.

**Mode 2: The Project Portal (post-payment)**
After the deposit is paid, the same URL evolves. The proposal stays accessible (they can re-read it, download the PDF, share it with a partner), but a project dashboard appears alongside it:

- **Project status and timeline** — milestones with completion states
- **Payments** — deposit paid, final payment CTA (appears when ready)
- **Deliverables** — preview links, files, documents shared by Dylan
- **Notes** — messages and updates from Dylan
- **Clean and functional** — this part doesn't need to be flashy, it needs to be clear

The client switches between the proposal and the dashboard via tabs or a simple toggle. First visit = proposal. Return visits after payment = dashboard (with proposal still accessible).

### Future Vision
Over time this becomes a full client engagement platform:
- Reusable proposal templates (swap in project-specific content, keep the polish)
- Client can leave feedback on deliverables
- File sharing (client uploads brand assets, ad source files)
- Retainer billing and recurring invoicing
- Activity log / project history
- Multiple team members per project

But for now: one beautiful proposal, one clean dashboard, payments that work.

## Tech Stack

- **Framework:** Next.js 14+ (App Router, server components)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Auth:** Supabase Auth (magic links)
- **Database:** Supabase Postgres
- **File Storage:** Supabase Storage
- **Real-Time:** Supabase Realtime (for live dashboard updates)
- **Payments:** Stripe Checkout (hosted)
- **Email:** SendGrid (transactional notifications) + Supabase Auth (magic links)
- **Hosting:** Vercel Pro
- **Domain:** projects.mondayandpartners.com (CNAME → Vercel)

## Environment Variables

See `.env.example` for all required keys. Copy to `.env.local` and fill in real values.

## Spec Files — Read These First (in this order)

1. **`/docs/M+P_client_portal_spec.md`** — Full system architecture. Supabase schema (SQL ready to run), RLS policies, auth config, Stripe integration, admin dashboard spec, notification system, data model, and build phases. **Start here.**

2. **`/docs/LGM_PPP_web_proposal_structure.md`** — The proposal scroll page design. Section-by-section breakdown with scroll positions, animation cues, content for each beat, payment states (pre-deposit, post-deposit, final payment), and post-payment confirmation flows.

3. **`/docs/LGM_PPP_proposal.md`** — The proposal copy/content. Sales-forward pitch text that populates the scroll page. Includes problem framing, feature descriptions, cost comparisons, agency benchmarks, and closing language.

4. **`/docs/LGM_research.md`** — Cinema advertising research with sourced statistics. Used in the proposal's animated stat sections and throughout the LGM/PPP sites. Section 8 contains the complete Ideal Content inventory.

5. **`/docs/LGM_wireframe.md`** — LGM site wireframe. Page-by-page structure, design direction, and interaction specs. (Phase 3 — not part of initial portal build.)

6. **`/docs/PPP_wireframe.md`** — PPP site wireframe. Current site assessment, page structure, shared CMS approach. (Phase 3 — not part of initial portal build.)

## Build Order

### Phase 1: Portal + Proposal (build this first)
1. Scaffold Next.js project with App Router, Tailwind, Framer Motion
2. Run Supabase schema SQL (tables, RLS policies) from the spec
3. Configure Supabase Auth (magic links, branded email template, redirect URLs)
4. Create seed script (`/scripts/seed.ts`) that:
   - Creates the LGM/PPP client record in Supabase
   - Creates Stripe products/prices via Stripe API (deposit $5,000 + final $5,000)
   - Stores the Stripe price IDs in the Supabase project record
   - Creates default milestones
   - Adds initial note ("Proposal delivered...")
5. Build auth gate (login page with email input → magic link)
6. **Build the proposal experience (MODE 1):**
   - Section-based scroll page per web_proposal_structure.md
   - Sticky section nav or table of contents for easy navigation between sections
   - Animated stat counters, fade-ins, scroll-triggered transitions
   - Scope summary and terms section
   - "Accept & Pay Deposit" CTA → Stripe Checkout
   - "Download Proposal" button → generates branded PDF (print-optimized layout, proper page breaks, M+P branding — NOT a screenshot of the scroll page)
7. **Build the project dashboard (MODE 2):**
   - Appears after deposit is paid (tab or toggle alongside proposal)
   - Status + milestone timeline
   - Payment status (deposit paid / final payment CTA)
   - Deliverables list (files + preview links, shown when you add them)
   - Notes from Dylan
   - Clean, functional, not flashy
8. Build view toggle: first visit = proposal. Return visits after payment = dashboard with proposal accessible via tab.
9. Integrate Stripe Checkout (reads price IDs from Supabase, NOT from env vars). Include `project_id` and `payment_type` in Checkout Session metadata.
10. Build Stripe webhook handler at `/api/stripe/webhook` — updates Supabase, triggers SendGrid emails automatically
11. Set up SendGrid notification emails (payment confirmations, milestone updates)
12. Deploy to Vercel, bind `projects.mondayandpartners.com` domain
13. **POST-DEPLOY:** Register Stripe webhook endpoint in Stripe dashboard (the ONE manual Stripe step). Copy signing secret to .env and redeploy.

### Phase 2: Admin Dashboard
15. Build admin auth (restrict to ADMIN_EMAIL via middleware)
16. Build project list view
17. Build project editor (milestones, deliverables, notes, status)
18. Build new project creator — form that:
    - Accepts client info, project title, deposit/final amounts
    - Calls Stripe API to create products/prices automatically
    - Creates all Supabase records (client, project, milestones)
    - Generates the project URL ready to share
    - Zero manual Stripe dashboard work
19. Enable Supabase Realtime for live client dashboard updates

### Phase 3: LGM + PPP Sites (separate repos/projects)
20. Build LGM site per wireframe
21. Build PPP site per wireframe
22. Shared content library + admin dashboard for both sites

## Design Direction

- Dark mode throughout (#0a0a0a to #111111)
- Warm amber/gold accent color (cinema projector light motif)
- Large, confident typography — display weight headlines, clean sans body
- Scroll-triggered animations: number count-ups, fade-ins, subtle parallax
- Minimal imagery — typography and data do the work
- Mobile-first
- Target page weight: under 500KB before fonts

## Project Fee

- **Total:** $10,000
- **Deposit:** $5,000 (due on acceptance)
- **Final:** $5,000 (due on completion approval)
- Stripe products/prices are created via the Stripe API — NOT manually in the Stripe dashboard
- Price IDs are stored per-project in Supabase, NOT in env vars
- For the first project (LGM/PPP), create a seed script that inserts the project record and creates the Stripe products/prices automatically

## Infrastructure Status

- [x] Stripe — live mode, Chase connected, API keys in .env
- [x] Supabase — new project provisioned, keys in .env
- [x] Cloudflare DNS — CNAME for projects subdomain added
- [x] SendGrid — API key in .env, domain verification in progress
- [x] .env.local — complete
- [ ] Stripe webhook — register AFTER first deploy (app must be live first)
- [ ] SendGrid domain DNS — records need to be added in Cloudflare

## Key Decisions Already Made

- **Auth:** Supabase magic links. No passwords, ever.
- **Payments:** Stripe Checkout (hosted). No custom payment form. Two events per project: deposit + final.
- **Stripe products/prices:** Created automatically via Stripe API when a project is created. NEVER manually in the Stripe dashboard. The admin UI creates a project → app calls Stripe API → stores price IDs in Supabase. For the first project, a seed script handles this.
- **Stripe webhook:** The endpoint is `/api/stripe/webhook`. It CANNOT be registered in Stripe until after the first deploy (the URL must be live). Include a post-deploy setup note or script. During local dev, use Stripe CLI to forward webhooks.
- **Stripe tax:** Disabled. Do NOT pass `automatic_tax` parameter in Checkout Sessions.
- **Page states:** One URL per project, three visual states (proposal → in progress → complete). Stripe is source of truth for payment status.
- **Data:** Supabase Postgres with RLS. Clients can only see their own projects.
- **Email:** Supabase handles magic link emails natively. SendGrid handles everything else (payment confirmations, milestone notifications). Emails are triggered automatically by database changes and webhook events — no manual sending.
- **File storage:** Supabase Storage for proposal PDFs and deliverables.
- **PDF generation:** Dynamic — render a print-optimized layout of the proposal via API route. No pre-generated PDFs to maintain manually.
- **No CMS:** Content is either in the database (structured data) or in the codebase (proposal page content). No external CMS.
- **No manual Stripe dashboard work per project.** Everything that can be automated via API should be. The only manual Stripe step is the one-time webhook registration after first deploy.
- **Seed script:** Phase 1 includes a seed script (`/scripts/seed.ts` or similar) that creates the first project (LGM/PPP) with client record, milestones, Stripe products/prices, and initial notes. This is the pattern for how projects get created — the admin UI in Phase 2 wraps the same logic in a form.
