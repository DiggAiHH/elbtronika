import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Space_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "@/app/globals.css";

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  // 300 (font-light) is unused in the app — dropped to save one font file.
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});
import { DemoBanner, WalkthroughTour } from "@elbtronika/ui";
import { EnvProvider } from "@/src/components/providers/EnvProvider";
import { getEnv } from "@/src/lib/env";
import { CartDrawer } from "./(shop)/components/CartDrawer";
import { ConsentBanner } from "./components/ConsentBanner";
import { DeferredCanvas } from "./components/DeferredCanvas";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { WebVitals } from "./components/WebVitals";

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
    applicationName: "ELBTRONIKA",
    keywords: [
      "digital art",
      "electronic music",
      "techno",
      "art gallery",
      "NFT",
      "immersive",
      "3D gallery",
      "art collecting",
      "Berlin",
    ],
    authors: [{ name: "ELBTRONIKA" }],
    creator: "ELBTRONIKA",
    publisher: "ELBTRONIKA",
    category: "art",
    formatDetection: { email: false, address: false, telephone: false },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        de: "/de",
        en: "/en",
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      url: `/${locale}`,
      title: t("title"),
      description: t("description"),
      locale: locale === "de" ? "de_DE" : "en_US",
      siteName: "ELBTRONIKA",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#050507",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

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
    <html lang={locale} className={`dark ${dmSerifDisplay.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-dvh flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <EnvProvider mode={ELT_MODE}>
            <DeferredCanvas />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            {/* Global: cart button lives in the navbar, so the drawer must be
                mountable on every page — not just inside the (shop) group. */}
            <CartDrawer locale={locale} />
            <ConsentBanner locale={locale as "de" | "en"} />
            <WebVitals />
            <DemoBanner mode={ELT_MODE} />
            <WalkthroughTour locale={locale} />
          </EnvProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
