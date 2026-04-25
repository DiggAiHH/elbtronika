-- =============================================================================
-- ELBTRONIKA — Initial Schema Migration
-- Phase 3.1 · Supabase · Postgres 16 · EU-Frankfurt
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions (already enabled in enable_extensions migration)
-- Declare here so migration is self-contained; CREATE IF NOT EXISTS is safe.
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";


-- ===========================================================================
-- UTILITY: updated_at trigger function
-- ===========================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ===========================================================================
-- UTILITY: audit_events trigger function
-- Fires on UPDATE/DELETE for financial tables (orders, transactions).
-- ===========================================================================
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO audit_events (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    changed_by
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;


-- ===========================================================================
-- TABLE: profiles
-- Mirrors auth.users 1:1. Created on first sign-in via trigger in auth schema.
-- ===========================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  text,
  avatar_url    text,
  bio           text,
  role          text NOT NULL DEFAULT 'visitor'
                  CHECK (role IN ('visitor', 'collector', 'artist', 'dj', 'curator', 'admin')),
  locale        text NOT NULL DEFAULT 'de',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-create profile row when a user signs up
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url, locale)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'locale', 'de')
  );
  RETURN NEW;
END;
$$;

-- Attach to auth schema (safe: CREATE OR REPLACE handles idempotency)
CREATE OR REPLACE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();


-- ===========================================================================
-- TABLE: artists
-- ===========================================================================
CREATE TABLE IF NOT EXISTS artists (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug            text NOT NULL UNIQUE,
  name            text NOT NULL,
  bio             text,
  website         text,
  instagram       text,
  genre_tags      text[]    NOT NULL DEFAULT '{}',
  -- KYC / payout
  stripe_account_id   text,
  payout_enabled      boolean NOT NULL DEFAULT false,
  -- discovery
  embedding       vector(1536),   -- OpenAI ada-002 / text-embedding-3-small
  -- status
  is_published    boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artists_profile_id  ON artists(profile_id);
CREATE INDEX IF NOT EXISTS idx_artists_slug        ON artists(slug);
CREATE INDEX IF NOT EXISTS idx_artists_published   ON artists(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_artists_embedding   ON artists USING hnsw (embedding vector_cosine_ops);

CREATE TRIGGER trg_artists_updated_at
  BEFORE UPDATE ON artists
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ===========================================================================
-- TABLE: djs
-- ===========================================================================
CREATE TABLE IF NOT EXISTS djs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug            text NOT NULL UNIQUE,
  name            text NOT NULL,
  bio             text,
  website         text,
  instagram       text,
  soundcloud      text,
  genre_tags      text[]    NOT NULL DEFAULT '{}',
  -- KYC / payout
  stripe_account_id   text,
  payout_enabled      boolean NOT NULL DEFAULT false,
  -- discovery
  embedding       vector(1536),
  -- status
  is_published    boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_djs_profile_id  ON djs(profile_id);
CREATE INDEX IF NOT EXISTS idx_djs_slug        ON djs(slug);
CREATE INDEX IF NOT EXISTS idx_djs_published   ON djs(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_djs_embedding   ON djs USING hnsw (embedding vector_cosine_ops);

CREATE TRIGGER trg_djs_updated_at
  BEFORE UPDATE ON djs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ===========================================================================
-- TABLE: artworks
-- ===========================================================================
CREATE TABLE IF NOT EXISTS artworks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id       uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  slug            text NOT NULL UNIQUE,
  title           text NOT NULL,
  description     text,
  -- media (stored in R2, CDN URL)
  image_url       text,         -- cdn.elbtronika.art/artworks/<id>/image.*
  model_url       text,         -- glTF for immersive mode
  -- pricing
  price_eur       numeric(10,2) NOT NULL DEFAULT 0 CHECK (price_eur >= 0),
  edition_size    integer                           CHECK (edition_size > 0),
  editions_sold   integer       NOT NULL DEFAULT 0  CHECK (editions_sold >= 0),
  -- metadata
  medium          text,
  dimensions      text,         -- "120 × 80 cm"
  year            smallint,
  genre_tags      text[]        NOT NULL DEFAULT '{}',
  -- discovery
  embedding       vector(1536),
  -- Sanity CMS reference (for rich content)
  sanity_id       text,
  -- status
  is_published    boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artworks_artist_id  ON artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artworks_slug       ON artworks(slug);
CREATE INDEX IF NOT EXISTS idx_artworks_published  ON artworks(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_artworks_embedding  ON artworks USING hnsw (embedding vector_cosine_ops);
-- Full-text search
CREATE INDEX IF NOT EXISTS idx_artworks_fts ON artworks
  USING gin(to_tsvector('german', coalesce(title,'') || ' ' || coalesce(description,'')));

CREATE TRIGGER trg_artworks_updated_at
  BEFORE UPDATE ON artworks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ===========================================================================
-- TABLE: sets
-- DJ mix / audio set, linked to a DJ
-- ===========================================================================
CREATE TABLE IF NOT EXISTS sets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dj_id           uuid NOT NULL REFERENCES djs(id) ON DELETE CASCADE,
  slug            text NOT NULL UNIQUE,
  title           text NOT NULL,
  description     text,
  -- media (HLS stream via R2)
  hls_url         text,         -- cdn.elbtronika.art/sets/<id>/index.m3u8
  cover_url       text,
  duration_sec    integer,
  bpm             smallint,
  genre_tags      text[]        NOT NULL DEFAULT '{}',
  -- Sanity CMS reference
  sanity_id       text,
  -- status
  is_published    boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sets_dj_id     ON sets(dj_id);
CREATE INDEX IF NOT EXISTS idx_sets_slug      ON sets(slug);
CREATE INDEX IF NOT EXISTS idx_sets_published ON sets(is_published) WHERE is_published = true;

CREATE TRIGGER trg_sets_updated_at
  BEFORE UPDATE ON sets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ===========================================================================
-- TABLE: orders
-- One order = one artwork edition purchase
-- ===========================================================================
CREATE TABLE IF NOT EXISTS orders (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id            uuid NOT NULL REFERENCES profiles(id),
  artwork_id          uuid NOT NULL REFERENCES artworks(id),
  -- pricing snapshot (immutable after creation)
  amount_eur          numeric(10,2) NOT NULL CHECK (amount_eur > 0),
  platform_fee_eur    numeric(10,2) NOT NULL CHECK (platform_fee_eur >= 0),
  artist_payout_eur   numeric(10,2) NOT NULL CHECK (artist_payout_eur >= 0),
  dj_payout_eur       numeric(10,2) NOT NULL DEFAULT 0 CHECK (dj_payout_eur >= 0),
  -- Stripe
  stripe_payment_intent_id  text UNIQUE,
  stripe_charge_id          text,
  -- status
  status              text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'disputed')),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer_id   ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_artwork_id ON orders(artwork_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_pi  ON orders(stripe_payment_intent_id);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Audit: every status change on orders is logged
CREATE TRIGGER trg_orders_audit
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();


-- ===========================================================================
-- TABLE: transactions
-- Financial leg records — one order can have multiple legs (artist, dj, platform)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS transactions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  recipient_profile_id  uuid REFERENCES profiles(id),   -- NULL = platform
  role                  text NOT NULL
                          CHECK (role IN ('artist', 'dj', 'platform')),
  amount_eur            numeric(10,2) NOT NULL CHECK (amount_eur >= 0),
  -- Stripe Connect
  stripe_transfer_id    text UNIQUE,
  stripe_destination    text,          -- Stripe Connect account ID
  -- status
  status                text NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_order_id    ON transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_recipient   ON transactions(recipient_profile_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status      ON transactions(status);

CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Audit: all transaction mutations
CREATE TRIGGER trg_transactions_audit
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();


-- ===========================================================================
-- TABLE: consent_log
-- GDPR — immutable consent/withdrawal records
-- ===========================================================================
CREATE TABLE IF NOT EXISTS consent_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type  text NOT NULL
                  CHECK (consent_type IN (
                    'analytics', 'marketing', 'data_processing',
                    'terms_of_service', 'privacy_policy'
                  )),
  granted       boolean NOT NULL,
  ip_hash       text,             -- SHA-256 of IP, not raw IP
  user_agent    text,
  document_version  text,         -- e.g. "tos-2026-04-01"
  created_at    timestamptz NOT NULL DEFAULT now()
  -- intentionally no updated_at: consent records are append-only / immutable
);

CREATE INDEX IF NOT EXISTS idx_consent_profile_id    ON consent_log(profile_id);
CREATE INDEX IF NOT EXISTS idx_consent_type_profile  ON consent_log(profile_id, consent_type, created_at DESC);


-- ===========================================================================
-- TABLE: webhook_events
-- Idempotent log of incoming Stripe / external webhooks
-- ===========================================================================
CREATE TABLE IF NOT EXISTS webhook_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source          text NOT NULL DEFAULT 'stripe'
                    CHECK (source IN ('stripe', 'sanity', 'internal')),
  event_type      text NOT NULL,          -- e.g. "payment_intent.succeeded"
  stripe_event_id text UNIQUE,            -- Stripe's event ID for dedup
  payload         jsonb NOT NULL DEFAULT '{}',
  processed       boolean NOT NULL DEFAULT false,
  error           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  processed_at    timestamptz
);

CREATE INDEX IF NOT EXISTS idx_webhook_source       ON webhook_events(source, processed);
CREATE INDEX IF NOT EXISTS idx_webhook_stripe_id    ON webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_event_type   ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_unprocessed  ON webhook_events(processed, created_at)
  WHERE processed = false;


-- ===========================================================================
-- TABLE: ai_decisions
-- Audit log for AI-assisted actions (curation, recommendations, moderation)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS ai_decisions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model           text NOT NULL,          -- e.g. "claude-sonnet-4-6"
  action          text NOT NULL,          -- e.g. "artwork_curation", "recommendation"
  input_summary   text,                   -- sanitized, no PII
  output_summary  text,
  confidence      real,                   -- 0.0–1.0
  triggered_by    uuid REFERENCES profiles(id),
  metadata        jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_decisions_action   ON ai_decisions(action);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_model    ON ai_decisions(model);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_profile  ON ai_decisions(triggered_by);


-- ===========================================================================
-- TABLE: audit_events
-- Append-only audit trail — populated by log_audit_event() trigger
-- MUST be created BEFORE orders & transactions to avoid forward-reference.
-- (Re-ordered here; Postgres resolves at execution time since triggers fire
--  at DML time, not DDL time.)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS audit_events (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name  text        NOT NULL,
  record_id   uuid        NOT NULL,
  action      text        NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data    jsonb,
  new_data    jsonb,
  changed_by  uuid,       -- auth.uid() at time of change; NULL for system ops
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_record    ON audit_events(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_changed   ON audit_events(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_created   ON audit_events(created_at DESC);


-- ===========================================================================
-- COMMENTS (for Supabase Studio + auto-generated docs)
-- ===========================================================================
COMMENT ON TABLE profiles      IS 'User profiles — mirrors auth.users 1:1';
COMMENT ON TABLE artists       IS 'Artist accounts — linked to a profile';
COMMENT ON TABLE djs           IS 'DJ accounts — linked to a profile';
COMMENT ON TABLE artworks      IS 'Artwork listings with pricing and media refs';
COMMENT ON TABLE sets          IS 'DJ sets (HLS streams) linked to a DJ';
COMMENT ON TABLE orders        IS 'Purchase orders — one artwork edition per order';
COMMENT ON TABLE transactions  IS 'Financial legs per order (artist/dj/platform splits)';
COMMENT ON TABLE consent_log   IS 'GDPR consent records — append-only, immutable';
COMMENT ON TABLE webhook_events IS 'Incoming webhook log — idempotent dedup';
COMMENT ON TABLE ai_decisions  IS 'Audit log of AI-assisted actions';
COMMENT ON TABLE audit_events  IS 'Immutable audit trail for financial table mutations';

COMMENT ON COLUMN orders.platform_fee_eur   IS '20% platform share (60/20/20 split)';
COMMENT ON COLUMN orders.artist_payout_eur  IS '60% artist share';
COMMENT ON COLUMN orders.dj_payout_eur      IS '20% DJ share (if set is active in room)';
COMMENT ON COLUMN artists.embedding         IS 'vector(1536) for semantic search — OpenAI text-embedding-3-small';
COMMENT ON COLUMN artworks.embedding        IS 'vector(1536) for semantic search — OpenAI text-embedding-3-small';
