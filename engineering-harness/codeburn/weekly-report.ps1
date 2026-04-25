# CodeBurn Weekly Report — ELBTRONIKA Token-Kosten Automation
# Generiert wöchentlichen Token-Report + Optimize-Scan
# Setup: Windows Task Scheduler oder manuell ausführen
#
# Usage:
#   .\engineering-harness\codeburn\weekly-report.ps1
#   .\engineering-harness\codeburn\weekly-report.ps1 -Period today
#   .\engineering-harness\codeburn\weekly-report.ps1 -Export

param(
    [string]$Period   = "7days",     # today | 7days | 30days | month | all
    [string]$Provider = "",          # claude | codex | cursor | "" (alle)
    [switch]$Export,                 # CSV + JSON Export
    [switch]$Optimize,               # codeburn optimize laufen lassen
    [switch]$OpenDashboard           # Interaktives TUI öffnen
)

$ErrorActionPreference = "Continue"
$GREEN  = "`e[32m"
$YELLOW = "`e[33m"
$RESET  = "`e[0m"

$reportDir = ".\engineering-harness\codeburn\reports"
$date      = Get-Date -Format "yyyy-MM-dd"
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmm"

# Check codeburn
if (-not (Get-Command codeburn -ErrorAction SilentlyContinue)) {
    Write-Host "${YELLOW}codeburn not found. Installing...${RESET}"
    npm install -g codeburn
}

New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
Write-Host ""
Write-Host "${GREEN}🔥 ELBTRONIKA CodeBurn Weekly Report${RESET}"
Write-Host "  Period:   $Period"
Write-Host "  Date:     $date"
Write-Host "  Output:   $reportDir"
Write-Host ""

# ── Status One-Liner ───────────────────────────────────────────────────────────
Write-Host "${GREEN}==> Quick Status${RESET}"
$provArg = if ($Provider) { @("--provider", $Provider) } else { @() }
codeburn status @provArg
Write-Host ""

# ── JSON Report ───────────────────────────────────────────────────────────────
Write-Host "${GREEN}==> Generating JSON report ($Period)...${RESET}"
$reportFile = "$reportDir\report-$timestamp.json"
try {
    $reportJson = codeburn report -p $Period --format json @provArg 2>&1
    $reportJson | Set-Content $reportFile
    Write-Host "  ✓ Report saved: $reportFile"

    # Parse key metrics
    $report = $reportJson | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($report) {
        Write-Host ""
        Write-Host "  📊 Overview:"
        Write-Host "     Cost:      $($report.overview.cost)"
        Write-Host "     Calls:     $($report.overview.calls)"
        Write-Host "     Sessions:  $($report.overview.sessions)"
        Write-Host "     Cache Hit: $($report.overview.cacheHitRate)"
    }
} catch {
    Write-Host "  ${YELLOW}Could not parse JSON. Running text report...${RESET}"
    codeburn report -p $Period @provArg | Tee-Object -FilePath "$reportDir\report-$timestamp.txt"
}

# ── Optimize Scan ─────────────────────────────────────────────────────────────
if ($Optimize -or $true) {   # Always run optimize for harness
    Write-Host ""
    Write-Host "${GREEN}==> Optimize Scan (waste detection)...${RESET}"
    $optimizeFile = "$reportDir\optimize-$timestamp.txt"
    codeburn optimize -p $Period @provArg | Tee-Object -FilePath $optimizeFile
    Write-Host ""
    Write-Host "  ✓ Optimize report: $optimizeFile"
}

# ── Export ────────────────────────────────────────────────────────────────────
if ($Export) {
    Write-Host ""
    Write-Host "${GREEN}==> Exporting CSV + JSON...${RESET}"
    codeburn export -f json @provArg | Set-Content "$reportDir\export-$timestamp.json"
    codeburn export          @provArg | Set-Content "$reportDir\export-$timestamp.csv"
    Write-Host "  ✓ Exported to $reportDir"
}

# ── Summary + Recommendations ─────────────────────────────────────────────────
Write-Host ""
Write-Host "${GREEN}================================================${RESET}"
Write-Host "${GREEN}✓ Weekly Report complete${RESET}"
Write-Host ""
Write-Host "Nächste Schritte:"
Write-Host "  • codeburn        → Interaktives Dashboard (7d Standard)"
Write-Host "  • codeburn compare → Sonnet vs Opus vergleichen"
Write-Host "  • codeburn optimize → Konkrete Copy-Paste-Fixes holen"
Write-Host "  • /caveman:compress CLAUDE.md → wenn CLAUDE.md > 2KB gewachsen"
Write-Host ""

# ── Open Dashboard (optional) ─────────────────────────────────────────────────
if ($OpenDashboard) {
    Write-Host "Opening interactive dashboard..."
    codeburn @provArg
}
