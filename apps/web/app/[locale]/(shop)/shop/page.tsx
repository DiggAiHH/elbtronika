import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { getClient } from "@/lib/sanity/client";
import { allArtworksQuery } from "@/lib/sanity/queries";
import { getEnv } from "@/src/lib/env";
import { ShopGrid } from "./ShopGrid";
import { ShopFilters } from "./ShopFilters";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    artist?: string;
    dj?: string;
    medium?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shop" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
    },
  };
}

export default async function ShopPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const filters = await searchParams;
  const t = await getTranslations({ locale, namespace: "shop" });

  const client = getClient();
  const allArtworks = await client.fetch(allArtworksQuery, {}, { next: { revalidate: 60 } });

  // Mode-based filtering: demo shows only demo artworks, live hides them, staging shows both
  const { ELT_MODE } = getEnv();
  const artworks = allArtworks.filter((artwork: { isDemo?: boolean }) => {
    if (ELT_MODE === "demo") return artwork.isDemo === true;
    if (ELT_MODE === "live") return artwork.isDemo !== true;
    return true; // staging shows both
  });

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-4xl font-bold text-[var(--color-text-primary)] sm:text-5xl">
            {t("heading")}
          </h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">{t("subheading")}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filters sidebar */}
          <aside className="w-full shrink-0 lg:w-64">
            <Suspense fallback={null}>
              <ShopFilters locale={locale} filters={filters} />
            </Suspense>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            <Suspense fallback={<ShopGridSkeleton />}>
              <ShopGrid artworks={artworks} filters={filters} locale={locale} />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}

function ShopGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
          key={i}
          className="aspect-square animate-pulse rounded-lg bg-[var(--color-surface)]"
        />
      ))}
    </div>
  );
}
