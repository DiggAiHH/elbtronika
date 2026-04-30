"use server";

// Auth server actions — magic link + OAuth + sign-out
// Eselbrücke: "postman" — client sends request, server delivers to Supabase

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "./server";

// ── Validation schemas ───────────────────────────────────────────────────────
const emailSchema = z.string().email("Ungültige E-Mail-Adresse.");

// ── Magic link (passwordless email) ─────────────────────────────────────────
export async function signInWithMagicLink(
  locale: string,
  formData: FormData,
): Promise<{ error: string | null }> {
  const email = formData.get("email") as string;

  const emailResult = emailSchema.safeParse(email);
  if (!emailResult.success) {
    return { error: emailResult.error.errors[0]?.message ?? "Ungültige E-Mail-Adresse." };
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/${locale}/dashboard`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("[auth] magic link error:", error.message);
    return { error: "E-Mail konnte nicht gesendet werden. Bitte erneut versuchen." };
  }

  return { error: null };
}

// ── GitHub OAuth ─────────────────────────────────────────────────────────────
export async function signInWithGitHub(locale: string): Promise<void> {
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${origin}/auth/callback?next=/${locale}/dashboard`,
    },
  });

  if (error) {
    console.error("[auth] github oauth error:", error.message);
    redirect(`/${locale}/login?error=oauth`);
  }

  if (data.url) {
    redirect(data.url);
  }
}

// ── Sign out ─────────────────────────────────────────────────────────────────
export async function signOut(locale: string): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(`/${locale}/login`);
}

// ── Get current user (server) ────────────────────────────────────────────────
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// ── Get profile ───────────────────────────────────────────────────────────────
export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();

  if (error) return null;
  return data;
}

// ── Get creator payout status (artists or djs row) ───────────────────────────
export async function getCreatorPayoutStatus(
  userId: string,
  role: "artist" | "dj",
): Promise<{ stripe_account_id: string | null; payout_enabled: boolean } | null> {
  const supabase = await createClient();
  const table = role === "artist" ? "artists" : "djs";

  const { data } = await supabase
    .from(table)
    .select("stripe_account_id, payout_enabled")
    .eq("profile_id", userId)
    .maybeSingle();

  return data ?? null;
}
