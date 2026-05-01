import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient } from "@/lib/sanity/client";
import { allArtworksQuery, artistBySlugQuery } from "@/lib/sanity/queries";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const client = getClient();
  const artist = await client.fetch(artistBySlugQuery, { slug }, { next: { revalidate: 300 } });
  if (!artist) return {};
  return {
    title: artist.name,
    openGraph: {
      title: artist.name,
      images: artist.avatar?.asset?.url ? [{ url: artist.avatar.asset.url }] : [],
    },
  };
}

export default async function ArtistProfilePage({ params }: Props) {
  const { locale, slug } = await params;
  const client = getClient();

  const [artist, allArtworks] = await Promise.all([
    client.fetch(artistBySlugQuery, { slug }, { next: { revalidate: 300 } }),
    client.fetch(allArtworksQuery, {}, { next: { revalidate: 60 } }),
  ]);

  if (!artist) notFound();

  const artistWorks = (
    allArtworks as Array<{
      artist?: { slug?: { current: string } };
      _id: string;
      slug: { current: string };
      title: string;
      image?: { asset?: { url: string; metadata?: { lqip?: string } }; alt?: string };
    }>
  ).filter((a) => a.artist?.slug?.current === slug);

  const avatarUrl = artist.avatar?.asset?.url;
  const lqip = artist.avatar?.asset?.metadata?.lqip;

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Profile header */}
        <div className="mb-12 flex flex-col items-start gap-8 sm:flex-row sm:items-center">
          {avatarUrl && (
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border border-[var(--color-border)]">
              <Image
                src={avatarUrl}
                alt={artist.name}
                fill
                sizes="128px"
                className="object-cover"
                placeholder={lqip ? "blur" : "empty"}
                {...(lqip ? { blurDataURL: lqip } : {})}
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">
              {artist.name}
            </h1>
            {artist.genreTags && artist.genreTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {(artist.genreTags as string[]).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {artist.bio && (
              <p className="mt-4 max-w-xl text-sm text-[var(--color-text-secondary)]">
                {artist.bio}
              </p>
            )}
          </div>
        </div>

        {/* Works */}
        {artistWorks.length > 0 && (
          <section>
            <h2 className="mb-6 text-xl font-semibold text-[var(--color-text-primary)]">
              {locale === "de" ? "Werke" : "Works"}
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {artistWorks.map((artwork) => (
                <Link
                  key={artwork._id}
                  href={`/${locale}/shop/artwork/${artwork.slug.current}`}
                  className="group overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors hover:border-[var(--color-primary)]/50"
                >
                  <div className="relative aspect-square bg-[var(--color-surface)]">
                    {artwork.image?.asset?.url && (
                      <Image
                        src={artwork.image.asset.url}
                        alt={artwork.image.alt ?? artwork.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        placeholder={artwork.image.asset.metadata?.lqip ? "blur" : "empty"}
                        {...(artwork.image.asset.metadata?.lqip
                          ? { blurDataURL: artwork.image.asset.metadata.lqip }
                          : {})}
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-[var(--color-text-primary)]">{artwork.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
