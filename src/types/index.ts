export * from "./database";

/**
 * API Response types
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Stripe Checkout Session metadata
 */
export interface CheckoutMetadata {
  project_id: string;
  payment_type: "deposit" | "final";
  client_email: string;
}

/**
 * Auth types
 */
export interface AuthUser {
  id: string;
  email: string;
  isAdmin: boolean;
}

/**
 * Navigation types
 */
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

/**
 * Proposal section types
 */
export interface ProposalSection {
  id: string;
  title: string;
  scrollPosition?: number;
}

/**
 * Animation config types
 */
export interface AnimationConfig {
  duration?: number;
  delay?: number;
  ease?: string;
}

/**
 * Component variant types
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type BadgeVariant =
  | "default"
  | "proposal"
  | "awaiting"
  | "progress"
  | "review"
  | "complete";

export type CardVariant = "default" | "interactive" | "highlighted";
