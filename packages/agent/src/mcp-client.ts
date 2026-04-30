/**
 * MCP Client — connects the agent to MCP servers.
 * Manages tool discovery and invocation across multiple servers.
 */

import { MCPServer } from "@elbtronika/mcp";
import type { ToolDefinition } from "@elbtronika/mcp";

export interface MCPServerConnection {
  name: string;
  server: MCPServer;
  tools: string[];
  healthy: boolean;
}

export class MCPClient {
  private servers = new Map<string, MCPServerConnection>();

  registerServer(name: string, server: MCPServer): void {
    // Extract tool names from the server
    const tools: string[] = [];
    // We need to access the server's tools - for now we'll track externally
    this.servers.set(name, { name, server, tools, healthy: true });
  }

  /** Discover tools from all registered servers */
  async discoverTools(): Promise<ToolDefinition[]> {
    const allTools: ToolDefinition[] = [];
    for (const [name, conn] of this.servers) {
      try {
        const response = await conn.server.handleHttp({
          jsonrpc: "2.0",
          id: `discover-${name}`,
          method: "tools/list",
        });
        if (response && "result" in (response as Record<string, unknown>)) {
          const result = (response as { result?: { tools?: Array<{ name: string; description: string; inputSchema: Record<string, unknown> }> } }).result;
          if (result?.tools) {
            for (const tool of result.tools) {
              // Create a proxy tool that routes to the correct server
              allTools.push({
                name: `${name}/${tool.name}`,
                description: `[${name}] ${tool.description}`,
                schema: tool.inputSchema,
                handler: async (params) => this.callTool(name, tool.name, params),
              });
            }
          }
        }
        conn.healthy = true;
      } catch {
        conn.healthy = false;
      }
    }
    return allTools;
  }

  /** Call a tool on a specific server */
  async callTool(
    serverName: string,
    toolName: string,
    params: Record<string, unknown>
  ): Promise<unknown> {
    const conn = this.servers.get(serverName);
    if (!conn) throw new Error(`MCP server not found: ${serverName}`);

    const response = await conn.server.handleHttp({
      jsonrpc: "2.0",
      id: `call-${Date.now()}`,
      method: "tools/call",
      params: { name: toolName, arguments: params },
    });

    if (response && "error" in (response as Record<string, unknown>)) {
      const error = (response as { error?: { message: string } }).error;
      throw new Error(error?.message ?? "Tool execution failed");
    }

    const result = (response as { result?: { content?: Array<{ text: string }> } })?.result;
    if (result?.content?.[0]?.text) {
      try {
        return JSON.parse(result.content[0].text);
      } catch {
        return result.content[0].text;
      }
    }
    return result;
  }

  /** Call a tool by its full name (server/tool) */
  async invoke(fullToolName: string, params: Record<string, unknown>): Promise<unknown> {
    const parts = fullToolName.split("/");
    if (parts.length !== 2) {
      throw new Error(`Invalid tool name format: ${fullToolName} (expected server/tool)`);
    }
    if (!parts[0] || !parts[1]) throw new Error(`Invalid tool name format: ${fullToolName}`);
    return this.callTool(parts[0], parts[1], params);
  }

  listServers(): string[] {
    return Array.from(this.servers.keys());
  }

  getServerStatus(): Array<{ name: string; healthy: boolean; tools: number }> {
    return Array.from(this.servers.values()).map((s) => ({
      name: s.name,
      healthy: s.healthy,
      tools: s.tools.length,
    }));
  }
}
