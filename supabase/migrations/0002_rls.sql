-- =============================================================================
-- ELBTRONIKA - Phase 3 Preload
-- 0002_rls.sql
-- Default deny-all with explicit policies.
-- =============================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid() AND role = 'admin'::profile_role
  );
$$;

-- Profiles: own read/update + admin. Public access is exposed via safe function.
CREATE POLICY profiles_owner_read
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR is_admin());

CREATE POLICY profiles_owner_update
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());

CREATE OR REPLACE FUNCTION public_profile_list()
RETURNS TABLE (id uuid, display_name text, portrait_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.display_name, p.portrait_url
  FROM profiles p;
$$;

REVOKE ALL ON FUNCTION public_profile_list() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public_profile_list() TO anon, authenticated;

-- Artworks: public read when published, artist own write.
CREATE POLICY artworks_public_read_published
  ON artworks
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'published'::artwork_status
    OR artist_id = auth.uid()
    OR is_admin()
  );

CREATE POLICY artworks_artist_insert
  ON artworks
  FOR INSERT
  TO authenticated
  WITH CHECK (artist_id = auth.uid() OR is_admin());

CREATE POLICY artworks_artist_update
  ON artworks
  FOR UPDATE
  TO authenticated
  USING (artist_id = auth.uid() OR is_admin())
  WITH CHECK (artist_id = auth.uid() OR is_admin());

CREATE POLICY artworks_artist_delete
  ON artworks
  FOR DELETE
  TO authenticated
  USING (artist_id = auth.uid() OR is_admin());

-- Orders: own read only. No client writes (service_role path).
CREATE POLICY orders_owner_read
  ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Transactions: server-only.
CREATE POLICY transactions_service_role_all
  ON transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Consent log: server-only insert, own read.
CREATE POLICY consent_log_owner_read
  ON consent_log
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY consent_log_service_insert
  ON consent_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Audit events: admin-only.
CREATE POLICY audit_events_admin_read
  ON audit_events
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Webhook events: server-only.
CREATE POLICY webhook_events_service_role_all
  ON webhook_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- AI decisions: own read, server insert.
CREATE POLICY ai_decisions_owner_read
  ON ai_decisions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY ai_decisions_service_insert
  ON ai_decisions
  FOR INSERT
  TO service_role
  WITH CHECK (true);
