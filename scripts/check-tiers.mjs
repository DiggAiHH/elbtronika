#!/usr/bin/env node
/**
 * check-tiers.mjs — meldet Supabase + Netlify + Sanity Plan-Tier.
 * Aufruf: pnpm dr:tiers
 * Tokens via Doppler:
 *   - SUPABASE_ACCESS_TOKEN  (https://supabase.com/dashboard/account/tokens)
 *   - NETLIFY_AUTH_TOKEN     (https://app.netlify.com/user/applications)
 *   - SANITY_AUTH_TOKEN      (https://www.sanity.io/manage/personal/tokens)
 */
import "dotenv/config";

const SUPABASE = process.env.SUPABASE_ACCESS_TOKEN;
const NETLIFY = process.env.NETLIFY_AUTH_TOKEN;
const SANITY = process.env.SANITY_AUTH_TOKEN;

async function j(url, token, extraHeaders = {}) {
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, ...extraHeaders },
  });
  if (!r.ok) throw new Error(`${url} → HTTP ${r.status}: ${await r.text()}`);
  return r.json();
}

async function supabase() {
  if (!SUPABASE) return { skip: "kein SUPABASE_ACCESS_TOKEN" };
  const orgs = await j("https://api.supabase.com/v1/organizations", SUPABASE);
  const projs = await j("https://api.supabase.com/v1/projects", SUPABASE);
  return {
    orgs: orgs.map((o) => ({ id: o.id, name: o.name, plan: o.plan })),
    projects: projs.map((p) => ({ name: p.name, status: p.status, region: p.region })),
  };
}

async function netlify() {
  if (!NETLIFY) return { skip: "kein NETLIFY_AUTH_TOKEN" };
  const user = await j("https://api.netlify.com/api/v1/user", NETLIFY);
  const teams = await j("https://api.netlify.com/api/v1/accounts", NETLIFY);
  const sites = await j("https://api.netlify.com/api/v1/sites", NETLIFY);
  return {
    user: { email: user.email, name: user.full_name, siteCount: user.site_count },
    teams: teams.map((t) => ({ name: t.name, type: t.type_name, slug: t.slug })),
    sites: sites.map((s) => ({ name: s.name, plan: s.plan, url: s.url })),
  };
}

async function sanity() {
  if (!SANITY) return { skip: "kein SANITY_AUTH_TOKEN" };
  // Sanity Manage API
  const me = await j("https://api.sanity.io/v1/users/me", SANITY);
  const projects = await j("https://api.sanity.io/v2021-06-07/projects", SANITY);
  return {
    user: { name: me.name, email: me.email },
    projects: projects.map((p) => ({
      id: p.id,
      displayName: p.displayName,
      organizationId: p.organizationId,
      members: p.members?.length ?? 0,
    })),
  };
}

const main = async () => {
  console.log("=== ELBTRONIKA Tier-Check ===");
  for (const [name, fn] of [
    ["Supabase", supabase],
    ["Netlify", netlify],
    ["Sanity", sanity],
  ]) {
    console.log(`\n— ${name} —`);
    try {
      console.log(JSON.stringify(await fn(), null, 2));
    } catch (e) {
      console.error(`  ERR: ${e.message}`);
    }
  }
};

main();
