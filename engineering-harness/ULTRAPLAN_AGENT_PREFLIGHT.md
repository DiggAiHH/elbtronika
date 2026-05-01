# ULTRAPLAN Agent Pre-Flight Protocol

> Current harness layer for Codex, Claude, Kimi, Sonnet, GPT, and future code agents.
> Read this before the first meaningful tool call. It captures what worked on this Windows cowork machine.

## 0. First 90 Seconds

1. `cd D:\Elbtronika\Elbtonika`.
2. Run `git status --short` and `git branch --show-current`.
3. Read the active handoff, `STATUS.md`, `CLAUDE.md`, and `engineering-harness/PRE_FLIGHT_PROTOCOL.md`.
4. If the task touches auth, MCP, checkout, privacy, account deletion, Supabase writes, Stripe, or public readiness claims, also read `engineering-harness/HERMES_TRUST_HARNESS.md`.
5. Before editing, identify exact files, active branch, verification command, and run-log name.

## 1. Tool Call Rules

Use local context first:

- Known file contents: read the file directly with shell `Get-Content -Raw`.
- Unknown locations: use `rg` or `rg --files`; fall back only if `rg` is missing.
- Several independent reads: call them in parallel with `multi_tool_use.parallel`.
- Manual edits: use `apply_patch`; do not write code files with PowerShell redirection.
- Large mechanical formatting: run the repo tool, for example `node_modules\.bin\biome.cmd check --write <files>`.
- Browser/UI verification: use the Playwright skill when screenshots, responsive behavior, forms, or real browser checks matter.
- Internet/web: browse only for current external facts, official docs, or direct source attribution.
- Image assets: use the imagegen skill/tool only when a bitmap visual asset is actually needed.

Use subagents only when explicitly allowed by the user or when the environment request names parallel agents. Good delegation targets are independent read-only exploration, isolated file ownership, or verification that can run while local work continues. Never send the immediate blocking task away if the next step depends on it.

## 2. Skill And Plugin Routing

Load only the needed skill file, not the whole skill library.

| Work type | Skill/plugin |
| --- | --- |
| Code review | `code-review`; findings first with file/line references |
| Explicit comprehensive PR review | `comprehensive-review`; costly, only when named |
| Review with named model | `cross-review` |
| New or changed repo agent docs | `init` |
| UI, dashboard, landing page, mockup | `frontend-design`; then verify with browser when practical |
| Browser automation, screenshots, flows | `playwright` |
| New or modified Codex skills | `skill-creator` |
| Install skills | `skill-installer` |
| GitHub PR/issue/CI/publish work | GitHub plugin skills: `github:*` |
| Azure/OpenAI Foundry deployment/capacity | `microsoft-foundry` or its deploy/capacity subskills |
| OpenAI product/API docs | `openai-docs`; official OpenAI sources only |

Avoid skill overuse. A skill is a sharp tool, not a ceremony. If the task is a small local edit and no skill trigger applies, work directly.

## 3. Commands That Work Best Here

Always use Windows-safe commands:

```powershell
pnpm.cmd install
pnpm.cmd --filter @elbtronika/web test
pnpm.cmd --filter @elbtronika/web test -- --run
pnpm.cmd --filter @elbtronika/web test:e2e
pnpm.cmd typecheck
pnpm.cmd lint
node_modules\.bin\biome.cmd check <changed-files>
node_modules\.bin\biome.cmd check --write <changed-files>
git branch --show-current
git status --short
git commit -F D:\msg.txt
```

Observed best settings:

- Root `typecheck` uses `turbo run typecheck --concurrency=2` to avoid OOM.
- Prefer targeted Biome on changed files during iteration; full `pnpm.cmd lint` is a final gate.
- Prefer package-filtered tests over whole monorepo tests unless shared contracts changed.
- After checkout, immediately verify branch with `git branch --show-current`.
- For multiline commits, write a UTF-8 message file and use `git commit -F`.

## 4. Things To Avoid

- Do not use `pnpm`, `npm`, `npx`, or `biome` without `.cmd` on this Windows setup.
- Do not use PowerShell `>` or `echo` to create code files; it can create UTF-16/BOM damage.
- Do not assume a file or directory existing means the feature is implemented.
- Do not count `expect(true).toBe(true)` as a test.
- Do not use `@/` imports inside Vitest tests unless the local test config proves the alias works.
- Do not add `css.linter.rules` to Biome v2 config.
- Do not run destructive git commands or revert user work.
- Do not make production/payment/deletion side effects without explicit human approval.
- Do not let docs claim live readiness unless current runtime evidence proves it.

## 5. Implementation Loop

1. Inspect: read the specific files and nearest tests before editing.
2. Plan briefly: name the smallest safe slice and its verification.
3. Edit: use `apply_patch` for hand changes.
4. Verify locally: run the narrowest command that proves the change.
5. Broaden verification if shared behavior changed.
6. Update docs/memory only when they match runtime truth.
7. Commit after a green state when the session produced durable work.
8. Write the 5-line run log before handoff.

## 6. Memory Discipline

Every meaningful prompt/session gets a five-line run log:

`memory/runs/YYYY-MM-DD_Agentname_Model-RunNN.md`

Agentname is the active coding agent, model is the actual model family/version when known, and RunNN is the next run for that agent/model or a comparison run when the work spans agents.

Exact format:

```markdown
- **Datum:** YYYY-MM-DD
- **Agent/Model:** Agentname / Model
- **Task:** One line describing the prompt
- **Outcome:** One line describing what changed or what was decided
- **Lesson:** One line capturing the reusable harness lesson
```

Keep it to exactly five bullets. Longer context belongs in `memory/handoffs/`.

## 7. Session Handoff Rules

Use handoffs when work spans agents or branches:

- Path: `memory/handoffs/AGENT_SESSION_HANDOFF.md`.
- Include branch, HEAD, tests/lint/typecheck status, changed files, open blockers, and exact next commands.
- Update `memory/OPSIDIAN_MEMORY.md` with links to new handoffs and run logs.
- If branch confusion happened, record both the intended and actual branch.

## 8. Trust Boundary Add-On

For Hermes, MCP, checkout, privacy, account deletion, Supabase writes, Stripe, or live claims:

- Start with `HERMES_TRUST_HARNESS.md`.
- Add at least one negative test for role/auth/denial behavior.
- Audit denied and successful tool calls without logging secrets.
- Label simulated/demo outputs as simulated.
- Prefer read-only until writes are scoped and approved.

## 9. Quick Recovery

| Symptom | Action |
| --- | --- |
| Tests disappeared | `git log --all --full-history -- <path>` then recover with UTF-8 safe output |
| Wrong branch | Stop, record current branch, inspect commits, then move/cherry-pick intentionally |
| Turbo OOM | Ensure `--concurrency=2` is used |
| i18n runtime error | Add keys to both `apps/web/messages/de.json` and `apps/web/messages/en.json` before page code |
| Empty page directory | Use `Test-Path` and inspect contents; do not trust `Get-ChildItem` alone |
| Lint too slow | Run `node_modules\.bin\biome.cmd check <changed-files>` |
| Placeholder test | Replace with behavior assertions before calling the work done |

## 10. Done Means

Done means the code, docs, memory, and verification agree. The next agent should be able to read the active handoff plus this protocol and continue without rediscovering Windows command quirks, branch state, or test reality.
