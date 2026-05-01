# Pre-Flight Protocol — Agent Operations Manual

> **Jeder Agent liest dies vor dem ersten Tool-Call.**
> Dies ist die verdichtete Betriebsanleitung fuer alle Tools, Skills und Workflows auf diesem Windows-System.
> Gueltig ab: 2026-04-30 | Autor: Kimi (System-Agent) | Letzte Session: Phase 18/19/20 Gap-Fill

---

## 1. System-Identitaet (Dieser Computer)

| Attribut | Wert |
|----------|------|
| **OS** | Windows 11, PowerShell 5.1 |
| **Shell-Tool** | `C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe` |
| **Node-Manager** | pnpm v10 (Monorepo) |
| **Package-Count** | 14 Pakete, Turborepo 2.9.6 |
| **Linter** | Biome v2 (`biome.json` im Root) |
| **Test-Runner** | Vitest v4 (jsdom) |
| **Type-Checker** | `tsc --noEmit` pro Paket |
| **Git-Branch** | Wechselt pro Task — immer `git branch --show-current` pruefen |

---

## 2. Tool-Matrix: Wann rufst du WAS auf

### 2.1 Tool-Auswahl-Entscheidungsbaum

```
Brauche ich Datei-INHALT?
├── Ja, einzelne Datei (bekannter Pfad) → ReadFile
├── Ja, mehrere Dateien (bekannte Pfade) → ReadFile (parallel)
├── Ja, aber ich weiss nicht wo → Grep
├── Ja, Verzeichnis-Struktur → Glob
└── Nein, nur Operation → Shell / StrReplaceFile / WriteFile

Brauche ich Code-AENDERUNG?
├── Ja, einzelne String-Replace → StrReplaceFile
├── Ja, komplette Datei neu → WriteFile
├── Ja, Datei anhaengen → WriteFile (mode: append)
├── Ja, komplexe Multi-File → Agent (subagent_type: coder)
└── Nein → ReadFile / Grep

Brauche ich Codebase-EXPLORATION?
├── Ja, <3 Suchen, bekannte Dateien → Grep + ReadFile selbst
├── Ja, >3 Suchen oder Module verstehen → Agent (subagent_type: explore)
├── Ja, Architektur-Planung → Agent (subagent_type: plan)
└── Ja, nur lesen, kein Code aendern → explore-Agent (immer)
```

### 2.2 Per-Tool Best Practices

#### `ReadFile`
- **Parallelisieren**: Bis zu 5 ReadFile-Calls in EINEM Response
- **Line-Offset**: `line_offset=-100` fuer Log-Tails, `line_offset=1, n_lines=50` fuer grosse Files
- **Nie blind**: Wenn du einen Pfad nicht kennst, zuerst `Glob` oder `Grep`
- **Truncation check**: Wenn "..." am Zeilenende → `n_lines` erhoehen oder offset verschieben

#### `WriteFile`
- **>100 Zeilen**: Erster Call `overwrite`, danach `append`-Calls
- **UTF-8 erzwingen**: Nie PowerShell `>` oder `echo` fuer Code-Files (erzeugt UTF-16/BOM!)
- **Atomic**: WriteFile ist atomar — entweder ganz oder gar nicht
- **Parent-Directory**: `New-Item -ItemType Directory -Path <dir>` VOR WriteFile, wenn Verzeichnis nicht existiert

#### `StrReplaceFile`
- **Bevorzugt**: Immer StrReplaceFile vor WriteFile waehlen (minimaler Diff)
- **Multi-Replace**: Array von edits in EINEM Call
- **replace_all**: Nur bei sicheren Massen-Replacements (z.B. Import-Path aendern)
- **Fehlschlag**: Wenn `old` nicht exakt matcht → ReadFile nochmal lesen

#### `Shell`
- **Windows PowerShell**: Jeder Call ist eine FRISCHE Session. `cd`, Env-Vars, History persistieren NICHT
- **Chaining**: `;` statt `&&` (PowerShell), Ergebnis mit `if ($?)` pruefen
- **Timeout**: Langlaeufer (builds, tests) mit `timeout` setzen. Hintergrund mit `run_in_background=true`
- **Pfad-Trenner**: `/` oder `\` — beides geht, aber `\` ist Windows-konventionell
- **`.cmd` Pflicht**: `pnpm.cmd`, `npx.cmd`, `npm.cmd`, `biome.cmd` — nie ohne `.cmd`-Suffix auf Windows!
- **Nie interaktiv**: Keine `git commit` ohne `-m` oder `-F`. Keine `vim`/`nano`
- **Git checkout pruefen**: Nach `git checkout` IMMER `git branch --show-current` ausfuehren — PowerShell-Pipes wechseln manchmal nicht den Branch!

#### `Grep`
- **Case-insensitive**: `-i: true` fuer Imports/Variablen-Suche
- **Output-Mode**: `files_with_matches` fuer "welche Files", `content` fuer "was steht drin"
- **Head-Limit**: Standard 250 — fuer grosse Repos `0` setzen (sparsam)
- **Multiline**: `-U` fuer Regex ueber mehrere Zeilen

#### `Glob`
- **Kein `**` am Anfang**: `src/**/*.ts` geht, `**/*.ts` wird rejected
- **Keine node_modules**: Nie `node_modules/**/*.js` — zu gross

#### `Agent` (Subagent)
- **Explore** (read-only): Codebase verstehen, Module finden, Patterns suchen. >3 Suchen = explore-Agent
- **Coder** (read-write): Software-Engineering-Arbeit mit Files editieren
- **Plan** (read-only): Architektur-Planung vor Code-Aenderungen. Nutze `skill='plan'`
- **Research** (read-only): Schnelle Codebase-Exploration. Nutze `skill='research'`
- **Parallelisieren**: Unabhaengige explore-Agents parallel starten
- **Context**: Neuer Agent hat KEINEN Kontext — alles Noetige im Prompt wiederholen

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
| `plan` | Architektur-Planung, Implementation-Plan | Vor jeder nicht-trivialen Code-Aenderung |
| `playwright` | "test website", "screenshot", "login flow", "broken links" | Browser-Automation |
| `research` | Codebase-Exploration, Pattern-Suche | Read-only, schnell, parallelisierbar |
| `microsoft-foundry` | "deploy agent", "Foundry", "evaluate agent" | Azure Foundry spezifisch |
| `skill-creator` | "create skill", "update skill", "skill eval" | Neue Skills bauen |

### 3.2 Projekt-Skills

| Skill | Pfad | Trigger |
|-------|------|---------|
| `Mechanism Agent` | `.sixth/skills/Mechanism Agent.md` | Agent hoert auf / wartet unnoetig / TypeScript-Fixation-Loop |
| `designlang-tokens` | `design-extract-output/*/.claude/skills/designlang/SKILL.md` | Frontend-Styling mit extrahierten Design-Tokens |

### 3.3 Skill-Aufruf-Muster

```
# Plan-Mode (vor Implementation)
Agent(subagent_type="plan", skill="plan", prompt="...implementation plan...")

# Research (read-only Exploration)
Agent(subagent_type="explore", skill="research", prompt="...find patterns...")

# Frontend-Design
Agent(subagent_type="coder", skill="frontend-design", prompt="...design this page...")
