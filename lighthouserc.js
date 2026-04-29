/**
 * Lighthouse CI configuration for ELBTRONIKA.
 * Runs on every PR via GitHub Actions (Phase 12).
 *
 * Budget gates:
 *   LCP < 2.0s, CLS < 0.05, INP < 150ms
 *   Performance score >= 90 (shop), >= 85 (immersive)
 */

module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/shop",
        "http://localhost:3000/gallery",
      ],
      numberOfRuns: 3,
      startServerCommand: "cd apps/web && pnpm build && pnpm start",
      startServerReadyPattern: "Ready on",
      startServerReadyTimeout: 120_000,
    },
    assert: {
      preset: "lighthouse:no-pwa",
      assertions: {
        // Core Web Vitals
        "largest-contentful-paint": ["warn", { maxNumericValue: 2000 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.05 }],
        "total-blocking-time": ["warn", { maxNumericValue: 200 }],

        // Performance budget
        "categories:performance": ["warn", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["warn", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 1.0 }],

        // Resource budgets
        "resource-summary:document:size": ["warn", { maxNumericValue: 50_000 }],
        "resource-summary:script:size": ["warn", { maxNumericValue: 500_000 }],
        "resource-summary:image:size": ["warn", { maxNumericValue: 1_500_000 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
