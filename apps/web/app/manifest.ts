import type { MetadataRoute } from "next";

/**
 * PWA web app manifest — generated at /manifest.webmanifest.
 * Enables "Add to Home Screen" and gives the browser theme/colour hints.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ELBTRONIKA — Immersive Art Gallery",
    short_name: "ELBTRONIKA",
    description:
      "Contemporary digital art and electronic music culture, curated as one immersive experience.",
    start_url: "/",
    display: "standalone",
    background_color: "#050507",
    theme_color: "#050507",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
