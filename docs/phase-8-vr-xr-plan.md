# Phase 8 — VR/XR Mode (WebXR)

- Status: Proposed (blocked auf Phase 0 Legal + Phase 7 Single Canvas Done)
- Owner: Lou
- Datum: 2026-05-10
- ADR: [0023-vr-xr-mode.md](./adr/0023-vr-xr-mode.md)

## Ziel

User setzt Oculus auf, öffnet `elbtronika.art` im Headset-Browser, klickt **Enter VR**: Klassik-3D wird Stereo, Spatial-Audio wird HRTF-binaural, Kunststück + zugehöriges Set werden räumlich erlebt.

## Eselsbrücken

- **WebXR = Web bringt XR**: Browser-Standard, deine Site IST die App.
- **Single Canvas, drei Kameras**: Classic / Immersive / VR teilen Renderer + Szene.
- **Listener folgt Kopf, Panner bleibt am Kunstwerk**: Sound automatisch räumlich.
- **Rift = Link, Quest = solo**: Rift CV1 nur via PC; Quest direkt im Meta Browser.
- **WebGL2 für XR, WebGPU bleibt Desktop**: Pfad-Trennung dauerhaft.

## Voraussetzungen

- ✅ Phase 7 (Single Canvas) Done
- ✅ Phase 5 (Content Model: rooms, sets, artworks)
- ✅ HLS-Audio-Worker + PannerNode-Graph
- ✅ Doppler Secret Management
- ⏳ Phase 0 Legal (DSGVO-Hinweis VR-Tracking ergänzen)

## Tech-Stack-Erweiterung

```bash
pnpm --filter web add @react-three/xr@^6 @react-three/uikit @react-three/uikit-lucide
pnpm --filter web add -D @iwer/devui iwer
```

## Architektur

```
apps/web/
├─ src/
│  ├─ modes/
│  │  ├─ ClassicMode.tsx       (existiert)
│  │  ├─ ImmersiveMode.tsx     (existiert, WebGPU)
│  │  └─ ImmersiveModeXR.tsx   (NEU, WebGL2 + XR-Session)
│  ├─ xr/
│  │  ├─ XRRoot.tsx             (XR-Provider, Store)
│  │  ├─ XRControllers.tsx      (Rays + Hands)
│  │  ├─ TeleportFloor.tsx      (pro Room)
│  │  ├─ XRAudioBridge.tsx      (AudioListener ↔ XR-Camera)
│  │  ├─ VRUIPanel.tsx          (Cart, Info, Exit)
│  │  └─ EnterVRButton.tsx      (Feature-Flag-aware)
│  └─ audio/
│     └─ RoomReverb.ts          (ConvolverNode + IR-Lookup)
└─ public/
   └─ ir/                       (Impulse Responses pro Room)
```

## Sanity-Schema-Erweiterung

`apps/cms/schemas/room.ts`:

```ts
defineField({
  name: 'irImpulse',
  title: 'Room Impulse Response (Reverb)',
  type: 'file',
  options: { accept: 'audio/wav' },
  description: 'IR-WAV für ConvolverNode. 0.5–3s. Optional.'
})
```

`apps/cms/schemas/artwork.ts`:

```ts
defineField({
  name: 'lod',
  title: 'Level of Detail Models',
  type: 'object',
  fields: [
    defineField({ name: 'high', type: 'file', options: { accept: '.glb' } }),
    defineField({ name: 'mid', type: 'file', options: { accept: '.glb' } }),
    defineField({ name: 'low', type: 'file', options: { accept: '.glb' } }),
  ]
})
```

## Audio-Bridge-Pseudocode

```tsx
// XRAudioBridge.tsx
import { useFrame, useThree } from '@react-three/fiber'
import { useXR } from '@react-three/xr'
import { AudioListener } from 'three'

export function XRAudioBridge({ listener }: { listener: AudioListener }) {
  const { camera } = useThree()
  const { isPresenting } = useXR()

  useFrame(() => {
    // In XR: camera is XR-rig, position+quaternion sind Kopf
    listener.position.copy(camera.position)
    listener.quaternion.copy(camera.quaternion)
  })

  // Optional: in/out HRTF-Mode toggeln
  return null
}
```

PannerNodes pro Artwork bleiben unverändert — sie hören automatisch den Listener.

## Performance-Budget (Quest 2/3)

| Metrik | Budget |
|--------|--------|
| Frame Time | < 13.8 ms (72 Hz) bzw. < 11.1 ms (90 Hz) |
| Draw Calls | < 200 |
| Triangles | < 500k sichtbar |
| Texture Memory | < 256 MB |
| Bundle (initial) | < 1.5 MB gzip |
| Asset (LOD-low pro Artwork) | < 2 MB |

## Comfort & A11y

- Snap-Turn statt Smooth-Turn (default).
- Vignette beim Bewegen (`react-three/postprocessing` Vignette + Locomotion-State).
- Sitz-Modus (kein Teleport, statisch in der Mitte).
- Untertitel für Audio-Inhalte als floating Text-Plane.
- Controller-Rays IMMER an (Hands optional Toggle), wegen Rift CV1.
- Exit-Knopf in Reichweite, redundant: Menü-Button auf Controller.

## Privacy / DSGVO

- Keine Eye-Tracking-Daten lesen, keine Face-Tracking-Daten.
- Keine `XRDepthInformation` persistieren (Raumscan).
- Cookie-Banner bekommt VR-Sektion: "Wir nutzen ausschließlich Bewegungsdaten der Brille zur Bildberechnung. Keine Speicherung."
- Anwalt (Phase 0) bestätigt Wording.

## CI/CD-Erweiterung

`.github/workflows/ci.yml` ergänzen:

```yaml
- name: VR Smoke Test
  run: pnpm --filter web test:vr
  env:
    WEBXR_EMULATOR: '1'

- name: Build VR Preview QR
  if: github.event_name == 'pull_request'
  run: |
    URL="https://deploy-preview-${PR_NUMBER}--elbtronika.netlify.app/?vr=1"
    npx qrcode "$URL" -o vr-preview-qr.png
- uses: actions/upload-artifact@v4
  with:
    name: vr-preview-qr
    path: vr-preview-qr.png
```

## Feature-Flag

`packages/config/src/features.ts`:

```ts
export const features = {
  vr: process.env.NEXT_PUBLIC_FEATURE_VR === 'on',
}
```

`EnterVRButton` rendert `null` wenn `features.vr === false` ODER `navigator.xr === undefined`.

## Sprint-Plan (geschätzt 2 Wochen Solo)

### Sprint 8.1 — XR-Foundation (3 Tage)
- [ ] Dependencies installieren
- [ ] `XRRoot` + `EnterVRButton` Komponenten
- [ ] `ImmersiveModeXR` Route `/[locale]/vr`
- [ ] Doppler Secret `NEXT_PUBLIC_FEATURE_VR`
- [ ] Smoke-Test mit `iwer` WebXR-Emulator

### Sprint 8.2 — Audio-Bridge (2 Tage)
- [ ] `XRAudioBridge` implementieren
- [ ] Listener-Sync verifizieren mit Test-Sinuston links/rechts
- [ ] Reverb-Convolver pro Room laden
- [ ] Vitest-Unit: Listener-Position folgt Camera

### Sprint 8.3 — Locomotion + Controllers (3 Tage)
- [ ] Teleport-Floor pro Room
- [ ] Snap-Turn-Hook
- [ ] Vignette beim Movement
- [ ] Controller-Ray-Interaktion mit Artworks
- [ ] Hand-Tracking optional (Quest 2/3)

### Sprint 8.4 — VRUI (2 Tage)
- [ ] Cart-Panel als floating Mesh
- [ ] Artwork-Info-Panel
- [ ] Exit-Button + Menü-Button-Mapping
- [ ] Untertitel-Plane

### Sprint 8.5 — Polish + Docs (2 Tage)
- [ ] Performance-Profiling auf Quest 2 (real device)
- [ ] LOD-Switching verifizieren
- [ ] A11y-Audit
- [ ] Notion + Airtable + Miro + README aktualisieren
- [ ] Tag `v0.8.0`

## DoD-Checkliste

- [ ] ADR 0023 merged
- [ ] Phase-8-Plan merged
- [ ] CI green inkl. VR-Smoke
- [ ] Real-Device-Test auf Oculus (Lou's Brille) bestanden
- [ ] Lighthouse-Score Mobile > 80
- [ ] DSGVO-Anwalt-Freigabe für Tracking-Wording
- [ ] Notion-Page + Airtable-Row + Miro-Frame angelegt
- [ ] GitHub Tag `v0.8.0` gepusht
- [ ] Lokale D:\-Kopie der Doku-Snapshots
- [ ] Onboarding-Doc "Wie öffne ich ELBTRONIKA auf der Quest" verlinkt

## Onboarding-Doc (separat)

`/docs/vr-quickstart.md`:
- Quest: Browser → `elbtronika.art` → "Enter VR"
- Rift CV1: Oculus PC App → Link aktivieren → Chrome → Site → "Enter VR"
- QR-Code im Footer für schnelles Öffnen aus Desktop
