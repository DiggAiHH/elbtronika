// Artist Dashboard — Artwork overview + submission entry point
// Eselbrücke: "studio wall" — artist sees all their work in one place
// Server Component: auth-guard via parent layout.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

type Props = { params: Promise<{ locale: string }> };

type ArtworkRow = {
  id: string;
  title: string;
  slug: string;
  price_eur: number | null;
  is_published: boolean;
  created_at: string;
};

const STATUS_LABEL: Record<string, Record<string, string>> = {
  de: { published: "Veröffentlicht", draft: "Entwurf" },
  en: { published: "Published", draft: "Draft" },
};

export default async function ArtistDashboardPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  // Verify artist role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "artist") {
    redirect(`/${locale}/dashboard`);
  }

  // Fetch artworks for this artist via the artists table join
  const { data: artistRow } = await supabase
    .from("artists")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  const artworks: ArtworkRow[] = [];

  if (artistRow) {
    const { data } = await supabase
      .from("artworks")
      .select("id, title, slug, price_eur, is_published, created_at")
      .eq("artist_id", artistRow.id)
      .order("created_at", { ascending: false });

    if (data) artworks.push(...data);
  }

  const t = {
    heading: locale === "de" ? "Meine Werke" : "My Artworks",
    submitNew: locale === "de" ? "+ Neues Werk einreichen" : "+ Submit New Artwork",
    noArtworks:
      locale === "de"
        ? "Noch keine Werke. Reiche dein erstes ein."
        : "No artworks yet. Submit your first one.",
    title: locale === "de" ? "Titel" : "Title",
    price: locale === "de" ? "Preis" : "Price",
    status: "Status",
    date: locale === "de" ? "Eingereicht" : "Submitted",
    backToDashboard: locale === "de" ? "← Dashboard" : "← Dashboard",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link
              href={`/${locale}/dashboard`}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {t.backToDashboard}
            </Link>
            <h1 className="mt-2 text-2xl font-semibold">{t.heading}</h1>
            <p className="text-sm text-zinc-400 mt-1">{profile.display_name}</p>
          </div>
          <Link
            href={`/${locale}/dashboard/artist/new`}
            className="rounded-md bg-cyan-500 hover:bg-cyan-400 text-black font-medium text-sm px-4 py-2 transition-colors"
          >
            {t.submitNew}
          </Link>
        </div>

        {/* Artwork table */}
        {artworks.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-10 text-center">
            <p className="text-zinc-500 text-sm">{t.noArtworks}</p>
            <Link
              href={`/${locale}/dashboard/artist/new`}
              className="mt-4 inline-block text-cyan-400 text-sm underline underline-offset-2"
            >
              {t.submitNew}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">{t.title}</th>
                  <th className="px-5 py-3 text-right">{t.price}</th>
                  <th className="px-5 py-3 text-center">{t.status}</th>
                  <th className="px-5 py-3 text-right">{t.date}</th>
                </tr>
              </thead>
              <tbody>
                {artworks.map((artwork) => {
                  const statusKey = artwork.is_published ? "published" : "draft";
                  const statusLabel = STATUS_LABEL[locale]?.[statusKey] ?? statusKey;
                  return (
                    <tr
                      key={artwork.id}
                      className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-900/60 transition-colors"
                    >
                      <td className="px-5 py-4 font-medium">
                        <Link
                          href={`/${locale}/artwork/${artwork.slug}`}
                          className="hover:text-cyan-400 transition-colors"
                        >
                          {artwork.title}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-right text-zinc-300">
                        {artwork.price_eur != null ? `€ ${artwork.price_eur.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            artwork.is_published
                              ? "bg-emerald-900/60 text-emerald-300"
                              : "bg-zinc-700/60 text-zinc-400"
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-zinc-500">
                        {new Date(artwork.created_at).toLocaleDateString(locale)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
