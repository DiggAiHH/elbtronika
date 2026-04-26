"use client";

// Profile setup — runs once after first login (display_name still null)
// Eselbrücke: "name badge desk" — pick your name and role before entering

import { useParams, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createClient } from "@/src/lib/supabase/client";

const ROLES = [
  { value: "collector", de: "Sammler", en: "Collector" },
  { value: "artist", de: "Künstler", en: "Artist" },
  { value: "dj", de: "DJ", en: "DJ" },
] as const;

export default function ProfileSetupPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale ?? "de";
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<string>("collector");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) {
      setError(locale === "de" ? "Name darf nicht leer sein." : "Name cannot be empty.");
      return;
    }
    startTransition(async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim(), role, bio: bio.trim() || null })
        .eq("id", user.id);

      if (updateError) {
        setError(
          locale === "de" ? "Profil konnte nicht gespeichert werden." : "Could not save profile.",
        );
        return;
      }
      if (role === "artist" || role === "dj") {
        router.push(`/${locale}/artist-onboarding/stripe`);
      } else {
        router.push(`/${locale}/dashboard`);
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-widest text-white uppercase">ELBTRONIKA</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {locale === "de" ? "Profil einrichten" : "Set up your profile"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-md border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <label className="block">
            <span className="text-sm text-zinc-400">
              {locale === "de" ? "Anzeigename *" : "Display name *"}
            </span>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              maxLength={80}
              placeholder={locale === "de" ? "Dein Name" : "Your name"}
              className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-white focus:outline-none focus:ring-1 focus:ring-white text-sm"
            />
          </label>

          <fieldset>
            <legend className="text-sm text-zinc-400 mb-2">
              {locale === "de" ? "Ich bin …" : "I am a …"}
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(({ value, de, en }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    role === value
                      ? "border-white bg-white text-black"
                      : "border-zinc-700 bg-zinc-900 text-white hover:border-zinc-500"
                  }`}
                >
                  {locale === "de" ? de : en}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-sm text-zinc-400">
              {locale === "de" ? "Kurzbiografie (optional)" : "Short bio (optional)"}
            </span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={300}
              rows={3}
              placeholder={locale === "de" ? "Erzähl uns von dir …" : "Tell us about yourself …"}
              className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-white focus:outline-none focus:ring-1 focus:ring-white text-sm resize-none"
            />
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-50 transition-colors"
          >
            {isPending
              ? locale === "de"
                ? "Wird gespeichert…"
                : "Saving…"
              : locale === "de"
                ? "Weiter →"
                : "Continue →"}
          </button>
        </form>
      </div>
    </div>
  );
}
