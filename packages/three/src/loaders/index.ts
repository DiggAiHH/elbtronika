/**
 * Draco decoder loader – uses Web Worker to avoid blocking the main thread.
 *
 * Usage: call initDracoLoader(gl) once in CanvasRoot onCreated.
 * drei's useGLTF will pick up the configured DRACOLoader automatically.
 */

import type { WebGLRenderer } from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";

// Draco decoder WASM is served from the CDN path below.
// In production these files are on the same domain (R2 / Netlify edge cache).
const DRACO_CDN = "/three/draco/";
const KTX2_CDN = "/three/basis/";

let dracoLoader: DRACOLoader | null = null;
let ktx2Loader: KTX2Loader | null = null;

/** Initialise and return the singleton DRACOLoader. */
export function getDracoLoader(): DRACOLoader {
  if (!dracoLoader) {
    dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(DRACO_CDN);
    dracoLoader.setDecoderConfig({ type: "wasm" });
    dracoLoader.preload();
  }
  return dracoLoader;
}

/** Initialise and return the singleton KTX2Loader. Requires WebGLRenderer. */
export function getKTX2Loader(renderer: WebGLRenderer): KTX2Loader {
  if (!ktx2Loader) {
    ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath(KTX2_CDN);
    ktx2Loader.detectSupport(renderer);
  }
  return ktx2Loader;
}

/** Call from R3F <Canvas onCreated> to wire loaders into drei's useGLTF cache. */
export async function initLoaders(renderer: WebGLRenderer): Promise<void> {
  const { useGLTF } = await import("@react-three/drei");
  useGLTF.setDecoderPath(DRACO_CDN);
  getKTX2Loader(renderer);
}
