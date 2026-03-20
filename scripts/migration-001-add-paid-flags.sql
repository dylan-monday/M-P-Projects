-- Migration 001: Add paid boolean flags to projects table
-- Run this in Supabase SQL Editor after running schema.sql

-- Add deposit_paid column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT FALSE;

-- Add final_paid column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS final_paid BOOLEAN DEFAULT FALSE;

-- Rename payment_id to session_id for clarity (these store Stripe Checkout session IDs)
ALTER TABLE projects RENAME COLUMN deposit_stripe_payment_id TO deposit_stripe_session_id;
ALTER TABLE projects RENAME COLUMN final_stripe_payment_id TO final_stripe_session_id;

-- Update existing rows: if paid_at is set, mark as paid
UPDATE projects SET deposit_paid = TRUE WHERE deposit_paid_at IS NOT NULL;
UPDATE projects SET final_paid = TRUE WHERE final_paid_at IS NOT NULL;

-- Add description column to deliverables if not exists
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS description TEXT;
