import { describe, expect, it, vi } from "vitest";
import type { WebhookContext } from "./webhook";
import {
  handleAccountUpdated,
  handleCheckoutSessionCompleted,
  handlePaymentIntentFailed,
  handlePaymentIntentSucceeded,
} from "./webhook";

vi.mock("./transfers", () => ({
  computeRevenueSplit: vi.fn().mockReturnValue({ artistCents: 8000, djCents: 1000 }),
  createTransfers: vi.fn().mockResolvedValue({}),
}));

function createMockCtx(overrides?: Partial<WebhookContext>): WebhookContext {
  return {
    updateOrder: vi.fn().mockResolvedValue(undefined),
    getOrderBySessionId: vi.fn().mockResolvedValue({
      id: "order_1",
      artwork_id: "art_1",
      buyer_id: "buyer_1",
      artist_payout_eur: 80,
      dj_payout_eur: 10,
      status: "pending",
    }),
    getArtistStripeAccount: vi.fn().mockResolvedValue("acct_artist"),
    getDjStripeAccount: vi.fn().mockResolvedValue("acct_dj"),
    ...overrides,
  };
}

describe("handleCheckoutSessionCompleted", () => {
  it("updates order to processing when payment_intent exists", async () => {
    const ctx = createMockCtx();
    const session = { id: "cs_1", payment_intent: "pi_1" };

    await handleCheckoutSessionCompleted(session, ctx);

    expect(ctx.updateOrder).toHaveBeenCalledWith({
      orderId: "order_1",
      status: "processing",
      stripePaymentIntentId: "pi_1",
    });
  });

  it("warns and returns when no order found", async () => {
    const ctx = createMockCtx({ getOrderBySessionId: vi.fn().mockResolvedValue(null) });
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await handleCheckoutSessionCompleted({ id: "cs_1", payment_intent: null }, ctx);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("No order found"));
    expect(ctx.updateOrder).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe("handlePaymentIntentSucceeded", () => {
  it("creates transfers when artist account exists", async () => {
    const ctx = createMockCtx();
    const pi = {
      id: "pi_1",
      amount: 10000,
      metadata: { artwork_id: "art_1", order_id: "order_1" },
    };

    await handlePaymentIntentSucceeded(pi, ctx);

    expect(ctx.getArtistStripeAccount).toHaveBeenCalledWith("art_1");
  });

  it("warns when no artwork_id in metadata", async () => {
    const ctx = createMockCtx();
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await handlePaymentIntentSucceeded({ id: "pi_1", amount: 10000, metadata: {} }, ctx);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("No artwork_id"));
    consoleSpy.mockRestore();
  });
});

describe("handlePaymentIntentFailed", () => {
  it("updates order to failed via session lookup", async () => {
    const ctx = createMockCtx();

    await handlePaymentIntentFailed({ metadata: { checkout_session_id: "cs_1" } }, ctx);

    expect(ctx.getOrderBySessionId).toHaveBeenCalledWith("cs_1");
    expect(ctx.updateOrder).toHaveBeenCalledWith({ orderId: "order_1", status: "failed" });
  });

  it("returns early when no checkout_session_id", async () => {
    const ctx = createMockCtx();

    await handlePaymentIntentFailed({ metadata: {} }, ctx);

    expect(ctx.getOrderBySessionId).not.toHaveBeenCalled();
  });
});

describe("handleAccountUpdated", () => {
  it("returns payoutEnabled when all metadata present", async () => {
    const result = await handleAccountUpdated({
      metadata: { elbtronika_user_id: "user_1", elbtronika_role: "artist" },
      payouts_enabled: true,
      charges_enabled: true,
      details_submitted: true,
    });
    expect(result).toEqual({ userId: "user_1", role: "artist", payoutEnabled: true });
  });

  it("returns null when metadata missing", async () => {
    const result = await handleAccountUpdated({ payouts_enabled: true });
    expect(result).toBeNull();
  });

  it("returns payoutEnabled false when requirements not met", async () => {
    const result = await handleAccountUpdated({
      metadata: { elbtronika_user_id: "user_1", elbtronika_role: "artist" },
      payouts_enabled: false,
      charges_enabled: true,
      details_submitted: true,
    });
    expect(result).toEqual({ userId: "user_1", role: "artist", payoutEnabled: false });
  });
});
