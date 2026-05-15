"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { MonoLabel } from "./typography";

/* ═══════════════════════════════════════════════════════════════════════════
   Feature Row Components — Drafting Table Design System
   ═══════════════════════════════════════════════════════════════════════════ */

interface FeatureRowProps {
  number: string | number;
  title: string;
  description: string;
  highlight?: string;
  footnote?: string;
  align?: "left" | "right";
  className?: string;
}

/**
 * FeatureRow — Full-width horizontal feature strip
 * Alternating alignment creates visual rhythm
 */
export function FeatureRow({
  number,
  title,
  description,
  highlight,
  footnote,
  align = "left",
  className,
}: FeatureRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  const formattedNumber = typeof number === "number"
    ? String(number).padStart(2, "0")
    : number;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative py-6 border-b border-current/5",
        "hover:bg-current/[0.02] transition-colors duration-300",
        className
      )}
    >
      <div
        className={cn(
          "grid gap-4 md:gap-8",
          align === "left"
            ? "md:grid-cols-[48px_200px_1fr]"
            : "md:grid-cols-[1fr_200px_48px]"
        )}
      >
        {/* Number */}
        <div className={cn(
          "flex items-start",
          align === "right" && "md:order-3 md:justify-end"
        )}>
          <span className="font-mono text-[#FF6B35] text-xs tracking-wide">
            {formattedNumber}
          </span>
        </div>

        {/* Title + Highlight */}
        <div className={cn(
          "flex flex-col gap-1",
          align === "right" && "md:order-2"
        )}>
          <h3 className="font-sans text-base md:text-lg font-medium leading-snug group-hover:text-[#FF6B35] transition-colors duration-300">
            {title}
          </h3>
          {highlight && (
            <span className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.15em] text-current/40">
              <span className="w-3 h-px bg-current/20" />
              {highlight}
            </span>
          )}
        </div>

        {/* Description */}
        <div className={cn(
          "flex flex-col gap-1",
          align === "right" && "md:order-1"
        )}>
          <p className="text-sm text-current/60 leading-relaxed">
            {description}
          </p>
          {footnote && (
            <span className="text-[10px] text-current/30 font-mono">
              {footnote}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface FeatureListProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  showLine?: boolean;
}

/**
 * FeatureList — Container for multiple feature rows
 * Includes optional vertical connector line
 */
export const FeatureList = forwardRef<HTMLDivElement, FeatureListProps>(
  ({ className, label, showLine = true, children, ...props }, ref) => (
    <div ref={ref} className={cn("relative", className)} {...props}>
      {/* Section label */}
      {label && (
        <div className="mb-8">
          <MonoLabel className="text-[#FF6B35]">{label}</MonoLabel>
        </div>
      )}

      {/* Vertical connector line */}
      {showLine && (
        <div className="absolute left-[23px] top-12 bottom-0 w-px bg-current/5 hidden md:block" />
      )}

      {/* Features */}
      <div className="relative">
        {children}
      </div>
    </div>
  )
);
FeatureList.displayName = "FeatureList";

interface ChecklistItemProps {
  children: React.ReactNode;
  checked?: boolean;
  className?: string;
}

/**
 * ChecklistItem — Simple checklist item with registration mark
 */
export function ChecklistItem({
  children,
  checked = true,
  className
}: ChecklistItemProps) {
  return (
    <div className={cn(
      "flex items-start gap-3 py-2",
      className
    )}>
      <span className={cn(
        "text-sm mt-0.5",
        checked ? "text-[#FF6B35]" : "text-current/30"
      )}>
        {checked ? "+" : "○"}
      </span>
      <span className="text-sm text-current/70">{children}</span>
    </div>
  );
}

interface TimelineRowProps {
  phase: string;
  duration: string;
  complete?: boolean;
  className?: string;
}

/**
 * TimelineRow — Simple timeline phase indicator
 */
export function TimelineRow({
  phase,
  duration,
  complete = false,
  className,
}: TimelineRowProps) {
  return (
    <div className={cn(
      "flex items-center justify-between py-3 border-b border-current/5",
      className
    )}>
      <div className="flex items-center gap-3">
        <span className={cn(
          "w-2 h-2 rounded-full",
          complete ? "bg-[#00C853]" : "bg-current/20"
        )} />
        <span className="text-sm">{phase}</span>
      </div>
      <span className={cn(
        "font-mono text-sm tabular-nums",
        complete ? "text-[#00C853]" : "text-current/50"
      )}>
        {duration}
      </span>
    </div>
  );
}

/**
 * Timeline — Container for timeline rows
 */
export function Timeline({
  children,
  className,
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("border-t border-current/5", className)}>
      {children}
    </div>
  );
}
