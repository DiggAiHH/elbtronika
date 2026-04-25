# ELBTRONIKA – Local Setup

> Run these commands **once** after cloning the repo.

## Prerequisites

- Node.js 22 LTS: https://nodejs.org
- pnpm 10: `npm install -g pnpm@10`
- Git

## 1. GitHub Organisation anlegen

1. Gehe zu https://github.com/organizations/new
2. Organisation-Name: `elbtronika`
3. Plan: Free
4. Erstelle das Repo `elbtronika` (privat) in der Org

## 2. Repo lokal initialisieren

```bash
# In D:\Elbtronika\Elbtonika\ ausführen (das ist bereits das Repo-Root)
cd D:\Elbtronika\Elbtonika

git init
git remote add origin git@github.com:elbtronika/elbtronika.git

# Erster Commit
git add .
git commit -m "chore: initial monorepo scaffold (Phase 1)"
git branch -M main
git push -u origin main
```

## 3. Dependencies installieren

```bash
pnpm install
```

## 4. Git Hooks aktivieren

```bash
pnpm husky init

# Pre-commit hook (Biome check)
echo "pnpm lint-staged" > .husky/pre-commit

# Commit-msg hook (Conventional Commits)
printf '%s\n' '#!/usr/bin/env sh' '. "$(dirname -- "$0")/_/husky.sh"' 'pnpm commitlint --edit "$1"' > .husky/commit-msg

chmod +x .husky/pre-commit .husky/commit-msg
```

## 5. Verify Setup

```bash
# TypeScript check
pnpm typecheck

# Linting
pnpm lint

# Run dev server
pnpm dev
# → Open http://localhost:3000/de
```

## 6. Netlify verknüpfen

1. Netlify Dashboard → "Add new site" → "Import an existing project"
2. GitHub Repo `elbtronika/elbtronika` auswählen
3. Build settings:
   - Base directory: `apps/web`
   - Build command: `pnpm build`
   - Publish directory: `apps/web/.next`
4. Netlify Plugin `@netlify/plugin-nextjs` wird automatisch erkannt
5. Branch-Deploys für alle PRs aktivieren

## 7. GitHub Branch Protection (main)

Gehe zu: GitHub Repo → Settings → Branches → Add rule

- Branch name pattern: `main`
- ✅ Require status checks: `typecheck`, `lint`, `test`, `build`
- ✅ Require branches to be up to date before merging
- ✅ Restrict force pushes
- ✅ Require linear history

---

## Environment Variables (Doppler – Phase 3)

Placeholder `.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
ANTHROPIC_API_KEY=
```

> Never commit real values. Use `doppler run -- pnpm dev` after Phase 3.
