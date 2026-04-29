-- =============================================================================
-- ELBTRONIKA - deterministic seed
-- Idempotent by ON CONFLICT DO NOTHING.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- auth.users bootstrap for local development seeds
-- -----------------------------------------------------------------------------
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'artist.1@elbtronika.local',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiA4J5QfM9vDOMkMt2rt7NmBGG99nm.',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Mila Hartmann"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'artist.2@elbtronika.local',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiA4J5QfM9vDOMkMt2rt7NmBGG99nm.',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Jonas Fink"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333',
    'authenticated',
    'authenticated',
    'artist.3@elbtronika.local',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiA4J5QfM9vDOMkMt2rt7NmBGG99nm.',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Lea Bruckner"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '44444444-4444-4444-4444-444444444444',
    'authenticated',
    'authenticated',
    'dj.1@elbtronika.local',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiA4J5QfM9vDOMkMt2rt7NmBGG99nm.',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"DJ Kollektiv Nord"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '55555555-5555-5555-5555-555555555555',
    'authenticated',
    'authenticated',
    'dj.2@elbtronika.local',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiA4J5QfM9vDOMkMt2rt7NmBGG99nm.',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"DJ Alina Voss"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '66666666-6666-6666-6666-666666666666',
    'authenticated',
    'authenticated',
    'dj.3@elbtronika.local',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiA4J5QfM9vDOMkMt2rt7NmBGG99nm.',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"DJ Tara Flux"}'::jsonb,
    now(),
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
INSERT INTO profiles (id, display_name, portrait_url, role, country_code, stripe_account_id)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Mila Hartmann', 'https://cdn.elbtronika.art/portraits/mila.jpg', 'artist', 'DE', 'acct_artist_001'),
  ('22222222-2222-2222-2222-222222222222', 'Jonas Fink', 'https://cdn.elbtronika.art/portraits/jonas.jpg', 'artist', 'DE', 'acct_artist_002'),
  ('33333333-3333-3333-3333-333333333333', 'Lea Bruckner', 'https://cdn.elbtronika.art/portraits/lea.jpg', 'artist', 'DE', 'acct_artist_003'),
  ('44444444-4444-4444-4444-444444444444', 'DJ Kollektiv Nord', 'https://cdn.elbtronika.art/portraits/nord.jpg', 'dj', 'DE', 'acct_dj_001'),
  ('55555555-5555-5555-5555-555555555555', 'DJ Alina Voss', 'https://cdn.elbtronika.art/portraits/alina.jpg', 'dj', 'DE', 'acct_dj_002'),
  ('66666666-6666-6666-6666-666666666666', 'DJ Tara Flux', 'https://cdn.elbtronika.art/portraits/tara.jpg', 'dj', 'DE', 'acct_dj_003')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- artists
-- -----------------------------------------------------------------------------
INSERT INTO artists (profile_id, bio_de, bio_en, portrait_url, social_links)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Mila arbeitet mit Lichtbrechung und urbanen Materialien.',
    'Mila works with light refraction and urban materials.',
    'https://cdn.elbtronika.art/portraits/mila.jpg',
    '{"instagram":"https://instagram.com/mila_h","website":"https://mila.example"}'::jsonb
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Jonas verbindet Fotografie mit algorithmischer Struktur.',
    'Jonas combines photography with algorithmic structures.',
    'https://cdn.elbtronika.art/portraits/jonas.jpg',
    '{"instagram":"https://instagram.com/jonas_f"}'::jsonb
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Lea erforscht Grenzen zwischen Raum, Klang und Textur.',
    'Lea explores boundaries between space, sound and texture.',
    'https://cdn.elbtronika.art/portraits/lea.jpg',
    '{"website":"https://lea.example"}'::jsonb
  )
ON CONFLICT (profile_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- djs
-- -----------------------------------------------------------------------------
INSERT INTO djs (profile_id, bio_de, bio_en, portrait_url, soundcloud_handle)
VALUES
  (
    '44444444-4444-4444-4444-444444444444',
    'Kollektiv Nord spielt reduzierte hypnotische Club-Sets.',
    'Kollektiv Nord performs reduced hypnotic club sets.',
    'https://cdn.elbtronika.art/portraits/nord.jpg',
    'kollektiv-nord'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'Alina kombiniert Field Recordings mit Deep Techno.',
    'Alina blends field recordings with deep techno.',
    'https://cdn.elbtronika.art/portraits/alina.jpg',
    'alina-voss'
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    'Tara baut cineastische Spannungsboegen fuer immersive Raeume.',
    'Tara builds cinematic tension arcs for immersive rooms.',
    'https://cdn.elbtronika.art/portraits/tara.jpg',
    'tara-flux'
  )
ON CONFLICT (profile_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- rooms
-- -----------------------------------------------------------------------------
INSERT INTO rooms (id, slug, name_de, name_en, scene_config)
VALUES
  (
    'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'dunkelraum',
    'Dunkelraum',
    'Dark Room',
    '{"skybox":"dark_club","lighting":"neon","slots":8}'::jsonb
  ),
  (
    'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    'betonhalle',
    'Betonhalle',
    'Concrete Hall',
    '{"skybox":"industrial","lighting":"cold","slots":10}'::jsonb
  ),
  (
    'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    'nebula',
    'Nebelkuppel',
    'Nebula Dome',
    '{"skybox":"nebula","lighting":"ambient","slots":6}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- sets
-- -----------------------------------------------------------------------------
INSERT INTO sets (
  id,
  slug,
  dj_id,
  title_de,
  title_en,
  hls_manifest_url,
  soundcloud_track_id,
  duration_seconds,
  cover_artwork_id
)
VALUES
  (
    'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    'nord-schattenpulse',
    '44444444-4444-4444-4444-444444444444',
    'Schattenpulse',
    'Shadow Pulses',
    'https://cdn.elbtronika.art/sets/nord/index.m3u8',
    'sc_1001',
    3520,
    NULL
  ),
  (
    'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    'alina-hydra',
    '55555555-5555-5555-5555-555555555555',
    'Hydra',
    'Hydra',
    'https://cdn.elbtronika.art/sets/alina/index.m3u8',
    'sc_1002',
    3688,
    NULL
  ),
  (
    'bbbbbbb3-bbbb-bbbb-bbbb-bbbbbbbbbbb3',
    'tara-kinetik',
    '66666666-6666-6666-6666-666666666666',
    'Kinetik',
    'Kinetics',
    'https://cdn.elbtronika.art/sets/tara/index.m3u8',
    'sc_1003',
    3412,
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- artworks (6 rows)
-- -----------------------------------------------------------------------------
INSERT INTO artworks (
  id,
  slug,
  artist_id,
  dj_id,
  room_id,
  set_id,
  title_de,
  title_en,
  story_de,
  story_en,
  price_cents,
  currency,
  medium,
  dimensions,
  image_url,
  gltf_url,
  textures,
  status,
  published_at
)
VALUES
  (
    'ccccccc1-cccc-cccc-cccc-ccccccccccc1',
    'lichtfenster-i',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444444',
    'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    'Lichtfenster I',
    'Light Window I',
    '[{"_type":"block","children":[{"_type":"span","text":"Ein Korridor aus reflektiertem Neonlicht."}]}]'::jsonb,
    '[{"_type":"block","children":[{"_type":"span","text":"A corridor of reflected neon light."}]}]'::jsonb,
    145000,
    'EUR',
    'C-Print hinter Acryl',
    '{"widthCm":120,"heightCm":90}'::jsonb,
    'https://cdn.elbtronika.art/artworks/lichtfenster-i.jpg',
    'https://cdn.elbtronika.art/artworks/lichtfenster-i.glb',
    '["https://cdn.elbtronika.art/textures/lichtfenster-i.ktx2"]'::jsonb,
    'published',
    now()
  ),
  (
    'ccccccc2-cccc-cccc-cccc-ccccccccccc2',
    'lichtfenster-ii',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444444',
    'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    'Lichtfenster II',
    'Light Window II',
    '[{"_type":"block","children":[{"_type":"span","text":"Der zweite Teil reagiert auf Blickwinkel."}]}]'::jsonb,
    '[{"_type":"block","children":[{"_type":"span","text":"The second part reacts to viewing angle."}]}]'::jsonb,
    139000,
    'EUR',
    'UV-Druck auf Aluminium',
    '{"widthCm":110,"heightCm":80}'::jsonb,
    'https://cdn.elbtronika.art/artworks/lichtfenster-ii.jpg',
    NULL,
    '[]'::jsonb,
    'published',
    now()
  ),
  (
    'ccccccc3-cccc-cccc-cccc-ccccccccccc3',
    'betonrauschen',
    '22222222-2222-2222-2222-222222222222',
    '55555555-5555-5555-5555-555555555555',
    'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    'Betonrauschen',
    'Concrete Noise',
    '[{"_type":"block","children":[{"_type":"span","text":"Texturstudie zwischen analogem Korn und digitalem Rauschen."}]}]'::jsonb,
    '[{"_type":"block","children":[{"_type":"span","text":"Texture study between analog grain and digital noise."}]}]'::jsonb,
    98000,
    'EUR',
    'Pigmentdruck',
    '{"widthCm":90,"heightCm":90}'::jsonb,
    'https://cdn.elbtronika.art/artworks/betonrauschen.jpg',
    'https://cdn.elbtronika.art/artworks/betonrauschen.glb',
    '["https://cdn.elbtronika.art/textures/betonrauschen-albedo.ktx2"]'::jsonb,
    'published',
    now()
  ),
  (
    'ccccccc4-cccc-cccc-cccc-ccccccccccc4',
    'signalhaut',
    '22222222-2222-2222-2222-222222222222',
    '55555555-5555-5555-5555-555555555555',
    'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    'Signalhaut',
    'Signal Skin',
    '[{"_type":"block","children":[{"_type":"span","text":"Mehrschichtige Fluktuation auf Betonoberflaeche."}]}]'::jsonb,
    '[{"_type":"block","children":[{"_type":"span","text":"Multi-layer fluctuation on concrete surface."}]}]'::jsonb,
    121000,
    'EUR',
    'Mischtechnik',
    '{"widthCm":100,"heightCm":70,"depthCm":4}'::jsonb,
    'https://cdn.elbtronika.art/artworks/signalhaut.jpg',
    NULL,
    '[]'::jsonb,
    'draft',
    NULL
  ),
  (
    'ccccccc5-cccc-cccc-cccc-ccccccccccc5',
    'nebelfalte',
    '33333333-3333-3333-3333-333333333333',
    '66666666-6666-6666-6666-666666666666',
    'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    'bbbbbbb3-bbbb-bbbb-bbbb-bbbbbbbbbbb3',
    'Nebelfalte',
    'Fog Fold',
    '[{"_type":"block","children":[{"_type":"span","text":"Die Form loest sich erst in Bewegung auf."}]}]'::jsonb,
    '[{"_type":"block","children":[{"_type":"span","text":"The form resolves only while moving."}]}]'::jsonb,
    176000,
    'EUR',
    'Giclee Print',
    '{"widthCm":130,"heightCm":95}'::jsonb,
    'https://cdn.elbtronika.art/artworks/nebelfalte.jpg',
    'https://cdn.elbtronika.art/artworks/nebelfalte.glb',
    '["https://cdn.elbtronika.art/textures/nebelfalte-normal.ktx2"]'::jsonb,
    'published',
    now()
  ),
  (
    'ccccccc6-cccc-cccc-cccc-ccccccccccc6',
    'restlicht',
    '33333333-3333-3333-3333-333333333333',
    '66666666-6666-6666-6666-666666666666',
    'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    'bbbbbbb3-bbbb-bbbb-bbbb-bbbbbbbbbbb3',
    'Restlicht',
    'Residual Light',
    '[{"_type":"block","children":[{"_type":"span","text":"Letztes Licht in der Kuppel, kurz vor Schwarz."}]}]'::jsonb,
    '[{"_type":"block","children":[{"_type":"span","text":"The final light in the dome before black."}]}]'::jsonb,
    89000,
    'EUR',
    'Digitalprint',
    '{"widthCm":80,"heightCm":80}'::jsonb,
    'https://cdn.elbtronika.art/artworks/restlicht.jpg',
    NULL,
    '[]'::jsonb,
    'draft',
    NULL
  )
ON CONFLICT (id) DO NOTHING;

UPDATE sets
SET cover_artwork_id = 'ccccccc1-cccc-cccc-cccc-ccccccccccc1'
WHERE id = 'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1' AND cover_artwork_id IS NULL;

UPDATE sets
SET cover_artwork_id = 'ccccccc3-cccc-cccc-cccc-ccccccccccc3'
WHERE id = 'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2' AND cover_artwork_id IS NULL;

UPDATE sets
SET cover_artwork_id = 'ccccccc5-cccc-cccc-cccc-ccccccccccc5'
WHERE id = 'bbbbbbb3-bbbb-bbbb-bbbb-bbbbbbbbbbb3' AND cover_artwork_id IS NULL;

COMMIT;
