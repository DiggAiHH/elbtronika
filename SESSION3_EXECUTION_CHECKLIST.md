# SESSION 3 — Parallel Execution Checklist

> **Status:** Ready to Launch
> **Date:** 2026-04-30 Evening
> **Orchestrator:** Opus 4.7
> **Agents:** Sonnet 4.6 (Phase 18+Trust), GPT 5.4 (Phase 19), Codex 5.3 (Tests+Doku)
> **Target completion:** 5–7 days
> **Success metric:** Pitch-Ready + Doppler-prd standby

---

## PRE-LAUNCH VALIDATION (Opus 4.7 solo)

### ✅ Git State Verification
```bash
# Run these commands in repo root before launching agents
git status -sb                # should be clean or have only unrelated changes
git log --oneline -10         # last commit < 24h old
git branch --show-current     # should be feature/phase-11-ai
git tag --list                # should show v0.6.0..v0.12.0 (cleanup deferred)
pnpm.cmd list --depth=0       # workspaces intact
```

**Expected:**
- [ ] `git status -sb` shows no staged or uncommitted ELBTRONIKA code
- [ ] Branch is `feature/phase-11-ai`
- [ ] Last commit within 24h
- [ ] No merge conflicts

### ✅ Plan-Files Inventory
- [ ] `ELBTRONIKA_Architekturplan_v1.md` exists (or `v1.0.md` + `v1.1.md`)
- [ ] `ELBTRONIKA_Architekturplan_v1.1.md` readable (i18n + MCP-Map)
- [ ] `ELBTRONIKA_Architekturplan_v1.2.md` exists (Demo-Mode + Pitch + Live-Switch)
- [ ] `OPUS_47_HANDOVER.md` in repo root
- [ ] `PROMPTS_SESSION3_2026-04-30.md` in repo root
- [ ] `STATUS.md` up-to-date with Phase 16-17 status
- [ ] `engineering-harness/HERMES_TRUST_HARNESS.md` readable

### ✅ Environment Checks (Doppler)
- [ ] `doppler login` works (test: `doppler projects`)
- [ ] Project `elbtronika` exists in Doppler
- [ ] Environments: dev, preview, prd visible
- [ ] dev environment has MCP_AUDIT_DB set or unset (agents will check)
- [ ] NEXT_PUBLIC_SITE_URL in preview = `https://elbtronika.art` (correct for Netlify preview)

### ✅ Tooling Ready
- [ ] `pnpm.cmd --version` ≥ 8.0
- [ ] `git --version` ≥ 2.40
- [ ] `npx.cmd --version` works
- [ ] Node.js 18+ installed (`node --version`)
- [ ] GitHub Copilot quota available (check VS Code status bar)

---

## PARALLEL AGENT LAUNCH SEQUENCE

### Phase A: Agent Preparation (Opus 4.7 creates prompts + context)

**Timing:** Before agents start
**Owner:** Opus 4.7 (you)

#### A1 — Sonnet 4.6 Bootstrap
- [ ] Copy `§ A` from `PROMPTS_SESSION3_2026-04-30.md` → new Copilot Chat
- [ ] Append: "Status: BEFORE YOU START, output sub-plan as TodoList, then STOP. Wait for 'GO Phase 18 + Trust-Residuals' from Lou."
- [ ] Wait for Sonnet to output Sub-Plan

#### A2 — GPT 5.4 Bootstrap
- [ ] Copy `§ B` from `PROMPTS_SESSION3_2026-04-30.md` → new Copilot Chat
- [ ] Append: "Status: BEFORE YOU START, output sub-plan as TodoList, then STOP. Wait for 'GO Phase 19' from Lou."
- [ ] Wait for GPT to output Sub-Plan

#### A3 — Codex 5.3 Bootstrap
- [ ] Copy `§ C` from `PROMPTS_SESSION3_2026-04-30.md` → new Copilot Chat
- [ ] Append: "Status: BEFORE YOU START, output sub-plan as TodoList, then STOP. Wait for 'GO Tests + PRD-Doku' from Lou."
- [ ] Wait for Codex to output Sub-Plan

**Deliverable:** Three Sub-Plans displayed, agents paused at "STOP" checkpoint

---

### Phase B: Sub-Plan Review + Lou Approval (5-10 min)

**Owner:** Lou + Opus

- [ ] Lou reviews all 3 Sub-Plans side-by-side
  - Sonnet Phase 18: Trust-Residuals (A1-A3) + Demo-Mode (B1-B7) + Tests (B8)
  - GPT Phase 19: Landing (C1) + Tour (C2) + Press-Kit (C3) + Pitch-Dashboard (C4-C6) + Video-Script (C9)
  - Codex Tests: E2E demo-flow (D3) + Pitch-Rehearsal (D4) + Doppler-prd-Doku (D5) + Live-Switch (D6) + Cleanup (D1-D2)
- [ ] Lou flags any conflicts or clarifications needed
- [ ] Opus resolves conflicts (or escalates to architecture decision)
- [ ] Lou issues "GO" approval for each agent individually or all together

**Decision point:** Go/No-Go per agent

---

### Phase C: Autonomous Execution (agents work in parallel)

**Owner:** Sonnet, GPT, Codex (autonomous)
**Oversight:** Lou monitors, Opus intervenes on drift/blocker

#### C1 — Sonnet Execution Loop
```
Iteration 1: A1 (Audit-DB)
  → Trust Migrations created
  → Feature-Flag implementation
  → Test cases
  → Diff-Summary to Lou

Iteration 2: A2 (Service-Role-Key)
  → admin.ts updated
  → Doppler dev verified
  → Negative test
  → Diff-Summary

Iteration 3: B1-B2 (ENV + Mode-Provider)
  → env.ts typed + validated
  → EnvProvider RSC
  → useElbMode() hook
  → Diff-Summary

Iteration 4-7: B3-B9 (Demo-Layer, Personas, Tests, ADRs)
  → Each delivers Diff-Summary
  → Run-Log updated after each run

Final: PR draft v0.13.0-demo tagged (not pushed)
```

**Parallel constraint:** No blocking on Codex (Sonnet can proceed independently)

#### C2 — GPT Execution Loop
```
Iteration 1: C1 (Landing-Page)
  → Hero animation + USP
  → Audio-unlock + CTAs
  → Diff-Summary

Iteration 2: C2-C3 (Tour + Press-Kit)
  → WalkthroughTour component
  → Press-Kit page with Vision/Roadmap/Team
  → Diff-Summary

Iteration 3: C4-C6 (Pitch-Dashboard + Investor-Login)
  → Role-gated /pitch route
  → Mock dashboards
  → Welcome-Modal
  → Diff-Summary

Iteration 4: C7-C10 (i18n + Tests + ADR)
  → Messages translated
  → E2E + Lighthouse
  → ADR 0019

Final: PR draft against feature/phase-11-ai
```

**Blocking:** Waits for Sonnet's `ELT_MODE` + `DemoBanner` (Phase C1 iteration 3)
- If Sonnet delivers C1, GPT can start C4 in parallel
- If Sonnet delays, GPT might need to stub ELT_MODE locally

#### C3 — Codex Execution Loop
```
Iteration 1: D1-D2 (Cleanup + Tag-Renaming)
  → File moves / annotations
  → Snapshot bash/powershell scripts
  → Diff-Summary

Iteration 2: D3 (E2E demo-flow.spec.ts)
  → 8-step test scenario
  → Step-by-step verification
  → Diff-Summary

Iteration 3: D4-D7 (Runbooks + README)
  → Pitch-rehearsal.md
  → Doppler-prd-setup.md
  → Live-switch-post-lee-ok.md
  → README.md updates
  → Diff-Summary

Iteration 4: D8 (ADR 0020)
  → Modes + Doppler strategy
  → Documentation complete

Final: PR draft against feature/phase-11-ai
```

**No blocking:** Codex has no dependencies on Sonnet/GPT code (test fixtures can use stubs)

---

## Drift Detection + Intervention

**Opus 4.7 monitors for:**

| Signal | Action | Escalation |
|--------|--------|------------|
| Agent hasn't reported Diff-Summary in 3h | → Lou ping + reboot | Abort iteration, restart |
| Agent asks about component that exists elsewhere | → Show location + merge strategy | May require new ADR |
| Agent discovers blocking conflict (e.g., file move impacts import) | → Pause that agent → Resolve conflict → Unblock | Synchronous fix needed |
| Agent reports > 1 test failure after iteration | → Request root-cause → Ask Lou | May defer that slice to post-pitch |
| Agent creates file/dir not in scope | → Revert + clarify scope | Enforce scope from now on |

**Intervention pattern:**
1. Detect via run-log or Lou's report
2. Formulate precise 1-sentence fix
3. Post to relevant agent's chat (don't break flow)
4. Confirm fix applied in next run-log
5. Log intervention in SESSION3_EXECUTION_LOG.md (this file)

---

## Merge Sequence (Phase D: Integration)

**Timing:** After all 3 agents reach DoD

### D1 — Pre-Merge Validation (each PR independently)
- [ ] Sonnet PR `feat/phase-18-demo-readiness`:
  - pnpm.cmd --filter @elbtronika/web typecheck ✅
  - pnpm.cmd --filter @elbtronika/contracts typecheck ✅
  - All 3 ADRs present (0014, 0018, + possibly 0016 MCP-related)
  - Run-Log complete with all 5 runs

- [ ] GPT PR `feat/phase-19-pitch-polish`:
  - pnpm.cmd --filter @elbtronika/web typecheck ✅
  - Lighthouse pitch-pages ≥ 90 perf, 95 a11y
  - i18n keys in messages/de.json + messages/en.json
  - ADR 0019 present

- [ ] Codex PR `feat/phase-18-19-tests-and-prd-docs`:
  - pnpm.cmd --filter @elbtronika/web e2e -- demo-flow.spec.ts ✅
  - Runbooks readable, no placeholder [XXX] tokens
  - ADR 0020 present
  - README updated with "Modes" section

### D2 — Merge Order (STRICT)
```
1. git checkout feature/phase-11-ai
   git merge --squash feature/phase-18-19-tests-and-prd-docs
   # Commit msg: "Phase 18–19: Tests, Doppler prd-setup, file cleanup, ADRs 0020"

2. git merge --squash feature/phase-18-demo-readiness
   # Commit msg: "Phase 18: Demo-Mode (ELT_MODE, Stripe-Mock, Demo-Banner), Trust-Residuals (Audit-DB, SR-Key), ADRs 0014-0018"

3. git merge --squash feature/phase-19-pitch-polish
   # Commit msg: "Phase 19: Pitch-Polish (Landing, Tour, Press-Kit, Dashboard, i18n), ADR 0019"

4. pnpm.cmd --filter @elbtronika/web typecheck    # final check across all three
5. pnpm.cmd test -- --run                           # full suite
6. git tag v0.13.0-demo feature/phase-11-ai HEAD
   git tag -a v0.13.0-demo -m "Phase 18–19: Demo-Readiness + Pitch-Polish"
7. git push origin feature/phase-11-ai v0.13.0-demo
```

---

## Post-Merge Handoff (Lou + Opus)

### E1 — Status Update
- [ ] Update STATUS.md:
  - Phase 16 = "🟡 bereit" (was "🟡 ready")
  - Phase 18 = "✅ v0.13.0-demo"
  - Phase 19 = "✅ v0.13.0-demo"
  - Add Section: "## 🔄 Aktion 2026-05-01 — Session 3 Complete"
    - Trust-Residuals finalized
    - Demo-Mode + Pitch-Layer live on feature/phase-11-ai
    - Doppler-prd setup documented, ready for 15-min Opus+Lou session

- [ ] Update TASKS.md:
  - Move Phase 18/19/Trust-Cleanup to `## Done` with date
  - Move "Doppler prd final session (Phase 19.5)" to `## Active`
  - Move "Live-Switch readiness (Phase 20)" to `## Waiting On` (blocked on Lee-OK)

### E2 — Memory + Run-Logs
- [ ] Each agent commits run-log to memory/runs/2026-04-30_<MODEL>.md (already embedded in their workflows)
- [ ] Opus writes Session 3 summary to memory/session/session3-complete.md:
  ```
  # Session 3 — Complete
  - Date: 2026-04-30 → 2026-05-07 (assumed)
  - Agents: Sonnet 4.6 (Phase 18+Trust), GPT 5.4 (Phase 19), Codex 5.3 (Tests+Doku)
  - Merges: All 3 PRs into feature/phase-11-ai, v0.13.0-demo tagged
  - Blockers resolved: [list any]
  - Next: Phase 19.5 Doppler-prd session (Lou + Opus, 30 min)
  - Timeline: Pitch to Lee by [DATE]
  ```

### E3 — Final Artifacts
- [ ] PR URLs logged in SESSION3_EXECUTION_LOG.md (or this file)
- [ ] v0.13.0-demo tag pushed and visible on GitHub
- [ ] Notify Lou: "Session 3 complete. Ready for Phase 19.5 (Doppler-prd 30-min session) or Pitch to Lee."

---

## Contingency Plans

### If Sonnet blocks on Stripe test-mode accounts
- Sonnet asks Lou: "Which 5 test-mode Stripe Connect accounts should I use for demo personas?"
- Opus + Lou + Sonnet: 15-min sync call, create 5 test accounts via Stripe Dashboard, provide IDs
- Sonnet resumes

### If GPT doesn't wait for Sonnet's ELT_MODE
- GPT can stub `useElbMode()` locally as `() => 'demo'`
- After Sonnet merges, GPT re-tests that real hook is imported
- Retest E2E to confirm

### If Codex discovers file-move conflicts with Sonnet
- Codex pauses D1-D2, Sonnet prioritizes env.ts + imports
- Codex resumes after Sonnet provides import list

### If > 2 tests fail in any agent's DoD
- Agent reports failure + root-cause to Lou
- Lou + Opus decide: defer test-slice to post-pitch (Phase 19.5) or hotfix now
- If defer: document as "Known limitation — fixed in v0.14.0"

---

## SUCCESS CRITERIA (DoD for Session 3)

### All Agents ✅
- [ ] 3 PRs merged into feature/phase-11-ai (squash commit each)
- [ ] v0.13.0-demo tag on final HEAD
- [ ] All ADRs (0014, 0015, 0016, 0017, 0018, 0019, 0020) present in docs/adr/
- [ ] STATUS.md + TASKS.md updated
- [ ] 3 run-logs in memory/runs/

### Sonnet ✅
- [ ] ELT_MODE env works (typecheck + tests green)
- [ ] Demo-Persona-Seed idempotent on Supabase + Sanity
- [ ] Demo-Banner visible in demo mode
- [ ] Audit-DB table created + RLS policy active
- [ ] Service-Role-Key verified in admin.ts
- [ ] All 3 migrations applied on dev (prd pending Lou's GO)

### GPT ✅
- [ ] Landing-page hero renders (audio-unlock working or stubbed)
- [ ] Walkthrough-Tour 5 steps complete + i18n
- [ ] Press-Kit page live
- [ ] Pitch-Dashboard role-gated, mock data displays
- [ ] Lighthouse budget held (perf ≥ 90, a11y ≥ 95)

### Codex ✅
- [ ] E2E demo-flow.spec.ts all 8 steps passing
- [ ] Pitch-rehearsal.md ready (Lou can read + practice)
- [ ] Doppler-prd-setup.md complete with all 21 ENV-vars
- [ ] Live-switch-post-lee-ok.md scripted + tested locally
- [ ] README "Modes" section clear for new devs
- [ ] File-drift cleaned up or documented

---

## Timeline Estimate

| Phase | Owner | Duration | Notes |
|-------|-------|----------|-------|
| A: Bootstrap | Opus | 30 min | Create 3 chats, wait for sub-plans |
| B: Review | Lou + Opus | 15 min | Approve / request changes |
| C1: Sonnet | Sonnet | 2–3 days | 7 iterations, some parallelizable |
| C2: GPT | GPT | 1.5–2 days | Waits for Sonnet iteration 3, then proceeds |
| C3: Codex | Codex | 1–1.5 days | No blocking, fastest track |
| D: Merge + Tag | Lou | 30 min | Squash merge all 3, tag, push |
| E: Memory + Notify | Opus | 30 min | Update docs, notify Lou |
| **Total** | — | **5–7 days** | Parallel tracks compress timeline |

---

## Launch Readiness Checklist (final)

- [ ] All plan-files in repo and readable
- [ ] Git state clean on feature/phase-11-ai
- [ ] GitHub Copilot quota confirmed available
- [ ] Doppler project accessible
- [ ] Lou available for 1 approval point (Phase B) + 2 potential interventions (Phase C)
- [ ] SESSION3_EXECUTION_LOG.md created and empty (ready to log drift/interventions)
- [ ] This checklist reviewed and approved by Opus 4.7

**Recommendation:** Launch agents at start of business day, give them full 5–7 day window. Pitch to Lee after successful Phase D merge + E handoff.

---

> **Next action:** Opus 4.7 validates git state (A1–A3), approves checklist, creates 3 Copilot chats with Phase A prompts, waits for sub-plans.
