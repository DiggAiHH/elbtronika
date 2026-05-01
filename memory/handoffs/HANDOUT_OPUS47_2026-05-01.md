# Handout for Claude Work (Opus 4.7)

<!-- markdownlint-disable MD022 MD032 -->

Date: 2026-05-01
Owner: Elbtronika engineering session handoff
Target agent: Opus 4.7

## 1) Mission
Bring the current optimization wave to final merge-ready quality by finishing targeted hardening, preserving deterministic ML behavior, and validating only the affected slices.

## 2) Current state (already completed)
- ML and pipeline deep-scan completed.
- Bottlenecks identified and high-impact optimizations implemented.
- Harness protocol updated and lint-stabilized.
- Targeted checks passed for web and flow package typechecks.

## 3) Files with core changes in this wave
- AGENTS.md
- apps/web/__tests__/press/press-kit.test.tsx
- apps/web/__tests__/supabase/admin.test.ts
- apps/web/app/api/flow/analyze/route.ts
- apps/web/app/api/flow/match/route.ts
- apps/web/e2e/demo-flow.spec.ts
- packages/audio/src/engine/SpatialAudioEngine.ts
- packages/flow/src/match.ts
- engineering-harness/COPILOT_AGENT_PREFLIGHT.md
- memory/runs/2026-05-01_Copilot_Sonnet46-Run01.md
- memory/runs/2026-05-01_Copilot_Sonnet46-Run02.md
- memory/runs/2026-05-01_Copilot_Sonnet46-Run03.md
- memory/runs/2026-05-01_Copilot_Sonnet46-Run04.md

## 4) What must stay true (do not regress)
1. Simulated analysis in flow/analyze route must remain deterministic (seeded, not random per call).
2. flow/match route must prefer artwork_features rows from DB and only fallback when missing.
3. Similarity math must never return NaN from empty or mismatched vectors.
4. Harness doc stays actionable and stable for markdown lint in this workspace.

## 5) Immediate execution plan for Opus 4.7
1. Re-read changed files and verify no accidental semantic drift.
2. Add small guardrails only where impact is clear:
   - Input clamping where dynamic payload fields can exceed expected ranges.
   - Defensive parsing for optional arrays and numeric fields in route payload creation.
3. Keep tests narrow and fast.
4. If all checks pass, prepare one focused commit for this optimization wave.

## 6) Validation commands (Windows PowerShell)
Run from D:\Elbtronika\Elbtonika

- pnpm.cmd --filter @elbtronika/web typecheck
- pnpm.cmd --filter @elbtronika/flow typecheck
- npx.cmd vitest run apps/web/__tests__/press/press-kit.test.tsx apps/web/__tests__/supabase/admin.test.ts --passWithNoTests

Optional only if touched:
- If route logic changes significantly, run only nearest route or integration tests.
- Avoid full monorepo runs unless shared contracts changed.

## 7) Quality gate before commit
All must be true:
- No new type errors in modified packages.
- No deterministic-behavior regressions in simulated mode.
- No fallback-only regression when artwork_features exists.
- No harness markdown lint noise in the preflight file.

## 8) Commit guidance
Use one focused commit for this wave.
Recommended structure:
- feat(flow): harden deterministic matching and route feature sourcing
or
- chore(harness): stabilize preflight protocol and validation workflow

## 9) Risks to watch during updates
- Reintroducing Math.random in simulated API responses.
- Breaking match behavior by changing embedding dimensions inconsistently.
- Over-broad validation that slows iteration and masks root causes.
- Accidental edits outside this wave's file set.

## 10) Deliverables Opus 4.7 should produce
1. Final code deltas with minimal scope.
2. Command outputs summarized (not raw logs only).
3. One clear done-state report with:
   - What changed
   - Why it is safer/faster
   - Which checks passed
4. Ready-to-merge commit (only if explicitly requested by user at execution time).

<!-- markdownlint-enable MD022 MD032 -->
