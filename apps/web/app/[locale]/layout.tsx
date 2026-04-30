import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "@/app/globals.css";
import dynamic from "next/dynamic";
import { ConsentBanner } from "./components/ConsentBanner";
import { WebVitals } from "./components/WebVitals";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { EnvProvider } from "@/src/components/providers/EnvProvider";
import { getEnv } from "@/src/lib/env";
import { DemoBanner } from "@elbtronika/ui";

const CanvasRoot = dynamic(() => import("@elbtronika/three").then((m) => ({ default: m.CanvasRoot })), {
  loading: () => null,
});

const GalleryHUD = dynamic(() => import("@elbtronika/three").then((m) => ({ default: m.GalleryHUD })), {
  loading: () => null,
});

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

  if (!routing.locales.includes(locale as "de" | "en")) {
    notFound();
  }

  const messages = await getMessages();
  const { ELT_MODE } = getEnv();

  return (
    <html lang={locale} className="dark">
      <body className="min-h-dvh flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <EnvProvider mode={ELT_MODE}>
            <CanvasRoot />
            <GalleryHUD />
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <ConsentBanner locale={locale as "de" | "en"} />
            <WebVitals />
            <DemoBanner mode={ELT_MODE} />
          </EnvProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
