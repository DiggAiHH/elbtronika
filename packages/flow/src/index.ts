// @elbtronika/flow — Music-Art Matching Engine
export {
  analyzeAudio,
  estimateBpm,
  estimateKey,
  computeSpectralCentroid,
  computeRms,
  computeZcr,
  generateMoodTags,
} from "./audio";
export type { AudioFeatures, AnalyzeOptions } from "./audio";

export {
  analyzeArt,
  extractDominantColors,
  computeColorMetrics,
  detectColorHarmony,
  estimateComposition,
  generateArtTags,
} from "./art";
export type { ArtFeatures, PixelData } from "./art";

export {
  audioToEmbedding,
  artToEmbedding,
  cosineSimilarity,
  calculateSimilarity,
  generateMatchReason,
  matchArtworks,
} from "./match";
export type { MatchResult, MatchOptions } from "./match";
