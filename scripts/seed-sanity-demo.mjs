#!/usr/bin/env node
/**
 * Seed the Sanity `production` dataset with the demo collection:
 * 5 artists, 3 DJs, 3 sets (with real audio files), 3 rooms, 8 artworks.
 *
 *   node scripts/seed-sanity-demo.mjs --assets <dir> [--dry]
 *
 * Auth: SANITY_TOKEN env var, or a token file at <dir>/sanity_token.txt.
 * The asset dir is produced by the generation pipeline and contains
 * images/{artworks,covers,avatars,rooms}/*.jpg and mp3/*.mp3.
 *
 * Documents get deterministic _ids (demo-…) and are createOrReplace'd, so
 * the script is idempotent. Every document carries isDemo: true — the shop
 * and gallery filter on this flag per ELT_MODE, and the live-switch runbook
 * unpublishes exactly these documents.
 *
 * Field names cover BOTH dialects that exist in the repo (web queries:
 * name/genreTags/supabaseId/image — cms studio: displayName/genres/
 * supabaseUserId/mainImage) so the site renders and the studio stays usable
 * until the schema alignment ships.
 */

import { createHash, randomUUID } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// biome-ignore lint/suspicious/noUndeclaredEnvVars: CLI script — vars come from the shell/Doppler, not next.config
const PROJECT = process.env.SANITY_PROJECT_ID ?? "xbjul8yd";
// biome-ignore lint/suspicious/noUndeclaredEnvVars: CLI script
const DATASET = process.env.SANITY_DATASET ?? "production";
const API = `https://${PROJECT}.api.sanity.io/v2024-01-01`;

const args = process.argv.slice(2);
const assetsIdx = args.indexOf("--assets");
const ASSETS = assetsIdx >= 0 ? args[assetsIdx + 1] : ".";
const DRY = args.includes("--dry");

// biome-ignore lint/suspicious/noUndeclaredEnvVars: CLI script
let TOKEN = process.env.SANITY_TOKEN ?? "";
if (!TOKEN && existsSync(join(ASSETS, "sanity_token.txt"))) {
  TOKEN = readFileSync(join(ASSETS, "sanity_token.txt"), "utf8").trim();
}
if (!TOKEN && !DRY) {
  console.error("No SANITY_TOKEN env and no sanity_token.txt in assets dir.");
  process.exit(1);
}

/** Deterministic UUID v5-style (SHA-1) so Sanity ↔ Supabase ids stay stable across runs. */
const NAMESPACE = "e1b7e1b7-0000-4000-8000-elbtronika00".replace(/[^0-9a-f-]/g, "0");
function uuidFor(name) {
  const h = createHash("sha1").update(NAMESPACE).update(name).digest();
  const b = Buffer.from(h.subarray(0, 16));
  b[6] = (b[6] & 0x0f) | 0x50; // version 5
  b[8] = (b[8] & 0x3f) | 0x80; // variant
  const hex = b.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function uploadAsset(kind, filePath, filename) {
  const body = readFileSync(filePath);
  const res = await fetch(`${API}/assets/${kind}/${DATASET}?filename=${encodeURIComponent(filename)}`, {
    method: "POST",
    headers: {
      "Content-Type": kind === "images" ? "image/jpeg" : "audio/mpeg",
      Authorization: `Bearer ${TOKEN}`,
    },
    body,
  });
  if (!res.ok) throw new Error(`asset upload ${filename}: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.document;
}

async function mutate(mutations) {
  const res = await fetch(`${API}/data/mutate/${DATASET}?returnIds=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) throw new Error(`mutate: ${res.status} ${await res.text()}`);
  return res.json();
}

const img = (assetId) => ({ _type: "image", asset: { _type: "reference", _ref: assetId } });
const file = (assetId) => ({ _type: "file", asset: { _type: "reference", _ref: assetId } });
const ref = (id) => ({ _type: "reference", _ref: id });
const slug = (s) => ({ _type: "slug", current: s });
const key = () => randomUUID().slice(0, 12);
const blocks = (text) =>
  text.split("\n\n").map((para) => ({
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: key(), text: para, marks: [] }],
  }));

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const ARTISTS = [
  {
    id: "demo-artist-mira-volk",
    name: "Mira Volk",
    slug: "mira-volk",
    bio: "Berlin-based digital artist exploring light, sound, and the ephemeral nature of rave culture.",
    genreTags: ["generative", "light-art"],
    website: "https://example.com/mira-volk",
    instagram: "@mira.volk",
    avatar: "mira-volk.jpg",
  },
  {
    id: "demo-artist-kenji-aoki",
    name: "Kenji Aoki",
    slug: "kenji-aoki",
    bio: "Tokyo-born painter turned generative artist. His work bridges traditional ink wash and WebGL shaders.",
    genreTags: ["shader-art", "sumi-e"],
    website: "https://example.com/kenji-aoki",
    instagram: "@kenji.aoki",
    avatar: "kenji-aoki.jpg",
  },
  {
    id: "demo-artist-helena-moraes",
    name: "Helena Moraes",
    slug: "helena-moraes",
    bio: "São Paulo sculptor working with recycled electronics and bioluminescent resin.",
    genreTags: ["mixed-media", "e-waste"],
    website: "https://example.com/helena-moraes",
    instagram: "@helena.moraes",
    avatar: "helena-moraes.jpg",
  },
  {
    id: "demo-artist-theo-karagiannis",
    name: "Theo Karagiannis",
    slug: "theo-karagiannis",
    bio: "Athens-based photographer capturing the liminal spaces between underground clubs and dawn.",
    genreTags: ["photography", "documentary"],
    website: "https://example.com/theo-karagiannis",
    instagram: "@theo.karagiannis",
    avatar: "theo-karagiannis.jpg",
  },
  {
    id: "demo-artist-sasha-wren",
    name: "Sasha Wren",
    slug: "sasha-wren",
    bio: "London sound-visualist. Every piece is a frozen moment from a DJ set she witnessed.",
    genreTags: ["sound-visualization"],
    website: "https://example.com/sasha-wren",
    instagram: "@sasha.wren",
    avatar: "sasha-wren.jpg",
  },
];

const DJS = [
  {
    id: "demo-dj-lior-k",
    name: "Lior K.",
    slug: "lior-k",
    bio: "Tel Aviv techno curator. Founder of the “Frequency” podcast series.",
    genreTags: ["techno", "peak-time"],
    soundcloud: "https://example.com/lior-k",
    avatar: "lior-k.jpg",
  },
  {
    id: "demo-dj-nightform",
    name: "Nightform",
    slug: "nightform",
    bio: "Anonymous Berlin collective. Their sets are legendary — their identity, irrelevant.",
    genreTags: ["ambient-techno", "deep"],
    soundcloud: "https://example.com/nightform",
    avatar: "nightform.jpg",
  },
  {
    id: "demo-dj-velvetrace",
    name: "Velvetrace",
    slug: "velvetrace",
    bio: "Parisian house producer with a background in classical piano. Elegance meets bass.",
    genreTags: ["house", "deep-house"],
    soundcloud: "https://example.com/velvetrace",
    avatar: "velvetrace.jpg",
  },
];

const SETS = [
  {
    id: "demo-set-neon-ritual",
    title: "Neon Ritual",
    slug: "neon-ritual",
    dj: "demo-dj-lior-k",
    bpm: 128,
    durationMin: 3,
    genreTags: ["techno", "driving", "dark"],
    description:
      "Recorded in one take. A driving F-minor ritual — rumble kicks, acid vapour and one riser that never quite resolves.",
    cover: "set-neon-ritual.jpg",
    audio: "set-neon-ritual.mp3",
    tracklist: [
      { position: 1, artist: "Lior K.", track: "Ritual Entry", label: "ELBTRONIKA" },
      { position: 2, artist: "Lior K.", track: "Neon Corridor", label: "ELBTRONIKA" },
      { position: 3, artist: "Lior K.", track: "Afterglow", label: "ELBTRONIKA" },
    ],
  },
  {
    id: "demo-set-subway-frequencies",
    title: "Subway Frequencies",
    slug: "subway-frequencies",
    dj: "demo-dj-nightform",
    bpm: 102,
    durationMin: 3,
    genreTags: ["ambient-techno", "deep", "hypnotic"],
    description:
      "Half-time pressure at 102. Field-recording hiss, a sub that breathes in 16-bar waves, bells like passing stations.",
    cover: "set-subway-frequencies.jpg",
    audio: "set-subway-frequencies.mp3",
    tracklist: [
      { position: 1, artist: "Nightform", track: "Platform Zero", label: "ELBTRONIKA" },
      { position: 2, artist: "Nightform", track: "Tunnel Light", label: "ELBTRONIKA" },
    ],
  },
  {
    id: "demo-set-velvet-hours",
    title: "Velvet Hours",
    slug: "velvet-hours",
    dj: "demo-dj-velvetrace",
    bpm: 122,
    durationMin: 3,
    genreTags: ["house", "warm", "elegant"],
    description:
      "Swung hats, Rhodes-warm chords over a D-minor walk. House for the hour when the lights come up and nobody leaves.",
    cover: "set-velvet-hours.jpg",
    audio: "set-velvet-hours.mp3",
    tracklist: [
      { position: 1, artist: "Velvetrace", track: "Velvet Opening", label: "ELBTRONIKA" },
      { position: 2, artist: "Velvetrace", track: "Hours", label: "ELBTRONIKA" },
      { position: 3, artist: "Velvetrace", track: "Last Light", label: "ELBTRONIKA" },
    ],
  },
];

const ROOMS = [
  {
    id: "demo-room-lobby",
    title: "Lobby",
    slug: "lobby",
    description: "The entry point. Soft ambient pulses guide visitors into the space.",
    skybox: "void",
    lighting: "ambient",
    featuredDj: "demo-dj-nightform",
    cover: "lobby.jpg",
    ambient: "room-lobby-ambient.mp3",
  },
  {
    id: "demo-room-neon-hall",
    title: "Neon Hall",
    slug: "neon-hall",
    description: "High-energy room with reactive LED sculptures and driving techno.",
    skybox: "dark_club",
    lighting: "neon",
    featuredDj: "demo-dj-lior-k",
    cover: "neon-hall.jpg",
    ambient: "room-neon-hall-ambient.mp3",
  },
  {
    id: "demo-room-quiet-garden",
    title: "Quiet Garden",
    slug: "quiet-garden",
    description: "A meditative space. Generative flora responds to downtempo frequencies.",
    skybox: "nebula",
    lighting: "warm_gallery",
    featuredDj: "demo-dj-velvetrace",
    cover: "quiet-garden.jpg",
    ambient: "room-quiet-garden-ambient.mp3",
  },
];

const ARTWORKS = [
  {
    id: "demo-artwork-resonance-no-7",
    title: "Resonance No. 7",
    slug: "resonance-no-7",
    artist: "demo-artist-mira-volk",
    room: "demo-room-neon-hall",
    set: "demo-set-neon-ritual",
    dj: "demo-dj-lior-k",
    price: 150000,
    medium: "generative_digital",
    dimensions: "120 × 180 cm",
    year: 2026,
    genreTags: ["generative", "light", "feedback"],
    description:
      "A study in feedback loops — light reacting to sound reacting to light. Three detuned ring systems interfere until they resonate.",
    story:
      "Created during a 48-hour lock-in. Mira drove three projectors from the same audio bus and photographed the standing waves that emerged when the room itself started to resonate at the seventh harmonic.",
    image: "resonance-no-7.jpg",
  },
  {
    id: "demo-artwork-ink-protocol",
    title: "Ink Protocol",
    slug: "ink-protocol",
    artist: "demo-artist-kenji-aoki",
    room: "demo-room-quiet-garden",
    set: "demo-set-subway-frequencies",
    dj: "demo-dj-nightform",
    price: 120000,
    medium: "shader_art",
    dimensions: "100 × 100 cm",
    year: 2026,
    genreTags: ["sumi-e", "flow-field", "monochrome"],
    description:
      "Traditional sumi-e brushstrokes translated into shader code. Each stroke follows a vector field; each frame is a new breath.",
    story:
      "Kenji trained on his grandfather's ink drawings, then rewrote the brush as a fragment shader. The teal interference band marks the moment the algorithm disagrees with tradition.",
    image: "ink-protocol.jpg",
  },
  {
    id: "demo-artwork-circuit-garden",
    title: "Circuit Garden",
    slug: "circuit-garden",
    artist: "demo-artist-helena-moraes",
    room: "demo-room-quiet-garden",
    set: "demo-set-subway-frequencies",
    dj: "demo-dj-nightform",
    price: 95000,
    medium: "mixed_media",
    dimensions: "80 × 60 × 40 cm",
    year: 2025,
    genreTags: ["e-waste", "bioluminescent", "sculpture"],
    description: "Dead motherboards reborn as bioluminescent terrariums. Every LED is hand-soldered.",
    story:
      "Helena collected the boards from São Paulo repair shops that were closing. The traces still carry signals — now they feed light to resin flora instead of data to dead CPUs.",
    image: "circuit-garden.jpg",
  },
  {
    id: "demo-artwork-447-am",
    title: "4:47 AM",
    slug: "447-am",
    artist: "demo-artist-theo-karagiannis",
    room: "demo-room-lobby",
    set: "demo-set-velvet-hours",
    dj: "demo-dj-velvetrace",
    price: 80000,
    medium: "photography",
    dimensions: "60 × 90 cm",
    year: 2025,
    genreTags: ["photography", "club", "dawn"],
    description: "The exact moment the club lights come on. Captured on a Leica M6, developed by hand.",
    story:
      "Theo waited four months for a morning when the door light and the dawn behind it had the same temperature. The silhouettes are cable stands — everyone else had already gone home.",
    image: "447-am.jpg",
  },
  {
    id: "demo-artwork-frequency-memory",
    title: "Frequency Memory",
    slug: "frequency-memory",
    artist: "demo-artist-sasha-wren",
    room: "demo-room-neon-hall",
    set: "demo-set-neon-ritual",
    dj: "demo-dj-lior-k",
    price: 110000,
    medium: "sound_visualization",
    dimensions: "100 × 150 cm",
    year: 2026,
    genreTags: ["spectrogram", "pigment", "sound-art"],
    description:
      "What does a DJ set look like when frozen? A spectral analysis of “Neon Ritual”, mapped band by band into pigment.",
    story:
      "This piece is measured, not painted: every horizontal band is one frequency bin of the actual set that plays beside it in the gallery. The bright rows are the kick; the violet mist is the acid line.",
    image: "frequency-memory.jpg",
  },
  {
    id: "demo-artwork-sub-bass-cathedral",
    title: "Sub-Bass Cathedral",
    slug: "sub-bass-cathedral",
    artist: "demo-artist-mira-volk",
    room: "demo-room-neon-hall",
    set: "demo-set-subway-frequencies",
    dj: "demo-dj-nightform",
    price: 180000,
    medium: "generative_digital",
    dimensions: "200 × 300 cm",
    year: 2026,
    genreTags: ["architecture", "sub-bass", "waveform"],
    description:
      "An architectural study of low-frequency resonance. The arches are the low-passed waveform of “Subway Frequencies”, stacked 26 storeys high.",
    story:
      "Mira low-passed the set at 120 Hz and let each two-second window become one storey. The building stands because the bass repeats — the structure vibrates at 40 Hz, literally.",
    image: "sub-bass-cathedral.jpg",
  },
  {
    id: "demo-artwork-ghost-in-the-machine",
    title: "Ghost in the Machine",
    slug: "ghost-in-the-machine",
    artist: "demo-artist-kenji-aoki",
    room: "demo-room-lobby",
    set: "demo-set-velvet-hours",
    dj: "demo-dj-velvetrace",
    price: 75000,
    medium: "ai_art",
    dimensions: "80 × 80 cm",
    year: 2025,
    genreTags: ["crt", "glitch", "portrait"],
    description: "AI-generated portraits of obsolete hardware. Nostalgia for technology that never existed.",
    story:
      "The face belongs to no machine that ever shipped: indicator-LED eyes, a cassette-grill mouth, scanlines from a tube that was never manufactured. Kenji calls it a memorial for vaporware.",
    image: "ghost-in-the-machine.jpg",
  },
  {
    id: "demo-artwork-velvet-decay",
    title: "Velvet Decay",
    slug: "velvet-decay",
    artist: "demo-artist-sasha-wren",
    room: "demo-room-quiet-garden",
    set: "demo-set-velvet-hours",
    dj: "demo-dj-velvetrace",
    price: 135000,
    medium: "sound_sculpture",
    dimensions: "150 × 100 × 50 cm",
    year: 2026,
    genreTags: ["waveform", "decay", "velvet"],
    description:
      "The slow death of a synthesizer, recorded over 6 months. Each crackle is a memory. 48 rows of the actual waveform, each 10% quieter.",
    story:
      "Sasha recorded the same chord on a dying polysynth every Sunday until it stopped booting. The rows run top to bottom in time; the crackle density is real, not rendered.",
    image: "velvet-decay.jpg",
  },
];

// ---------------------------------------------------------------------------

async function main() {
  console.log(`Seeding ${PROJECT}/${DATASET} ${DRY ? "(dry run)" : ""}`);
  const assets = {};

  if (!DRY) {
    for (const a of ARTISTS) {
      assets[a.avatar] = (await uploadAsset("images", join(ASSETS, "images/avatars", a.avatar), a.avatar))._id;
      console.log("uploaded avatar", a.avatar);
    }
    for (const d of DJS) {
      assets[d.avatar] = (await uploadAsset("images", join(ASSETS, "images/avatars", d.avatar), d.avatar))._id;
      console.log("uploaded avatar", d.avatar);
    }
    for (const s of SETS) {
      assets[s.cover] = (await uploadAsset("images", join(ASSETS, "images/covers", s.cover), s.cover))._id;
      assets[s.audio] = (await uploadAsset("files", join(ASSETS, "mp3", s.audio), s.audio))._id;
      console.log("uploaded set assets", s.slug);
    }
    for (const r of ROOMS) {
      assets[r.cover] = (await uploadAsset("images", join(ASSETS, "images/rooms", r.cover), r.cover))._id;
      assets[r.ambient] = (await uploadAsset("files", join(ASSETS, "mp3", r.ambient), r.ambient))._id;
      console.log("uploaded room assets", r.slug);
    }
    for (const w of ARTWORKS) {
      assets[w.image] = (await uploadAsset("images", join(ASSETS, "images/artworks", w.image), w.image))._id;
      console.log("uploaded artwork image", w.slug);
    }
  }

  // Resolve mp3 asset URLs for hlsUrl-style direct playback fields
  const assetUrl = async (assetId) => {
    if (DRY) return `dry://${assetId}`;
    const res = await fetch(
      `${API}/data/query/${DATASET}?query=${encodeURIComponent(`*[_id=="${assetId}"][0].url`)}`,
      { headers: { Authorization: `Bearer ${TOKEN}` } },
    );
    const json = await res.json();
    return json.result;
  };

  const docs = [];

  for (const a of ARTISTS) {
    docs.push({
      _id: a.id,
      _type: "artist",
      name: a.name,
      displayName: a.name,
      slug: slug(a.slug),
      bio: a.bio,
      genreTags: a.genreTags,
      website: a.website,
      instagram: a.instagram,
      avatar: DRY ? undefined : img(assets[a.avatar]),
      supabaseId: uuidFor(a.id),
      supabaseUserId: uuidFor(a.id),
      kycStatus: "approved",
      isDemo: true,
    });
  }

  for (const d of DJS) {
    docs.push({
      _id: d.id,
      _type: "dj",
      name: d.name,
      displayName: d.name,
      slug: slug(d.slug),
      bio: d.bio,
      genreTags: d.genreTags,
      genres: d.genreTags,
      soundcloud: d.soundcloud,
      soundcloudUrl: d.soundcloud,
      avatar: DRY ? undefined : img(assets[d.avatar]),
      supabaseId: uuidFor(d.id),
      supabaseUserId: uuidFor(d.id),
      kycStatus: "approved",
      isDemo: true,
    });
  }

  for (const s of SETS) {
    docs.push({
      _id: s.id,
      _type: "set",
      title: s.title,
      slug: slug(s.slug),
      dj: ref(s.dj),
      bpm: s.bpm,
      durationMin: s.durationMin,
      durationSec: s.durationMin * 60,
      genreTags: s.genreTags,
      description: s.description,
      coverImage: DRY ? undefined : img(assets[s.cover]),
      audioFile: DRY ? undefined : file(assets[s.audio]),
      hlsUrl: await assetUrl(assets[s.audio]),
      tracklist: s.tracklist.map((t) => ({ _key: key(), _type: "tracklistEntry", ...t })),
      status: "published",
      supabaseId: uuidFor(s.id),
      isDemo: true,
    });
  }

  for (const r of ROOMS) {
    docs.push({
      _id: r.id,
      _type: "room",
      title: r.title,
      slug: slug(r.slug),
      description: blocks(r.description),
      skybox: r.skybox,
      lightingPreset: r.lighting,
      maxArtworks: 12,
      artworkSlots: ARTWORKS.filter((w) => w.room === r.id).map((w) => ({ _key: key(), ...ref(w.id) })),
      featuredDj: ref(r.featuredDj),
      coverImage: DRY ? undefined : img(assets[r.cover]),
      ambientAudioUrl: await assetUrl(assets[r.ambient]),
      status: "open",
      supabaseId: uuidFor(r.id),
      isDemo: true,
    });
  }

  for (const w of ARTWORKS) {
    docs.push({
      _id: w.id,
      _type: "artwork",
      title: w.title,
      slug: slug(w.slug),
      artist: ref(w.artist),
      image: DRY ? undefined : img(assets[w.image]),
      mainImage: DRY ? undefined : img(assets[w.image]),
      medium: w.medium,
      dimensions: w.dimensions,
      year: w.year,
      genreTags: w.genreTags,
      tags: w.genreTags,
      description: w.description,
      story: w.story,
      price: w.price,
      edition: { total: 1, sold: 0 },
      status: "published",
      associatedSet: ref(w.set),
      associatedDj: ref(w.dj),
      room: ref(w.room),
      featuredInRoom: ref(w.room),
      supabaseId: uuidFor(w.id),
      isDemo: true,
    });
  }

  if (DRY) {
    console.log(JSON.stringify(docs, null, 2));
    return;
  }

  const result = await mutate(docs.map((doc) => ({ createOrReplace: doc })));
  console.log(`created/replaced ${result.results?.length ?? 0} documents`);

  // Manifest for the analysis pipeline (scripts/analyze-assets.mts)
  const manifest = {
    sets: SETS.map((s) => ({ file: join(ASSETS, "mp3", s.audio), supabaseId: uuidFor(s.id) })),
    artworks: ARTWORKS.map((w) => ({
      file: join(ASSETS, "images/artworks", w.image),
      supabaseId: uuidFor(w.id),
    })),
  };
  const { writeFileSync } = await import("node:fs");
  writeFileSync(join(ASSETS, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log("wrote manifest.json (input for scripts/analyze-assets.mts)");

  // Supabase-side seed data — column names match packages/contracts gen types.
  // profiles.id comes from auth.admin.createUser at seed time (FK to auth.users),
  // therefore personas carry a deterministic email as the join key instead.
  const imageUrl = async (assetId) => assetUrl(assetId);
  const supa = {
    personas: [
      ...ARTISTS.map((a) => ({
        kind: "artist",
        email: `demo+${a.slug}@elbtronika.art`,
        display_name: a.name,
        role: "artist",
        entity: {
          id: uuidFor(a.id),
          name: a.name,
          slug: a.slug,
          bio: a.bio,
          genre_tags: a.genreTags,
          website: a.website,
          instagram: a.instagram,
          stripe_account_id: `acct_demo_${a.slug.replace(/-/g, "_")}`,
          payout_enabled: false,
          is_published: true,
        },
      })),
      ...DJS.map((d) => ({
        kind: "dj",
        email: `demo+${d.slug}@elbtronika.art`,
        display_name: d.name,
        role: "dj",
        entity: {
          id: uuidFor(d.id),
          name: d.name,
          slug: d.slug,
          bio: d.bio,
          genre_tags: d.genreTags,
          soundcloud: d.soundcloud,
          stripe_account_id: `acct_demo_${d.slug.replace(/-/g, "_")}`,
          payout_enabled: false,
          is_published: true,
        },
      })),
    ],
    sets: await Promise.all(
      SETS.map(async (s) => ({
        id: uuidFor(s.id),
        title: s.title,
        slug: s.slug,
        dj_id: uuidFor(s.dj),
        description: s.description,
        bpm: s.bpm,
        duration_sec: s.durationMin * 60,
        genre_tags: s.genreTags,
        hls_url: await assetUrl(assets[s.audio]),
        cover_url: await imageUrl(assets[s.cover]),
        is_published: true,
        sanity_id: s.id,
      })),
    ),
    artworks: await Promise.all(
      ARTWORKS.map(async (w) => ({
        id: uuidFor(w.id),
        title: w.title,
        slug: w.slug,
        artist_id: uuidFor(w.artist),
        set_id: uuidFor(w.set),
        description: w.description,
        medium: w.medium,
        dimensions: w.dimensions,
        year: w.year,
        genre_tags: w.genreTags,
        price_eur: w.price / 100,
        edition_size: 1,
        editions_sold: 0,
        image_url: await imageUrl(assets[w.image]),
        is_demo: true,
        is_published: true,
        sanity_id: w.id,
      })),
    ),
  };
  writeFileSync(join(ASSETS, "supabase-seed.json"), JSON.stringify(supa, null, 2));
  console.log("wrote supabase-seed.json → run scripts/seed-supabase-demo.mjs with service-role creds");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
