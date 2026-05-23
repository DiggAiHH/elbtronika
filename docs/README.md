# ELBTRONIKA Dashboard — Hoops UI / Build Status

Worldwide-zugängliches Single-Page-Dashboard.

- Live-URL nach Setup: `https://diggaihh.github.io/elbtronika/`
- Source: `docs/index.html` (Tailwind via CDN, kein Build)
- Deploy: GitHub Action `.github/workflows/deploy-dashboard.yml` triggert auf push zu `main` mit Änderungen in `docs/**`.

## Setup einmalig (Repo-Settings)

1. GitHub → Repo `DiggAiHH/elbtronika` → Settings → Pages
2. Source: **GitHub Actions** (nicht Branch/Folder)
3. Push den ersten Commit mit dieser Action → automatischer Deploy

## Local Preview

`docs/index.html` einfach im Browser öffnen — kein Server nötig.

## Update-Workflow

- Counter in `index.html` bumpen (Phasen-DoD)
- commit + push → Action publisht automatisch innerhalb ~1 min
