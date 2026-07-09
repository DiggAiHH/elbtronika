import type { MetadataRoute } from "next";

const BASE_URL = "https://elbtronika.art";
const locales = ["de", "en"] as const;

/**
 * Public, indexable routes (path is appended after the /{locale} prefix).
 * Private areas (dashboard, profile, checkout, auth) are intentionally excluded.
 */
const routes = [
  { path: "", priority: 1.0, changeFrequency: "weekly" as const },
  { path: "/shop", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/gallery", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/press", priority: 0.5, changeFrequency: "monthly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${BASE_URL}/${l}${route.path}`]),
        ),
      },
    })),
  );
}
