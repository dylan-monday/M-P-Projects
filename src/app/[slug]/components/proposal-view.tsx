"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import type { ProjectWithRelations } from "../page";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
  { id: "offer", label: "Accept" },
];

// Subtle bell sound for interactions
function playBell(volume = 0.15) {
  if (typeof window === "undefined") return;
  const audio = new AudioContext();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.frequency.setValueAtTime(880, audio.currentTime);
  oscillator.type = "sine";
  gain.gain.setValueAtTime(volume, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.8);
  oscillator.start();
  oscillator.stop(audio.currentTime + 0.8);
}

export function ProposalView({ project, paymentStatus, isAdmin }: ProposalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("hero");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Subtle fade-in for elements
      gsap.utils.toArray<HTMLElement>("[data-animate]").forEach((el) => {
        const type = el.dataset.animate;

        if (type === "fade") {
          gsap.fromTo(el,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                toggleActions: "play none none none",
              },
            }
          );
        }

        if (type === "stagger") {
          gsap.fromTo(el.children,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            }
          );
        }
      });

      // Track active section
      SECTIONS.forEach(({ id }) => {
        ScrollTrigger.create({
          trigger: `#${id}`,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActiveSection(id),
          onEnterBack: () => setActiveSection(id),
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = useCallback((id: string) => {
    playBell(0.1);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleCheckout = async () => {
    playBell(0.2);
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
    <div ref={containerRef} className="relative text-white selection:bg-gold-500/30 selection:text-white">
      {/* Base gradient - navy to deeper navy */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#041c45] via-[#020f24] to-[#010812] -z-20" />

      {/* Subtle ambient color washes */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gold-500/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-navy-300/[0.03] rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold-400/[0.02] rounded-full blur-[100px]" />
      </div>

      {/* Subtle grain texture */}
      <div className="fixed inset-0 -z-5 opacity-[0.025] pointer-events-none mix-blend-overlay">
        <svg className="w-full h-full">
          <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" stitchTiles="stitch" /></filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#041c45]/60 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Image src="/brand/MP26.svg" alt="Monday + Partners" width={36} height={36} className="opacity-90" />

          <div className="hidden md:flex items-center gap-0.5">
            {SECTIONS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`px-3.5 py-2 text-[10px] font-medium tracking-[0.2em] uppercase transition-all duration-500 rounded-sm ${
                  activeSection === id
                    ? "text-gold-400 bg-gold-500/10"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {isAdmin && (
            <span className="text-[9px] tracking-[0.25em] uppercase text-white/25 bg-white/[0.03] px-3 py-1.5 rounded-sm">
              Admin Preview
            </span>
          )}
        </div>
      </nav>

      {/* Payment Success */}
      {paymentStatus === "success" && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500/10 border border-emerald-400/20 backdrop-blur-xl rounded-full px-8 py-3">
          <p className="text-sm text-emerald-300 tracking-wide">Payment received. We&apos;ll be in touch within 24 hours.</p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-[clamp(2.2rem,6.5vw,5.5rem)] font-extralight leading-[1.05] tracking-[-0.025em] mb-10 opacity-0 animate-[fadeSlide_1.2s_ease_0.2s_forwards]">
            Your websites <span className="italic font-light">can</span> be
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300">your best salespeople.</span>
          </h1>

          <div className="space-y-2 opacity-0 animate-[fadeSlide_1s_ease_0.8s_forwards]">
            <p className="text-base text-white/45 tracking-wide font-light">
              A proposal for {project.client?.company || "your project"}
            </p>
            <p className="text-[11px] text-white/25 tracking-[0.25em] uppercase">
              March 2026
            </p>
          </div>

          <div className="mt-24 opacity-0 animate-[fadeSlide_1s_ease_1.2s_forwards]">
            <button
              onClick={() => scrollToSection("problem")}
              className="group flex flex-col items-center gap-4 text-white/25 hover:text-white/50 transition-colors duration-700"
            >
              <span className="text-[9px] tracking-[0.35em] uppercase">Explore</span>
              <div className="w-px h-16 bg-gradient-to-b from-white/30 to-transparent relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-gold-400/60 to-transparent animate-[pulse_3s_ease-in-out_infinite]" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          THE PROBLEM
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="problem" className="relative py-40 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[clamp(1.4rem,3.5vw,2.4rem)] font-extralight leading-[1.4] text-white/70 max-w-3xl" data-animate="fade">
            Cinema advertising has the strongest attention metrics in all of advertising.
          </p>

          <div className="mt-28 grid md:grid-cols-3 gap-6" data-animate="stagger">
            <StatCard number={97} suffix="%" label="of moviegoers watch cinema ads" />
            <StatCard number={4} suffix="–7×" label="more attention than TV or digital" />
            <StatCard number={76} suffix="%" label="recall after a single viewing" />
          </div>

          <div className="mt-36 text-center" data-animate="fade">
            <p className="text-[clamp(1.5rem,4vw,2.8rem)] font-extralight leading-[1.3] tracking-[-0.01em]">
              The web has evolved.
              <br />
              <span className="text-gold-400 italic font-light">Your sites can too.</span>
            </p>
          </div>

          <div className="mt-24 grid md:grid-cols-2 gap-5" data-animate="stagger">
            <OpportunityCard
              domain="lookingglassmedia.com"
              opportunities={[
                "Room to showcase the data that sells",
                "Space for testimonials and creative work",
                "Modern stack = lower costs, less maintenance",
                "A site that actively converts visitors",
              ]}
            />
            <OpportunityCard
              domain="pecanpieproductions.com"
              opportunities={[
                "Platform to display thousands of ads produced",
                "Dual-audience routing for different visitors",
                "Free from platform lock-in and annual fees",
                "Your strongest proof points front and center",
              ]}
            />
          </div>

          {/* Executive Summary */}
          <div className="mt-32 max-w-3xl mx-auto" data-animate="fade">
            <div className="p-8 md:p-10 border border-gold-400/15 bg-gradient-to-br from-gold-400/[0.03] to-transparent rounded-sm">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold-400/60 mb-6">Why this proposal</p>

              <p className="text-[clamp(1.1rem,2.5vw,1.4rem)] font-extralight leading-[1.6] text-white/70 mb-6">
                We see real potential here. Your work in cinema advertising is proven — we believe the websites should reflect that quality and actively generate new business.
              </p>

              <p className="text-base text-white/45 leading-relaxed font-light mb-6">
                We&apos;re also using this as a test case for new AI-assisted development tools.
                It&apos;s how we can deliver this scope at a fraction of typical agency rates.
              </p>

              <div className="pt-6 border-t border-gold-400/10 flex flex-col md:flex-row gap-4 md:gap-10">
                <div className="flex items-start gap-3">
                  <span className="text-gold-400/70 mt-1">✓</span>
                  <div>
                    <p className="text-white/70 text-sm font-medium mb-1">You win</p>
                    <p className="text-white/35 text-sm font-light">Premium quality at an exceptional price point</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-gold-400/70 mt-1">✓</span>
                  <div>
                    <p className="text-white/70 text-sm font-medium mb-1">We win</p>
                    <p className="text-white/35 text-sm font-light">A real-world project to prove our new process</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          THE VISION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="vision" className="relative py-40 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-500/[0.02] to-transparent pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold-400/60 mb-10" data-animate="fade">
            The Vision
          </p>

          <h2 className="text-[clamp(1.8rem,5vw,4rem)] font-extralight leading-[1.15] tracking-[-0.02em] mb-16" data-animate="fade">
            Two new sites. One shared engine.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-300 to-gold-200 italic font-light">Built to sell.</span>
          </h2>

          <div className="flex flex-wrap justify-center gap-3 mb-16" data-animate="stagger">
            {["Dark. Cinematic.", "Data-driven.", "Fast. Beautiful."].map((text) => (
              <span key={text} className="px-5 py-2.5 border border-gold-400/20 bg-gold-400/[0.03] text-gold-200/80 text-sm tracking-wide font-light">
                {text}
              </span>
            ))}
          </div>

          <p className="text-lg text-white/35 font-light" data-animate="fade">
            Websites that feel like the medium you work in.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          WHAT LGM GETS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="lgm" className="relative py-40 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-20" data-animate="fade">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold-500/70 mb-4">For Looking Glass Media</p>
            <h2 className="text-[clamp(1.6rem,4vw,2.8rem)] font-extralight tracking-tight">
              A sales machine that works
              <span className="text-gold-400 italic"> while you sleep.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5" data-animate="stagger">
            <FeatureCard
              number="01"
              title="Interactive Stats Engine"
              description="Makes the case for cinema advertising in 30 seconds. Animated counters. Shareable links. The tool your sales team will use every single day."
              highlight="Converts skeptics into believers"
            />
            <FeatureCard
              number="02"
              title="In-Theater Lead Capture"
              description="Your preshow ad includes a QR code. Scan → Submit → Watch the movie. Stats kit lands in their inbox before the credits roll."
              highlight="Live proof of concept in action"
            />
            <FeatureCard
              number="03"
              title="Text-to-Info Flow*"
              description="Text BIGSCREEN to 55555. They text during the preshow. By the credits, everything they need is in their pocket."
              highlight="Frictionless prospect capture"
            />
            <FeatureCard
              number="04"
              title="Smart Ad Upload"
              description="Already have an ad? Upload it instantly. Don't have one? Plain-English specs show exactly what we'll build. Zero back-and-forth."
              highlight="Removes friction from onboarding"
            />
            <FeatureCard
              number="05"
              title="Automated Nurture Sequences†"
              description="Every form, scan, and text triggers a smart email sequence. The right stat at the right moment. Built once, runs forever."
              highlight="Future feature worth considering"
            />
            <FeatureCard
              number="06"
              title="Downloadable Stats Kit"
              description="A designed PDF with all the key cinema advertising stats — formatted for email, print, or presentation. Your sales team sends it with one click."
              highlight="Shareable leave-behind collateral"
            />
          </div>

          {/* Footnotes */}
          <div className="mt-10 text-[11px] text-white/30 font-light space-y-1" data-animate="fade">
            <p>* SMS functionality uses pay-per-message service — typically $0.01–0.02/text, costs scale with usage.</p>
            <p>† Future feature not included in current scope, but infrastructure will support adding later.</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          WHAT PPP GETS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="ppp" className="relative py-40 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-500/[0.015] to-transparent pointer-events-none" />

        <div className="relative max-w-5xl mx-auto">
          <div className="mb-20" data-animate="fade">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold-500/70 mb-4">For Pecan Pie Productions</p>
            <h2 className="text-[clamp(1.6rem,4vw,2.8rem)] font-extralight tracking-tight">
              Show what you&apos;ve built.
              <span className="text-gold-400 italic"> Close what you deserve.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5" data-animate="stagger">
            <FeatureCard
              number="01"
              title="Cinematic Creative Showcase"
              description="Thousands of ads produced. The new site shows them off beautifully. Organized by industry. Full-screen viewing experience."
              highlight="Your work finally on display"
            />
            <FeatureCard
              number="02"
              title="Dual-Audience Routing"
              description="Advertisers and theater operators see completely different sites. Same URL. Two perfectly tuned sales experiences."
              highlight="One site, two perfect pitches"
            />
            <FeatureCard
              number="03"
              title="Theater Revenue Model"
              description="Theater operators will finally understand exactly how the partnership works — and why saying yes is the obvious choice."
              highlight="Objections answered before asked"
            />
            <FeatureCard
              number="04"
              title="Strategic Social Proof"
              description="Penn Cinema. 18 years. Lucas Cinemas. Spotlight Theaters. 10+ years. Testimonials that build instant credibility."
              highlight="Trust built at first glance"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          THE INVESTMENT
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="investment" className="relative py-40 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold-400/60 mb-16" data-animate="fade">
            The Investment
          </p>

          <div className="grid md:grid-cols-2 gap-5 mb-28" data-animate="stagger">
            <CostCard
              title="Current annual costs"
              items={[
                ["GoDaddy + WordPress (LGM)", "$150–$440"],
                ["Webflow + Workspace (PPP)", "$290–$1,000"],
              ]}
              total="$440–$1,440+/year"
              negative
            />
            <CostCard
              title="New annual costs"
              items={[
                ["Hosting (both sites)", "$0–$240"],
                ["SSL + CMS", "$0"],
              ]}
              total="$30–$378/year"
            />
          </div>

          <div className="text-center mb-28" data-animate="fade">
            <p className="text-white/35 mb-5 font-light">But the real return isn&apos;t in hosting savings.</p>
            <p className="text-[clamp(1.3rem,3.5vw,2.2rem)] font-extralight leading-[1.4]">
              Turn the sites into more powerful sales tools
              <br />
              <span className="text-gold-400 italic font-light">and the entire project is paid in a quarter at most.</span>
            </p>
          </div>

          <div className="p-8 md:p-10 border border-white/[0.06] bg-white/[0.01] rounded-sm" data-animate="fade">
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/30 mb-8">What this would cost at an agency</p>
            <div className="space-y-2.5 text-sm font-light mb-8">
              {[
                ["Strategy & wireframes", "$5,000–$10,000"],
                ["Design (2 sites)", "$8,000–$15,000"],
                ["Development", "$15,000–$30,000"],
                ["Admin dashboard", "$3,000–$8,000"],
                ["QR, SMS, email automation", "$3,000–$6,000"],
                ["Stats Kit PDF + QA", "$3,500–$7,000"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-white/40">
                  <span>{label}</span>
                  <span className="tabular-nums text-white/50">{value}</span>
                </div>
              ))}
              <div className="pt-4 mt-4 border-t border-white/[0.06] flex justify-between">
                <span className="text-white/50">Typical total</span>
                <span className="text-white/35 tabular-nums">$37,500–$76,000</span>
              </div>
            </div>
            <p className="text-xl md:text-2xl text-center text-gold-300/80 font-extralight italic">
              We&apos;re not proposing anything near these numbers.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          THE OFFER
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="offer" className="relative py-40 px-6">
        <div className="absolute inset-0 bg-gradient-to-t from-gold-500/[0.03] via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-3xl mx-auto">
          <div className="mb-20" data-animate="fade">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold-400/60 mb-8">Everything included</p>
            <div className="grid md:grid-cols-2 gap-x-10 gap-y-2.5 text-white/45 text-sm font-light">
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
                <div key={item} className="flex items-start gap-3">
                  <span className="text-gold-400/70 mt-0.5 text-xs">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[11px] text-white/25">* SMS uses pay-per-message service — typically $0.01–0.02/text</p>
          </div>

          <div className="text-center mb-16" data-animate="fade">
            <p className="text-[clamp(3.5rem,10vw,7rem)] font-extralight text-transparent bg-clip-text bg-gradient-to-b from-gold-200 via-gold-300 to-gold-400/80 leading-none mb-3">
              {formatCurrency((project.deposit_amount || 0) + (project.final_amount || 0))}
            </p>
            <p className="text-white/35 tracking-wide font-light">total project investment</p>

            <div className="flex justify-center gap-10 mt-8 text-sm font-light">
              <div>
                <p className="text-white/80">{formatCurrency(project.deposit_amount || 0)}</p>
                <p className="text-white/30">deposit to begin</p>
              </div>
              <div>
                <p className="text-white/80">{formatCurrency(project.final_amount || 0)}</p>
                <p className="text-white/30">on completion</p>
              </div>
            </div>
          </div>

          <div className="mb-20 p-7 border border-white/[0.06] rounded-sm" data-animate="fade">
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/30 mb-5">Timeline</p>
            <div className="space-y-2 text-sm font-light">
              {[
                ["Research & wireframes", "✓ Complete", true],
                ["Design direction", "1 week", false],
                ["Design + development", "3–4 weeks", false],
                ["QA + launch", "1 week", false],
              ].map(([phase, duration, complete]) => (
                <div key={phase as string} className="flex justify-between text-white/40">
                  <span>{phase}</span>
                  <span className={complete ? "text-emerald-400/80" : "text-white/55 tabular-nums"}>{duration}</span>
                </div>
              ))}
              <div className="pt-3 mt-3 border-t border-white/[0.06] flex justify-between">
                <span className="text-white/50">Total</span>
                <span className="text-white/70">~5–6 weeks from go</span>
              </div>
            </div>
          </div>

          <div className="text-center" data-animate="fade">
            <h3 className="text-2xl md:text-3xl font-extralight mb-8 tracking-tight">
              Ready to start?
            </h3>
            <Button
              size="lg"
              onClick={handleCheckout}
              isLoading={isCheckoutLoading}
              className="px-10 py-5 text-base bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-[#041c45] font-medium tracking-wide rounded-none transition-all duration-500"
            >
              Accept & Pay Deposit — {formatCurrency(project.deposit_amount || 0)}
            </Button>
            <p className="mt-6 text-sm text-white/25 font-light">
              Questions? Email dylan@mondayandpartners.com
            </p>
          </div>

          <div className="mt-20 pt-8 border-t border-white/[0.04] text-[11px] text-white/25 space-y-1 font-light" data-animate="fade">
            <p className="text-white/35 mb-2">Terms</p>
            <p>50% deposit due on acceptance, 50% due on completion approval</p>
            <p>2 rounds of design revision included · 30 days post-launch support</p>
            <p>Client provides: content assets, brand files, testimonial approvals</p>
          </div>
        </div>
      </section>

      {/* Footer with tagline bug */}
      <footer className="py-20 px-6 border-t border-white/[0.03]">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
          <Image
            src="/brand/tagline_bug.svg"
            alt="Clarity. Conjunction. Currency. — Monday + Partners"
            width={320}
            height={60}
            className="opacity-60 hover:opacity-80 transition-opacity duration-500"
          />
          <p className="text-[10px] text-white/20 tracking-[0.2em] uppercase">
            © 2026 Monday + Partners
          </p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */

function StatCard({ number, suffix, label }: { number: number; suffix: string; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    if (!ref.current || animated.current) return;
    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: "top 88%",
      onEnter: () => {
        if (animated.current) return;
        animated.current = true;
        gsap.fromTo(ref.current, { innerText: 0 }, {
          innerText: number,
          duration: 1.8,
          ease: "power2.out",
          snap: { innerText: 1 },
          onUpdate() { if (ref.current) ref.current.innerText = Math.round(Number(ref.current.innerText)).toString(); }
        });
      },
    });
    return () => trigger.kill();
  }, [number]);

  return (
    <div className="group p-7 border border-white/[0.06] bg-white/[0.01] hover:border-gold-400/20 hover:bg-gold-400/[0.02] transition-all duration-700">
      <p className="text-[clamp(2.5rem,6vw,4rem)] font-extralight text-white/90 leading-none mb-3 tracking-tight">
        <span ref={ref}>0</span>
        <span className="text-gold-400/80">{suffix}</span>
      </p>
      <p className="text-sm text-white/35 font-light">{label}</p>
    </div>
  );
}

function OpportunityCard({ domain, opportunities }: { domain: string; opportunities: string[] }) {
  return (
    <div className="p-7 border border-gold-500/15 bg-gold-500/[0.02]">
      <p className="font-mono text-xs text-white/50 mb-5 tracking-wide">{domain}</p>
      <ul className="space-y-2.5">
        {opportunities.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-white/45 font-light">
            <span className="text-gold-400/70 mt-0.5">+</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeatureCard({ number, title, description, highlight }: { number: string; title: string; description: string; highlight: string }) {
  return (
    <div className="group p-6 border border-white/[0.06] bg-white/[0.015] hover:border-gold-400/20 hover:bg-gold-400/[0.02] transition-all duration-500 relative overflow-hidden">
      {/* Subtle gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold-400/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        {/* Number badge */}
        <span className="inline-block text-[10px] tracking-[0.3em] text-gold-400/60 font-medium mb-4">
          {number}
        </span>

        {/* Title */}
        <h3 className="text-lg md:text-xl font-light text-white/90 mb-3 tracking-tight group-hover:text-gold-200/90 transition-colors duration-500">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-white/40 leading-relaxed mb-5 font-light">
          {description}
        </p>

        {/* Highlight pill */}
        <span className="inline-block text-[10px] tracking-[0.15em] uppercase text-gold-300/70 bg-gold-400/10 px-3 py-1.5 rounded-sm">
          {highlight}
        </span>
      </div>
    </div>
  );
}

function CostCard({ title, items, total, negative = false }: { title: string; items: string[][]; total: string; negative?: boolean }) {
  const color = negative ? "rose" : "emerald";
  return (
    <div className={`p-7 border border-${color}-400/10 bg-${color}-400/[0.02]`}>
      <p className={`text-[10px] tracking-[0.3em] uppercase text-${color}-400/50 mb-5`}>{title}</p>
      <div className="space-y-2 text-sm font-light mb-5">
        {items.map(([label, value]) => (
          <div key={label} className="flex justify-between text-white/40">
            <span>{label}</span>
            <span className="tabular-nums text-white/50">{value}</span>
          </div>
        ))}
      </div>
      <div className={`pt-4 border-t border-${color}-400/10 flex justify-between`}>
        <span className="text-white/50 font-light">Total</span>
        <span className={`text-${color}-400/70 tabular-nums`}>{total}</span>
      </div>
    </div>
  );
}
