# Pre-Flight Protocol — Agent Operations Manual v3.0

> **Jeder Agent liest dies vor dem ersten Tool-Call.**
> Dies ist die verdichtete Betriebsanleitung fuer alle Tools, Skills und Workflows auf diesem Windows-System.
> Gueltig ab: 2026-04-30 | Autor: Kimi (System-Agent) | Letzte Session: Phase 20.B Sonnet Finalize
> **Regel:** Wenn ein Tool unerwartet fehlschlaegt → zuerst dieses Protokoll konsultieren, dann dem User melden.

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
| **Working Dir** | `D:\Elbtronika\Elbtonika` |

---

## 2. Tool-Matrix: Wann rufst du WAS auf

### 2.1 Entscheidungsbaum

```
Brauche ich Datei-INHALT?
├── Ja, einzelne Datei (bekannter Pfad) → ReadFile
├── Ja, mehrere Dateien (bekannte Pfade) → ReadFile (parallel, bis zu 5)
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
- **UTF-16 Warnung**: Wenn Datei korrumpiert aussieht → PowerShell `>` hat UTF-16/BOM erzeugt. Mit WriteFile neu schreiben.

#### `WriteFile`
- **>100 Zeilen**: Erster Call `overwrite`, danach `append`-Calls
- **UTF-8 erzwingen**: Nie PowerShell `>` oder `echo` fuer Code-Files (erzeugt UTF-16/BOM!)
- **Atomic**: WriteFile ist atomar — entweder ganz oder gar nicht
- **Parent-Directory**: `New-Item -ItemType Directory -Path <dir>` VOR WriteFile, wenn Verzeichnis nicht existiert
- **Bash-Verzeichnisse mit Klammern**: `[locale]`, `(checkout)` — in PowerShell nicht direkt verwendbar. `fs.mkdirSync` in Node.js oder `New-Item` mit escaped Pfad

#### `StrReplaceFile`
- **Bevorzugt**: Immer StrReplaceFile vor WriteFile waehlen (minimaler Diff)
- **Multi-Replace**: Array von edits in EINEM Call
- **replace_all**: Nur bei sicheren Massen-Replacements (z.B. Import-Path aendern)
- **Fehlschlag**: Wenn `old` nicht exakt matcht → ReadFile nochmal lesen
- **Best Practice**: Fuer einzelne Zeilen-Aenderungen immer StrReplaceFile. Nur fuer komplette Umschreibungen WriteFile.

#### `Shell`
- **Windows PowerShell**: Jeder Call ist eine FRISCHE Session. `cd`, Env-Vars, History persistieren NICHT
- **Chaining**: `;` statt `&&` (PowerShell), Ergebnis mit `if ($?)` pruefen
- **Timeout**: Langlaeufer (builds, tests) mit `timeout` setzen. Hintergrund mit `run_in_background=true`
- **Pfad-Trenner**: `/` oder `\` — beides geht, aber `\` ist Windows-konventionell
- **`.cmd` Pflicht**: `pnpm.cmd`, `npx.cmd`, `npm.cmd`, `biome.cmd` — nie ohne `.cmd`-Suffix auf Windows!
- **Nie interaktiv**: Keine `git commit` ohne `-m` oder `-F`. Keine `vim`/`nano`
- **Git checkout pruefen**: Nach `git checkout` IMMER `git branch --show-current` ausfuehren — PowerShell-Pipes wechseln manchmal nicht den Branch!
- **Klammern in Pfaden**: `apps/web/app/[locale]/page.tsx` → in PowerShell direkt nutzbar (Next.js convention), aber bei Glob/Shell-Grep aufpassen
- **Array fuer Biome**: Bei Pfaden mit Klammern Biome-Dateien als PowerShell-Array uebergeben: `$files = @('path1','path2'); biome.cmd check $files`
- **OOM Prevention**: `NODE_OPTIONS="--max-old-space-size=4096"` vor Vitest/Typecheck setzen

#### `Grep`
- **Case-insensitive**: `-i: true` fuer Imports/Variablen-Suche
- **Output-Mode**: `files_with_matches` fuer "welche Files", `content` fuer "was steht drin"
- **Head-Limit**: Standard 250 — fuer grosse Repos `0` setzen (sparsam)
- **Multiline**: `-U` fuer Regex ueber mehrere Zeilen
- **Konflikt-Suche**: `pattern: "^<{7}|^={7}|^>{7}"` — IMMER nach Multi-Branch-Merge ausfuehren
- **Nie Shell-grep**: Grep-Tool ist schneller und zuverlaessiger als Shell `grep` oder `rg`

#### `Glob`
- **Kein `**` am Anfang**: `src/**/*.ts` geht, `**/*.ts` wird rejected
- **Keine node_modules**: Nie `node_modules/**/*.js` — zu gross
- **Spezifisch**: `apps/web/**/*.tsx` statt `**/*.tsx`

#### `Agent` (Subagent)
- **Explore** (read-only): Codebase verstehen, Module finden, Patterns suchen. >3 Suchen = explore-Agent
- **Coder** (read-write): Software-Engineering-Arbeit mit Files editieren
- **Plan** (read-only): Architektur-Planung vor Code-Aenderungen. Nutze `skill='plan'`
- **Research** (read-only): Schnelle Codebase-Exploration. Nutze `skill='research'`
- **Parallelisieren**: Unabhaengige explore-Agents parallel starten
- **Context**: Neuer Agent hat KEINEN Kontext — alles Noetige im Prompt wiederholen
- **Resume**: Wenn ein Agent bereits Kontext hat → `resume` statt neu erstellen

---

## 3. Windows Fatal Error Patterns (Die 15 + Neue)

| # | Pattern | Symptom | Fix |
|---|---------|---------|-----|
| 1 | **UTF-16/BOM** | Datei sieht korrumpiert aus, Zeichen sind Chinesisch | PowerShell `>` nie fuer Code. WriteFile verwenden. |
| 2 | **Fehlendes `.cmd`** | `"pnpm" not found`, `"biome" not found` | Immer `pnpm.cmd`, `npx.cmd`, `biome.cmd` |
| 3 | **Falscher Biome-Pfad** | `npx biome` startet falsche Version | `node_modules\.bin\biome.cmd` verwenden |
| 4 | **Turbo OOM** | `Allocation failed` bei `turbo run typecheck` | `--concurrency=2` an alle turbo-Befehle anhaengen |
| 5 | **Biome CSS-Key** | `css.linter.rules` unknown key | Nie diesen Key zu `biome.json` hinzufuegen |
| 6 | **Git Multi-Line Commit** | Commit-Message wird abgeschnitten | `git commit -F D:\msg.txt` verwenden |
| 7 | **PowerShell Session Reset** | `cd` oder `$env:` wirkt nicht im naechsten Call | Alles in EINEM Call mit `;` chainen |
| 8 | **Klammer-Verzeichnisse** | `[locale]` oder `(checkout)` Pfad-Fehler | Node.js `fs.mkdirSync` oder escaped paths |
| 9 | **Context Compaction** | Tests verschwinden aus Kontext | Nach jedem green state commiten |
| 10 | **Git Show Corrupt** | `git show > file` erzeugt UTF-16 | `\| Out-File -Encoding utf8` verwenden |
| 11 | **Branch Confusion** | Falscher Branch nach Pipe | `git branch --show-current` pruefen |
| 12 | **Leere Verzeichnisse** | `Get-ChildItem` zeigt nichts | `Test-Path` verwenden statt `ls` |
| 13 | **Vitest Alias Fail** | `@/lib/...` funktioniert nicht in Tests | Relative Pfade verwenden: `../../src/lib/...` |
| 14 | **i18n Missing Keys** | `next-intl` wirft Fehler bei fehlenden Keys | `messages/de.json` + `en.json` vor Test pruefen |
| 15 | **Placeholder Tests** | `expect(true).toBe(true)` | Test-Content immer verifizieren |
| 16 | **Merge-Konflikt-Marker** | `RolldownError: Parse failure` mit `<<<<<<< HEAD` | Nach jedem Merge `git grep "^<{7}"` ausfuehren |
| 17 | **Case-Insensitive FS** | `demo-banner.tsx` + `DemoBanner.tsx` als Duplikate | Auf Windows nur eine Version behalten (PascalCase bevorzugen) |
| 18 | **PostgreSQL CREATE TYPE** | `CREATE TYPE IF NOT EXISTS` fehlschlaegt | `DO $$ BEGIN IF NOT EXISTS ... END $$;` verwenden |
| 19 | **Vitest OOM Chain** | Mehrere Tests in Folge crashen | Einzeln ausfuehren oder `NODE_OPTIONS` setzen |
| 20 | **Doppler Naming-Mismatch** | `NEXT_PUBLIC_APP_URL` vs `NEXT_PUBLIC_SITE_URL` | Beide Namen in env.ts akzeptieren |

---

## 4. Monorepo-Spezifika

### 4.1 Build & Typecheck
```powershell
# Typecheck (OOM-fix mit concurrency)
turbo run typecheck --concurrency=2

# Build (OOM-fix mit concurrency)
turbo run build --concurrency=2

# Lint (root-level)
node_modules\.bin\biome.cmd check .

# Lint targeted (schneller)
node_modules\.bin\biome.cmd check apps/web/src/lib/env.ts apps/web/app/...
```

### 4.2 Tests
```powershell
# Einzelne Test-Datei ( empfohlen — vermeidet OOM)
cd apps/web
$env:NODE_OPTIONS="--max-old-space-size=4096"
npx.cmd vitest run __tests__/env/mode.test.ts --passWithNoTests

# Mehrere Dateien (nur mit erhöhtem Heap)
npx.cmd vitest run __tests__/pitch/dashboard.test.tsx __tests__/press/press-kit.test.tsx --passWithNoTests

# NICHT empfohlen auf diesem System:
# pnpm.cmd --filter @elbtronika/web test   # OOM-Risiko
```

### 4.3 Biome v2 Konfiguration
- **Config**: `biome.json` im Root
- **Wichtige Rules** (auf `warn` gesetzt fuer green exit):
  - `suspicious.noConsole: "off"`
  - `suspicious.noExplicitAny: "warn"`
  - `a11y.*: "warn"`
  - `style.noNonNullAssertion: "warn"`
  - `performance.noBarrelFile: "warn"`
- **Verboten**: `css.linter.rules` key (nicht in Biome v2)
- **Targeted Check**: `node_modules\.bin\biome.cmd check <files>` ist schneller als `pnpm lint`

### 4.4 Vitest Aliases
- `@/lib/...` funktioniert in Source-Code, aber **NICHT in Tests**
- In Tests immer **relative Pfade** verwenden: `../../src/lib/...`

### 4.5 Env-Test-Pattern
```typescript
// env.ts muss exportieren:
export function resetEnv(): void { _env = null; }

// Test-Schema mit .optional() fuer fehlende ENV vars:
const testSchema = baseSchema.extend({
  OPTIONAL_VAR: z.string().optional(),
});
```

---

## 5. Git Best Practices

### 5.1 Nach Merge — IMMER Konflikt-Check
```powershell
# Kritischer Check nach jedem Multi-Branch-Merge:
grep -r "^<{7}" . --include="*.ts" --include="*.tsx" --include="*.md"
# Oder mit unserem Grep-Tool:
# pattern: "^<{7}|^={7}|^>{7}"
```

### 5.2 Commit-Regeln
- Keine `git commit`, `git push`, `git reset`, `git rebase` ohne **explizite** Anfrage
- Multi-line commits: `git commit -F D:\msg.txt`
- Nach `git checkout` immer: `git branch --show-current`

### 5.3 Branch-Strategie (Session 3)
```
feature/phase-18-19-tests-and-prd-docs  (Codex 5.3)
feature/phase-18-demo-readiness         (Sonnet 4.6)
feature/phase-19-pitch-polish           (GPT 5.4)
                \          |          /
                 v         v         v
              feature/phase-11-ai    (Merge-Ziel)
```
- Merge-Reihenfolge: Codex → Sonnet → GPT
- Gap-Fill-Dateien landeten teilweise auf dem falschen Branch → nach Merge pruefen

---

## 6. Supabase & Datenbank

### 6.1 Migrationen
- **Idempotent schreiben**: `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
- **CREATE TYPE**: Kein `IF NOT EXISTS` in PostgreSQL! Stattdessen:
```sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'my_enum') THEN
    CREATE TYPE my_enum AS ENUM ('a', 'b');
  END IF;
END $$;
```
- **Push**: `supabase db push` — **manueller Schritt**, nur Lou kann das ausfuehren
- **Config**: `supabase/config.toml` fuer zukuenftige CLI-Nutzung

### 6.2 Smoke-Tests
- `supabase/smoke-test-audit.sql` — Template fuer DB-Validation
- Immer `BEGIN; ... ROLLBACK;` verwenden um DB sauber zu halten

---

## 7. Doppler ENV Management

### 7.1 Validierung
```powershell
# PowerShell:
doppler run --config prd -- pwsh scripts/validate-doppler-prd.ps1

# Bash:
doppler run --config prd -- bash scripts/validate-doppler-prd.sh
```

### 7.2 Variablen-Schema
- **22 Variablen** in Doppler PRD
- **Kritisch**: `NEXT_PUBLIC_SITE_URL` (Doppler) vs `NEXT_PUBLIC_APP_URL` (Legacy) — beide akzeptieren
- **Optional in Demo**: Cloudflare R2, Resend, Sentry, Sanity API Token/Webhook

### 7.3 env.ts Design-Pattern
```typescript
// Required fuer alle Modi:
ELT_MODE, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_SANITY_PROJECT_ID

// Optional (fuer Demo/Staging ohne volle Integration):
SUPABASE_SERVICE_ROLE_KEY, STRIPE_PUBLISHABLE_KEY, ANTHROPIC_API_KEY,
CLOUDFLARE_R2_*, RESEND_API_KEY, SENTRY_DSN, etc.
```

---

## 8. i18n (next-intl)

- **Fehlende Keys werfen**: Runtime-Fehler wenn Key in `messages/de.json` oder `en.json` fehlt
- **Namespace**: `namespace: "press"`, `namespace: "pitch"`, `namespace: "checkout"`
- **Vor Tests pruefen**: Alle verwendeten Keys in beiden Sprachdateien existieren

---

## 9. Skills-Inventory

### 9.1 Globale Skills
| Skill | Trigger | Wann nutzen |
|-------|---------|-------------|
| `code-review` | "review", "review changes" | Diff, Commit-Hash, git-Range |
| `comprehensive-review` | "comprehensive review", PR-URL | **KOSTSPIELIG** — nur bei expliziter Anfrage |
| `cross-review` | "review with opus/gemini/..." | Model explizit genannt |
| `frontend-design` | UI, Landingpage, Dashboard, Mockup | Design-Extraktion + HTML/TSX |
| `init` | "init repo", "create AGENTS.md" | Projekt-Setup, Onboarding |
| `plan` | Architektur-Planung | Vor jeder nicht-trivialen Code-Aenderung |
| `playwright` | "test website", "screenshot", "login flow" | Browser-Automation |
| `research` | Codebase-Exploration, Pattern-Suche | Read-only, schnell, parallel |
| `microsoft-foundry` | "deploy agent", "Foundry" | Azure Foundry |
| `skill-creator` | "create skill", "update skill" | Neue Skills bauen |

### 9.2 Projekt-Skills
| Skill | Pfad | Trigger |
|-------|------|---------|
| `Mechanism Agent` | `.sixth/skills/Mechanism Agent.md` | Agent hoert auf / wartet unnoetig |
| `designlang-tokens` | `design-extract-output/*/.claude/skills/designlang/SKILL.md` | Frontend-Styling mit Design-Tokens |

### 9.3 Skill-Aufruf-Muster
```typescript
// Plan-Mode (vor Implementation)
Agent(subagent_type="plan", skill="plan", prompt="...implementation plan...")

// Research (read-only Exploration)
Agent(subagent_type="explore", skill="research", prompt="...find patterns...")

// Frontend-Design
Agent(subagent_type="coder", skill="frontend-design", prompt="...design this page...")
```

---

## 10. Verification Ladder (5 Stufen)

**Reihenfolge IMMER einhalten:**

1. **Slice-Typecheck** — `tsc --noEmit` auf geaenderten Dateien (wenn moeglich)
2. **Slice-Tests** — Nur geaenderte Test-Dateien ausfuehren
3. **Targeted Biome** — `node_modules\.bin\biome.cmd check <changed-files>`
4. **Full Typecheck** — `turbo run typecheck --concurrency=2` (wenn OOM erlaubt)
5. **Full Lint** — `node_modules\.bin\biome.cmd check .` oder `pnpm lint`

**Nach jedem Schritt:** Bei Fehlern → fixen, NICHT zum naechsten Schritt gehen.

---

## 11. Memory-Disziplin

### 11.1 Run-Logs
```
Pfad: memory/runs/YYYY-MM-DD_<Agent>_<Model>_Run-<nr>.md
Format: Exakt 5 Zeilen pro Prompt/Session
```

**Beispiel:**
```markdown
## 2026-04-30 | Kimi | GapFill-MergeFix | Run-06

**Task:** Phase 20.B Sonnet Finalize
**Model:** Kimi Code CLI (orchestrating Codex/Sonnet/GPT artifacts)
**Outcome:** 30 files, +211/-1730. 17 merge conflicts resolved. 43 tests green.
**Key Learnings:** Always `git grep "^<{7}"` after multi-branch merge. PostgreSQL CREATE TYPE has no IF NOT EXISTS.
```

### 11.2 Handoffs
- `memory/handoffs/KIMI_SESSION_3_HANDOFF.md` — fuer naechsten Agent
- `memory/OPSIDIAN_MEMORY.md` — zentrale Index-Datei fuer ALLE Handoffs + Run-Logs
- Nach jeder Session: OPSIDIAN_MEMORY.md aktualisieren

### 11.3 ADRs
- `docs/adr/0014-trust-residuals.md`
- `docs/adr/0018-demo-mode-architecture.md`
- `docs/adr/0019-pitch-architecture.md`
- `docs/adr/0022-modes-and-prd-doppler.md`

---

## 12. Background Tasks

```powershell
# Starten (nicht blockieren)
Shell(command="...", run_in_background=true, description="Build project")

# Status pruefen
TaskList(active_only=true)

# Output lesen
TaskOutput(task_id="...", block=false)

# Abbrechen (nur wenn noetig)
TaskStop(task_id="...", reason="Abbruchgrund")
```

---

## 13. Approval-Workflow

- Approvals laufen ueber **unified approval runtime**
- Nicht annehmen, dass Approvals lokal zu einem Subagenten gehoeren
- Root-UI-Channel koordiniert alle Approvals

---

## 14. Known Issues (Pre-Existing)

| Issue | Datei | Status |
|-------|-------|--------|
| TypeScript Error | `packages/three/src/components/Room.tsx:66` | Blockiert full typecheck — bekannt |
| ~100+ Lint Warnings | repo-weit | `warn` level, exit 0 |
| console.* calls | repo-weit | Phase 20.A: Logger-Modul |
| Real demo assets | `public/demo/` | Phase 20.B5: Kann nicht von Agent generiert werden |
| Investor magic-link | `apps/web/app/[locale]/pitch/page.tsx` | Phase 20.C6: Braucht Lee's echte Email |
| Supabase CLI | nicht installiert | `supabase db push` manuell durch Lou |
