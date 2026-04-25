# ADR 0001 – Monorepo Tooling & Repository Setup

**Status:** Accepted  
**Date:** 2026-04-25  
**Author:** Lou + Claude (Pair)  
**Phase:** 1 – Repository & Tooling

---

## Context

ELBTRONIKA is built by a solo developer (Lou) with Claude as a pair-programmer. The platform consists of multiple interconnected concerns: a Next.js frontend, shared TypeScript contracts, a UI component library, and future backend packages (3D, audio, Supabase Edge). A monorepo approach was chosen from day one to enforce shared types and avoid version drift between packages.

---

## Decision

### Package Manager: pnpm v10
- **Reason:** Workspace symlinks + disk efficiency. Faster than npm, more stable than bun for production monorepos. `pnpm-workspace.yaml` defines `apps/*`, `packages/*`, `supabase`.

### Build Orchestration: Turborepo v2
- **Reason:** Incremental builds, task caching, parallel execution. The `turbo.json` defines pipelines: `build → typecheck → lint → test`. Output caching reduces CI times significantly.
- **Alternative considered:** Nx – rejected (more config overhead for a solo project).

### TypeScript: Strict + exactOptionalPropertyTypes
- **Reason:** `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` catch a class of runtime bugs at compile time. Solo builds cannot afford runtime surprises that a bigger team would catch in review.
- **Root config:** `tsconfig.base.json` extended by each package.

### Linting & Formatting: Biome v2 (single tool)
- **Reason:** 10x faster than ESLint+Prettier, one config file, native TypeScript support. As of 2026 it is production-mature.
- **Alternative considered:** ESLint v9 + Prettier – rejected (two tools, slower, more config).

### Git Hooks: Husky + lint-staged
- **Reason:** Enforce Biome check + typecheck before every commit. Prevents dirty code from entering history.
- **Setup:** `pnpm husky init` must be run once after `pnpm install`.

### Commit Convention: Conventional Commits + commitlint
- **Reason:** Enables automated changelog generation in future phases. Consistent history readable by AI tools.

### i18n: next-intl v3 – from Phase 1
- **Reason:** Adding i18n after initial scaffolding is costly (route restructuring). DE default + EN secondary. Locale prefix always in URL (`/de/`, `/en/`). Server Components supported.
- **Decision from v1.1 plan:** mandatory from Phase 1, not later.

### Testing: Vitest v3 + Playwright v2
- **Reason:** Vitest is native ESM, integrates with Turborepo. Playwright is the only tool that can test 3D canvas content (Phase 7+) via screenshot/video.

---

## Consequences

**Positive:**
- Shared types between frontend and Supabase migrations from day one.
- One `pnpm install` at root installs everything.
- CI pipeline parallelized by default via Turborepo.
- No type drift between packages (workspace:* references).

**Negative / Trade-offs:**
- First `pnpm install` is heavier (all packages at once).
- Turborepo cache must be warmed – cold CI run is slower.
- `exactOptionalPropertyTypes` occasionally requires more explicit types in external library wrappers.

---

## Setup Commands (run once locally after repo clone)

```bash
# 1. Install all dependencies
pnpm install

# 2. Set up Git hooks
pnpm husky init
echo "pnpm lint-staged" > .husky/pre-commit
echo "pnpm commitlint --edit \$1" > .husky/commit-msg

# 3. Verify everything builds
pnpm typecheck && pnpm lint && pnpm build
```

---

## References

- [Turborepo Docs](https://turbo.build/repo/docs)
- [Biome v2 Migration Guide](https://biomejs.dev)
- [next-intl App Router Setup](https://next-intl-docs.vercel.app)
- v1.0 Plan – Section 1 (ADRs), Section 2 (Stack Versions)
- v1.1 Plan – Section 4.5 (i18n Architecture)
