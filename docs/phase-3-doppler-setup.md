# Phase 3 — Doppler Secrets Management Setup

> **Lou, alles manuell — Doppler hat keine CLI-Auth ohne Browser.**

---

## Eselbrücke

Doppler = Tresor für alle Secrets. Einmal rein, überall raus.  
Dev → Preview → Prod = drei Tresore mit identischen Keys, unterschiedlichen Values.

---

## 1. Doppler Account + Project

1. → [doppler.com](https://www.doppler.com) → Login oder Register
2. **New Project** → Name: `elbtronika`
3. Drei Environments werden automatisch angelegt: `dev`, `stg`, `prd`
   - Rename `stg` → `preview` (Settings → Rename)

Ergebnis:
```
elbtronika/
  dev      ← lokale Entwicklung
  preview  ← Netlify Preview Deploys
  prd      ← Netlify Production
```

---

## 2. Secrets pro Environment eintragen

Für jedes Environment die gleichen Keys, unterschiedliche Values:

| Secret | dev | preview | prd |
|--------|-----|---------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://srsxruutknqkzdmhonoa.supabase.co` | ← same | ← same |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | von Supabase Dashboard | ← same | ← same |
| `SUPABASE_SERVICE_ROLE_KEY` | von Supabase Dashboard | ← same | ← same |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | von sanity.io/manage | ← same | ← same |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | `production` | `production` |
| `SANITY_API_TOKEN` | write token (manage.sanity.io) | ← same | ← same |
| `SANITY_API_READ_TOKEN` | read token (manage.sanity.io) | ← same | ← same |
| `CLOUDFLARE_ACCOUNT_ID` | von CF Dashboard | ← same | ← same |
| `R2_ACCESS_KEY_ID` | R2 API Token | ← same | ← same |
| `R2_SECRET_ACCESS_KEY` | R2 API Token | ← same | ← same |
| `R2_BUCKET_NAME` | `elbtronika-assets` | ← same | ← same |
| `NEXT_PUBLIC_CDN_URL` | `https://cdn.elbtronika.art` | ← same | ← same |
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_test_...` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (test) | `whsec_...` (test) | `whsec_...` (live) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | `pk_test_...` | `pk_live_...` |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | ← same | ← same |

> **Stripe:** dev + preview = Test-Keys. prd = Live-Keys (erst nach Phase 15 KYC complete).

---

## 3. Doppler CLI lokal einrichten

```bash
# macOS/Linux
brew install dopplerhq/cli/doppler

# Windows (PowerShell als Admin)
winget install Doppler.doppler

# Login
doppler login

# Im Repo-Root (doppler.yaml liegt bereits da):
doppler setup
# → wähle: project=elbtronika, config=dev
```

Ab jetzt ersetzt `doppler run -- pnpm dev` die `.env.local` vollständig.

**Empfehlung:** `.env.local` bleibt als Fallback erhalten, wird aber nicht mehr gepflegt.

---

## 4. GitHub Actions Secrets (für CI/CD)

Doppler Service Token → GitHub Repo Secret:

1. Doppler → Project `elbtronika` → **Access** → **Service Tokens**
2. Neuen Token anlegen: `github-actions` → Environment: `prd` → Read-only
3. Token kopieren: `dp.st.prd.xxxx`
4. GitHub → Repo `DiggAiHH/elbtronika` → Settings → Secrets → **New repository secret**:
   - Name: `DOPPLER_TOKEN`
   - Value: `dp.st.prd.xxxx`

In `.github/workflows/ci.yml` kann dann ein `doppler run --` Step ergänzt werden (Phase 9).

---

## 5. Netlify Integration (für Deploys)

1. Netlify → Site → **Site configuration** → **Environment variables**
2. Doppler → Project `elbtronika` → **Integrations** → **Netlify**
3. Netlify Integration verbinden → Environment `preview` → Branch `main` previews
4. Environment `prd` → Branch `main` production

**Alternativ (manuell):** Alle Secrets aus Doppler `prd` nach Netlify `Environment variables` kopieren.

---

## 6. Sanity API Tokens anlegen (Voraussetzung für Schritt 2)

1. → [manage.sanity.io](https://manage.sanity.io) → Projekt auswählen
2. **API** → **Tokens** → **Add API token**
   - Name: `elbtronika-write` → Permissions: **Editor** → Token kopieren → `SANITY_API_TOKEN`
   - Name: `elbtronika-read` → Permissions: **Viewer** → Token kopieren → `SANITY_API_READ_TOKEN`

---

## Checkliste

- [ ] Doppler Project `elbtronika` mit 3 Environments angelegt
- [ ] Alle Secrets in `dev` eingetragen
- [ ] Alle Secrets in `preview` eingetragen  
- [ ] Alle Secrets in `prd` eingetragen (Stripe LIVE-Keys erst Phase 15)
- [ ] `doppler setup` lokal ausgeführt, `doppler run -- pnpm dev` funktioniert
- [ ] Sanity API Tokens (write + read) angelegt und eingetragen
- [ ] GitHub Secret `DOPPLER_TOKEN` gesetzt (Service Token für `prd`)
- [ ] Netlify Integration verbunden oder Vars manuell kopiert
