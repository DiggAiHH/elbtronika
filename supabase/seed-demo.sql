-- Demo Persona Seed for ELBTRONIKA
-- Idempotent: ON CONFLICT DO NOTHING / DO UPDATE
-- Run with: psql $DATABASE_URL -f seed-demo.sql

-- ---------------------------------------------------------------------------
-- 1. Demo Artists (5)
-- ---------------------------------------------------------------------------
insert into artists (id, slug, name, bio, genre_tags, stripe_account_id, payout_enabled, created_at)
values
  ('mira-volk', 'mira-volk', 'Mira Volk', 'Berlin-based abstract digital painter. Exploring the boundary between noise and beauty.', '{"abstract","digital","berlin"}', 'acct_demo_mira_volk_001', true, now()),
  ('kenji-aoki', 'kenji-aoki', 'Kenji Aoki', 'Tokyo post-cyberpunk visualist. Neon-drenched futures in static frames.', '{"cyberpunk","neon","tokyo"}', 'acct_demo_kenji_aoki_002', true, now()),
  ('helena-moraes', 'helena-moraes', 'Helena Moraes', 'São Paulo glitch artist. Corruption as aesthetic. Data as pigment.', '{"glitch","brazil","data-art"}', 'acct_demo_helena_moraes_003', true, now()),
  ('theo-karagiannis', 'theo-karagiannis', 'Theo Karagiannis', 'Athens-based mediterranean futurism. Ancient marble meets render farm.', '{"mediterranean","futurism","athens"}', 'acct_demo_theo_karagiannis_004', true, now()),
  ('sasha-wren', 'sasha-wren', 'Sasha Wren', 'London dark surrealism. Dreams you remember but wish you forgot.', '{"surrealism","dark","london"}', 'acct_demo_sasha_wren_005', true, now())
on conflict (id) do update set
  name = excluded.name,
  bio = excluded.bio,
  genre_tags = excluded.genre_tags,
  stripe_account_id = excluded.stripe_account_id,
  payout_enabled = excluded.payout_enabled;

-- ---------------------------------------------------------------------------
-- 2. Demo DJs (3)
-- ---------------------------------------------------------------------------
insert into djs (id, slug, name, bio, genre_tags, stripe_account_id, payout_enabled, created_at)
values
  ('lior-k', 'lior-k', 'Lior K.', 'Minimal techno purist. Less is infinitely more.', '{"minimal","techno"}', 'acct_demo_lior_k_006', true, now()),
  ('nightform', 'nightform', 'Nightform', 'Ambient architectures and breakbeat fractures.', '{"ambient","breakbeat"}', 'acct_demo_nightform_007', true, now()),
  ('velvetrace', 'velvetrace', 'Velvetrace', 'House foundations with downtempo drift.', '{"house","downtempo"}', 'acct_demo_velvetrace_008', true, now())
on conflict (id) do update set
  name = excluded.name,
  bio = excluded.bio,
  genre_tags = excluded.genre_tags,
  stripe_account_id = excluded.stripe_account_id,
  payout_enabled = excluded.payout_enabled;

-- ---------------------------------------------------------------------------
-- 3. Demo Rooms (3)
-- ---------------------------------------------------------------------------
insert into rooms (id, slug, title, description, created_at)
values
  ('lobby', 'lobby', 'Lobby', 'The entry point. Soft light, distant bass.', now()),
  ('neon-hall', 'neon-hall', 'Neon Hall', 'High ceilings, vertical light strips, relentless rhythm.', now()),
  ('quiet-garden', 'quiet-garden', 'Quiet Garden', 'A breather. Water features, moss, ambient drone.', now())
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description;

-- ---------------------------------------------------------------------------
-- 4. Demo Artworks (8) — all flagged is_demo = true
-- ---------------------------------------------------------------------------
insert into artworks (id, slug, title, artist_id, price_eur, currency, medium, year, is_demo, status, created_at)
values
  ('demo-artwork-01', 'signal-loss-01', 'Signal Loss I', 'mira-volk', 12000, 'EUR', 'Digital Print', 2026, true, 'published', now()),
  ('demo-artwork-02', 'signal-loss-02', 'Signal Loss II', 'mira-volk', 15000, 'EUR', 'Digital Print', 2026, true, 'published', now()),
  ('demo-artwork-03', 'neon-ancestor', 'Neon Ancestor', 'kenji-aoki', 18000, 'EUR', 'Generative Video Loop', 2026, true, 'published', now()),
  ('demo-artwork-04', 'glitch-portrait-07', 'Glitch Portrait #07', 'helena-moraes', 9500, 'EUR', 'Data Corruption Print', 2026, true, 'published', now()),
  ('demo-artwork-05', 'marble-render-09', 'Marble Render #09', 'theo-karagiannis', 22000, 'EUR', '3D Render', 2026, true, 'published', now()),
  ('demo-artwork-06', 'dream-you-forgot', 'The Dream You Forgot', 'sasha-wren', 14000, 'EUR', 'Digital Painting', 2026, true, 'published', now()),
  ('demo-artwork-07', 'deep-freq', 'Deep Frequency', 'lior-k', 11000, 'EUR', 'Audio-Visual Loop', 2026, true, 'published', now()),
  ('demo-artwork-08', 'velvet-surface', 'Velvet Surface', 'velvetrace', 16000, 'EUR', 'Generative Art', 2026, true, 'published', now())
on conflict (id) do update set
  title = excluded.title,
  artist_id = excluded.artist_id,
  price_eur = excluded.price_eur,
  is_demo = excluded.is_demo,
  status = excluded.status;

-- ---------------------------------------------------------------------------
-- 5. Demo Users (optional — for investor login testing)
-- ---------------------------------------------------------------------------
-- Note: auth.users entries must be created via Supabase Auth API.
-- This seed only creates profile rows for pre-seeded user IDs.
-- insert into profiles (id, role, full_name, created_at)
-- values
--   ('00000000-0000-0000-0000-000000000001', 'investor', 'Lee Hoops', now())
-- on conflict (id) do nothing;
