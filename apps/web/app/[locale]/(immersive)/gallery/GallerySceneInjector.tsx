"use client";

/**
 * GallerySceneInjector – pushes Room1 scene + mode into ThreeStore on mount.
 *
 * This is the bridge between the SSR-fetched Sanity data and the client-side
 * Three.js canvas. It has no visible UI itself.
 */
import { useEffect, useMemo } from "react";
import type { ComponentType } from "react";
import { useThreeStore, Room1Scene } from "@elbtronika/three";
import type { ArtworkMeshProps } from "@elbtronika/three";

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
  const setActiveScene = useThreeStore((s) => s.setActiveScene);

  // Map Sanity artworks to ArtworkMesh props
  const meshArtworks: Array<Omit<ArtworkMeshProps, "position" | "rotationY"> | null> =
    useMemo(
      () =>
        artworks.map((aw) => ({
          artworkId: aw._id,
          slug: aw.slug?.current ?? aw._id,
          title: aw.title ?? "Untitled",
          imageUrl: aw.imageUrl ?? "/images/placeholder-artwork.svg",
          width: 1.8,
          height: 2.5,
        })),
      [artworks],
    );

  // Create a stable wrapper component that captures artwork data in closure.
  const SceneWrapper = useMemo<ComponentType<unknown>>(() => {
    return function SceneWrapperComponent() {
      return <Room1Scene artworks={meshArtworks} />;
    };
  }, [meshArtworks]);

  useEffect(() => {
    // Switch canvas to immersive mode when gallery route is active
    setMode("immersive");
    setCurrentRoom("room-1");
    setActiveScene(SceneWrapper);

    return () => {
      // Switch back to classic mode on unmount (route change away from gallery)
      setMode("classic");
      setCurrentRoom(null);
      setActiveScene(null);
    };
  }, [setMode, setCurrentRoom, setActiveScene, SceneWrapper]);

  return null;
}
