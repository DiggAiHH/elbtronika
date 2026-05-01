#!/usr/bin/env bash
# Doppler prd Environment Validation Script
# Bash — Linux/macOS/CI
#
# Usage: doppler run --config prd -- bash scripts/validate-doppler-prd.sh
#
# Validates that ALL required environment variables are present and non-empty.
# Exits with 0 if valid, 1 if any required var is missing.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

REQUIRED=(
    # Core App
    "ELT_MODE"
    "NEXT_PUBLIC_SITE_URL"

    # Supabase
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"

    # Stripe
    "STRIPE_SECRET_KEY"
    "STRIPE_PUBLISHABLE_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "STRIPE_CONNECT_REDIRECT_URL"

    # Sanity
    "NEXT_PUBLIC_SANITY_PROJECT_ID"
    "NEXT_PUBLIC_SANITY_DATASET"
    "SANITY_API_READ_TOKEN"
    "SANITY_API_TOKEN"
    "SANITY_WEBHOOK_SECRET"

    # Cloudflare R2
    "CLOUDFLARE_R2_ACCOUNT_ID"
    "CLOUDFLARE_R2_ACCESS_KEY_ID"
    "CLOUDFLARE_R2_SECRET_ACCESS_KEY"
    "CLOUDFLARE_R2_BUCKET"
    "CLOUDFLARE_R2_PUBLIC_URL"

    # AI & Messaging
    "ANTHROPIC_API_KEY"
    "RESEND_API_KEY"

    # Monitoring & Trust
    "SENTRY_DSN"
    "MCP_AUDIT_DB"
)

WARNINGS=(
    # Optional but recommended
    "NEXT_PUBLIC_SANITY_DATASET"
)

FAILED=0
WARNED=0

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Doppler prd Environment Validation${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

for var in "${REQUIRED[@]}"; do
    val="${!var:-}"
    if [ -z "$val" ]; then
        echo -e "  ${RED}[FAIL]${NC} $var  → MISSING or EMPTY"
        FAILED=$((FAILED + 1))
    else
        display="${val:0:2}***${val: -2}"
        echo -e "  ${GREEN}[OK]${NC}   $var  → $display (length: ${#val})"
    fi
done

echo ""
for var in "${WARNINGS[@]}"; do
    val="${!var:-}"
    if [ -z "$val" ]; then
        echo -e "  ${YELLOW}[WARN]${NC} $var  → MISSING (optional but recommended)"
        WARNED=$((WARNED + 1))
    fi
done

echo ""
echo -e "${CYAN}========================================${NC}"
if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}Result: ALL REQUIRED VARIABLES PRESENT${NC}"
    if [ "$WARNED" -gt 0 ]; then
        echo -e "${YELLOW}Warnings: $WARNED optional vars missing${NC}"
    fi
    echo -e "${CYAN}========================================${NC}"
    exit 0
else
    echo -e "${RED}Result: $FAILED REQUIRED VARIABLES MISSING${NC}"
    echo -e "${CYAN}========================================${NC}"
    exit 1
fi
