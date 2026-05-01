#!/usr/bin/env node
/**
 * Local Lighthouse Run — generates a final report before deploy.
 *
 * Usage: node scripts/lighthouse-local.js [--url=http://localhost:3000]
 *
 * Prerequisites:
 *   - Chrome/Chromium installed
 *   - App running on target URL
 */

const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const TARGET =
  process.argv.find((a) => a.startsWith("--url="))?.split("=")[1] ?? "http://localhost:3000";
const OUT_DIR = path.join(__dirname, "..", "lighthouse-reports");

const URLS = [`${TARGET}/`, `${TARGET}/shop`, `${TARGET}/gallery`, `${TARGET}/dashboard/pm`];

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

console.log(`⚡ Lighthouse Final Measurement`);
console.log(`   Target: ${TARGET}`);
console.log(`   Pages: ${URLS.length}`);
console.log("");

const results = [];

for (const url of URLS) {
  const slug = new URL(url).pathname.replace(/\//g, "_") || "_root";
  const outFile = path.join(OUT_DIR, `report-${slug}.html`);
  const jsonFile = path.join(OUT_DIR, `report-${slug}.json`);

  console.log(`📄 Scanning: ${url}`);

  try {
    execSync(
      `npx lighthouse "${url}" ` +
        `--output=html --output=json ` +
        `--output-path=${outFile.replace(".html", "")} ` +
        `--chrome-flags="--headless --no-sandbox" ` +
        `--preset=desktop ` +
        `--quiet`,
      { stdio: "inherit", timeout: 120_000 },
    );

    // Read JSON report for summary
    const report = JSON.parse(fs.readFileSync(jsonFile, "utf-8"));
    const categories = report.categories;

    results.push({
      url,
      performance: Math.round((categories.performance?.score ?? 0) * 100),
      accessibility: Math.round((categories.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((categories["best-practices"]?.score ?? 0) * 100),
      seo: Math.round((categories.seo?.score ?? 0) * 100),
    });

    console.log(`   ✅ Saved: ${outFile}\n`);
  } catch (err) {
    console.error(`   ❌ Failed: ${url} — ${err.message}\n`);
    results.push({
      url,
      performance: 0,
      accessibility: 0,
      bestPractices: 0,
      seo: 0,
      error: err.message,
    });
  }
}

// Summary table
console.log(`\n${"=".repeat(80)}`);
console.log("📊 LIGHTHOUSE FINAL SUMMARY");
console.log("=".repeat(80));
console.log(`${"URL".padEnd(35)} PERF  A11Y  BP    SEO`);
console.log("-".repeat(80));

for (const r of results) {
  const url = new URL(r.url).pathname.padEnd(35);
  const perf = String(r.performance).padStart(4);
  const a11y = String(r.accessibility).padStart(4);
  const bp = String(r.bestPractices).padStart(4);
  const seo = String(r.seo).padStart(4);
  console.log(`${url} ${perf}  ${a11y}  ${bp}  ${seo}`);
}

console.log("=".repeat(80));

const avgPerf = Math.round(results.reduce((s, r) => s + r.performance, 0) / results.length);
const pass = avgPerf >= 90;
console.log(`\nAverage Performance: ${avgPerf}% ${pass ? "✅ PASS" : "⚠️ WARN (< 90%)"}`);
console.log(`\nReports saved to: ${OUT_DIR}\n`);

process.exit(pass ? 0 : 1);
