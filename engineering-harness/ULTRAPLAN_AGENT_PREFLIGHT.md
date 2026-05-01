# ULTRAPLAN Agent Pre-Flight Protocol v5

> Harness The Whole Knowledge.
> This is the execution protocol for Codex, Claude, Sonnet, GPT, and future agents working in this repo.
> Read this before the first meaningful tool call.

## -1. Agent Quickstart (5 Minutes)

If you are a fresh agent instance, do this in order:

1. Read this file fully.
2. Check stop rules in section 15.
3. Run hard preflight in section 1.
4. Confirm branch, working tree, and remote safety.
5. Pick verification command before first edit.
6. Ensure one run-log will be written for this prompt cycle.

## 0. Mission

Deliver correct code and true documentation with the least risk, fastest safe path, and complete traceability.

Success requires all of the following:

1. Correct branch and workspace state.
2. Correct file targets and verification command before edits.
3. Correct trust boundary handling for sensitive work.
4. Correct handoff and memory updates when done.

If one of these is unknown, stop and resolve it first.

## 1. Hard Preflight (First 120 Seconds)

1. `cd D:\Elbtronika\Elbtonika`
2. `git branch --show-current`
3. `git status --short`
4. Read `AGENTS.md` and `CLAUDE.md`.
5. Read `memory/OPSIDIAN_MEMORY.md` and latest handoff.
6. Read the last 3 run logs in `memory/runs/`.
7. Read `engineering-harness/PRE_FLIGHT_PROTOCOL.md` for system constraints.
8. Read `engineering-harness/COPILOT_AGENT_PREFLIGHT.md` for VS Code tool routing.
9. If scope includes auth, payments, deletion, MCP side effects, or public readiness claims, read `engineering-harness/HERMES_TRUST_HARNESS.md`.

Before any push-related work, run a targeted secret scan:

```powershell
rg -n "api[_-]?key|token|secret|BEGIN (RSA|OPENSSH) PRIVATE KEY|github_pat_" -g "!**/.git/**" -g "!**/node_modules/**" .
```

Do not edit until all 7 checks are done.

## 2. Execution Contract

Before first edit, state these internally and act accordingly:

1. Exact files to change.
2. Exact verification command.
3. Expected output signal for success.
4. Expected artifacts to update (docs, run log, handoff).

If any element is missing, do not start implementation.

## 3. Tool Priority (Local First)

Always prefer the cheapest reliable source of truth.

1. Read known file paths directly.
2. Use `rg`/search for unknown file locations.
3. Parallelize independent reads.
4. Use `apply_patch` for manual file edits.
5. Use formatter/linter tooling only on changed files during iteration.
6. Use browser automation only when runtime behavior must be proven.

Never use PowerShell redirection (`>`, `>>`) for source files.

## 3.1 Tool-Call Sequence (Default)

Use this order unless there is a clear reason not to:

1. Scope search (`search_subagent` or local search).
2. Direct file reads (`read_file`) for exact context.
3. Task tracking for multi-step work.
4. Edits via `apply_patch` (preferred) or `create_file` for new files.
5. Runtime verification via terminal/tests.
6. Error check and changed-files review before handoff.

## 3.2 Connector Activation Strategy

Activate the minimal tool surface first:

1. Local repo tools first.
2. GitHub/PR connectors only when local context is insufficient.
3. Browser automation only for real UI/runtime proof.
4. External docs lookup only when API behavior is uncertain.

## 4. Subagent Policy

Use subagents for real decomposition, not ceremony.

Use subagents when:

1. Exploration spans many modules.
2. Workstreams are independent and can run in parallel.
3. You need read-only mapping while local edits continue.

Do not delegate the immediate blocking step that depends on local context.

## 5. Model and Skill Routing

Use the minimum skill required.

| Task type | Preferred route |
| --- | --- |
| Focused code review | `code-review` |
| Explicit full PR review | `comprehensive-review` (only when explicitly requested) |
| Review with named model | `cross-review` |
| Browser behavior, screenshots, forms | `playwright` |
| UI design generation | `frontend-design` |
| Repo exploration | `research` or `Explore` agent |
| Planning before implementation | `plan` |

If no skill trigger applies, work directly in repo files.

## 6. Windows Guardrails

Required command style on this machine:

```powershell
pnpm.cmd install
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd --filter @elbtronika/web test -- --run
node_modules\.bin\biome.cmd check <changed-files>
git branch --show-current
git status --short
```

Mandatory constraints:

1. Use `.cmd` launchers for package tooling.
2. Keep Turborepo typecheck/build at `--concurrency=2` if OOM appears.
3. Re-check branch immediately after checkout operations.
4. Use UTF-8 safe file writes only.

## 7. Anti-Pattern Register

Stop and correct immediately if you detect any of these:

1. Editing before preflight was completed.
2. Assuming a feature is done because a file exists.
3. Placeholder tests treated as verification.
4. Runtime claims without runtime evidence.
5. Destructive git commands without explicit approval.
6. Trust-boundary operations without negative-path checks.

## 8. Verification Gates

Run the narrowest valid gate first, then expand only if needed.

Gate A (local scope): changed tests or targeted checks.
Gate B (package scope): package lint/typecheck/test.
Gate C (cross-package): monorepo-level checks when interfaces changed.

A task is not done until at least one relevant gate is green and evidence is recorded.

## 9. Trust Boundary Mode

Enable this mode for Hermes/MCP/auth/payments/deletion/public-readiness tasks.

Requirements:

1. Add one negative-path verification (denied action, role mismatch, invalid token, etc.).
2. Keep writes scoped and explicit.
3. Never log secrets, tokens, or private keys.
4. Mark simulated outputs as simulated.
5. Do not claim production readiness without direct proof.

## 10. Documentation Truth Rule

Documentation updates are allowed only when they reflect current verified behavior.

If verification failed or was not run:

1. Document limitations explicitly.
2. Do not promote readiness states.
3. Include exact blocker and next command.

## 11. Session Memory Discipline

Every meaningful run produces one five-line run log in `memory/runs/`.

One prompt cycle equals one run-log. No exceptions.

Naming convention:

`memory/runs/YYYY-MM-DD_Agent_Model-RunNN_topic.md`

Template:

```markdown
- **Datum:** YYYY-MM-DD
- **Agent/Model:** Agentname / Model
- **Task:** One-line objective
- **Outcome:** One-line result
- **Lesson:** One-line reusable lesson
```

Keep exactly five bullets. Put details in handoff files, not in the run log.

## 12. Handoff Minimum

If work spans sessions or agents, handoff must include:

1. Branch + HEAD.
2. Changed files.
3. Verification executed and status.
4. Open blockers.
5. Next command to run.

Then update `memory/OPSIDIAN_MEMORY.md` with links to the new run/handoff artifacts.

## 13. Quick Recovery Table

| Symptom | Immediate action |
| --- | --- |
| Branch mismatch | Check `git branch --show-current`, then stop and realign |
| OOM during typecheck | Use concurrency 2 and narrow scope |
| i18n key failures | Add keys in both locale message files before rerun |
| Merge marker parse errors | Search for conflict markers and resolve all |
| Empty directory confusion | Use `Test-Path` and explicit file reads |

## 14. Done Definition

Done means all four are true:

1. Code changes are applied.
2. Relevant verification passed or failure was documented precisely.
3. Docs and protocol references are updated to match reality.
4. Memory artifacts (run log/handoff/index) are updated when required.

If any item is false, task state is in-progress, not done.

## 15. Stop Rules

Stop and ask the user immediately if any of the following occurs:

1. Required credentials/tokens are missing for the requested operation.
2. Remote/branch state is unsafe or ambiguous.
3. You detect unrelated workspace mutations that may invalidate planned edits.
4. A requested operation would require destructive git commands.
5. A trust-boundary task cannot be verified safely with available tooling.

## 16. Anomaly Register Rule

If you hit a recurring environment or tooling failure pattern:

1. Record the symptom and workaround in a run-log lesson line.
2. Add or update a concise note in harness docs on next edit pass.
3. Do not hide flaky behavior behind optimistic status messages.
