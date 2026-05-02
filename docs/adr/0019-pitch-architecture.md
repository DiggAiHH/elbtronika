# ADR 0019 — Pitch Architecture (Phase 19)

| Feld | Wert |
|------|------|
| Status | Accepted |
| Datum | 2026-04-30 |
| Autor | GPT 5.4 |
| Betroffene Phasen | 19, 20 |

---

## Kontext

ELBTRONIKA braucht ein überzeugendes Investor-Erlebnis für Lee Hoops. Phase 19 baut auf dem Demo-Mode (Phase 18) auf und poliert alle Touchpoints, die Lee sehen wird.

---

## Entscheidungen

### C1: Landing-Page Refinement

**Datei:** `apps/web/app/[locale]/page.tsx`
- Full-bleed dark background, audio-reactive subtle motion
- USP: "Where art meets frequency" (DE primär + EN Toggle)
- Sound-Toggle prominent
- Primary CTA: "Enter Experience" → unlocks AudioContext + navigiert zu /gallery
- Secondary CTA: "View Catalog" → /shop
- Demo-Environment-Hint kompatibel mit DemoBanner

### C2: Walkthrough-Tour

**Datei:** `packages/ui/src/components/WalkthroughTour.tsx`
- 5 Steps: Welcome → 3D-Navigation → Audio-Proximity → Artwork-Detail → Checkout
- Persistent dismiss via localStorage (`elt-tour-dismissed`)
- Skippable
- DE + EN i18n
- Auto-Start bei erstem Besuch (2s Delay nach Audio-Unlock)
- Re-Trigger via Footer-Link "Take the tour"

### C3: Press-Kit-Page

**Datei:** `apps/web/app/[locale]/press/page.tsx`
- Vision-Statement (Plan v1.0 Sektion Vision)
- Roadmap-Timeline: Phase 1–21 (kompakt, nur Highlights)
- Team-Section: Lou's Founder-Story + Platzhalter
- Numbers-Section (Demo-Mode Mocks):
  - "5 launch artists, 3 audiovisual DJs, 8 unique drops"
  - "60/20/20 Revenue Split, transparent"
  - "Privacy by Architecture, GDPR-ready"
- Demo-Video-Embed-Slot (URL als ENV)
- Press-Contact: hallo@elbtronika.de
- Download-Link für PDF-Pitch-Deck (Stub: "coming soon")

### C4: Pitch-Dashboard

**Datei:** `apps/web/app/[locale]/pitch/page.tsx`
- Login-only (role-gated, Custom-Role `investor` in Supabase)
- Read-only Dashboards:
  - Mock-Sales-Volume-Chart
  - Artist-Onboarding-Pipeline (5 Künstler, verschiedene Stadien)
  - AI-Kuration-Mock-Cost (Anthropic-Estimate)
  - Trust-Audit-Log-Sample (letzte 50 MCP-Calls)
- "Test the Checkout"-Button → eingebetteter 4242-Card-Hint

### C5: Stripe-Test-Card-Hint

**Ort:** Checkout-Flow, bedingt auf `ELT_MODE === 'demo'`
- Subtiler Hinweis: "Use card 4242 4242 4242 4242 with any future date and any CVC."

### C6: Investor-Login-Flow

- Magic-Link an Lee's Mail-Adresse
- Erst-Login: Auto-Welcome-Modal "Hi Lee, welcome to ELBTRONIKA."
- Role `investor` in `profiles`-Tabelle

### C7: i18n

**Dateien:** `apps/web/messages/de.json`, `apps/web/messages/en.json`
- Alle neuen Strings in beiden Sprachen
- Press-Kit + Pitch-Dashboard primär EN (Investor-Sprache)

### C8: Tests

**Dateien:**
- `apps/web/__tests__/pitch/dashboard.test.tsx`
- `apps/web/__tests__/press/press-kit.test.tsx`
- E2E: Walkthrough-Tour 5 Steps, Pitch-Dashboard-Login, Press-Kit-Render
- Lighthouse: Performance ≥ 90, a11y ≥ 95

### C9: Demo-Video-Skript

**Datei:** `docs/marketing/demo-video-script.md`
- 60–90s Voice-Over + Visual-Cues
- Englisch primär, deutsche Untertitel-Notiz

---

## Konsequenzen

### Positiv
- Investor-Erlebnis ist poliert und professionell
- Alle Pitch-Touchpoints sind testbar und dokumentiert
- i18n-Komplettheit für DE+EN

### Negativ
- Pitch-Dashboard enthält Mock-Daten → muss klar als Demo gelabelt sein
- Walkthrough-Tour kann als aufdringlich empfunden werden → skip always possible

---

## Offene Punkte

- [ ] Demo-Video aufnehmen (Lou oder AI-Voice)
- [ ] PDF-Pitch-Deck erstellen (Design-Tool)
- [ ] Lee's Mail-Adresse für Magic-Link hinterlegen
- [ ] Lighthouse-Budget nach vollständigem Build verifizieren
