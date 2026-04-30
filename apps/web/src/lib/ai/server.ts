import "server-only";

/**
 * Shared server-side utilities for AI API routes.
 * Centralises rate-limiting, audit logging, and hashing to avoid
 * duplication across /api/ai/* handlers.
 */

import { createMemoryStore, checkRateLimit } from "@elbtronika/ai/rate-limit";
import { createClient } from "@/src/lib/supabase/server";

// ---------------------------------------------------------------------------
// Rate limit (shared store across ALL AI endpoints)
// ---------------------------------------------------------------------------
const rateLimitStore = createMemoryStore();

export async function checkUserRateLimit(
  userId: string,
  role: string,
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const result = await checkRateLimit(
    { userId, role: role as "visitor" | "collector" | "artist" | "dj" | "curator" | "admin" },
    rateLimitStore,
  );
  return {
    allowed: result.allowed,
    remaining: result.remaining,
    limit: result.limit,
  };
}

// ---------------------------------------------------------------------------
// Audit log – maps to existing ai_decisions schema
// ---------------------------------------------------------------------------
export async function auditLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  entry: {
    userId: string;
    feature: "describe" | "recommend" | "explain" | "override";
    promptHash: string;
    model: string;
    output: string;
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
  },
) {
  await supabase.from("ai_decisions").insert({
    action: entry.feature,
    triggered_by: entry.userId,
    input_summary: entry.promptHash,
    output_summary: entry.output,
    model: entry.model,
    metadata: {
      inputTokens: entry.inputTokens,
      outputTokens: entry.outputTokens,
      latencyMs: entry.latencyMs,
    },
    confidence: null,
  });
}

// ---------------------------------------------------------------------------
// SHA-256 hash truncated to 32 chars
// ---------------------------------------------------------------------------
export async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}
