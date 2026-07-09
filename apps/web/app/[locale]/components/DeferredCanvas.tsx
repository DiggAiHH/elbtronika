"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * DeferredCanvas — loads the persistent Three.js / WebGPU canvas off the
 * critical path.
 *
 * WHY: CanvasRoot + GalleryHUD pull in ~0.8–1.9 MB of Three.js / R3F. When they
 * are rendered eagerly in the root layout, Next preloads that chunk on EVERY
 * route, even purely 2D pages (home, shop, about). Mounting them after the
 * browser is idle keeps the single-canvas architecture intact (it still mounts
 * exactly once and never unmounts) while removing the heavy bundle from first
 * paint / LCP on non-immersive pages.
 *
 * ssr:false is valid here because this is a Client Component.
 */
const CanvasRoot = dynamic(
  () => import("@elbtronika/three").then((m) => ({ default: m.CanvasRoot })),
  { ssr: false, loading: () => null },
);

const GalleryHUD = dynamic(
  () => import("@elbtronika/three").then((m) => ({ default: m.GalleryHUD })),
  { ssr: false, loading: () => null },
);

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export function DeferredCanvas() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const w = window as IdleWindow;
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (typeof w.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(() => setReady(true), { timeout: 2000 });
    } else {
      timeoutId = setTimeout(() => setReady(true), 200);
    }

    return () => {
      if (idleId !== undefined && typeof w.cancelIdleCallback === "function") {
        w.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  if (!ready) return null;

  return (
    <>
      <CanvasRoot />
      <GalleryHUD />
    </>
  );
}
