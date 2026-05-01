-- Demo Persona Seed — Idempotent (ON CONFLICT DO NOTHING)
-- Run against dev/staging Supabase after migrations are applied.
-- Includes: 5 Artists, 3 DJs, 3 Rooms, 8 Artworks (all marked is_demo = true)

-- ============================================
-- 1. PROFILES (Artists + DJs)
-- ============================================

INSERT INTO profiles (id, display_name, role, bio, avatar_url, created_at)
VALUES
  ('a1e2f3g4-h5i6-j7k8-l9m0-n1o2p3q4r5s6', 'Mira Volk', 'artist', 'Berlin-based digital artist exploring light, sound, and the ephemeral nature of rave culture.', 'https://cdn.elbtronika.art/demo/avatars/mira-volk.jpg', NOW()),
  ('b2f3g4h5-i6j7-k8l9-m0n1-o2p3q4r5s6t7', 'Kenji Aoki', 'artist', 'Tokyo-born painter turned generative artist. His work bridges traditional ink wash and WebGL shaders.', 'https://cdn.elbtronika.art/demo/avatars/kenji-aoki.jpg', NOW()),
  ('c3g4h5i6-j7k8-l9m0-n1o2-p3q4r5s6t7u8', 'Helena Moraes', 'artist', 'São Paulo sculptor working with recycled electronics and bioluminescent resin.', 'https://cdn.elbtronika.art/demo/avatars/helena-moraes.jpg', NOW()),
  ('d4h5i6j7-k8l9-m0n1-o2p3-q4r5s6t7u8v9', 'Theo Karagiannis', 'artist', 'Athens-based photographer capturing the liminal spaces between underground clubs and dawn.', 'https://cdn.elbtronika.art/demo/avatars/theo-karagiannis.jpg', NOW()),
  ('e5i6j7k8-l9m0-n1o2-p3q4-r5s6t7u8v9w0', 'Sasha Wren', 'artist', 'London sound-visualist. Every piece is a frozen moment from a DJ set she witnessed.', 'https://cdn.elbtronika.art/demo/avatars/sasha-wren.jpg', NOW()),
  ('f6j7k8l9-m0n1-o2p3-q4r5-s6t7u8v9w0x1', 'Lior K.', 'dj', 'Tel Aviv techno curator. Founder of the "Frequency" podcast series.', 'https://cdn.elbtronika.art/demo/avatars/lior-k.jpg', NOW()),
  ('g7k8l9m0-n1o2-p3q4-r5s6-t7u8v9w0x1y2', 'Nightform', 'dj', 'Anonymous Berlin collective. Their sets are legendary — their identity, irrelevant.', 'https://cdn.elbtronika.art/demo/avatars/nightform.jpg', NOW()),
  ('h8l9m0n1-o2p3-q4r5-s6t7-u8v9w0x1y2z3', 'Velvetrace', 'dj', 'Parisian house producer with a background in classical piano. Elegance meets bass.', 'https://cdn.elbtronika.art/demo/avatars/velvetrace.jpg', NOW())
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url;

-- ============================================
-- 2. ARTISTS (Extended Profiles)
-- ============================================

INSERT INTO artists (id, profile_id, stripe_account_id, portfolio_url, social_links, verified, created_at)
VALUES
  ('art-mira-001', 'a1e2f3g4-h5i6-j7k8-l9m0-n1o2p3q4r5s6', 'acct_demo_mira_volk_001', 'https://miravolk.art', '{"instagram": "@mira.volk", "twitter": "@miravolk"}', true, NOW()),
  ('art-kenji-002', 'b2f3g4h5-i6j7-k8l9-m0n1-o2p3q4r5s6t7', 'acct_demo_kenji_aoki_002', 'https://kenjiaoki.studio', '{"instagram": "@kenji.aoki", "behance": "kenjiaoki"}', true, NOW()),
  ('art-helena-003', 'c3g4h5i6-j7k8-l9m0-n1o2-p3q4r5s6t7u8', 'acct_demo_helena_moraes_003', 'https://helenamoraes.com', '{"instagram": "@helena.moraes"}', true, NOW()),
  ('art-theo-004', 'd4h5i6j7-k8l9-m0n1-o2p3-q4r5s6t7u8v9', 'acct_demo_theo_karagiannis_004', 'https://theokaragiannis.gr', '{"instagram": "@theo.karagiannis"}', true, NOW()),
  ('art-sasha-005', 'e5i6j7k8-l9m0-n1o2-p3q4-r5s6t7u8v9w0', 'acct_demo_sasha_wren_005', 'https://sashawren.co.uk', '{"instagram": "@sasha.wren", "soundcloud": "sashawren"}', true, NOW())
ON CONFLICT (id) DO UPDATE SET
  stripe_account_id = EXCLUDED.stripe_account_id,
  portfolio_url = EXCLUDED.portfolio_url,
  verified = EXCLUDED.verified;

-- ============================================
-- 3. DJS
-- ============================================

INSERT INTO djs (id, profile_id, stripe_account_id, genre, equipment, verified, created_at)
VALUES
  ('dj-lior-001', 'f6j7k8l9-m0n1-o2p3-q4r5-s6t7u8v9w0x1', 'acct_demo_lior_k_006', 'techno', '{"headphones": "Sennheiser HD 25", "mixer": "Pioneer DJM-900"}', true, NOW()),
  ('dj-night-002', 'g7k8l9m0-n1o2-p3q4-r5s6-t7u8v9w0x1y2', 'acct_demo_nightform_007', 'ambient_techno', '{"headphones": "Audio-Technica M50x", "daw": "Ableton Live"}', true, NOW()),
  ('dj-velvet-003', 'h8l9m0n1-o2p3-q4r5-s6t7-u8v9w0x1y2z3', 'acct_demo_velvetrace_008', 'house', '{"headphones": "Beyerdynamic DT 770", "turntables": "Technics SL-1200"}', true, NOW())
ON CONFLICT (id) DO UPDATE SET
  stripe_account_id = EXCLUDED.stripe_account_id,
  genre = EXCLUDED.genre;

-- ============================================
-- 4. ROOMS
-- ============================================

INSERT INTO rooms (id, name, description, ambient_track_url, created_at)
VALUES
  ('room-lobby-001', 'Lobby', 'The entry point. Soft ambient pulses guide visitors into the space.', 'https://cdn.elbtronika.art/demo/audio/lobby-ambient.m3u8', NOW()),
  ('room-neon-002', 'Neon Hall', 'High-energy room with reactive LED sculptures and driving techno.', 'https://cdn.elbtronika.art/demo/audio/neon-hall-techno.m3u8', NOW()),
  ('room-quiet-003', 'Quiet Garden', 'A meditative space. Generative flora responds to downtempo frequencies.', 'https://cdn.elbtronika.art/demo/audio/quiet-garden-ambient.m3u8', NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ============================================
-- 5. ARTWORKS (Demo Content — is_demo = true)
-- ============================================

INSERT INTO artworks (id, title, artist_id, room_id, story, price_cents, currency, medium, dimensions, image_url, model_url, is_demo, created_at)
VALUES
  ('art-001', 'Resonance No. 7', 'art-mira-001', 'room-neon-002', 'A study in feedback loops — light reacting to sound reacting to light. Created during a 48-hour lock-in at Berghain.', 150000, 'eur', 'generative_digital', '120x180cm', 'https://cdn.elbtronika.art/demo/artworks/resonance-7.jpg', 'https://cdn.elbtronika.art/demo/models/resonance-7.glb', true, NOW()),
  ('art-002', 'Ink Protocol', 'art-kenji-002', 'room-quiet-003', 'Traditional sumi-e brushstrokes translated into shader code. Each frame is a new breath.', 120000, 'eur', 'shader_art', '100x100cm', 'https://cdn.elbtronika.art/demo/artworks/ink-protocol.jpg', 'https://cdn.elbtronika.art/demo/models/ink-protocol.glb', true, NOW()),
  ('art-003', 'Circuit Garden', 'art-helena-003', 'room-quiet-003', 'Dead motherboards reborn as bioluminescent terrariums. Every LED is hand-soldered.', 95000, 'eur', 'mixed_media', '80x60x40cm', 'https://cdn.elbtronika.art/demo/artworks/circuit-garden.jpg', 'https://cdn.elbtronika.art/demo/models/circuit-garden.glb', true, NOW()),
  ('art-004', '4:47 AM', 'art-theo-004', 'room-lobby-001', 'The exact moment the club lights come on. Captured on a Leica M6, developed by hand.', 80000, 'eur', 'photography', '60x90cm', 'https://cdn.elbtronika.art/demo/artworks/447-am.jpg', NULL, true, NOW()),
  ('art-005', 'Frequency Memory', 'art-sasha-005', 'room-neon-002', 'What does a DJ set look like when frozen? Spectral analysis turned into pigment.', 110000, 'eur', 'sound_visualization', '100x150cm', 'https://cdn.elbtronika.art/demo/artworks/frequency-memory.jpg', 'https://cdn.elbtronika.art/demo/models/frequency-memory.glb', true, NOW()),
  ('art-006', 'Sub-Bass Cathedral', 'art-mira-001', 'room-neon-002', 'An architectural study of low-frequency resonance. The structure vibrates at 40Hz.', 180000, 'eur', 'generative_digital', '200x300cm', 'https://cdn.elbtronika.art/demo/artworks/sub-bass-cathedral.jpg', 'https://cdn.elbtronika.art/demo/models/sub-bass-cathedral.glb', true, NOW()),
  ('art-007', 'Ghost in the Machine', 'art-kenji-002', 'room-lobby-001', 'AI-generated portraits of obsolete hardware. Nostalgia for technology that never existed.', 75000, 'eur', 'ai_art', '80x80cm', 'https://cdn.elbtronika.art/demo/artworks/ghost-machine.jpg', NULL, true, NOW()),
  ('art-008', 'Velvet Decay', 'art-sasha-005', 'room-quiet-003', 'The slow death of a synthesizer, recorded over 6 months. Each crackle is a memory.', 135000, 'eur', 'sound_sculpture', '150x100x50cm', 'https://cdn.elbtronika.art/demo/artworks/velvet-decay.jpg', 'https://cdn.elbtronika.art/demo/models/velvet-decay.glb', true, NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  story = EXCLUDED.story,
  price_cents = EXCLUDED.price_cents,
  is_demo = EXCLUDED.is_demo;
