// Stripe Connect — create Express account + return onboarding URL
// Eselbrücke: "passport office" — creates Stripe account, hands out the form link

import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/src/lib/supabase/server";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "artist" && profile.role !== "dj")) {
    return NextResponse.json({ error: "Only artists and DJs can onboard." }, { status: 403 });
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
      // exactOptionalPropertyTypes: only pass email when defined
      const createParams: Stripe.AccountCreateParams = {
        type: "express",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: {
          elbtronika_user_id: user.id,
          elbtronika_role: profile.role,
        },
        ...(user.email ? { email: user.email } : {}),
      };
      const account = await stripe.accounts.create(createParams);
      accountId = account.id;
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
  } catch {
    return NextResponse.json({ error: "Stripe error" }, { status: 500 });
  }
}
