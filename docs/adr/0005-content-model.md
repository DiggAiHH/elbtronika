# ADR 0005 — Content Model & CMS Integration

**Status:** Accepted  
**Date:** 2026-04-27  
**Phase:** 5 — Content Model & CMS Integration  
**Authors:** Lou + Claude (Pair)

---

## Context

ELBTRONIKA needs a content model that serves two very different consumers simultaneously:

1. **Sanity Studio** — Editorial UI for curator, artist, and DJ to author rich content (PortableText, media uploads, publishing workflow).
2. **Next.js App Router** — Server Components need fast, relational queries for shop grid, artwork detail, and (future) Immersive Mode room loading. Sanity's CDN is not optimised for relational joins.

The system also needs an asset pipeline for large binary files (images, 3D models, audio) that must not pass through the app server.

---

## Decision

### 1. Dual-layer content architecture: Sanity (editorial source) + Supabase (query layer)

Sanity is the **editorial source of truth**: rich content (PortableText story, image hotspot, draft/publish workflow, curator review roles).

Supabase is the **query-optimised mirror**: relational joins, RLS, fast pagination, FTS (pg_trgm), pgvector for future embeddings.

Sync mechanism: **Sanity Webhook → Netlify Edge Function → Supabase upsert** on every document publish. Idempotency via `sanity_id` (UNIQUE constraint + ON CONFLICT DO UPDATE).

**Why not Sanity-only?**  
Sanity's GROQ is powerful but not optimised for relational queries at scale (e.g. "artworks in room X, ordered by price, filtered by artist country"). Supabase with Postgres indexes + RLS is the right tool for that layer.

**Why not Supabase-only?**  
Artists and curators need a polished editorial UI with image cropping, draft workflows, PortableText stories. Building that from scratch is months of work. Sanity provides it out of the box.

### 2. `exhibition` renamed to `room`

The earlier "exhibition" concept implied a time-limited show. ELBTRONIKA's 3D spaces are permanent named rooms (Dunkelraum, Industrie, etc.) with persistent artwork placements. `room` is the correct domain term and aligns with Phase 7's `RoomScene` component naming.

### 3. R2 Presigned URL pattern for asset uploads

File uploads (image/model/audio) go **directly from browser to Cloudflare R2** via presigned PUT URL. The app server only validates (MIME, size, auth) and returns the URL — it never proxies file bytes.

```
Browser → POST /api/assets/upload (validate + sign) → presigned PUT URL
Browser → PUT file bytes directly to R2 (no server bandwidth)
Browser → calls Server Action with cdnUrl + key to persist in DB
```

**Why presigned PUT over server proxy?**  
A 500MB audio file proxied through Netlify would saturate the function's memory, timeout, and consume bandwidth egress. R2 direct upload is the standard pattern for large files and avoids all of these.

### 4. HLS encoding + Draco/KTX2 as Phase 7/8 stubs

The upload route returns the raw R2 key immediately. Post-processing (HLS segmentation for audio, Draco + KTX2 compression for 3D models) is documented as a TODO for Phase 7/8 Netlify Background Functions. The `sets.hls_url` and `artworks.model_url` remain `null` until the Background Function writes back.

This allows the content pipeline to ship in Phase 5 without blocking on the complex transcoding infrastructure.

---

## Data Model Summary

### Sanity Schemas (v2, Phase 5)

| Schema | Key Fields |
|--------|-----------|
| `artwork` | title, slug, artist(ref), description, story, mainImage, gltfModel(r2Key), textures[], associatedSet(ref), room(ref), price, edition, status, tags |
| `artist` | displayName, slug, supabaseUserId, bio, avatar, stripeAccountId, kycStatus |
| `dj` | displayName, slug, supabaseUserId, bio, avatar, soundcloudUrl, genres, stripeAccountId |
| `set` | title, slug, dj(ref), soundcloudTrackId, hlsUrl, r2AudioKey, coverImage, durationSec, bpm, genreTags, status |
| `room` | title, slug, description, coverImage, skybox, lightingPreset, maxArtworks, artworkSlots[], featuredDj(ref), status |

### Supabase Mirror Tables (Phase 5 additions)

| Table | Phase | Notes |
|-------|-------|-------|
| `rooms` | 5 | Mirrored from Sanity; lighting_preset + skybox drive Phase 7 scene config |
| `artworks.set_id` | 5 | FK → sets, ON DELETE SET NULL |
| `artworks.room_id` | 5 | FK → rooms, ON DELETE SET NULL |

---

## Consequences

**Positive:**
- Curator gets polished editorial UX (Sanity Studio) without custom-building it.
- Next.js gets fast SQL queries with Postgres indexes + RLS.
- Asset pipeline scales without server bandwidth constraints.
- Content model is ready for Phase 6 (shop) and Phase 7 (3D rooms).

**Negative / Accepted risk:**
- Sync latency: after Sanity publishes, Supabase reflects changes within seconds (webhook round-trip). Not real-time. For our use case (editorial publishing, not stock trading), this is acceptable.
- Dual write complexity: two sources of truth for content fields. Mitigation: Sanity is always the edit source; Supabase is read-only mirror. Artists cannot edit Supabase directly.
- HLS/Draco stubs: audio and 3D assets require a second upload step in Phase 7/8. Artists will see processing state until encoding completes.

---

## Alternatives Considered

| Option | Rejected because |
|--------|-----------------|
| Sanity-only (no Supabase mirror) | GROQ not suited for RLS, relational joins, or pgvector semantic search |
| Supabase-only (custom CMS forms) | 6+ months to build editorial UX that Sanity gives for free |
| Cloudflare Images for image processing | Added vendor complexity; Netlify Image Transform covers our needs for Phase 5 |
| HLS encoding in Phase 5 | Netlify Background Functions + FFmpeg setup is Phase 8 scope; blocking upload pipeline on it is wrong |

---

## References

- [Sanity Webhooks](https://www.sanity.io/docs/webhooks)
- [R2 Presigned URLs (S3-compatible)](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
- ADR 0003 — Infrastructure (Supabase + R2 + Sanity)
- ADR 0004 — Auth & Profiles
