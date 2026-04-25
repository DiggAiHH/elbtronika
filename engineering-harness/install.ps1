# Engineering Harness — One-Shot Installer (Windows PowerShell)
# Installiert: caveman, codeburn, designlang
# Ausführen: .\engineering-harness\install.ps1

param(
    [switch]$SkipCaveman,
    [switch]$SkipCodeburn,
    [switch]$SkipDesignlang,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$GREEN  = "`e[32m"
$YELLOW = "`e[33m"
$RED    = "`e[31m"
$RESET  = "`e[0m"

function Write-Step($msg) { Write-Host "${GREEN}==>${RESET} $msg" }
function Write-Warn($msg) { Write-Host "${YELLOW}WARN:${RESET} $msg" }
function Write-Err($msg)  { Write-Host "${RED}ERR:${RESET} $msg" }

Write-Host ""
Write-Host "🪨🔥🎨  ELBTRONIKA Engineering Harness Installer"
Write-Host "================================================"
Write-Host ""

# ── Check Node ────────────────────────────────────────────────────────────────
Write-Step "Checking prerequisites..."
try {
    $nodeVer = node --version 2>&1
    if ($LASTEXITCODE -ne 0) { throw }
    Write-Host "  Node: $nodeVer"
} catch {
    Write-Err "Node.js 20+ required. Install from https://nodejs.org"
    exit 1
}

$npmVer = npm --version 2>&1
Write-Host "  npm: $npmVer"

# Check pnpm
$pnpmAvail = Get-Command pnpm -ErrorAction SilentlyContinue
if ($pnpmAvail) {
    Write-Host "  pnpm: $((pnpm --version 2>&1))"
}

Write-Host ""

# ── 1. caveman ────────────────────────────────────────────────────────────────
if (-not $SkipCaveman) {
    Write-Step "Installing caveman (token compression)..."

    # Check if claude CLI available
    $claudeAvail = Get-Command claude -ErrorAction SilentlyContinue
    if ($claudeAvail) {
        try {
            Write-Host "  Installing via Claude plugin system..."
            claude plugin marketplace add JuliusBrussee/caveman 2>&1
            claude plugin install caveman@caveman 2>&1
            Write-Host "  ${GREEN}✓${RESET} caveman installed via Claude plugin"
        } catch {
            Write-Warn "Claude plugin install failed. Installing hooks directly..."
            # Fallback: PowerShell hook install
            try {
                irm https://raw.githubusercontent.com/JuliusBrussee/caveman/main/hooks/install.ps1 | iex
                Write-Host "  ${GREEN}✓${RESET} caveman hooks installed"
            } catch {
                Write-Warn "Hook install failed. caveman-compress available via npx."
            }
        }
    } else {
        Write-Warn "claude CLI not found. caveman-compress available via: npx caveman-compress"
        Write-Host "  CLAUDE.md already has always-on caveman rules — no plugin needed for this session."
    }
    Write-Host ""
}

# ── 2. codeburn ───────────────────────────────────────────────────────────────
if (-not $SkipCodeburn) {
    Write-Step "Installing codeburn (token cost dashboard)..."
    try {
        npm install -g codeburn 2>&1 | Select-String -Pattern "(added|error)" | ForEach-Object { Write-Host "  $_" }
        $cbVer = codeburn --version 2>&1
        Write-Host "  ${GREEN}✓${RESET} codeburn $cbVer installed"
    } catch {
        Write-Warn "Global npm install failed. Try: npx codeburn"
    }
    Write-Host ""
}

# ── 3. designlang ─────────────────────────────────────────────────────────────
if (-not $SkipDesignlang) {
    Write-Step "Installing designlang (design extraction)..."
    try {
        npm install -g designlang 2>&1 | Select-String -Pattern "(added|error)" | ForEach-Object { Write-Host "  $_" }
        $dlVer = npx designlang --version 2>&1
        Write-Host "  ${GREEN}✓${RESET} designlang $dlVer installed"
    } catch {
        Write-Warn "Global install failed. Tool available via: npx designlang <url>"
    }

    # Install as Claude Code skill
    Write-Host "  Installing as Claude Code skill (/extract-design command)..."
    try {
        npx skills add Manavarya09/design-extract 2>&1 | Out-Null
        Write-Host "  ${GREEN}✓${RESET} /extract-design skill installed"
    } catch {
        Write-Warn "Skill install failed. Use 'npx designlang <url>' directly."
    }

    # Create output directory
    $outputDir = ".\design-extract-output"
    if (-not (Test-Path $outputDir)) {
        New-Item -ItemType Directory -Path $outputDir | Out-Null
        Write-Host "  ${GREEN}✓${RESET} Created ./design-extract-output/"
    }
    Write-Host ""
}

# ── MCP Config ────────────────────────────────────────────────────────────────
Write-Step "Checking MCP config for designlang..."
$mcpConfigPath = "$env:APPDATA\Claude\claude_desktop_config.json"
if (Test-Path $mcpConfigPath) {
    $config = Get-Content $mcpConfigPath | ConvertFrom-Json
    $hasMcp = $config.mcpServers.PSObject.Properties.Name -contains "designlang"
    if (-not $hasMcp) {
        Write-Host "  Adding designlang MCP server to Claude Desktop config..."
        # Read and update config
        $outputAbsPath = (Resolve-Path ".\design-extract-output" -ErrorAction SilentlyContinue)?.Path ?? ".\design-extract-output"
        $mcpEntry = @{
            command = "npx"
            args    = @("designlang", "mcp", "--output-dir", $outputAbsPath)
        }
        if (-not $config.mcpServers) {
            $config | Add-Member -NotePropertyName "mcpServers" -NotePropertyValue ([PSCustomObject]@{})
        }
        $config.mcpServers | Add-Member -NotePropertyName "designlang" -NotePropertyValue $mcpEntry
        $config | ConvertTo-Json -Depth 10 | Set-Content $mcpConfigPath
        Write-Host "  ${GREEN}✓${RESET} designlang MCP added to Claude Desktop config"
        Write-Host "  ${YELLOW}!${RESET} Restart Claude Desktop to activate MCP server"
    } else {
        Write-Host "  ${GREEN}✓${RESET} designlang MCP already configured"
    }
} else {
    Write-Warn "Claude Desktop config not found at: $mcpConfigPath"
    Write-Host "  See engineering-harness/mcp-config/ for manual setup"
}
Write-Host ""

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host "================================================"
Write-Host "${GREEN}✓${RESET} Engineering Harness installed!"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. codeburn optimize          → Find current token waste"
Write-Host "  2. npx designlang <url> --full → Extract first reference design"
Write-Host "  3. codeburn                   → Launch cost dashboard"
Write-Host ""
Write-Host "Caveman mode: ACTIVE (via CLAUDE.md)"
Write-Host "Docs: .\engineering-harness\HARNESS.md"
Write-Host ""
