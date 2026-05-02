/**
 * Agent Task API
 * POST /api/agent/task — Create and optionally execute a new agent task
 * GET /api/agent/task — List recent agent tasks
 *
 * Wave 3: Tasks are persisted in the agent_tasks table (not process memory).
 * Wave 4: Idempotency check prevents duplicate active tasks; execution updates
 *         DB status instead of fire-and-forget with no observable state.
 */

import { HermesAgent, MCPClient } from "@elbtronika/agent";
import {
  createAudioMCPServer,
  createSanityMCPServer,
  createStripeMCPServer,
  createSupabaseMCPServer,
} from "@elbtronika/mcp";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/lib/supabase/server";

const MAX_CONTEXT_BYTES = 10_000;

const CreateTaskSchema = z.object({
  type: z.enum(["curate", "onboard", "test", "analyze", "research", "custom"]),
  goal: z.string().min(2).max(1000),
  context: z
    .record(z.unknown())
    .refine((value) => {
      try {
        return JSON.stringify(value).length <= MAX_CONTEXT_BYTES;
      } catch {
        return false;
      }
    }, "Context payload too large")
    .default({}),
  execute: z.boolean().default(false),
});

// Agent is ephemeral per-request: DB is source of truth for task state
function createAgent(): HermesAgent {
  const mcp = new MCPClient();
  mcp.registerServer("supabase", createSupabaseMCPServer());
  mcp.registerServer("sanity", createSanityMCPServer());
  mcp.registerServer("stripe", createStripeMCPServer());
  mcp.registerServer("audio", createAudioMCPServer());
  return new HermesAgent({ mcpClient: mcp });
}

// POST /api/agent/task
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Role check — agent tasks for curators+ only
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["curator", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden: curators and admins only" }, { status: 403 });
  }

  let body: z.infer<typeof CreateTaskSchema>;
  try {
    body = CreateTaskSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Wave 4: Idempotency — return existing task if same goal is already pending/running
  const { data: existing } = await supabase
    .from("agent_tasks")
    .select("id, status, goal, type, created_at")
    .eq("actor_id", user.id)
    .eq("goal", body.goal)
    .in("status", ["pending", "running"])
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      {
        task: existing,
        message: "A task with this goal is already pending or running",
      },
      { status: 200 },
    );
  }

  // Create in-memory task to get a plan from the agent
  const agent = createAgent();
  const memTask = agent.createTask(body.type, body.goal, body.context);

  // Wave 3: Persist task to database — DB is source of truth
  const { data: dbTask, error: insertError } = await supabase
    .from("agent_tasks")
    .insert({
      id: memTask.id,
      actor_id: user.id,
      type: body.type,
      goal: body.goal,
      context: body.context as unknown as import("@elbtronika/contracts").Json,
      plan: memTask.plan as unknown as import("@elbtronika/contracts").Json,
      status: "pending",
    })
    .select()
    .single();

  if (insertError || !dbTask) {
    console.error("[agent/task] insert error:", insertError?.message);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }

  if (body.execute) {
    const taskId = dbTask.id as string;
    const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Wave 4: Atomic claim — only transitions from pending to running
    const { error: claimError } = await supabase
      .from("agent_tasks")
      .update({ status: "running", run_id: runId, started_at: new Date().toISOString() })
      .eq("id", taskId)
      .eq("status", "pending");

    if (!claimError) {
      // Wave 4: Execution with explicit DB state updates — no silent fire-and-forget
      (async () => {
        try {
          await agent.executeTask(memTask.id);
          const result = agent.getTask(memTask.id)?.result ?? null;
          await supabase
            .from("agent_tasks")
            .update({ status: "completed", result: result as unknown as import("@elbtronika/contracts").Json, completed_at: new Date().toISOString() })
            .eq("id", taskId);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.error("[agent/task] execution error:", errorMsg);
          await supabase
            .from("agent_tasks")
            .update({ status: "failed", error: errorMsg, completed_at: new Date().toISOString() })
            .eq("id", taskId);
        }
      })();
    }
  }

  return NextResponse.json(
    {
      task: {
        id: dbTask.id,
        type: dbTask.type,
        status: dbTask.status,
        goal: dbTask.goal,
        plan: dbTask.plan,
        createdAt: dbTask.created_at,
      },
    },
    { status: 201 },
  );
}

// GET /api/agent/task
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Role check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["curator", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden: curators and admins only" }, { status: 403 });
  }

  // Wave 3: Read task list from DB — not from ephemeral process memory
  const { data: tasks, error } = await supabase
    .from("agent_tasks")
    .select("id, type, status, goal, plan, current_step, created_at, completed_at, error")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }

  return NextResponse.json({ tasks: tasks ?? [] }, { status: 200 });
}
