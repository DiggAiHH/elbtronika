-- Wave 3: Durable agent task storage.
-- Agent tasks are persisted here instead of in process memory.
-- Supports Wave 4: idempotency via unique index on (actor_id, goal) for active tasks,
-- and duplicate-worker prevention via run_id unique index.

-- Custom enum types (idempotent via DO block; PostgreSQL has no CREATE TYPE IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agent_task_status') THEN
    CREATE TYPE agent_task_status AS ENUM (
      'pending', 'running', 'completed', 'failed', 'cancelled'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agent_task_type') THEN
    CREATE TYPE agent_task_type AS ENUM (
      'curate', 'onboard', 'test', 'analyze', 'research', 'custom'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS agent_tasks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        agent_task_type NOT NULL,
  goal        text NOT NULL,
  context     jsonb NOT NULL DEFAULT '{}',
  plan        jsonb NOT NULL DEFAULT '[]',
  current_step integer NOT NULL DEFAULT 0,
  status      agent_task_status NOT NULL DEFAULT 'pending',
  result      jsonb,
  error       text,
  -- run_id uniquely identifies one execution attempt; prevents two workers claiming same task
  run_id      text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  started_at  timestamptz,
  completed_at timestamptz
);

-- Wave 4: Prevent duplicate workers claiming the same task
CREATE UNIQUE INDEX IF NOT EXISTS agent_tasks_run_id_unique
  ON agent_tasks (run_id)
  WHERE run_id IS NOT NULL;

-- Wave 4: Idempotency — one pending/running task per (actor, goal) at a time
CREATE UNIQUE INDEX IF NOT EXISTS agent_tasks_actor_goal_active
  ON agent_tasks (actor_id, goal)
  WHERE status IN ('pending', 'running');

ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;

-- Curators see only their own tasks; admins see all via service-role
CREATE POLICY "curators_own_tasks" ON agent_tasks
  FOR ALL USING (actor_id = auth.uid());
