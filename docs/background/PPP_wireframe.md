# Pecan Pie Productions — Site Wireframe & Content Plan

_Next.js multi-page static site · March 2026_

---

## Current Site Assessment

PPP's Webflow site is already better than LGM's — it has testimonials (strong ones), a dual-audience structure (Advertisers + Theatres), real stats (100+ theaters, 28 states, 95% renewal, 2,000+ advertisers, since 2004), and actual photography. But it still reads like a Webflow template: safe, clean, generic. It doesn't feel like a company that produces cinema-quality content.

### What's working:
- Dual audience paths (Advertisers / Theatres) — keep this
- Strong testimonials from real theater operators and advertisers
- "Since 2004" heritage positioning
- Real numbers (100+ theaters, 28 states, 95% renewal rate)
- Clear 4-step process

### What's missing or weak:
- No video or motion — ironic for a company that *makes video ads*
- No creative showcase (no sample ads, no reel)
- No cinema advertising data/stats (same gap as LGM)
- Generic Webflow grid energy — doesn't feel premium or cinematic
- Theatres page doesn't show what the preshow actually looks like
- No pricing signals whatsoever
- Contact form has a broken topic dropdown ("I'm like to drive revenue")
- No differentiation from national networks (NCM, Screenvision) — why PPP?
- "Pecan Pie" is a memorable name but the brand doesn't lean into personality

---

## Site Architecture

```
pecanpieproductions.com/
├── / ........................ Homepage (dual-audience hero)
├── /advertisers ............. For Local Businesses
├── /theatres ................ For Theater Operators
├── /work .................... Creative Showcase / Sample Reel
├── /about ................... Story, Team, Values
├── /contact ................. Unified Contact (with audience toggle)
└── /stats ................... Shared stats page (linked from LGM too)
```

### Navigation
- **Left:** PPP Logo
- **Right:** Advertisers · Theatres · Our Work · About · Contact (button)
- Mobile: Hamburger → full-screen overlay

---

## Page 1: Homepage `/`

### Section 1.1 — Hero
**Layout:** Full-viewport. Background: dark, cinematic — ideally a slow pan across a theater audience or a projector beam cutting through darkness. If video isn't available, a high-quality still with ambient light animation (CSS/canvas).

```
Headline:    "Local Advertising. Nationally."
             [keep this — it's their best line]
Subhead:     "We create full preshow experiences for independent
              theaters — connecting local businesses with captive
              audiences in 100+ theaters across 28 states."
CTAs:        [I'm an Advertiser]   [I'm a Theater]
```

**Design notes:** The dual CTA is critical — this site serves two distinct audiences. Make both paths equally prominent. On click, each smoothly transitions to a brief audience-specific pitch before linking to the full page.

### Section 1.2 — Stat Bar
**Layout:** Horizontal strip, 4 numbers, count-up animation on scroll.

| Stat | Label |
|---|---|
| 100+ | theaters nationwide |
| 28 | states served |
| 2,000+ | local businesses advertised |
| 95% | advertiser renewal rate |

### Section 1.3 — Dual Audience Cards
**Layout:** Two large cards side by side (or stacked on mobile). Each with a background image, headline, 3 bullet points, and a CTA.

**Advertiser Card:**
```
"Put Your Business on the Big Screen"
- Captive, distraction-free audiences
- We create your ad or optimize yours
- Affordable programs for any local business
[Learn More →]
```

**Theatre Card:**
```
"A Turnkey Preshow That Drives Revenue"
- Automated scheduling & delivery
- Local and national ad sales handled for you
- In-house creative, same-day turnaround
[Learn More →]
```

### Section 1.4 — Creative Showcase Teaser
**Layout:** A horizontal scroll or grid of 3–4 video thumbnails or animated stills from actual PPP ads. Clicking opens a lightbox or links to /work.

```
"See Our Work"
"We've produced thousands of cinema-ready ads.
Here are a few favorites."
```

**Design notes:** This is the single biggest improvement opportunity. PPP *makes ads for a living* but shows zero examples. Even 3–4 representative stills would transform the homepage.

### Section 1.5 — Testimonials
**Layout:** Carousel or stacked cards. Mix of theater operators and advertisers. Include name, title, company, logo.

Pull the best from what they already have — the Penn Cinema "18 years" quote and the Lucas Cinemas "big-agency capability, small-business heart" are both strong.

### Section 1.6 — CTA
```
"Serving independent theaters since 2004."
[Get Started]
```

---

## Page 2: For Advertisers `/advertisers`

### Section 2.1 — Hero
```
Headline:    "Your Business. 50 Feet Tall."
Subhead:     "Cinema advertising puts your brand in front of a
              captive, local audience — no skip button, no scrolling,
              no ad blockers."
```

### Section 2.2 — Why Cinema (Data-Driven)
Link to or embed key stats from the shared research:
- 97% watch rate
- 4–7× attention vs. digital
- 76% recall after one viewing

**Design notes:** Use the same visual language as LGM /stats but keep it concise — 3 stats with sources, not a full scroll page.

### Section 2.3 — How It Works (4 Steps)
Keep the existing 4-step structure but tighten copy and improve visuals:

1. **Pick Your Theater** — enter your ZIP, find nearby screens
2. **Talk to Our Team** — quick call, custom program recommendation
3. **Create Your Ad** — send yours or let us produce one
4. **We Handle the Rest** — automated playback, every show, every screen

### Section 2.4 — Advertiser Testimonials
Dedicated section with the advertiser-side quotes (Lynn, Cathay, Mark, Julie, etc.)

### Section 2.5 — Pricing Signal
```
"Programs start at a few hundred dollars a week.
Every program includes creative support."
[Get a Custom Quote →]
```

---

## Page 3: For Theaters `/theatres`

### Section 3.1 — Hero
```
Headline:    "Earn More. Zero Effort."
Subhead:     "A fully automated preshow that drives revenue
              and keeps your team hands-off."
```

### Section 3.2 — What You Get
6 benefit blocks (keep existing but tighten):
- Automated scheduling & delivery
- Full in-house creative (same-day turnaround)
- Custom-branded preshow
- Local + national ad sales
- Ad sales, creative, and production — start to finish
- Fast, responsive support

### Section 3.3 — Theater Testimonials
The theater operator quotes are excellent — Penn Cinema (18 years), Spotlight Theaters (10 years), Lucas Cinemas, RJ Cinema, Coral Cliffs, Camelot/Forest City.

### Section 3.4 — Revenue Model
This is currently missing and should exist. Something like:
```
"How It Works for Your Bottom Line"
- We sell advertising to local businesses in your market
- You earn a share of ad revenue — no upfront cost, no risk
- We handle everything: sales, creative, delivery, reporting
```

### Section 3.5 — CTA
```
"Join 100+ independent theaters earning revenue with zero effort."
[Partner With Us →]
```

---

## Page 4: Our Work `/work`

### Concept
A simple but cinematic showcase page. Grid of video thumbnails that open in a lightbox player. Organized by category if enough work exists (Restaurants, Auto, Healthcare, Retail, etc.).

If video hosting is a concern, embed from Vimeo (password-protected if needed) or use a simple custom player.

**Fallback if no reel exists yet:** Stills/frames from ads, presented as a grid with a note: "Want to see full spots? Get in touch."

---

## Page 5: About `/about`

Keep the "Local Roots. National Reach." positioning. Add:
- Brief origin story (founded 2004, one small-town theater)
- Team photos if available
- Partner/network info
- "Big-agency quality, small-business care" — lean into this

---

## Page 6: Contact `/contact`

### Layout
Two-column. Left: form. Right: phone, email, response time promise.

**Form with audience toggle:**
```
[I'm an Advertiser]  [I'm a Theater Operator]
```
Selecting one customizes the form slightly (advertisers see a ZIP/city field, theaters see a "number of screens" field).

Fix the broken dropdown. Simplify. Same spirit as LGM get-started page.

---

## Design Direction

### Shared Visual Language with LGM
Both sites should feel like they belong to the same ecosystem without being identical.

**Shared:**
- Dark/cinematic color palette (deep charcoal base, warm amber accent)
- Scroll-triggered stat animations
- Clean geometric typography
- Cinematic photography treatment (dark, atmospheric)
- Performance standards (<2s load, static generation)

**PPP-specific:**
- Slightly warmer tone — PPP is the "small-business heart" brand
- More photography (theater interiors, audience shots, behind-the-scenes creative)
- The "Pecan Pie" personality can come through in microcopy and voice — friendly, Southern-inflected warmth without being hokey

### Tech Stack
Same as LGM: Next.js 14+ / Tailwind / Framer Motion / Vercel

---

## CMS / Content Management Approach

Both sites are light on content volume — neither needs a traditional CMS. The recommended approach:

### `/content` Directory Structure (per site)
```
/content
├── pages/
│   ├── home.md
│   ├── advertisers.md
│   ├── theatres.md
│   └── about.md
├── testimonials/
│   ├── penn-cinema.md
│   ├── lucas-cinemas.md
│   └── ...
├── stats/
│   └── cinema-stats.json
└── config/
    ├── navigation.json
    └── site.json
```

### How It Works
- All content lives in markdown/JSON files in the repo
- Next.js reads these at build time (static generation)
- To update content: edit a markdown file → commit → auto-deploys
- **Claude Code / Cowork workflow:** "Update the Penn Cinema testimonial" → Claude edits the .md file → pushes → site rebuilds

### Why This Over a CMS
- Zero hosting cost for CMS infrastructure
- No login portal to maintain or secure
- Content is version-controlled (Git history = changelog)
- AI-native: Claude Code can read, write, and deploy these files directly
- No vendor lock-in (Contentful, Sanity, etc.)
- For these sites' content velocity (updates maybe monthly), a CMS is overkill
