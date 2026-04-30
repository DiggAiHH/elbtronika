"use client";

// Login page — magic link (passwordless) + GitHub OAuth
// Eselbrücke: "two doors" — email door (magic link) or GitHub door (OAuth)

import { useParams, useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { signInWithGitHub, signInWithMagicLink } from "@/src/lib/supabase/auth-actions";

export default function LoginClient() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale ?? "de";
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam ? "Anmeldung fehlgeschlagen. Bitte erneut versuchen." : null,
  );
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await signInWithMagicLink(locale, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSent(true);
        setError(null);
      }
    });
  }

  function handleGitHub() {
    startTransition(async () => {
      await signInWithGitHub(locale);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-widest text-white uppercase">ELBTRONIKA</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {locale === "de" ? "Anmelden oder Konto erstellen" : "Sign in or create account"}
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-center">
            <p className="text-white font-medium">
              {locale === "de" ? "E-Mail gesendet ✓" : "Email sent ✓"}
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              {locale === "de"
                ? "Überprüfe deinen Posteingang und klicke auf den Link."
                : "Check your inbox and click the link."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <form ref={formRef} onSubmit={handleMagicLink} className="space-y-3">
              <label className="block">
                <span className="text-sm text-zinc-400">
                  {locale === "de" ? "E-Mail-Adresse" : "Email address"}
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder={locale === "de" ? "deine@email.de" : "your@email.com"}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-white focus:outline-none focus:ring-1 focus:ring-white text-sm"
                />
              </label>
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-50 transition-colors"
              >
                {isPending
                  ? locale === "de"
                    ? "Wird gesendet…"
                    : "Sending…"
                  : locale === "de"
                    ? "Magic Link senden"
                    : "Send Magic Link"}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0a0a0b] px-2 text-zinc-600">
                  {locale === "de" ? "oder" : "or"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGitHub}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              {locale === "de" ? "Mit GitHub anmelden" : "Sign in with GitHub"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
