/**
 * MCP Tools API
 * GET /api/mcp/tools — List available MCP tools (allowlisted only)
 * Wave 0: Requires authenticated session + curator or admin role
 */

import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import {
  createSupabaseMCPServer,
  createSanityMCPServer,
  createStripeMCPServer,
  createAudioMCPServer,
} from "@elbtronika/mcp";

export async function GET() {
  // Wave 0: Auth gate
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Wave 0: Role gate
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["curator", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden: curators and admins only" }, { status: 403 });
  }

  try {
    const servers = [
      { name: "supabase", server: createSupabaseMCPServer() },
      { name: "sanity", server: createSanityMCPServer() },
      { name: "stripe", server: createStripeMCPServer() },
      { name: "audio", server: createAudioMCPServer() },
    ];

    const allTools: Array<{
      server: string;
      name: string;
      description: string;
      inputSchema: Record<string, unknown>;
    }> = [];

    for (const { name, server } of servers) {
      const response = await server.handleHttp({
        jsonrpc: "2.0",
        id: `list-${name}`,
        method: "tools/list",
      });
      if (response && "result" in (response as Record<string, unknown>)) {
        const result = (response as { result?: { tools?: Array<{ name: string; description: string; inputSchema: Record<string, unknown> }> } }).result;
        if (result?.tools) {
          for (const tool of result.tools) {
            allTools.push({
              server: name,
              name: tool.name,
              description: tool.description,
              inputSchema: tool.inputSchema,
            });
          }
        }
      }
    }

    return NextResponse.json({ tools: allTools, total: allTools.length }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
