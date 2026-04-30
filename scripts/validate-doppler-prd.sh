#!/usr/bin/env bash
# validate-doppler-prd.sh
# Prüft ob alle Pflicht-ENV-Vars im Doppler prd Environment gesetzt sind.
# Verwendung: doppler run --config prd -- bash scripts/validate-doppler-prd.sh
# Oder lokal (mit exportierten Vars): bash scripts/validate-doppler-prd.sh

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

MISSING=0
PRESENT=0

check_var() {
  local var="$1"
  local secret="${2:-false}"
  local value="${!var:-}"

  if [[ -z "$value" ]]; then
    echo -e "${RED}✗ MISSING${NC}  $var"
    MISSING=$((MISSING + 1))
  else
    if [[ "$secret" == "true" ]]; then
      echo -e "${GREEN}✓ SET${NC}     $var = [REDACTED]"
    else
      echo -e "${GREEN}✓ SET${NC}     $var = $value"
    fi
    PRESENT=$((PRESENT + 1))
  fi
}

echo "======================================"
echo "  ELBTRONIKA — Doppler prd Validation"
echo "======================================"
echo ""

echo "--- Core App ---"
check_var "ELT_MODE"
check_var "NEXT_PUBLIC_SITE_URL"
check_var "MCP_AUDIT_DB"

echo ""
echo "--- Supabase ---"
check_var "NEXT_PUBLIC_SUPABASE_URL"
check_var "NEXT_PUBLIC_SUPABASE_ANON_KEY"
check_var "SUPABASE_SERVICE_ROLE_KEY" true

echo ""
echo "--- Stripe ---"
check_var "STRIPE_SECRET_KEY" true
check_var "STRIPE_PUBLISHABLE_KEY"
check_var "STRIPE_WEBHOOK_SECRET" true
check_var "STRIPE_CONNECT_REDIRECT_URL"

echo ""
echo "--- Sanity ---"
check_var "NEXT_PUBLIC_SANITY_PROJECT_ID"
check_var "NEXT_PUBLIC_SANITY_DATASET"
check_var "SANITY_API_TOKEN" true
check_var "SANITY_WEBHOOK_SECRET" true

echo ""
echo "--- Cloudflare R2 ---"
check_var "CLOUDFLARE_R2_ACCOUNT_ID"
check_var "CLOUDFLARE_R2_ACCESS_KEY_ID"
check_var "CLOUDFLARE_R2_SECRET_ACCESS_KEY" true
check_var "CLOUDFLARE_R2_BUCKET"
check_var "CLOUDFLARE_R2_PUBLIC_URL"

echo ""
echo "--- AI / Services ---"
check_var "ANTHROPIC_API_KEY" true
check_var "RESEND_API_KEY" true
check_var "SENTRY_DSN"

echo ""
echo "======================================"
echo -e "  ${GREEN}✓ Present: $PRESENT${NC} | ${RED}✗ Missing: $MISSING${NC}"
echo "======================================"

if [[ "$MISSING" -gt 0 ]]; then
  echo -e "${RED}FAIL: $MISSING required variable(s) missing from Doppler prd.${NC}"
  exit 1
else
  echo -e "${GREEN}OK: All required variables are set.${NC}"
  exit 0
fi
