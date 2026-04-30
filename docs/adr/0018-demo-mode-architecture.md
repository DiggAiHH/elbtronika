# ADR 0018 — Demo-Mode Architecture

| Feld | Wert |
|------|------|
| Status | Accepted |
| Datum | 2026-04-30 |
| Autor | Kimi K-2.6 (Sonnet-Workstream) |
| Betroffene Phasen | 18 |

---

## Kontext

ELBTRONIKA benötigt einen voll-funktionalen Demo-Mode für den Investor-Pitch zu Lee Hoops, bevor regulatorische Hürden (UG, Stripe-KYC, Anwalt) abgeschlossen sind.

---

## Entscheidungen

1. **Globaler Modus-Schalter:** `ELT_MODE=demo|staging|live` in Doppler
2. **Typed Env:** Zod-Validation in `apps/web/src/lib/env.ts`, default `demo`
3. **Client-Hydration:** `<EnvProvider>` in Root-Layout, `useElbMode()` Hook
4. **Demo-Personas:** 5 Artists, 3 DJs, 8 Artworks, 3 Rooms — idempotent SQL-Seed
5. **Demo-Flag:** `is_demo` in Supabase + `isDemo` in Sanity — filterbar pro Modus
6. **Stripe-Demo-Layer:** Mock-Connected-Account-IDs, identische Code-Pfade
7. **Demo-Banner:** `packages/ui` Komponente, conditional auf `mode==='demo'`
8. **Shop-Filter:** Server-side Filterung in `shop/page.tsx` basierend auf `ELT_MODE`

---

## Modus-Verhalten

| Modus | Shop-Filter | Banner | Stripe |
|-------|-------------|--------|--------|
| demo | Nur `isDemo=true` | Demo-Banner bottom-right | Test-Mode + Mock-Accounts |
| staging | Beides | Staging-Banner top | Test-Mode + Real-Accounts |
| live | Nur `isDemo=false` | Kein Banner | Live-Mode |

---

## Konsequenzen

- 15-Minuten-Live-Switch möglich
- Demo-Content ist klar markiert und ausblendbar
- Keine Code-Divergenz zwischen Demo und Live
