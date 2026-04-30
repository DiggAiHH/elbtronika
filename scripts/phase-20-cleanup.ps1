# ELBTRONIKA — Phase 20 Pre-Pitch-Cleanup Script
# Automates: Migrations push → Doppler ENV → Types regen → Smoke test
# Prerequisites: Supabase CLI, Doppler CLI, pnpm installed
# Usage: .\scripts\phase-20-cleanup.ps1 -SupabaseProjectId "your-project-id"

param(
    [Parameter(Mandatory=$true)]
    [string]$SupabaseProjectId,
    
    [switch]$SkipMigrations,
    [switch]$SkipDoppler,
    [switch]$SkipTypes,
    [switch]$SkipSmokeTest
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host "=== ELBTRONIKA Phase 20 Pre-Pitch-Cleanup ===" -ForegroundColor Cyan
Write-Host "Project: $SupabaseProjectId" -ForegroundColor DarkGray
Write-Host ""

# --- Pre-flight checks ---
Write-Host "[PRE-FLIGHT] Checking tools..." -ForegroundColor Yellow
$tools = @("pnpm", "supabase", "doppler", "git")
$missing = @()
foreach ($tool in $tools) {
    $cmd = Get-Command $tool -ErrorAction SilentlyContinue
    if (-not $cmd) {
        $missing += $tool
        Write-Host "  ❌ $tool NOT FOUND" -ForegroundColor Red
    } else {
        Write-Host "  ✅ $tool" -ForegroundColor Green
    }
}
if ($missing.Count -gt 0) {
    Write-Host ""
    Write-Host "ERROR: Missing tools: $($missing -join ', ')" -ForegroundColor Red
    Write-Host "Run .\scripts\install-dev-tools.ps1 first" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# --- Step 1: Push Migrations ---
if (-not $SkipMigrations) {
    Write-Host "[1/4] Pushing Supabase Migrations..." -ForegroundColor Yellow
    Write-Host "  Migrations to push:" -ForegroundColor DarkGray
    Get-ChildItem "$repoRoot\supabase\migrations\20260430_*.sql" | ForEach-Object {
        Write-Host "    - $($_.Name)" -ForegroundColor DarkGray
    }
    Write-Host ""
    
    Write-Host "  Running: supabase db push --project-ref $SupabaseProjectId" -ForegroundColor DarkGray
    supabase db push --project-ref $SupabaseProjectId
    if ($LASTEXITCODE -ne 0) { throw "db push failed" }
    
    Write-Host "  Verifying: supabase migration list" -ForegroundColor DarkGray
    supabase migration list --project-ref $SupabaseProjectId
    
    Write-Host "  ✅ Migrations pushed" -ForegroundColor Green
    Write-Host ""
}

# --- Step 2: Doppler ENV Setup ---
if (-not $SkipDoppler) {
    Write-Host "[2/4] Configuring Doppler dev ENV..." -ForegroundColor Yellow
    
    # Check current values
    Write-Host "  Current Doppler dev ENV:" -ForegroundColor DarkGray
    doppler secrets --project elbtronika --config dev 2>$null | Select-String "ELT_MODE|MCP_AUDIT" | ForEach-Object {
        Write-Host "    $_" -ForegroundColor DarkGray
    }
    
    Write-Host ""
    Write-Host "  Setting ELT_MODE=demo..." -ForegroundColor DarkGray
    doppler secrets set ELT_MODE demo --project elbtronika --config dev
    
    Write-Host "  Setting MCP_AUDIT_DB=true..." -ForegroundColor DarkGray
    doppler secrets set MCP_AUDIT_DB true --project elbtronika --config dev
    
    Write-Host "  ✅ Doppler dev ENV configured" -ForegroundColor Green
    Write-Host ""
}

# --- Step 3: Regenerate Supabase Types ---
if (-not $SkipTypes) {
    Write-Host "[3/4] Regenerating Supabase Types..." -ForegroundColor Yellow
    
    $typesFile = "$repoRoot\packages\contracts\src\supabase\types.ts"
    Write-Host "  Output: $typesFile" -ForegroundColor DarkGray
    
    supabase gen types typescript --project-id $SupabaseProjectId > $typesFile
    if ($LASTEXITCODE -ne 0) { throw "gen types failed" }
    
    Write-Host "  ✅ Types regenerated ($(Get-Content $typesFile | Measure-Object -Line | Select-Object -ExpandProperty Lines) lines)" -ForegroundColor Green
    Write-Host ""
    
    # TODO: Remove as any casts
    Write-Host "  NOTE: Remove 'as any' casts in apps/web/src/lib/mcp/audit.ts manually" -ForegroundColor DarkYellow
    Write-Host ""
}

# --- Step 4: Smoke Tests ---
if (-not $SkipSmokeTest) {
    Write-Host "[4/4] Running Smoke Tests..." -ForegroundColor Yellow
    
    Write-Host "  Typecheck..." -ForegroundColor DarkGray
    pnpm.cmd --filter @elbtronika/web typecheck
    if ($LASTEXITCODE -ne 0) { throw "typecheck failed" }
    
    Write-Host "  Unit tests..." -ForegroundColor DarkGray
    pnpm.cmd --filter @elbtronika/web test
    if ($LASTEXITCODE -ne 0) { throw "unit tests failed" }
    
    Write-Host "  ✅ Smoke tests passed" -ForegroundColor Green
    Write-Host ""
}

# --- Summary ---
Write-Host "=== Phase 20 Cleanup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Create 8 Stripe Test Connected Accounts" -ForegroundColor DarkGray
Write-Host "     → dashboard.stripe.com/test/connect" -ForegroundColor DarkGray
Write-Host "     → Update apps/web/src/lib/stripe/demo.ts" -ForegroundColor DarkGray
Write-Host "  2. Schedule pitch rehearsal (30 min)" -ForegroundColor DarkGray
Write-Host "  3. Pitch to Lee Hoops" -ForegroundColor DarkGray
Write-Host ""
