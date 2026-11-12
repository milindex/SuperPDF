-- SuperPDF analytics tables.
--
-- The Supabase project is shared across sites, so every SuperPDF table is
-- prefixed with `superpdf_`. Do not reuse another project's tables.
--
-- Apply with `supabase db push` or paste into the SQL editor. This migration
-- only creates and alters `superpdf_*` objects.

CREATE TABLE IF NOT EXISTS superpdf_visitors (
  visitor_id   TEXT PRIMARY KEY,
  first_seen   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  browser      TEXT,
  os           TEXT,
  device       TEXT,
  country      TEXT,
  visit_count  INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS superpdf_page_views (
  id         BIGSERIAL PRIMARY KEY,
  visitor_id TEXT NOT NULL REFERENCES superpdf_visitors(visitor_id) ON DELETE CASCADE,
  pathname   TEXT NOT NULL,
  timestamp  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS superpdf_presence (
  visitor_id TEXT PRIMARY KEY REFERENCES superpdf_visitors(visitor_id) ON DELETE CASCADE,
  last_seen  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_superpdf_page_views_timestamp
  ON superpdf_page_views (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_superpdf_page_views_visitor
  ON superpdf_page_views (visitor_id);
CREATE INDEX IF NOT EXISTS idx_superpdf_page_views_pathname
  ON superpdf_page_views (pathname);
CREATE INDEX IF NOT EXISTS idx_superpdf_visitors_country
  ON superpdf_visitors (country);
CREATE INDEX IF NOT EXISTS idx_superpdf_visitors_last_seen
  ON superpdf_visitors (last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_superpdf_presence_last_seen
  ON superpdf_presence (last_seen DESC);

ALTER TABLE superpdf_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE superpdf_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE superpdf_presence ENABLE ROW LEVEL SECURITY;

-- The edge functions run with the service role key, which bypasses RLS. These
-- policies are a safety net in case the publishable key is used directly.
DROP POLICY IF EXISTS "superpdf_insert_visitors" ON superpdf_visitors;
DROP POLICY IF EXISTS "superpdf_insert_page_views" ON superpdf_page_views;
DROP POLICY IF EXISTS "superpdf_insert_presence" ON superpdf_presence;
DROP POLICY IF EXISTS "superpdf_update_presence" ON superpdf_presence;
DROP POLICY IF EXISTS "superpdf_select_visitors" ON superpdf_visitors;
DROP POLICY IF EXISTS "superpdf_select_page_views" ON superpdf_page_views;
DROP POLICY IF EXISTS "superpdf_select_presence" ON superpdf_presence;

CREATE POLICY "superpdf_insert_visitors"
  ON superpdf_visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "superpdf_insert_page_views"
  ON superpdf_page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "superpdf_insert_presence"
  ON superpdf_presence FOR INSERT WITH CHECK (true);
CREATE POLICY "superpdf_update_presence"
  ON superpdf_presence FOR UPDATE USING (true);
CREATE POLICY "superpdf_select_visitors"
  ON superpdf_visitors FOR SELECT USING (true);
CREATE POLICY "superpdf_select_page_views"
  ON superpdf_page_views FOR SELECT USING (true);
CREATE POLICY "superpdf_select_presence"
  ON superpdf_presence FOR SELECT USING (true);
