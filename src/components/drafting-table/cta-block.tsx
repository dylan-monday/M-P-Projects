"use client";

import { forwardRef, type ButtonHTMLAttributes, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MonoLabel } from "./typography";

/* ═══════════════════════════════════════════════════════════════════════════
   CTA Components — Drafting Table Design System
   ═══════════════════════════════════════════════════════════════════════════ */

interface CTABlockProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "default" | "accent";
}

/**
 * CTABlock — Full-width call-to-action block
 * The button IS the section — takes over the entire width
 */
export const CTABlock = forwardRef<HTMLButtonElement, CTABlockProps>(
  ({ className, children, isLoading, variant = "default", disabled, ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative w-full min-h-[120px] px-8 py-10",
          "flex items-center justify-center gap-4",
          "font-mono text-sm uppercase tracking-[0.2em]",
          "transition-colors duration-500 cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variant === "default" && "bg-white text-black hover:bg-[#FF6B35]",
          variant === "accent" && "bg-[#FF6B35] text-black hover:bg-white",
          className
        )}
        {...props}
      >
        {/* Animated background sweep */}
        <motion.div
          initial={false}
          animate={{
            scaleX: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "absolute inset-0 origin-left -z-10",
            variant === "default" ? "bg-[#FF6B35]" : "bg-white"
          )}
        />

        {isLoading ? (
          <span className="flex items-center gap-3">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            />
            Processing...
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);
CTABlock.displayName = "CTABlock";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outline" | "solid" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

/**
 * Button — Standard button with drafting table styling
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "outline", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base",
    };

    const variantClasses = {
      outline: "border border-current bg-transparent hover:bg-current hover:text-[var(--dt-bg)]",
      solid: "bg-current text-[var(--dt-bg)] hover:opacity-80",
      ghost: "bg-transparent hover:bg-current/10",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "font-mono uppercase tracking-[0.15em]",
          "transition-all duration-300",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

interface PriceDisplayProps {
  amount: number;
  currency?: string;
  label?: string;
  sublabel?: string;
  size?: "md" | "lg" | "xl";
  className?: string;
}

/**
 * PriceDisplay — Large price display
 * Prominent but contained within viewport
 */
export function PriceDisplay({
  amount,
  currency = "$",
  label,
  sublabel,
  size = "xl",
  className,
}: PriceDisplayProps) {
  const sizeClasses = {
    md: "text-[clamp(1.75rem,4vw,2.5rem)]",
    lg: "text-[clamp(2.5rem,6vw,4rem)]",
    xl: "text-[clamp(3rem,8vw,5rem)]",
  };

  // Amount is in cents, convert to dollars
  const formattedAmount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100);

  return (
    <div className={cn("text-center", className)}>
      {/* Currency symbol as registration mark */}
      <div className="font-mono text-[#FF6B35] text-lg md:text-2xl mb-2">
        {currency}
      </div>

      {/* The amount */}
      <div
        className={cn(
          "font-mono font-normal leading-none tracking-[-0.03em]",
          sizeClasses[size]
        )}
      >
        {formattedAmount}
      </div>

      {/* Labels */}
      {label && (
        <div className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-current/50">
          {label}
        </div>
      )}
      {sublabel && (
        <div className="mt-1 text-sm text-current/30">
          {sublabel}
        </div>
      )}
    </div>
  );
}

interface PaymentSplitProps {
  deposit: number;
  final: number;
  currency?: string;
  className?: string;
}

/**
 * PaymentSplit — Deposit + Final payment display
 */
export function PaymentSplit({
  deposit,
  final,
  currency = "$",
  className,
}: PaymentSplitProps) {
  // Amounts are in cents, convert to dollars
  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100);

  return (
    <div className={cn(
      "flex justify-center gap-16 md:gap-24",
      className
    )}>
      <div className="text-center">
        <div className="font-mono text-2xl md:text-3xl">
          {currency}{formatAmount(deposit)}
        </div>
        <MonoLabel className="mt-2 block">Deposit to begin</MonoLabel>
      </div>

      <div className="w-px bg-current/10" />

      <div className="text-center">
        <div className="font-mono text-2xl md:text-3xl">
          {currency}{formatAmount(final)}
        </div>
        <MonoLabel className="mt-2 block">On completion</MonoLabel>
      </div>
    </div>
  );
}

interface AcceptTermsProps {
  terms: string[];
  className?: string;
}

/**
 * AcceptTerms — Terms summary before CTA
 */
export function AcceptTerms({ terms, className }: AcceptTermsProps) {
  return (
    <div className={cn(
      "py-6 border-t border-current/10 space-y-2",
      className
    )}>
      <MonoLabel className="mb-4 block">Terms</MonoLabel>
      {terms.map((term, i) => (
        <p key={i} className="text-xs text-current/40">{term}</p>
      ))}
    </div>
  );
}
