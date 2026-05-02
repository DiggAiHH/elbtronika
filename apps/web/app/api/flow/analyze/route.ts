/**
 * Audio Analysis API
 * POST /api/flow/analyze — Extract audio features from a track
 */

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/lib/supabase/server";

const AnalyzeRequestSchema = z.object({
  setId: z.string().uuid(),
});

function seedFromString(value: string): number {
  let seed = 0;
  for (let i = 0; i < value.length; i++) {
    seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
  }
  return seed || 1;
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickOne<T>(rng: () => number, values: readonly T[]): T {
  if (values.length === 0) {
    // Caller passed an empty pool — surface the bug instead of returning `undefined`.
    throw new Error("[flow/analyze] pickOne called with empty values array");
  }
  const index = Math.floor(rng() * values.length);
  // Index is in [0, values.length-1] so this access is safe.
  return values[index] as T;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof AnalyzeRequestSchema>;
  try {
    body = AnalyzeRequestSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    // Fetch set and enforce ownership boundary (with curator/admin override)
    const { data: setData } = await supabase
      .from("sets")
      .select("id, title, dj_id")
      .eq("id", body.setId)
      .single();

    if (!setData) {
      return NextResponse.json({ error: "Set not found" }, { status: 404 });
    }

    if (setData.dj_id !== user.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      // Non-disclosure: treat unauthorized access to existing sets as not found
      if (!profile || !["curator", "admin"].includes(profile.role)) {
        return NextResponse.json({ error: "Set not found" }, { status: 404 });
      }
    }

    // In production: download audio, analyze with @elbtronika/flow analyzeAudio().
    // For now, generate deterministic simulated values based on set id for reproducibility.
    const rng = mulberry32(seedFromString(body.setId));
    const analysis = {
      set_id: body.setId,
      bpm: 118 + Math.floor(rng() * 28),
      key: pickOne(rng, ["A minor", "C major", "G minor", "D minor"]),
      valence: Math.round(rng() * 100) / 100,
      arousal: Math.round((0.4 + rng() * 0.5) * 100) / 100,
      spectral_centroid: 2000 + Math.floor(rng() * 4000),
      mood_tags: [pickOne(rng, ["energetic", "driving", "dark", "ambient", "uplifting"])],
      embedding: Array(128)
        .fill(0)
        .map(() => Math.round(rng() * 1_000_000) / 1_000_000),
      source: "simulated" as const,
    };

    try {
      await (supabase as any).from("audio_features").upsert(analysis, { onConflict: "set_id" });
    } catch (err) {
      console.error("[flow/analyze] upsert error:", err);
    }

    return NextResponse.json(
      {
        setId: body.setId,
        analysis,
        // Wave 5: explicit label so callers can distinguish simulated from measured scores
        source: "simulated",
        message: "Audio analysis completed (simulated — not measured from real audio)",
      },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[flow/analyze] error:", message);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
