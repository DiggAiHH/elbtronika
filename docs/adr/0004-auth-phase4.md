# ADR 0004 — Auth & Onboarding Architecture (Phase 4)

**Date:** 2026-04-26  
**Status:** Accepted  
**Deciders:** Lou (solo)

---

## Context

Phase 4 delivers the full auth + onboarding surface for ELBTRONIKA:
- Passwordless magic link + GitHub OAuth via Supabase Auth
- Protected routes for the dashboard and all creator flows
- Post-signup profile setup (role selection: collector / artist / dj)
- Stripe Connect Express KYC onboarding for artists and DJs

---

## Decisions

### 1. Auth Strategy: Supabase SSR + Server Component Guards

**Decision:** Middleware only refreshes the JWT cookie (`updateSession`). Auth protection lives in `layout.tsx` Server Components, not middleware.

**Why:** Next.js 15 App Router middleware runs on every edge request, including static assets and prefetches. Redirecting from middleware causes false redirects on prefetch. Server Component layouts run only when the page is actually rendered — no false positives.

**Pattern:**
```
middleware.ts           → updateSession() + next-intl locale routing
dashboard/layout.tsx    → getCurrentUser() → redirect if null
```

### 2. Middleware: Chain Supabase + next-intl

**Decision:** Run both `updateSession` (Supabase) and `createMiddleware` (next-intl) in sequence. Merge Supabase cookies into the i18n response.

**Why:** next-intl returns its own `NextResponse` for locale redirects. Without the cookie merge step, Supabase session tokens are lost after any locale redirect (e.g. `/` → `/de/`).

**Critical pattern:**
```typescript
for (const cookie of supabaseResponse.cookies.getAll()) {
  i18nResponse.cookies.set(cookie.name, cookie.value, cookie);
}
return i18nResponse;
```

### 3. tsconfig Path Alias: Dual Resolution

**Decision:** `"@/*": ["./*", "./src/*"]` — two paths, TypeScript tries first then second.

**Why:** The project has a mixed structure: `app/` routes live at `apps/web/app/` (no `src/`), utilities live at `apps/web/src/lib/`. A single alias can't cover both. Dual resolution lets `@/i18n/routing` and `@/src/lib/supabase/server` both resolve correctly without rewriting import paths.

### 4. Stripe Connect: Express Accounts, Lazy Instantiation

**Decision:** Stripe Connect Express (not Standard) with the "Separate Charges and Transfers" model. Stripe client instantiated inside request handlers via `getStripe()`, not at module scope.

**Why Express:** Stripe hosts the full KYC/onboarding UI. ELBTRONIKA never touches raw financial data. Lower compliance burden.

**Why lazy:** Module-scope `new Stripe(process.env.KEY!)` requires a non-null assertion (`!`), which violates Biome's `noNonNullAssertion` rule. Moving instantiation into a guarded `getStripe()` function validates the env var at runtime and throws a descriptive error if missing — better DX in production.

```typescript
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
}
```

### 5. Webhook Idempotency via `webhook_events` Table

**Decision:** Every incoming Stripe webhook event is checked against the `webhook_events` table by `stripe_event_id` before processing. Duplicate events return `200 already_processed` immediately.

**Why:** Stripe can deliver webhooks more than once. Without idempotency, a duplicate `account.updated` event could overwrite a correctly-set `payout_enabled` flag.

### 6. Profile Creation: DB Trigger

**Decision:** No application-layer profile creation. The `handle_new_auth_user()` Postgres trigger (Phase 3 migration) auto-inserts a `profiles` row on every `auth.users` INSERT.

**Why:** Eliminates the race condition where a user could hit a protected route before the profile is created. The DB guarantees the row exists before the session is established.

---

## Alternatives Considered

| Option | Rejected Because |
|--------|-----------------|
| Auth guard in middleware | False redirects on Next.js prefetch requests |
| Single `@/*` alias to `src/` | Breaks `app/`-rooted imports (`i18n/routing`, `app/auth/callback`) |
| Stripe Standard accounts | Requires ELBTRONIKA to handle more KYC + compliance surface |
| Module-scope Stripe client | Requires `!` assertion, fails Biome strict lint |
| Application-layer profile creation | Race condition between OAuth callback and first page load |

---

## Lessons Learned (Engineering Harness)

- **Windows `[bracket]` directories:** CMD `md` and PowerShell `New-Item` both fail on paths containing `[locale]`. Use Node.js `fs.mkdirSync` via a `.cjs` script.
- **Biome `noNonNullAssertion`:** Design env-var access with early-throw guards, never `!`. Applies to all process.env reads used as constructor args.
- **`useTransition` stability:** `startTransition` from `useTransition()` is stable (like `setState`) — never include it in `useCallback` or `useEffect` dependency arrays.

---

## Consequences

- All dashboard routes are protected by Server Component auth guards
- Artists/DJs complete KYC via Stripe-hosted flow; ELBTRONIKA never sees raw financial data  
- `webhook_events` table provides an audit trail of all Stripe events
- `payout_enabled` flag on `artists`/`djs` is set automatically when Stripe confirms KYC complete
