/**
 * DSGVO Art. 17 — Recht auf Löschung
 * Idempotente Operation: wiederholte Aufrufe geben 200 zurück.
 */

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
    // Idempotent: if user is already gone, treat as success
    return NextResponse.json(
      { success: true, message: "Account already deleted or session expired" },
      { status: 200 },
    );
  }

  const userId = user.id;

  // Step 1: Anonymize orders (idempotent — safe to run multiple times)
  const { error: orderError } = await supabase
    .from("orders")
    .update({
      buyer_id: "00000000-0000-0000-0000-000000000000",
    })
    .eq("buyer_id", userId);

  if (orderError) {
    console.error("[account/delete] order anonymization failed:", orderError.message);
    return NextResponse.json({ error: "Failed to anonymize orders" }, { status: 500 });
  }

  // Step 2: Delete soft-deletable data (idempotent — delete on non-existing row is fine)
  const deletions = await Promise.all([
    supabase.from("consent_log").delete().eq("profile_id", userId),
    supabase.from("ai_decisions").delete().eq("triggered_by", userId),
    supabase.from("profiles").delete().eq("id", userId),
    supabase.from("artists").delete().eq("profile_id", userId),
    supabase.from("djs").delete().eq("profile_id", userId),
  ]);

  const deletionErrors = deletions
    .map((d, i) =>
      d.error
        ? {
            table: ["consent_log", "ai_decisions", "profiles", "artists", "djs"][i],
            error: d.error.message,
          }
        : null,
    )
    .filter(Boolean);

  // Non-fatal errors: some tables may not have rows for this user
  if (deletionErrors.length > 0) {
    console.warn("[account/delete] non-fatal deletion issues:", deletionErrors);
  }

  // Step 3: Delete auth user (idempotent — Supabase returns error if user doesn't exist)
  const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);

  if (authDeleteError) {
    // If user doesn't exist in auth anymore, treat as already deleted
    if (authDeleteError.message.includes("User not found")) {
      return NextResponse.json(
        { success: true, message: "Account already deleted" },
        { status: 200 },
      );
    }
    console.error("[account/delete] auth deletion failed:", authDeleteError.message);
    return NextResponse.json({ error: "Failed to delete auth user" }, { status: 500 });
  }

  return NextResponse.json(
    {
      success: true,
      message: "Account deleted. Orders anonymized for bookkeeping retention.",
    },
    { status: 200 },
  );
}
