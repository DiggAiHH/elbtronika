import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Enable React 19 strict mode
  reactStrictMode: true,

  // Experimental features
  experimental: {
    // React Compiler disabled until babel-plugin-react-compiler added (Phase 7+)
    // reactCompiler: true,
    // Typed routes for type-safe navigation
    typedRoutes: true,
  },

  // Image domains (R2 CDN + Sanity)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.elbtronika.art",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.sanity.io",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Security headers (extended in netlify.toml for CDN)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // tighten in Phase 13
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://cdn.elbtronika.art https://*.sanity.io",
              "media-src 'self' https://cdn.elbtronika.art",
              "connect-src 'self' https://*.supabase.co https://api.stripe.com",
              "font-src 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // Transpile workspace packages
  transpilePackages: ["@elbtronika/ui", "@elbtronika/contracts"],
};

export default withNextIntl(nextConfig);
