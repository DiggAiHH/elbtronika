import { ImageResponse } from "next/og";
import { getClient as getSanityClient } from "@/lib/sanity/client";
import { artworkBySlugQuery } from "@/lib/sanity/queries";
import { fallbackLabel, formatArtworkPrice, portableTextToPlainText } from "@/lib/shop";
import { createClient as createSupabaseClient } from "@/src/lib/supabase/server";

export const alt = "ELBTRONIKA artwork preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

type ArtworkPreviewData = {
  title: string;
  description?: unknown;
  image?: {
    asset?: { url?: string };
  };
  artist?: {
    name?: string;
  };
  featuredInRoom?: {
    title?: string;
  };
};

export default async function OpenGraphImage({ params }: Props) {
  const { locale, slug } = await params;
  const sanityClient = getSanityClient();
  const supabase = await createSupabaseClient();

  const [artwork, commerce] = await Promise.all([
    sanityClient.fetch<ArtworkPreviewData | null>(
      artworkBySlugQuery,
      { slug },
      { next: { revalidate: 300 } },
    ),
    supabase.from("artworks").select("price_eur").eq("slug", slug).maybeSingle(),
  ]);

  const title = artwork?.title ?? "ELBTRONIKA";
  const imageUrl = artwork?.image?.asset?.url;
  const artistName = artwork?.artist?.name ?? fallbackLabel(locale, "artist");
  const roomTitle = artwork?.featuredInRoom?.title ?? fallbackLabel(locale, "room");
  const description = portableTextToPlainText(artwork?.description)?.slice(0, 180);
  const price = formatArtworkPrice(commerce.data?.price_eur ?? null, locale);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "radial-gradient(circle at top left, #1f2937 0%, #0f172a 42%, #020617 100%)",
        color: "#f8fafc",
        fontFamily: "Arial, sans-serif",
        padding: 40,
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          border: "1px solid rgba(248, 250, 252, 0.16)",
          background: "rgba(15, 23, 42, 0.72)",
          borderRadius: 28,
          overflow: "hidden",
        }}
      >
        {imageUrl ? (
          <div
            style={{
              width: 460,
              height: "100%",
              display: "flex",
              background: "#0f172a",
            }}
          >
            <img
              src={imageUrl}
              alt={title}
              width={460}
              height={630}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            padding: "42px 40px 36px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  padding: "10px 14px",
                  borderRadius: 999,
                  background: "rgba(148, 163, 184, 0.12)",
                  fontSize: 20,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                ELBTRONIKA
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                {price}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 58,
                  lineHeight: 1.04,
                  fontWeight: 800,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 26,
                  color: "#cbd5e1",
                }}
              >
                {artistName}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              {[roomTitle, slug].map((label) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    padding: "10px 14px",
                    borderRadius: 999,
                    border: "1px solid rgba(148, 163, 184, 0.22)",
                    color: "#e2e8f0",
                    fontSize: 20,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 24,
                lineHeight: 1.45,
                color: "#cbd5e1",
              }}
            >
              {description ??
                "Immersive audio-reactive collectible from the ELBTRONIKA classic shop."}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 20,
                color: "#94a3b8",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              <span>{locale === "de" ? "Digitale Edition" : "Digital edition"}</span>
              <span>{locale === "de" ? "Shop / Artwork" : "Shop / Artwork"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
