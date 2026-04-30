/**
 * Music-Art Matching Engine
 * Embeds audio and art features into a shared vector space for similarity search.
 */

import type { AudioFeatures } from "./audio";
import type { ArtFeatures } from "./art";

export interface MatchResult {
  artworkId: string;
  title: string;
  artist: string;
  similarityScore: number;
  matchReason: string;
  featureBreakdown: {
    mood: number;
    energy: number;
    color: number;
    composition: number;
  };
}

export interface MatchOptions {
  limit?: number;
  minScore?: number;
  diversifyStyles?: boolean;
}

const DEFAULT_MATCH_OPTS: Required<MatchOptions> = {
  limit: 5,
  minScore: 0.3,
  diversifyStyles: true,
};

/**
 * Create an embedding vector from audio features.
 * Normalized to [0, 1] range.
 */
export function audioToEmbedding(audio: AudioFeatures): number[] {
  // 16-dimensional embedding
  const bpmNorm = (audio.bpm - 60) / 140; // 60-200 → 0-1
  const valenceNorm = audio.valence;
  const arousalNorm = audio.arousal;
  const brightnessNorm = Math.min(1, audio.spectralCentroid / 8000);
  const rmsNorm = Math.min(1, audio.rmsEnergy * 2);
  const zcrNorm = Math.min(1, audio.zeroCrossingRate * 10);

  // Key encoding (one-hot-ish for 12 tones + major/minor)
  const keyBase = audio.key.split(" ")[0] ?? "C";
  const keyIndex = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].indexOf(keyBase);
  const isMinor = audio.key.includes("minor");
  const keyEmbedding = Array(12).fill(0);
  if (keyIndex >= 0) keyEmbedding[keyIndex] = 1;

  // Mood tag encoding (6 common tags)
  const moodTags = ["dark", "bright", "energetic", "ambient", "intense", "chill"];
  const moodEmbedding = moodTags.map((tag) => (audio.moodTags.includes(tag) ? 1 : 0));

  return [
    bpmNorm,
    valenceNorm,
    arousalNorm,
    brightnessNorm,
    rmsNorm,
    zcrNorm,
    isMinor ? 1 : 0,
    ...keyEmbedding,
    ...moodEmbedding,
  ];
}

/**
 * Create an embedding vector from art features.
 */
export function artToEmbedding(art: ArtFeatures): number[] {
  // 16-dimensional embedding (same dimension as audio)
  const brightnessNorm = art.brightness;
  const saturationNorm = art.saturation;
  const contrastNorm = art.contrast;
  const compositionNorm = art.compositionScore;
  const complexityNorm = art.complexity;

  // Color harmony encoding
  const harmonyMap: Record<string, number> = {
    monochromatic: 0,
    analogous: 0.25,
    triadic: 0.5,
    complementary: 0.75,
    complex: 1,
  };
  const harmonyNorm = harmonyMap[art.colorHarmony] ?? 0.5;

  // Dominant color encoding (average RGB)
  const avgColor = art.dominantColors[0] ?? { r: 128, g: 128, b: 128, percentage: 1 };
  const rNorm = avgColor.r / 255;
  const gNorm = avgColor.g / 255;
  const bNorm = avgColor.b / 255;

  // Mood tag encoding (same 6 tags as audio for alignment)
  const moodTags = ["dark", "bright", "energetic", "ambient", "intense", "chill"];
  const moodEmbedding = moodTags.map((tag) => (art.moodTags.includes(tag) ? 1 : 0));

  // Style tag encoding
  const styleTags = ["minimal", "bold", "detailed", "abstract"];
  const styleEmbedding = styleTags.map((tag) => (art.styleTags.includes(tag) ? 1 : 0));

  return [
    brightnessNorm,
    saturationNorm,
    contrastNorm,
    compositionNorm,
    complexityNorm,
    harmonyNorm,
    rNorm,
    gNorm,
    bNorm,
    ...moodEmbedding,
    ...styleEmbedding.slice(0, 6),
  ];
}

/**
 * Cosine similarity between two vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    magA += a[i]! * a[i]!;
    magB += b[i]! * b[i]!;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Calculate weighted similarity with feature breakdown.
 */
export function calculateSimilarity(audio: AudioFeatures, art: ArtFeatures): MatchResult["featureBreakdown"] & { total: number } {
  const audioEmbed = audioToEmbedding(audio);
  const artEmbed = artToEmbedding(art);

  // Weighted components
  const moodScore = cosineSimilarity(
    audioEmbed.slice(9, 15),
    artEmbed.slice(9, 15)
  );

  const energyScore = (audioEmbed[2]! + audioEmbed[4]!) / 2; // arousal + rms
  const artEnergy = (artEmbed[1]! + artEmbed[3]!) / 2; // saturation + composition
  const energyMatch = 1 - Math.abs(energyScore - artEnergy);

  const colorScore = 1 - Math.abs(audioEmbed[3]! - artEmbed[0]!); // spectral brightness vs art brightness

  const compositionScore = artEmbed[3]! * (0.5 + audioEmbed[2]! * 0.5); // composition weighted by arousal

  const weights = { mood: 0.35, energy: 0.25, color: 0.2, composition: 0.2 };
  const total =
    moodScore * weights.mood +
    energyMatch * weights.energy +
    colorScore * weights.color +
    compositionScore * weights.composition;

  return {
    total: Math.round(total * 100) / 100,
    mood: Math.round(moodScore * 100) / 100,
    energy: Math.round(energyMatch * 100) / 100,
    color: Math.round(colorScore * 100) / 100,
    composition: Math.round(compositionScore * 100) / 100,
  };
}

/**
 * Generate human-readable match reason.
 */
export function generateMatchReason(audio: AudioFeatures, art: ArtFeatures, breakdown: MatchResult["featureBreakdown"]): string {
  const reasons: string[] = [];

  if (breakdown.mood > 0.7) {
    const sharedMoods = audio.moodTags.filter((t) => art.moodTags.includes(t));
    if (sharedMoods.length > 0) {
      reasons.push(`Shared mood: ${sharedMoods.join(", ")}`);
    } else {
      reasons.push("Complementary emotional atmosphere");
    }
  }

  if (breakdown.energy > 0.7) {
    reasons.push(`Energy match: ${audio.bpm} BPM ${audio.estimatedGenre} aligns with ${art.styleTags[0] ?? "visual"} intensity`);
  }

  if (breakdown.color > 0.7) {
    const dominant = art.dominantColors[0];
    if (dominant) {
      reasons.push(`Color resonance: RGB(${dominant.r},${dominant.g},${dominant.b}) harmonizes with ${audio.dominantFrequencyRange} frequencies`);
    }
  }

  if (breakdown.composition > 0.7) {
    reasons.push(`Structural alignment: ${art.colorHarmony} composition mirrors the track's ${audio.camelot} key structure`);
  }

  if (reasons.length === 0) {
    reasons.push("Intuitive match based on overall aesthetic coherence");
  }

  return reasons.join(". ");
}

/**
 * Match a single audio track against multiple artworks.
 */
export function matchArtworks(
  audio: AudioFeatures,
  artworks: Array<{ id: string; title: string; artist: string; features: ArtFeatures }>,
  opts: MatchOptions = {}
): MatchResult[] {
  const options = { ...DEFAULT_MATCH_OPTS, ...opts };

  let matches = artworks.map((art) => {
    const breakdown = calculateSimilarity(audio, art.features);
    return {
      artworkId: art.id,
      title: art.title,
      artist: art.artist,
      similarityScore: breakdown.total,
      matchReason: generateMatchReason(audio, art.features, breakdown),
      featureBreakdown: {
        mood: breakdown.mood,
        energy: breakdown.energy,
        color: breakdown.color,
        composition: breakdown.composition,
      },
    };
  });

  // Filter by minimum score
  matches = matches.filter((m) => m.similarityScore >= options.minScore);

  // Sort by score descending
  matches.sort((a, b) => b.similarityScore - a.similarityScore);

  // Diversify styles if requested
  if (options.diversifyStyles) {
    const diverse: MatchResult[] = [];
    const usedStyles = new Set<string>();
    for (const match of matches) {
      const art = artworks.find((a) => a.id === match.artworkId);
      const primaryStyle = art?.features.styleTags[0] ?? "unknown";
      if (!usedStyles.has(primaryStyle) || diverse.length < 3) {
        diverse.push(match);
        usedStyles.add(primaryStyle);
      }
      if (diverse.length >= options.limit) break;
    }
    matches = diverse;
  } else {
    matches = matches.slice(0, options.limit);
  }

  return matches;
}
