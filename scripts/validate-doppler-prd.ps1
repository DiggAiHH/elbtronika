# validate-doppler-prd.ps1
# Prüft ob alle Pflicht-ENV-Vars im Doppler prd Environment gesetzt sind.
# Verwendung: doppler run --config prd -- pwsh scripts/validate-doppler-prd.ps1
# Oder lokal (mit exportierten Vars): .\scripts\validate-doppler-prd.ps1

$missing = 0
$present = 0

function Check-Var {
  param(
    [string]$VarName,
    [bool]$IsSecret = $false
  )

  $value = [System.Environment]::GetEnvironmentVariable($VarName)

  if ([string]::IsNullOrEmpty($value)) {
    Write-Host "MISSING  $VarName" -ForegroundColor Red
    $script:missing++
  } else {
    if ($IsSecret) {
      Write-Host "SET      $VarName = [REDACTED]" -ForegroundColor Green
    } else {
      Write-Host "SET      $VarName = $value" -ForegroundColor Green
    }
    $script:present++
  }
}

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  ELBTRONIKA - Doppler prd Validation" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "--- Core App ---"
Check-Var "ELT_MODE"
Check-Var "NEXT_PUBLIC_SITE_URL"
Check-Var "MCP_AUDIT_DB"

Write-Host ""
Write-Host "--- Supabase ---"
Check-Var "NEXT_PUBLIC_SUPABASE_URL"
Check-Var "NEXT_PUBLIC_SUPABASE_ANON_KEY"
Check-Var "SUPABASE_SERVICE_ROLE_KEY" -IsSecret $true

Write-Host ""
Write-Host "--- Stripe ---"
Check-Var "STRIPE_SECRET_KEY" -IsSecret $true
Check-Var "STRIPE_PUBLISHABLE_KEY"
Check-Var "STRIPE_WEBHOOK_SECRET" -IsSecret $true
Check-Var "STRIPE_CONNECT_REDIRECT_URL"

Write-Host ""
Write-Host "--- Sanity ---"
Check-Var "NEXT_PUBLIC_SANITY_PROJECT_ID"
Check-Var "NEXT_PUBLIC_SANITY_DATASET"
Check-Var "SANITY_API_TOKEN" -IsSecret $true
Check-Var "SANITY_WEBHOOK_SECRET" -IsSecret $true

Write-Host ""
Write-Host "--- Cloudflare R2 ---"
Check-Var "CLOUDFLARE_R2_ACCOUNT_ID"
Check-Var "CLOUDFLARE_R2_ACCESS_KEY_ID"
Check-Var "CLOUDFLARE_R2_SECRET_ACCESS_KEY" -IsSecret $true
Check-Var "CLOUDFLARE_R2_BUCKET"
Check-Var "CLOUDFLARE_R2_PUBLIC_URL"

Write-Host ""
Write-Host "--- AI / Services ---"
Check-Var "ANTHROPIC_API_KEY" -IsSecret $true
Check-Var "RESEND_API_KEY" -IsSecret $true
Check-Var "SENTRY_DSN"

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Present: $present  |  Missing: $missing" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

if ($missing -gt 0) {
  Write-Host "FAIL: $missing required variable(s) missing from Doppler prd." -ForegroundColor Red
  exit 1
} else {
  Write-Host "OK: All required variables are set." -ForegroundColor Green
  exit 0
}
