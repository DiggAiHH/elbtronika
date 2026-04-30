# Doppler `prd` Environment — Schritt-für-Schritt-Anleitung

> **Ziel:** Doppler-Projekt `elbtronika`, Environment `prd` vollständig mit allen Demo-/Live-Variablen befüllen.
> **Dauer:** 30 Minuten (mit Chrome-MCP-Session: Lou loggt ein, Opus klickt durch)
> **Voraussetzung:** Doppler-Account vorhanden, Project `elbtronika` existiert mit Environments `dev`, `preview`, `prd`
> **Letztes Update:** 2026-04-30

---

## Prerequisites

- [ ] Doppler-Account (Lou's Login: `lou@elbtronika.de` oder SSO)
- [ ] Projekt `elbtronika` in Doppler angelegt
- [ ] Environments `dev`, `preview`, `prd` vorhanden
- [ ] Admin-Zugriff auf alle Integrations-Dashboards (Supabase, Stripe, Sanity, Cloudflare, Anthropic, Resend, Sentry)

---

## Schritt 1: Doppler Login & Projekt-Auswahl

1. Öffne [https://dashboard.doppler.com](https://dashboard.doppler.com)
2. Login mit Lou's Credentials
3. Wähle Workspace → Projekt `elbtronika`
4. Klicke auf Environment **`prd`**

---

## Schritt 2: Variablen eintragen

> **Hinweis:** In der Demo-Phase werden `test_`-Keys verwendet. Post-Lee-OK werden diese auf `live_`-Keys getauscht (siehe `live-switch-post-lee-ok.md`).

### 2.1 Core App

| Variable | Wert-Quelle | Bemerkung |
|----------|-------------|-----------|
| `ELT_MODE` | `demo` (initial) → `live` (post-Lee) | Steuert Demo-/Staging-/Live-Modus |
| `NEXT_PUBLIC_SITE_URL` | `https://elbtronika.art` | Canonical URL, auch für OAuth-Redirects |

### 2.2 Supabase

| Variable | Wert-Quelle | Bemerkung |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → URL | Auch für Client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → `anon public` | Client-safe |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → `service_role secret` | **NUR server-side — niemals exposed!** |

### 2.3 Stripe

| Variable | Wert-Quelle | Bemerkung |
|----------|-------------|-----------|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API Keys → `sk_test_...` | Test-Mode (Demo). Live: `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API Keys → `pk_test_...` | Client-safe. Live: `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks → Signing secret | Test-Mode. Live: neu generieren für prod-Endpoint |
| `STRIPE_CONNECT_REDIRECT_URL` | `https://elbtronika.art/onboarding/stripe/callback` | Muss in Stripe-Dashboard als Redirect-URL hinterlegt sein |

### 2.4 Sanity

| Variable | Wert-Quelle | Bemerkung |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity Dashboard → Project → ID | Client-safe |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` (oder `demo` für separaten Demo-Project) | Client-safe |
| `SANITY_API_READ_TOKEN` | Sanity Dashboard → API → Tokens → Viewer-Token | Server-only |
| `SANITY_API_TOKEN` | Sanity Dashboard → API → Tokens → Editor-Token | Server-only (für Writes) |
| `SANITY_WEBHOOK_SECRET` | Self-generated: `openssl rand -hex 32` | Mindestens 32 Zeichen, in Sanity-Webhook + Doppler identisch |

### 2.5 Cloudflare R2

| Variable | Wert-Quelle | Bemerkung |
|----------|-------------|-----------|
| `CLOUDFLARE_R2_ACCOUNT_ID` | Cloudflare Dashboard → R2 → Account-ID | |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | Cloudflare Dashboard → R2 → API Tokens → Access Key ID | |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | Cloudflare Dashboard → R2 → API Tokens → Secret Access Key | |
| `CLOUDFLARE_R2_BUCKET` | `elbtronika-assets-prd` | Bucket-Name |
| `CLOUDFLARE_R2_PUBLIC_URL` | `https://cdn.elbtronika.art` | Public Custom Domain |

### 2.6 AI & Messaging

| Variable | Wert-Quelle | Bemerkung |
|----------|-------------|-----------|
| `ANTHROPIC_API_KEY` | [Anthropic Console](https://console.anthropic.com) → API Keys | Separater Prod-Key empfohlen |
| `RESEND_API_KEY` | [Resend Dashboard](https://resend.com) → API Keys | Für Magic-Link + Transaktions-Mails |

### 2.7 Monitoring & Trust

| Variable | Wert-Quelle | Bemerkung |
|----------|-------------|-----------|
| `SENTRY_DSN` | Sentry Dashboard → Project → DSN | Client + Server |
| `MCP_AUDIT_DB` | `true` | Aktiviert DB-gestütztes MCP-Auditing |

---

## Schritt 3: Integrationen verbinden

### 3.1 Netlify Deploy Context

1. Doppler → Integrations → Netlify
2. Wähle Site `elbtronika`
3. Mappe `prd` → Netlify `Production`
4. Klicke **Sync**

### 3.2 GitHub Actions

1. Doppler → Integrations → GitHub Actions
2. Erstelle Service Token: `DOPPLER_TOKEN_PRD`
3. In GitHub Repo → Settings → Secrets → `DOPPLER_TOKEN_PRD` hinterlegen
4. Workflow-Beispiel:
   ```yaml
   - uses: dopplerhq/secrets-fetch-action@v1
     with:
       doppler-token: ${{ secrets.DOPPLER_TOKEN_PRD }}
       doppler-project: elbtronika
       doppler-config: prd
   ```

---

## Schritt 4: Validierung

### 4.1 Doppler CLI Validation

```bash
# Login
doppler login

# Projekt wählen
doppler setup --project elbtronika --config prd

# Alle Secrets anzeigen (maskiert)
doppler secrets

# Einzelne Variable prüfen
doppler secrets get ELT_MODE --plain
doppler secrets get SUPABASE_SERVICE_ROLE_KEY --plain | wc -c  # sollte > 50 sein
```

### 4.2 PowerShell Validation-Skript (Windows — Lou's Haupt-OS)

Speichere als `scripts/validate-doppler-prd.ps1` und führe aus:

```powershell
# validate-doppler-prd.ps1
$required = @(
  "ELT_MODE",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_CONNECT_REDIRECT_URL",
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_DATASET",
  "SANITY_API_READ_TOKEN",
  "SANITY_WEBHOOK_SECRET",
  "CLOUDFLARE_R2_ACCOUNT_ID",
  "CLOUDFLARE_R2_ACCESS_KEY_ID",
  "CLOUDFLARE_R2_SECRET_ACCESS_KEY",
  "CLOUDFLARE_R2_BUCKET",
  "CLOUDFLARE_R2_PUBLIC_URL",
  "ANTHROPIC_API_KEY",
  "RESEND_API_KEY",
  "SENTRY_DSN",
  "NEXT_PUBLIC_SITE_URL",
  "MCP_AUDIT_DB"
)

$missing = @()
foreach ($var in $required) {
  $val = [System.Environment]::GetEnvironmentVariable($var)
  if (-not $val) {
    # Try Doppler CLI
    $val = doppler secrets get $var --plain 2>$null
  }
  if (-not $val) {
    $missing += $var
  } else {
    Write-Host "  ✓ $var" -ForegroundColor Green
  }
}

if ($missing.Count -gt 0) {
  Write-Host "`nMissing variables:" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host "  ✗ $_" -ForegroundColor Red }
  exit 1
} else {
  Write-Host "`nAll 22 variables present. Doppler prd is ready." -ForegroundColor Green
}
```

### 4.3 Bash Validation-Skript (Linux/macOS/CI)

```bash
#!/usr/bin/env bash
# scripts/validate-doppler-prd.sh
set -euo pipefail

REQUIRED=(
  ELT_MODE NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY STRIPE_SECRET_KEY STRIPE_PUBLISHABLE_KEY
  STRIPE_WEBHOOK_SECRET STRIPE_CONNECT_REDIRECT_URL
  NEXT_PUBLIC_SANITY_PROJECT_ID NEXT_PUBLIC_SANITY_DATASET
  SANITY_API_READ_TOKEN SANITY_WEBHOOK_SECRET
  CLOUDFLARE_R2_ACCOUNT_ID CLOUDFLARE_R2_ACCESS_KEY_ID
  CLOUDFLARE_R2_SECRET_ACCESS_KEY CLOUDFLARE_R2_BUCKET
  CLOUDFLARE_R2_PUBLIC_URL ANTHROPIC_API_KEY RESEND_API_KEY
  SENTRY_DSN NEXT_PUBLIC_SITE_URL MCP_AUDIT_DB
)

MISSING=0
for var in "${REQUIRED[@]}"; do
  if ! doppler secrets get "$var" --plain >/dev/null 2>&1; then
    echo "  ✗ $var"
    MISSING=$((MISSING + 1))
  else
    echo "  ✓ $var"
  fi
done

if [ "$MISSING" -gt 0 ]; then
  echo ""
  echo "$MISSING variable(s) missing in Doppler prd."
  exit 1
else
  echo ""
  echo "All ${#REQUIRED[@]} variables present. Doppler prd is ready."
fi
```

---

## Schritt 5: Smoke-Test nach Deploy

1. Netlify Production-Deploy triggern (oder warten auf Auto-Deploy)
2. `https://elbtronika.art` öffnen
3. Demo-Banner sichtbar? → `ELT_MODE=demo` funktioniert
4. `/api/health` → `{"status":"ok"}`
5. `/de/shop` → Artworks laden
6. Supabase-Dashboard → `mcp_audit_log` Tabelle existiert

---

## Troubleshooting

| Problem | Lösung |
|---------|--------|
| `doppler login` schlägt fehl | Token expired → `doppler logout && doppler login` |
| Netlify zeigt alte ENV | "Clear cache and retry deploy" in Netlify-Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` fehlt | Supabase → Project Settings → API → reveal `service_role` |
| Stripe-Webhook 400 | Webhook-Secret in Doppler muss exakt mit Stripe-Dashboard übereinstimmen |
| Sanity-Webhook 401 | `SANITY_WEBHOOK_SECRET` in Doppler und Sanity müssen identisch sein |

---

## Post-Lee-OK: Live-Key-Tausch

Siehe `docs/runbooks/live-switch-post-lee-ok.md` für die 15-Minuten-Choreografie.
