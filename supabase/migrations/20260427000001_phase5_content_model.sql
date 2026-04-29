-- =============================================================================
-- ELBTRONIKA — Phase 5: Content Model Migration
-- Adds: rooms table, set_id + room_id FKs on artworks
-- =============================================================================

-- ===========================================================================
-- TABLE: rooms
-- 3D gallery spaces. Replaces the conceptual "exhibition" from Phase 3 plan.
-- Configuration is mirrored from Sanity on publish webhook.
-- ===========================================================================
CREATE TABLE IF NOT EXISTS rooms (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Sanity sync
  sanity_id       text UNIQUE,
  slug            text NOT NULL UNIQUE,
  title           text NOT NULL,
  -- 3D config
  skybox          text NOT NULL DEFAULT 'dark_club'
                    CHECK (skybox IN ('dark_club','industrial','concrete','void','nebula')),
  lighting_preset text NOT NULL DEFAULT 'warm_gallery'
                    CHECK (lighting_preset IN ('warm_gallery','cold_gallery','dramatic','neon','ambient')),
  max_artworks    integer NOT NULL DEFAULT 6 CHECK (max_artworks > 0 AND max_artworks <= 20),
  -- status
  is_published    boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rooms_slug        ON rooms(slug);
CREATE INDEX IF NOT EXISTS idx_rooms_sanity_id   ON rooms(sanity_id);
CREATE INDEX IF NOT EXISTS idx_rooms_published   ON rooms(is_published) WHERE is_published = true;

CREATE TRIGGER trg_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE rooms IS '3D gallery spaces — config mirrored from Sanity, rendered in Immersive Mode';
COMMENT ON COLUMN rooms.skybox IS 'Preset identifier matched by Three.js scene loader in Phase 7';
COMMENT ON COLUMN rooms.lighting_preset IS 'Lighting rig preset matched by scene loader in Phase 7';


-- ===========================================================================
-- EXTEND: artworks — add set_id and room_id FKs
-- Use separate ALTER statements for idempotency (each can succeed independently)
-- ===========================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artworks' AND column_name = 'set_id'
  ) THEN
    ALTER TABLE artworks
      ADD COLUMN set_id uuid REFERENCES sets(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_artworks_set_id ON artworks(set_id);
    COMMENT ON COLUMN artworks.set_id IS 'DJ set that plays spatially near this artwork in Immersive Mode';
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artworks' AND column_name = 'room_id'
  ) THEN
    ALTER TABLE artworks
      ADD COLUMN room_id uuid REFERENCES rooms(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_artworks_room_id ON artworks(room_id);
    COMMENT ON COLUMN artworks.room_id IS '3D room this artwork is placed in';
  END IF;
END;
$$;


-- ===========================================================================
-- RLS: rooms
-- Default deny-all (inherited from Supabase project setting).
-- Explicit policies:
--   1. Public can read published rooms
--   2. Authenticated curator/admin can read all
--   3. Admin can mutate
-- ===========================================================================
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Public read: published rooms only
CREATE POLICY "rooms_public_read_published"
  ON rooms
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- Curator/admin full read
CREATE POLICY "rooms_curator_read_all"
  ON rooms
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('curator', 'admin')
    )
  );

-- Admin full write
CREATE POLICY "rooms_admin_all"
  ON rooms
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
