# ELBTRONIKA – Projekt Status (live)

> **Single Source of Truth.** Lou + alle AI-Agenten lesen diese File zuerst.
> **Pflichtaktion vor jeder Session:** Lese diese File. Aktualisiere nach jedem Phasen-Schritt.
> **Letztes Update:** 2026-04-30 (Kimi K-2.6 — Session 3: 3-Workstream Merge + 8 Demo-Artworks generiert, v0.13.0-demo)

---

## 🚦 Quick-Glance Ampel

| Phase | Titel | Status | Owner | Letzter Stand |
|---|---|---|---|---|
| 0 | Rechtliches & UG | 🟡 läuft | Lou | UG Gründung gestartet, Stripe KYC tbd |
| 1 | Repo & Tooling | ✅ done | Copilot | v0.1.0 |
| 2 | Design System | ✅ done | Copilot | v0.2.0 |
| 3 | Infrastruktur (Supabase/R2/Sanity/Netlify) | ✅ done | Copilot | v0.3.0 |
| 4 | Auth & Roles | ✅ done | Copilot | v0.4.0 |
| 5 | Content Model & CMS | ✅ done | Copilot | v0.5.0 |
| 6 | Classic Mode (Shop) | ✅ done | Sonnet 4.6 | v0.6.0 — Shop/Artist/DJ/Cart implementiert |
| 7 | Immersive Mode (3D) | ✅ done | Sonnet 4.6 | v0.7.0 — packages/three + CanvasRoot + Gallery Route |
| 8 | Spatial Audio | ✅ done | Sonnet 4.6 | v0.8.0 |
| 9 | Mode Transitions | ✅ done | Sonnet 4.6 | v0.9.0 |
| 10 | Stripe Connect | ✅ done | Sonnet 4.6 | v0.12.0 |
| 11 | AI-Kuration (Claude) | ✅ done | Sonnet 4.6 | v0.9.0 |
| 12 | Edge & Performance | ✅ done | Sonnet 4.6 | v0.10.0 |
| 13 | Compliance | ✅ done | Sonnet 4.6 | v0.11.0 |
| 14 | Optimization (Recherche 29.04.2026) | ✅ done | Kimi K-NN | Build 53 Pages, 102kB FLJS |
| 15 | Testing & QA | ✅ done | Kimi K-NN | 104 Tests passing, Lighthouse, ZAP, Deploy-Workflows |
| 16 | Launch | 🟡 bereit | Kimi K-NN | Lighthouse CI, ZAP, Staging/Prod Deploy, 48h Monitoring |
| 17 | Hermes Trust (Waves 0–8) | ✅ done | Kimi K-2.6 | Dual-Mode Audit, DB-Persistenz, 5 Migrations |
| 18 | Demo-Readiness | ✅ done | Kimi K-2.6 | ELT_MODE, Demo-Personas, Stripe-Demo-Layer, DemoBanner |
| 19 | Pitch-Polish | ✅ done | Kimi K-2.6 | WalkthroughTour, Press-Kit, Pitch-Dashboard, Test-Card-Hint |

**Legende:** ✅ done | 🟢 grün | 🟡 läuft | 🔴 blocked | 🔄 kontinuierlich | ⬜ tbd

---

## 🔄 Letzte Aktion (Session 3 — 2026-04-30)

**Agent:** Kimi K-2.6 (3 parallele Workstreams)

**Was:**
1. **Codex** (`feature/phase-18-19-tests-and-prd-docs`): E2E demo-flow.spec.ts (8 Steps), Doppler-prd runbook, live-switch script, pitch-rehearsal script, README, ADR 0020
2. **Sonnet** (`feature/phase-18-demo-readiness`): ELT_MODE layer, EnvProvider + useElbMode, Stripe demo layer (8 mock accounts), DemoBanner, shop filtering by mode, mcp_audit_log table + dual-mode logger, demo persona seed, Sanity `isDemo`, ADR 0014 + 0018, unit tests
3. **GPT** (`feature/phase-19-pitch-polish`): Landing refinement (USP, CTA, sound toggle), WalkthroughTour (5 steps), PressKit page, Pitch dashboard (investor-gated), Stripe test card hint, i18n DE/EN, investor role migration, demo video script, ADR 0019

**Merge:** Codex → Sonnet → GPT nach `feature/phase-11-ai` (no-ff). Konflikte in `invoke/route.ts`, `layout.tsx`, `STATUS.md`, `packages/ui/src/index.ts` manuell gelöst.

**Ergebnis:** Typecheck grün, 41 Unit-Tests passing, E2E-Suite erweitert. Tag `v0.13.0-demo` annotiert + gepusht.

---

## 📦 Repository

- **Org:** DiggAiHH
- **Repo:** elbtronika
- **Branch:** `feature/phase-11-ai` @ `0a59f44`
- **Letzter Tag:** `v0.13.0-demo`
- **CI:** github.com/DiggAiHH/elbtronika/actions

---

## 📋 Was Lou heute manuell verifizieren kann (5 Min)

In VS Code in Repo-Root:
```bash
# Repo-Stand
git log --oneline -20
git status
git tag
ls apps/
ls packages/

# Was läuft schon?
pnpm dev        # läuft Next.js?
pnpm test       # gibt's Tests?
```

---

## ⚠️ Risiko-Register (heute)

| Risiko | Handlung | Prio |
|---|---|---|
| 5 Supabase-Migrations noch nicht auf dev gepusht | `pnpm supabase db push` ausführen | P0 |
| ~~Demo-Artwork-Bilder (8) fehlen noch~~ | ✅ Algorithmisch generiert (1024x1024px PNG) | Done |
| Stripe Test-Connected-Accounts (8) sind Platzhalter | Echte Stripe-Test-Account-IDs erstellen | P0 |
| Doppler dev: `ELT_MODE` + `MCP_AUDIT_DB` nicht gesetzt | Nach Migrations-Push konfigurieren | P1 |
| Supabase types.ts manuell gepatcht | Nach `db push` + `gen types` regenerieren | P1 |
| Drei Sessions schreiben gleichzeitig in selbe Files | Strikte Phase-Isolation — jede Session arbeitet nur in ihrem Verzeichnis-Scope | Mitigated |
| Merge-Konflikte | Sessions pushen zu Feature-Branches, nicht main | Mitigated |

---

## 🎯 Nächste Schritte (Empfehlung für Opus 4.7)

| Prio | Schritt | Owner |
|---|---|---|
| P0 | Supabase Migrations auf dev pushen (5 Files) | Opus/Sonnet |
| ~~P0~~ | ~~Demo-Artwork-Bilder generieren/beschaffen~~ | ✅ Kimi K-2.6 |
| P0 | Stripe Test-Connected-Account-IDs erstellen | Lou |
| P1 | Doppler dev: `ELT_MODE=demo`, `MCP_AUDIT_DB=true` | Opus/Sonnet |
| P1 | Supabase types regenerieren | Sonnet |
| P1 | Pitch-Termin mit Lee Hoops terminieren | Lou |
| P2 | Doppler prd: 22 ENV-Variablen füllen (post-Lee-OK) | Lou + Opus |
| P2 | Demo-Video (60–90s) produzieren | Lou |

---

## 📖 Plan-Referenz

- Master-Plan v1.0: `ELBTRONIKA_Architekturplan_v1.0.md`
- Aktive Version v1.1: `ELBTRONIKA_Architekturplan_v1.1.md`
- Opus-Handover: `OPUS_47_HANDOVER.md`
- Session 3 Kontext: `memory/context/session-3-knowledge.md`
- Copilot-Prompts: `COPILOT_PROMPTS.md`

---

## ✏️ Update-Konvention

Nach jedem abgeschlossenen Schritt:
1. Status-Spalte oben aktualisieren.
2. Datum oben unter "Letztes Update" setzen.
3. Kurze Notiz in entsprechende Zeile.

Beispiel:
```
| 1 | Repo & Tooling | ✅ done | Sonnet | pnpm monorepo, biome, husky, ci grün, tag v0.1.0 |
```
