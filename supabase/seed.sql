-- =============================================================================
-- ELBTRONIKA — Development Seed Data (Phase 5)
-- Deterministic UUIDs — safe to re-run (upsert pattern).
-- NEVER use real credentials or production data here.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Profiles (auth.users rows must exist first in local Supabase dev)
-- In local dev: create these users via `supabase auth admin create-user`
-- or via the Supabase Studio UI before running seed.
-- Hardcoded UUIDs match the test fixtures in apps/web/__fixtures__/
-- ---------------------------------------------------------------------------

-- Test Artist profile
INSERT INTO profiles (id, display_name, role, locale)
VALUES ('00000000-0000-0000-0000-000000000001', 'Eva Richter', 'artist', 'de')
ON CONFLICT (id) DO UPDATE
  SET display_name = EXCLUDED.display_name,
      role         = EXCLUDED.role;

-- Test DJ profile
INSERT INTO profiles (id, display_name, role, locale)
VALUES ('00000000-0000-0000-0000-000000000002', 'DJ Koi', 'dj', 'de')
ON CONFLICT (id) DO UPDATE
  SET display_name = EXCLUDED.display_name,
      role         = EXCLUDED.role;

-- Test Collector profile
INSERT INTO profiles (id, display_name, role, locale)
VALUES ('00000000-0000-0000-0000-000000000003', 'Max Musterkäufer', 'collector', 'de')
ON CONFLICT (id) DO UPDATE
  SET display_name = EXCLUDED.display_name;

-- ---------------------------------------------------------------------------
-- Artists
-- ---------------------------------------------------------------------------
INSERT INTO artists (id, profile_id, slug, name, bio, payout_enabled, is_published)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'eva-richter',
  'Eva Richter',
  'Hamburger Medienkünstlerin. Fokus auf Licht und Materialtextur.',
  false,
  true
)
ON CONFLICT (id) DO UPDATE
  SET name         = EXCLUDED.name,
      is_published = EXCLUDED.is_published;

-- ---------------------------------------------------------------------------
-- DJs
-- ---------------------------------------------------------------------------
INSERT INTO djs (id, profile_id, slug, name, bio, soundcloud, genre_tags, payout_enabled, is_published)
VALUES (
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'dj-koi',
  'DJ Koi',
  'Techno & Ambient aus Hamburg. Bekannt für drone-basierte Atmosphären.',
  'https://soundcloud.com/dj-koi-placeholder',
  ARRAY['techno', 'ambient', 'drone'],
  false,
  true
)
ON CONFLICT (id) DO UPDATE
  SET name         = EXCLUDED.name,
      is_published = EXCLUDED.is_published;

-- ---------------------------------------------------------------------------
-- Rooms
-- ---------------------------------------------------------------------------
INSERT INTO rooms (id, sanity_id, slug, title, skybox, lighting_preset, max_artworks, is_published)
VALUES (
  '30000000-0000-0000-0000-000000000001',
  'seed-room-dunkelraum',
  'dunkelraum',
  'Dunkelraum',
  'dark_club',
  'neon',
  6,
  true
)
ON CONFLICT (id) DO UPDATE
  SET title        = EXCLUDED.title,
      is_published = EXCLUDED.is_published;

-- ---------------------------------------------------------------------------
-- Sets (DJ mixes)
-- ---------------------------------------------------------------------------
INSERT INTO sets (id, dj_id, slug, title, hls_url, duration_sec, genre_tags, sanity_id, is_published)
VALUES (
  '40000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'koi-dunkelzeit',
  'Dunkelzeit',
  'https://cdn.elbtronika.art/sets/seed-001/index.m3u8',
  3600,
  ARRAY['techno', 'drone'],
  'seed-set-dunkelzeit',
  true
)
ON CONFLICT (id) DO UPDATE
  SET title        = EXCLUDED.title,
      is_published = EXCLUDED.is_published;

-- ---------------------------------------------------------------------------
-- Artworks (3 published examples)
-- ---------------------------------------------------------------------------

-- Artwork 1: Lichtfragment
INSERT INTO artworks (
  id, artist_id, slug, title,
  description, medium, dimensions, year,
  price_eur, edition_size, editions_sold,
  image_url, genre_tags, sanity_id,
  set_id, room_id, is_published
)
VALUES (
  '50000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'lichtfragment-i',
  'Lichtfragment I',
  'Brechung von Tageslicht durch Industrieglas. Erste Arbeit aus der "Fragment"-Serie.',
  'C-Print hinter Acrylglas',
  '120 × 90 cm',
  2025,
  1200.00,
  3,
  0,
  'https://cdn.elbtronika.art/artworks/seed-001/image.jpg',
  ARRAY['photography', 'light', 'abstract'],
  'seed-artwork-lichtfragment-i',
  '40000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  true
)
ON CONFLICT (id) DO UPDATE
  SET title        = EXCLUDED.title,
      is_published = EXCLUDED.is_published;

-- Artwork 2: Schwebezustand
INSERT INTO artworks (
  id, artist_id, slug, title,
  description, medium, dimensions, year,
  price_eur, edition_size, editions_sold,
  image_url, genre_tags, sanity_id,
  set_id, room_id, is_published
)
VALUES (
  '50000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000001',
  'schwebezustand-ii',
  'Schwebezustand II',
  'Prozessfotografie. Bewegungsunschärfe als gestalterisches Mittel.',
  'Pigmentdruck auf Hahnemühle',
  '80 × 80 cm',
  2026,
  890.00,
  5,
  0,
  'https://cdn.elbtronika.art/artworks/seed-002/image.jpg',
  ARRAY['photography', 'motion', 'monochrome'],
  'seed-artwork-schwebezustand-ii',
  '40000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  true
)
ON CONFLICT (id) DO UPDATE
  SET title        = EXCLUDED.title,
      is_published = EXCLUDED.is_published;

-- Artwork 3: Rauschen_03 (digital, has 3D model placeholder)
INSERT INTO artworks (
  id, artist_id, slug, title,
  description, medium, dimensions, year,
  price_eur, edition_size, editions_sold,
  image_url, model_url, genre_tags, sanity_id,
  set_id, room_id, is_published
)
VALUES (
  '50000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000001',
  'rauschen-03',
  'Rauschen_03',
  'Generative Noiselandschaft. Algorithmus auf Basis atmosphärischer Messdaten Hamburg 2026.',
  'Digitaldruck, Unikat',
  '60 × 60 cm',
  2026,
  650.00,
  1,
  0,
  'https://cdn.elbtronika.art/artworks/seed-003/image.jpg',
  'https://cdn.elbtronika.art/models/seed-003/rauschen.glb',
  ARRAY['generative', 'digital', 'noise'],
  'seed-artwork-rauschen-03',
  '40000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  true
)
ON CONFLICT (id) DO UPDATE
  SET title        = EXCLUDED.title,
      is_published = EXCLUDED.is_published;
