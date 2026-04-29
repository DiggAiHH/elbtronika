import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { getClient } from "@/lib/sanity/client";
import { allArtworksQuery } from "@/lib/sanity/queries";
import GallerySceneInjector from "./GallerySceneInjector";

interface GalleryPageProps {
  params: Promise<{ locale: string }>;
}

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

  // Fetch first 3 artworks for Room1 initial state
  const artworks = await getClient().fetch(
    allArtworksQuery,
    {},
    { next: { revalidate: 60 } },
  );
  const roomArtworks = (artworks ?? []).slice(0, 3);

  return (
    <>
      {/*
        The 3D canvas is already mounted globally in layout.tsx (CanvasRoot).
        This page:
        1. Injects Room1 scene data into the Three.js store via a client component.
        2. Renders the tall scroll container that drives camera-spline progress.
        3. Provides accessible fallback for screen readers / no-JS.
      */}
      <Suspense fallback={null}>
        <GallerySceneInjector artworks={roomArtworks} locale={locale} />
      </Suspense>

      {/* Tall scroll container drives Three.js spline via window.scrollY */}
      <div
        style={{ height: "400vh", position: "relative", pointerEvents: "none" }}
        aria-hidden="true"
      />

      {/* Accessible fallback */}
      <noscript>
        <p style={{ padding: "2rem", color: "rgba(255,255,255,0.7)" }}>
          {locale === "de"
            ? "Die 3D-Galerie benötigt JavaScript. Bitte aktiviere JavaScript in deinem Browser."
            : "The 3D gallery requires JavaScript. Please enable JavaScript in your browser."}
        </p>
      </noscript>
    </>
  );
}

