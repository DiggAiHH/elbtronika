/**
 * Lighthouse assertions via Playwright
 * Complements lighthouserc.js CI runs with per-page checks.
 */

import { test, expect } from "@playwright/test";

test.describe("Lighthouse Budget", () => {
  test("shop page has acceptable LCP", async ({ page }) => {
    await page.goto("/shop");

    const lcp = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const last = entries[entries.length - 1];
            if (last) resolve(last.startTime);
            observer.disconnect();
          });
          observer.observe({ entryTypes: ["largest-contentful-paint"] });
          // Fallback if LCP never fires
          setTimeout(() => resolve(0), 10_000);
        }),
    );

    console.log(`LCP: ${lcp}ms`);
    expect(lcp).toBeLessThan(3000); // 3s budget (generous for CI)
  });

  test("CLS is below threshold", async ({ page }) => {
    await page.goto("/");

    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let clsValue = 0;
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as PerformanceEntry & { hadRecentInput: boolean }).hadRecentInput) {
                clsValue += (entry as PerformanceEntry & { value: number }).value;
              }
            }
          });
          observer.observe({ entryTypes: ["layout-shift"] });
          setTimeout(() => {
            observer.disconnect();
            resolve(clsValue);
          }, 5000);
        }),
    );

    console.log(`CLS: ${cls}`);
    expect(cls).toBeLessThan(0.1);
  });
});
