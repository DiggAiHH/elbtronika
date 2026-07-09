-- Wave 7: Add stripe_session_id to orders for webhook reconciliation.
-- Checkout creates a Stripe session with metadata.order_id, but the webhook
-- needs to look up the order by session ID when checkout.session.completed fires.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id text;

CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_session_id_idx
  ON orders (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;
