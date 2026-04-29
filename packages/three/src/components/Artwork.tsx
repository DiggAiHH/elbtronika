"use client";

/**
 * ArtworkMesh – renders a single artwork as a Three.js plane with a texture.
 *
 * ARCHITECTURE RULES (ADR 0007):
 * 1. Proximity detection runs in useFrame with MUTABLE REFS – never setState.
 * 2. The proximity map in the store is mutated directly (not diffed via setState).
 * 3. Interactive hover uses onPointerEnter/Leave for cursor feedback only.
 * 4. Max 10 active proximity tracks to limit audio worker overhead.
 */
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Html } from "@react-three/drei";
import type { Mesh, Camera } from "three";
import { useThreeStore } from "../store";

export interface ArtworkMeshProps {
  /** Artwork Sanity document ID */
  artworkId: string;
  /** Sanity slug for navigation */
  slug: string;
  /** Artwork title for accessibility */
  title: string;
  /** Image URL (CDN, aspect-ratio agnostic) */
  imageUrl: string;
  /** Width in Three.js world units */
  width?: number;
  /** Height in Three.js world units */
  height?: number;
  /** Position in room */
  position?: [number, number, number];
  /** Rotation (radians) on Y axis */
  rotationY?: number;
  /** Called when visitor is within proximity threshold */
  onProximity?: (artworkId: string, distance: number) => void;
}

/** Distance (world units) at which proximity audio activates. */
const PROXIMITY_THRESHOLD = 8;

export function ArtworkMesh({
  artworkId,
  slug,
  title,
  imageUrl,
  width = 2,
  height = 2.8,
  position = [0, 1.5, 0],
  rotationY = 0,
  onProximity,
}: ArtworkMeshProps) {
  const meshRef = useRef<Mesh>(null);
  const distanceRef = useRef(Infinity);
  const updateProximity = useThreeStore.getState().updateProximity;

  const texture = useTexture(imageUrl);

  // Pre-compute geometry once
  const planeArgs = useMemo<[number, number]>(() => [width, height], [width, height]);

  useFrame(({ camera }: { camera: Camera }) => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;

    // Measure distance without allocating – reuse world position
    const dx = camera.position.x - (mesh.position.x + (position[0] ?? 0 - (position[0] ?? 0)));
    const dy = camera.position.y - mesh.position.y;
    const dz = camera.position.z - mesh.position.z;
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz);

    distanceRef.current = d;

    // Mutate store map directly (no re-render)
    updateProximity(artworkId, d);

    if (d < PROXIMITY_THRESHOLD) {
      onProximity?.(artworkId, d);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[0, rotationY, 0]}
    >
      <planeGeometry args={planeArgs} />
      <meshStandardMaterial
        map={texture}
        roughness={0.9}
        metalness={0.05}
      />

      {/* Accessible label at bottom of artwork – visible close-up */}
      <Html
        position={[0, -(height / 2) - 0.12, 0.01]}
        center
        style={{
          color: "rgba(255,255,255,0.75)",
          fontSize: "12px",
          fontFamily: "inherit",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {title}
      </Html>
    </mesh>
  );
}
