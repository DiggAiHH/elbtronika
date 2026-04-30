import { describe, it, expect } from "vitest";
import {
  createDescriptionPrompt,
  createRecommendationPrompt,
  createExplainPrompt,
} from "./prompts";

describe("createDescriptionPrompt", () => {
  it("builds a German gallery-style prompt by default", () => {
    const prompt = createDescriptionPrompt({
      bullets: ["Acryl auf Leinwand", "120x80cm", "Neon-Grün auf Schwarz"],
    });

    expect(prompt.system).toContain("ELBTRONIKA");
    expect(prompt.system).toContain("JSON");
    expect(prompt.messages[0]!.content).toContain("Acryl auf Leinwand");
    expect(prompt.messages[0]!.content).toContain('"variants"');
    expect(prompt.temperature).toBe(0.8);
  });

  it("switches to English when requested", () => {
    const prompt = createDescriptionPrompt({
      bullets: ["Oil on canvas"],
      language: "en",
      tone: "poetic",
    });

    expect(prompt.system).toContain("You are ELBTRONIKA");
    expect(prompt.messages[0]!.content).toContain("Schreibe poetisch");
  });

  it("includes all bullet points in the user message", () => {
    const bullets = ["A", "B", "C"];
    const prompt = createDescriptionPrompt({ bullets });
    bullets.forEach((b) => {
      expect(prompt.messages[0]!.content).toContain(b);
    });
  });
});

describe("createRecommendationPrompt", () => {
  it("includes mood and catalog context", () => {
    const prompt = createRecommendationPrompt(
      { mood: "düster und hypnotisch" },
      "Katalog: Artwork X von Artist Y",
    );

    expect(prompt.messages[0]!.content).toContain("düster und hypnotisch");
    expect(prompt.messages[0]!.content).toContain("Katalog: Artwork X");
    expect(prompt.messages[0]!.content).toContain('"suggestions"');
  });

  it("respects the limit parameter", () => {
    const prompt = createRecommendationPrompt(
      { mood: "test", limit: 5 },
      "catalog",
    );
    expect(prompt.messages[0]!.content).toContain("Schlage 5 Artworks vor");
  });
});

describe("createExplainPrompt", () => {
  it("references the original prompt and output", () => {
    const prompt = createExplainPrompt(
      "Mood: dark",
      "Suggestion: Artwork A",
      "en",
    );

    expect(prompt.messages[0]!.content).toContain("Mood: dark");
    expect(prompt.messages[0]!.content).toContain("Suggestion: Artwork A");
    expect(prompt.system).toContain("You are ELBTRONIKA");
    expect(prompt.maxTokens).toBe(1024);
  });
});
