-- Migration: Add is_demo flag to artworks table
-- Used for mode-based filtering (demo / staging / live)

alter table if exists artworks
  add column if not exists is_demo boolean not null default false;

-- Index for fast filtering by mode
create index if not exists idx_artworks_is_demo on artworks(is_demo);
