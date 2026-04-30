# ADR 0019: AI Client Resilience & Streaming

## Status
**Accepted** — 2026-04-29

## Context

Phase 11 (AI-Kuration) hatte einen fragilen Client:
- Keine Retry-Logik bei Anthropic-Errors (429, 503)
- Kein Streaming — große Responses blockierten den Server
- `generateJson` nutzte einen loose `validator: (value: unknown) => T` ohne Type-Safety
- Keine Observability (Request/Response Logging)

## Decision

### 1. Exponential Backoff Retry
- `maxRetries: 3` (default)
- 429: Respektiere `Retry-After` Header
- 503: Retry mit exponentiellem Backoff (1s, 2s, 4s)
- 500: Retry (transient)

### 2. Custom Error Class
- `AIClientError` mit `code`, `retryable`, `retryAfterMs`
- Ermöglicht differenzierte Fehlerbehandlung in API-Routen

### 3. Streaming
- `stream(prompt, opts)` liefert `AsyncGenerator<string, AIResponse>`
- UI kann Text-Chunks in Echtzeit anzeigen

### 4. Zod-Integration
- `generateJson<T>(prompt, z.ZodSchema<T>)` ersetzt loose validator
- Typsicheres Parsing mit aussagekräftigen Fehlermeldungen

### 5. Observability
- `setLogHook(hook)` für Request/Response-Metriken
- Latency, Token-Usage, Error-Rate trackbar

### 6. Model-Naming
- Alte Aliase (`claude-sonnet-4-6`) durch echte Anthropic-IDs (`claude-sonnet-4-20250514`) ersetzt
- Kein Mapping mehr nötig

## Consequences

### Positive
- Robuster gegenüber Anthropic-Ausfällen
- Bessere UX durch Streaming
- Typsichere JSON-Extraktion
- Produktions-Monitoring möglich

### Negative
- Streaming liefert keine `usage` Tokens (Anthropic API Limitation)
- `generateJson` erfordert jetzt Zod-Schema (Breaking Change für Callers)
