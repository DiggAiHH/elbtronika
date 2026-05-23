# ADR 0023 — VR/XR Mode (WebXR auf Single Canvas)

- Status: Proposed
- Datum: 2026-05-10
- Phase: 8
- Owner: Lou (diggai@tutanota.de)
- Verbunden: ADR 0007 (Immersive Architektur), ADR 0008 (Spatial Audio), ADR 0009 (Mode Transition), ADR 0017 (Mode Toggle A11y)

## Kontext

ELBTRONIKA besitzt bereits Immersive Mode (3D + Spatial Audio, WebGPU mit WebGL2-Fallback) und Classic Mode (Shop). User hat alte Oculus VR-Brille (Rift CV1 / Quest 1 angenommen). Ziel: Kunststück + zugehöriges Musikstück in echter VR-Stereo-Sicht und HRTF-Spatial-Audio erleben — ohne native App, ohne Sideloading, ohne App-Store.

## Entscheidung

**Wir bauen einen dritten Modus „VR Mode" als WebXR-Layer auf dem bestehenden Single Canvas.** Kein zweites Rendering-System, kein Unity, kein Unreal. WebXR Device API + `@react-three/xr` v6+ + bestehender `WebGLRenderer` (XR-Path) + bestehende `PannerNode`-Kette.

### Gewählte Architektur

| Schicht | Wahl | Begründung |
|--------|------|------------|
| **Renderer** | Three.js `WebGLRenderer` mit `xr.enabled = true` | WebGPU + WebXR noch experimentell. WebGL2-Fallback existiert bereits → Reuse. |
| **R3F-XR-Layer** | `@react-three/xr` v6 | R3F v9 kompatibel, deklaratives `<XR>` + `<Controllers>` + `<Hands>` |
| **Reference Space** | `local-floor` | Realer Boden, kein Drift, kein Guardian-Setup |
| **Locomotion** | Teleport (primär) + Snap-Turn 30° | Comfort > Free-Locomotion, keine Motion Sickness |
| **Audio-Listener** | `AudioListener` an XR-Camera | Kopf-bewegung treibt HRTF, jedes Artwork eigener `PannerNode` |
| **Reverb** | `ConvolverNode` mit Room-IR pro Sanity-Room | Räumliche Akustik, immersives Gefühl |
| **Input** | Controller-Rays primär, Hand-Tracking sekundär | Alte Rift hat keine Hands; Quest 2/3 bekommen Hands optional |
| **VRUI** | Floating `<Root>`-Mesh aus `@react-three/uikit` | Cart, Info, Exit-Button im 3D-Raum |
| **Frame-Target** | 72 Hz Mindest, 90 Hz Quest 3 | Quest-Compliance |
| **Foveated Rendering** | `xr.setFoveation(1.0)` auf Quest | GPU-Budget |

### Browser-Support-Matrix

| Headset | Browser | Pfad |
|---------|---------|------|
| Quest 1/2/3 standalone | Meta Browser | direkt URL eingeben oder QR-Code |
| Quest standalone | Wolvic | als Alternative |
| Rift CV1 / Rift S | PC Chrome + Oculus Link / Air Link | Desktop-Browser bekommt Headset |
| Quest via Link | PC Chrome | gleicher Pfad wie Rift |
| Pico/Vive/Index | beliebiger WebXR-Browser | optional, gleiche API |

### Feature-Flag

`NEXT_PUBLIC_FEATURE_VR` in Doppler (dev/stg/prd). Default `off` in prd bis Phase 8 DoD.

## Konsequenzen

### Positiv
- Eine Codebase, drei Modi (Classic / Immersive / VR) — Single Canvas-Prinzip bleibt erhalten.
- Kein Native-App-Build, kein Store-Review, sofortige Updates.
- Spatial-Audio-Graph wird wiederverwendet — null Doppelpflege.
- DSGVO-Default: kein Eye/Face/Body-Tracking, kein Raumscan persistiert.

### Negativ / Risiko
- WebGPU-Path im Immersive Mode bleibt; VR Mode forciert WebGL2-Path → zwei Render-Pfade dauerhaft.
- Performance-Budget knapper als Desktop (Quest-CPU schwächer).
- iOS Safari hat kein WebXR → iPhone-User sehen „VR nicht verfügbar"-Fallback.
- Alte Rift CV1 ist EOL bei Meta — Risiko, dass Oculus-Software Updates für Link irgendwann brechen.

### Mitigations
- LOD-Stufen pro Asset (Sanity-Schema erweitern: `lodHigh`, `lodMid`, `lodLow`).
- Texture-Atlas + Material-Sharing.
- `Spector.js`/`stats.js`-Build-Flag für Perf-Profiling.
- Playwright + `@iwer/devui` (WebXR-Emulator) für CI-Smoke ohne Hardware.
- Engineering-Harness-Regel: Performance-Regression in CI = Blocker, nicht zweimal denselben Bug.

## Alternativen verworfen

- **Native Unity/Unreal Build**: zu schwer für Solo-Builder, App-Store-Review, kein Web-Deploy. Verworfen.
- **A-Frame statt R3F**: zweites Component-System, doppelte State-Pflege. Verworfen.
- **Mozilla Hubs Embed**: Fremdes Hosting, kein Stripe-Integration, kein Sanity-Sync. Verworfen.
- **WebGPU + WebXR**: experimentell, Browser-Support fragmentiert. Verschoben auf Phase 9+.

## Rollout

1. Feature-Flag `off` → interner Test.
2. Preview-Deploy mit QR-Code-Artifact in GitHub Actions.
3. Beta auf einer Room („VR Pilot Room") mit nur einem Artwork + Set.
4. Full Rollout nach DoD: A11y-Audit, Perf-Audit, Doku komplett.

## DoD

- ADR 0023 (dies hier) ✅
- Phase-8-Plan in `/docs/phase-8-vr-xr-plan.md`
- Code: `ImmersiveModeXR.tsx`, XR-Audio-Bridge, Teleport-Floor je Room
- Tests: Playwright-Smoke + Vitest-Unit für Audio-Listener-Bridge
- Docs: Notion-Page, Airtable-Row, Miro-Frame, README-Sektion VR
- Tag: `v0.8.0` nach Merge
