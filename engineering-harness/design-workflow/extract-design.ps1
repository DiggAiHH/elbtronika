# Design-Extraction Pipeline — ELBTRONIKA
# Extrahiert Design-System aus einer URL und bereitet es für Claude Design + Tailwind/shadcn auf
#
# Usage:
#   .\extract-design.ps1 -Url https://superrare.com
#   .\extract-design.ps1 -Url https://foundation.app -Category gallery -Score
#   .\extract-design.ps1 -Url https://vercel.com -Diff https://linear.app

param(
    [Parameter(Mandatory=$true)]
    [string]$Url,

    [string]$Category = "reference",      # gallery | shop | landing | reference
    [switch]$Full,                        # --full: responsive + interactions + screenshots
    [switch]$Score,                       # Design-Qualität bewerten
    [switch]$EmitAgentRules,             # Claude/Cursor rule-files erzeugen
    [string]$Diff,                        # zweite URL für Vergleich
    [string]$ApplyTo,                     # Pfad zum Projekt (direkt applyen)
    [switch]$Sync                         # Lokale Tokens mit Live-Site syncen
)

$ErrorActionPreference = "Stop"
$GREEN  = "`e[32m"
$YELLOW = "`e[33m"
$RESET  = "`e[0m"

# Ausgabe-Ordner aus URL ableiten
$slug = $Url -replace "https?://", "" -replace "[^a-zA-Z0-9]", "-" -replace "-+", "-" -replace "^-|-$", ""
$outDir = ".\design-extract-output\$Category\$slug"

Write-Host ""
Write-Host "${GREEN}🎨 Design Extraction Pipeline${RESET}"
Write-Host "  URL:      $Url"
Write-Host "  Category: $Category"
Write-Host "  Output:   $outDir"
Write-Host ""

# ── Build designlang args ──────────────────────────────────────────────────────
$args = @($Url, "--out", $outDir)

if ($Full)            { $args += "--full" }
if ($EmitAgentRules)  { $args += "--emit-agent-rules" }

# ── Run extraction ─────────────────────────────────────────────────────────────
if ($Diff) {
    # Zwei URLs vergleichen
    Write-Host "Running: designlang diff $Url $Diff"
    npx designlang diff $Url $Diff --out $outDir
}
elseif ($ApplyTo) {
    # Direkt ins Projekt applyen (Tailwind/shadcn auto-detect)
    Write-Host "Running: designlang apply $Url --dir $ApplyTo"
    npx designlang apply $Url --dir $ApplyTo
}
elseif ($Sync) {
    Write-Host "Running: designlang sync $Url --out $outDir"
    npx designlang sync $Url --out $outDir
}
else {
    Write-Host "Running: designlang $($args -join ' ')"
    npx designlang @args
}

# ── Score (optional) ──────────────────────────────────────────────────────────
if ($Score -and -not $Diff -and -not $ApplyTo) {
    Write-Host ""
    Write-Host "${GREEN}==> Design Score${RESET}"
    npx designlang score $Url
}

# ── Post-processing ───────────────────────────────────────────────────────────
Write-Host ""
Write-Host "${GREEN}==> Extracted files:${RESET}"
Get-ChildItem $outDir -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "  ✓ $($_.Name)"
}

# CLAUDE.md.fragment — in Projekt-CLAUDE.md eintragen?
$fragment = Get-ChildItem $outDir -Filter "*CLAUDE.md.fragment" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($fragment) {
    Write-Host ""
    Write-Host "${YELLOW}CLAUDE.md.fragment gefunden:${RESET}"
    Write-Host "  → Manuell in .\CLAUDE.md unter ## Design Context einfügen:"
    Write-Host "  → $($fragment.FullName)"
}

# Tailwind config
$tailwindConf = Get-ChildItem $outDir -Filter "*tailwind.config.js" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($tailwindConf) {
    Write-Host ""
    Write-Host "${GREEN}✓ Tailwind Config:${RESET} $($tailwindConf.FullName)"
    Write-Host "  → In tailwind.config.js integrieren oder als Referenz nutzen"
}

# shadcn theme
$shadcnTheme = Get-ChildItem $outDir -Filter "*shadcn-theme.css" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($shadcnTheme) {
    Write-Host "${GREEN}✓ shadcn/ui Theme:${RESET} $($shadcnTheme.FullName)"
    Write-Host "  → In globals.css einfügen"
}

Write-Host ""
Write-Host "${GREEN}================================================${RESET}"
Write-Host "${GREEN}✓ Design-System extrahiert!${RESET}"
Write-Host ""
Write-Host "Nächste Schritte:"
Write-Host "  1. Claude Design Skills öffnen"
Write-Host "  2. *-design-language.md als Kontext übergeben"
Write-Host "  3. Frontend-Arbeit starten — Claude kennt jetzt das Design-System"
Write-Host "  4. codeburn optimize — nach der Session Token-Waste prüfen"
Write-Host ""
