# ADR 0018: Stripe Connect Idempotency & Parallel Transfers

## Status
**Accepted** — 2026-04-29

## Context

Phase 10 (Stripe Connect) hatte Transaktionssicherheitslücken:
- `createTransfers` erstellte Transfers ohne `idempotencyKey` → Doppelzahlungen bei Retries möglich
- Artist- und DJ-Transfers wurden sequentiell erstellt → unnötige Latenz
- `createCheckoutSession` hatte keinen `idempotencyKey`
- `platformFeeCents` wurde akzeptiert aber nicht an Stripe übergeben
- Keine `client_reference_id` für Order-Tracking

## Decision

### 1. Idempotency Keys
- `createTransfers`: `idempotencyKey: transfer_artist_${orderId}_${amount}` bzw. `transfer_dj_${orderId}_${amount}`
- `createCheckoutSession`: `idempotencyKey: checkout_${orderId}_${artworkId}`

### 2. Parallel Transfer Creation
- `Promise.all([artistPromise, djPromise])` statt sequentieller `await`
- DJ-Promise resolved zu `undefined`, wenn kein DJ beteiligt

### 3. platformFeeCents
- `application_fee_amount: platformFeeCents` auf Checkout-Session-Ebene gesetzt
- Nur wenn `platformFeeCents > 0`

### 4. client_reference_id
- `client_reference_id: orderId` für Verknüpfung Stripe ↔ interne Order

### 5. Validation Helpers
- `isValidPaymentIntentId(id)` prüft `pi_`-Präfix und Mindestlänge

## Consequences

### Positive
- Keine Doppelzahlungen mehr bei Netzwerk-Retries
- Schnellere Transfer-Erstellung (~50% Latenz-Reduktion bei DJ-Splits)
- Klare Order-Tracking via `client_reference_id`

### Negative
- Idempotency Keys binden sich an `orderId` — bei Order-ID-Änderung entsteht ein neuer Key
