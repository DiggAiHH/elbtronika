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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://cdn.elbtronika.art https://*.sanity.io",
              "media-src 'self' https://cdn.elbtronika.art",
              "connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.anthropic.com",
              "font-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
      // -------------------------------------------------------------------
      // Cache strategy per asset type (Phase 12)
      // -------------------------------------------------------------------
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, must-revalidate" },
          { key: "Vary", value: "Accept" },
        ],
      },
      {
        source: "/:path*.glb",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.ktx2",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/health",
        headers: [
          { key: "Cache-Control", value: "public, max-age=10, stale-while-revalidate=30" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },

  // Transpile workspace packages
  transpilePackages: ["@elbtronika/ui", "@elbtronika/contracts", "@elbtronika/three"],
};

export default withNextIntl(nextConfig);
