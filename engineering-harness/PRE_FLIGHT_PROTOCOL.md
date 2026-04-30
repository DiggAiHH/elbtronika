# Pre-Flight Protocol — Agent Operations Manual

> **Jeder Agent liest dies vor dem ersten Tool-Call.**
> Dies ist die verdichtete Betriebsanleitung für alle Tools, Skills und Workflows auf diesem Windows-System.
> Gültig ab: 2026-04-30 | Autor: Kimi (System-Agent) | Letzte Session: Phase 18/19 Recovery

---

## 1. System-Identität (Dieser Computer)

| Attribut | Wert |
|----------|------|
| **OS** | Windows 11, PowerShell 5.1 |
| **Shell-Tool** | `C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe` |
| **Node-Manager** | pnpm v10 (Monorepo) |
| **Package-Count** | 14 Pakete, Turborepo 2.9.6 |
| **Linter** | Biome v2 (`biome.json` im Root) |
| **Test-Runner** | Vitest v4 (jsdom) |
| **Type-Checker** | `tsc --noEmit` pro Paket |
| **Git-Branch** | `feature/phase-18-19-tests-and-prd-docs` |

---

## 2. Tool-Matrix: Wann rufst du WAS auf

### 2.1 Tool-Auswahl-Entscheidungsbaum

```
Brauche ich Datei-INHALT?
├── Ja, einzelne Datei (bekannter Pfad) → ReadFile
├── Ja, mehrere Dateien (bekannte Pfade) → ReadFile (parallel)
├── Ja, aber ich weiß nicht wo → Grep
├── Ja, Verzeichnis-Struktur → Glob
└── Nein, nur Operation → Shell / StrReplaceFile / WriteFile

Brauche ich Code-ÄNDERUNG?
├── Ja, einzelne String-Replace → StrReplaceFile
├── Ja, komplette Datei neu → WriteFile
├── Ja, Datei anhängen → WriteFile (mode: append)
├── Ja, komplexe Multi-File → Agent (subagent_type: coder)
└── Nein → ReadFile / Grep

Brauche ich Codebase-EXPLORATION?
├── Ja, <3 Suchen, bekannte Dateien → Grep + ReadFile selbst
├── Ja, >3 Suchen oder Module verstehen → Agent (subagent_type: explore)
├── Ja, Architektur-Planung → Agent (subagent_type: plan)
└── Ja, nur lesen, kein Code ändern → explore-Agent (immer)
```

### 2.2 Per-Tool Best Practices

#### `ReadFile`
- **Parallelisieren**: Bis zu 5 ReadFile-Calls in EINEM Response
- **Line-Offset**: `line_offset=-100` für Log-Tails, `line_offset=1, n_lines=50` für große Files
- **Nie blind**: Wenn du einen Pfad nicht kennst, zuerst `Glob` oder `Grep`
- **Truncation check**: Wenn "..." am Zeilenende → `n_lines` erhöhen oder offset verschieben

#### `WriteFile`
- **>100 Zeilen**: Erster Call `overwrite`, danach `append`-Calls
- **UTF-8 erzwingen**: Nie PowerShell `>` oder `echo` für Code-Files (erzeugt UTF-16/BOM!)
- **Atomic**: WriteFile ist atomar — entweder ganz oder gar nicht

#### `StrReplaceFile`
- **Bevorzugt**: Immer StrReplaceFile vor WriteFile wählen (minimaler Diff)
- **Multi-Replace**: Array von edits in EINEM Call
- **replace_all**: Nur bei sicheren Massen-Replacements (z.B. Import-Path ändern)
- **Fehlschlag**: Wenn `old` nicht exakt matcht → ReadFile nochmal lesen

#### `Shell`
- **Windows PowerShell**: Jeder Call ist eine FRISCHE Session. `cd`, Env-Vars, History persistieren NICHT
- **Chaining**: `;` statt `&&` (PowerShell), Ergebnis mit `if ($?)` prüfen
- **Timeout**: Langläufer (builds, tests) mit `timeout` setzen. Hintergrund mit `run_in_background=true`
- **Pfad-Trenner**: `/` oder `\` — beides geht, aber `\` ist Windows-konventionell
- **`.cmd` Pflicht**: `pnpm.cmd`, `npx.cmd`, `npm.cmd` — nie ohne `.cmd`-Suffix auf Windows!
- **Nie interaktiv**: Keine `git commit` ohne `-m` oder `-F`. Keine `vim`/`nano`

#### `Grep`
- **Case-insensitive**: `-i: true` für Imports/Variablen-Suche
- **Output-Mode**: `files_with_matches` für "welche Files", `content` für "was steht drin"
- **Head-Limit**: Standard 250 — für große Repos `0` setzen (sparsam)
- **Multiline**: `-U` für Regex über mehrere Zeilen

#### `Glob`
- **Kein `**` am Anfang**: `src/**/*.ts` geht, `**/*.ts` wird rejected
- **Keine node_modules**: Nie `node_modules/**/*.js` — zu groß

#### `Agent` (Subagent)
- **Explore** (read-only): Codebase verstehen, Module finden, Patterns suchen. >3 Suchen = explore-Agent
- **Coder** (read-write): Software-Engineering-Arbeit mit Files editieren
- **Plan** (read-only): Architektur-Planung vor Code-Änderungen. Nutze `skill='plan'`
- **Research** (read-only): Schnelle Codebase-Exploration. Nutze `skill='research'`
- **Parallelisieren**: Unabhängige explore-Agents parallel starten
- **Context**: Neuer Agent hat KEINEN Kontext — alles Nötige im Prompt wiederholen

---

## 3. Skills-Inventory: Wann welchen Skill laden

### 3.1 Globale Skills (`C:\Users\Moin\.agents\skills\`)

| Skill | Trigger | Wann nutzen |
|-------|---------|-------------|
| `code-review` | User sagt "review", "review changes", "code review" | Diff, Commit-Hash, oder git-Range |
| `comprehensive-review` | User sagt "comprehensive review", PR-URL | KOSTSPIELIG — nur bei expliziter Anfrage |
| `cross-review` | User sagt "review with opus/gemini/..." | Model explizit genannt |
| `frontend-design` | User will UI, Landingpage, Dashboard, Mockup | Design-Extraktion + HTML/TSX Output |
| `init` | "init repo", "create AGENTS.md", "contributor guidelines" | Projekt-Setup, Onboarding-Docs |
| `plan` | Architektur-Planung, Implementation-Plan | Vor jeder nicht-trivialen Code-Änderung |
| `playwright` | "test website", "screenshot", "login flow", "broken links" | Browser-Automation |
| `research` | Codebase-Exploration, Pattern-Suche | Read-only, schnell, parallelisierbar |
| `microsoft-foundry` | "deploy agent", "Foundry", "evaluate agent" | Azure Foundry spezifisch |
| `skill-creator` | "create skill", "update skill", "skill eval" | Neue Skills bauen |

### 3.2 Projekt-Skills

| Skill | Pfad | Trigger |
|-------|------|---------|
| `Mechanism Agent` | `.sixth/skills/Mechanism Agent.md` | Agent hört auf / wartet unnötig / TypeScript-Fixation-Loop |
| `designlang-tokens` | `design-extract-output/*/.claude/skills/designlang/SKILL.md` | Frontend-Styling mit extrahierten Design-Tokens |

### 3.3 Skill-Aufruf-Muster

```
# Plan-Mode (vor Implementation)
Agent(subagent_type="plan", skill="plan", prompt="...implementation plan...")

# Research (read-only Exploration)
Agent(subagent_type="explore", skill="research", prompt="...find patterns...")

# Frontend-Design
Agent(subagent_type="coder", skill="frontend-design", prompt="...design this page...")
```

---

## 4. Windows-Spezifische Gotchas (Dieser Computer)

### 4.1 Fatal Error Patterns

| # | Fehler | Ursache | Prävention |
|---|--------|---------|------------|
| 1 | **UTF-16/BOM Dateien** | PowerShell `>` oder `echo` erzeugt UTF-16 LE | **NIE** `>` für Code-Files. WriteFile oder `Out-File -Encoding utf8` |
| 2 | **`.cmd` fehlt** | `pnpm install` → "not recognized" | **IMMER** `pnpm.cmd`, `npx.cmd`, `npm.cmd`, `biome.cmd` |
| 3 | **Biome falsche Version** | `npx biome` → globale statt lokale v2 | **IMMER** `node_modules\.bin\biome.cmd` oder `pnpm.cmd biome` |
| 4 | **Turbo OOM** | `turbo run typecheck` mit 14 Paketen → OutOfMemory | `--concurrency=2` in root `package.json` |
| 5 | **Biome `css.linter.rules`** | Biome v2 akzeptiert KEIN `rules` unter `css.linter` | Nie `css.linter.rules` in `biome.json` einfügen |
| 6 | **Git multi-line commit** | PowerShell `git commit -m "a\nb"` → alles in eine Zeile | `git commit -F D:\msg.txt` mit vorher `echo` oder WriteFile |
| 7 | **PowerShell frische Session** | `cd` oder `$env:` in Shell-Call → nächster Call vergessen | Alles in EINEM Call mit `;` chainen |
| 8 | **Klammer-Verzeichnisse** | `mkdir [locale]` in CMD/PS → Fehler | Node.js `fs.mkdirSync` oder escaped `mkdir '\[locale\]'` |
| 9 | **Context Compaction verliert Tests** | Lange Sessions → Tests verschwinden | Nach jedem Green-State committen |
| 10 | **Git-Show mit `>`** | `git show c4b3103:path > path` → korrupte UTF-16 | `git show ... | Out-File -Encoding utf8` oder WriteFile |

### 4.2 Verifizierte korrekte Befehle

```powershell
# Lint (korrekte Biome-Version)
pnpm.cmd lint
# oder explizit:
node_modules\.bin\biome.cmd check --write .

# Typecheck (mit OOM-Schutz)
pnpm.cmd typecheck        # ruft turbo run typecheck --concurrency=2

# Tests
pnpm.cmd test             # apps/web: vitest
pnpm.cmd test:ui          # mit Vitest UI

# Git commit multi-line
"feat: message

body line 1
body line 2" | Out-File -Encoding utf8 D:\msg.txt
git commit -F D:\msg.txt

# Git recovery (Tests aus alter Commit)
git show c4b3103:path/to/file.ts | Out-File -Encoding utf8 path/to/file.ts

# Package install
pnpm.cmd install

# Turbo build
pnpm.cmd build            # --concurrency=2 empfohlen bei OOM
```

---

## 5. Workflow-Protokolle

### 5.1 Green-State Protocol (nach jeder Session)

```
1. Tests passing?    → pnpm.cmd test
2. Lint green?       → pnpm.cmd lint
3. Typecheck?        → pnpm.cmd typecheck
4. Dann: COMMITEN!   → git commit -F D:\msg.txt
5. Dann: PUSHEN!     → git push origin <branch>
6. Dann: Run-Log     → memory/runs/<datum>_<agent>_<model>_Run-<nr>.md
```

**Regel:** Nie eine Session beenden ohne commit. Context Compaction löscht Arbeit.

### 5.2 Batch-Fix Protocol (TypeScript/Lint)

```
1. ALLE Code-Änderungen für eine Phase machen
2. DANN einmal Typecheck/Lint laufen lassen
3. DANN ALLE Fehler in EINEM Batch fixen (StrReplaceFile mit Array)
4. NIE Fehler einzeln fixen während auf Ergebnis gewartet wird
5. Phase-6 WIP Files = FORBIDDEN (nur dokumentieren, nicht fixen)
```

### 5.3 Parallelize Protocol

```
Background: Typecheck läuft → Agent schreibt schon Dokumentation
Background: Tests laufen    → Agent liest nächste Phase
Background: pnpm install    → Agent editiert schon Code
```

**Regel:** Nach jedem Background-Task-Start MUSS eine nächste Aktion bereitstehen.

### 5.4 Recovery Protocol (Tests/Files verloren)

```
1. Git-History prüfen: git log --all --full-history -- path/to/file
2. Letzter guter Commit finden: git show <commit>:path > path
3. ABER: Out-File -Encoding utf8 verwenden (nicht `>`)
4. Fehlende Verzeichnisse: New-Item -ItemType Directory -Path path
5. Import-Abhängigkeiten checken: Was importierte die gelöschte Datei?
6. Fehlende Source-Module parallel recreaten
```

### 5.5 Lint-Konfiguration (Biome v2)

```json
{
  "linter": {
    "rules": {
      "suspicious": { "noConsole": "off", "noExplicitAny": "warn" },
      "a11y": { "useButtonType": "warn", "useAltText": "warn" },
      "style": { "noNonNullAssertion": "warn" },
      "performance": { "noBarrelFile": "warn" }
    }
  }
}
```

**NICHT erlaubt in Biome v2:** `css.linter.rules` (unbekannter Key → alle Packages failen)

---

## 6. Memory-Disziplin

### 6.1 Run-Log Format

**Pfad:** `memory/runs/<datum>_<Agentname>_<Model>_Run-<nummer>.md`

**Inhalt:** Genau 5 Zeilen

```markdown
- **Datum:** 2026-04-30
- **Agent/Model:** Kimi (System-Agent)
- **Task:** Phase 18/19 — Test-Recovery, Lint green, Turbo OOM fix
- **Outcome:** 62 Tests passing, lint exit 0, --concurrency=2 fix, docs updated, committed+pushed
- **Lesson:** PowerShell `>` erzeugt UTF-16; Out-File -Encoding utf8 nutzen; immer nach Green-State committen
```

### 6.2 Handoff-Format

**Pfad:** `memory/handoffs/<AGENT>_<VERSION>_HANDOFF.md`

**Inhalt:**
- Was wurde erreicht?
- Was wurde NICHT erreicht (und warum)?
- Welche Dateien wurden geändert?
- Nächste Schritte für den nächsten Agent?
- Bekannte Blocker?

### 6.3 OPSIDIAN_MEMORY.md

**Pfad:** `memory/OPSIDIAN_MEMORY.md`

**Inhalt:**
- Links zu allen Handoffs
- Kurze Zusammenfassung der letzten Sessions
- Liste offener Blocker
- Phase-Status

---

## 7. Skill-Connector: Wann Skills laden

### 7.1 Automatisch geladene Skills (System-Prompt)

Diese Skills sind im System-Prompt verlinkt und stehen immer zur Verfügung:

| Skill | Pfad | Automatisch? |
|-------|------|--------------|
| `kimi-cli-help` | `kimi_internal/skills/kimi-cli-help/SKILL.md` | Ja (im Prompt) |
| `skill-creator` | `.agents/skills/skill-creator/SKILL.md` | Ja (im Prompt) |

### 7.2 Manuelle Skill-Aktivierung

Skills werden NUR bei Bedarf geladen:

```
1. User-Anfrage analysieren → Skill-Identifier finden
2. ReadFile auf SKILL.md
3. Anweisungen befolgen
4. Bei Subagent: skill-Parameter setzen
```

**NIE alle Skills vorab lesen** — Context-Window sparen.

---

## 8. Trust-Boundary Checklist

Vor jeder Arbeit an:
- Auth / MCP / Checkout / Privacy / Account-Deletion
- Supabase writes (nicht reads)
- Stripe operations
- Public "live/ready" Claims

**Pflicht:** `HERMES_TRUST_HARNESS.md` lesen, Wave 0–8 checken.

---

## 9. Quick-Reference: Fatal → Fix

| Situation | Sofort-Maßnahme |
|-----------|-----------------|
| Agent stoppt / wartet | `Mechanism Agent.md` lesen → Recovery Protocol |
| Tests verschwunden | `git log --all --full-history -- path` → `git show commit:path \| Out-File -Encoding utf8 path` |
| Lint failt alle Packages | `biome.json` auf `css.linter.rules` prüfen → ENTFERNEN |
| Turbo OOM | `--concurrency=2` in root `package.json` scripts.typecheck |
| TypeScript Fehler-Kaskade | Batch-Fix Protocol anwenden, Phase-6 ignorieren |
| PowerShell `>` für Code | STOP → WriteFile oder `Out-File -Encoding utf8` |
| `.cmd` vergessen | `pnpm` → `pnpm.cmd`, `npx` → `npx.cmd`, `biome` → `biome.cmd` |
| Multi-line Commit in PS | `git commit -F D:\msg.txt` mit vorher `\| Out-File` |
| Kein Plan vor Code | EnterPlanMode → explore → ExitPlanMode |

---

## 10. Connector-Status (Skills & Plugins)

| Connector | Status | Nutzung |
|-----------|--------|---------|
| Biome v2 (Lint) | ✅ Aktiv | `pnpm.cmd lint` |
| Vitest (Tests) | ✅ Aktiv | `pnpm.cmd test` |
| Turborepo | ✅ Aktiv | `pnpm.cmd typecheck`, `pnpm.cmd build` |
| codeburn | ⏳ Installiert? | `npx codeburn` prüfen |
| designlang | ⏳ Installiert? | `npx designlang` prüfen |
| caveman | ⏳ Plugin? | `claude plugin list` prüfen |
| Playwright | ⏳ Installiert? | `npx playwright --version` prüfen |
| Supabase CLI | ⏳ Installiert? | `npx supabase --version` prüfen |

---

*Dieses Protokoll lebt. Jede Session ergänzt es. Letzte Änderung: 2026-04-30*
*Erstellt von: Kimi (System-Agent) | Session: Phase 18/19 Recovery*
