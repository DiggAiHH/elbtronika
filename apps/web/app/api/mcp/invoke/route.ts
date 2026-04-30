/**
 * MCP Invoke API
 * POST /api/mcp/invoke — Invoke an MCP tool by name
 */

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createSupabaseMCPServer,
  createSanityMCPServer,
  createStripeMCPServer,
  createAudioMCPServer,
} from "@elbtronika/mcp";
import type { MCPServer } from "@elbtronika/mcp";

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

export async function POST(request: NextRequest) {
  let body: z.infer<typeof InvokeRequestSchema>;
  try {
    body = InvokeRequestSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const serverFactory = serverMap[body.server];
    if (!serverFactory) {
      return NextResponse.json({ error: `Server not found: ${body.server}` }, { status: 404 });
    }

    const server = serverFactory();
    const response = await server.handleHttp({
      jsonrpc: "2.0",
      id: `invoke-${Date.now()}`,
      method: "tools/call",
      params: { name: body.tool, arguments: body.params },
    });

    if (response && "error" in (response as Record<string, unknown>)) {
      const error = (response as { error?: { message: string } }).error;
      return NextResponse.json({ error: error?.message ?? "Tool execution failed" }, { status: 500 });
    }

    const result = (response as { result?: unknown })?.result;
    return NextResponse.json({ result }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
