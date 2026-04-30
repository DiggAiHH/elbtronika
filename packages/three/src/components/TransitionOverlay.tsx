"use client";

/**
 * TransitionOverlay – visual feedback during mode switches.
 *
 * Shows a brief dark overlay with ELBTRONIKA branding while
 * the canvas fades in/out (1200ms).
 */

import { useThreeStore } from "../store";

export function TransitionOverlay() {
  const mode = useThreeStore((s) => s.mode);
  const isTransitioning = mode === "transitioning";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 30,
        backgroundColor: "#0a0a0b",
        pointerEvents: isTransitioning ? "auto" : "none",
        opacity: isTransitioning ? 1 : 0,
        transition: "opacity 0.6s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isTransitioning && (
        <div
          style={{
            color: "#00f5d4",
            fontSize: "1rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            animation: "pulse 1.2s ease-in-out infinite",
          }}
        >
          ELBTRONIKA
        </div>
      )}
    </div>
  );
}
