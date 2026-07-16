/**
 * Audio Analyzer — Extract features from DJ sets/tracks.
 * Pure TypeScript DSP (no deps) — runs in Node pipelines and in the browser
 * on Web-Audio-decoded Float32Arrays.
 *
 * v2 (2026-07-16): real measurement quality
 * - estimateBpm: per-lag normalized onset autocorrelation + tempo-octave
 *   folding into [90, 180) — fixes the bar-lag octave error that reported
 *   4/4 club tracks as 60 BPM.
 * - estimateKey: FFT chromagram + Krumhansl-Schmuckler key profiles over all
 *   24 keys (was: a spectral-centroid table lookup) with a full Camelot map.
 * - computeSpectralCentroid: averaged FFT spectrum across frames spread over
 *   the whole signal (was: one naive DFT on the first 2048 samples).
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

// ---------------------------------------------------------------------------
// FFT (iterative radix-2, real input) — shared by chroma + centroid
// ---------------------------------------------------------------------------

/** In-place iterative radix-2 FFT. `re`/`im` length must be a power of two. */
function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  if ((n & (n - 1)) !== 0) throw new Error("fft size must be a power of two");
  // bit reversal
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tr = re[i] as number;
      re[i] = re[j] as number;
      re[j] = tr;
      const ti = im[i] as number;
      im[i] = im[j] as number;
      im[j] = ti;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curR = 1;
      let curI = 0;
      for (let k = 0; k < len / 2; k++) {
        const eR = re[i + k] as number;
        const eI = im[i + k] as number;
        const oR = re[i + k + len / 2] as number;
        const oI = im[i + k + len / 2] as number;
        const tR = oR * curR - oI * curI;
        const tI = oR * curI + oI * curR;
        re[i + k] = eR + tR;
        im[i + k] = eI + tI;
        re[i + k + len / 2] = eR - tR;
        im[i + k + len / 2] = eI - tI;
        const nR = curR * wr - curI * wi;
        curI = curR * wi + curI * wr;
        curR = nR;
      }
    }
  }
}

/** Magnitude spectrum (first n/2 bins) of a Hann-windowed frame. */
function magnitudeSpectrum(frame: Float32Array | Float64Array, size: number): Float64Array {
  const re = new Float64Array(size);
  const im = new Float64Array(size);
  const m = Math.min(frame.length, size);
  for (let i = 0; i < m; i++) {
    const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (size - 1));
    re[i] = (frame[i] as number) * w;
  }
  fft(re, im);
  const out = new Float64Array(size / 2);
  for (let k = 0; k < size / 2; k++) {
    out[k] = Math.hypot(re[k] as number, im[k] as number);
  }
  return out;
}

// ---------------------------------------------------------------------------
// BPM
// ---------------------------------------------------------------------------

/**
 * Estimate BPM from an onset autocorrelation.
 *
 * The autocorrelation of a 4/4 onset train peaks at every multiple of the
 * beat lag; unnormalized scoring tends to pick the bar lag (¼ tempo). Two
 * countermeasures: per-lag normalization by overlap length, and folding the
 * winning tempo into the club-typical octave [90, 180).
 */
export function estimateBpm(
  audioData: Float32Array,
  opts: AnalyzeOptions = {},
): { bpm: number; confidence: number } {
  const { sampleRate, hopSize } = { ...DEFAULT_OPTS, ...opts };

  // Energy envelope
  const frameSize = 512;
  const energies: number[] = [];
  for (let i = 0; i + frameSize < audioData.length; i += hopSize) {
    let sum = 0;
    for (let j = 0; j < frameSize; j++) {
      const v = audioData[i + j] as number;
      sum += v * v;
    }
    energies.push(sum / frameSize);
  }

  // Onset strength (half-wave rectified energy flux)
  const onsets: number[] = [];
  for (let i = 1; i < energies.length; i++) {
    onsets.push(Math.max(0, (energies[i] as number) - (energies[i - 1] as number)));
  }
  if (onsets.length < 64) {
    return { bpm: 120, confidence: 0 };
  }

  const framesPerSecond = sampleRate / hopSize;
  const lagForBpm = (bpm: number) => Math.round((60 / bpm) * framesPerSecond);
  const minLag = Math.max(2, lagForBpm(200)); // fastest tempo considered
  const maxLag = Math.min(lagForBpm(55), Math.floor(onsets.length / 2)); // slowest

  let bestLag = 0;
  let bestScore = -Infinity;
  let scoreSum = 0;
  let scoreCount = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let score = 0;
    const overlap = onsets.length - lag;
    for (let i = 0; i < overlap; i++) {
      score += (onsets[i] as number) * (onsets[i + lag] as number);
    }
    score /= overlap; // per-lag normalization — long lags no longer win by mass
    scoreSum += score;
    scoreCount++;
    if (score > bestScore) {
      bestScore = score;
      bestLag = lag;
    }
  }
  if (bestLag === 0 || bestScore <= 0) {
    // silence / no onsets — nothing to measure
    return { bpm: 120, confidence: 0 };
  }

  let bpm = (60 * framesPerSecond) / bestLag;

  // Tempo-octave folding into [90, 180)
  while (bpm < 90) bpm *= 2;
  while (bpm >= 180) bpm /= 2;

  // Refine at the folded lag: local parabolic-ish search ±2 lags
  const foldedLag = lagForBpm(bpm);
  let refinedLag = foldedLag;
  let refinedScore = -Infinity;
  for (let lag = Math.max(minLag, foldedLag - 2); lag <= Math.min(maxLag, foldedLag + 2); lag++) {
    let score = 0;
    const overlap = onsets.length - lag;
    for (let i = 0; i < overlap; i++) {
      score += (onsets[i] as number) * (onsets[i + lag] as number);
    }
    score /= overlap;
    if (score > refinedScore) {
      refinedScore = score;
      refinedLag = lag;
    }
  }
  bpm = (60 * framesPerSecond) / refinedLag;
  while (bpm < 90) bpm *= 2;
  while (bpm >= 180) bpm /= 2;

  const clampedBpm = Math.max(60, Math.min(200, Math.round(bpm)));

  // Confidence: peak prominence over the mean autocorrelation level
  const mean = scoreSum / Math.max(1, scoreCount);
  const prominence = mean > 0 ? bestScore / mean : 0;
  const confidence = Math.round(Math.min(1, Math.max(0, (prominence - 1) / 6)) * 100) / 100;

  return { bpm: clampedBpm, confidence };
}

// ---------------------------------------------------------------------------
// Key (chromagram + Krumhansl-Schmuckler)
// ---------------------------------------------------------------------------

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

// Krumhansl-Schmuckler key profiles
const PROFILE_MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const PROFILE_MINOR = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

// Full Camelot wheel
const CAMELOT_MAJOR: Record<string, string> = {
  C: "8B",
  G: "9B",
  D: "10B",
  A: "11B",
  E: "12B",
  B: "1B",
  "F#": "2B",
  "C#": "3B",
  "G#": "4B",
  "D#": "5B",
  "A#": "6B",
  F: "7B",
};
const CAMELOT_MINOR: Record<string, string> = {
  A: "8A",
  E: "9A",
  B: "10A",
  "F#": "11A",
  "C#": "12A",
  "G#": "1A",
  "D#": "2A",
  "A#": "3A",
  F: "4A",
  C: "5A",
  G: "6A",
  D: "7A",
};

function pearson(a: readonly number[], b: readonly number[]): number {
  const n = a.length;
  let ma = 0;
  let mb = 0;
  for (let i = 0; i < n; i++) {
    ma += a[i] as number;
    mb += b[i] as number;
  }
  ma /= n;
  mb /= n;
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    const xa = (a[i] as number) - ma;
    const xb = (b[i] as number) - mb;
    num += xa * xb;
    da += xa * xa;
    db += xb * xb;
  }
  const den = Math.sqrt(da * db);
  return den > 0 ? num / den : 0;
}

/**
 * Estimate musical key from an FFT chromagram correlated against the 24
 * Krumhansl-Schmuckler profiles. Confidence reflects the margin between the
 * best and second-best key.
 */
export function estimateKey(
  audioData: Float32Array,
  sampleRate = 44100,
): { key: string; camelot: string; confidence: number } {
  const fftSize = 4096;
  const hop = fftSize * 2; // sparse hops keep this cheap on long signals
  const maxFrames = 320; // ≤ ~60s at 44.1kHz
  const chroma = new Array<number>(12).fill(0);

  const frames = Math.min(maxFrames, Math.max(1, Math.floor((audioData.length - fftSize) / hop)));
  for (let f = 0; f < frames; f++) {
    const start = f * hop;
    const spec = magnitudeSpectrum(audioData.subarray(start, start + fftSize), fftSize);
    // fold bins 55 Hz .. 5 kHz onto pitch classes
    const kLo = Math.max(1, Math.floor((55 * fftSize) / sampleRate));
    const kHi = Math.min(spec.length - 1, Math.floor((5000 * fftSize) / sampleRate));
    for (let k = kLo; k <= kHi; k++) {
      const freq = (k * sampleRate) / fftSize;
      const midi = 12 * Math.log2(freq / 440) + 69;
      const pc = ((Math.round(midi) % 12) + 12) % 12;
      chroma[pc] = (chroma[pc] as number) + (spec[k] as number);
    }
  }

  let best = { key: "C major", camelot: "8B", score: -Infinity };
  let second = -Infinity;
  for (let tonic = 0; tonic < 12; tonic++) {
    const rotated = new Array<number>(12);
    for (let i = 0; i < 12; i++) rotated[i] = chroma[(tonic + i) % 12] as number;
    for (const mode of ["major", "minor"] as const) {
      const profile = mode === "major" ? PROFILE_MAJOR : PROFILE_MINOR;
      const score = pearson(rotated, profile);
      const note = NOTE_NAMES[tonic] as string;
      if (score > best.score) {
        second = best.score;
        best = {
          key: `${note} ${mode}`,
          camelot: (mode === "major" ? CAMELOT_MAJOR[note] : CAMELOT_MINOR[note]) ?? "8B",
          score,
        };
      } else if (score > second) {
        second = score;
      }
    }
  }

  const margin = Number.isFinite(second) ? best.score - second : best.score;
  const confidence = Math.round(Math.min(1, Math.max(0, margin * 4 + 0.35)) * 100) / 100;
  return { key: best.key, camelot: best.camelot, confidence };
}

// ---------------------------------------------------------------------------
// Spectral + time-domain descriptors
// ---------------------------------------------------------------------------

/**
 * Compute spectral centroid (brightness measure) from the average FFT
 * spectrum of up to 32 frames spread across the whole signal.
 */
export function computeSpectralCentroid(audioData: Float32Array, sampleRate = 44100): number {
  const size = 2048;
  if (audioData.length < size) return 0;
  const frames = Math.min(32, Math.floor(audioData.length / size));
  const stride = Math.max(size, Math.floor(audioData.length / frames));
  const acc = new Float64Array(size / 2);
  let used = 0;
  for (let f = 0; f < frames; f++) {
    const start = f * stride;
    if (start + size > audioData.length) break;
    const spec = magnitudeSpectrum(audioData.subarray(start, start + size), size);
    for (let k = 0; k < acc.length; k++) acc[k] = (acc[k] as number) + (spec[k] as number);
    used++;
  }
  if (used === 0) return 0;
  let sum = 0;
  let weighted = 0;
  for (let k = 0; k < acc.length; k++) {
    const freq = (k * sampleRate) / size;
    sum += acc[k] as number;
    weighted += freq * (acc[k] as number);
  }
  return sum > 0 ? weighted / sum : 0;
}

/**
 * Compute RMS energy (loudness).
 */
export function computeRms(audioData: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < audioData.length; i++) {
    const v = audioData[i] as number;
    sum += v * v;
  }
  return Math.sqrt(sum / audioData.length);
}

/**
 * Compute zero-crossing rate (noisiness/brightness).
 */
export function computeZcr(audioData: Float32Array): number {
  let crossings = 0;
  for (let i = 1; i < audioData.length; i++) {
    const a = audioData[i] as number;
    const b = audioData[i - 1] as number;
    if ((a >= 0 && b < 0) || (a < 0 && b >= 0)) {
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
