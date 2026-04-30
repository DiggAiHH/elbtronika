# Entwickler-Setup

## Voraussetzungen
- Node.js >= 22.0.0
- pnpm >= 10.0.0
- Windows, macOS, oder Linux

## Installation

```bash
# 1. Repo klonen
git clone <repo-url>
cd Elbtonika

# 2. Dependencies installieren
pnpm install

# 3. Environment kopieren
cp apps/web/.env.example apps/web/.env.local
# → Variablen in .env.local ausfüllen

# 4. TypeScript check
pnpm typecheck

# 5. Tests laufen lassen
pnpm test

# 6. Dev-Server starten
pnpm dev
```

## Projektstruktur
```
apps/
  web/          # Next.js 15 App
  cms/          # Sanity Studio
packages/
  ai/           # Anthropic SDK Wrapper
  audio/        # Web Audio API Engine
  payments/     # Stripe Connect
  three/        # R3F 3D Gallery
  ui/           # Design System
  contracts/    # Supabase Types
```

## Wichtige Befehle
| Befehl | Beschreibung |
|--------|-------------|
| `pnpm dev` | Dev-Server starten |
| `pnpm build` | Production Build |
| `pnpm test` | Alle Tests laufen lassen |
| `pnpm lint` | Biome Lint |
| `pnpm typecheck` | TypeScript prüfen |

## Troubleshooting
### TypeScript OOM
```bash
set NODE_OPTIONS=--max-old-space-size=4096
pnpm typecheck
```

### Build fehlschlägt wegen Sanity
Dummy-Projekt-ID in `.env.local` setzen:
```
NEXT_PUBLIC_SANITY_PROJECT_ID=dummy-project-id
```
