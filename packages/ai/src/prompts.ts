/**
 * Prompt templates for AI curation features.
 * All prompts are German-first with English fallbacks.
 */

import type { AIPrompt, AIDescriptionRequest, AIRecommendRequest } from "./types";
import { DEFAULT_MODEL } from "./client";

const SYSTEM_IDENTITY = `Du bist ELBTRONIKA — ein KI-Kurator für eine digitale Kunstplattform, die Techno-Kultur mit bildender Kunst verbindet.
Du schreibst präzise, atmosphärisch und nie generisch. Jeder Text soll klingen, als hätte ein Mensch ihn verfasst.
Wichtig: Du sprichst die Zielgruppe direkt an (Künstler, Sammler, Clubbesucher).`;

const SYSTEM_JSON = `${SYSTEM_IDENTITY}\n\nDu antwortest ausschließlich im JSON-Format ohne Markdown-Formatierung, ohne Erklärungen außerhalb des JSON.`;

function buildSystemPrompt(base: string, language: "de" | "en"): string {
  if (language === "en") {
    return base.replace(
      /Du bist ELBTRONIKA.*?Clubbesucher\)\./s,
      "You are ELBTRONIKA — an AI curator for a digital art platform connecting techno culture with fine art. You write precisely, atmospherically, and never generically. Every text should sound as if a human wrote it. You address the target audience directly (artists, collectors, club visitors).",
    );
  }
  return base;
}

export function createDescriptionPrompt(
  req: AIDescriptionRequest,
): AIPrompt {
  const lang = req.language ?? "de";
  const tone = req.tone ?? "gallery";
  const bullets = req.bullets.map((b) => `- ${b}`).join("\n");

  const toneInstruction =
    tone === "poetic"
      ? "Schreibe poetisch, mit Bildern und Rhythmus."
      : tone === "factual"
        ? "Schreibe sachlich und informativ."
        : "Schreibe im Stil einer renommierten Galeriebeschreibung.";

  const userContent = `Ein Künstler hat folgende Stichpunkte zu seinem Kunstwerk geliefert:

${bullets}

${toneInstruction}
Erstelle 3 Varianten einer Artwork-Beschreibung (jeweils 80–150 Wörter). Gib das Ergebnis als JSON zurück:

{
  "variants": ["Variante 1", "Variante 2", "Variante 3"]
}`;

  return {
    system: buildSystemPrompt(SYSTEM_JSON, lang),
    messages: [{ role: "user", content: userContent }],
    model: DEFAULT_MODEL,
    maxTokens: 2048,
    temperature: 0.8,
  };
}

export function createRecommendationPrompt(
  req: AIRecommendRequest,
  catalogContext: string,
): AIPrompt {
  const lang = req.language ?? "de";
  const limit = req.limit ?? 3;

  const userContent = `Ein Nutzer beschreibt seine gewünschte Stimmung so:
"${req.mood}"

Hier ist ein Auszug aus unserem aktuellen Katalog:
${catalogContext}

Schlage ${limit} Artworks vor, die zu dieser Stimmung passen. Für jedes Artwork gib eine kurze Begründung (1–2 Sätze), warum es passt. Antworte als JSON:

{
  "suggestions": [
    { "artworkId": "...", "title": "...", "artist": "...", "reason": "..." }
  ]
}`;

  return {
    system: buildSystemPrompt(SYSTEM_JSON, lang),
    messages: [{ role: "user", content: userContent }],
    model: DEFAULT_MODEL,
    maxTokens: 2048,
    temperature: 0.7,
  };
}

export function createExplainPrompt(
  originalPrompt: string,
  originalOutput: string,
  language: "de" | "en" = "de",
): AIPrompt {
  const userContent = `Du hast kürzlich folgende Empfehlung abgegeben:

Prompt: ${originalPrompt}
Ergebnis: ${originalOutput}

Erkläre dem Nutzer in 2–3 Sätzen, warum du diese Auswahl getroffen hast. Beziehe dich auf die Stimmungsbeschreibung des Nutzers und die Eigenschaften der vorgeschlagenen Werke. Antworte als JSON:

{
  "explanation": "..."
}`;

  return {
    system: buildSystemPrompt(SYSTEM_JSON, language),
    messages: [{ role: "user", content: userContent }],
    model: DEFAULT_MODEL,
    maxTokens: 1024,
    temperature: 0.5,
  };
}

export function createFlowMatchPrompt(
  req: import("./types").FlowMatchRequest,
  audioFeatures: string,
): import("./types").AIPrompt {
  const lang = req.language ?? "de";
  const limit = req.limit ?? 5;

  const catalogText = req.artworkCatalog
    .map(
      (aw) =>
        `- "${aw.title}" (ID: ${aw.id}) by ${aw.artist}${aw.medium ? `, ${aw.medium}` : ""}${aw.description ? ` — ${aw.description.slice(0, 100)}` : ""}`,
    )
    .join("\n");

  const userContent = `Ein DJ-Set hat folgende Audio-Merkmale:
${audioFeatures}

Hier ist der aktuelle Kunstkatalog:
${catalogText}

Schlage ${limit} Artworks vor, die am besten zu diesem Set passen. Berücksichtige:
1. Stimmungsübereinstimmung (dunkel/hell, energetisch/ruhig)
2. Energie-Level (BPM, Arousal)
3. Farbresonanz (Helligkeit der Musik vs. Bild)
4. Komposition (strukturelle Ähnlichkeiten)

Antworte als JSON:
{
  "matches": [
    { "artworkId": "...", "title": "...", "artist": "...", "reason": "...", "confidence": 0.92 }
  ]
}`;

  return {
    system: buildSystemPrompt(SYSTEM_JSON, lang),
    messages: [{ role: "user", content: userContent }],
    model: DEFAULT_MODEL,
    maxTokens: 2048,
    temperature: 0.7,
  };
}

export function createCurationPrompt(
  roomName: string,
  djName: string,
  setDescription: string,
  selectedArtworks: string,
  language: "de" | "en" = "de",
): import("./types").AIPrompt {
  const userContent = language === "de"
    ? `Erstelle eine Kuratier-Beschreibung für den Raum "${roomName}".
DJ: ${djName}
Set-Beschreibung: ${setDescription}

Ausgewählte Artworks:
${selectedArtworks}

Schreibe 2-3 Sätze, die erklären, warum diese Werke zu diesem Set passen. Atmosphärisch, nie generisch.`
    : `Create a curation description for room "${roomName}".
DJ: ${djName}
Set description: ${setDescription}

Selected artworks:
${selectedArtworks}

Write 2-3 sentences explaining why these works fit this set. Atmospheric, never generic.`;

  return {
    system: buildSystemPrompt(SYSTEM_IDENTITY, language),
    messages: [{ role: "user", content: userContent }],
    model: DEFAULT_MODEL,
    maxTokens: 1024,
    temperature: 0.8,
  };
}

export { SYSTEM_IDENTITY, SYSTEM_JSON };
