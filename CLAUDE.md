# AI Mode — Engineering Harness

Terse. Drop fluff. Technical exact. Code unchanged.
Pattern: [thing] [action] [reason]. [next step].
Caveman always on. Off: "normal mode". Commits/PRs: normal english.

---

# ELBTRONIKA — Agent Context

> **Stand: 2026-07-09.** Diese Datei war zuvor 2 Monate veraltet (behauptete "Phase 5").
> **Wahrheitsquellen, in dieser Reihenfolge:** `STATUS.md` (Sessions-Log + Phasen-Ampel) →
> `PLAN_RESTARBEITEN_2026-07-09.md` (Gap-Analyse + 6-Sprint-Plan) → Git-Log auf `main`.

## Projekt

Immersive 3D-Online-Galerie: elektronische Musik (DJs) + visuelle Kunst.
Kernfeature: Immersive Mode (3D + Spatial Audio) ↔ Classic Mode (Shop-Grid), Single WebGPU/WebGL-Canvas.
Revenue-Split 60/20/20 Künstler/DJ/Plattform (ohne DJ: 60/0/40 — Klärung mit Lou offen).
Owner: Lou (diggai@tutanota.de), Solo-Builder. Repo: github.com/DiggAiHH/elbtronika.

## Ist-Zustand (kurz)

- Phasen 1–19 done, Phase 0 (Legal/Stripe-KYC) offen = einziger Launch-Blocker. Phase 21/22 (Live-Switch/Launch) blocked darauf.
- Sprints 1–5 der Restarbeiten (2026-07-09) done: main = Wahrheitsbranch, Checkout end-to-end verdrahtet, 3 Stripe-Bugs gefixt, Migrationen repariert + Flow-RLS, HLS-Playback, Middleware-Session-Refresh reaktiviert, Biome 0 Fehler.
- Offen (siehe Plan §5/6): Landing-i18n, ADR-Ordner-Merge + Plan v1.5, tote Packages (config/browser/sanity-studio), echte Audio/Art-Analyse (braucht Decode-Pipeline), Supabase db push (braucht Credentials — NIE blind pushen, siehe Schema-Drift in STATUS.md!), Dependabot-Vulns, Guard-Tests → Verhaltenstests.

## Stack

Next.js 15.5 App Router · React 19 · Tailwind v4 · Three.js/R3F v9 (WebGL, WebGPU nur Detection) · Web Audio + hls.js · Zustand v5 · Supabase (Postgres+RLS, EU) · Stripe Connect (Separate Charges & Transfers) · Sanity v4 (apps/cms = deployt) · Cloudflare R2 · Netlify (App) + Cloudflare Pages (coming-soon, live) · Anthropic SDK · pnpm 10 + Turborepo · Biome v2 · Vitest + Playwright.

## Kritische Regeln (hart erarbeitet)

1. **production-deploy.yml hat KEINEN push-Trigger mehr.** Prod-Deploys nur manuell (workflow_dispatch + "DEPLOY") bis Phase-21-Runbook (`docs/runbooks/live-switch-post-lee-ok.md`) durchlaufen ist. Nicht wieder anschalten.
2. **Supabase:** Remote-DB ≠ Repo-Baseline! `0001_init.sql`–`0003` + `seed.sql` beschreiben ein nie appliedes Fantasie-Schema. Echte offene Deltas: nur `20260429120000_flow_engine.sql` + `20260430130000_investor_role.sql`. Vorgehen steht in STATUS.md (db pull → Baseline ersetzen → Deltas pushen).
3. **`NODE_ENV=production` wird vom Prozessbaum der Claude-Desktop-App (Electron) an Kindprozesse vererbt** (User-/Machine-Scope sind sauber — geprüft 2026-07-09). Folge: Agent-gestartete vitest-Läufe luden Production-React (React.act undefined). Die vitest-Configs (web/audio/three) erzwingen deshalb NODE_ENV=test — Guard nicht entfernen.
4. Stripe: `order_id` MUSS in payment_intent_data.metadata (Editions-Idempotenz). Kein `application_fee_amount` auf Sessions (Separate Charges & Transfers: Plattform-Anteil = Rest).
5. Simulierte Features sind als `source: "simulated"` gelabelt (flow/analyze, MCP-Audio). Labels nicht entfernen ohne echte DSP-Pipeline.
6. GDPR: `/api/account/*` ist kanonisch (anonymisiert Orders statt Löschung — Aufbewahrungspflicht).

## Cowork/Tool-Regeln (Windows-Maschine)

- Shell → IMMER `cmd` (PowerShell blockt pnpm). Desktop Commander bevorzugt; Workspace-Sandbox-Mount ist langsam + Write-Tools truncaten >2KB.
- Git-Commit-Messages: `(echo zeile1& echo.& echo zeile2) > D:\msg.txt && git commit -F D:\msg.txt` — **msg.txt IMMER in derselben Befehlskette neu schreiben** (stale Datei wurde schon mal falsch committet). Kein `|` in echo-Ketten.
- Lange Prozesse (build/install/test) DETACHED starten: `start "x" /min cmd /c "… > log 2>&1"`, dann Log pollen — MCP-Timeouts killen sonst Kindprozesse.
- Build-Script nutzt `node_modules/next/dist/bin/next` (der `.bin`-Shim ist unter Windows nicht node-ausführbar).
- Biome → `node_modules\.bin\biome.CMD` (nie npx). `[locale]`-Ordner nur per Node `fs.mkdirSync` anlegen.
- CI-Check: `gh run list --repo DiggAiHH/elbtronika`.

## Konventionen

- Deutsch als Arbeitssprache, Code/Commits Englisch (conventional commits).
- main = Wahrheit; kurze Feature-Branches, nach Merge löschen. Tags nie umschreiben.
- Vor jedem Merge lokal: vitest (web + betroffene Packages) + `tsc --noEmit` + bei App-Änderungen `pnpm run build`.
- Doku-Update nach jeder Session in STATUS.md ("Heutige Aktion" oben anfügen).
