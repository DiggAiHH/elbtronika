# ADR 0015: React Compiler & R3F Performance Optimizations

## Status
**Accepted** — 2026-04-29

## Context

Phase 7 (Immersive 3D) lief stabil, aber Performance-Profiling zeigte:
- `CanvasRoot` re-renderte bei jedem Layout-Update der Parent-Komponente (unnötig)
- `ActiveSceneRenderer` re-renderte bei jedem Store-Update, auch wenn `activeScene` unverändert blieb
- `LobbyScene` wurde eager importiert, obwohl es nur im Idle-Zustand benötigt wird
- Keine Error Boundary um den 3D-Canvas → ein Three.js-Fehler würde die gesamte App unmounten
- Keine `prefers-reduced-motion` Berücksichtigung

## Decision

### 1. React Compiler Aktivierung
- `babel-plugin-react-compiler` installiert und `experimental.reactCompiler: true` in `next.config.ts` aktiviert
- R3F-Dateien sind compiler-safe: alle per-frame Mutationen laufen über Refs, nicht React State

### 2. Memoization
- `CanvasRoot` mit `React.memo` wrappen → verhindert Parent-Re-renders
- `ActiveSceneRenderer` mit `React.memo` wrappen → nur bei `activeScene`-Änderung re-rendern
- `onCreated` Callback mit `useCallback` stabilisieren
- Inline-Style-Objekt mit `useMemo` cachen

### 3. Code Splitting
- `LobbyScene` via `React.lazy()` laden → nur bei `activeScene === null` geladen
- `DevStats` bleibt lazy (bereits implementiert)

### 4. R3F Best Practices
- `frameloop="demand"` wenn `mode === "classic"` → spart Batterie auf Mobilgeräten
- `dpr={[1, 2]}` mit Performance-Observer für dynamische Anpassung (zukünftig)
- Drei's `<Preload all />` für Asset-Vorladung

### 5. Error Boundaries
- `app/[locale]/error.tsx` — Root Error Boundary
- `app/[locale]/canvas/error.tsx` — Canvas-spezifisch mit "Retry Gallery" / "Browse Shop"
- `app/[locale]/shop/error.tsx` — Shop-spezifisch

### 6. Accessibility
- `prefers-reduced-motion: reduce` → CSS-Transition auf `none`
- Canvas mit `role="img"` und `aria-label`

## Consequences

### Positive
- Weniger unnötige Re-renders → bessere FPS
- Fehlerisolation im 3D-Bereich
- Barrierefreiheit verbessert

### Negative
- `React.lazy` für `LobbyScene` fügt einen kleinen Lade-Sprung beim ersten Wechsel hinzu (abgemildert durch `<Preload all />`)
- React Compiler erfordert Build-Time-Validation

## References
- [R3F Performance Best Practices 2026](https://www.utsubo.com/blog/threejs-best-practices-100-tips)
- [React Compiler Docs](https://react.dev/learn/react-compiler)
