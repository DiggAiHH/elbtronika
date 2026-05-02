// Tests for R2 presigned upload route
// Eselbrücke: "airport security" — wrong ticket (MIME/size/auth) = no boarding pass

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mock Supabase server client
// ---------------------------------------------------------------------------
const mockGetUser = vi.fn();
const mockProfileSelect = vi.fn();

vi.mock("@/src/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: mockProfileSelect,
        }),
      }),
    }),
  }),
}));

// Mock AWS SDK presigner
vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn().mockResolvedValue("https://r2.example.com/presigned-url"),
}));

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class MockS3Client {},
  PutObjectCommand: class MockPutObjectCommand {
    constructor(public input: unknown) {}
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeRequest(body: object): Request {
  return new Request("http://localhost/api/assets/upload", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function authAsArtist() {
  mockGetUser.mockResolvedValue({ data: { user: { id: "user-123" } }, error: null });
  mockProfileSelect.mockResolvedValue({ data: { role: "artist" }, error: null });
}

// ---------------------------------------------------------------------------
// Import route after mocks
// ---------------------------------------------------------------------------
const { POST } = await import("@/app/api/assets/upload/route");

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("POST /api/assets/upload", () => {
  beforeEach(() => {
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "test-account");
    vi.stubEnv("R2_ACCESS_KEY_ID", "test-key");
    vi.stubEnv("R2_SECRET_ACCESS_KEY", "test-secret");
    vi.stubEnv("R2_BUCKET_NAME", "elbtronika-assets");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  // ── Auth ──────────────────────────────────────────────────────────────────

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error("no session") });

    const res = await POST(
      makeRequest({
        filename: "art.jpg",
        contentType: "image/jpeg",
        sizeBytes: 1024,
        assetType: "image",
      }) as never,
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 when user is a collector (not artist/dj)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-456" } }, error: null });
    mockProfileSelect.mockResolvedValue({ data: { role: "collector" }, error: null });

    const res = await POST(
      makeRequest({
        filename: "art.jpg",
        contentType: "image/jpeg",
        sizeBytes: 1024,
        assetType: "image",
      }) as never,
    );
    expect(res.status).toBe(403);
  });

  // ── MIME validation ───────────────────────────────────────────────────────

  it("rejects disallowed MIME type for image", async () => {
    authAsArtist();

    const res = await POST(
      makeRequest({
        filename: "script.js",
        contentType: "application/javascript",
        sizeBytes: 1024,
        assetType: "image",
      }) as never,
    );
    expect(res.status).toBe(422);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/not allowed/i);
  });

  it("rejects executable binary as model", async () => {
    authAsArtist();

    const res = await POST(
      makeRequest({
        filename: "malware.exe",
        contentType: "application/x-msdownload",
        sizeBytes: 1024,
        assetType: "model",
      }) as never,
    );
    expect(res.status).toBe(422);
  });

  // ── Size validation ───────────────────────────────────────────────────────

  it("rejects image over 20MB", async () => {
    authAsArtist();

    const res = await POST(
      makeRequest({
        filename: "huge.jpg",
        contentType: "image/jpeg",
        sizeBytes: 25 * 1024 * 1024, // 25 MB
        assetType: "image",
      }) as never,
    );
    expect(res.status).toBe(422);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/20MB/);
  });

  it("rejects audio over 500MB", async () => {
    authAsArtist();

    const res = await POST(
      makeRequest({
        filename: "set.mp3",
        contentType: "audio/mpeg",
        sizeBytes: 600 * 1024 * 1024,
        assetType: "audio",
      }) as never,
    );
    expect(res.status).toBe(422);
  });

  // ── Happy path ────────────────────────────────────────────────────────────

  it("returns presigned URL for valid image upload", async () => {
    authAsArtist();

    const res = await POST(
      makeRequest({
        filename: "artwork.jpg",
        contentType: "image/jpeg",
        sizeBytes: 2 * 1024 * 1024,
        assetType: "image",
      }) as never,
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { uploadUrl: string; cdnUrl: string; key: string };
    expect(body.uploadUrl).toMatch(/presigned-url/);
    expect(body.cdnUrl).toMatch(/cdn\.elbtronika\.art/);
    expect(body.key).toMatch(/^artworks\//);
  });

  it("returns presigned URL for valid GLB model upload", async () => {
    authAsArtist();

    const res = await POST(
      makeRequest({
        filename: "sculpture.glb",
        contentType: "model/gltf-binary",
        sizeBytes: 10 * 1024 * 1024,
        assetType: "model",
      }) as never,
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { key: string };
    expect(body.key).toMatch(/^models\//);
  });

  // ── Schema validation ─────────────────────────────────────────────────────

  it("returns 400 for missing required fields", async () => {
    authAsArtist();

    const res = await POST(makeRequest({ filename: "art.jpg" }) as never);
    expect(res.status).toBe(400);
  });
});
