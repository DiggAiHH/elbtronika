# ADR-Index (kanonisch)

> **Regel seit Sprint 5 (2026-07-09):** Es gibt genau EINEN ADR-Ordner (`docs/adr/`) und
> EINEN Nummernkreis. Nächste freie Nummer: **0034**. Die früheren Parallel-Ordner
> `docs/adrs/` und `docs/architecture/adr/` wurden hierher gemerged; drei doppelt
> vergebene Nummern innerhalb dieses Ordners wurden neu vergeben (Mapping unten).

## Umbenennungs-Mapping (alte Links → neu)

| Alt | Neu |
|---|---|
| `docs/adr/0014-trust-residuals.md` | `0024-trust-residuals.md` |
| `docs/adr/0018-stripe-idempotency.md` | `0025-stripe-idempotency.md` |
| `docs/adr/0019-pitch-architecture.md` | `0026-pitch-architecture.md` |
| `docs/adrs/adr-0020-mcp-architecture.md` | `0027-mcp-architecture.md` |
| `docs/adrs/adr-0021-hermes-agent.md` | `0028-hermes-agent.md` |
| `docs/adrs/adr-0022-music-art-matching.md` | `0029-music-art-matching.md` |
| `docs/architecture/adr/ADR-0010-CSP-Strategie.md` | `0030-csp-strategie.md` |
| `docs/architecture/adr/ADR-0011-Caching-Strategie.md` | `0031-caching-strategie.md` |
| `docs/architecture/adr/ADR-0012-Monitoring-Stack.md` | `0032-monitoring-stack.md` |
| `docs/architecture/adr/ADR-0013-DSGVO-Implementierung.md` | `0033-dsgvo-implementierung.md` |

(Ältere Dokumente wie Architekturplan v1.3/v1.4 referenzieren teils die alten Pfade —
sie sind Audit-Trail und werden nicht rückwirkend editiert.)

## Register

| Nr | Titel | Thema |
|---|---|---|
| 0001 | monorepo-tooling | pnpm+Turborepo, Biome, Repo-Struktur |
| 0002 | design-system | Tokens, Radix, Storybook |
| 0003 | infrastructure-phase3 | Supabase, R2, Sanity, Doppler |
| 0004 | auth-phase4 | Magic Link, OAuth, Rollen, RLS |
| 0005 | content-model | Artwork/Room/Set, Sanity→Supabase-Sync |
| 0006 | shop-architektur | Classic Mode, SSR-Grid |
| 0007 | immersive-architektur | Single Canvas, R3F |
| 0008 | spatial-audio | PannerNode, hls.js, Proximity |
| 0009 | mode-transition | State-Machine, Kamera, Dissolve |
| 0010 | stripe-connect | Separate Charges & Transfers, 60/20/20 |
| 0011 | ai-architektur | Claude-Endpunkte, Audit, Rate-Limit |
| 0012 | edge-performance | Netlify Edge, Caching |
| 0013 | compliance | DSGVO, Consent, EU-AI-Act |
| 0014 | dependency-alignment-bundle-budgets | Budgets, Alignment |
| 0015 | react-compiler-r3f-performance | React Compiler + R3F |
| 0016 | spatial-audio-smoothing | Gain-Smoothing |
| 0017 | mode-toggle-accessibility | a11y des Mode-Switch |
| 0018 | demo-mode-architecture | ELT_MODE-Layer, Demo-Personas |
| 0019 | ai-client-resilience | Retry/Backoff/Timeout |
| 0020 | react-compiler-rum | RUM-Instrumentierung |
| 0021 | consent-api-hardening | Consent-API |
| 0022 | modes-and-prd-doppler | Modes + prd-Doppler-Strategie |
| 0023 | vr-xr-mode | VR/XR (Proposed — als "Phase 23" im Backlog) |
| 0024 | trust-residuals | Hermes-Trust-Restpunkte (vorher 2. „0014") |
| 0025 | stripe-idempotency | Idempotenz-Keys (vorher 2. „0018") |
| 0026 | pitch-architecture | Pitch-Dashboard (vorher 2. „0019") |
| 0027 | mcp-architecture | 4 MCP-Server (aus docs/adrs) |
| 0028 | hermes-agent | Agent-Runtime (aus docs/adrs) |
| 0029 | music-art-matching | Flow-Engine (aus docs/adrs) |
| 0030 | csp-strategie | CSP (aus docs/architecture/adr) |
| 0031 | caching-strategie | Caching (aus docs/architecture/adr) |
| 0032 | monitoring-stack | Monitoring (aus docs/architecture/adr) |
| 0033 | dsgvo-implementierung | DSGVO-Umsetzung, /api/account/* kanonisch |
