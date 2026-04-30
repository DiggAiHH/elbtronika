# ADR 0007: Immersive 3D Gallery Architecture (Phase 7)

**Status:** Accepted  
**Date:** 2025-04-29  
**Authors:** Sonnet 4.6 (Phase 7 session)

## Context

ELBTRONIKA's core differentiator is an immersive 3D gallery experience where visitors navigate through virtual rooms and encounter artworks in spatial context. This requires a WebGL/WebGPU canvas layer running continuously beneath the Next.js app router DOM.

## Decisions

### Package Structure

A dedicated `packages/three` workspace package (`@elbtronika/three`) isolates all Three.js code from the Next.js app. This enables:
- Independent versioning and type checking
- Clean `transpilePackages` boundary in next.config.ts
- Future extraction to separate deployment (edge rendering)

### Canvas Layer Strategy: Fixed Overlay, Never Unmounts

```
Position: fixed; inset: 0; z-index: -1; pointer-events: none (classic mode)
                                         pointer-events: auto  (immersive mode)
```

The `<CanvasRoot />` is mounted ONCE in `app/[locale]/layout.tsx` and never unmounts. Mode switching is achieved via CSS `opacity` transition (0.6s ease), not unmounting/remounting. This eliminates the texture reload penalty on every route change.

### Renderer Priority: WebGPU → WebGL2 Fallback

1. `detectWebGPU()` (client-side) checks `navigator.gpu.requestAdapter()`
2. Result stored in `elt_webgpu` cookie (30-day cache) for Edge Function tier selection
3. `@react-three/fiber` v9 handles WebGPU renderer internals automatically
4. `gl={{ powerPreference: "high-performance" }}` signals discrete GPU preference

### Store Design: No setState in useFrame

```typescript
// WRONG – triggers React re-render cascade at 60fps
setProximityDistance(distance);

// RIGHT – mutable ref / Map mutation, zero re-renders
store.getState().updateProximity(artworkId, distance); // mutates Map in-place
```

All per-frame data (proximity distances, camera position) flows through mutable refs or direct Map mutations. Only UI-relevant state changes (mode, currentRoomId) are reactive.

### Camera Control: CatmullRom Spline via scrollY

```
scrollY / maxScroll → t [0..1] → curve.getPointAt(t) → camera.position
```

- Desktop: mouse/trackpad scroll drives `t`
- Mobile: `DeviceOrientationEvent.beta` (forward tilt) auto-advances `t`; manual scroll also supported
- `lookAheadT = 0.02` ensures camera always faces "forward" along path

### Post-Processing: Selective Bloom (Not Legacy EffectComposer)

`@react-three/postprocessing` v3 with `Bloom` + `luminanceThreshold: 0.85` targets only the neon emissive surfaces (cyan `#00f5d4`, magenta `#f720b8`). Standard geometry is unaffected.

### Room Composition

Each room:
- Exactly 3 artwork slots (Phase 7 MVP)
- Slot positions: back wall centre, left wall, right wall
- Room data registered in ThreeStore on mount (enables HUD minimap)
- Artworks fetched SSR in the gallery route, hydrated into `GallerySceneInjector`

### Scene Injection Pattern

Gallery route (`/[locale]/gallery`) pushes scene data to the store via `GallerySceneInjector` (client component). This avoids prop drilling through the layout and keeps `CanvasRoot` decoupled from route-specific data.

### HUD: DOM Overlay, Not R3F

The minimap and room indicator are DOM elements (`position: fixed; z-index: 50`) subscribing to the ThreeStore, NOT R3F components. This avoids rendering text via WebGL and gives full CSS/accessibility control.

### Proximity Audio (Phase 8 Interface)

- Max 10 active proximity tracks (hardware audio node limit)
- `proximity: Map<string, number>` is a mutable store field, updated from `useFrame`
- Phase 8 (Spatial Audio) reads this map in a `useEffect` loop with 100ms throttle

## Rejected Alternatives

- **Unmount canvas on route change**: Causes full texture reload (~400ms stutter) on every navigation
- **EffectComposer legacy pipeline**: Incompatible with TSL (Three Shading Language) used in Three.js r160+
- **Proximity via React state**: Would cause 60 re-renders/second per artwork in the room
- **drei ScrollControls**: Insufficient control for multi-room spline paths; CatmullRomCurve3 gives full control

## Consequences

- Three.js WASM assets (Draco decoder, KTX2 transcoder) must be hosted at `/three/draco/` and `/three/basis/` — served from R2 via Netlify edge rewrite (Phase 3 already configured).
- Placeholder artwork image at `/images/placeholder-artwork.jpg` must exist in `apps/web/public/images/`.
- Phase 8 (Spatial Audio) can read `useThreeStore.getState().proximity` directly without additional plumbing.
- Phase 10 (Stripe) checkout flow opens as a DOM overlay — canvas stays visible in background (mode: "immersive", pointer-events: none during checkout).
