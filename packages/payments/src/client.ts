/**
 * Stripe client singleton for ELBTRONIKA.
 * Server-side only. Never import in client bundles.
 */

import Stripe from "stripe";

const API_VERSION = "2026-04-22.dahlia" as const;

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
