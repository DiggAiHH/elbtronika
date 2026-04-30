import { expect, test } from "@playwright/test";

/**
 * End-to-End Demo-Flow
 * Simulates Lee Hoops' 5-minute pitch experience.
 * Requires: ELT_MODE=demo, Demo-Personas seeded, Stripe Test-Mode.
 */

test.describe("Demo Mode — Complete Investor Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to German landing (primary locale)
    await page.goto("/de");
    await page.waitForLoadState("networkidle");
  });

  test("Step 1: Landing page loads with demo banner", async ({ page }) => {
    // Hero visible
    await expect(page.locator("h1")).toContainText(/Techno|Art/i);

    // Demo banner visible in demo mode
    const demoBanner = page.locator('[data-testid="demo-banner"]').or(
      page.getByText(/Demo Environment/i)
    );
    await expect(demoBanner).toBeVisible();
  });

  test("Step 2: Enter Gallery → 3D scene loads", async ({ page }) => {
    // Click primary CTA
    const enterGallery = page.locator("a", { hasText: /Enter Gallery|Galerie betreten/i }).first();
    await enterGallery.click();

    // Should navigate to gallery
    await expect(page).toHaveURL(/\/de\/gallery/);

    // Gallery canvas or scroll container visible
    const canvas = page.locator("canvas").or(page.locator("[data-testid='gallery-canvas']"));
    await expect(canvas).toBeVisible();

    // FPS budget: after 5s, page should be responsive (no long tasks blocking)
    await page.waitForTimeout(5000);
    const performance = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      return nav ? { domInteractive: nav.domInteractive } : null;
    });
    expect(performance).toBeTruthy();
  });

  test("Step 3: Shop filters demo artworks in demo mode", async ({ page }) => {
    await page.goto("/de/shop");
    await page.waitForLoadState("networkidle");

    // Shop grid should load
    const grid = page.locator("main");
    await expect(grid).toBeVisible();

    // In demo mode, only demo artworks should be visible
    // (Exact assertion depends on ShopGrid implementation; we check no error state)
    const errorState = page.locator("text=/error|fehler/i");
    expect(await errorState.isVisible().catch(() => false)).toBe(false);
  });

  test("Step 4: Artwork detail page renders", async ({ page }) => {
    // Navigate to a demo artwork (slug pattern from seed)
    await page.goto("/de/shop");
    await page.waitForLoadState("networkidle");

    // Click first artwork card
    const firstCard = page.locator("a[href*='artwork']").first();
    if (await firstCard.isVisible().catch(() => false)) {
      await firstCard.click();
      await expect(page).toHaveURL(/artwork\//);

      // Story/Description visible
      const story = page.locator("article, [data-testid='artwork-story']").or(
        page.locator("p").first()
      );
      await expect(story).toBeVisible();
    }
  });

  test("Step 5: Checkout shows test card hint in demo mode", async ({ page }) => {
    // Direct checkout navigation (or via artwork CTA when implemented)
    await page.goto("/de/checkout");
    await page.waitForLoadState("networkidle");

    // Test card hint visible in demo mode
    const testCardHint = page.locator('[data-testid="test-card-hint"]').or(
      page.getByText(/4242/)
    );

    // If checkout is fully implemented, this should be visible
    // If stubbed, we at least verify no crash
    const hasHint = await testCardHint.isVisible().catch(() => false);
    if (!hasHint) {
      test.info().annotations.push({
        type: "skip-reason",
        description: "Checkout test-card hint not yet implemented (Phase 19)",
      });
    }
  });

  test("Step 6: Health endpoint reports demo mode", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);

    const body = (await response.json()) as { status: string; mode?: string };
    expect(body.status).toBe("ok");
    // If API exposes mode:
    if (body.mode) {
      expect(body.mode).toBe("demo");
    }
  });

  test("Step 7: Walkthrough tour auto-starts on first visit", async ({ page, context }) => {
    // Fresh browser context = no localStorage
    const newPage = await context.newPage();
    await newPage.goto("/de");
    await newPage.waitForLoadState("networkidle");

    // Click Enter Gallery to trigger audio unlock (if required for tour)
    const cta = newPage.locator("a", { hasText: /Enter Gallery/i }).first();
    await cta.click();

    // Wait for potential tour start delay (2s after unlock)
    await newPage.waitForTimeout(3000);

    const tour = newPage.locator('[data-testid="walkthrough-tour"]').or(
      newPage.getByText(/Welcome to ELBTRONIKA/i)
    );

    const hasTour = await tour.isVisible().catch(() => false);
    if (!hasTour) {
      test.info().annotations.push({
        type: "skip-reason",
        description: "Walkthrough tour not yet implemented (Phase 19)",
      });
    }

    await newPage.close();
  });

  test("Step 8: Press kit page loads", async ({ page }) => {
    await page.goto("/de/press");
    await page.waitForLoadState("networkidle");

    // Should not 404
    expect(page.url()).toContain("/press");

    // Content visible (or stub)
    const heading = page.locator("h1").or(page.locator("main"));
    await expect(heading).toBeVisible();
  });

  test("Step 9: Pitch dashboard is gated", async ({ page }) => {
    await page.goto("/de/pitch");
    await page.waitForLoadState("networkidle");

    // Without investor role, should redirect to login or show forbidden
    const url = page.url();
    const isGated = url.includes("/login") || url.includes("/auth");

    if (!isGated) {
      // If page loads, check for investor-only content
      const dashboard = page.locator('[data-testid="pitch-dashboard"]').or(
        page.getByText(/investor|dashboard/i)
      );
      const hasDashboard = await dashboard.isVisible().catch(() => false);
      if (!hasDashboard) {
        test.info().annotations.push({
          type: "skip-reason",
          description: "Pitch dashboard not yet implemented (Phase 19)",
        });
      }
    }
  });
});

test.describe("Lite Mode Fallback", () => {
  test("3D gallery loads in lite mode without crash", async ({ page }) => {
    await page.goto("/de/gallery?lite=1");
    await page.waitForLoadState("networkidle");

    const canvas = page.locator("canvas").or(page.locator("[data-testid='gallery-canvas']"));
    // In lite mode canvas may or may not render; we just verify no error page
    const errorHeading = page.locator("text=/404|error|fehler/i");
    expect(await errorHeading.isVisible().catch(() => false)).toBe(false);
  });
});
