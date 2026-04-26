# ELBTRONIKA — Agent Ultraplan
## Complete Cowork Knowledge Base · All Tools · All Connectors · All Patterns

> **This is the master reference.** Read this at the start of every session.  
> Written from real pain across Phase 1–4. Every rule has a root cause.  
> *Last updated: 2026-04-26 — Phase 4 complete (Auth + Onboarding)*

---

## 0. Session Hard Checklist

Run in order before touching ANY code or tool:

```
[ ] 1. Read CLAUDE.md                         → project context, phase, terms
[ ] 2. Read this file (agent-ultraplan.md)    → all tool patterns
[ ] 3. Test workspace bash: echo ok           → available? use it. error? → Desktop Commander
[ ] 4. Load deferred tools BULK (see §3)
[ ] 5. CI check: gh run list --repo DiggAiHH/elbtronika --limit 3
[ ] 6. TaskList → any open/in_progress items?
[ ] 7. Caveman mode ON → terse, no fluff, [thing] [action] [reason]
[ ] 8. Check memory/ for stale facts if working near existing code
```

---

## 1. Machine Profile — This Computer

```
OS:       Windows 10 (Build 19045.5917)
User:     Moin
Project:  D:\Elbtronika\Elbtonika
Shell:    cmd ONLY — PowerShell blocks pnpm.ps1, && chaining fails
Node:     >=22.0.0
pnpm:     10.0.0 (packageManager in root package.json)
```

**Lou's style:** German chat · English code + commits · caveman mode always on · terse · Eselbrücken · bullet points · no fluff · no post-summaries.

---

## 2. Shell Rules — ALWAYS cmd, NEVER PowerShell

```
RULE: shell: "cmd" on every single Desktop Commander start_process call.
```

| ✅ Do | ❌ Never |
|-------|---------|
| `start_process("cd /d D:\path && cmd", shell:"cmd")` | `start_process("...", shell:"powershell")` |
| `start_process("pnpm lint", shell:"cmd")` | Any PowerShell invocation |
| `node_modules\.bin\biome check` | `npx biome` (installs ancient 0.3.3) |
| `git commit -F D:\msg.txt` | `git commit -m "text with colons: breaks"` |

---

## 3. Tool Loading Strategy — Bulk, Not One-By-One

Every MCP tool starts as "deferred" (schema not loaded). **Always bulk-load.**

```javascript
// ALL computer-use tools at once:
ToolSearch({ query: "computer-use", max_results: 30 })

// ALL Chrome tools at once:
ToolSearch({ query: "chrome", max_results: 20 })

// Specific tools by exact name (fastest):
ToolSearch({ query: "select:mcp__workspace__bash", max_results: 1 })
ToolSearch({ query: "select:TaskList,TaskUpdate,TaskCreate", max_results: 3 })
ToolSearch({ query: "select:mcp__Desktop_Commander__start_process,mcp__Desktop_Commander__read_process_output,mcp__Desktop_Commander__write_file", max_results: 3 })

// Notion:
ToolSearch({ query: "select:mcp__2778793c-f546-4fa7-82ab-ec3c8765c733__notion-search,mcp__2778793c-f546-4fa7-82ab-ec3c8765c733__notion-create-pages", max_results: 2 })

// Airtable:
ToolSearch({ query: "select:mcp__6ec78dc4-a634-456b-98f5-404c16cd3324__list_bases,mcp__6ec78dc4-a634-456b-98f5-404c16cd3324__list_tables_for_base,mcp__6ec78dc4-a634-456b-98f5-404c16cd3324__create_records_for_table", max_results: 3 })

// Supabase:
ToolSearch({ query: "select:mcp__230328bd-9abd-4c2c-8238-7fc3f7d478f9__execute_sql,mcp__230328bd-9abd-4c2c-8238-7fc3f7d478f9__apply_migration,mcp__230328bd-9abd-4c2c-8238-7fc3f7d478f9__list_tables", max_results: 3 })
```

**Pattern:** User responds "Tool loaded." → tool is callable. Proceed immediately, no re-confirmation needed.

---

## 4. Desktop Commander — Proven Patterns

### Pattern A: Direct single command (PREFERRED)
```python
mcp__Desktop_Commander__start_process(
  command="cd /d D:\\Elbtronika\\Elbtonika && node_modules\\.bin\\biome check apps/web",
  shell="cmd",
  timeout_ms=20000
)
```

### Pattern B: Multi-step chain (when state carries)
```python
pid = start_process("cmd", shell="cmd", timeout_ms=5000)
interact_with_process(pid, "cd /d D:\\Elbtronika\\Elbtonika", timeout_ms=8000)
interact_with_process(pid, "pnpm lint", timeout_ms=30000)
```

### Pattern C: Commit message (ALWAYS use write_file)
```python
# Step 1: write message
mcp__Desktop_Commander__write_file(
  path="D:\\msg.txt",
  content="feat(scope): subject\n\n- detail\n- detail",
  mode="rewrite"
)
# Step 2: commit
start_process("cd /d D:\\Elbtronika\\Elbtonika && git commit -F D:\\msg.txt", shell="cmd", timeout_ms=15000)
```

### Timeout Reference
| Command | timeout_ms |
|---------|-----------|
| echo / dir / cd | 5 000 |
| git add / status / log | 8 000 |
| git commit | 12 000 |
| git push | 30 000 |
| gh run list | 15 000 |
| biome check / lint | 25 000 |
| tsc --noEmit | 45 000 |
| pnpm add/remove | 45 000 |
| pnpm install | 90 000 |
| turbo build | 120 000 |

### Process Death Recovery
```
"process may have exited" → DO NOT PANIC
→ git log --oneline -3    check if cmd ran
→ gh run list             check if CI triggered
→ Start fresh process, verify state, continue
```

---

## 5. workspace bash — Check First, Then Use

```bash
# TEST: call this first every session
mcp__workspace__bash("echo ok")
# "ok"      → available, use it (faster than Desktop Commander for Linux commands)
# error     → switch entirely to Desktop Commander for that session
```

### Path Mapping (session-specific — verify in system prompt)
| Windows | Linux mount |
|---------|-------------|
| `D:\Elbtronika\Elbtonika\` | `/sessions/<id>/mnt/Elbtonika/` |
| outputs dir | `/sessions/<id>/mnt/outputs/` |
| uploads dir | `/sessions/<id>/mnt/uploads/` |
| skills dir | `/sessions/<id>/mnt/.claude/skills/` |

**Get session id:** read `<high_level_computer_use_explanation>` in system prompt.

---

## 6. File Tools — Read / Write / Edit

```
Read  → always before Edit (required by tool)
Write → new files or full rewrites only
Edit  → targeted changes, unique old_string required
```

**Path rules:**
- File tools use **Windows paths**: `D:\Elbtronika\Elbtonika\...`
- workspace bash uses **Linux paths**: `/sessions/.../mnt/Elbtonika/...`

**Bracket directories** (`[locale]`, `[[...slug]]`):
```javascript
// ❌ CMD md fails: "Syntax incorrect"
// ❌ PowerShell New-Item -LiteralPath fails
// ✅ ONLY works: Node.js fs.mkdirSync via .cjs script
// Create mkdirs.cjs at repo root, run: node mkdirs.cjs
```

---

## 7. GitHub CLI — Primary CI Monitor (No Browser Needed)

```bash
gh run list --repo DiggAiHH/elbtronika --limit 5
gh run view <id> --repo DiggAiHH/elbtronika
gh run view <id> --log-failed --repo DiggAiHH/elbtronika
gh run view <id> --log --repo DiggAiHH/elbtronika 2>&1 | findstr /i "error"
gh run watch <id> --repo DiggAiHH/elbtronika
```

**Poll pattern:** push → wait 30s → run list → run view → run view --log-failed.

---

## 8. pnpm / Turborepo / Biome

### pnpm commands (from repo root)
```cmd
pnpm install
pnpm install --frozen-lockfile       ← CI
pnpm typecheck                       ← turbo run typecheck
pnpm lint                            ← turbo run lint (biome)
pnpm test                            ← turbo run test
pnpm build

pnpm add -D --filter @elbtronika/web <pkg>
pnpm remove --filter @elbtronika/ui <pkg>
pnpm list --filter @elbtronika/web <pkg>
pnpm view <pkg>@<ver> peerDependencies
```

### Biome
```cmd
node_modules\.bin\biome check apps/web/app
node_modules\.bin\biome check --write apps/web/app          ← safe auto-fix
node_modules\.bin\biome check --write --unsafe apps/web/app ← unsafe fixes
```

**Biome v2 config changes:**
| Old | New |
|-----|-----|
| `files.ignore` | `files.includes` with `!` prefix |
| `noConsoleLog` | `noConsole` |
| `overrides[].include` | `overrides[].includes` |

### TypeScript
```cmd
cd apps\web && node_modules\.bin\tsc --noEmit
```
Never `pnpm --filter @elbtronika/web tsc --noEmit` — no "tsc" script defined.

---

## 9. MCP Connector Reference — Full Patterns

### 9.1 Supabase `mcp__230328bd-...__*`

**When:** DB migrations, schema changes, SQL queries, edge functions, project config.

```javascript
// Load tools:
ToolSearch({ query: "select:mcp__230328bd-9abd-4c2c-8238-7fc3f7d478f9__execute_sql,mcp__230328bd-9abd-4c2c-8238-7fc3f7d478f9__apply_migration,mcp__230328bd-9abd-4c2c-8238-7fc3f7d478f9__list_tables,mcp__230328bd-9abd-4c2c-8238-7fc3f7d478f9__list_projects", max_results: 4 })

// Key tools:
execute_sql({ project_ref, query })           // run SQL directly
apply_migration({ project_ref, name, query }) // create migration
list_tables({ project_ref, schema })          // inspect schema
generate_typescript_types({ project_ref })    // regenerate types
get_advisors({ project_ref })                 // RLS + performance warnings
list_migrations({ project_ref })              // audit migration history
deploy_edge_function({ ... })                 // deploy Deno function
```

**Project ref:** find in Supabase dashboard URL or via `list_projects`.  
**Always** run `get_advisors` after schema changes — catches missing RLS policies.

---

### 9.2 Stripe `mcp__a465fe2f-...__*`

**When:** Products, prices, customers, invoices, connect accounts (read/inspect only — never execute financial actions).

```javascript
// Load tools:
ToolSearch({ query: "select:mcp__a465fe2f-47c1-404e-abdc-5199931b08e4__fetch_stripe_resources,mcp__a465fe2f-47c1-404e-abdc-5199931b08e4__stripe_api_execute,mcp__a465fe2f-47c1-404e-abdc-5199931b08e4__search_stripe_documentation", max_results: 3 })

// Key tools:
fetch_stripe_resources({ resource_type, ... })  // list customers, products, etc.
stripe_api_execute({ method, path, params })     // raw API call
search_stripe_documentation({ query })           // search Stripe docs
stripe_integration_recommender({ ... })          // suggest integration approach
get_stripe_account_info()                        // account status
```

**⚠️ Never execute real charges, refunds, or transfers via MCP.** Inspect and plan only — Lou executes financial actions manually.

---

### 9.3 Notion `mcp__2778793c-...__notion-*`

**When:** Phase docs, ADRs, lessons learned, any end-of-phase documentation.

```javascript
// Load:
ToolSearch({ query: "select:mcp__2778793c-f546-4fa7-82ab-ec3c8765c733__notion-search,mcp__2778793c-f546-4fa7-82ab-ec3c8765c733__notion-create-pages,mcp__2778793c-f546-4fa7-82ab-ec3c8765c733__notion-update-page", max_results: 3 })

// Pattern — always search first:
notion-search({ query: "ELBTRONIKA Phase", query_type: "internal", filters: {}, page_size: 5, max_highlight_length: 0 })

// Create page (workspace level if no parent found):
notion-create-pages({
  pages: [{
    icon: "🏗️",
    properties: { title: "Phase N — Title" },
    content: "## Heading\n\nContent in Notion Markdown..."
  }]
  // omit parent → workspace level private page
})

// Create under existing page:
notion-create-pages({
  pages: [{ ... }],
  parent: { type: "page_id", page_id: "<id-from-search-url>" }
})
```

**Notion Markdown:** fetch `notion://docs/enhanced-markdown-spec` before complex content. Do NOT guess syntax.  
**Page IDs:** from search results `.url` field (UUID without dashes).

---

### 9.4 Airtable `mcp__6ec78dc4-...__*`

**When:** Structured tracking — component registry, phase progress, bug tracking, content inventory.

```javascript
// Load:
ToolSearch({ query: "select:mcp__6ec78dc4-a634-456b-98f5-404c16cd3324__list_bases,mcp__6ec78dc4-a634-456b-98f5-404c16cd3324__list_tables_for_base,mcp__6ec78dc4-a634-456b-98f5-404c16cd3324__create_records_for_table,mcp__6ec78dc4-a634-456b-98f5-404c16cd3324__list_records_for_table", max_results: 4 })

// Step 1: find base
list_bases()
// Step 2: find tables + field IDs
list_tables_for_base({ baseId: "appXXX..." })
// Step 3: create record (use field IDs, not names)
create_records_for_table({
  baseId: "appXXX",
  tableId: "tblXXX",
  records: [{ fields: { "fldXXX": "value", "fldYYY": "Done" } }]
})
// Step 4: search if unsure
search_records({ baseId, query: "Phase 4" })
```

**Critical:** field IDs start with `fld`, NOT field names. Always `list_tables_for_base` first to get IDs.

---

### 9.5 Miro `mcp__b04fab3e-...__*`

**When:** Architecture diagrams, phase roadmaps, system design visuals.

```javascript
// Load:
ToolSearch({ query: "select:mcp__b04fab3e-2a89-4a6e-879b-781a158b49ec__context_explore,mcp__b04fab3e-2a89-4a6e-879b-781a158b49ec__doc_create,mcp__b04fab3e-2a89-4a6e-879b-781a158b49ec__diagram_create", max_results: 3 })

// Pattern:
context_explore()                              // find boards
context_get({ id: "<board-id>" })              // inspect board
doc_create({ boardId, title, content })        // add text doc to board
diagram_create({ boardId, dsl: "..." })        // add diagram (Mermaid-like DSL)
```

---

### 9.6 Netlify `mcp__d406f111-...__netlify-*`

**When:** Deploy status, env var management, site configuration.

```javascript
// Load:
ToolSearch({ query: "select:mcp__d406f111-24ab-46b7-9e62-d043231fad61__netlify-deploy-services-reader,mcp__d406f111-24ab-46b7-9e62-d043231fad61__netlify-project-services-reader", max_results: 2 })

// Key tools:
netlify-deploy-services-reader(...)    // list/inspect deploys
netlify-project-services-reader(...)   // site + env config
netlify-team-services-reader(...)      // team/account info
```

---

### 9.7 Figma `mcp__Figma__*`

**When:** Extracting design tokens, component specs, screenshots from Figma files.

```javascript
// Load:
ToolSearch({ query: "figma", max_results: 10 })

// Key tools:
get_design_context({ fileKey, nodeIds })   // full component spec
get_metadata({ fileKey })                   // file structure
get_screenshot({ fileKey, nodeId })         // render to image
get_variable_defs({ fileKey })              // design tokens
```

**Use with `designlang` workflow** for token extraction → Tailwind config.

---

### 9.8 Gmail `mcp__f8417681-...__*`

**When:** Partner comms, legal emails, steuerberater, Stripe notifications.

```javascript
// Load:
ToolSearch({ query: "select:mcp__f8417681-089d-43f0-b00a-7707312c9b63__search_threads,mcp__f8417681-089d-43f0-b00a-7707312c9b63__get_thread,mcp__f8417681-089d-43f0-b00a-7707312c9b63__create_draft", max_results: 3 })

search_threads({ query: "from:stripe OR subject:ELBTRONIKA" })
get_thread({ threadId })
create_draft({ to, subject, body })     // draft only — Lou sends manually
```

**⚠️ Create drafts only. Never auto-send.**

---

### 9.9 Google Calendar `mcp__63478716-...__*`

**When:** Scheduling meetings with steuerberater, fachanwalt, partners.

```javascript
// Load:
ToolSearch({ query: "select:mcp__63478716-af98-4a29-b14c-d05d9cb4f104__list_events,mcp__63478716-af98-4a29-b14c-d05d9cb4f104__create_event,mcp__63478716-af98-4a29-b14c-d05d9cb4f104__suggest_time", max_results: 3 })

list_calendars()
list_events({ calendarId, timeMin, timeMax })
suggest_time({ ... })        // find free slot
create_event({ ... })        // confirm with Lou before creating
```

---

### 9.10 Google Drive `mcp__ec313e43-...__*`

**When:** Shared contracts, legal docs, partner materials.

```javascript
// Load:
ToolSearch({ query: "select:mcp__ec313e43-21e7-4094-9d09-a4d1ed2deb4f__search_files,mcp__ec313e43-21e7-4094-9d09-a4d1ed2deb4f__read_file_content", max_results: 2 })

search_files({ query: "ELBTRONIKA contract" })
read_file_content({ fileId })
```

---

### 9.11 Computer Use `mcp__computer-use__*`

**When:** Native desktop apps, cross-app workflows, anything without a dedicated MCP.

```javascript
// Load ALL at once:
ToolSearch({ query: "computer-use", max_results: 30 })

// Pattern: ALWAYS request_access first
request_access({ applications: ["VS Code"] })
screenshot()                    // see current screen before acting
left_click({ x, y })
type({ text: "..." })
key({ key: "Return" })
scroll({ x, y, direction: "down", amount: 3 })
```

**Tier rules:**
- Browsers → read-only (use Chrome MCP for interaction)
- Terminals/IDEs → click-only (use workspace bash for commands)
- Everything else → full

**⚠️ Never click web links — open via Chrome MCP instead.**

---

### 9.12 Chrome MCP `mcp__Claude_in_Chrome__*`

**When:** Web apps without dedicated MCPs, form filling, DOM inspection.

```javascript
// Load:
ToolSearch({ query: "chrome", max_results: 20 })

list_connected_browsers()
navigate({ url: "https://..." })
find({ selector: "button.submit" })
form_input({ selector: "#email", value: "..." })
get_page_text()
read_network_requests()
javascript_tool({ code: "return document.title" })
```

---

### 9.13 Cowork MCP `mcp__cowork__*`

**When:** Artifacts (live persistent HTML views), file presentation, directory access.

```javascript
// Load:
ToolSearch({ query: "select:mcp__cowork__create_artifact,mcp__cowork__list_artifacts,mcp__cowork__present_files,mcp__cowork__request_cowork_directory", max_results: 4 })

// Create persistent dashboard:
create_artifact({ title: "elbtronika_phase_tracker", widget_code: "<html>..." })

// Present files to Lou:
present_files({ paths: ["D:\\Elbtronika\\Elbtonika\\docs\\adr\\0004-auth-phase4.md"] })

// Get workspace access:
request_cowork_directory()   // prompts Lou to select a folder
```

---

## 10. Skills Reference — When to Invoke

**Invoke:** `Skill({ skill: "plugin:skill-name" })`  
**Pattern:** Call → user responds "Tool loaded." → follow skill instructions.

### Engineering Skills

| Skill | Trigger | When |
|-------|---------|------|
| `engineering:architecture` | New tech choice, new ADR needed | Any major decision: DB, auth, payments |
| `engineering:code-review` | Before merge to main | Every PR, every phase commit |
| `engineering:debug` | Any error, CI failure, mystery bug | FIRST step — before manual investigation |
| `engineering:documentation` | Writing runbooks, ADRs, protocols | Use it, don't freeform |
| `engineering:deploy-checklist` | Before shipping any release | Phase completions, hotfixes |
| `engineering:incident-response` | Production down, critical bug | Triage → communicate → postmortem |
| `engineering:system-design` | New service, new API surface | Phase 5+ content ingestion, Phase 7 3D |
| `engineering:tech-debt` | Code health audit | Between phases |
| `engineering:testing-strategy` | New feature needs tests | Each phase, per component |
| `engineering:standup` | Daily update generation | Optional |

### Design Skills

| Skill | Trigger | When |
|-------|---------|------|
| `design:design-critique` | Review mockup/screen | Phase 5+ UI work |
| `design:accessibility-review` | WCAG audit | Every new page/component |
| `design:design-handoff` | Component ready for dev | Phase 5+ |
| `design:design-system` | Audit/extend tokens | Phase 2 patterns, Phase 5+ |
| `design:ux-copy` | Button labels, error messages | All UI text |
| `design:user-research` | User interviews, surveys | Phase 0+ |

### Document Skills

| Skill | Trigger | When |
|-------|---------|------|
| `docx` | Any .docx creation/edit | Contracts, reports |
| `pptx` | Any .pptx creation/edit | Pitch deck, investor deck |
| `pdf` | Any PDF work | Fill forms, extract, merge |
| `xlsx` | Any Excel/spreadsheet | Budget, financial models |

### Data Skills

| Skill | Trigger | When |
|-------|---------|------|
| `data:analyze` | "How many X", trend analysis | Analytics after Phase 6 |
| `data:build-dashboard` | Live KPI view | Revenue, user metrics |
| `data:sql-queries` | Complex Supabase queries | Reporting, analytics |
| `data:explore-data` | New table, unknown shape | Schema discovery |

### Productivity Skills

| Skill | Trigger | When |
|-------|---------|------|
| `productivity:memory-management` | End of session, new terms learned | Always run at session end |
| `productivity:task-management` | Task CRUD | Every multi-step session |
| `anthropic-skills:consolidate-memory` | Memory getting large/stale | Monthly or after big sessions |
| `anthropic-skills:skill-creator` | Need new custom skill | Automate repetitive patterns |

### Brand Skills (Phase 5+)

| Skill | Trigger | When |
|-------|---------|------|
| `brand-voice:brand-voice-enforcement` | Writing marketing copy, emails | Any outward-facing content |
| `brand-voice:guideline-generation` | Build brand guidelines | Phase 5 content strategy |

---

## 11. Task System — Rules

```
TaskCreate  → at session start for every multi-step task
TaskUpdate  → in_progress BEFORE starting, completed AFTER finishing
TaskList    → check after every completion

NEVER mark completed if:
  - tests failing
  - implementation partial
  - unresolved errors
```

**Always include a verification task as the last item** (typecheck, lint, screenshot, diff check).

---

## 12. Memory System — Rules

```
Memory files at: spaces/.../memory/
MEMORY.md       = index only (one line per entry)
Individual .md  = frontmatter + content
```

**Types:** `user` · `feedback` · `project` · `reference`

**Save immediately when:**
- User corrects approach → `feedback_*.md`
- User confirms non-obvious approach worked → `feedback_*.md`
- New phase complete → update `project_phase_status.md`
- New term/person/tool discovered → `user_profile.md` or new file

**Never save:** code patterns, git history, ephemeral task state, PII.

**Before acting on memory:** verify the file/function still exists (`grep` or `Read`). Memory is frozen in time.

---

## 13. Documentation Rule — Every Phase End

```
Phase output → ALL FIVE destinations, always:
  1. Notion page         (mcp__2778793c...)   → narrative + decisions
  2. Airtable record     (mcp__6ec78dc4...)   → structured tracking
  3. Miro update         (mcp__b04fab3e...)   → visual/diagram
  4. Local D:\ copy      (Write tool)         → docs/ in repo
  5. GitHub commit+push  (Desktop Commander)  → version controlled
```

**Automation:** use the `schedule` skill to automate periodic Notion/Airtable syncs.

---

## 14. Next.js App Router — Proven Patterns

```typescript
// Auth guard: Server Component layout, NOT middleware
// ❌ middleware.ts redirect → false redirects on prefetch
// ✅ layout.tsx:
const user = await getCurrentUser();
if (!user) redirect(`/${locale}/login`);

// Middleware: ONLY session refresh + i18n
// merge Supabase cookies into i18n response (critical!)
for (const cookie of supabaseResponse.cookies.getAll()) {
  i18nResponse.cookies.set(cookie.name, cookie.value, cookie);
}

// tsconfig dual alias (mixed app/ + src/ structure):
"@/*": ["./*", "./src/*"]

// env var guard (no ! assertions):
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
}

// useTransition: startTransition is STABLE → not a dependency
const callback = useCallback(() => {
  startTransition(async () => { ... });
}, [locale]); // NOT [locale, startTransition]
```

---

## 15. GitHub Actions CI — Proven Config

```yaml
# upload-artifact for .next/ (dotdir = hidden on Linux):
- uses: actions/upload-artifact@v4
  with:
    path: apps/web/.next/
    include-hidden-files: true   # CRITICAL

# pnpm.onlyBuiltDependencies (required for esbuild/sharp):
# root package.json:
"pnpm": {
  "onlyBuiltDependencies": ["esbuild", "sharp"]
}

# vitest — exclude e2e:
test: { exclude: ["**/node_modules/**", "**/e2e/**", "**/*.spec.ts"] }
// scripts: "vitest run --passWithNoTests"
```

---

## 16. Known Bugs — Do Not Repeat

| Bug | Symptom | Fix |
|-----|---------|-----|
| `.next/` missing in CI | "No artifacts" after build | `include-hidden-files: true` |
| biome ancient version | wrong rules fire | `node_modules\.bin\biome` not `npx biome` |
| git commit truncated | wrong subject or pathspec error | `write_file → git commit -F D:\msg.txt` |
| `[locale]` dir creation fails | "Syntax incorrect" on Windows | Node.js `fs.mkdirSync` via `.cjs` script |
| `process.env.KEY!` blocks lint | `noNonNullAssertion` error | `if (!key) throw` guard in getter function |
| `startTransition` in deps | `useExhaustiveDependencies` error | remove — it's stable like `setState` |
| `@/*` alias misses app/ | TS can't resolve `i18n/routing` | dual alias `["./\*", "./src/\*"]` |
| Auth guard in middleware | false redirects on prefetch | guard in Server Component layout only |
| Supabase cookies lost | session gone after locale redirect | merge cookies into i18n response |
| PowerShell blocks pnpm | `pnpm.ps1 cannot be loaded` | cmd shell only, always |
| vite@7 + vite@8 coexist | TS Plugin type mismatch | `pnpm.overrides: { "vite": "^8.0.0" }` |
| JSX dynamic tag strict TS | `Cannot find namespace JSX` | `React.createElement(Tag as "h1", ...)` |
| `@storybook/test@10.x` missing | no matching version | latest is 8.6.15 — skip major pin |
| Stack/Grid gap as number | TS2322 | string literal: `gap="4"` not `gap={4}` |
| Stripe apiVersion wrong | not assignable | `"2026-04-22.dahlia"` (from installed types) |
| Stripe email optional strict | can't pass `undefined` | `...(email ? { email } : {})` spread |
| Webhook payload Json type | not assignable to Json | `JSON.parse(JSON.stringify(event))` |
| Desktop Commander timeout | process state unknown | check `git log` — often completed anyway |
| Wrong app directory | files in `src/app/` not `app/` | real routes at `apps/web/app/` (no src prefix) |
| Turbo telemetry in CI | noisy logs | `TURBO_TELEMETRY_DISABLED=1` in CI env |

---

## 17. Phase & Repo Status

```
Org:    DiggAiHH | Repo: elbtronika | Branch: main
Tags:   v0.1.0=Phase1  v0.2.0=Phase2  v0.3.0=Phase3  v0.4.0=Phase4

Phase 1: ✅ v0.1.0 — monorepo, CI, Next.js 15, Tailwind v4, Biome
Phase 2: ✅ v0.2.0 — 16 UI components, Storybook 10, axe-core, ADR 0002
Phase 3: ✅ v0.3.0 — Supabase+RLS, Sanity v4, R2 runbook, Doppler, ADR 0003
Phase 4: ✅ v0.4.0 — Auth, protected routes, profile flow, Stripe KYC, ADR 0004
Phase 0: 🔄 Running — legal (Steuerberater + Fachanwalt IT-Recht)
Phase 5–7: 🔒 Blocked on Phase 0

Phase 5: Content ingestion (R2 uploads, Sanity publishing)
Phase 6: E-commerce (cart, checkout, Stripe Payment Intents)
Phase 7: Single Canvas (WebGPU Immersive Mode + Spatial Audio)
```

**Stack (April 2026):** Next.js 15 · React 19 · Tailwind v4 · Three.js r184 · R3F v9 · Supabase · Stripe Connect · Sanity v4 · Cloudflare R2 · Netlify · Doppler · Biome v2 · Vitest · Playwright

---

## 18. Session End Checklist

```
[ ] All changes committed + pushed to main
[ ] git tag vX.Y.Z if phase milestone
[ ] docs/agent-ultraplan.md updated with new learnings
[ ] CLAUDE.md updated (phase status, new terms, people)
[ ] Notion page created for phase output / ADR
[ ] Airtable record created
[ ] Miro board updated
[ ] Memory files written/updated (project_phase_status.md, feedback_*.md)
[ ] TaskList: all in_progress → completed
[ ] TypeScript: 0 errors
[ ] Biome: 0 errors
[ ] No temp files in repo root (D:\msg.txt OK to leave)
```

---

## 19. Critical Path

```
Phase 0 (Legal: Steuerberater + Fachanwalt IT-Recht)
  └── blocks Phase 5–7 entirely
  └── Stripe KYC for artists requires legal entity → Steuerberater blocks this

Phase 3 manual steps (Lou still needs to do):
  └── R2 bucket → docs/phase-3-cloudflare-r2-setup.md
  └── Sanity project init → docs/phase-3-doppler-setup.md §6
  └── Doppler secrets → docs/phase-3-doppler-setup.md
  └── Netlify site + GitHub secrets → docs/phase-3-netlify-github-secrets.md

Do NOT let engineering progress mask blocked legal work.
```

---

## 20. Automation Targets (Phase 5+)

Use `schedule` skill + `mcp__scheduled-tasks__*` to automate:
- Daily Supabase health check → Notion log
- Weekly Netlify deploy status → Airtable record
- Stripe webhook event audit → Gmail digest
- CI failure → immediate Notion incident record
- Phase end → auto-documentation across all 5 destinations

```javascript
// Load scheduler:
ToolSearch({ query: "select:mcp__scheduled-tasks__create_scheduled_task,mcp__scheduled-tasks__list_scheduled_tasks", max_results: 2 })
Skill({ skill: "anthropic-skills:schedule" })
```

---

*Authors: Claude (Cowork) + Lou*  
*Phase 1: 2026-04-24 · Phase 2: 2026-04-25 · Phase 3: 2026-04-26 · Phase 4: 2026-04-26*  
*Repo: DiggAiHH/elbtronika · docs/agent-ultraplan.md*
