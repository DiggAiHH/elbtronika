// BEHAVIOR tests for POST /api/checkout/session (Sprint 6).
// Unlike the fs-grep "guard" tests, these call the real handler with mocked
// collaborators and assert actual responses — the exemplar pattern that will
// replace the string-matching guards over time.

import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockGetUser = vi.fn();

type TableResult = { data: unknown; error: { message: string } | null };
const tableResults = new Map<string, TableResult>();
const insertedRows: Record<string, unknown[]> = {};

function chainFor(table: string) {
  const result = tableResults.get(table) ?? { data: null, error: null };
  const chain: Record<string, unknown> = {};
  const self = () => chain;
  chain.select = vi.fn(self);
  chain.eq = vi.fn(self);
  chain.update = vi.fn(self);
  chain.insert = vi.fn((row: unknown) => {
    (insertedRows[table] ??= []).push(row);
    return chain;
  });
  chain.single = vi.fn(async () => result);
  // awaited directly (e.g. the orders update)
  chain.then = (resolve: (v: TableResult) => unknown) => Promise.resolve(result).then(resolve);
  return chain;
}

vi.mock("@/src/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
    from: (table: string) => chainFor(table),
  }),
}));

const mockIsDemoMode = vi.fn();
vi.mock("@/src/lib/stripe/demo", () => ({
  isDemoMode: () => mockIsDemoMode(),
}));

const mockCreateCheckoutSession = vi.fn();
vi.mock("@elbtronika/payments", async (importOriginal) => {
  const original = await importOriginal<typeof import("@elbtronika/payments")>();
  return {
    ...original,
    createCheckoutSession: (params: unknown) => mockCreateCheckoutSession(params),
  };
});

const { POST } = await import("@/app/api/checkout/session/route");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const ARTWORK_ID = "550e8400-e29b-41d4-a716-446655440000";

function makeRequest(body: object): NextRequest {
  return new NextRequest("http://localhost:3000/api/checkout/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function authAsBuyer() {
  mockGetUser.mockResolvedValue({
    data: { user: { id: "buyer-1", email: "buyer@example.com" } },
    error: null,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  tableResults.clear();
  for (const key of Object.keys(insertedRows)) delete insertedRows[key];
  mockIsDemoMode.mockReturnValue(false);
  tableResults.set("artworks", {
    data: {
      id: ARTWORK_ID,
      title: "Lichtfenster I",
      artist_id: "artist-1",
      set_id: null,
      price_eur: 1450,
      image_url: null,
    },
    error: null,
  });
  tableResults.set("artists", {
    data: { stripe_account_id: "acct_artist_1", payout_enabled: true },
    error: null,
  });
  tableResults.set("orders", { data: { id: "order-1" }, error: null });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("POST /api/checkout/session — behavior", () => {
  it("returns 401 without a session", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await POST(makeRequest({ artworkId: ARTWORK_ID, priceCents: 145000 }));
    expect(res.status).toBe(401);
    expect(mockCreateCheckoutSession).not.toHaveBeenCalled();
  });

  it("rejects tampered prices with 422 and creates no order", async () => {
    authAsBuyer();
    const res = await POST(
      makeRequest({ artworkId: ARTWORK_ID, priceCents: 1, locale: "de" }),
    );
    expect(res.status).toBe(422);
    expect(insertedRows.orders ?? []).toHaveLength(0);
    expect(mockCreateCheckoutSession).not.toHaveBeenCalled();
  });

  it("returns a demo url in demo mode without touching stripe or orders", async () => {
    authAsBuyer();
    mockIsDemoMode.mockReturnValue(true);
    const res = await POST(
      makeRequest({ artworkId: ARTWORK_ID, priceCents: 145000, locale: "de" }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { url: string; sessionId: string };
    expect(json.url).toContain("/de/checkout/success?demo=1");
    expect(json.sessionId.startsWith("demo_cs_")).toBe(true);
    expect(mockCreateCheckoutSession).not.toHaveBeenCalled();
    expect(insertedRows.orders ?? []).toHaveLength(0);
  });

  it("happy path: creates order + stripe session with server-derived urls and order id", async () => {
    authAsBuyer();
    mockCreateCheckoutSession.mockResolvedValue({
      id: "cs_live_1",
      url: "https://checkout.stripe.com/pay/cs_live_1",
    });

    const res = await POST(
      makeRequest({ artworkId: ARTWORK_ID, priceCents: 145000, locale: "en" }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { url: string; sessionId: string };
    expect(json.sessionId).toBe("cs_live_1");
    expect(json.url).toContain("checkout.stripe.com");

    expect(insertedRows.orders).toHaveLength(1);
    const call = mockCreateCheckoutSession.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(call.orderId).toBe("order-1");
    // urls are derived from the request origin, never from the client body
    expect(String(call.successUrl)).toContain(
      "http://localhost:3000/en/checkout/success?session_id=",
    );
    expect(String(call.cancelUrl)).toBe("http://localhost:3000/en/checkout/cancel");
  });

  it("returns 422 when the artist cannot receive payouts", async () => {
    authAsBuyer();
    tableResults.set("artists", {
      data: { stripe_account_id: "acct_artist_1", payout_enabled: false },
      error: null,
    });
    const res = await POST(
      makeRequest({ artworkId: ARTWORK_ID, priceCents: 145000, locale: "de" }),
    );
    expect(res.status).toBe(422);
    expect(mockCreateCheckoutSession).not.toHaveBeenCalled();
  });
});
