import { defineConfig } from "vitest/config";

// Guard against machines with a globally exported NODE_ENV=production —
// vitest would load the production React build (React.act undefined) and all
// RTL-based tests explode. See apps/web/vitest.config.ts for the full story.
(process.env as Record<string, string | undefined>).NODE_ENV = "test";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    env: { NODE_ENV: "test" },
  },
});
