# Agent Pre-Flight Protocol — ELBTRONIKA Cowork

> **When to read this:** Start of every new chat session before touching code or tools.
> Written from real pain in Phase 1–4. Each entry has a root cause.
> *Last updated: 2026-04-29 — Phase 5 complete (Content Model & CMS Integration)*

---

## 0. Session Start — Hard Checklist

Run top-to-bottom before any code or tool call:

```
[ ] 1. Read CLAUDE.md → project context, phase status, known terms
[ ] 2. Read this file (agent-preflight-protocol.md) → tool rules
[ ] 3. Test workspace bash: mcp__workspace__bash "echo ok"
        → available? use it (faster). Unavailable? Desktop Commander.
[ ] 4. Test Chrome: mcp__Claude_in_Chrome__list_connected_browsers
        → empty? use gh CLI + Desktop Commander instead
[ ] 5. Load deferred tools BULK (not one by one — see §10)
[ ] 6. CI check: gh run list --repo DiggAiHH/elbtronika --limit 3
[ ] 7. Caveman mode ON — terse, no fluff, technical exact
[ ] 8. Check task list (TaskList) for open/in_progress items
```

---

## 1. Shell — ALWAYS cmd, NEVER PowerShell

**Machine:** Windows 10 (19045.5917) · User: Moin · D:\Elbtronika\Elbtonika

```
RULE: shell: "cmd"  — every Desktop Commander call, always.
WHY:  PowerShell execution policy blocks pnpm.ps1
      && chaining fails in PowerShell
      git -m "multi word" breaks in PowerShell
```

```
✅  start_process("cd /d D:\Elbtronika\Elbtonika && pnpm typecheck", shell:"cmd")
❌  start_process("pnpm ...", shell:"powershell")
❌  start_process("powershell", ...)
```

---

## 2. Desktop Commander — Proven Call Patterns

### Pattern A: Direct command in start_process (PREFERRED in Phase 2)

```
start_process("cd /d D:\path && command", shell:"cmd", timeout_ms:N)
```

✅ Works. Faster than interact_with_process chain.  
❌ Fails if command contains colons after label (`:` in git commit msg, etc.)  
Use write_file for messages before git commit.

### Pattern B: Multi-step chain (Phase 1 original)

```
1. start_process("cmd", shell:"cmd", timeout_ms:5000)   → get PID
2. interact_with_process(pid, "cd /d D:\Elbtronika\Elbtonika", timeout_ms:8000)
3. interact_with_process(pid, "<command>", timeout_ms:N)
```

Use when command B depends on state from command A.

### Timeouts (proven values)

| Command type | timeout_ms |
|---|---|
| cd / echo / dir | 5 000 |
| git add / status / log | 8 000 |
| git commit | 10 000 |
| git push | 30 000 |
| gh run list | 15 000 |
| pnpm add / remove | 90 000 |
| pnpm install (full) | 90 000 |
| turbo typecheck | 90 000 |
| storybook build | 120 000 |

**Process death recovery:**
```
If "process may have exited" → don't panic.
Check git log / gh run list — cmd often completed before MCP wrapper timed out.
Start fresh process, verify state, continue.
```

---

## 3. Git Commit — ALWAYS use file (write_file → commit -F)

### ✅ Correct pattern

```python
# Step 1: write the message with Desktop Commander write_file
mcp__Desktop_Commander__write_file(
  path="D:\\msg.txt",
  content="feat(scope): subject\n\n- detail line\n- detail line",
  mode="rewrite"
)

# Step 2: commit from file
start_process("cd /d D:\\Elbtronika\\Elbtonika && git commit -F D:\\msg.txt", shell:"cmd")
```

### ❌ What breaks

```cmd
echo your message > D:\msg.txt   → puts literal "your message" WITH no quotes
                                    but first line only; multi-line broken

git commit -m "feat: multi word" → Windows cmd splits on spaces after first
                                    → pathspec errors

git commit --amend -m "text"     → same breakage in cmd
```

### Amend pattern

```python
mcp__Desktop_Commander__write_file(path="D:\\msg.txt", content="new msg", mode="rewrite")
start_process("cd /d D:\\Elbtronika\\Elbtonika && git commit --amend -F D:\\msg.txt", shell:"cmd")
```

---

## 4. Workspace Bash — Check First, Path Map Required

```
TEST: mcp__workspace__bash("echo ok")
  → "ok"          : bash available, use it (prefer over Desktop Commander)
  → "Workspace unavailable..." : use Desktop Commander
```

**Session mount path (changes each session — always verify):**
```
Current session: /sessions/trusting-pensive-goldberg/
```

| Windows path | Linux mount |
|---|---|
| `D:\Elbtronika\Elbtonika\` | `/sessions/<session-id>/mnt/Elbtonika/` |
| outputs dir | `/sessions/<session-id>/mnt/outputs/` |
| uploads dir | `/sessions/<session-id>/mnt/uploads/` |
| skills dir  | `/sessions/<session-id>/mnt/.claude/skills/` |

**Get session id:** read the system prompt `<high_level_computer_use_explanation>` block — session path is listed there.

---

## 5. GitHub CLI — Primary CI Monitor

```bash
gh run list --repo DiggAiHH/elbtronika --limit 5        # latest runs
gh run view <run-id> --repo DiggAiHH/elbtronika          # job breakdown
gh run view <run-id> --log-failed --repo DiggAiHH/elbtronika   # failure logs
gh run view <run-id> --log --repo DiggAiHH/elbtronika 2>&1 | findstr /i "error"
```

**CI poll pattern:** push → wait 30s → gh run list → gh run view → gh run view --log-failed.  
**Never open GitHub in browser — `gh` is 10× faster.**

---

## 6. pnpm — Commands, Filters, Overrides

```
Version: pnpm@10.0.0 (packageManager in root package.json)
Node:    >=22.0.0

All commands run from repo root: D:\Elbtronika\Elbtonika
```

### Workspace commands

```cmd
pnpm install                      # install all
pnpm install --frozen-lockfile    # CI — don't update lockfile
pnpm typecheck                    # turbo run typecheck (all 4 packages)
pnpm lint                         # turbo run lint (biome)
pnpm test                         # turbo run test (vitest)
pnpm build                        # turbo run build

# Filter — install/run in specific package:
pnpm add -D --filter @elbtronika/ui <package>
pnpm add --filter @elbtronika/web <package>
pnpm remove --filter @elbtronika/ui <package>
pnpm list --filter @elbtronika/ui <package>   # check installed version
pnpm view <package>@<version> peerDependencies  # check peer deps before installing
```

### Version conflict resolution — pnpm.overrides

When multiple workspace packages need different versions of the same dep:
```json
// root package.json
"pnpm": {
  "onlyBuiltDependencies": ["esbuild", "sharp"],
  "overrides": {
    "vite": "^8.0.0"   ← force single vite version across ALL packages
  }
}
```

**Phase 2 lesson:** vite@7 + vite@8 coexisting caused TypeScript `Plugin` type
incompatibility between rolldown (v8) and rollup (v7). Fix = override to single version.

### Never use npx for local tools

```
❌ npx biome          → installs biome@0.3.3 (ancient)
✅ node_modules\.bin\biome  OR  pnpm lint

❌ npx storybook      → may pick up wrong version
✅ pnpm --filter @elbtronika/ui storybook
✅ pnpm --filter @elbtronika/ui build-storybook
```

---

## 7. Storybook 10 — Setup & Gotchas

**Stack:** storybook@10.3.5 · @storybook/react-vite@10.3.5 · @storybook/addon-a11y@10.3.5 · vite@^8.0.0 · @tailwindcss/vite@^4.2.4

### Config files

```typescript
// .storybook/main.ts
import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y"],
  framework: { name: "@storybook/react-vite", options: {} },
  viteFinal(config) {          // ← "viteFinal" NOT "viteFinalConfig"
    config.plugins ??= [];
    config.plugins.push(tailwindcss());
    return config;
  },
};
export default config;
```

```typescript
// .storybook/preview.ts
import type { Preview } from "@storybook/react-vite";
import "../src/styles.css";   // ← import tokens CSS here

const preview: Preview = {
  parameters: {
    backgrounds: { default: "dark", values: [{ name: "dark", value: "#0a0a0b" }] },
    a11y: { config: { rules: [{ id: "color-contrast", enabled: true }] } },
  },
};
export default preview;
```

### Known gotchas

| Issue | Fix |
|---|---|
| `viteFinalConfig` not recognized | Use `viteFinal` (correct Storybook API name) |
| `@storybook/test@10.x` not found | Latest is 8.6.15 — skip it, not needed for basic stories |
| vite peer dep conflict | pnpm override `vite@^8.0.0` monorepo-wide |
| Tailwind tokens not rendering | Import `styles.css` in preview.ts AND add `tailwindcss()` plugin in viteFinal |
| @vitejs/plugin-react type error | Upgrade to latest (requires vite@^8) — old 4.x only supports vite ^4-7 |

### Package scripts

```json
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build",
"clean": "rm -rf dist storybook-static"
```

---

## 8. TypeScript Strict Mode — Component Patterns

**tsconfig:** `strict: true`, `exactOptionalPropertyTypes: true`, `noUncheckedIndexedAccess: true`

### Dynamic JSX tags → use React.createElement

```typescript
// ❌ Breaks in strict mode — JSX namespace error
type Tag = "h1" | "h2" | "h3";
const Heading = ({ as: Tag }) => <Tag>{children}</Tag>;

// ✅ Works — use createElement
type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
function Heading({ as, children, ...props }: Props) {
  const Tag = (as ?? "h2") as HeadingLevel;
  return React.createElement(Tag, { ...props }, children);
}
```

### Radix Slider — undefined value guard

```typescript
// ❌ number | undefined not assignable to number
const displayValue = rawDisplay;

// ✅ explicit fallback
const rawDisplay = Array.isArray(currentValue) ? currentValue[0] : currentValue;
const displayValue: number = rawDisplay ?? 0;
```

### Layout component prop types

```
Stack.gap:    "1" | "2" | "3" | "4" | "6" | "8" | "10" | "12"   (string literals)
Stack.align:  "start" | "center" | "end" | "stretch"
Grid.cols:    1 | 2 | 3 | 4 | 6 | 12                             (number literals)
Grid.gap:     "1" | "2" | "3" | "4" | "6" | "8"                  (string literals)
Spacer.size:  "1" | "2" | "3" | "4" | "6" | "8" | "10" | "12" | "16" | "20" | "24"
```

Always check component interface before passing props in stories — don't guess types.

---

## 9. Biome v2 — Gotchas (Phase 1 learnings, still valid)

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.13/schema.json",
  "files": { "includes": ["**", "!node_modules", "!.next", "!dist", "!.turbo"] },
  "css": { "parser": { "tailwindDirectives": true } }
}
```

| Old | New |
|---|---|
| `files.ignore` | `files.includes` with `!` prefix |
| `noConsoleLog` | `noConsole` |
| `overrides[].include` | `overrides[].includes` |
| `css.linter.rules` | Does NOT exist — use top-level `linter.rules` |

---

## 10. MCP Tool Loading — Bulk Pattern

```
RULE: ToolSearch in bulk, never one-by-one.
```

```javascript
// All computer-use tools:
ToolSearch({ query: "computer-use", max_results: 30 })

// All Chrome tools:
ToolSearch({ query: "chrome", max_results: 20 })

// Exact tools by name:
ToolSearch({ query: "select:mcp__workspace__bash", max_results: 1 })
ToolSearch({ query: "select:TaskList,TaskUpdate,TaskCreate", max_results: 3 })
ToolSearch({ query: "select:mcp__Desktop_Commander__start_process,mcp__Desktop_Commander__read_process_output,mcp__Desktop_Commander__write_file", max_results: 3 })

// Notion tools:
ToolSearch({ query: "select:mcp__2778793c-f546-4fa7-82ab-ec3c8765c733__notion-create-pages,mcp__2778793c-f546-4fa7-82ab-ec3c8765c733__notion-search", max_results: 2 })
```

**Tool response pattern:** User responds "Tool loaded." after each ToolSearch — this means the tool is now callable. Proceed immediately.

---

## 11. Task System — TodoList Usage

```
TaskCreate  → use for each sub-task at session start
TaskUpdate  → in_progress when starting, completed when done
TaskList    → check at session start and after each completion
```

**Always create TodoList before starting multi-step work.**  
**Mark completed immediately — don't batch updates.**  
**Include a verification step as last task.**

---

## 12. Connectors & When to Use Them

| Connector | MCP prefix (short) | When to call |
|---|---|---|
| **Notion** | `mcp__2778793c...` | Phase end docs, ADRs, session notes |
| **Airtable** | `mcp__6ec78dc4...` | Structured data tracking, component registry |
| **Miro** | `mcp__b04fab3e...` | Architecture diagrams, phase maps |
| **Supabase** | `mcp__230328bd...` | DB schema, migrations, RLS, edge functions |
| **Stripe** | `mcp__a465fe2f...` | Products, prices, payment links |
| **Netlify** | `mcp__d406f111...` | Deploy status, site settings |
| **Figma** | `mcp__Figma...` | Design tokens, screenshots, component specs |
| **Gmail** | `mcp__f8417681...` | Partner comms, legal, steuerberater |
| **Google Calendar** | `mcp__63478716...` | Meeting scheduling |
| **Google Drive** | `mcp__ec313e43...` | Shared docs, contracts |
| **GitHub** | gh CLI (Desktop Commander) | Runs, PRs, issues — no browser needed |

**Documentation rule (CLAUDE.md):** Every phase output → Notion + Airtable + Miro + local D:\ + GitHub.

### Notion — create page pattern

```javascript
// Search first for existing parent:
notion-search({ query: "ELBTRONIKA", query_type: "internal", filters: {} })

// If no results → create at workspace level (omit parent):
notion-create-pages({ pages: [{ icon: "🏗️", properties: { title: "..." }, content: "..." }] })

// If parent exists → use page_id from search url field:
notion-create-pages({ pages: [...], parent: { type: "page_id", page_id: "<id>" } })
```

---

## 13. Skills — When and How

| Skill | Trigger condition | Key note |
|---|---|---|
| `engineering:documentation` | Writing ADRs, runbooks, protocol updates | Pre-loads write patterns |
| `engineering:architecture` | New technology choices, ADR needed | Use for formal decision docs |
| `engineering:code-review` | Before any merge to main | |
| `engineering:debug` | Any error, CI failure, mystery bug | Run before manual investigation |
| `design:design-system` | Auditing/extending UI component library | Phase 3+ |
| `design:accessibility-review` | WCAG audit per component/page | Use with axe-core data |
| `productivity:memory-management` | End of session, new terms/people/tools discovered | Update CLAUDE.md + memory/ |
| `docx` / `pptx` / `pdf` / `xlsx` | Any document file creation | ALWAYS read SKILL.md first |

**Skill invocation:** `Skill({ skill: "engineering:documentation" })` — user will confirm with "Tool loaded." or the skill auto-loads. Then follow the instructions that appear.

---

## 14. GitHub Actions CI — Proven Patterns

### upload-artifact for dotdirs

```yaml
- uses: actions/upload-artifact@v4
  with:
    path: apps/web/.next/
    include-hidden-files: true    # CRITICAL — .next/ is a dotdir, hidden on Linux
```

### pnpm.onlyBuiltDependencies (required)

```json
"pnpm": { "onlyBuiltDependencies": ["esbuild", "sharp"] }
```

### vitest config requirements

```typescript
test: {
  exclude: ["**/node_modules/**", "**/e2e/**", "**/*.spec.ts"],
}
// scripts: "vitest run --passWithNoTests"
```

### Next.js — reactCompiler gate

```typescript
// Disabled until Phase 7+
// experimental: { reactCompiler: true }
experimental: { typedRoutes: true }
```

---

## 15. Known Bugs / Sharp Edges — Do Not Repeat

| Bug | Symptom | Fix |
|---|---|---|
| `.next/` not uploaded | "No artifacts" despite build success | `include-hidden-files: true` |
| Biome wrong version | `npx biome` installs 0.3.3 | `pnpm lint` or `node_modules\.bin\biome` |
| Git commit eats words | Wrong message or pathspec errors | `write_file → git commit -F D:\msg.txt` |
| echo msg > file adds literal text | `"msg"` appears in commit subject | Use Desktop Commander `write_file` tool |
| Vitest picks up Playwright | jsdom errors on e2e specs | Exclude `**/e2e/**` in vitest config |
| esbuild not compiled | Next.js build empty | `pnpm.onlyBuiltDependencies: ["esbuild","sharp"]` |
| PowerShell blocks pnpm | `pnpm.ps1 cannot be loaded` | cmd shell only |
| vite@7 + vite@8 type conflict | `Plugin<any>` rolldown/rollup mismatch | `pnpm.overrides: { vite: "^8.0.0" }` |
| `@storybook/test@10.x` not found | no matching version | Latest is 8.6.15 — skip or don't pin major |
| `@vitejs/plugin-react@4.x` + vite@8 | TS2769 overload error in vitest.config | Upgrade plugin to latest (requires vite@^8) |
| `viteFinalConfig` in storybook | Unknown config key | Use `viteFinal` |
| JSX dynamic tag in strict TS | `Cannot find namespace 'JSX'` | Use `React.createElement` |
| Stack/Spacer gap/size as number | TS2322 type error | Props are string literals: `gap="4"` not `gap={4}` |
| Turbo telemetry in CI logs | Clutters output | `TURBO_TELEMETRY_DISABLED=1` in CI env |
| Desktop Commander timeout | Process state unknown | Check `git log` / `gh run list` — often completed |
| `md [locale]` fails | "Syntax incorrect" on Windows | Use Node.js `fs.mkdirSync` via `.cjs` script |
| `process.env.KEY!` Biome error | `noNonNullAssertion` violation | Wrap in `getX()` with `if (!key) throw` guard |
| `startTransition` in useCallback deps | `useExhaustiveDependencies` error | Remove — it's stable like `setState` |
| `@/*` alias misses `app/` routes | TS can't find `i18n/routing` | Use dual alias: `["./\*", "./src/\*"]` |
| Next.js middleware false redirects | Prefetches trigger auth redirect | Guard in Server Component layout, not middleware |
| Supabase cookies lost after locale redirect | Session gone after `/` → `/de/` | Merge Supabase cookies into i18n response (see ADR 0004) |
| Sanity CMS `tsc --noEmit` ~100 errors | All in `node_modules` (Sanity 3.99 + Node 22 type gap) | Filter with `findstr /i "schemas\\"` — 0 errors in own code is the real check |
| Service-Role key in browser | RLS bypassed for all users | `createAdminClient()` ONLY in Route Handlers / Server Actions — never in `"use client"` files |
| `vi.mock()` call order in Vitest | Mock not applied if after import | Always `vi.mock()` before any subject imports in test files |
| HMAC webhook replay attack | Old requests replayed | `Math.abs(Date.now()/1000 - ts) > 300` → 401. Always validate timestamp. |
| R2 presigned URL expiry | URL valid only 3600s | Never cache `uploadUrl`. Always POST `/api/assets/upload` fresh per upload. |
| `useTransition` + async in `startTransition` | Warning: not wrapped in `act()` in tests | In Vitest, use `waitFor` around assertions after transition |

---

## 16. File & Path Rules

```
Working dir (agent temp):  C:\Users\Moin\AppData\Roaming\Claude\...\outputs
Project workspace:         D:\Elbtronika\Elbtonika              (user-visible)

File tools (Read/Write/Edit): Windows paths
Shell bash:                   Linux mount paths (see §4)
```

**Deliverables always go to D:\Elbtronika\Elbtonika — the outputs/ temp dir is invisible to Lou.**

---

## 17. Repo & Phase Status

```
Org:    DiggAiHH
Repo:   elbtronika
Branch: main
Tags:   v0.1.0=Phase1  v0.2.0=Phase2  v0.3.0=Phase3  v0.4.0=Phase4

Phase 1: ✅ Done (v0.1.0) — monorepo, CI, Next.js 15, tokens
Phase 2: ✅ Done (v0.2.0) — design system, 16 components, Storybook 10, ADR 0002
Phase 3: ✅ Done (v0.3.0) — Supabase + RLS + Sanity + R2 runbook + Doppler + ADR 0003
Phase 4: ✅ Done (v0.4.0) — Auth + protected routes + profile flow + Stripe KYC + ADR 0004
Phase 5: ✅ Done (v0.5.0) — Content model, Sanity schemas, R2 upload, webhook sync, artist dashboard + ADR 0005
Phase 6–7: 🔒 Blocked    — awaits Phase 0 (legal)

Phase 6 entry (when Phase 0 unblocked):
  1. Phase 6: E-commerce — cart, checkout, Stripe Payment Intents
  2. Phase 7: Single Canvas — WebGPU Immersive Mode
```

---

## 18. Session End Checklist

```
[ ] All changed files committed + pushed to main
[ ] git tag if milestone (vX.Y.Z)
[ ] docs/agent-preflight-protocol.md updated with new learnings
[ ] CLAUDE.md updated (new terms, phase status, people)
[ ] Notion page created for phase output / ADR
[ ] Memory files written to spaces/.../memory/ (user info, feedback, project)
[ ] No temp files in repo root
[ ] TypeScript: 0 errors (pnpm typecheck)
[ ] Storybook: build clean (pnpm build-storybook)
```

---

## 19. Critical Path Reminder

```
Phase 0 (Legal + Stripe KYC)   ─┐
Phase 3 (Infra: R2 + Supabase)  ─┤── all block Phase 7 (Single Canvas)
Phase 7 (Single Canvas)         ─┘

Phase 0 and Phase 3 can run in parallel.
Both must complete before Phase 7 starts.
Do NOT let engineering progress mask blocked legal work.
```

---

*Authors: Claude (Cowork) + Lou | Phase 1: 2026-04-24 | Phase 2: 2026-04-25 | Phase 3: 2026-04-26 | Phase 4: 2026-04-26 | Phase 5: 2026-04-29*
