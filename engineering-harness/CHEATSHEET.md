# Engineering Harness — Cheatsheet

## 🪨 caveman (Token-Kompression)
```
AKTIVIERT via CLAUDE.md — kein Befehl nötig

/caveman lite          → kein Fluff, Grammatik bleibt
/caveman ultra         → Maximale Kompression
/caveman:compress CLAUDE.md  → CLAUDE.md komprimieren (-46% Input-Tokens)
/caveman-commit        → Terse Commit-Message
/caveman-review        → One-Line PR-Review
normal mode            → Zurück zu Normal
```
**Eselbrücke:** 🪨 = Mund kleiner. Hirn gleich groß.

---

## 🔥 codeburn (Kosten-Sichtbarkeit)
```powershell
codeburn               # Dashboard (7d)
codeburn today         # Heute
codeburn optimize      # Waste-Patterns + Copy-Paste-Fixes   ← wöchentlich!
codeburn compare       # Sonnet vs Opus
codeburn status        # One-Liner
.\engineering-harness\codeburn\weekly-report.ps1  # Automatisch
```
**Eselbrücke:** 🔥 = Wo brennen die Token?

---

## 🎨 designlang (Design-Extraktion)
```powershell
# Schnell
npx designlang https://site.com

# Vollständig (für Frontend-Arbeit)
npx designlang https://site.com --full --emit-agent-rules

# Via Script
.\engineering-harness\design-workflow\extract-design.ps1 -Url https://site.com -Full -Score

# Direkt ins Projekt applyen
.\extract-design.ps1 -Url https://site.com -ApplyTo .\apps\web

# MCP starten (Claude greift live auf Tokens zu)
designlang mcp --output-dir .\design-extract-output

# Claude Code Skill
/extract-design https://site.com
```
**Eselbrücke:** 🎨 = Röntgenbild einer Website → Claude baut nach.

---

## Kombinierter Best-Case Workflow

```
START: Neue Frontend-Feature-Arbeit
  ↓
1. .\extract-design.ps1 -Url <referenz> -Full   → Design-System holen
2. Claude liest *-design-language.md            → Kontext da
3. Claude (caveman mode) baut UI                → 75% weniger Output-Tokens
4. codeburn today                               → Kosten checken
5. [nach Phase-DoD] /caveman:compress CLAUDE.md → Memory sauber halten
```

---

## ELBTRONIKA Referenz-URLs
```powershell
# Immersive Gallery
.\extract-design.ps1 -Url https://superrare.com   -Category gallery -Full -Score
.\extract-design.ps1 -Url https://foundation.app  -Category gallery -Full
.\extract-design.ps1 -Url https://niftygateway.com -Category gallery

# Music + E-Commerce
.\extract-design.ps1 -Url https://bandcamp.com    -Category shop -Full
.\extract-design.ps1 -Url https://soundcloud.com  -Category reference

# Multi-Brand Vergleich
npx designlang brands superrare.com foundation.app bandcamp.com
```

---

## Installation (einmalig)
```powershell
.\engineering-harness\install.ps1
```

---

## Hermes Trust Harness

Use this before agent/MCP/checkout/privacy/status work:

```powershell
notepad .\engineering-harness\HERMES_TRUST_HARNESS.md
notepad .\PROMPTS_HERMES_TRUST_2026-04-30.md
```

First safe prompt:

```text
Use PROMPTS_HERMES_TRUST_2026-04-30.md section 12.
Start Wave 0 only: lock /api/mcp/invoke and /api/mcp/tools.
```
