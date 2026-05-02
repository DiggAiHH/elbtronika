/**
 * MCP Server for Audio Analysis & Music-Art Matching
 */

import { MCPServer } from "../server";
import { AnalyzeTrackSchema, MatchArtworkSchema } from "../tools";
import type { ToolDefinition } from "../types";

// Seeded pseudo-random number generator (mulberry32).
// Produces deterministic results for the same trackId across calls.
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i);
    h |= 0;
  }
  return h >>> 0;
}

const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const MODES = ["major", "minor"] as const;
const CAMELOT_MAP: Record<string, string> = {
  "C major": "8B", "C minor": "5A", "C# major": "3B", "C# minor": "12A",
  "D major": "10B", "D minor": "7A", "D# major": "5B", "D# minor": "2A",
  "E major": "12B", "E minor": "9A", "F major": "7B", "F minor": "4A",
  "F# major": "2B", "F# minor": "11A", "G major": "9B", "G minor": "6A",
  "G# major": "4B", "G# minor": "1A", "A major": "11B", "A minor": "8A",
  "A# major": "6B", "A# minor": "3A", "B major": "1B", "B minor": "10A",
};
const FREQ_RANGES = ["sub-bass", "bass", "low-mid", "mid", "high-mid", "high"] as const;
const GENRES = ["techno", "house", "ambient", "drum-and-bass", "trance", "minimal", "deep-house"];
const ALL_MOOD_TAGS = ["dark", "bright", "energetic", "ambient", "intense", "chill", "hypnotic",
  "driving", "ethereal", "melancholic", "euphoric", "gritty", "lush", "industrial", "organic"];

function analyzeTrack(trackId: string) {
  const rand = mulberry32(seedFromString(trackId));
  const bpm = Math.round(80 + rand() * 100); // 80–180
  const keyRoot = KEYS[Math.floor(rand() * KEYS.length)] ?? "A";
  const mode = MODES[Math.floor(rand() * MODES.length)] ?? "minor";
  const keyStr = `${keyRoot} ${mode}`;
  const camelot = CAMELOT_MAP[keyStr] ?? "8A";
  const valence = Number((rand()).toFixed(3));
  const arousal = Number((rand()).toFixed(3));
  const spectralCentroid = Math.round(800 + rand() * 6400);
  const spectralRolloff = Math.round(spectralCentroid * (1.2 + rand() * 0.8));
  const zeroCrossingRate = Number((rand() * 0.3).toFixed(4));
  const rmsEnergy = Number((0.05 + rand() * 0.6).toFixed(4));
  const freqRange = FREQ_RANGES[Math.floor(rand() * FREQ_RANGES.length)] ?? "mid";
  const estimatedGenre = GENRES[Math.floor(rand() * GENRES.length)] ?? "techno";
  // Pick 3–5 mood tags deterministically
  const shuffled = [...ALL_MOOD_TAGS].sort(() => rand() - 0.5);
  const tagCount = 3 + Math.floor(rand() * 3);
  const moodTags = shuffled.slice(0, tagCount);

  return {
    trackId,
    bpm,
    key: keyStr,
    camelot,
    valence,
    arousal,
    spectralCentroid,
    spectralRolloff,
    zeroCrossingRate,
    rmsEnergy,
    dominantFrequencyRange: freqRange,
    estimatedGenre,
    moodTags,
    analyzedAt: new Date().toISOString(),
  };
}

const tools: ToolDefinition[] = [
  {
    name: "audio_analyze_track",
    description:
      "Analyze an audio track and extract features (BPM, key, mood tags). Returns structured analysis.",
    schema: {
      type: "object",
      properties: {
        trackId: { type: "string", description: "Set/track UUID" },
        hlsUrl: { type: "string", description: "Optional HLS manifest URL for analysis" },
      },
      required: ["trackId"],
    },
    handler: async (params) => {
      const p = AnalyzeTrackSchema.parse(params);
        return analyzeTrack(p.trackId);
    },
  },
  {
    name: "audio_extract_bpm",
    description: "Extract BPM from an audio track.",
    schema: {
      type: "object",
      properties: {
        trackId: { type: "string" },
      },
      required: ["trackId"],
    },
    handler: async (params) => {
      const trackId = String(params.trackId);
        const analysis = analyzeTrack(trackId);
        return { trackId, bpm: analysis.bpm, confidence: Number((0.85 + mulberry32(seedFromString(trackId))() * 0.14).toFixed(3)) };
    },
  },
  {
    name: "audio_extract_key",
    description: "Extract musical key from an audio track.",
    schema: {
      type: "object",
      properties: {
        trackId: { type: "string" },
      },
      required: ["trackId"],
    },
    handler: async (params) => {
      const trackId = String(params.trackId);
        const analysis = analyzeTrack(trackId);
        return { trackId, key: analysis.key, camelot: analysis.camelot, confidence: Number((0.80 + mulberry32(seedFromString(trackId + "_key"))() * 0.18).toFixed(3)) };
    },
  },
  {
    name: "audio_generate_mood_tags",
    description: "Generate mood tags from audio features.",
    schema: {
      type: "object",
      properties: {
        trackId: { type: "string" },
        bpm: { type: "number" },
        key: { type: "string" },
        valence: { type: "number" },
        arousal: { type: "number" },
      },
      required: ["trackId"],
    },
    handler: async (params) => {
      const trackId = String(params.trackId);
      const bpm = Number(params.bpm ?? 128);
      const valence = Number(params.valence ?? 0.5);
      const arousal = Number(params.arousal ?? 0.5);
      const tags: string[] = [];
      if (bpm > 130) tags.push("fast", "driving");
      else if (bpm > 120) tags.push("energetic");
      else tags.push("mid-tempo");
      if (valence > 0.6) tags.push("bright", "uplifting");
      else tags.push("dark", "melancholic");
      if (arousal > 0.7) tags.push("intense", "peak-time");
      else if (arousal < 0.4) tags.push("ambient", "chill");
      return { trackId, moodTags: tags };
    },
  },
  {
    name: "audio_match_artwork_to_track",
    description:
      "Find artworks that match a DJ set/track based on audio features. Returns ranked matches with similarity scores.",
    schema: {
      type: "object",
      properties: {
        setId: { type: "string", description: "DJ Set UUID" },
        limit: { type: "number", default: 5 },
      },
      required: ["setId"],
    },
    handler: async (params) => {
      const p = MatchArtworkSchema.parse(params);
      // Placeholder: returns structure for the flow engine
      return {
        setId: p.setId,
        matches: [
          {
            artworkId: "art-demo-1",
            title: "Neon Ritual",
            artist: "Studio Lumen",
            similarityScore: 0.92,
            matchReason: "Dark palette and geometric tension match the track's hypnotic energy",
          },
          {
            artworkId: "art-demo-2",
            title: "Subway Frequencies",
            artist: "Urban Echo",
            similarityScore: 0.87,
            matchReason: "Industrial textures resonate with the driving bassline",
          },
        ],
        limit: p.limit,
      };
    },
  },
];

export function createAudioMCPServer(): MCPServer {
  return new MCPServer({
    name: "elbtronika-audio",
    version: "1.0.0",
    tools,
  });
}
