import { afterEach, describe, expect, it } from "vitest";
import { createAdminClient } from "../../src/lib/supabase/admin";

describe("createAdminClient", () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  });

  it("throws when SUPABASE_SERVICE_ROLE_KEY is missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => createAdminClient()).toThrow("SUPABASE_SERVICE_ROLE_KEY not configured");
  });

  it("throws when NEXT_PUBLIC_SUPABASE_URL is missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";

    expect(() => createAdminClient()).toThrow("NEXT_PUBLIC_SUPABASE_URL not configured");
  });

  it("returns a client when required env vars are present", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";

    const client = createAdminClient();
    expect(client).toBeTruthy();
    expect(typeof client.from).toBe("function");
  });
});
