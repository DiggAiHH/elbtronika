"use client";

/**
 * CanvasRoot – the persistent Three.js canvas overlay.
 *
 * ARCHITECTURE RULES (ADR 0007):
 * 1. This component is mounted ONCE in app/layout.tsx and NEVER unmounts.
 * 2. Mode-switching happens by changing opacity/pointer-events, NOT by unmounting.
 * 3. Scene content is pushed via the ThreeStore activeScene, not rendered here directly.
 * 4. WebGPURenderer is used when available; WebGLRenderer is the fallback.
 *
 * OPTIMIZATIONS (ADR 0015):
 * - React.memo prevents re-renders from parent layout changes.
 * - useCallback stabilises the onCreated callback.
 * - useMemo prevents inline-style object recreation.
 * - LobbyScene is lazy-loaded (only needed when activeScene is null).
 * - prefers-reduced-motion disables the opacity transition for accessibility.
 */

import {
  Suspense,
  lazy,
  useCallback,
  useMemo,
  memo,
} from "react";
import { Canvas } from "@react-three/fiber";
import { Preload, AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { useThreeStore } from "./store";
import { useWebGPUDetection } from "./hooks/useWebGPUDetection";
import { CanvasErrorBoundary } from "./components/CanvasErrorBoundary";

/** Lazy-loaded dev-only FPS stats – tree-shaken in production */
const DevStats = lazy(() =>
  import("@react-three/drei").then((mod) => ({ default: mod.Stats })),
);

/** Lazy-loaded LobbyScene – only rendered when activeScene is null */
const LobbyScene = lazy(() =>
  import("./scenes/Lobby").then((mod) => ({ default: mod.LobbyScene })),
);

const ActiveSceneRenderer = memo(function ActiveSceneRenderer() {
  const ActiveScene = useThreeStore((s) => s.activeScene);
  if (ActiveScene) {
    return (
      <Suspense fallback={null}>
        <ActiveScene />
      </Suspense>
    );
  }
  return (
    <Suspense fallback={null}>
      <LobbyScene />
    </Suspense>
  );
});

export const CanvasRoot = memo(function CanvasRoot() {
  const mode = useThreeStore((s) => s.mode);
  // WebGPU detection (available via hook for future use)
  useWebGPUDetection();

  // Respect user's motion preference (WCAG 2.1 Criterion 2.2.2)
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Canvas is always rendered; only visibility changes
  const isVisible = mode === "immersive" || mode === "transitioning";

  const containerStyle = useMemo(
    () => ({
      position: "fixed" as const,
      inset: 0,
      zIndex: -1,
      pointerEvents: (mode === "immersive" ? "auto" : "none") as "auto" | "none",
      opacity: isVisible ? 1 : 0,
      transition: prefersReducedMotion ? "none" : "opacity 0.6s ease",
      width: "100%",
      height: "100%",
    }),
    [mode, isVisible, prefersReducedMotion],
  );

  const handleCreated = useCallback(
    (state: { gl: { setClearColor: (color: number, alpha: number) => void } }) => {
      state.gl.setClearColor(0x0a0a0b, 1);
    },
    [],
  );

  return (
    <div
      aria-hidden={isVisible ? undefined : "true"}
      role="img"
      aria-label="3D Galerie-Ansicht"
      style={containerStyle}
    >
      <CanvasErrorBoundary>
        <Canvas
          gl={{
            antialias: true,
            powerPreference: "high-performance",
          }}
          camera={{ position: [0, 1.6, 5], fov: 60, near: 0.1, far: 500 }}
          shadows
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
          onCreated={handleCreated}
          frameloop={mode === "classic" ? "demand" : "always"}
        >
          {/* Automatic quality scaling – reduces DPR on low-end devices */}
          <AdaptiveDpr pixelated />
          <PerformanceMonitor
            onDecline={() => {
              // eslint-disable-next-line no-console
              console.warn("[CanvasRoot] Performance declined – DPR reduced by AdaptiveDpr");
            }}
            flipflops={3}
            onFallback={() => {
              // eslint-disable-next-line no-console
              console.warn("[CanvasRoot] Entering fallback quality mode");
            }}
          />

          {/* Global ambient light – rooms provide their own directional lights */}
          <ambientLight intensity={0.15} />

          {/* Active scene – controlled via store.activeScene (null = LobbyScene) */}
          <ActiveSceneRenderer />

          {/* Preload all registered assets on first mount */}
          <Preload all />

          {/* Dev-only stats overlay – stripped in production by tree-shaking */}
          {process.env.NODE_ENV === "development" && (
            <Suspense fallback={null}>
              <DevStats />
            </Suspense>
          )}
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
});
