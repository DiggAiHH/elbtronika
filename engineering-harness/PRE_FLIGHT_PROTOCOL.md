# ELBTRONIKA — Agent Pre-Flight Protocol

> **Read this BEFORE touching any code.** One-page bootstrap for Opus, Sonnet, GPT, Kimi, Codex.
> Date: 2026-04-30 | Session: 3 | Author: Kimi K-2.6
> Companion docs: `AGENTS.md`, `CLAUDE.md`, `HERMES_TRUST_HARNESS.md`

---

## 1 · Agent Bootstrap Checklist (DO FIRST — Every Session)

```
□ 1. Read STATUS.md (live state)
□ 2. Read TASKS.md (active / waiting / done)
□ 3. Read this protocol (PRE_FLIGHT_PROTOCOL.md)
□ 4. git status -sb           → preserve unrelated user work
□ 5. git log --oneline -10    → know recent history
□ 6. git branch --show-current → confirm you're on expected branch
□ 7. pnpm --filter @elbtronika/web typecheck → verify green before edits
□ 8. Identify trust boundary → auth? payment? deletion? public claim?
□ 9. Write scoped task list with ONE in-progress item
□ 10. Set TodoList → track progress visibly
```

**Never skip steps 1–6.** Step 7 prevents "typecheck red after edits" surprises. Step 8 prevents security incidents.

---

## 2 · Tool Calling Matrix

| Tool | When to Use | When NOT to Use | Example | Agent |
|------|-------------|-----------------|---------|-------|
| `ReadFile` | Known path, <1000 lines | Discovery → use `Glob`/`Grep` first | `ReadFile {path: "apps/web/src/lib/env.ts"}` | All |
| `Glob` | Find files by pattern | When you know exact path | `Glob {pattern: "apps/web/**/*.test.ts"}` | All |
| `Grep` | Search code for keywords | Reading full file content | `Grep {pattern: "ELT_MODE", type: ts}` | All |
| `Shell` | Run commands, check env | File edits → use `WriteFile`/`StrReplaceFile` | `Shell {command: "pnpm typecheck"}` | All |
| `WriteFile` | Create new file | Overwriting without checking existence first | `WriteFile {path: "new.ts", content: "..."}` | All |
| `StrReplaceFile` | Edit existing file | Multi-line complex rewrites → `WriteFile` | `StrReplaceFile {path: "x.ts", edit: {old:"a",new:"b"}}` | All |
| `Agent(subagent_type="explore")` | >3 search queries, codebase discovery | Simple 1-file edits | `Agent {subagent_type:"explore", prompt:"find auth flow"}` | All |
| `Agent(subagent_type="coder")` | Complex implementation task | Pure research | `Agent {subagent_type:"coder", prompt:"implement X"}` | All |
| `Agent(subagent_type="plan")` | Architecture decisions, ADR | Simple bug fixes | `Agent {subagent_type:"plan", prompt:"design Y"}` | Opus |
| `AskUserQuestion` | Ambiguous requirements | Trivial decisions | `AskUserQuestion {questions:[...]}` | All |
| `SetTodoList` | Track multi-step tasks | Single-step tasks | `SetTodoList {todos:[...]}` | All |
| `SearchWeb` | Verify APIs, versions, docs | Code search in repo | `SearchWeb {query:"Next.js 15.3 release"}` | All |
| `FetchURL` | Read specific web page | Generic search | `FetchURL {url:"..."}` | All |

**Parallel Rule:** If >1 non-interfering tool calls anticipated, fire ALL in parallel. This is mandatory for performance.

**Read-Only First:** Always explore before editing. Use `explore` agent for >3 search queries.

---

## 3 · Windows-Specific Survival Guide

> Environment: Windows 11, PowerShell (`C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe`)
> Shell tool = fresh PowerShell session per call. No state persists.

### 3.1 PowerShell vs CMD

| Context | Command | Works? |
|---------|---------|--------|
| pnpm | `pnpm.cmd install` | ✅ Always use `.cmd` suffix |
| pnpm | `pnpm install` | ❌ Fails (Windows Store trap) |
| npx | `npx.cmd <pkg>` | ✅ Always use `.cmd` suffix |
| Git commit | `git commit -m "msg"` | ✅ Direct (no file needed) |
| Git commit (multiline) | `git commit -F file.txt` | ✅ For complex messages |
| Combined commands | `cmd1; cmd2; cmd3` | ✅ Semicolon chaining |
| Conditional | `cmd1; if ($?) { cmd2 }` | ✅ PowerShell syntax |
| Unix `&&` / `\|\|` | `cmd1 && cmd2` | ❌ Use `if ($?)` instead |

### 3.2 Path Handling
- **Always absolute** when outside working dir: `D:\Elbtronika\Elbtonika\...`
- **Working dir relative** when inside: `apps/web/...`
- **Bracket dirs `[locale]`**: Create via Node.js `fs.mkdirSync`, NOT shell (`mkdir` fails on brackets)

### 3.3 pnpm / Node Quirks
- `pnpm.onlyBuiltDependencies: ["esbuild", "sharp"]` in root `package.json`
- Workspace packages referenced as `"workspace:*"`
- Biome: `node_modules\.bin\biome` or `pnpm lint` — never `npx biome` (wrong version)
- Playwright: resolve from pnpm store: `node_modules/.pnpm/@playwright+test@VERSION/node_modules/playwright`

### 3.4 Git on Windows
- Line endings: repo uses `LF` (configured in `.gitattributes`)
- `git stash` + `git checkout` = conflict risk when files added on both branches → **prefer committing before switching**
- Force-push: `git push origin branch --force-with-lease` (safer than `--force`)

---

## 4 · Memory Discipline (Mandatory)

### 4.1 Run-Log Format — EXACT 5 Lines

Every prompt interaction = one run entry. File: `memory/runs/YYYY-MM-DD_<Agent>_<Model>-<RunNumber>.md`

```markdown
## Run NN — [One-line summary]
- Phase: [Phase number or "Setup/Wrap"]
- Was: [What was done, max 2 sentences]
- Tests: [Test result or "—"]
- Branch: `branch-name` @ `commit-sha`
- Commit: `sha type(scope): message`
```

**Examples from Session 3:**
```markdown
## Run 27 — Opus 4.7 Handover + STATUS Update
- Phase: 18–19 (Wrap)
- Was: Session 3 Wissen als token-effizienter Opus 4.7 Handover verpackt. STATUS.md aktualisiert.
- Tests: —
- Branch: `feature/phase-11-ai` @ `3d170cc`
- Commit: `3d170cc docs(handover): Opus 4.7 Handover + STATUS update — Session 3 Layer`

## Run 28 — Demo Artwork Generation
- Phase: 18 (Demo-Readiness)
- Was: 8 Demo-Artwork-Bilder (1024x1024px PNG) algorithmisch mit Playwright + HTML Canvas 2D generiert.
- Tests: —
- Branch: `feature/phase-11-ai` @ `649c6bb`
- Commit: `0a59f44 feat(assets): generate 8 demo artwork images with Playwright Canvas`
```

### 4.2 Naming Convention

| Component | Format | Example |
|-----------|--------|---------|
| Run-Log file | `YYYY-MM-DD_<Agent>_<Model>-<Run>.md` | `2026-04-30_kimi_K-27.md` |
| Agent name | Codename used in session | `kimi`, `sonnet`, `gpt`, `codex`, `opus` |
| Model | Version identifier | `K-2.6`, `4.6`, `5.4`, `5.3`, `4.7` |
| Run number | Sequential within session | `01`, `02`, ... `28` |

### 4.3 Commit After Every Run
- Never batch multiple runs into one commit
- Each run gets its own commit (or merge commit for integration runs)
- Push after every run to prevent stash/checkout conflicts

### 4.4 STATUS.md Update Rule
- Update after **every** phase step, not just at session end
- Update "Letztes Update" date
- Move completed tasks to `## Done` with date + agent

---

## 5 · Skill Usage Guide

> Skills live in `C:\Users\Moin\.claude\skills\` and `c:\Users\Moin\AppData\Roaming\Code\User\globalStorage\moonshot-ai.kimi-code\bin\kimi_internal\kimi_cli\skills\`

| Skill | When to Use | How to Call | Key Notes |
|-------|-------------|-------------|-----------|
| **init** | Create/update AGENTS.md, repo onboarding | Read `SKILL.md`, follow gather → generate → validate | Never fabricate. 200–400 words target. |
| **plan** | Architecture decisions, implementation planning | `EnterPlanMode` → explore → design → write plan → `ExitPlanMode` | Read-only until plan approved. Use `explore` subagents for research. |
| **research** | Fast codebase exploration (read-only) | `Agent {subagent_type:"explore", prompt:"..."}` | Thoroughness: quick/medium/thorough. Preferred for >3 searches. |
| **playwright** | Browser automation, screenshots, E2E | Read `SKILL.md` for patterns | Already installed as `@playwright/test` in project. |
| **code-review** | Review diffs, commits, PRs | Read `SKILL.md` for input formats | Can take text diff, commit hash, or git range. |
| **comprehensive-review** | Full PR review with parallel subagents | Only when user EXPLICITLY requests | Costly. Don't use unless asked. |
| **cross-review** | Review with specific model | When user says "review with opus/sonnet/gemini" | Root agent reconstructs diff from history. |
| **frontend-design** | UI mockups, landing pages, dashboards | Read `SKILL.md` for HTML/CSS output | Supports variants + existing framework integration. |
| **kimi-cli-help** | Kimi Code CLI usage questions | Direct answer from SKILL.md | Installation, config, slash commands, MCP. |
| **microsoft-foundry** | Azure Foundry agent deployment | Read SKILL.md for full workflow | Docker → ACR → hosted/prompt agent. |
| **skill-creator** | Create new skills | Read SKILL.md for structure | SKILL.md + examples + references. |

**Rule:** Read a skill's `SKILL.md` BEFORE using it. Skills contain exact instructions, scripts, and templates.

---

## 6 · MCP / Connector / Trust Rules

### 6.1 Hermes Trust Waves (Status: Waves 0–8 ✅)

Before ANY MCP edit, read `engineering-harness/HERMES_TRUST_HARNESS.md`.

| Wave | Boundary | Verification |
|------|----------|--------------|
| 0 | Auth + role gate + tool allowlist | `/api/mcp/invoke` returns 401/403 correctly |
| 1 | Audit log (dual-mode) | `MCP_AUDIT_DB=true` → DB row; `false` → console.log |
| 2 | Canonical `server/tool` naming | No bare tool names in prompts |
| 3 | DB-persisted agent tasks | `agent_tasks` table, not in-memory Map |
| 4 | Idempotency + atomic claim | Duplicate submission → reuse/reject |
| 5 | Flow honesty | `source: "simulated"\|"measured"` explicit |
| 6 | Consent-gated analytics | `elt-consent` localStorage check |
| 7 | Webhook order lookup | `stripe_session_id` stored + queried |
| 8 | Documentation truth | STATUS.md matches runtime |

### 6.2 Tool Risk Classes

| Class | Examples | Default | Require Approval |
|-------|----------|---------|------------------|
| `read` | query published data | Allowed by role | No |
| `analyze` | scoring, recommendations | Allowed with audit | No |
| `write` | insert, update | Block until approved | Yes |
| `payment` | create intent, refund | Block until approved | Yes |
| `destructive` | delete account, purge | Block + explicit confirm | Yes |

### 6.3 Critical Files (Touch = Audit Required)
- `apps/web/app/api/mcp/invoke/route.ts`
- `apps/web/app/api/mcp/tools/route.ts`
- `apps/web/src/lib/mcp/audit.ts`
- `apps/web/src/lib/supabase/admin.ts`
- `apps/web/app/api/checkout/*`
- `apps/web/app/api/account/*`
- `apps/web/app/api/webhooks/*`

---

## 7 · Merge Protocol (Proven in Session 3)

### 7.1 Three-Workstream Pattern

When running parallel workstreams:

```
Branch A (Codex) ──┐
Branch B (Sonnet) ─┼─→ feature/phase-11-ai (merge target)
Branch C (GPT) ────┘
```

**Order:** Codex → Sonnet → GPT (no-fast-forward each)

```bash
git merge --no-ff feature/phase-18-19-tests-and-prd-docs -m "merge(codex): Phase 18-19 tests + docs"
git merge --no-ff feature/phase-18-demo-readiness      -m "merge(sonnet): Phase 18 demo-readiness"
git merge --no-ff feature/phase-19-pitch-polish        -m "merge(gpt): Phase 19 pitch-polish"
```

### 7.2 Known Conflict Hotspots

| File | Why | Resolution Strategy |
|------|-----|---------------------|
| `apps/web/app/api/mcp/invoke/route.ts` | Trust Wave implementation vs. plain version | Keep audit module integration |
| `apps/web/app/[locale]/layout.tsx` | Multiple component integrations | Merge all: EnvProvider + DemoBanner + WalkthroughTour + CanvasRoot |
| `STATUS.md` | Multiple agents updating status | Manual merge, keep all done items |
| `packages/ui/src/index.ts` | Barrel exports from multiple branches | Union all exports, remove duplicates |

### 7.3 Post-Merge Verification
```bash
pnpm --filter @elbtronika/web typecheck   # MUST be green
pnpm --filter @elbtronika/web test        # MUST pass
```

---

## 8 · Error Prevention Registry (Session 3 Learnings)

| # | Error | Root Cause | Prevention |
|---|-------|------------|------------|
| E1 | `invoke/route.ts` lost Trust Waves | Parallel work on same file, one branch had older version | Exclusivity: one agent owns MCP files |
| E2 | `env.ts` missing `ELT_MODE` in `.env.example` | Forgot to update example env | `.env.example` = part of env PR checklist |
| E3 | Supabase types drift between branches | Manual patches on generated file | Use `as any` bridge, regenerate after migration |
| E4 | PowerShell `\|\|` and `&&` fail | PowerShell syntax differs from bash | Use `;` chaining or `if ($?)` |
| E5 | `git stash` + checkout conflicts | Files added on both branches | Commit before switching branches |
| E6 | `packages/ui` barrel exports out of sync | Multiple branches add exports | Merge `src/index.ts` carefully, union all |
| E7 | Canvas images black (5KB) | `drawImage(canvas, ...)` causes tainting | Fresh browser context per image; avoid self-drawImage |
| E8 | `path` double-declared in Node.js | Added import without checking existing | Read file before editing imports |
| E9 | Playwright `require('playwright')` fails | Module in pnpm store, not root node_modules | Use `createRequire` with pnpm store path |
| E10 | `window.__ELT_ENV__` type errors | Missing global type declaration | Add `declare global { interface Window { __ELT_ENV__: ... } }` |
| E11 | `effectiveSteps.length` null error | Empty array not guarded | Always guard: `effectiveSteps?.length ?? 0` |
| E12 | Test failures from missing `ELT_MODE` | Test env doesn't load `.env` | Add `ELT_MODE=demo` to test setup / `.env.example` |

---

## 9 · Environment Verification Commands

### 9.1 Before Any Edits
```bash
# Repo state
git status -sb
git log --oneline -10
git branch --show-current

# Health check
pnpm --filter @elbtronika/web typecheck
```

### 9.2 After Any Edits
```bash
# Type safety
pnpm --filter @elbtronika/web typecheck

# Lint
pnpm --filter @elbtronika/web lint

# Unit tests
pnpm --filter @elbtronika/web test

# Specific test file
pnpm --filter @elbtronika/web vitest run __tests__/path/to/test.ts
```

### 9.3 Before Push
```bash
# Full verification
pnpm --filter @elbtronika/web typecheck
pnpm --filter @elbtronika/web test

# Git
git diff --stat          # review scope
git log --oneline -5     # verify commits
```

### 9.4 E2E Test Commands
```bash
# All E2E
pnpm --filter @elbtronika/web test:e2e

# Specific spec
pnpm --filter @elbtronika/web test:e2e -- demo-flow.spec.ts

# UI mode
pnpm --filter @elbtronika/web test:e2e -- --ui
```

### 9.5 Supabase Commands
```bash
# Push migrations to dev
pnpm.cmd supabase db push

# List applied migrations
pnpm.cmd supabase migration list

# Generate types (after migrations applied)
pnpm.cmd supabase gen types typescript --project-id <PROJECT_ID> > packages/contracts/src/supabase/types.ts
```

---

## 10 · Handoff Template (Copy-Paste Ready)

After every session, output this block for the next agent:

```
=== NEXT PROMPT FOR [SONNET/OPUS/GPT/CODEX/KIMI] ===

Repository root: D:\Elbtronika\Elbtonika
Active branch: feature/phase-11-ai

Read before acting:
1. STATUS.md (live state)
2. TASKS.md (active tasks)
3. engineering-harness/PRE_FLIGHT_PROTOCOL.md (this doc)
4. OPUS_47_HANDOVER.md (if Opus/Sonnet)
5. engineering-harness/HERMES_TRUST_HARNESS.md (if MCP/trust work)

Task: [Specific description — what, where, acceptance criteria]

Blockers: [Any blockers or questions for Lou]

Scope: [Scoped area only]. Smallest safe implementation. Tests first.
When done: update STATUS.md + TASKS.md, write run log, output next prompt.

=== END NEXT PROMPT ===
```

---

## Quick Reference Card

```
BOOT:    STATUS → TASKS → THIS → git status → typecheck
EDIT:    ReadFile/Glob/Grep → explore if >3 searches → edit → typecheck → test
COMMIT:  git add → git commit -m "type(scope): subject" → git push
LOG:     memory/runs/YYYY-MM-DD_Agent-Model-Run.md (5 lines)
HANDOFF: Next Prompt Block + STATUS update + TASKS update
```
