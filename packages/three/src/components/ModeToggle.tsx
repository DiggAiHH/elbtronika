"use client";

/**
 * ModeToggle – switches between immersive (3D gallery) and classic (shop) modes.
 *
 * Triggers a 1200ms transition via ThreeStore.transitionToMode().
 *
 * OPTIMIZATIONS (ADR 0017):
 * - React.memo prevents re-renders from unrelated store changes.
 * - useCallback stabilises the transition handler.
 * - aria-pressed communicates toggle state to assistive tech.
 * - aria-live region announces transition status.
 * - prefers-reduced-motion disables the CSS transition.
 * - Keyboard shortcuts: Escape → Lobby, Space → Toggle mode.
 */

import { memo, useCallback, useEffect, useMemo } from "react";
import { useThreeStore } from "../store";

export const ModeToggle = memo(function ModeToggle() {
  const mode = useThreeStore((s) => s.mode);
  const transitionToMode = useThreeStore((s) => s.transitionToMode);

  const isTransitioning = mode === "transitioning";
  const isClassic = mode === "classic";

  const handleToggle = useCallback(() => {
    if (isTransitioning) return;
    transitionToMode(isClassic ? "immersive" : "classic");
  }, [isTransitioning, isClassic, transitionToMode]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isClassic) {
        event.preventDefault();
        transitionToMode("classic");
      }
      if (event.key === " " && event.target === document.body) {
        event.preventDefault();
        handleToggle();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isClassic, transitionToMode, handleToggle]);

  // Respect motion preference (WCAG 2.1 Criterion 2.2.2)
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const buttonStyle = useMemo(
    () => ({
      position: "fixed" as const,
      top: "1.5rem",
      right: "1.5rem",
      zIndex: 40,
      padding: "0.5rem 1rem",
      fontSize: "0.875rem",
      letterSpacing: "0.05em",
      textTransform: "uppercase" as const,
      color: "#0a0a0b",
      backgroundColor: isTransitioning ? "rgba(255,255,255,0.3)" : "#00f5d4",
      border: "none",
      borderRadius: "4px",
      cursor: isTransitioning ? "wait" : "pointer",
      opacity: isTransitioning ? 0.6 : 1,
      transition: prefersReducedMotion
        ? "none"
        : "opacity 0.3s ease, background-color 0.3s ease",
    }),
    [isTransitioning, prefersReducedMotion],
  );

  return (
    <>
      {/* aria-live region for screen-reader transition announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isTransitioning
          ? "Switching mode, please wait..."
          : isClassic
            ? "Classic shop mode active"
            : "Immersive gallery mode active"}
      </div>
      <button
        onClick={handleToggle}
        disabled={isTransitioning}
        aria-label={isClassic ? "Enter Gallery" : "Enter Shop"}
        aria-pressed={!isClassic}
        style={buttonStyle}
      >
        {isTransitioning ? "Transitioning..." : isClassic ? "Gallery →" : "← Shop"}
      </button>
    </>
  );
});
