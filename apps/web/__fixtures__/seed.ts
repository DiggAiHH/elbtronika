// Deterministic test fixtures matching supabase/seed.sql
// Import these in Vitest tests instead of hardcoding UUIDs.

export const SEED = {
  profiles: {
    artist: { id: "00000000-0000-0000-0000-000000000001", role: "artist" as const, display_name: "Eva Richter" },
    dj:     { id: "00000000-0000-0000-0000-000000000002", role: "dj" as const,     display_name: "DJ Koi" },
    buyer:  { id: "00000000-0000-0000-0000-000000000003", role: "collector" as const, display_name: "Max Musterkäufer" },
  },
  artists: {
    evaRichter: { id: "10000000-0000-0000-0000-000000000001", slug: "eva-richter" },
  },
  djs: {
    djKoi: { id: "20000000-0000-0000-0000-000000000001", slug: "dj-koi" },
  },
  rooms: {
    dunkelraum: { id: "30000000-0000-0000-0000-000000000001", slug: "dunkelraum", sanity_id: "seed-room-dunkelraum" },
  },
  sets: {
    dunkelzeit: { id: "40000000-0000-0000-0000-000000000001", slug: "koi-dunkelzeit", sanity_id: "seed-set-dunkelzeit" },
  },
  artworks: {
    lichtfragment: {
      id: "50000000-0000-0000-0000-000000000001",
      slug: "lichtfragment-i",
      sanity_id: "seed-artwork-lichtfragment-i",
      price_eur: 1200.00,
    },
    schwebezustand: {
      id: "50000000-0000-0000-0000-000000000002",
      slug: "schwebezustand-ii",
      sanity_id: "seed-artwork-schwebezustand-ii",
      price_eur: 890.00,
    },
    rauschen: {
      id: "50000000-0000-0000-0000-000000000003",
      slug: "rauschen-03",
      sanity_id: "seed-artwork-rauschen-03",
      price_eur: 650.00,
      model_url: "https://cdn.elbtronika.art/models/seed-003/rauschen.glb",
    },
  },
} as const
