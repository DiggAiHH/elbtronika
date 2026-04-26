# ADR 0003 – Phase 3 Infrastructure: Data, CMS, Storage, and Secrets

**Status:** Accepted  
**Date:** 2026-04-26  
**Deciders:** Lou (Solo-Builder)  
**Phase:** 3 – Infrastructure

---

## Context

ELBTRONIKA requires persistent infrastructure before any user-facing features can be built:
- A relational database with row-level security for user data, orders, and content
- A headless CMS for editorial content (artist bios, artworks, DJ sets, 3D rooms)
- Object storage with zero-egress cost for large media files (audio, HDR skyboxes, images)
- A secrets management solution that scales from local dev → CI → production
- All infrastructure must be GDPR-compliant (EU data residency) and support the 60/20/20 revenue model

---

## Decisions

### 1. Database: Supabase (Postgres 16, EU-Frankfurt)

**Decision:** Supabase hosted on AWS eu-central-1 (Frankfurt) with Postgres 16, RLS, and pgvector.

**Why Supabase over alternatives (PlanetScale, Neon, Railway):**
- `pgvector` extension for AI similarity search (artist/artwork recommendations, Phase 11)
- Built-in Auth, Row Level Security, and Realtime out of the box
- `@supabase/ssr` provides first-class Next.js App Router support
- EU hosting satisfies DSGVO Art. 44 (data transfer restrictions)
- Free tier sufficient through Phase 7; predictable pricing thereafter

**Schema design choices:**
- 11 tables: `profiles`, `artists`, `djs`, `artworks`, `sets`, `orders`, `transactions`, `consent_log`, `webhook_events`, `ai_decisions`, `audit_events`
- RLS deny-all default + 30 explicit policies (5 tiers: public-read, owner-rw, admin-all, service-only, audit-read)
- `consent_log` and `audit_events` are append-only (no DELETE policies) — GDPR compliance by architecture
- `orders` and `transactions` have no DELETE policies — financial records immutable
- 60/20/20 split enforced structurally: `orders.artist_payout_eur`, `dj_payout_eur`, `platform_fee_eur`
- HNSW indexes on `vector(1536)` columns for sub-10ms ANN queries
- German full-text search on `artworks` (`gin + to_tsvector('german', ...)`)

**Consequences:**
- Vendor lock-in to Supabase RLS/Auth model — acceptable for solo builder
- Migrations managed via `supabase/migrations/` — standard SQL, portable if needed
- `SUPABASE_SERVICE_ROLE_KEY` must stay server-side only (bypasses RLS)

---

### 2. CMS: Sanity v4 with Embedded Studio

**Decision:** Sanity v4 as headless CMS, embedded studio at `/studio/[[...tool]]` inside the Next.js app.

**Why Sanity over alternatives (Contentful, Strapi, Payload):**
- GROQ query language gives precise, projection-based queries with zero over-fetching
- Embedded studio in Next.js means one fewer deployment target
- Real-time collaboration baked in (future: Kuratorin role can edit live)
- `next-sanity` v10 provides CDN-backed `createClient` with cache revalidation hooks
- Free plan covers solo/small team usage through Phase 7+

**Schema decisions:**
- 6 document types: `artist`, `artwork`, `dj`, `set`, `room`, `story`
- Each document with a `supabaseId` field bridges CMS ↔ Supabase (editorial CMS controls copy, Supabase controls commerce data)
- `room` schema encodes 3D environment config (skyboxUrl, ambientLightIntensity, fogDensity) — enables curator-controlled immersive spaces
- `story` (editorial) deliberately separate from `artwork`/`artist` — different publish workflows
- `/studio` route protected by middleware auth guard (Phase 4 extension point)

**Consequences:**
- Two data sources (Sanity + Supabase) — queries must join them at page level
- CDN (`useCdn: true` in production) means eventual consistency for editorial changes
- `SANITY_API_READ_TOKEN` enables preview drafts; write token kept separate

---

### 3. Storage: Cloudflare R2 with Custom Domain

**Decision:** Cloudflare R2 bucket `elbtronika-assets` in EEUR (Eastern Europe) region, served via `cdn.elbtronika.art` CNAME.

**Why R2 over alternatives (AWS S3, Backblaze B2, Supabase Storage):**
- **Zero egress fees** — critical for large audio files (HLS streams) and HDR skybox assets
- EEUR region minimizes latency from EU visitors
- Custom domain via Cloudflare CDN = automatic caching + DDoS protection at no extra cost
- AWS SDK compatible — standard `S3Client` works unchanged

**Folder structure:**
```
elbtronika-assets/
  audio/sets/<supabaseId>/  ← HLS segments + manifest
  images/artworks/<id>/     ← original + optimized variants
  images/artists/<id>/
  rooms/<slug>/             ← skybox.hdr, environment assets
```

**Consequences:**
- Upload must go through a signed URL (Edge Function) — direct browser upload blocked for security
- R2 API credentials (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`) are server-side only
- Manual bucket creation required (R2 has no Terraform provider in free tier)

---

### 4. Secrets Management: Doppler

**Decision:** Doppler as the single source of truth for all environment variables, with three environments: `dev`, `preview`, `prd`.

**Why Doppler over alternatives (GitHub Secrets only, Vercel Env Vars, .env files in vault):**
- Single source of truth — no drift between local, CI, and Netlify environments
- `doppler run -- pnpm dev` replaces `.env.local` for local development
- Service tokens enable GitHub Actions and Netlify to pull secrets at runtime
- Audit trail on all secret accesses (DSGVO accountability)
- Free tier covers solo builder

**Environment mapping:**
- `dev` → local development (`doppler.yaml` in repo root)
- `preview` → Netlify preview deploys + PR builds
- `prd` → Netlify production (Stripe LIVE keys only after Phase 15 KYC)

**Consequences:**
- Adds Doppler as a dependency in the dev workflow (mitigated: `.env.local` fallback exists)
- `DOPPLER_TOKEN` GitHub Secret needed for CI (service token, read-only)
- All secrets documented in `docs/phase-3-doppler-setup.md`

---

## Alternatives Considered and Rejected

| Alternative | Reason Rejected |
|-------------|-----------------|
| PlanetScale (MySQL) | No pgvector, no RLS, MySQL syntax divergence |
| Contentful | Expensive at scale, GROQ advantage lost |
| AWS S3 | Egress costs prohibitive for audio streaming |
| Vercel Blob | Vendor lock-in, no EEUR region, higher cost |
| HashiCorp Vault | Overkill for solo project, ops overhead |
| Netlify Env Vars only | No local dev sync, secrets drift risk |

---

## Consequences (Overall)

- **CI is green** with placeholder env vars; real vars injected by Doppler at runtime
- **Phase 4+** unlocked: Auth (Supabase Auth), commerce (Stripe), 3D (R2 assets)
- **Manual steps remaining for Lou:** R2 bucket creation, Sanity project init, Doppler population, Netlify secrets — all documented in `/docs/phase-3-*.md`
- **Architecture is GDPR-compliant by design:** EU data residency (Supabase Frankfurt, R2 EEUR), append-only audit/consent tables, no DELETE on financial records
