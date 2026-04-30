#!/usr/bin/env node
/**
 * 48h Monitoring Check Script
 *
 * Usage: node scripts/monitoring/48h-check.js [--url=https://elbtronika.art] [--interval=3600]
 *
 * Checks:
 *   - Health endpoint (200 + JSON body)
 *   - Core pages (200 + no error in body)
 *   - Security headers
 *   - Response time (warn if > 1000ms)
 *   - SSL certificate expiry (warn if < 14 days)
 *
 * Outputs structured JSON for ingestion into monitoring dashboards.
 */

const TARGET =
  process.argv.find((a) => a.startsWith("--url="))?.split("=")[1] ?? "https://elbtronika.art";
const _INTERVAL_SEC = Number(
  process.argv.find((a) => a.startsWith("--interval="))?.split("=")[1] ?? 3600,
);

const CHECKS = [
  { name: "health", path: "/api/health", expectStatus: 200, expectJson: (j) => j.status === "ok" },
  { name: "home", path: "/", expectStatus: 200 },
  { name: "shop", path: "/shop", expectStatus: 200 },
  { name: "gallery", path: "/gallery", expectStatus: 200 },
  { name: "dashboard", path: "/dashboard/pm", expectStatus: 200 },
];

const SECURITY_HEADERS = [
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
];

async function check() {
  const timestamp = new Date().toISOString();
  const results = [];
  let allPassed = true;

  for (const check of CHECKS) {
    const start = Date.now();
    try {
      const res = await fetch(`${TARGET}${check.path}`, {
        headers: { "User-Agent": "ELBTRONIKA-Monitor/1.0" },
      });
      const latency = Date.now() - start;
      const bodyText = await res.text();

      let json = null;
      try {
        json = JSON.parse(bodyText);
      } catch {
        // not JSON
      }

      const statusOk = res.status === check.expectStatus;
      const jsonOk = check.expectJson ? check.expectJson(json) : true;
      const latencyOk = latency < 1000;

      const passed = statusOk && jsonOk && latencyOk;
      if (!passed) allPassed = false;

      results.push({
        name: check.name,
        url: `${TARGET}${check.path}`,
        status: res.status,
        latencyMs: latency,
        passed,
        errors: [
          !statusOk ? `Expected ${check.expectStatus}, got ${res.status}` : null,
          !jsonOk ? "JSON assertion failed" : null,
          !latencyOk ? `Latency ${latency}ms > 1000ms` : null,
        ].filter(Boolean),
      });
    } catch (err) {
      allPassed = false;
      results.push({
        name: check.name,
        url: `${TARGET}${check.path}`,
        status: 0,
        latencyMs: Date.now() - start,
        passed: false,
        errors: [err.message],
      });
    }
  }

  // Security headers check
  const secStart = Date.now();
  const secRes = await fetch(TARGET, {
    headers: { "User-Agent": "ELBTRONIKA-Monitor/1.0" },
  });
  const secLatency = Date.now() - secStart;
  const headers = Object.fromEntries(secRes.headers.entries());
  const missingHeaders = SECURITY_HEADERS.filter((h) => !headers[h]);

  if (missingHeaders.length > 0) allPassed = false;

  results.push({
    name: "security-headers",
    url: TARGET,
    status: secRes.status,
    latencyMs: secLatency,
    passed: missingHeaders.length === 0,
    errors: missingHeaders.map((h) => `Missing header: ${h}`),
    headersPresent: Object.keys(headers).filter((h) => SECURITY_HEADERS.includes(h)),
  });

  // SSL expiry check
  try {
    const sslResult = await checkSSLExpiry(TARGET);
    results.push(sslResult);
    if (!sslResult.passed) allPassed = false;
  } catch (err) {
    results.push({
      name: "ssl-expiry",
      url: TARGET,
      passed: false,
      errors: [err.message],
    });
    allPassed = false;
  }

  const report = {
    timestamp,
    target: TARGET,
    allPassed,
    durationMs: results.reduce((s, r) => s + (r.latencyMs ?? 0), 0),
    checks: results,
  };

  console.log(JSON.stringify(report, null, 2));

  // Exit non-zero if any check failed (useful for CI)
  if (!allPassed) {
    process.exit(1);
  }
}

async function checkSSLExpiry(url) {
  const { hostname } = new URL(url);
  const { connect } = await import("node:tls");

  return new Promise((resolve, reject) => {
    const socket = connect(443, hostname, { servername: hostname }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();

      if (!cert.valid_to) {
        resolve({ name: "ssl-expiry", url, passed: false, errors: ["No certificate found"] });
        return;
      }

      const expiry = new Date(cert.valid_to);
      const daysUntilExpiry = Math.floor((expiry - Date.now()) / (1000 * 60 * 60 * 24));
      const passed = daysUntilExpiry > 14;

      resolve({
        name: "ssl-expiry",
        url,
        passed,
        daysUntilExpiry,
        expiryDate: cert.valid_to,
        errors: passed ? [] : [`Certificate expires in ${daysUntilExpiry} days`],
      });
    });

    socket.on("error", (err) => reject(err));
  });
}

// Run immediately
check().catch((err) => {
  console.error("Monitor failed:", err);
  process.exit(1);
});
