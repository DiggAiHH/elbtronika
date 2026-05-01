import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getEnv, getPublicEnv, resetEnv } from "@/src/lib/env";

describe("Env — ELT_MODE", () => {
  const originalEnv = { ...process.env };

  function setMinimalEnv() {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key-12345678901234567890";
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_123";
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "test-project";
  }

  beforeEach(() => {
    setMinimalEnv();
    resetEnv();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    resetEnv();
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
