import { afterEach, describe, expect, it, vi } from "vitest";

// We need to test that createAdminClient throws meaningful errors when env vars are missing.
// The module imports createClient from @supabase/supabase-js — mock it so tests are pure.
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ auth: {} })),
}));

describe("createAdminClient — negative tests (A3)", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("throws if NEXT_PUBLIC_SUPABASE_URL is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key-1234567890");

    const { createAdminClient } = await import("@/src/lib/supabase/admin");
    expect(() => createAdminClient()).toThrow("NEXT_PUBLIC_SUPABASE_URL not configured");
  });

  it("throws if SUPABASE_SERVICE_ROLE_KEY is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    const { createAdminClient } = await import("@/src/lib/supabase/admin");
    expect(() => createAdminClient()).toThrow("SUPABASE_SERVICE_ROLE_KEY not configured");
  });

  it("throws if both are missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    const { createAdminClient } = await import("@/src/lib/supabase/admin");
    // First missing env throws first — URL checked before key
    expect(() => createAdminClient()).toThrow("NEXT_PUBLIC_SUPABASE_URL not configured");
  });

  it("succeeds when both are present", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key-1234567890");

    const { createAdminClient } = await import("@/src/lib/supabase/admin");
    expect(() => createAdminClient()).not.toThrow();
  });
});
