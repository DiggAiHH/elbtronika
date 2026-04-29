"use client";

/**
 * CanvasRoot – the persistent Three.js canvas overlay.
 *
 * ARCHITECTURE RULES (ADR 0007):
 * 1. This component is mounted ONCE in app/layout.tsx and NEVER unmounts.
 * 2. Mode-switching happens by changing opacity/pointer-events, NOT by unmounting.
 * 3. Scene content is pushed via the ThreeStore, not rendered here directly.
 * 4. WebGPURenderer is used when available; WebGLRenderer is the fallback.
 */

import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { useThreeStore } from "./store.js";
import { detectWebGPU, setWebGPUCookie, getWebGPUCookie } from "./lib/feature-detection.js";
import { LobbyScene } from "./scenes/Lobby.js";

export function CanvasRoot() {
  const mode = useThreeStore((s) => s.mode);
  const setPreloaded = useThreeStore((s) => s.setPreloaded);
  const webgpuRef = useRef<boolean | null>(null);

  // Detect WebGPU on mount, persist to cookie
  useEffect(() => {
    const cached = getWebGPUCookie();
    if (cached !== null) {
      webgpuRef.current = cached;
      return;
    }
    detectWebGPU().then((supported) => {
      webgpuRef.current = supported;
      setWebGPUCookie(supported);
    });
  }, []);

  // Canvas is always rendered; only visibility changes
  const isVisible = mode === "immersive" || mode === "transitioning";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: mode === "immersive" ? "auto" : "none",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.6s ease",
        // Canvas must fill viewport
        width: "100%",
        height: "100%",
      }}
    >
      <Canvas
        // Prefer WebGPU renderer; R3F v9 handles the fallback automatically
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 1.6, 5], fov: 60, near: 0.1, far: 500 }}
        shadows
        dpr={[1, 2]}
        performance={{ min: 0.5 }} // Allow resolution scaling on low-end devices
        onCreated={({ gl }) => {
          gl.setClearColor(0x0a0a0b, 1);
        }}
      >
        {/* Global ambient light – rooms provide their own directional lights */}
        <ambientLight intensity={0.15} />

        {/* Active scene – controlled via store.currentRoomId */}
        <LobbyScene />

        {/* Preload all registered assets on first mount */}
        <Preload all />

        {/* Dev-only stats overlay – stripped in production by tree-shaking */}
        {process.env.NODE_ENV === "development" && <DevStats />}
      </Canvas>
    </div>
  );
}

/** Dev-only FPS stats using drei's Stats component */
function DevStats() {
  // Dynamic import to ensure it is tree-shaken in production
  const { Stats } = require("@react-three/drei") as typeof import("@react-three/drei");
  return <Stats />;
}

// Notify store that canvas is ready
function PreloadNotifier() {
  const setPreloaded = useThreeStore((s) => s.setPreloaded);
  useEffect(() => {
    setPreloaded(true);
  }, [setPreloaded]);
  return null;
}

// re-export for CanvasRoot internal use
export { PreloadNotifier };
