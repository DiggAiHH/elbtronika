"use client";

/**
 * GalleryRoom – a single room volume in the 3D gallery.
 *
 * Renders:
 * – Floor plane (dark concrete texture placeholder)
 * – Walls (4 planes with emissive trim)
 * – Ceiling
 * – Ambient + spot lighting
 * – Up to N ArtworkMesh slots defined by `slots` prop
 *
 * ARCHITECTURE NOTE (ADR 0007):
 * Rooms are registered in the ThreeStore on mount so the ScrollSpline
 * and HUD can read their IDs without prop-drilling.
 */
import { useEffect } from "react";
import { BloomPass } from "../post/Bloom";
import { type RoomConfig, useThreeStore } from "../store";
import { ArtworkMesh, type ArtworkMeshProps } from "./Artwork";

interface RoomSlot {
  /** Artwork data from Sanity for this slot */
  artwork: Omit<ArtworkMeshProps, "position" | "rotationY"> | null;
  /** Override position; defaults to pre-defined wall positions */
  position?: [number, number, number];
  /** Override rotation Y */
  rotationY?: number;
}

interface GalleryRoomProps {
  id: string;
  name: string;
  slug: string;
  slots: [RoomSlot, RoomSlot, RoomSlot]; // Exactly 3 artwork slots per room
  /** Offset the entire room along X axis for multi-room layouts */
  offsetX?: number;
}

/** Default slot positions along room walls */
const SLOT_POSITIONS: [number, number, number][] = [
  [0, 1.5, -4.8], // Centre back wall
  [-3.8, 1.5, -2.5], // Left wall
  [3.8, 1.5, -2.5], // Right wall
];

const SLOT_ROTATIONS: number[] = [
  0, // Back wall faces viewer
  Math.PI / 2, // Left wall
  -Math.PI / 2, // Right wall
];

// Room dimensions
const W = 10;
const H = 4;
const D = 10;

export function GalleryRoom({ id, name, slug, slots, offsetX = 0 }: GalleryRoomProps) {
  const registerRoom = useThreeStore((s) => s.registerRoom);

  useEffect(() => {
    const config: RoomConfig = {
      id,
      slug,
      name,
      artworkIds: slots.filter((s) => s.artwork !== null).map((s) => s.artwork?.artworkId),
    };
    registerRoom(config);
  }, [id, slug, name, slots, registerRoom]);

  return (
    <group position={[offsetX, 0, 0]}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#0d0d10" roughness={0.95} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#080809" roughness={1.0} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, H / 2, -D / 2]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#111114" roughness={0.9} />
      </mesh>

      {/* Front wall */}
      <mesh position={[0, H / 2, D / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#111114" roughness={0.9} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-W / 2, H / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial color="#111114" roughness={0.9} />
      </mesh>

      {/* Right wall */}
      <mesh position={[W / 2, H / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial color="#111114" roughness={0.9} />
      </mesh>

      {/* Lighting */}
      <ambientLight intensity={0.1} />
      <spotLight
        position={[0, H - 0.2, 0]}
        intensity={2}
        angle={0.6}
        penumbra={0.5}
        castShadow
        color="#ffffff"
      />
      {/* Neon trim lights matching brand palette */}
      <pointLight position={[0, 0.1, 0]} intensity={0.3} color="#00f5d4" />
      <pointLight position={[0, H - 0.1, 0]} intensity={0.2} color="#f720b8" />

      {/* Artwork slots */}
      {slots.map((slot, i) => {
        if (!slot.artwork) return null;
        const pos = slot.position ?? SLOT_POSITIONS[i] ?? [0, 1.5, -4.8];
        const rotY = slot.rotationY ?? SLOT_ROTATIONS[i] ?? 0;
        return (
          <ArtworkMesh
            key={slot.artwork.artworkId}
            {...slot.artwork}
            position={pos}
            rotationY={rotY}
          />
        );
      })}

      {/* Bloom applied per-room */}
      <BloomPass intensity={0.5} luminanceThreshold={0.8} />
    </group>
  );
}
