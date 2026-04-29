// Sanity → Supabase sync webhook
// Eselbrücke: "town crier" — Sanity publishes, we mirror to Supabase for fast queries
//
// Signature verification: HMAC-SHA256(t=<ts>.<body>, SANITY_WEBHOOK_SECRET)
// Idempotency: upsert via sanity_id (ON CONFLICT DO UPDATE)
// Node runtime required: needs raw body + crypto

import { createHmac, timingSafeEqual } from "node:crypto";
import type { Json } from "@elbtronika/contracts";
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/src/lib/supabase/admin";

// ---------------------------------------------------------------------------
// Types matching Sanity schema shapes (partial — only fields we mirror)
// ---------------------------------------------------------------------------
interface SanityArtwork {
  _id: string;
  _type: "artwork";
  title?: string;
  slug?: { current?: string };
  description?: unknown;
  medium?: string;
  dimensions?: string;
  year?: number;
  price?: number;
  edition?: { total?: number; sold?: number };
  tags?: string[];
  status?: string;
  r2Key?: string;
}

interface SanityArtist {
  _id: string;
  _type: "artist";
  displayName?: string;
  slug?: { current?: string };
  supabaseUserId?: string;
  stripeAccountId?: string;
  kycStatus?: string;
}

interface SanityDj {
  _id: string;
  _type: "dj";
  displayName?: string;
  slug?: { current?: string };
  supabaseUserId?: string;
  soundcloudUrl?: string;
  genres?: string[];
  stripeAccountId?: string;
  kycStatus?: string;
}

interface SanitySet {
  _id: string;
  _type: "set";
  title?: string;
  slug?: { current?: string };
  dj?: { slug?: { current?: string } };
  hlsUrl?: string;
  r2AudioKey?: string;
  durationSec?: number;
  bpm?: number;
  genreTags?: string[];
  status?: string;
}

interface SanityRoom {
  _id: string;
  _type: "room";
  title?: string;
  slug?: { current?: string };
  skybox?: string;
  lightingPreset?: string;
  maxArtworks?: number;
  status?: string;
}

type SanityDocument = SanityArtwork | SanityArtist | SanityDj | SanitySet | SanityRoom;

// ---------------------------------------------------------------------------
// Signature verification
// Format: t=<unix_timestamp>,v1=<hex_hmac>
// Signed message: "<timestamp>.<raw_body>"
// ---------------------------------------------------------------------------
function verifySignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.split("=", 2) as [string, string]),
  );

  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;

  // Reject if timestamp is more than 5 minutes old (replay protection)
  const tsDelta = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (tsDelta > 300) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Upsert handlers per document type
// ---------------------------------------------------------------------------
async function handleArtwork(doc: SanityArtwork, supabase: ReturnType<typeof createAdminClient>) {
  const slug = doc.slug?.current;
  if (!slug || !doc.title) return;

  // Artwork sync from Sanity = update-only.
  // Artworks are always created first via the artist dashboard (which sets artist_id).
  // Sanity publishes enriches the existing row (title, description, story, status).
  const { error } = await supabase
    .from("artworks")
    .update({
      sanity_id: doc._id,
      slug,
      title: doc.title,
      description: typeof doc.description === "string" ? doc.description : null,
      medium: doc.medium ?? null,
      dimensions: doc.dimensions ?? null,
      year: doc.year ?? null,
      ...(doc.price != null && { price_eur: doc.price / 100 }),
      edition_size: doc.edition?.total ?? null,
      genre_tags: doc.tags ?? [],
      is_published: doc.status === "published",
    })
    .eq("sanity_id", doc._id);

  if (error) throw new Error(`artworks update failed: ${error.message}`);
}

async function handleArtist(doc: SanityArtist, supabase: ReturnType<typeof createAdminClient>) {
  const slug = doc.slug?.current;
  if (!slug || !doc.displayName) return;

  // Artists in Supabase are linked via profile_id (supabaseUserId).
  // Only update stripe fields and publish status — profile row is managed by auth.
  if (!doc.supabaseUserId) return;

  const { error } = await supabase.from("artists").upsert(
    {
      slug,
      name: doc.displayName,
      profile_id: doc.supabaseUserId,
      stripe_account_id: doc.stripeAccountId ?? null,
      payout_enabled: doc.kycStatus === "approved",
      is_published: true,
    },
    { onConflict: "slug", ignoreDuplicates: false },
  );

  if (error) throw new Error(`artists upsert failed: ${error.message}`);
}

async function handleDj(doc: SanityDj, supabase: ReturnType<typeof createAdminClient>) {
  const slug = doc.slug?.current;
  if (!slug || !doc.displayName) return;
  if (!doc.supabaseUserId) return;

  const { error } = await supabase.from("djs").upsert(
    {
      slug,
      name: doc.displayName,
      profile_id: doc.supabaseUserId,
      stripe_account_id: doc.stripeAccountId ?? null,
      payout_enabled: doc.kycStatus === "approved",
      genre_tags: doc.genres ?? [],
      is_published: true,
    },
    { onConflict: "slug", ignoreDuplicates: false },
  );

  if (error) throw new Error(`djs upsert failed: ${error.message}`);
}

async function handleSet(doc: SanitySet, supabase: ReturnType<typeof createAdminClient>) {
  const slug = doc.slug?.current;
  if (!slug || !doc.title) return;

  // sets.dj_id is required on INSERT. Look up the DJ by slug from the doc's dj reference.
  // If no dj slug present and set doesn't yet exist in Supabase, we can't insert — skip.
  const djSlug = doc.dj?.slug?.current;

  // Resolve dj_id: first try existing set (UPDATE case), then look up by slug (INSERT case).
  let djId: string | null = null;

  const { data: existingSet } = await supabase
    .from("sets")
    .select("dj_id")
    .eq("sanity_id", doc._id)
    .maybeSingle();

  if (existingSet) {
    djId = existingSet.dj_id;
  } else if (djSlug) {
    const { data: djRow } = await supabase
      .from("djs")
      .select("id")
      .eq("slug", djSlug)
      .maybeSingle();
    djId = djRow?.id ?? null;
  }

  if (!djId) {
    console.warn(`[sanity-webhook] handleSet: cannot resolve dj_id for set ${doc._id} — skipping`);
    return;
  }

  const { error } = await supabase.from("sets").upsert(
    {
      sanity_id: doc._id,
      slug,
      title: doc.title,
      dj_id: djId,
      hls_url: doc.hlsUrl ?? null,
      duration_sec: doc.durationSec ?? null,
      bpm: doc.bpm ?? null,
      genre_tags: doc.genreTags ?? [],
      is_published: doc.status === "published",
    },
    { onConflict: "sanity_id", ignoreDuplicates: false },
  );

  if (error) throw new Error(`sets upsert failed: ${error.message}`);
}

async function handleRoom(doc: SanityRoom, supabase: ReturnType<typeof createAdminClient>) {
  const slug = doc.slug?.current;
  if (!slug || !doc.title) return;

  const { error } = await supabase.from("rooms").upsert(
    {
      sanity_id: doc._id,
      slug,
      title: doc.title,
      skybox: doc.skybox ?? "dark_club",
      lighting_preset: doc.lightingPreset ?? "warm_gallery",
      max_artworks: doc.maxArtworks ?? 6,
      is_published: doc.status === "open",
    },
    { onConflict: "sanity_id", ignoreDuplicates: false },
  );

  if (error) throw new Error(`rooms upsert failed: ${error.message}`);
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[sanity-webhook] SANITY_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signatureHeader = request.headers.get("sanity-webhook-signature");

  if (!verifySignature(rawBody, signatureHeader, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let doc: SanityDocument;
  try {
    doc = JSON.parse(rawBody) as SanityDocument;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Log the incoming event (idempotency: duplicate events with same _id + _type are fine)
  await supabase.from("webhook_events").insert({
    source: "sanity",
    event_type: `${doc._type}.publish`,
    payload: JSON.parse(rawBody) as Json,
  });

  try {
    switch (doc._type) {
      case "artwork":
        await handleArtwork(doc, supabase);
        break;
      case "artist":
        await handleArtist(doc, supabase);
        break;
      case "dj":
        await handleDj(doc, supabase);
        break;
      case "set":
        await handleSet(doc, supabase);
        break;
      case "room":
        await handleRoom(doc, supabase);
        break;
      default:
        // Unknown type — log and ignore (no error, Sanity may send other types)
        console.warn("[sanity-webhook] Unhandled document type:", (doc as { _type: string })._type);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[sanity-webhook] Upsert error:", message);
    // Mark the webhook event as errored
    await supabase
      .from("webhook_events")
      .update({ error: message, processed: false })
      .eq("source", "sanity")
      .eq("event_type", `${doc._type}.publish`)
      .is("processed_at", null)
      .order("created_at", { ascending: false })
      .limit(1);

    return NextResponse.json({ error: "Upsert failed" }, { status: 500 });
  }

  // Mark processed
  await supabase
    .from("webhook_events")
    .update({ processed: true, processed_at: new Date().toISOString() })
    .eq("source", "sanity")
    .eq("event_type", `${doc._type}.publish`)
    .eq("processed", false)
    .order("created_at", { ascending: false })
    .limit(1);

  return NextResponse.json({ ok: true });
}
