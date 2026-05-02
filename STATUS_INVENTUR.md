# Status-Inventur — Phase 20.B Post-Finalize
> Erstellt: 2026-04-30 | Branch: feature/phase-11-ai

## ✅ FERTIG (abgehakt)

| # | Feature | Datei(en) | Tests | Anmerkung |
|---|---------|-----------|-------|-----------|
| 1 | Landing Page | `app/[locale]/page.tsx` (366 lines) | hero.test.tsx (3 STUBS — siehe offen) | Real |
| 2 | Press Kit | `app/[locale]/press/page.tsx` (154 lines) | press-kit.test.tsx (5 passing) | Real |
| 3 | Pitch Dashboard | `app/[locale]/pitch/page.tsx` (199 lines) | dashboard.test.tsx (4 passing, 1 STUB) | Real |
| 4 | Checkout (Demo-Hint) | `app/[locale]/(checkout)/checkout/page.tsx` (47 lines) | — | Real, 4242-Hint |
| 5 | Shop (Mode-Filter) | `app/[locale]/(shop)/shop/page.tsx` (97 lines) | shop.test.ts, demo-mode.test.tsx | Real |
| 6 | DemoBanner | `packages/ui/src/components/DemoBanner.tsx` | demo-banner.test.tsx (5 passing) | Real |
| 7 | WalkthroughTour | `packages/ui/src/components/WalkthroughTour.tsx` | walkthrough-tour.test.tsx (11 passing) | Real |
| 8 | EnvProvider | `apps/web/src/components/providers/EnvProvider.tsx` | mode.test.ts (6 passing) | Real |
| 9 | env.ts (22 Doppler Vars) | `apps/web/src/lib/env.ts` | mode.test.ts (6 passing) | Real |
| 10 | Stripe Demo Layer | `apps/web/src/lib/stripe/demo.ts` | demo.test.ts (4 passing) | Real |
| 11 | MCP Audit Logger | `apps/web/src/lib/mcp/audit.ts` | — | Real |
| 12 | MCP Invoke API | `app/api/mcp/invoke/route.ts` | — | Real, Allowlist + Audit |
| 13 | Stripe Connect API | `app/api/stripe/connect/route.ts` | — | Real, Demo-Mode |
| 14 | Supabase Migrations | `supabase/migrations/*.sql` (9 Stück) | — | Bereinigt, SQL-korrekt |
| 15 | Supabase Seed | `supabase/seed-demo.sql` | — | Real, 5 Artists + 3 DJs + 3 Rooms + 8 Artworks |
| 16 | Demo Assets | `public/demo/{artworks,audio,models}` | — | 8 Bilder, 3 Audio, 3 Models |
| 17 | ADRs | `docs/adr/*.md` (25 Stück) | — | Real |
| 18 | Runbooks | `docs/runbooks/*.md` (3 Stück) | — | Real |
| 19 | Doppler Validation | `scripts/validate-doppler-prd.{ps1,sh}` | — | Real, 22 Vars |
| 20 | E2E Demo Flow | `e2e/demo-flow.spec.ts` | 9 tests | Real |
| 21 | E2E Shop | `e2e/shop.spec.ts` | 4 tests | Real |
| 22 | E2E Health | `e2e/health.spec.ts` | 2 tests | Real |
| 23 | i18n Messages | `messages/{de,en}.json` | — | press, pitch, checkout, shop namespaces |
| 24 | Cart Store Tests | `__tests__/shop/cart.test.tsx` | mehrere | Real |
| 25 | Upload API Tests | `__tests__/api/assets/upload.test.ts` | mehrere | Real |
| 26 | Sanity Webhook Tests | `__tests__/api/webhooks/sanity.test.ts` | mehrere | Real |
| 27 | Supabase Admin Tests | `__tests__/supabase/admin.test.ts` | 2 passing | Real |
| 28 | InvestorWelcomeModal | `app/[locale]/pitch/InvestorWelcomeModal.tsx` | — | Real, 67 lines |
| 29 | Root Layout | `app/[locale]/layout.tsx` | — | EnvProvider + DemoBanner integriert |
| 30 | Supabase Config | `supabase/config.toml` | — | Real |
| 31 | Audit Smoke-Test | `supabase/smoke-test-audit.sql` | — | Real |
| 32 | ENV Example | `apps/web/.env.example` | — | Vollständig, 18 Vars |
| 33 | Pre-Flight Protocol v3.0 | `engineering-harness/PRE_FLIGHT_PROTOCOL.md` | — | 500+ lines |

## ❌ NICHT FERTIG (offen)

| # | Feature | Problem | Priorität | Kann Agent? |
|---|---------|---------|-----------|-------------|
| 1 | **Room.tsx TypeScript** | `packages/three/src/components/Room.tsx:66` — `Type '(string \| undefined)[]' is not assignable to type 'string[]'` | **P0** | ✅ Ja |
| 2 | **hero.test.tsx Stubs** | 3 Tests sind `expect(true).toBe(true)` | **P0** | ✅ Ja |
| 3 | **dashboard.test.tsx Stubs** | 1 Test ist `expect(true).toBe(true)` | **P0** | ✅ Ja |
| 4 | **InvestorWelcomeModal** | Existiert, aber wird in `pitch/page.tsx` NICHT importiert/verwendet | **P0** | ✅ Ja |
| 5 | **console.* calls** | Noch im Repo — Phase 20.A: Logger-Modul | **P1** | ✅ Ja (teilweise) |
| 6 | **Full typecheck** | Blockiert durch Room.tsx:66 + OOM | **P1** | ⚠️ Teilweise |
| 7 | **Supabase Types** | `supabase gen types` — CLI nicht installiert | **P2** | ❌ Nein (manuell) |
| 8 | **Migrations Push** | `supabase db push` — nur Lou kann das | **P2** | ❌ Nein (manuell) |
| 9 | **Real Demo Assets** | Bilder/Audio/Models sind Platzhalter/Generated | **P2** | ❌ Nein (Lou muss genehmigen) |
| 10 | **Investor Magic-Link** | Braucht Lee's echte Email | **P2** | ❌ Nein (manuell) |

## 📊 Test-Statistik

| Kategorie | Anzahl | Status |
|-----------|--------|--------|
| Unit-Test-Dateien | 13 | 10 real, 2 mit Stubs, 1 unklar |
| E2E-Test-Dateien | 5 | 5 real |
| Tests passing (bestätigt) | 43 | ✅ |
| Tests geschätzt gesamt | ~70 | ~60 real, ~10 Stubs |
