-- ============================================
-- Migration 003 — project_collaborators join table
-- ============================================
-- Run in Supabase SQL Editor (Dashboard → SQL Editor).
--
-- Why this exists:
--   The original schema modeled one client per project via projects.client_id.
--   Government-adjacent work (LA.IO and onward) needs multiple stakeholders
--   per project. This migration introduces a join table so admins can assign
--   any number of clients to a project from the admin UI without changing the
--   primary client_id relationship.
--
-- What this migration does:
--   1. Creates project_collaborators with (project_id, client_id, role).
--   2. Backfills one row per existing projects.client_id with role 'primary'.
--   3. Adds RLS policies so any collaborator can SELECT the project's data.
--      Existing client_id-based policies are left in place — they OR together
--      with the new ones, so nothing regresses if the legacy column still
--      points at a client.
--
-- What this migration does NOT do:
--   - It does not drop projects.client_id. That column continues to hold the
--     "primary client" for the project (used by the approval email flow as
--     the client confirmation recipient). Treat it as a denormalized pointer
--     for now; can be removed later when every consumer has migrated to
--     project_collaborators.

-- ============================================
-- 1. TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS project_collaborators (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES clients(id)  ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'collaborator'
                    CHECK (role IN ('primary', 'collaborator', 'viewer')),
  added_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by_email  TEXT,
  UNIQUE (project_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_project_collaborators_project_id
  ON project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_client_id
  ON project_collaborators(client_id);

-- ============================================
-- 2. BACKFILL
-- ============================================
-- For every existing project with a client_id, create a 'primary' row.
-- Idempotent: ON CONFLICT skips rows that already exist if you re-run.

INSERT INTO project_collaborators (project_id, client_id, role, added_by_email)
SELECT id, client_id, 'primary', 'system-backfill'
FROM projects
WHERE client_id IS NOT NULL
ON CONFLICT (project_id, client_id) DO NOTHING;

-- ============================================
-- 3. RLS — project_collaborators itself
-- ============================================

ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access to project_collaborators"
  ON project_collaborators;
CREATE POLICY "Admin full access to project_collaborators"
  ON project_collaborators
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Clients see their own collaborator rows"
  ON project_collaborators;
CREATE POLICY "Clients see their own collaborator rows"
  ON project_collaborators
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE email = auth.email()
    )
  );

-- ============================================
-- 4. RLS — extend project visibility to collaborators
-- ============================================
-- Postgres OR's policies together. We ADD policies rather than replace
-- the existing client_id-based ones; both paths grant SELECT.

DROP POLICY IF EXISTS "Collaborators see projects they have access to"
  ON projects;
CREATE POLICY "Collaborators see projects they have access to"
  ON projects
  FOR SELECT
  USING (
    id IN (
      SELECT project_id FROM project_collaborators
      WHERE client_id IN (
        SELECT id FROM clients WHERE email = auth.email()
      )
    )
  );

DROP POLICY IF EXISTS "Collaborators see milestones for their projects"
  ON milestones;
CREATE POLICY "Collaborators see milestones for their projects"
  ON milestones
  FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM project_collaborators
      WHERE client_id IN (
        SELECT id FROM clients WHERE email = auth.email()
      )
    )
  );

DROP POLICY IF EXISTS "Collaborators see deliverables for their projects"
  ON deliverables;
CREATE POLICY "Collaborators see deliverables for their projects"
  ON deliverables
  FOR SELECT
  USING (
    visible = TRUE AND
    project_id IN (
      SELECT project_id FROM project_collaborators
      WHERE client_id IN (
        SELECT id FROM clients WHERE email = auth.email()
      )
    )
  );

DROP POLICY IF EXISTS "Collaborators see notes for their projects"
  ON notes;
CREATE POLICY "Collaborators see notes for their projects"
  ON notes
  FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM project_collaborators
      WHERE client_id IN (
        SELECT id FROM clients WHERE email = auth.email()
      )
    )
  );

-- ============================================
-- 5. SANITY CHECK
-- ============================================
-- After running, this should return at least one row for la-startup-2026:
--
--   SELECT p.slug, c.email, pc.role
--   FROM project_collaborators pc
--   JOIN projects p ON p.id = pc.project_id
--   JOIN clients  c ON c.id = pc.client_id
--   ORDER BY p.slug, pc.role;
