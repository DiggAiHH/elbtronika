# ELBTRONIKA — Agent Pre-Flight Protocol

> **Read this BEFORE touching any code.** One-page bootstrap for Opus, Sonnet, GPT, Kimi, Codex.
> Date: 2026-04-30 | Session: 3+ | Authors: Kimi K-2.6 + Codex GPT-5
> Canonical protocol. `docs/agent-preflight-protocol.md` and `docs/agent-ultraplan.md` are deep-reference archives.
> Companion docs: `AGENTS.md`, `CLAUDE.md`, `engineering-harness/HERMES_TRUST_HARNESS.md`

---

## 1 · Agent Bootstrap Checklist (DO FIRST — Every Session)

```
□ 1. Read STATUS.md (live state)
□ 2. Read TASKS.md (active / waiting / done)
□ 3. Read this protocol (PRE_FLIGHT_PROTOCOL.md)
□ 4. git status -sb           → preserve unrelated user work
□ 5. git log --oneline -10    → know recent history
□ 6. git branch --show-current → confirm you're on expected branch
□ 7. pnpm.cmd --filter @elbtronika/web typecheck → baseline check before edits
□ 8. Identify trust boundary → auth? payment? deletion? public claim?
□ 9. Write scoped task list with ONE in-progress item
□ 10. Set TodoList → track progress visibly
```

**Never skip steps 1–6.** Step 7 prevents "typecheck red after edits" surprises. If baseline is already red, log the failing command and continue only with a narrower owned-file scope. Step 8 prevents security incidents.

---

## 2 · Tool Calling Matrix

### 2.0 Tool Name Adapter

Different agents expose the same action under different tool names. Use the
intent first, then the local platform's tool.

| Intent | Codex in this workspace | Claude/Kimi style | Copilot style |
|--------|--------------------------|-------------------|---------------|
| Read known file | `Get-Content`, `rg`, `rg --files` via shell | `ReadFile` | Workspace file read |
| Search repo | `rg` via shell | `Grep` / `Glob` | VS Code search |
| Edit existing file | `apply_patch` | `StrReplaceFile` / `Edit` | Copilot workspace edit |
| Create file | `apply_patch` add file | `WriteFile` | Copilot workspace edit |
| Run command | `shell_command` | `Shell` / Desktop Commander | VS Code terminal |
| Track plan | `update_plan` | `SetTodoList` | Chat checklist |
| Browser test | `playwright` skill/tool | Playwright skill/MCP | Local Playwright command |
| Web facts | `web.run` with official/primary sources | `SearchWeb` / `FetchURL` | Browser/search |

Use subagents only when the active platform supports them and Lou explicitly
asked for parallel/delegated agent work. Otherwise do the research locally.

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

> Environment: Windows, repo at `D:\Elbtronika\Elbtonika`.
> Shell behavior depends on the agent platform. Pick the adapter below.

### 3.0 Shell Adapter By Agent

| Platform | Best shell rule | Why |
|----------|-----------------|-----|
| Codex `shell_command` | PowerShell is OK for reads/git; use `pnpm.cmd` for package scripts | Current Codex runs fresh PowerShell calls |
| Claude Desktop Commander | `cmd` only | Historical pnpm.ps1 and quoting failures |
| Copilot terminal | PowerShell OK with `.cmd` suffix; use repo root as cwd | VS Code terminal is user-visible |
| Workspace bash | Test with `echo ok`; use only if mounted and paths verified | Mount path changes per session |

Universal rule: never assume shell state persists between tool calls.

### 3.1 PowerShell vs CMD

| Context | Command | Works? |
|---------|---------|--------|
| pnpm | `pnpm.cmd install` | ✅ Always use `.cmd` suffix |
| pnpm | `pnpm install` | ❌ Fails (Windows Store trap) |
| npx | `npx.cmd <pkg>` | ✅ Always use `.cmd` suffix |
| Git commit | `git commit -m "msg"` | ✅ Only for simple ASCII one-line messages |
| Git commit (multiline) | `git commit -F file.txt` | ✅ For complex messages |
| Combined commands | `cmd1; cmd2; cmd3` | ✅ Semicolon chaining |
| Conditional | `cmd1; if ($?) { cmd2 }` | ✅ PowerShell syntax |
| Unix `&&` / `\|\|` | `cmd1 && cmd2` | ❌ In PowerShell use `; if ($?) { ... }`; in cmd it is OK |

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
[Prompt] <one-line user intent or run summary>
[Scope] <phase/wave plus owned files and forbidden files>
[Action] <what changed, what was researched, or what was planned>
[Verify] <command + result, or "not run: reason">
[Next] <one concrete next action or next agent prompt>
```

Legacy Session 3 logs may use a heading plus five bullets. New logs use the
exact five-line block above. No heading inside the block.

**Example:**
```markdown
[Prompt] Demo artwork generation
[Scope] Phase 18 assets; owned apps/web/public/demo/artworks; forbidden runtime code
[Action] Generated 8 demo artwork PNGs with Playwright Canvas 2D
[Verify] image files created; no test run because asset-only
[Next] Lou reviews artwork quality before Sanity upload
```

### 4.2 Naming Convention

| Component | Format | Example |
|-----------|--------|---------|
| Run-Log file | `YYYY-MM-DD_<Agent>_<Model>-RunNN.md` | `2026-04-30_Codex_GPT5-Run01.md` |
| Agent name | Codename used in session | `kimi`, `sonnet`, `gpt`, `codex`, `opus` |
| Model | Version identifier without unsafe path chars | `K26`, `Sonnet46`, `GPT54`, `GPT5`, `Opus48` |
| Run number | Sequential per agent/model/day | `Run01`, `Run02`, ... |

### 4.3 Commit Gate
- Do not auto-commit unless Lou explicitly authorizes commits for the session.
- If commits are authorized, commit each completed implementation slice separately.
- Docs-only planning can remain uncommitted until Lou asks to commit.
- Push after authorized commits to prevent stash/checkout conflicts.

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

**Rule:** Read a skill's `SKILL.md` BEFORE using it. Skills contain exact instructions, scripts, and templates. Do not load skills just to be thorough.

### 5.1 Connector Use Order

Use connectors after local truth is known:

1. Git/local docs first: code, migrations, ADRs, STATUS, TASKS.
2. Supabase/Stripe/Netlify next when runtime state is required.
3. Notion/Airtable/Drive last for publishing or syncing decisions.
4. Gmail/Calendar only for Lou-facing admin tasks.

Never let external docs override current code without verification.

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
pnpm.cmd --filter @elbtronika/web typecheck   # MUST be green
pnpm.cmd --filter @elbtronika/web test        # MUST pass
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
pnpm.cmd --filter @elbtronika/web typecheck
```

### 9.2 After Any Edits
```bash
# Type safety
pnpm.cmd --filter @elbtronika/web typecheck

# Lint
pnpm.cmd --filter @elbtronika/web lint

# Unit tests
pnpm.cmd --filter @elbtronika/web test

# Specific test file
pnpm.cmd --filter @elbtronika/web vitest run __tests__/path/to/test.ts
```

### 9.3 Before Push
```bash
# Full verification
pnpm.cmd --filter @elbtronika/web typecheck
pnpm.cmd --filter @elbtronika/web test

# Git
git diff --stat          # review scope
git log --oneline -5     # verify commits
```

### 9.4 E2E Test Commands
```bash
# All E2E
pnpm.cmd --filter @elbtronika/web test:e2e

# Specific spec
pnpm.cmd --filter @elbtronika/web test:e2e -- demo-flow.spec.ts

# UI mode
pnpm.cmd --filter @elbtronika/web test:e2e -- --ui
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

## 11 · Per-Model Routing Matrix (Lessons from 7-Day Co-Work)

Empirisch ermittelte Stärken aus Sessions 1–3:

| Model | Strong At | Avoid | Best Use |
|---|---|---|---|
| **Opus 4.6/4.7+** | Strategy, ADR-writing, plan version bumps, branch conflict resolution, drift audits, Lou-briefings | Pure code <50 LoC (token-expensive) | Plan v1.X, OPUS_*_HANDOVER, drift correction, escalation responses |
| **Sonnet 4.6** | Architecture refactors, 3D (R3F/WebGPU), audio graph, Trust boundaries, Stripe Connect, Migrations | Long pure-UI sessions (token hungry) | Phase 1, 3, 7-10, 13, 17, complex multi-file edits |
| **GPT 5.4** | UI polish, business logic, content/forms, onboarding flows, microcopy, i18n | Deep architecture decisions | Phase 2, 4-6, 11, 19, profile pages, walkthroughs |
| **Codex 5.3** | SQL migrations, boilerplate, test scaffolding, configs, ADRs from code-reality | Strategic decisions | Phase 14 tests, schema generation, doc runbooks |
| **Kimi K-2.6** | Parallel workstream merging, optimization, visual asset bulk-generation, full test pyramid | Ad-hoc mid-session pivots | Multi-branch consolidation, asset generation, post-merge health checks |

### 11.1 Routing Heuristic
```
Architecture decision unresolved in plan?     → Opus
Code <50 LoC, unambiguous?                    → Sonnet (or current Opus session)
Multi-file refactor / new architectural pkg?  → Sonnet
UI polish, microcopy, i18n, onboarding?       → GPT
Pure boilerplate, schemas, migrations, tests? → Codex
Parallel branches need merging?               → Kimi
3D / Audio / Stripe / Trust-critical work?    → Sonnet (unambiguously)
Drift audit / plan-bump / strategic pivot?    → Opus
```

### 11.2 Branch Naming (canonical)
```
feature/phase-<N>-<short-scope>           ← integration branch
feature/phase-<N>.<sub>-<scope-detail>    ← agent sub-branch (scoped)
feature/<topic>-cleanup                   ← cross-cutting cleanup
hotfix/<issue>                            ← urgent post-launch
```

---

## 12 · MCP Connector Inventory (active on this machine)

All deferred — load via `ToolSearch` before first call.

### 12.1 Project-Critical (used in ELBTRONIKA flows)

| Prefix | Service | Key Tools | Phase Mapping |
|---|---|---|---|
| `mcp__a465fe2f__` | **Stripe** | `create_customer`, `create_product`, `create_payment_link`, `stripe_api_execute`, `search_stripe_documentation`, `retrieve_balance`, `list_payment_intents`, `list_disputes` | Phase 10 (live), Phase 18 (Mock-Connected-Accounts), Phase 20.3 (Account-Setup) |
| `mcp__230328bd__` | **Supabase** | `apply_migration`, `execute_sql`, `list_projects`, `get_advisors`, `generate_typescript_types`, `list_extensions`, `get_logs`, `list_migrations` | Phase 3, 4, 5, 17 (audit), 20.1 (push), 20.4 (gen types) |
| `mcp__d406f111__` | **Netlify** | `netlify-deploy-services-reader/updater`, `netlify-project-services-*`, `get-netlify-coding-context`, `netlify-extension-services-*` | Phase 12, 16, 21 (live deploy) |
| `mcp__2778793c__` | **Notion** | `notion-search`, `notion-create-pages`, `notion-create-database`, `notion-update-page`, `notion-fetch`, `notion-create-comment` | ADR-Sync, project docs |
| `mcp__ec313e43__` | **Google Drive** | `create_file`, `read_file_content`, `download_file_content`, `list_recent_files`, `search_files`, `get_file_permissions`, `copy_file` | Doc-backups, contracts, compliance |
| `mcp__f8417681__` | **Gmail** | `create_draft`, `search_threads`, `get_thread`, `list_labels`, `create_label` | Artist outreach, Lee invitation |
| `mcp__63478716__` | **Google Calendar** | `create_event`, `list_events`, `suggest_time`, `respond_to_event`, `update_event` | Pitch with Lee, lawyer appointments |
| `mcp__Figma__*` + `mcp__4b7b6cf4__*` | **Figma** (two plugins) | `get_design_context`, `get_variable_defs`, `get_screenshot`, `get_metadata`, `create_design_system_rules` | Phase 2 (tokens), Phase 19 (pitch visuals) |
| `mcp__6ec78dc4__` | **Airtable** | `list_bases`, `create_base`, `create_table`, `create_records_for_table`, `search_records` | Artist/DJ pipeline tracking |
| `mcp__b04fab3e__` | **Coda-like Doc** | `doc_create`, `doc_update`, `diagram_create`, `table_create` | Architecture diagrams, system overviews |
| `mcp__ElevenLabs_Agents_MCP_App__` | **ElevenLabs** | `search_voices`, `create_agent`, `get_agent_config` | Voice for AI curation (optional Phase 11) |
| `mcp__Apify__` | **Apify Scraping** | `apify--rag-web-browser`, `search-actors`, `call-actor` | Competitor research, Lighthouse automation |
| `mcp__PDF_Tools_*` / `mcp__pdf-viewer__` | **PDF** | `read_pdf_content`, `extract_to_csv`, `merge_pdfs`, `fill_pdf` | Contract analysis, KYC docs |

### 12.2 Less Project-Relevant
- `mcp__Kubernetes_MCP_Server__*` — not used (Netlify hosting)
- `mcp__PopHIVE_*` — public health, irrelevant
- `mcp__ToolUniverse__*` — meta-tooling

### 12.3 Cowork-Native
| Prefix | Purpose |
|---|---|
| `mcp__cowork__` | `request_cowork_directory`, `create_artifact`, `present_files`, `update_artifact`, `read_widget_context` |
| `mcp__workspace__` | `bash` (Linux sandbox), `web_fetch` |
| `mcp__scheduled-tasks__` | `create_scheduled_task`, `list_scheduled_tasks` |
| `mcp__mcp-registry__` | `search_mcp_registry`, `suggest_connectors`, `list_connectors` |
| `mcp__plugins__` | `list_plugins`, `search_plugins`, `suggest_plugin_install` |
| `mcp__skills__` | `list_skills` |
| `mcp__session_info__` | `list_sessions`, `read_transcript` |
| `mcp__visualize__` | `read_me`, `show_widget` |

### 12.4 Bulk-Load Pattern
```
ToolSearch query="<server-keyword>" max_results=30
```
Examples: `query="supabase"`, `query="stripe"`, `query="claude_in_chrome"`, `query="computer-use"`.

**Never load tools one-by-one.** One `ToolSearch` per server family.

---

## 13 · Domain-Specific Anti-Patterns (Phase Lessons)

### 13.1 Phase 7 — Immersive 3D
| Anti-Pattern | Consequence | Fix |
|---|---|---|
| `useState` in `useFrame` | Re-render storm, FPS crash | Mutable Refs (`useRef`), `zustand` mutate API |
| `<Canvas>` re-mount on route change | WebGPU context loss, multi-second reload | Single `<CanvasRoot />` in root layout, `position: fixed`, `z-index: -1` |
| `EffectComposer` for bloom | TSL gives 10× perf gain | Use `@react-three/postprocessing` with TSL/`RenderPipeline` |
| Geometries/materials new per render | GC pressure, frame drops | `useMemo` everything heavy |
| `Texture` in render loop without `Preload` | Pop-in on first navigation | `<Preload all />` from `@react-three/drei` |
| `require()` inside JSX body (DevStats) | Build break | Next `dynamic({ ssr: false })` or `React.lazy + Suspense` |
| `.js` suffixes in TS imports vs `moduleResolution=bundler` | Build/runtime mismatch | Match imports to tsconfig setting consistently |

### 13.2 Phase 8 — Spatial Audio
| Anti-Pattern | Consequence | Fix |
|---|---|---|
| `AudioContext` instantiated before user gesture | Browser blocks, "suspended" forever | `audioContext.resume()` in entry-overlay click handler; sessionStorage flag |
| `AudioWorklet` for spatial panning | Mobile 128-sample bug → crackling | Native `PannerNode`, no Worklet |
| `createMediaElementSource()` before `MANIFEST_PARSED` | Safari iOS deadlock | Wait for `Hls.Events.MANIFEST_PARSED` |
| `gain.value =` direct | Click/pop artifacts | `gain.setTargetAtTime(target, currentTime, smoothing)` |
| Multi-source without `DynamicsCompressorNode` | Clipping when gains add | Compressor as pre-Destination node |
| Distance fade with linear model | Sounds artificial | Inverse-square: `Gain = refDistance / (refDistance + rolloff × (distance − refDistance))` |
| 60 FPS audio update loop | CPU pressure | 100 ms throttle on proximity-read |
| HLS without Web Worker | Main thread jank | `hls.js` v1.6+ in dedicated worker |

### 13.3 Phase 10 — Stripe Connect
| Anti-Pattern | Consequence | Fix |
|---|---|---|
| Webhook route on `edge runtime` | Raw body destroyed → signature verify fails | `export const runtime = 'nodejs'` explicit |
| Body-parser middleware before signature check | Same problem | Use `await req.text()` for raw body |
| Idempotency on order-id instead of `event.id` | Double transfers possible | `webhook_events` table, atomic insert with `ON CONFLICT DO NOTHING`, key = `event.id` |
| Float math for 60/20/20 split | Rounding errors, lost cents | Integer cent math throughout, use BigInt where needed |
| Transfers without `transfer_group` + `source_transaction` | Untraceable, refund can't reverse | Always set both |
| `new Stripe(process.env.SECRET!)` top-level | Non-null assertion lint, init at import time | Lazy `getStripe()` getter |
| Test secrets and live secrets in same Doppler config | Risk of leak | Separate environments: dev/preview/prd |

### 13.4 Phase 13 — Compliance/DSGVO
| Anti-Pattern | Consequence | Fix |
|---|---|---|
| Spatial tracking opt-out | DSGVO Omnibus 2026 violation | Strict opt-in, default off, `elt-consent` in localStorage + DB log |
| SoundCloud streamed direct from client | IP leak, Schrems II | Reverse proxy `/api/proxy/soundcloud/[id]` via Netlify Edge Function |
| Vitals endpoint without consent header | Tracking violation | Require `x-consent-analytics: true`, return 204 otherwise |
| AI output without audit log | EU AI Act non-compliant | `ai_decisions` insert per Claude/Gemini call |
| AI recommendations without override | High-risk AI classification | "Why?" tooltip + "Reject recommendation" UI |
| Personal data in URL parameters | Logs/referrer leakage | Always POST or session-bound |
| Account deletion without cascade | Orphaned PII | Cascading delete + 10-year anonymized order retention (Buchhaltung) |

### 13.5 Phase 18-19 — Demo-Mode / Pitch
| Anti-Pattern | Consequence | Fix |
|---|---|---|
| Demo content without `isDemo: true` flag | Hard to filter at live-switch | Schema field + Sanity setting + filter at query time |
| Demo banner missing in demo mode | Investor confusion | Conditional render based on `ELT_MODE === 'demo'` |
| Live-mode bugs hidden behind demo flag | Production breaks at switch | Trust boundaries (Hermes Waves) active in demo too |
| Hardcoded mock connected-account IDs | Brittle on Stripe-account rotation | Demo IDs in `apps/web/src/lib/stripe/demo.ts`, sourced from env if needed |

---

## 14 · Strategic Decisions (binding for all agents)

| Decision | Rationale | File |
|---|---|---|
| **Demo-First, Live-Second** | Investor (Lee Hoops) overrides regulatory readiness as launch trigger | `ELBTRONIKA_Architekturplan_v1.2.md` § 1 |
| **ELT_MODE feature flag** | One env var switches demo/staging/live; no code-path duplication | `apps/web/src/lib/env.ts` |
| **Trust Boundaries active in all modes** | Auditability is part of pitch value | `engineering-harness/HERMES_TRUST_HARNESS.md` |
| **Single Canvas Overlay** | Mode-switches via camera/shader interpolation, never canvas remount | `docs/adr/0007-immersive-architektur.md` |
| **Privacy by Architecture** | Edge-proxy all third-party requests (SoundCloud, Stripe, AI) | `docs/adr/0013-compliance-architektur.md` |
| **Separate Charges and Transfers** | Tripartite split (60/20/20) with idempotent webhook-driven transfers | `docs/adr/0010-payment-split.md` |
| **i18n DE-primary, EN-secondary** | Legal docs DE binding, EN as service | `ELBTRONIKA_Architekturplan_v1.1.md` § 4.5 |
| **Claude-First AI** | Anthropic Sonnet 4.6 / Opus 4.6+ as primary curation model | `docs/adr/0011-ai-architektur.md` |
| **pnpm.cmd + Doppler + Biome v2** | Windows-stable tooling chain | section 3 above |

---

## 15 · Anti-Hallucination Rules (zero tolerance)

```
1. Versions: never guess. WebSearch or open package.json.
2. CLI flags: never guess. <cmd> --help or docs.
3. Tool schemas: never call without ToolSearch first.
4. File existence: ls/Read first, never assume.
5. Branch state: git status -sb first, never assume.
6. Plan content: read the plan file, never argue from memory.
7. Tests green: run the command, never claim.
8. ENV vars: doppler secrets list or docs, never invent.
9. Schemas: Read packages/contracts first, never extend blind.
10. ADRs: docs/adr/README.md first, never write duplicate.
11. Phase status: STATUS.md is truth, never assume from chat history.
12. Connected accounts/IDs: Stripe MCP `list` before claiming exists.
```

If unsure: STOP, ask Lou with `Frage X: ...` format.

---

## 16 · Drift-Audit Routine (when something feels off)

Run this when STATUS, branch, or plan don't match what an agent claims:

```
1. STOP all writes. No commits.
2. git status -sb && git log --oneline -20
3. git tag --sort=-creatordate | head -10
4. gh pr list --state open
5. cat STATUS.md → does phase column match git reality?
6. cat TASKS.md → are "Done" items actually done on main?
7. Read latest run-logs in memory/runs/
8. Compare:
   - Plan version (v1.X)  vs.  STATUS reality
   - Branch tags          vs.  Phase numbering
   - Run-logs             vs.  Code state
9. List drift findings as markdown table for Lou
10. Opus produces patch plan (STATUS update + plan-version bump)
11. Agents resume with corrected context
```

**Never proceed with edits if drift is unresolved.** Drift compounds.

---

## Quick Reference Card

```
BOOT:    PRE_FLIGHT (this) → STATUS → TASKS → Plan → Handover → git status → typecheck
WIN:     Section 17 — PowerShell .cmd suffix, ExecutionPolicy, Supabase/Doppler install paths
LOAD:    ToolSearch query="<server>" max_results=30  (bulk, not one-by-one)
EDIT:    ReadFile/Glob/Grep → explore if >3 searches → edit → typecheck slice → test slice
COMMIT:  only with Lou approval → git restore --staged . → git add <scope> → git commit -F D:\msg.txt → git push
LOG:     memory/runs/YYYY-MM-DD_<Agent>_<Model>-Run<NN>.md (5 EXACT lines)
ROUTE:   strategy→Opus | architecture→Sonnet | UI→GPT | boilerplate→Codex | merge→Kimi
HANDOFF: Next-Prompt-Block + STATUS update + TASKS update + Run-Log finalized
DRIFT:   stop → git/STATUS audit → list findings → Opus patches → resume
ASK:     unsure → STOP → "Frage X: ..." to Lou (not to subagent)
```

---

## 17 · Windows-Specific Deep Reference (This Machine)

> Computer: Windows 11, PowerShell 5.1+, repo at `D:\Elbtronika\Elbtonika`
> User: `Moin` (`C:\Users\Moin`)

### 17.1 PowerShell Execution Policy Blockers

**Problem:** `npm` commands fail with PSSecurityException:
```
npm.ps1 cannot be loaded because running scripts is disabled on this system
```

**Root cause:** PowerShell ExecutionPolicy prevents running `.ps1` scripts from `C:\Program Files\nodejs\`.

**Solutions (in order of preference):**

| Approach | Command | When to Use |
|----------|---------|-------------|
| **A — Use `.cmd` suffix** | `npm.cmd install`, `pnpm.cmd install` | **Always** — this is the canonical fix |
| **B — Use `cmd.exe` directly** | `cmd /c "npm install"` | When `.cmd` also fails |
| **C — Bypass for one call** | `powershell -ExecutionPolicy Bypass -Command "npm install"` | Emergency only |
| **D — Change policy** (requires admin) | `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` | One-time fix, ask Lou first |

**Never use:** `npm install` (without `.cmd`) in PowerShell — triggers Windows Store trap.

### 17.2 Supabase CLI on Windows

**The npm package `supabase` does NOT contain Windows binaries.** Installing via `pnpm add -D supabase` only adds JS wrappers.

**Correct installation:**
```powershell
# Option A: winget (preferred)
winget install Supabase.CLI

# Option B: Scoop
scoop install supabase

# Option C: Manual download
# https://github.com/supabase/cli/releases/latest
# Download `supabase_windows_amd64.tar.gz`
# Extract to `C:\Users\Moin\bin\` or `%LOCALAPPDATA%\Microsoft\WindowsApps\`
```

**Verify:** `supabase --version` should return `2.x.x` immediately.

### 17.3 Doppler CLI on Windows

```powershell
# winget
winget install Doppler.doppler

# Verify
doppler --version
doppler login  # opens browser auth
```

### 17.4 Playwright on This Machine

**Location:** Playwright is installed as a pnpm workspace devDependency via `@playwright/test@1.59.1`.
**Actual path:** `node_modules/.pnpm/@playwright+test@1.59.1/node_modules/playwright`

**Require pattern:**
```javascript
const { createRequire } = require('module');
const path = require('path');
const playwrightPath = path.resolve(__dirname, '../node_modules/.pnpm/@playwright+test@1.59.1/node_modules/playwright');
const requirePlaywright = createRequire(playwrightPath + '/package.json');
const { chromium } = requirePlaywright('playwright');
```

**Canvas rendering quirk:** When using `ctx.drawImage(canvas, ...)` (self-referencing canvas), Playwright screenshots produce black images (5KB). **Fix:** Use a fresh `browser.newContext()` per image, or avoid `drawImage(canvas, ...)` entirely.

**Artwork generation pipeline** (proven working):
1. Create HTML with `<canvas>` + drawing script
2. Open with Playwright page
3. `page.waitForFunction(() => window.__done === true)`
4. `page.waitForTimeout(100)` — extra render tick
5. `canvas.screenshot({ path: '...', type: 'png' })`
6. `await context.close()` — fresh context per image

### 17.5 pnpm Workspace Specifics

```powershell
# Root-level devDependency (affects all packages)
pnpm add -D -w <package>

# Package-specific
pnpm --filter @elbtronika/web add <package>

# Built dependencies (must be in root package.json)
"pnpm": {
  "onlyBuiltDependencies": ["esbuild", "sharp"]
}
```

**Post-install hook:** After adding any dependency, verify lockfile:
```powershell
git diff pnpm-lock.yaml | Select-String "supabase|doppler|playwright"
```

### 17.6 Git on Windows — Edge Cases

| Situation | Problem | Fix |
|-----------|---------|-----|
| Multiline commit message | `git commit -m "line1
line2"` fails | Write to file: `Set-Content D:\msg.txt "line1`nline2"`; `git commit -F D:\msg.txt` |
| Line endings | CRLF vs LF conflicts | `.gitattributes` enforces LF; trust it |
| Bracket dirs `[locale]` | `mkdir [locale]` fails in PowerShell | `New-Item -ItemType Directory -Path "apps/web/app/[locale]"` |
| Long paths | `node_modules` depth exceeds 260 chars | Windows 11 has this enabled by default; if not: `git config core.longpaths true` |
| `git stash` + checkout | Conflicts when files added on both branches | **Always commit before switching** |
| Force push | `--force` is dangerous | Use `--force-with-lease` |

### 17.7 Commit Message File Pattern

When commit message contains quotes, special chars, or German umlauts:

```powershell
# Write to temp file
$msg = @"
docs(scope): subject line

Body paragraph 1.
Body paragraph 2 with "quotes" and ümläuts.
"@
Set-Content -Path "D:\temp_commit_msg.txt" -Value $msg -Encoding UTF8
git commit -F "D:\temp_commit_msg.txt"
Remove-Item "D:\temp_commit_msg.txt"
```

This avoids ALL PowerShell quoting issues.

---

## Changelog

| Date | Author | What |
|---|---|---|
| 2026-04-30 | Kimi K-2.6 + Codex GPT-5 | Initial protocol (sections 1–10) |
| 2026-04-30 | Opus 4.6 | Sections 11–16 added: per-model routing, MCP inventory, domain anti-patterns, strategic decisions, anti-hallucination rules, drift-audit routine |
| 2026-04-30 | Kimi K-2.6 | Section 17 added: Windows-specific deep reference — PowerShell execution policy, Supabase/Doppler CLI install, Playwright canvas quirk, pnpm workspace, Git edge cases, commit message file pattern |
