"use client";

/**
 * AudioUnlockOverlay – DOM overlay that blocks the experience until
 * the user clicks "Enter Experience" to unlock the AudioContext.
 *
 * - z-50 to sit above everything.
 * - Reads sessionStorage to hide if already unlocked.
 */

import { useCallback, useEffect, useState } from "react";
import { isUnlocked, unlockAudioContext } from "../context";

export function AudioUnlockOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check on mount – if already unlocked this session, hide immediately
    if (!isUnlocked()) {
      setVisible(true);
    }
  }, []);

  const handleUnlock = useCallback(async () => {
    await unlockAudioContext();
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(10,10,11,0.95)",
        backdropFilter: "blur(8px)",
      }}
    >
      <button
        onClick={handleUnlock}
        style={{
          padding: "1rem 2.5rem",
          fontSize: "1rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#0a0a0b",
          backgroundColor: "#00f5d4",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          transition: "transform 0.2s ease, opacity 0.2s ease",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.transform = "scale(1)";
        }}
      >
        Enter Experience
      </button>
    </div>
  );
}
