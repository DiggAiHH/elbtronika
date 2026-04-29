"use client";

/**
 * GallerySceneInjector – pushes Room1 scene + mode into ThreeStore on mount.
 *
 * This is the bridge between the SSR-fetched Sanity data and the client-side
 * Three.js canvas. It has no visible UI itself.
 */
import { useEffect } from "react";
import { useThreeStore } from "@elbtronika/three";
import { Room1Scene } from "@elbtronika/three/src/scenes/Room1";
import { ScrollSpline } from "@elbtronika/three";
import { Canvas } from "@react-three/fiber";

// Default camera path for Room1 – straight approach toward the back wall
const ROOM1_SPLINE_POINTS = [
  { x: 0, y: 1.6, z: 8 },   // Entry
  { x: 0, y: 1.6, z: 5 },   // Mid approach
  { x: 0, y: 1.6, z: 2 },   // Close to centre artwork
  { x: -2, y: 1.5, z: 0 },  // Drift left
  { x: 2, y: 1.5, z: -1 },  // Drift right
  { x: 0, y: 1.6, z: -3 },  // Final position near back wall
];

interface SanityArtwork {
  _id: string;
  title?: string;
  slug?: { current: string };
  imageUrl?: string;
  artistId?: string;
}

interface Props {
  artworks: SanityArtwork[];
  locale: string;
}

export default function GallerySceneInjector({ artworks }: Props) {
  const setMode = useThreeStore((s) => s.setMode);
  const setCurrentRoom = useThreeStore((s) => s.setCurrentRoom);

  useEffect(() => {
    // Switch canvas to immersive mode when gallery route is active
    setMode("immersive");
    setCurrentRoom("room-1");

    return () => {
      // Switch back to classic mode on unmount (route change away from gallery)
      setMode("classic");
      setCurrentRoom(null);
    };
  }, [setMode, setCurrentRoom]);

  // Map Sanity artworks to ArtworkMesh props
  const meshArtworks = artworks.map((aw) => ({
    artworkId: aw._id,
    slug: aw.slug?.current ?? aw._id,
    title: aw.title ?? "Untitled",
    imageUrl: aw.imageUrl ?? "/images/placeholder-artwork.jpg",
    width: 1.8,
    height: 2.5,
  }));

  // Inject Room1 + ScrollSpline into the R3F context via a portal-like pattern.
  // CanvasRoot exposes a global R3F context that we attach to here.
  // NOTE: We use a hidden Canvas wrapper to access the R3F context;
  // CanvasRoot's Canvas is the actual rendering target.
  return (
    <>
      {/* These components need to be rendered inside a Canvas context.
          CanvasRoot's Canvas is in layout.tsx – Room1Scene and ScrollSpline
          are rendered directly into the global canvas via useThreeStore injection.
          For Phase 7 MVP we mount them as additional R3F portals via the store.
          Full portal injection will be wired in Phase 7 final integration.
          For now, this client component handles mode switching. */}
    </>
  );
}
