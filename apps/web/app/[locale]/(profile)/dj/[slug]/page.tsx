import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient } from "@/lib/sanity/client";
import { allArtworksQuery, djBySlugQuery } from "@/lib/sanity/queries";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const client = getClient();
  const dj = await client.fetch(djBySlugQuery, { slug }, { next: { revalidate: 300 } });
  if (!dj) return {};
  return {
    title: dj.name,
    openGraph: {
      title: dj.name,
      images: dj.avatar?.asset?.url ? [{ url: dj.avatar.asset.url }] : [],
    },
  };
}

export default async function DjProfilePage({ params }: Props) {
  const { locale, slug } = await params;
  const client = getClient();

  const [dj, allArtworks] = await Promise.all([
    client.fetch(djBySlugQuery, { slug }, { next: { revalidate: 300 } }),
    client.fetch(allArtworksQuery, {}, { next: { revalidate: 60 } }),
  ]);

  if (!dj) notFound();

  // Artworks that feature this DJ
  const djWorks = (
    allArtworks as Array<{
      _id: string;
      slug: { current: string };
      title: string;
      image?: { asset?: { url: string; metadata?: { lqip?: string } }; alt?: string };
    }>
  ).filter(
    (_a) => false, // DJ link not in allArtworksQuery – would need extended query in Phase 8
  );

  const avatarUrl = dj.avatar?.asset?.url;
  const lqip = dj.avatar?.asset?.metadata?.lqip;

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Profile header */}
        <div className="mb-12 flex flex-col items-start gap-8 sm:flex-row sm:items-center">
          {avatarUrl && (
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border border-[var(--color-border)]">
              <Image
                src={avatarUrl}
                alt={dj.name}
                fill
                sizes="128px"
                className="object-cover"
                placeholder={lqip ? "blur" : "empty"}
                {...(lqip ? { blurDataURL: lqip } : {})}
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">{dj.name}</h1>
            {dj.genreTags && dj.genreTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {(dj.genreTags as string[]).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {dj.bio && (
              <p className="mt-4 max-w-xl text-sm text-[var(--color-text-secondary)]">{dj.bio}</p>
            )}
            {dj.soundcloud && (
              <a
                href={`https://soundcloud.com/${dj.soundcloud}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:underline"
              >
                SoundCloud ↗
              </a>
            )}
          </div>
        </div>

        {djWorks.length > 0 && (
          <section>
            <h2 className="mb-6 text-xl font-semibold text-[var(--color-text-primary)]">
              {locale === "de" ? "Verknüpfte Werke" : "Associated Works"}
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {djWorks.map((artwork) => (
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
