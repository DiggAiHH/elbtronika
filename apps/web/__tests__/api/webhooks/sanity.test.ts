// Tests for Sanity→Supabase webhook handler
// Eselbrücke: "bouncer at the door" — wrong secret = no entry; same event twice = no double insert

import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Fluent chain factory — supports .eq().eq().is().order().limit() chaining
// AND direct `await chain` (thenable).
// ---------------------------------------------------------------------------
type FluentResolution = { error: null | { message: string } };

function makeFluentChain(resolution: FluentResolution = { error: null }) {
  const chain: {
    eq: ReturnType<typeof vi.fn>;
    is: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
    then: (
      onFulfilled: (v: FluentResolution) => unknown,
      onRejected?: (e: unknown) => unknown,
    ) => Promise<unknown>;
  } = {
    eq: vi.fn(() => chain),
    is: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => Promise.resolve(resolution)),
    // Thenable: `await chain` resolves without needing .limit()
    then: (onFulfilled, onRejected) =>
      Promise.resolve(resolution).then(onFulfilled, onRejected),
  };
  return chain;
}

// ---------------------------------------------------------------------------
// Mock Supabase admin client
// ---------------------------------------------------------------------------

// artwork: .update({...}).eq("sanity_id", id)
// webhook_events: .update({...}).eq().eq().eq().order().limit(1)
const mockUpdate = vi.fn(() => makeFluentChain());

// rooms / sets: upsert()
const mockUpsert = vi.fn().mockResolvedValue({ error: null });

// webhook_events: insert()
const mockInsert = vi.fn().mockResolvedValue({ error: null });

// handleSet lookups: select().eq().maybeSingle()
const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
const mockSelectEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockSelect = vi.fn(() => ({ eq: mockSelectEq }));

const mockFrom = vi.fn(() => ({
  upsert: mockUpsert,
  insert: mockInsert,
  update: mockUpdate,
  select: mockSelect,
}));

vi.mock("@/src/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

// ---------------------------------------------------------------------------
// Helper: build a valid Sanity-signed request
// ---------------------------------------------------------------------------
const TEST_SECRET = "test-webhook-secret-32chars-long!";

function buildRequest(body: object, secret = TEST_SECRET): Request {
  const rawBody = JSON.stringify(body);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const sig = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  return new Request("http://localhost/api/webhooks/sanity", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "sanity-webhook-signature": `t=${timestamp},v1=${sig}`,
    },
    body: rawBody,
  });
}

// ---------------------------------------------------------------------------
// Import route after mocks are set up
// ---------------------------------------------------------------------------
const { POST } = await import("@/app/api/webhooks/sanity/route");

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("POST /api/webhooks/sanity", () => {
  beforeEach(() => {
    vi.stubEnv("SANITY_WEBHOOK_SECRET", TEST_SECRET);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key");
    mockUpdate.mockImplementation(() => makeFluentChain());
    mockUpsert.mockResolvedValue({ error: null });
    mockInsert.mockResolvedValue({ error: null });
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  // ── Signature verification ────────────────────────────────────────────────

  it("rejects request with missing signature header", async () => {
    const rawBody = JSON.stringify({ _id: "abc", _type: "artwork" });
    const req = new Request("http://localhost/api/webhooks/sanity", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: rawBody,
    });

    const res = await POST(req as never);
    expect(res.status).toBe(401);
  });

  it("rejects request with wrong secret", async () => {
    const req = buildRequest({ _id: "abc", _type: "artwork" }, "wrong-secret");
    const res = await POST(req as never);
    expect(res.status).toBe(401);
  });

  it("accepts request with valid signature", async () => {
    const req = buildRequest({
      _id: "sanity-artwork-1",
      _type: "artwork",
      title: "Test Artwork",
      slug: { current: "test-artwork" },
      status: "published",
    });

    const res = await POST(req as never);
    expect(res.status).toBe(200);
  });

  // ── Idempotency ───────────────────────────────────────────────────────────

  it("calls update (not insert) — safe to send same event twice", async () => {
    const payload = {
      _id: "sanity-artwork-42",
      _type: "artwork",
      title: "Idempotent Artwork",
      slug: { current: "idempotent-artwork" },
      status: "published",
    };

    await POST(buildRequest(payload) as never);
    await POST(buildRequest(payload) as never);

    // update() is called for both artworks AND webhook_events mark-processed.
    // Filter to only artworks calls (they carry sanity_id in the update data).
    const artworkUpdateCalls = mockUpdate.mock.calls.filter(([data]) =>
      (data as { sanity_id?: string }).sanity_id === "sanity-artwork-42",
    );
    expect(artworkUpdateCalls.length).toBe(2);
  });

  // ── Document type routing ─────────────────────────────────────────────────

  it("handles artwork.publish — updates artworks table by sanity_id", async () => {
    const req = buildRequest({
      _id: "art-001",
      _type: "artwork",
      title: "My Painting",
      slug: { current: "my-painting" },
      price: 50000,
      status: "published",
    });

    const res = await POST(req as never);
    expect(res.status).toBe(200);
    expect(mockFrom).toHaveBeenCalledWith("artworks");
    // artwork update carries sanity_id + slug + price_eur
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        sanity_id: "art-001",
        slug: "my-painting",
        title: "My Painting",
        price_eur: 500, // 50000 / 100
        is_published: true,
      }),
    );
  });

  it("handles room.publish — upserts to rooms table", async () => {
    const req = buildRequest({
      _id: "room-001",
      _type: "room",
      title: "Dunkelraum",
      slug: { current: "dunkelraum" },
      skybox: "dark_club",
      lightingPreset: "neon",
      status: "open",
    });

    const res = await POST(req as never);
    expect(res.status).toBe(200);
    expect(mockFrom).toHaveBeenCalledWith("rooms");
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        sanity_id: "room-001",
        slug: "dunkelraum",
        is_published: true,
      }),
      expect.objectContaining({ onConflict: "sanity_id" }),
    );
  });

  it("returns 200 for unknown document type without crashing", async () => {
    const req = buildRequest({ _id: "x-1", _type: "unknownType" });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
  });

  // ── Error handling ────────────────────────────────────────────────────────

  it("returns 500 when artwork update fails", async () => {
    // First update() call = artwork update (should fail)
    // Subsequent update() calls = webhook_events error logging (should succeed)
    mockUpdate.mockImplementationOnce(() =>
      makeFluentChain({ error: { message: "DB constraint violation" } }),
    );

    const req = buildRequest({
      _id: "art-bad",
      _type: "artwork",
      title: "Bad Artwork",
      slug: { current: "bad-artwork" },
      status: "published",
    });

    const res = await POST(req as never);
    expect(res.status).toBe(500);
  });
});
