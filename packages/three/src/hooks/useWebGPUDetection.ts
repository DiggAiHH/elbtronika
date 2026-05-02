"use client";

import { useSyncExternalStore } from "react";
import { detectWebGPU, getWebGPUCookie, setWebGPUCookie } from "../lib/feature-detection";

let cached: boolean | null = null;

function subscribe(callback: () => void) {
  // WebGPU detection is one-shot; no re-subscription needed
  if (cached === null) {
    Promise.resolve().then(() => {
      detectWebGPU().then((supported) => {
        cached = supported;
        setWebGPUCookie(supported);
        callback();
      });
    });
  }
  return () => {};
}

function getSnapshot(): boolean | null {
  if (cached !== null) return cached;
  const cookie = getWebGPUCookie();
  if (cookie !== null) {
    cached = cookie;
    return cookie;
  }
  return null;
}

function getServerSnapshot(): boolean | null {
  return null;
}

/**
 * Hook that returns the WebGPU support status.
 *
 * - Reads from cookie cache first (instant on re-mounts)
 * - Falls back to async detection on first mount
 * - Returns `null` while detecting
 */
export function useWebGPUDetection(): boolean | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
