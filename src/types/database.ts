/**
 * Database Types for Monday + Partners Client Portal
 * Matches the Supabase schema
 */

export type ProjectStatus =
  | "proposal"
  | "awaiting_deposit"
  | "in_progress"
  | "review"
  | "complete";

export type DeliverableType = "file" | "link";

export interface Client {
  id: string;
  email: string;
  name: string;
  company: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  client_id: string;
  status: ProjectStatus;
  deposit_amount: number; // in cents
  deposit_stripe_price_id: string | null;
  deposit_stripe_session_id: string | null;
  deposit_paid: boolean;
  deposit_paid_at: string | null;
  final_amount: number; // in cents
  final_stripe_price_id: string | null;
  final_stripe_session_id: string | null;
  final_paid: boolean;
  final_paid_at: string | null;
  proposal_pdf_url: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  client?: Client;
  milestones?: Milestone[];
  deliverables?: Deliverable[];
  notes?: Note[];
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  completed: boolean;
  completed_at: string | null;
  sort_order: number;
}

export interface Deliverable {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  type: DeliverableType;
  url: string;
  visible: boolean;
  sort_order: number;
  created_at: string;
}

export interface Note {
  id: string;
  project_id: string;
  content: string;
  author: string;
  created_at: string;
}

/**
 * Insert types (without auto-generated fields)
 */
export interface ClientInsert {
  email: string;
  name: string;
  company?: string | null;
}

export interface ProjectInsert {
  slug: string;
  title: string;
  client_id: string;
  status?: ProjectStatus;
  deposit_amount: number;
  deposit_stripe_price_id?: string | null;
  final_amount: number;
  final_stripe_price_id?: string | null;
}

export interface MilestoneInsert {
  project_id: string;
  title: string;
  completed?: boolean;
  completed_at?: string | null;
  sort_order?: number;
}

export interface DeliverableInsert {
  project_id: string;
  title: string;
  type?: DeliverableType;
  url: string;
  visible?: boolean;
  sort_order?: number;
}

export interface NoteInsert {
  project_id: string;
  content: string;
  author?: string;
}

/**
 * Update types (all fields optional except id)
 */
export interface ProjectUpdate {
  slug?: string;
  title?: string;
  status?: ProjectStatus;
  deposit_amount?: number;
  deposit_stripe_price_id?: string | null;
  deposit_stripe_session_id?: string | null;
  deposit_paid?: boolean;
  deposit_paid_at?: string | null;
  final_amount?: number;
  final_stripe_price_id?: string | null;
  final_stripe_session_id?: string | null;
  final_paid?: boolean;
  final_paid_at?: string | null;
  proposal_pdf_url?: string | null;
}

export interface MilestoneUpdate {
  title?: string;
  completed?: boolean;
  completed_at?: string | null;
  sort_order?: number;
}

export interface DeliverableUpdate {
  title?: string;
  type?: DeliverableType;
  url?: string;
  visible?: boolean;
  sort_order?: number;
}

/**
 * Database response types
 */
export interface DatabaseError {
  message: string;
  code?: string;
}

export type DatabaseResult<T> =
  | { data: T; error: null }
  | { data: null; error: DatabaseError };
