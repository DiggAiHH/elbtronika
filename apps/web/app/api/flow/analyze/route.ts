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

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

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
    // Check if set exists
    const { data: set } = await supabase
      .from("sets")
      .select("id, title")
      .eq("id", body.setId)
      .single();

    if (!set) {
      return NextResponse.json({ error: "Set not found" }, { status: 404 });
    }

    // In production: download audio, analyze with @elbtronika/flow analyzeAudio()
    // Wave 5: source:"simulated" — random values, not measured audio analysis
    const analysis = {
      set_id: body.setId,
      bpm: 128 + Math.floor(Math.random() * 20) - 10,
      key: ["A minor", "C major", "G minor", "D minor"][Math.floor(Math.random() * 4)],
      valence: Math.round(Math.random() * 100) / 100,
      arousal: Math.round((0.4 + Math.random() * 0.5) * 100) / 100,
      spectral_centroid: 2000 + Math.floor(Math.random() * 4000),
      mood_tags: ["energetic", "driving", "dark"],
      embedding: Array(128).fill(0).map(() => Math.random()),
      source: "simulated" as const,
    };

    try {
      await (supabase as any)
        .from("audio_features")
        .upsert(analysis, { onConflict: "set_id" });
    } catch (err) {
      console.error("[flow/analyze] upsert error:", err);
    }

    return NextResponse.json({
      setId: body.setId,
      analysis,
      // Wave 5: explicit label so callers can distinguish simulated from measured scores
      source: "simulated",
      message: "Audio analysis completed (simulated — not measured from real audio)",
    }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[flow/analyze] error:", message);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
