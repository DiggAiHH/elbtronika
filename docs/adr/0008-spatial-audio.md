# ADR 0008: Spatial Audio System (Phase 8)

**Status:** Accepted  
**Date:** 2026-04-29  
**Authors:** Sonnet 4.6 (Phase 8 session)

## Context

ELBTRONIKA's immersive gallery requires spatial audio: as visitors approach artworks, the associated DJ set fades in via HLS streaming. Audio must respect browser autoplay policies (user gesture required), support Safari's HLS quirks, and never exceed hardware audio node limits.

## Decisions

### Package Structure

A dedicated `packages/audio` workspace package (`@elbtronika/audio`) isolates all Web Audio API code:
- `context.ts` – AudioContext singleton with user-gesture unlock
- `store.ts` – Zustand for UI-relevant audio state (master volume, mute, active track)
- `engine/SpatialAudioEngine.ts` – PannerNode graph, inverse-square-law gain, compressor
- `engine/HLSLoader.ts` – hls.js wrapper with Safari deadlock protection
- `engine/RoomReverb.ts` – Algorithmic reverb via Feedback Delay Network
- `hooks/useProximityAudio.ts` – Throttled (100ms) proximity reader from ThreeStore
- `components/AudioUnlockOverlay.tsx` – DOM overlay for first user gesture
- `components/NowPlayingHUD.tsx` – Persistent audio controls in immersive mode

### AudioContext Lifecycle

- `getAudioContext()` is lazy – no AudioContext until first call.
- `unlockAudioContext()` must be triggered by a click/tap handler.
- `sessionStorage` persists unlock state across reloads (not `localStorage`).
- Safari iOS may require re-unlock after tab switch; overlay handles this.

### HLS Streaming

- hls.js v1.6+ with Web Worker enabled for CPU offloading.
- Hidden `<audio>` element per active stream.
- `createMediaElementSource()` is called ONLY after `Hls.Events.MANIFEST_PARSED` to avoid Safari deadlock.
- Native HLS fallback for Safari (detected via `canPlayType`).

### Proximity-Driven Playback

- ThreeStore `proximity: Map<string, number>` is read directly (no duplicate state).
- 100ms throttle via `requestAnimationFrame` + time delta (NOT 60fps React state).
- Max 10 simultaneous streams enforced at engine level.
- Fade-in when distance < refDistance; fade-out when > maxDistance + 2s grace period.
- Gain smoothing via `setTargetAtTime` (no direct `gain.value=` assignment).

### Spatial Math

- Inverse-square-law: `gain = refDistance / (refDistance + rolloffFactor * (distance - refDistance))`
- Listener position updated from `cameraPosition` ref (not state).
- PannerNode per source with `HRTF` panning model.
- DynamicsCompressorNode pre-destination to prevent clipping.

## Rejected Alternatives

- **Howler.js / Tone.js**: Adds bundle size; native Web Audio API is sufficient and more controllable.
- **AudioWorklet for spatial math**: Overkill; PannerNode runs native C++ and is stable.
- **React state for per-frame gain values**: Would cause 60 re-renders/second.
- **localStorage for unlock persistence**: Survives session; sessionStorage is correct for privacy.

## Consequences

- `@elbtronika/audio` is importable in `apps/web` via workspace alias.
- Audio starts only after explicit "Enter Experience" click.
- Immersive layout (`(immersive)/layout.tsx`) mounts `<AudioUnlockOverlay />` + `<NowPlayingHUD />`.
- Shop detail page uses a simple HTMLAudio preview player (non-spatial) to avoid coupling shop code to the audio package.
- Max 10 streams prevents hardware node exhaustion on mobile.

## Verification

- `pnpm.cmd --filter @elbtronika/audio test` covers:
  - Inverse-square-law math (exact)
  - Throttle behavior (fake timers)
  - Max-10 limit
  - unlockAudioContext idempotency
- Browser smoke test: Mobile Safari iOS audio unlock flow.
