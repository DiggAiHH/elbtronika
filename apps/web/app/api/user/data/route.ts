import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

/**
 * GET /api/user/data
 * DSGVO Art. 15 — Right of access ("Recht auf Auskunft")
 * Returns all personal data as JSON for GDPR data export.
 */
export async function GET(_request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all related data
    const [profile, orders, aiDecisions, consents] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("orders").select("*").eq("buyer_id", user.id),
      supabase.from("ai_decisions").select("*").eq("triggered_by", user.id),
      supabase.from("consent_log").select("*").eq("profile_id", user.id),
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
        lastSignIn: user.last_sign_in_at,
      },
      profile: profile.data,
      orders: orders.data ?? [],
      aiDecisions: aiDecisions.data ?? [],
      consents: consents.data ?? [],
    };

    return NextResponse.json(exportData);
  } catch (err) {
    console.error("[gdpr] Export error:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
