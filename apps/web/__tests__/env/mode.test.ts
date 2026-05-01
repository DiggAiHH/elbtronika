<<<<<<< HEAD
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
=======
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
>>>>>>> feature/phase-18-19-tests-and-prd-docs
import { getEnv, getPublicEnv, resetEnv } from "@/src/lib/env";

// Ensure required env vars are present for getEnv() validation
const REQUIRED_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: "https://dummy.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "dummy_anon_key_1234567890",
  STRIPE_SECRET_KEY: "sk_test_dummy_1234567890",
  STRIPE_WEBHOOK_SECRET: "whsec_dummy_1234567890",
  NEXT_PUBLIC_SANITY_PROJECT_ID: "dummy-project-id",
};

describe("Env — ELT_MODE", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", REQUIRED_ENV.NEXT_PUBLIC_SUPABASE_URL);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", REQUIRED_ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    vi.stubEnv("STRIPE_SECRET_KEY", REQUIRED_ENV.STRIPE_SECRET_KEY);
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", REQUIRED_ENV.STRIPE_WEBHOOK_SECRET);
    vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", REQUIRED_ENV.NEXT_PUBLIC_SANITY_PROJECT_ID);
    resetEnv();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnv();
  });

  it("defaults to demo when ELT_MODE is missing", () => {
    delete process.env.ELT_MODE;
    resetEnv();
    const env = getEnv();
    expect(env.ELT_MODE).toBe("demo");
  });

  it("accepts demo", () => {
    vi.stubEnv("ELT_MODE", "demo");
    resetEnv();
    const env = getEnv();
    expect(env.ELT_MODE).toBe("demo");
  });

  it("accepts staging", () => {
    vi.stubEnv("ELT_MODE", "staging");
    resetEnv();
    const env = getEnv();
    expect(env.ELT_MODE).toBe("staging");
  });

  it("accepts live", () => {
    vi.stubEnv("ELT_MODE", "live");
    resetEnv();
    const env = getEnv();
    expect(env.ELT_MODE).toBe("live");
  });

  it("rejects invalid mode", () => {
    vi.stubEnv("ELT_MODE", "invalid");
    resetEnv();
    expect(() => getEnv()).toThrow();
  });

  it("public env excludes secrets", () => {
    vi.stubEnv("ELT_MODE", "demo");
    resetEnv();
    const pub = getPublicEnv();
    expect(pub.ELT_MODE).toBe("demo");
    expect(pub).not.toHaveProperty("STRIPE_SECRET_KEY");
  });
});
