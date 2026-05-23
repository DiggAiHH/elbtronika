#!/usr/bin/env node
// Lightweight CF API helper using stored wrangler OAuth token.
// Usage: node scripts/cf-api-call.mjs <method> <path> [bodyJson]
// Example: node scripts/cf-api-call.mjs GET /zones
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const cfgPath = join(homedir(), ".wrangler", "config", "default.toml");
const toml = readFileSync(cfgPath, "utf8");
const tokenMatch = toml.match(/^oauth_token\s*=\s*"([^"]+)"/m);
if (!tokenMatch) {
  console.error("No oauth_token found in", cfgPath);
  process.exit(1);
}
const token = tokenMatch[1];

const [, , method = "GET", path = "/user", bodyJson] = process.argv;
const url = `https://api.cloudflare.com/client/v4${path}`;
const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
const opts = { method, headers };
if (bodyJson) opts.body = bodyJson;

const res = await fetch(url, opts);
const data = await res.json().catch(() => null);
console.log(JSON.stringify({ status: res.status, ok: res.ok, data }, null, 2));
process.exit(res.ok ? 0 : 1);
