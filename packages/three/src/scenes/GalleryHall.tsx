"use client";

import { useFrame, useThree } from "@react-three/fiber";
/**
 * GalleryHall – the main immersive room, sized for the WHOLE collection.
 *
 * Unlike GalleryRoom (fixed 3-slot box), the hall arranges up to 12 artworks
 * radially on the walls of an octagonal volume around the camera-spline
 * origin: 8 framed works on the walls, up to 4 more on inner pillars.
 * Every published artwork is physically present as an object; proximity
 * (< 8 world units) drives the spatial-audio engine exactly like before.
 *
 * 2026 rendering standards:
 * - Runs on WebGPU when CanvasRoot picked three's WebGPURenderer; the pmndrs
 *   Bloom pass is WebGL-only, so it mounts conditionally via useRendererMode().
 *   Under WebGPU the glow comes from emissive materials + tone mapping alone.
 * - Cheap "picture lights": emissive LED bars above each work instead of one
 *   point light per artwork (12 dynamic lights would sink mobile GPUs).
 * - A frequency ring in the floor pulses with the room — the visual hook for
 *   the measured-audio identity of the collection.
 *
 * NAVIGATION: registers itself as "room-1" so the existing ScrollSpline
 * path and HUD keep working unchanged.
 */
import { useEffect, useMemo, useRef } from "react";
import type { Mesh, MeshStandardMaterial } from "three";
import { Fog } from "three";
import type { ArtworkMeshProps } from "../components/Artwork";
import { ArtworkMesh } from "../components/Artwork";
import { useRendererMode } from "../lib/renderer-mode";
import { BloomPass } from "../post/Bloom";
import { useThreeStore } from "../store";

export interface GalleryHallProps {
  artworks?: Array<Omit<ArtworkMeshProps, "position" | "rotationY"> | null>;
  /** Radius of the octagonal hall (world units) */
  radius?: number;
  height?: number;
}

const WALLS = 8;
const TEAL = "#00f5d4";
const MAGENTA = "#f720b8";

/** Scene fog while the hall is mounted — depth without geometry. */
function HallFog() {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const previous = scene.fog;
    scene.fog = new Fog("#0a0a0b", 6, 22);
    return () => {
      scene.fog = previous;
    };
  }, [scene]);
  return null;
}

/** Floor ring that pulses like a slow heartbeat — the room breathes. */
function FrequencyRing({ radius }: { radius: number }) {
  const matRef = useRef<MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    const mat = matRef.current;
    if (!mat) return;
    const t = clock.getElapsedTime();
    // 126 BPM pulse (2.1 Hz) with a slower swell — deterministic, no audio tap needed
    const beat = Math.max(0, Math.sin(t * Math.PI * 2 * (126 / 60))) ** 6;
    mat.emissiveIntensity = 0.35 + 0.65 * beat + 0.15 * Math.sin(t * 0.4);
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
      <ringGeometry args={[radius * 0.42, radius * 0.46, 64]} />
      <meshStandardMaterial
        ref={matRef}
        color="#062a26"
        emissive={TEAL}
        emissiveIntensity={0.5}
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  );
}

/** Museum frame + LED picture-light bar around one artwork. */
function FramedArtwork({
  artwork,
  position,
  rotationY,
}: {
  artwork: Omit<ArtworkMeshProps, "position" | "rotationY">;
  position: [number, number, number];
  rotationY: number;
}) {
  const w = artwork.width ?? 1.8;
  const h = artwork.height ?? 2.5;
  const frameRef = useRef<Mesh>(null);
  const bar = 0.06; // frame bar thickness
  const depth = 0.055;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Frame bars (top/bottom/left/right) */}
      <mesh position={[0, h / 2 + bar / 2, -0.01]} castShadow ref={frameRef}>
        <boxGeometry args={[w + bar * 2, bar, depth]} />
        <meshStandardMaterial color="#1a1a20" roughness={0.35} metalness={0.75} />
      </mesh>
      <mesh position={[0, -(h / 2) - bar / 2, -0.01]} castShadow>
        <boxGeometry args={[w + bar * 2, bar, depth]} />
        <meshStandardMaterial color="#1a1a20" roughness={0.35} metalness={0.75} />
      </mesh>
      <mesh position={[-(w / 2) - bar / 2, 0, -0.01]} castShadow>
        <boxGeometry args={[bar, h, depth]} />
        <meshStandardMaterial color="#1a1a20" roughness={0.35} metalness={0.75} />
      </mesh>
      <mesh position={[w / 2 + bar / 2, 0, -0.01]} castShadow>
        <boxGeometry args={[bar, h, depth]} />
        <meshStandardMaterial color="#1a1a20" roughness={0.35} metalness={0.75} />
      </mesh>

      {/* LED picture-light bar — emissive, costs no dynamic light */}
      <mesh position={[0, h / 2 + bar + 0.09, 0.06]}>
        <boxGeometry args={[w * 0.85, 0.035, 0.035]} />
        <meshStandardMaterial
          color="#fff7ea"
          emissive="#fff3dd"
          emissiveIntensity={1.6}
          roughness={0.3}
        />
      </mesh>

      {/* The artwork plane itself (proximity tracking lives inside) */}
      <ArtworkMesh {...artwork} position={[0, 0, 0.012]} rotationY={0} />
    </group>
  );
}

export function GalleryHall({ artworks = [], radius = 7.5, height = 4.5 }: GalleryHallProps) {
  const registerRoom = useThreeStore((s) => s.registerRoom);
  const rendererMode = useRendererMode();

  const placed = useMemo(() => {
    const items = artworks.filter(
      (a): a is Omit<ArtworkMeshProps, "position" | "rotationY"> => a !== null,
    );
    return items.slice(0, 12).map((artwork, i) => {
      // two rings: first 8 on the walls, up to 4 more on inner pillars
      const onWall = i < WALLS;
      const count = onWall ? WALLS : 4;
      const idx = onWall ? i : i - WALLS;
      const r = onWall ? radius - 0.22 : radius * 0.45;
      const angle = (idx / count) * Math.PI * 2 + (onWall ? 0 : Math.PI / 4);
      const x = Math.sin(angle) * r;
      const z = -Math.cos(angle) * r;
      return {
        artwork,
        position: [x, 1.7, z] as [number, number, number],
        // face the centre
        rotationY: Math.atan2(-x, z) + Math.PI,
        onWall,
      };
    });
  }, [artworks, radius]);

  useEffect(() => {
    registerRoom({
      id: "room-1",
      slug: "main-hall",
      name: "Main Hall",
      artworkIds: placed.map((p) => p.artwork.artworkId),
    });
  }, [registerRoom, placed]);

  const wallPanels = useMemo(
    () =>
      Array.from({ length: WALLS }, (_, i) => {
        const angle = (i / WALLS) * Math.PI * 2;
        const x = Math.sin(angle) * radius;
        const z = -Math.cos(angle) * radius;
        const width = 2 * radius * Math.tan(Math.PI / WALLS) + 0.05;
        return {
          key: `wall-${i}-${angle.toFixed(3)}`,
          position: [x, height / 2, z] as [number, number, number],
          rotationY: Math.atan2(-x, z) + Math.PI,
          width,
        };
      }),
    [radius, height],
  );

  const pillars = useMemo(
    () =>
      placed
        .filter((p) => !p.onWall)
        .map((p) => ({
          key: `pillar-${p.artwork.artworkId}`,
          position: [p.position[0], height / 2, p.position[2]] as [number, number, number],
        })),
    [placed, height],
  );

  return (
    <group>
      {/* Fog softens the far wall — depth without geometry */}
      <HallFog />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[radius + 0.6, WALLS]} />
        <meshStandardMaterial color="#0d0d10" roughness={0.92} metalness={0.05} />
      </mesh>

      <FrequencyRing radius={radius} />

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]}>
        <circleGeometry args={[radius + 0.6, WALLS]} />
        <meshStandardMaterial color="#080809" roughness={1.0} />
      </mesh>

      {/* Ceiling LED ring — brand light, zero dynamic-light cost */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, height - 0.04, 0]}>
        <ringGeometry args={[radius * 0.55, radius * 0.57, 64]} />
        <meshStandardMaterial
          color="#2a0a22"
          emissive={MAGENTA}
          emissiveIntensity={0.9}
          roughness={0.5}
        />
      </mesh>

      {/* Octagon walls */}
      {wallPanels.map((w) => (
        <mesh key={w.key} position={w.position} rotation={[0, w.rotationY, 0]}>
          <planeGeometry args={[w.width, height]} />
          <meshStandardMaterial color="#111114" roughness={0.9} />
        </mesh>
      ))}

      {/* Inner pillars carry the overflow works */}
      {pillars.map((p) => (
        <mesh key={p.key} position={p.position} castShadow>
          <boxGeometry args={[0.5, height, 0.5]} />
          <meshStandardMaterial color="#0f0f13" roughness={0.85} />
        </mesh>
      ))}

      {/* Lighting: one shadow-casting spot + brand accents (kept to 3 dynamic lights) */}
      <ambientLight intensity={0.14} />
      <spotLight
        position={[0, height - 0.2, 0]}
        intensity={2.4}
        angle={1.05}
        penumbra={0.7}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        color="#ffffff"
      />
      <pointLight position={[0, 0.15, 0]} intensity={0.4} distance={radius * 1.6} color={TEAL} />

      {/* The collection — every object, physically present and framed */}
      {placed.map((p) => (
        <FramedArtwork
          key={p.artwork.artworkId}
          artwork={p.artwork}
          position={p.position}
          rotationY={p.rotationY}
        />
      ))}

      {/* pmndrs Bloom is WebGL-only; under WebGPU the emissive materials +
          ACES tone mapping carry the glow. */}
      {rendererMode !== "webgpu" && <BloomPass intensity={0.5} luminanceThreshold={0.8} />}
    </group>
  );
}
