import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient as getSanityClient } from "@/lib/sanity/client";
import { allArtworksQuery, artworkBySlugQuery } from "@/lib/sanity/queries";
import {
  fallbackLabel,
  formatArtworkPrice,
  formatEditionSummary,
  portableTextToPlainText,
} from "@/lib/shop";
import { createClient as createSupabaseClient } from "@/src/lib/supabase/server";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

type ArtworkPageData = {
  _id: string;
  supabaseId?: string;
  slug: { current: string };
  title: string;
  description?: unknown;
  medium?: string;
  dimensions?: string;
  year?: number;
  genreTags?: string[];
  image?: {
    asset?: { url?: string; metadata?: { lqip?: string } };
    alt?: string;
  };
  artist?: {
    _id: string;
    name: string;
    slug: { current: string };
    avatar?: {
      asset?: { url?: string };
    };
  };
  featuredInRoom?: {
    _id: string;
    title: string;
    slug: { current: string };
  };
};

type RelatedArtwork = {
  _id: string;
  slug: { current: string };
  title: string;
  medium?: string;
  image?: {
    asset?: { url?: string; metadata?: { lqip?: string } };
    alt?: string;
  };
  artist?: {
    slug?: { current?: string };
  };
};

type CommerceArtwork = {
  id: string;
  slug: string;
  price_eur: number | null;
  edition_size: number | null;
  editions_sold: number | null;
  image_url: string | null;
  model_url: string | null;
  set_id: string | null;
};

type CommerceSet = {
  title: string;
  hls_url: string | null;
  dj_id: string;
};

type CommerceDj = {
  name: string;
  slug: string;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const client = getSanityClient();
  const artwork = await client.fetch<ArtworkPageData | null>(
    artworkBySlugQuery,
    { slug },
    { next: { revalidate: 300 } },
  );

  if (!artwork) {
    return {};
  }

  const description = portableTextToPlainText(artwork.description);
  const imageUrl = artwork.image?.asset?.url;

  return {
    title: artwork.title,
    description: description ?? undefined,
    openGraph: {
      title: artwork.title,
      description: description ?? undefined,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: "article",
    },
  };
}

export default async function ArtworkDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const sanityClient = getSanityClient();
  const supabase = await createSupabaseClient();

  const [artwork, relatedArtworks, commerce] = await Promise.all([
    sanityClient.fetch<ArtworkPageData | null>(artworkBySlugQuery, { slug }, { next: { revalidate: 300 } }),
    sanityClient.fetch<RelatedArtwork[]>(allArtworksQuery, {}, { next: { revalidate: 120 } }),
    supabase
      .from("artworks")
      .select("id, slug, price_eur, edition_size, editions_sold, image_url, model_url, set_id")
      .eq("slug", slug)
      .maybeSingle(),
  ]);

  if (!artwork) {
    notFound();
  }

  const commerceArtwork = commerce.data as CommerceArtwork | null;
  const primaryImageUrl = artwork.image?.asset?.url ?? commerceArtwork?.image_url ?? null;
  const primaryImageAlt = artwork.image?.alt ?? artwork.title;
  const primaryImageLqip = artwork.image?.asset?.metadata?.lqip;
  const description = portableTextToPlainText(artwork.description);

  const [setRow, djRow] = commerceArtwork?.set_id
    ? await Promise.all([
        supabase
          .from("sets")
          .select("title, hls_url, dj_id")
          .eq("id", commerceArtwork.set_id)
          .maybeSingle(),
        supabase
          .from("sets")
          .select("dj_id")
          .eq("id", commerceArtwork.set_id)
          .maybeSingle()
          .then(async ({ data }) => {
            if (!data?.dj_id) return { data: null };
            return supabase
              .from("djs")
              .select("name, slug")
              .eq("id", data.dj_id)
              .maybeSingle();
          }),
      ])
    : [{ data: null }, { data: null }];

  const commerceSet = setRow.data as CommerceSet | null;
  const commerceDj = djRow.data as CommerceDj | null;

  const similarByArtist = relatedArtworks
    .filter((candidate) => candidate.slug.current !== artwork.slug.current)
    .filter((candidate) => candidate.artist?.slug?.current === artwork.artist?.slug.current)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}/shop`}
          className="inline-flex w-fit items-center text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
        >
          {locale === "de" ? "← Zurueck zum Shop" : "← Back to Shop"}
        </Link>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
          <div className="overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="relative aspect-square bg-[var(--color-surface)]">
              {primaryImageUrl ? (
                <Image
                  src={primaryImageUrl}
                  alt={primaryImageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                  placeholder={primaryImageLqip ? "blur" : "empty"}
                  {...(primaryImageLqip ? { blurDataURL: primaryImageLqip } : {})}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-muted)]">
                  {locale === "de" ? "Kein Bild verfuegbar" : "No image available"}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                {locale === "de" ? "Artwork Detail" : "Artwork Detail"}
              </p>
              <h1 className="text-3xl font-semibold sm:text-4xl">{artwork.title}</h1>
              {artwork.artist && (
                <Link
                  href={`/${locale}/artist/${artwork.artist.slug.current}`}
                  className="inline-flex w-fit items-center text-sm text-[var(--color-primary)] transition-colors hover:underline"
                >
                  {locale === "de" ? `Von ${artwork.artist.name}` : `By ${artwork.artist.name}`}
                </Link>
              )}
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <InfoBlock
                label={locale === "de" ? "Medium" : "Medium"}
                value={artwork.medium ?? fallbackLabel(locale)}
              />
              <InfoBlock
                label={locale === "de" ? "Jahr" : "Year"}
                value={artwork.year ? String(artwork.year) : fallbackLabel(locale)}
              />
              <InfoBlock
                label={locale === "de" ? "Dimensionen" : "Dimensions"}
                value={artwork.dimensions ?? fallbackLabel(locale)}
              />
              <InfoBlock
                label={locale === "de" ? "Preis" : "Price"}
                value={formatArtworkPrice(commerceArtwork?.price_eur, locale)}
              />
              <InfoBlock
                label={locale === "de" ? "Edition" : "Edition"}
                value={formatEditionSummary(
                  commerceArtwork?.edition_size ?? null,
                  commerceArtwork?.editions_sold ?? null,
                  locale,
                )}
              />
              <InfoBlock
                label={locale === "de" ? "Raum" : "Room"}
                value={artwork.featuredInRoom?.title ?? fallbackLabel(locale)}
              />
            </dl>

            {description && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                  {locale === "de" ? "Story" : "Story"}
                </h2>
                <p className="text-sm leading-7 text-[var(--color-text-secondary)]">{description}</p>
              </div>
            )}

            {artwork.genreTags && artwork.genreTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {artwork.genreTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-black/10 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  {locale === "de" ? "DJ-Set" : "DJ Set"}
                </p>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                  {commerceSet?.title ?? (locale === "de" ? "Noch kein Set verknuepft" : "No set linked yet")}
                </p>
                {commerceDj && (
                  <Link
                    href={`/${locale}/dj/${commerceDj.slug}`}
                    className="mt-2 inline-flex text-sm text-[var(--color-primary)] hover:underline"
                  >
                    {locale === "de" ? `Set von ${commerceDj.name}` : `Set by ${commerceDj.name}`}
                  </Link>
                )}
              </div>
              {commerceSet?.hls_url && (
                <audio className="w-full" controls preload="none" src={commerceSet.hls_url}>
                  <track kind="captions" />
                </audio>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/checkout?artwork=${artwork.slug.current}`}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-medium text-[var(--color-text-inverse)] transition-colors hover:opacity-90"
              >
                {locale === "de" ? "Kunstwerk erwerben" : "Acquire Artwork"}
              </Link>
              {commerceArtwork?.model_url && (
                <a
                  href={commerceArtwork.model_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-5 py-3 text-sm text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-primary)]/50 hover:text-[var(--color-text-primary)]"
                >
                  {locale === "de" ? "3D-Modell ansehen" : "View 3D Model"}
                </a>
              )}
            </div>
          </div>
        </section>

        {similarByArtist.length > 0 && (
          <section className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold">
                {locale === "de" ? "Mehr von diesem Artist" : "More from this artist"}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                {locale === "de"
                  ? "Weitere verfuegbare Arbeiten aus demselben Kontext."
                  : "Additional works from the same artistic context."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {similarByArtist.map((relatedArtwork) => {
                const relatedImageUrl = relatedArtwork.image?.asset?.url;
                const relatedLqip = relatedArtwork.image?.asset?.metadata?.lqip;

                return (
                  <Link
                    key={relatedArtwork._id}
                    href={`/${locale}/shop/artwork/${relatedArtwork.slug.current}`}
                    className="group overflow-hidden rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors hover:border-[var(--color-primary)]/50"
                  >
                    <div className="relative aspect-square bg-[var(--color-surface)]">
                      {relatedImageUrl ? (
                        <Image
                          src={relatedImageUrl}
                          alt={relatedArtwork.image?.alt ?? relatedArtwork.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          placeholder={relatedLqip ? "blur" : "empty"}
                          {...(relatedLqip ? { blurDataURL: relatedLqip } : {})}
                        />
                      ) : null}
                    </div>
                    <div className="space-y-1 p-4">
                      <p className="font-medium">{relatedArtwork.title}</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {relatedArtwork.medium ?? fallbackLabel(locale)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-2xl border border-[var(--color-border)] bg-black/10 p-4">
      <dt className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{label}</dt>
      <dd className="text-sm text-[var(--color-text-primary)]">{value}</dd>
    </div>
  );
}
