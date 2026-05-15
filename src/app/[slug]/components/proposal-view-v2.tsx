"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import {
  VerticalRail,
  useActiveSection,
  Section,
  Container,
  Split,
  Stack,
  RailOffset,
  Hairline,
  DisplayXL,
  DisplayLG,
  DisplayMD,
  DisplaySM,
  Body,
  BodySM,
  MonoLabel,
  OutlineText,
  Stat,
  StatGrid,
  CostComparison,
  FeatureRow,
  FeatureList,
  ChecklistItem,
  TimelineRow,
  Timeline,
  CTABlock,
  PriceDisplay,
  PaymentSplit,
  AcceptTerms,
} from "@/components/drafting-table";
import { formatCurrency } from "@/lib/utils";
import type { ProjectWithRelations } from "../page";

/* ═══════════════════════════════════════════════════════════════════════════
   PROPOSAL VIEW — Drafting Table Design System
   Monday + Partners Project Portal
   ═══════════════════════════════════════════════════════════════════════════ */

interface ProposalViewProps {
  project: ProjectWithRelations;
  paymentStatus?: string;
  isAdmin: boolean;
}

const SECTIONS = [
  { id: "hero", label: "Start" },
  { id: "problem", label: "Problem" },
  { id: "vision", label: "Vision" },
  { id: "lgm", label: "LGM" },
  { id: "ppp", label: "PPP" },
  { id: "investment", label: "Investment" },
  { id: "accept", label: "Accept" },
];

export function ProposalViewV2({ project, paymentStatus, isAdmin }: ProposalViewProps) {
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const sectionIds = useMemo(() => SECTIONS.map((s) => s.id), []);
  const activeSection = useActiveSection(sectionIds);

  const handleCheckout = async () => {
    setIsCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, paymentType: "deposit" }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-[#FF6B35]/30">
      {/* Vertical Rail Navigation */}
      <VerticalRail sections={SECTIONS} activeSection={activeSection} />

      {/* Payment Success Toast */}
      {paymentStatus === "success" && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-[#00C853]/10 border border-[#00C853]/30 px-6 py-3"
        >
          <p className="font-mono text-sm text-[#00C853]">
            Payment received. We'll be in touch within 24 hours.
          </p>
        </motion.div>
      )}

      {/* Admin Badge */}
      {isAdmin && (
        <div className="fixed top-6 right-6 z-[200]">
          <MonoLabel className="bg-white/5 px-3 py-1.5 border border-white/10">
            Admin Preview
          </MonoLabel>
        </div>
      )}

      <RailOffset>
        {/* ═══════════════════════════════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="hero" theme="dark" fullHeight className="relative">
          {/* Horizontal rule at 50% */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-white/5" />

          <Container>
            <Split ratio="60-40" align="center">
              {/* Left: Headline (bleeds left) */}
              <div className="-ml-[clamp(1rem,4vw,3rem)]">
                <motion.div
                  initial={{ opacity: 0, x: -60 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <DisplayXL className="leading-[0.85]">
                    Your websites
                    <br />
                    <span className="text-[#FF6B35]">can</span> be your
                    <br />
                    best salespeople.
                  </DisplayXL>
                </motion.div>
              </div>

              {/* Right: Meta + Scroll */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col justify-between h-full min-h-[300px]"
              >
                <div>
                  <MonoLabel className="block mb-4">Proposal</MonoLabel>
                  <BodySM className="text-white/50 max-w-xs">
                    A proposal for {project.client?.company || "your project"}
                  </BodySM>
                  <MonoLabel className="block mt-4">March 2026</MonoLabel>
                </div>

                {/* Scroll indicator */}
                <div className="flex flex-col items-start gap-3">
                  <MonoLabel className="text-[#FF6B35]">01</MonoLabel>
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-px h-12 bg-gradient-to-b from-[#FF6B35] to-transparent"
                  />
                </div>
              </motion.div>
            </Split>
          </Container>

          {/* Logo on the center rule */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <Image
              src="/brand/MP26.svg"
              alt="Monday + Partners"
              width={48}
              height={48}
              className="invert opacity-60"
            />
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════════
            THE PROBLEM
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="problem" theme="dark" gridBg>
          <Container>
            <Stack gap="2xl">
              {/* Opening statement */}
              <DisplayMD className="text-white/70 max-w-3xl">
                Cinema advertising commands attention like nothing else in the industry.
              </DisplayMD>

              {/* Stats */}
              <StatGrid layout="row" className="my-16">
                <Stat value={97} suffix="%" label="watch cinema ads" position="left" />
                <Stat value="4" suffix="–7×" label="more attention than TV" position="center" />
                <Stat value={76} suffix="%" label="recall after one viewing" position="right" />
              </StatGrid>

              {/* The turn */}
              <div className="py-16 text-center">
                <OutlineText className="text-[clamp(2rem,6vw,4rem)]">
                  Neither of your websites
                  <br />
                  communicates any of this.
                </OutlineText>
              </div>

              {/* Opportunity cards */}
              <div className="grid md:grid-cols-2 gap-8">
                <OpportunityCard
                  domain="lookingglassmedia.com"
                  items={[
                    "Room to showcase the data that sells",
                    "Space for testimonials and creative work",
                    "Modern stack = lower costs, less maintenance",
                    "A site that actively converts visitors",
                  ]}
                />
                <OpportunityCard
                  domain="pecanpieproductions.com"
                  items={[
                    "Platform to display thousands of ads produced",
                    "Dual-audience routing for different visitors",
                    "Free from platform lock-in and annual fees",
                    "Your strongest proof points front and center",
                  ]}
                />
              </div>

              {/* Executive summary */}
              <div className="mt-16 py-10 border-t border-b border-white/5">
                <Split ratio="40-60" align="start">
                  <div>
                    <MonoLabel className="text-[#FF6B35] block mb-4">Why this proposal</MonoLabel>
                    <DisplaySM>
                      Your work speaks for itself.
                      <br />
                      The websites should do the same.
                    </DisplaySM>
                  </div>
                  <div className="space-y-6">
                    <Body className="text-white/50">
                      We're piloting a new AI-assisted development workflow.
                      That's how we can deliver at this price point.
                    </Body>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <MonoLabel className="block mb-2">For you</MonoLabel>
                        <BodySM className="text-white/40">
                          Top-tier execution at a fraction of typical cost
                        </BodySM>
                      </div>
                      <div>
                        <MonoLabel className="block mb-2">For us</MonoLabel>
                        <BodySM className="text-white/40">
                          A live project to validate our new process
                        </BodySM>
                      </div>
                    </div>
                  </div>
                </Split>
              </div>
            </Stack>
          </Container>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════════
            THE VISION
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="vision" theme="cream" fullHeight>
          <Container>
            <div className="max-w-3xl">
              <MonoLabel className="text-[#FF6B35] block mb-8">The Vision</MonoLabel>

              <Stack gap="lg">
                <DisplayLG className="text-black">
                  Two new sites.
                </DisplayLG>
                <DisplayLG className="text-black">
                  One shared engine.
                </DisplayLG>
                <DisplayLG className="text-[#FF6B35]">
                  Built to sell.
                </DisplayLG>
              </Stack>

              <div className="mt-16 flex flex-wrap gap-4">
                {["Dark. Cinematic.", "Data-driven.", "Fast. Beautiful."].map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 border border-black/10 font-mono text-xs uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <Body className="mt-12 text-black/50 max-w-md">
                Websites that feel like the medium you work in.
              </Body>
            </div>
          </Container>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════════
            WHAT LGM GETS
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="lgm" theme="dark">
          <Container>
            <div className="mb-16">
              <MonoLabel className="text-[#FF6B35] block mb-4">For Looking Glass Media</MonoLabel>
              <DisplayMD>
                Let the site do{" "}
                <span className="text-[#FF6B35]">the heavy lifting.</span>
              </DisplayMD>
            </div>

            <FeatureList label="Features" showLine>
              <FeatureRow
                number={1}
                title="Interactive Stats Engine"
                description="Makes the case for cinema advertising in 30 seconds. Animated counters. Shareable links. The tool your sales team reaches for daily."
                highlight="Proof on demand"
              />
              <FeatureRow
                number={2}
                title="In-Theater Lead Capture"
                description="Preshow QR code. Scan, submit, watch. Stats kit lands in their inbox before the credits roll."
                highlight="Capture leads mid-experience"
              />
              <FeatureRow
                number={3}
                title="Text-to-Info Flow"
                description="Text BIGSCREEN to 55555. By the credits, everything they need is in their pocket."
                highlight="Zero friction"
                footnote="* SMS uses pay-per-message service, typically $0.01–0.02/text"
              />
              <FeatureRow
                number={4}
                title="Smart Ad Upload"
                description="Have an ad? Upload instantly. Need one? Plain-English specs show exactly what gets built."
                highlight="Onboarding in minutes"
              />
              <FeatureRow
                number={5}
                title="Automated Nurture Sequences"
                description="Every form, scan, and text triggers a smart email sequence. The right stat at the right moment. Built once, runs forever."
                highlight="Future expansion ready"
                footnote="† Infrastructure ready, implementation available post-launch"
              />
              <FeatureRow
                number={6}
                title="Downloadable Stats Kit"
                description="Designed PDF with every key stat. Email, print, or presentation ready. One click to send."
                highlight="Leave-behind that closes"
              />
            </FeatureList>
          </Container>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════════
            WHAT PPP GETS
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="ppp" theme="cream">
          <Container>
            <div className="mb-16">
              <MonoLabel className="text-[#FF6B35] block mb-4">For Pecan Pie Productions</MonoLabel>
              <DisplayMD className="text-black">
                18 years of work.{" "}
                <span className="text-[#FF6B35]">Evolved.</span>
              </DisplayMD>
            </div>

            <FeatureList showLine>
              <FeatureRow
                number={1}
                title="Cinematic Creative Showcase"
                description="Thousands of ads produced. Organized by industry. Full-screen viewing. The work finally speaks for itself."
                highlight="Portfolio that performs"
              />
              <FeatureRow
                number={2}
                title="Dual-Audience Routing"
                description="Advertisers and theater operators see different sites. Same URL. Two distinct experiences, each optimized to convert."
                highlight="Speak to both audiences"
              />
              <FeatureRow
                number={3}
                title="Theater Revenue Model"
                description="Theater operators see exactly how the partnership works. The economics make the decision obvious."
                highlight="Objections preempted"
              />
              <FeatureRow
                number={4}
                title="Strategic Social Proof"
                description="Penn Cinema. 18 years. Lucas Cinemas. Spotlight Theaters. 10+ years. Longevity builds trust faster than any pitch."
                highlight="Credibility at first glance"
              />
            </FeatureList>
          </Container>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════════
            THE INVESTMENT
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="investment" theme="dark">
          <Container>
            <MonoLabel className="text-[#FF6B35] block mb-16">The Investment</MonoLabel>

            {/* Cost comparison */}
            <CostComparison
              currentCosts={[
                { label: "GoDaddy + WordPress (LGM)", min: 150, max: 440 },
                { label: "Webflow + Workspace (PPP)", min: 290, max: 1000 },
              ]}
              newCosts={[
                { label: "Hosting (both sites)", min: 0, max: 240 },
                { label: "SSL + CMS", min: 0, max: 30 },
              ]}
              className="mb-24"
            />

            {/* ROI statement */}
            <div className="text-center py-16 border-t border-white/5">
              <Body className="text-white/40 mb-6">
                Hosting savings are incidental.
              </Body>
              <DisplaySM>
                One new client closes the investment.
                <br />
                <span className="text-[#FF6B35]">Everything after is margin.</span>
              </DisplaySM>
            </div>

            {/* Agency comparison */}
            <div className="mt-16 py-10 border border-white/5 px-8">
              <MonoLabel className="block mb-8">What this would cost at an agency</MonoLabel>
              <div className="grid md:grid-cols-2 gap-x-16 gap-y-3">
                {[
                  ["Strategy & wireframes", "$5,000–$10,000"],
                  ["Design (2 sites)", "$8,000–$15,000"],
                  ["Development", "$15,000–$30,000"],
                  ["Admin dashboard", "$3,000–$8,000"],
                  ["QR, SMS, email automation", "$3,000–$6,000"],
                  ["Stats Kit PDF + QA", "$3,500–$7,000"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-white/40 text-sm">{label}</span>
                    <span className="font-mono text-sm tabular-nums text-white/60">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-white/10 flex justify-between">
                <span className="text-white/50">Typical total</span>
                <span className="font-mono text-white/30">$37,500–$76,000</span>
              </div>
              <p className="mt-8 text-center">
                <OutlineText className="text-2xl md:text-3xl text-[#FF6B35]">
                  This proposal is a fraction of that.
                </OutlineText>
              </p>
            </div>
          </Container>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════════
            ACCEPT & PAY
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="accept" theme="dark" className="pb-0">
          <Container>
            <MonoLabel className="text-[#FF6B35] block mb-8">Everything included</MonoLabel>

            {/* Checklist */}
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-1 mb-16">
              {[
                "Research, strategy, wireframes (complete)",
                "Visual design system (2 rounds)",
                "Full development of both sites",
                "Shared content library",
                "Simple admin dashboard",
                "LGM in-theater QR capture",
                "LGM text-to-info SMS flow*",
                "LGM downloadable stats kit",
                "PPP creative showcase",
                "PPP dual-audience routing",
                "30 days post-launch support",
              ].map((item) => (
                <ChecklistItem key={item}>{item}</ChecklistItem>
              ))}
            </div>
            <BodySM className="text-white/30 mb-24">
              * SMS uses pay-per-message service, typically $0.01–0.02/text
            </BodySM>

            {/* Price display */}
            <PriceDisplay
              amount={(project.deposit_amount || 0) + (project.final_amount || 0)}
              label="Total project investment"
              className="mb-12"
            />

            <PaymentSplit
              deposit={project.deposit_amount || 0}
              final={project.final_amount || 0}
              className="mb-16"
            />

            {/* Timeline */}
            <div className="max-w-md mx-auto mb-16">
              <MonoLabel className="block mb-6">Timeline</MonoLabel>
              <Timeline>
                <TimelineRow phase="Research & wireframes" duration="✓ Complete" complete />
                <TimelineRow phase="Design direction" duration="1 week" />
                <TimelineRow phase="Design + development" duration="3–4 weeks" />
                <TimelineRow phase="QA + launch" duration="1 week" />
              </Timeline>
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between">
                <MonoLabel>Total</MonoLabel>
                <span className="font-mono text-sm">~5–6 weeks from go</span>
              </div>
            </div>

            {/* Terms */}
            <AcceptTerms
              terms={[
                "50% deposit due on acceptance, 50% due on completion approval",
                "2 rounds of design revision included · 30 days post-launch support",
                "Client provides: content assets, brand files, testimonial approvals",
              ]}
              className="max-w-2xl mx-auto mb-16"
            />

            {/* Contact */}
            <p className="text-center mb-8">
              <BodySM className="text-white/30">
                Questions? Email{" "}
                <a href="mailto:dylan@mondayandpartners.com" className="text-[#FF6B35] hover:underline">
                  dylan@mondayandpartners.com
                </a>
              </BodySM>
            </p>
          </Container>

          {/* CTA Block */}
          <CTABlock
            onClick={handleCheckout}
            isLoading={isCheckoutLoading}
            className="mt-8"
          >
            Accept & Pay Deposit — {formatCurrency(project.deposit_amount || 0)}
          </CTABlock>
        </Section>

        {/* Footer */}
        <footer className="py-16 bg-black border-t border-white/5">
          <Container>
            <div className="flex flex-col items-center gap-6">
              <Image
                src="/brand/tagline_bug.svg"
                alt="Monday + Partners"
                width={60}
                height={60}
                className="invert opacity-50"
              />
              <MonoLabel>© 2026 Monday + Partners</MonoLabel>
            </div>
          </Container>
        </footer>
      </RailOffset>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

function OpportunityCard({ domain, items }: { domain: string; items: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="p-8 border border-[#FF6B35]/20 bg-[#FF6B35]/[0.02]"
    >
      <MonoLabel className="block mb-6">{domain}</MonoLabel>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="text-[#FF6B35] mt-1">+</span>
            <span className="text-white/60 text-sm">{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
