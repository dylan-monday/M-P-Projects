# Looking Glass Media — Site Wireframe & Interaction Design

_Next.js multi-page static site · March 2026_

---

## Site Architecture

```
lookingglassmedia.com/
├── / ........................ Homepage
├── /why-cinema .............. Why Cinema Advertising
├── /how-it-works ............ Process + Creative
├── /markets ................. Theater Network / Coverage
├── /get-started ............. Contact + Pricing
├── /stats ................... Interactive Stats Page (lead magnet alt)
├── /go ...................... In-Theater QR Landing Page
└── /kit ..................... Text-to-Info SMS Landing Page
```

### Navigation
- **Left:** Logo (home link)
- **Right:** Why Cinema · How It Works · Markets · Get Started (button, highlighted)
- Mobile: Hamburger with full-screen overlay nav

---

## Page 1: Homepage `/`

### Section 1.1 — Hero
**Layout:** Full-viewport, dark background (deep charcoal or near-black to evoke theater darkness). Large bold headline left-aligned, subtle ambient animation — soft light rays or a gentle lens flare suggesting a projector beam.

**Content:**
```
Headline:    "97% of moviegoers watch your ad."
Subhead:     "No skip button. No ad blocker. No scrolling past.
              Cinema advertising puts your local business on
              the biggest screen in town."
CTA:         [Get Started] [See the Numbers →]
```

**Design notes:**
- The "97%" should be the visual anchor — oversized, possibly animated counter on scroll-in
- Consider a looping background video (subtle): projector light in a dark theater, audience silhouettes. Short, 5–8 seconds, muted, atmospheric.
- Avoid stock. If LGM has any real theater photography, use it. If not, commission or AI-generate stylized imagery that feels premium, not generic.

### Section 1.2 — Stat Bar
**Layout:** Horizontal strip, 4 stats, dark-on-light or light-on-dark contrast shift from hero. Numbers animate (count up) on scroll into view.

| Stat | Label |
|---|---|
| 97% | of moviegoers watch cinema ads |
| 4–7× | more attention than TV or digital |
| 76% | recall after a single viewing |
| 48 hrs | from go to on-screen |

**Interaction:** Numbers count up with eased animation as user scrolls into view. Subtle, not flashy.

### Section 1.3 — The Problem / Solution
**Layout:** Two-column or stacked. Left: the problem. Right: the solution.

```
Problem side:
"Your customers are scrolling past your digital ads,
blocking your display ads, and skipping your YouTube pre-rolls.
25% of Americans use ad blockers. Mobile ad view time
has dropped to 2.2 seconds. You're paying for impressions
that nobody sees."

Solution side:
"Cinema advertising is the last place where people
actually watch. A captive audience. A 50-foot screen.
Full sound. No distractions. And your ad plays to the
same neighbors who drive past your business every day."
```

**Design notes:** Could use a split-screen visual — left side shows a phone with tiny ads being swiped away; right side shows a luminous cinema screen. Illustration or stylized graphic, not literal photography.

### Section 1.4 — How It Works (Compressed)
**Layout:** 3 steps, horizontal on desktop, stacked on mobile. Clean icons or numbered circles.

```
Step 1: "Tell us about your business"
         We'll recommend the right theaters and program for your market.

Step 2: "We create your ad"
         Already have one? Great. Need one? Our team produces
         thousands of cinema-ready ads every year.

Step 3: "You're on the big screen"
         Your ad runs before every movie, every showing,
         in your local theaters. That's it.
```

**CTA:** [Get Started — It Takes 5 Minutes]

**Design notes:** Keep this extremely clean. The goal is to communicate "this is easy" — don't overdesign the steps.

### Section 1.5 — Social Proof Strip
**Layout:** Scrolling or static row of partner/client logos if available. If no client logos yet, use partner logos (Spotlight Cinema Networks, Pecan Pie Productions) + stat-driven testimonial cards.

**Fallback if no testimonials exist:**
```
"Cinema ads deliver 3× more brand lift than TV."
— Lumen Research / dentsu

"76% of moviegoers remember the ads they see."
— NCM Attention Study
```

**Design notes:** Third-party research citations styled as testimonial cards function as social proof even without client quotes. Attribute clearly.

### Section 1.6 — CTA Block
**Layout:** Full-width, high-contrast background. Simple and direct.

```
"Ready to put your business on the big screen?"
[Get Started Today]   or call 888.990.8777
```

---

## Page 2: Why Cinema Advertising `/why-cinema`

### Section 2.1 — Hero
```
Headline:    "The Most Effective Advertising Medium. Period."
Subhead:     "Cinema advertising outperforms TV, digital, social,
              and outdoor on every metric that matters."
```

### Section 2.2 — The Comparison
**Layout:** Interactive or static comparison table/chart. Consider a horizontal bar chart that animates on scroll — showing cinema vs. TV vs. digital vs. social across key metrics.

**Metrics to visualize:**
- % who watch the ad (97 vs. 38 vs. 20)
- Ad recall after 1 exposure (76% vs. ~30% vs. low single digits)
- Attention score multiplier (4–7× vs. 1× vs. 0.14×)
- View duration (full 15–30 sec vs. 2.2 sec mobile)

**Design notes:** This is the page's centerpiece. Make it visual, not a wall of text. Animated bar charts or a radial comparison graphic. The gap between cinema and everything else should be *visually obvious* at a glance.

### Section 2.3 — Why It Works (Expanded)
Three content blocks, each with an icon/illustration and short copy:

**Captive Audience**
```
No remote control. No skip button. No scrolling.
Your audience is seated, facing forward, in the dark,
waiting for entertainment. Your ad is part of that experience.
```

**Distraction-Free Environment**
```
70% of cinema ads are watched without any distraction.
Compare that to 20% for online ads. In a world of
second screens and split attention, cinema is the last
place where people just... watch.
```

**Local Targeting**
```
Cinema advertising is inherently local. Your ad plays
in the theaters in your community — the same theaters
where your customers, neighbors, and their families
spend their Friday nights.
```

### Section 2.4 — The Local Angle
```
Headline:    "Local businesses are more trusted. Cinema makes them more visible."
Body:        67% of consumers trust local businesses more than online-only brands.
             55% feel a deeper emotional connection to businesses in their area.
             Cinema puts your brand in front of those people — in a setting where
             they're relaxed, happy, and paying attention.
```

### Section 2.5 — FAQ (Accordion)
- How much does cinema advertising cost?
- What if I don't have an ad?
- How long does it take to get on screen?
- What theaters are available in my area?
- How long should my campaign run?
- Can I target specific movies or audiences?
- How do I know it's working?

---

## Page 3: How It Works `/how-it-works`

### Section 3.1 — Hero
```
Headline:    "On Screen in 48 Hours"
Subhead:     "From first call to first showing, we make cinema
              advertising ridiculously simple."
```

### Section 3.2 — Process (Expanded)
**Layout:** Vertical timeline or stepped layout. Each step gets a card with icon, headline, short copy, and an optional supporting detail.

**Step 1: Discovery Call (15 minutes)**
```
Tell us about your business, your market, and your goals.
We'll recommend the right theaters, programming, and
campaign length for your budget.
```
_Detail: "Most programs start at just a few hundred dollars a week."_

**Step 2: Ad Creative**
```
Option A: Send us your existing ad — we'll optimize it for cinema specs.
Option B: Our in-house team creates your ad from scratch.
We've produced thousands of cinema-ready ads. Motion graphics,
live action, you name it.
```
_Detail: "Production is included in many programs. Ask us."_

**Step 3: Launch**
```
We deliver your ad to the theater. It runs before every movie,
every showing, on every screen at your selected location(s).
Your business. 50 feet tall. In surround sound.
```
_Detail: "Your ad runs an average of 80× per day in a 16-screen theater."_

**Step 4: Optimize**
```
We review performance and refine your messaging, creative,
and programming over time. This is a partnership, not a transaction.
```

### Section 3.3 — Creative Showcase
**Layout:** Grid or carousel of 3–4 example ad stills or short video clips (if LGM can provide). Styled to look like they're displayed on a cinema screen.

**If no examples available:** Use a mockup — a dark theater interior with a stylized ad placeholder on the screen, with caption: "Your business here."

### Section 3.4 — CTA
```
"Let's talk about your business."
[Schedule a Call]   [Or just call: 888.990.8777]
```

---

## Page 4: Markets / Theater Network `/markets`

### Section 4.1 — Hero
```
Headline:    "From Major Metros to Main Street"
Subhead:     "Our network spans theaters in cities and communities
              across the country."
```

### Section 4.2 — Coverage Map or List
**Ideal state:** Interactive map with pins showing theater locations. Clicking a region shows available theaters and screen counts.

**MVP:** Grouped list of markets by state or region, with theater counts. Simple, scannable.

**Design notes:** Partner logos (Spotlight Cinema Networks, Pecan Pie Productions) should appear here with a line like: "Through our exclusive partnerships with Spotlight Cinema Networks and Pecan Pie Productions, we access one of the largest independent cinema advertising networks in the country."

### Section 4.3 — "Don't See Your Market?"
```
"We're constantly expanding. If you don't see your city listed,
get in touch — we may already be there, or we can get there."
[Check My Market →]
```

---

## Page 5: Get Started `/get-started`

### Section 5.1 — Hero
```
Headline:    "Let's Get You on the Big Screen"
Subhead:     "Fill out the form below or call us at 888.990.8777.
              Most businesses are on screen within 48 hours."
```

### Section 5.2 — Form
**Layout:** Two-column on desktop. Left: form. Right: supporting content (what to expect, phone number, hours).

**Form fields (simplified from current):**
- Name (first + last, single row)
- Email
- Phone
- Business Name
- City, State
- Monthly advertising budget (optional dropdown: <$500, $500–$1K, $1K–$2.5K, $2.5K–$5K, $5K+)
- "Tell us about your goals" (textarea, optional)
- [Get Started]

**Right column content:**
```
What happens next?
1. We'll reach out within 1 business day
2. Quick discovery call (15 min)
3. Custom program recommendation
4. You could be on screen this week

Prefer to talk now?
Call 888.990.8777
Mon–Fri, 9am–6pm PT
```

### Section 5.3 — Pricing Signal
```
"Cinema advertising programs start at a few hundred dollars per week.
We'll build a program that fits your budget."
```

**Design notes:** This is deliberately vague but present. The goal is to signal affordability without locking into specific rates that vary by market.

---

## Page 6: Interactive Stats Page `/stats`

### Concept
A visually engaging, scroll-driven page that presents the key cinema advertising statistics in a compelling, shareable format. Functions as both a content piece and a soft lead magnet — "See the numbers" from the homepage hero links here.

### Layout
Full-page scroll experience. Each stat gets its own viewport-height section with large typography, animated number, and a one-line contextual explanation. Dark background throughout (theater mood).

**Stats sequence:**
1. "97% of moviegoers watch cinema ads" — vs. 38% TV, 35% CTV
2. "4–7× more attention than any other video channel"
3. "76% recall after a single viewing" — vs. 5 views on TV for the same result
4. "85% of the ad watched without looking away" — vs. 1.4% online
5. "2.5× more recall than online video"
6. "30% more ROI than outdoor billboards"
7. "67% of consumers trust local businesses more"
8. "On screen in 48 hours. Starting at a few hundred dollars a week."

**Final section:** CTA with form or link to /get-started.

**Design notes:** This page should feel like a keynote presentation — big numbers, minimal text, high impact. Think Apple product page scroll energy. Sources cited in small text below each stat.

---

## Page 7: In-Theater QR Landing Page `/go`

### Concept
This is the response page for a QR code displayed in LGM's own cinema ad. The scenario: a local business owner is sitting in a theater, sees a pre-show ad for LGM itself, scans a QR code, and lands here *during the pre-show or during the movie*.

### Critical UX Considerations
- **They're in a dark theater.** Page must be dark-mode, low brightness, fast-loading, mobile-only.
- **They have ~30 seconds of attention** before the movie starts (or they'll come back after).
- **The goal is capture, not conversion.** Get their info now. Sell later.

### Layout (Mobile-first, single screen)
```
[LGM Logo — small, subtle]

"Imagine your business on this screen."

[Your Name]
[Your Email]
[Your Business]
[Send Me the Stats Kit →]

"We'll send you everything you need to know
about cinema advertising — no pressure, no spam.
Enjoy the movie."
```

**Interaction notes:**
- Auto-focus on first field on page load
- Big touch targets, minimal scrolling
- Immediate confirmation: "Check your inbox after the movie 🍿"
- Follow-up email sent via automation (SendGrid, Mailchimp, etc.) ~60 minutes after submission
- Email contains: stats kit PDF, link to /stats page, CTA to schedule a call

### Design
- Near-black background (#0a0a0a)
- Minimal white text, soft accent color
- No hero image, no animation — pure speed and simplicity
- Under 100KB page weight target

---

## Page 8: Text-to-Info Landing Page `/kit`

### Concept
An alternative or complement to the QR page. LGM's cinema ad displays a text keyword:

```
"Text BIGSCREEN to 55555 to get our free Cinema Advertising Stats Kit"
```

The SMS auto-responder replies with a link to `/kit`, which is a mini landing page that:
1. Confirms their interest
2. Collects email (optional — the SMS number is already captured)
3. Delivers the stats kit

### SMS Flow
```
User texts:    BIGSCREEN → 55555
Auto-reply:    "Thanks! Here's your free Cinema Advertising Kit
                from Looking Glass Media: [link to /kit]
                Questions? Reply here or call 888.990.8777"
```

### /kit Landing Page
```
Headline:    "Your Cinema Advertising Stats Kit"
Body:        "Everything you need to know about putting your
              business on the biggest screen in town."

[Download the Stats Kit — PDF]

Or explore the numbers interactively: [See the Stats →]

Want to talk?
[Schedule a 15-Minute Call]
Call 888.990.8777
```

### Stats Kit (PDF) — Contents
1. Cover: "Cinema Advertising for Local Businesses — The Numbers You Need to Know"
2. The Attention Advantage (key stats, comparison chart)
3. Why Local + Cinema = Perfect Match
4. How Looking Glass Media Works (3-step process)
5. What It Costs (general ranges)
6. Getting Started (CTA, phone, URL)

**Design:** Clean, modern, 4–6 pages. Stat-heavy. Should feel like a premium one-pager deck, not a brochure. Think pitch deck aesthetics.

---

## Global Design Direction

### Typography
- Headlines: Bold geometric sans (Inter, Satoshi, General Sans, or similar)
- Body: Clean, readable sans-serif
- Stat numbers: Extra bold / display weight — the numbers are the design

### Color Palette
- Primary: Deep charcoal / near-black (#0f0f0f) — theater darkness
- Accent: Warm amber/gold (#d4a843 or similar) — projector light, warmth, premium
- Secondary: Clean white (#fafafa) for contrast sections
- Optional: A muted blue or deep navy for supporting elements
- Avoid: Red, bright primary colors, anything that feels "ad agency" or cheap

### Motion & Interaction
- Scroll-triggered number count-ups (stat sections)
- Subtle parallax on hero sections
- Smooth page transitions (Next.js page transitions or Framer Motion)
- Bar chart / comparison animations on /why-cinema
- Dark → light section transitions to create rhythm
- NO: Autoplaying audio, modal popups, aggressive animations

### Photography / Visual Direction
- Dark, atmospheric, cinematic. Think: the glow of a screen in a dark room.
- Avoid generic stock (smiling business owners, handshakes, etc.)
- If using theater imagery: shoot for mood, not documentation
- Consider abstract light/bokeh textures as section backgrounds
- Mockups of ads on cinema screens (for creative showcase)

### Mobile
- Every page must be mobile-first
- /go page is mobile-ONLY (designed for in-theater scanning)
- Touch targets minimum 44px
- Forms should be minimal, fast, thumb-friendly

### Performance
- Target: <2 second load time
- Static generation via Next.js (SSG)
- Minimal JavaScript — animations should be CSS-driven where possible
- Images: WebP, lazy-loaded, properly sized
- /go page: under 100KB total

---

## Tech Stack (Recommended)

- **Framework:** Next.js 14+ (App Router, static export)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion (scroll-triggered, page transitions)
- **Forms:** React Hook Form → webhook to CRM or email service
- **Email automation:** SendGrid or Resend (for /go follow-up emails)
- **SMS:** Twilio or SimpleTexting (for text-to-info flow)
- **Analytics:** Plausible or Fathom (privacy-respecting)
- **Hosting:** Vercel (or IONOS if client prefers)
- **CMS:** None initially — content is static. If client needs to update frequently, add Sanity or Contentlayer later.

---

## Implementation Phases

### Phase 1: Core Site
- Homepage, Why Cinema, How It Works, Get Started
- Responsive, fast, deployed
- Contact form functional

### Phase 2: Lead Capture
- /go (QR landing page)
- /kit (text-to-info flow)
- /stats (interactive stats page)
- Email automation for /go submissions
- Stats Kit PDF design and production

### Phase 3: Expansion
- /markets with theater data
- Client testimonials / case studies (as they're collected)
- Blog or content hub (optional, for SEO)
- CRM integration
