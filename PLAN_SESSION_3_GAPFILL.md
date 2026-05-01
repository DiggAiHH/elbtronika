# Session 3 — Gap-Fill Plan
## Status: Inventur abgeschlossen, Ausführung gestartet

---

## Inventur-Ergebnis

### ❌ KRITISCH (P0) — Komplett fehlend

| # | Workstream | Item | Status | Grund |
|---|-----------|------|--------|-------|
| 1 | GPT C3 | Press-Page (`apps/web/app/[locale]/press/page.tsx`) | ❌ FEHLEND | Verzeichnis existiert, aber leer |
| 2 | GPT C4 | Pitch-Dashboard (`apps/web/app/[locale]/pitch/page.tsx`) | ❌ FEHLEND | Verzeichnis hat nur InvestorWelcomeModal.tsx |
| 3 | GPT C5 | Checkout Test-Card-Hint | ❌ FEHLEND | Checkout-Verzeichnis leer |
| 4 | GPT C8 | Echte Tests (nicht Platzhalter) | ❌ FEHLEND | `dashboard.test.tsx` und `press-kit.test.tsx` sind `expect(true).toBe(true)` |

### ⚠️ WICHTIG (P1) — Teilweise / Unvollständig

| # | Workstream | Item | Status | Grund |
|---|-----------|------|--------|-------|
| 5 | GPT C1 | Landing-Page Ergänzungen | ⚠️ TEILWEISE | Seite existiert (327 Zeilen), aber fehlt: Sound-Toggle, Demo-Hint, audio-reactive motion, "Where art meets frequency" USP |
| 6 | Sonnet B5 | Demo-Content-Assets | ⚠️ FEHLEND | `public/demo/` existiert nicht, `docs/demo-assets-license.md` fehlt |
| 7 | Sonnet A3 | Negativ-Test admin.ts | ⚠️ FEHLEND | Kein Test für "ohne SR-Key → 500" |
| 8 | GPT C6 | Investor-Login-Flow | ⚠️ TEILWEISE | Nur Welcome-Modal, kein Role-Gating, keine Login-Route |

### ✅ FERTIG (nicht mehr zu tun)

- Codex 5.3: Alles (E2E, Runbooks, Doppler-Doku, README, ADR, Validation-Skripte)
- Sonnet B1-B4, B6-B7, B9: env.ts, stripe/demo.ts, mcp/audit.ts, DemoBanner, EnvProvider, useElbMode, admin.ts, Shop-Filter, ADRs
- GPT C2, C9-C10: WalkthroughTour, Video-Script, ADR 0019

---

## Ausführungsplan

### Phase 1: GPT Branch — Kritische Lücken (P0)
1. Press-Page erstellen (`apps/web/app/[locale]/press/page.tsx`)
2. Pitch-Dashboard erstellen (`apps/web/app/[locale]/pitch/page.tsx`)
3. Checkout Test-Card-Hint einbauen
4. Tests schreiben (dashboard, press-kit — echte Tests)

### Phase 2: GPT Branch — Landing-Page Polish (P1)
5. Sound-Toggle + Demo-Hint zur Landing-Page hinzufügen

### Phase 3: Sonnet Branch — Demo-Assets + Negativ-Test (P1)
6. `public/demo/` Stubs + `docs/demo-assets-license.md`
7. Negativ-Test für admin.ts

### Phase 4: Validierung + Commit
8. Tests laufen lassen
9. Lint prüfen
10. Commit + Push + Run-Log
