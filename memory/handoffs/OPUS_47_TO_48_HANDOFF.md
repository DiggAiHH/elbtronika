# ELBTRONIKA — Opus 4.7 → 4.8 Handoff

> **Token-budget:** <2500 Wörter. Jede Zeile ist ground-truth. Wenn etwas unklar ist, lies die referenzierte Datei — nie raten.
> **Erstellt:** 2026-04-30 | **Branch:** `feature/phase-18-19-tests-and-prd-docs` @ `63d0f66`
> **Vorgänger:** Opus 4.6 (Sonnet 4.6 ground-truth) + Kimi K-NN Session 3 Merge

---

## ⚡ 10-Sekunden-Bootstrap (MACHE DIES ZUERST)

```bash
cd D:\Elbtronika\Elbtonika
git status                              # Branch prüfen
git log --oneline -3                    # HEAD verifizieren
pnpm.cmd install                        # Falls node_modules alt
pnpm.cmd --filter @elbtronika/web test  # 24 Tests sollten passen
```

**Wenn Tests failen:** Siehe §9 "Known Traps".

---

## 🔴 P0 — Was SOFORT passieren muss

| # | Task | Blocker | File / Command |
|---|---|---|---|
| 1 | **Tests wiederherstellen** | Context-Compaction hat 8 Test-Dateien gelöscht | `git show c4b3103:apps/web/__tests__/ui/demo-banner.test.tsx` etc. |
| 2 | **Lint-Fixes wiederherstellen** | 30+ Dateien zurückgesetzt | `git diff 66dd8da..c4b3103` zeigt was verloren ging |
| 3 | **Turbo OOM fixen** | `pnpm typecheck` crasht mit OOM | Siehe §8 |
| 4 | **STATUS.md aktualisieren** | Phase 18–19 fehlen | `STATUS.md` §1–3 ergänzen |

---

## 📊 Projekt-Status (2026-04-30, 23:02)

### Phasen-Ampel

| Phase | Status | Branch / Commit |
|---|---|---|
| 0–13 | ✅ done | `main` |
| 14–15 | ✅ done | Kimi K-NN, 104 Tests, Lighthouse, ZAP |
| 16 | ✅ bereit | Staging/Prod Deploys, 48h Monitoring |
| 17 | ✅ done | Hermes Trust Waves 0–8 implementiert |
| **18** | 🟡 **AKTIV** | Tests & PRD-Docs (Codex 5.3) |
| **19** | 🟡 **AKTIV** | Pre-Pitch-Cleanup (5 Sub-Sprints) |
| 20 | 🔵 geplant | Live-Switch (blocked on Lee-OK) |
| 21 | 🔵 geplant | Public Launch |

### Repository

```
Org:        DiggAiHH
Repo:       elbtronika
Branch:     feature/phase-18-19-tests-and-prd-docs
HEAD:       63d0f66
Base:       feature/phase-11-ai @ 66dd8da
Tag:        v0.13.0-demo
```

### Packages (14)

```
apps/web            Next.js 15.5, React 19, Tailwind v4, Three.js r184
apps/cms            Sanity Studio v4
packages/ui         Radix + CVA, barrel exports
packages/contracts  Zod schemas + Supabase types
packages/three      R3F v9, CanvasRoot, AdaptiveDpr
packages/audio      Spatial Audio, HLS.js v1.6
packages/ai         Claude SDK v0.39, prompts, rate-limiting
packages/agent      Hermes runtime, planner, memory
packages/flow       Audio-visual analysis, art-matching
packages/mcp        MCP servers (Supabase, Sanity, Stripe, Audio)
packages/payments   Stripe Connect, transfers, webhooks
packages/browser    Playwright CDP bridge
packages/config     tsconfig / biome shared
packages/sanity-studio  Sanity schemas
```

### Test-Status

| Suite | Count | Status |
|---|---|---|
| web unit | 24 passing | 4 Dateien |
| **web unit (verloren)** | **~38 Tests** | **8 Dateien aus Commit `c4b3103`** |
| E2E | 53 Szenarien | Playwright |
| audio | 16 | Vitest |
| ai | 8 | Vitest |
| payments | 6 | Vitest |
| mcp | 4 | Vitest |
| flow | 0 | — |
| three | 2 | Vitest |

**Verlorene Tests (wiederherstellen aus `c4b3103`):**
- `apps/web/__tests__/ui/demo-banner.test.tsx` (5)
- `apps/web/__tests__/ui/walkthrough-tour.test.tsx` (11)
- `apps/web/__tests__/landing/hero.test.tsx` (3)
- `apps/web/__tests__/env/mode.test.ts` (6)
- `apps/web/__tests__/shop/demo-mode.test.tsx` (3)
- `apps/web/__tests__/stripe/demo.test.ts` (4)
- `apps/web/__tests__/press/press-kit.test.tsx` (1)
- `apps/web/__tests__/pitch/dashboard.test.tsx` (1)
- `apps/web/__tests__/supabase/admin.test.ts` (4)

---

## 🛠️ Tool-Matrix (Wann benutzen, wann NICHT)

| Tool | Use-Case | Windows-Suffix | NIE |
|---|---|---|---|
| `pnpm.cmd install` | Deps installieren | `.cmd` | `npm install` |
| `pnpm.cmd <script>` | Scripts in package.json | `.cmd` | `pnpm` ohne `.cmd` |
| `npx.cmd <pkg>` | One-off binaries | `.cmd` | `npx` ohne `.cmd` |
| `biome check --write .` | Lint/Format fixen | — | ESLint/Prettier |
| `turbo run <task>` | Parallel builds/tests | — | Lerna/Nx |
| `git commit -F D:\msg.txt` | Multiline commits | — | `git commit -m "..."` mit Newlines |
| `fs.mkdirSync` | `[locale]` Dirs erstellen | Node.js | Shell `mkdir [locale]` |
| `vi.fn().mockImplementation` | Vitest mocks | — | `jest.mock` |

### Kritische Commands

```bash
# Full verification (vor jedem Push)
pnpm.cmd typecheck      # 14 Packages — crasht aktuell mit OOM
pnpm.cmd --filter @elbtronika/web test   # 24 Tests
pnpm.cmd lint           # 0 Errors, ~98 Warnings

# Package-spezifisch
pnpm.cmd --filter @elbtronika/ui test
pnpm.cmd --filter @elbtronika/payments test
pnpm.cmd --filter @elbtronika/ai test
```

---

## 🪟 Windows-Überlebensregeln (NICHT VERGESSEN)

1. **`.cmd` ist Pflicht:** `pnpm.cmd`, `npx.cmd`, `turbo.cmd`
2. **Semicolon chaining:** `cmd1; cmd2` — kein `&&` in PowerShell
3. **Multiline commits:** `git commit -F D:\msg.txt` — nie `-m` mit `
`
4. **Bracket dirs:** `fs.mkdirSync("app/[locale]/shop")` — nie Shell `mkdir`
5. **Biome:** `npx.cmd biome check --write .` — funktioniert zuverlässig
6. **Playwright Canvas:** `drawImage(canvas, ...)` auf selbem Canvas = schwarze Bilder. Fix: `browser.newContext()` pro Bild

---

## 🧠 Session-Lektionen (Ground Truth)

### Was funktioniert ✅

| Pattern | Ergebnis |
|---|---|
| `class MockS3Client {}` statt `vi.fn(function(){})` | Upload-Tests grün |
| `key={step.title}` statt `key={i}` | Biome `noArrayIndexKey` zufrieden |
| `// biome-ignore lint/<rule>: <reason>` | Suppresses Lint-Errors sauber |
| `type="button"` auf allen `<button>` | a11y Errors eliminiert |
| `<nav>` statt `<div aria-label="...">` | a11y `useAriaPropsSupportedByRole` fixed |
| `htmlFor` + `id` auf Label/Input Paaren | `noLabelWithoutControl` fixed |
| `<title>` in SVGs | `noSvgWithoutTitle` fixed |

### Was FAILT ❌ (NIE WIEDER)

| # | Anti-Pattern | Warum | Fix |
|---|---|---|---|
| E1 | `// biome-ignore` als JS-Comment in JSX Return | Biome parsed es nicht; `suppressions/unused` | JSX-Comment `{/* ... */}` oder vor dem Element |
| E2 | `key={\`step-${i}\`}` | Biome erkennt trotzdem `i` als Source | `key={step.title}` oder `key={v}` |
| E3 | `vi.fn(function () { return {}; })` als Konstruktor | Arrow-Function-Erzeugung intern | `class MockS3Client {}` |
| E4 | `biome check --write --unsafe` auf großen Packages | Formatiert Code um, der dann Type-Fehler hat | `--write` (safe) first, dann manuell |
| E5 | `pnpm typecheck` mit Turbo parallel | OOM auf 12+ Packages gleichzeitig | `--concurrency=2` oder sequentiell |
| E6 | `process.env.VAR!` ohne Prüfung | Biome `noNonNullAssertion` | `const v = process.env.VAR; if (!v) throw...` oder `// biome-ignore` |
| E7 | `drawImage(canvas, ...)` auf selbem Canvas | Playwright Canvas Tainting = schwarze Bilder | `browser.newContext()` pro Bild |
| E8 | Barrel files (`index.ts`) exportieren nicht alles | Vitest `is not exported under conditions ["node"]` | Alle Komponenten in `packages/ui/src/index.ts` exportieren |
| E9 | `jest-dom` matchers in Vitest | Package nicht im Workspace | Plain Vitest matchers (`toBeTruthy`, `toBeNull`) |
| E10 | Supabase CLI via npm (`supabase ^2.96.0`) | Kein Windows binary im Package | `winget install Supabase.CLI` |
| E11 | Doppler dev ENV unvollständig | `ELT_MODE`, `MCP_AUDIT_DB` fehlen | `doppler secrets set ELT_MODE=demo MCP_AUDIT_DB=true` |
| E12 | `git commit` ohne `-F` bei Multiline | PowerShell bricht ab | `git commit -F D:\msg.txt` |

### Was schockierend war 😱

1. **Context Compaction löscht Dateien.** 62 Unit Tests und 30+ Lint-Fixes wurden zwischen Sessions entfernt. Immer `git add && git commit` nach jeder signifikanten Änderung.
2. **Biome `noConsole` ist `"warn"` aber liefert Exit-Code 1.** Die Pipeline `pnpm lint` failt wegen Warnings, nicht Errors. Entweder `--no-error-on-warnings` oder `noConsole: "off"`.
3. **Turbo parallel typecheck = OOM.** 14 `tsc` Prozesse gleichzeitig fressen >8GB RAM. `concurrency` in `turbo.json` limitieren.
4. **`c4b3103` existiert in Git-History aber nicht im aktuellen Branch.** Tests wurden committed aber durch Merge/Rebase verloren. `git cherry-pick c4b3103` könnte sie recoveren.

---

## 🔧 Opsidian-Struktur (Knowledge Map)

```
[[ELBTRONIKA_Status]] → [[Phasen_18_19]] → [[Tests_Wiederherstellen]]
    ↓
[[Hermes_Trust]] → [[MCP_Audit]] → [[Agent_Tasks]]
    ↓
[[Demo_Mode]] → [[Stripe_Test]] → [[Doppler_Setup]]
    ↓
[[Windows_Rules]] → [[Biome_Config]] → [[Turbo_OOM]]
```

**Key Files (immer aktuell halten):**
- `STATUS.md` — Ampel-Status aller Phasen
- `AGENTS.md` — Bootstrap-Guide für AI-Agenten
- `TASKS.md` — Aktive Arbeitspakete
- `ELBTRONIKA_Architekturplan_v1.3.md` — Phasen 1–22
- `engineering-harness/PRE_FLIGHT_PROTOCOL.md` — 17-Section Agent-Bibel
- `engineering-harness/HERMES_TRUST_HARNESS.md` — Trust Boundaries
- `OPUS_48_HANDOFF_PROMPT.md` — Copy-paste ready für Claude CoWork

---

## 🎯 Nächste Prompt-Struktur für Opus 4.8

```markdown
# Opus 4.8 — Bootstrap

1. Lies `STATUS.md`, `AGENTS.md`, `memory/handoffs/OPUS_47_TO_48_HANDOFF.md`
2. Branch: `feature/phase-18-19-tests-and-prd-docs` @ `63d0f66`
3. Führe `pnpm.cmd --filter @elbtronika/web test` aus → 24 Tests müssen passen
4. Führe `git show c4b3103 --name-only` aus → Liste der verlorenen Tests

# Job 1 — Tests wiederherstellen (P0)
- Cherry-pick oder manuell recover: 8 Test-Dateien aus `c4b3103`
- Ziel: 62+ Unit Tests passing

# Job 2 — Lint grün machen (P1)
- Option A: `biome.json` → `noConsole: "off"` (schnell)
- Option B: Alle `console.*` durch Logger ersetzen (sauber, aber mehr Arbeit)
- Ziel: `pnpm lint` Exit-Code 0

# Job 3 — Turbo OOM fixen (P1)
- `turbo.json` → `typecheck` pipeline: `concurrency: 2` oder `env: [NODE_OPTIONS]`
- Alternativ: `pnpm typecheck` sequentiell wrapper script

# Job 4 — STATUS.md aktualisieren (P2)
- Phase 18 + 19 als 🟡 markieren
- Verlorene Arbeit dokumentieren
- Nächste Schritte für Lou definieren

# Abschluss
- `git add -A && git commit -F D:\msg.txt && git push`
- Aktualisiere `memory/handoffs/OPUS_48_HANDOFF.md`
```

---

## 📎 Referenzen

- Plan: `ELBTRONIKA_Architekturplan_v1.3.md` (197 Zeilen, Phasen 1–22)
- Protocol: `engineering-harness/PRE_FLIGHT_PROTOCOL.md` (1050+ Zeilen, 17 Sections)
- Trust: `engineering-harness/HERMES_TRUST_HARNESS.md` (Waves 0–8)
- Handoff: `OPUS_48_HANDOFF_PROMPT.md` (177 Zeilen, copy-paste ready)
- Scripts: `scripts/phase-20-cleanup.ps1`, `scripts/install-dev-tools.ps1`

---

> **Letzte Worte:** Committe früh, committe oft. Die Context Compaction ist gnadenlos. Wenn etwas grün ist, sofort in Git sichern.
