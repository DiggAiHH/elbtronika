// @elbtronika/audio — barrel exports

export { AudioUnlockOverlay } from "./components/AudioUnlockOverlay";
export { NowPlayingHUD } from "./components/NowPlayingHUD";
export { getAudioContext, isUnlocked, tryResumeFromSession, unlockAudioContext } from "./context";
export { HLSLoader } from "./engine/HLSLoader";
export { RoomReverb } from "./engine/RoomReverb";
export { computeGain, SpatialAudioEngine } from "./engine/SpatialAudioEngine";
export { useModeTransitionAudio } from "./hooks/useModeTransitionAudio";
export { useProximityAudio } from "./hooks/useProximityAudio";
export type { AudioStore } from "./store";
export { useAudioStore } from "./store";
