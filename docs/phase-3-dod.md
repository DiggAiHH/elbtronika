# Phase 3 DoD — Infrastructure

**Date:** 2026-04-26  
**Tag:** v0.3.0  
**Status:** ✅ Complete

---

## Definition of Done Checklist

### 3.1 Supabase (Database)

- [x] Supabase project `srsxruutknqkzdmhonoa` created (EU-Frankfurt, aws eu-central-1)
- [x] Migration `20260426000001_initial_schema.sql` — 11 tables, triggers, HNSW + FTS indexes
- [x] Migration `20260426000002_rls_policies.sql` — 30 RLS policies, `is_admin()` helper
- [x] `handle_new_auth_user()` trigger — auto-creates profile on signup
- [x] `set_updated_at()` trigger — all tables with `updated_at`
- [x] `log_audit_event()` trigger — audit trail for profiles/artists/djs/artworks
- [x] GDPR-compliant: `consent_log` + `audit_events` append-only (no DELETE policies)
- [x] Financial records immutable: `orders` + `transactions` no DELETE
- [x] 60/20/20 split enforced structurally in `orders` table
- [x] RLS verified via `pg_policies` (30 policies confirmed)
- [x] `@supabase/supabase-js` + `@supabase/ssr` in `apps/web`
- [x] `packages/contracts/src/supabase/types.ts` — full Database type + branded row types
- [x] `apps/web/src/lib/supabase/client.ts` — browser client
- [x] `apps/web/src/lib/supabase/server.ts` — server component client
- [x] `apps/web/src/lib/supabase/middleware.ts` — JWT refresh + auth guard
- [x] `apps/web/src/middleware.ts` — wired to Supabase session update

### 3.2 Cloudflare R2 (Storage)

- [x] Runbook: `docs/phase-3-cloudflare-r2-setup.md`
- [x] Bucket name: `elbtronika-assets` (EEUR region, zero-egress)
- [x] Custom domain: `cdn.elbtronika.art` (CNAME via Cloudflare)
- [x] Folder structure convention documented
- [x] CORS policy documented
- [x] R2 API token creation steps documented
- [x] Doppler secret names defined: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`

### 3.3 Sanity v4 (CMS)

- [x] `apps/web/sanity.config.ts` — structureTool + visionTool (dev only)
- [x] 6 schemas: `artist`, `artwork`, `dj`, `set`, `room`, `story`
- [x] `room` schema: 3D environment config (skyboxUrl, ambientLightIntensity, fogDensity)
- [x] `set` schema: tracklist, bpm, durationMin, HLS bridge via supabaseId
- [x] Embedded studio at `/studio/[[...tool]]`
- [x] `apps/web/src/lib/sanity/client.ts` — `sanityClient`, `sanityPreviewClient`, `getClient()`
- [x] `apps/web/src/lib/sanity/queries.ts` — GROQ queries for all 6 content types
- [x] `next-sanity@^10`, `sanity@^4`, `@sanity/vision@^4` in `apps/web/package.json`
- [x] `exactOptionalPropertyTypes` fix: conditional spread for `token`

### 3.4 Doppler (Secrets)

- [x] `doppler.yaml` in repo root (project: elbtronika, config: dev)
- [x] Runbook: `docs/phase-3-doppler-setup.md`
- [x] 3 environments documented: `dev`, `preview`, `prd`
- [x] All 16 secrets tabulated with values per environment
- [x] GitHub Service Token workflow documented
- [x] Netlify integration documented
- [x] `.env.example` updated with `SANITY_API_READ_TOKEN`

### 3.5 Netlify + GitHub Secrets

- [x] CI workflow already has Netlify deploy job (`continue-on-error: true`)
- [x] Runbook: `docs/phase-3-netlify-github-secrets.md`
- [x] `NETLIFY_SITE_ID` + `NETLIFY_AUTH_TOKEN` setup documented (2 options: CLI + Dashboard)
- [x] Build settings documented (base: `apps/web`, publish: `.next`)

### 3.6 Documentation

- [x] `docs/adr/0003-infrastructure-phase3.md` — full ADR with rationale and alternatives
- [x] `docs/architecture-phase3.mermaid` — system architecture diagram
- [x] All manual steps for Lou in `/docs/phase-3-*.md` runbooks

### CI / Quality Gates

- [x] `pnpm install` — lockfile updated, no frozen-lockfile mismatch
- [x] Biome lint — 0 errors (warnings only: `noNonNullAssertion`, `noBarrelFile` — pre-approved)
- [x] TypeScript — 0 errors (`exactOptionalPropertyTypes` fix applied)
- [x] Vitest — passes with `--passWithNoTests`
- [x] Next.js Build — succeeds with placeholder env vars
- [x] Netlify Deploy — `continue-on-error: true` (secrets pending Lou's manual steps)

---

## Commit History (Phase 3)

| Commit | Description |
|--------|-------------|
| `feat(supabase)` | DB schema, RLS policies, contracts types, Supabase clients |
| `fix(lint)` × 3 | Biome auto-fixes (organizeImports, useLiteralKeys, useImportType) |
| `docs(r2)` | Cloudflare R2 runbook |
| `feat(sanity)` | Sanity v4 studio, schemas, client helpers |
| `fix(lint)` | CSS keyframe multi-line format |
| `chore(doppler)` | doppler.yaml + setup runbook |
| `docs(netlify)` | Netlify + GitHub Secrets runbook |
| `docs(adr)` | ADR 0003 + architecture Mermaid diagram |

---

## What Requires Manual Action from Lou

| Item | Runbook |
|------|---------|
| Cloudflare R2 bucket + CNAME | `docs/phase-3-cloudflare-r2-setup.md` |
| Sanity project init + API tokens | `docs/phase-3-doppler-setup.md` §6 |
| Doppler project setup + secrets | `docs/phase-3-doppler-setup.md` |
| Netlify site creation | `docs/phase-3-netlify-github-secrets.md` |
| GitHub secrets NETLIFY_SITE_ID + TOKEN | `docs/phase-3-netlify-github-secrets.md` |

---

## Next Phase

**Phase 4** — Auth + User Profiles (unblocked by Phase 3 ✅)

- Supabase Auth UI (magic link + OAuth)
- Protected routes via middleware
- Profile creation flow (handle_new_auth_user trigger already in place)
- Stripe Connect onboarding for artists/DJs (KYC)
