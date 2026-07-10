import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// This machine (and any machine with a globally exported NODE_ENV=production)
// would otherwise make vitest load the PRODUCTION React build — React.act is
// undefined there and every RTL test explodes. Tests must always run in test
// mode, regardless of shell environment. (Cast: Next's generated types mark
// NODE_ENV readonly, and `next build` type-checks this file too.)
(process.env as Record<string, string | undefined>).NODE_ENV = "test";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    env: { NODE_ENV: "test" },
    globals: true,
    exclude: ["**/node_modules/**", "**/e2e/**", "**/*.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"],
      exclude: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "**/node_modules/**"],
      // Regression floor (Sprint 6): measured baseline 2026-07-09 was
      // ~11.8% statements — the include covers every page/RSC, most of which
      // only run in e2e. Raise these as behavior tests replace the fs-grep
      // guards; never lower them.
      thresholds: {
        statements: 10,
        branches: 9,
        functions: 9,
        lines: 10,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
