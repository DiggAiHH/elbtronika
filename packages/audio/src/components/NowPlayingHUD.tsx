"use client";

/**
 * NowPlayingHUD – persistent audio control bar in immersive mode.
 *
 * Shows active track label, master volume slider, and mute toggle.
 */

import { useAudioStore } from "../store";

export function NowPlayingHUD() {
  const activeTrackId = useAudioStore((s) => s.activeTrackId);
  const masterVolume = useAudioStore((s) => s.masterVolume);
  const mutedUntil = useAudioStore((s) => s.mutedUntil);
  const setMasterVolume = useAudioStore((s) => s.setMasterVolume);
  const toggleMute = useAudioStore((s) => s.toggleMute);

  const isMuted = mutedUntil !== null && mutedUntil > Date.now();

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "0.75rem 1.25rem",
        backgroundColor: "rgba(10,10,11,0.85)",
        backdropFilter: "blur(8px)",
        borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "rgba(255,255,255,0.9)",
        fontSize: "0.875rem",
        fontFamily: "inherit",
      }}
    >
      <span
        style={{
          minWidth: "8rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {activeTrackId ?? "No track"}
      </span>

      <button
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute" : "Mute"}
        style={{
          background: "none",
          border: "none",
          color: isMuted ? "#f720b8" : "#00f5d4",
          cursor: "pointer",
          fontSize: "1rem",
          padding: "0.25rem",
        }}
      >
        {isMuted ? "🔇" : "🔊"}
      </button>

      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={isMuted ? 0 : masterVolume}
        onChange={(e) => setMasterVolume(Number(e.target.value))}
        aria-label="Master volume"
        style={{
          width: "6rem",
          accentColor: "#00f5d4",
        }}
      />
    </div>
  );
}
