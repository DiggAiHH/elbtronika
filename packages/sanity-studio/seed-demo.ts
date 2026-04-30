/**
 * Sanity Demo Seed
 * Seeds demo documents (artists, DJs, rooms, artworks) into Sanity Studio
 * idempotently using `createOrReplace`.
 *
 * Usage:
 *   SANITY_PROJECT_ID=xxx SANITY_DATASET=production SANITY_API_TOKEN=xxx \
 *   npx tsx packages/sanity-studio/seed-demo.ts
 *
 * Safe to run multiple times — uses deterministic `_id` values.
 */

import { createClient } from "@sanity/client";

const projectId = process.env.SANITY_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_TOKEN ?? process.env.SANITY_WRITE_TOKEN;

if (!projectId) throw new Error("SANITY_PROJECT_ID not set");
if (!token) throw new Error("SANITY_API_TOKEN not set (needs write access)");

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-01-01",
  useCdn: false,
});

// ── Artists ──────────────────────────────────────────────────────────────────

const artists = [
  {
    _id: "demo-artist-mira-volk",
    _type: "artist",
    slug: { current: "mira-volk" },
    name: "Mira Volk",
    bio: { de: "Berliner Künstlerin mit Fokus auf generative Lichtinstallationen.", en: "Berlin-based artist focused on generative light installations." },
    isDemo: true,
  },
  {
    _id: "demo-artist-kenji-aoki",
    _type: "artist",
    slug: { current: "kenji-aoki" },
    name: "Kenji Aoki",
    bio: { de: "Tokio / Hamburg. Fotografie trifft auf algorithmische Prozesse.", en: "Tokyo / Hamburg. Photography meets algorithmic process." },
    isDemo: true,
  },
  {
    _id: "demo-artist-helena-moraes",
    _type: "artist",
    slug: { current: "helena-moraes" },
    name: "Helena Moraes",
    bio: { de: "São Paulo. Abstrakte Skulptur als digitales Artefakt.", en: "São Paulo. Abstract sculpture as digital artefact." },
    isDemo: true,
  },
  {
    _id: "demo-artist-theo-karagiannis",
    _type: "artist",
    slug: { current: "theo-karagiannis" },
    name: "Theo Karagiannis",
    bio: { de: "Athen / Wien. Verarbeitung kollektiver Erinnerung.", en: "Athens / Vienna. Processing collective memory." },
    isDemo: true,
  },
  {
    _id: "demo-artist-sasha-wren",
    _type: "artist",
    slug: { current: "sasha-wren" },
    name: "Sasha Wren",
    bio: { de: "London. Experimentelle Videoarbeit mit Raumklang.", en: "London. Experimental video work with spatial sound." },
    isDemo: true,
  },
];

// ── DJs ───────────────────────────────────────────────────────────────────────

const djs = [
  {
    _id: "demo-dj-lior-k",
    _type: "dj",
    slug: { current: "lior-k" },
    name: "Lior K.",
    bio: { de: "Deep Techno aus Tel Aviv.", en: "Deep techno from Tel Aviv." },
    isDemo: true,
  },
  {
    _id: "demo-dj-nightform",
    _type: "dj",
    slug: { current: "nightform" },
    name: "Nightform",
    bio: { de: "Ambient / Industrial, Berlin Underground.", en: "Ambient / industrial, Berlin underground." },
    isDemo: true,
  },
  {
    _id: "demo-dj-velvetrace",
    _type: "dj",
    slug: { current: "velvetrace" },
    name: "Velvetrace",
    bio: { de: "Melodic Techno, Hannover.", en: "Melodic techno, Hannover." },
    isDemo: true,
  },
];

// ── Rooms ─────────────────────────────────────────────────────────────────────

const rooms = [
  {
    _id: "demo-room-lobby",
    _type: "room",
    slug: { current: "lobby" },
    name: { de: "Lobby", en: "Lobby" },
    description: { de: "Eingangshalle mit ersten Eindrücken.", en: "Entrance hall with first impressions." },
    isDemo: true,
  },
  {
    _id: "demo-room-neon-hall",
    _type: "room",
    slug: { current: "neon-hall" },
    name: { de: "Neon-Halle", en: "Neon Hall" },
    description: { de: "Intensive Licht- und Klanginstallationen.", en: "Intense light and sound installations." },
    isDemo: true,
  },
  {
    _id: "demo-room-quiet-garden",
    _type: "room",
    slug: { current: "quiet-garden" },
    name: { de: "Stiller Garten", en: "Quiet Garden" },
    description: { de: "Ruhige, meditative Atmosphäre.", en: "Calm, meditative atmosphere." },
    isDemo: true,
  },
];

// ── Artworks ──────────────────────────────────────────────────────────────────

const artworks = [
  {
    _id: "demo-artwork-001",
    _type: "artwork",
    slug: { current: "luminous-threshold" },
    title: { de: "Leuchtschwelle", en: "Luminous Threshold" },
    artist: { _type: "reference", _ref: "demo-artist-mira-volk" },
    dj: { _type: "reference", _ref: "demo-dj-lior-k" },
    room: { _type: "reference", _ref: "demo-room-lobby" },
    priceCents: 180000,
    currency: "EUR",
    medium: { de: "Generative Lichtinstallation", en: "Generative light installation" },
    status: "published",
    isDemo: true,
    gltfUrl: "/demo/models/lobby-cube.glb",
  },
  {
    _id: "demo-artwork-002",
    _type: "artwork",
    slug: { current: "frequency-ghost" },
    title: { de: "Frequenzgeist", en: "Frequency Ghost" },
    artist: { _type: "reference", _ref: "demo-artist-kenji-aoki" },
    dj: { _type: "reference", _ref: "demo-dj-nightform" },
    room: { _type: "reference", _ref: "demo-room-neon-hall" },
    priceCents: 240000,
    currency: "EUR",
    medium: { de: "Algorithmische Fotografie", en: "Algorithmic photography" },
    status: "published",
    isDemo: true,
    gltfUrl: "/demo/models/neon-hall-cube.glb",
  },
  {
    _id: "demo-artwork-003",
    _type: "artwork",
    slug: { current: "bone-structure-i" },
    title: { de: "Knochenstruktur I", en: "Bone Structure I" },
    artist: { _type: "reference", _ref: "demo-artist-helena-moraes" },
    dj: { _type: "reference", _ref: "demo-dj-velvetrace" },
    room: { _type: "reference", _ref: "demo-room-quiet-garden" },
    priceCents: 320000,
    currency: "EUR",
    medium: { de: "Digitale Skulptur", en: "Digital sculpture" },
    status: "published",
    isDemo: true,
    gltfUrl: "/demo/models/quiet-garden-cube.glb",
  },
  {
    _id: "demo-artwork-004",
    _type: "artwork",
    slug: { current: "echo-chamber" },
    title: { de: "Echokammer", en: "Echo Chamber" },
    artist: { _type: "reference", _ref: "demo-artist-theo-karagiannis" },
    dj: { _type: "reference", _ref: "demo-dj-lior-k" },
    room: { _type: "reference", _ref: "demo-room-neon-hall" },
    priceCents: 150000,
    currency: "EUR",
    medium: { de: "Videoarbeit", en: "Video work" },
    status: "published",
    isDemo: true,
    gltfUrl: "/demo/models/neon-hall-cube.glb",
  },
  {
    _id: "demo-artwork-005",
    _type: "artwork",
    slug: { current: "signal-drift" },
    title: { de: "Signalab drift", en: "Signal Drift" },
    artist: { _type: "reference", _ref: "demo-artist-sasha-wren" },
    dj: { _type: "reference", _ref: "demo-dj-nightform" },
    room: { _type: "reference", _ref: "demo-room-lobby" },
    priceCents: 200000,
    currency: "EUR",
    medium: { de: "Experimentelles Video", en: "Experimental video" },
    status: "published",
    isDemo: true,
    gltfUrl: "/demo/models/lobby-cube.glb",
  },
  {
    _id: "demo-artwork-006",
    _type: "artwork",
    slug: { current: "dark-matter-ii" },
    title: { de: "Dunkle Materie II", en: "Dark Matter II" },
    artist: { _type: "reference", _ref: "demo-artist-mira-volk" },
    dj: { _type: "reference", _ref: "demo-dj-velvetrace" },
    room: { _type: "reference", _ref: "demo-room-quiet-garden" },
    priceCents: 280000,
    currency: "EUR",
    medium: { de: "Lichtprojektion", en: "Light projection" },
    status: "published",
    isDemo: true,
    gltfUrl: "/demo/models/quiet-garden-cube.glb",
  },
  {
    _id: "demo-artwork-007",
    _type: "artwork",
    slug: { current: "pulse-archive" },
    title: { de: "Pulsarchiv", en: "Pulse Archive" },
    artist: { _type: "reference", _ref: "demo-artist-kenji-aoki" },
    dj: { _type: "reference", _ref: "demo-dj-lior-k" },
    room: { _type: "reference", _ref: "demo-room-neon-hall" },
    priceCents: 195000,
    currency: "EUR",
    medium: { de: "Datenvisualisierung", en: "Data visualisation" },
    status: "published",
    isDemo: true,
    gltfUrl: "/demo/models/neon-hall-cube.glb",
  },
  {
    _id: "demo-artwork-008",
    _type: "artwork",
    slug: { current: "transit-space" },
    title: { de: "Transitraum", en: "Transit Space" },
    artist: { _type: "reference", _ref: "demo-artist-helena-moraes" },
    dj: { _type: "reference", _ref: "demo-dj-nightform" },
    room: { _type: "reference", _ref: "demo-room-lobby" },
    priceCents: 350000,
    currency: "EUR",
    medium: { de: "3D-Installation", en: "3D installation" },
    status: "published",
    isDemo: true,
    gltfUrl: "/demo/models/lobby-cube.glb",
  },
];

// ── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  const docs = [...artists, ...djs, ...rooms, ...artworks];
  console.log(`Seeding ${docs.length} demo documents to ${dataset}…`);

  const tx = client.transaction();
  for (const doc of docs) {
    tx.createOrReplace(doc);
  }

  const result = await tx.commit();
  console.log(`✓ Committed ${result.results.length} documents`);
  console.log("Demo seed complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
