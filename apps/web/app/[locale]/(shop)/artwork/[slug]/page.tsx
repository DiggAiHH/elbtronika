import { permanentRedirect } from "next/navigation";

/**
 * Legacy route: /[locale]/artwork/[slug]
 *
 * This was an early, orphaned duplicate of the commerce detail page with a
 * permanently disabled acquire button. The canonical artwork detail lives at
 * /[locale]/shop/artwork/[slug] — redirect there.
 *
 * (ArtworkAudioPlayer.tsx in this directory is kept: Sprint 4 wires it to the
 * HLSLoader from @elbtronika/audio and mounts it on the canonical page.)
 */
export default async function LegacyArtworkRedirect({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  permanentRedirect(`/${locale}/shop/artwork/${slug}`);
}
