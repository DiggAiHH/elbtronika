"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface ArtworkItem {
  _id: string;
  supabaseId?: string;
  slug: { current: string };
  title: string;
  artist?: { _id: string; name: string; slug: { current: string } };
  image?: {
    asset?: {
      url: string;
      metadata?: { dimensions?: { width: number; height: number }; lqip?: string };
    };
    alt?: string;
  };
  medium?: string;
  year?: number;
  genreTags?: string[];
}

interface Filters {
  artist?: string;
  dj?: string;
  medium?: string;
  minPrice?: string;
  maxPrice?: string;
}

interface Props {
  artworks: ArtworkItem[];
  filters: Filters;
  locale: string;
}

export function ShopGrid({ artworks, filters, locale }: Props) {
  const t = useTranslations("shop");

  // Client-side filter applied on top of SSR data
  const filtered = artworks.filter((a) => {
    if (filters.artist && a.artist?.slug.current !== filters.artist) return false;
    if (filters.medium && a.medium !== filters.medium) return false;
    return true;
  });

  if (filtered.length === 0) {
    return <p className="py-16 text-center text-[var(--color-text-secondary)]">{t("noResults")}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {filtered.map((artwork) => (
        <ArtworkCard key={artwork._id} artwork={artwork} locale={locale} />
      ))}
    </div>
  );
}

function ArtworkCard({ artwork, locale }: { artwork: ArtworkItem; locale: string }) {
  const imageUrl = artwork.image?.asset?.url;
  const lqip = artwork.image?.asset?.metadata?.lqip;
  const alt = artwork.image?.alt ?? artwork.title;

  return (
    <Link
      href={`/${locale}/shop/artwork/${artwork.slug.current}`}
      className="group relative flex flex-col overflow-hidden rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors hover:border-[var(--color-primary)]/50"
    >
      {/* Artwork image */}
      <div className="relative aspect-square overflow-hidden bg-[var(--color-surface)]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            placeholder={lqip ? "blur" : "empty"}
            {...(lqip ? { blurDataURL: lqip } : {})}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--color-text-muted)]">
            <span className="text-sm">No image</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-4">
        <div>
          <p className="font-semibold text-[var(--color-text-primary)] line-clamp-1">
            {artwork.title}
          </p>
          {artwork.artist && (
            <p className="mt-0.5 text-sm font-medium text-[var(--color-primary)]">
              {artwork.artist.name}
            </p>
          )}
        </div>
        {artwork.medium && (
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-[0.16em]">
            {artwork.medium}
          </p>
        )}
        {artwork.genreTags && artwork.genreTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {artwork.genreTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
