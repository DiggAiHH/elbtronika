"use client";

import { Button, Input } from "@elbtronika/ui";
import { useState } from "react";

interface Props {
  locale?: "de" | "en";
  onSelect?: (text: string) => void;
}

export function AIDescriptionAssistant({ locale = "de", onSelect }: Props) {
  const [bullets, setBullets] = useState<string[]>([""]);
  const [tone, setTone] = useState<"poetic" | "factual" | "gallery">("gallery");
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  const addBullet = () => setBullets((prev) => [...prev, ""]);
  const updateBullet = (index: number, value: string) => {
    setBullets((prev) => prev.map((b, i) => (i === index ? value : b)));
  };
  const removeBullet = (index: number) => {
    setBullets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    const validBullets = bullets.filter((b) => b.trim().length > 0);
    if (validBullets.length === 0) return;

    setLoading(true);
    setError(null);
    setVariants(null);

    try {
      const res = await fetch("/api/ai/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullets: validBullets, language: locale, tone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Unknown error");
        return;
      }

      setVariants(data.variants);
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
        {locale === "de" ? "KI-Assistent: Beschreibung" : "AI Assistant: Description"}
      </h3>

      <div className="flex flex-col gap-2">
        {bullets.map((b, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={b}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateBullet(i, e.target.value)}
              placeholder={locale === "de" ? `Stichpunkt ${i + 1}` : `Bullet point ${i + 1}`}
              className="flex-1"
            />
            {bullets.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeBullet(i)}
                aria-label={locale === "de" ? "Entfernen" : "Remove"}
              >
                −
              </Button>
            )}
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={addBullet}>
          {locale === "de" ? "+ Stichpunkt" : "+ Bullet point"}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-[var(--color-text-secondary)]">
          {locale === "de" ? "Tonfall:" : "Tone:"}
        </label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value as typeof tone)}
          className="h-8 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-transparent px-2 text-xs text-[var(--color-text-primary)]"
        >
          <option value="gallery">{locale === "de" ? "Galerie" : "Gallery"}</option>
          <option value="poetic">{locale === "de" ? "Poetisch" : "Poetic"}</option>
          <option value="factual">{locale === "de" ? "Sachlich" : "Factual"}</option>
        </select>
      </div>

      <Button
        variant="primary"
        onClick={handleGenerate}
        disabled={loading || bullets.filter((b) => b.trim()).length === 0}
      >
        {loading
          ? locale === "de"
            ? "Schreibe…"
            : "Writing…"
          : locale === "de"
            ? "3 Varianten generieren"
            : "Generate 3 variants"}
      </Button>

      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}

      {remaining !== null && (
        <p className="text-xs text-[var(--color-text-tertiary)]">
          {locale === "de"
            ? `Noch ${remaining} Anfragen heute`
            : `${remaining} requests remaining today`}
        </p>
      )}

      {variants && (
        <div className="flex flex-col gap-3">
          {variants.map((v, i) => (
            <button
              key={i}
              onClick={() => onSelect?.(v)}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-left text-sm text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)]"
            >
              <span className="mb-1 block text-xs font-medium text-[var(--color-primary)]">
                {locale === "de" ? `Variante ${i + 1}` : `Variant ${i + 1}`}
              </span>
              {v}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
