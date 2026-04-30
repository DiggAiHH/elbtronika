"use client";

/**
 * Room1 – first gallery room with 3 artwork slots.
 *
 * Artworks are passed in via props from the gallery route which fetches
 * them from Sanity. Empty slots render placeholder geometry.
 *
 * NAVIGATION PATTERN (ADR 0007):
 * – The gallery page calls `useThreeStore.setCurrentRoom("room-1")` on mount.
 * – ScrollSpline reads currentRoomId to know which spline path to activate.
 */
import { GalleryRoom } from "../components/Room";
import type { ArtworkMeshProps } from "../components/Artwork";

interface Room1Props {
  artworks?: Array<Omit<ArtworkMeshProps, "position" | "rotationY"> | null>;
}

/** Placeholder shown when no artwork has been assigned to a slot */
const PLACEHOLDER: Omit<ArtworkMeshProps, "position" | "rotationY"> = {
  artworkId: "placeholder",
  slug: "",
  title: "– Coming Soon –",
  imageUrl: "/images/placeholder-artwork.svg",
  width: 1.8,
  height: 2.5,
};

export function Room1Scene({ artworks = [] }: Room1Props) {
  const slot = (i: number) => artworks[i] ?? PLACEHOLDER;

  return (
    <GalleryRoom
      id="room-1"
      name="Room 1"
      slug="room-1"
      slots={[
        { artwork: slot(0) },
        { artwork: slot(1) },
        { artwork: slot(2) },
      ]}
    />
  );
}
