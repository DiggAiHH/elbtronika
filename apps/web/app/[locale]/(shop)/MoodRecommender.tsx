"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("recommender");
  const [mood, setMood] = useState("");
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  const handleSubmit = () => {
    if (!mood.trim()) return;

    startTransition(async () => {
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
        setError(t("errorNetwork"));
      }
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
        {t("title")}
      </h3>

      <p className="text-xs text-[var(--color-text-secondary)]">
        {t("description")}
      </p>

      <div className="flex gap-2">
        <Input
          value={mood}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMood(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") handleSubmit();
          }}
          placeholder={t("placeholder")}
          className="flex-1"
        />
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isPending || !mood.trim()}
        >
          {isPending ? t("buttonLoading") : t("buttonIdle")}
        </Button>
      </div>

      {error && (
        <p className="text-xs text-[var(--color-error)]">{error}</p>
      )}

      {remaining !== null && (
        <p className="text-xs text-[var(--color-text-tertiary)]">
          {t("remaining", { count: remaining })}
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
