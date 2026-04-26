# Phase 3 — Doppler → GitHub Actions → Netlify Setup

Generated: 2026-04-26 | Status: Doppler ✅ done, GitHub + Netlify = manual steps below

---

## What's Already Done

- ✅ Doppler project `elbtronika` — all 3 environments populated (dev / stg / prd)
- ✅ 14 secrets in `dev` (root, propagated to stg + prd)
- ✅ `prd` override: `NEXT_PUBLIC_SITE_URL=https://elbtronika.art`
- ✅ Doppler service token created for `prd` → `github-actions-prd`
- ✅ Doppler service token created for `stg` → `netlify-preview-stg`

**⚠️ Stripe + Anthropic keys are PLACEHOLDERS — replace after obtaining real keys.**

---

## Step 1 — Add Doppler Tokens to GitHub Actions

Run in repo root (`D:\Elbtronika\Elbtonika`):

```cmd
gh secret set DOPPLER_TOKEN_PRD --body "<get from Doppler: elbtronika/prd/Access/github-actions-prd>" --repo DiggAiHH/elbtronika
gh secret set DOPPLER_TOKEN_STG --body "<get from Doppler: elbtronika/stg/Access/netlify-preview-stg>" --repo DiggAiHH/elbtronika
```

Verify: https://github.com/DiggAiHH/elbtronika/settings/secrets/actions

---

## Step 2 — Update GitHub Actions Workflow

Edit `.github/workflows/ci.yml` — add Doppler secret injection before build:

```yaml
- name: Install Doppler CLI
  uses: dopplerhq/cli-action@v3

- name: Build with Doppler secrets
  env:
    DOPPLER_TOKEN: ${{ secrets.DOPPLER_TOKEN_PRD }}
  run: doppler run -- pnpm build
```

For preview/stg builds, use `DOPPLER_TOKEN_STG` instead.

---

## Step 3 — Connect Netlify to Doppler

Option A — Netlify UI (recommended):
1. Go to https://app.netlify.com → Site → Site configuration → Environment variables
2. Add: `DOPPLER_TOKEN` = `<prd service token from Doppler: elbtronika/prd/Access>`
3. In `netlify.toml`, set build command: `doppler run -- pnpm build`

Option B — Doppler Sync (auto-push):
1. Doppler dashboard → elbtronika project → Syncs → + Add Sync
2. Select "Netlify" → connect OAuth → select site → map `prd` → select env vars
3. Doppler will push secrets to Netlify env vars on every save

---

## Step 4 — Replace Placeholder Secrets

In Doppler dashboard → elbtronika / dev (propagates to stg + prd):

| Key | Where to get |
|-----|-------------|
| `STRIPE_SECRET_KEY` | https://dashboard.stripe.com/test/apikeys → Secret key (`sk_test_...`) |
| `STRIPE_PUBLISHABLE_KEY` | Same page → Publishable key (`pk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | https://dashboard.stripe.com/test/webhooks → Add endpoint → signing secret (`whsec_...`) |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/settings/keys → Create key (`sk-ant-...`) |
| `SANITY_PROJECT_ID` | After `sanity init` in `apps/cms/` |
| `SANITY_API_TOKEN` | https://www.sanity.io/manage → project → API → Tokens |

After updating in Doppler `dev`, click Save → check "preview" + "Production" to propagate.

---

## Secrets Inventory (dev config)

| Key | Status |
|-----|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ real value |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ real value |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ real value |
| `CLOUDFLARE_ACCOUNT_ID` | ✅ real value |
| `R2_BUCKET_NAME` | ✅ real value |
| `R2_ACCESS_KEY_ID` | ✅ real value |
| `R2_SECRET_ACCESS_KEY` | ✅ real value |
| `R2_ENDPOINT` | ✅ real value |
| `NEXT_PUBLIC_CDN_URL` | ✅ real value |
| `NEXT_PUBLIC_SITE_URL` | ✅ dev=localhost:3000, prd=https://elbtronika.art |
| `STRIPE_SECRET_KEY` | ⚠️ PLACEHOLDER |
| `STRIPE_PUBLISHABLE_KEY` | ⚠️ PLACEHOLDER |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ PLACEHOLDER |
| `ANTHROPIC_API_KEY` | ⚠️ PLACEHOLDER |
