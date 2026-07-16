"use client";

/**
 * renderer-mode — single source of truth for which backend actually renders.
 *
 * `detectWebGPU()` performs the real capability probe (navigator.gpu +
 * adapter request), not just a property sniff. `markRendererMode()` is set by
 * CanvasRoot once the renderer is constructed; scenes subscribe via
 * `useRendererMode()` to make backend-dependent choices (e.g. the pmndrs
 * Bloom pass is WebGL-only and must not mount under WebGPU).
 *
 * Kept outside the zustand store on purpose: renderer capability is not
 * scene state, and this module must be importable from anywhere without
 * pulling the store's dependency graph.
 */

import { useSyncExternalStore } from "react";

export type RendererMode = "webgl" | "webgpu" | "unknown";

let currentMode: RendererMode = "unknown";
const listeners = new Set<() => void>();

export function markRendererMode(mode: RendererMode): void {
  if (mode === currentMode) return;
  currentMode = mode;
  for (const listener of listeners) listener();
}

export function getRendererMode(): RendererMode {
  return currentMode;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** React hook — re-renders when the backend is known/changes. SSR-safe. */
export function useRendererMode(): RendererMode {
  return useSyncExternalStore(subscribe, getRendererMode, () => "unknown" as const);
}

/**
 * True when the browser can actually create a WebGPU adapter.
 * Resolves false on SSR, jsdom, and browsers without navigator.gpu.
 */
export async function detectWebGPU(): Promise<boolean> {
  try {
    if (typeof navigator === "undefined") return false;
    const gpu = (navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu;
    if (!gpu) return false;
    const adapter = await gpu.requestAdapter();
    return adapter != null;
  } catch {
    return false;
  }
}
