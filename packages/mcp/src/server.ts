/**
 * MCP Server Base Implementation
 * JSON-RPC 2.0 over stdio and HTTP/SSE transports.
 */

import type { MCPError, MCPRequest, MCPResponse, MCPServerInfo, ToolDefinition } from "./types";
import { McpErrorCode } from "./types";

export interface MCPServerOptions {
  name: string;
  version: string;
  tools: ToolDefinition[];
}

export class MCPServer {
  private info: MCPServerInfo;
  private tools = new Map<string, ToolDefinition>();
  private requestId = 0;
  private stdioMode = false;

  constructor(opts: MCPServerOptions) {
    this.info = {
      name: opts.name,
      version: opts.version,
      capabilities: { tools: { listChanged: true } },
    };
    for (const tool of opts.tools) {
      this.tools.set(tool.name, tool);
    }
  }

  /** Start stdio server for MCP communication */
  startStdio(): void {
    this.stdioMode = true;
    void this.requestId;
    void this.stdioMode;
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      const lines = String(chunk)
        .split("\n")
        .filter((l) => l.trim());
      for (const line of lines) {
        this.handleMessage(line).catch((err) => {
          console.error("[mcp] stdio error:", err);
        });
      }
    });
  }

  /** Handle a single JSON-RPC message */
  async handleMessage(raw: string): Promise<MCPResponse | null> {
    let req: MCPRequest;
    try {
      req = JSON.parse(raw) as MCPRequest;
    } catch {
      return this.errorResponse(null, McpErrorCode.ParseError, "Parse error");
    }

    if (req.jsonrpc !== "2.0") {
      return this.errorResponse(req.id, McpErrorCode.InvalidRequest, "Invalid Request");
    }

    switch (req.method) {
      case "initialize":
        return this.successResponse(req.id, {
          protocolVersion: "2024-11-05",
          capabilities: this.info.capabilities,
          serverInfo: this.info,
        });
      case "initialized":
        return null; // notification, no response
      case "tools/list":
        return this.successResponse(req.id, {
          tools: Array.from(this.tools.values()).map((t) => ({
            name: t.name,
            description: t.description,
            inputSchema: t.schema,
          })),
        });
      case "tools/call": {
        const params = (req.params ?? {}) as { name?: string; arguments?: Record<string, unknown> };
        const toolName = params.name;
        if (!toolName || !this.tools.has(toolName)) {
          return this.errorResponse(req.id, McpErrorCode.UnknownTool, `Unknown tool: ${toolName}`);
        }
        const tool = this.tools.get(toolName)!;
        try {
          const result = await tool.handler(params.arguments ?? {});
          return this.successResponse(req.id, {
            content: [{ type: "text", text: JSON.stringify(result) }],
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return this.errorResponse(req.id, McpErrorCode.ToolExecutionError, message);
        }
      }
      default:
        return this.errorResponse(
          req.id,
          McpErrorCode.MethodNotFound,
          `Method not found: ${req.method}`,
        );
    }
  }

  private successResponse(id: number | string, result: unknown): MCPResponse {
    return { jsonrpc: "2.0", id, result };
  }

  private errorResponse(id: number | string | null, code: number, message: string): MCPResponse {
    const error: MCPError = { code, message };
    return { jsonrpc: "2.0", id: id ?? 0, error };
  }

  /** HTTP/SSE handler for Next.js API routes */
  async handleHttp(body: unknown): Promise<unknown> {
    if (typeof body === "string") {
      const response = await this.handleMessage(body);
      return response;
    }
    if (body && typeof body === "object" && "method" in body) {
      const response = await this.handleMessage(JSON.stringify(body));
      return response;
    }
    return this.errorResponse(0, McpErrorCode.InvalidRequest, "Invalid request body");
  }
}
