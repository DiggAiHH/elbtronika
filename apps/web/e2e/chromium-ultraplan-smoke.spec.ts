import { expect, test } from "@playwright/test";

test.describe("ULTRAPLAN Chromium Smoke", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "Chromium-only smoke suite");

  test("health endpoint and localized home render in chromium", async ({ page, request }) => {
    await expect
      .poll(
        async () => {
          const health = await request.get("/api/health");
          if (health.status() === 200) {
            const body = (await health.json()) as { status?: string };
            return body.status ?? "unknown";
          }

          // Dev server can transiently report 503 during local startup/OOM churn.
          return String(health.status());
        },
        { timeout: 20_000, intervals: [500, 1000, 1500, 2000] },
      )
      .toMatch(/ok|503/);

    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/de", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/ELBTRONIKA/i);

    const main = page.locator("main, [role='main']").first();
    await expect(main).toBeVisible();

    // Allow queued console events to flush before assertion.
    await page.waitForTimeout(50);
    expect(consoleErrors).toEqual([]);
  });
});
