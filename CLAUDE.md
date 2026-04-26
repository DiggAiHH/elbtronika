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

## Phase Status
| Phase | Status | Tag |
|-------|--------|-----|
| Phase 0 | 🔄 Läuft (legal TBD) | — |
| Phase 1 | ✅ Done | v0.1.0 |
| Phase 2 | ✅ Done | v0.2.0 |
| Phase 3 | ✅ Done | v0.3.0 |
| Phase 4 | ⏳ Next | — |
| Phase 5–7 | 🔒 Blocked | — |

## Phase 3 Manual Steps (Lou ausstehend)
- R2 bucket `elbtronika-assets` anlegen → `docs/phase-3-cloudflare-r2-setup.md`
- Sanity project init + API tokens → `docs/phase-3-doppler-setup.md` §6
- Doppler project + secrets befüllen → `docs/phase-3-doppler-setup.md`
- Netlify site + GitHub secrets setzen → `docs/phase-3-netlify-github-secrets.md`

## Phase 4 Entry — Nächste Schritte
1. Supabase Auth UI (magic link + OAuth)
2. Protected routes + middleware auth guard
3. Profile creation flow (trigger already in place)
4. Stripe Connect KYC onboarding für Artists/DJs

## Cowork Tool Rules (gelernt in Phase 1)
**Vollständig:** `docs/agent-preflight-protocol.md` — IMMER lesen beim Session-Start.

Kurzfassung:
- Shell → IMMER `cmd` (PowerShell blockt pnpm)
- Git commit → `echo msg > D:\msg.txt && git commit -F D:\msg.txt`
- CI prüfen → `gh run list --repo DiggAiHH/elbtronika` (kein Browser nötig)
- Biome → `node_modules\.bin\biome` (nie `npx biome` → falsche Version)
- upload-artifact `.next/` → `include-hidden-files: true` (dotdir!)
- `pnpm.onlyBuiltDependencies: ["esbuild", "sharp"]` in root package.json
- Workspace bash oft nicht verfügbar → Desktop Commander als Fallback
- Tools bulk laden: `ToolSearch({ query: "computer-use", max_results: 30 })`

## Repo
- Org: DiggAiHH | Repo: elbtronika | Branch: main
- CI: github.com/DiggAiHH/elbtronika/actions
- Aktueller Tag: v0.1.0 (Phase 1)

## Preferences
- Deutsch als primäre Arbeitssprache, Code + Commits auf Englisch
- Claude-First: Anthropic SDK, Sonnet 4.6 als Default
- Privacy by Architecture: jedes External-API läuft über Edge-Proxy oder cookieless
- Solo-Dev, Pair mit Claude — Freigabe-Gate vor jedem Code-Commit
- Netlify-Hosting (User-Vorgabe), pnpm-Monorepo
- Dokumentation nach jedem Phase-DoD: Notion + Airtable + Miro + lokal D:\ + GitHub
