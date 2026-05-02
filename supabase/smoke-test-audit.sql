-- Smoke Test: MCP Audit Log Insert
-- Run this in the Supabase SQL Editor after applying migrations.
-- Expected result: 1 row inserted, 0 rows remain after cleanup.

BEGIN;

-- Insert a test audit event (mimics what apps/web/src/lib/mcp/audit.ts does)
INSERT INTO mcp_audit_log (actor_id, role, server, tool, status, duration_ms, error_class, request_hash)
VALUES (
  null,                       -- anonymous actor
  'curator',                  -- role
  'hermes-curator',           -- server name
  'smoke.test_ping',          -- tool name
  'ok',                       -- status
  42,                         -- duration_ms
  null,                       -- error_class
  'sha256:smoke-test-hash'    -- request_hash
);

-- Verify insert
SELECT
  id,
  role,
  server,
  tool,
  status,
  duration_ms,
  created_at
FROM mcp_audit_log
WHERE server = 'hermes-curator'
  AND tool = 'smoke.test_ping';

-- Rollback to keep DB clean (remove this line if you want to persist the test event)
ROLLBACK;

-- If you keep the insert, clean up with:
-- DELETE FROM mcp_audit_log WHERE tool = 'smoke.test_ping';
