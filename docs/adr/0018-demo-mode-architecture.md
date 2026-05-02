# ADR 0018 — Demo Mode Architecture

| Feld | Wert |
|------|------|
| Status | Accepted |
| Datum | 2026-04-30 |
| Autor | Sonnet 4.6 |
| Betroffene Phasen | 18, 19, 20 |

---

## Kontext

ELBTRONIKA braucht einen Investor-Pitch in 5–7 Tagen, aber regulatorische Voraussetzungen (UG-Gründung, Stripe-KYC, Anwalt-Review) blockieren den Live-Betrieb. Statt zu warten, führen wir einen Demo-Mode ein, der über ein einziges ENV-Var schaltbar ist.

---

## Entscheidungen

### B1: ENV-Layer

**Datei:** `apps/web/src/lib/env.ts`
- Zod-Schema validiert `ELT_MODE: 'demo' | 'staging' | 'live'`
- Default: `demo` (failsafe für neue Environments)
- `getPublicEnv()` exportiert client-safe subset
- `resetEnv()` für Test-Cache-Invalidation

### B2: Mode-Provider

**Datei:** `apps/web/src/components/providers/EnvProvider.tsx`
- React Context mit `useElbMode()` Hook
- Server-Component injiziert Mode via Prop → Client hydrates
- Booleans: `isDemo`, `isStaging`, `isLive`

### B3: Stripe Demo Layer

**Datei:** `apps/web/src/lib/stripe/demo.ts`
- 8 Mock Connected-Account-IDs (5 Artists + 3 DJs)
- `withDemoAccounts()` — injiziert Demo-IDs in echte Code-Pfade
- `isDemoMode()` — Runtime-Check
- Identische Code-Pfade: nur die Account-ID ändert sich

### B4: Demo Persona Seed

**Datei:** `supabase/seed-demo.sql`
- 5 Artists, 3 DJs, 3 Rooms, 8 Artworks
- Idempotent (`ON CONFLICT DO UPDATE`)
- Alle Artworks: `is_demo = true`
- Stripe-Account-IDs gemappt auf `DEMO_CONNECTED_ACCOUNTS`

### B5: Demo Content Assets

**Strategie:** CDN-URLs (`https://cdn.elbtronika.art/demo/...`)
- Artwork-Bilder: 1200×1800, AI-generiert oder lizenzfrei
- 3D-Models: `.glb` Stubs (Low-Poly Cubes als Placeholder)
- Audio: `.m3u8` Mock-Manifeste (30s Loops)
- Lizenz-Doku: `docs/demo-assets-license.md` (zu Phase 19)

### B6: Demo Banner

**Datei:** `packages/ui/src/components/DemoBanner.tsx`
- Fixed position: Demo = bottom-right, Staging = top bar
- Live: render nothing
- Tooltip: "This is a fully-functional pitch demo. Real launch coming soon."
- Data-testid für E2E-Tests

### B7: Shop Filter

**Datei:** `apps/web/app/[locale]/(shop)/shop/page.tsx`
```ts
if (ELT_MODE === "demo") return artwork.isDemo === true;
if (ELT_MODE === "live") return artwork.isDemo !== true;
return true; // staging shows both
```

---

## Konsequenzen

### Positiv
- Pitch in 5–7 Tagen möglich
- Live-Switch = 15 Min Doppler-Update
- Keine Code-Divergenz zwischen Demo und Live
- Test-Card 4242 für Stripe-Demo-Flow

### Negativ
- Demo-Content muss gepflegt werden
- Risk: Lee könnte Demo-Mode als unfertig wahrnehmen → Mitigation: klar gelabelter Banner + Briefing
- Zusätzliche Test-Matrix (3 Modi × 2 Sprachen)

---

## Migration

- Bestehende `dev`-Environment: `ELT_MODE=demo`
- Neue `prd`-Environment: initial `demo` + Test-Keys
- Post-Lee-OK: `live` + Live-Keys (siehe ADR 0022 / `live-switch-post-lee-ok.md`)
