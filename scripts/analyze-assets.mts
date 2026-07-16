/**
 * Offline media analysis pipeline — the real decode path for flow features.
 *
 *   tsx scripts/analyze-assets.mts <manifest.json> [--out features.json] [--upsert]
 *
 * The manifest lists media files with their Supabase UUIDs:
 *   {
 *     "sets":     [{ "file": "path/to/set.mp3",     "supabaseId": "<uuid>" }],
 *     "artworks": [{ "file": "path/to/artwork.jpg", "supabaseId": "<uuid>" }]
 *   }
 *
 * Audio is decoded with ffmpeg (f32le mono 44.1 kHz) and measured with the
 * REAL analyzer the product ships (packages/flow analyzeAudio); images are
 * decoded to raw RGBA (ffmpeg rawvideo) and measured with analyzeArt.
 * Embeddings are deterministic functions of the media: 128 log-spaced
 * spectral bands (audio) and a 128-bin HSV histogram (art), L2-normalized.
 *
 * With --upsert and SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL in
 * the environment, rows are upserted into audio_features / artwork_features
 * with source = 'measured' (never downgraded by the simulated API path).
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

import { analyzeAudio } from "../packages/flow/src/audio/analyzer";
import { analyzeArt } from "../packages/flow/src/art/analyzer";

const SR = 44100;

interface ManifestEntry {
  file: string;
  supabaseId: string;
}
interface Manifest {
  sets?: ManifestEntry[];
  artworks?: ManifestEntry[];
}

function decodeAudioMono(file: string): Float32Array {
  const raw = execFileSync(
    "ffmpeg",
    ["-v", "error", "-i", file, "-f", "f32le", "-ac", "1", "-ar", String(SR), "-"],
    { maxBuffer: 1024 * 1024 * 512 },
  );
  return new Float32Array(raw.buffer, raw.byteOffset, Math.floor(raw.byteLength / 4));
}

function decodeImageRgba(file: string): { width: number; height: number; data: Uint8ClampedArray } {
  const probe = execFileSync(
    "ffprobe",
    ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=s=x:p=0", file],
    { encoding: "utf8" },
  ).trim();
  const [wStr, hStr] = probe.split("x");
  const width = Number(wStr);
  const height = Number(hStr);
  if (!width || !height) throw new Error(`ffprobe could not size ${file}`);
  const raw = execFileSync(
    "ffmpeg",
    ["-v", "error", "-i", file, "-f", "rawvideo", "-pix_fmt", "rgba", "-frames:v", "1", "-"],
    { maxBuffer: 1024 * 1024 * 512 },
  );
  return { width, height, data: new Uint8ClampedArray(raw.buffer, raw.byteOffset, width * height * 4) };
}

// --- tiny FFT for the spectral embedding (script-local on purpose) ---------
function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j] as number, re[i] as number];
      [im[i], im[j]] = [im[j] as number, im[i] as number];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const eR = re[i + k] as number;
        const eI = im[i + k] as number;
        const oR = re[i + k + len / 2] as number;
        const oI = im[i + k + len / 2] as number;
        const tR = oR * cr - oI * ci;
        const tI = oR * ci + oI * cr;
        re[i + k] = eR + tR;
        im[i + k] = eI + tI;
        re[i + k + len / 2] = eR - tR;
        im[i + k + len / 2] = eI - tI;
        const nR = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = nR;
      }
    }
  }
}

function audioEmbedding(data: Float32Array, bands = 128): number[] {
  const nfft = 4096;
  const hop = 2048;
  const cap = Math.min(data.length, SR * 120);
  const acc = new Float64Array(nfft / 2);
  let frames = 0;
  for (let i = 0; i + nfft <= cap; i += hop) {
    const re = new Float64Array(nfft);
    const im = new Float64Array(nfft);
    for (let j = 0; j < nfft; j++) {
      const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * j) / (nfft - 1));
      re[j] = (data[i + j] as number) * w;
    }
    fft(re, im);
    for (let k = 0; k < nfft / 2; k++) acc[k] = (acc[k] as number) + Math.hypot(re[k] as number, im[k] as number);
    frames++;
  }
  const spec = Array.from(acc, (v) => Math.log1p(v / Math.max(1, frames)));
  const emb = new Array<number>(bands).fill(0);
  const loF = 25;
  const hiF = 16000;
  for (let b = 0; b < bands; b++) {
    const f0 = loF * (hiF / loF) ** (b / bands);
    const f1 = loF * (hiF / loF) ** ((b + 1) / bands);
    const k0 = Math.max(1, Math.floor((f0 * nfft) / SR));
    const k1 = Math.min(spec.length - 1, Math.max(k0 + 1, Math.floor((f1 * nfft) / SR)));
    let s = 0;
    for (let k = k0; k < k1; k++) s += spec[k] as number;
    emb[b] = s / (k1 - k0);
  }
  const norm = Math.sqrt(emb.reduce((a, v) => a + v * v, 0));
  return emb.map((v) => Math.round((norm > 0 ? v / norm : v) * 1e6) / 1e6);
}

function artEmbedding(px: { width: number; height: number; data: Uint8ClampedArray }): number[] {
  const hBins = 64;
  const sBins = 32;
  const vBins = 32;
  const hist = new Array<number>(hBins + sBins + vBins).fill(0);
  const { data } = px;
  for (let i = 0; i < data.length; i += 16) {
    const r = (data[i] as number) / 255;
    const g = (data[i + 1] as number) / 255;
    const b = (data[i + 2] as number) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const v = max;
    const s = max === 0 ? 0 : (max - min) / max;
    let h = 0;
    const d = max - min;
    if (d > 0) {
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h = (h * 60 + 360) % 360;
    }
    hist[Math.min(hBins - 1, Math.floor((h / 360) * hBins))]!++;
    hist[hBins + Math.min(sBins - 1, Math.floor(s * sBins))]!++;
    hist[hBins + sBins + Math.min(vBins - 1, Math.floor(v * vBins))]!++;
  }
  const norm = Math.sqrt(hist.reduce((a, x) => a + x * x, 0));
  return hist.map((x) => Math.round((norm > 0 ? x / norm : x) * 1e6) / 1e6);
}

// --- main ------------------------------------------------------------------
const args = process.argv.slice(2);
const manifestPath = args.find((a) => !a.startsWith("--"));
if (!manifestPath) {
  console.error("usage: tsx scripts/analyze-assets.mts <manifest.json> [--out features.json] [--upsert]");
  process.exit(1);
}
const outIdx = args.indexOf("--out");
const outPath = outIdx >= 0 ? (args[outIdx + 1] ?? "features.json") : null;
const doUpsert = args.includes("--upsert");

const manifest: Manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

const audioRows: Record<string, unknown>[] = [];
for (const entry of manifest.sets ?? []) {
  const data = decodeAudioMono(entry.file);
  const cap = Math.min(data.length, SR * 90);
  const f = analyzeAudio(data.subarray(0, cap), { sampleRate: SR });
  audioRows.push({
    set_id: entry.supabaseId,
    bpm: f.bpm,
    key: f.key,
    valence: f.valence,
    arousal: f.arousal,
    spectral_centroid: f.spectralCentroid,
    mood_tags: f.moodTags,
    embedding: audioEmbedding(data),
    source: "measured",
  });
  console.log(`[audio] ${entry.file}: ${f.bpm} BPM (conf ${f.bpmConfidence}), ${f.key} (conf ${f.keyConfidence})`);
}

const artRows: Record<string, unknown>[] = [];
for (const entry of manifest.artworks ?? []) {
  const px = decodeImageRgba(entry.file);
  const f = analyzeArt(px);
  artRows.push({
    artwork_id: entry.supabaseId,
    dominant_colors: f.dominantColors,
    color_harmony: f.colorHarmony,
    brightness: f.brightness,
    contrast: f.contrast,
    saturation: f.saturation,
    composition_score: f.compositionScore,
    symmetry_score: f.symmetryScore,
    style_tags: f.styleTags,
    mood_tags: f.moodTags,
    complexity: f.complexity,
    embedding: artEmbedding(px),
    source: "measured",
  });
  console.log(`[art] ${entry.file}: ${f.colorHarmony}, brightness ${f.brightness}, contrast ${f.contrast}`);
}

const result = { audio_features: audioRows, artwork_features: artRows };
if (outPath) {
  writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`wrote ${outPath}`);
}

if (doUpsert) {
  // biome-ignore lint/suspicious/noUndeclaredEnvVars: CLI script — injected via doppler run
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // biome-ignore lint/suspicious/noUndeclaredEnvVars: CLI script — injected via doppler run
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("--upsert needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key);
  if (audioRows.length > 0) {
    const { error } = await supabase.from("audio_features").upsert(audioRows, { onConflict: "set_id" });
    if (error) throw new Error(`audio_features upsert: ${error.message}`);
  }
  if (artRows.length > 0) {
    const { error } = await supabase.from("artwork_features").upsert(artRows, { onConflict: "artwork_id" });
    if (error) throw new Error(`artwork_features upsert: ${error.message}`);
  }
  console.log(`upserted ${audioRows.length} audio + ${artRows.length} art feature rows (source=measured)`);
}
