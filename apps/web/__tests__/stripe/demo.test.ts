<<<<<<< HEAD
import { describe, it, expect } from "vitest";
import {
  getDemoArtistAccountId,
  getDemoDjAccountId,
  DEMO_CONNECTED_ACCOUNTS,
=======
import { describe, expect, it } from "vitest";
import {
  DEMO_CONNECTED_ACCOUNTS,
  getDemoArtistAccountId,
  getDemoDjAccountId,
>>>>>>> feature/phase-18-19-tests-and-prd-docs
} from "@/src/lib/stripe/demo";

describe("Stripe Demo Layer", () => {
  it("returns mock account ID for known artist", () => {
    const id = getDemoArtistAccountId("mira-volk");
    expect(id).toBe("acct_demo_mira_volk_001");
  });

  it("returns mock account ID for known DJ", () => {
    const id = getDemoDjAccountId("nightform");
    expect(id).toBe("acct_demo_nightform_007");
  });

  it("falls back to generic account for unknown slug", () => {
    const id = getDemoArtistAccountId("unknown-artist");
    expect(id).toBe("acct_demo_generic_000");
  });

  it("has 8 demo accounts defined", () => {
    expect(Object.keys(DEMO_CONNECTED_ACCOUNTS).length).toBe(8);
  });
});
