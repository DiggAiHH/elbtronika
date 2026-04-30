/**
 * MCP Tools API
 * GET /api/mcp/tools — List all available MCP tools
 */

import { NextResponse } from "next/server";
import {
  createSupabaseMCPServer,
  createSanityMCPServer,
  createStripeMCPServer,
  createAudioMCPServer,
} from "@elbtronika/mcp";

export async function GET() {
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
