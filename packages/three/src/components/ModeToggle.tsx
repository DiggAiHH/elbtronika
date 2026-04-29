"use client";

/**
 * ModeToggle – switches between immersive (3D gallery) and classic (shop) modes.
 *
 * Triggers a 1200ms transition via ThreeStore.transitionToMode().
 */

import { useThreeStore } from "../store";

export function ModeToggle() {
  const mode = useThreeStore((s) => s.mode);
  const transitionToMode = useThreeStore((s) => s.transitionToMode);

  const isTransitioning = mode === "transitioning";
  const isClassic = mode === "classic";

  return (
    <button
      onClick={() => transitionToMode(isClassic ? "immersive" : "classic")}
      disabled={isTransitioning}
      aria-label={isClassic ? "Enter Gallery" : "Enter Shop"}
      style={{
        position: "fixed",
        top: "1.5rem",
        right: "1.5rem",
        zIndex: 40,
        padding: "0.5rem 1rem",
        fontSize: "0.875rem",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        color: "#0a0a0b",
        backgroundColor: isTransitioning ? "rgba(255,255,255,0.3)" : "#00f5d4",
        border: "none",
        borderRadius: "4px",
        cursor: isTransitioning ? "wait" : "pointer",
        opacity: isTransitioning ? 0.6 : 1,
        transition: "opacity 0.3s ease, background-color 0.3s ease",
      }}
    >
      {isTransitioning ? "Transitioning..." : isClassic ? "Gallery →" : "← Shop"}
    </button>
  );
}
