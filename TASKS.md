# Tasks

## Active

- [ ] **Rechtsform entscheiden** - Einzelunternehmen vs. UG vs. GmbH - Steuerberater-Rückfrage
- [ ] **Stripe Business-Account beantragen** - zeitkritisch, 5–10 Werktage KYC-Bearbeitung, blockiert alles Kommerzielle
- [ ] **Impressum, Datenschutz, AGB durch Fachanwalt IT-Recht** - rechtssicher, nicht generiert
- [ ] **Markenrecherche ELBTRONIKA** - DPMA + EUIPO prüfen, ggf. Markenanmeldung
- [ ] **Domains sichern** - elbtronika.de, .com, .art - DNS auf Cloudflare
- [ ] **GitHub Org `elbtronika` anlegen** - privates Repo, branch protection auf main
- [ ] **Accounts mit Team-Email anlegen** - Netlify, Cloudflare, Supabase, Sanity, Anthropic, Stripe, Sentry, Doppler
- [ ] **Künstler-Nutzungsvertrag + DJ-Vertrag entwerfen** - 60/20/20 Split, GEMA-Problematik, DSGVO-AVV

## Waiting On

- [ ] **Steuerberater-Rückfrage zu Rechtsform** - since 2026-04-24

## Someday

- [ ] **Phase 1: Repo-Initialisierung** - pnpm workspaces, Turborepo, Biome, Husky, Next.js 15 scaffold
- [ ] **Phase 2: Design System & Core UI** - Tokens, Radix-Primitives, Storybook 9, a11y baseline
- [ ] **Phase 3: Supabase + R2 + Sanity Infrastruktur** - RLS-Policies, EU-Region, Migrations versioniert
- [ ] **Phase 4: Auth + Rollen** - Supabase Magic Link + OAuth, RLS-Tests mit negativen Cases
- [ ] **Phase 5: Content Model + Asset-Pipeline** - Sanity→Supabase Sync, Draco/KTX2, HLS-Encoding
- [ ] **Phase 6: Classic Mode Shop** - SSR Grid, Artwork Detail, Lean Cart, Lighthouse ≥90
- [ ] **Phase 7: Immersive 3D Gallery** - Single-Canvas-Architektur, R3F + WebGPU, Proximity-System, 60 FPS
- [ ] **Phase 8: Spatial Audio System** - PannerNode Graph, HLS via Web Worker, SoundCloud-Proxy für DSGVO
- [ ] **Phase 9: Mode Transitions** - 1200ms choreographed, Kamera-Interpolation, Shader-Blend
- [ ] **Phase 10: Stripe Connect Checkout** - Separate Charges and Transfers, Webhook-Idempotenz, Refund-Flow
- [ ] **Phase 11: Claude Kuration** - Artwork-Beschreibungen, Mood-Empfehlungen, XAI + Audit-Log
- [ ] **Phase 12: DSGVO Consent + Cookieless Analytics** - Plausible/Matomo, Klaro-Fallback
- [ ] **Phase 13: Performance & Monitoring** - Sentry, Lighthouse CI, FPS-Budgets in Playwright
- [ ] **Phase 14: Beta-Launch Geschlossen** - 10-20 Beta-Käufer, First Sale Stripe-End-to-End
- [ ] **Phase 15: Public Launch** - PR, Partner-DJs, Marketing-Kampagne
- [ ] **Phase 16: Automation + Agents** - Webhooks, Agent-Flows, Minimal-Touch Ops

## Done

- [x] **Hermes Trust Wave 0** — `/api/mcp/invoke` + `/api/mcp/tools` auth + role gate + tool allowlist (2026-04-30)
- [x] **Hermes Trust Wave 1** — Structured audit log on every MCP invocation attempt (2026-04-30)
- [x] **Hermes Trust Wave 2** — Canonical `server/tool` naming enforced at invoke boundary (2026-04-30)
- [x] **Hermes Trust Wave 3** — `agent_tasks` DB table; task state persisted, not in-memory (2026-04-30)
- [x] **Hermes Trust Wave 4** — Idempotency key + atomic claim lock; execution updates DB status on success/failure (2026-04-30)
- [x] **Hermes Trust Wave 5** — Flow analyze/match APIs return explicit `source: "simulated" | "measured"` (2026-04-30)
- [x] **Hermes Trust Wave 6** — Vitals endpoint gates on `x-consent-analytics` header; client checks consent before sending (2026-04-30)
- [x] **Hermes Trust Wave 7** — Stripe webhook order lookup fixed (stripe_session_id); checkout stores session ID; orders now confirm after payment (2026-04-30)
- [x] **Hermes Trust Wave 8** — STATUS.md + TASKS.md updated to reflect implemented behavior (2026-04-30)

## Remaining Trust Tasks (next session)

- [ ] **Audit DB table** — Move `logAuditEvent` from console to `mcp_audit_log` Supabase table for durable audit trail
- [ ] **Apply migrations** — `20260430_agent_tasks.sql` and `20260430_orders_session_id.sql` must be applied to Supabase
- [x] **Verify service-role key** — `createAdminClient()` in `apps/web/src/lib/supabase/admin.ts` correctly uses `SUPABASE_SERVICE_ROLE_KEY` (2026-04-30)

## Phase 18 — Demo-Readiness

- [ ] **ELT_MODE env layer** — `apps/web/src/lib/env.ts` erweitern um `ELT_MODE: 'demo' | 'staging' | 'live'`
- [ ] **EnvProvider + useElbMode()** — RSC → Client Hydration
- [ ] **Stripe Demo Layer** — Mock-Connected-Accounts + Demo-Checkout
- [ ] **Demo Persona Seed** — 5 Artists, 3 DJs, 8 Artworks, 3 Rooms
- [ ] **Demo Banner** — `packages/ui` Komponente, conditional render
- [ ] **Shop Filter** — Demo/Live/Staging Artwork-Filter
- [ ] **ADR 0014 + 0018** — Trust-Residuals + Demo-Mode

## Phase 19 — Pitch-Polish

- [ ] **Landing refinement** — Hero-Animation, USP, Sound-Toggle
- [ ] **Walkthrough Tour** — 5 Steps, dismissible, i18n
- [ ] **Press Kit** — `/press` Vision, Roadmap, Team, Numbers
- [ ] **Pitch Dashboard** — `/pitch` investor-gated, Mock-Daten
- [ ] **Stripe Test-Card Hint** — Subtiler Hinweis im Checkout
- [ ] **Investor Login** — Magic-Link, Auto-Welcome
- [ ] **ADR 0019** — Pitch-Architektur

## Phase 18–19 — Tests & Docs

- [ ] **E2E Demo-Flow** — `apps/web/e2e/demo-flow.spec.ts` 8 Steps
- [ ] **Doppler prd Setup-Doku** — Schritt-für-Schritt-Anleitung
- [ ] **Live-Switch Runbook** — 15-Minuten-Choreografie
- [ ] **Pitch-Rehearsal** — Lou's 5-Minuten-Script
- [ ] **README** — Modes, Quick-Start, Troubleshooting
- [ ] **ADR 0020** — Modes + Doppler Strategy
