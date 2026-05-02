# ELBTRONIKA – Architektur- und Ausführungsplan v1.2

> **Stand:** 2026-04-30 (Lou's strategische Drehung: Pitch-First, Live-Second)
> **Vorgänger:** v1.0 + v1.1 (Master-Architektur weiterhin gültig)
> **Status:** PLAN — ergänzt v1.0/v1.1 um Demo-Mode-Strategie und Pitch-to-Lee-Milestone
> **Begleitdokumente:** `OPUS_47_HANDOVER.md`, `PROMPTS_SESSION3_2026-04-30.md`

---

## Changelog v1.1 → v1.2

| Aspekt | v1.1 | v1.2 |
|---|---|---|
| Launch-Modell | linear: alle Phasen → Public Launch | **2-stufig: Pitch-Demo zu Lee Hoops → Lee-OK → Regulatorik → Public Launch** |
| Phase 0 (rechtlich) | Block für Phase 10 | **deferred bis nach Lee-OK**; alle Hooks im Code vorbereitet, Schalter ist ein einzelnes ENV-Var |
| Stripe-Modus | Test-Mode bis Phase 15 | **Test-Mode + realistischer Mock-Connected-Account-Layer** für Demo, Live erst nach Lee-OK + KYC |
| Künstler/DJ-Content | echte Verträge → echter Content | **Demo-Persona-Layer (5 Künstler + 3 DJs als realistische Profile)**, später durch echte ersetzt |
| Doppler `prd` Befüllung | bei Public Launch mit Live-Keys | **bei Pitch-Readiness mit Demo-Test-Keys**, Live-Tausch ist 15-Minuten-Operation post-Lee-OK |
| Trust-Boundaries (Hermes) | Production-Voraussetzung | **bleiben aktiv auch im Demo-Mode** — auditierbares System ist Teil des Pitch-Wertes |
| Phasen-Nummerierung | 1-15 | 1-13 (Build) + 14 Optimization + 15 Testing + 16 Launch + 17 Hermes Trust + **18 Demo-Readiness + 19 Pitch + 20 Live-Switch** |

---

## 1. Strategische Neuausrichtung: Pitch-First-Architektur

### 1.1 Warum diese Drehung
Bisher war der Plan: rechtliche Voraussetzungen (UG, Stripe-KYC, Anwalt) blockieren technische Live-Phasen. Lou hat den Druck erkannt, dass wir **vor** der regulatorischen Schwerstarbeit erst einen Investor (Lee Hoops) überzeugen müssen. Der Investor ist nicht an Compliance-Dokumenten interessiert, sondern am **funktionierenden Erlebnis**.

Konsequenz: Die letzten 5% des Wegs zum Live-Launch (Live-Stripe-Keys, echte Künstler-Verträge, Anwalt-Reviews) werden **post-Lee-OK** gemacht. Vorher müssen 95% in einem Zustand sein, der Lee zeigt: "Das hier ist Production-Quality, es fehlt nur die regulatorische Schicht."

### 1.2 Drei Architektur-Modi

| Modus | ENV `ELT_MODE` | Use-Case | Daten | Stripe | Konsequenz |
|---|---|---|---|---|---|
| **demo** | `demo` | Pitch zu Lee, interne Tests | Seeded Demo-Personas (5 Artists, 3 DJs, 8 Artworks) | Test-Mode + Mock-Connected-Accounts | UI zeigt subtilen `Demo Environment`-Indikator |
| **staging** | `staging` | Internes QA + Smoke vor Switch | Mix Demo + erste echte Künstler (sobald Verträge da) | Test-Mode + Real-Connected-Accounts | Login-only, nicht öffentlich |
| **live** | `live` | Public Launch | Nur echte Künstler, echte Verkäufe | Live-Mode | volle Compliance, alle DSGVO-Pflichten greifen |

Der **Schalter zwischen den Modi ist ein einziges ENV-Var** in Doppler. Code-Pfade sind alle identisch — was sich ändert sind:
- API-Keys (Stripe, ggf. Anthropic)
- Datenbank-Seeds
- Banner-Sichtbarkeit
- Webhook-Endpoint-Targets
- Compliance-Strenge (z.B. Consent-Banner UI-Text)

### 1.3 Pitch-zu-Lee-Hoops-Roadmap (neue Top-Priorität)

| Phase | Status | Aufwand | Ergebnis |
|---|---|---|---|
| 18 — Demo-Readiness | ⬜ tbd | 2-3 Tage | ELT_MODE-Schalter, Mock-Layer, Demo-Content-Seed, Trust-Residuals abräumen |
| 19 — Pitch-Polish | ⬜ tbd | 1-2 Tage | Landing-Page-Refinement, Walkthrough-Tour, Press-Kit, optional Demo-Video |
| 19.5 — Doppler `prd` Befüllung | ⬜ tbd | 30 Min | gemeinsame Chrome-MCP-Session (Lou+Opus) für sauberes Setup |
| 19.9 — Pitch-Probelauf | ⬜ tbd | 30 Min | Komplettes End-to-End-Testing aus Lee's Perspektive |
| **MILESTONE: Lee-OK** | 🎯 | — | — |
| 20 — Live-Switch (post-Lee) | 🔒 blocked | 1 Tag | KYC abschließen, Verträge unterzeichnen, Live-Keys, Mode-Wechsel |
| 21 — Public Launch | 🔒 blocked | 1 Tag | DNS, Hypercare, Marketing-Push |

---

## 2. Demo-Mode-Layer (Phase 18) — detaillierte Architektur

### 2.1 Feature-Flag-Mechanismus
- Doppler-ENV: `ELT_MODE = demo | staging | live`
- Zugriff via `apps/web/src/lib/env.ts` (typed, validated mit Zod)
- Server-Components lesen direkt aus `process.env`
- Client-Components erhalten Mode via einem `<EnvProvider>` (RSC → Hydration)

### 2.2 Stripe-Demo-Layer
- **Connected Accounts:** statt echter KYC → 5 Test-Connected-Accounts pro Persona, von Stripe Test-Mode automatisch verifiziert
- **Webhook-Endpoint:** Test-Mode-Webhooks gehen an `/api/stripe/webhook` (gleicher Code-Pfad)
- **Transfer-Logik:** funktioniert identisch, Geld-Bewegung in Test-Mode-Stripe-Dashboard sichtbar — verifizierbar für Lee
- **Demo-Test-Cards:** in der Pitch-Demo verwendet, klar als Test markiert (`4242 4242 4242 4242`)

### 2.3 Demo-Persona-Seed
Realistische Demo-Personas, die ELBTRONIKA's Niveau zeigen, ohne echte Künstler zu kompromittieren:

```
Demo-Artists (5):
- "Mira Volk" — Berlin-based abstract digital painter (Demo)
- "Kenji Aoki" — Tokyo, post-cyberpunk visuals (Demo)
- "Helena Moraes" — São Paulo, glitch art (Demo)
- "Theo Karagiannis" — Athens, mediterranean futurism (Demo)
- "Sasha Wren" — London, dark surrealism (Demo)

Demo-DJs (3):
- "Lior K." — minimal techno (Demo)
- "Nightform" — ambient + breakbeat (Demo)
- "Velvetrace" — house + downtempo (Demo)

Demo-Artworks (8): jeweils mit echtem (lizenzfreiem oder AI-generiertem mit klarer Demo-Markierung) Bild, mock 3D-Modell (.glb), HLS-Audio-Stream-Stub
Demo-Rooms (3): Lobby, Neon-Hall, Quiet-Garden
```

Wichtig: Alle Demo-Inhalte sind **klar als Demo gekennzeichnet** in Sanity (`isDemo: true`-Feld), sodass beim Live-Switch ein simpler Filter alles ausblendet.

### 2.4 Demo-Banner-UI
Subtiler aber sichtbarer Indikator unten rechts: `Demo Environment · v0.X` mit kleinem Info-Icon → Tooltip erklärt Investoren, dass es sich um eine voll-funktionale Pitch-Demo handelt.
Im **staging**-Mode: oranger Banner mit "Internal Staging — Not Public".
Im **live**-Mode: kein Banner.

### 2.5 Trust-Boundaries bleiben aktiv
Hermes-Trust-Waves 0–8 sind **im Demo-Mode genauso scharf** wie im Live-Mode. Auditierbar zu sein ist Teil des Investor-Pitches: "Wir sind nicht nur fertig, wir sind compliant von Tag eins."

---

## 3. Pitch-Polish (Phase 19) — was Lee sehen wird

### 3.1 Erlebnis-Choreografie (5-Minuten-Pitch)
1. **0:00–0:30** — Landing-Page öffnet, ambient Audio startet bei Klick
2. **0:30–1:30** — Walkthrough-Tour startet automatisch (skippbar): "Welcome to ELBTRONIKA. Here's how art and sound merge."
3. **1:30–3:00** — Lee navigiert die 3D-Galerie, hört die Spatial Audio
4. **3:00–4:00** — Lee wählt ein Artwork, sieht die Story, hört das volle Set, sieht den Kauf-Flow
5. **4:00–4:30** — Lee macht einen Test-Kauf mit `4242…`, sieht den Split (60/20/20) im Stripe-Dashboard
6. **4:30–5:00** — Press-Kit-Slide: Vision, Roadmap, Team, Numbers

### 3.2 Konkrete Polish-Items
- Landing-Page: Hero-Animation, klarer USP, "Enter Experience"-CTA, Sound-Toggle
- Walkthrough-Tour: Komponente in `packages/ui` mit 4-5 Schritten, persistent dismiss
- Press-Kit-Page: `/press` mit Roadmap, Team, Vision, Demo-Video-Link
- Demo-Video (optional): 60s Loom oder ähnlich, eingebettet auf Landing
- Stripe-Test-Card-Hint: subtil im Checkout für Lee

### 3.3 Stage-Architektur
Lee bekommt einen eigenen Login (`lee@hoopsventures.example` o.Ä. — Mock-Domain), seine View ist `/admin/pitch` mit allen Mock-Sales-Dashboards, Artist-Onboarding-Mock, AI-Kuration-Demo etc.

---

## 4. Live-Switch-Choreografie (Phase 20, post-Lee-OK)

Wenn Lee grünes Licht gibt, ist die folgende Operation der **15-Minuten-Switch**:

```
Schritt 1 (5 Min): Doppler `prd` updaten
  - ELT_MODE: demo → live
  - STRIPE_SECRET_KEY: sk_test_… → sk_live_…
  - STRIPE_WEBHOOK_SECRET: whsec_test_… → whsec_live_…
  - ANTHROPIC_API_KEY: dev → prod (falls separater)
  
Schritt 2 (3 Min): Sanity-Filter
  - alle isDemo:true Artworks unpublishen oder löschen
  - echte Künstler-Content publishen
  
Schritt 3 (2 Min): Stripe Webhook-Endpoint in Stripe-Dashboard auf prod-URL setzen

Schritt 4 (3 Min): Netlify Production-Promote (Deploy-Button)

Schritt 5 (2 Min): Smoke-Test
  - /shop lädt
  - Test-Kauf mit echter Karte (Lou's eigene)
  - Stripe-Live-Dashboard zeigt Transaction
  - Webhook hat Order erstellt
```

**Voraussetzung:** UG-Steuernummer da, Stripe-KYC ✅, Verträge ✅, Anwalt-Reviews ✅. Diese sind Lou's Aufgaben **post-Lee-OK** und parallel zum Schritt 1-5.

---

## 5. Aktualisierte offene Fragen für Lou

Die alten F1-F7 sind durch deine Antwort obsolet (Demo-First). Neue offene Punkte:

| # | Frage | Block für |
|---|---|---|
| G1 | Wann ist der Pitch zu Lee Hoops geplant? Datum? | Tempo der Phase 18-19 |
| G2 | Soll ich für Demo-Personas AI-generierte Artwork-Bilder vorschlagen, oder hast du lizenzfreies Material? | Phase 18 Content |
| G3 | Demo-Video für Landing — soll ich Skript schreiben oder nur als Optional markieren? | Phase 19 Polish |
| G4 | Lee bekommt eigenen Login mit Pitch-Dashboard — wie viel "Behind-the-Scenes-Daten" willst du ihm zeigen (Order-Volumen-Mocks, AI-Cost-Dashboards)? | Phase 19 Stage |
| G5 | Doppler-prd-Befüllung: machen wir das gemeinsam jetzt mit Chrome-MCP, oder wartest du bis Phase 18 fertig? | Phase 19.5 |

---

## 6. Was bleibt von v1.0 + v1.1 unverändert
- Tech-Stack (Section 2 v1.0)
- Repo-Struktur (Section 3 v1.0)
- Architektur-Prinzipien (Single Canvas, Privacy by Architecture, Deterministisches Payment)
- Phase 1-13 Implementierung
- Trust-Boundaries (Hermes)
- DoD-Pillars (Testing, Doku, Compliance, Deploy-Ready)

---

## 7. Phasen-Übersicht v1.2 (kanonisch)

| # | Titel | Stand 30.04. | v1.2-Annotation |
|---|---|---|---|
| 0 | Rechtliches | 🟡 deferred | post-Lee-OK |
| 1 | Repo & Tooling | ✅ done-on-main | — |
| 2 | Design System | ✅ done-on-main | — |
| 3 | Infrastruktur | ✅ done-on-main | — |
| 4 | Auth & Roles | ✅ done-on-main | — |
| 5 | Content Model | ✅ done-on-main | — |
| 6 | Classic Mode | ✅ branch-done | — |
| 7 | Immersive Mode | ✅ branch-done | — |
| 8 | Spatial Audio | ✅ branch-done | — |
| 9 | Mode Transitions | ✅ branch-done | — |
| 10 | Stripe Connect | ✅ branch-done | Test-Mode + Mock-Connected-Accounts |
| 11 | AI-Kuration | ✅ branch-done | — |
| 12 | Edge & Performance | ✅ branch-done | — |
| 13 | Compliance | ✅ branch-done | im Demo-Mode aktiv, im Live-Mode strenger |
| 14 | Optimization | ✅ done | Kimi K-NN |
| 15 | Testing & QA | ✅ done | 104 Tests passing |
| 16 | Launch-Prep | 🟡 ready | Workflows konfiguriert |
| 17 | Hermes Trust | ✅ done | Wave 0–8, Residuals in Phase 18 abgeräumt |
| **18** | **Demo-Readiness** | ⬜ tbd | **NEU — Top-Priorität** |
| **19** | **Pitch-Polish** | ⬜ tbd | **NEU — nach 18** |
| 19.5 | Doppler `prd` Befüllung | ⬜ tbd | gemeinsame Chrome-MCP-Session |
| 19.9 | Pitch-Probelauf | ⬜ tbd | E2E aus Lee's Perspektive |
| 🎯 | **MILESTONE: Lee-OK** | — | externe Entscheidung |
| 20 | Live-Switch | 🔒 blocked | post-Lee |
| 21 | Public Launch | 🔒 blocked | nach 20 |

---

## 8. Risiko-Register v1.2

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|
| Lee überzeugt Demo nicht | mittel | sehr hoch | Phase 19 Polish nicht skippen, Demo-Video als Backup |
| Demo-Mode-Bugs werden für Live-Bugs gehalten | mittel | hoch | klar gelabelter Demo-Banner, Lee gebriefed |
| Künstler-Akquise dauert nach Lee-OK zu lang | hoch | mittel | parallel zu Pitch-Vorbereitung Vor-Verträge mit den 3-5 Künstlern unterzeichnen |
| Stripe-KYC verzögert sich nach Lee-OK | mittel | hoch | KYC-Antrag schon jetzt einleiten, auch ohne Live-Schalt |
| Doppler prd nicht ready | niedrig | mittel | Phase 19.5 als gemeinsame MCP-Session |
| Demo-Content ist juristisch problematisch (z.B. AI-Bild ohne Lizenz) | niedrig | mittel | nur lizenzfreie / explizit AI-generierte / clearance-bestätigte Inhalte |

---

## 9. Doppler `prd` — Strategie-Update (Antwort auf F7)

Du wolltest, dass ich Doppler `prd` per Headless Browser einrichte. Das ist in dieser Demo-First-Strategie noch zu früh, weil:

1. **Es gibt noch keine Live-Keys.** Doppler `prd` würde mit denselben Test-Mode-Werten gefüllt wie `dev` — sinnlos.
2. **Doppler-Login** erfordert deine Credentials (E-Mail-Verifikation oder SSO). Ich kann das nicht solo.
3. **Der Wert** der Doppler-prd-Befüllung kommt erst, wenn echte Live-Keys da sind.

**Mein Vorschlag:**
- **Jetzt (Phase 18-19):** Doppler `dev`-Environment ist die "Demo-Environment". Sanity-Demo-Content + Stripe-Test-Keys + alle Trust-Settings.
- **Phase 19.5 (vor Pitch):** Wir machen eine **gemeinsame Chrome-MCP-Session**: Du loggst dich in Doppler ein, ich klicke durch die Setup-Schritte. Wir füllen `prd` mit den Demo-Werten als "Pitch-Environment". Dauert 30 Min.
- **Phase 20 (post-Lee-OK):** Du tauschst die Werte in `prd` auf Live (15 Min). Dann ist Public-Launch-fähig.

Wenn du das jetzt sofort gemeinsam machen willst, sag Bescheid — ich starte Chrome-MCP.

---

## 10. Was als nächstes konkret passiert

1. **Sonnet 4.6 Session:** Phase 18 (Demo-Readiness) + Trust-Residuals (siehe `PROMPTS_SESSION3_2026-04-30.md` § A) — Branch `feature/phase-18-demo-readiness`
2. **GPT 5.4 Session:** Phase 19 (Pitch-Polish) — Branch `feature/phase-19-pitch-polish`
3. **Codex 5.3 Session:** Test-Coverage für Demo-Mode + Doppler-prd-Setup-Anleitung — Branch `feature/phase-18-19-tests`
4. **Lou + Opus:** beantworte G1-G5, danach gemeinsame Chrome-MCP-Doppler-Session

Ziel: in 5-7 Tagen Pitch-Ready für Lee.
