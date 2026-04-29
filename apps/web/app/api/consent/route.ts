// Consent logging endpoint
// Eselbrücke: "Der Notar" — schreibt jede Consent-Entscheidung in die Tabelle.

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/lib/supabase/server";

const ConsentBodySchema = z.object({
  analytics: z.boolean(),
  spatial_tracking: z.boolean(),
  marketing: z.boolean(),
});

function hashIp(ip: string): string {
  // Simple hash — in production use HMAC with a secret salt
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16).slice(0, 16);
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

// ---------------------------------------------------------------------------
// POST /api/consent
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let body: z.infer<typeof ConsentBodySchema>;
  try {
    body = ConsentBodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? null;
  const version = "2026-04-29-v1";

  const entries = [
    {
      consent_type: "analytics",
      granted: body.analytics,
      profile_id: user?.id ?? "00000000-0000-0000-0000-000000000000",
      ip_hash: hashIp(ip),
      user_agent: userAgent,
      document_version: version,
    },
    {
      consent_type: "spatial_tracking",
      granted: body.spatial_tracking,
      profile_id: user?.id ?? "00000000-0000-0000-0000-000000000000",
      ip_hash: hashIp(ip),
      user_agent: userAgent,
      document_version: version,
    },
    {
      consent_type: "marketing",
      granted: body.marketing,
      profile_id: user?.id ?? "00000000-0000-0000-0000-000000000000",
      ip_hash: hashIp(ip),
      user_agent: userAgent,
      document_version: version,
    },
  ];

  const { error } = await supabase.from("consent_log").insert(entries);

  if (error) {
    console.error("[consent] insert error:", error.message);
    return NextResponse.json(
      { error: "Failed to log consent" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
