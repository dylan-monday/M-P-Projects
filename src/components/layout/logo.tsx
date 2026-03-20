"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
  showText?: boolean;
}

const sizeMap = {
  sm: { width: 32, height: 32 },
  md: { width: 40, height: 40 },
  lg: { width: 56, height: 56 },
};

export function Logo({
  className,
  size = "md",
  href = "/",
  showText = false,
}: LogoProps) {
  const { width, height } = sizeMap[size];

  const content = (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/brand/MP26.svg"
        alt="Monday + Partners"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
      {showText && (
        <span className="text-foreground font-medium text-sm tracking-tight">
          Monday + Partners
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="hover:opacity-80 transition-opacity"
        aria-label="Monday + Partners - Home"
      >
        {content}
      </Link>
    );
  }

  return content;
}
