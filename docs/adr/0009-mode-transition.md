# ADR 0009: Mode Transitions (Phase 9)

**Status:** Accepted  
**Date:** 2026-04-29  
**Authors:** Sonnet 4.6 (Phase 9 session)

## Context

ELBTRONIKA has two distinct modes: Immersive (3D gallery with spatial audio) and Classic (DOM-based shop with grid browsing). The transition between these modes must feel seamless and maintain the "Single Canvas, Never Unmounts" architecture principle from ADR 0007.

## Decisions

### Transition State Machine

The ThreeStore already has `mode: 'immersive' | 'classic' | 'transitioning'`. Phase 9 adds `transitionToMode(target)` which:
1. Sets `mode = 'transitioning'`
2. After 1200ms, sets `mode = target`
3. Is idempotent – ignores calls while already transitioning

### Visual Transition (MVP)

For Phase 9 MVP, the transition uses:
- CSS `opacity` transition on the canvas container (0.6s ease)
- `TransitionOverlay` component (z-index 30) showing a branded dark overlay with "ELBTRONIKA" text during the 1200ms transition
- Canvas pointer-events toggle: `auto` in immersive, `none` in classic

**Future iteration (Phase 12):** Camera interpolation (Perspective → Orthographic) and custom WebGL shader transition (Displacement + Dissolve) will replace the simple opacity fade.

### Audio Behavior During Transition

`useModeTransitionAudio` hook (packages/audio):
- Immersive → Classic: fades master volume to 30%, pauses artwork audio
- Classic → Immersive: restores previous master volume, resumes artwork audio
- Reacts to `mode` changes from ThreeStore

### UI Toggle

`ModeToggle` component (packages/three):
- Fixed position top-right
- Shows "← Shop" in immersive, "Gallery →" in classic
- Disabled during transition with "Transitioning..." label

## Rejected Alternatives

- **Unmount canvas on mode switch:** Violates ADR 0007; causes 400ms texture reload stutter
- **Instant switch without transition:** Jarring user experience; no time for audio fade
- **Camera interpolation in Phase 9:** Too complex for current milestone; deferred to Phase 12

## Consequences

- Mode switch is a 1200ms choreographed sequence: overlay → canvas fade → audio fade → UI swap
- `packages/three/src/components/ModeToggle.tsx` and `TransitionOverlay.tsx` are new
- `packages/audio/src/hooks/useModeTransitionAudio.ts` handles audio fade
- Tests verify transition state machine idempotency and timing

## Verification

- `pnpm.cmd --filter @elbtronika/three test` covers:
  - Initial mode is immersive
  - transitionToMode sets transitioning then target after 1200ms
  - Idempotency during active transition
- Browser smoke test: Click ModeToggle → overlay appears → canvas fades → shop visible
