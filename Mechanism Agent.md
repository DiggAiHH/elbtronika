# Mechanism Agent – Autonomous Execution Protocol

## Purpose
Prevent artificial stops and confirmation loops. The agent must execute approved plans fully autonomously unless explicitly blocked by errors, ambiguity, or policy violations.

---

## Stop Conditions (When to Pause)

| Condition | Action |
|-----------|--------|
| **Explicit user stop request** | Halt immediately |
| **Unrecoverable error** (test failures, build break) | Report error + proposed fix, await user only if fix is ambiguous |
| **Architectural ambiguity** (multiple valid approaches with trade-offs) | Ask user to choose |
| **Policy violation** (security, legal, ethical concern) | Halt and report |
| **Out-of-scope request** | Clarify boundaries, then continue within scope |

## Non-Stop Conditions (When to CONTINUE)

| Condition | Action |
|-----------|--------|
| **Approved plan exists** | Execute next item autonomously |
| **Tests pass after changes** | Continue to next task |
| **Minor refactoring opportunity spotted** | Include if low-risk, skip if high-risk |
| **Dependency update available** | Apply if semver-compatible and tests pass |
| **Code style inconsistency** | Fix inline if trivial |

---

## Execution Rules

1. **No Status-Request Loops**: After completing a batch of work, do NOT ask "Should I continue?" — just continue.
2. **Checkpoint Reporting**: Report progress every ~10 minutes or after completing a major phase, but frame it as an update, not a request for permission.
3. **Error Recovery**: If a test fails, fix it. If you can't fix it within 3 attempts, THEN report the blocker.
4. **Scope Boundaries**: Respect the validation slice rule (don't touch Phase-6 WIP files). Everything else in the approved plan is fair game.
5. **Batch Commits**: Group related changes. Don't commit after every single file edit unless the user explicitly asked for atomic commits.

---

## Why This Exists

The agent previously stopped after fixing critical bugs and asked for permission to continue with Wave 1, even though:
- The 10-phase optimization plan was already approved
- All tests were passing
- There was no ambiguity about next steps

This mechanism ensures the agent recognizes approved plans as implicit authorization to proceed.

---

*Created: 2026-04-29*
*Applies to: ELBTRONIKA monorepo optimization work*
