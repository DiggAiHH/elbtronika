-- =============================================================================
-- ELBTRONIKA - Phase 3 Preload
-- 0003_triggers.sql
-- updated_at triggers and audit event triggers.
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'profiles',
    'artists',
    'djs',
    'sets',
    'artworks',
    'orders',
    'transactions'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', 'trg_' || table_name || '_updated_at', table_name);
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
      'trg_' || table_name || '_updated_at',
      table_name
    );
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id text;
BEGIN
  target_id := COALESCE(NEW.id, OLD.id)::text;

  INSERT INTO audit_events (actor_id, action, resource_type, resource_id, before, after)
  VALUES (
    auth.uid(),
    lower(TG_OP),
    TG_TABLE_NAME,
    target_id,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_audit_event ON profiles;
CREATE TRIGGER trg_profiles_audit_event
AFTER INSERT OR UPDATE OR DELETE ON profiles
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS trg_orders_audit_event ON orders;
CREATE TRIGGER trg_orders_audit_event
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS trg_transactions_audit_event ON transactions;
CREATE TRIGGER trg_transactions_audit_event
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION log_audit_event();
