# AGENTS.md — ELBTRONIKA

> **For AI coding agents.** Read this first before touching any code.
> Project language: **Code in English, docs/comments bilingual (EN/DE).**
> Last updated: 2026-04-30

---

## Project Overview

**ELBTRONIKA** is an immersive 3D art gallery and e-commerce platform that merges electronic music (DJs) with visual art. It features two viewing modes:

- **Classic Mode** — traditional 2D shop grid (DOM-based)
- **Immersive Mode** — WebGPU/WebGL 3D gallery with spatial audio and scroll-driven camera splines

Revenue model: 60/20/20 split (Artist / DJ / Platform).

The project runs in three runtime modes controlled by the Doppler variable `ELT_MODE`:

| Mode | ENV | Use-Case | Data | Stripe |
|------|-----|----------|------|--------|
| **Demo** | `demo` | Pitch to investors, internal tests | Demo personas (5 Artists, 3 DJs, 8 Artworks) | Test-Mode + Mock-Connected-Accounts |
| **Staging** | `staging` | QA, smoke-tests before live | Mix of demo + real artists | Test-Mode + real Connected-Accounts |
| **Live** | `live` | Public launch | Only real artists, real sales | Live-Mode |

The project is a **pnpm monorepo** managed with Turborepo. It is built by a solo developer (Lou) with AI pair-programming. Development is phase-driven (Phase 0–19). As of 2026-04-30, Phases 1–17 are complete on `main`. Phase 16 (Launch) is ready. Phases 18–19 are in planning.

---

## Repository Structure

```
Elbtonika/
├── apps/
│   ├── web/                 # Next.js 15 App Router (main frontend)
│   └── cms/                 # Sanity Studio v4 (headless CMS)
├── packages/
│   ├── ui/                  # Shared component library (@elbtronika/ui) — Radix + CVA
│   ├── contracts/           # Zod schemas + Supabase generated types (@elbtronika/contracts)
│   ├── three/               # R3F v9 3D canvas system (@elbtronika/three)
│   ├── audio/               # Spatial audio engine with HLS.js (@elbtronika/audio)
│   ├── ai/                  # Claude API client, prompts, rate-limiting, audit (@elbtronika/ai)
│   ├── agent/               # Hermes agent runtime, planner, memory, skills (@elbtronika/agent)
│   ├── flow/                # Audio-visual flow analysis and art-matching (@elbtronika/flow)
│   ├── mcp/                 # Model Context Protocol servers and tools (@elbtronika/mcp)
│   ├── payments/            # Stripe Connect client, schemas, transfers, webhooks (@elbtronika/payments)
│   ├── browser/             # Playwright-based browser harness and CDP tools (@elbtronika/browser)
│   ├── config/              # Shared tsconfig / biome config (@elbtronika/config)
│   └── sanity-studio/       # Shared Sanity Studio schemas and utilities
├── supabase/
│   └── migrations/          # Versioned SQL migrations + seed.sql
├── docs/
│   ├── adr/                 # Architecture Decision Records (0001–0022)
│   ├── adrs/                # Additional ADRs (MCP, Hermes, music-art matching)
│   ├── architecture/        # Architecture docs (CSP, caching, monitoring, DSGVO)
│   ├── development/         # Setup guides
│   ├── operations/          # Deploy runbooks
│   ├── performance/         # Baseline reports
│   ├── plans/               # Optimization plans and TODOs
│   └── runbooks/            # Operational runbooks (Doppler, live-switch, pitch)
├── engineering-harness/     # Tooling docs, scripts, MCP configs, trust harness
├── memory/                  # Project context, run logs, glossary
├── design-extract-output/   # Design tokens from reference URLs
├── .github/workflows/       # GitHub Actions CI/CD (ci, lighthouse, prod-deploy, security, staging, zap)
├── netlify.toml             # Netlify deploy config + edge functions
├── doppler.yaml             # Doppler secrets manager config
├── turbo.json               # Turborepo pipeline
├── pnpm-workspace.yaml      # Workspace definition
├── tsconfig.base.json       # Root TypeScript strict config
├── biome.json               # Linting & formatting (Biome v2)
├── lighthouserc.js          # Lighthouse CI budget gates
└── package.json             # Root scripts & dev deps
```

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js (App Router) | 15.5.15 |
| **React** | React | 19.1.0 |
| **Styling** | Tailwind CSS | v4.1+ (`@theme {}` based, no `tailwind.config.js`) |
| **UI Primitives** | Radix UI + CVA | latest |
| **3D** | Three.js + R3F v9 + Drei v10 | WebGPU renderer with WebGL2 fallback |
| **State (global)** | Zustand | v5 |
| **State (async)** | TanStack Query | v5 |
| **Forms** | React Hook Form + Zod | latest |
| **i18n** | next-intl | v4 (German default `de`, English `en`) |
| **Backend** | Supabase (Postgres 16 + RLS) | EU-Frankfurt |
| **CMS** | Sanity | v4.0.0+ (Studio embedded in web app) |
| **Payments** | Stripe Connect | v22+ (test keys only until KYC complete) |
| **Storage** | Cloudflare R2 | Zero-egress, CDN `cdn.elbtronika.art` |
| **Hosting** | Netlify + Edge Functions | Deno runtime |
| **Package Manager** | pnpm | 10.0.0 |
| **Build** | Turborepo | v2.5.0 |
| **Lint/Format** | Biome | v2.4.13 |
| **Unit Tests** | Vitest | v4 (jsdom) |
| **E2E Tests** | Playwright | v1.59+ |
| **Storybook** | Storybook 10 + Vite 8 | a11y addon |
| **AI** | Anthropic Claude SDK | v0.39+ |
| **Audio** | HLS.js | v1.6+ |

**Node.js requirement:** `>=22.0.0`

---

## Build and Test Commands

All commands run from repo root `D:\Elbtronika\Elbtonika`.

```bash
# Install dependencies
pnpm install

# Development (parallel turbo dev)
pnpm dev                 # starts Next.js (turbopack) + CMS + storybook

# Production build
pnpm build               # turbo run build (cached)

# Type checking
pnpm typecheck           # turbo run typecheck

# Linting
pnpm lint                # turbo run lint (Biome)

# Formatting
pnpm format              # biome format --write .
pnpm check               # biome check --write .

# Testing
pnpm test                # unit tests (vitest across all packages)
pnpm --filter @elbtronika/web test:e2e   # Playwright e2e

# Clean
pnpm clean               # turbo run clean + rm -rf node_modules

# Package-specific commands
pnpm --filter @elbtronika/web dev
pnpm --filter @elbtronika/cms dev
pnpm --filter @elbtronika/ui storybook
```

### Turborepo Pipeline (`turbo.json`)

```
build      → dependsOn [^build], inputs [$TURBO_DEFAULT$, .env*], outputs [.next/**, !.next/cache/**, dist/**]
dev        → cache: false, persistent: true
lint       → dependsOn [^build]
typecheck  → dependsOn [^build], env [NODE_OPTIONS]
test       → dependsOn [^build], inputs [$TURBO_DEFAULT$, .env.test*], outputs [coverage/**]
clean      → cache: false
```

---

## Code Style Guidelines

### Tool: Biome v2

Single tool for lint + format. Configuration in `biome.json`.

**Key rules:**
- Indent: 2 spaces
- Line width: 100
- Quotes: double (JSX too)
- Semicolons: always
- Trailing commas: all
- Arrow parentheses: always

**Enforced lint rules:**
- `noUnusedImports`: error
- `noUnusedVariables`: error
- `useImportType`: error
- `noNonNullAssertion`: warn
- `noExplicitAny`: error
- `noConsole`: warn (off in test files)
- `noBarrelFile`: warn

### TypeScript Strictness

Root `tsconfig.base.json` extends into all packages:
- `strict: true`
- `exactOptionalPropertyTypes: true`
- `noUncheckedIndexedAccess: true`
- `noImplicitOverride: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `verbatimModuleSyntax: true`
- `noEmit: true`

### Import Conventions

- Use `type` imports explicitly (`verbatimModuleSyntax`)
- Workspace packages: `"workspace:*"` references
- Dynamic JSX tags: use `React.createElement` (strict TS workaround)

### Commit Convention

Conventional Commits enforced via commitlint + husky:
```
feat(scope): subject
fix(scope): subject
docs(scope): subject
chore(scope): subject
```

Pre-commit hook runs `biome check --write --no-errors-on-unmatched` on staged files.

---

## Testing Instructions

### Unit Tests (Vitest)

Config per package: `vitest.config.ts`
- Environment: `jsdom` (web/ui/three/audio), `node` (contracts/ai/payments/flow/mcp/agent/browser)
- Globals: enabled
- Coverage: v8 provider (where configured)
- Excludes: `node_modules`, `e2e/`, `*.spec.ts`

```bash
# Run all unit tests
pnpm test

# Watch mode (web)
pnpm --filter @elbtronika/web test:watch

# With UI
pnpm --filter @elbtronika/web vitest --ui
```

### E2E Tests (Playwright)

Config: `apps/web/playwright.config.ts`
- Test dir: `./e2e`
- Browsers: Chromium, Firefox, Mobile Chrome (Pixel 7)
- Base URL: `http://localhost:3000` (auto-starts dev server locally)
- CI: workers=1, retries=2, reporter=github
- Local: retries=0, reporter=html
- Accessibility: `@axe-core/playwright` available

```bash
# Run e2e tests
pnpm --filter @elbtronika/web test:e2e
```

### Storybook (UI Package)

```bash
pnpm --filter @elbtronika/ui storybook       # dev on port 6006
pnpm --filter @elbtronika/ui build-storybook  # static build
```

---

## Security Considerations

### Row Level Security (RLS)

All Supabase tables have RLS enabled. Default deny-all with explicit policies:
- `profiles`: owner read/update + admin
- `artworks`: public read when published, artist own write
- `orders`: owner read only
- `transactions`, `webhook_events`: service_role only
- `consent_log`: service_role insert, owner read
- `audit_events`: admin only
- `ai_decisions`: service_role insert, owner read
- `agent_tasks`: service_role + owner scoped

**Never use service-role keys in client components.** `createAdminClient()` is restricted to Route Handlers and Server Actions.

### Content Security Policy

CSP headers set in `next.config.ts`:
```
default-src 'self'
script-src 'self' 'unsafe-eval' 'unsafe-inline'
style-src 'self' 'unsafe-inline'
img-src 'self' data: blob: https://cdn.elbtronika.art https://*.sanity.io
media-src 'self' https://cdn.elbtronika.art
connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.anthropic.com
font-src 'self'
frame-ancestors 'none'
base-uri 'self'
form-action 'self'
```

### Security Headers (Netlify + Next.js)

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

### Webhook Security

- Sanity → Supabase sync: HMAC-SHA256 verified, timestamp checked (±5min window)
- Stripe webhooks: idempotent handlers, signature verified

### Hermes Trust Boundaries

All MCP invocations are authenticated, audited, and role-gated:
- `/api/mcp/invoke` requires authenticated session + role gate
- Every invocation logs actorId, role, server, tool, status, duration to structured audit log
- Tool allowlist enforced before invocation
- Idempotency check: same goal returns existing task
- Atomic claim lock via `run_id` in `agent_tasks` table

### Environment Variables

Secrets managed via **Doppler**. Never commit real values.
Key env vars (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `SANITY_API_TOKEN` / `SANITY_API_READ_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`
- `ANTHROPIC_API_KEY`
- `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN`

---

## Deployment

### Netlify

- **Site:** `apps/web` base directory
- **Build command:** `pnpm build`
- **Publish dir:** `apps/web/.next`
- **Plugin:** `@netlify/plugin-nextjs`
- **Edge Functions:** Deno runtime (`/api/proxy/*`, `/edge/ab-test`, `/edge/geo-locale`)
- **Node version:** 22
- **Preview deploys:** auto for all PRs

### CI/CD Pipelines (GitHub Actions)

`.github/workflows/ci.yml`:
1. `install` — pnpm install --frozen-lockfile
2. `typecheck` — `pnpm --filter @elbtronika/web typecheck`
3. `lint` — `pnpm lint`
4. `test` — `pnpm test` + coverage artifact upload
5. `build` — `pnpm build` (needs typecheck + lint + test)
6. `security` — `pnpm audit --audit-level high`

`.github/workflows/production-deploy.yml`:
- Manual confirmation required (`DEPLOY`)
- Pre-deploy checks: typecheck, lint, test, audit
- Build with Doppler secrets (`DOPPLER_TOKEN_PRD`)
- Deploy to Netlify production
- Post-deploy validation: health endpoint, key pages, security headers
- Auto-create GitHub Release

Additional workflows:
- `lighthouse.yml` — Lighthouse CI on PRs
- `staging-deploy.yml` — Staging deployment
- `security.yml` — Security scanning
- `zap-scan.yml` — OWASP ZAP scanning

Build uses dummy Supabase values; real secrets injected by Doppler at runtime.

---

## App Router Architecture

### Routes (`apps/web/app/`)

```
app/
├── [locale]/                    # i18n route segment (de | en)
│   ├── (auth)/login/page.tsx
│   ├── (checkout)/checkout/page.tsx
│   ├── (immersive)/gallery/page.tsx       # 3D gallery
│   ├── (marketing)/about/page.tsx
│   ├── (profile)/artist/[slug]/page.tsx
│   ├── (profile)/dj/[slug]/page.tsx
│   ├── (shop)/                  # shop route group
│   │   ├── shop/page.tsx
│   │   ├── shop/artwork/[slug]/page.tsx
│   │   ├── artwork/[slug]/page.tsx        # legacy redirect
│   │   ├── components/          # CartDrawer, AddToCartButton, etc.
│   │   ├── error.tsx
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   └── MoodRecommender.tsx
│   ├── artist-onboarding/stripe/page.tsx
│   ├── canvas/error.tsx
│   ├── components/              # Navbar, Footer, ConsentBanner, WebVitals
│   ├── dashboard/
│   │   ├── layout.tsx           # auth guard
│   │   ├── page.tsx
│   │   ├── artist/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx     # artwork creation form
│   │   ├── pm/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── error.tsx
│   │   └── monitoring/page.tsx
│   ├── error.tsx
│   ├── layout.tsx               # locale layout + CanvasRoot + providers
│   ├── loading.tsx
│   ├── not-found.tsx
│   ├── page.tsx                 # homepage
│   └── profile/setup/page.tsx
├── api/
│   ├── account/data/route.ts
│   ├── account/delete/route.ts
│   ├── agent/task/route.ts
│   ├── ai/describe/route.ts
│   ├── ai/explain/route.ts
│   ├── ai/override/route.ts
│   ├── ai/recommend/route.ts
│   ├── analytics/vitals/route.ts
│   ├── assets/upload/route.ts   # R2 presigned PUT URLs
│   ├── checkout/session/route.ts
│   ├── consent/route.ts
│   ├── flow/analyze/route.ts
│   ├── flow/match/route.ts
│   ├── health/route.ts
│   ├── mcp/invoke/route.ts
│   ├── mcp/tools/route.ts
│   ├── stripe/connect/route.ts  # Express account creation
│   ├── stripe/webhook/route.ts
│   ├── user/data/route.ts
│   ├── user/delete/route.ts
│   └── webhooks/sanity/route.ts # Sanity→Supabase sync
├── layout.tsx                   # root shell (minimal)
└── globals.css
```

### i18n

- **Default locale:** `de` (German)
- **Secondary:** `en` (English)
- **Strategy:** always show prefix (`/de/`, `/en/`)
- **Middleware:** `next-intl/middleware` with matcher excluding API/static files
- **Messages:** `apps/web/messages/{de,en}.json`

### 3D Canvas Architecture (`packages/three`)

- **`<CanvasRoot />`** mounted once in `[locale]/layout.tsx`, never unmounts
- Position: `fixed; inset: 0; z-index: -1`
- Mode switching via CSS `opacity` transition (0.6s), not remount
- Renderer: WebGPU → WebGL2 fallback
- Camera: CatmullRom spline driven by `scrollY / maxScroll → t[0..1]`
- Post-processing: `@react-three/postprocessing` v3 selective bloom
- HUD: DOM overlay (`GalleryHUD`), NOT R3F — for a11y + CSS control
- Store: Zustand with mutable Map mutations for per-frame data (no setState in useFrame)
- Performance: `AdaptiveDpr` + `PerformanceMonitor` for automatic quality scaling
- `frameloop: "demand"` in classic mode, `"always"` in immersive mode

---

## Data Layer

### Dual-Layer Content Strategy

- **Sanity CMS** (`apps/cms/schemas/`, `packages/sanity-studio/schemas/`): editorial content, rooms, artworks, artists, DJs, sets, stories, exhibitions
- **Supabase** (`supabase/migrations/`): transactional data, auth, orders, profiles, RLS

**Sync:** Sanity webhooks push to Supabase via `api/webhooks/sanity` (HMAC verified).

### Key Tables

`profiles`, `artists`, `djs`, `rooms`, `sets`, `artworks`, `orders`, `transactions`, `consent_log`, `audit_events`, `webhook_events`, `ai_decisions`, `agent_tasks`

### Shared Types

`@elbtronika/contracts` exports:
- Zod schemas for validation
- Supabase generated types (`Database`, `Tables`, `Enums`, etc.)

---

## Performance & Monitoring

### Bundle Budgets (`apps/web/bundlesize.config.json`)

- `main-*.js`: max 200kb
- `pages/_app-*.js`: max 150kb
- `framework-*.js`: max 50kb
- `*three*`: max 500kb

### Lighthouse CI Budgets (`lighthouserc.js`)

- LCP < 2.0s, CLS < 0.05, TBT < 200ms
- Performance >= 90, Accessibility >= 95, Best Practices >= 95, SEO = 100
- Document size < 50kb, Scripts < 500kb, Images < 1.5MB

### Cache Headers (Next.js)

- `/_next/static/*`: `public, max-age=31536000, immutable`
- `/images/*`: `public, max-age=86400, must-revalidate`
- `*.glb`, `*.ktx2`: `public, max-age=31536000, immutable`
- `/api/health`: `public, max-age=10, stale-while-revalidate=30`
- `/api/*`: `private, no-store`

---

## Known Issues & Constraints

| ID | Issue | Phase |
|----|-------|-------|
| I-001 | `GallerySceneInjector.tsx` is MVP stub — scene injection not fully wired | 7 |
| I-002 | `/images/placeholder-artwork.jpg` is 1x1 stub | 7 |
| I-003 | Supabase local migration blocked: no Docker Desktop in environment | 3/14 |
| I-004 | Audit events currently go to console.log only — DB-backed `mcp_audit_log` table planned | 17 |
| I-005 | `agent_tasks` and `orders_session_id` migrations must be manually applied to Supabase | 17 |

### Windows-Specific Tooling Rules

- **Shell:** Always `cmd`, never PowerShell (blocks pnpm.ps1)
- **Git commit:** Write message to file first, then `git commit -F D:\msg.txt`
- **Biome:** Use `node_modules\.bin\biome` or `pnpm lint`, never `npx biome`
- **Bracket dirs:** `[locale]` directories — create via Node.js `fs.mkdirSync`, not shell

---

## Resources

- **Status:** `STATUS.md` — live project status, branch states, WIP lists
- **Tasks:** `TASKS.md` — active and upcoming work items
- **README:** `README.md` — modes, quick start, troubleshooting, monorepo structure
- **Setup:** `SETUP.md` — local environment setup instructions
- **CLAUDE.md:** Project context, phase status, glossary, stack
- **Agent Protocol:** `docs/agent-preflight-protocol.md` — detailed tool rules
- **Architecture Plans:** `ELBTRONIKA_Architekturplan_v1.md` through `v1.3.md`
- **ADRs:** `docs/adr/0001-monorepo-tooling.md` through `0022-modes-and-prd-doppler.md`
- **Trust Harness:** `engineering-harness/HERMES_TRUST_HARNESS.md` — trust boundary specification
