import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { getEnv } from "@/src/lib/env";
import { getClient } from "@/src/lib/sanity/client";
import { allArtworksQuery } from "@/src/lib/sanity/queries";
import GalleryEntryOverlay from "./GalleryEntryOverlay";
import GallerySceneInjector from "./GallerySceneInjector";

export const dynamic = "force-dynamic";

interface GalleryPageProps {
  params: Promise<{ locale: string }>;
}

type SanityArtworkRaw = {
  _id: string;
  title?: string;
  slug?: { current: string };
  image?: { asset?: { url?: string } };
  artist?: { _id?: string };
  isDemo?: boolean;
};

type GalleryArtwork = {
  _id: string;
  title?: string;
  slug?: { current: string };
  imageUrl?: string;
  artistId?: string;
};

/** The hall renders up to 12 works (8 walls + 4 inner pillars). */
const MAX_HALL_ARTWORKS = 12;

export async function generateMetadata({ params }: GalleryPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gallery" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gallery" });

  // Fetch the whole collection for the Main Hall (mode-filtered like the shop)
  let artworks: SanityArtworkRaw[] = [];
  try {
    const data = await getClient().fetch<SanityArtworkRaw[]>(
      allArtworksQuery,
      {},
      { next: { revalidate: 60 } },
    );
    artworks = Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("[gallery] sanity fetch failed; using empty fallback", err);
  }

  const { ELT_MODE } = getEnv();
  const visible = artworks.filter((artwork) => {
    if (ELT_MODE === "demo") return artwork.isDemo === true;
    if (ELT_MODE === "live") return artwork.isDemo !== true;
    return true; // staging shows both
  });

  const roomArtworks: GalleryArtwork[] = visible.slice(0, MAX_HALL_ARTWORKS).map((aw) => ({
    _id: aw._id,
    ...(aw.title ? { title: aw.title } : {}),
    ...(aw.slug ? { slug: aw.slug } : {}),
    ...(aw.image?.asset?.url ? { imageUrl: aw.image.asset.url } : {}),
    ...(aw.artist?._id ? { artistId: aw.artist._id } : {}),
  }));

  return (
    <>
      {/*
        The 3D canvas is already mounted globally in layout.tsx (CanvasRoot).
        This page:
        1. Injects the Main Hall scene data into the Three.js store via a client component.
        2. Renders the tall scroll container that drives camera-spline progress.
        3. Provides accessible fallback for screen readers / no-JS.
      */}
      <Suspense fallback={null}>
        <GallerySceneInjector artworks={roomArtworks} locale={locale} />
      </Suspense>

      <GalleryEntryOverlay locale={locale} />

      {/* Tall scroll container drives Three.js spline via window.scrollY */}
      <div
        style={{ height: "400vh", position: "relative", pointerEvents: "none" }}
        aria-hidden="true"
      />

      {/* Accessible fallback */}
      <noscript>
        <p style={{ padding: "2rem", color: "rgba(255,255,255,0.7)" }}>{t("noScript")}</p>
      </noscript>
    </>
  );
}
