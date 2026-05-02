/**
 * Audio Analyzer — Extract features from DJ sets/tracks.
 * Lightweight heuristics + Web Audio API compatible.
 */

export interface AudioFeatures {
  bpm: number;
  bpmConfidence: number;
  key: string;
  camelot: string;
  keyConfidence: number;
  valence: number; // 0-1, happiness/positivity
  arousal: number; // 0-1, energy/intensity
  spectralCentroid: number; // Hz, brightness
  spectralRolloff: number; // Hz
  zeroCrossingRate: number;
  rmsEnergy: number;
  dominantFrequencyRange: "sub-bass" | "bass" | "low-mid" | "mid" | "high-mid" | "high";
  moodTags: string[];
  estimatedGenre: string;
}

export interface AnalyzeOptions {
  sampleRate?: number;
  bufferSize?: number;
  hopSize?: number;
}

const DEFAULT_OPTS: Required<AnalyzeOptions> = {
  sampleRate: 44100,
  bufferSize: 2048,
  hopSize: 512,
};

/**
 * Estimate BPM from onset detection function.
 * Simplified autocorrelation-based approach.
 */
export function estimateBpm(
  audioData: Float32Array,
  opts: AnalyzeOptions = {},
): { bpm: number; confidence: number } {
  const { sampleRate, hopSize } = { ...DEFAULT_OPTS, ...opts };

  // Compute energy envelope
  const frameSize = 512;
  const energies: number[] = [];
  for (let i = 0; i < audioData.length - frameSize; i += hopSize) {
    let sum = 0;
    for (let j = 0; j < frameSize; j++) {
      sum += audioData[i + j]! * audioData[i + j]!;
    }
    energies.push(sum / frameSize);
  }

  // Compute onset detection (difference of energies)
  const onsets: number[] = [];
  for (let i = 1; i < energies.length; i++) {
    onsets.push(Math.max(0, energies[i]! - energies[i - 1]!));
  }

  // Autocorrelation for tempo detection
  const maxLag = Math.floor((sampleRate / hopSize) * 2); // up to 2 seconds
  let bestLag = 0;
  let bestScore = -Infinity;

  for (let lag = Math.floor((sampleRate / hopSize) * 0.4); lag <= maxLag; lag++) {
    let score = 0;
    for (let i = 0; i < onsets.length - lag; i++) {
      score += onsets[i]! * onsets[i + lag]!;
    }
    if (score > bestScore) {
      bestScore = score;
      bestLag = lag;
    }
  }

  const beatDuration = (bestLag * hopSize) / sampleRate;
  const bpm = Math.round(60 / beatDuration);
  const clampedBpm = Math.max(60, Math.min(200, bpm));

  // Confidence based on autocorrelation peak sharpness
  const confidence = Math.min(1, bestScore / (onsets.length * 0.01));

  return { bpm: clampedBpm, confidence: Math.round(confidence * 100) / 100 };
}

/**
 * Estimate musical key from chroma features.
 * Simplified using spectral peaks.
 */
export function estimateKey(
  audioData: Float32Array,
  sampleRate = 44100,
): { key: string; camelot: string; confidence: number } {
  // Simplified: use spectral centroid to guess major/minor tendency
  // Full implementation would use FFT + chroma filtering
  const centroid = computeSpectralCentroid(audioData, sampleRate);

  // Heuristic mapping (very simplified)
  const keys = [
    "C major",
    "A minor",
    "G major",
    "E minor",
    "D major",
    "B minor",
    "A major",
    "F# minor",
  ];
  const camelots = ["8B", "8A", "9B", "9A", "10B", "10A", "11B", "11A"];
  const idx = Math.floor((centroid / 8000) * keys.length) % keys.length;

  return {
    key: keys[idx] ?? "C major",
    camelot: camelots[idx] ?? "8B",
    confidence: 0.6,
  };
}

/**
 * Compute spectral centroid (brightness measure).
 */
export function computeSpectralCentroid(audioData: Float32Array, sampleRate = 44100): number {
  // Use a simple DFT on the first 2048 samples for speed
  const n = Math.min(2048, audioData.length);
  let sum = 0;
  let weightedSum = 0;

  for (let k = 0; k < n / 2; k++) {
    const freq = (k * sampleRate) / n;
    let real = 0;
    let imag = 0;
    for (let t = 0; t < n; t++) {
      const angle = (-2 * Math.PI * k * t) / n;
      real += audioData[t]! * Math.cos(angle);
      imag += audioData[t]! * Math.sin(angle);
    }
    const magnitude = Math.sqrt(real * real + imag * imag);
    sum += magnitude;
    weightedSum += freq * magnitude;
  }

  return sum > 0 ? weightedSum / sum : 0;
}

/**
 * Compute RMS energy (loudness).
 */
export function computeRms(audioData: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < audioData.length; i++) {
    sum += audioData[i]! * audioData[i]!;
  }
  return Math.sqrt(sum / audioData.length);
}

/**
 * Compute zero-crossing rate (noisiness/brightness).
 */
export function computeZcr(audioData: Float32Array): number {
  let crossings = 0;
  for (let i = 1; i < audioData.length; i++) {
    if (
      (audioData[i]! >= 0 && audioData[i - 1]! < 0) ||
      (audioData[i]! < 0 && audioData[i - 1]! >= 0)
    ) {
      crossings++;
    }
  }
  return crossings / audioData.length;
}

/**
 * Generate mood tags from extracted features.
 */
export function generateMoodTags(
  features: Pick<AudioFeatures, "bpm" | "valence" | "arousal" | "spectralCentroid">,
): string[] {
  const tags: string[] = [];

  if (features.bpm > 130) tags.push("fast", "driving");
  else if (features.bpm > 125) tags.push("energetic", "peak-time");
  else if (features.bpm > 120) tags.push("grooving", "danceable");
  else tags.push("mid-tempo", "relaxed");

  if (features.valence > 0.7) tags.push("bright", "uplifting", "euphoric");
  else if (features.valence > 0.4) tags.push("balanced", "neutral");
  else tags.push("dark", "melancholic", "moody");

  if (features.arousal > 0.8) tags.push("aggressive", "hard");
  else if (features.arousal > 0.5) tags.push("energetic", "dynamic");
  else tags.push("ambient", "chill", "deep");

  if (features.spectralCentroid > 4000) tags.push("bright", "hissy", "sharp");
  else if (features.spectralCentroid > 2000) tags.push("warm", "full");
  else tags.push("dark", "muffled", "subby");

  return [...new Set(tags)];
}

/**
 * Full analysis pipeline.
 */
export function analyzeAudio(audioData: Float32Array, opts: AnalyzeOptions = {}): AudioFeatures {
  const { sampleRate } = { ...DEFAULT_OPTS, ...opts };

  const bpmResult = estimateBpm(audioData, opts);
  const keyResult = estimateKey(audioData, sampleRate);
  const spectralCentroid = computeSpectralCentroid(audioData, sampleRate);
  const rmsEnergy = computeRms(audioData);
  const zcr = computeZcr(audioData);

  // Heuristic valence/arousal from spectral features
  const valence = Math.min(1, Math.max(0, 0.3 + (spectralCentroid / 8000) * 0.5 + rmsEnergy * 0.2));
  const arousal = Math.min(1, Math.max(0, rmsEnergy * 0.6 + (bpmResult.bpm / 200) * 0.4));

  const dominantRange =
    spectralCentroid < 60
      ? "sub-bass"
      : spectralCentroid < 250
        ? "bass"
        : spectralCentroid < 500
          ? "low-mid"
          : spectralCentroid < 2000
            ? "mid"
            : spectralCentroid < 6000
              ? "high-mid"
              : "high";

  const moodTags = generateMoodTags({ bpm: bpmResult.bpm, valence, arousal, spectralCentroid });

  return {
    bpm: bpmResult.bpm,
    bpmConfidence: bpmResult.confidence,
    key: keyResult.key,
    camelot: keyResult.camelot,
    keyConfidence: keyResult.confidence,
    valence: Math.round(valence * 100) / 100,
    arousal: Math.round(arousal * 100) / 100,
    spectralCentroid: Math.round(spectralCentroid),
    spectralRolloff: Math.round(spectralCentroid * 1.5),
    zeroCrossingRate: Math.round(zcr * 1000) / 1000,
    rmsEnergy: Math.round(rmsEnergy * 1000) / 1000,
    dominantFrequencyRange: dominantRange,
    moodTags,
    estimatedGenre:
      bpmResult.bpm > 125 && arousal > 0.6 ? "techno" : bpmResult.bpm > 120 ? "house" : "ambient",
  };
}
