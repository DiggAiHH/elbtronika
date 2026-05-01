// Stripe Connect — create Express account + return onboarding URL
// Eselbrücke: "passport office" — creates Stripe account, hands out the form link

import { getStripe } from "@elbtronika/payments";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
<<<<<<< HEAD
import { getStripe } from "@elbtronika/payments";
import { getEnv } from "@/src/lib/env";
import { getDemoArtistAccountId } from "@/src/lib/stripe/demo";
=======
>>>>>>> feature/phase-18-19-tests-and-prd-docs

export async function POST(request: NextRequest) {
  const { ELT_MODE } = getEnv();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "artist" && profile.role !== "dj")) {
    return NextResponse.json({ error: "Only artists and DJs can onboard." }, { status: 403 });
  }

  // Demo mode: return a mock onboarding stub — no real Stripe KYC
  if (ELT_MODE === "demo") {
    const slug = profile.display_name?.toLowerCase().replace(/\s+/g, "-") ?? "unknown";
    const mockAccountId = getDemoArtistAccountId(slug);
    return NextResponse.json({
      url: null,
      accountId: mockAccountId,
      demo: true,
      message: "Demo mode: Stripe onboarding is mocked. No real KYC required.",
    });
  }

  const stripe = getStripe();

  try {
    const existingTable = profile.role === "artist" ? "artists" : "djs";
    const { data: existing } = await supabase
      .from(existingTable)
      .select("stripe_account_id")
      .eq("profile_id", user.id)
      .maybeSingle();

    let accountId = existing?.stripe_account_id;

    if (!accountId) {
      const createParams = {
        type: "express" as const,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual" as const,
        metadata: {
          elbtronika_user_id: user.id,
          elbtronika_role: profile.role,
        },
        ...(user.email ? { email: user.email } : {}),
      };
      const account = await stripe.accounts.create(createParams);
      accountId = account.id;

      // Store account ID immediately
      await supabase
        .from(existingTable)
        .update({ stripe_account_id: accountId })
        .eq("profile_id", user.id);
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const locale = request.headers.get("x-locale") ?? "de";

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/${locale}/artist-onboarding/stripe?refresh=1`,
      return_url: `${origin}/${locale}/dashboard?onboarding=complete`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url, accountId });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[stripe/connect] error:", message);
    return NextResponse.json({ error: "Stripe error" }, { status: 500 });
  }
}
