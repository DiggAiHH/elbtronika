# Opus 4.7 Plan-Update Handoff

> Copy-paste this into Anthropic Opus 4.7.
> Goal: update the ELBTRONIKA architecture/execution plan from current repo truth, not from memory alone.

---

## Role

You are Opus 4.7 acting as planning architect for ELBTRONIKA. Your job is to update the architecture/execution plan after Session 3 gap-fill, recovery, and harness consolidation.

Do not implement product code unless the plan update requires a tiny documentation fix. Prefer precise plan edits, merge sequencing, and agent prompts.

---

## Bootstrap First

```powershell
cd D:\Elbtronika\Elbtonika
git status --short
git branch --show-current
git log --oneline -5
```

Expected branch at handoff time:

`feature/phase-18-19-tests-and-prd-docs`

Important: after any checkout, immediately run `git branch --show-current`. Branch confusion already happened once in PowerShell.

---

## Read These Files In This Order

1. `engineering-harness/ULTRAPLAN_AGENT_PREFLIGHT.md`
2. `engineering-harness/PRE_FLIGHT_PROTOCOL.md`
3. `memory/handoffs/KIMI_SESSION_3_HANDOFF.md`
4. `memory/handoffs/OPUS_48_HANDOFF.md`
5. `memory/OPSIDIAN_MEMORY.md`
6. `STATUS.md`
7. `TASKS.md`
8. `ELBTRONIKA_Architekturplan_v1.3.md`
9. `PLAN_SESSION_3_GAPFILL.md`

If your plan touches auth, MCP, checkout, privacy, account deletion, Supabase writes, Stripe, or public live-readiness claims, also read:

`engineering-harness/HERMES_TRUST_HARNESS.md`

---

## Current Ground Truth

### Harness

New current protocol exists:

`engineering-harness/ULTRAPLAN_AGENT_PREFLIGHT.md`

It is now the clean current layer for tool-call timing, skill/plugin routing, Windows-safe commands, and 5-line run-log discipline. `PRE_FLIGHT_PROTOCOL.md` remains the historical v2 trap catalogue.

### Branch A: Codex 5.3 / tests and PRD docs

Branch: `feature/phase-18-19-tests-and-prd-docs`

Known state from handoffs:

- 62 tests passing, 13 suites.
- Lint green.
- E2E `demo-flow.spec.ts`.
- Runbooks: pitch rehearsal, Doppler prd setup, live-switch.
- Validation scripts: `scripts/validate-doppler-prd.ps1` and `.sh`.
- README updated with Windows `.cmd` commands.
- ADR 0022 for modes and Doppler strategy.
- New ULTRAPLAN protocol layer added after Kimi handoff.

### Branch B: Sonnet 4.6 / demo readiness

Branch: `feature/phase-18-demo-readiness`

Known complete:

- `env.ts` with `ELT_MODE`.
- Stripe demo layer with mock accounts.
- MCP audit helper.
- Demo banner, provider, hook.
- Service-role admin client.
- Shop demo/live/staging filtering.
- Demo seed and demo asset stubs.
- Admin negative tests.

Manual Lou-only or external tasks remain:

- Apply Supabase migrations to dev.
- Verify migration list.
- Verify Doppler service-role key.
- Generate/license real demo assets.

### Branch C: GPT 5.4 / pitch polish

Branch: `feature/phase-19-pitch-polish`

Known complete:

- Walkthrough tour.
- Investor welcome modal.
- Landing page.
- Demo video script.
- ADR 0019.

Important branch issue:

Some GPT gap-fill work landed on `feature/phase-18-19-tests-and-prd-docs`, not on the GPT branch:

- `press/page.tsx`
- `pitch/page.tsx`
- `checkout/page.tsx`
- real dashboard and press tests
- i18n message additions

Plan must explicitly account for this in merge order.

---

## What You Must Produce

Update the plan, preferably by editing `ELBTRONIKA_Architekturplan_v1.3.md` if it is still the active plan. If v1.3 is already treated as closed, create `ELBTRONIKA_Architekturplan_v1.4.md` and mark v1.3 as predecessor.

The updated plan must include:

1. Current branch/merge map.
2. Phase 18/19 reality after gap-fill and Opus recovery.
3. Phase 20 as the next top priority.
4. Exact merge recommendation:
   - Safe default: merge Codex branch into `feature/phase-11-ai`, merge Sonnet branch, then handle GPT branch plus gap-fill commits deliberately.
   - Call out that GPT gap-fill is already on the Codex branch.
5. Remaining blockers:
   - `packages/three/src/components/Room.tsx:66` type error.
   - console/logger cleanup.
   - `noBarrelFile` warnings.
   - Dependabot moderate vulnerabilities.
   - Supabase migrations.
   - Doppler prd/demo values.
   - real demo asset licensing.
6. Next agent prompts for:
   - Codex cleanup and E2E.
   - Sonnet live-switch.
   - GPT pitch-polish final.
7. Verification ladder:
   - targeted tests first,
   - targeted Biome,
   - `pnpm.cmd typecheck`,
   - full lint only as final gate.
8. Memory discipline:
   - exact 5-line run log in `memory/runs/YYYY-MM-DD_Opus_47-RunNN.md`.

---

## Commands That Work Best Here

Use `.cmd` on Windows:

```powershell
pnpm.cmd --filter @elbtronika/web test
node_modules\.bin\biome.cmd check <changed-files>
pnpm.cmd typecheck
pnpm.cmd lint
```

Do not use PowerShell `>` to write code or markdown recovery files. Use the editor/tooling or UTF-8-safe writes.

---

## Known Traps

- Do not trust file existence. Read contents.
- Placeholder tests are not tests.
- `@/` aliases can fail in Vitest tests; use relative imports unless config proves otherwise.
- Add i18n keys to both `apps/web/messages/de.json` and `apps/web/messages/en.json` before page code.
- Do not mark live readiness without runtime evidence.
- Do not alter user changes or reset the worktree.
- Do not run production Stripe, deletion, or migration side effects without Lou approval.

---

## Deliverables

1. Updated architecture plan file.
2. Optional short plan-update handoff if important decisions remain.
3. `memory/OPSIDIAN_MEMORY.md` index update if you add a new plan/handoff.
4. Exactly one 5-line run log.

End state should let Codex/Sonnet/GPT pick up Session 4 without rediscovering branch state, Windows command quirks, or gap-fill truth.
