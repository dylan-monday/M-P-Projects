"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   Typography Components — Drafting Table Design System
   ═══════════════════════════════════════════════════════════════════════════ */

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Display XL — Large headlines (48-72px)
 * Use for hero titles, dramatic statements
 */
export const DisplayXL = forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, as: Component = "h1", children, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        "font-sans font-bold leading-[0.9] tracking-[-0.02em]",
        "text-[clamp(2.5rem,6vw,4.5rem)]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
);
DisplayXL.displayName = "DisplayXL";

/**
 * Display LG — Section headlines (36-56px)
 */
export const DisplayLG = forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, as: Component = "h2", children, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        "font-sans font-bold leading-[0.95] tracking-[-0.02em]",
        "text-[clamp(2.25rem,5vw,3.5rem)]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
);
DisplayLG.displayName = "DisplayLG";

/**
 * Display MD — Section titles (24-36px)
 */
export const DisplayMD = forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, as: Component = "h3", children, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        "font-sans font-medium leading-[1.1] tracking-[-0.01em]",
        "text-[clamp(1.5rem,3.5vw,2.25rem)]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
);
DisplayMD.displayName = "DisplayMD";

/**
 * Display SM — Subsection titles (18-24px)
 */
export const DisplaySM = forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, as: Component = "h4", children, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        "font-sans font-medium leading-[1.2]",
        "text-[clamp(1.125rem,2.5vw,1.5rem)]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
);
DisplaySM.displayName = "DisplaySM";

/**
 * Body LG — Large body text
 */
export const BodyLG = forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, as: Component = "p", children, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        "font-sans font-normal leading-[1.7] text-[1.25rem]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
);
BodyLG.displayName = "BodyLG";

/**
 * Body — Standard body text
 */
export const Body = forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, as: Component = "p", children, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn("font-sans font-normal leading-[1.6] text-base", className)}
      {...props}
    >
      {children}
    </Component>
  )
);
Body.displayName = "Body";

/**
 * Body SM — Small body text
 */
export const BodySM = forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, as: Component = "p", children, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        "font-sans font-normal leading-[1.5] text-sm",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
);
BodySM.displayName = "BodySM";

/**
 * MonoLabel — Uppercase monospace labels
 * Use for section identifiers, metadata, timestamps
 */
export const MonoLabel = forwardRef<HTMLSpanElement, TypographyProps>(
  ({ className, as: Component = "span", children, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.2em] text-current/60",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
);
MonoLabel.displayName = "MonoLabel";

/**
 * MonoData — Large monospace numbers
 * Use for stats, prices, metrics
 */
export const MonoData = forwardRef<HTMLSpanElement, TypographyProps>(
  ({ className, as: Component = "span", children, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        "font-mono text-[clamp(2rem,5vw,3rem)] font-normal leading-none tracking-[-0.02em]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
);
MonoData.displayName = "MonoData";

/**
 * OutlineText — Stroke-only text
 * Use for dramatic statements, background elements
 */
export const OutlineText = forwardRef<HTMLSpanElement, TypographyProps>(
  ({ className, as: Component = "span", children, style, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        "font-sans font-bold",
        className
      )}
      style={{
        WebkitTextStroke: "1.5px currentColor",
        WebkitTextFillColor: "transparent",
        paintOrder: "stroke fill",
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  )
);
OutlineText.displayName = "OutlineText";

/**
 * LeaderText — Text with trailing leader line
 * Use for labels that need visual connection
 */
export function LeaderText({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center gap-4",
        "after:content-[''] after:flex-1 after:h-px after:bg-current/10",
        className
      )}
      {...props}
    >
      <span>{children}</span>
    </div>
  );
}

/**
 * RegistrationMark — Text with registration mark prefix
 * Use for feature labels, list items
 */
export function RegistrationMark({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("flex items-center gap-2", className)} {...props}>
      <span className="text-[0.75em] opacity-40">+</span>
      {children}
    </span>
  );
}
