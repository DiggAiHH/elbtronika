-- Migration: MCP Audit Log Table (Trust Wave 1 final)
-- Creates durable audit trail for every MCP invocation attempt.
-- RLS policy restricts access to service_role only.

create table if not exists mcp_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  role text not null,
  server text not null,
  tool text not null,
  status text not null check (status in ('ok','denied','error')),
  duration_ms int,
  error_class text,
  request_hash text,
  created_at timestamptz default now()
);

-- Index for fast filtering by actor and time-range queries
create index if not exists idx_mcp_audit_log_actor_created
  on mcp_audit_log(actor_id, created_at desc);

create index if not exists idx_mcp_audit_log_created
  on mcp_audit_log(created_at desc);

-- RLS: service_role only
alter table mcp_audit_log enable row level security;

create policy if not exists "service_role only" on mcp_audit_log
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
