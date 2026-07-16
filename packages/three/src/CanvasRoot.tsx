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
 *
 * WEBGPU (2026-07-16): rule 4 is real now. The canvas starts on the proven
 * WebGL path (identical to before), a capability probe runs once, and when
 * an adapter exists the canvas remounts exactly once with three's
 * WebGPURenderer (dynamic import of "three/webgpu" keeps it out of the
 * WebGL bundle). Every backend-dependent consumer reads useRendererMode()
 * from lib/renderer-mode — e.g. the WebGL-only pmndrs Bloom pass.
 * Rendering intent (colour + tone mapping) is identical on both backends:
 * sRGB output, ACES filmic tone mapping.
 */

import { createLogger } from "@elbtronika/logger";
import { AdaptiveDpr, PerformanceMonitor, Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { lazy, memo, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { CanvasErrorBoundary } from "./components/CanvasErrorBoundary";
import { useWebGPUDetection } from "./hooks/useWebGPUDetection";
import { detectWebGPU, markRendererMode } from "./lib/renderer-mode";
import { useThreeStore } from "./store";

const log = createLogger("three/CanvasRoot");

/** Lazy-loaded dev-only FPS stats – tree-shaken in production */
const DevStats = lazy(() => import("@react-three/drei").then((mod) => ({ default: mod.Stats })));

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

/** Shared rendering intent for both backends. */
function applyRenderIntent(renderer: {
  outputColorSpace?: unknown;
  toneMapping?: unknown;
  toneMappingExposure?: number;
  setClearColor?: (color: number, alpha: number) => void;
}) {
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setClearColor?.(0x0a0a0b, 1);
}

/**
 * Async renderer factory for the WebGPU path. Falls back to the default
 * WebGL renderer construction if "three/webgpu" is unavailable or init fails.
 */
async function createWebGPURenderer(props: { canvas?: unknown } & Record<string, unknown>) {
  try {
    const { WebGPURenderer } = await import("three/webgpu");
    const renderer = new WebGPURenderer({
      canvas: props.canvas as never,
      antialias: true,
    });
    await renderer.init();
    markRendererMode("webgpu");
    log.info("WebGPURenderer active");
    applyRenderIntent(renderer as never);
    return renderer;
  } catch (err) {
    log.warn("WebGPU init failed — falling back to WebGL", {
      error: err instanceof Error ? err.message : String(err),
    });
    const { WebGLRenderer } = await import("three");
    const renderer = new WebGLRenderer({
      canvas: props.canvas as never,
      antialias: true,
      powerPreference: "high-performance",
    });
    markRendererMode("webgl");
    applyRenderIntent(renderer as never);
    return renderer;
  }
}

export const CanvasRoot = memo(function CanvasRoot() {
  const mode = useThreeStore((s) => s.mode);
  // WebGPU detection cookie for SSR heuristics (kept for compatibility)
  useWebGPUDetection();

  // Real capability probe → switch the canvas to the WebGPU factory once.
  const [gpuReady, setGpuReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    detectWebGPU().then((supported) => {
      if (cancelled) return;
      if (supported) {
        setGpuReady(true);
      } else {
        markRendererMode("webgl");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
    (state: {
      gl: {
        setClearColor?: (color: number, alpha: number) => void;
        isWebGPURenderer?: boolean;
      };
    }) => {
      applyRenderIntent(state.gl as never);
      if (!state.gl.isWebGPURenderer) {
        markRendererMode("webgl");
      }
    },
    [],
  );

  const glProp = useMemo(() => {
    if (gpuReady) {
      return (props: Record<string, unknown>) => createWebGPURenderer(props);
    }
    // Default WebGL options — identical to the pre-WebGPU behaviour.
    return {
      antialias: true,
      powerPreference: "high-performance" as const,
    };
  }, [gpuReady]);

  return (
    <div
      aria-hidden={isVisible ? undefined : "true"}
      role="img"
      aria-label="3D Galerie-Ansicht"
      style={containerStyle}
    >
      <CanvasErrorBoundary>
        <Canvas
          key={gpuReady ? "webgpu" : "webgl"}
          gl={glProp as never}
          camera={{ position: [0, 1.6, 5], fov: 60, near: 0.1, far: 500 }}
          shadows="soft"
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
          onCreated={handleCreated}
          frameloop={mode === "classic" ? "demand" : "always"}
        >
          {/* Automatic quality scaling – reduces DPR on low-end devices */}
          <AdaptiveDpr pixelated />
          <PerformanceMonitor
            onDecline={() => {
              log.warn("Performance declined – DPR reduced by AdaptiveDpr");
            }}
            flipflops={3}
            onFallback={() => {
              log.warn("Entering fallback quality mode");
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
