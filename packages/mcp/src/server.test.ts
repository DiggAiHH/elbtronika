import { describe, it, expect } from "vitest";
import { MCPServer } from "./server";
import type { ToolDefinition } from "./types";

describe("MCPServer", () => {
  const testTool: ToolDefinition = {
    name: "test_echo",
    description: "Echoes input",
    schema: { type: "object", properties: { message: { type: "string" } } },
    handler: async (params) => ({ echoed: params.message }),
  };

  it("initializes and lists tools", async () => {
    const server = new MCPServer({ name: "test", version: "1.0.0", tools: [testTool] });
    const response = await server.handleHttp('{"jsonrpc":"2.0","id":1,"method":"tools/list"}');
    expect(response).toBeDefined();
    const resp = response as Record<string, unknown>;
    if ("result" in resp) {
      const result = resp.result as { tools: Array<{ name: string }> };
      expect(result.tools).toHaveLength(1);
      expect(result.tools[0]!.name).toBe("test_echo");
    }
  });

  it("calls a tool and returns result", async () => {
    const server = new MCPServer({ name: "test", version: "1.0.0", tools: [testTool] });
    const response = await server.handleHttp(
      '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"test_echo","arguments":{"message":"hello"}}}'
    );
    expect(response).toBeDefined();
    const resp = response as Record<string, unknown>;
    if ("result" in resp) {
      const result = resp.result as { content: Array<{ text: string }> };
      const parsed = JSON.parse(result.content[0]!.text);
      expect(parsed.echoed).toBe("hello");
    }
  });

  it("returns error for unknown tool", async () => {
    const server = new MCPServer({ name: "test", version: "1.0.0", tools: [testTool] });
    const response = await server.handleHttp(
      '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"unknown","arguments":{}}}'
    );
    expect(response).toBeDefined();
    expect(response).toHaveProperty("error");
  });

  it("returns error for unknown method", async () => {
    const server = new MCPServer({ name: "test", version: "1.0.0", tools: [testTool] });
    const response = await server.handleHttp('{"jsonrpc":"2.0","id":4,"method":"unknown"}');
    expect(response).toBeDefined();
    expect(response).toHaveProperty("error");
  });
});
