# ADR 0011: AI-gestützte Kuration (Claude)

**Status:** Accepted  
**Date:** 2026-04-29  
**Authors:** Sonnet 4.6 (Phase 11 session)

## Context

ELBTRONIKA needs AI-assisted curation to:
1. Help artists write compelling artwork descriptions from bullet points
2. Recommend artworks to visitors based on mood/desired atmosphere
3. Explain AI recommendations transparently (XAI / EU AI Act compliance)

All AI calls must be server-side (API keys never client-side), rate-limited, and auditable.

## Decisions

### Package Structure

A dedicated `packages/ai` workspace package (`@elbtronika/ai`) isolates all Anthropic SDK usage:
- `client.ts` — Anthropic SDK wrapper with timeout (25s), retry, JSON extraction
- `prompts.ts` — Prompt templates for description, recommendation, explanation
- `rate-limit.ts` — Per-user daily limits by role (visitor: 10, collector: 50, artist: 100, admin: 500)
- `audit.ts` — SHA-256 prompt hashing + ai_decisions logging helpers
- `types.ts` — Shared AI types (AIPrompt, AIResponse, AIDecisionLog, etc.)

### Model Selection

- **Default:** `claude-sonnet-4-6` (mapped to `claude-3-7-sonnet-20250219` until 4.6 release)
- **Long tasks:** `claude-opus-4-6` (fallback to opus-class)
- Max tokens: 4096 default, 2048 for description/recommendation, 1024 for explanation

### Rate Limiting (MVP)

In-memory store per process (no Redis/Upstash yet). Rolling 24h window per user.
Replaced by Redis/Upstash before production scale.

### Audit Logging

Every curatorial AI call writes to `ai_decisions` table:
- `action`: "describe" | "recommend" | "explain"
- `triggered_by`: user UUID (foreign key to profiles)
- `input_summary`: SHA-256 hash of full prompt (32 chars)
- `output_summary`: JSON string of AI response
- `model`: model identifier
- `metadata`: { inputTokens, outputTokens, latencyMs }
- `confidence`: null (reserved for future confidence scoring)

### API Routes

| Endpoint | Auth | Use Case |
|----------|------|----------|
| `POST /api/ai/describe` | artist+ | Bullet points → 3 description variants |
| `POST /api/ai/recommend` | any auth | Mood query → 3 artwork recommendations |
| `POST /api/ai/explain` | any auth | decisionId → XAI reasoning |
| `POST /api/ai/override` | any auth | Reject AI suggestion (user_override in metadata) |

### UI Components

- `AIDescriptionAssistant` — Artist dashboard widget for generating descriptions
- `MoodRecommender` — Shop widget for mood-based artwork discovery

### Tag Suggestions (Vision API)

Deferred to Phase 11b — requires Claude Vision API (extra cost + complexity). Not in MVP scope.

## Consequences

- **Positive:** Human-in-the-loop by design; every output is editable/rejectable; audit trail for compliance.
- **Positive:** Package isolation means AI SDK upgrades affect only `packages/ai`.
- **Risk:** In-memory rate limiting resets on deploy. Must switch to Redis/Upstash before public beta.
- **Risk:** Supabase `ai_decisions` schema may need migration if we add `user_override` as a first-class column.

## Alternatives Considered

1. **Vercel AI SDK** — Rejected: adds abstraction layer we don't need; Anthropic SDK is simple enough.
2. **OpenAI GPT-4o** — Rejected: Anthropic Sonnet has better German prose quality for art curation.
3. **Edge Functions for AI** — Rejected: 50s Netlify Edge timeout is sufficient, but Route Handlers are simpler to debug and share Supabase client code.
