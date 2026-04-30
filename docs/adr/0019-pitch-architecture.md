# ADR 0019 — Pitch Architecture (Phase 19)

| Feld | Wert |
|------|------|
| Status | Accepted |
| Datum | 2026-04-30 |
| Autor | Kimi K-2.6 (GPT-Workstream) |
| Betroffene Phasen | 19 |

---

## Kontext

ELBTRONIKA braucht eine polierte Investor-Erfahrung für den Pitch zu Lee Hoops. Die 5-Minuten-Choreografie muss technisch unterstützt werden.

---

## Entscheidungen

1. **Landing-Page:** USP "Where art meets frequency", prominenter Sound-Toggle, "Enter Experience"-CTA
2. **WalkthroughTour:** 5 Steps in `packages/ui`, auto-start nach Audio-Unlock, dismissible, i18n-ready
3. **Press-Kit `/press`:** Vision, Roadmap (Phase 1–21), Team (Lou's Founder-Story), Numbers (Mocks im Demo-Mode)
4. **Pitch-Dashboard `/pitch`:** Login-only via `investor`-Role, Mock-Sales-Daten, Artist-Pipeline, AI-Kosten, Audit-Sample
5. **Stripe-Test-Card-Hint:** Subtiler Hinweis im Checkout für `demo`-Mode: `4242 4242 4242 4242`
6. **Investor-Role:** Supabase `profiles.role` erweitert um `investor`, gating via Server-Component
7. **i18n:** Alle neuen Strings in `messages/de.json` + `messages/en.json`

---

## Lee's 5-Minuten-Choreografie

| Minute | Aktion | Tech-Unterstützung |
|--------|--------|-------------------|
| 0:00–0:30 | Landing öffnet, Audio startet bei Klick | Sound-Toggle, Enter-Experience-CTA |
| 0:30–1:30 | Walkthrough-Tour auto-start | WalkthroughTour Komponente |
| 1:30–3:00 | 3D-Galerie + Spatial Audio | CanvasRoot, PannerNode |
| 3:00–4:00 | Artwork-Detail + Checkout | Test-Card-Hint |
| 4:00–4:30 | Stripe-Dashboard Split | Transfer-Group Mock |
| 4:30–5:00 | Press-Kit + Pitch-Dashboard | `/press`, `/pitch` |

---

## Konsequenzen

- Investor sieht Production-Quality, nicht Slides
- Demo-Daten sind klar als Mock markiert
- `/pitch` ist role-gated → keine Daten-Lecks
