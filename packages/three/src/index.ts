// Phase 7 – packages/three barrel export
export { CanvasRoot } from "./CanvasRoot";
export { useThreeStore } from "./store";
export type { ThreeStore, ThreeMode } from "./store";
export { ArtworkMesh } from "./components/Artwork";
export type { ArtworkMeshProps } from "./components/Artwork";
export { GalleryRoom } from "./components/Room";
export { Room1Scene } from "./scenes/Room1";
export { LobbyScene } from "./scenes/Lobby";
export { ScrollSpline } from "./controls/ScrollSpline";
export { GalleryHUD } from "./components/HUD";
export { ModeToggle } from "./components/ModeToggle";
export { TransitionOverlay } from "./components/TransitionOverlay";
export { detectWebGPU, setWebGPUCookie, getWebGPUCookie } from "./lib/feature-detection";
