# ELBTRONIKA

> Where art meets frequency.
> Immersive 3D art gallery + spatial audio + curated e-commerce.

---

## Modes

ELBTRONIKA läuft in drei Modi, gesteuert durch die Doppler-Variable `ELT_MODE`:

| Modus | ENV | Use-Case | Daten | Stripe |
|-------|-----|----------|-------|--------|
| **Demo** | `demo` | Pitch zu Investoren, interne Tests | Demo-Personas (5 Artists, 3 DJs, 8 Artworks) | Test-Mode + Mock-Connected-Accounts |
| **Staging** | `staging` | QA, Smoke-Tests vor Live | Mix aus Demo + echten Künstlern | Test-Mode + echte Connected-Accounts |
| **Live** | `live` | Public Launch | Nur echte Künstler, echte Verkäufe | Live-Mode |

Der Modus wird beim App-Start validiert und steht client-seitig via `useElbMode()` zur Verfügung.

---

## Quick Start

### Voraussetzungen

- Node.js 20+
- pnpm 9+
- Docker (für lokale Supabase)
- Doppler-CLI (`doppler login`)

### Installation

```bash
# 1. Repo klonen
git clone https://github.com/DiggAiHH/elbtronika.git
cd elbtronika

# 2. Dependencies installieren
pnpm install

# 3. Doppler konfigurieren
doppler login
doppler setup --project elbtronika --config dev

# 4. Lokale Supabase starten (optional)
pnpm supabase start

# 5. Dev-Server starten
pnpm dev
```

Öffne [http://localhost:3000](http://localhost:3000).

---

## Test-Befehle

```bash
# Unit + Integration (Vitest)
pnpm --filter @elbtronika/web test

# E2E (Playwright)
pnpm --filter @elbtronika/web test:e2e

# Type-Check
pnpm --filter @elbtronika/web typecheck
pnpm --filter @elbtronika/contracts typecheck

# Lint + Format (Biome)
pnpm lint
pnpm format

# Lighthouse CI
pnpm --filter @elbtronika/web lighthouse

# Doppler prd ENV validation
# Bash (Linux/macOS/CI):
doppler run --config prd -- bash scripts/validate-doppler-prd.sh
# PowerShell (Windows):
doppler run --config prd -- pwsh scripts/validate-doppler-prd.ps1
```

---

## Troubleshooting

| Problem | Lösung |
|---------|--------|
| `doppler login` schlägt fehl | Token expired → `doppler logout && doppler login` |
| `supabase start` fehlt | Docker Desktop nicht gestartet? → `docker info` prüfen |
| `pnpm install` hängt | `pnpm store prune && pnpm install` |
| Tests rot nach Checkout | `.env.local` fehlt? → `doppler secrets download --format docker --no-file > apps/web/.env.local` |
| Build failt wegen ENV | `ELT_MODE` in Doppler/dev gesetzt? → `doppler secrets get ELT_MODE` |
| Playwright-Browser fehlt | `pnpm exec playwright install` |

---

## Monorepo-Struktur

```
apps/
  web/              → Next.js 15 Frontend
  cms/              → Sanity Studio
packages/
  ui/               → React-UI-Komponenten (Radix + CVA)
  contracts/        → Zod-Schemas + Supabase-Types
  three/            → R3F 3D-Canvas-System
  audio/            → Spatial-Audio-Engine
  ai/               → Claude-Kuration-API
  flow/             → Audio-Visual-Flow-Analyse
  mcp/              → Hermes MCP-Connector
supabase/
  migrations/       → Versionierte SQL-Migrationen
docs/
  adr/              → Architecture Decision Records
  runbooks/         → Betriebsanleitungen
  marketing/        → Pitch-Materialien
engineering-harness/
  HERMES_TRUST_HARNESS.md → Trust-Boundary-Spezifikation
```

---

## Branching

```
main ← merge target
  └── feature/phase-11-ai
        ├── feature/phase-18-demo-readiness
        ├── feature/phase-19-pitch-polish
        └── feature/phase-18-19-tests-and-prd-docs
```

Alle Feature-Branches gegen `feature/phase-11-ai`. Final-Merge nach Lee-OK.

---

## Docs

- [Architekturplan v1.3](ELBTRONIKA_Architekturplan_v1.3.md)
- [Trust Harness](engineering-harness/HERMES_TRUST_HARNESS.md)
- [Doppler prd Setup](docs/runbooks/doppler-prd-setup.md)
- [Live-Switch Choreografie](docs/runbooks/live-switch-post-lee-ok.md)
- [Pitch-Rehearsal](docs/runbooks/pitch-rehearsal.md)

---

## Lizenz

Proprietär — ELBTRONIKA UG (haftungsbeschränkt) i.G.
