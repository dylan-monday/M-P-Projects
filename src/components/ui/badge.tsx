import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default: "bg-surface-700 text-surface-200",
        proposal: "bg-brand-500 text-white",
        awaiting: "bg-accent-500 text-surface-950",
        progress: "bg-info text-white",
        review: "bg-warning text-surface-950",
        complete: "bg-success text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

/**
 * Map project status to badge variant
 */
const statusVariantMap: Record<ProjectStatus, VariantProps<typeof badgeVariants>["variant"]> = {
  proposal: "proposal",
  awaiting_deposit: "awaiting",
  in_progress: "progress",
  review: "review",
  complete: "complete",
};

/**
 * Map project status to display label
 */
const statusLabelMap: Record<ProjectStatus, string> = {
  proposal: "Proposal",
  awaiting_deposit: "Awaiting Deposit",
  in_progress: "In Progress",
  review: "Review",
  complete: "Complete",
};

interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: ProjectStatus;
}

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  return (
    <Badge
      variant={statusVariantMap[status]}
      className={className}
      {...props}
    >
      {statusLabelMap[status]}
    </Badge>
  );
}

export { Badge, StatusBadge, badgeVariants };
