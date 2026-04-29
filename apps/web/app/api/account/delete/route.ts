// DSGVO Art. 17 — Löschung: kaskadierte Löschung + Anonymisierung
// Eselbrücke: "Der Schredder" — löscht personenbezogene Daten,
// anonymisiert Bestellungen (Buchhaltungsrecht: 10 Jahre).

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

// ---------------------------------------------------------------------------
// POST /api/account/delete
// ---------------------------------------------------------------------------
export async function POST(_request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  // Step 1: Anonymize orders (replace buyer_id with null + mask PII)
  const { error: orderError } = await supabase
    .from("orders")
    .update({
      buyer_id: "00000000-0000-0000-0000-000000000000",
      // Note: In a real implementation, you'd also anonymize shipping addresses
      // stored in a separate table. This is the MVP scaffold.
    })
    .eq("buyer_id", userId);

  if (orderError) {
    console.error("[account/delete] order anonymization failed:", orderError.message);
    return NextResponse.json(
      { error: "Failed to anonymize orders" },
      { status: 500 },
    );
  }

  // Step 2: Delete soft-deletable data
  const deletions = await Promise.all([
    supabase.from("consent_log").delete().eq("profile_id", userId),
    supabase.from("ai_decisions").delete().eq("triggered_by", userId),
    supabase.from("profiles").delete().eq("id", userId),
    supabase.from("artists").delete().eq("profile_id", userId),
    supabase.from("djs").delete().eq("profile_id", userId),
  ]);

  const deletionErrors = deletions
    .map((d, i) => (d.error ? { table: ["consent_log", "ai_decisions", "profiles", "artists", "djs"][i], error: d.error.message } : null))
    .filter(Boolean);

  if (deletionErrors.length > 0) {
    console.error("[account/delete] deletion errors:", deletionErrors);
    return NextResponse.json(
      { error: "Partial deletion failure", details: deletionErrors },
      { status: 500 },
    );
  }

  // Step 3: Delete auth user (cascades via Supabase Auth)
  const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);

  if (authDeleteError) {
    console.error("[account/delete] auth deletion failed:", authDeleteError.message);
    return NextResponse.json(
      { error: "Failed to delete auth user" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      message:
        "Account deleted. Orders anonymized for bookkeeping retention.",
    },
    { status: 200 },
  );
}
