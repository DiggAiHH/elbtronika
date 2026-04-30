import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { getClient } from "@/lib/sanity/client";
import { artworkBySlugQuery } from "@/lib/sanity/queries";
import { ArtworkAudioPlayer } from "./ArtworkAudioPlayer";

import { allArtworkSlugsQuery } from "@/lib/sanity/queries";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const client = getClient();
    const slugs = await client.fetch<string[]>(allArtworkSlugsQuery, {}, { next: { revalidate: 3600 } });
    return slugs.map((slug) => ({ slug }));
  } catch {
    // Fallback: no static params at build time
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const client = getClient();
  const artwork = await client.fetch(artworkBySlugQuery, { slug }, { next: { revalidate: 60 } });

  if (!artwork) return {};

  const title = locale === "de" ? artwork.title?.de ?? artwork.title : artwork.title?.en ?? artwork.title?.de ?? artwork.title;
  const imageUrl = artwork.image?.asset?.url;

  return {
    title,
    openGraph: {
      title,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ArtworkDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "artwork" });

  const client = getClient();
  const artwork = await client.fetch(artworkBySlugQuery, { slug }, { next: { revalidate: 60 } });

  if (!artwork) notFound();

  const title = locale === "de"
    ? (artwork.title?.de ?? artwork.title)
    : (artwork.title?.en ?? artwork.title?.de ?? artwork.title);

  const imageUrl = artwork.image?.asset?.url;
  const lqip = artwork.image?.asset?.metadata?.lqip;
  const artistName = artwork.artist?.name;
  const artistSlug = artwork.artist?.slug?.current;

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <Link href={`/${locale}/shop`} className="hover:text-[var(--color-text-primary)] transition-colors">
            {t("backToShop")}
          </Link>
          <span>/</span>
          <span className="text-[var(--color-text-secondary)]">{title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Hero image */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-[var(--color-surface)]">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={artwork.image?.alt ?? title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                placeholder={lqip ? "blur" : "empty"}
                blurDataURL={lqip}
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[var(--color-text-muted)]">
                <span>No image</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">{title}</h1>
              {artistName && artistSlug && (
                <Link
                  href={`/${locale}/artist/${artistSlug}`}
                  className="mt-2 inline-block text-lg text-[var(--color-primary)] hover:underline"
                >
                  {artistName}
                </Link>
              )}
            </div>

            {/* Meta */}
            <dl className="flex flex-col gap-3">
              {artwork.medium && (
                <div className="flex items-baseline gap-2">
                  <dt className="text-xs uppercase tracking-widest text-[var(--color-text-muted)]">{t("medium")}</dt>
                  <dd className="text-sm text-[var(--color-text-secondary)]">{artwork.medium}</dd>
                </div>
              )}
              {artwork.year && (
                <div className="flex items-baseline gap-2">
                  <dt className="text-xs uppercase tracking-widest text-[var(--color-text-muted)]">{t("year")}</dt>
                  <dd className="text-sm text-[var(--color-text-secondary)]">{artwork.year}</dd>
                </div>
              )}
              {artwork.dimensions && (
                <div className="flex items-baseline gap-2">
                  <dt className="text-xs uppercase tracking-widest text-[var(--color-text-muted)]">{t("dimensions")}</dt>
                  <dd className="text-sm text-[var(--color-text-secondary)]">{artwork.dimensions}</dd>
                </div>
              )}
              {artwork.featuredInRoom && (
                <div className="flex items-baseline gap-2">
                  <dt className="text-xs uppercase tracking-widest text-[var(--color-text-muted)]">{t("room")}</dt>
                  <dd className="text-sm text-[var(--color-text-secondary)]">{artwork.featuredInRoom.title}</dd>
                </div>
              )}
            </dl>

            {/* Audio preview */}
            <ArtworkAudioPlayer artworkId={artwork._id} />

            {/* CTA – Checkout stub (Phase 10) */}
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
                {t("acquireNote")}
              </p>
              <button
                type="button"
                disabled
                className="w-full rounded-lg bg-[var(--color-primary)] px-6 py-3 font-semibold text-[var(--color-text-inverse)] opacity-50 cursor-not-allowed"
                aria-label={t("acquireDisabled")}
              >
                {t("acquire")} — {t("comingSoon")}
              </button>
            </div>

            {/* Description */}
            {artwork.description && (
              <div className="prose prose-invert max-w-none">
                <p className="text-[var(--color-text-secondary)]">{artwork.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
