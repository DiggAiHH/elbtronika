-- Migration: MCP Audit Log Table (Wave 1 Final)
-- Creates the durable audit trail for all MCP tool invocations.
-- Service-role only access — no RLS for regular users.

CREATE TABLE IF NOT EXISTS mcp_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role TEXT NOT NULL,
  server TEXT NOT NULL,
  tool TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ok', 'denied', 'error')),
  duration_ms INT,
  error_class TEXT,
  request_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for time-range queries (dashboards, log viewing)
CREATE INDEX IF NOT EXISTS idx_mcp_audit_log_created_at
  ON mcp_audit_log(created_at DESC);

-- Index for actor lookups ("what did user X do?")
CREATE INDEX IF NOT EXISTS idx_mcp_audit_log_actor_id
  ON mcp_audit_log(actor_id);

-- Index for status filtering ("show me all errors")
CREATE INDEX IF NOT EXISTS idx_mcp_audit_log_status
  ON mcp_audit_log(status);

-- Enable RLS ( restrictive — only service_role can access)
ALTER TABLE mcp_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_only" ON mcp_audit_log
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Comment for future devs
COMMENT ON TABLE mcp_audit_log IS 'Durable audit trail for MCP tool invocations. Written by apps/web/src/lib/mcp/audit.ts when MCP_AUDIT_DB=true.';
