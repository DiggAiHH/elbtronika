/**
 * Stripe client singleton for ELBTRONIKA.
 * Server-side only. Never import in client bundles.
 */

import Stripe from "stripe";

// Pinned Stripe API version — must match the SDK's expected version literal
// (bumped with stripe 22.3.1 during the 2026-07-09 dependency pass).
const API_VERSION = "2026-06-24.dahlia" as const;

function getSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return key;
}

let sharedClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (sharedClient === null) {
    sharedClient = new Stripe(getSecretKey(), {
      apiVersion: API_VERSION,
      typescript: true,
    });
  }
  return sharedClient;
}

export function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  return secret;
}

export { API_VERSION };
