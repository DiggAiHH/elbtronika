// AI Override — User rejects an AI suggestion
// Eselbrücke: "Stempel 'Abgelehnt'" — Nutzer widerspricht KI-Empfehlung, wird geloggt

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auditLog, checkUserRateLimit, hashText } from "@/src/lib/ai/server";
import { createClient } from "@/src/lib/supabase/server";

const OverrideRequestSchema = z.object({
  decisionId: z.string().uuid(),
});

type OverrideRequest = z.infer<typeof OverrideRequestSchema>;

// ---------------------------------------------------------------------------
// POST /api/ai/override
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

  let body: OverrideRequest;
  try {
    body = OverrideRequestSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Verify the decision belongs to this user (or user has admin/curator rights)
  const { data: decision } = await supabase
    .from("ai_decisions")
    .select("triggered_by, metadata")
    .eq("id", body.decisionId)
    .single();

  if (!decision) {
    return NextResponse.json({ error: "Decision not found" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "visitor";
  const rate = await checkUserRateLimit(user.id, role);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded", limit: rate.limit }, { status: 429 });
  }

  const isAdmin = ["admin", "curator"].includes(profile?.role ?? "");
  if (decision.triggered_by !== user.id && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase
    .from("ai_decisions")
    .update({
      metadata: {
        ...((decision.metadata as Record<string, unknown> | null) ?? {}),
        override: true,
        overriddenBy: user.id,
        overriddenAt: new Date().toISOString(),
      },
    })
    .eq("id", body.decisionId);

  if (error) {
    console.error("[ai/override] update error:", error.message);
    return NextResponse.json({ error: "Failed to record override" }, { status: 500 });
  }

  auditLog(supabase, {
    userId: user.id,
    feature: "override",
    promptHash: await hashText(body.decisionId),
    model: "system",
    output: JSON.stringify({ decisionId: body.decisionId, override: true }),
    inputTokens: 0,
    outputTokens: 0,
    latencyMs: 0,
  }).catch(() => {
    /* best-effort logging */
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
