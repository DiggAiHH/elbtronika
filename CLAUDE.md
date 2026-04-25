# AI Mode — Engineering Harness

Terse. Drop fluff. Technical exact. Code unchanged.
Pattern: [thing] [action] [reason]. [next step].
Caveman always on. Off: "normal mode". Commits/PRs: normal english.
Use caveman-compress on memory files to cut input tokens.

---

# Memory

## Me
Lou (diggai@tutanota.de), Solo-Builder & Full-Stack Engineer.
Hintergrund: Medizintechnik, HAW Hamburg — gelernt, wie man ein Produkt von 0 bis Markt aufbaut.
Stil: Engineering-Harness-Ansatz. Ideen übernehmen, komplett durchplanen, bauen, automatisieren. Claude-First AI-Stack, Pair-Programming mit Claude.
Ziel pro Projekt: voll automatisierter Geschäftsbetrieb mit minimalem Owner-Kontakt.

## Projects

| Name | Was |
|------|-----|
| **ELBTRONIKA** | Immersive 3D-Online-Galerie, verschmilzt elektronische Musik (DJs) + visuelle Kunst. Kernfeature: nahtloser Übergang zwischen "Immersive Mode" (3D + Spatial Audio) und "Classic Mode" (Shop-Grid). 60/20/20 Revenue-Split Künstler/DJ/Plattform. Stand: Plan v1.0 approved, Phase 0 läuft. |

## People

| Wer | Rolle |
|-----|-------|
| **Lou** | Owner, Builder, diggai@tutanota.de |
| **Steuerberater** | TBD — blockt Rechtsform-Entscheidung |
| **Fachanwalt IT-Recht** | TBD — Impressum/Datenschutz/AGB |
| **Kuratorin** | TBD — Review-Rolle in Sanity |

## Terms

| Term | Bedeutung |
|------|-----------|
| ELBTRONIKA | Projekt-Hauptname, 3D-Galerie + E-Commerce |
| Immersive Mode | 3D-Raum mit Spatial Audio, WebGPU-Canvas |
| Classic Mode | Klassische 2D-Shop-Ansicht, DOM-basiert |
| Single Canvas | WebGPU-Canvas wird nie unmounted, Mode-Switching via Kamera + Shader |
| 60/20/20 Split | Revenue-Verteilung Künstler / DJ / Plattform |
| DoD | Definition of Done — Testing + Dokumentation + Compliance + Deployment-Ready |
| ADR | Architecture Decision Record, in /docs/adr/ |
| R3F | React Three Fiber (v9) |
| RLS | Row Level Security (Postgres / Supabase) |
| KYC | Know-Your-Customer — Stripe Onboarding für Plattformen |
| HLS | HTTP Live Streaming — Audio-Ingestion Format |
| TSL | Three.js Shading Language (für Bloom-Pipeline) |
| GROQ | Sanity Query Language |
| AVV | Auftragsverarbeitungsvertrag (DSGVO) |

## Stack (April 2026)
- **Frontend:** Next.js 15 App Router, React 19, Tailwind v4, shadcn/ui
- **3D:** Three.js r184, R3F v9, Drei v10, WebGPURenderer mit WebGL2-Fallback
- **Audio:** Web Audio API nativ + PannerNode, hls.js v1.6+ als Web Worker
- **State:** Zustand v5 (global), TanStack Query v5 (async)
- **Backend:** Supabase (Postgres 16 + RLS + pgvector, EU-Frankfurt)
- **Payments:** Stripe Connect, Separate Charges and Transfers
- **CMS:** Sanity v4 + Embedded Studio
- **Storage:** Cloudflare R2 (Zero-Egress, cdn.elbtronika.art)
- **Hosting:** Netlify + Edge Functions (Deno)
- **AI:** Anthropic Claude Sonnet 4.6 / Opus 4.6
- **DevOps:** pnpm v10 + Turborepo, Biome v2, Vitest, Playwright, Doppler, Sentry

## Engineering Harness Tools

| Tool | Zweck | Befehl |
|------|-------|--------|
| **caveman** | Output-Token -75% (terse mode) | `claude plugin install caveman@caveman` |
| **caveman-compress** | Input-Token -46% (CLAUDE.md komprimieren) | `/caveman:compress CLAUDE.md` |
| **codeburn** | Token-Kosten Dashboard + Optimize-Scan | `npx codeburn` / `codeburn optimize` |
| **designlang** | Design-System aus URL extrahieren → Tailwind/shadcn | `npx designlang <url>` |
| **designlang MCP** | Claude liest Live-Design-Tokens direkt | `designlang mcp --output-dir ./design-extract-output` |
| **designlang skill** | Claude Code `/extract-design <url>` | `npx skills add Manavarya09/design-extract` |

### Design-First Workflow (Frontend)
1. `npx designlang <referenz-url> --full --emit-agent-rules` → extrahiert komplettes Design-System
2. Output geht nach `./design-extract-output/` → Tailwind-Config, shadcn-Theme, DTCG-Tokens, CLAUDE.md-Fragment
3. Claude Design Skills nutzen für alle UI-Arbeit → weniger Tokens, präzisere Outputs
4. `codeburn optimize` nach jeder Phase → Waste-Patterns eliminieren

### Token-Effizienz-Regel
Frontend-Design-Arbeit → IMMER mit designlang-Extrakt + Claude Design Skills starten.
Nie blank designen wenn eine Referenz-URL existiert.

## Critical Path
Phase 0 (Legal + Stripe KYC) → Phase 3 (Infra: R2 + Supabase + Sanity) → Phase 7 (Single Canvas) — alle drei blockieren nachfolgende Phasen.

## Preferences
- Deutsch als primäre Arbeitssprache, Code + Commits auf Englisch
- Claude-First: Anthropic SDK, Sonnet 4.6 als Default
- Privacy by Architecture: jedes External-API läuft über Edge-Proxy oder cookieless
- Solo-Dev, Pair mit Claude — Freigabe-Gate vor jedem Code-Commit
- Netlify-Hosting (User-Vorgabe), pnpm-Monorepo
- Dokumentation nach jedem Phase-DoD
