import { describe, expect, it } from "vitest";
import type { RateLimitContext } from "./rate-limit";
import { checkRateLimit, createMemoryStore, ROLE_LIMITS } from "./rate-limit";

describe("ROLE_LIMITS", () => {
  it("has sensible defaults", () => {
    expect(ROLE_LIMITS.visitor).toBe(10);
    expect(ROLE_LIMITS.collector).toBe(50);
    expect(ROLE_LIMITS.artist).toBe(100);
    expect(ROLE_LIMITS.admin).toBe(500);
  });
});

describe("checkRateLimit", () => {
  it("allows the first request", async () => {
    const store = createMemoryStore();
    const ctx: RateLimitContext = { userId: "user-1", role: "visitor" };
    const result = await checkRateLimit(ctx, store);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(ROLE_LIMITS.visitor - 1);
  });

  it("allows requests up to the limit", async () => {
    const store = createMemoryStore();
    const ctx: RateLimitContext = { userId: "user-2", role: "visitor" };

    for (let i = 0; i < ROLE_LIMITS.visitor; i++) {
      const result = await checkRateLimit(ctx, store);
      expect(result.allowed).toBe(true);
    }

    const final = await checkRateLimit(ctx, store);
    expect(final.allowed).toBe(false);
    expect(final.remaining).toBe(0);
  });

  it("tracks anonymous users by ip hash", async () => {
    const store = createMemoryStore();
    const ctx: RateLimitContext = {
      userId: null,
      role: "visitor",
      ipHash: "abc123",
    };

    const first = await checkRateLimit(ctx, store);
    expect(first.allowed).toBe(true);

    const second = await checkRateLimit(ctx, store);
    expect(second.remaining).toBe(ROLE_LIMITS.visitor - 2);
  });

  it("uses higher limits for artists", async () => {
    const store = createMemoryStore();
    const ctx: RateLimitContext = { userId: "artist-1", role: "artist" };

    const result = await checkRateLimit(ctx, store);
    expect(result.limit).toBe(100);
    expect(result.remaining).toBe(99);
  });
});
