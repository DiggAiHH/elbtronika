// Phase 7 – packages/three barrel export
export { CanvasRoot } from "./CanvasRoot";
export { useThreeStore } from "./store";
export type { ThreeStore, ThreeMode } from "./store";
export { ArtworkMesh } from "./components/Artwork";
export { GalleryRoom } from "./components/Room";
export { ScrollSpline } from "./controls/ScrollSpline";
export { GalleryHUD } from "./components/HUD";
export { detectWebGPU, setWebGPUCookie, getWebGPUCookie } from "./lib/feature-detection";
