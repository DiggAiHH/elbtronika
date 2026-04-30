# AGENTS.md — ELBTRONIKA

> **For AI coding agents.** Read this first before touching any code.
> Project language: **Code in English, docs/comments bilingual (EN/DE).**
> Last updated: 2026-04-29

---

## Project Overview

**ELBTRONIKA** is an immersive 3D art gallery and e-commerce platform that merges electronic music (DJs) with visual art. It features two viewing modes:

- **Classic Mode** — traditional 2D shop grid (DOM-based)
- **Immersive Mode** — WebGPU/WebGL 3D gallery with spatial audio and scroll-driven camera splines

Revenue model: 60/20/20 split (Artist / DJ / Platform).

The project is a **pnpm monorepo** managed with Turborepo. It is built by a solo developer (Lou) with AI pair-programming. Development is phase-driven (Phase 0–19). Phases 0–5 are complete on `main`. Phases 6–19 are complete on `feature/phase-11-ai` (tag `v0.13.0-demo`).

---

## Repository Structure

```
Elbtonika/
├── apps/
│   ├── web/                 # Next.js 15 App Router (main frontend)
│   └── cms/                 # Sanity Studio v3 (headless CMS)
├── packages/
│   ├── ui/                  # Shared component library (@elbtronika/ui)
│   ├── contracts/           # Zod schemas + Supabase types (@elbtronika/contracts)
│   ├── three/               # R3F v9 3D canvas system (@elbtronika/three)
│   ├── config/              # Shared tsconfig / biome config
│   └── sanity-studio/       # Shared Sanity Studio utilities
├── supabase/
│   └── migrations/          # Versioned SQL migrations + seed.sql
├── docs/adr/                # Architecture Decision Records (0001–0007)
├── engineering-harness/     # Tooling docs, scripts, MCP configs
├── memory/                  # Project context, run logs, glossary
├── design-extract-output/   # Design tokens from reference URLs
├── .github/workflows/ci.yml # GitHub Actions CI/CD
├── netlify.toml             # Netlify deploy config
├── doppler.yaml             # Doppler secrets manager config
├── turbo.json               # Turborepo pipeline
├── pnpm-workspace.yaml      # Workspace definition
├── tsconfig.base.json       # Root TypeScript strict config
├── biome.json               # Linting & formatting (Biome v2)
└── package.json             # Root scripts & dev deps
```

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js (App Router) | 15.3.0 |
| **React** | React | 19.1.0 |
| **Styling** | Tailwind CSS | v4.1+ (`@theme {}` based, no `tailwind.config.js`) |
| **UI Primitives** | Radix UI + CVA | latest |
| **3D** | Three.js + R3F v9 + Drei v10 | WebGPU renderer with WebGL2 fallback |
| **State (global)** | Zustand | v5 |
| **State (async)** | TanStack Query | v5 |
| **Forms** | React Hook Form + Zod | latest |
| **i18n** | next-intl | v3 (German default `de`, English `en`) |
| **Backend** | Supabase (Postgres 16 + RLS) | EU-Frankfurt |
| **CMS** | Sanity | v3.88+ (Studio v4 in web app) |
| **Payments** | Stripe Connect | v22+ (test keys only until KYC complete) |
| **Storage** | Cloudflare R2 | Zero-egress, CDN `cdn.elbtronika.art` |
| **Hosting** | Netlify + Edge Functions | Deno runtime |
| **Package Manager** | pnpm | 10.0.0 |
| **Build** | Turborepo | v2.3+ |
| **Lint/Format** | Biome | v2.4.13 |
| **Unit Tests** | Vitest | v3 (jsdom) |
| **E2E Tests** | Playwright | v1.59+ |
| **Storybook** | Storybook 10 + Vite 8 | a11y addon |

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
pnpm test                # unit tests (vitest)
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
build      → dependsOn [^build], outputs [.next/**, dist/**]
dev        → cache: false, persistent: true
lint       → dependsOn [^build]
typecheck  → dependsOn [^build]
test       → dependsOn [^build], outputs [coverage/**]
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

Config: `apps/web/vitest.config.ts`
- Environment: `jsdom`
- Globals: enabled
- Coverage: v8 provider, includes `src/**/*.{ts,tsx}` and `app/**/*.{ts,tsx}`
- Excludes: `node_modules`, `e2e/`, `*.spec.ts`

```bash
# Run unit tests
pnpm test

# Watch mode
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
- `transactions`, `webhook_events`, `consent_log`: service_role only
- `audit_events`: admin only

**Never use service-role keys in client components.** `createAdminClient()` is restricted to Route Handlers and Server Actions.

### Content Security Policy

CSP headers set in `next.config.ts`:
```
default-src 'self'
script-src 'self' 'unsafe-eval' 'unsafe-inline'
style-src 'self' 'unsafe-inline'
img-src 'self' data: https://cdn.elbtronika.art https://*.sanity.io
media-src 'self' https://cdn.elbtronika.art
connect-src 'self' https://*.supabase.co https://api.stripe.com
font-src 'self'
frame-ancestors 'none'
```

### Security Headers (Netlify)

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Webhook Security

- Sanity → Supabase sync: HMAC-SHA256 verified, timestamp checked (±5min window)
- Stripe webhooks: idempotent handlers, signature verified

### Environment Variables

Secrets managed via **Doppler**. Never commit real values.
Key env vars (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `SANITY_API_TOKEN` / `SANITY_API_READ_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
- `ANTHROPIC_API_KEY`

---

## Deployment

### Netlify

- **Site:** `apps/web` base directory
- **Build command:** `pnpm build`
- **Publish dir:** `apps/web/.next`
- **Plugin:** `@netlify/plugin-nextjs`
- **Edge Functions:** Deno runtime (`api/proxy/*`)
- **Node version:** 22
- **Preview deploys:** auto for all PRs

### CI/CD Pipeline (GitHub Actions)

`.github/workflows/ci.yml`:
1. `install` — pnpm install --frozen-lockfile
2. `typecheck` — `pnpm --filter @elbtronika/web typecheck`
3. `lint` — `pnpm lint`
4. `test` — `pnpm test` + coverage artifact upload
5. `build` — `pnpm build` (needs typecheck + lint + test)
6. `deploy` — Netlify deploy (prod for main, preview for PRs)

Build uses dummy Supabase values; real secrets injected by Doppler at runtime.

---

## App Router Architecture

### Routes (`apps/web/app/`)

```
app/
├── [locale]/                    # i18n route segment (de | en)
│   ├── (auth)/login/page.tsx
│   ├── (checkout)/checkout/page.tsx
│   ├── (immersive)/gallery/page.tsx    # 3D gallery
│   ├── (marketing)/about/page.tsx
│   ├── (profile)/artist/[slug]/page.tsx
│   ├── (profile)/dj/[slug]/page.tsx
│   ├── (shop)/                  # shop route group
│   │   ├── shop/page.tsx
│   │   ├── shop/artwork/[slug]/page.tsx
│   │   ├── artwork/[slug]/page.tsx     # legacy redirect
│   │   └── components/          # CartDrawer, AddToCartButton, etc.
│   ├── dashboard/
│   │   ├── layout.tsx           # auth guard
│   │   ├── page.tsx
│   │   └── artist/
│   │       ├── page.tsx
│   │       └── new/page.tsx     # artwork creation form
│   ├── artist-onboarding/stripe/page.tsx
│   ├── profile/setup/page.tsx
│   ├── layout.tsx               # locale layout + CanvasRoot + GalleryHUD
│   └── page.tsx                 # homepage
├── api/
│   ├── assets/upload/route.ts   # R2 presigned PUT URLs
│   ├── health/route.ts
│   ├── stripe/connect/route.ts  # Express account creation
│   ├── stripe/webhook/route.ts
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

---

## Data Layer

### Dual-Layer Content Strategy

- **Sanity CMS** (`apps/cms/schemas/`): editorial content, rooms, artworks, artists, DJs, sets
- **Supabase** (`supabase/migrations/`): transactional data, auth, orders, profiles, RLS

**Sync:** Sanity webhooks push to Supabase via `api/webhooks/sanity` (HMAC verified).

### Key Tables

`profiles`, `artists`, `djs`, `rooms`, `sets`, `artworks`, `orders`, `transactions`, `consent_log`, `audit_events`, `webhook_events`, `ai_decisions`

### Shared Types

`@elbtronika/contracts` exports:
- Zod schemas for validation
- Supabase generated types (`Database`, `Tables`, `Enums`, etc.)

---

## Known Issues & Constraints

| ID | Issue | Phase |
|----|-------|-------|
| I-001 | `GallerySceneInjector.tsx` is MVP stub — scene injection not fully wired | 7 |
| I-002 | `DevStats` in `CanvasRoot.tsx` uses `require()` in JSX body | 7 |
| I-003 | Peer dep warnings: `@emnapi/core` + `@emnapi/runtime` (via `@sanity/cli`) | infra |
| I-004 | `packages/three/src/index.ts` `.js`-suffix vs `moduleResolution` mismatch | 7 |
| I-005 | `/images/placeholder-artwork.jpg` is 1x1 stub | 7 |
| I-006 | Supabase local migration blocked: no Docker Desktop in environment | 3/14 |

### Windows-Specific Tooling Rules

- **Shell:** PowerShell works fine — always use `.cmd` suffix: `pnpm.cmd`, `npx.cmd`
- **Git commit:** Direct `git commit -m "msg"` works; for multiline use `git commit -F file.txt`
- **Biome:** Use `pnpm lint` or `node_modules\.bin\biome`, never `npx biome` (wrong version)
- **Bracket dirs:** `[locale]` directories → create via Node.js `fs.mkdirSync`, not shell

---

## Resources

- **Status:** `STATUS.md` — live project status, branch states, WIP lists
- **Tasks:** `TASKS.md` — active and upcoming work items
- **CLAUDE.md:** Project context, phase status, glossary, stack
- **Agent Protocol:** `engineering-harness/PRE_FLIGHT_PROTOCOL.md` — mandatory pre-flight checklist, tool matrix, Windows survival guide, memory discipline, merge protocol, error registry
- **Architecture Plans:** `ELBTRONIKA_Architekturplan_v1.md`, `ELBTRONIKA_Architekturplan_v1.1.md`
- **ADRs:** `docs/adr/0001-monorepo-tooling.md` through `0007-immersive-architektur.md`
- **Setup:** `SETUP.md` — local environment setup instructions
- **Harness:** `engineering-harness/HARNESS.md` — token efficiency tools
