"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   Layout Components — Drafting Table Design System
   ═══════════════════════════════════════════════════════════════════════════ */

interface SectionProps extends HTMLAttributes<HTMLElement> {
  theme?: "dark" | "cream" | "light";
  fullHeight?: boolean;
  gridBg?: boolean;
}

/**
 * Section — Full-width content section
 * Supports theme switching for alternating visual rhythm
 */
export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className, theme = "dark", fullHeight, gridBg, children, ...props }, ref) => (
    <section
      ref={ref}
      data-theme={theme}
      className={cn(
        "relative w-full",
        "py-[clamp(3rem,8vh,6rem)]",
        fullHeight && "min-h-[80vh] flex flex-col justify-center",
        gridBg && [
          "before:absolute before:inset-0 before:pointer-events-none before:-z-10",
          "before:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]",
          "before:bg-[size:60px_60px]",
        ],
        theme === "dark" && "bg-black text-white",
        theme === "cream" && "bg-[#F5F0E8] text-black",
        theme === "light" && "bg-white text-black",
        className
      )}
      {...props}
    >
      {children}
    </section>
  )
);
Section.displayName = "Section";

/**
 * Container — Centered max-width container
 */
export const Container = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "w-full max-w-[1400px] mx-auto",
        "px-[clamp(1.5rem,5vw,4rem)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Container.displayName = "Container";

interface SplitProps extends HTMLAttributes<HTMLDivElement> {
  ratio?: "50-50" | "60-40" | "40-60" | "70-30" | "30-70";
  reverse?: boolean;
  align?: "start" | "center" | "end" | "stretch";
}

/**
 * Split — Two-column asymmetric layout
 */
export const Split = forwardRef<HTMLDivElement, SplitProps>(
  ({ className, ratio = "50-50", reverse, align = "start", children, ...props }, ref) => {
    const ratioClasses: Record<string, string> = {
      "50-50": "grid-cols-1 md:grid-cols-2",
      "60-40": "grid-cols-1 md:grid-cols-[3fr_2fr]",
      "40-60": "grid-cols-1 md:grid-cols-[2fr_3fr]",
      "70-30": "grid-cols-1 md:grid-cols-[7fr_3fr]",
      "30-70": "grid-cols-1 md:grid-cols-[3fr_7fr]",
    };

    const alignClasses: Record<string, string> = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "grid gap-8 md:gap-12",
          ratioClasses[ratio],
          alignClasses[align],
          reverse && "md:[direction:rtl] md:*:[direction:ltr]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Split.displayName = "Split";

/**
 * Stack — Vertical flex container with consistent spacing
 */
interface StackProps extends HTMLAttributes<HTMLDivElement> {
  gap?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ className, gap = "md", children, ...props }, ref) => {
    const gapClasses: Record<string, string> = {
      xs: "gap-2",
      sm: "gap-4",
      md: "gap-6",
      lg: "gap-8",
      xl: "gap-12",
      "2xl": "gap-16",
    };

    return (
      <div
        ref={ref}
        className={cn("flex flex-col", gapClasses[gap], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Stack.displayName = "Stack";

/**
 * RailOffset — Content area that accounts for vertical rail navigation
 */
export const RailOffset = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "md:pl-[calc(48px+2rem)]", // Rail width + gap
        "pb-16 md:pb-0", // Mobile bottom nav offset
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
RailOffset.displayName = "RailOffset";

/**
 * Hairline — Thin decorative rule
 */
interface HairlineProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  accent?: boolean;
}

export const Hairline = forwardRef<HTMLDivElement, HairlineProps>(
  ({ className, orientation = "horizontal", accent, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        orientation === "horizontal" ? "w-full h-px" : "w-px h-full",
        accent ? "bg-[#FF6B35]/30" : "bg-current/10",
        className
      )}
      {...props}
    />
  )
);
Hairline.displayName = "Hairline";

/**
 * AspectBox — Fixed aspect ratio container
 */
interface AspectBoxProps extends HTMLAttributes<HTMLDivElement> {
  ratio?: "1:1" | "4:3" | "16:9" | "21:9";
}

export const AspectBox = forwardRef<HTMLDivElement, AspectBoxProps>(
  ({ className, ratio = "16:9", children, ...props }, ref) => {
    const ratioClasses: Record<string, string> = {
      "1:1": "aspect-square",
      "4:3": "aspect-[4/3]",
      "16:9": "aspect-video",
      "21:9": "aspect-[21/9]",
    };

    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden", ratioClasses[ratio], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
AspectBox.displayName = "AspectBox";

/**
 * Bleed — Content that bleeds beyond container
 */
interface BleedProps extends HTMLAttributes<HTMLDivElement> {
  side?: "left" | "right" | "both";
}

export const Bleed = forwardRef<HTMLDivElement, BleedProps>(
  ({ className, side = "both", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative",
        side === "left" && "-ml-[clamp(1.5rem,5vw,4rem)]",
        side === "right" && "-mr-[clamp(1.5rem,5vw,4rem)]",
        side === "both" && "-mx-[clamp(1.5rem,5vw,4rem)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Bleed.displayName = "Bleed";
