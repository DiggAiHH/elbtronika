# Phase 3 — Delivery Protocol & Session DoD

**Sessions:** 2026-04-26 (automation) + 2026-04-27 (manual steps)  
**Tag:** v0.3.0 (code) | Manual steps: partial ✅  
**Status:** Infrastructure code ✅ | Secrets partial ✅ | Stripe ⏳

---

## What Was Delivered

### Session 1: 2026-04-26 — Infrastructure Automation (v0.3.0)

| Deliverable | Status |
|------------|--------|
| Supabase schema + RLS (11 tables, 30 policies) | ✅ |
| Cloudflare R2 bucket `elbtronika-assets` (EEUR) | ✅ |
| Sanity v4 `apps/cms` + 4 schemas (artist/dj/artwork/exhibition) | ✅ |
| Doppler project + 17 secrets populated (dev/stg/prd) | ✅ |
| GitHub Actions: `DOPPLER_TOKEN_PRD` + `DOPPLER_TOKEN_STG` | ✅ |
| ADR 0003: Infrastructure decisions | ✅ |
| Architecture diagram `docs/architecture-phase3.mermaid` | ✅ |

### Session 2: 2026-04-27 — Secrets + Manual Steps

| Deliverable | Status |
|------------|--------|
| Sanity project `xbjul8yd` created (org: oX1ou8dCN) | ✅ |
| Sanity API token `elbtronika-server` (Editor) | ✅ |
| Doppler: `SANITY_PROJECT_ID` + `SANITY_DATASET` + `SANITY_API_TOKEN` | ✅ |
| `apps/cms` scaffolded — commit `15072ce` | ✅ |
| `ANTHROPIC_API_KEY` set in Doppler (dev/preview/prd) | ✅ |
| `agent-ultraplan.md` §25–27: new patterns harnessed | ✅ |

---

## Remaining Manual Steps (⏳ Lou Action Required)

### 1. Stripe Test Keys — Priority: Medium (not blocking Phase 5)

Tab already open: `dashboard.stripe.com/acct_1SUcDN35CSBDOEWS/test/apikeys`

| Key | Where | How to enter Doppler |
|-----|-------|---------------------|
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys → Secret key | Doppler dev → STRIPE_SECRET_KEY value |
| `STRIPE_PUBLISHABLE_KEY` | Same page → Publishable key | Doppler dev → STRIPE_PUBLISHABLE_KEY value |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks → Add endpoint → localhost:3000/api/stripe/webhook → signing secret | Doppler dev → STRIPE_WEBHOOK_SECRET value |

**To enter in Doppler:** Use `execCommand('insertText')` pattern (see `agent-ultraplan.md §25`).

### 2. Netlify → Doppler Sync — Priority: Low (needed before production)

See `docs/phase-3-doppler-github-netlify-setup.md` §3.

**Option A (recommended):** Doppler → elbtronika → Syncs → + Add Sync → Netlify → OAuth → prd config  
**Option B:** Netlify site → Environment variables → Add `DOPPLER_TOKEN=<prd service token>`

---

## Secrets Inventory — Final State

| Secret | Status | Value |
|--------|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | real |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | real |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | real |
| `CLOUDFLARE_ACCOUNT_ID` | ✅ | `6abb3679bb27b6d7182ab01d290a3aeb` |
| `R2_BUCKET_NAME` | ✅ | `elbtronika-assets` |
| `R2_ACCESS_KEY_ID` | ✅ | real |
| `R2_SECRET_ACCESS_KEY` | ✅ | real |
| `R2_ENDPOINT` | ✅ | `https://6abb...r2.cloudflarestorage.com` |
| `NEXT_PUBLIC_CDN_URL` | ✅ | `https://cdn.elbtronika.art` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | dev=localhost:3000, prd=elbtronika.art |
| `SANITY_PROJECT_ID` | ✅ | `xbjul8yd` |
| `SANITY_DATASET` | ✅ | `production` |
| `SANITY_API_TOKEN` | ✅ | `elbtronika-server` (Editor) |
| `ANTHROPIC_API_KEY` | ✅ | real (set 2026-04-27) |
| `STRIPE_SECRET_KEY` | ⚠️ PLACEHOLDER | manual → dashboard.stripe.com/test/apikeys |
| `STRIPE_PUBLISHABLE_KEY` | ⚠️ PLACEHOLDER | manual → dashboard.stripe.com/test/apikeys |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ PLACEHOLDER | manual → dashboard.stripe.com/test/webhooks |

**14/17 secrets real. 3 Stripe keys pending (not blocking current phase).**

---

## Key Files Created This Phase

```
apps/cms/
  package.json             — @elbtronika/cms, Sanity v4
  sanity.config.ts         — project xbjul8yd, dataset production
  sanity.cli.ts            — CLI config
  schemas/
    artist.ts              — displayName, KYC status, Stripe account
    dj.ts                  — displayName, genres, SoundCloud, KYC
    artwork.ts             — title, artist ref, R2 key, price, edition
    exhibition.ts          — artworks[], featuredDj, open/close dates
    index.ts               — exports all schemas

docs/
  agent-ultraplan.md       — §25 Doppler Headless UI, §26 Chrome tiers, §27 status
  phase-3-doppler-github-netlify-setup.md — updated Anthropic key ✅
  phase-3-delivery-protocol.md  — this file
```

---

## Critical Path — Next

```
Phase 0 (Legal) → BLOCKS Phase 5–7
  → Steuerberater: Rechtsform-Entscheidung (GmbH / GbR / Einzelunternehmen)
  → Fachanwalt IT-Recht: Impressum, Datenschutzerklärung, AGB

When Phase 0 unblocked:
  Phase 5: Content ingestion (R2 upload, Sanity editorial flow)
  Phase 6: E-commerce (cart, checkout, Stripe Payment Intents)
     → THEN: replace Stripe placeholders with LIVE keys in Doppler prd
  Phase 7: Single Canvas (WebGPU Immersive Mode + Spatial Audio)
```

---

*Generated: 2026-04-27 | Commit: 3532caf | Repo: DiggAiHH/elbtronika*
