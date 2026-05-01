# VS Code GitHub Copilot Agent — Pre-Flight Protocol

<!-- markdownlint-disable MD010 MD022 MD031 MD032 MD040 MD056 MD058 MD060 -->

> **Model:** Claude Sonnet 4.6 (as of 2026-05-01) — `GitHub Copilot` agent in VS Code.
> **Scope:** Windows 11, PowerShell 5.1, pnpm monorepo at `D:\Elbtronika\Elbtonika`.
> **Purpose:** Captures all tool mechanics, skill routing, gotchas, and best practices specific to
> the VS Code Copilot agent surface — distinct from Claude Code, Codex, or Kimi environments.
> **Read before first tool call. Every session.**

---

## 0. First 90 Seconds

```powershell
# 1. Verify working directory (workspace root != monorepo root)
#    Workspace:   D:\Elbtronika
#    Monorepo:    D:\Elbtronika\Elbtonika   ← all commands run here
cd D:\Elbtronika\Elbtonika

# 2. Orient
git branch --show-current
git status --short

# 3. Read active context
#    AGENTS.md → project architecture + conventions
#    STATUS.md → live phase + branch state
#    CLAUDE.md → glossary, stack, Lou's preferences
```

> **Critical:** `D:\Elbtronika` is the VS Code workspace root. The monorepo is one level deeper at
> `D:\Elbtronika\Elbtonika`. File tools must use absolute paths pointing to `Elbtonika\`.

---

## 1. Tool Taxonomy

The Copilot agent in VS Code has **three tiers** of tools:

| Tier | Load Method | Examples |
|------|-------------|---------|
| **Built-in (always available)** | Just call them | `read_file`, `replace_string_in_file`, `grep_search`, `run_in_terminal`, `semantic_search`, `list_dir`, `create_file`, `file_search`, `get_errors`, `manage_todo_list`, `memory`, `runSubagent`, `search_subagent` |
| **Deferred (must load first)** | `tool_search` → then call | GitHub PR tools, Azure tools, MCP tools, Playwright, notebook tools, debug tools |
| **Skills (prompt-injected)** | `read_file` on skill SKILL.md, then execute | `init`, `code-review`, `frontend-design`, `playwright`, `research`, `plan`, `graphify` |

**Rule:** Call `tool_search` with a natural-language description before using any deferred tool.
Do NOT call a deferred tool directly — it will silently fail or return an error.

---

## 2. Built-in Tool Reference

### `read_file`
- **Always use absolute path** — relative paths fail silently
- **Read large sections at once** — prefer 100+ line chunks over many 20-line reads
- **Parallel**: Read multiple files in the same response block (independent reads only)
- **Binary/image**: Use `view_image` for `.png/.jpg/.webp/.gif`, not `read_file`

```
Good:  read_file("d:\\Elbtronika\\Elbtonika\\package.json", 1, 80)
Bad:   read_file("package.json", 1, 80)   ← relative path fails
```

### `replace_string_in_file` / `multi_replace_string_in_file`
- **Always include 3–5 lines of unchanged context** before and after the target string
- **`multi_replace_string_in_file`** for multiple independent edits — faster and safer than sequential calls
- If `oldString` does not match exactly → re-read the file first, then retry
- Never use PowerShell `>` / `echo` to write code files — creates UTF-16/BOM corruption

### `create_file`
- Only for **new files** — never for editing existing ones
- Will fail if file already exists (use `replace_string_in_file` for edits)
- Creates parent directories automatically

### `grep_search`
- Prefer over `run_in_terminal` with `rg` or `grep` — faster, structured results
- Use `isRegexp: true` for patterns; `false` for literal text
- `includePattern` to scope to a folder or file type (e.g., `"apps/web/**"`)
- Use alternation `word1|word2|word3` to batch multiple searches into one call

### `file_search`
- For finding files by name pattern (glob) — not content
- Use when you know the filename but not the path
- Do not search `node_modules/**` — too expensive

### `semantic_search`
- For concept-level searches ("where is the Stripe webhook handler?")
- Call once with a rich query; if results overlap with earlier searches you have enough context
- Do NOT call in parallel with itself

### `list_dir`
- Faster than `run_in_terminal` + `Get-ChildItem` for directory inspection
- Returns names only (trailing `/` = folder)
- Use for orientation before reading files

### `get_errors`
- Returns compile/lint errors as the user sees them in VS Code
- Always call after editing a file to validate the change
- Accepts file paths or folder paths

### `run_in_terminal`
- **Mode `sync`**: waits for completion, returns output. Use for most commands.
- **Mode `async`**: returns immediately with a terminal ID. Use for servers / long builds.
- **Windows**: use `;` not `&&` to chain commands
- **Persistent**: cwd and env vars persist within the same terminal between calls
- **`.cmd` suffix required**: `pnpm.cmd`, `npx.cmd`, `biome.cmd`, `npm.cmd`
- After async, use `get_terminal_output(id)` to poll; use `kill_terminal(id)` to clean up

```powershell
# Good
pnpm.cmd --filter @elbtronika/web test -- --run
node_modules\.bin\biome.cmd check apps/web/src/lib/env.ts

# Bad (will fail on Windows)
pnpm test
npx biome check .
```

### `manage_todo_list`
- Use for **multi-step tasks** with 3+ steps
- Mark `in-progress` before starting each step; `completed` immediately after
- Only ONE todo can be `in-progress` at a time
- Skip for trivial single-step work

### `memory` tool
- **`/memories/`** — user-scoped, persists across all workspaces and sessions
- **`/memories/session/`** — current conversation only, cleared after
- **`/memories/repo/`** — repo-scoped, `create` command only
- Read `view` command to check what exists before `create` (avoid duplicates)
- Keep entries brief — user memory auto-loads into context

---

## 3. Deferred Tool Loading

```
tool_search("github pull requests issues")   → loads github-pull-request_* tools
tool_search("playwright browser automation") → loads mcp_microsoft_pla_browser_* tools
tool_search("azure resources")               → loads mcp_azure_* tools
tool_search("git operations")                → loads mcp_gitkraken_* tools
tool_search("notebook jupyter")              → loads notebook tools
```

Load once per session — do NOT call `tool_search` again for tools already returned.

---

## 4. Subagent Routing

### `runSubagent` (named agents)
| Agent | When to use |
|-------|-------------|
| `Explore` | Read-only codebase Q&A, architecture understanding. Specify `quick/medium/thorough`. |
| `DataAnalysisExpert` | Analyzing data files, comparing datasets |
| `AIAgentExpert` | Microsoft Foundry, agent framework, Azure AI workflows |
| `DeployToAzure` | Azure deployment |
| `Optimization Agent` | Task scoring, model routing, resource budgets |

### `search_subagent` (fast codebase exploration)
- Use instead of manually chaining `grep_search` + `file_search` + `read_file`
- Safe to call in parallel for independent topics
- Returns file paths and relevant snippets — saves main agent context

### `vscode_listCodeUsages` / `vscode_renameSymbol`
- Language-server-aware symbol operations — more precise than `grep_search` for symbols
- Requires: symbol name + a file where it appears + the exact `lineContent` substring
- If it fails → retry with corrected `lineContent` (must be exact text from file)

---

## 5. Skill Routing

Load skills by reading their `SKILL.md` with `read_file`, then execute the instructions.

| Skill | Trigger | File |
|-------|---------|------|
| `init` | Generate / improve `AGENTS.md` | `c:\Users\Moin\.agents\skills\init\SKILL.md` |
| `code-review` | Review a diff, commits, or git range | `c:\Users\Moin\.agents\skills\code-review\SKILL.md` |
| `comprehensive-review` | Full PR review (costly — only when named explicitly) | `c:\Users\Moin\.agents\skills\comprehensive-review\SKILL.md` |
| `cross-review` | Review with a specified model | `c:\Users\Moin\.agents\skills\cross-review\SKILL.md` |
| `frontend-design` | UI mockups, landing pages, dashboards | `c:\Users\Moin\.agents\skills\frontend-design\SKILL.md` |
| `playwright` | Browser automation, screenshots, flow testing | `c:\Users\Moin\.agents\skills\playwright\SKILL.md` |
| `research` | Read-only codebase exploration subagent | `c:\Users\Moin\.agents\skills\research\SKILL.md` |
| `plan` | Architecture planning before coding | `c:\Users\Moin\.agents\skills\plan\SKILL.md` |
| `graphify` | Any input → knowledge graph → HTML/JSON | `c:\Users\Moin\.copilot\skills\graphify\SKILL.md` |
| `skill-creator` | Create/modify/eval skills | `c:\Users\Moin\.agents\skills\skill-creator\SKILL.md` |
| `agent-customization` | `.instructions.md`, `.prompt.md`, `AGENTS.md`, agent config | VS Code extension assets |

**Rule:** Never invoke a skill without reading its `SKILL.md` first in this session.

---

## 6. Windows-Specific Rules (Copilot Surface)

| # | Pattern | Symptom | Fix |
|---|---------|---------|-----|
| 1 | **Workspace ≠ Monorepo root** | Files not found at expected paths | Prefix all paths with `d:\Elbtronika\Elbtonika\` |
| 2 | **Relative paths in tools** | `read_file("package.json")` → file not found | Always absolute paths |
| 3 | **`.cmd` suffix missing** | `pnpm not found` in terminal | `pnpm.cmd`, `npx.cmd`, `biome.cmd` |
| 4 | **PowerShell `>` creates UTF-16** | File content corrupted / Chinese characters | Use `create_file` or `replace_string_in_file` |
| 5 | **Shell chaining** | `&&` fails in PowerShell | Use `;` between commands |
| 6 | **Turbo OOM** | `Allocation failed` on typecheck/build | Add `--concurrency=2` to turbo commands |
| 7 | **Vitest `@/` alias in tests** | Import fails in test files | Use relative paths in tests |
| 8 | **Bracket dirs** | `[locale]`, `(checkout)` paths break shell glob | Use `fs.mkdirSync` in Node, not shell |
| 9 | **Git multi-line commit** | Message truncated | `git commit -F D:\msg.txt` |
| 10 | **Branch after checkout** | Still on old branch | Always `git branch --show-current` after checkout |
| 11 | **Merge conflict markers** | `<<<<<<< HEAD` in source files → RolldownError | After any merge: `grep_search("^<{7}", isRegexp:true)` |
| 12 | **Case-insensitive FS duplicates** | Both `DemoBanner.tsx` and `demo-banner.tsx` exist | Keep only PascalCase version |

---

## 7. Parallelism Rules

**DO parallelize (safe):**
- Multiple `read_file` calls on different files
- Multiple `search_subagent` calls on independent topics
- `runSubagent` agents with no file-write overlap
- `get_errors` on multiple files
- `list_dir` across multiple directories

**DO NOT parallelize:**
- `semantic_search` with itself
- `run_in_terminal` calls (one at a time, wait for output)
- Multiple `replace_string_in_file` on the **same** file (use `multi_replace_string_in_file`)
- Any write operations on overlapping files

---

## 8. Connector Map (Deferred — load via `tool_search`)

### GitHub (via `github-pull-request` plugin)
```
github-pull-request_doSearch          → search issues/PRs
github-pull-request_pullRequestStatusChecks  → CI/CD status
github-pull-request_create_pull_request     → open PR
github-pull-request_resolveReviewThread     → resolve comment
```
Load with: `tool_search("github pull request issues search")`

### GitKraken / GitLens (via `mcp_gitkraken`)
```
mcp_gitkraken_git_status    → git status
mcp_gitkraken_git_log_or_diff  → log/diff
mcp_gitkraken_git_add_or_commit → stage + commit
mcp_gitkraken_git_push      → push
mcp_gitkraken_git_branch    → branch ops
mcp_gitkraken_gitlens_launchpad → PR/issue dashboard
```
Load with: `tool_search("git operations gitkraken")`

### Playwright / Browser (via `mcp_microsoft_pla`)
```
mcp_microsoft_pla_browser_navigate    → open URL
mcp_microsoft_pla_browser_snapshot    → accessibility tree
mcp_microsoft_pla_browser_take_screenshot → screenshot
mcp_microsoft_pla_browser_fill_form   → form fill
mcp_microsoft_pla_browser_evaluate    → JS eval in page
```
Load with: `tool_search("playwright browser automation screenshot")`

### Azure (via `mcp_azure_mcp`)
- Load specific tool: `tool_search("azure <service>")` e.g. `"azure functions"`, `"azure storage"`
- Always use `mcp_azure_mcp_get_azure_bestpractices` before generating Azure code

### Pylance / Python (via `mcp_pylance`)
```
mcp_pylance_mcp_s_pylanceSyntaxErrors → check Python syntax
mcp_pylance_mcp_s_pylanceImports      → analyze imports
mcp_pylance_mcp_s_pylanceDocString    → docstring lookup
```
Load with: `tool_search("python pylance")`

---

## 9. Memory Discipline

Every prompt that produces durable output gets a 5-line run log:

**Path:** `memory/runs/YYYY-MM-DD_Copilot_Sonnet46-RunNN.md`
(Replace `Sonnet46` with actual model; `NN` = sequential run number for that model in that day)

**Format (exactly 5 bullets):**
```markdown
- **Datum:** YYYY-MM-DD
- **Agent/Model:** GitHub Copilot / Claude Sonnet 4.6
- **Task:** One line — what was asked
- **Outcome:** One line — what changed or was decided
- **Lesson:** One line — the reusable harness lesson
```

**Naming examples:**
```
2026-05-01_Copilot_Sonnet46-Run01.md   ← this session
2026-05-01_Copilot_Sonnet46-Run02.md   ← next Copilot session same day
2026-05-01_Copilot_Opus4-Run01.md      ← if model changes to Opus
```

**Never omit the run log** — it is the Engineering Harness audit trail. Without it you lose:
- Model comparison data (Sonnet vs Opus vs GPT-5 per task type)
- Lesson accumulation across agents
- Handoff continuity

---

## 10. Implementation Loop (Copilot Surface)

1. **Orient** — `list_dir`, `read_file` AGENTS.md + STATUS.md (parallel)
2. **Plan** — `manage_todo_list` if 3+ steps
3. **Search before editing** — `grep_search` or `search_subagent` to find exact file/line
4. **Read before writing** — `read_file` on target file with enough context (3–5 lines around change)
5. **Edit** — `multi_replace_string_in_file` for multiple changes in one shot
6. **Validate** — `get_errors` on changed files; `run_in_terminal` narrowest passing command
7. **Broaden** — lint + typecheck only if shared contracts changed
8. **Commit** — only when green and explicitly requested by user
9. **Run log** — write `memory/runs/` entry before session ends

### 10.1 ML Pipeline Deep-Search Loop (Front + Back + Data)

Use this loop for any task that says optimize AI/ML, matching, recommendations, or pipeline health.

1. **Map runtime entry points**
	- Search API routes first: `app/api/flow/*`, `app/api/ai/*`
	- Then map packages: `packages/flow`, `packages/ai`, `packages/agent`
2. **Classify data source quality**
	- `measured` = derived from real input signals
	- `simulated` = synthetic/dummy/random fallback
	- `fallback-only` = no DB feature rows used
3. **Detect optimization gaps**
	- Nondeterministic simulation (`Math.random`) in API responses
	- Feature-table rows ignored while hardcoded defaults are used
	- Vector-dimension mismatch and NaN-prone similarity math
4. **Patch highest-impact gap first**
	- Deterministic simulation seed from stable ID
	- Use DB feature tables before fallback defaults
	- Guard cosine/vector operations against incompatible dimensions
5. **Expose provenance in response payload**
	- Return fields like `audioSource`, `artworkFeaturesSource`
6. **Validate narrowly**
	- Flow package tests + targeted typecheck on changed slice
	- Avoid whole-monorepo test runs unless contract-level changes were made

### 10.2 Browser Harness Verification Loop

When user asks to harness with browser/tool mechanism:

1. Load browser tools (deferred) via tool discovery.
2. Run one scripted pass for happy path.
3. Run one negative pass (missing auth/forbidden state).
4. Capture what failed and map each failure to a protocol rule in this file.
5. Update quick-recovery table with concrete symptom → exact command fix.

---

## 11. What to Avoid

- **Do not** use relative file paths in any tool call — always absolute
- **Do not** write files via PowerShell `>` or `echo` — use `create_file` / `replace_string_in_file`
- **Do not** call deferred tools without first loading via `tool_search`
- **Do not** call `semantic_search` more than once if results overlap — you have enough context
- **Do not** run `pnpm test` (full suite) — use filtered `--filter @elbtronika/web test -- --run` to avoid OOM
- **Do not** add `css.linter.rules` to `biome.json` — unknown key in Biome v2
- **Do not** leave `expect(true).toBe(true)` placeholder tests
- **Do not** use `@/` import aliases in Vitest test files — use relative paths
- **Do not** commit or push without explicit user request
- **Do not** make Stripe / Supabase writes / account deletion side effects without human approval
- **Do not** skip the run log — it breaks harness continuity

---

## 12. Quick Recovery Table

| Symptom | Action |
|---------|--------|
| `read_file` returns "file not found" | Check path — add `d:\Elbtronika\Elbtonika\` prefix |
| `replace_string_in_file` fails to match | Re-read file, copy exact whitespace/indentation |
| Deferred tool returns error | Run `tool_search` first, then retry |
| `pnpm not found` in terminal | Use `pnpm.cmd` |
| Turbo OOM / allocation failed | Add `--concurrency=2` |
| Merge conflict markers in source | `grep_search("^<{7}|^={7}|^>{7}", isRegexp:true)` |
| Wrong branch after checkout | `run_in_terminal("git branch --show-current")` |
| Lint too slow | `node_modules\.bin\biome.cmd check <specific-file>` |
| Missing i18n keys at runtime | Add key to both `messages/de.json` and `messages/en.json` |
| Test file seems gone | `run_in_terminal("git log --all --full-history -- <path>")` |
| ML scores change every call in demo mode | Replace direct `Math.random` with deterministic seeded RNG by resource id |
| Match API ignores stored feature rows | Query `artwork_features` by ids, then fallback only for missing rows |
| Similarity score becomes NaN or unstable | Guard vector length mismatch and return safe default (0) |
| `afterEach` is not found in test file | Import lifecycle hooks from vitest (`import { afterEach, ... } from "vitest"`) |
| TS2532 on fixed array index access | Use optional access (`arr.at(-1)?.x`) or assert bounds before dereference |

---

## 13. Copilot vs Other Agents — Capability Differences

| Capability | Copilot (this protocol) | Claude Code / Kimi | Codex / GPT-5 |
|------------|------------------------|---------------------|---------------|
| File read/write tool | `read_file`, `replace_string_in_file`, `create_file` | `ReadFile`, `WriteFile`, `StrReplaceFile` | `apply_patch`, shell `cat`/`tee` |
| Shell | `run_in_terminal` (persistent terminal) | `Shell` (fresh per call) | `Shell` (fresh per call) |
| Deferred tools | via `tool_search` | N/A — all tools always loaded | N/A |
| Skills | `read_file` on SKILL.md | `/skill` commands | N/A |
| Subagents | `runSubagent`, `search_subagent` | `Agent` (explore/coder/plan) | N/A |
| Memory | `memory` tool with scopes | Files only | Files only |
| Browser | deferred `mcp_microsoft_pla_*` | N/A unless Playwright skill | N/A |
| GitHub native | deferred `github-pull-request_*` | N/A | GitHub CLI via shell |
| Symbol rename | `vscode_renameSymbol` (LSP-aware) | Text replace only | Text replace only |
| Git operations | deferred `mcp_gitkraken_*` | Shell git | Shell git |

**Key implication:** On this surface, never assume a tool is available — check the tier table (Section 1) first.

---

_Last updated: 2026-05-01 | Session: Copilot / Claude Sonnet 4.6 Run-02 | Author: GitHub Copilot_
_Companion docs: `PRE_FLIGHT_PROTOCOL.md` (Windows patterns), `ULTRAPLAN_AGENT_PREFLIGHT.md` (implementation loop)_

<!-- markdownlint-enable MD010 MD022 MD031 MD032 MD040 MD056 MD058 MD060 -->
