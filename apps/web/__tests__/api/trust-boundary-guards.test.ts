import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const flowAnalyzePath = path.join(__dirname, "../../app/api/flow/analyze/route.ts");
const flowMatchPath = path.join(__dirname, "../../app/api/flow/match/route.ts");
const agentTaskPath = path.join(__dirname, "../../app/api/agent/task/route.ts");
const mcpInvokePath = path.join(__dirname, "../../app/api/mcp/invoke/route.ts");

const flowAnalyzeSource = fs.readFileSync(flowAnalyzePath, "utf-8");
const flowMatchSource = fs.readFileSync(flowMatchPath, "utf-8");
const agentTaskSource = fs.readFileSync(agentTaskPath, "utf-8");
const mcpInvokeSource = fs.readFileSync(mcpInvokePath, "utf-8");

describe("Flow trust boundary guardrails", () => {
  it("uses non-disclosure not-found response for unauthorized set access", () => {
    expect(flowAnalyzeSource).toContain('Non-disclosure: treat unauthorized access to existing sets as not found');
    expect(flowAnalyzeSource).toContain('return NextResponse.json({ error: "Set not found" }, { status: 404 });');
    expect(flowMatchSource).toContain('Non-disclosure: do not reveal set existence to unauthorized users');
    expect(flowMatchSource).toContain('return NextResponse.json({ error: "Set not found" }, { status: 404 });');
  });

  it("allows curator/admin override in analyze and match flows", () => {
    expect(flowAnalyzeSource).toContain('!["curator", "admin"].includes(profile.role)');
    expect(flowMatchSource).toContain('!["curator", "admin"].includes(profile.role)');
  });
});

describe("Payload size guardrails", () => {
  it("caps agent task context payload size", () => {
    expect(agentTaskSource).toContain("MAX_CONTEXT_BYTES = 10_000");
    expect(agentTaskSource).toContain("Context payload too large");
    expect(agentTaskSource).toContain("JSON.stringify(value).length <= MAX_CONTEXT_BYTES");
  });

  it("caps MCP invoke params payload size", () => {
    expect(mcpInvokeSource).toContain("MAX_PARAMS_BYTES = 10_000");
    expect(mcpInvokeSource).toContain("Params payload too large");
    expect(mcpInvokeSource).toContain("JSON.stringify(value).length <= MAX_PARAMS_BYTES");
  });
});
