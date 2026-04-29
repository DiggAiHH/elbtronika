/**
 * Shared types for the AI curation layer.
 * All user-facing strings are German-first (ELBTRONIKA is a Berlin-based platform).
 */

export type AIModel = "claude-sonnet-4-6" | "claude-opus-4-6";

export interface AIPrompt {
  system: string;
  messages: Array<{ role: "user"; content: string }>;
  model?: AIModel;
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  text: string;
  model: AIModel;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  latencyMs: number;
}

export interface AIDescriptionRequest {
  bullets: string[];
  language?: "de" | "en";
  tone?: "poetic" | "factual" | "gallery";
}

export interface AIDescriptionResult {
  variants: string[];
}

export interface AIRecommendRequest {
  mood: string;
  language?: "de" | "en";
  limit?: number;
}

export interface AIRecommendResult {
  suggestions: Array<{
    artworkId: string;
    title: string;
    artist: string;
    reason: string;
  }>;
}

export interface AIDecisionLog {
  id: string;
  userId: string | null;
  feature: "describe" | "recommend" | "explain" | "tag";
  promptHash: string;
  model: AIModel;
  output: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  createdAt: string;
  userOverride?: boolean;
}

export interface RateLimitStatus {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: string;
}

export type UserRole = "visitor" | "collector" | "artist" | "dj" | "curator" | "admin";
