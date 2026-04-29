-- =============================================================================
-- ELBTRONIKA - Phase 3 Preload
-- 0001_init.sql
-- Core schema for Supabase with RLS enabled on all tables.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE profile_role AS ENUM ('visitor', 'collector', 'artist', 'dj', 'curator', 'admin');
CREATE TYPE artwork_status AS ENUM ('draft', 'published', 'sold', 'archived');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'refunded', 'failed');
CREATE TYPE transaction_kind AS ENUM ('charge', 'transfer', 'refund');
CREATE TYPE webhook_source AS ENUM ('stripe', 'sanity', 'cloudflare');
CREATE TYPE ai_decision_type AS ENUM ('recommendation', 'description', 'moderation', 'tagging');

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  portrait_url text,
  role profile_role NOT NULL DEFAULT 'visitor',
  country_code text,
  stripe_account_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_country_code_check CHECK (country_code IS NULL OR char_length(country_code) = 2)
);

CREATE TABLE artists (
  profile_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  bio_de text,
  bio_en text,
  portrait_url text,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE djs (
  profile_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  bio_de text,
  bio_en text,
  portrait_url text,
  soundcloud_handle text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_de text NOT NULL,
  name_en text,
  scene_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  dj_id uuid NOT NULL REFERENCES djs(profile_id) ON DELETE RESTRICT,
  title_de text NOT NULL,
  title_en text,
  hls_manifest_url text,
  soundcloud_track_id text,
  duration_seconds integer,
  cover_artwork_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE artworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  artist_id uuid NOT NULL REFERENCES artists(profile_id) ON DELETE RESTRICT,
  dj_id uuid REFERENCES djs(profile_id) ON DELETE SET NULL,
  room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
  set_id uuid REFERENCES sets(id) ON DELETE SET NULL,
  title_de text NOT NULL,
  title_en text,
  story_de jsonb NOT NULL DEFAULT '[]'::jsonb,
  story_en jsonb NOT NULL DEFAULT '[]'::jsonb,
  price_cents bigint NOT NULL CHECK (price_cents >= 0),
  currency text NOT NULL DEFAULT 'EUR',
  medium text,
  dimensions jsonb NOT NULL DEFAULT '{}'::jsonb,
  image_url text,
  gltf_url text,
  textures jsonb NOT NULL DEFAULT '[]'::jsonb,
  status artwork_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sets
  ADD CONSTRAINT sets_cover_artwork_id_fkey
  FOREIGN KEY (cover_artwork_id)
  REFERENCES artworks(id)
  ON DELETE SET NULL;

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  artwork_id uuid NOT NULL REFERENCES artworks(id) ON DELETE RESTRICT,
  stripe_session_id text UNIQUE,
  transfer_group text UNIQUE,
  amount_cents bigint NOT NULL CHECK (amount_cents >= 0),
  status order_status NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  kind transaction_kind NOT NULL,
  stripe_object_id text UNIQUE,
  amount_cents bigint NOT NULL CHECK (amount_cents >= 0),
  destination_account text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE consent_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ip_hash text NOT NULL,
  user_agent text,
  consent_version text NOT NULL,
  consents jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text NOT NULL,
  before jsonb,
  after jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source webhook_source NOT NULL,
  event_id text NOT NULL UNIQUE,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ai_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  model text NOT NULL,
  prompt_hash text NOT NULL,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  decision_type ai_decision_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_artworks_status ON artworks(status);
CREATE INDEX idx_artworks_artist ON artworks(artist_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_artwork ON orders(artwork_id);
CREATE INDEX idx_transactions_order ON transactions(order_id);
CREATE INDEX idx_consent_user ON consent_log(user_id);
CREATE INDEX idx_audit_resource ON audit_events(resource_type, resource_id);
CREATE INDEX idx_webhook_source_created ON webhook_events(source, created_at DESC);
CREATE INDEX idx_ai_decisions_user ON ai_decisions(user_id, created_at DESC);

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'profiles',
    'artists',
    'djs',
    'rooms',
    'artworks',
    'sets',
    'orders',
    'transactions',
    'consent_log',
    'audit_events',
    'webhook_events',
    'ai_decisions'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
  END LOOP;
END;
$$;
