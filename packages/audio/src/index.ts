// @elbtronika/audio — barrel exports
export { getAudioContext, unlockAudioContext, isUnlocked, tryResumeFromSession } from "./context";
export { useAudioStore } from "./store";
export type { AudioStore } from "./store";
export { useProximityAudio } from "./hooks/useProximityAudio";
export { useModeTransitionAudio } from "./hooks/useModeTransitionAudio";
export { SpatialAudioEngine, computeGain } from "./engine/SpatialAudioEngine";
export { HLSLoader } from "./engine/HLSLoader";
export { RoomReverb } from "./engine/RoomReverb";
export { AudioUnlockOverlay } from "./components/AudioUnlockOverlay";
export { NowPlayingHUD } from "./components/NowPlayingHUD";
