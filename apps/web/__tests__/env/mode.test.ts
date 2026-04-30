import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getEnv, getPublicEnv } from "@/src/lib/env";

describe("Env — ELT_MODE", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset cached env
    // @ts-expect-error — clearing internal cache for tests
    _env = null;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    // @ts-expect-error
    _env = null;
  });

  it("defaults to demo when ELT_MODE is missing", () => {
    delete process.env.ELT_MODE;
    const env = getEnv();
    expect(env.ELT_MODE).toBe("demo");
  });

  it("accepts demo", () => {
    process.env.ELT_MODE = "demo";
    const env = getEnv();
    expect(env.ELT_MODE).toBe("demo");
  });

  it("accepts staging", () => {
    process.env.ELT_MODE = "staging";
    const env = getEnv();
    expect(env.ELT_MODE).toBe("staging");
  });

  it("accepts live", () => {
    process.env.ELT_MODE = "live";
    const env = getEnv();
    expect(env.ELT_MODE).toBe("live");
  });

  it("rejects invalid mode", () => {
    process.env.ELT_MODE = "invalid";
    expect(() => getEnv()).toThrow();
  });

  it("public env excludes secrets", () => {
    process.env.ELT_MODE = "demo";
    process.env.STRIPE_SECRET_KEY = "sk_test_secret";
    const pub = getPublicEnv();
    expect(pub.ELT_MODE).toBe("demo");
    expect(pub).not.toHaveProperty("STRIPE_SECRET_KEY");
  });
});
