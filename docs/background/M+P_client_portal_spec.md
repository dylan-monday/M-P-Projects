# Monday + Partners — Client Portal System
## projects.mondayandpartners.com

_Architecture & feature spec · March 2026_

---

## Concept

A minimal, branded client portal where prospects and clients log in to view proposals, make payments, track project progress, and access deliverables. Each project gets its own proposal experience — the LGM/PPP proposal is the first, but the system is built to hold any number of future projects.

This is not a project management tool. It's not Basecamp or Monday.com. It's a client-facing storefront for your work — the part of the process the client sees. Clean, opinionated, and on-brand.

**URL:** `projects.mondayandpartners.com`

---

## User Experience

### Client Flow

```
1. Client receives a link:
   projects.mondayandpartners.com/lgm-ppp

2. First visit → simple auth gate
   - Magic link (enter email, get a login link) — no passwords
   - Or: access token in the URL for first visit, then email-based for return visits

3. Inside → they see their project:
   - The proposal (scroll experience)
   - Payment status and CTAs
   - Project timeline / milestones
   - Deliverable links (preview URLs, files)
   - PDF download of the proposal
   - Any messages or notes from you

4. As the project progresses, this page evolves:
   - Pre-deposit: proposal + deposit CTA
   - Deposit paid: timeline activates, "in progress" state
   - Review ready: preview links appear, feedback mechanism
   - Final payment: approval + payment CTA
   - Launched: archive state with deliverable links
```

### Your Flow (Admin)

```
1. Log in to an admin view (or manage via CLI/Claude Code)

2. Create a new project:
   - Client name, company, email
   - Project title, slug (becomes the URL path)
   - Proposal content (markdown or structured)
   - Payment amounts (deposit + final, or custom milestones)
   - App automatically creates Stripe products/prices via API and stores IDs

3. Manage project state:
   - Mark milestones complete
   - Add deliverable links (preview URLs, files, PDFs)
   - Add notes visible to the client
   - Trigger state transitions (review ready, launched, etc.)

4. View payment status (synced from Stripe via webhooks)
```

---

## Site Architecture

```
projects.mondayandpartners.com/
├── / ........................ Landing / login gate
├── /[project-slug] ......... Client project view (proposal + portal)
├── /admin .................. Your admin dashboard
└── /api
    ├── /auth ............... Magic link auth
    ├── /stripe ............. Checkout session creation + webhooks
    └── /projects ........... Project CRUD (admin only)
```

---

## Page 1: Landing / Login Gate `/`

### Unauthenticated
```
[Monday + Partners logo]

"Client Portal"

Enter your email to access your project.

[email input]
[Send Login Link →]

"You'll receive a link that logs you in instantly.
No password needed."
```

**Design:** Dead simple. Dark background. Logo. Input. One button. The restraint signals professionalism.

**Alternative entry:** If the client arrives via a direct project link (`/lgm-ppp`), they see the same auth gate but with the project title visible: "Log in to view your proposal for LGM + PPP Website Rebuild."

### Authenticated (multiple projects)
If a client email is associated with more than one project (unlikely now, possible later), they see a simple list:

```
"Your Projects"

LGM + PPP Website Rebuild
March 2026 · In Progress
[View →]

[Future Project Name]
[Date] · [Status]
[View →]
```

For single-project clients (most cases), skip this and go straight to the project view.

---

## Page 2: Client Project View `/[project-slug]`

This is the heart of the system. For the LGM/PPP project, this IS the cinematic scroll proposal — but wrapped in a portal context that adds:

### Portal Header (persistent, minimal)
```
[M+P logo]                    [Client Name] · [Log Out]
```

Thin, dark, out of the way. Doesn't compete with the proposal content.

### Portal Sections (below or alongside the proposal)

The proposal scroll experience lives here in its entirety — Sections 1–10 as previously designed. But now the page also includes a **Project Dashboard** section that appears after the proposal content (or as a tabbed/toggled view):

#### Dashboard Tab: Overview
```
Project: LGM + PPP Website Rebuild
Status:  ● In Progress (or: Proposal / Awaiting Deposit / In Progress / Review / Complete)

Timeline
────────────────────────────────────────
✓ Research & wireframes          Complete
✓ Proposal delivered             Mar 2026
○ Deposit received               Awaiting
○ Design direction               1 week
○ Design + development           3–4 weeks
○ Review & approval              —
○ Final payment                  —
○ Launch                         —
```

#### Dashboard Tab: Payments
```
Deposit          $X,XXX    [Pay Now] or [Paid ✓ — Mar XX, 2026]
Final balance    $X,XXX    [Locked until review] or [Pay Now] or [Paid ✓]
────────────────────────────────────────
Total            $XX,XXX

[Download Receipt — PDF]
```

#### Dashboard Tab: Deliverables
```
Documents
  ↳ Proposal PDF                    [Download]
  ↳ Research Brief                  [Download]
  ↳ Site Wireframes (LGM)           [Download]
  ↳ Site Wireframes (PPP)           [Download]

Preview Links (appear when available)
  ↳ LGM Preview Site                [View →]
  ↳ PPP Preview Site                [View →]

Final Sites (appear post-launch)
  ↳ lookingglassmedia.com           [Visit →]
  ↳ pecanpieproductions.com         [Visit →]
```

#### Dashboard Tab: Notes
```
Mar 20, 2026
"Proposal delivered. Take your time reviewing — I'm available
to discuss any questions. Call or text anytime."
— Dylan

[Future notes appear here as the project progresses]
```

### View Toggle
The client can switch between the full proposal experience and the dashboard. Two approaches:

**Option A: Tabs**
```
[Proposal]  [Dashboard]
```
The proposal is the default/first view. Dashboard is secondary.

**Option B: Scroll-through**
The proposal scroll experience ends, and the dashboard sections follow naturally — "Here's where things stand" as the final chapter of the scroll.

**Recommendation:** Option B for the first visit (the scroll should be uninterrupted). Option A for return visits (they've read the proposal, they just want status and payment).

---

## Page 3: Admin Dashboard `/admin`

### Auth
Your login only. Email magic link or simple password (since it's just you). Could also be a static token if you prefer to keep it minimal.

### Project List
```
Projects

LGM + PPP Website Rebuild       In Progress    $XX,XXX    [Edit]
[Future Project]                 Proposal       $XX,XXX    [Edit]

[+ New Project]
```

### Project Editor
```
Project: LGM + PPP Website Rebuild
Slug:    lgm-ppp
Client:  [Name] · [email]
Status:  [Proposal → Awaiting Deposit → In Progress → Review → Complete]

Payments
  Deposit:  $X,XXX  [Stripe Price ID: ___]  Status: Paid / Unpaid
  Final:    $X,XXX  [Stripe Price ID: ___]  Status: Paid / Unpaid

Milestones
  [✓] Research & wireframes        [date]
  [✓] Proposal delivered           [date]
  [ ] Deposit received             [date]
  [ ] Design direction             [date]
  [ ] Design + development         [date]
  [ ] Review & approval            [date]
  [ ] Final payment                [date]
  [ ] Launch                       [date]

Deliverables
  [+ Add deliverable]
  - Proposal PDF         /files/lgm-ppp-proposal.pdf     [Edit] [Remove]
  - LGM Wireframe        /files/lgm-wireframe.pdf        [Edit] [Remove]
  - LGM Preview          https://lgm-preview.vercel.app  [Edit] [Remove]

Notes (visible to client)
  [+ Add note]
  - Mar 20, 2026: "Proposal delivered..."               [Edit] [Remove]

Proposal Content
  [Edit proposal markdown / structured content]
  [Preview →]
```

### New Project Creator
```
[+ New Project]

Client name:     ___
Client email:    ___
Company:         ___
Project title:   ___
Slug:            ___ (auto-generated from title, editable)
Deposit amount:  $___
Final amount:    $___

Milestones:
  [+ Add milestone]
  Default set: Research → Proposal → Deposit → Design → Development → Review → Final → Launch

[Create Project]
```

**On submit, the app automatically:**
1. Creates a Stripe Product: `"{Project Title} — Deposit"` with the deposit amount as a one-time Price
2. Creates a Stripe Product: `"{Project Title} — Final Payment"` with the final amount as a one-time Price
3. Stores both Stripe Price IDs in the Supabase project row
4. Creates the client record in Supabase (or links to existing if email matches)
5. Creates the default milestone rows
6. Sets project status to `proposal`

No manual Stripe dashboard work. No copy-pasting price IDs. You fill in the form, hit create, and the project is ready to send to the client.

---

## Data Model

### Project
```
{
  id: string
  slug: string              // URL path
  title: string             // "LGM + PPP Website Rebuild"
  client: {
    name: string
    email: string
    company: string
  }
  status: enum              // proposal | awaiting_deposit | in_progress | review | complete
  payments: {
    deposit: {
      amount: number        // cents
      stripe_price_id: string
      stripe_payment_id: string | null
      paid_at: datetime | null
    }
    final: {
      amount: number
      stripe_price_id: string
      stripe_payment_id: string | null
      paid_at: datetime | null
    }
  }
  milestones: [
    {
      title: string
      completed: boolean
      completed_at: datetime | null
      order: number
    }
  ]
  deliverables: [
    {
      title: string
      type: "file" | "link"
      url: string
      visible: boolean      // can hide until ready
    }
  ]
  notes: [
    {
      content: string
      created_at: datetime
      author: string        // "Dylan"
    }
  ]
  proposal: {
    content: string         // markdown or reference to proposal component
    pdf_url: string | null  // generated PDF download
  }
  created_at: datetime
  updated_at: datetime
}
```

### Storage: Supabase (Pro)

Using Dylan's existing Supabase Pro account. This gives us a proper Postgres database, built-in auth, row-level security, real-time subscriptions, and file storage — all in one place. No stitching together services.

#### Database Tables

```sql
-- Clients (one per email, can have multiple projects)
create table clients (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  company text,
  created_at timestamptz default now()
);

-- Projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,            -- URL path: "lgm-ppp"
  title text not null,                  -- "LGM + PPP Website Rebuild"
  client_id uuid references clients(id),
  status text default 'proposal',       -- proposal | awaiting_deposit | in_progress | review | complete
  deposit_amount integer,               -- cents
  deposit_stripe_price_id text,
  deposit_stripe_payment_id text,
  deposit_paid_at timestamptz,
  final_amount integer,
  final_stripe_price_id text,
  final_stripe_payment_id text,
  final_paid_at timestamptz,
  proposal_pdf_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Milestones
create table milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  completed boolean default false,
  completed_at timestamptz,
  sort_order integer default 0
);

-- Deliverables
create table deliverables (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  type text default 'link',             -- "file" | "link"
  url text not null,
  visible boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Notes (client-visible messages from Dylan)
create table notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  content text not null,
  author text default 'Dylan',
  created_at timestamptz default now()
);
```

#### Row-Level Security (RLS)

```sql
-- Clients can only see their own projects
alter table projects enable row level security;

create policy "Clients see own projects"
  on projects for select
  using (client_id = (
    select id from clients where email = auth.email()
  ));

-- Admin (Dylan) sees everything
create policy "Admin sees all projects"
  on projects for all
  using (auth.email() = 'dylan@mondayandpartners.com');

-- Same pattern for milestones, deliverables, notes
-- (scoped through project_id → client_id chain)
```

Clients can only read their own data. Dylan can read and write everything. Supabase enforces this at the database level — no middleware needed.

#### File Storage

Supabase Storage handles:
- Proposal PDFs
- Deliverable files (wireframes, design assets, etc.)
- Client-uploaded assets (future: brand files, logos, ad uploads)

Bucket: `project-files` with path structure: `/{project-slug}/{filename}`

#### Real-Time (optional but nice)

Supabase real-time subscriptions mean the client's dashboard can update live when you mark a milestone complete or add a deliverable. Not critical for Phase 1, but it's free and built in — worth enabling for the "that's cool" factor when a client is watching their project page and a milestone checks itself off.

---

## Auth System: Supabase Auth

Supabase has magic link auth built in. No custom JWT handling, no session management, no token signing. It just works.

### Client Auth: Magic Links
- Client enters email on login page
- Supabase sends a one-time login link (customizable email template with M+P branding)
- Client clicks link → Supabase sets a session → redirect to project page
- Session persists (configurable expiry — 30 days is a good default)
- No passwords. No password reset. No "forgot password." Just email.
- Supabase handles all token refresh, session validation, and PKCE flow automatically

### Admin Auth
- Same magic link flow, same system
- Your email (`dylan@mondayandpartners.com` or whatever you use) is the admin identifier
- RLS policies handle permissions — the auth system doesn't need to know about roles
- Admin routes check `auth.email()` against your email in middleware

### First Visit Flow
```
1. Client receives link: projects.mondayandpartners.com/lgm-ppp
2. Auth gate: "Enter your email to access your project"
3. Supabase sends magic link to their email
4. Client clicks → logged in → project loads
5. Return visits: session cookie is valid → straight to project
```

### Supabase Auth Config
- Enable "Magic Link" provider in Supabase dashboard
- Customize email template (M+P logo, dark background, clean CTA)
- Set redirect URL to `projects.mondayandpartners.com`
- Add `projects.mondayandpartners.com` to allowed redirect URLs
- Set session expiry to 30 days

---

## Stripe Integration

### Setup
- Stripe account connected to Chase business checking (done)
- Stripe API keys in .env (done)
- Stripe products/prices are NOT created manually in the dashboard
- The app creates Stripe products and prices automatically via the API when a new project is created in the admin dashboard
- For the first project (LGM/PPP), the seed script creates these automatically

### Payment Flow
1. Client clicks "Pay Deposit" → API looks up the project's `deposit_stripe_price_id` from Supabase → creates a Stripe Checkout Session with that price
2. Client is redirected to Stripe's hosted checkout page
3. Client pays → Stripe redirects back to your site with success/cancel status
4. Stripe webhook fires → API updates the project record in Supabase (paid_at, payment_id, status)
5. Page reflects new state on next load (or via real-time subscription)
6. SendGrid sends confirmation email automatically

### Webhook Setup
- The Stripe webhook endpoint (`/api/stripe/webhook`) is created by the app code
- The webhook URL is registered with Stripe **after first deploy** — this cannot be done before the site is live
- Claude Code should include a post-deploy setup note or script for this step
- Alternatively: use Stripe CLI during development to forward webhooks to localhost

### Webhook Events to Handle
- `checkout.session.completed` → look up project by session metadata → mark correct payment (deposit or final) as received → update project status → trigger SendGrid confirmation email
- `payment_intent.succeeded` → backup confirmation
- Include `project_id` and `payment_type` (deposit/final) in Checkout Session metadata so the webhook handler knows which project and which payment to update

### Receipts
Stripe automatically generates receipts. You can link to them from the dashboard, or generate your own branded PDF receipt.

---

## PDF Generation

The client should be able to download the proposal as a polished PDF.

**Approach: Dynamic generation with print layout**
- Create a `/proposals/[slug]/print` route that renders the proposal content in a clean, static, print-optimized layout (no scroll animations, no dark background effects — clean typography on white or dark, proper page breaks)
- Use `@react-pdf/renderer` or Puppeteer (via API route) to generate the PDF on demand
- Client clicks "Download PDF" → server renders the print layout → returns the file
- PDF regenerates automatically if proposal content changes — no manual step
- Store a cached version in Supabase Storage after first generation; regenerate if content is updated

**PDF content should include:**
- Proposal title, client name, date
- All proposal sections (reformatted for print — no animations, no scroll metaphors)
- Scope summary
- Pricing and payment terms
- Timeline
- Contact info

**Fallback:** If dynamic generation proves too complex for Phase 1, pre-generate a PDF from the proposal markdown and upload to Supabase Storage as a deliverable. But the system should be designed to replace this with dynamic generation in Phase 2.

---

## Notification System

### Client Notifications
Triggered by database changes (Supabase triggers or application logic):

- **Magic link email** — handled natively by Supabase Auth (custom branded template)
- **Deposit received** — Stripe webhook → update DB → trigger email via SendGrid: "Thanks — here's your receipt and what happens next"
- **Milestone update** — when you mark a milestone complete in admin, fire email: "Design concepts are ready for your review"
- **Review ready** — when you add preview links: "Your sites are ready to preview"
- **Final payment received** — Stripe webhook → email: "Launching your sites within 24 hours"
- **Project complete** — "Your sites are live. Here are the links."

Each email links back to the portal: `projects.mondayandpartners.com/lgm-ppp`

Implementation: Supabase database webhooks (or Edge Functions) trigger SendGrid emails on row updates. Alternative: Next.js API routes handle the logic on Stripe webhooks and admin actions.

### Real-Time Dashboard Updates
Because Supabase Realtime is available on Pro, the client's project dashboard can subscribe to changes on their project row. When you mark a milestone complete in the admin, the client's browser updates live — no refresh needed. This is a subtle touch but it signals a level of craft that clients notice.

### Your Notifications
- **Payment received** — Stripe's native email + a custom notification if you want
- Keep it minimal. The admin dashboard is your source of truth.

---

## Design System

### Inherits from Monday + Partners brand
- Dark mode default (#0a0a0a base)
- Clean, confident typography (same family as the proposal)
- Warm accent (amber/gold for CTAs, status indicators, highlights)
- Minimal chrome — no sidebars, no excessive nav. Content-forward.

### Portal-Specific Elements
- Status badges: `Proposal` `Awaiting Deposit` `In Progress` `Review` `Complete`
- Timeline component: vertical, with checkmarks and connecting lines
- Payment cards: amount, status, CTA or receipt link
- Deliverable rows: icon + title + action (download/view)
- Note cards: date, content, author

### Responsive
- The portal dashboard should be fully mobile-friendly
- The proposal scroll experience is already mobile-first
- Payment flow (Stripe Checkout) is mobile-optimized by default

---

## Future-Proofing

### Scaling to Multiple Projects
The system is designed for N projects from day one. Supabase handles the data. Creating a new project is:
1. Fill out the new project form in admin (client info, title, amounts)
2. App automatically creates the Stripe products/prices, the client record, and the milestone rows
3. Send the client the link
4. Supabase RLS ensures they only see their own project

No manual Stripe dashboard work. No database seeding. No developer involvement.

### Proposal Templates
Over time, you'll develop reusable proposal structures. The LGM/PPP proposal is fully custom, but future proposals could follow a templated pattern:
- Swap in project-specific content (client name, scope, pricing)
- Keep the scroll structure, stats animation, and payment integration
- Customize the design beats per project
- Proposal content stored in Supabase (markdown field or structured JSON) — editable from admin

### Optional Add-Ons (future)
- **Client feedback/comments** on deliverables — Supabase table for threaded comments, real-time updates
- **File sharing** — client uploads assets to Supabase Storage (brand files, logos, ad source files). RLS ensures only they and you can access.
- **Contract / e-signature** — simple "I accept" checkbox with timestamp stored in Supabase (legally sufficient for most freelance agreements). Or DocuSign integration for higher-stakes contracts.
- **Recurring invoicing** for retainer clients — Stripe subscriptions, payment status synced to Supabase
- **Multi-user access** per project — invite a client's partner/co-owner via email. Supabase auth handles multiple users per project with a junction table.
- **Activity log** — automatic audit trail of all project events (milestone completed, payment received, file uploaded) stored in Supabase, viewable by client and admin. Comes nearly free with database triggers.

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router, server components)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion (proposal scroll experience)
- **Auth:** Supabase Auth (magic links, session management)
- **Database:** Supabase Postgres (Pro — existing account)
- **File Storage:** Supabase Storage (PDFs, deliverables, assets)
- **Real-Time:** Supabase Realtime (live dashboard updates)
- **Payments:** Stripe Checkout (hosted)
- **Email:** Supabase Auth handles magic links natively. Transactional notifications via Resend or SendGrid (you have SendGrid from Studio Zero).
- **PDF:** Pre-generated (Phase 1) → Puppeteer dynamic (Phase 2)
- **Hosting:** Vercel Pro (existing account — projects.mondayandpartners.com)
- **Domain:** CNAME subdomain of mondayandpartners.com → Vercel

---

## Build Phases

### Phase 1: The LGM/PPP Proposal (ship first)
- Auth gate (magic link)
- Proposal scroll experience (the cinematic pitch)
- Stripe Checkout integration (deposit + final)
- Basic project dashboard (status, payments, deliverables, notes)
- PDF download
- Confirmation emails (deposit + final payment)
- Deploy to projects.mondayandpartners.com

### Phase 2: Admin + Polish
- Admin dashboard (create/edit projects, manage milestones, add deliverables)
- Notification system (milestone updates, review ready)
- Multi-project support (project list for returning clients)

### Phase 3: Scale
- Proposal templates (reusable scroll structures)
- Dynamic PDF generation
- Client file upload
- Feedback/annotation on deliverables
- Retainer billing (Stripe subscriptions)

---

## Accounts & Services Inventory

### Confirmed Available
| Service | Status | Notes |
|---|---|---|
| **Vercel Pro** | ✓ Active | Hosts Studio Zero, dylandibona.com, BrandVoice. New project for portal. |
| **Supabase Pro** | ✓ Active | New project created: `m-plus-p-portal`. Keys in .env. |
| **SendGrid** | ✓ Active | Domain verification for `mondayandpartners.com` in progress. |
| **Stripe** | ✓ Active (live mode) | Connected to Chase business checking. API keys in .env. Products/prices created automatically by the app — no manual dashboard work. |
| **GitHub** | ✓ Assumed | For repo + Vercel deploy pipeline. |
| **Cloudflare** | ✓ Active | DNS for mondayandpartners.com. CNAME for `projects` subdomain added, proxy OFF. |

### Needs Setup or Configuration
| Item | Action | Who |
|---|---|---|
| **Stripe webhook** | Register webhook endpoint URL **after first deploy** — cannot be done before the site is live. URL: `https://projects.mondayandpartners.com/api/stripe/webhook`. Events: `checkout.session.completed`, `payment_intent.succeeded`. Copy signing secret to .env. | Dylan (post-deploy) |
| **SendGrid domain verification** | Add DNS records for `mondayandpartners.com` in Cloudflare. Check SendGrid for CNAME/TXT records needed. | Dylan |
| **Supabase auth config** | Enable magic links, set redirect URLs, customize email template. | Claude Code (automated in build) |
| **Supabase schema** | Run SQL for tables, RLS policies. | Claude Code (automated in build) |
| **Seed first project** | Insert LGM/PPP project record with client info, amounts, milestones. Create Stripe products/prices via API. | Claude Code (seed script) |

### Nice to Have (not required for launch)
| Service | Purpose | Status |
|---|---|---|
| **Plausible / Fathom** | Privacy-respecting analytics for the portal | Optional — can add post-launch |
| **Cal.com or Calendly** | "Schedule a call" links in proposals | Free tier works. Drop a link into the proposal. |
| **Resend** | Alternative to SendGrid for transactional email. Cleaner DX, free tier is generous. | Optional — SendGrid works fine. |

---

## What To Provide Before Build

### Already done:
- [x] **Project fee** — $10,000 total ($5,000 deposit / $5,000 final)
- [x] **Stripe** — live mode, Chase connected, API keys in .env
- [x] **Supabase** — new project created, keys in .env
- [x] **DNS** — CNAME for `projects.mondayandpartners.com` added in Cloudflare, proxy off
- [x] **.env.local** — complete with all account-level keys

### Still needed:
- [ ] **Design references** (sites, screenshots, pages — in project folder per Dylan)
- [ ] **Monday + Partners logo** (SVG — in project folder per Dylan)
- [ ] **Your admin email** — confirm which email for Supabase admin auth
- [ ] **Client's email** — for the LGM/PPP project seed record
- [ ] **SendGrid domain verification** — add the DNS records for `mondayandpartners.com` in Cloudflare
- [ ] **Stripe webhook** — register endpoint **after first deploy** (see Needs Setup table above)
- [ ] **Cloudflare proxy** — confirm proxy is OFF (grey cloud) for the `projects` CNAME record

### Claude Code handles:
- Supabase schema setup (tables, RLS policies, auth config)
- Stripe product/price creation via API (seed script for first project, admin UI for future projects)
- Vercel project setup and domain binding
- SendGrid email templates (branded notifications)
- Seeding the first project record (LGM/PPP)
- Everything else
