"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  label: string;
}

interface VerticalRailProps {
  sections: Section[];
  activeSection?: string;
  onNavigate?: (id: string) => void;
  className?: string;
}

export function VerticalRail({
  sections,
  activeSection,
  onNavigate,
  className,
}: VerticalRailProps) {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const handleClick = useCallback(
    (id: string) => {
      // Play subtle click sound
      if (typeof window !== "undefined") {
        const audio = new AudioContext();
        const now = audio.currentTime;
        const osc = audio.createOscillator();
        const gain = audio.createGain();

        osc.connect(gain);
        gain.connect(audio.destination);
        osc.frequency.setValueAtTime(880, now);
        osc.type = "sine";
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }

      if (onNavigate) {
        onNavigate(id);
      } else {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    },
    [onNavigate]
  );

  return (
    <>
      {/* Desktop Rail */}
      <nav
        className={cn(
          "fixed left-0 top-0 z-[100] hidden h-screen w-12 flex-col items-center justify-between py-8 md:flex",
          "bg-black/80 backdrop-blur-sm border-r border-white/[0.04]",
          className
        )}
      >
        {/* Logo mark at top */}
        <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center">
          <span className="text-[8px] font-mono text-white/60">M</span>
        </div>

        {/* Section indicators */}
        <div className="flex flex-col items-center gap-5">
          {sections.map((section, index) => {
            const isActive = activeSection === section.id;
            const isHovered = hoveredSection === section.id;

            return (
              <div
                key={section.id}
                className="relative flex items-center"
                onMouseEnter={() => setHoveredSection(section.id)}
                onMouseLeave={() => setHoveredSection(null)}
              >
                {/* Dot indicator */}
                <button
                  onClick={() => handleClick(section.id)}
                  className={cn(
                    "relative w-2.5 h-2.5 rounded-full border transition-all duration-300",
                    isActive
                      ? "bg-[#FF6B35] border-[#FF6B35] scale-125"
                      : "bg-transparent border-white/30 hover:border-white/60"
                  )}
                  aria-label={`Navigate to ${section.label}`}
                >
                  {/* Pulse ring for active */}
                  {isActive && (
                    <motion.span
                      className="absolute inset-0 rounded-full border border-[#FF6B35]"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </button>

                {/* Label on hover */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.span
                      initial={{ opacity: 0, x: -8, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -8, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-8 whitespace-nowrap text-[10px] font-mono uppercase tracking-wider text-white/70 bg-black/90 px-2 py-1 border border-white/10"
                    >
                      {String(index + 1).padStart(2, "0")} {section.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Section number at bottom */}
        <div className="text-[10px] font-mono text-white/30 tracking-wider">
          {sections.findIndex((s) => s.id === activeSection) + 1}/{sections.length}
        </div>
      </nav>

      {/* Mobile Bottom Rail */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[100] flex h-14 items-center justify-center gap-4 md:hidden",
          "bg-black/90 backdrop-blur-sm border-t border-white/[0.04]"
        )}
      >
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => handleClick(section.id)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                isActive
                  ? "bg-[#FF6B35] scale-150"
                  : "bg-white/30 hover:bg-white/50"
              )}
              aria-label={`Navigate to ${section.label}`}
            />
          );
        })}
      </nav>
    </>
  );
}

/**
 * Hook to track active section based on scroll position
 */
export function useActiveSection(sectionIds: string[]): string {
  const [activeSection, setActiveSection] = useState(sectionIds[0] || "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeSection;
}
