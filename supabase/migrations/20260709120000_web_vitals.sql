-- Web Vitals RUM persistence (Sprint 6 rest, 2026-07-09)
-- Written only server-side via service role (anonymous, consent-gated beacons;
-- no PII: no IP, no UA, path is stripped to pathname).
-- NOTE: this is a DELTA migration for the remote DB — apply together with
-- flow_engine + investor_role once CLI access exists (see STATUS.md).

CREATE TABLE IF NOT EXISTS web_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metric TEXT NOT NULL CHECK (metric IN ('LCP', 'FID', 'CLS', 'INP', 'TTFB', 'FCP')),
  value NUMERIC NOT NULL CHECK (value >= 0),
  rating TEXT CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  path TEXT
);

CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_time ON web_vitals(metric, created_at DESC);

ALTER TABLE web_vitals ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (writes). Reads: admins only (dashboard uses admin client anyway).
CREATE POLICY web_vitals_admin_read ON web_vitals
  FOR SELECT USING (is_admin());
