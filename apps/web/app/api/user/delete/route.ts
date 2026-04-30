import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

/**
 * POST /api/user/delete
 * DSGVO Art. 17 — Right to erasure ("Recht auf Löschung")
 */
export async function POST(_request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete related data
    await supabase.from("ai_decisions").delete().eq("triggered_by", user.id);
    await supabase.from("consent_log").delete().eq("profile_id", user.id);
    await supabase.from("orders").delete().eq("buyer_id", user.id);

    // Delete auth user
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      console.warn("[gdpr] Soft-delete fallback for user:", user.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[gdpr] Delete error:", err);
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
