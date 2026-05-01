/**
 * Music-Art Matching API
 * POST /api/flow/match — Find artworks that match a DJ set
 */

import type { ArtFeatures } from "@elbtronika/flow";
import { matchArtworks } from "@elbtronika/flow";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/lib/supabase/server";

const MatchRequestSchema = z.object({
  setId: z.string().uuid(),
  limit: z.number().int().min(1).max(20).default(5),
  diversify: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof MatchRequestSchema>;
  try {
    body = MatchRequestSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    // Fetch set audio features
    const { data: setData } = await supabase
      .from("sets")
      .select("id, title, hls_manifest_url, dj_id")
      .eq("id", body.setId)
      .single();

    if (!setData) {
      return NextResponse.json({ error: "Set not found" }, { status: 404 });
    }

    // Fetch audio features if available (cast for new schema)
    const { data: audioFeaturesRaw } = await (supabase as any)
      .from("audio_features")
      .select("*")
      .eq("set_id", body.setId)
      .single();

    const audioFeatures = audioFeaturesRaw as Record<string, unknown> | null;
    // Wave 5: explicit source label — "measured" if DB features exist, "simulated" if defaults used
    const audioSource: "measured" | "simulated" = audioFeatures ? "measured" : "simulated";

    // Fetch published artworks
    const { data: artworks } = await supabase
      .from("artworks")
      .select("id, title, artists(name), medium, is_published")
      .eq("is_published", true)
      .limit(50);

    if (!artworks || artworks.length === 0) {
      return NextResponse.json({ matches: [], message: "No artworks available" }, { status: 200 });
    }

    // Build audio features (from DB or simulate)
    const audio = {
      bpm: (audioFeatures?.bpm as number) ?? 128,
      bpmConfidence: 0.9,
      key: (audioFeatures?.key as string) ?? "A minor",
      camelot: "8A",
      keyConfidence: 0.85,
      valence: (audioFeatures?.valence as number) ?? 0.5,
      arousal: (audioFeatures?.arousal as number) ?? 0.5,
      spectralCentroid: (audioFeatures?.spectral_centroid as number) ?? 3000,
      spectralRolloff: 4500,
      zeroCrossingRate: 0.05,
      rmsEnergy: 0.3,
      dominantFrequencyRange: "mid" as const,
      moodTags: (audioFeatures?.mood_tags as string[]) ?? ["energetic"],
      estimatedGenre: "techno",
    };

    // Build artwork features (simplified since artwork_features table is new)
    const artworkInputs = artworks.map((aw: Record<string, unknown>) => {
      const artFeat: ArtFeatures = {
        dominantColors: [{ r: 128, g: 128, b: 128, percentage: 1 }],
        colorHarmony: "complex",
        brightness: 0.5,
        contrast: 0.5,
        saturation: 0.5,
        compositionScore: 0.5,
        symmetryScore: 0.5,
        styleTags: ["abstract"],
        moodTags: ["balanced"],
        complexity: 0.5,
      };
      return {
        id: String(aw.id),
        title: String(aw.title ?? "Untitled"),
        artist: String((aw.artists as Record<string, unknown>)?.name ?? "Unknown"),
        features: artFeat,
      };
    });

    const matches = matchArtworks(audio, artworkInputs, {
      limit: body.limit,
      diversifyStyles: body.diversify,
    });

    // Store matches in DB (best-effort, cast for new schema)
    if (matches.length > 0) {
      const inserts = matches.map((m) => ({
        set_id: body.setId,
        artwork_id: m.artworkId,
        similarity_score: m.similarityScore,
        match_reason: m.matchReason,
      }));
      try {
        await (supabase as any).from("music_art_matches").insert(inserts);
      } catch {
        /* best-effort */
      }
    }

    return NextResponse.json(
      {
        setId: body.setId,
        matches,
        totalAnalyzed: artworkInputs.length,
        // Wave 5: callers can distinguish real analysis from simulated defaults
        audioSource,
      },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[flow/match] error:", message);
    return NextResponse.json({ error: "Matching failed" }, { status: 500 });
  }
}
