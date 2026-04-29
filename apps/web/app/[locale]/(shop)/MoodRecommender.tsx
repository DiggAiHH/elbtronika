"use client";

import { useState } from "react";
import { Button, Input } from "@elbtronika/ui";

interface Suggestion {
  artworkId: string;
  title: string;
  artist: string;
  reason: string;
}

interface Props {
  locale?: "de" | "en";
}

export function MoodRecommender({ locale = "de" }: Props) {
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (!mood.trim()) return;

    setLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: mood.trim(), language: locale }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Unknown error");
        return;
      }

      setSuggestions(data.suggestions);
      setRemaining(data.meta?.remaining ?? null);
    } catch {
      setError(locale === "de" ? "Netzwerkfehler" : "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
        {locale === "de"
          ? "Stimmungsbasierte Empfehlung"
          : "Mood-based Recommendation"}
      </h3>

      <p className="text-xs text-[var(--color-text-secondary)]">
        {locale === "de"
          ? "Beschreibe deine gewünschte Stimmung — unsere KI schlägt passende Werke vor."
          : "Describe your desired mood — our AI suggests matching artworks."}
      </p>

      <div className="flex gap-2">
        <Input
          value={mood}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMood(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") handleSubmit();
          }}
          placeholder={
            locale === "de"
              ? "z.B. düster und hypnotisch"
              : "e.g. dark and hypnotic"
          }
          className="flex-1"
        />
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading || !mood.trim()}
        >
          {loading
            ? locale === "de"
              ? "Denke…"
              : "Thinking…"
            : locale === "de"
              ? "Empfehlen"
              : "Recommend"}
        </Button>
      </div>

      {error && (
        <p className="text-xs text-[var(--color-error)]">{error}</p>
      )}

      {remaining !== null && (
        <p className="text-xs text-[var(--color-text-tertiary)]">
          {locale === "de"
            ? `Noch ${remaining} Anfragen heute`
            : `${remaining} requests remaining today`}
        </p>
      )}

      {suggestions && (
        <div className="flex flex-col gap-3">
          {suggestions.map((s) => (
            <a
              key={s.artworkId}
              href={`/artwork/${s.artworkId}`}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3 transition hover:border-[var(--color-primary)]"
            >
              <div className="text-sm font-medium text-[var(--color-text-primary)]">
                {s.title}
              </div>
              <div className="text-xs text-[var(--color-text-secondary)]">
                {s.artist}
              </div>
              <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                {s.reason}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
