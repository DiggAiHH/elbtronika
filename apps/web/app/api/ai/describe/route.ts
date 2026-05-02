// AI Artwork Description Assistant
// Eselbrücke: "Ghostwriter für Künstler" — nimmt Stichpunkte, liefert 3 Galerie-Texte

import { createDescriptionPrompt, generateJson } from "@elbtronika/ai";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auditLog, checkUserRateLimit, hashText } from "@/src/lib/ai/server";
import { createClient } from "@/src/lib/supabase/server";

const DescribeRequestSchema = z.object({
  bullets: z.array(z.string().min(1)).min(1).max(20),
  language: z.enum(["de", "en"]).optional(),
  tone: z.enum(["poetic", "factual", "gallery"]).optional(),
});

type DescribeRequest = z.infer<typeof DescribeRequestSchema>;

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
    return NextResponse.json({ error: "Forbidden: artists and DJs only" }, { status: 403 });
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
    return NextResponse.json({ error: "Rate limit exceeded", limit: rate.limit }, { status: 429 });
  }

  // AI generation
  try {
    const prompt = createDescriptionPrompt({
      bullets: body.bullets,
      language: body.language ?? "de",
      tone: body.tone ?? "gallery",
    });
    const DescriptionResultSchema = z.object({
      variants: z.array(z.string()),
    });

    const { response, data } = await generateJson(prompt, DescriptionResultSchema);

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
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
