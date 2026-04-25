-- =============================================================================
-- ELBTRONIKA — RLS Policies Migration
-- Phase 3.1 · deny-all default + explicit per-table policies
-- =============================================================================
--
-- Policy tiers:
--   public-read    → published rows visible to everyone (no auth required)
--   owner-rw       → authenticated user owns the row
--   admin-all      → profile.role = 'admin' (full access)
--   service-only   → service_role key only (edge functions / webhooks)
--   never          → no policy = deny
--
-- Eselbrücke: "ENABLE locks the door; each POLICY is a key."
-- =============================================================================


-- ---------------------------------------------------------------------------
-- HELPER: is_admin() — avoid N+1 on every policy check
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
$$;


-- ===========================================================================
-- profiles
-- ===========================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read their own profile; admins read all
CREATE POLICY "profiles: owner read"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR is_admin());

-- Owner updates own row; admin updates any
CREATE POLICY "profiles: owner update"
  ON profiles FOR UPDATE
  USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());

-- INSERT handled by handle_new_auth_user() trigger (SECURITY DEFINER)
-- No direct INSERT policy needed.

-- DELETE: admin only (cascades to all child rows)
CREATE POLICY "profiles: admin delete"
  ON profiles FOR DELETE
  USING (is_admin());


-- ===========================================================================
-- artists
-- ===========================================================================
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- Public can read published; owner reads own; admin reads all
CREATE POLICY "artists: public read published"
  ON artists FOR SELECT
  USING (is_published = true OR profile_id = auth.uid() OR is_admin());

-- Owner inserts own artist record
CREATE POLICY "artists: owner insert"
  ON artists FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- Owner or admin updates
CREATE POLICY "artists: owner update"
  ON artists FOR UPDATE
  USING (profile_id = auth.uid() OR is_admin())
  WITH CHECK (profile_id = auth.uid() OR is_admin());

-- Owner or admin deletes
CREATE POLICY "artists: owner delete"
  ON artists FOR DELETE
  USING (profile_id = auth.uid() OR is_admin());


-- ===========================================================================
-- djs
-- ===========================================================================
ALTER TABLE djs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "djs: public read published"
  ON djs FOR SELECT
  USING (is_published = true OR profile_id = auth.uid() OR is_admin());

CREATE POLICY "djs: owner insert"
  ON djs FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "djs: owner update"
  ON djs FOR UPDATE
  USING (profile_id = auth.uid() OR is_admin())
  WITH CHECK (profile_id = auth.uid() OR is_admin());

CREATE POLICY "djs: owner delete"
  ON djs FOR DELETE
  USING (profile_id = auth.uid() OR is_admin());


-- ===========================================================================
-- artworks
-- ===========================================================================
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

-- Public reads published; artist reads own; admin reads all
CREATE POLICY "artworks: public read published"
  ON artworks FOR SELECT
  USING (
    is_published = true
    OR EXISTS (
      SELECT 1 FROM artists a
      WHERE a.id = artworks.artist_id AND a.profile_id = auth.uid()
    )
    OR is_admin()
  );

-- Artist inserts into own artist
CREATE POLICY "artworks: artist insert"
  ON artworks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM artists a
      WHERE a.id = artworks.artist_id AND a.profile_id = auth.uid()
    )
    OR is_admin()
  );

-- Artist or admin updates
CREATE POLICY "artworks: artist update"
  ON artworks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM artists a
      WHERE a.id = artworks.artist_id AND a.profile_id = auth.uid()
    )
    OR is_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM artists a
      WHERE a.id = artworks.artist_id AND a.profile_id = auth.uid()
    )
    OR is_admin()
  );

-- Artist or admin deletes
CREATE POLICY "artworks: artist delete"
  ON artworks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM artists a
      WHERE a.id = artworks.artist_id AND a.profile_id = auth.uid()
    )
    OR is_admin()
  );


-- ===========================================================================
-- sets
-- ===========================================================================
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sets: public read published"
  ON sets FOR SELECT
  USING (
    is_published = true
    OR EXISTS (
      SELECT 1 FROM djs d
      WHERE d.id = sets.dj_id AND d.profile_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY "sets: dj insert"
  ON sets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM djs d
      WHERE d.id = sets.dj_id AND d.profile_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY "sets: dj update"
  ON sets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM djs d
      WHERE d.id = sets.dj_id AND d.profile_id = auth.uid()
    )
    OR is_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM djs d
      WHERE d.id = sets.dj_id AND d.profile_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY "sets: dj delete"
  ON sets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM djs d
      WHERE d.id = sets.dj_id AND d.profile_id = auth.uid()
    )
    OR is_admin()
  );


-- ===========================================================================
-- orders
-- ===========================================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Buyer reads own orders; involved artist/dj can see too; admin all
CREATE POLICY "orders: buyer read"
  ON orders FOR SELECT
  USING (
    buyer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM artworks aw
      JOIN artists ar ON ar.id = aw.artist_id
      WHERE aw.id = orders.artwork_id AND ar.profile_id = auth.uid()
    )
    OR is_admin()
  );

-- Buyer inserts own order
CREATE POLICY "orders: buyer insert"
  ON orders FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

-- Status transitions: admin/service_role only (handled via edge functions)
CREATE POLICY "orders: admin update"
  ON orders FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Never delete orders (financial record, use status='refunded' instead)
-- No DELETE policy → deny all.


-- ===========================================================================
-- transactions
-- ===========================================================================
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Recipient reads own legs; admin reads all
CREATE POLICY "transactions: recipient read"
  ON transactions FOR SELECT
  USING (
    recipient_profile_id = auth.uid()
    OR is_admin()
  );

-- INSERT + UPDATE: admin only (written by edge functions with service_role)
CREATE POLICY "transactions: admin insert"
  ON transactions FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "transactions: admin update"
  ON transactions FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Never delete transactions.


-- ===========================================================================
-- consent_log
-- ===========================================================================
ALTER TABLE consent_log ENABLE ROW LEVEL SECURITY;

-- User reads own consent records
CREATE POLICY "consent_log: owner read"
  ON consent_log FOR SELECT
  USING (profile_id = auth.uid() OR is_admin());

-- User records own consent
CREATE POLICY "consent_log: owner insert"
  ON consent_log FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- No UPDATE, no DELETE — append-only by design.


-- ===========================================================================
-- webhook_events
-- ===========================================================================
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
-- No user-facing policies. Access via service_role key only (edge functions).
-- service_role bypasses RLS by default.


-- ===========================================================================
-- ai_decisions
-- ===========================================================================
ALTER TABLE ai_decisions ENABLE ROW LEVEL SECURITY;

-- User reads own decisions; admin reads all
CREATE POLICY "ai_decisions: owner read"
  ON ai_decisions FOR SELECT
  USING (triggered_by = auth.uid() OR is_admin());

-- INSERT: admin/service_role only (written by AI edge functions)
CREATE POLICY "ai_decisions: admin insert"
  ON ai_decisions FOR INSERT
  WITH CHECK (is_admin());


-- ===========================================================================
-- audit_events
-- ===========================================================================
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
-- INSERT: log_audit_event() is SECURITY DEFINER — bypasses RLS automatically.
-- SELECT/UPDATE/DELETE: admin only via SELECT policy below.

CREATE POLICY "audit_events: admin read"
  ON audit_events FOR SELECT
  USING (is_admin());

-- No UPDATE, no DELETE — immutable append-only audit log.
