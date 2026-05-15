"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { MonoLabel } from "./typography";

/* ═══════════════════════════════════════════════════════════════════════════
   Stat Display Components — Drafting Table Design System
   ═══════════════════════════════════════════════════════════════════════════ */

interface StatProps {
  value: number | string;
  suffix?: string;
  prefix?: string;
  label: string;
  source?: string;
  position?: "left" | "center" | "right";
  size?: "md" | "lg" | "xl";
  animate?: boolean;
  className?: string;
}

/**
 * Stat — Large monospace statistic with leader line to label
 * Inspired by architectural annotations
 */
export function Stat({
  value,
  suffix = "",
  prefix = "",
  label,
  source,
  position = "left",
  size = "lg",
  animate = true,
  className,
}: StatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate || typeof value !== "number") return;
    if (!isInView) return;

    const duration = 1500;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value, animate]);

  const sizeClasses = {
    md: "text-[clamp(1.5rem,4vw,2.25rem)]",
    lg: "text-[clamp(2rem,5vw,3rem)]",
    xl: "text-[clamp(2.5rem,6vw,4rem)]",
  };

  const positionClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex flex-col",
        positionClasses[position],
        className
      )}
    >
      {/* The number */}
      <div
        className={cn(
          "font-mono font-normal leading-none tracking-[-0.03em]",
          sizeClasses[size]
        )}
      >
        <span className="opacity-50">{prefix}</span>
        <span>{displayValue}</span>
        <span className="text-[#FF6B35]">{suffix}</span>
      </div>

      {/* Leader line + label */}
      <div className={cn(
        "mt-4 flex items-center gap-4",
        position === "right" && "flex-row-reverse",
        position === "center" && "justify-center"
      )}>
        {position !== "center" && (
          <div className="w-12 h-px bg-current/20" />
        )}
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-current/50">
          {label}
        </span>
      </div>

      {/* Source citation */}
      {source && (
        <span className="mt-2 font-mono text-[9px] text-current/30 tracking-wide">
          Source: {source}
        </span>
      )}
    </motion.div>
  );
}

interface StatGridProps {
  children: React.ReactNode;
  layout?: "scattered" | "row" | "stack";
  className?: string;
}

/**
 * StatGrid — Container for multiple stats with layout options
 */
export function StatGrid({ children, layout = "row", className }: StatGridProps) {
  if (layout === "scattered") {
    return (
      <div
        className={cn(
          "relative min-h-[60vh] md:min-h-[80vh]",
          className
        )}
      >
        {children}
      </div>
    );
  }

  if (layout === "stack") {
    return (
      <div className={cn("flex flex-col gap-12 md:gap-20", className)}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * ScatteredStat — Stat positioned absolutely within a scattered grid
 * Use within StatGrid layout="scattered"
 */
interface ScatteredStatProps extends StatProps {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
}

export function ScatteredStat({
  top,
  left,
  right,
  bottom,
  className,
  ...props
}: ScatteredStatProps) {
  return (
    <div
      className={cn("absolute", className)}
      style={{ top, left, right, bottom }}
    >
      <Stat {...props} />
    </div>
  );
}

interface ComparisonBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: "default" | "success" | "error";
  showValue?: boolean;
  className?: string;
}

/**
 * ComparisonBar — Horizontal bar for cost/value comparisons
 */
export function ComparisonBar({
  label,
  value,
  maxValue = 100,
  color = "default",
  showValue = true,
  className,
}: ComparisonBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const percentage = Math.min((value / maxValue) * 100, 100);

  const colorClasses = {
    default: "bg-white/80",
    success: "bg-[#D4A843]", // Gold - new/good
    error: "bg-[#8B5A3C]", // Muted rust - current/old
  };

  return (
    <div ref={ref} className={cn("space-y-2", className)}>
      <div className="flex justify-between items-baseline">
        <MonoLabel>{label}</MonoLabel>
        {showValue && (
          <span className="font-mono text-sm tabular-nums">${value.toLocaleString()}</span>
        )}
      </div>
      <div className="relative h-2 bg-current/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${percentage}%` } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className={cn("absolute inset-y-0 left-0", colorClasses[color])}
        />
      </div>
    </div>
  );
}

interface CostComparisonProps {
  currentCosts: { label: string; min: number; max: number }[];
  newCosts: { label: string; min: number; max: number }[];
  className?: string;
}

/**
 * CostComparison — Side-by-side or stacked cost comparison visualization
 */
export function CostComparison({
  currentCosts,
  newCosts,
  className,
}: CostComparisonProps) {
  const currentTotal = currentCosts.reduce((sum, c) => sum + c.max, 0);
  const newTotal = newCosts.reduce((sum, c) => sum + c.max, 0);
  const maxValue = Math.max(currentTotal, newTotal);

  return (
    <div className={cn("grid md:grid-cols-2 gap-12", className)}>
      {/* Current costs */}
      <div className="space-y-6">
        <MonoLabel className="text-[#8B5A3C]">Current Annual Costs</MonoLabel>
        <div className="space-y-4">
          {currentCosts.map((cost) => (
            <ComparisonBar
              key={cost.label}
              label={cost.label}
              value={cost.max}
              maxValue={maxValue}
              color="error"
            />
          ))}
        </div>
        <div className="pt-4 border-t border-current/10 flex justify-between">
          <MonoLabel>Total</MonoLabel>
          <span className="font-mono text-lg text-[#8B5A3C]">
            ${currentTotal.toLocaleString()}+/yr
          </span>
        </div>
      </div>

      {/* New costs */}
      <div className="space-y-6">
        <MonoLabel className="text-[#D4A843]">New Annual Costs</MonoLabel>
        <div className="space-y-4">
          {newCosts.map((cost) => (
            <ComparisonBar
              key={cost.label}
              label={cost.label}
              value={cost.max}
              maxValue={maxValue}
              color="success"
            />
          ))}
        </div>
        <div className="pt-4 border-t border-current/10 flex justify-between">
          <MonoLabel>Total</MonoLabel>
          <span className="font-mono text-lg text-[#D4A843]">
            ${newTotal.toLocaleString()}/yr
          </span>
        </div>
      </div>
    </div>
  );
}
