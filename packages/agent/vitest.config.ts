import { defineConfig } from "vitest/config";

// NODE_ENV=test guard — see apps/web/vitest.config.ts for the full story
// (agent shells inherit NODE_ENV=production from the desktop app).
(process.env as Record<string, string | undefined>).NODE_ENV = "test";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    env: { NODE_ENV: "test" },
  },
});
