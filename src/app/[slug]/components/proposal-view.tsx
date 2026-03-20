"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Logo } from "@/components/layout";
import { Button } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import type { ProjectWithRelations } from "../page";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ProposalViewProps {
  project: ProjectWithRelations;
  paymentStatus?: string;
  isAdmin: boolean;
}

// Section IDs for navigation
const SECTIONS = [
  { id: "hero", label: "Start" },
  { id: "problem", label: "The Problem" },
  { id: "vision", label: "The Vision" },
  { id: "lgm-features", label: "LGM" },
  { id: "ppp-features", label: "PPP" },
  { id: "ecosystem", label: "Ecosystem" },
  { id: "numbers", label: "Investment" },
  { id: "offer", label: "The Offer" },
];

export function ProposalView({ project, paymentStatus, isAdmin }: ProposalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("hero");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // Initialize GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in elements as they enter viewport
      gsap.utils.toArray<HTMLElement>(".fade-up").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // Stagger fade for lists
      gsap.utils.toArray<HTMLElement>(".stagger-container").forEach((container) => {
        const items = container.querySelectorAll(".stagger-item");
        gsap.fromTo(
          items,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: container,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCheckout = async () => {
    setIsCheckoutLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          paymentType: "deposit",
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        console.error("Checkout error:", error);
        alert("Something went wrong. Please try again.");
        return;
      }

      window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground">
      {/* Sticky Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Logo size="sm" href={undefined} />
          <div className="hidden md:flex items-center gap-1">
            {SECTIONS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  activeSection === id
                    ? "bg-accent/20 text-accent"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <span className="text-xs text-foreground-subtle px-2 py-1 bg-surface-800 rounded">
                Admin View
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Payment Success Banner */}
      {paymentStatus === "success" && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-success/10 border-b border-success/20 px-4 py-3">
          <p className="text-center text-sm text-success">
            Payment successful! We&apos;ll be in touch within 24 hours.
          </p>
        </div>
      )}

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex flex-col items-center justify-center px-4 pt-16">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold leading-tight fade-up">
            Your websites should be
            <br />
            <span className="text-accent">your best salespeople.</span>
          </h1>
          <div className="space-y-2 fade-up">
            <p className="text-lg text-foreground-muted">
              A proposal for {project.client?.company || "your project"}
            </p>
            <p className="text-sm text-foreground-subtle">
              Prepared March 2026
            </p>
          </div>
          <div className="pt-8 fade-up">
            <button
              onClick={() => scrollToSection("problem")}
              className="group flex flex-col items-center gap-2 text-foreground-muted hover:text-foreground transition-colors"
            >
              <span className="text-sm">Scroll to explore</span>
              <svg
                className="w-5 h-5 animate-bounce"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section id="problem" className="min-h-screen py-32 px-4">
        <div className="max-w-4xl mx-auto space-y-32">
          {/* Setup */}
          <div className="text-center fade-up">
            <p className="text-2xl md:text-4xl font-medium leading-relaxed text-foreground-muted">
              Cinema advertising has the strongest
              <br />
              attention metrics in all of advertising.
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-8 stagger-container">
            <StatCard value={97} suffix="%" label="of moviegoers watch cinema ads" />
            <StatCard value={4} suffix="-7×" label="more attention than TV or digital" />
            <StatCard value={76} suffix="%" label="recall after a single viewing" />
          </div>

          {/* The Turn */}
          <div className="text-center fade-up">
            <p className="text-2xl md:text-4xl font-semibold">
              Neither of your websites
              <br />
              <span className="text-accent">communicates any of this.</span>
            </p>
          </div>

          {/* Site Assessments */}
          <div className="grid md:grid-cols-2 gap-8 stagger-container">
            <div className="stagger-item p-6 border border-border rounded-lg bg-surface-900/50">
              <h3 className="text-lg font-medium text-foreground mb-4">lookingglassmedia.com</h3>
              <ul className="space-y-2 text-sm text-foreground-muted">
                <li className="flex items-start gap-2">
                  <span className="text-error mt-1">→</span>
                  4 pages of thin content
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-error mt-1">→</span>
                  No data. No social proof. No creative examples.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-error mt-1">→</span>
                  WordPress + GoDaddy. Paid SSL. Maintenance overhead.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-error mt-1">→</span>
                  The site doesn&apos;t sell. It barely introduces.
                </li>
              </ul>
            </div>
            <div className="stagger-item p-6 border border-border rounded-lg bg-surface-900/50">
              <h3 className="text-lg font-medium text-foreground mb-4">pecanpieproductions.com</h3>
              <ul className="space-y-2 text-sm text-foreground-muted">
                <li className="flex items-start gap-2">
                  <span className="text-warning mt-1">→</span>
                  Better — but still reads like a template
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-error mt-1">→</span>
                  Thousands of ads produced. Zero shown.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-error mt-1">→</span>
                  Webflow lock-in. $290–$1,000+/year in platform costs.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-error mt-1">→</span>
                  Your strongest proof point is invisible.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The Vision */}
      <section id="vision" className="min-h-screen py-32 px-4 bg-gradient-to-b from-background to-surface-900">
        <div className="max-w-4xl mx-auto space-y-16 text-center">
          <h2 className="text-3xl md:text-5xl font-semibold fade-up">
            Here&apos;s what I want to build.
          </h2>
          <div className="space-y-6 fade-up">
            <p className="text-2xl md:text-3xl text-foreground-muted">
              Two new sites. One shared engine.
              <br />
              <span className="text-accent font-medium">Built to sell.</span>
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 pt-8 stagger-container">
            <div className="stagger-item p-6 border border-accent/30 rounded-lg bg-accent/5">
              <p className="text-lg font-medium text-accent">Dark. Cinematic.</p>
            </div>
            <div className="stagger-item p-6 border border-accent/30 rounded-lg bg-accent/5">
              <p className="text-lg font-medium text-accent">Data-driven.</p>
            </div>
            <div className="stagger-item p-6 border border-accent/30 rounded-lg bg-accent/5">
              <p className="text-lg font-medium text-accent">Fast. Beautiful.</p>
            </div>
          </div>
          <p className="text-xl text-foreground-muted fade-up pt-8">
            Websites that feel like the medium you work in.
          </p>
        </div>
      </section>

      {/* What LGM Gets */}
      <section id="lgm-features" className="py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold mb-16 fade-up">
            What Looking Glass Media gets
          </h2>
          <div className="space-y-24 stagger-container">
            <FeatureBeat
              title="An interactive stats page"
              description="That makes the case for cinema in 30 seconds. Animated. Shareable. Built for your sales team to use every single day."
            />
            <FeatureBeat
              title="In-theater lead capture"
              description="A QR code in your own preshow ad. Scan. Submit. Watch the movie. Stats kit in their inbox an hour later. It's not just a lead capture tool — it's a live proof of concept."
            />
            <FeatureBeat
              title="Text-to-info flow"
              description="Text BIGSCREEN to 55555. They text during the preshow. Enjoy the movie. Everything they need is in their pocket by the time the credits roll."
            />
            <FeatureBeat
              title="Smart ad upload"
              description="Already have an ad? Upload it. Don't have one? We'll show you exactly what we'll build. Plain-English specs. Drag-and-drop. No back-and-forth."
            />
            <FeatureBeat
              title="Automated follow-up"
              description="Every form, every scan, every text triggers a smart email sequence. The right stat at the right moment. A testimonial that hits close to their industry. Built once. Runs forever."
            />
            <FeatureBeat
              title="Stats Kit PDF"
              description="A designed leave-behind your team can send, share, and forward. Not a brochure. A weapon."
            />
          </div>
        </div>
      </section>

      {/* What PPP Gets */}
      <section id="ppp-features" className="py-32 px-4 bg-surface-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold mb-16 fade-up">
            What Pecan Pie Productions gets
          </h2>
          <div className="space-y-24 stagger-container">
            <FeatureBeat
              title="A real creative showcase"
              description="PPP has produced thousands of ads. The new site shows them off. Organized by industry. Cinematic viewing experience. This page alone is worth the project."
            />
            <FeatureBeat
              title="Dual-audience intelligence"
              description="Advertisers and theater operators see completely different sites. Same URL. Two perfectly tuned sales experiences."
            />
            <FeatureBeat
              title="Theater revenue model — explained"
              description="Theater operators will finally understand exactly how the partnership works — and why they should say yes."
            />
            <FeatureBeat
              title="Social proof done right"
              description="Penn Cinema. 18 years. Lucas Cinemas. 'Big-agency capability, small-business heart.' Spotlight Theaters. 10+ years. These testimonials deserve more than a Webflow carousel."
            />
          </div>
        </div>
      </section>

      {/* The Shared Ecosystem */}
      <section id="ecosystem" className="py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold mb-16 fade-up">
            The shared ecosystem
          </h2>
          <div className="space-y-24 stagger-container">
            <FeatureBeat
              title="Shared content library"
              description="One testimonial library. One logo library. One stats engine. Update once. Both sites update instantly."
            />
            <FeatureBeat
              title="Simple admin dashboard"
              description="Add a testimonial. Upload a logo. Change a stat. Publish a new ad. A clean, simple tool built for you — not a bloated CMS built for everyone."
            />
            <FeatureBeat
              title="Live industry data (Phase 2)"
              description="Box office numbers. Upcoming releases. Industry headlines. Your sites stay current without anyone writing a blog post."
            />
          </div>
        </div>
      </section>

      {/* The Numbers */}
      <section id="numbers" className="py-32 px-4 bg-gradient-to-b from-background to-surface-900">
        <div className="max-w-4xl mx-auto space-y-24">
          <h2 className="text-3xl md:text-4xl font-semibold fade-up">
            The investment
          </h2>

          {/* Current vs New Costs */}
          <div className="grid md:grid-cols-2 gap-8 stagger-container">
            <div className="stagger-item p-8 border border-error/30 rounded-lg bg-error/5">
              <h3 className="text-sm font-medium text-error mb-4">CURRENT ANNUAL PLATFORM COSTS</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground-muted">GoDaddy + WordPress (LGM)</span>
                  <span>$150–$440</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Webflow + Workspace (PPP)</span>
                  <span>$290–$1,000</span>
                </div>
                <div className="pt-3 border-t border-error/20 flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-error">$440–$1,440+/year</span>
                </div>
              </div>
            </div>
            <div className="stagger-item p-8 border border-success/30 rounded-lg bg-success/5">
              <h3 className="text-sm font-medium text-success mb-4">NEW ANNUAL PLATFORM COSTS</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Hosting (both sites)</span>
                  <span>$0–$240</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">SSL + CMS</span>
                  <span>$0</span>
                </div>
                <div className="pt-3 border-t border-success/20 flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-success">$30–$378/year</span>
                </div>
              </div>
            </div>
          </div>

          {/* ROI Statement */}
          <div className="text-center space-y-6 fade-up">
            <p className="text-xl text-foreground-muted">
              But the real return isn&apos;t in hosting savings.
            </p>
            <p className="text-2xl md:text-3xl font-medium">
              One additional client per quarter =
              <br />
              <span className="text-accent">the entire project paid for in month one.</span>
            </p>
          </div>

          {/* Agency Comparison */}
          <div className="p-8 border border-border rounded-lg fade-up">
            <h3 className="text-sm font-medium text-foreground-subtle mb-6">WHAT THIS WOULD COST AT AN AGENCY</h3>
            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Strategy & wireframes</span>
                <span>$5,000–$10,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Design (2 sites)</span>
                <span>$8,000–$15,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Development</span>
                <span>$15,000–$30,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Admin dashboard</span>
                <span>$3,000–$8,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">QR, SMS, email automation</span>
                <span>$3,000–$6,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Stats Kit PDF + QA</span>
                <span>$3,500–$7,000</span>
              </div>
              <div className="pt-3 border-t border-border flex justify-between font-medium text-base">
                <span>Typical total</span>
                <span className="text-foreground-subtle">$37,500–$76,000</span>
              </div>
            </div>
            <p className="text-xl text-center font-medium text-accent">
              I&apos;m not proposing anything close to those numbers.
            </p>
          </div>
        </div>
      </section>

      {/* The Offer */}
      <section id="offer" className="py-32 px-4">
        <div className="max-w-4xl mx-auto space-y-16">
          <h2 className="text-3xl md:text-4xl font-semibold fade-up">
            The offer
          </h2>

          {/* What's Included */}
          <div className="p-8 border border-accent/30 rounded-lg bg-accent/5 fade-up">
            <h3 className="text-sm font-medium text-accent mb-6">EVERYTHING INCLUDED</h3>
            <ul className="grid md:grid-cols-2 gap-3 text-sm text-foreground-muted">
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                Research, strategy, wireframes (complete)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                Visual design system (2 rounds)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                Full development of both sites
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                Shared content library architecture
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                Simple admin dashboard
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                LGM in-theater QR capture
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                LGM text-to-info SMS flow
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                LGM automated email sequence
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                LGM Stats Kit PDF
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                PPP creative showcase
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                PPP dual-audience routing
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                30 days post-launch support
              </li>
            </ul>
          </div>

          {/* Price */}
          <div className="text-center space-y-8 fade-up">
            <div className="space-y-2">
              <p className="text-5xl md:text-7xl font-semibold text-accent">
                {formatCurrency((project.deposit_amount || 0) + (project.final_amount || 0))}
              </p>
              <p className="text-lg text-foreground-muted">total project investment</p>
            </div>
            <div className="flex justify-center gap-8 text-sm">
              <div>
                <p className="font-medium">{formatCurrency(project.deposit_amount || 0)}</p>
                <p className="text-foreground-subtle">deposit to begin</p>
              </div>
              <div>
                <p className="font-medium">{formatCurrency(project.final_amount || 0)}</p>
                <p className="text-foreground-subtle">on completion</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-8 border border-border rounded-lg fade-up">
            <h3 className="text-sm font-medium text-foreground-subtle mb-6">TIMELINE</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Research & wireframes</span>
                <span className="text-success">✓ Complete</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Design direction</span>
                <span>1 week</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Design + development</span>
                <span>3–4 weeks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">QA + launch</span>
                <span>1 week</span>
              </div>
              <div className="pt-3 border-t border-border flex justify-between font-medium">
                <span>Total</span>
                <span>~5–6 weeks from go</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-6 py-8 fade-up">
            <h3 className="text-2xl md:text-3xl font-semibold">Ready to start?</h3>
            <Button
              size="lg"
              onClick={handleCheckout}
              isLoading={isCheckoutLoading}
              className="text-lg px-8 py-4"
            >
              Accept & Pay Deposit — {formatCurrency(project.deposit_amount || 0)}
            </Button>
            <p className="text-sm text-foreground-subtle">
              Questions? Email dylan@mondayandpartners.com
            </p>
          </div>

          {/* Terms */}
          <div className="text-xs text-foreground-subtle space-y-2 pt-8 border-t border-border fade-up">
            <p><strong>Terms:</strong></p>
            <ul className="space-y-1 list-disc list-inside">
              <li>50% deposit due on acceptance, 50% due on completion approval</li>
              <li>2 rounds of design revision included</li>
              <li>30 days post-launch support included</li>
              <li>Client provides: content assets, brand files, testimonial approvals, ad samples</li>
              <li>Hosting migration and domain configuration included</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" href={undefined} />
          <p className="text-xs text-foreground-subtle">
            © 2026 Monday + Partners. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Animated Stat Card Component
function StatCard({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const countRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!countRef.current || hasAnimated.current) return;

    const trigger = ScrollTrigger.create({
      trigger: countRef.current,
      start: "top 80%",
      onEnter: () => {
        if (hasAnimated.current) return;
        hasAnimated.current = true;

        gsap.fromTo(
          countRef.current,
          { innerText: 0 },
          {
            innerText: value,
            duration: 1.5,
            ease: "power2.out",
            snap: { innerText: 1 },
            onUpdate: function () {
              if (countRef.current) {
                countRef.current.innerText = Math.round(
                  Number(countRef.current.innerText)
                ).toString();
              }
            },
          }
        );
      },
    });

    return () => trigger.kill();
  }, [value]);

  return (
    <div className="stagger-item text-center p-8 border border-accent/30 rounded-lg bg-accent/5">
      <p className="text-5xl md:text-6xl font-semibold text-accent mb-2">
        <span ref={countRef}>0</span>
        <span>{suffix}</span>
      </p>
      <p className="text-sm text-foreground-muted">{label}</p>
    </div>
  );
}

// Feature Beat Component
function FeatureBeat({ title, description }: { title: string; description: string }) {
  return (
    <div className="stagger-item space-y-4">
      <h3 className="text-xl md:text-2xl font-medium text-accent">
        &ldquo;{title}&rdquo;
      </h3>
      <p className="text-lg text-foreground-muted leading-relaxed max-w-2xl">
        {description}
      </p>
    </div>
  );
}
