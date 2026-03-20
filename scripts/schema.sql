-- ============================================
-- Monday + Partners — Client Portal Schema
-- projects.mondayandpartners.com
-- ============================================
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Clients (one per email, can have multiple projects)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,                    -- URL path: "lgm-ppp"
  title TEXT NOT NULL,                          -- "LGM + PPP Website Rebuild"
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'proposal' CHECK (status IN ('proposal', 'awaiting_deposit', 'in_progress', 'review', 'complete')),
  deposit_amount INTEGER,                       -- cents
  deposit_stripe_price_id TEXT,
  deposit_stripe_payment_id TEXT,
  deposit_paid_at TIMESTAMPTZ,
  final_amount INTEGER,                         -- cents
  final_stripe_price_id TEXT,
  final_stripe_payment_id TEXT,
  final_paid_at TIMESTAMPTZ,
  proposal_pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0
);

-- Deliverables
CREATE TABLE IF NOT EXISTS deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'link' CHECK (type IN ('file', 'link')),
  url TEXT NOT NULL,
  visible BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes (client-visible messages from Dylan)
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author TEXT DEFAULT 'Dylan',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_project_id ON deliverables(project_id);
CREATE INDEX IF NOT EXISTS idx_notes_project_id ON notes(project_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp on projects
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Admin email (update this to your admin email)
-- Note: This is also set via ADMIN_EMAIL env var for application logic
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.email() = 'dylan@mondayandpartners.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CLIENTS POLICIES
-- ============================================

-- Admin can do everything with clients
CREATE POLICY "Admin full access to clients"
  ON clients
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Clients can read their own record
CREATE POLICY "Clients can read own record"
  ON clients
  FOR SELECT
  USING (auth.email() = email);

-- ============================================
-- PROJECTS POLICIES
-- ============================================

-- Admin can do everything with projects
CREATE POLICY "Admin full access to projects"
  ON projects
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Clients can only see their own projects
CREATE POLICY "Clients see own projects"
  ON projects
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE email = auth.email()
    )
  );

-- ============================================
-- MILESTONES POLICIES
-- ============================================

-- Admin can do everything with milestones
CREATE POLICY "Admin full access to milestones"
  ON milestones
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Clients can see milestones for their projects
CREATE POLICY "Clients see own project milestones"
  ON milestones
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE client_id IN (
        SELECT id FROM clients WHERE email = auth.email()
      )
    )
  );

-- ============================================
-- DELIVERABLES POLICIES
-- ============================================

-- Admin can do everything with deliverables
CREATE POLICY "Admin full access to deliverables"
  ON deliverables
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Clients can see visible deliverables for their projects
CREATE POLICY "Clients see own project deliverables"
  ON deliverables
  FOR SELECT
  USING (
    visible = TRUE AND
    project_id IN (
      SELECT id FROM projects WHERE client_id IN (
        SELECT id FROM clients WHERE email = auth.email()
      )
    )
  );

-- ============================================
-- NOTES POLICIES
-- ============================================

-- Admin can do everything with notes
CREATE POLICY "Admin full access to notes"
  ON notes
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Clients can see notes for their projects
CREATE POLICY "Clients see own project notes"
  ON notes
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE client_id IN (
        SELECT id FROM clients WHERE email = auth.email()
      )
    )
  );

-- ============================================
-- STORAGE BUCKET
-- ============================================

-- Create storage bucket for project files (run separately in Storage settings)
-- Bucket name: project-files
-- Path structure: /{project-slug}/{filename}

-- Note: Storage bucket policies should be configured in Supabase Dashboard:
-- 1. Go to Storage → project-files → Policies
-- 2. Add policy for authenticated users to read files from their projects
-- 3. Add policy for admin to upload/delete files
