# Hermes Trust Prompt Pack

Date: 2026-04-30

Use these prompts one at a time. Each prompt is intentionally narrow so the work
can land safely without a broad rewrite.

## 1. Universal Bootstrap

```text
Repository root: d:\Elbtronika\Elbtonika.

Use engineering-harness/HERMES_TRUST_HARNESS.md.
Before editing, read STATUS.md, TASKS.md, CLAUDE.md, and the harness.
Run git status --short and preserve unrelated user changes.

Focus only on the requested wave. Prefer the smallest implementation that makes
the trust boundary true. Add focused negative tests where practical. Do not make
production claims in docs unless verified by current code.
```

## 2. Wave 0: Lock MCP Routes

```text
Start Wave 0 from engineering-harness/HERMES_TRUST_HARNESS.md.

Goal: /api/mcp/invoke and /api/mcp/tools must be unavailable to anonymous users
and blocked for roles that should not use Hermes tools.

Inspect current auth/session helpers and role conventions first. Implement:
- auth check for both routes
- curator/admin role gate
- server/tool allowlist before invocation
- clear 401, 403, and 404/error responses

Add focused tests or route-level checks for:
- anonymous invoke returns 401
- signed-in non-curator returns 403
- curator/admin cannot call supabase_delete
- curator/admin can call supabase_query_artworks or another approved read tool

Keep all edits tightly scoped to MCP auth and allowlisting.
```

## 3. Wave 1: Audit MCP Calls

```text
Start Wave 1 from engineering-harness/HERMES_TRUST_HARNESS.md.

Goal: every MCP invocation attempt is auditable, including denied attempts.

Inspect existing logging, telemetry, and database patterns. Implement one small
audit helper and call it from /api/mcp/invoke. Record actor id, role, server,
tool, status, duration, and safe error class. Do not log secrets, raw tokens,
raw payment details, or private message bodies.

Verify:
- allowed read tool creates an audit event
- denied tool creates an audit event
- audit payload excludes secret-like fields
```

## 4. Wave 2: Canonical Tool Names

```text
Start Wave 2 from engineering-harness/HERMES_TRUST_HARNESS.md.

Goal: Hermes uses one canonical tool naming scheme.

Inspect the MCP client, registry, agent prompts, and invoke route. Choose
server/tool as the canonical name at the boundary. Keep legacy bare-name support
only in one adapter if needed. Remove duplicated matching logic.

Verify:
- canonical name resolves correctly
- missing or legacy name returns an actionable error
- prompt/tool examples in docs use the canonical form
```

## 5. Wave 3: Durable Agent Tasks

```text
Start Wave 3 from engineering-harness/HERMES_TRUST_HARNESS.md.

Goal: /api/agent/task uses durable database-backed task state instead of process
memory as the source of truth.

Inspect current task route, Supabase helpers, migration conventions, and agent
execution code. Design a minimal agent_tasks schema if one does not exist.
Persist task status, actor, prompt, result, error, run id, timestamps, and
terminal state.

Verify:
- created task can be read from the database
- task status survives route/module reload assumptions
- duplicate workers cannot claim the same task at the same time
```

## 6. Wave 4: Remove Fire-And-Forget Risk

```text
Start Wave 4 from engineering-harness/HERMES_TRUST_HARNESS.md.

Goal: Hermes task execution is explicit, observable, and recoverable.

Inspect how tasks are currently launched. Replace unsafe fire-and-forget behavior
with a queue, claim loop, or durable run mechanism that fits the repo. Add
idempotency for repeated user submissions and a timeout/error path.

Verify:
- duplicate submission is handled deterministically
- failed execution leaves inspectable state
- risky actions can run in dry-run mode or are blocked
```

## 7. Wave 5: Flow Demo Honesty

```text
Start Wave 5 from engineering-harness/HERMES_TRUST_HARNESS.md.

Goal: Flow/music matching never presents simulated analysis as measured truth.

Inspect the flow API and UI. Mark random/demo scores with source: "simulated".
Update UI copy so confidence and recommendation language reflects whether the
score came from a real analyzer or demo data.

Verify:
- API exposes score source
- UI does not label simulated scores as real confidence
- deterministic extraction and generated copy are visibly separate in code
```

## 8. Wave 6: Privacy And Consent Reality

```text
Start Wave 6 from engineering-harness/HERMES_TRUST_HARNESS.md.

Goal: consent, analytics, Web Vitals, and account deletion match privacy copy.

Inspect consent APIs, analytics/RUM components, account deletion routes, and
privacy docs/UI. Implement one canonical consent lookup and gate optional
telemetry behind it. If account deletion exists only as UI/copy, either wire the
admin deletion/anonymization path or clearly mark it unavailable.

Verify:
- no optional telemetry before consent
- deletion route actually performs the documented action
- privacy copy matches implemented behavior
```

## 9. Wave 7: Checkout Honesty

```text
Start Wave 7 from engineering-harness/HERMES_TRUST_HARNESS.md.

Goal: the shop does not promise a complete purchase path unless checkout,
orders, webhooks, and receipt states are actually connected.

Inspect shop pages, checkout API, Stripe integration, order persistence, and
webhook handling. Either hide/disable purchase CTAs with truthful availability
copy, or wire a minimal end-to-end checkout flow with matching identifiers.

Verify:
- user cannot enter a dead purchase flow
- webhook identifiers match created records
- order state can be displayed after payment
```

## 10. Wave 8: Documentation Truth Reset

```text
Start Wave 8 from engineering-harness/HERMES_TRUST_HARNESS.md.

Goal: STATUS.md, TASKS.md, CLAUDE.md, and ADRs accurately describe what the
current code does.

Inspect code first, then docs. Move future intent into TASKS.md. Keep STATUS.md
limited to observed current behavior. Add or update ADRs for MCP auth,
tool allowlisting, durable task memory, checkout truth, and privacy/deletion if
those choices now exist.

Verify:
- every readiness claim has code evidence
- every known blocker is represented in TASKS.md
- docs link back to the harness and prompt pack
```

## 11. Review Prompt

```text
Review the current diff using a trust-boundary lens.

Prioritize:
- anonymous or wrong-role access
- missing allowlist checks
- writes/payments/deletes without explicit approval
- background state lost on reload
- telemetry before consent
- UI copy that overpromises runtime behavior
- docs that claim readiness without evidence

Return findings first with file/line references, then tests run, then residual
risk. Keep the review concise and actionable.
```

## 12. One-Shot Start Now Prompt

```text
Repository root: d:\Elbtronika\Elbtonika.

Use engineering-harness/HERMES_TRUST_HARNESS.md and
PROMPTS_HERMES_TRUST_2026-04-30.md.

Start Wave 0 only: lock /api/mcp/invoke and /api/mcp/tools with auth, role
gate, and allowlist. Preserve unrelated changes. Add focused negative tests
where the repo already has route test patterns. Do not start Waves 1-8 yet.
```
