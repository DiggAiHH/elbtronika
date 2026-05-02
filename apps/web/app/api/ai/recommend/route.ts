// AI Mood-based Artwork Recommendation
// Eselbrücke: "Der Barkeeper empfiehlt" — Nutzer sagt Stimmung, KI schlägt 3 Werke vor

import { createRecommendationPrompt, generateJson } from "@elbtronika/ai";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auditLog, checkUserRateLimit, hashText } from "@/src/lib/ai/server";
import { createClient } from "@/src/lib/supabase/server";

const RecommendRequestSchema = z.object({
  mood: z.string().min(2).max(500),
  language: z.enum(["de", "en"]).optional(),
  limit: z.number().int().min(1).max(10).optional(),
});

type RecommendRequest = z.infer<typeof RecommendRequestSchema>;

// ---------------------------------------------------------------------------
// POST /api/ai/recommend
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "visitor";

  // Parse body
  let body: RecommendRequest;
  try {
    body = RecommendRequestSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Rate limit
  const rate = await checkUserRateLimit(user.id, role);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded", limit: rate.limit }, { status: 429 });
  }

  // Fetch catalog context from Supabase (last 20 published artworks)
  const { data: artworks } = await supabase
    .from("artworks")
    .select("id, title, artists(name), medium, description")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(20);

  const catalogContext =
    artworks
      ?.map(
        (aw) =>
          `- "${aw.title}" (ID: ${aw.id}) by ${aw.artists?.name ?? "Unknown"}: ${aw.medium}${aw.description ? ` — ${aw.description.slice(0, 120)}` : ""}`,
      )
      .join("\n") ?? "No artworks in catalog yet.";

  try {
    const prompt = createRecommendationPrompt(
      { mood: body.mood, language: body.language ?? "de", limit: body.limit ?? 3 },
      catalogContext,
    );
    const RecommendResultSchema = z.object({
      suggestions: z.array(
        z.object({
          artworkId: z.string(),
          title: z.string(),
          artist: z.string(),
          reason: z.string(),
        }),
      ),
    });

    const { response, data } = await generateJson(prompt, RecommendResultSchema);

    // Audit log (non-blocking)
    const promptText = `${prompt.system}\n${prompt.messages.map((m) => m.content).join("\n")}`;
    auditLog(supabase, {
      userId: user.id,
      feature: "recommend",
      promptHash: await hashText(promptText),
      model: response.model,
      output: JSON.stringify(data),
      inputTokens: response.usage.inputTokens,
      outputTokens: response.usage.outputTokens,
      latencyMs: response.latencyMs,
    }).catch(() => {
      /* best-effort */
    });

    return NextResponse.json(
      {
        suggestions: data.suggestions,
        meta: {
          model: response.model,
          latencyMs: response.latencyMs,
          remaining: rate.remaining,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ai/recommend] generation error:", message);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
