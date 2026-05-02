# ELBTRONIKA – Architektur- und Ausführungsplan v1.4

> **Stand:** 2026-04-30 (post Opus-4.8-Recovery + Session-3-GapFill)
> **Vorgänger:** v1.0 → v1.1 → v1.2 → v1.3 (alle als Audit-Trail gültig, v1.3 ist abgelöst)
> **Aktueller Branch:** `feature/phase-18-19-tests-and-prd-docs`
> **Status:** PLAN — verfasst von Opus 4.7 nach Lou's Handoff. Kein Produktiv-Code, nur Plan + Merge-Sequenz + Agent-Prompts.
> **Begleitdokumente:** `engineering-harness/ULTRAPLAN_AGENT_PREFLIGHT.md`, `engineering-harness/PRE_FLIGHT_PROTOCOL.md`, `memory/handoffs/KIMI_SESSION_3_HANDOFF.md`, `memory/handoffs/OPUS_48_HANDOFF.md`, `memory/OPSIDIAN_MEMORY.md`, `PLAN_SESSION_3_GAPFILL.md`

---

## Changelog v1.3 → v1.4

| Aspekt | v1.3 | v1.4 |
|---|---|---|
| Phase 18 / 19 Naming | "Demo-Readiness" / "Pitch-Polish" (Kimi-Stand) | **Phase 18+19 wurden de-facto durch Opus-4.8-Recovery überschrieben:** "Unit Tests Recovery" / "Lint & Tooling Health" — die Demo/Pitch-Inhalte sind als Sub-Sprints in den Branches |
| Branch-Stand | drei sub-branches geplant | **drei sub-branches existieren + GPT-Drift dokumentiert (siehe §2)** |
| Test-Status | "41 Unit-Tests passing" | **62 Tests in 13 Suites recovered nach Context-Compaction-Verlust** |
| Lint | offen | **lint green nach biome-rule-Relaxation** |
| Turbo-Build | OOM-Risiko | **`turbo run typecheck --concurrency=2` als Fix** |
| Phase 20 (Pre-Pitch-Cleanup) | grob skizziert | **konkrete Merge-Sequenz + verbleibende Blocker (§3)** |
| GPT-Branch-Drift | nicht erkannt | **GPT-Pages auf Codex-Branch gelandet; Merge-Strategie reagiert (§4)** |
| ADR-Index | 0001-0020 | **0001-0022 (0021 profile-pages, 0022 modes-doppler)** |
| Active Plan-File | v1.3 | **v1.4 ist aktiv; v1.3 wird zum Audit-Trail** |

---

## 1. Aktuelle Phasen-Realität (Stand 30.04.2026 abend)

| # | Titel | Stand | Branch | Notiz |
|---|---|---|---|---|
| 1-13 | Build (Repo bis Compliance) | ✅ done-on-main / branch-done | main + `feature/phase-11-ai` | Alle in Tag-Range `v0.1.0`–`v0.12.0` |
| 14 | Optimization | ✅ done | — | Kimi K-NN |
| 15 | Testing & QA (Kimi-Pyramide) | ✅ done | — | 104 Tests (Kimi-Stand) |
| 16 | Launch-Prep | 🟡 ready | — | Lighthouse CI, ZAP, Deploy-Workflows |
| 17 | Hermes Trust (Waves 0–8) | ✅ done | feature/phase-11-ai | Sonnet 4.6 |
| 18 | **Unit Tests Recovery + Demo-Readiness** | 🟡 in progress | drei sub-branches | Opus 4.8 hat 62 Tests recovered, Demo-Layer auf Sonnet-Branch |
| 19 | **Lint & Tooling Health + Pitch-Polish** | 🟡 in progress | drei sub-branches | Opus 4.8 lint-green, Pitch-Inhalte auf GPT-Branch + teilweise auf Codex-Branch |
| **20** | **Pre-Pitch-Cleanup + Merge-Konsolidierung** | ⬜ tbd | — | **NEUE TOP-PRIORITÄT** (§3) |
| 21 | Live-Switch (post-Lee-OK) | 🔒 blocked | — | 15-Min-Operation, vorbereitet |
| 22 | Public Launch | 🔒 blocked | — | nach 21 |
| 23+ | Post-Launch-Backlog | — | — | Audit-Dashboard, Multi-Cart, NFT, Vinyl, Live-Vernissage |

---

## 2. Branch- und Merge-Map (Reality-Check)

### 2.1 Drei aktive Sub-Branches

```
main (v0.5.0)
  └── feature/phase-11-ai (v0.13.0-demo, integration target)
        ├── feature/phase-18-19-tests-and-prd-docs ← Codex 5.3 + Opus 4.8 + GPT-Drift
        │     · 62 tests, 13 suites
        │     · runbooks (pitch-rehearsal, doppler-prd-setup, live-switch)
        │     · scripts/validate-doppler-prd.ps1 + .sh
        │     · README windows-friendly
        │     · ADR 0022 (modes + Doppler)
        │     · ULTRAPLAN_AGENT_PREFLIGHT.md
        │     · ⚠️ GPT-Drift: press/page.tsx, pitch/page.tsx, checkout/page.tsx,
        │       real dashboard tests, press tests, i18n message additions
        │
        ├── feature/phase-18-demo-readiness ← Sonnet 4.6
        │     · env.ts mit ELT_MODE
        │     · Stripe demo layer (mock accounts)
        │     · MCP audit helper
        │     · DemoBanner + Provider + useElbMode
        │     · service-role admin client
        │     · shop demo/live/staging filtering
        │     · demo seed + asset stubs
        │     · admin negative tests
        │
        └── feature/phase-19-pitch-polish ← GPT 5.4
              · WalkthroughTour
              · InvestorWelcomeModal
              · Landing-Page
              · demo video script
              · ADR 0019
```

### 2.2 GPT-Branch-Drift (kritisch)

**Was passiert ist:** Während Session-3-GapFill landeten einige UI-Routes (press, pitch, checkout) und Tests **auf dem Codex-Branch** statt auf `feature/phase-19-pitch-polish`. Das ist Drift, der bei naivem Merge entweder doppelt oder verloren geht.

**Affected files auf Codex-Branch (gehören semantisch zu GPT):**
- `apps/web/app/[locale]/press/page.tsx`
- `apps/web/app/[locale]/pitch/page.tsx`
- `apps/web/app/[locale]/(checkout)/page.tsx`
- `apps/web/__tests__/press/*.test.tsx` (real dashboard + press tests)
- `apps/web/__tests__/pitch/*.test.tsx`
- i18n additions in `apps/web/messages/de.json` + `en.json`

**Konsequenz für Merge-Reihenfolge:** GPT-Branch wird **nicht** als blanker Merge in Phase 20 reingenommen — er muss mit dem Codex-Branch reconciled werden. Siehe §4.

### 2.3 Tag-Lage
- `v0.13.0-demo` auf `feature/phase-11-ai` HEAD
- Auf den Sub-Branches: keine neuen Tags, sollten beim Merge-Konsolidierungs-Sprint (Phase 20) erst gesetzt werden
- Tag-Drift-Cleanup (v0.9.0 doppelt, v0.12.0 vor v0.11.0): bei Final-Merge zu `main`

---

## 3. Phase 20 — Pre-Pitch-Cleanup & Merge-Konsolidierung (NEUE TOP-PRIORITÄT)

### 3.1 Sub-Sprint 20.A — Codex-Branch Cleanup
**Owner:** Codex 5.3 (oder Sonnet als Fallback, falls Codex-Quota leer)
**Branch:** `feature/phase-20.a-codex-cleanup` (von Codex-Branch abgezweigt)

**Tasks:**
1. **Pre-existing TS-Error fixen** — `packages/three/src/components/Room.tsx:66`
2. **Console-Cleanup** — `console.*`-Calls durch `@/src/lib/logger`-Modul ersetzen (Logger neu erstellen falls nicht vorhanden)
3. **noBarrelFile-Warnings** — Barrel-Files in `packages/ui/src/index.ts` etc. nach Biome-Konvention auflösen oder explizit ignorieren
4. **noExplicitAny** — alle `as any` durch korrekte Types aus regenerierten Supabase-Types ersetzen
5. **Dependabot moderate vulnerabilities** — `pnpm.cmd audit --fix` und manueller Review
6. **GPT-Drift entscheiden:** entweder
   - (a) GPT-Drift-Files auf Codex-Branch belassen + Codex-Branch zu main als "merged" tag
   - (b) GPT-Drift-Files auf GPT-Branch verschieben via `git cherry-pick` und vom Codex-Branch entfernen

**Empfehlung Lou + Opus:** **Option (a)** — die GPT-Drift bleibt auf dem Codex-Branch, weil sie dort bereits funktional getestet ist. GPT-Branch wird in Phase 20.C konsolidiert oder als "subset" gemerged.

### 3.2 Sub-Sprint 20.B — Sonnet-Branch Live-Switch-Vorbereitung
**Owner:** Sonnet 4.6
**Branch:** `feature/phase-20.b-sonnet-finalize` (von Sonnet-Branch abgezweigt)

**Tasks:**
1. **Supabase Migrations push** — 5 Files (`20260430_*.sql`) auf Doppler dev applizieren
2. **Doppler dev ENV-Setup** — `ELT_MODE=demo`, `MCP_AUDIT_DB=true`
3. **Supabase types regenerieren** — alle `as any`-Casts entfernen
4. **mcp_audit_log smoke-test** — eine MCP-Invocation triggert DB-Insert, verify SQL-Query
5. **Run-Log finalisiert** — `memory/runs/2026-05-01_Sonnet_4.6-Run01.md` (5 Zeilen)

### 3.3 Sub-Sprint 20.C — GPT-Branch Pitch-Polish Final
**Owner:** GPT 5.4
**Branch:** `feature/phase-20.c-gpt-pitch-final` (von GPT-Branch abgezweigt)

**Tasks:**
1. **Drift-Reconcile** — prüfen welche Files auf GPT-Branch noch fehlen vs. Codex-Branch (Diff-Vergleich)
2. **Falls Files duplicate:** auf GPT-Branch löschen, Codex-Version ist Source of Truth
3. **Falls Files unique zu GPT-Branch:** beibehalten, sauber committen
4. **InvestorWelcomeModal + WalkthroughTour i18n-check** — DE/EN-Strings vollständig
5. **Demo-Video-Skript review** — Lou's Approval einholen oder als optional markieren
6. **Run-Log finalisiert** — `memory/runs/2026-05-01_GPT_5.4-Run01.md`

### 3.4 Merge-Sequenz Phase 20

**Reihenfolge (kritisch, sequentiell):**

```
Schritt 1: Sub-Sprint 20.A (Codex Cleanup) → PR gegen feature/phase-11-ai → MERGE
           Tag: v0.14.0-cleanup

Schritt 2: Sub-Sprint 20.B (Sonnet Finalize) → PR gegen feature/phase-11-ai → MERGE
           Migrations sind dann auf dev appliziert
           Tag: v0.14.1-infra

Schritt 3: Sub-Sprint 20.C (GPT Final) → PR gegen feature/phase-11-ai → MERGE
           GPT-Drift bereinigt
           Tag: v0.14.2-pitch

Schritt 4: feature/phase-11-ai → PR gegen main
           Final-Tag: v0.14.0-prepitch (oder v1.0.0-rc1 falls Lou aggressiv tagging will)

Schritt 5: Pitch-Probelauf intern (Lou + Opus)
Schritt 6: Pitch zu Lee Hoops
Schritt 7: Bei Lee-OK → Phase 21 Live-Switch
```

### 3.5 Verification-Ladder (vor jedem Merge)

```
1. Engster Slice:    pnpm.cmd --filter @elbtronika/<package> typecheck
2. Engster Slice:    pnpm.cmd --filter @elbtronika/<package> test
3. Targeted Biome:   node_modules\.bin\biome.cmd check <changed-files>
4. Repo-typecheck:   pnpm.cmd typecheck (mit --concurrency=2!)
5. Repo-lint:        pnpm.cmd lint (final gate, sollte 0 sein nach 20.A)
```

Erst nach allen 5 grün → PR-Merge.

### 3.6 Phase 20 DoD

- [ ] `Room.tsx:66` Type-Error gefixt
- [ ] `console.*` durch logger ersetzt (oder bewusst belassen mit Begründung)
- [ ] `noBarrelFile`-Warnings auf 0
- [ ] `noExplicitAny`-Warnings auf 0
- [ ] Dependabot moderate vulnerabilities adressiert
- [ ] 5 Supabase-Migrations applied auf dev
- [ ] Doppler dev: `ELT_MODE`, `MCP_AUDIT_DB` gesetzt
- [ ] Supabase types regeneriert, kein `as any` mehr
- [ ] GPT-Drift entschieden + reconciled
- [ ] Alle drei Sub-Branches in `feature/phase-11-ai` gemerged
- [ ] `feature/phase-11-ai` in `main` gemerged
- [ ] Tag `v0.14.0-prepitch` (oder Lou-Wunsch) gesetzt
- [ ] Pitch-Probelauf intern durchgespielt

---

## 4. Remaining Blockers (außer Phase 20)

| # | Blocker | Owner | Phase | Priorität |
|---|---|---|---|---|
| B1 | `packages/three/src/components/Room.tsx:66` Type-Error | Codex (20.A) | 20 | P0 |
| B2 | `console.*` ohne Logger | Codex (20.A) | 20 | P1 |
| B3 | `noBarrelFile`-Warnings | Codex (20.A) | 20 | P2 |
| B4 | Dependabot moderate vulnerabilities | Codex (20.A) | 20 | P1 |
| B5 | 5 Supabase Migrations not applied to dev | Sonnet (20.B) | 20 | P0 |
| B6 | Doppler dev ENV unvollständig | Sonnet (20.B) | 20 | P1 |
| B7 | Demo-Asset-Lizenzen nicht final geklärt | Lou | 18/19 | P1 |
| B8 | 8 Stripe Test-Connected-Accounts noch Platzhalter | Lou | 18 | P0 |
| B9 | Doppler `prd` ENV-Setup ausstehend | Lou + Opus (gemeinsam, post-Phase-20) | 21 | P2 |
| B10 | Stripe-KYC nicht durch | Lou | 0 / 21 | P2 (post-Lee-OK) |
| B11 | Pitch-Termin mit Lee Hoops nicht terminiert | Lou | 19.9 | P0 |

---

## 5. Next-Agent-Prompts (ready-to-paste)

### 5.1 Sonnet 4.6 → Sub-Sprint 20.B (Sonnet Live-Switch-Finalize)

```
=== SONNET 4.6 :: PHASE 20.B :: SONNET FINALIZE ===

KONTEXT (PFLICHT-LESE-SEQUENZ):
1. STATUS.md
2. ELBTRONIKA_Architekturplan_v1.4.md (insb. §3.2)
3. engineering-harness/ULTRAPLAN_AGENT_PREFLIGHT.md
4. engineering-harness/PRE_FLIGHT_PROTOCOL.md
5. memory/handoffs/OPUS_48_HANDOFF.md
6. supabase/migrations/20260430_*.sql (5 Files)

GIT-GATE:
> git status -sb
> git branch --show-current
> git log --oneline -5

BRANCHING:
> git checkout feature/phase-18-demo-readiness
> git pull
> git checkout -b feature/phase-20.b-sonnet-finalize

TASKS:
1. Supabase Migrations push gegen Doppler dev:
   > doppler run --config dev -- pnpm.cmd supabase db push
   > doppler run --config dev -- pnpm.cmd supabase migration list
   Smoke-Test pro Migration (insert + select round-trip)

2. Doppler dev ENV-Setup:
   > doppler secrets set ELT_MODE=demo --config dev
   > doppler secrets set MCP_AUDIT_DB=true --config dev

3. Supabase types regenerieren:
   > doppler run --config dev -- pnpm.cmd supabase gen types typescript \
       --project-id <PROJECT_REF> > packages/contracts/src/supabase/types.ts
   Alle `as any`-Casts entfernen (grep + ersetzen)

4. mcp_audit_log Smoke-Test:
   > MCP-Invocation triggern (z.B. via /api/mcp/invoke mit Test-Tool)
   > SQL-Query: select * from mcp_audit_log limit 1
   Verify: Row vorhanden, status='ok', duration_ms vorhanden

5. SR-Key Negativ-Test:
   apps/web/__tests__/admin/sr-key.test.ts
   Erwartung: ohne SR-Key → 500 mit "service-role required"

DOD:
- 5 Migrations applied + smoke-tested
- Doppler ENV verifiziert
- types.ts regeneriert, 0 `as any`
- pnpm.cmd --filter @elbtronika/contracts typecheck grün
- pnpm.cmd --filter @elbtronika/web typecheck grün
- Run-Log: memory/runs/2026-05-01_Sonnet_4.6-Run01.md (5 Zeilen exakt)
- Tag v0.14.1-infra vorbereitet (NICHT pushen ohne GO)
- PR feat/phase-20.b-sonnet-finalize gegen feature/phase-11-ai

KONFLIKT-PRÄVENTION:
- Exklusiv: supabase/migrations/, packages/contracts/src/supabase/types.ts,
  apps/web/src/lib/mcp/audit.ts, apps/web/src/lib/supabase/admin.ts
- NICHT anfassen: apps/web/app/, packages/three, packages/audio, packages/ui

WORKFLOW:
1. Run-Log starten
2. Sub-Plan TodoList
3. STOP, "GO 20.B" abwarten
4. Autonom bis DoD
=== ENDE ===
```

### 5.2 Codex 5.3 → Sub-Sprint 20.A (Cleanup)

```
=== CODEX 5.3 :: PHASE 20.A :: CODEX CLEANUP ===

KONTEXT:
1. STATUS.md
2. ELBTRONIKA_Architekturplan_v1.4.md (insb. §3.1, §4)
3. engineering-harness/ULTRAPLAN_AGENT_PREFLIGHT.md
4. memory/handoffs/OPUS_48_HANDOFF.md (lint-green-Stand)
5. packages/three/src/components/Room.tsx (Zeile 66 Type-Error)

GIT-GATE:
> git status -sb
> git branch --show-current

BRANCHING:
> git checkout feature/phase-18-19-tests-and-prd-docs
> git pull
> git checkout -b feature/phase-20.a-codex-cleanup

TASKS:
1. Room.tsx:66 Type-Error fixen:
   - Read packages/three/src/components/Room.tsx
   - Fix nach Type-Inferenz oder explizitem Type-Cast (kein as any!)
   - Verify: pnpm.cmd --filter @elbtronika/three typecheck grün

2. Logger-Modul erstellen:
   - apps/web/src/lib/logger.ts (NEU)
   - exports: log.debug, log.info, log.warn, log.error
   - Production: NoOp für debug/info, Sentry für warn/error
   - Dev: console.* mit prefix
   - Replace alle console.* durch logger.* (grep + ersetzen)

3. noBarrelFile-Warnings:
   - packages/ui/src/index.ts: Barrel-Pattern auflösen oder mit Biome-ignore-Annotation explizit erlauben
   - Pro Komponente: direct import statt re-export
   - Wenn Barrel zwingend (für Public API): biome-Konfiguration anpassen mit Begründung

4. noExplicitAny entfernen:
   - grep -r "as any" apps/web/src packages/
   - Pro Cast: konkreten Type aus regenerierten Supabase-Types nutzen
   - (Sonnet pusht Migrations parallel — nach Sonnet-PR-Merge regenerierte Types nutzen)

5. Dependabot moderate Vulnerabilities:
   - pnpm.cmd audit
   - pnpm.cmd audit --fix
   - Bei Major-Bumps: manuell prüfen, ADR falls Breaking

6. GPT-Drift-Files prüfen:
   - Liste in §2.2 von v1.4 Plan
   - Sicherstellen dass die Files nicht versehentlich entfernt werden
   - Tests für press/pitch/checkout grün halten

DOD:
- Room.tsx:66 grün
- Logger-Modul live, console.* ersetzt
- noBarrelFile = 0
- noExplicitAny = 0
- Dependabot moderate = 0 (oder dokumentiert mit Risk-Acceptance)
- pnpm.cmd lint = 0 errors
- pnpm.cmd typecheck (mit --concurrency=2) grün
- 62 Tests bleiben grün
- ADR docs/adr/0023-cleanup-and-logger.md
- Run-Log: memory/runs/2026-05-01_Codex_5.3-Run01.md
- Tag v0.14.0-cleanup vorbereitet
- PR feat/phase-20.a-codex-cleanup gegen feature/phase-11-ai

KONFLIKT-PRÄVENTION:
- Exklusiv: packages/three/src/components/Room.tsx, apps/web/src/lib/logger.ts,
  packages/ui/src/index.ts, biome.json (Konfig-Updates), package.json (deps)
- NICHT anfassen: GPT-Drift-Files (press/, pitch/, checkout/) — die bleiben!
- NICHT anfassen: supabase/migrations/, types/ (Sonnet)

WORKFLOW:
1. Run-Log starten
2. Sub-Plan
3. STOP, "GO 20.A" abwarten
4. Autonom bis DoD
=== ENDE ===
```

### 5.3 GPT 5.4 → Sub-Sprint 20.C (Pitch Final)

```
=== GPT 5.4 :: PHASE 20.C :: PITCH FINAL ===

KONTEXT:
1. STATUS.md
2. ELBTRONIKA_Architekturplan_v1.4.md (insb. §3.3, §2.2 GPT-Drift)
3. engineering-harness/ULTRAPLAN_AGENT_PREFLIGHT.md
4. apps/web/app/[locale]/press/, /pitch/, /(checkout)/  (auf Codex-Branch!)
5. packages/ui/src/components/walkthrough-tour.tsx
6. packages/ui/src/components/investor-welcome-modal.tsx (falls vorhanden)

GIT-GATE:
> git status -sb
> git branch --show-current

BRANCHING:
> git checkout feature/phase-19-pitch-polish
> git pull
> git checkout -b feature/phase-20.c-gpt-pitch-final

TASKS:
1. Diff-Vergleich GPT-Branch vs Codex-Branch:
   > git diff feature/phase-18-19-tests-and-prd-docs..HEAD --stat
   Liste pro File: existiert nur hier / nur Codex / beide

2. Drift-Entscheidung pro File:
   - Datei existiert nur auf GPT-Branch UND ist sinnvoll → behalten
   - Datei existiert nur auf Codex-Branch UND betrifft Pitch (press/pitch/checkout) → NICHT auf GPT-Branch duplizieren, Codex-Version ist Source of Truth
   - Datei existiert auf beiden → diff prüfen, ggf. Codex-Version übernehmen, GPT-Version löschen

3. WalkthroughTour i18n vollständig:
   - apps/web/messages/de.json: alle WalkthroughTour-Strings
   - apps/web/messages/en.json: alle WalkthroughTour-Strings
   - Smoke-Test: pnpm.cmd --filter @elbtronika/web test -- __tests__/components/walkthrough-tour.test.tsx

4. InvestorWelcomeModal review:
   - i18n DE+EN
   - Auto-Show bei Erst-Login auf /pitch
   - Dismiss-Persistence in localStorage

5. Demo-Video-Skript:
   - docs/marketing/demo-video-script.md
   - Lou's Approval-Marker im File: status: draft | approved
   - Bis Approval: nicht als blockierend behandeln

DOD:
- GPT-Drift-Reconcile abgeschlossen, dokumentiert in PR-Description
- WalkthroughTour i18n DE+EN vollständig
- InvestorWelcomeModal grün
- Demo-Video-Skript final als draft (Lou approved separat)
- pnpm.cmd --filter @elbtronika/web test -- __tests__/components/ grün
- Run-Log: memory/runs/2026-05-01_GPT_5.4-Run01.md
- Tag v0.14.2-pitch vorbereitet
- PR feat/phase-20.c-gpt-pitch-final gegen feature/phase-11-ai

KONFLIKT-PRÄVENTION:
- Exklusiv: packages/ui/src/components/walkthrough-tour.tsx,
  packages/ui/src/components/investor-welcome-modal.tsx,
  apps/web/messages/, docs/marketing/
- NICHT anfassen: press/, pitch/, checkout/ Routes (Codex-Branch ist SoT für die)
- NICHT anfassen: supabase/, packages/three, packages/audio

WORKFLOW:
1. Run-Log starten
2. Sub-Plan + Drift-Diff zuerst
3. STOP, "GO 20.C" abwarten
4. Autonom bis DoD
=== ENDE ===
```

---

## 6. Lou's Action-Items parallel (kein Code)

| # | Item | ETA | Block für |
|---|---|---|---|
| L1 | Stripe Test-Connected-Accounts × 8 anlegen + IDs eintragen | 30 Min | Phase 18-Komplettierung |
| L2 | Pitch-Termin Lee Hoops terminieren | 15 Min | Phase 19.9 |
| L3 | Demo-Asset-Lizenzen final klären (8 PNGs) | 15 Min | rechtliche Saubereit |
| L4 | UG-Eintragung-Status mit Notar checken | läuft | Phase 21 |
| L5 | Stripe-KYC-Antrag stellen | 30 Min | Phase 21 |
| L6 | Domains sichern (.de, .com, .art) | 15 Min | parallel |
| L7 | Anwalt-Termin buchen (IT-Recht für AGB) | 15 Min | Phase 21 |
| L8 | Doppler `prd` ENV vorbereiten (Wert-Liste, nicht eintragen) | 30 Min | gemeinsam mit Opus post-Phase-20 |

---

## 7. Verification-Ladder (Pflicht für jeden Sub-Sprint)

```
Stufe 1 — Slice typecheck:
> pnpm.cmd --filter @elbtronika/<package> typecheck
Wenn rot: STOP, fix, repeat.

Stufe 2 — Slice tests:
> pnpm.cmd --filter @elbtronika/<package> test
Wenn rot: STOP, fix, repeat.

Stufe 3 — Targeted Biome:
> node_modules\.bin\biome.cmd check <changed-files>
Wenn rot: STOP, biome.cmd check --write, repeat.

Stufe 4 — Full typecheck:
> pnpm.cmd typecheck   (mit --concurrency=2 dank Turbo-OOM-Fix)
Wenn rot: prüfen ob fremder Branch rauscht. Falls ja: ignorieren, eigenen Slice grün.

Stufe 5 — Full lint:
> pnpm.cmd lint
Soll 0 errors haben (warnings ok). Final gate vor PR-Merge.

Erst nach allen 5 grün:
- Run-Log finalisieren
- Tag vorbereiten (NICHT pushen)
- PR draft erstellen
- An Lou reporten
```

---

## 8. Memory-Disziplin (verbindlich)

### 8.1 Run-Log-Format (Pflicht, exakt 5 Zeilen)

**Pfad:** `memory/runs/<YYYY-MM-DD>_<Agent>_<Model>-Run<NN>.md`

**Beispiele:**
- `memory/runs/2026-05-01_Sonnet_4.6-Run01.md`
- `memory/runs/2026-05-01_GPT_5.4-Run01.md`
- `memory/runs/2026-05-01_Codex_5.3-Run01.md`
- `memory/runs/2026-04-30_Opus_47-Run01.md` (dieser Plan!)

**Inhalt (exakt):**
```
[Prompt] <one-line user intent>
[Scope] <phase + owned files + forbidden files>
[Action] <what changed/researched/planned>
[Verify] <command + result, oder "not run: reason">
[Next] <one concrete next action or next agent prompt>
```

### 8.2 Memory-Index (`memory/OPSIDIAN_MEMORY.md`)

Nach Erstellung neuer Plan-/Handover-/Run-Files: Index updaten mit Zeile:
```
- 2026-04-30 — ELBTRONIKA_Architekturplan_v1.4.md — Opus 4.7 Plan-Update post-GapFill
```

---

## 9. Strategische Offen-Fragen v1.4

| # | Frage | Block für |
|---|---|---|
| I1 | Pitch-Termin Lee Hoops konkretes Datum? | Tempo Phase 20 |
| I2 | GPT-Drift Resolution: Option (a) Codex behält, oder (b) Cherry-Pick zurück zu GPT? | Phase 20.A + 20.C |
| I3 | Soll Tag-Drift-Cleanup (v0.9.0 doppelt etc.) jetzt bei Final-Merge oder erst bei v1.0.0 post-Lee? | Phase 20.4 / 21 |
| I4 | Doppler `prd`-Setup gemeinsame Chrome-MCP-Session: timing? | Phase 19.5 / 21 |
| I5 | Demo-Video produzieren oder verschieben auf post-Lee? | Phase 19/20.C |
| I6 | Phase-Nummerierung-Drift in STATUS.md: Phase 18="Unit Tests Recovery" widerspricht v1.3-Bedeutung "Demo-Readiness". Lou-Entscheidung: kanonische Bedeutung übernehmen oder Phase-Reihenfolge umnummerieren? | Plan v1.5 falls nötig |

---

## 10. Was bleibt von v1.0–v1.3 unverändert

- **Tech-Stack** (v1.0 §2): Next.js 15, React 19, Three.js r184, R3F v9, Supabase, Stripe Connect, Sanity v4, R2, Netlify, Anthropic
- **Repo-Struktur** (v1.0 §3)
- **Drei Architektur-Prinzipien:** Single Canvas Overlay, Privacy by Architecture, Deterministisches Payment-Splitting
- **Drei Modi** (v1.2 §1.2): `demo` | `staging` | `live` über `ELT_MODE`
- **Pitch-First-Strategie** (v1.2 §1.3)
- **Live-Switch-Choreografie** (v1.2 §4): 15-Min-Operation post-Lee-OK
- **Hermes Trust Boundaries** (v1.2 §2.5)
- **Engineering Harness Pre-Flight** (PRE_FLIGHT_PROTOCOL.md, ULTRAPLAN_AGENT_PREFLIGHT.md)

---

## 11. ADR-Index v1.4 (vollständig)

| ADR | Titel | Phase | Status |
|---|---|---|---|
| 0001-0013 | (siehe v1.3) | 1-13 | accepted |
| 0014 | Trust-Residuals (Audit-DB, SR-Key) | 17 | accepted |
| 0015 | Optimization-Strategy | 14 | accepted |
| 0016 | Test-Strategy | 15 | accepted |
| 0017 | Launch-Workflow | 16 | accepted |
| 0018 | Demo-Mode-Architecture | 18 | accepted |
| 0019 | Pitch-Architecture | 19 | accepted |
| 0020 | Modes-and-Doppler-Strategy (Codex Session 3) | 18-19 | accepted |
| 0021 | Profile-Pages | 20 | (geplant in 20.C, falls nötig) |
| 0022 | Modes-Doppler-prd-Strategy (überarbeitet Codex Session 3 Final) | 20 | accepted |
| 0023 | Cleanup-and-Logger | 20.A | (geplant, Codex schreibt) |

---

## 12. Schluss

Phase 20 ist der finale Pre-Pitch-Sprint. Sequenz: Sonnet-Finalize (B) → Codex-Cleanup (A) → GPT-Final (C) → Final-Merge zu main → Pitch-Probelauf → Pitch-Termin Lee.

Ziel: in 2-3 Tagen Pitch-Ready. Bei Lee-OK 15-Minuten-Live-Switch.

Plan v1.5 nur, wenn architektonische Drift während Phase 20 entsteht.

---

## 13. Run-Log-Eintrag (für diese Plan-Update-Session)

> Wird unter `memory/runs/2026-04-30_Opus_47-Run01.md` mit folgendem Inhalt angelegt:

```
[Prompt] Plan v1.4 update post Session-3-GapFill + Opus-4.8-Recovery
[Scope] Phase 20 sequencing; owned ELBTRONIKA_Architekturplan_v1.4.md; forbidden product code
[Action] Wrote Plan v1.4 with branch/merge map, GPT-drift handling, sub-sprints 20.A/B/C, agent prompts, blocker list
[Verify] Not run: plan doc only; existing typecheck status preserved per Opus-48 handoff
[Next] Lou approves v1.4 → starts Sonnet 20.B → then Codex 20.A → then GPT 20.C → final merge to main
```

---

**Ende v1.4.**
