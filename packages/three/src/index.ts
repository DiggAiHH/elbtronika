// Phase 7 – packages/three barrel export
export { CanvasRoot } from "./CanvasRoot.js";
export { useThreeStore } from "./store.js";
export type { ThreeStore, ThreeMode } from "./store.js";
export { ArtworkMesh } from "./components/Artwork.js";
export { GalleryRoom } from "./components/Room.js";
export { ScrollSpline } from "./controls/ScrollSpline.js";
export { GalleryHUD } from "./components/HUD.js";
export { detectWebGPU, setWebGPUCookie, getWebGPUCookie } from "./lib/feature-detection.js";
