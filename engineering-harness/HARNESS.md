# Engineering Harness — ELBTRONIKA

> Prinzip: Jeder Fehler einmal. Jeder Prozess automatisiert. Token-Effizienz maximiert.

## Übersicht

Drei Tools, eine Philosophie: **AI macht mehr mit weniger.**

```
caveman      → Terse output, 75% weniger Output-Tokens
codeburn     → Sichtbarkeit: wo brennen unsere Token/€?
designlang   → Design-System aus jeder URL, direkt in unser Stack
```

---

## 🪨 caveman — Token-Kompression

**Problem:** Claude schreibt zu viel. 69 Tokens wo 19 reichen.

**Lösung:** caveman-Mode ist in CLAUDE.md aktiviert (always-on). Kein Aktivieren nötig.

### Installation (einmalig)
```powershell
# Claude Code Plugin
claude plugin marketplace add JuliusBrussee/caveman
claude plugin install caveman@caveman

# Oder Windows PowerShell Hook (ohne Plugin-System)
irm https://raw.githubusercontent.com/JuliusBrussee/caveman/main/hooks/install.ps1 | iex
```

### Wichtige Befehle
```
/caveman lite    → professionell aber ohne Füllwörter
/caveman full    → Standard-Caveman (aktiviert via CLAUDE.md)
/caveman ultra   → Maximale Kompression
/caveman:compress CLAUDE.md  → CLAUDE.md selbst komprimieren (-46% Input-Tokens)
/caveman-commit  → Terse Commit-Message
/caveman-review  → One-Line Code-Review
normal mode      → Zurück zu normal
```

### Eselbrücke
> "Caveman = Mund kleiner. Hirn gleich groß. Token gespart."

**Wann verwenden:** Immer (CLAUDE.md aktiviert es). Bei Code, Commits, PRs läuft es eh normal.

---

## 🔥 codeburn — Token-Kosten Observability

**Problem:** Wir wissen nicht, wo unsere Claude-Token verbrennen.

**Lösung:** codeburn liest Session-Daten lokal aus (kein API-Key nötig) und gibt interaktives Dashboard.

### Installation
```powershell
npm install -g codeburn
```

### Wichtige Befehle
```powershell
codeburn                      # Interaktives TUI-Dashboard (7 Tage Default)
codeburn today                # Heute
codeburn optimize             # Waste-Patterns finden + Copy-Paste-Fixes
codeburn report --format json # JSON für Automation
codeburn status               # Compact One-Liner
codeburn compare              # Modell-Vergleich (Sonnet vs Opus)
```

### Dashboard-Interpretation
| Signal | Bedeutung | Action |
|--------|-----------|--------|
| Cache Hit < 80% | Context instabil | CLAUDE.md stabilisieren |
| Viele `Read`-Calls | Agent re-liest Files | Kontext verbessern |
| Low 1-Shot Coding | Retry-Loops | Prompt präzisieren |
| Opus dominiert | Overpowered für Task | Sonnet nutzen |
| Conversation > Coding | Agent redet statt tut | Caveman + klarere Prompts |

### Automatisierung
```powershell
# Wöchentlicher Report (PowerShell-Task)
.\engineering-harness\codeburn\weekly-report.ps1
```

### Eselbrücke
> "codeburn = Kontoauszug für Claude-Tokens. Optimize = Steuerberater."

---

## 🎨 designlang — Design-Extraktion + Claude Design Pipeline

**Problem:** Frontend-Design von Grund auf = Tokens verbrennen + langsam.

**Lösung:** Jede Referenz-URL → komplettes Design-System in <2min. Direkt in Tailwind v4 + shadcn/ui.

### Installation
```powershell
npm install -g designlang

# Als Claude Code Skill (gibt /extract-design Befehl)
npx skills add Manavarya09/design-extract
```

### Standard-Workflow (Frontend-Arbeit)

**Schritt 1: Design extrahieren**
```powershell
# Basis-Extraktion
npx designlang https://referenz-site.com

# Vollständig (responsive, interactions, Claude-Rules)
npx designlang https://referenz-site.com --full --emit-agent-rules --out ./design-extract-output

# Direkt in Projekt applyen
npx designlang apply https://referenz-site.com --dir ./apps/web
```

**Schritt 2: Claude Design Skills**
```
# Claude liest automatisch die extrahierten Files:
# - *-design-language.md    → AI-optimiertes Markdown
# - *-tailwind.config.js    → Drop-in Tailwind-Theme
# - *-shadcn-theme.css      → shadcn/ui globals.css
# - *-variables.css         → CSS Custom Properties
# - CLAUDE.md.fragment      → Snippet für CLAUDE.md
```

**Schritt 3: MCP-Server für Live-Zugriff**
```powershell
# MCP-Server starten (Claude greift live auf Design-Tokens zu)
designlang mcp --output-dir ./design-extract-output

# Config in claude_desktop_config.json (siehe mcp-config/)
```

### Nützliche Befehle
```powershell
npx designlang score https://site.com          # Design-Qualität bewerten
npx designlang diff https://a.com https://b.com  # Zwei Designs vergleichen
npx designlang brands site1.com site2.com      # Multi-Brand Vergleich
npx designlang sync https://site.com           # Lokale Tokens mit Live-Site syncen
npx designlang watch https://site.com          # Design-Änderungen monitoren
npx designlang lint ./src/tokens/design-tokens.json  # Token-Qualität prüfen
```

### ELBTRONIKA-spezifische Referenz-URLs
```powershell
# Für Immersive Gallery Inspiration:
npx designlang https://superrare.com --full --out ./design-extract-output/superrare
npx designlang https://foundation.app --full --out ./design-extract-output/foundation
npx designlang https://niftygateway.com --full --out ./design-extract-output/niftygateway

# Für E-Commerce/Shop:
npx designlang https://bandcamp.com --full --out ./design-extract-output/bandcamp
```

### Eselbrücke
> "designlang = Röntgenbild einer Website. Claude Design = Architekt der dann baut."

---

## Kombinierter Workflow (Best Case)

```
1. codeburn optimize          → Waste identifizieren, CLAUDE.md sauber halten
2. designlang <url> --full    → Design-System extrahieren
3. Claude (caveman mode)      → UI bauen mit extrahiertem Kontext
4. codeburn today             → Token-Kosten prüfen
5. caveman-compress CLAUDE.md → Memory komprimieren wenn > 2KB gewachsen
```

---

## Fehler-Prävention (Zero-Repeat-Error)

| Fehler | Prävention | Automatisierung |
|--------|-----------|-----------------|
| Token-Waste durch verbose Output | caveman in CLAUDE.md | always-on |
| Keine Kostensichtbarkeit | codeburn weekly | `weekly-report.ps1` |
| Frontend blank starten | designlang zuerst | `extract-design.ps1` |
| CLAUDE.md aufgebläht | caveman-compress | manuell nach Phase-DoD |
| Design-Drift | designlang drift | `designlang drift` in CI |

---

## Nächste Schritte

- [ ] `claude plugin install caveman@caveman` ausführen
- [ ] `npm install -g codeburn designlang` ausführen
- [ ] MCP-Config für designlang in Claude Desktop Config eintragen
- [ ] Erste Referenz-URL extrahieren (Superrare / Foundation)
- [ ] `npx skills add Manavarya09/design-extract` für `/extract-design` Befehl

---

## Pre-Flight Protocol (Agent Operations)

Before every session, every agent reads:

- `engineering-harness/PRE_FLIGHT_PROTOCOL.md` — Tool-Matrix, Skills, Windows-Gotchas, Workflows, Memory-Disziplin

Contains the operating manual for all tools, when to use `ReadFile` vs `Agent(subagent_type="explore")`,
Windows PowerShell-specific fatal errors (UTF-16, `.cmd` suffix, Biome v2 traps), and the
Green-State Protocol: tests → lint → typecheck → commit → push → run-log.

## Trust-Boundary Harness

Hermes/MCP, checkout, consent, account deletion, and project-memory corrections
use a stricter harness than general token/design work:

- `engineering-harness/HERMES_TRUST_HARNESS.md`
- `PROMPTS_HERMES_TRUST_2026-04-30.md`

Use it before exposing any agent tool, Stripe action, Supabase write/delete, or
public "live/ready" claim.
