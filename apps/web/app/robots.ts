import type { MetadataRoute } from "next";

const BASE_URL = "https://elbtronika.art";

/**
 * robots.txt — generated at build time.
 * Public marketing/shop pages are crawlable; app/auth areas and the API are not.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/*/dashboard",
          "/*/profile",
          "/*/account",
          "/*/checkout",
          "/*/artist-onboarding",
          "/*/login",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
