import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Landing Hero Section — Structural Smoke Tests
 *
 * Since Sprint 5 the landing page is fully i18n'd: copy lives in
 * messages/{de,en}.json under the "landing" namespace, the page only holds
 * t("…") keys. These tests verify both sides of that contract.
 * Full visual regression via Playwright E2E.
 */

const pagePath = path.join(__dirname, "../../app/[locale]/page.tsx");
const pageSource = fs.readFileSync(pagePath, "utf-8");

const messagesEn = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../messages/en.json"), "utf-8"),
) as Record<string, Record<string, string>>;
const messagesDe = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../messages/de.json"), "utf-8"),
) as Record<string, Record<string, string>>;

describe("Landing — Hero Section", () => {
  it("uses the landing i18n namespace instead of hardcoded copy", () => {
    expect(pageSource).toContain('useTranslations("landing")');
    // No stray hardcoded hero copy left in the page source
    expect(pageSource).not.toContain("Curated sonic commerce");
    expect(pageSource).not.toContain("Enter Experience");
  });

  it("has USP text content in the english messages", () => {
    const landing = messagesEn.landing;
    expect(landing).toBeDefined();
    expect(landing?.kicker).toBe("Curated sonic commerce");
    expect(landing?.titleWhere).toBe("Where");
    expect(landing?.titleTechno).toBe("Techno");
    expect(landing?.titleMeets).toBe("Meets");
    expect(landing?.titleArt).toBe("Art");
  });

  it("has Enter Experience CTA key and locale-aware links", () => {
    expect(messagesEn.landing?.ctaEnter).toBe("Enter Experience");
    expect(pageSource).toContain('t("ctaEnter")');
    expect(pageSource).toContain("localeHref");
  });

  it("keeps german and english landing keys in sync", () => {
    const enKeys = Object.keys(messagesEn.landing ?? {}).sort();
    const deKeys = Object.keys(messagesDe.landing ?? {}).sort();
    expect(enKeys.length).toBeGreaterThan(30);
    expect(deKeys).toEqual(enKeys);
  });

  it("german hero keeps 'Techno' for the e2e heading assertion", () => {
    // e2e/demo-flow.spec.ts asserts h1 contains /Techno|Art/i on /de
    expect(messagesDe.landing?.titleTechno).toMatch(/Techno/i);
  });

  it("has SoundToggle component", () => {
    expect(pageSource).toContain("SoundToggle");
    expect(pageSource).toContain("audioEnabled");
  });
});
