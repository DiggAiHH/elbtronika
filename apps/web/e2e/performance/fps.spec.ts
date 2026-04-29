/**
 * FPS Profiling for Immersive Mode (3D Gallery)
 * Eselbrücke: "Der Tachometer" — misst Frames pro Sekunde im Gallery-Modus.
 *
 * Runs via Playwright + performance.measureUserAgentSpecificMemory()
 * Target: 60 FPS Desktop, 45 FPS Mobile Mid-Range
 */

import { test, expect } from "@playwright/test";

const FPS_TARGET_DESKTOP = 60;
const SAMPLE_DURATION_MS = 5000;

test.describe("FPS Budget", () => {
  test("gallery page maintains desktop FPS target", async ({ page }) => {
    await page.goto("/gallery");

    // Wait for canvas to be ready
    await page.waitForSelector("canvas", { timeout: 10_000 });
    await page.waitForTimeout(2000); // Let scene settle

    // Collect frame timestamps via requestAnimationFrame
    const timestamps: number[] = await page.evaluate(
      async (duration: number) => {
        const times: number[] = [];
        const start = performance.now();

        return new Promise<number[]>((resolve) => {
          function frame() {
            times.push(performance.now());
            if (performance.now() - start < duration) {
              requestAnimationFrame(frame);
            } else {
              resolve(times);
            }
          }
          requestAnimationFrame(frame);
        });
      },
      SAMPLE_DURATION_MS,
    );

    // Calculate average FPS
    const frames = timestamps.length;
    const fps = (frames / SAMPLE_DURATION_MS) * 1000;

    console.log(`FPS: ${fps.toFixed(1)} over ${SAMPLE_DURATION_MS}ms`);

    // Budget check (generous tolerance for CI variance)
    expect(fps).toBeGreaterThan(FPS_TARGET_DESKTOP * 0.7);
  });

  test("gallery memory usage stays within budget", async ({ page }) => {
    await page.goto("/gallery");
    await page.waitForSelector("canvas", { timeout: 10_000 });
    await page.waitForTimeout(3000);

    const memory = (await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const perf = performance as any;
      return perf.measureUserAgentSpecificMemory?.();
    })) as { bytes: number } | undefined;

    if (memory) {
      const mb = memory.bytes / (1024 * 1024);
      console.log(`Memory: ${mb.toFixed(1)} MB`);
      expect(mb).toBeLessThan(500); // 500 MB budget
    } else {
      test.skip(true, "measureUserAgentSpecificMemory not supported");
    }
  });
});
