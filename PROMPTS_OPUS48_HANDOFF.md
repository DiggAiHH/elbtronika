# ELBTRONIKA – Opus 4.8 Handoff Prompts (Phase 20 Pre-Pitch-Cleanup)

> **Datum:** 2026-04-30
> **Strategie-Anker:** `ELBTRONIKA_Architekturplan_v1.3.md` (kanonische Phasen-Übersicht)
> **Aktueller Tag:** `v0.13.0-demo`
> **Branch:** `feature/phase-11-ai` @ `0a59f44`
> **Ziel:** Phase 20 (Pre-Pitch-Cleanup) abschließen, Pitch-Termin mit Lee Hoops vorbereiten
> **Sessions:** 3 parallel — Sonnet (Migrations+ENV+Types), GPT (Sanity+Profile), Codex (E2E+Tests+Doppler-Verify)

---

## Globale Constraints (alle drei Sessions)

- **Plan-Files lesen:** `ELBTRONIKA_Architekturplan_v1.md`, `_v1.1.md`, `_v1.2.md`, `_v1.3.md`
- **Status:** `STATUS.md` ist Single Source of Truth — vor + nach Session updaten
- **Pre-Flight:** `engineering-harness/PRE_FLIGHT_PROTOCOL.md` falls vorhanden (Section 3 Windows, Section 9 Commands)
- **Shell:** `pnpm.cmd`, `npx.cmd`, `git` (Windows PowerShell oder cmd, kein PowerShell-only)
- **Run-Log:** Pflicht in `memory/runs/2026-04-30_<MODEL>.md`, max 5 Zeilen pro Prompt
- **Workflow:** Sub-Plan zuerst → STOP → "GO"-Wartephase → autonom bis DoD
- **Validierung:** engster testbarer Slice via `pnpm.cmd --filter @elbtronika/<package>`
- **Branch-Gate:** `git status -sb` + `git log --oneline -10` vor jeder Implementation
- **Konflikt-Prävention:** vor `git add` zuerst `git restore --staged .`, dann gezielt nur Scope-Files stagen

---

## § Prompt A — SONNET 4.6 · Phase 20.1 + 20.2 + 20.4 (Migrations + ENV + Types)

**Branch:** `feature/phase-20-cleanup-migrations` (NEU, von `feature/phase-11-ai`)
**Eigentum:** `supabase/migrations/`, `apps/web/src/lib/supabase/admin.ts`, `apps/web/src/lib/mcp/audit.ts`, `packages/contracts/src/supabase/types.ts`, Doppler-CLI-Operationen.

```
=== SONNET 4.6 :: PHASE 20.1 + 20.2 + 20.4 :: MIGRATIONS + ENV + TYPES ===

KONTEXT (PFLICHT-LESE-SEQUENZ):
1. STATUS.md (live)
2. ELBTRONIKA_Architekturplan_v1.3.md (Section 1.2 Pre-Pitch-Phase)
3. OPUS_47_HANDOVER.md Section 0.3 (Trust-Residuals als ursprünglicher Sub-Prompt)
4. engineering-harness/PRE_FLIGHT_PROTOCOL.md falls vorhanden
5. supabase/migrations/20260430_*.sql (5 ungepushte Files)

GIT-GATE:
> git status -sb
> git log --oneline -10
> git branch --show-current

BRANCHING:
> git checkout feature/phase-11-ai
> git pull
> git checkout -b feature/phase-20-cleanup-migrations

ARBEITSPAKET (drei Tasks):

== TASK 1 — Supabase Migrations push (Phase 20.1, P0) ==

A1.1 Verify aktuelle Migrations-Lage:
> dir supabase/migrations/  (oder ls)
Erwartet: 5 Files mit Prefix 20260430_*:
  - 20260430_agent_tasks.sql
  - 20260430_orders_session_id.sql
  - 20260430_mcp_audit_log.sql
  - 20260430_demo_personas.sql
  - 20260430_investor_role.sql
Wenn weniger oder andere: STOP, an Lou reporten.

A1.2 Push gegen Doppler dev:
> doppler run --config dev -- pnpm.cmd supabase db push
Bei Konflikten: NICHT --include-all blind anwenden. Pro Migration einzeln verifizieren.

A1.3 Verify pushed:
> doppler run --config dev -- pnpm.cmd supabase migration list
Alle 5 sollten als applied erscheinen.

A1.4 Smoke-Test pro Migration (ein insert + select round-trip jeweils):
- agent_tasks: insert Test-Task, select, delete
- orders mit stripe_session_id: insert Test-Order
- mcp_audit_log: insert Test-Event mit service-role-Client
- artworks mit is_demo: insert Demo-Artwork, select where is_demo=true
- profiles mit role='investor': insert Test-Investor

A1.5 Bei Fehlern:
- Wenn migration list zeigt rollback nötig: revert per pgsql, dann fix in SQL-File, repush
- Niemals ad-hoc gegen prd-Project (Doppler Config beachten!)

== TASK 2 — Doppler dev ENV-Setup (Phase 20.2, P1) ==

A2.1 ELT_MODE setzen:
> doppler secrets set ELT_MODE=demo --config dev

A2.2 MCP_AUDIT_DB setzen:
> doppler secrets set MCP_AUDIT_DB=true --config dev

A2.3 Verify ENV-Bezug in Code:
- apps/web/src/lib/env.ts liest ELT_MODE — Default sollte 'demo' sein, aber explizites Setting bevorzugen
- apps/web/src/lib/mcp/audit.ts liest MCP_AUDIT_DB — Feature-Flag aktiviert DB-Insert statt nur console.log

A2.4 Smoke-Test lokal:
> doppler run --config dev -- pnpm.cmd --filter @elbtronika/web dev
- Startet ohne ENV-Validierungs-Fehler
- Demo-Banner sichtbar in Browser
- Audit-Log-Test: ein MCP-Call → Row in mcp_audit_log

== TASK 3 — Supabase types regenerieren (Phase 20.4, P1) ==

A3.1 Project-ID herausfinden:
> doppler secrets get SUPABASE_PROJECT_REF --config dev --plain

A3.2 Types generieren:
> doppler run --config dev -- pnpm.cmd supabase gen types typescript --project-id <PROJECT_REF> > packages/contracts/src/supabase/types.ts

A3.3 `as any`-Casts cleanen:
- grep -r "as any" apps/web/src/lib/mcp/audit.ts
- grep -r "as any" apps/web/src/lib/supabase/
- Pro Cast: ersetzen durch korrekten Type aus regeneriertem types.ts
- Wenn Type fehlt: prüfen ob Migration-Push erfolgreich war (sonst Spalte fehlt im Type)

A3.4 Typecheck-Gate:
> pnpm.cmd --filter @elbtronika/contracts typecheck
> pnpm.cmd --filter @elbtronika/web typecheck
Beide MÜSSEN grün sein. Sonst NICHT mergen.

A3.5 Tests grün:
> pnpm.cmd --filter @elbtronika/web test
> pnpm.cmd --filter @elbtronika/contracts test

== TASK 4 — SR-Key Negativ-Test (Bestätigung) ==

Service-Role-Key wurde laut TASKS.md verifiziert. Sicherheits-Re-Check:

A4.1 Negativ-Test schreiben (apps/web/__tests__/admin/sr-key.test.ts):
- Mock Supabase-Client mit anon-Key
- /api/account/delete aufrufen
- Erwartung: 500 mit Fehlermeldung enthält "service-role required"

A4.2 Test laufen lassen:
> pnpm.cmd --filter @elbtronika/web test -- __tests__/admin/

DOD KOMBINIERT:
- 5 Migrations applied auf dev (smoke-getestet)
- ELT_MODE + MCP_AUDIT_DB in Doppler dev gesetzt
- Supabase types.ts regeneriert, alle as-any-Casts entfernt
- Typecheck + Test grün auf @elbtronika/web und @elbtronika/contracts
- SR-Key Negativ-Test grün
- Run-Log memory/runs/2026-04-30_Sonnet-46-phase-20.md
- Tag v0.13.1-cleanup vorbereitet (NICHT pushen ohne Lou's GO)

KONFLIKT-PRÄVENTION:
- Exklusiver Scope: supabase/migrations/, packages/contracts/src/supabase/types.ts, apps/web/src/lib/mcp/audit.ts, apps/web/src/lib/supabase/admin.ts, apps/web/__tests__/admin/
- NICHT anfassen: apps/web/app/, packages/three/, packages/audio/, packages/ui/, Sanity-Studio
- Vor `git add`: gezielt Scope-Files stagen.

WORKFLOW-MODUS:
1. Run-Log starten
2. Sub-Plan TodoList (Task 1, 2, 3, 4)
3. STOP, "GO Phase 20-Cleanup" abwarten
4. NACH GO: autonom bis DoD
5. Bei Migration-Konflikten oder Doppler-Auth-Problemen: Stop, Lou fragen

OUTPUT:
- Sub-Plan, dann STOP
- Pro Major-Step: Diff-Summary
- Final: PR feat/phase-20-cleanup-migrations gegen feature/phase-11-ai (draft)
=== ENDE ===
```

---

## § Prompt B — GPT 5.4 · Sanity Demo-Wiring + Artist/DJ Profile-Pages

**Branch:** `feature/phase-20-sanity-and-profiles` (NEU, von `feature/phase-11-ai`)
**Eigentum:** Sanity Demo-Content, `apps/web/app/[locale]/(profile)/artist/[slug]/`, `apps/web/app/[locale]/(profile)/dj/[slug]/`.

```
=== GPT 5.4 :: PHASE 20 :: SANITY DEMO-WIRING + PROFILE-PAGES ===

KONTEXT:
1. STATUS.md
2. ELBTRONIKA_Architekturplan_v1.3.md (Section 1.2 Phase 20)
3. ELBTRONIKA_Architekturplan_v1.1.md (i18n)
4. apps/web/public/demo/artworks/*.png (8 Demo-Bilder bereits algorithmisch generiert)
5. supabase/seed-demo.sql (Demo-Personas: Mira Volk, Kenji Aoki, Helena Moraes, Theo Karagiannis, Sasha Wren / Lior K., Nightform, Velvetrace)
6. packages/sanity-studio/schemas/ (artwork, artist, dj Schemas)

GIT-GATE:
> git status -sb
> git log --oneline -10

BRANCHING:
> git checkout -b feature/phase-20-sanity-and-profiles feature/phase-11-ai

DELIVERABLES:

B1. Sanity Demo-Content hochladen:
✓ Skript packages/sanity-studio/scripts/upload-demo-content.ts (NEU):
  - Liest 8 PNGs aus apps/web/public/demo/artworks/
  - Erstellt Sanity Image-Assets via @sanity/client
  - Erstellt 5 Artist-Documents, 3 DJ-Documents, 8 Artwork-Documents, 3 Room-Documents
  - Setzt isDemo=true auf allen
  - References zwischen Artworks ↔ Artists ↔ DJs ↔ Rooms korrekt
  - Idempotent (existiert? skip)
✓ Run: > doppler run --config dev -- pnpm.cmd --filter @elbtronika/sanity-studio run upload-demo
✓ Verify: Sanity Studio im Browser zeigt 8 Artworks mit isDemo

B2. Shop-Filter-Verifikation (von Phase 18 schon implementiert, jetzt mit echten Sanity-Daten testen):
✓ /de/shop in Demo-Mode: 8 Demo-Artworks sichtbar
✓ /de/shop in Live-Mode (manueller ENV-Toggle): 0 Artworks
✓ Mock-Test: ENV ELT_MODE=staging → beide sichtbar

B3. Artist Profile Pages:
✓ apps/web/app/[locale]/(profile)/artist/[slug]/page.tsx (falls noch Stub):
  - SSR aus Supabase + Sanity (Mirror-Tabelle für Schnell-Read, Sanity für Story-PortableText)
  - Hero: Porträt + Name
  - Bio (lokalisiert DE/EN)
  - Featured Artworks (von diesem Künstler, max 6)
  - Cross-Link zu DJs (mit deren Sets der Künstler verlinkt ist)
  - Social-Links wenn vorhanden
✓ 5 Routen sollten funktionieren:
  - /de/artist/mira-volk + /en/artist/mira-volk
  - /de/artist/kenji-aoki
  - /de/artist/helena-moraes
  - /de/artist/theo-karagiannis
  - /de/artist/sasha-wren

B4. DJ Profile Pages:
✓ apps/web/app/[locale]/(profile)/dj/[slug]/page.tsx:
  - Hero: Porträt + Name + Genre-Tags
  - Bio (lokalisiert)
  - Sets-Liste mit HLS-Preview-Player (NICHT spatial, simpler Audio-Element)
  - Verlinkte Artworks (welche Künstler dieser DJ vertont hat)
  - SoundCloud-Link wenn vorhanden
✓ 3 Routen:
  - /de/dj/lior-k + /en/dj/lior-k
  - /de/dj/nightform
  - /de/dj/velvetrace

B5. Cross-Links auf Artwork-Detail-Page:
✓ apps/web/app/[locale]/(shop)/shop/artwork/[slug]/page.tsx:
  - Sektion "Artist": Link zu /artist/<slug>
  - Sektion "DJ": Link zu /dj/<slug>
  - Sektion "Room": gehört zu Raum X (Link zu /gallery#room-X — anchor in Immersive)

B6. i18n:
✓ Alle Profile-Strings in messages/de.json + messages/en.json
✓ Namespace `profile.artist.*`, `profile.dj.*`

B7. SEO:
✓ Per-Profile Meta-Tags (title, description, OG-Image = portrait_url)
✓ Schema.org Person + Performance-Type-Markup
✓ hreflang DE+EN

B8. Tests:
✓ pnpm.cmd --filter @elbtronika/web test -- __tests__/profiles/
  - Render-Test pro Slug
  - Artwork-Listing pro Artist/DJ
  - Cross-Link-Verifikation
✓ E2E Playwright (passt zu Codex-Erweiterung):
  - Flow: /shop → click Artwork → click Artist → Artist-Page → click DJ → DJ-Page

B9. Lighthouse:
✓ Profile-Pages: Performance ≥ 90, SEO 100, a11y ≥ 95

B10. ADR docs/adr/0021-profile-pages.md

DOD:
- 8 Demo-Artworks in Sanity hochgeladen mit isDemo=true
- Shop filtert korrekt nach Mode
- 5 Artist-Profile + 3 DJ-Profile-Routen live (DE+EN)
- Cross-Links bidirektional (Artwork↔Artist↔DJ)
- Tests grün
- Lighthouse-Budget gehalten
- ADR 0021

KONFLIKT-PRÄVENTION:
- Exklusiver Scope: packages/sanity-studio/scripts/, apps/web/app/[locale]/(profile)/, messages/, docs/adr/0021
- NICHT anfassen: supabase/migrations/, packages/contracts/types/ (Sonnet-Branch), packages/three/, packages/audio/, /api/-Routes
- Wenn Sanity-Schema-Änderung nötig: vorher Rückfrage

WORKFLOW-MODUS:
1. Run-Log: memory/runs/2026-04-30_GPT-54-phase-20.md
2. Sub-Plan
3. STOP, "GO Sanity + Profiles" abwarten
4. NACH GO: autonom bis DoD

OUTPUT:
- Sub-Plan, STOP
- Iterativ
- Final: PR feat/phase-20-sanity-and-profiles gegen feature/phase-11-ai (draft)
=== ENDE ===
```

---

## § Prompt C — CODEX 5.3 · E2E-Erweiterung + Component-Tests + Doppler-Verify

**Branch:** `feature/phase-20-tests-and-verify` (NEU, von `feature/phase-11-ai`)
**Eigentum:** `apps/web/e2e/`, `apps/web/__tests__/components/`, `docs/runbooks/doppler-prd-setup.md`.

```
=== CODEX 5.3 :: PHASE 20 :: E2E + COMPONENT-TESTS + DOPPLER-VERIFY ===

KONTEXT:
1. STATUS.md
2. ELBTRONIKA_Architekturplan_v1.3.md
3. apps/web/e2e/demo-flow.spec.ts (8 Steps existieren)
4. packages/ui/src/components/ (WalkthroughTour, DemoBanner, PressKit-Helpers)
5. docs/runbooks/doppler-prd-setup.md (Codex Session 3 erstellt)

GIT-GATE:
> git status -sb

BRANCHING:
> git checkout -b feature/phase-20-tests-and-verify feature/phase-11-ai

DELIVERABLES:

C1. E2E demo-flow.spec.ts erweitern (von 8 → 11 Steps):
✓ Step 9: Artist-Profile-Page-Navigation
  - Auf Artwork-Detail click "Artist" link → /artist/mira-volk
  - Verify: Hero, Bio, Featured Artworks gerendert
✓ Step 10: DJ-Profile-Page-Navigation
  - Auf Artwork-Detail click "DJ" link → /dj/lior-k
  - Verify: Hero, Sets-List, HLS-Preview-Player vorhanden
✓ Step 11: Pitch-Dashboard Investor-Gate
  - Anonymer Aufruf von /pitch → 401/redirect to login
  - Login als Test-Investor → /pitch zeigt Dashboards
  - Logout als regulärer User → /pitch wieder gate
✓ Run:
> pnpm.cmd --filter @elbtronika/web test:e2e -- demo-flow.spec.ts

C2. Component Unit-Tests:
✓ apps/web/__tests__/components/WalkthroughTour.test.tsx:
  - Rendert mit 5 Steps
  - Click "Next" navigiert weiter
  - Click "Skip" setzt localStorage flag
  - Re-mount nach Skip rendert nicht erneut
  - i18n-Strings DE und EN korrekt
✓ apps/web/__tests__/components/DemoBanner.test.tsx:
  - ELT_MODE=demo → Banner sichtbar (text "Demo Environment")
  - ELT_MODE=staging → oranger Banner ("Internal Staging")
  - ELT_MODE=live → Banner nicht gerendert
  - Tooltip-Text korrekt
✓ apps/web/__tests__/components/PressKit.test.tsx:
  - Vision-Section gerendert
  - Roadmap-Timeline vorhanden
  - Numbers-Section mit Mock-Daten
  - DE und EN Inhalt unterschiedlich (i18n smoke)
✓ Run:
> pnpm.cmd --filter @elbtronika/web test -- __tests__/components/

C3. Doppler-prd-Setup-Doku Cross-Check:
✓ Lese docs/runbooks/doppler-prd-setup.md
✓ Liste alle erwarteten ENV-Variablen aus Doku
✓ Verify-Skript scripts/verify-prd-env-list.ts (NEU):
  - Liest Doppler dev-Env via CLI
  - Listet alle gesetzten Keys
  - Vergleicht gegen erwartete Liste in Doku
  - Markiert fehlende oder zusätzliche
  - Output als markdown-Tabelle für STATUS-Update
✓ Run gegen dev:
> doppler run --config dev -- node scripts/verify-prd-env-list.ts

C4. ENV-Variable-Audit:
✓ Liste in docs/runbooks/doppler-prd-setup.md erweitern um:
  - ELT_MODE (NEU)
  - MCP_AUDIT_DB (NEU)
  - SUPABASE_PROJECT_REF (für gen types)
  - DEMO_BANNER_DISABLE (optional override für Prod-Demos)

C5. Visual Regression Snapshots:
✓ apps/web/e2e/visual-regression.spec.ts:
  - Screenshot pro Route: /, /shop, /shop/artwork/[demo-slug], /artist/[demo-slug], /dj/[demo-slug], /press, /pitch (mit Test-Investor)
  - Tolerance 0.1%
  - Baseline in apps/web/e2e/snapshots/

C6. Lighthouse-CI-Erweiterung:
✓ .github/workflows/lighthouse.yml: Profile-Pages hinzu zur URL-Liste
✓ Budget: Performance ≥ 90, a11y ≥ 95, SEO 100

C7. Pitch-Probelauf-Skript-Refresh:
✓ docs/runbooks/pitch-rehearsal.md:
  - Updates: Phase-19 done, neue Profile-Pages, neue ENV-Vars
  - 5-Minuten-Demo-Choreografie aus v1.2 §3.1 reflektiert echte URLs
  - Backup-Plans (Audio failt, FPS schwach) bleiben

C8. Run-Log:
✓ memory/runs/2026-04-30_Codex-53-phase-20.md
  Format aus globalen Constraints

DOD:
- E2E demo-flow.spec.ts auf 11 Steps grün
- 3 neue Component-Unit-Tests grün
- Doppler-Verify-Skript läuft gegen dev und reportet
- Visual-Regression-Baseline gespeichert
- Lighthouse-CI deckt Profile-Pages ab
- Pitch-Rehearsal-Doku aktualisiert
- Alle Tests grün: pnpm.cmd --filter @elbtronika/web test
- Run-Log geschrieben

KONFLIKT-PRÄVENTION:
- Exklusiver Scope: apps/web/e2e/, apps/web/__tests__/components/, docs/runbooks/doppler-prd-setup.md, docs/runbooks/pitch-rehearsal.md, scripts/verify-prd-env-list.ts, .github/workflows/lighthouse.yml
- NICHT anfassen: src-Code in apps/web (das ist Sonnet/GPT)

WORKFLOW-MODUS:
1. Run-Log starten
2. Sub-Plan TodoList (C1-C8)
3. STOP, "GO Tests + Verify" abwarten
4. NACH GO: autonom bis DoD

OUTPUT:
- Sub-Plan, STOP
- Iterativ
- Final: PR feat/phase-20-tests-and-verify gegen feature/phase-11-ai (draft)
=== ENDE ===
```

---

## § Lou's Action-Items (konsolidiert für dich, kein Code)

Folgende Schritte erledigst du parallel zu den drei Sessions oben. Sie blockieren nichts, aber jeder fertig erledigt heißt eine Risiko-Karte vom Tisch.

### P0 — heute oder morgen

**1. Stripe Test-Connected-Accounts (8 Stück)** ⏱ 30 Min
- Login → `dashboard.stripe.com/test/connect/accounts`
- "Create Account" × 8 (Standard-Type, Country: Germany)
- Pro Persona ein Account:
  - Mira Volk → artist account
  - Kenji Aoki → artist account
  - Helena Moraes → artist account
  - Theo Karagiannis → artist account
  - Sasha Wren → artist account
  - Lior K. → DJ account
  - Nightform → DJ account
  - Velvetrace → DJ account
- IDs (`acct_...`) eintragen in `apps/web/src/lib/stripe/demo.ts`
- Alternative: Stripe MCP nutzen mit `stripe_api_execute` für `account.create` × 8 — wenn du willst, mach das gemeinsam mit mir

**2. Pitch-Termin mit Lee Hoops** ⏱ 15 Min
- Mail/Anruf an Lee
- Datum-Vorschlag: in 5-7 Tagen
- Notwendiger Vorlauf: 30 Min Demo + 30 Min Q&A = 1h Slot
- Calendar-Invite mit Link zum Pitch-Dashboard (URL kommt nach Phase 20.2)

**3. Demo-Artwork-Bilder Review** ⏱ 10 Min
- `apps/web/public/demo/artworks/*.png` öffnen
- Falls Niveau nicht stimmt: ersetzen durch eigene oder bessere AI-generierte
- Falls ok: dranlassen, Phase 20 ist nicht durch Bildqualität geblockt

### P1 — diese Woche

**4. UG-Eintragung treiben** ⏱ läuft
- Status mit Notar checken
- Ziel: Steuernummer da, bevor Phase 21 (Live-Switch) startet

**5. Stripe-KYC-Antrag stellen** ⏱ 30 Min
- Auch wenn UG noch nicht eingetragen: Antrag schon einleiten mit aktuellen Daten
- 5–10 Werktage Bearbeitung — fängt der Countdown jetzt schon an

**6. Domains sichern** ⏱ 15 Min
- elbtronika.de, .com, .art über Cloudflare Registrar
- Falls schon: skippen
- DNS auf Cloudflare-Nameserver

**7. Anwalt-Termin buchen** ⏱ 15 Min
- IT-Recht-Anwalt für Impressum/Datenschutz/AGB-Review
- Termin in 2 Wochen reicht — Review post-Lee-OK

### P2 — nach Lee-OK (vorbereiten, nicht ausführen)

**8. Doppler `prd` Setup** ⏱ 30 Min gemeinsam
- Wenn du bereit bist: gemeinsame Chrome-MCP-Session starten
- Du loggst dich ein, ich klicke durch alle 22 ENV-Variablen
- Skizze in `docs/runbooks/doppler-prd-setup.md`

**9. Künstler-Letter-of-Intent** ⏱ 1h pro Künstler
- Pre-Vereinbarungen mit den 3-5 Künstlern, die du schon hast
- Final-Verträge erst post-Lee-OK + Anwalt-Review

**10. Demo-Video produzieren (optional)** ⏱ 1-2h
- 60-90s Loom oder ähnlich
- Skript in `docs/marketing/demo-video-script.md`
- Embed-URL in Press-Kit

---

## § Coordinator-Notes

### Branch-Topologie nach Phase 20
```
main (v0.5.0)
  └── feature/phase-11-ai (v0.13.0-demo)
        ├── feature/phase-20-cleanup-migrations    ← Sonnet
        ├── feature/phase-20-sanity-and-profiles   ← GPT
        └── feature/phase-20-tests-and-verify      ← Codex
```

### Merge-Reihenfolge (kritisch)
1. **Sonnet zuerst** — Migrations + Types + ENV (alle anderen brauchen aktuelle Types)
2. **GPT zweitens** — Sanity-Content + Profile-Pages (Codex testet diese)
3. **Codex drittens** — E2E + Component-Tests + Doppler-Verify

Nach Phase 20 grün:
- Tag `v0.13.1-cleanup` setzen auf `feature/phase-11-ai`
- Pitch-Probelauf intern (Lou + Sonnet als "Reviewer")
- Pitch-Termin mit Lee
- Bei Lee-OK: Phase 21 Live-Switch nach Skript

### Wenn ein Modell driftet
Drift-Signale + Eingriff identisch zu Session 2/3. Klassiker:
- Modell pusht ohne Sub-Plan → "STOP, lies STATUS.md, schreib Sub-Plan, GO abwarten"
- Modell greift in fremde Verzeichnisse → Konflikt-Prävention-Block aus dem Prompt zitieren
- Modell macht "kreative" Architektur ohne ADR → ADR fordern, dann erst weiterbauen

### Architektur-Frage-Routing
Wenn ein Modell auf eine Frage stößt, die nicht in v1.0/v1.1/v1.2/v1.3 steht:
1. Modell stoppt, formuliert Frage mit Format `Frage X: ...`
2. Du paste'st in Opus-Session
3. Opus liefert Patch-Text + ggf. Plan v1.4
4. Du paste'st zurück

### Run-Log-Format (verbindlich)
```
# memory/runs/2026-04-30_<MODEL>.md

## Run NN — <Titel>
- Phase: <X>
- Was: <1 Satz>
- Tests: <grün/rot/skipped + filter>
- Branch: <name>
- Commit: <sha>
```

---

## § Was nach diesen drei Sessions passiert

**Tag X (heute):** drei Sessions starten parallel
**Tag X+1:** drei PRs gemerged in `feature/phase-11-ai`, Tag `v0.13.1-cleanup` gesetzt
**Tag X+1:** Lou's P0-Items (Stripe-Accounts, Pitch-Termin, Demo-Bilder-Review) erledigt
**Tag X+2:** Pitch-Probelauf intern (30 Min Lou + Opus)
**Tag X+3 bis X+5:** Pitch zu Lee
**Tag X+5:** Lee-OK (hoffentlich) → Phase 21 Live-Switch (15 Min Code + 1 Tag Admin)
**Tag X+6:** Public Launch oder Soft-Launch

Wenn alle Items dieser Datei abgehakt sind, ist ELBTRONIKA pitch-ready.

Los.
