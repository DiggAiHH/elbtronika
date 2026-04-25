#!/usr/bin/env bash
# Engineering Harness — One-Shot Installer (WSL / Linux / macOS)
# Installiert: caveman, codeburn, designlang
# Ausführen: bash engineering-harness/install.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

step()  { echo -e "${GREEN}==> ${NC}$1"; }
warn()  { echo -e "${YELLOW}WARN: ${NC}$1"; }
err()   { echo -e "${RED}ERR: ${NC}$1"; }
ok()    { echo -e "  ${GREEN}✓${NC} $1"; }

echo ""
echo "🪨🔥🎨  ELBTRONIKA Engineering Harness Installer"
echo "================================================"
echo ""

# ── Check prerequisites ────────────────────────────────────────────────────────
step "Checking prerequisites..."
if ! command -v node &>/dev/null; then
  err "Node.js 20+ required. Install: https://nodejs.org"
  exit 1
fi
NODE_VER=$(node --version)
NPM_VER=$(npm --version)
echo "  Node: $NODE_VER"
echo "  npm:  $NPM_VER"
command -v pnpm &>/dev/null && echo "  pnpm: $(pnpm --version)"
echo ""

# ── 1. caveman ────────────────────────────────────────────────────────────────
step "Installing caveman (token compression)..."
if command -v claude &>/dev/null; then
  claude plugin marketplace add JuliusBrussee/caveman 2>/dev/null || true
  claude plugin install caveman@caveman 2>/dev/null || true
  ok "caveman installed via Claude plugin"
else
  # Fallback: shell hook install
  bash <(curl -s https://raw.githubusercontent.com/JuliusBrussee/caveman/main/hooks/install.sh) 2>/dev/null || \
    warn "Hook install failed. CLAUDE.md already has always-on caveman rules."
fi
echo ""

# ── 2. codeburn ───────────────────────────────────────────────────────────────
step "Installing codeburn (token cost dashboard)..."
npm install -g codeburn 2>&1 | grep -E "(added|error)" | head -5 || true
CB_VER=$(codeburn --version 2>/dev/null || echo "available via npx")
ok "codeburn $CB_VER"
echo ""

# ── 3. designlang ─────────────────────────────────────────────────────────────
step "Installing designlang (design extraction)..."
npm install -g designlang 2>&1 | grep -E "(added|error)" | head -5 || true
ok "designlang installed"

# Claude Code skill
step "Installing /extract-design skill..."
npx skills add Manavarya09/design-extract 2>/dev/null || warn "Skill install failed. Use 'npx designlang <url>' directly."
ok "/extract-design skill installed"

# Create output directory
mkdir -p ./design-extract-output
ok "Created ./design-extract-output/"
echo ""

# ── macOS: MCP Config ─────────────────────────────────────────────────────────
MCP_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
if [[ -f "$MCP_CONFIG" ]]; then
  step "Adding designlang MCP to Claude Desktop config..."
  OUTPUT_ABS="$(pwd)/design-extract-output"
  # Use python to safely update JSON
  python3 - <<PYEOF
import json, os, sys
path = os.path.expanduser("$MCP_CONFIG")
with open(path) as f:
    cfg = json.load(f)
cfg.setdefault("mcpServers", {})
if "designlang" not in cfg["mcpServers"]:
    cfg["mcpServers"]["designlang"] = {
        "command": "npx",
        "args": ["designlang", "mcp", "--output-dir", "$OUTPUT_ABS"]
    }
    with open(path, "w") as f:
        json.dump(cfg, f, indent=2)
    print("  ✓ designlang MCP added — restart Claude Desktop to activate")
else:
    print("  ✓ designlang MCP already configured")
PYEOF
fi
echo ""

# ── Summary ───────────────────────────────────────────────────────────────────
echo "================================================"
echo -e "${GREEN}✓${NC} Engineering Harness installed!"
echo ""
echo "Next steps:"
echo "  1. codeburn optimize                      → Find current token waste"
echo "  2. npx designlang https://superrare.com --full  → First reference extraction"
echo "  3. codeburn                               → Launch cost dashboard"
echo ""
echo "Caveman mode: ACTIVE (via CLAUDE.md)"
echo "Docs: ./engineering-harness/HARNESS.md"
echo ""
