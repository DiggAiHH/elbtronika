/**
 * useModeTransitionAudio – fades audio when switching between immersive and classic modes.
 *
 * RULES:
 * - Immersive → Classic: dim ambient to 30%, pause artwork audio
 * - Classic → Immersive: restore ambient to previous level, resume artwork audio
 * - Transition takes 1200ms; audio fades smoothly
 */

import { useEffect, useRef } from "react";
import { useAudioStore } from "../store";

const CLASSIC_AMBIENT_VOLUME = 0.3;

export function useModeTransitionAudio(mode: "immersive" | "classic" | "transitioning") {
  const setMasterVolume = useAudioStore((s) => s.setMasterVolume);
  const setIsPlaying = useAudioStore((s) => s.setIsPlaying);
  const previousVolumeRef = useRef<number>(0.8);

  useEffect(() => {
    if (mode === "transitioning") {
      // Save current volume before fading
      previousVolumeRef.current = useAudioStore.getState().masterVolume;
      return;
    }

    if (mode === "classic") {
      // Fade ambient down to 30%
      setMasterVolume(CLASSIC_AMBIENT_VOLUME);
      // Pause artwork audio
      setIsPlaying(false);
    } else if (mode === "immersive") {
      // Restore previous volume
      setMasterVolume(previousVolumeRef.current);
      // Resume artwork audio
      setIsPlaying(true);
    }
  }, [mode, setMasterVolume, setIsPlaying]);
}
