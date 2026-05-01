# ELBTRONIKA – Architektur- und Ausführungsplan v1.3

> **Stand:** 2026-04-30 (Post-Session-3 Konsolidierung nach Kimi-K-2.6-Merge)
> **Vorgänger:** v1.0, v1.1, v1.2 (alle weiterhin gültig als Audit-Trail)
> **Aktueller Release-Tag:** `v0.13.0-demo`
> **Status:** PLAN — kanonisierte Phasen-Nummerierung, ADR-Index 0001–0020 vollständig, Pre-Pitch-Sprint definiert
> **Begleitdokumente:** `OPUS_47_HANDOVER.md`, `PROMPTS_OPUS48_HANDOFF.md` (siehe Job 2 unten)

---

## Changelog v1.2 → v1.3

| Aspekt | v1.2 | v1.3 |
|---|---|---|
| Phasen-Nummerierung | inkonsistent (mal 14/15/16, mal 18/19) | **kanonisiert: 1–22 inkl. Pre-Pitch-Cleanup als Phase 20** |
| Aktueller Stand | Phase 18+19 geplant | **Phase 1–19 alle ✅ done, Phase 20 (Pre-Pitch-Cleanup) als NEUE Top-Priorität** |
| Tag | v0.7.0 / v0.12.0 etc. | **`v0.13.0-demo` als kanonischer Release** |
| Demo-Personas | 5 Künstler/3 DJs/8 Artworks geplant | **alle gemerged + 8 Demo-Artwork-Bilder algorithmisch generiert** |
| ADR-Index | 0001–0013 sporadisch | **ADR-Index 0001–0020 vollständig** |
| Trust-Residuals | 3 offen (Audit-DB, Migrations, SR-Key) | **2 noch offen (Migrations push, Doppler-ENV); SR-Key ✅ verifiziert** |
| Pitch-Plan | grob skizziert | **konkrete Pre-Pitch-P0/P1/P2-Liste mit Owner-Mapping** |
| Post-Launch-Backlog | erwähnt | **als Phase 23+ formalisiert mit 5 Items** |

---

## 1. Kanonische Phasen-Übersicht v1.3

### 1.1 Build-Phasen (alle ✅ done auf `feature/phase-11-ai`)

| # | Titel | Stand | Tag | Notiz |
|---|---|---|---|---|
| 1 | Repo & Tooling | ✅ done-on-main | `v0.1.0` | Copilot |
| 2 | Design System | ✅ done-on-main | `v0.2.0` | Copilot |
| 3 | Infrastruktur (Supabase/R2/Sanity/Netlify) | ✅ done-on-main | `v0.3.0` | Copilot |
| 4 | Auth & Roles | ✅ done-on-main | `v0.4.0` | Copilot |
| 5 | Content Model & CMS | ✅ done-on-main | `v0.5.0` | Copilot |
| 6 | Classic Mode (Shop) | ✅ branch-done | `v0.6.0` | Sonnet 4.6 |
| 7 | Immersive Mode (3D) | ✅ branch-done | `v0.7.0` | Sonnet 4.6 |
| 8 | Spatial Audio | ✅ branch-done | `v0.8.0` | Sonnet 4.6 |
| 9 | Mode Transitions | ✅ branch-done | `v0.9.0-mt` | Sonnet 4.6 |
| 10 | Stripe Connect | ✅ branch-done | `v0.12.0` | Sonnet 4.6 |
| 11 | AI-Kuration (Claude) | ✅ branch-done | `v0.9.0-ai` | Sonnet 4.6 |
| 12 | Edge & Performance | ✅ branch-done | `v0.10.0` | Sonnet 4.6 |
| 13 | Compliance | ✅ branch-done | `v0.11.0` | Sonnet 4.6 |
| 14 | Optimization | ✅ done | — | Kimi K-NN, Build 53 Pages, 102kB FLJS |
| 15 | Testing & QA | ✅ done | — | Kimi K-NN, 104+41 Tests passing |
| 16 | Launch-Prep | 🟡 ready | — | Lighthouse-CI, ZAP, Deploy-Workflows |
| 17 | Hermes Trust (Waves 0–8) | ✅ done | — | Sonnet 4.6 + Kimi K-2.6 |
| 18 | Demo-Readiness | ✅ branch-done | `v0.13.0-demo` | Kimi K-2.6 |
| 19 | Pitch-Polish | ✅ branch-done | `v0.13.0-demo` | Kimi K-2.6 |

### 1.2 Pre-Pitch-Phase (NEU in v1.3, top-priorität)

| # | Titel | Stand | Aufwand | Owner |
|---|---|---|---|---|
| **20** | **Pre-Pitch-Cleanup** | ⬜ tbd | 1-2 Tage | Sonnet + Lou |

**Phase 20 enthält drei Sub-Sprints:**

**20.1 — Supabase Migrations push (P0, Sonnet)**
Fünf Migrations sind im Repo, aber nicht auf Supabase dev applied:
- `20260430_agent_tasks.sql`
- `20260430_orders_session_id.sql`
- `20260430_mcp_audit_log.sql`
- `20260430_demo_personas.sql` (artwork.is_demo Spalte)
- `20260430_investor_role.sql` (Phase 19)

Befehl: `pnpm.cmd supabase db push` gegen Dev-Project.
Verify: `pnpm.cmd supabase migration list`.
Smoke-Test pro Migration: insert + select round-trip.

**20.2 — Doppler dev ENV-Setup (P1, Sonnet)**
- `ELT_MODE=demo`
- `MCP_AUDIT_DB=true`
- Verify: `pnpm.cmd --filter @elbtronika/web dev` startet ohne ENV-Fehler.

**20.3 — Stripe Test-Connected-Accounts erstellen (P0, Lou)**
- 8 Mock-Accounts in `dashboard.stripe.com/test/connect`
- Pro Demo-Persona (5 Artists + 3 DJs) je ein Account
- IDs eintragen in `apps/web/src/lib/stripe/demo.ts`
- Lou kann Stripe MCP nutzen oder Web-Dashboard manuell.

**20.4 — Supabase types regenerieren (P1, Sonnet)**
Nach Migrations-Push:
```
pnpm.cmd supabase gen types typescript --project-id <ID> > packages/contracts/src/supabase/types.ts
```
Alle `as any`-Casts in `audit.ts` und Folge-Files entfernen.
`pnpm.cmd --filter @elbtronika/web typecheck` muss grün sein.

**20.5 — Pitch-Probelauf intern (Lou)**
30 Min: Komplettes Erlebnis aus Lee's Perspektive durchspielen, Bugs finden, fixen lassen.

### 1.3 Pitch + Live-Switch (Phase 21–22)

| # | Titel | Stand | Aufwand |
|---|---|---|---|
| 🎯 | **MILESTONE: Pitch zu Lee Hoops** | ⬜ tbd | externe Entscheidung |
| 21 | Live-Switch (post-Lee-OK) | 🔒 blocked | 15 Min Code + 1 Tag Admin |
| 22 | Public Launch | 🔒 blocked | 1 Tag |

**Phase 21 Live-Switch:** Detail-Skript in `docs/runbooks/live-switch-post-lee-ok.md`. ENV-Tausch in Doppler `prd`, Sanity-Filter, Stripe-Webhook-Endpoint, Netlify-Promote, Smoke-Test.

**Phase 22 Public Launch:** DNS-TTL 60s, Switch, 48h Hypercare. Marketing-Push (PR, Partner-DJs).

### 1.4 Post-Launch-Backlog (Phase 23+, formalisiert in v1.3)

| # | Titel | Priorität | Notiz |
|---|---|---|---|
| 23 | Audit-Log-Dashboard | hoch | Read-Only Admin-View über `mcp_audit_log` |
| 24 | Multi-Item-Cart | mittel | MVP war Single-Item — Multi für Sammler-Bundles |
| 25 | NFT-Erweiterung | niedrig | Crypto-Shredding-Pattern aus Research-Dossier |
| 26 | Vinyl/USB Special Editions | niedrig | Fulfillment-Partner-Integration |
| 27 | Live-Vernissage-Streaming | niedrig | Livestream-Integration mit DJ-Sets in Real-Time |

---

## 2. ADR-Index v1.3 (vollständig)

| ADR | Titel | Phase | Status |
|---|---|---|---|
| 0001 | Monorepo-Tooling (pnpm + Turborepo + Biome) | 1 | accepted |
| 0002 | Design System (Tailwind v4 + Radix + shadcn) | 2 | accepted |
| 0003 | Infrastruktur (Supabase + R2 + Sanity + Netlify) | 3 | accepted |
| 0004 | Auth (Magic Link + OAuth + RLS) | 4 | accepted |
| 0005 | Content-Model (Sanity + Supabase-Mirror, Localized Strings) | 5 | accepted |
| 0006 | Shop-Architektur (SSR Grid, Cursor-Pagination) | 6 | accepted |
| 0007 | Immersive-Architektur (Single Canvas + WebGPU + Proximity) | 7 | accepted |
| 0008 | Spatial-Audio (PannerNode + Inverse-Square + HLS) | 8 | accepted |
| 0009 | Mode-Transition (Shader-Blend, Camera-Interpolation) | 9 | accepted |
| 0010 | Payment-Split (Separate Charges and Transfers + Idempotency) | 10 | accepted |
| 0011 | AI-Architektur (Claude + Audit-Log + XAI) | 11 | accepted |
| 0012 | Edge-Performance (Cache-Strategie, Reverse-Proxy) | 12 | accepted |
| 0013 | Compliance-Architektur (DSGVO Omnibus + AI Act + Consent) | 13 | accepted |
| 0014 | Trust-Residuals (Audit-DB, Service-Role-Key) | 17 | accepted |
| 0015 | Optimization-Strategy (Bundle-Split, Image-Pipeline) | 14 | accepted (Kimi) |
| 0016 | Test-Strategy (Vitest + Playwright + Lighthouse-CI) | 15 | accepted (Kimi) |
| 0017 | Launch-Workflow (Staging→Prod, 48h Hypercare) | 16 | accepted (Kimi) |
| 0018 | Demo-Mode-Architecture (ELT_MODE, Mock-Stripe, Persona-Seed) | 18 | accepted |
| 0019 | Pitch-Architecture (Walkthrough, PressKit, Investor-Dashboard) | 19 | accepted |
| 0020 | Modes-and-Doppler-prd-Strategy | 20 | accepted |

---

## 3. Risk-Register v1.3 (Update Stand 30.04.)

| Risiko | Wahrscheinlichkeit | Impact | Status v1.2 → v1.3 |
|---|---|---|---|
| Lee überzeugt Demo nicht | mittel | sehr hoch | unverändert — Phase 19 Polish ✅ done |
| 5 Migrations nicht gepusht | hoch (akut) | hoch | **NEU P0** — Phase 20.1 |
| Stripe-Mock-Accounts sind Platzhalter | hoch (akut) | hoch | **NEU P0** — Phase 20.3 (Lou-Aktion) |
| Doppler dev ENV unvollständig | mittel | mittel | **NEU P1** — Phase 20.2 |
| Demo-Mode-Bugs als Live-Bugs gehalten | mittel | hoch | unverändert — DemoBanner sichtbar |
| Künstler-Akquise post-Lee zu langsam | hoch | mittel | unverändert — pre-Vereinbarungen jetzt |
| Stripe-KYC-Verzögerung | mittel | hoch | **gemildert** — Antrag schon jetzt einleitbar |
| GEMA gegen DJ-Sets | mittel | hoch | unverändert — Anwalt-Review Phase 21+ |
| Mobile FPS unter Last | mittel | mittel | gemildert — Lite-Mode-Fallback gebaut |
| AI-Act 08/2026 Verschärfung | mittel | mittel | gemildert — XAI-Layer + Audit-Log ✅ |

---

## 4. Was bleibt von v1.0–v1.2 unverändert

- **Tech-Stack** (v1.0 §2): Next.js 15, React 19, Three.js r184, R3F v9, Supabase, Stripe Connect, Sanity v4, R2, Netlify, Anthropic — alles weiterhin gültig
- **Repo-Struktur** (v1.0 §3): apps/web, apps/cms, packages/three, packages/audio, packages/ui, packages/contracts, packages/sanity-studio, packages/config, packages/mcp, packages/flow, packages/ai, supabase/, docs/
- **Drei Architektur-Prinzipien** (v1.0): Single Canvas Overlay, Privacy by Architecture, Deterministisches Payment-Splitting
- **Drei Modi** (v1.2 §1.2): `demo` | `staging` | `live` über `ELT_MODE`
- **Pitch-First-Strategie** (v1.2 §1.3): bleibt der zentrale strategische Pfad
- **Live-Switch-Choreografie** (v1.2 §4): 15-Minuten-Operation post-Lee-OK
- **Hermes Trust Boundaries** (v1.2 §2.5): bleiben aktiv in allen drei Modi

---

## 5. Strategische Offen-Fragen v1.3

| # | Frage | Block für | Owner |
|---|---|---|---|
| H1 | Wann genau ist der Pitch-Termin mit Lee Hoops? | Tempo Phase 20 | Lou |
| H2 | Soll Pre-Pitch-Cleanup (Phase 20) heute oder spätestens morgen abgeschlossen werden? | Pitch-Termin | Lou |
| H3 | Stripe Test-Connected-Accounts (8 Stück): selbst über Dashboard erstellen oder soll Opus per Stripe-MCP das machen? | Phase 20.3 | Lou |
| H4 | Doppler-prd-Befüllung (22 ENVs): direkt jetzt mit gemeinsamer Chrome-MCP-Session, oder nach Pitch? | Phase 21 Live-Switch | Lou |
| H5 | Demo-Video produzieren oder verzichten? | Phase 19 final-touch | Lou |
| H6 | Pre-Vereinbarungen mit Künstlern jetzt unterzeichnen (Letter of Intent), oder warten bis nach Lee-OK? | Phase 21 Live-Content | Lou |

---

## 6. Was als nächstes konkret passiert

1. **Sonnet 4.6 Session** (Phase 20.1 + 20.2 + 20.4): Migrations pushen, Doppler-ENVs setzen, Types regenerieren — siehe `PROMPTS_OPUS48_HANDOFF.md` § Prompt A
2. **GPT 5.4 Session** (Sanity-Wiring + Profile-Pages): 8 Demo-Artworks in Sanity hochladen, 5 Artist-Profile + 3 DJ-Profile-Routen — siehe `PROMPTS_OPUS48_HANDOFF.md` § Prompt B
3. **Codex 5.3 Session** (E2E-Erweiterung + Component-Tests + Doppler-Verify): demo-flow.spec.ts auf 11 Steps, WalkthroughTour/DemoBanner/PressKit Unit-Tests, Doppler-prd-Doku gegen Dashboard cross-checken — siehe `PROMPTS_OPUS48_HANDOFF.md` § Prompt C
4. **Lou-Aktionen** (siehe konsolidierte Liste in `PROMPTS_OPUS48_HANDOFF.md` § Action-Items)
5. Sobald Phase 20 ✅: Pitch-Probelauf intern (30 Min)
6. Sobald Probelauf ✅: Pitch zu Lee
7. Bei Lee-OK: Phase 21 Live-Switch ausführen

**Ziel:** Phase 20 binnen 1-2 Tagen abschließen, Pitch-Termin in unter 5 Tagen.
