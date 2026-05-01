// @elbtronika/flow — Music-Art Matching Engine

export type { ArtFeatures, PixelData } from "./art";
export {
  analyzeArt,
  computeColorMetrics,
  detectColorHarmony,
  estimateComposition,
  extractDominantColors,
  generateArtTags,
} from "./art";
export type { AnalyzeOptions, AudioFeatures } from "./audio";
export {
  analyzeAudio,
  computeRms,
  computeSpectralCentroid,
  computeZcr,
  estimateBpm,
  estimateKey,
  generateMoodTags,
} from "./audio";
export type { MatchOptions, MatchResult } from "./match";
export {
  artToEmbedding,
  audioToEmbedding,
  calculateSimilarity,
  cosineSimilarity,
  generateMatchReason,
  matchArtworks,
} from "./match";
