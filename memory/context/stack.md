# Tech Stack — ELBTRONIKA (Stand 24. April 2026)

## Runtime & Core
| Tool | Version |
|------|---------|
| Node.js | 22.x LTS (Build/Tooling) |
| Deno | 2.x (Netlify Edge) |
| TypeScript | 5.7+ strict + exactOptionalPropertyTypes |
| pnpm | 10.x |

## Frontend
| Tool | Version |
|------|---------|
| Next.js | 15.3.x App Router |
| React | 19.1.x |
| Tailwind CSS | v4.x (Oxide Engine) |
| shadcn/ui | Canary (TW v4 compatible) |
| Radix UI | 2.x |
| Framer Motion | 12.x |

## 3D
| Tool | Version |
|------|---------|
| three | r184 |
| @react-three/fiber | v9 |
| @react-three/drei | v10 |
| @react-three/postprocessing | v3 |
| three-mesh-bvh | v0.8 |

## Audio
- hls.js v1.6+ (als Web Worker)
- Web Audio API nativ (PannerNode + GainNode + DynamicsCompressorNode)

## State & Data
- zustand v5 (global state, shallow-subscribe kompatibel mit useFrame)
- @tanstack/react-query v5 (async / server state)
- react-hook-form v7.5+
- zod v4

## Backend / Integrations
- Supabase (Postgres 16 + RLS + pgvector, EU-Frankfurt)
- @supabase/supabase-js v3
- stripe v20 (Connect + Separate Charges and Transfers)
- @sanity/client v8
- @anthropic-ai/sdk v0.60+

## Storage & Hosting
- Cloudflare R2 (Zero-Egress)
- Netlify (Frontend + Edge Functions)
- Cloudflare DNS + CDN

## DevOps / Testing / Monitoring
- Biome v2 (Lint+Format, ersetzt ESLint+Prettier)
- Vitest v3
- @playwright/test v2
- @testing-library/react v17
- lighthouse-ci v0.14
- @axe-core/playwright v4.10
- Sentry (Frontend + Serverless, EU-Region)
- Doppler (Secrets)

## AI
- Anthropic API: Sonnet 4.6 (Default), Opus 4.6 (komplexe Texte)

## Analytics
- Plausible (EU-hosted) ODER Matomo Self-Hosted (cookieless, CNIL-konform)

## Repo-Layout
```
elbtronika/
├── apps/
│   ├── web/           # Next.js 15 App Router
│   └── edge/          # Standalone Edge Functions
├── packages/
│   ├── ui/            # Shadcn + eigene Components
│   ├── three/         # R3F Scenes, Shader
│   ├── audio/         # Web Audio Graph, HLS, Proximity-Fader
│   ├── contracts/     # Zod-Schemas (shared)
│   ├── sanity-studio/ # Embedded Sanity Studio
│   └── config/        # Tailwind, TS, Biome
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── netlify.toml
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```
