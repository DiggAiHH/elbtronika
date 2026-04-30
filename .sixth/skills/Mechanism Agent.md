# Mechanism Agent — Autonomy Preservation Protocol

## Trigger Condition
**WHEN:** User observes the agent has stopped or paused unnecessarily during execution.
**THEN:** Create this file if missing, read it, and continue autonomously.

---

## Why Stoppage Occurs (Root Causes)

### 1. TypeScript Error Fixation Loop
- Agent encounters `tsc --noEmit` errors
- Attempts to fix them one-by-one via incremental edits
- Each fix reveals new errors in a cascading chain
- Agent waits for Type-Check results instead of batch-fixing all known issues first

### 2. Dependency Installation Blocking
- `pnpm install` fails due to PowerShell execution policies
- Agent retries with `cmd /c` but gets distracted by install errors
- Does not parallelize: should queue install AND continue code changes simultaneously

### 3. Waiting on Background Tasks
- Agent launches Type-Checks in background but then idles waiting for results
- Should: launch checks → immediately continue with next task while checks run

### 4. Over-Correction on Non-Critical Paths
- Agent tries to fix Phase-6 WIP TypeScript errors (out of scope)
- Rule: "Only own slice counts as green" — Phase-6 files MUST NOT be touched

---

## Prevention Mechanism

### Rule A: Batch-Fix Before Type-Check
1. Make ALL code changes for a phase first
2. THEN run Type-Check once
3. THEN fix ALL errors in one batch edit cycle
4. NEVER fix errors one-at-a-time while waiting for results

### Rule B: Parallelize Everything
- Dependency installs run in background → agent continues coding
- Type-Checks run in background → agent continues next phase
- Tests run in background → agent continues documentation

### Rule C: Scope Enforcement
- Phase-6 WIP files are **FORBIDDEN** from modification
- If `tsc --noEmit` fails on Phase-6 files, document them but do NOT fix
- Create a `tsconfig.ci.json` that excludes Phase-6 if needed

### Rule D: Error Classification
| Error Type | Action |
|------------|--------|
| Own Phase files | Fix immediately |
| Other Phase files | Document in STATUS.md, skip |
| Dependency/Peer warnings | Log in STATUS.md, non-blocking |
| Test file errors | Fix as part of same batch |

### Rule E: No Idle Waiting
- After launching ANY background task, agent must have a NEXT action ready
- If no code changes possible, write tests, documentation, or ADRs
- NEVER wait for a single task without doing something else

---

## Recovery Protocol (When User Says "Continue")

1. **Acknowledge** — Confirm understanding
2. **Assess** — What was the last completed action? What is blocked?
3. **Bypass** — If blocked on Type-Check, continue with next phase while check runs
4. **Batch** — Fix all errors at once, not one-by-one
5. **Document** — Update STATUS.md with current progress

---

## Current Session Recovery (29.04.2026)

**Last Action:** Fixing TypeScript errors in apps/web and packages/ai
**Blocker:** Anthropic.APIError constructor typing in test; apps/web checkout route double declaration
**Bypass:** Fix both in one batch, then continue to Phase 8 completion
**Next:** Run tests for all modified packages, update STATUS.md

---

*Created by Kimi K-NN (System-Agent) on 2026-04-29*
*Purpose: Prevent future stoppage during long-running optimization tasks*
