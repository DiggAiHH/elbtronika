/**
 * Supabase-based per-user rate limiting for AI features.
 * No Redis required — uses a simple rolling-window counter table.
 */

import type { RateLimitStatus, UserRole } from "./types";

export const ROLE_LIMITS: Record<UserRole, number> = {
  visitor: 10,
  collector: 50,
  artist: 100,
  dj: 100,
  curator: 200,
  admin: 500,
};

const WINDOW_HOURS = 24;

export interface RateLimitStore {
  get(userId: string): Promise<{ count: number; windowStart: string } | null>;
  set(userId: string, count: number, windowStart: string): Promise<void>;
}

export interface RateLimitContext {
  userId: string | null;
  role: UserRole;
  ipHash?: string;
}

function getLimit(ctx: RateLimitContext): number {
  if (ctx.userId) {
    return ROLE_LIMITS[ctx.role] ?? ROLE_LIMITS.visitor;
  }
  // Anonymous users get the visitor limit
  return ROLE_LIMITS.visitor;
}

function getKey(ctx: RateLimitContext): string {
  if (ctx.userId) return `ratelimit:user:${ctx.userId}`;
  if (ctx.ipHash) return `ratelimit:ip:${ctx.ipHash}`;
  return `ratelimit:anon:${Date.now()}`;
}

function windowStart(): string {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now.toISOString();
}

/**
 * Check and consume a rate-limit token.
 * Returns { allowed: true, remaining: n } or { allowed: false, resetAt: ISO }.
 */
export async function checkRateLimit(
  ctx: RateLimitContext,
  store: RateLimitStore,
): Promise<RateLimitStatus> {
  const limit = getLimit(ctx);
  const key = getKey(ctx);
  const currentWindow = windowStart();

  const existing = await store.get(key);

  if (!existing || existing.windowStart !== currentWindow) {
    // New window
    await store.set(key, 1, currentWindow);
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetAt: new Date(Date.now() + WINDOW_HOURS * 60 * 60 * 1000).toISOString(),
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: new Date(Date.now() + WINDOW_HOURS * 60 * 60 * 1000).toISOString(),
    };
  }

  await store.set(key, existing.count + 1, existing.windowStart);

  return {
    allowed: true,
    limit,
    remaining: limit - existing.count - 1,
    resetAt: new Date(Date.now() + WINDOW_HOURS * 60 * 60 * 1000).toISOString(),
  };
}

/** In-memory store for testing and local dev. */
export function createMemoryStore(): RateLimitStore {
  const data = new Map<string, { count: number; windowStart: string }>();
  return {
    async get(key) {
      return data.get(key) ?? null;
    },
    async set(key, count, windowStart) {
      data.set(key, { count, windowStart });
    },
  };
}
