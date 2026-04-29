# ADR 0012: Edge & Performance-Optimierung (Phase 12)

**Status:** Accepted  
**Date:** 2026-04-29  
**Authors:** Sonnet 4.6 (Phase 12 session)

## Context

ELBTRONIKA serves both a content-heavy shop (Classic Mode) and a WebGPU-powered immersive gallery (Immersive Mode). Performance budgets must be enforced per asset type, and edge-level decisions (WebGPU detection, geo-based consent) must happen before the request hits the Next.js runtime.

## Decisions

### Cache Strategy (next.config.ts headers)

| Asset Type | Cache-Control | Notes |
|---|---|---|
| `/_next/static/*` | `public, max-age=31536000, immutable` | Next.js hashed chunks |
| `/images/*` | `public, max-age=86400, must-revalidate` + `Vary: Accept` | AVIF/WebP negotiation |
| `*.glb`, `*.ktx2` | `public, max-age=31536000, immutable` | 3D models & textures |
| `/api/health` | `public, max-age=10, stale-while-revalidate=30` | Health check |
| `/api/*` | `private, no-store` | User-specific APIs |

HLS manifests are served via R2/CDN directly (not through Next.js), so their cache headers are set at the CDN level: `max-age=2, stale-while-revalidate=5`.

### Netlify Edge Functions

Three edge functions deployed to Netlify Edge (Deno runtime):

1. **`ab-test.ts`** (`/edge/ab-test`)
   - Detects WebGPU support via User-Agent + Client Hints
   - Sets `elt_webgpu` cookie (30 days, HttpOnly, Secure)
   - Redirects to `/gallery` (GPU) or `/shop` (no GPU)

2. **`geo-locale.ts`** (`/edge/geo-locale` + `/*`)
   - Reads geo from Netlify Context
   - Sets `X-Consent-Region` header (`EU` | `US-CA` | `other`)
   - Sets `X-Locale` header (`de` | `en`)
   - Sets `elt_geo` cookie with region + locale

3. **`proxy.ts`** (`/api/proxy/*`) — stub, full implementation in Phase 13

### Lighthouse CI

`lighthouserc.js` in repo root:
- Runs on 3 URLs (`/`, `/shop`, `/gallery`)
- 3 runs per URL for median stability
- Budget gates: LCP < 2s (warn), CLS < 0.05 (error), Performance >= 90 (warn)
- Resource budgets: document < 50KB, scripts < 500KB, images < 1.5MB

### Performance Testing

Playwright e2e tests in `apps/web/e2e/performance/`:
- `fps.spec.ts` — Measures requestAnimationFrame FPS over 5s in `/gallery`
  - Target: 60 FPS desktop (CI tolerance: 70% = 42 FPS)
  - Memory budget: < 500 MB via `measureUserAgentSpecificMemory()`
- `lighthouse.spec.ts` — Runtime CWV checks (LCP, CLS) via PerformanceObserver

### Image Optimization

Next.js `Image` component already handles:
- `formats: ["image/avif", "image/webp"]`
- Remote patterns for R2 CDN + Sanity
- Responsive sizing via `sizes` prop

No additional image pipeline needed in MVP. Cloudflare Images migration deferred to post-launch optimization.

## Consequences

- **Positive:** Cache headers reduce origin load; Edge Functions offload decision logic before Next.js boot.
- **Positive:** Lighthouse CI gates prevent performance regressions in PRs.
- **Risk:** `measureUserAgentSpecificMemory()` is experimental and may fail in some browsers (test skips gracefully).
- **Risk:** Edge Functions require Netlify-specific runtime (Deno). Local dev uses Next.js dev server; edge functions are only tested on Netlify deploy previews.

## Alternatives Considered

1. **Vercel Edge Functions** — Rejected: Platform is Netlify (chosen in Phase 3).
2. **Cloudflare Workers** — Rejected: Adds second edge platform; Netlify Edge is sufficient.
3. **k6 Load Testing** — Deferred: Not needed for MVP; Lighthouse CI + Playwright FPS sufficient.
