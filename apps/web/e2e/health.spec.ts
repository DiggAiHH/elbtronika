import { test, expect } from "@playwright/test";

test("health endpoint returns ok", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);

  const body = await response.json() as { status: string };
  expect(body.status).toBe("ok");
});

test("home page loads without error", async ({ page }) => {
  await page.goto("/de");
  await expect(page).toHaveTitle(/ELBTRONIKA/);
  // No console errors
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  expect(errors).toHaveLength(0);
});
