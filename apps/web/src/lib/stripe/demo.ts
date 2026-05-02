/**
 * Stripe Demo Layer
 * Provides mock Connected-Account-IDs for 5 demo artists.
 * In demo mode, these replace real Stripe Connect onboarding.
 * All code paths remain identical — only the account ID changes.
 */

import { getEnv } from "@/src/lib/env";

// Mock Connected Account IDs (Stripe Test Mode — created via Stripe Dashboard)
// These are test-only and have no real KYC behind them.
export const DEMO_CONNECTED_ACCOUNTS: Record<string, string> = {
  // Artist personas
  "mira-volk": "acct_demo_mira_volk_001",
  "kenji-aoki": "acct_demo_kenji_aoki_002",
  "helena-moraes": "acct_demo_helena_moraes_003",
  "theo-karagiannis": "acct_demo_theo_karagiannis_004",
  "sasha-wren": "acct_demo_sasha_wren_005",
  // DJ personas (for split payments)
  "lior-k": "acct_demo_lior_k_006",
  nightform: "acct_demo_nightform_007",
  velvetrace: "acct_demo_velvetrace_008",
};

/**
 * Map an artist slug to their demo Stripe Connected Account ID.
 * Falls back to a generic demo account if unknown.
 */
export function getDemoArtistAccountId(slug: string): string {
  return DEMO_CONNECTED_ACCOUNTS[slug] ?? "acct_demo_generic_000";
}

/**
 * Map a DJ slug to their demo Stripe Connected Account ID.
 */
export function getDemoDjAccountId(slug: string): string {
  return DEMO_CONNECTED_ACCOUNTS[slug] ?? "acct_demo_generic_dj_000";
}

/**
 * Wraps a real checkout session creation, injecting demo account IDs.
 * In live mode, this function is a no-op passthrough.
 */
export function withDemoAccounts<
  T extends { artistStripeAccountId: string; djStripeAccountId?: string },
>(params: T, artistSlug: string, djSlug?: string): T {
  const env = getEnv();
  if (env.ELT_MODE !== "demo") return params;

  return {
    ...params,
    artistStripeAccountId: getDemoArtistAccountId(artistSlug),
    ...(djSlug ? { djStripeAccountId: getDemoDjAccountId(djSlug) } : {}),
  };
}

/**
 * Check if the current mode is demo.
 */
export function isDemoMode(): boolean {
  try {
    return getEnv().ELT_MODE === "demo";
  } catch {
    return false;
  }
}
