-- ============================================
-- Migration 002 — Add proposal approval fields
-- ============================================
-- Run in Supabase SQL Editor (Dashboard → SQL Editor)
-- Adds approval tracking to projects table so the client area
-- can display "Approved" state and we persist the approval
-- artifact (approver name, timestamp, total, support choice).

ALTER TABLE projects ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS approver_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS approval_total INTEGER; -- in cents
ALTER TABLE projects ADD COLUMN IF NOT EXISTS year_1_support_included BOOLEAN;

-- Helpful index for "is this proposal approved?" lookups
CREATE INDEX IF NOT EXISTS idx_projects_approved_at ON projects(approved_at);
