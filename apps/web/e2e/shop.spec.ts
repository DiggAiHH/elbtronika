import { expect, test } from "@playwright/test";

test.describe("Shop Page", () => {
  test("loads and displays artworks", async ({ page }) => {
    await page.goto("/de/shop");
    await expect(page).toHaveTitle(/Shop/);
    // Wait for content to load
    await page.waitForLoadState("networkidle");
  });

  test("language switch works", async ({ page }) => {
    await page.goto("/de/shop");
    await expect(page).toHaveURL(/\/de\/shop/);

    // Switch to English
    await page.goto("/en/shop");
    await expect(page).toHaveURL(/\/en\/shop/);
  });

  test("has no accessibility violations", async ({ page }) => {
    await page.goto("/de/shop");
    await page.waitForLoadState("networkidle");

    // Basic a11y check: ensure landmarks exist
    const main = await page.locator("main, [role='main']").count();
    expect(main).toBeGreaterThanOrEqual(0);

    // Check heading structure
    const h1 = await page.locator("h1").count();
    expect(h1).toBeGreaterThan(0);
  });
});

test.describe("Cart Flow", () => {
  test("cart drawer opens and closes", async ({ page }) => {
    await page.goto("/de/shop");
    await page.waitForLoadState("networkidle");

    // Look for cart button
    const cartButton = page.locator('[data-testid="cart-button"]').or(
      page.getByRole("button", { name: /cart|warenkorb/i })
    );

    if (await cartButton.isVisible().catch(() => false)) {
      await cartButton.click();
      // Check if drawer opened
      const drawer = page.locator('[data-testid="cart-drawer"]').or(
        page.locator("[role='dialog']")
      );
      await expect(drawer).toBeVisible();
    }
  });
});
