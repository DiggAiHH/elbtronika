# Handoff — Kimi Session 3 → Opus

> **Datum:** 2026-04-30  
> **Von:** Kimi (System-Agent)  
> **An:** Opus 4.8+  
> **Session:** Phase 18/19/20 Gap-Fill + Pre-Flight Protocol v2  
> **Zeit:** ~4h  

---

## 1. Executive Summary

Diese Session war eine **Inventur + Gap-Fill** für alle drei Workstreams der Session 3 (Codex 5.3, Sonnet 4.6, GPT 5.4). Das Ergebnis: ~60% war bereits implementiert, 40% war Platzhalter/leer. Alle kritischen Lücken wurden geschlossen. Das Pre-Flight Protocol wurde auf v2 aktualisiert mit 5 neuen Fatal Error Patterns aus praktischer Erfahrung.

**Was Opus tun soll:**
1. Plan aktualisieren (ELBTRONIKA_Architekturplan_v1.2.md → v1.3)
2. Nächste Prompts für Code-Agents vorbereiten
3. Merge-Reihenfolge definieren (Codex → Sonnet → GPT → phase-11-ai)

---

## 2. Branch-Status (Endstand dieser Session)

### Branch A: `feature/phase-18-19-tests-and-prd-docs` (Codex 5.3)

| Metrik | Wert |
|--------|------|
| HEAD | `ed22688` — ULTRAPLAN Protocol v2 + Run-Logs 04-05 |
| Tests | 62 passing, 13 suites |
| Lint | Grün (exit 0) |

**Vollständig fertig:**
- ✅ E2E `demo-flow.spec.ts` (299 Zeilen, 9 Steps)
- ✅ 3 Runbooks: `pitch-rehearsal.md`, `doppler-prd-setup.md`, `live-switch-post-lee-ok.md`
- ✅ Validation-Skripte: `scripts/validate-doppler-prd.ps1` + `.sh`
- ✅ README mit Windows-`.cmd`-Suffixen
- ✅ ADR 0022 (`modes-and-prd-doppler.md`)
- ✅ Pre-Flight Protocol v2
- ✅ 5 Run-Logs

**Nichts mehr offen.**

---

### Branch B: `feature/phase-18-demo-readiness` (Sonnet 4.6)

| Metrik | Wert |
|--------|------|
| HEAD | `0798d42` — Demo-Assets + Admin Negativ-Test |
| Tests | 39 passing, 8 suites |

**Vollständig fertig:**
- ✅ `env.ts` — Zod, ELT_MODE, resetEnv(), getPublicEnv()
- ✅ `stripe/demo.ts` — 8 Mock-Accounts, withDemoAccounts(), isDemoMode()
- ✅ `mcp/audit.ts` — Dual-mode Logging (console + DB)
- ✅ `DemoBanner.tsx` — Demo/Staging/Live
- ✅ `EnvProvider.tsx` + `useElbMode()` Hook
- ✅ `admin.ts` — Service-Role Client
- ✅ Shop-Filter in `page.tsx`
- ✅ `mode.test.ts` (6 Tests), `demo.test.ts`, `demo-mode.test.tsx`
- ✅ `mcp_audit_log` Migration
- ✅ `seed-demo.sql` — 5 Artists, 3 DJs, 3 Rooms, 8 Artworks
- ✅ ADR 0014 + 0018
- ✅ `admin.test.ts` — 2 Negativ-Tests
- ✅ `docs/demo-assets-license.md`
- ✅ `public/demo/` Stubs (artworks, models, audio)

**Manuelle Schritte (nur Lou kann machen):**
- ⏸ A2: `pnpm supabase db push` gegen Dev-Project
- ⏸ A2: `pnpm supabase migration list` verifizieren
- ⏸ A3: Doppler `SUPABASE_SERVICE_ROLE_KEY` verifizieren
- ⏸ B5: Echte Demo-Assets generieren/lizenzieren (Bilder, Models, Audio)

---

### Branch C: `feature/phase-19-pitch-polish` (GPT 5.4)

| Metrik | Wert |
|--------|------|
| HEAD | `24ac306` — Video-Script + ADR 0019 |
| Tests | 31 passing, 7 suites (auf Branch) |
| **WICHTIG:** Gap-Fill Commit ist auf `feature/phase-18-19-tests-and-prd-docs` gelandet (`4157b8a`/`c7248e1`) |

**Vollständig fertig:**
- ✅ `WalkthroughTour.tsx` — 5 Steps, dismiss, i18n
- ✅ `InvestorWelcomeModal.tsx`
- ✅ Landing-Page (`page.tsx` — 327 Zeilen, Hero, Features, Stats, CTA)
- ✅ `demo-video-script.md`
- ✅ ADR 0019

**Gap-Fill ergänzt (auf falschem Branch — Merge beachten):**
- ✅ `press/page.tsx` — Vision, Numbers, Roadmap, Team, Video, Contact
- ✅ `pitch/page.tsx` — Role-Gating, Sales Chart, Pipeline, AI Cost, Audit Log, Test CTA
- ✅ `checkout/page.tsx` — Test-Card-Hint 4242 in Demo-Mode
- ✅ `dashboard.test.tsx` — 5 echte Tests
- ✅ `press-kit.test.tsx` — 5 echte Tests
- ✅ i18n Messages erweitert (press, pitch, checkout)

**Noch offen:**
- ⏸ C1: Landing-Page Sound-Toggle (nicht kritisch)
- ⏸ C6: Investor Magic-Link (braucht Lee's echte Mail)
- ⏸ C8: E2E-Tests für Press + Pitch (Playwright)

---

## 3. Neue Lektionen — Pre-Flight Protocol v2

**Die 5 neuen Fatal Error Patterns aus dieser Session:**

| # | Pattern | Lektion |
|---|---------|---------|
| 11 | **Branch-Verwirrung** | `git checkout` in PowerShell-Pipes wechselt manchmal nicht den Branch. Nach checkout IMMER `git branch --show-current` prüfen. |
| 12 | **Leere Verzeichnisse** | `Get-ChildItem` zeigt leere Verzeichnisse nicht immer an. `Test-Path` oder `-LiteralPath` verwenden. |
| 13 | **Vitest `@/` Alias** | `@/lib/...` funktioniert nicht in Tests. Relativen Pfad nutzen: `../../src/lib/...`. |
| 14 | **i18n Missing Keys** | `getTranslations` wirft, wenn Key fehlt. Messages in `de.json`/`en.json` VOR Seiten-Erstellung prüfen. |
| 15 | **Platzhalter-Tests** | Nie annehmen, dass etwas fertig ist, nur weil Datei existiert. `expect(true).toBe(true)` ist kein Test. |

**Vollständiges Protocol:** `engineering-harness/PRE_FLIGHT_PROTOCOL.md`

---

## 4. Offene Blocker (für Opus)

| # | Blocker | Wer fixt | Wann |
|---|---------|----------|------|
| 1 | TypeScript-Fehler `packages/three/src/components/Room.tsx:66` | Opus/Sonnet | Phase 20 |
| 2 | `console.*` Calls im Repo (~98) | Opus/Codex | Phase 20 (Logger-Modul) |
| 3 | `noBarrelFile` Warnings (~20) | Opus | Phase 20 |
| 4 | GitHub Dependabot: 2 moderate Vulnerabilities | Lou/Opus | Nach Merge |
| 5 | GPT Gap-Fill auf falschem Branch | Opus | Beim Merge beachten |
| 6 | Supabase-Migrations manuell applizieren | Lou | Vor Pitch |
| 7 | Doppler prd mit Demo-Werten befüllen | Lou + Opus | Phase 19.5 |

---

## 5. Merge-Reihenfolge (von Opus definieren)

Laut Plan: **Codex → Sonnet → GPT → `feature/phase-11-ai`**

Aber: Der GPT Gap-Fill ist auf Codex-Branch gelandet. Opus muss entscheiden:

**Option A — Safe Merge:**
1. Merge `feature/phase-18-19-tests-and-prd-docs` → `feature/phase-11-ai`
2. Merge `feature/phase-18-demo-readiness` → `feature/phase-11-ai`
3. Cherry-pick/cherry-merge Gap-Fill von Codex-Branch auf GPT-Branch
4. Merge `feature/phase-19-pitch-polish` → `feature/phase-11-ai`

**Option B — Alles in einem:**
1. Alle 3 Branches in `feature/phase-11-ai` mergen
2. Konflikte lösen (voraussichtlich minimale Überschneidungen)

**Empfehlung:** Option A — sicherer, besser nachvollziehbar.

---

## 6. Vorbereitete Prompts für Code-Agents

### Prompt für Codex (Tests + Cleanup)

```
=== CODEX :: SESSION 4 :: CLEANUP + E2E ===

BRANCH: feature/phase-20-cleanup (NEU, von feature/phase-11-ai)

AUFGABEN:
1. E2E-Tests für Press-Page und Pitch-Dashboard (Playwright)
   - apps/web/e2e/press.spec.ts
   - apps/web/e2e/pitch.spec.ts
2. console.* → Logger-Modul migrieren (optional, wenn Zeit)
3. noBarrelFile Warnings reduzieren
4. packages/three Room.tsx TypeScript-Fehler fixen
5. Lighthouse-Budget für Press + Pitch verifizieren

DOD:
- E2E Tests grün
- Typecheck grün (inkl. packages/three)
- ADR 0023 (cleanup) geschrieben
- Run-Log memory/runs/2026-05-XX_Codex_Run-XX.md
```

### Prompt für Sonnet (Phase 20 — Live-Switch)

```
=== SONNET :: SESSION 4 :: PHASE 20 LIVE-SWITCH ===

BRANCH: feature/phase-20-live-switch (NEU, von feature/phase-11-ai)

AUFGABEN:
1. ELT_MODE="live" Validierung verstärken
2. Sanity-Filter für Live-Mode (isDemo = false enforced)
3. Stripe Webhook-Handler für Live-Keys
4. Supabase RLS-Policy-Review für Live-Mode
5. Account-Deletion-Flow mit Service-Role testen

DOD:
- Live-Mode schaltet korrekt
- Demo-Content ist in Live-Mode unsichtbar
- Account-Deletion funktioniert mit SR-Key
- ADR 0024 (live-switch) geschrieben
- Run-Log memory/runs/2026-05-XX_Sonnet_Run-XX.md
```

### Prompt für GPT (Phase 19.5 — Pitch-Polish Final)

```
=== GPT :: SESSION 4 :: PHASE 19.5 PITCH-POLISH ===

BRANCH: feature/phase-19-5-pitch-final (NEU, von feature/phase-11-ai)

AUFGABEN:
1. Landing-Page Sound-Toggle implementieren
2. Investor Magic-Link-Flow (stub mit Lou's Test-Mail)
3. Lighthouse-Optimierung (Performance ≥ 90, a11y ≥ 95)
4. Pitch-Dashboard: echte Charts (Recharts oder Chart.js)
5. Demo-Video-Slot mit tatsächlichem Embed

DOD:
- Landing-Page hat funktionierenden Sound-Toggle
- Lighthouse-Budget gehalten
- Pitch-Dashboard Charts interaktiv
- ADR 0025 (pitch-polish-final) geschrieben
- Run-Log memory/runs/2026-05-XX_GPT_Run-XX.md
```

---

## 7. Dateien, die Opus lesen sollte

1. `STATUS.md` — aktueller Projektstatus
2. `ELBTRONIKA_Architekturplan_v1.2.md` — Plan für Session 3
3. `ELBTRONIKA_Architekturplan_v1.3.md` — falls existiert
4. `engineering-harness/PRE_FLIGHT_PROTOCOL.md` — v2
5. `memory/OPSIDIAN_MEMORY.md` — Index aller Handoffs
6. `CLAUDE.md` — Brand-Stil, Constraints
7. Dieser Handoff (`memory/handoffs/KIMI_SESSION_3_HANDOFF.md`)

---

## 8. Run-Log-Index

| Run | Datei | Inhalt |
|-----|-------|--------|
| Run-01 | `memory/runs/2026-04-30_Kimi_Run-01.md` | Phase 18/19 Recovery — 62 Tests |
| Run-02 | `memory/runs/2026-04-30_Kimi_Run-02.md` | Codex 5.3 — Validation-Skripte |
| Run-03 | `memory/runs/2026-04-30_Kimi_Run-03.md` | Sonnet 4.6 — env.ts + Migration + Seed |
| Run-04 | `memory/runs/2026-04-30_Kimi_Run-04.md` | GPT 5.4 Gap-Fill — Press + Pitch + Tests |
| Run-05 | `memory/runs/2026-04-30_Kimi_Run-05.md` | ULTRAPLAN Protocol v2 |

---

## 9. Wichtige Warnungen für Opus

1. **Branch-Verwirrung:** Nach `git checkout` IMMER `git branch --show-current` prüfen. PowerShell-Pipes sind unzuverlässig.
2. **Platzhalter-Tests:** Nie annehmen, dass etwas fertig ist, nur weil die Datei existiert. Immer den Inhalt lesen.
3. **i18n Keys:** Wenn neue Seiten mit `getTranslations` erstellt werden, müssen die Keys VORHER in `de.json`/`en.json` existieren.
4. **Vitest Alias:** `@/` funktioniert nicht in Tests. Relativen Pfad nutzen.
5. **Biome gezielt:** Für geänderte Dateien `node_modules\.bin\biome.cmd check <files>` statt `pnpm lint` (schneller, kein OOM).

---

*Handoff erstellt von Kimi (System-Agent) am 2026-04-30*  
*Session: Phase 18/19/20 Gap-Fill + Pre-Flight Protocol v2*
