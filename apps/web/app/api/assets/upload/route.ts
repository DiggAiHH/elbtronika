// R2 Presigned Upload URL generator
// Eselbrücke: "doorman hands you a VIP pass" — server validates, client uploads directly to R2
//
// Flow: Client POST → server validates auth + MIME + size → returns presigned PUT URL
//       Client PUT directly to R2 (no server bandwidth) → client confirms URL to server
//
// HLS encoding / Draco+KTX2 compression: TODO Phase 7/8
// These are triggered post-upload via a Netlify Background Function (placeholder below).

import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/lib/supabase/server";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const ASSET_TYPES = ["image", "model", "audio"] as const;
type AssetType = (typeof ASSET_TYPES)[number];

const MIME_WHITELIST: Record<AssetType, string[]> = {
  image: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
  model: ["model/gltf-binary", "application/octet-stream"], // .glb uses octet-stream on some clients
  audio: ["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/wav", "audio/ogg"],
};

// Max file sizes in bytes
const MAX_SIZE: Record<AssetType, number> = {
  image: 20 * 1024 * 1024, // 20 MB
  model: 100 * 1024 * 1024, // 100 MB (Draco-compressed GLBs can still be large)
  audio: 500 * 1024 * 1024, // 500 MB (uncompressed source before HLS encoding)
};

// R2 path prefixes
const R2_PREFIX: Record<AssetType, string> = {
  image: "artworks",
  model: "models",
  audio: "sets",
};

// Presigned URL TTL: 1 hour
const SIGNED_URL_TTL_SEC = 3600;

// ---------------------------------------------------------------------------
// Request schema
// ---------------------------------------------------------------------------
const UploadRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  assetType: z.enum(ASSET_TYPES),
});

type UploadRequest = z.infer<typeof UploadRequestSchema>;

// ---------------------------------------------------------------------------
// R2 client (S3-compatible)
// ---------------------------------------------------------------------------
function getR2Client(): S3Client {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId) throw new Error("CLOUDFLARE_ACCOUNT_ID not configured");
  if (!accessKeyId) throw new Error("R2_ACCESS_KEY_ID not configured");
  if (!secretAccessKey) throw new Error("R2_SECRET_ACCESS_KEY not configured");

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function getBucketName(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("R2_BUCKET_NAME not configured");
  return bucket;
}

function getCdnBase(): string {
  return process.env.R2_CDN_BASE_URL ?? "https://cdn.elbtronika.art";
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------
function validateMimeType(contentType: string, assetType: AssetType): boolean {
  // Normalise: strip charset/boundary params (e.g. "image/jpeg; charset=utf-8")
  const mime = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  return MIME_WHITELIST[assetType].includes(mime);
}

function validateSize(sizeBytes: number, assetType: AssetType): boolean {
  return sizeBytes > 0 && sizeBytes <= MAX_SIZE[assetType];
}

// ---------------------------------------------------------------------------
// POST /api/assets/upload
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  // ── Auth check ────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check user has artist or dj role (collectors/visitors cannot upload)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["artist", "dj", "admin", "curator"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden: artists and DJs only" }, { status: 403 });
  }

  // ── Parse + validate body ─────────────────────────────────────────────────
  let body: UploadRequest;
  try {
    const raw = await request.json();
    body = UploadRequestSchema.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!validateMimeType(body.contentType, body.assetType)) {
    return NextResponse.json(
      {
        error: `Content type '${body.contentType}' not allowed for asset type '${body.assetType}'`,
        allowed: MIME_WHITELIST[body.assetType],
      },
      { status: 422 },
    );
  }

  if (!validateSize(body.sizeBytes, body.assetType)) {
    const maxMb = MAX_SIZE[body.assetType] / (1024 * 1024);
    return NextResponse.json(
      { error: `File size exceeds ${maxMb}MB limit for ${body.assetType}` },
      { status: 422 },
    );
  }

  // ── Generate R2 presigned URL ─────────────────────────────────────────────
  const fileId = randomUUID();
  const r2Key = `${R2_PREFIX[body.assetType]}/${user.id}/${fileId}/${body.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  let uploadUrl: string;
  try {
    const r2 = getR2Client();
    const command = new PutObjectCommand({
      Bucket: getBucketName(),
      Key: r2Key,
      ContentType: body.contentType,
      ContentLength: body.sizeBytes,
      Metadata: {
        "uploaded-by": user.id,
        "asset-type": body.assetType,
        "original-filename": body.filename,
      },
    });

    uploadUrl = await getSignedUrl(r2, command, { expiresIn: SIGNED_URL_TTL_SEC });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[assets/upload] R2 presign error:", message);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }

  const cdnUrl = `${getCdnBase()}/${r2Key}`;

  // ── Post-upload pipeline stub ─────────────────────────────────────────────
  // TODO Phase 7: For model/* assets, trigger Draco+KTX2 compression via
  //   Netlify Background Function POST /.netlify/functions/compress-model
  // TODO Phase 8: For audio/* assets, trigger HLS encoding via
  //   Netlify Background Function POST /.netlify/functions/encode-hls
  // Both functions write the output key back to Supabase (artworks.model_url / sets.hls_url)

  return NextResponse.json(
    {
      uploadUrl,
      cdnUrl,
      key: r2Key,
      expiresInSeconds: SIGNED_URL_TTL_SEC,
    },
    { status: 200 },
  );
}
