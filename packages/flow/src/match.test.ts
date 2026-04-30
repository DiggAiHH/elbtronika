import { describe, it, expect } from "vitest";
import {
  audioToEmbedding,
  artToEmbedding,
  cosineSimilarity,
  calculateSimilarity,
  generateMatchReason,
  matchArtworks,
} from "./match";
import type { AudioFeatures, ArtFeatures } from "./index";

function mockAudio(overrides: Partial<AudioFeatures> = {}): AudioFeatures {
  return {
    bpm: 128,
    bpmConfidence: 0.9,
    key: "A minor",
    camelot: "8A",
    keyConfidence: 0.85,
    valence: 0.5,
    arousal: 0.7,
    spectralCentroid: 3000,
    spectralRolloff: 4500,
    zeroCrossingRate: 0.05,
    rmsEnergy: 0.3,
    dominantFrequencyRange: "mid",
    moodTags: ["energetic", "dark"],
    estimatedGenre: "techno",
    ...overrides,
  };
}

function mockArt(overrides: Partial<ArtFeatures> = {}): ArtFeatures {
  return {
    dominantColors: [{ r: 50, g: 50, b: 50, percentage: 0.6 }],
    colorHarmony: "monochromatic",
    brightness: 0.3,
    contrast: 0.6,
    saturation: 0.4,
    compositionScore: 0.7,
    symmetryScore: 0.5,
    styleTags: ["minimal", "abstract"],
    moodTags: ["dark", "ambient"],
    complexity: 0.5,
    ...overrides,
  };
}

describe("audioToEmbedding", () => {
  it("returns a normalized vector", () => {
    const embed = audioToEmbedding(mockAudio());
    expect(embed.length).toBeGreaterThan(0);
    expect(embed.every((v) => v >= 0 && v <= 1)).toBe(true);
  });
});

describe("artToEmbedding", () => {
  it("returns a normalized vector", () => {
    const embed = artToEmbedding(mockArt());
    expect(embed.length).toBeGreaterThan(0);
    expect(embed.every((v) => v >= 0 && v <= 1)).toBe(true);
  });
});

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    const a = [1, 0, 0];
    expect(cosineSimilarity(a, a)).toBe(1);
  });

  it("returns 0 for orthogonal vectors", () => {
    const a = [1, 0, 0];
    const b = [0, 1, 0];
    expect(cosineSimilarity(a, b)).toBe(0);
  });
});

describe("calculateSimilarity", () => {
  it("returns scores between 0 and 1", () => {
    const result = calculateSimilarity(mockAudio(), mockArt());
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.total).toBeLessThanOrEqual(1);
    expect(result.mood).toBeGreaterThanOrEqual(0);
    expect(result.energy).toBeGreaterThanOrEqual(0);
    expect(result.color).toBeGreaterThanOrEqual(0);
    expect(result.composition).toBeGreaterThanOrEqual(0);
  });
});

describe("generateMatchReason", () => {
  it("returns a non-empty string", () => {
    const audio = mockAudio();
    const art = mockArt();
    const breakdown = calculateSimilarity(audio, art);
    const reason = generateMatchReason(audio, art, breakdown);
    expect(typeof reason).toBe("string");
    expect(reason.length).toBeGreaterThan(0);
  });
});

describe("matchArtworks", () => {
  it("returns ranked matches", () => {
    const audio = mockAudio();
    const artworks = [
      { id: "a1", title: "Dark Wave", artist: "Artist A", features: mockArt({ brightness: 0.2, moodTags: ["dark"] }) },
      { id: "a2", title: "Bright Sun", artist: "Artist B", features: mockArt({ brightness: 0.9, moodTags: ["bright"] }) },
    ];
    const matches = matchArtworks(audio, artworks, { limit: 2 });
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]).toHaveProperty("artworkId");
    expect(matches[0]).toHaveProperty("similarityScore");
    expect(matches[0]).toHaveProperty("matchReason");
  });

  it("filters by minScore", () => {
    const audio = mockAudio();
    const artworks = [
      { id: "a1", title: "Match", artist: "A", features: mockArt({ brightness: 0.3 }) },
    ];
    const matches = matchArtworks(audio, artworks, { minScore: 0.99 });
    expect(matches.length).toBe(0);
  });

  it("diversifies styles when requested", () => {
    const audio = mockAudio();
    const artworks = [
      { id: "a1", title: "A", artist: "A", features: mockArt({ styleTags: ["minimal"] }) },
      { id: "a2", title: "B", artist: "B", features: mockArt({ styleTags: ["minimal"] }) },
      { id: "a3", title: "C", artist: "C", features: mockArt({ styleTags: ["abstract"] }) },
    ];
    const matches = matchArtworks(audio, artworks, { limit: 3, diversifyStyles: true });
    const styles = new Set(matches.map((m) => {
      const art = artworks.find((a) => a.id === m.artworkId);
      return art?.features.styleTags[0];
    }));
    expect(styles.size).toBeGreaterThanOrEqual(2);
  });
});
