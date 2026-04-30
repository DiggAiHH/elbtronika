// DSGVO Art. 15 — Auskunft: JSON-Export aller Daten des Users
// Eselbrücke: "Der Aktenordner" — sammelt ALLE Daten eines Users in einem Download.

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

// ---------------------------------------------------------------------------
// GET /api/account/data
// ---------------------------------------------------------------------------
export async function GET(_request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all user-related data in parallel
  const [
    { data: profile },
    { data: consentLogs },
    { data: orders },
    { data: aiDecisions },
    { data: artist },
    { data: dj },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("consent_log").select("*").eq("profile_id", user.id),
    supabase.from("orders").select("*").eq("buyer_id", user.id),
    supabase.from("ai_decisions").select("*").eq("triggered_by", user.id),
    supabase.from("artists").select("*").eq("profile_id", user.id).maybeSingle(),
    supabase.from("djs").select("*").eq("profile_id", user.id).maybeSingle(),
  ]);

  const exportData = {
    export_metadata: {
      generated_at: new Date().toISOString(),
      user_id: user.id,
      email: user.email,
      format_version: "1.0",
    },
    profile: profile ?? null,
    artist_profile: artist ?? null,
    dj_profile: dj ?? null,
    consent_history: consentLogs ?? [],
    orders: orders ?? [],
    ai_decisions: aiDecisions ?? [],
  };

  return new Response(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="elbtronika-data-export-${user.id}.json"`,
    },
  });
}
