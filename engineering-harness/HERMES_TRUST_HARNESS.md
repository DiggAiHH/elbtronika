# Hermes Trust Engineering Harness

This harness is for Hermes, MCP tools, checkout, consent/privacy, account safety,
and project-memory documentation. It is stricter than the general design/code
harness because these areas directly affect user trust.

## Operating Principle

Hermes may become powerful only after it is observable, permissioned, durable,
and honest.

Default stance:

- Private until explicitly opened.
- Read-only until writes are intentionally scoped.
- Durable state before background execution.
- Human approval before payment, deletion, transfer, or external side effects.
- UI copy must not promise behavior the runtime does not actually provide.
- Documentation must describe the current system, not the intended future.

## Session Bootstrap

Before changing code in this area:

1. Read `STATUS.md`, `TASKS.md`, `CLAUDE.md`, and this harness.
2. Run `git status --short` and preserve unrelated user work.
3. Inspect the route, UI, service, and docs touched by the request.
4. Identify the trust boundary: auth, role, data privacy, payment, deletion, or
   public claim.
5. Write a short task list with one in-progress item.
6. Implement the smallest safe slice.
7. Verify with focused checks.
8. Update docs only when they match runtime truth.

## Trust Boundaries

| Surface | Risk | First safeguard |
| --- | --- | --- |
| MCP invoke API | Unauthenticated data/tool access | Auth, role gate, allowlist |
| Hermes task runner | Lost work, duplicate execution | Database source of truth |
| Agent tool calls | Wrong server or wrong capability | Canonical tool names |
| Flow matching | Fake confidence shown as real | Explicit `source: "simulated"` |
| Checkout | Payment promise without fulfillment | Hide or wire end to end |
| Consent/RUM | Telemetry without consent | Canonical consent check |
| Account deletion | Privacy promise without deletion | Service-role admin flow |
| Docs/memory | False readiness claims | Status tied to evidence |

## Tool Risk Classes

| Class | Examples | Default |
| --- | --- | --- |
| `read` | list, get, query published data | Allowed by role |
| `analyze` | local scoring, recommendations | Allowed with audit |
| `write` | insert, update, delete | Block until approved |
| `payment` | create intent, refund, transfer | Block until approved |
| `destructive` | delete account, purge rows | Block and require explicit confirmation |

Initial allowed MCP surface:

```ts
const ALLOWED_TOOLS = {
  supabase: [
    "supabase_query",
    "supabase_query_profiles",
    "supabase_query_artworks",
  ],
  sanity: [
    "sanity_fetch_document",
    "sanity_fetch_artwork_by_slug",
    "sanity_list_artworks",
  ],
  audio: [
    "audio_analyze_track",
    "audio_match_artwork_to_track",
  ],
  stripe: [
    "stripe_list_transfers",
    "stripe_get_account_balance",
  ],
} as const;
```

Explicitly blocked until separately designed:

- `supabase_insert`
- `supabase_update`
- `supabase_delete`
- `stripe_create_payment_intent`
- `stripe_create_transfer`
- `stripe_refund_payment`

## Implementation Waves

### Wave 0: Lock The Door

Goal: MCP routes cannot be used anonymously or by the wrong role.

Do:

- Add auth to `/api/mcp/invoke`.
- Add auth to `/api/mcp/tools`.
- Require curator/admin role for Hermes tool access.
- Enforce the allowlist before invoking any server.
- Return clear `401`, `403`, and `404` responses.

Acceptance:

- Anonymous invoke returns `401`.
- Signed-in non-curator returns `403`.
- Blocked tool returns `403` or `404`.
- Allowed read tool still works for curator/admin.

### Wave 1: Audit Every Tool Call

Goal: Every Hermes capability call leaves a durable trail.

Do:

- Create one audit helper for MCP invocation attempts.
- Record user id, role, server, tool, status, duration, and error class.
- Avoid logging secrets, tokens, raw payment details, or private message bodies.
- Log denied attempts too.

Acceptance:

- Successful read call creates an audit event.
- Denied call creates an audit event.
- Audit payload contains no secret-like fields.

### Wave 2: Fix Tool Identity

Goal: The agent uses one canonical tool naming scheme.

Do:

- Choose canonical names at the boundary: `server/tool`.
- Normalize legacy bare names only at one adapter.
- Remove duplicated name matching from prompt/runtime code.
- Make missing tools fail loudly with actionable errors.

Acceptance:

- A prompt requesting `supabase/supabase_query_artworks` resolves.
- A prompt requesting a removed bare name returns a migration hint.

### Wave 3: Durable Agent Memory

Goal: Background work survives reloads and multiple workers.

Do:

- Store agent tasks in a database table, not a process `Map`.
- Persist task status, messages, result, error, run id, timestamps, and actor.
- Make the route read from the database.
- Keep in-memory helpers only as optional local execution details.

Acceptance:

- Refreshing the server does not lose task status.
- Two workers do not both claim the same pending task.
- Task status has a clear terminal state.

### Wave 4: Execution Safety

Goal: Hermes work is controlled, observable, and resumable.

Do:

- Replace fire-and-forget execution with an explicit queue or claim loop.
- Add idempotency keys for user-triggered tasks.
- Add dry-run mode for risky tools.
- Add cancellation or timeout behavior.

Acceptance:

- Duplicate task submission reuses or rejects the existing job.
- Failed task can be inspected without crashing the route.
- Risky task can be previewed without side effects.

### Wave 5: Flow Honesty

Goal: Demo analysis is labeled as demo analysis.

Do:

- Mark simulated/random values as `source: "simulated"`.
- Hide or soften confidence labels when no real model ran.
- Separate deterministic feature extraction from generated recommendation copy.

Acceptance:

- UI never presents random scores as measured truth.
- API response includes the source of every score.

### Wave 6: Privacy And Consent Reality

Goal: Privacy UI, telemetry, and account deletion match what the backend does.

Do:

- Create one server-side consent lookup used by analytics and RUM.
- Gate Web Vitals and any optional telemetry behind consent.
- Implement account deletion with an admin/service-role path.
- Ensure deletion docs say exactly what is deleted and retained.

Acceptance:

- No optional telemetry is sent before consent.
- Delete-account flow actually removes or anonymizes expected data.
- Privacy copy matches implemented behavior.

### Wave 7: Checkout Honesty

Goal: The shop does not imply a complete purchase path unless one exists.

Do one of:

- Hide/disable purchase CTAs and describe availability truthfully.
- Or wire checkout, order creation, webhook reconciliation, and receipt states end to end.

Acceptance:

- A user cannot enter a dead checkout promise.
- Webhook identifiers match the records created at checkout.
- Order state can be viewed after payment.

### Wave 8: Documentation Truth Reset

Goal: Project memory reflects the actual system.

Do:

- Update `STATUS.md` from observed behavior only.
- Move aspirational items into `TASKS.md`.
- Add ADRs for trust-boundary choices.
- Keep prompt packs linked from the harness.

Acceptance:

- A new engineer can tell what is real, what is blocked, and what comes next.
- No doc claims production readiness without current evidence.

## Verification Ladder

Use the lowest rung that proves the change:

1. Static route inspection for docs-only or content-only changes.
2. Typecheck or lint for shared TS changes.
3. Focused route tests for auth/role/tool behavior.
4. UI smoke check for visible trust messaging.
5. End-to-end checkout/privacy tests only after those flows are wired.

Never mark a trust-boundary wave done without at least one negative test.

## Stop Conditions

Stop and ask for direction if:

- A change requires production secrets.
- A payment or deletion side effect would run against real users.
- Auth roles are ambiguous.
- Documentation conflicts with code and the correct source of truth is unclear.

## Critical File Map

- `apps/web/app/api/mcp/invoke/route.ts`
- `apps/web/app/api/mcp/tools/route.ts`
- `apps/web/app/api/agent/task/route.ts`
- `apps/web/lib/agent/*`
- `apps/web/lib/mcp/*`
- `apps/web/app/api/flow/*`
- `apps/web/components/flow/*`
- `apps/web/app/api/consent/*`
- `apps/web/app/api/account/*`
- `apps/web/app/api/checkout/*`
- `apps/web/app/api/webhooks/*`
- `apps/web/app/[locale]/(shop)/*`
- `STATUS.md`
- `TASKS.md`
- `CLAUDE.md`
- `engineering-harness/*`

## Done Means

Done does not mean "the happy path works once." Done means:

- Unauthorized users are blocked.
- Allowed users can do the intended thing.
- Denied attempts are observable.
- State survives reloads when work is asynchronous.
- UI copy is truthful.
- Docs match runtime behavior.
