import { describe, expect, it } from "vitest";
import { analyzeAudio, computeRms, estimateBpm, estimateKey } from "./analyzer";

const SR = 44100;

/** Synthesize a 4/4 kick pattern at the given BPM (deterministic, no RNG). */
function kickTrack(bpm: number, seconds: number): Float32Array {
  const n = Math.floor(seconds * SR);
  const out = new Float32Array(n);
  const beat = (60 / bpm) * SR;
  for (let start = 0; start < n; start += beat) {
    const s = Math.floor(start);
    for (let i = 0; i < Math.min(4000, n - s); i++) {
      const t = i / SR;
      const freq = 45 + 115 * Math.exp(-t * 35);
      out[s + i] = (out[s + i] ?? 0) + Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 9);
    }
  }
  return out;
}

/** Sustained triad (sine partials) for key detection. */
function triad(freqs: number[], seconds: number): Float32Array {
  const n = Math.floor(seconds * SR);
  const out = new Float32Array(n);
  for (const f of freqs) {
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      out[i] =
        (out[i] ?? 0) +
        (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * 2 * f * t)) / freqs.length;
    }
  }
  return out;
}

describe("estimateBpm", () => {
  it("detects a 128 BPM four-on-the-floor without octave errors", () => {
    const { bpm, confidence } = estimateBpm(kickTrack(128, 30));
    expect(Math.abs(bpm - 128)).toBeLessThanOrEqual(2);
    expect(confidence).toBeGreaterThan(0.1);
  });

  it("detects 96 BPM inside the folded octave [90, 180)", () => {
    const { bpm } = estimateBpm(kickTrack(96, 30));
    expect(Math.abs(bpm - 96)).toBeLessThanOrEqual(2);
  });

  it("folds bar-level periodicity up instead of reporting quarter tempo", () => {
    // 140 BPM: the old implementation picked the bar lag (35 BPM → clamped 60)
    const { bpm } = estimateBpm(kickTrack(140, 30));
    expect(Math.abs(bpm - 140)).toBeLessThanOrEqual(3);
  });

  it("returns neutral 120/0-confidence on silence", () => {
    const { bpm, confidence } = estimateBpm(new Float32Array(SR * 5));
    expect(bpm).toBe(120);
    expect(confidence).toBe(0);
  });
});

describe("estimateKey", () => {
  it("hears an A minor triad as A minor (Camelot 8A)", () => {
    // A3, C4, E4
    const { key, camelot } = estimateKey(triad([220, 261.63, 329.63], 10), SR);
    expect(key).toBe("A minor");
    expect(camelot).toBe("8A");
  });

  it("hears a C major triad as C major (Camelot 8B)", () => {
    // C4, E4, G4
    const { key, camelot } = estimateKey(triad([261.63, 329.63, 392.0], 10), SR);
    expect(key).toBe("C major");
    expect(camelot).toBe("8B");
  });

  it("reports low-but-valid confidence on noise-free silence", () => {
    const { confidence } = estimateKey(new Float32Array(SR * 2), SR);
    expect(confidence).toBeGreaterThanOrEqual(0);
    expect(confidence).toBeLessThanOrEqual(1);
  });
});

describe("analyzeAudio", () => {
  it("produces a coherent full feature object for a club signal", () => {
    const signal = kickTrack(128, 20);
    const f = analyzeAudio(signal);
    expect(Math.abs(f.bpm - 128)).toBeLessThanOrEqual(2);
    expect(f.key).toMatch(/^[A-G]#? (major|minor)$/);
    expect(f.camelot).toMatch(/^\d{1,2}[AB]$/);
    expect(f.valence).toBeGreaterThanOrEqual(0);
    expect(f.valence).toBeLessThanOrEqual(1);
    expect(f.arousal).toBeGreaterThanOrEqual(0);
    expect(f.arousal).toBeLessThanOrEqual(1);
    expect(f.moodTags.length).toBeGreaterThan(0);
    expect(computeRms(signal)).toBeGreaterThan(0);
  });
});
