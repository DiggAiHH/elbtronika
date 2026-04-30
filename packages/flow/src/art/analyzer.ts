/**
 * Art Analyzer — Extract visual features from artwork images.
 * Lightweight heuristics for color, composition, and style.
 */

export interface ArtFeatures {
  dominantColors: Array<{ r: number; g: number; b: number; percentage: number }>;
  colorHarmony: "complementary" | "analogous" | "triadic" | "monochromatic" | "complex";
  brightness: number; // 0-1
  contrast: number; // 0-1
  saturation: number; // 0-1
  compositionScore: number; // 0-1, rule of thirds alignment
  symmetryScore: number; // 0-1
  styleTags: string[];
  moodTags: string[];
  complexity: number; // 0-1, detail density
}

export interface PixelData {
  width: number;
  height: number;
  data: Uint8ClampedArray; // RGBA
}

/**
 * Extract dominant colors using simplified k-means (k=5).
 */
export function extractDominantColors(pixels: PixelData, k = 5): ArtFeatures["dominantColors"] {
  const { data } = pixels;
  // Sample every 10th pixel for performance
  const samples: Array<[number, number, number]> = [];
  for (let i = 0; i < data.length; i += 40) {
    samples.push([data[i]!, data[i + 1]!, data[i + 2]!]);
  }

  // Simple histogram bucketing (faster than k-means)
  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>;
  const bucketSize = 32;

  for (const [r, g, b] of samples) {
    const key = `${Math.floor(r / bucketSize)},${Math.floor(g / bucketSize)},${Math.floor(b / bucketSize)}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.r += r;
      existing.g += g;
      existing.b += b;
      existing.count++;
    } else {
      buckets.set(key, { r, g, b, count: 1 });
    }
  }

  const sorted = Array.from(buckets.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, k);

  const total = sorted.reduce((sum, b) => sum + b.count, 0);

  return sorted.map((b) => ({
    r: Math.round(b.r / b.count),
    g: Math.round(b.g / b.count),
    b: Math.round(b.b / b.count),
    percentage: Math.round((b.count / total) * 1000) / 1000,
  }));
}

/**
 * Compute brightness, contrast, saturation.
 */
export function computeColorMetrics(pixels: PixelData): { brightness: number; contrast: number; saturation: number } {
  const { data } = pixels;
  let totalLuma = 0;
  let totalSat = 0;
  const luminances: number[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]! / 255;
    const g = data[i + 1]! / 255;
    const b = data[i + 2]! / 255;

    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;

    totalLuma += luma;
    totalSat += sat;
    luminances.push(luma);
  }

  const pixelCount = data.length / 4;
  const brightness = totalLuma / pixelCount;
  const saturation = totalSat / pixelCount;

  // Contrast = standard deviation of luminance
  const mean = brightness;
  let variance = 0;
  for (const l of luminances) {
    variance += (l - mean) * (l - mean);
  }
  const contrast = Math.sqrt(variance / pixelCount);

  return {
    brightness: Math.round(brightness * 100) / 100,
    contrast: Math.round(contrast * 100) / 100,
    saturation: Math.round(saturation * 100) / 100,
  };
}

/**
 * Detect color harmony type.
 */
export function detectColorHarmony(colors: ArtFeatures["dominantColors"]): ArtFeatures["colorHarmony"] {
  if (colors.length < 2) return "monochromatic";

  // Convert to HSL and analyze hue relationships
  const hues = colors.map((c) => rgbToHue(c.r, c.g, c.b));
  const hueDiffs: number[] = [];

  for (let i = 0; i < hues.length; i++) {
    for (let j = i + 1; j < hues.length; j++) {
      let diff = Math.abs(hues[i]! - hues[j]!);
      if (diff > 180) diff = 360 - diff;
      hueDiffs.push(diff);
    }
  }

  const avgDiff = hueDiffs.reduce((a, b) => a + b, 0) / hueDiffs.length;

  if (avgDiff < 15) return "monochromatic";
  if (avgDiff > 165 && avgDiff < 195) return "complementary";
  if (avgDiff > 55 && avgDiff < 75) return "triadic";
  if (avgDiff < 45) return "analogous";
  return "complex";
}

/**
 * Estimate composition score (rule of thirds alignment).
 */
export function estimateComposition(pixels: PixelData): number {
  const { width, height, data } = pixels;
  // Check if significant color changes happen near rule-of-thirds lines
  const vThirds = [Math.floor(height / 3), Math.floor((height * 2) / 3)];

  let edgeScore = 0;
  const threshold = 30;

  // Horizontal thirds
  for (const y of vThirds) {
    for (let x = 1; x < width; x++) {
      const idx = (y * width + x) * 4;
      const prevIdx = (y * width + (x - 1)) * 4;
      const diff = Math.abs(data[idx]! - data[prevIdx]!) +
        Math.abs(data[idx + 1]! - data[prevIdx + 1]!) +
        Math.abs(data[idx + 2]! - data[prevIdx + 2]!);
      if (diff > threshold) edgeScore++;
    }
  }

  // Normalize (very heuristic)
  const maxPossible = width * 2;
  return Math.min(1, edgeScore / (maxPossible * 0.3));
}

/**
 * Generate style and mood tags from visual features.
 */
export function generateArtTags(features: ArtFeatures): { styleTags: string[]; moodTags: string[] } {
  const styleTags: string[] = [];
  const moodTags: string[] = [];

  // Style from color harmony
  if (features.colorHarmony === "monochromatic") styleTags.push("minimal", "reduced");
  if (features.colorHarmony === "complementary") styleTags.push("bold", "contrasting");
  if (features.colorHarmony === "analogous") styleTags.push("harmonious", "flowing");
  if (features.complexity > 0.7) styleTags.push("detailed", "complex", "intricate");
  else if (features.complexity < 0.3) styleTags.push("minimalist", "clean");

  // Mood from brightness + saturation
  if (features.brightness > 0.7) moodTags.push("bright", "light", "airy");
  else if (features.brightness < 0.3) moodTags.push("dark", "moody", "noir");

  if (features.saturation > 0.6) moodTags.push("vibrant", "intense", "expressive");
  else if (features.saturation < 0.2) moodTags.push("muted", "subtle", "understated");

  if (features.contrast > 0.5) moodTags.push("dramatic", "striking");
  else moodTags.push("soft", "gentle");

  return { styleTags: [...new Set(styleTags)], moodTags: [...new Set(moodTags)] };
}

/** Helper: RGB to Hue (0-360) */
function rgbToHue(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  if (delta === 0) return 0;
  if (max === r) return (((g - b) / delta) % 6) * 60;
  if (max === g) return ((b - r) / delta + 2) * 60;
  return ((r - g) / delta + 4) * 60;
}

/**
 * Full art analysis pipeline.
 */
export function analyzeArt(pixels: PixelData): ArtFeatures {
  const dominantColors = extractDominantColors(pixels);
  const colorMetrics = computeColorMetrics(pixels);
  const colorHarmony = detectColorHarmony(dominantColors);
  const compositionScore = estimateComposition(pixels);

  // Estimate complexity from color count
  const complexity = Math.min(1, dominantColors.length / 5);

  const features: ArtFeatures = {
    dominantColors,
    colorHarmony,
    brightness: colorMetrics.brightness,
    contrast: colorMetrics.contrast,
    saturation: colorMetrics.saturation,
    compositionScore: Math.round(compositionScore * 100) / 100,
    symmetryScore: 0.5, // Would need more analysis
    styleTags: [],
    moodTags: [],
    complexity: Math.round(complexity * 100) / 100,
  };

  const tags = generateArtTags(features);
  features.styleTags = tags.styleTags;
  features.moodTags = tags.moodTags;

  return features;
}
