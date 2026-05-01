import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Landing Hero Section — Structural Smoke Tests
 * Reads the source file and verifies critical content is present.
 * Full visual regression via Playwright E2E.
 */

const pagePath = path.join(__dirname, "../../app/[locale]/page.tsx");
const pageSource = fs.readFileSync(pagePath, "utf-8");

describe("Landing — Hero Section", () => {
  it("has USP text content", () => {
    expect(pageSource).toContain("Where art meets frequency");
  });

  it("has Enter Experience CTA", () => {
    expect(pageSource).toContain("Enter Experience");
    expect(pageSource).toContain("localeHref");
  });

  it("has SoundToggle component", () => {
    expect(pageSource).toContain("SoundToggle");
    expect(pageSource).toContain("audioEnabled");
  });
});
