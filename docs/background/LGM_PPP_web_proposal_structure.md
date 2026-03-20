# Web Proposal — Page Structure & Interaction Design
## mondayandpartners.com/proposals/lgm-ppp

_Single-page scroll experience · Dark mode · Cinematic_

---

## Overview

This is a long-scroll, single-page proposal designed to do three things: pitch the project, demonstrate the quality of work, and close with integrated payment. The page itself is the first deliverable — a proof of concept for the cinematic, data-driven design language the client's sites will have.

**URL:** `mondayandpartners.com/proposals/lgm-ppp`
**Access:** Unlisted (no nav link, no indexing). Shared via direct link.
**Payment:** Stripe Checkout (hosted). Two payment events: deposit + final.
**State:** Page tracks payment status. Pre-deposit: full proposal with deposit CTA. Post-deposit: confirmation state + timeline. Final payment: triggered manually when work is ready for delivery.

---

## Global Design Notes

- Dark background throughout (#0a0a0a to #111111 range)
- Warm accent color (amber/gold — carries the cinema/projector light motif)
- Large, confident typography — display weight for headlines, clean sans for body
- Scroll-triggered animations: number count-ups, fade-ins, subtle parallax
- Minimal imagery — let the typography and data do the work, punctuated by atmospheric cinema textures (bokeh, light beams, grain)
- Mobile-first. This will likely be viewed on a phone first.
- Total page weight target: under 500KB before fonts

---

## Section-by-Section Structure

### 0. Preloader / Entry (optional)
A brief fade-in from black. Sets the tone. Could be as simple as the Monday + Partners logo mark fading in, then the page content revealing beneath it. 1–2 seconds max. Skip if it feels indulgent.

---

### 1. Hero
**Scroll position:** 0–100vh

```
[Monday + Partners logo — small, top-left, subtle]

"Your websites should be
your best salespeople."

A proposal for Looking Glass Media
& Pecan Pie Productions

Prepared March 2026

[↓ scroll indicator]
```

**Design:** Full viewport. Near-black. Headline is the entire visual. No image. Maybe a very subtle grain texture or a slow-moving ambient light wash (CSS gradient animation, not video). The restraint here is the statement — this is confident, not busy.

**Animation:** Headline fades/slides in on load. Scroll indicator pulses gently.

---

### 2. The Problem
**Scroll position:** ~100–250vh

This section establishes urgency. It should feel like a calm but direct diagnosis.

**Beat 2a — The setup:**
```
"Cinema advertising has the strongest
attention metrics in all of advertising."
```

**Beat 2b — The stats (animated):**
Three stats, each getting its own moment as the user scrolls. Numbers count up.

```
97%    of moviegoers watch cinema ads
4–7×   more attention than TV or digital
76%    recall after a single viewing
```

**Beat 2c — The turn:**
```
"Neither of your websites
communicates any of this."
```

This should land with weight. A pause. Maybe a subtle shift in background tone (slightly warmer or cooler) to mark the transition.

**Beat 2d — The specifics:**
```
lookingglassmedia.com
→ 4 pages of thin content
→ No data. No social proof. No creative examples.
→ WordPress + GoDaddy. Paid SSL. Maintenance overhead.
→ The site doesn't sell. It barely introduces.

pecanpieproductions.com
→ Better — but still reads like a template
→ Thousands of ads produced. Zero shown.
→ Webflow lock-in. $290–$1,000+/year in platform costs.
→ Your strongest proof point is invisible.
```

**Design:** Each site assessment appears as the user scrolls — clean, left-aligned, stacked. No images of the current sites (don't embarrass the client). Just the honest read.

---

### 3. The Vision
**Scroll position:** ~250–350vh

The pivot. From problem to possibility.

```
"Here's what I want to build."
```

**Beat 3a — The concept statement:**
```
Two new sites. One shared engine.
Built to sell.

Dark. Cinematic. Data-driven.
Fast. Beautiful. Impossible to ignore.

Websites that feel like the medium you work in.
```

**Design:** This is the emotional peak of the first half. Give it room to breathe. Large type. Maybe the first appearance of the amber/gold accent — a warm glow that suggests a projector turning on.

---

### 4. What LGM Gets
**Scroll position:** ~350–600vh

Each feature gets its own scroll beat. Not a list — a sequence of moments.

**Beat 4a — Stats Engine**
```
"An interactive stats page that makes
the case for cinema in 30 seconds."

Animated. Shareable. Built for your sales team
to use every single day.
```

**Beat 4b — In-Theater Lead Capture**
```
"A QR code in your own preshow ad.
Scan. Submit. Watch the movie.
Stats kit in their inbox an hour later."

It's not just a lead capture tool.
It's a live proof of concept.
```

**Beat 4c — Text-to-Info**
```
"Text BIGSCREEN to 55555."

They text during the preshow.
Enjoy the movie.
Everything they need is in their pocket
by the time the credits roll.
```

**Beat 4d — Smart Ad Upload**
```
"Already have an ad? Upload it.
Don't have one? We'll show you
exactly what we'll build."

Plain-English specs. Drag-and-drop.
No back-and-forth.
```

**Beat 4e — Automated Follow-Up**
```
"Every form, every scan, every text
triggers a smart email sequence.

The right stat at the right moment.
A testimonial that hits close to their industry.
Built once. Runs forever."
```

**Beat 4f — Stats Kit PDF**
```
"A designed leave-behind your team
can send, share, and forward.

Not a brochure. A weapon."
```

**Design:** Each beat is a card or full-viewport section. Staggered left/right or centered. Short, punchy copy. No screenshots or mockups yet — the words paint the picture. If you want to hint at the visual direction, a subtle background texture shift per beat (darker, lighter, warmer) creates rhythm.

---

### 5. What PPP Gets
**Scroll position:** ~600–800vh

Same beat-by-beat structure.

**Beat 5a — Creative Showcase**
```
"PPP has produced thousands of ads.
The new site shows them off.

Organized by industry.
Cinematic viewing experience.
This page alone is worth the project."
```

**Beat 5b — Dual-Audience Intelligence**
```
"Advertisers and theater operators
see completely different sites.

Same URL. Two perfectly tuned
sales experiences."
```

**Beat 5c — Theater Revenue Model**
```
"Theater operators will finally understand
exactly how the partnership works —
and why they should say yes."
```

**Beat 5d — Social Proof Done Right**
```
"Penn Cinema. 18 years.
Lucas Cinemas. 'Big-agency capability,
small-business heart.'
Spotlight Theaters. 10+ years.

These testimonials deserve more
than a Webflow carousel."
```

---

### 6. The Shared Ecosystem
**Scroll position:** ~800–950vh

**Beat 6a — Shared Content Library**
```
"One testimonial library.
One logo library.
One stats engine.

Update once.
Both sites update instantly."
```

**Beat 6b — Simple Admin Dashboard**
```
"Add a testimonial. Upload a logo.
Change a stat. Publish a new ad.

A clean, simple tool built for you —
not a bloated CMS built for everyone."
```

**Beat 6c — Live Industry Data (Phase 2)**
```
"Box office numbers. Upcoming releases.
Industry headlines.

Your sites stay current
without anyone writing a blog post."
```

---

### 7. The Numbers
**Scroll position:** ~950–1100vh

**Beat 7a — What you're paying now**
```
Current annual platform costs

GoDaddy + WordPress (LGM)     $150–$440
Webflow + Workspace (PPP)      $290–$1,000
────────────────────────────
Total                          $440–$1,440+/year
```

**Beat 7b — What you'd pay after**
```
New annual platform costs

Hosting (both sites)            $0–$240
SSL                             $0
CMS                             $0
────────────────────────────
Total                          $30–$378/year
```

**Beat 7c — The real ROI**
```
"But the real return isn't in hosting savings."

One additional client per quarter =
the entire project paid for in month one.

One theater operator convinced by the
creative showcase = years of recurring revenue.

The QR flow runs in your existing preshow
at zero media cost.
```

**Design:** The cost comparison should be stark. Consider a two-column layout or a before/after toggle. The numbers should animate (count up or reveal). The ROI statement gets its own moment — larger type, more space.

---

### 8. Agency Comparison
**Scroll position:** ~1100–1200vh

```
"What this would cost at an agency."

Strategy & wireframes          $5,000–$10,000
Design (2 sites)               $8,000–$15,000
Development                    $15,000–$30,000
Admin dashboard                $3,000–$8,000
QR, SMS, email automation      $3,000–$6,000
Stats Kit PDF                  $1,500–$3,000
QA & launch                    $2,000–$4,000
────────────────────────────
Typical total                  $37,500–$76,000
```

Then:

```
"I'm not proposing anything
close to those numbers."
```

**Design:** The agency cost table should feel like a receipt — clinical, factual. The "I'm not proposing anything close" line should land with contrast: warmer, larger, maybe the first time the accent color is used on text.

---

### 9. The Offer
**Scroll position:** ~1200–1400vh

This is the close. The section where it goes from pitch to proposal.

**Beat 9a — What's included**
```
"Everything in this proposal. Both sites.
Shared ecosystem. Admin dashboard.
QR capture. SMS flow. Email automation.
Stats Kit. Ad upload. Creative showcase.
30 days of post-launch support."
```

**Beat 9b — The price**
```
[PROJECT FEE — placeholder until you provide the number]

50% deposit to begin
50% on completion and approval
```

**Beat 9c — The AI angle (brief)**
```
"I'm building this with AI-assisted tools.
That's why this scope is possible at this price.

The strategy is mine. The design is mine.
The tools make it faster.
You get the benefit."
```

**Beat 9d — Timeline**
```
Research & wireframes     ✓ Complete
Design direction          1 week
Design + development      3–4 weeks
QA + launch               1 week
────────────────────────
~5–6 weeks from go
```

---

### 10. Accept & Pay
**Scroll position:** ~1400–1500vh (final section)

```
"Ready to start?"
```

**Terms summary (collapsible or inline):**
- Scope as described above
- 50% deposit due now / 50% due on completion approval
- Timeline: ~5–6 weeks from deposit
- 2 rounds of design revision included
- 30 days post-launch support
- Client provides: content assets, brand files, testimonial approvals, ad samples for showcase
- Hosting migration and domain DNS configuration included

**CTA button:**
```
[Accept & Pay Deposit — $X,XXX]
```

Clicking this button triggers Stripe Checkout (hosted). Client enters payment info on Stripe's page. On success, they're redirected back to a confirmation state of this same page.

**Below the CTA:**
```
Questions? Call Dylan at [phone] or email [email].
```

---

### 11. Post-Payment Confirmation State

After the deposit is paid, the page transforms. The pitch sections remain (they've already read them), but Section 10 changes to:

```
"We're in business."

Deposit received. Here's what happens next:

1. I'll send over a design direction questionnaire
   and ask for any references you love. (This week.)

2. You'll see initial design concepts
   within 7–10 days.

3. We'll refine, build, and launch
   within 5–6 weeks.

I'll be in touch within 24 hours
with next steps.

— Dylan
```

The payment button is replaced with a receipt summary and a "Download Receipt" link (Stripe provides this).

---

### 12. Final Payment State (Phase 2 of the page)

When the sites are ready for review, you send the client back to this same URL. The page now shows an additional section at the bottom:

```
"The sites are ready."

[Link to LGM preview]
[Link to PPP preview]

Review both sites. When you're happy,
approve and pay the final balance to launch.

[Approve & Pay Final Balance — $X,XXX]
```

This triggers the second Stripe Checkout. On success:

```
"Launching now."

Both sites will be live within 24 hours.
I'll send confirmation when DNS propagates.

Thanks for trusting me with this.
Let's make some noise.

— Dylan
```

---

## Technical Notes

### Stripe Integration
- Use Stripe Checkout (hosted) — no custom payment form needed
- Create two Stripe Products: "LGM/PPP Deposit" and "LGM/PPP Final Payment"
- Each product has a single Price (fixed amount)
- On button click: call your API route that creates a Checkout Session → redirect to Stripe
- On success: Stripe redirects back to your page with a session ID
- Webhook (optional but recommended): Stripe sends a payment confirmation event to your server, which can trigger a confirmation email and update the page state
- Page state can be managed with a simple flag (localStorage for prototype, or a server-side check against Stripe's API for production)

### Page State Management
Three states:
1. **Proposal** (default) — full pitch, deposit CTA visible
2. **Deposit paid** — confirmation section replaces deposit CTA
3. **Final payment** — review/approval section appears, final CTA visible

Simplest approach: check Stripe payment status via API on page load. If deposit paid, show state 2. If final paid, show state 3. No database needed — Stripe is the source of truth.

### Hosting
- Deploy to Vercel under the mondayandpartners.com domain
- Route: `/proposals/lgm-ppp`
- No indexing (add `<meta name="robots" content="noindex">`)
- Consider password protection or a simple access token in the URL for privacy (`/proposals/lgm-ppp?token=xxxxx`)

### Email Automation
- On deposit payment: auto-send confirmation email with receipt, timeline, and "what I need from you" checklist
- On final payment: auto-send launch confirmation
- Use Resend or SendGrid (you have SendGrid experience from Studio Zero)

---

## Content Placeholders to Fill

Before building, I'll need:
- [ ] **Project fee** (total amount — I'll split into deposit/final)
- [ ] **Design references** (sites, pages, or screenshots you want to riff on)
- [ ] **Your phone number and email** for the contact line at the bottom
- [ ] **Monday + Partners logo** (SVG preferred) for the header
- [ ] **Stripe publishable key** (once account is set up)
