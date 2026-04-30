# ADR 0020 — Demo/Staging/Live Modes + Doppler prd Strategy

| Feld | Wert |
|------|------|
| Status | Accepted |
| Datum | 2026-04-30 |
| Autor | Kimi K-2.6 (Codex-Workstream) |
| Betroffene Phasen | 18, 19, 20 |

---

## Kontext

ELBTRONIKA muss vor dem Public Launch einen Investor (Lee Hoops) überzeugen. Die regulatorischen Voraussetzungen (UG-Gründung, Stripe-KYC, Anwalt-Reviews) blockieren den Live-Betrieb noch. Statt zu warten, führen wir drei Betriebsmodi ein, die über ein einziges ENV-Var schaltbar sind.

---

## Entscheidung

1. **Drei Modi:** `demo` | `staging` | `live`
2. **Schalter:** Doppler-Variable `ELT_MODE`
3. **Validierung:** Zod-Schema beim App-Start, throws bei fehlendem Wert in `production`
4. **Client-Zugriff:** `<EnvProvider>` (RSC → Hydration) + `useElbMode()` Hook
5. **Stripe-Demo-Layer:** Mock-Connected-Account-IDs für 5 Demo-Personas, identische Code-Pfade
6. **Demo-Content:** `is_demo` Flag in Supabase + Sanity, filterbar pro Modus
7. **Demo-Banner:** packages/ui Komponente, render-conditional auf `demo`

---

## Konsequenzen

### Positiv
- Investor-Pitch ist in 5–7 Tagen möglich, ohne auf regulatorische Hürden zu warten
- Live-Switch dauert 15 Minuten, nicht 15 Tage
- Demo- und Live-Code-Pfade sind identisch → keine Divergenz-Bugs
- Trust-Boundaries (Hermes) bleiben in allen Modi aktiv

### Negativ
- Demo-Content muss idempotent gepflegt werden (Seed-SQL + Sanity-Docs)
- Risk: Lee könnte Demo-Mode für unfertig halten → Mitigation: klar gelabelter Banner + Briefing
- Zusätzliche Test-Matrix (3 Modi × 2 Sprachen)

---

## Alternativen verworfen

| Alternative | Grund für Ablehnung |
|-------------|---------------------|
| Separate Demo-App | Doppelte Codebase, Divergenz-Risiko |
| Feature-Flags pro Modus | Zu komplex, `ELT_MODE` reicht als globaler Schalter |
| Nur Live-Mode + fake data | Nicht testbar ohne Live-Keys und echte Verträge |

---

## Migration

- `demo` ist der Default für neue Environments
- Bestehende `dev`-Environment bekommt `ELT_MODE=demo`
- `prd` wird initial mit `demo` + Test-Keys befüllt, post-Lee-OK auf `live` getauscht
