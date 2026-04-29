/**
 * Audio state store (Zustand).
 *
 * DESIGN RULES:
 * – UI-relevant state only (active track, volume, mute).
 * – Per-frame audio data (gain values, panner positions) NEVER goes in here.
 * – Spatial audio enabled flag gates proximity-driven playback.
 */
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface AudioStore {
  /** Currently playing track id (artworkId) or null */
  activeTrackId: string | null;
  /** Global play/pause state */
  isPlaying: boolean;
  /** Master volume 0..1 */
  masterVolume: number;
  /** Whether spatial audio (proximity-driven) is active */
  spatialEnabled: boolean;
  /** If set, audio is muted until this timestamp (ms since epoch) */
  mutedUntil: number | null;

  // Actions
  setActiveTrack: (id: string | null) => void;
  setIsPlaying: (val: boolean) => void;
  setMasterVolume: (vol: number) => void;
  toggleMute: () => void;
  setSpatialEnabled: (val: boolean) => void;
}

export const useAudioStore = create<AudioStore>()(
  subscribeWithSelector((set, get) => ({
    activeTrackId: null,
    isPlaying: false,
    masterVolume: 0.8,
    spatialEnabled: true,
    mutedUntil: null,

    setActiveTrack: (id) => set({ activeTrackId: id }),
    setIsPlaying: (val) => set({ isPlaying: val }),
    setMasterVolume: (vol) => set({ masterVolume: Math.max(0, Math.min(1, vol)) }),
    toggleMute: () => {
      const current = get().mutedUntil;
      if (current !== null && current > Date.now()) {
        // Unmute
        set({ mutedUntil: null });
      } else {
        // Mute indefinitely
        set({ mutedUntil: Number.MAX_SAFE_INTEGER });
      }
    },
    setSpatialEnabled: (val) => set({ spatialEnabled: val }),
  })),
);
