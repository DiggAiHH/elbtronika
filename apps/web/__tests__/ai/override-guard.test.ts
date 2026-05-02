import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const overrideRoutePath = path.join(__dirname, "../../app/api/ai/override/route.ts");
const overrideSource = fs.readFileSync(overrideRoutePath, "utf-8");

describe("AI override trust boundary guardrails", () => {
  it("enforces auth and ownership/admin boundary checks", () => {
    expect(overrideSource).toContain('{ error: "Unauthorized" }');
    expect(overrideSource).toContain('{ error: "Forbidden" }');
    expect(overrideSource).toContain('Decision not found');
  });

  it("applies rate limit checks before mutation", () => {
    expect(overrideSource).toContain("checkUserRateLimit");
    expect(overrideSource).toContain('{ error: "Rate limit exceeded", limit: rate.limit }');
    expect(overrideSource).toContain("status: 429");
  });

  it("preserves existing metadata while marking override", () => {
    expect(overrideSource).toContain("...((decision.metadata as Record<string, unknown> | null) ?? {})");
    expect(overrideSource).toContain("override: true");
    expect(overrideSource).toContain("overriddenBy: user.id");
    expect(overrideSource).toContain("overriddenAt: new Date().toISOString()");
  });

  it("writes best-effort audit logs", () => {
    expect(overrideSource).toContain("auditLog(supabase");
    expect(overrideSource).toContain('feature: "override"');
    expect(overrideSource).toContain("promptHash: await hashText(body.decisionId)");
  });
});
