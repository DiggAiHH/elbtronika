#!/usr/bin/env node
/**
 * dr-blast.mjs — Deep-Research Multi-Tool Blaster für ELBTRONIKA.
 *
 * WAS:  Öffnet Gemini / Kimi / Copilot (oder die genannten Prompts),
 *       aktiviert jeweils Deep-Research-Mode, paste den Prompt, submit.
 *       Nutzt persistenten Chrome-Profil-Ordner → einmal einloggen, dann auto.
 *
 * AUFRUF (Windows, im Repo-Root):
 *   pnpm dr:blast              # alle Prompts aus dr-prompts.mjs
 *   pnpm dr:blast 1 2 4        # nur Prompts 1, 2, 4
 *   pnpm dr:blast --headed     # sichtbar (default) – nur zur Klarheit
 *   pnpm dr:blast --setup      # öffnet Browser zum manuellen Einloggen, kein Submit
 *
 * ERSTSTART:
 *   1) pnpm i -D playwright && pnpm exec playwright install chromium
 *   2) pnpm dr:blast --setup   → loggt dich in Gemini / Kimi / Copilot ein (einmalig).
 *   3) pnpm dr:blast 1 2 4     → feuert.
 *
 * Profile-Ordner:   ./browser-profile/   (gitignored — siehe .gitignore unten)
 */

import { chromium } from "playwright";
import { existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { PROMPTS, PLATFORMS } from "./dr-prompts.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROFILE_DIR = resolve(__dirname, "..", "browser-profile");

const args = process.argv.slice(2);
const SETUP_ONLY = args.includes("--setup");
const HEADED = !args.includes("--headless");
const PROMPT_IDS = args
  .filter((a) => /^\d+$/.test(a))
  .map(Number);
const ids = PROMPT_IDS.length ? PROMPT_IDS : Object.keys(PROMPTS).map(Number);

if (!existsSync(PROFILE_DIR)) mkdirSync(PROFILE_DIR, { recursive: true });

const log = (tag, msg) =>
  console.log(`[${new Date().toISOString().slice(11, 19)}] [${tag}] ${msg}`);

async function launch() {
  log("boot", `profile=${PROFILE_DIR} headed=${HEADED}`);
  return chromium.launchPersistentContext(PROFILE_DIR, {
    headless: !HEADED,
    viewport: { width: 1280, height: 900 },
    args: ["--disable-blink-features=AutomationControlled"],
  });
}

async function fireGemini(ctx, prompt) {
  const page = await ctx.newPage();
  await page.goto(PLATFORMS.gemini.url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);

  // Tools button → Deep Research item
  const toolsBtn = page.locator('button[aria-label*="Tools" i], button:has-text("Tools")').first();
  if (await toolsBtn.count()) {
    await toolsBtn.click();
    await page.waitForTimeout(500);
    const dr = page.locator('text=Deep Research').first();
    if (await dr.count()) await dr.click();
    await page.waitForTimeout(800);
  }

  // Input field — Gemini uses contenteditable rich-text editor (Quill)
  const input = page.locator('div[contenteditable="true"][role="textbox"]').first();
  await input.click();
  await input.fill(prompt.body);
  await page.waitForTimeout(400);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(4000);

  // After Deep Research generates a plan, click "Start research"
  const startBtn = page.locator('button:has-text("Start research")').first();
  if (await startBtn.count()) {
    await startBtn.click();
    log("gemini", "Deep Research started");
  } else {
    log("gemini", "Prompt submitted (kein Plan-Step erkannt)");
  }
  return page;
}

async function fireKimi(ctx, prompt) {
  const page = await ctx.newPage();
  await page.goto(PLATFORMS.kimi.url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);

  const input = page
    .locator('textarea, div[contenteditable="true"]')
    .first();
  await input.click();
  await input.fill(prompt.body);
  await page.waitForTimeout(400);
  // Send button = aria-label or icon — try Ctrl+Enter first, fall back to send btn
  await page.keyboard.press("Enter");
  await page.waitForTimeout(800);
  // some Kimi builds need Send button explicitly:
  const sendBtn = page.locator('button[aria-label*="Send" i], button:has-text("Send")').first();
  if (await sendBtn.count()) {
    try {
      await sendBtn.click({ timeout: 1500 });
    } catch {}
  }
  log("kimi", "Deep Research submitted");
  return page;
}

async function fireCopilot(ctx, prompt) {
  const page = await ctx.newPage();
  await page.goto(PLATFORMS.copilot.url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);

  // Try to enable Researcher / Think Deeper mode if visible
  const thinkBtn = page
    .locator(
      'button:has-text("Think Deeper"), button:has-text("Researcher"), button[aria-label*="Researcher" i]',
    )
    .first();
  if (await thinkBtn.count()) {
    try {
      await thinkBtn.click({ timeout: 1500 });
      log("copilot", "Researcher mode toggled");
    } catch {}
  }

  const input = page
    .locator('textarea, div[contenteditable="true"]')
    .first();
  await input.click();
  await input.fill(prompt.body);
  await page.waitForTimeout(400);
  await page.keyboard.press("Enter");
  log("copilot", "Prompt submitted");
  return page;
}

const FIRE = {
  gemini: fireGemini,
  kimi: fireKimi,
  copilot: fireCopilot,
};

async function main() {
  const ctx = await launch();

  if (SETUP_ONLY) {
    log("setup", "Opening Gemini / Kimi / Copilot — log in to each, then close the window.");
    await ctx.newPage().then((p) => p.goto(PLATFORMS.gemini.url));
    await ctx.newPage().then((p) => p.goto(PLATFORMS.kimi.url));
    await ctx.newPage().then((p) => p.goto(PLATFORMS.copilot.url));
    log("setup", "Drücke Ctrl+C nach dem Einloggen — Profil wird automatisch persistiert.");
    await new Promise(() => {}); // wait forever
    return;
  }

  log("plan", `Feuere Prompts: ${ids.join(", ")}`);
  const results = await Promise.allSettled(
    ids.map(async (id) => {
      const p = PROMPTS[id];
      if (!p) throw new Error(`Unbekannte Prompt-ID: ${id}`);
      const fire = FIRE[p.platform];
      if (!fire) throw new Error(`Keine Handler für Platform ${p.platform}`);
      log(p.platform, `→ Prompt ${id}: ${p.title}`);
      return fire(ctx, p);
    }),
  );

  results.forEach((r, i) => {
    const id = ids[i];
    if (r.status === "rejected") log("err", `Prompt ${id}: ${r.reason?.message ?? r.reason}`);
    else log("ok", `Prompt ${id} läuft.`);
  });

  log("done", "Alle Prompts gefeuert — Browser bleibt offen für Ergebnis-Review.");
  log("done", "Tabs nicht schließen bis DR fertig — Ergebnisse sind sonst weg.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
