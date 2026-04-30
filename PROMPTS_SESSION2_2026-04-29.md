# ELBTRONIKA – Copilot Prompt Pack · Session 2

> **Datum:** 2026-04-29 (zur Verwendung nach Copilot-Reset am 04.05.2026 oder sofort, falls noch Quota da)
> **Aktueller Repo-Stand (verifiziert):** Branch `feature/phase-7-immersive` HEAD `a7daef2`, tag `v0.7.0`. Main hängt auf `17d91aa` (`v0.5.0`). Draft-PR #1 offen. Lokaler Shop-WIP uncommitted.
> **Prinzipien dieser Session:** autonom nach `GO`, Windows-CLI (`pnpm.cmd`), 5-Zeilen-Run-Log Pflicht, engster testbarer Slice statt Monorepo-Typecheck.

---

## Globale Korrekturen vs. Session 1

Folgende Drift-Punkte sind in jedem Prompt unten verbaut – nicht ignorieren:

| Punkt | Alt (Session 1) | Neu (Session 2) |
|---|---|---|
| Plan-Files | `ELBTRONIKA_Architekturplan_v1.0.md` | `ELBTRONIKA_Architekturplan_v1.md` + `_v1.1.md` |
| Shell | `pnpm`, `npx` | `pnpm.cmd`, `npx.cmd` (Windows) |
| Workflow | Strikt STOP/GO bei jedem Schritt | STOP nach Sub-Plan, danach **autonom** bis Phase-DoD |
| Validierung | Repo-weiter Typecheck | Engster testbarer Slice zuerst (`--filter` + spezifische Tests) |
| Run-Log | Optional | Pflicht: `memory/runs/2026-04-29_<MODEL>.md`, max 5 Zeilen pro Prompt |
| Branch-Gate | Implizit | Zuerst `git status -sb`, dann Branching-Entscheidung |
| Aliase | `@/lib/...` Annahme | In Vitest `@/src/...` oder relative Imports |
| Status-Sprache | "done" pauschal | `branch-done · PR open` oder `local-WIP` getrennt |

---

## § A – Sonnet 4.6 · Phase 7-Finish + Phase 8 Spatial Audio

**Branch:** `feature/phase-8-audio` (NEU, abgezweigt von `feature/phase-7-immersive`)
**Eigentum:** `packages/audio/*`, kleine Änderungen in `packages/three/src/CanvasRoot.tsx` + `store.ts` für Scene-Injection-Finish, `apps/web/app/[locale]/(immersive)/*` für Audio-Wiring.

```
=== SONNET 4.6 :: SESSION 2 :: PHASE 7-FINISH + PHASE 8 SPATIAL AUDIO ===

KONTEXT (PFLICHT-LESE-SEQUENZ):
1. STATUS.md (live)
2. ELBTRONIKA_Architekturplan_v1.md
3. ELBTRONIKA_Architekturplan_v1.1.md
4. docs/adr/0007-immersive-architektur.md (insb. letzter Abschnitt: Spatial-Audio-Interface)
5. packages/three/src/store.ts (proximity Map, cameraPosition)
6. apps/web/app/[locale]/(shop)/artwork/[slug]/ArtworkAudioPlayer.tsx (aktivierbarer Stub)

GIT-STAND VOR START (nicht überspringen):
> git status -sb
> git log --oneline -5
> git tag --sort=-creatordate | head -5
Erwartet: feature/phase-7-immersive HEAD a7daef2, tag v0.7.0.
Wenn etwas anderes: STOP, Status reporten.

BRANCHING:
> git checkout -b feature/phase-8-audio feature/phase-7-immersive

ARBEITSPAKET (zwei Teile, in dieser Reihenfolge):

== TEIL 1: Phase 7 Architecture-Finish (klein, blockiert Phase 8) ==

A1. CanvasRoot Scene-Injection-Pattern fertigstellen:
- store.ts erweitern: activeScene: ComponentType<unknown> | null
- setActiveScene(scene: ComponentType | null): void
- CanvasRoot.tsx rendert <Suspense><ActiveScene /></Suspense>, ActiveScene = useThreeStore(s => s.activeScene)
- LobbyScene bleibt Default wenn activeScene === null
- GallerySceneInjector setzt store.activeScene = Room1Scene on mount, null on unmount

A2. DevStats refactor:
- require() raus, statt Next dynamic() mit ssr: false ODER React.lazy + Suspense

A3. packages/three/src/index.ts Imports:
- Wenn tsconfig moduleResolution = "bundler" → KEIN .js-Suffix in relativen Imports
- Wenn moduleResolution = "node16"/"nodenext" → .js-Suffix korrekt
- Aktuellen Stand prüfen, konsistent fixen

A4. Placeholder-Image:
- public/images/placeholder-artwork.jpg auf 400×600 Real-Placeholder austauschen (einfacher Solid-Color-JPEG mit Branding-Tönen reicht)

== TEIL 2: Phase 8 Spatial Audio ==

DELIVERABLES:
✓ packages/audio (workspace package @elbtronika/audio)
  - package.json mit pnpm-workspace-Anbindung
  - tsconfig erbt von root
  - exports map klar (./context, ./hooks, ./engine, ./components)

✓ packages/audio/src/context.ts:
  - getAudioContext(): AudioContext (singleton, lazy)
  - unlockAudioContext(): Promise<void> (resume + sessionStorage flag)
  - isUnlocked(): boolean

✓ packages/audio/src/store.ts (Zustand):
  - state: { activeTrackId | null, isPlaying, masterVolume (0..1), spatialEnabled, mutedUntil | null }
  - actions: setMasterVolume, toggleMute, setActiveTrack, etc.

✓ packages/audio/src/hooks/useProximityAudio.ts:
  - liest threeStore.proximity (Map<string, number>)
  - 100ms throttle (NICHT 60fps)
  - max 10 aktive Streams (Hardware-Limit)
  - per-Artwork: HLS-Stream-URL aus artwork.set.hlsManifestUrl
  - fade-in bei distance < refDistance, fade-out bei > maxDistance + 2s grace

✓ packages/audio/src/engine/SpatialAudioEngine.ts:
  - PannerNode pro aktivem Stream
  - Inverse-Square-Law: Gain = refDistance / (refDistance + rolloffFactor * (distance - refDistance))
  - Listener-Position aus threeStore.cameraPosition (per useFrame, Ref nicht State!)
  - DynamicsCompressor pre-Destination
  - setTargetAtTime für Gain-Smoothing (kein gain.value=)

✓ packages/audio/src/engine/HLSLoader.ts:
  - hls.js v1.6+ via Web Worker
  - hidden <audio>-Element pro Stream
  - createMediaElementSource() ERST nach Hls.Events.MANIFEST_PARSED (Safari-Deadlock-Schutz)

✓ packages/audio/src/engine/RoomReverb.ts:
  - AudioWorkletProcessor für Simple Convolution oder Algorithmic Reverb
  - Raumdimensionen aus Room.tsx-Props (klein/mittel/groß Presets)

✓ packages/audio/src/components/AudioUnlockOverlay.tsx:
  - DOM-Komponente, z-50
  - "Enter Experience"-Button → unlockAudioContext()
  - sessionStorage check, blendet aus wenn schon unlocked

✓ packages/audio/src/components/NowPlayingHUD.tsx:
  - Track-Label, Master-Volume-Slider, Mute-Toggle
  - Persistent in immersive Layout

✓ Wiring:
  - apps/web/app/[locale]/(immersive)/layout.tsx: <AudioUnlockOverlay /> + <NowPlayingHUD />
  - apps/web/app/[locale]/(shop)/artwork/[slug]/ArtworkAudioPlayer.tsx: aktivieren als simpler Preview-Player (NICHT spatial — nur Play/Pause + Progress)

✓ Tests (engster Slice, nicht repo-weit):
  - pnpm.cmd --filter @elbtronika/audio test (vitest)
    - Inverse-Square-Law-Math (exakt)
    - Throttle-Verhalten (mit fake timer)
    - Max-10-Limit
    - Idempotenz unlockAudioContext
  - apps/web E2E (nur audio-relevante Tests):
    - Click "Enter Experience" → AudioContext state === 'running'
    - Mute-Toggle persistiert über Reload
  - Browser-Smoke (manuell dokumentiert): Mobile Safari iOS Audio-Test

✓ ADR docs/adr/0008-spatial-audio.md (MADR-Format)

DOD PHASE 8:
- packages/audio Workspace-Package importierbar in apps/web
- AudioUnlockOverlay zeigt → Click → Audio läuft
- Annäherung an Artwork → HLS-Stream startet, fade-in
- Verlassen → fade-out nach 2s
- Max 10 simultane Streams enforced
- pnpm.cmd --filter @elbtronika/audio typecheck grün
- pnpm.cmd --filter @elbtronika/audio test grün
- pnpm.cmd --filter @elbtronika/web typecheck grün (engster Slice)
- ADR 0008 geschrieben
- Tag v0.8.0 vorbereitet auf feature/phase-8-audio (NICHT pushen ohne Lou's GO)

ARCHITEKTUR-REGELN (zwingend):
- AudioContext NIE vor User-Gesture instanziieren
- proximity Map LESEN aus packages/three (kein Duplicate-State)
- 100ms throttle, kein 60fps
- cameraPosition aus threeStore via Ref, nicht State
- KEIN useState für per-Frame-Audio-Daten

KONFLIKT-PRÄVENTION:
- Exklusiver Scope: packages/audio/*, packages/three/src/CanvasRoot.tsx (kleines Refactor), packages/three/src/store.ts (activeScene erweitern), apps/web/app/[locale]/(immersive)/*, apps/web/app/[locale]/(shop)/artwork/[slug]/ArtworkAudioPlayer.tsx
- NICHT anfassen: apps/web/app/[locale]/(shop)/(rest), packages/ui, supabase/, packages/contracts (außer audio-spezifische Schemas anlegen falls nötig)
- Vor `git add`: zuerst staged cleanup (`git restore --staged .`), dann nur Scope-Dateien stagen.

WORKFLOW-MODUS:
1. PFLICHT: 5-Zeilen-Run-Log starten in memory/runs/2026-04-29_Sonnet-46.md (oder Datum des realen Run)
2. Sub-Plan als TodoList schreiben (Teil 1 + Teil 2 getrennt)
3. STOP, warte auf "GO Phase 8"
4. NACH GO: autonom durchziehen bis DoD. Kein erneutes Bootstrap-Loop pro Schritt.
5. Bei echtem Blocker (architektonische Frage NICHT im Plan): Stop, Frage präzise an Lou.

VALIDIERUNGS-REGEL:
- Wenn repo-weiter typecheck durch andere Baustellen (z.B. uncommitted GPT-Shop-WIP) verrauscht ist: nur eigene Filter-Slices als grün-Kriterium nehmen.
- Phase 8 ist erfolgreich, wenn @elbtronika/audio + @elbtronika/three + apps/web (audio-relevant) sauber sind.

OUTPUT-FORMAT:
- Nach Sub-Plan: TodoList visualisieren, dann STOP.
- Nach jedem Major-Step: 1-3 Sätze Diff-Summary.
- Run-Log nach DoD updaten.
- Final: PR draft auf feature/phase-8-audio gegen feature/phase-7-immersive (NICHT gegen main solange #1 offen ist).
=== ENDE ===
```

---

## § B – GPT 5.4 · Phase 6A Commit & Cleanup + Phase 6B Erweiterungen

**Branch:** `feature/phase-6-completion` (NEU, abgezweigt von `feature/phase-7-immersive` an HEAD `a7daef2`, weil dort Shop-WIP lebt)
**Eigentum:** `apps/web/app/[locale]/(shop)/*`, `apps/web/__tests__/shop/*`.

```
=== GPT 5.4 :: SESSION 2 :: PHASE 6 COMPLETION (6A WIP COMMIT + 6B ERWEITERUNG) ===

KONTEXT (PFLICHT-LESE-SEQUENZ):
1. STATUS.md
2. ELBTRONIKA_Architekturplan_v1.md (Phase 6)
3. ELBTRONIKA_Architekturplan_v1.1.md (i18n § 4.5, MCP-Map § 6 Phase 6)
4. docs/adr/0006-shop-architektur.md
5. apps/web/app/[locale]/(shop)/* — aktueller Stand
6. apps/web/__tests__/shop/* — vorhandene Tests

GIT-STAND PRÜFEN:
> git status -sb
> git log --oneline -5
Es liegt lokaler uncommitteter WIP. Erwartete WIP-Files (mindestens):
  - apps/web/app/[locale]/(shop)/layout.tsx
  - apps/web/app/[locale]/(shop)/components/AddToCartButton.tsx
  - apps/web/app/[locale]/(shop)/components/CartOpenButton.tsx
  - apps/web/app/[locale]/(shop)/shop/artwork/[slug]/opengraph-image.tsx
  - apps/web/app/[locale]/(shop)/artwork/[slug]/page.tsx (Redirect)
  - apps/web/__tests__/shop/cart.test.tsx
Wenn andere Files dirty sind: an Lou reporten, NICHT blind committen.

BRANCHING:
> git checkout -b feature/phase-6-completion feature/phase-7-immersive
(WIP wandert mit, da unstaged.)

ARBEITSPAKET (zwei Teile):

== TEIL 1: Phase 6A — WIP committen + reviewen ==

A1. WIP-Files reviewen, ggf. polishen (kein neuer Scope, nur Qualität).
A2. Sicherstellen:
  - i18n: alle Strings in messages/de.json + messages/en.json
  - a11y: Buttons mit aria-label, kein generic <button>
  - Typescript strict, kein any
A3. Tests fix:
  - pnpm.cmd --filter @elbtronika/web test -- __tests__/shop/cart.test.tsx __tests__/shop/shop.test.ts (engster Slice!)
A4. Commits in logischen Stücken (Conventional Commits):
  - feat(shop): cart drawer integration
  - feat(shop): canonical artwork detail route + redirect for legacy
  - feat(shop): dynamic OG image for artwork detail
  - test(shop): cart wiring + snapshot
A5. Push, dann an PR #1 anhängen ODER eigenen PR feat/phase-6-completion gegen feature/phase-7-immersive eröffnen.

== TEIL 2: Phase 6B — Supabase-First Listing + Filter + Pagination + Audio-Preview-Parität + Lighthouse ==

DELIVERABLES:
✓ apps/web/app/[locale]/(shop)/shop/page.tsx:
  - Listing direkt aus Supabase (server-side via @supabase/ssr), NICHT aus Sanity-Mock
  - Status='published' filter
  - Sortierung (Default: published_at desc)

✓ Filter-Komponenten (Client):
  - Artist (Multi-Select aus distinct artists)
  - DJ (Multi-Select)
  - Preis-Range (Slider €0..€10000)
  - Raum (Multi-Select aus rooms)
  - Medium (Multi-Select)
  - URL-State via nuqs (oder eigene useSearchParams-Hook)

✓ Pagination cursor-basiert:
  - Cursor = (published_at, id)
  - Page-Size 24, Lazy-Load via Intersection Observer
  - Skeleton Cards beim Loading

✓ Audio-Preview-Parität:
  - In Shop-Liste: Play-Button auf Card (hover), 30s Preview aus artwork.set.hlsManifestUrl
  - In Detail-Page: bestehender ArtworkAudioPlayer (NICHT spatial, NICHT mit packages/audio verkoppelt — pure simple HTMLAudio)
  - Preview-Player und Phase 8 Spatial-Audio sind getrennt!

✓ Lighthouse-Budget einhalten:
  - LCP ≤ 2.0s, CLS ≤ 0.05, INP ≤ 150ms
  - Lighthouse-CI in .github/workflows/lighthouse.yml prüft auf jedem PR
  - Image-Optimization mit Next/Image, AVIF/WebP
  - Above-Fold Bilder priority
  - JS-Bundle < 250KB gzipped (3D-Code chunked, Audio-Code lazy)

✓ Tests (engster Slice):
  - pnpm.cmd --filter @elbtronika/web test -- __tests__/shop/
    - Filter-State-Sync
    - Pagination Cursor-Logik
    - Mock-Supabase Listing
  - E2E Playwright:
    - Filter setzen → URL ändert sich → Liste filtert
    - Scroll → next page lädt
    - Click Artwork → Detail-Page
  - axe-core a11y per Route

✓ ADR-Update docs/adr/0006-shop-architektur.md:
  - Sektion "Phase 6B Update" anhängen mit Begründung Supabase-first

DOD PHASE 6 (kombiniert 6A + 6B):
- WIP committed + gepusht
- PR offen mit klarem Titel
- Listing zeigt echte Daten aus Supabase Dev
- Alle Filter funktional, URL-state synchron
- Pagination ohne Layout-Shift
- Audio-Preview funktioniert in Liste UND Detail
- pnpm.cmd --filter @elbtronika/web typecheck grün
- pnpm.cmd --filter @elbtronika/web test -- __tests__/shop grün
- Lighthouse-CI grün auf PR
- ADR aktualisiert

KONFLIKT-PRÄVENTION:
- Exklusiver Scope: apps/web/app/[locale]/(shop)/*, apps/web/__tests__/shop/*, ggf. packages/contracts/src/queries/shop.ts (read-only Helper)
- NICHT anfassen: packages/three, packages/audio, supabase/migrations, packages/sanity-studio
- Vor `git add`: gezielt nur Shop-Files stagen.

WORKFLOW-MODUS:
1. Run-Log starten: memory/runs/2026-04-29_GPT-54.md
2. Sub-Plan TodoList (Teil 1 + Teil 2 getrennt)
3. STOP, "GO Phase 6 Completion" abwarten
4. NACH GO: autonom bis DoD
5. Bei Konflikt mit packages/audio (Phase 8 Sonnet-Branch): Coordinator-Frage an Lou

VALIDIERUNGS-REGEL:
- Engster testbarer Slice. Wenn @elbtronika/three Typecheck-Fehler durch parallele Phase-8-Arbeit hat: ignorieren, bei eigenen Slices bleiben.
- Imports in Vitest: relative Imports oder @/src/... statt @/lib/... (hat sich als verlässlicher erwiesen).

OUTPUT:
- Nach Sub-Plan STOP.
- Nach jeder Commit-Reihe: kurze Diff-Summary.
- Run-Log nach DoD updaten.
- Final: PR-Link an Lou + Status-Bericht.
=== ENDE ===
```

---

## § C – Codex 5.3 · Phase 14-Subset (Test- + ADR-Konsolidierung für Phase 1–7)

**Branch:** `feature/phase-14-test-consolidation` (NEU, von `feature/phase-7-immersive`)
**Eigentum:** `tests/`, `apps/web/__tests__/*` (außerhalb shop, das ist GPT), `vitest.config.ts`, `.github/workflows/`, `playwright.config.ts`, fehlende ADRs.

```
=== CODEX 5.3 :: SESSION 2 :: PHASE 14 (TEST + ADR KONSOLIDIERUNG) ===

KONTEXT:
ELBTRONIKA Solo-Build. Phase 1-7 sind branched-done aber Test-Coverage und ADR-Vollständigkeit für die existierenden Phasen müssen konsolidiert werden, bevor Phase 8-13 nachgezogen wird.

PFLICHT-LESE-SEQUENZ:
1. STATUS.md
2. ELBTRONIKA_Architekturplan_v1.md (Phase 14 vollständig)
3. ELBTRONIKA_Architekturplan_v1.1.md (DoD-Pillars)
4. docs/adr/0001-monorepo-tooling.md … 0007-immersive-architektur.md (alle existierenden)

GIT-STAND:
> git status -sb
> git log --oneline -5
Erwartet: feature/phase-7-immersive aktiv. Wenn lokaler WIP: NICHT anfassen (gehört GPT 5.4).

BRANCHING:
> git checkout -b feature/phase-14-test-consolidation feature/phase-7-immersive

ARBEITSPAKET:

== TEIL 1: Test-Infrastruktur härten ==

T1. vitest.config.ts (root):
- Coverage-Reporter (v8) konfigurieren
- Per-Package thresholds:
  - @elbtronika/contracts: 90% branch
  - @elbtronika/three: 60% branch (3D ist schwer testbar)
  - @elbtronika/audio (späterer Phase 8 — placeholder vorbereiten): 80% branch
  - apps/web: 70% branch

T2. playwright.config.ts:
- Browsers: chromium (Default), webkit (für Safari-spezifische Audio/HLS-Tests)
- Workers: 2 (Solo-Hardware)
- Reporter: html + github
- Trace on retry

T3. .github/workflows/ci.yml erweitern:
- Job "test-unit": pnpm.cmd test:unit
- Job "test-integration": mit Supabase-Service-Container
- Job "test-e2e": pnpm.cmd test:e2e
- Job "lighthouse": Subset-Routes /shop, /artwork/[slug], /gallery
- Job "a11y": axe-core auf gleichen Routes

== TEIL 2: Test-Coverage für Phase 1-7 ==

T4. packages/contracts:
- Falls noch nicht: Tests für jeden Zod-Schema (valid + invalid Cases)
- Transformer-Tests (snake_case ↔ camelCase Round-Trip)

T5. packages/three:
- Test für feature-detection (mock navigator.gpu)
- Test für store (proximity Map mutations, NICHT setState-trigger)
- Snapshot für scene-graph-Aufbau (struktur, nicht Render)

T6. apps/web:
- Auth-Flow E2E: Magic-Link, OAuth-Stub
- RLS-Integration-Test (Supabase Test-Client):
  - User A liest eigene Order: 200
  - User A liest Order von User B: 0 rows
  - Anon liest published Artworks: ok
  - Anon liest draft Artwork: 0 rows
- Sanity-Webhook-Idempotenz (mock signature, double-fire)
- Asset-Upload-Endpoint (Mock R2)
- Immersive Smoke (Playwright):
  - /gallery lädt
  - Canvas mounted, FPS > 30 nach 5s (lockerer als Production-Budget für CI)

T7. Visual Regression Baseline:
- Storybook-Snapshots für packages/ui Komponenten
- Playwright-Screenshots für /, /shop, /shop/artwork/[slug], /artist/[slug]
- Tolerance 0.1% (CI-jitter Schutz)

== TEIL 3: ADR-Vollständigkeit ==

T8. ADR-Audit:
- Pro Phase 1-7 muss eine ADR existieren (0001 bis 0007).
- Wenn fehlt: nachschreiben im MADR-Format aus Code-Realität (nicht aus Plan!).
- Format:
  # ADR-XXXX: Titel
  - Status: accepted
  - Datum: <yyyy-mm-dd>
  ## Context
  ## Considered Options
  ## Decision
  ## Consequences (positive/negative/neutral)
  ## Verification

T9. ADR-Index docs/adr/README.md:
- Tabelle aller ADRs mit Status, Datum, Phase-Bezug

== TEIL 4: README + Onboarding ==

T10. README.md (Repo-Root):
- Quick-Start für Solo-Dev (pnpm.cmd install, doppler setup, dev)
- Doppler-Anbindung (DOPPLER_TOKEN_DEV)
- Test-Befehle (Slice + Full)
- Architektur-Diagramm-Link

T11. CONTRIBUTING.md:
- Branch-Naming feature/phase-X-...
- Conventional Commits
- DoD-Checkliste copy-paste

DOD PHASE 14-SUBSET:
- pnpm.cmd test (full) grün auf CI
- Coverage-Report im PR-Comment sichtbar
- Lighthouse-CI grün
- a11y violations = 0 auf gestesteten Routes
- Alle ADRs 0001-0007 vorhanden + indexiert
- README + CONTRIBUTING aktuell
- ADR docs/adr/0014-test-strategie.md (Meta-ADR)

KONFLIKT-PRÄVENTION:
- Exklusiver Scope: tests/ (Repo-Root falls existiert), vitest.config.ts, playwright.config.ts, .github/workflows/, docs/adr/, README.md, CONTRIBUTING.md, packages/<package>/__tests__/ (außerhalb shop)
- NICHT anfassen: apps/web/app/[locale]/(shop)/* (das ist GPT 5.4 Branch)
- NICHT anfassen: packages/audio/* (das ist Sonnet-Branch)
- NICHT modifizieren: existierende Source-Files in packages/three (nur Tests dazu)

WORKFLOW-MODUS:
1. Run-Log starten: memory/runs/2026-04-29_Codex-53.md
2. Sub-Plan TodoList (Teil 1-4 als Phasen)
3. STOP, "GO Phase 14" abwarten
4. NACH GO: autonom bis DoD
5. Konflikt mit Sonnet-Audio-Tests: Tests für Phase 8 als TODO markieren, NICHT vorab implementieren

VALIDIERUNGS-REGEL:
- Engster testbarer Slice zuerst grün, dann nächstes Slice.
- Wenn pnpm.cmd test global rauscht durch fremde Branches: per-package filtern und nur die eigenen confirm-grün dokumentieren.

OUTPUT:
- Nach Sub-Plan STOP.
- Nach jedem Test-Slice: kurze Coverage-Summary.
- Run-Log nach DoD updaten.
- Final: PR feat/phase-14-test-consolidation gegen feature/phase-7-immersive.
=== ENDE ===
```

---

## § D – Coordinator-Notes für Lou (Session 2)

### D.1 Branch-Strategie

```
main (v0.5.0)
  └── feature/phase-7-immersive (v0.7.0, draft PR #1)
        ├── feature/phase-8-audio          ← Sonnet
        ├── feature/phase-6-completion     ← GPT (mit lokalem WIP)
        └── feature/phase-14-test-consolidation  ← Codex
```

Alle drei Sub-Branches gehen gegen `feature/phase-7-immersive`, NICHT gegen `main`.
Nach allen drei Sub-PRs: PR #1 (feature/phase-7-immersive → main) zusammen mergen.

### D.2 Lokaler WIP-Schutz

Bevor du zu Codex-Branch oder Sonnet-Branch checkoutest: WIP zur GPT-Session zuerst!
Andernfalls: `git stash push -m "phase-6-wip"`, dann später bei GPT-Session `git stash pop`.

### D.3 Validierungs-Regel (Repo-weit)

Repo-weiter Typecheck/Test wird durch parallele Branches verrauscht. Statt-dessen pro Session:
- `pnpm.cmd --filter @elbtronika/<package> typecheck`
- `pnpm.cmd --filter @elbtronika/<package> test`
- Bei `apps/web`: noch enger via `-- __tests__/<scope>/*`

### D.4 Run-Log-Disziplin

Pflicht pro Prompt-Lauf:
```
# memory/runs/2026-04-29_<MODEL>.md (max 5 Zeilen pro Eintrag)

## Run NN — <kurzer Titel>
- Phase: <X>
- Was: <1-2 Sätze>
- Tests: <grün/rot/skipped>
- Branch: <name>
- Commit: <sha>
```

### D.5 Drift-Awareness

Nach jeder Session: STATUS.md updaten mit Branch-Granularität:
- `branch-done` (auf Sub-Branch implementiert)
- `pr-open` (PR offen, noch nicht gemergt)
- `local-wip` (uncommittet)
- `done-on-main` (gemergt nach main)

### D.6 Wenn Copilot-Quota gleich aufgebraucht

Bei dir: 97% Limit, Reset 04.05.2026.
- Diese Prompts sind so geschrieben, dass sie auch nach Reset gültig bleiben (Datum nur in Run-Log relevant).
- Bei Bedarf: Run-Log-Datei umbenennen auf `2026-05-04_<MODEL>.md` wenn Sessions später laufen.

### D.7 Reihenfolge der Merges (wichtig)

1. GPT 5.4 zuerst → Phase 6-Completion + WIP committed.
2. Codex Tests reagieren auf gemergten Phase 6-Stand → rebase oder nach 1.
3. Sonnet 8 zuletzt mergen, da Audio von Phase 6 (Preview-Player-Wiring) liest.

### D.8 Rückkanal an Opus (mich)

Wenn ein Modell driftet oder eine architektonische Frage stellt:
- Run-Log-Eintrag mit "Frage X: ..."
- Lou pasted Frage hier in Opus-Session
- Opus liefert Patchtext + Sub-Plan-Update
- Lou pasted zurück ins entsprechende Copilot-Window

---

**Letztes Wort:** Diese Session 2 nimmt die Drift sauber raus. Nach den drei PRs ist der reale Repo-Stand mit der Doku synchron.
