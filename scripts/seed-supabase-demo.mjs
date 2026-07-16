#!/usr/bin/env node
/**
 * Seed Supabase with the demo commerce rows (profiles→artists/djs→sets→artworks).
 *
 *   doppler run -- node scripts/seed-supabase-demo.mjs --seed <assets>/supabase-seed.json
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (Doppler dev).
 * Input file is produced by scripts/seed-sanity-demo.mjs (real asset URLs baked in).
 *
 * profiles.id is FK'd to auth.users, so each persona gets an auth user
 * (idempotent: looked up by email first). All demo rows are re-runnable
 * upserts; artworks carry is_demo=true so the live-switch can filter them.
 */

import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

// biome-ignore lint/suspicious/noUndeclaredEnvVars: CLI script — injected via doppler run
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// biome-ignore lint/suspicious/noUndeclaredEnvVars: CLI script — injected via doppler run
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (doppler run -- …)");
  process.exit(1);
}

const seedIdx = process.argv.indexOf("--seed");
const seedPath = seedIdx >= 0 ? process.argv[seedIdx + 1] : "supabase-seed.json";
const seed = JSON.parse(readFileSync(seedPath, "utf8"));

const { createClient } = await import("@supabase/supabase-js");
const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function ensureAuthUser(email, displayName) {
  // Look up by email (paginated list — demo scale is tiny)
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 200 });
  if (listErr) throw new Error(`listUsers: ${listErr.message}`);
  const existing = list.users.find((u) => u.email === email);
  if (existing) return existing.id;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    password: randomBytes(24).toString("base64url"),
    user_metadata: { display_name: displayName, demo: true },
  });
  if (error) throw new Error(`createUser ${email}: ${error.message}`);
  return data.user.id;
}

console.log(`Seeding ${url} …`);

// 1. Auth users + profiles + artists/djs
for (const persona of seed.personas) {
  const userId = await ensureAuthUser(persona.email, persona.display_name);

  const { error: profileErr } = await supabase.from("profiles").upsert(
    {
      id: userId,
      display_name: persona.display_name,
      role: persona.role,
      bio: persona.entity.bio ?? null,
      locale: "de",
    },
    { onConflict: "id" },
  );
  if (profileErr) throw new Error(`profiles ${persona.email}: ${profileErr.message}`);

  const table = persona.kind === "artist" ? "artists" : "djs";
  const { error: entityErr } = await supabase
    .from(table)
    .upsert({ ...persona.entity, profile_id: userId }, { onConflict: "id" });
  if (entityErr) throw new Error(`${table} ${persona.entity.slug}: ${entityErr.message}`);
  console.log(`persona ok: ${persona.kind} ${persona.entity.slug}`);
}

// 2. Sets
const { error: setsErr } = await supabase.from("sets").upsert(seed.sets, { onConflict: "id" });
if (setsErr) throw new Error(`sets: ${setsErr.message}`);
console.log(`sets ok: ${seed.sets.length}`);

// 3. Artworks
const { error: artErr } = await supabase.from("artworks").upsert(seed.artworks, { onConflict: "id" });
if (artErr) throw new Error(`artworks: ${artErr.message}`);
console.log(`artworks ok: ${seed.artworks.length}`);

console.log("done — next: pnpm tsx scripts/analyze-assets.mts <assets>/manifest.json --upsert");
