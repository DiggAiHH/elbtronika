import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  // apps/web uses its own vitest config with jsdom + React Testing Library
  "apps/web/vitest.config.ts",
  // Shared packages use a standard Node.js test environment
  "packages/*/vitest.config.ts",
]);
