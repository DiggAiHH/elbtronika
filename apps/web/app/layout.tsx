import type { Metadata } from "next";

// Root layout – minimal shell. The [locale] layout handles providers.
// metadataBase is set here so it applies to every route (incl. the global
// opengraph-image / twitter-image / manifest), letting Next resolve absolute
// social-image URLs at build time.
export const metadata: Metadata = {
  metadataBase: new URL("https://elbtronika.art"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
