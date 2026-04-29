// AI Explanation (XAI — "Warum?")
// Eselbrücke: "Der Künstler erklärt sein Werk" — Nutzer fragt nach Begründung einer KI-Empfehlung

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/lib/supabase/server";
import { generateJson, createExplainPrompt } from "@elbtronika/ai";
import { createMemoryStore, checkRateLimit } from "@elbtronika/ai/rate-limit";

const ExplainRequestSchema = z.object({
  decisionId: z.string().uuid(),
  language: z.enum(["de", "en"]).optional(),
});

type ExplainRequest = z.infer<typeof ExplainRequestSchema>;

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
// POST /api/ai/explain
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

  let body: ExplainRequest;
  try {
    body = ExplainRequestSchema.parse(await request.json());
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

  // Fetch the original decision
  const { data: decision } = await supabase
    .from("ai_decisions")
    .select("output_summary, input_summary")
    .eq("id", body.decisionId)
    .single();

  if (!decision) {
    return NextResponse.json(
      { error: "Decision not found" },
      { status: 404 },
    );
  }

  try {
    const prompt = createExplainPrompt(
      decision.input_summary ?? "",
      decision.output_summary ?? "",
      body.language ?? "de",
    );

    const { response, data } = await generateJson<{ explanation: string }>(
      prompt,
      (val) => {
        if (
          typeof val === "object" &&
          val !== null &&
          typeof (val as Record<string, unknown>).explanation === "string"
        ) {
          return val as { explanation: string };
        }
        throw new Error("Invalid AI response shape");
      },
    );

    // Audit log
    const promptText = `${prompt.system}\n${prompt.messages.map((m) => m.content).join("\n")}`;
    auditLog(supabase, {
      userId: user.id,
      feature: "explain",
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
        explanation: data.explanation,
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
    console.error("[ai/explain] generation error:", message);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 },
    );
  }
}
