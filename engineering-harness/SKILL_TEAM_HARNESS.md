# Skill-Team Harness - Installed Codex Skills

> Purpose: turn installed external skills into explicit ELBTRONIKA operating lanes.
> Read this after `PRE_FLIGHT_PROTOCOL.md` when a task touches browser proof, Hermes/MCP,
> token compression, Obsidian memory, or demo video work.

## 0. Team Contract

Installed skill roots:

| Skill lane | Installed path | Primary use |
| --- | --- | --- |
| Browser Harness | `C:\Users\Moin\.codex\skills\browser-harness\SKILL.md` | Runtime UI proof, screenshots, browser mechanics |
| Hermes Agent | `C:\Users\Moin\.codex\skills\hermes-agent\SKILL.md` | Agent runtime, MCP, trust boundaries |
| Caveman | `C:\Users\Moin\.codex\skills\caveman\SKILL.md` | Terse output and token discipline |
| Obsidian | `C:\Users\Moin\.codex\skills\obsidian\SKILL.md` | Memory index, run logs, handoffs, vault notes |
| Remotion | `C:\Users\Moin\.codex\skills\remotion-best-practices\SKILL.md` | Demo video and future Remotion package |

Default rule: read the skill file first, then route work through the smallest lane that proves the claim.
If the lane needs credentials, a running browser, a dev server, GPU access, or live payment/storage state,
mark it as runtime-gated and do not claim execution.

Validation entrypoint:

```powershell
node .\scripts\validate-skill-team.cjs
```

## 1. Browser Harness Lane

### Ten Owned Tasks

1. Define browser preflight routing for ELBTRONIKA agents.
2. Maintain `@elbtronika/browser` MCP tool contract docs for navigate, click, type, snapshot, screenshot, and close.
3. Document the current implementation gap: installed `browser-harness` targets a user Chrome/CDP session, while repo `packages/browser` currently launches Playwright.
4. Add reusable browser runbooks for screenshots, auth walls, domain notes, and failed UI proof handoffs.
5. Runtime-smoke public routes with screenshots: home, shop, press, pitch, gallery, and localized routes.
6. Drive shop/cart/checkout flows, including negative paths and Stripe test-mode surfaces.
7. Verify login-gated, admin, CMS, and PM flows; stop at auth walls unless the user provides a valid session/profile.
8. Validate immersive gallery canvas behavior: nonblank render, movement, viewport fit, WebGL/WebGPU fallback, and visible state.
9. Debug browser mechanics: iframes, dialogs, uploads, downloads, shadow DOM, cross-origin Stripe/Sanity UI.
10. Convert successful exploratory browser runs into durable Playwright e2e tests.

### Executed Now

- Added this lane and routing contract to the preflight harness.
- Captured the repo/browser-harness mismatch as a known decision point.
- Added validation hooks that check for the installed skill and repo browser package.

### Runtime-Gated

Tasks 5-10 require a running dev server, browser/session, credentials, or GPU/runtime proof.
Use the existing Playwright tests first unless the task specifically needs the installed `browser-harness`
CDP workflow.

### Routing Rules

- Use local reads/search first.
- Use browser automation only when visible runtime behavior must be proven.
- Screenshot before the first meaningful action and after every meaningful action.
- Stop at auth walls; do not type credentials from screenshots.
- If a browser run discovers a durable site mechanic, convert it into a Playwright test or a domain note.

### Validation

```powershell
pnpm.cmd --filter @elbtronika/browser typecheck
pnpm.cmd --filter @elbtronika/web test:e2e -- e2e/chromium-ultraplan-smoke.spec.ts --project=chromium
browser-harness -c 'new_tab("http://localhost:3000"); wait_for_load(); print(page_info())'
```

## 2. Hermes Agent Lane

### Ten Owned Tasks

1. Keep ADR/runtime truth aligned: ELBTRONIKA uses a TypeScript Hermes-inspired runtime, not direct Nous Hermes.
2. Own plan, execute, observe, reflect, and learn behavior in `packages/agent`.
3. Keep memory claims true: episodic memory is currently in-process; task state is DB-backed via `agent_tasks`.
4. Enforce auth plus curator/admin role gates for agent and MCP APIs.
5. Own MCP allowlist and risk classes; blocked write/payment tools stay blocked.
6. Keep `/api/mcp/tools` discovery parity with `/api/mcp/invoke` allowlist behavior.
7. Own canonical `server/tool` identity across routes, prompts, and `MCPClient`.
8. Own audit durability for allowed and denied MCP calls without logging secrets.
9. Own durable task execution semantics: idempotency, `run_id`, terminal state, and queue/worker migration.
10. Own honesty labels for simulated analysis in MCP audio outputs and flow APIs.

### Executed Now

- Added the lane contract and trust-boundary routing to this harness.
- Linked Hermes work back to `HERMES_TRUST_HARNESS.md` instead of treating the external Hermes CLI as project truth.
- Added validation guidance for agent, MCP, and web API slices.

### Runtime-Gated

Live `hermes doctor`, gateway/profile/toolset checks, real LLM planning, Supabase-backed audit,
and payment/delete/transfer side effects require local config, credentials, or explicit human approval.

### Routing Rules

- Private/read-only by default.
- Identify the boundary first: auth, role, privacy, payment, deletion, or public readiness claim.
- Require negative-path proof for trust claims: anonymous `401`, wrong-role `403`, blocked tool, or invalid token.
- Enforce canonical `server/tool` before invocation.
- Audit every attempt without secrets.
- Mark simulated outputs as `source: "simulated"`.

### Validation

```powershell
pnpm.cmd --filter @elbtronika/mcp test
pnpm.cmd --filter @elbtronika/agent test
pnpm.cmd --filter @elbtronika/mcp typecheck
pnpm.cmd --filter @elbtronika/agent typecheck
pnpm.cmd --filter @elbtronika/web typecheck
```

## 3. Caveman Lane

### Ten Owned Tasks

1. Enforce terse, technically exact output.
2. Switch `/caveman lite|full|ultra` and exit on `normal mode`.
3. Keep code blocks and quoted errors unchanged.
4. Compress `CLAUDE.md` and memory after phase DoD when context grows.
5. Produce terse status updates and run-log summaries.
6. Produce terse commit/review drafts while preserving normal English where required.
7. Compress subagent prompts while keeping necessary context.
8. Flag verbose protocol sections for later shrink.
9. Pair with `codeburn` to reduce token waste.
10. Auto-disable compression for safety, ambiguity, or irreversible operations, then resume.

### Executed Now

- Added the lane to preflight skill routing.
- Added explicit auto-clarity stop rules for trust and irreversible operations.
- Kept generated docs in normal technical English where compression would reduce clarity.

### Safety-Off Rules

Disable compression for security warnings, irreversible actions, ordered multi-step procedures,
ambiguous migrations/deletes, user clarification requests, service-role keys, RLS, webhooks,
MCP audit/role gates, Stripe/Supabase writes, and public live/ready claims.

### Validation

```powershell
rg -n "caveman|normal mode|caveman:compress|Auto-Clarity|Safety-Off" CLAUDE.md engineering-harness docs
```

## 4. Obsidian Lane

### Ten Owned Tasks

1. Maintain the `memory/OPSIDIAN_MEMORY.md` index contract.
2. Enumerate and summarize run logs under `memory/runs`.
3. Enumerate and summarize handoffs under `memory/handoffs`.
4. Validate Obsidian wikilinks and explicit memory paths.
5. Detect memory index drift: files present but not indexed, or indexed paths missing on disk.
6. Produce session-start memory briefs from latest run logs and handoffs.
7. Cross-check preflight references between memory and harness docs.
8. Flag stale or conflicting protocol guidance.
9. Preserve quoted Windows vault paths and Obsidian wikilink conventions.
10. Prepare read-only memory/preflight reports before implementation work.

### Executed Now

- Added this lane to the harness and memory discipline.
- Added a validator path for installed skill files and optional memory reference checks.
- Updated `OPSIDIAN_MEMORY.md` with this harness run.

### Vault Rules

- Respect `OBSIDIAN_VAULT_PATH` if set.
- If unset, do not assume the project repo is the user's personal vault.
- Always quote vault paths because spaces are expected.
- Use `-LiteralPath` for Windows paths, especially folders like `[locale]`.
- Do not write private vault notes unless the user asks for vault writes.

### Validation

```powershell
node .\scripts\validate-skill-team.cjs --strict-memory
rg -n "\[\[[^\]]+\]\]|memory/(handoffs|runs)/|PRE_FLIGHT_PROTOCOL" memory\OPSIDIAN_MEMORY.md
```

## 5. Remotion Lane

### Ten Owned Tasks

1. Own future `apps/video` Remotion scaffold when approved.
2. Convert `docs/marketing/demo-video-script.md` into scene/composition structure.
3. Enforce the current 60-90s demo video target.
4. Replace `/press` video placeholder with a real video/embed asset path later.
5. Validate pitch-facing video copy against ADR 0019 commitments.
6. Build captions as JSON `Caption[]`, not raw SRT embedded in app code.
7. Guard Remotion code against CSS transitions, CSS animations, and Tailwind animation classes.
8. Define frame-accurate dimensions, fps, and duration in `Root.tsx`.
9. Inventory usable demo media from `docs/demo-assets-license.md` and `public/demo/*`.
10. Add render validation commands for Studio and one-frame stills.

### Executed Now

- Added the Remotion lane as future-scaffold guidance.
- Recorded that no Remotion package exists today, so no render claim is allowed.
- Added press/pitch/video validation guidance and forbidden animation checks.

### Future Scaffold Gate

Only scaffold a Remotion app when the user approves:

```powershell
npx.cmd create-video@latest --yes --blank --no-tailwind apps/video
```

Then use `useCurrentFrame`, `interpolate`, `Sequence`, `staticFile`, and a one-frame render check.

### Validation

```powershell
rg -n -i --glob "!node_modules/**" "remotion|@remotion|create-video" package.json pnpm-lock.yaml apps packages docs scripts
rg -n "transition|animation|animate-" apps/video packages/video
npx.cmd remotion still <composition-id> --scale=0.25 --frame=30
```

## 6. Execution Ledger

Executed in this harness pass:

1. Five read-only subagents inspected the installed skills and repo-specific targets.
2. Each skill lane produced exactly ten owned tasks.
3. Runtime-gated tasks were separated from tasks that can be completed as docs/scripts now.
4. Preflight routing was centralized in this document.
5. A local validator was added at `scripts/validate-skill-team.cjs`.
6. Existing preflight docs were cross-linked to this harness.
7. Memory was updated through `OPSIDIAN_MEMORY.md` and a five-line run log.

Not executed because gated:

- Live browser screenshots without a running dev server/session.
- Direct external Hermes CLI checks because `hermes` is not currently available on PATH.
- Remotion render/still checks because no Remotion project exists yet.
- Payment, deletion, Supabase write, and credentialed trust-boundary flows without explicit approval.

## 7. Failure Replay Guardrails (2026-05-02)

This section captures concrete failures seen in a real run and the mandatory prevention pattern.

1. Subagent rate-limit interruption
	- Symptom: parallel `Explore` subagent calls failed with weekly rate-limit errors.
	- Guardrail: always define a no-subagent fallback path using direct `pnpm` checks + targeted `read_file`/`rg` reads.
	- Rule: a failed subagent call is never a stop condition for the audit.

2. TypeScript always-truthy condition
	- Symptom: `TS2774` in `app/[locale]/press/page.tsx` from `t.rich ? "For Media" : "For Media"`.
	- Guardrail: no truthiness checks on translator function properties for static copy.
	- Rule: static labels must be literals or explicit translation keys.

3. Brittle source-string snapshot tests
	- Symptom: landing test expected old copy (`Where art meets frequency`) and failed after approved UI rewrite.
	- Guardrail: hero/source tests must check stable semantic anchors (CTA labels, section labels, core terms), not one fragile sentence.
	- Rule: if marketing copy changes, update the test in the same change-set.

4. Harness timeout mismatch
	- Symptom: Playwright smoke finished in ~1.9m while a 120s tool timeout moved terminal to background.
	- Guardrail: use >=180000ms timeout for browser smoke on Windows and always check terminal completion.
	- Rule: timeout != failure; poll output before deciding rerun/kill.

5. Dirty working tree ambiguity
	- Symptom: multiple unrelated modified docs/scripts existed before optimization work.
	- Guardrail: isolate fix scope; never revert unrelated files; stage only touched paths.
	- Rule: include `git status --short` at start and before commit.

## 8. Full Harness Sequence

Run this sequence to audit frontend, backend, ML, and toolchain with reproducible outputs.

```powershell
cd D:\Elbtronika\Elbtonika
git status --short
pnpm.cmd -r run typecheck
pnpm.cmd -r run test
pnpm.cmd --filter @elbtronika/web exec playwright test e2e/chromium-ultraplan-smoke.spec.ts --project=chromium
node .\scripts\validate-skill-team.cjs
```

Pass criteria:

- No `ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL`
- No failing Vitest suites
- Smoke test passes in Chromium
- Skill-team validator reports installed lanes and no critical preflight mismatch
