/**
 * MCP Invoke API
 * POST /api/mcp/invoke — Invoke an MCP tool by canonical name
 * Requires: authenticated session + curator or admin role
 * Wave 0: Auth gate, role gate, server/tool allowlist
 * Wave 1: Structured audit log for every attempt (allowed and denied)
 * Wave 2: Accepts canonical "server/tool" form or {server, tool} separately
 */

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/lib/supabase/server";
import {
  createSupabaseMCPServer,
  createSanityMCPServer,
  createStripeMCPServer,
  createAudioMCPServer,
} from "@elbtronika/mcp";
import type { MCPServer } from "@elbtronika/mcp";

// Wave 0: Allowlist — only read/analyze tools from the Harness initial surface
const ALLOWED_TOOLS: Record<string, readonly string[]> = {
  supabase: [
    "supabase_query",
    "supabase_query_profiles",
    "supabase_query_artworks",
  ],
  sanity: [
    "sanity_fetch_document",
    "sanity_fetch_artwork_by_slug",
    "sanity_list_artworks",
  ],
  audio: [
    "audio_analyze_track",
    "audio_match_artwork_to_track",
  ],
  stripe: [
    "stripe_list_transfers",
    "stripe_get_account_balance",
  ],
} as const;

const InvokeRequestSchema = z.object({
  server: z.string(),
  tool: z.string(),
  params: z.record(z.unknown()).default({}),
});

const serverMap: Record<string, () => MCPServer> = {
  supabase: createSupabaseMCPServer,
  sanity: createSanityMCPServer,
  stripe: createStripeMCPServer,
  audio: createAudioMCPServer,
};

// Wave 1: Structured audit — no secrets, tokens, or private data
function logAuditEvent(event: {
  actorId: string;
  role: string;
  server: string;
  tool: string;
  status: number;
  durationMs?: number;
  errorClass?: string;
}) {
  console.log(JSON.stringify({
    event: "mcp_invoke",
    ts: new Date().toISOString(),
    actorId: event.actorId,
    role: event.role,
    server: event.server,
    tool: event.tool,
    status: event.status,
    durationMs: event.durationMs,
    errorClass: event.errorClass,
  }));
}

export async function POST(request: NextRequest) {
  // Wave 0: Auth gate
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Wave 0: Role gate — curators and admins only
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["curator", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden: curators and admins only" }, { status: 403 });
  }

  // Wave 2: Parse body — accept canonical "server/tool" string or {server, tool} object
  let rawServer: string;
  let rawTool: string;
  let params: Record<string, unknown>;
  try {
    const raw = await request.json();
    if (typeof raw.server === "string" && raw.server.includes("/") && !raw.tool) {
      const slash = raw.server.indexOf("/");
      rawServer = raw.server.slice(0, slash);
      rawTool = raw.server.slice(slash + 1);
      params = (raw.params as Record<string, unknown>) ?? {};
    } else {
      const parsed = InvokeRequestSchema.parse(raw);
      rawServer = parsed.server;
      rawTool = parsed.tool;
      params = parsed.params;
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const startMs = Date.now();

  // Wave 0: Allowlist check — deny unlisted servers
  const allowedTools = ALLOWED_TOOLS[rawServer];
  if (!allowedTools) {
    logAuditEvent({ actorId: user.id, role: profile.role, server: rawServer, tool: rawTool, status: 404, errorClass: "server_not_found" });
    return NextResponse.json({ error: `Server not found: ${rawServer}` }, { status: 404 });
  }

  // Wave 0: Allowlist check — deny unlisted or blocked tools
  if (!allowedTools.includes(rawTool)) {
    logAuditEvent({ actorId: user.id, role: profile.role, server: rawServer, tool: rawTool, status: 403, errorClass: "tool_not_allowed" });
    return NextResponse.json(
      { error: `Tool not allowed: ${rawServer}/${rawTool}. Use canonical form server/tool.` },
      { status: 403 },
    );
  }

  try {
    const serverFactory = serverMap[rawServer];
    const server = serverFactory();
    const response = await server.handleHttp({
      jsonrpc: "2.0",
      id: `invoke-${Date.now()}`,
      method: "tools/call",
      params: { name: rawTool, arguments: params },
    });

    const durationMs = Date.now() - startMs;

    if (response && "error" in (response as Record<string, unknown>)) {
      const error = (response as { error?: { message: string } }).error;
      logAuditEvent({ actorId: user.id, role: profile.role, server: rawServer, tool: rawTool, status: 500, durationMs, errorClass: "tool_error" });
      return NextResponse.json({ error: error?.message ?? "Tool execution failed" }, { status: 500 });
    }

    const result = (response as { result?: unknown })?.result;
    logAuditEvent({ actorId: user.id, role: profile.role, server: rawServer, tool: rawTool, status: 200, durationMs });
    return NextResponse.json({ result }, { status: 200 });
  } catch (err) {
    const durationMs = Date.now() - startMs;
    const message = err instanceof Error ? err.message : String(err);
    logAuditEvent({ actorId: user.id, role: profile.role, server: rawServer, tool: rawTool, status: 500, durationMs, errorClass: "execution_exception" });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
