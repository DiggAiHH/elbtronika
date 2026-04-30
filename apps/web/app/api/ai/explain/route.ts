// AI Explanation (XAI — "Warum?")
// Eselbrücke: "Der Künstler erklärt sein Werk" — Nutzer fragt nach Begründung einer KI-Empfehlung

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/lib/supabase/server";
import { generateJson, createExplainPrompt } from "@elbtronika/ai";
import { checkUserRateLimit, auditLog, hashText } from "@/src/lib/ai/server";

const ExplainRequestSchema = z.object({
  decisionId: z.string().uuid(),
  language: z.enum(["de", "en"]).optional(),
});

type ExplainRequest = z.infer<typeof ExplainRequestSchema>;

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

    const ExplainResultSchema = z.object({
      explanation: z.string(),
    });

    const { response, data } = await generateJson(
      prompt,
      ExplainResultSchema,
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
