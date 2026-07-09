import { beforeEach, describe, expect, it, vi } from "vitest";
import { getStripe } from "./client";

const stripe = getStripe();
const mockTransfersCreate = vi.fn();
const mockSessionsCreate = vi.fn();

describe("computeRevenueSplit", () => {
  it("splits 60/20/20 when DJ is present", async () => {
    const { computeRevenueSplit } = await import("./transfers");
    const split = computeRevenueSplit(10000, true);
    expect(split.artistCents).toBe(6000);
    expect(split.djCents).toBe(2000);
    expect(split.platformCents).toBe(2000);
    expect(split.totalCents).toBe(10000);
  });

  it("splits 60/0/40 when no DJ (artist gets 60, platform gets rest)", async () => {
    const { computeRevenueSplit } = await import("./transfers");
    const split = computeRevenueSplit(10000, false);
    expect(split.artistCents).toBe(6000);
    expect(split.djCents).toBe(0);
    expect(split.platformCents).toBe(4000);
    expect(split.totalCents).toBe(10000);
  });

  it("handles rounding correctly", async () => {
    const { computeRevenueSplit } = await import("./transfers");
    const split = computeRevenueSplit(100, true);
    expect(split.artistCents + split.djCents + split.platformCents).toBe(100);
  });
});

describe("createTransfers", () => {
  beforeEach(() => {
    vi.spyOn(stripe.transfers, "create").mockImplementation(mockTransfersCreate as any);
    mockTransfersCreate.mockReset();
    mockTransfersCreate.mockResolvedValue({ id: "tr_123" });
  });

  it("creates artist transfer only when no DJ", async () => {
    const { createTransfers } = await import("./transfers");
    const result = await createTransfers({
      paymentIntentId: "pi_123",
      artistAccountId: "acct_artist",
      artistAmountCents: 6000,
      orderId: "ord_123",
    });

    expect(mockTransfersCreate).toHaveBeenCalledTimes(1);
    expect(mockTransfersCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 6000,
        destination: "acct_artist",
        source_transaction: "pi_123",
      }),
      expect.objectContaining({
        idempotencyKey: expect.stringContaining("transfer_artist"),
      }),
    );
    expect(result.artistTransfer.id).toBe("tr_123");
    expect(result.djTransfer).toBeUndefined();
  });

  it("creates both artist and DJ transfers", async () => {
    mockTransfersCreate
      .mockResolvedValueOnce({ id: "tr_artist" })
      .mockResolvedValueOnce({ id: "tr_dj" });

    const { createTransfers } = await import("./transfers");
    const result = await createTransfers({
      paymentIntentId: "pi_123",
      artistAccountId: "acct_artist",
      artistAmountCents: 6000,
      djAccountId: "acct_dj",
      djAmountCents: 2000,
      orderId: "ord_123",
    });

    expect(mockTransfersCreate).toHaveBeenCalledTimes(2);
    expect(result.artistTransfer.id).toBe("tr_artist");
    expect(result.djTransfer?.id).toBe("tr_dj");
  });

  it("editions: two orders for the same artwork/price get DISTINCT idempotency keys", async () => {
    const { createTransfers } = await import("./transfers");

    await createTransfers({
      paymentIntentId: "pi_edition_1",
      artistAccountId: "acct_artist",
      artistAmountCents: 6000,
      orderId: "order_edition_1",
    });
    await createTransfers({
      paymentIntentId: "pi_edition_2",
      artistAccountId: "acct_artist",
      artistAmountCents: 6000, // same amount — same artwork, second edition
      orderId: "order_edition_2",
    });

    const keys = mockTransfersCreate.mock.calls.map((c) => c[1].idempotencyKey);
    expect(keys[0]).not.toBe(keys[1]);
    expect(keys[0]).toContain("order_edition_1");
    expect(keys[1]).toContain("order_edition_2");
  });
});

describe("createCheckoutSession", () => {
  beforeEach(() => {
    vi.spyOn(stripe.checkout.sessions, "create").mockImplementation(mockSessionsCreate as any);
    mockSessionsCreate.mockReset();
    mockSessionsCreate.mockResolvedValue({
      id: "cs_123",
      url: "https://checkout.stripe.com/test",
    });
  });

  it("creates session with correct line items", async () => {
    const { createCheckoutSession } = await import("./transfers");
    await createCheckoutSession({
      artworkId: "aw_123",
      artistStripeAccountId: "acct_artist",
      priceCents: 10000,
      title: "Test Artwork",
      imageUrl: "https://cdn.test/image.jpg",
      successUrl: "https://elbtronika.art/success",
      cancelUrl: "https://elbtronika.art/cancel",
      platformFeeCents: 2000,
      orderId: "ord_123",
    });

    expect(mockSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({
              currency: "eur",
              unit_amount: 10000,
            }),
            quantity: 1,
          }),
        ],
        success_url: "https://elbtronika.art/success",
        cancel_url: "https://elbtronika.art/cancel",
      }),
      expect.objectContaining({
        idempotencyKey: expect.stringContaining("checkout_"),
      }),
    );
  });

  it("propagates order_id into payment_intent_data.metadata (webhook contract)", async () => {
    const { createCheckoutSession } = await import("./transfers");
    await createCheckoutSession({
      artworkId: "aw_123",
      artistStripeAccountId: "acct_artist",
      priceCents: 10000,
      title: "Test Artwork",
      successUrl: "https://elbtronika.art/success",
      cancelUrl: "https://elbtronika.art/cancel",
      platformFeeCents: 2000,
      orderId: "ord_456",
    });

    const sessionArg = mockSessionsCreate.mock.calls.at(-1)?.[0];
    expect(sessionArg.payment_intent_data.metadata.order_id).toBe("ord_456");
    expect(sessionArg.client_reference_id).toBe("ord_456");
    // Separate Charges & Transfers: platform share stays implicitly — this
    // param is invalid on checkout sessions and must never be sent.
    expect(sessionArg).not.toHaveProperty("application_fee_amount");
  });
});
