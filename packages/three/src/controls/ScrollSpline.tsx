"use client";

/**
 * ScrollSpline – drives camera position along a CatmullRom spline via scroll.
 *
 * ARCHITECTURE NOTES (ADR 0007):
 * 1. Camera position is NEVER set via setState – only via camera.position.copy()
 *    inside useFrame (mutable ref pattern).
 * 2. scrollT is stored in a ref, not state, to avoid React re-renders.
 * 3. Mobile: DeviceOrientationEvent tilt + auto-scroll step if no manual scroll.
 * 4. useFrame runs unconditionally; it no-ops when mode !== "immersive".
 */
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CatmullRomCurve3, Vector3 } from "three";
import { useThreeStore } from "../store";

interface SplinePoint {
  x: number;
  y: number;
  z: number;
}

interface ScrollSplineProps {
  /** Control points defining the camera path through the room(s) */
  points: SplinePoint[];
  /** Number of points sampled on the curve for smoothing */
  curveSegments?: number;
  /** Target look-at offset ahead of camera position along path */
  lookAheadT?: number;
}

export function ScrollSpline({
  points,
  curveSegments: _curveSegments = 200,
  lookAheadT = 0.02,
}: ScrollSplineProps) {
  const { camera } = useThree();
  const mode = useThreeStore((s) => s.mode);
  const setCameraPosition = useThreeStore.getState().setCameraPosition;

  // Mutable refs – never cause re-renders
  const scrollTRef = useRef(0);
  const targetTRef = useRef(0);
  const autoScrollRef = useRef(false);
  const deviceTiltRef = useRef({ x: 0, y: 0 });

  // Build CatmullRom curve from props
  const curve = useRef<CatmullRomCurve3>(
    new CatmullRomCurve3(
      points.map((p) => new Vector3(p.x, p.y, p.z)),
      false,
      "catmullrom",
      0.5,
    ),
  );

  // Rebuild curve if points change
  useEffect(() => {
    curve.current = new CatmullRomCurve3(
      points.map((p) => new Vector3(p.x, p.y, p.z)),
      false,
      "catmullrom",
      0.5,
    );
  }, [points]);

  // Scroll listener
  useEffect(() => {
    function handleScroll() {
      const scrollable = document.body.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      scrollTRef.current = Math.min(1, Math.max(0, window.scrollY / scrollable));
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // DeviceOrientation for mobile tilt
  useEffect(() => {
    function handleOrientation(e: DeviceOrientationEvent) {
      // gamma: left/right tilt (-90 to +90)
      // beta:  front/back tilt (–180 to +180)
      deviceTiltRef.current = {
        x: (e.beta ?? 0) / 90,
        y: (e.gamma ?? 0) / 90,
      };
      // On mobile, if no scroll happened, auto-scroll forward slowly
      autoScrollRef.current = true;
    }
    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  const lookAtPos = useRef(new Vector3());
  const camPos = useRef(new Vector3());

  useFrame((_, delta) => {
    if (mode !== "immersive") return;

    // Mobile auto-scroll: nudge T forward if device is tilted forward
    if (autoScrollRef.current) {
      const forwardTilt = deviceTiltRef.current.x; // positive = leaning forward
      scrollTRef.current = Math.min(1, Math.max(0, scrollTRef.current + forwardTilt * delta * 0.05));
    }

    // Lerp current T toward target for smooth easing
    targetTRef.current += (scrollTRef.current - targetTRef.current) * (1 - Math.pow(0.001, delta));
    const t = targetTRef.current;

    // Sample position on curve
    curve.current.getPointAt(Math.min(1, t), camPos.current);
    camera.position.copy(camPos.current);

    // Look ahead along the path
    curve.current.getPointAt(Math.min(1, t + lookAheadT), lookAtPos.current);
    camera.lookAt(lookAtPos.current);

    // Update store for HUD minimap (mutable, no re-render)
    setCameraPosition([camera.position.x, camera.position.y, camera.position.z]);
  });

  return null; // R3F hook-only component
}
