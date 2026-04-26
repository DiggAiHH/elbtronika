// Dashboard — auth-gated user home
// Eselbrücke: "control room" — logged-in user sees their status + quick actions

import { redirect } from "next/navigation";
import {
  getCreatorPayoutStatus,
  getCurrentUser,
  getProfile,
  signOut,
} from "@/src/lib/supabase/auth-actions";

type Props = { params: Promise<{ locale: string }> };

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  const user = await getCurrentUser();

  if (!user) redirect(`/${locale}/login`);

  const profile = await getProfile(user.id);

  if (!profile?.display_name) {
    redirect(`/${locale}/profile/setup`);
  }

  const isCreator = profile.role === "artist" || profile.role === "dj";
  const payoutStatus = isCreator
    ? await getCreatorPayoutStatus(user.id, profile.role as "artist" | "dj")
    : null;
  const needsKyc = isCreator && !payoutStatus?.payout_enabled;

  const roleLabel: Record<string, string> = {
    visitor: locale === "de" ? "Besucher" : "Visitor",
    collector: locale === "de" ? "Sammler" : "Collector",
    artist: locale === "de" ? "Künstler" : "Artist",
    dj: "DJ",
    curator: locale === "de" ? "Kurator" : "Curator",
    admin: "Admin",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-xl font-bold tracking-widest uppercase">ELBTRONIKA</h1>
          <form action={signOut.bind(null, locale)}>
            <button
              type="submit"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {locale === "de" ? "Abmelden" : "Sign out"}
            </button>
          </form>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold">
            {locale === "de" ? "Willkommen" : "Welcome"}, {profile.display_name}
          </h2>
          <p className="mt-1 text-zinc-400 text-sm">
            {user.email} · {roleLabel[profile.role] ?? profile.role}
          </p>
        </div>

        {needsKyc && (
          <div className="mb-6 rounded-lg border border-amber-800 bg-amber-950/40 px-5 py-4">
            <p className="text-amber-300 font-medium text-sm">
              {locale === "de"
                ? "Schließe das Stripe-Onboarding ab, um Auszahlungen zu erhalten."
                : "Complete Stripe onboarding to receive payouts."}
            </p>
            <a
              href={`/${locale}/artist-onboarding/stripe`}
              className="mt-2 inline-block text-sm text-amber-200 underline underline-offset-2"
            >
              {locale === "de" ? "Jetzt einrichten →" : "Set up now →"}
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatusCard
            label={locale === "de" ? "Rolle" : "Role"}
            value={roleLabel[profile.role] ?? profile.role}
          />
          <StatusCard
            label={locale === "de" ? "Mitglied seit" : "Member since"}
            value={new Date(profile.created_at).toLocaleDateString(locale)}
          />
          {isCreator && (
            <StatusCard
              label={locale === "de" ? "Auszahlungen" : "Payouts"}
              value={payoutStatus?.payout_enabled ? "✓ Aktiv" : "⚠ Ausstehend"}
            />
          )}
        </div>

        <div className="mt-12 rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-center">
          <p className="text-zinc-500 text-sm">
            {locale === "de"
              ? "Die Galerie wird in Phase 7 freigeschaltet."
              : "The gallery unlocks in Phase 7."}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-4">
      <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-white font-medium">{value}</p>
    </div>
  );
}
