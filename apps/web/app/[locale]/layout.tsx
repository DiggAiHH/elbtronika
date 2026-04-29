import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "@/app/globals.css";
import "@react-three/fiber";
import { CanvasRoot } from "@elbtronika/three";
import { GalleryHUD } from "@elbtronika/three";
import { ConsentBanner } from "./components/ConsentBanner";

// TODO Phase 2: Import actual font files from /public/fonts
// For MVP we rely on system fonts + Google Fonts CDN (replaced in Phase 13 with self-hosted)

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: {
      template: "%s | ELBTRONIKA",
      default: t("title"),
    },
    description: t("description"),
    metadataBase: new URL("https://elbtronika.art"),
    alternates: {
      canonical: "/",
      languages: {
        de: "/de",
        en: "/en",
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "de" ? "de_DE" : "en_US",
      siteName: "ELBTRONIKA",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale – return 404 for unknown locales
  if (!routing.locales.includes(locale as "de" | "en")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body>
        <NextIntlClientProvider messages={messages}>
          {/* Phase 7: 3D Canvas overlay – lives outside route tree, never unmounts */}
          <CanvasRoot />
          {/* Phase 7: DOM HUD overlay – minimap + room indicator */}
          <GalleryHUD />
          {children}
          <ConsentBanner locale={locale as "de" | "en"} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
