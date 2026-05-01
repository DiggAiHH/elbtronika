# Doppler prd Environment Validation Script
# PowerShell — Windows (Lou's Haupt-OS)
#
# Usage: doppler run --config prd -- pwsh scripts/validate-doppler-prd.ps1
#        (or: doppler run --config prd -- powershell scripts/validate-doppler-prd.ps1)
#
# Validates that ALL required environment variables are present and non-empty.
# Exits with 0 if valid, 1 if any required var is missing.

$ErrorActionPreference = "Stop"

$required = @(
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

$warnings = @(
    # Optional but recommended
    "NEXT_PUBLIC_SANITY_DATASET"
)

$failed = 0
$warned = 0

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Doppler prd Environment Validation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

foreach ($var in $required) {
    $val = [Environment]::GetEnvironmentVariable($var)
    if (-not $val -or $val -eq "") {
        Write-Host "  [FAIL] $var  → MISSING or EMPTY" -ForegroundColor Red
        $failed++
    } else {
        $display = if ($val.Length -gt 4) { $val.Substring(0, 2) + "***" + $val.Substring($val.Length - 2) } else { "****" }
        Write-Host "  [OK]   $var  → $display (length: $($val.Length))" -ForegroundColor Green
    }
}

Write-Host ""
foreach ($var in $warnings) {
    $val = [Environment]::GetEnvironmentVariable($var)
    if (-not $val -or $val -eq "") {
        Write-Host "  [WARN] $var  → MISSING (optional but recommended)" -ForegroundColor Yellow
        $warned++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($failed -eq 0) {
    Write-Host "Result: ALL REQUIRED VARIABLES PRESENT" -ForegroundColor Green
    if ($warned -gt 0) {
        Write-Host "Warnings: $warned optional vars missing" -ForegroundColor Yellow
    }
    Write-Host "========================================" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "Result: $failed REQUIRED VARIABLES MISSING" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    exit 1
}
