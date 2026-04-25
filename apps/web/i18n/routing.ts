import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // All supported locales
  locales: ["de", "en"],

  // DE is the default – no prefix for German routes
  defaultLocale: "de",

  // Strategy: always show locale prefix in URL
  // /de/galerie, /en/gallery
  localePrefix: "always",

  // Locale detection from Accept-Language header on first visit
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];
