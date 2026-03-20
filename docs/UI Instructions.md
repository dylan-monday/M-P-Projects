---
  ## UI Project Kickoff

  **Project:** MONDAY + PARTNERS PROJECTS PORTAL
  **Type:** Project Proposals and Milestone Payments
  **Industry/Domain:** Communications, design, advertising

  ### Design Direction

  **Vibe/Mood:** Sleek, thin lines, delightful interactions (hoverstates, click and drag, feedback sounds)
  **Reference Sites:** none
  **Brand Colors:** a brand color palette built around #041c45, white, grey, and a bold accent color
  **Existing Assets:** see ./brand assets

  ### Technical Stack

  **Framework:** see ./background/M+P_client_portal_spec.md + ./background/available_code_help
  **Styling:** see ./background/M+P_client_portal_spec.md
  **Animation Needs:** [subtle micro-interactions / minimal / subtle / feedback sounds like buddhist bells]
  **Design Support:** see ./background/available_code_help.md

  ### Scope

  **Pages/Views:**
  - `/` — Login gate (magic link auth)
  - `/[project-slug]` — Client project view (proposal + dashboard, two modes)
  - `/[project-slug]/print` — Print-optimized proposal layout (for PDF generation)
  - `/admin` — Admin project list
  - `/admin/[project-slug]` — Admin project editor (milestones, deliverables, notes, status)
  - `/admin/new` — New project creator

  **Priority Components:**
  - Proposal section nav (sticky, allows jumping between proposal sections)
  - Proposal scroll sections (hero, stats with animated counters, feature beats, cost comparison, CTA)
  - Accept & Pay button (Stripe Checkout trigger)
  - Project dashboard (milestone timeline, payment cards, deliverable rows, note cards)
  - Proposal ↔ Dashboard view toggle
  - Auth gate (email input, magic link flow)
  - Admin project editor (forms, toggles, deliverable upload)
  - PDF download button + branded print layout
  - Status badges (Proposal / Awaiting Deposit / In Progress / Review / Complete)

  **Device Priority:** For clients: mobile and desktop. For admin: desktop first.

  ---

  ### Instructions

  1. **Generate a design system** using UI UX Pro Max based on the project type and direction above
  2. **Pull relevant shadcn components** for the priority components listed
  3. **Search 21st.dev for inspiration** on the key UI patterns needed
  4. **Propose a cohesive visual approach** including:
     - Color palette with semantic tokens
     - Typography pairing
     - Spacing/layout system
     - Component styling approach
     - Animation strategy (using GSAP patterns where appropriate)
  5. **Create a todo list** breaking down the implementation phases
  6. Before building, confirm the design direction with me