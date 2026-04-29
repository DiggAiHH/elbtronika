// AI Artwork Description Assistant
// Eselbrücke: "Ghostwriter für Künstler" — nimmt Stichpunkte, liefert 3 Galerie-Texte

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/lib/supabase/server";
import {
  generateJson,
  createDescriptionPrompt,
  type AIDescriptionResult,
} from "@elbtronika/ai";
import { createMemoryStore, checkRateLimit } from "@elbtronika/ai/rate-limit";

const DescribeRequestSchema = z.object({
  bullets: z.array(z.string().min(1)).min(1).max(20),
  language: z.enum(["de", "en"]).optional(),
  tone: z.enum(["poetic", "factual", "gallery"]).optional(),
});

type DescribeRequest = z.infer<typeof DescribeRequestSchema>;

// ---------------------------------------------------------------------------
// Rate limit helper (in-memory for MVP — replace with Redis/Upstash in production)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Audit helper — maps to existing ai_decisions schema
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// POST /api/ai/describe
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  // Auth
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Role check — describe is for artists+ only
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["artist", "dj", "curator", "admin"].includes(profile.role)) {
    return NextResponse.json(
      { error: "Forbidden: artists and DJs only" },
      { status: 403 },
    );
  }

  // Parse body
  let body: DescribeRequest;
  try {
    body = DescribeRequestSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Rate limit
  const rate = await checkUserRateLimit(user.id, profile.role);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", limit: rate.limit },
      { status: 429 },
    );
  }

  // AI generation
  try {
    const prompt = createDescriptionPrompt({
      bullets: body.bullets,
      language: body.language ?? "de",
      tone: body.tone ?? "gallery",
    });
    const { response, data } = await generateJson<AIDescriptionResult>(
      prompt,
      (val) => {
        if (
          typeof val === "object" &&
          val !== null &&
          Array.isArray((val as Record<string, unknown>).variants)
        ) {
          return val as AIDescriptionResult;
        }
        throw new Error("Invalid AI response shape");
      },
    );

    // Audit log (non-blocking)
    const promptText = `${prompt.system}\n${prompt.messages.map((m) => m.content).join("\n")}`;
    auditLog(supabase, {
      userId: user.id,
      feature: "describe",
      promptHash: await hashText(promptText),
      model: response.model,
      output: JSON.stringify(data),
      inputTokens: response.usage.inputTokens,
      outputTokens: response.usage.outputTokens,
      latencyMs: response.latencyMs,
    }).catch(() => {
      /* best-effort logging */
    });

    return NextResponse.json(
      {
        variants: data.variants,
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
    console.error("[ai/describe] generation error:", message);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 },
    );
  }
}

async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}
