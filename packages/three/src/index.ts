// Phase 7 – packages/three barrel export
export { CanvasRoot } from "./CanvasRoot";
export type { ArtworkMeshProps } from "./components/Artwork";
export { ArtworkMesh } from "./components/Artwork";
export { CanvasErrorBoundary } from "./components/CanvasErrorBoundary";
export { GalleryHUD } from "./components/HUD";
export { ModeToggle } from "./components/ModeToggle";
export { GalleryRoom } from "./components/Room";
export { TransitionOverlay } from "./components/TransitionOverlay";
export { detectWebGPU, getWebGPUCookie, setWebGPUCookie } from "./lib/feature-detection";
export { LobbyScene } from "./scenes/Lobby";
export { Room1Scene } from "./scenes/Room1";
export type { ThreeMode, ThreeStore } from "./store";
export { useThreeStore } from "./store";
