import { describe, it, expect } from "vitest";
import {
  CheckoutRequestSchema,
  RevenueSplitSchema,
  computeRevenueSplit,
} from "./index";

describe("CheckoutRequestSchema", () => {
  it("accepts valid checkout request", () => {
    const data = {
      artworkId: "550e8400-e29b-41d4-a716-446655440000",
      artistId: "550e8400-e29b-41d4-a716-446655440001",
      priceCents: 10000,
      title: "Neon Dreams",
      successUrl: "https://elbtronika.art/success",
      cancelUrl: "https://elbtronika.art/cancel",
      platformFeeCents: 2000,
      orderId: "550e8400-e29b-41d4-a716-446655440002",
    };

    const result = CheckoutRequestSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects negative price", () => {
    const data = {
      artworkId: "550e8400-e29b-41d4-a716-446655440000",
      artistId: "550e8400-e29b-41d4-a716-446655440001",
      priceCents: -100,
      title: "Test",
      successUrl: "https://elbtronika.art/success",
      cancelUrl: "https://elbtronika.art/cancel",
      platformFeeCents: 0,
      orderId: "550e8400-e29b-41d4-a716-446655440002",
    };

    const result = CheckoutRequestSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects invalid UUID", () => {
    const data = {
      artworkId: "not-a-uuid",
      artistId: "550e8400-e29b-41d4-a716-446655440001",
      priceCents: 10000,
      title: "Test",
      successUrl: "https://elbtronika.art/success",
      cancelUrl: "https://elbtronika.art/cancel",
      platformFeeCents: 0,
      orderId: "550e8400-e29b-41d4-a716-446655440002",
    };

    const result = CheckoutRequestSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe("RevenueSplitSchema", () => {
  it("accepts valid split", () => {
    const split = computeRevenueSplit(10000, true);
    const result = RevenueSplitSchema.safeParse(split);
    expect(result.success).toBe(true);
  });

  it("rejects when sums do not match total", () => {
    const result = RevenueSplitSchema.safeParse({
      artistCents: 6000,
      djCents: 2000,
      platformCents: 1000,
      totalCents: 10000,
    });
    expect(result.success).toBe(false);
  });
});
