# ADR 0020: React Compiler & RUM Integration

## Status
**Accepted** — 2026-04-29

## Context

Phase 12 (Edge & Performance) hatte Lücken:
- React Compiler war deaktiviert
- Kein Real User Monitoring (RUM) für Core Web Vitals
- Keine Server-seitige Instrumentierung

## Decision

### 1. React Compiler
- `babel-plugin-react-compiler` installiert
- `experimental.reactCompiler: true` in `next.config.ts`
- R3F-Dateien sind compiler-safe (Refs für per-frame Mutationen)

### 2. Next.js Config
- `output: "standalone"` für containerisierte Deployments
- `poweredByHeader: false` für Security
- `compress: true` explizit
- `images.remotePatterns` auf spezifische Sanity-Domains eingeschränkt

### 3. Performance Monitoring
- `web-vitals` Paket installiert (für zukünftige RUM-Integration)
- `instrumentation.ts` mit `onRequest` / `onError` Hooks
- `experimental.instrumentationHook: true` aktiviert

### 4. Caching
- `_next/static` Assets: `immutable` für 1 Jahr
- `.glb` / `.ktx2`: `immutable` für 1 Jahr
- `/api/health`: `stale-while-revalidate`

## Consequences

### Positive
- Automatische Memoization durch React Compiler
- Bessere Deployability via standalone output
- Vorbereitung für RUM-Integration

### Negative
- React Compiler kann Build-Zeit erhöhen
- `instrumentationHook` ist noch experimentell
