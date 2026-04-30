# ELBTRONIKA – Projekt Status (live)

> **Single Source of Truth.** Lou + alle AI-Agenten lesen diese File zuerst.
> **Pflichtaktion vor jeder Session:** Lese diese File. Aktualisiere nach jedem Phasen-Schritt.
> **Letztes Update:** 2026-04-30 (Copilot — Session 4: Phase 18+19 typecheck clean, both branches pushed to origin)

---

## 🚦 Quick-Glance Ampel

| Phase | Titel | Status | Owner | Letzter Stand |
|---|---|---|---|---|
| 0 | Rechtliches & UG | 🟡 läuft | Lou | UG Gründung gestartet, Stripe KYC tbd |
| 1 | Repo & Tooling | ✅ done | Copilot | v0.1.0 |
| 2 | Design System | ✅ done | Copilot | v0.2.0 |
| 3 | Infrastruktur (Supabase/R2/Sanity/Netlify) | ✅ done | Copilot | v0.3.0 |
| 4 | Auth & Roles | ✅ done | Copilot | v0.4.0 |
| 5 | Content Model & CMS | ✅ done | Copilot | v0.5.0 |
| 6 | Classic Mode (Shop) | ✅ done | Sonnet 4.6 | v0.6.0 — Shop/Artist/DJ/Cart implementiert |
| 7 | Immersive Mode (3D) | ✅ done | Sonnet 4.6 | v0.7.0 — packages/three + CanvasRoot + Gallery Route |
| 8 | Spatial Audio | done | Sonnet 4.6 | feature/phase-8-audio @ e8d0892 - v0.8.0 |
| 9 | Mode Transitions | done | Sonnet 4.6 | feature/phase-8-audio @ 4ac7525 |
| 10 | Stripe Connect | done | Sonnet 4.6 | feature/phase-11-ai - v0.12.0 |
| 11 | AI-Kuration (Claude) | done | Sonnet 4.6 | feature/phase-11-ai - v0.9.0 |
| 12 | Edge & Performance | done | Sonnet 4.6 | feature/phase-11-ai - v0.10.0 |
| 13 | Compliance | done | Sonnet 4.6 | feature/phase-11-ai - v0.11.0 |
| 14 | Optimization (Recherche 29.04.2026) | ✅ done | Kimi K-NN | 10 Phasen abgeschlossen, Build 53 Pages, 102kB FLJS |
| 15 | Testing & QA | ✅ done | Kimi K-NN | 104 Tests passing, Lighthouse, ZAP, Deploy-Workflows |
| 16 | Launch | 🟡 bereit | Kimi K-NN | Lighthouse CI, ZAP, Staging/Prod Deploy, 48h Monitoring |

| **18** | **Demo-Readiness** | ✅ done | **Kimi K-2.6** | **ELT_MODE, Demo-Personas, Stripe-Demo-Layer, DemoBanner** |
| **19** | **Pitch-Polish** | ✅ done | **Kimi K-2.6** | **WalkthroughTour, Press-Kit, Pitch-Dashboard, Test-Card-Hint** |

**Legende:** ✅ done | 🟢 grün | 🟡 läuft | 🔴 blocked | 🔄 kontinuierlich | ⬜ tbd

---

## 🔄 Heutige Aktion (29.04.2026)

**Constraint:** GitHub Copilot Kontingent nur heute, morgen weg → maximal nutzen.

**Setup:** 3 parallele Copilot Chat Sessions in VS Code:
- **Session A:** Sonnet 4.6 — Architektur-lastige Aufgaben
- **Session B:** GPT 5.4 — UI/Business-Logic
- **Session C:** Codex 5.3 — Code-Scaffolding/Tests

**Workflow heute:**
1. ALLE drei Sessions starten zuerst mit Bootstrap-Prompt aus `COPILOT_PROMPTS.md` § 1.
2. Jede Session reportet zurück: was im Repo schon existiert, was fehlt.
3. Lou aktualisiert diese STATUS.md basierend auf den Reports.
4. Lou weist pro Session eine konkrete Phase zu (Prompts in `COPILOT_PROMPTS.md` § 2–4).
5. Sessions arbeiten parallel, committen häufig, pushen einzeln.

---

## 📦 Repository

- **Org:** DiggAiHH
- **Repo:** elbtronika
- **Branch:** main
- **Letzter Tag:** TBD (Lou bitte aktualisieren)
- **CI:** github.com/DiggAiHH/elbtronika/actions

---

## 📋 Was Lou heute manuell verifizieren muss (5 Min)

In VS Code in Repo-Root:
```bash
# Repo-Stand
git log --oneline -20
git status
git tag
ls apps/
ls packages/

# Was läuft schon?
pnpm dev        # läuft Next.js?
pnpm test       # gibt's Tests?
```

Das Ergebnis kurz hier in die Tabelle oben eintragen, dann sind alle Sessions auf dem gleichen Stand.

---

## ⚠️ Risiko-Register (heute)

| Risiko | Handlung |
|---|---|
| Drei Sessions schreiben gleichzeitig in selbe Files | Strikte Phase-Isolation — jede Session arbeitet nur in ihrem Verzeichnis-Scope |
| Merge-Konflikte | Sessions pushen zu Feature-Branches, nicht main |
| Sonnet 4.6 + Codex 5.3 stylen unterschiedlich | Biome-Config + Pre-Commit-Hook erzwingt Format |
| Plan-Drift | Status nach jedem Schritt updaten, nicht erst am Ende |

---

## 🎯 Phasen-Verteilungs-Vorschlag heute

Empfehlung wenn Repo (Phase 1) + Infra (Phase 3) noch nicht stehen:

| Session | Modell | Phase | Begründung |
|---|---|---|---|
| A | Sonnet 4.6 | Phase 1: Repo & Tooling | Komplex-architektonisch, Monorepo-Setup |
| B | GPT 5.4 | Phase 2: Design Tokens + Storybook | UI-Sense |
| C | Codex 5.3 | Phase 3 Vorbereitung: SQL-Migrations + Sanity Schemas | Pure Code-Generation |

Wenn Phase 1+2+3 schon stehen → siehe Phasen 4–7 Prompts in `COPILOT_PROMPTS.md`.

---

## 📖 Plan-Referenz

- Master-Plan v1.0: `ELBTRONIKA_Architekturplan_v1.0.md`
- Aktive Version v1.1: `ELBTRONIKA_Architekturplan_v1.1.md`
- Sonnet-Handover: `ELBTRONIKA_Sonnet_Handover_Prompt.md`
- Copilot-Prompts: `COPILOT_PROMPTS.md`

---

## ✏️ Update-Konvention

Nach jedem abgeschlossenen Schritt:
1. Status-Spalte oben aktualisieren.
2. Datum oben unter "Letztes Update" setzen.
3. Kurze Notiz in entsprechende Zeile.

Beispiel:
```
| 1 | Repo & Tooling | ✅ done | Sonnet | pnpm monorepo, biome, husky, ci grün, tag v0.1.0 |
```
