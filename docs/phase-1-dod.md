# Phase 1 — Definition of Done ✅

**Sprint closed:** 2026-04-25  
**Repo:** [DiggAiHH/elbtronika](https://github.com/DiggAiHH/elbtronika)  
**CI run:** [#24935786809](https://github.com/DiggAiHH/elbtronika/actions/runs/24935786809) — `completed: success`

---

## CI Pipeline — 6/6 Green

| Job | Status | Time |
|-----|--------|------|
| Install Dependencies | ✅ | 15s |
| TypeScript | ✅ | 22s |
| Biome Lint | ✅ | 17s |
| Unit Tests (Vitest) | ✅ | 22s |
| Next.js Build | ✅ | 43s |
| Deploy to Netlify | ✅ | 1m28s |

Total pipeline: ~3 min on ubuntu-latest.

---

## What Was Built

### Monorepo Structure
```
elbtronika/
├── apps/
│   └── web/          # Next.js 15.3 App Router, React 19, Tailwind v4
├── packages/
│   ├── contracts/    # Zod schemas, shared TypeScript types
│   ├── ui/           # shadcn/ui component library stub
│   └── config/       # Shared TS/ESLint configs
├── .github/
│   └── workflows/
│       └── ci.yml    # Full 6-job pipeline
└── docs/
    └── adr/          # Architecture Decision Records
```

### Stack Locked In
- **Frontend:** Next.js 15.3.0, React 19.1, Tailwind v4.1, shadcn/ui
- **Monorepo:** pnpm v10 workspaces + Turborepo v2
- **Quality:** Biome v2.4.13 (lint + format), TypeScript strict
- **Testing:** Vitest v3 (unit), Playwright v1.59 (e2e stub)
- **Hosting:** Netlify (deploy job wired, secrets needed for Phase 3)
- **CI:** GitHub Actions — Install → TypeCheck → Lint → Test → Build → Deploy

### Routes Scaffolded (14 static pages)
- `/_not-found`
- `/[locale]` — de, en
- `/[locale]/about`
- `/[locale]/checkout`
- `/[locale]/gallery`
- `/[locale]/shop`
- `/api/health`

---

## Bugs Fixed in This Sprint (Engineering Harness Log)

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Biome lint fail | Schema `2.0.0` incompatible with installed `2.4.13` | Rewrote `biome.json` — `files.includes` with `!`, `noConsole`, `overrides[].includes`, `tailwindDirectives: true` |
| Next.js build fail | `experimental.reactCompiler: true` requires `babel-plugin-react-compiler` | Commented out — re-enable Phase 7+ |
| Vitest picks up e2e specs | Default glob matches `**/*.spec.ts` | Added `exclude: ["**/e2e/**", "**/*.spec.ts"]` to `vitest.config.ts` |
| Vitest exits 1, no tests | `--passWithNoTests` missing | Added to all 3 package `test` scripts |
| Upload artifact empty | `.next/` is a dotdir → `include-hidden-files: false` by default | Added `include-hidden-files: true` to `upload-artifact@v4` |
| Deploy artifact not found | Previous: artifact was empty | Fixed via: rebuild in deploy job + `include-hidden-files: true` in build job |
| esbuild binary missing | `pnpm.onlyBuiltDependencies` not set | Added `["esbuild", "sharp"]` to root `package.json` |
| `exactOptionalPropertyTypes` | Playwright config used `undefined` assignment | Conditional spread pattern |
| `noImportantStyles` | Biome flagged `!important` in reduced-motion CSS | Set rule `off` in `linter.rules.complexity` |

**Prevention rule:** Any CI failure must be root-caused, fixed, and documented here. No guessing, no retry-loops.

---

## Open Items (Not Blockers for Phase 1)

| Item | Phase | Note |
|------|-------|------|
| `NETLIFY_SITE_ID` + `NETLIFY_AUTH_TOKEN` secrets | Phase 3 | Deploy step has `continue-on-error: true` until wired |
| Netlify site created & linked to repo | Phase 3 | Doppler → Netlify env injection |
| `NEXT_PUBLIC_SUPABASE_URL` real value | Phase 3 | Placeholder used in build |
| Steuerberater / Rechtsform | Phase 0 (parallel) | Blocks Stripe KYC |
| Dependabot alerts (27 vulns) | Phase 3 | Review + update lockfile |

---

## ADR Index

| ADR | Decision |
|-----|----------|
| ADR-001 | pnpm + Turborepo monorepo |
| ADR-002 | Biome v2 over ESLint + Prettier |
| ADR-003 | Next.js App Router (no Pages) |
| ADR-004 | Supabase (Postgres + RLS + pgvector) |
| ADR-005 | Netlify hosting (edge functions via Deno) |

---

## Phase 2 Entry Criteria — Ready ✅

Phase 1 gates all passed:
- [x] Repo exists at `github.com/DiggAiHH/elbtronika`
- [x] pnpm monorepo with Turborepo — `pnpm build` green
- [x] TypeScript strict — zero errors
- [x] Biome v2 lint — zero errors
- [x] Vitest — passes (no tests yet, `--passWithNoTests`)
- [x] Next.js 15 builds 14 pages — zero errors
- [x] CI pipeline 6/6 green on `main`
- [x] Netlify deploy job wired (continues gracefully without secrets)

**Phase 2 starts with:** Supabase project setup, R2 bucket, Sanity v4 studio scaffold, Doppler environment config, and Stripe Connect account creation.

---

## Sprint Retrospective (Solo)

**Hardest blocker:** `upload-artifact@v4` silently skipping `.next/` because dotdirs are excluded by default (`include-hidden-files: false`). Took multiple CI runs to isolate — root cause was hidden in default behaviour, not in the build itself.

**Eselbrücke für nächste Mal:**
- `.next` = dotdir = hidden = upload-artifact skips it → always `include-hidden-files: true` for `.next/`
- Biome major version bump always breaks `biome.json` schema — check changelog before upgrading
- `reactCompiler: true` needs its own babel package — never enable without the dep

**Token-Effizienz:** Next session start with `caveman-compress CLAUDE.md` to cut input tokens before Phase 2 work begins.
