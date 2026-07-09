# ELBTRONIKA — Optimization Report

**Datum:** 2026-06-26
**Branch:** `feature/phase-11-ai` (de-facto Trunk, working tree clean, voll zu origin gepusht)
**Scope:** Code-Cleanup, Performance, Tests, Branch-Konsolidierung

---

## TL;DR

Das Projekt ist in deutlich besserem Zustand als die Status-Docs behaupten. Die in `STATUS_INVENTUR.md` als **P0-offen** gelisteten Bugs sind alle längst gefixt. Was real noch ansteht, ist Aufräumarbeit und Launch-Hygiene — keine Substanzbaustellen.

**In dieser Session erledigt (verifiziert):**

- 27 rohe `console.*`-Calls in 17 API-Routes → zentrales `logger`-Modul migriert
- 1 echten Lint-Fehler (`noAssignInExpressions` im PRNG `mulberry32`) behoben
- Verifikation mit **Biome 2.4.13** (exakt gelockte Version): API-Ordner jetzt **0 Fehler**
- Realen Projektstand erfasst und dokumentiert

**Verifikations-Hinweis:** Voller `pnpm install` / `turbo build` / Vitest läuft in der Analyse-Umgebung nicht (nur Teil-Install, Windows-Repo). Verifiziert wurde per Biome + statischer Analyse + Git. Eine grüne **Build-/Test-Baseline bitte einmal lokal bestätigen** (`pnpm typecheck && pnpm test && pnpm build`).

---

## 1. Code-Cleanup & Konsistenz

### Erledigt

**console.\* → logger (17 Dateien, 27 Calls).** Alle server-seitigen API-Routes nutzen jetzt das bestehende `logger`-Modul (`@/src/lib/logger`) statt roher `console.*`. Strukturiertes Logging mit Level + Context-Objekt, in Prod als JSON. Muster:

```ts
// vorher
console.error("[flow/analyze] error:", message);
// nachher
logger.error("[flow/analyze] error", { error: message });
```

Imports von Biome korrekt einsortiert. `audit.ts` (bewusster Audit-Sink, schreibt absichtlich JSON nach `console.log`) wurde **nicht** angefasst.

**Lint-Fehler `mulberry32`.** `let t = (seed += 0x6d2b79f5)` → in zwei Statements gesplittet, verhaltensidentisch (Determinismus bleibt erhalten).

### Offen (priorisiert)

| # | Thema | Detail | Prio | Aufwand |
|---|---|---|---|---|
| 1 | `as any` bei Supabase | 4 Warnings (`flow/analyze`, `flow/match`). Saubere Lösung braucht generierte DB-Typen (`supabase gen types`) — derzeit P2-Blocker (CLI nicht installiert). **Nicht** mit `biome-ignore` zukleistern. | P2 | M |
| 2 | console.\* in `packages/` | ~30 Calls in `agent`, `audio`, `mcp`, `payments`, `three`. Kein gemeinsamer Logger über Paketgrenzen; `three`/`audio` laufen client-seitig. Braucht einen kleinen isomorphen Logger in `packages/config` o.ä. | P2 | M |
| 3 | console.\* in Client-Error-Boundaries | `error.tsx`-Dateien — `console.error` ist dort React-Konvention. Bewusst belassen, bis isomorpher Logger steht. | P3 | S |
| 4 | TODO/FIXME-Marker (7) | Alle real verlinkt auf **Phase 7/8** (Draco+KTX2-Kompression, HLS-Encoding, Mini-3D-Preview) bzw. Code-Gen-Platzhalter in `packages/browser`. Keine vergessenen Hacks — bewusst deferred. | P3 | — |

---

## 2. Performance & Bundle

### Befund: Konfiguration ist solide

`apps/web/next.config.ts` ist gut aufgesetzt:

- Bilder: AVIF + WebP, sinnvolle `deviceSizes`, 30-Tage Cache-TTL, R2-/Sanity-Remote-Patterns
- `compress: true`, `poweredByHeader: false`, `reactStrictMode: true`
- Umfangreiche CSP-Security-Header
- `@next/bundle-analyzer` verdrahtet
- **3D ist code-split**: `CanvasRoot` + `GalleryHUD` via `next/dynamic` lazy geladen → der schwere Three.js-Bundle blockt nicht das initiale Laden

### Echte Findings

| # | Thema | Detail | Prio |
|---|---|---|---|
| 1 | **Lighthouse-Reports sind leer** | Die JSONs in `lighthouse-reports/` (1. Mai) haben **alle Scores = 0/null** — der Lauf ist fehlgeschlagen. Die „Lighthouse-Baseline" in STATUS ist damit nicht belastbar. **Echten Lauf gegen laufenden Prod-Build nötig** (`pnpm --filter @elbtronika/web lighthouse`). | P1 |
| 2 | `output: "standalone"` deaktiviert | Auskommentiert wegen Windows-Symlink-Rechten. Für Container/Netlify-Build reaktivieren → kleineres Deployment-Artefakt. | P2 |
| 3 | `ssr`-Flag der 3D-Dynamic-Imports | `CanvasRoot`/`GalleryHUD` haben `loading: () => null`, aber kein `ssr: false`. Bei WebGPU/Three meist gewünscht. Kurz prüfen, ob `CanvasRoot.tsx` das intern via `"use client"` + `useEffect` abfängt — falls nicht, `ssr: false` setzen. | P2 |

---

## 3. Tests & Coverage

### Befund: breit abgedeckt

**32 Unit/Integration-Files + 6 E2E-Specs.** Keine `.skip`/`.only`. Letzter Commit zieht E2E auf **26/26 grün** (Playwright). Kritische Pfade haben Tests:

- AI: `override-guard`, `audit`, `client`, `prompts`, `rate-limit`
- API/Security: `trust-boundary-guards`, `assets/upload`, `webhooks/sanity`
- MCP: `guards`, `server`
- Payments/Stripe: `demo`, `schemas`, `transfers`, `webhook`
- Flow/Audio/3D: `match`, `SpatialAudioEngine`, `useProximityAudio`, `CanvasRoot`, `store`

### Gaps (priorisiert)

| # | Thema | Detail | Prio |
|---|---|---|---|
| 1 | Route-Level-Tests fehlen punktuell | `ai/describe`, `ai/explain`, `ai/recommend`, `checkout/session`, `stripe/connect` haben keinen direkten Route-Handler-Test (indirekt über Trust-Boundary-Suite teilabgedeckt). | P2 |
| 2 | `flow/analyze`-Route untested | Die deterministische Simulation der Route ist nicht direkt getestet (nur `packages/flow` Matching). | P2 |
| 3 | Keine Coverage-Schwelle | Kein `coverage.thresholds` in der Vitest-Config → Regressionen in der Abdeckung fallen nicht auf. Schwelle (z.B. 70 %) einziehen. | P3 |

---

## 4. Branches & Launch-Readiness

### Branch-Konsolidierung

`feature/phase-11-ai` ist der faktische Trunk (82 Commits vor `main`). **6 Branches sind vollständig darin enthalten (0 eigene Commits)** und damit gefahrlos löschbar:

| Branch | Eigene Commits | Status |
|---|---|---|
| `feature/phase-7-immersive` | 0 | ✅ löschbar |
| `feature/phase-8-audio` | 0 | ✅ löschbar |
| `feature/phase-18-demo-readiness` | 0 | ✅ löschbar |
| `feature/phase-18-19-tests-and-prd-docs` | 0 | ✅ löschbar |
| `feature/phase-19-pitch-polish` | 0 | ✅ löschbar |
| `copilot/worktree-2026-05-02...` | 0 | ⚠️ in Worktree — erst `git worktree remove` |

Cleanup-Befehle (sicheres `-d`, schlägt fehl falls doch unmerged):

```bash
git branch -d feature/phase-7-immersive feature/phase-8-audio \
  feature/phase-18-demo-readiness feature/phase-18-19-tests-and-prd-docs \
  feature/phase-19-pitch-polish

# Worktree-Branch zuerst Worktree entfernen:
git worktree remove Elbtonika.worktrees/copilot-worktree-2026-05-02T16-39-25
git branch -d copilot/worktree-2026-05-02T16-39-25
```

### `main` reconcilen (Achtung)

`main` hat **1 abweichenden Commit**, der **nicht** in `phase-11-ai` steckt:

```
3c5b021 feat: complete redesign + AI infrastructure + go-live prep
```

`main` liegt zugleich 82 Commits zurück. Bevor `phase-11-ai` zum neuen `main` wird, muss geklärt werden, ob der Inhalt von `3c5b021` schon (anders committed) in `phase-11-ai` enthalten ist oder echte Unikat-Arbeit ist:

```bash
git show 3c5b021 --stat       # was steckt drin?
git diff main feature/phase-11-ai -- <verdächtige Dateien>
```

Danach Trunk angleichen (z.B. `phase-11-ai` → `main` mergen/fast-forwarden). **Owner-Entscheidung — nicht automatisch ausgeführt.**

### Launch-Gap-Liste (aus STATUS_INVENTUR, noch gültig)

Diese Punkte brauchen Lou/manuell, nicht Agent:

- Supabase: `gen types` + `db push` (CLI installieren)
- Stripe: KYC-Onboarding abschließen (Phase 0)
- Echte Demo-Assets (Bilder/Audio/Models) freigeben — aktuell Platzhalter
- Investor-Magic-Link mit echter Email
- UG-Gründung / Rechtliches (Phase 0)

---

## Priorisierte nächste Schritte

1. **P1** — Lokale grüne Baseline bestätigen: `pnpm typecheck && pnpm test && pnpm build`
2. **P1** — Echten Lighthouse-Lauf gegen Prod-Build (alte Reports sind leer)
3. **P1** — `main` vs. `phase-11-ai` reconcilen, dann 6 Redundanz-Branches löschen
4. **P2** — Supabase-Typen generieren → die 4 `as any` sauber typisieren
5. **P2** — Isomorpher Logger in `packages/`, dann restliche `console.*` migrieren
6. **P2** — `output: standalone` + `ssr: false`-Review; Route-Level-Tests ergänzen
7. **P3** — Coverage-Schwelle in Vitest; Phase-7/8-TODOs einplanen

---

*Konkrete Code-Änderungen dieser Session liegen committet-bereit im working tree (`git diff`). Reine Cleanup-/Lint-Arbeit, kein Verhaltenswechsel.*
