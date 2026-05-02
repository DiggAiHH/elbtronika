import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const invokeRoutePath = path.join(__dirname, "../../app/api/mcp/invoke/route.ts");
const toolsRoutePath = path.join(__dirname, "../../app/api/mcp/tools/route.ts");

const invokeSource = fs.readFileSync(invokeRoutePath, "utf-8");
const toolsSource = fs.readFileSync(toolsRoutePath, "utf-8");

describe("MCP invoke route guardrails", () => {
  it("enforces auth and role checks", () => {
    expect(invokeSource).toContain('{ error: "Unauthorized" }');
    expect(invokeSource).toContain("status: 401");
    expect(invokeSource).toContain('Forbidden: curators and admins only');
    expect(invokeSource).toContain("status: 403");
  });

  it("keeps server and tool allowlist denial paths", () => {
    expect(invokeSource).toContain("const allowedTools = ALLOWED_TOOLS[rawServer]");
    expect(invokeSource).toContain("Server not found:");
    expect(invokeSource).toContain("Tool not allowed:");
    expect(invokeSource).toContain("Use canonical form server/tool");
  });

  it("audits denied and failing execution paths", () => {
    expect(invokeSource).toContain('errorClass: "server_not_found"');
    expect(invokeSource).toContain('errorClass: "tool_not_allowed"');
    expect(invokeSource).toContain('errorClass: "tool_error"');
    expect(invokeSource).toContain('errorClass: "execution_exception"');
    expect(invokeSource).toContain("const auditSafe = async");
    expect(invokeSource).toContain("await auditSafe(");
  });

  it("does not leak internal error details to clients", () => {
    expect(invokeSource).toContain('{ error: "Tool execution failed" }');
    expect(invokeSource).toContain('{ error: "Internal server error" }');
    expect(invokeSource).not.toContain("return NextResponse.json({ error: message }, { status: 500 });");
  });
});

describe("MCP tools route guardrails", () => {
  it("enforces auth and role checks", () => {
    expect(toolsSource).toContain('{ error: "Unauthorized" }');
    expect(toolsSource).toContain('Forbidden: curators and admins only');
  });

  it("exposes the expected MCP server set", () => {
    expect(toolsSource).toContain('{ name: "supabase"');
    expect(toolsSource).toContain('{ name: "sanity"');
    expect(toolsSource).toContain('{ name: "stripe"');
    expect(toolsSource).toContain('{ name: "audio"');
  });

  it("returns generic 500 error payload on internal failures", () => {
    expect(toolsSource).toContain('{ error: "Internal server error" }');
    expect(toolsSource).not.toContain("return NextResponse.json({ error: message }, { status: 500 });");
  });
});
