# ADR 0010: Stripe Connect & Split Payments (Phase 10)

**Status:** Accepted  
**Date:** 2026-04-29  
**Authors:** Sonnet 4.6 (Phase 10 session)

## Context

ELBTRONIKA sells artworks on behalf of artists, often paired with DJ sets. Revenue must be split:
- **60%** Artist
- **20%** DJ (if artwork has an associated set)
- **20%** Platform

Stripe Connect Express accounts handle artist/DJ onboarding and payouts. The platform never holds funds — Stripe splits at payment time via `transfers`.

## Decisions

### Package Structure

Dedicated `packages/payments` workspace package (`@elbtronika/payments`):
- `client.ts` — Stripe SDK singleton + webhook secret accessor
- `schemas.ts` — Zod schemas for checkout, transfers, webhooks
- `transfers.ts` — Revenue split calculation + Stripe transfer creation
- `webhook.ts` — Event handlers (account.updated, checkout.session.completed, payment_intent.succeeded)

### Revenue Split

```
computeRevenueSplit(totalCents, hasDj)
├── artistCents = floor(total * 0.6)
├── djCents     = hasDj ? floor(total * 0.2) : 0
└── platformCents = total - artist - dj  // remainder avoids rounding errors
```

Transfers are created with `source_transaction: paymentIntentId` so they use the same charge (no double fees).

### Checkout Flow

1. Buyer clicks "Acquire" → `POST /api/checkout/session`
2. Server validates price (anti-tampering), fetches artist/DJ Stripe accounts
3. Creates Stripe Checkout Session with `transfer_group`
4. Creates `orders` row with status `pending`
5. Buyer completes payment on Stripe-hosted page
6. Webhook `payment_intent.succeeded` triggers transfers
7. Order status updated to `paid`

### Anti-Tampering

The checkout endpoint verifies `artwork.price_eur * 100 === req.priceCents`. The client sends the price, but the server validates it against the database. Any mismatch returns 422.

### Webhook Idempotency

Every webhook event is logged to `webhook_events` with `stripe_event_id` as unique key. Duplicate events return `already_processed` immediately.

### Connect Onboarding

`POST /api/stripe/connect`:
1. Creates Express account (if not exists)
2. Stores `stripe_account_id` in `artists` or `djs` table
3. Returns onboarding URL via Stripe Account Links
4. `account.updated` webhook sets `payout_enabled` when KYC is complete

## Consequences

- **Positive:** Package isolation means Stripe SDK upgrades affect only `packages/payments`.
- **Positive:** Zod schemas ensure type-safe API contracts between frontend and backend.
- **Positive:** Revenue split is calculated server-side; client cannot manipulate shares.
- **Risk:** Stripe Express onboarding requires KYC — artists/DJs must submit identity docs.
- **Risk:** `source_transaction` transfers are immediate; if a refund is issued later, transfers are automatically reversed by Stripe.

## Alternatives Considered

1. **Platform collects full amount, then pays out manually** — Rejected: creates tax liability and regulatory complexity.
2. **Separate Charge per recipient** — Rejected: multiple charges = multiple processing fees.
3. **Stripe Connect Standard instead of Express** — Rejected: Standard requires artists to set up their own Stripe dashboard; Express is simpler for non-technical users.
