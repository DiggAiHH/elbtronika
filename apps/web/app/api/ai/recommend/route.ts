// AI Mood-based Artwork Recommendation
// Eselbrücke: "Der Barkeeper empfiehlt" — Nutzer sagt Stimmung, KI schlägt 3 Werke vor

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/lib/supabase/server";
import {
  generateJson,
  createRecommendationPrompt,
  type AIRecommendResult,
} from "@elbtronika/ai";
import { createMemoryStore, checkRateLimit } from "@elbtronika/ai/rate-limit";

const RecommendRequestSchema = z.object({
  mood: z.string().min(2).max(500),
  language: z.enum(["de", "en"]).optional(),
  limit: z.number().int().min(1).max(10).optional(),
});

type RecommendRequest = z.infer<typeof RecommendRequestSchema>;

const rateLimitStore = createMemoryStore();

async function checkUserRateLimit(
  userId: string,
  role: string,
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const result = await checkRateLimit(
    { userId, role: role as "visitor" | "collector" | "artist" | "dj" | "curator" | "admin" },
    rateLimitStore,
  );
  return {
    allowed: result.allowed,
    remaining: result.remaining,
    limit: result.limit,
  };
}

async function auditLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  entry: {
    userId: string;
    feature: "describe" | "recommend" | "explain";
    promptHash: string;
    model: string;
    output: string;
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
  },
) {
  await supabase.from("ai_decisions").insert({
    action: entry.feature,
    triggered_by: entry.userId,
    input_summary: entry.promptHash,
    output_summary: entry.output,
    model: entry.model,
    metadata: {
      inputTokens: entry.inputTokens,
      outputTokens: entry.outputTokens,
      latencyMs: entry.latencyMs,
    },
    confidence: null,
  });
}

async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

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
    return NextResponse.json(
      { error: "Rate limit exceeded", limit: rate.limit },
      { status: 429 },
    );
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
    const { response, data } = await generateJson<AIRecommendResult>(
      prompt,
      (val) => {
        if (
          typeof val === "object" &&
          val !== null &&
          Array.isArray((val as Record<string, unknown>).suggestions)
        ) {
          return val as AIRecommendResult;
        }
        throw new Error("Invalid AI response shape");
      },
    );

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
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 },
    );
  }
}
