"use client";

// Stripe Connect KYC onboarding page
// Eselbrücke: "bank desk" — creates Stripe account + redirects to their form

import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

export default function StripeOnboardingClient() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale ?? "de";
  const searchParams = useSearchParams();
  const isRefresh = searchParams.get("refresh") === "1";

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const startOnboarding = useCallback(() => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/stripe/connect", {
          method: "POST",
          headers: { "x-locale": locale },
        });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          setError(data.error ?? (locale === "de" ? "Unbekannter Fehler." : "Unknown error."));
          return;
        }
        window.location.href = data.url;
      } catch {
        setError(locale === "de" ? "Verbindung fehlgeschlagen." : "Connection failed.");
      }
    });
  }, [locale]);

  useEffect(() => {
    if (isRefresh) startOnboarding();
  }, [isRefresh, startOnboarding]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-bold tracking-widest text-white uppercase">ELBTRONIKA</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {locale === "de"
              ? "Stripe-Konto einrichten für Auszahlungen"
              : "Set up Stripe account for payouts"}
          </p>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-5 text-left space-y-3">
          <p className="text-sm text-white font-medium">
            {locale === "de" ? "Was wird benötigt?" : "What's needed?"}
          </p>
          <ul className="text-sm text-zinc-400 space-y-1 list-disc list-inside">
            <li>{locale === "de" ? "Bankverbindung (IBAN)" : "Bank account (IBAN)"}</li>
            <li>{locale === "de" ? "Personalausweis / Reisepass" : "ID / Passport"}</li>
            <li>{locale === "de" ? "Adresse" : "Address"}</li>
          </ul>
          <p className="text-xs text-zinc-600 pt-1">
            {locale === "de"
              ? "Daten werden direkt von Stripe verarbeitet — ELBTRONIKA sieht sie nicht."
              : "Data is processed directly by Stripe — ELBTRONIKA does not see it."}
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={startOnboarding}
          disabled={isPending}
          className="w-full rounded-md bg-white px-4 py-3 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-50 transition-colors"
        >
          {isPending
            ? locale === "de"
              ? "Weiterleitung zu Stripe…"
              : "Redirecting to Stripe…"
            : locale === "de"
              ? "Stripe-Onboarding starten →"
              : "Start Stripe onboarding →"}
        </button>

        <a
          href={`/${locale}/dashboard`}
          className="block text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          {locale === "de" ? "Später einrichten" : "Set up later"}
        </a>
      </div>
    </div>
  );
}
