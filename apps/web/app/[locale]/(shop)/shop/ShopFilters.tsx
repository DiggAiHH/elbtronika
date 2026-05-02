import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { getClient } from "@/lib/sanity/client";
import { allArtistsQuery, allArtworksQuery, allDjsQuery } from "@/lib/sanity/queries";
import { buildShopFilterHref, isNonEmptyString, type ShopFilterState } from "@/lib/shop";

type ArtistFilter = {
  _id: string;
  name: string;
  slug: { current: string };
};

type DjFilter = {
  _id: string;
  name: string;
  slug: { current: string };
};

type MediumFilter = {
  _id: string;
  medium?: string;
};

type Props = {
  locale: string;
  filters: ShopFilterState;
};

const filterLinkClass =
  "inline-flex min-h-10 items-center rounded-full border px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2";

export async function ShopFilters({ locale, filters }: Props) {
  const client = getClient();
  const t = await getTranslations({ locale, namespace: "shop" });

  const [artists, djs, artworks] = await Promise.all([
    client.fetch<ArtistFilter[]>(allArtistsQuery, {}, { next: { revalidate: 60 } }),
    client.fetch<DjFilter[]>(allDjsQuery, {}, { next: { revalidate: 60 } }),
    client.fetch<MediumFilter[]>(allArtworksQuery, {}, { next: { revalidate: 60 } }),
  ]);

  const mediums = [
    ...new Set(artworks.map((artwork) => artwork.medium).filter(isNonEmptyString)),
  ].sort((left, right) => left.localeCompare(right, locale));

  return (
    <div className="space-y-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <FilterSection title={t("filterByArtist")}>
        <FilterLink
          href={buildShopFilterHref(locale, filters, { artist: null })}
          active={!filters.artist}
        >
          {locale === "de" ? "Alle" : "All"}
        </FilterLink>
        {artists.map((artist) => (
          <FilterLink
            key={artist._id}
            href={buildShopFilterHref(locale, filters, { artist: artist.slug.current })}
            active={filters.artist === artist.slug.current}
          >
            {artist.name}
          </FilterLink>
        ))}
      </FilterSection>

      <FilterSection title={t("filterByDj")}>
        <FilterLink href={buildShopFilterHref(locale, filters, { dj: null })} active={!filters.dj}>
          {locale === "de" ? "Alle" : "All"}
        </FilterLink>
        {djs.map((dj) => (
          <FilterLink
            key={dj._id}
            href={buildShopFilterHref(locale, filters, { dj: dj.slug.current })}
            active={filters.dj === dj.slug.current}
          >
            {dj.name}
          </FilterLink>
        ))}
      </FilterSection>

      <FilterSection title={locale === "de" ? "Nach Medium filtern" : "Filter by Medium"}>
        <FilterLink
          href={buildShopFilterHref(locale, filters, { medium: null })}
          active={!filters.medium}
        >
          {locale === "de" ? "Alle" : "All"}
        </FilterLink>
        {mediums.map((medium) => (
          <FilterLink
            key={medium}
            href={buildShopFilterHref(locale, filters, { medium })}
            active={filters.medium === medium}
          >
            {medium}
          </FilterLink>
        ))}
      </FilterSection>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
        {title}
      </h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        filterLinkClass,
        active
          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-text-primary)]"
          : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/50 hover:text-[var(--color-text-primary)]",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
