import { describe, it, expect } from "vitest";
import { logDecision, createMemoryAuditStore, hashPrompt } from "./audit";

describe("hashPrompt", () => {
  it("returns a 32-char hex string", () => {
    const hash = hashPrompt("test prompt");
    expect(hash).toHaveLength(32);
    expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
  });

  it("is deterministic", () => {
    const h1 = hashPrompt("same");
    const h2 = hashPrompt("same");
    expect(h1).toBe(h2);
  });

  it("is sensitive to input", () => {
    const h1 = hashPrompt("a");
    const h2 = hashPrompt("b");
    expect(h1).not.toBe(h2);
  });
});

describe("logDecision", () => {
  it("stores a decision with generated id and timestamp", async () => {
    const store = createMemoryAuditStore();
    const entry = await logDecision(
      store,
      {
        userId: "user-1",
        feature: "describe",
        model: "claude-sonnet-4-20250514",
        output: "{}",
        inputTokens: 100,
        outputTokens: 50,
        latencyMs: 1200,
      },
      "test prompt",
    );

    expect(entry.id).toBeDefined();
    expect(entry.createdAt).toBeDefined();
    expect(entry.promptHash).toHaveLength(32);
    expect(entry.userId).toBe("user-1");
  });

  it("supports markOverride", async () => {
    const store = createMemoryAuditStore();
    const entry = await logDecision(
      store,
      {
        userId: null,
        feature: "recommend",
        model: "claude-sonnet-4-20250514",
        output: "{}",
        inputTokens: 50,
        outputTokens: 30,
        latencyMs: 800,
      },
      "recommendation prompt",
    );

    await store.markOverride(entry.id);
    const fetched = await store.getById(entry.id);
    expect(fetched?.userOverride).toBe(true);
  });
});
