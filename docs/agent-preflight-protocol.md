# Agent Pre-Flight Protocol — ELBTRONIKA Cowork

> **When to read this:** Start of every new chat session before touching code or tools.
> Written from real pain in Phase 1. Each entry has a root cause.

---

## 1. Shell — ALWAYS cmd, NEVER PowerShell

**Machine:** Windows 10 (19045.5917), user Moin, D:\Elbtronika\Elbtonika

```
RULE: shell: cmd  — always. Every Desktop Commander call.
WHY:  PowerShell execution policy blocks pnpm.ps1
      && chaining fails in PowerShell
      git -m "multi word" breaks in PowerShell
```

```
✅ DO:   start_process("cmd", shell: "cmd")
❌ AVOID: start_process("powershell", ...)
❌ AVOID: start_process("pnpm ...", shell: "powershell")
```

---

## 2. Desktop Commander — Call Pattern

### Start fresh, one command per interact

```
Pattern:
  1. start_process("cmd", shell:"cmd", timeout_ms: 10000)
  2. interact_with_process(pid, "cd /d D:\Elbtronika\Elbtonika", timeout_ms: 8000)
  3. interact_with_process(pid, "<next command>",               timeout_ms: 10000)
  4. interact_with_process(pid, "<next command>",               timeout_ms: 12000)
```

**Timeouts:**
| Command type | timeout_ms |
|---|---|
| cd / simple | 5000–8000 |
| git add / status | 8000 |
| git commit | 10000 |
| git push | 30000 |
| gh run list | 15000 |
| pnpm install | 45000 (but tool cap is 45000) |
| turbo build | use separate process, read output |

**NEVER chain all in one call — process dies mid-way, silent failure.**

### Git commit on Windows — ALWAYS use file

```cmd
echo your commit message here > D:\msg.txt
git commit -F D:\msg.txt
```

```
WHY: git commit -m "multi word message" → Windows treats words after
     first space as pathspecs → "nothing to commit" or wrong commit
```

### Process death recovery

```
If interact_with_process returns error "process may have exited":
  → Don't panic. Check git log / gh run list to see if it completed
  → Often the cmd DID execute before the timeout killed the MCP wrapper
  → start_process fresh, verify state, continue
```

---

## 3. Workspace Bash — Check Before Using

```bash
# Test first:
mcp__workspace__bash: "echo ok"
# If returns "Workspace unavailable" → fall back to Desktop Commander
```

**Path mapping (when bash IS available):**
| Windows path | Linux mount |
|---|---|
| `D:\Elbtronika\Elbtonika\` | `/sessions/bold-dazzling-goodall/mnt/Elbtonika/` |
| outputs dir (temp) | `/sessions/bold-dazzling-goodall/mnt/outputs/` |
| uploads dir | `/sessions/bold-dazzling-goodall/mnt/uploads/` |
| skills dir | `/sessions/bold-dazzling-goodall/mnt/.claude/skills/` |

**Prefer bash when available** — faster, no shell-compat issues, proper `&&` chaining.  
**Fall back to Desktop Commander** when bash unavailable (happens often).

---

## 4. GitHub CLI — Primary CI Monitor

```
gh is installed on this machine. Use it for all CI checks.
No need for browser / Chrome MCP for GitHub status.
```

```bash
# Check latest runs
gh run list --repo DiggAiHH/elbtronika --limit 5

# Job breakdown
gh run view <run-id> --repo DiggAiHH/elbtronika

# Failure logs only
gh run view <run-id> --log-failed --repo DiggAiHH/elbtronika

# Filter log output
gh run view <run-id> --log --repo DiggAiHH/elbtronika 2>&1 | findstr /i "error\|fail\|warn"
```

**CI polling pattern:**
```
1. Push commit
2. Wait ~30s (start_process + timeout /t 30 OR just next interact)
3. gh run list --limit 1  →  check "in_progress" or "completed"
4. gh run view <id>       →  check each job ✓/✗
5. gh run view --log-failed  →  only if jobs failed
```

**Never open GitHub in browser to check CI — `gh` is 10x faster.**

---

## 5. Chrome MCP — When It Works

```bash
mcp__Claude_in_Chrome__list_connected_browsers
# Returns [] when extension not connected — common
```

**If empty:** Don't block. Fall back to `gh` CLI for GitHub. Fall back to Desktop Commander for local ops.

**Load all chrome tools at once (if needed):**
```
ToolSearch: { query: "chrome", max_results: 20 }
```

**Chrome tier restrictions on this machine:**
- Browsers → tier "read" only (no clicks/typing)
- Use Chrome MCP tools (`mcp__Claude_in_Chrome__*`) for actual web interaction
- Terminal/IDE → tier "click" (no typing)

---

## 6. pnpm / Node on This Machine

```
pnpm version: 10.0.0 (set in root package.json "packageManager")
Node version: >=22.0.0 (enforced in engines)
Workspace: 5 packages (root + apps/web + packages/contracts|ui|config)
```

**Always run from repo root:**
```cmd
cd /d D:\Elbtronika\Elbtonika
pnpm install --frozen-lockfile
pnpm build         (→ turbo run build)
pnpm lint          (→ turbo run lint, uses biome)
pnpm test          (→ turbo run test, uses vitest)
pnpm typecheck     (→ turbo run typecheck)
```

**pnpm binary location:**
```
node_modules\.bin\pnpm     (local)
node_modules\.bin\biome    (local — never use npx biome, installs 0.3.3)
node_modules\.bin\turbo    (local)
```

**NEVER:** `npx biome` → installs wrong version (0.3.3 instead of 2.4.13)  
**ALWAYS:** `node_modules\.bin\biome check .` or `pnpm lint`

---

## 7. Biome v2 — Schema Gotchas

```json
REQUIRED in biome.json for this project:
{
  "$schema": "https://biomejs.dev/schemas/2.4.13/schema.json",
  "files": {
    "includes": ["**", "!node_modules", "!.next", "!dist", "!build", "!.turbo", "!coverage", "!supabase/.temp"]
  },
  "css": {
    "parser": { "tailwindDirectives": true }
  },
  "overrides": [{ "includes": [...] }]
}
```

**Breaking changes from v1/v2.0.0 → v2.4.13:**
| Old | New | Note |
|---|---|---|
| `files.ignore` | `files.includes` with `!` prefix | Schema breaking |
| `noConsoleLog` | `noConsole` | Rule renamed |
| `overrides[].include` | `overrides[].includes` | Plural |
| No CSS support | `css.parser.tailwindDirectives: true` | Needed for Tailwind v4 `@theme` |
| `css.linter.rules` | Does not exist | Put rules in top-level `linter.rules` |

**Rule placement for `noImportantStyles`:**
```json
"linter": { "rules": { "complexity": { "noImportantStyles": "off" } } }
// NOT inside css.linter.rules — that key doesn't exist in v2.4.13
```

---

## 8. GitHub Actions CI — Proven Patterns

### upload-artifact for .next/

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: next-build
    path: apps/web/.next/
    retention-days: 1
    if-no-files-found: error       # ← fail fast if build broken
    include-hidden-files: true     # ← CRITICAL: .next is a dotdir, hidden on Linux
```

```
ROOT CAUSE: upload-artifact@v4 default is include-hidden-files: false
.next/ starts with dot → treated as hidden on Linux → 0 files uploaded
→ artifact created but empty → download-artifact fails "artifact not found"
LESSON: Any dotdir output needs include-hidden-files: true
```

### Deploy job pattern (when secrets not yet wired)

```yaml
deploy:
  needs: build
  steps:
    - run: pnpm build    # Rebuild in deploy job — don't rely on artifact download
      env:
        NEXT_PUBLIC_SUPABASE_URL: "https://placeholder.supabase.co"
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "placeholder"
    
    - name: Deploy
      continue-on-error: true   # ← soft-fail when NETLIFY_AUTH_TOKEN not set
      run: netlify deploy --prod ...
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

### pnpm in CI — required root package.json settings

```json
{
  "pnpm": {
    "onlyBuiltDependencies": ["esbuild", "sharp"]
  }
}
```

```
WHY: pnpm blocks build scripts by default in newer versions
     esbuild binary won't compile → Next.js can't bundle
     sharp won't compile → image optimization broken
```

### vitest — always exclude e2e

```typescript
// vitest.config.ts
test: {
  exclude: ["**/node_modules/**", "**/e2e/**", "**/*.spec.ts"],
}
```

```
WHY: vitest default glob picks up Playwright .spec.ts files
     → playwright tries to run under jsdom → crashes
```

### --passWithNoTests everywhere

```json
"test": "vitest run --passWithNoTests"
```

```
WHY: vitest exits code 1 if no test files found
     packages/contracts and packages/ui have no unit tests yet
     CI fails even though there's nothing wrong
```

### Next.js — reactCompiler gate

```typescript
// next.config.ts — DISABLED until Phase 7+
experimental: {
  // reactCompiler: true,  // needs: babel-plugin-react-compiler
  typedRoutes: true,
}
```

---

## 9. File & Path Rules

```
Working dir (agent temp):  C:\Users\Moin\AppData\Roaming\Claude\...\outputs
Project workspace:         D:\Elbtronika\Elbtonika
User-visible files:        D:\Elbtronika\Elbtonika (workspace folder)

File tools (Read/Write/Edit) use Windows paths
Shell bash uses Linux mount paths (see section 3)
```

**Always save final deliverables to D:\Elbtronika\Elbtonika** — that's the mounted workspace the user sees. The `outputs` temp dir is invisible to the user.

---

## 10. MCP Tool Load Order (Deferred Tools)

```
RULE: Load in bulk, not one by one.
```

```javascript
// Load ALL computer-use tools at once:
ToolSearch({ query: "computer-use", max_results: 30 })

// Load ALL chrome tools at once:
ToolSearch({ query: "chrome", max_results: 20 })

// Load specific tools:
ToolSearch({ query: "select:mcp__workspace__bash", max_results: 1 })
ToolSearch({ query: "select:mcp__Desktop_Commander__start_process,mcp__Desktop_Commander__interact_with_process", max_results: 2 })
```

---

## 11. Skills — When to Use Each

| Skill | Trigger | Notes |
|---|---|---|
| `engineering:debug` | CI failure, build error, mystery bug | Use before manual investigation |
| `engineering:code-review` | Before any merge to main | |
| `engineering:architecture` | New tech choice, ADR needed | |
| `productivity:memory-management` | End of session, new terms discovered | Update CLAUDE.md + memory/ |
| `productivity:start` | First message of new session | Bootstrap context |
| `docx` / `pptx` / `pdf` | Any document creation | Always read SKILL.md first |
| `data:analyze` | Any data/metrics question | |

**Always read SKILL.md before using a skill:**
```
Read: C:\...\skills\<skillname>\SKILL.md
```

---

## 12. Connectors Available (This Account)

| Connector | MCP prefix | Use for |
|---|---|---|
| Supabase | `mcp__230328bd...` | DB migrations, SQL, schema, edge functions |
| Stripe | `mcp__a465fe2f...` | Products, prices, customers, payment links |
| Notion | `mcp__2778793c...` | Docs, pages, databases, comments |
| Airtable | `mcp__6ec78dc4...` | Tables, records, bases |
| Google Calendar | `mcp__63478716...` | Events, scheduling |
| Netlify | `mcp__d406f111...` | Deploy status, project settings |
| GitHub (via gh CLI) | Desktop Commander + gh | Runs, PRs, issues |
| Figma | `mcp__Figma...` | Design context, screenshots, tokens |
| Miro | `mcp__b04fab3e...` | Diagrams, boards, docs |
| Gmail | `mcp__f8417681...` | Threads, drafts, labels |
| Google Drive | `mcp__ec313e43...` | Files, search, metadata |

**Documentation rule (from CLAUDE.md):** Everything must be documented in Notion, Airtable, and Miro. Local copy in D:\. GitHub for code.

---

## 13. Session Start Checklist

```
[ ] Read CLAUDE.md → decode project context
[ ] Read docs/agent-preflight-protocol.md (this file) → tool rules
[ ] Check: mcp__workspace__bash available? → prefer it, else Desktop Commander
[ ] Check: Chrome extension connected? → list_connected_browsers
[ ] Load deferred tools in bulk → ToolSearch queries
[ ] If any CI work: gh run list --repo DiggAiHH/elbtronika --limit 3
[ ] caveman mode ON (terse, no fluff)
```

---

## 14. Session End Checklist

```
[ ] All changed files committed + pushed to main
[ ] git tag if milestone reached (vX.Y.Z)
[ ] docs/ updated (DoD, ADR, protocol)
[ ] CLAUDE.md memory updated with new terms/people/decisions
[ ] Notion + Airtable + Miro updated (per global CLAUDE.md rule)
[ ] No temp files left in repo root (validate-yaml.js style)
```

---

## 15. Known Bugs / Sharp Edges (Don't Repeat)

| Bug | Symptom | Fix |
|---|---|---|
| `.next/` not uploaded | "No artifacts will be uploaded" despite build success | `include-hidden-files: true` |
| Biome wrong version | `npx biome` installs 0.3.3 | Use `node_modules\.bin\biome` |
| Git commit eats words | Commits with empty message or wrong files | Always use `-F D:\msg.txt` |
| Vitest picks up Playwright | CI fails with jsdom errors on e2e specs | Exclude `**/e2e/**` in vitest config |
| esbuild not compiled | Next.js build "empty" despite exit 0 | `pnpm.onlyBuiltDependencies: ["esbuild", "sharp"]` |
| reactCompiler crashes build | "Cannot find module babel-plugin-react-compiler" | Comment out until Phase 7 |
| PowerShell blocks pnpm | "pnpm.ps1 cannot be loaded" | cmd shell only |
| Desktop Commander timeout | Process dies, unknown state | Check `gh log` / `git log` — often completed |
| Biome `css.linter.rules` | Unknown configuration key | Rules go in top-level `linter.rules` |
| Turbo telemetry banner | Clutters CI logs | `TURBO_TELEMETRY_DISABLED=1` in CI env (Phase 2 cleanup) |

---

## 16. Repo Topology

```
Org:    DiggAiHH
Repo:   elbtronika
Branch: main (only branch for now)
Tag:    v0.1.0 = Phase 1 complete

CI URL: https://github.com/DiggAiHH/elbtronika/actions
Netlify: not yet linked (Phase 3)
Supabase: not yet provisioned (Phase 3)
```

---

## 17. Critical Path Reminder

```
Phase 0 (Legal + Stripe KYC)  ─┐
Phase 3 (Infra: R2 + Supabase) ─┤── all block Phase 7 (Single Canvas)
Phase 7 (Single Canvas)        ─┘

Do NOT skip Phase 0 legal work while building Phase 3 infra.
They can run in parallel but both must complete before Phase 7.
```

---

*Last updated: 2026-04-25 — Phase 1 complete*
*Author: Claude (Cowork) + Lou*
