/**
 * MCP Server for Stripe Payments
 */

import { MCPServer } from "../server";
import type { ToolDefinition } from "../types";

function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  return key;
}

async function stripeApi(path: string, method: string, body?: Record<string, unknown>): Promise<unknown> {
  const url = `https://api.stripe.com/v1/${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${getStripeSecretKey()}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const bodyStr = body
    ? new URLSearchParams(Object.entries(body).map(([k, v]) => [k, String(v)])).toString()
    : undefined;
  const init: RequestInit = { method, headers };
  if (bodyStr) init.body = bodyStr;
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "unknown error");
    throw new Error(`Stripe ${method} ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

const tools: ToolDefinition[] = [
  {
    name: "stripe_create_payment_intent",
    description: "Create a Stripe PaymentIntent for an artwork purchase.",
    schema: {
      type: "object",
      properties: {
        amountCents: { type: "number", description: "Amount in cents" },
        currency: { type: "string", default: "EUR" },
        artworkId: { type: "string" },
        buyerId: { type: "string" },
      },
      required: ["amountCents", "artworkId", "buyerId"],
    },
    handler: async (params) => {
      const amount = Number(params.amountCents);
      const currency = String(params.currency ?? "EUR");
      return stripeApi("payment_intents", "POST", {
        amount: String(amount),
        currency: currency.toLowerCase(),
        metadata: { artwork_id: String(params.artworkId), buyer_id: String(params.buyerId) },
        automatic_payment_methods: "{enabled: true}",
      });
    },
  },
  {
    name: "stripe_create_transfer",
    description: "Create a transfer to an artist's Stripe Connect account.",
    schema: {
      type: "object",
      properties: {
        amountCents: { type: "number" },
        destinationAccount: { type: "string" },
        transferGroup: { type: "string" },
      },
      required: ["amountCents", "destinationAccount"],
    },
    handler: async (params) => {
      const amount = Number(params.amountCents);
      const destination = String(params.destinationAccount);
      const body: Record<string, string> = {
        amount: String(amount),
        currency: "eur",
        destination,
      };
      if (params.transferGroup) {
        body.transfer_group = String(params.transferGroup);
      }
      return stripeApi("transfers", "POST", body);
    },
  },
  {
    name: "stripe_get_account_balance",
    description: "Get the connected account's balance.",
    schema: {
      type: "object",
      properties: {
        accountId: { type: "string" },
      },
      required: ["accountId"],
    },
    handler: async (params) => {
      const accountId = String(params.accountId);
      return stripeApi(`balance?stripe_account=${accountId}`, "GET");
    },
  },
  {
    name: "stripe_list_transfers",
    description: "List transfers for a connected account.",
    schema: {
      type: "object",
      properties: {
        limit: { type: "number", default: 10 },
        destination: { type: "string" },
      },
    },
    handler: async (params) => {
      const limit = Number(params.limit ?? 10);
      const destination = String(params.destination ?? "");
      let query = `transfers?limit=${limit}`;
      if (destination) query += `&destination=${encodeURIComponent(destination)}`;
      return stripeApi(query, "GET");
    },
  },
  {
    name: "stripe_refund_payment",
    description: "Refund a payment by PaymentIntent ID.",
    schema: {
      type: "object",
      properties: {
        paymentIntentId: { type: "string" },
        amountCents: { type: "number" },
        reason: { type: "string" },
      },
      required: ["paymentIntentId"],
    },
    handler: async (params) => {
      const paymentIntent = String(params.paymentIntentId);
      const body: Record<string, string> = { payment_intent: paymentIntent };
      if (params.amountCents) body.amount = String(Number(params.amountCents));
      if (params.reason) body.reason = String(params.reason);
      return stripeApi("refunds", "POST", body);
    },
  },
];

export function createStripeMCPServer(): MCPServer {
  return new MCPServer({
    name: "elbtronika-stripe",
    version: "1.0.0",
    tools,
  });
}
