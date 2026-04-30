/**
 * Agent Task API
 * POST /api/agent/task — Create and optionally execute a new agent task
 * GET /api/agent/task — List recent agent tasks
 */

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/lib/supabase/server";
import { HermesAgent, MCPClient } from "@elbtronika/agent";
import { createSupabaseMCPServer, createSanityMCPServer, createStripeMCPServer, createAudioMCPServer } from "@elbtronika/mcp";

const CreateTaskSchema = z.object({
  type: z.enum(["curate", "onboard", "test", "analyze", "research", "custom"]),
  goal: z.string().min(2).max(1000),
  context: z.record(z.unknown()).default({}),
  execute: z.boolean().default(false),
});

// Shared agent instance (would be better as singleton in production)
let sharedAgent: HermesAgent | null = null;

function getAgent(): HermesAgent {
  if (!sharedAgent) {
    const mcp = new MCPClient();
    mcp.registerServer("supabase", createSupabaseMCPServer());
    mcp.registerServer("sanity", createSanityMCPServer());
    mcp.registerServer("stripe", createStripeMCPServer());
    mcp.registerServer("audio", createAudioMCPServer());
    sharedAgent = new HermesAgent({ mcpClient: mcp });
  }
  return sharedAgent;
}

// POST /api/agent/task
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Role check — agents tasks for curators+ only
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["curator", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden: curators and admins only" }, { status: 403 });
  }

  let body: z.infer<typeof CreateTaskSchema>;
  try {
    body = CreateTaskSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const agent = getAgent();
    const task = agent.createTask(body.type, body.goal, body.context);

    if (body.execute) {
      // Execute asynchronously — don't await
      agent.executeTask(task.id).catch((err) => {
        console.error("[agent/task] execution error:", err);
      });
    }

    return NextResponse.json({
      task: {
        id: task.id,
        type: task.type,
        status: task.status,
        goal: task.goal,
        plan: task.plan,
        createdAt: task.createdAt,
      },
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/agent/task
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const agent = getAgent();
    const tasks = agent.listTasks().map((t: import("@elbtronika/agent").AgentTask) => ({
      id: t.id,
      type: t.type,
      status: t.status,
      goal: t.goal,
      currentStep: t.currentStep,
      totalSteps: t.plan.length,
      createdAt: t.createdAt,
      completedAt: t.completedAt,
    }));

    return NextResponse.json({ tasks, status: agent.getStatus() }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
