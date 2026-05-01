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

function toNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const out = value.filter((entry): entry is string => typeof entry === "string");
  return out.length > 0 ? out : fallback;
}

function toDominantColors(value: unknown): ArtFeatures["dominantColors"] {
  if (!Array.isArray(value)) {
    return [{ r: 128, g: 128, b: 128, percentage: 1 }];
  }

  const parsed = value
    .filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null)
    .map((entry) => ({
      r: Math.round(toNumber(entry.r, 128)),
      g: Math.round(toNumber(entry.g, 128)),
      b: Math.round(toNumber(entry.b, 128)),
      percentage: toNumber(entry.percentage, 0),
    }))
    .filter((color) => color.percentage >= 0);

  return parsed.length > 0 ? parsed : [{ r: 128, g: 128, b: 128, percentage: 1 }];
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

    // Build audio features (from DB or simulate).
    // Use defensive parsers because DB rows can hold null/strings/missing fields when
    // the simulation upsert race-conditions with schema migrations or test fixtures.
    const audio = {
      bpm: toNumber(audioFeatures?.bpm, 128),
      bpmConfidence: 0.9,
      key: typeof audioFeatures?.key === "string" ? audioFeatures.key : "A minor",
      camelot: "8A",
      keyConfidence: 0.85,
      valence: toNumber(audioFeatures?.valence, 0.5),
      arousal: toNumber(audioFeatures?.arousal, 0.5),
      spectralCentroid: toNumber(audioFeatures?.spectral_centroid, 3000),
      spectralRolloff: 4500,
      zeroCrossingRate: 0.05,
      rmsEnergy: 0.3,
      dominantFrequencyRange: "mid" as const,
      moodTags: toStringArray(audioFeatures?.mood_tags, ["energetic"]),
      estimatedGenre: "techno",
    };

    const artworkIds = artworks.map((aw) => aw.id);
    const { data: artworkFeaturesRows } = await (supabase as any)
      .from("artwork_features")
      .select("*")
      .in("artwork_id", artworkIds);

    const artworkFeaturesById = new Map<string, Record<string, unknown>>();
    if (Array.isArray(artworkFeaturesRows)) {
      for (const row of artworkFeaturesRows as Array<Record<string, unknown>>) {
        const artworkId = row.artwork_id;
        if (typeof artworkId === "string") {
          artworkFeaturesById.set(artworkId, row);
        }
      }
    }

    // Build artwork features from DB rows when available, fallback otherwise.
    const artworkInputs = artworks.map((aw: Record<string, unknown>) => {
      const row = artworkFeaturesById.get(String(aw.id));
      const artFeat: ArtFeatures = row
        ? {
            dominantColors: toDominantColors(row.dominant_colors),
            colorHarmony: (typeof row.color_harmony === "string"
              ? row.color_harmony
              : "complex") as ArtFeatures["colorHarmony"],
            brightness: toNumber(row.brightness, 0.5),
            contrast: toNumber(row.contrast, 0.5),
            saturation: toNumber(row.saturation, 0.5),
            compositionScore: toNumber(row.composition_score, 0.5),
            symmetryScore: toNumber(row.symmetry_score, 0.5),
            styleTags: toStringArray(row.style_tags, ["abstract"]),
            moodTags: toStringArray(row.mood_tags, ["balanced"]),
            complexity: toNumber(row.complexity, 0.5),
          }
        : {
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
      // Supabase joins return either an object (one-to-one) or an array (one-to-many).
      // Normalize defensively so we never bleed `undefined` into the LLM-facing match reason.
      const artistsRaw = aw.artists;
      const artistsRecord: Record<string, unknown> | null = Array.isArray(artistsRaw)
        ? ((artistsRaw[0] as Record<string, unknown>) ?? null)
        : artistsRaw && typeof artistsRaw === "object"
          ? (artistsRaw as Record<string, unknown>)
          : null;
      const artistName =
        artistsRecord && typeof artistsRecord.name === "string" ? artistsRecord.name : "Unknown";

      return {
        id: String(aw.id),
        title: typeof aw.title === "string" && aw.title.length > 0 ? aw.title : "Untitled",
        artist: artistName,
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
        artworkFeaturesSource:
          artworkFeaturesById.size > 0 ? "db+fallback" : "fallback-only",
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
