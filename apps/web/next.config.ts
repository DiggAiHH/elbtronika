import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Enable React 19 strict mode
  reactStrictMode: true,

  // Output standalone for containerized deployments
  // NOTE: Disabled locally because Windows requires admin privileges for symlinks.
  // Re-enable for Docker/container builds.
  // output: "standalone",

  // Remove X-Powered-By header
  poweredByHeader: false,

  // Enable gzip compression
  compress: true,

  // NOTE: typedRoutes disabled because dynamic i18n routes (${locale}) cannot be
  // statically typed at compile time. Runtime validation via Zod is used instead.
  // typedRoutes: true,

  // Experimental features
  experimental: {
    // Partial Prerendering — Next.js 15.5.15 stable does NOT include PPR yet.
    // Re-enable when Next.js 16 / canary is adopted.
    // ppr: true,
    // Server instrumentation hook for RUM / monitoring (Next.js 15.3+ experimental)
    // instrumentationHook: true,
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
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "*.sanity.io",
        pathname: "/files/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [375, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
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
        headers: [{ key: "Cache-Control", value: "public, max-age=10, stale-while-revalidate=30" }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      },
    ];
  },

  // Transpile workspace packages
  transpilePackages: [
    "@elbtronika/ui",
    "@elbtronika/contracts",
    "@elbtronika/three",
    "@elbtronika/mcp",
    "@elbtronika/agent",
    "@elbtronika/flow",
  ],
};

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withAnalyzer(withNextIntl(nextConfig));
