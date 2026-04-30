# ELBTRONIKA – Copilot Prompt Pack · Session 3 (Demo-Readiness + Pitch)

> **Datum:** 2026-04-30
> **Strategie:** Pitch-First — Demo-Mode-Layer + Pitch-Polish, Live-Switch deferred bis Lee-OK
> **Plan-Referenz:** `ELBTRONIKA_Architekturplan_v1.2.md`
> **Voraussetzung:** GitHub Copilot Quota verfügbar (Reset 04.05.2026)

## Globale Constraints (alle drei Sessions)

- **Plan-Files:** `ELBTRONIKA_Architekturplan_v1.md`, `_v1.1.md`, `_v1.2.md` (alle drei lesen)
- **Status:** `STATUS.md` ist Single Source of Truth — vor + nach Session updaten
- **Shell:** `pnpm.cmd`, `npx.cmd` (Windows)
- **Run-Log:** Pflicht in `memory/runs/2026-04-30_<MODEL>.md`, max 5 Zeilen pro Prompt
- **Workflow:** Sub-Plan zuerst → STOP → "GO"-Wartephase → autonom bis DoD
- **Validierung:** engster testbarer Slice via `pnpm.cmd --filter @elbtronika/<package>`
- **Branch-Gate:** `git status -sb` + `git log --oneline -10` vor Implementation
- **Exklusiv-Scope:** jede Session hat eigene Verzeichnisse (siehe pro Prompt)

---

## § A — Sonnet 4.6 · Phase 18 (Demo-Readiness) + Trust-Residuals

**Branch:** `feature/phase-18-demo-readiness` (NEU, von aktueller `feature/phase-11-ai`)
**Eigentum:** `apps/web/src/lib/env.ts` (NEU), Stripe-Mock-Layer, Demo-Persona-Seed, Demo-Banner-Komponente, Trust-Residuals (Audit-DB, Migrations, SR-Key)

```
=== SONNET 4.6 :: SESSION 3 :: PHASE 18 + TRUST-RESIDUALS ===

KONTEXT (PFLICHT-LESE-SEQUENZ):
1. STATUS.md (live)
2. ELBTRONIKA_Architekturplan_v1.md (Master)
3. ELBTRONIKA_Architekturplan_v1.1.md (i18n + MCP-Map)
4. ELBTRONIKA_Architekturplan_v1.2.md (Demo-Mode-Strategie — KERN dieser Session)
5. OPUS_47_HANDOVER.md Section 0 (Trust-Residuals als Sub-Prompt 0.3)
6. engineering-harness/HERMES_TRUST_HARNESS.md

GIT-GATE:
> git status -sb
> git log --oneline -10
> git branch --show-current

BRANCHING:
> git checkout feature/phase-11-ai
> git pull
> git checkout -b feature/phase-18-demo-readiness

ARBEITSPAKET (zwei Teile):

== TEIL 1: Trust-Residuals abräumen (von OPUS_47_HANDOVER § 0.3) ==

A1. Audit-DB-Table aktivieren (Wave 1 final):
✓ supabase/migrations/20260430_mcp_audit_log.sql:
  create table mcp_audit_log (
    id uuid primary key default gen_random_uuid(),
    actor_id uuid references auth.users(id),
    role text not null,
    server text not null,
    tool text not null,
    status text not null check (status in ('ok','denied','error')),
    duration_ms int,
    error_class text,
    request_hash text,
    created_at timestamptz default now()
  );
  alter table mcp_audit_log enable row level security;
  create policy "service-role only" on mcp_audit_log for all using (auth.role() = 'service_role');
✓ apps/web/src/lib/mcp/audit.ts: zweite Implementation hinter Feature-Flag MCP_AUDIT_DB=true; console.log bleibt als Fallback
✓ Test: invoke-Route triggert mit ENV=true → DB-Row vorhanden

A2. Migrations applizieren auf Doppler dev:
✓ pnpm.cmd supabase db push (gegen Dev-Project)
✓ Verify: pnpm.cmd supabase migration list zeigt agent_tasks + orders_session_id + mcp_audit_log als applied

A3. Service-Role-Key für account/delete:
✓ apps/web/src/lib/supabase/admin.ts mit SUPABASE_SERVICE_ROLE_KEY
✓ Doppler dev/preview: SR-Key gesetzt verifizieren
✓ Negativ-Test schreiben: ohne SR-Key → 500 mit klarer Fehlermeldung

== TEIL 2: Phase 18 Demo-Readiness ==

B1. ENV-Layer:
✓ apps/web/src/lib/env.ts (NEU):
  - typed Env mit Zod
  - ELT_MODE: 'demo' | 'staging' | 'live' (default 'demo')
  - validation at startup, throws if missing in non-demo modes
  - export both server- and client-safe subsets

B2. Mode-Provider für Client:
✓ apps/web/src/components/providers/EnvProvider.tsx (RSC → Client-Hydration)
✓ useElbMode() Hook in apps/web/src/lib/hooks/

B3. Stripe-Demo-Layer:
✓ apps/web/src/lib/stripe/demo.ts (NEU):
  - 5 Mock-Connected-Account-IDs (test-mode-Stripe-erstellt)
  - Mock-Persona-Mapping: artistId → connectedAccountId
  - createDemoCheckoutSession(artworkId): wraps echten Code, fügt Mock-AccountId ein
✓ apps/web/app/api/stripe/connect/route.ts: erkenne ELT_MODE='demo' → return Mock-Onboarding-Stub statt echter KYC-Session

B4. Demo-Persona-Seed:
✓ supabase/seed-demo.sql (NEU, idempotent ON CONFLICT):
  - 5 Demo-Artists (Mira Volk, Kenji Aoki, Helena Moraes, Theo Karagiannis, Sasha Wren)
  - 3 Demo-DJs (Lior K., Nightform, Velvetrace)
  - 3 Demo-Rooms (Lobby, Neon-Hall, Quiet-Garden)
  - 8 Demo-Artworks mit isDemo=true Flag (NEUES Spaltenfeld erforderlich!)
  - alle Demo-Artworks: connectedAccountId aus B3
✓ Migration: alter table artworks add column is_demo boolean not null default false;
✓ Sanity Schemas: artwork erweitern um isDemo: boolean
✓ packages/sanity-studio/seed-demo.ts: Sanity-Studio mit Demo-Documents befüllen

B5. Demo-Content-Assets:
✓ public/demo/artworks/*.jpg (8 Stück, 1200×1800, AI-generiert oder lizenzfrei, klar als Demo markiert)
✓ public/demo/models/*.glb (Stub-Models, Low-Poly Cubes oder Drei-Drei-Examples)
✓ public/demo/audio/*.m3u8 (Mock-HLS-Manifeste, 30s-Loop OR royalty-free Sample-Streams)
✓ Doku in docs/demo-assets-license.md: woher kommt jedes Asset, welche Lizenz

B6. Demo-Banner-UI:
✓ packages/ui/src/components/DemoBanner.tsx (NEU):
  - position: fixed, bottom-right, z-50
  - text: "Demo Environment · v0.X" + Info-Icon
  - Tooltip: "This is a fully-functional pitch demo. Real launch coming soon."
  - Render-Conditional: nur wenn ELT_MODE === 'demo'
  - Staging-Variante: oranger Banner top, "Internal Staging — Not Public"
  - Live: kein Banner

B7. Filter-Logik im Shop:
✓ apps/web/app/[locale]/(shop)/shop/page.tsx:
  - liest ELT_MODE
  - mode === 'demo': zeige NUR isDemo=true Artworks
  - mode === 'live': zeige NUR isDemo=false Artworks
  - mode === 'staging': zeige beide

B8. Tests:
✓ pnpm.cmd --filter @elbtronika/web test -- __tests__/env/
  - Mode-Switching-Tests
  - Stripe-Demo-Layer-Tests (Mock-Account-Mapping)
✓ pnpm.cmd --filter @elbtronika/web test -- __tests__/shop/demo-mode.test.tsx
✓ E2E Playwright: kompletter Demo-User-Flow (browse → artwork → checkout-test-card → success)

B9. ADRs:
✓ docs/adr/0014-trust-residuals.md (Section 0.3 aus Handover als ADR)
✓ docs/adr/0018-demo-mode-architecture.md (Phase 18 als ADR)

DOD KOMBINIERT:
- Trust-Residuals A1+A2+A3 grün
- ELT_MODE-Schalter funktional
- Demo-Persona-Seed lädt Sanity + Supabase idempotent
- Demo-Banner sichtbar in 'demo'-Mode
- Shop filtert korrekt nach Mode
- E2E Demo-User-Flow grün
- pnpm.cmd --filter @elbtronika/web typecheck grün
- pnpm.cmd --filter @elbtronika/contracts typecheck grün
- ADR 0014 + 0018 geschrieben
- Run-Log memory/runs/2026-04-30_Sonnet-46.md (5 Zeilen pro Prompt)
- Tag v0.13.0-demo vorbereitet (NICHT pushen ohne Lou's GO)

KONFLIKT-PRÄVENTION:
- Exklusiver Scope: apps/web/src/lib/env.ts, apps/web/src/lib/stripe/demo.ts, apps/web/src/lib/mcp/audit.ts, apps/web/src/lib/supabase/admin.ts, packages/ui/src/components/DemoBanner.tsx, supabase/migrations/20260430_*, supabase/seed-demo.sql, public/demo/, docs/adr/0014, docs/adr/0018
- NICHT anfassen: andere Branch-Files (Pitch-Polish ist GPT, Tests sind Codex)

WORKFLOW-MODUS:
1. Run-Log starten
2. Sub-Plan TodoList (Teil 1 und 2)
3. STOP, "GO Phase 18 + Trust-Residuals" abwarten
4. NACH GO: autonom bis DoD
5. Bei Stripe-Mock-Account-Frage (welche Test-Account-IDs nehmen): Lou kurz fragen, ich helfe Stripe MCP zu nutzen

OUTPUT:
- Sub-Plan, dann STOP
- Pro Major-Step: Diff-Summary
- Final: PR feat/phase-18-demo-readiness gegen feature/phase-11-ai (draft)
=== ENDE ===
```

---

## § B — GPT 5.4 · Phase 19 (Pitch-Polish)

**Branch:** `feature/phase-19-pitch-polish` (NEU, von `feature/phase-11-ai`)
**Eigentum:** Landing-Page, Walkthrough-Tour, Press-Kit-Page, Pitch-Dashboard für Lee

```
=== GPT 5.4 :: SESSION 3 :: PHASE 19 PITCH-POLISH ===

KONTEXT:
1. STATUS.md
2. ELBTRONIKA_Architekturplan_v1.2.md (Section 3: Pitch-Polish detailliert)
3. ELBTRONIKA_Architekturplan_v1.1.md (i18n)
4. CLAUDE.md (Brand-Stil, dark/club/minimal)

ZIEL Phase 19:
ELBTRONIKA für Investor-Pitch zu Lee Hoops vorbereiten. 5-Minuten-Pitch-Choreografie aus Plan v1.2 § 3.1 abbilden.

BRANCHING:
> git checkout -b feature/phase-19-pitch-polish feature/phase-11-ai

DELIVERABLES:

C1. Landing-Page Refinement (apps/web/app/[locale]/page.tsx):
✓ Hero-Animation: full-bleed dark background, audio-reactive subtle motion
✓ USP statement (DE primär + EN Toggle): "Where art meets frequency"
✓ Sound-Toggle prominent
✓ "Enter Experience"-CTA → unlockt AudioContext + navigiert zu /gallery
✓ Sekundärer CTA "View Catalog" → /shop
✓ Subtiler "Demo Environment"-Hint kompatibel mit Banner aus Phase 18

C2. Walkthrough-Tour:
✓ packages/ui/src/components/WalkthroughTour.tsx (NEU):
  - 5 Steps: Welcome → 3D-Navigation → Audio-Proximity → Artwork-Detail → Checkout
  - persistent dismiss via localStorage (key: 'elt-tour-dismissed')
  - skippbar
  - DE + EN i18n
✓ Auto-Start bei erstem Besuch (mit Delay 2s nach Audio-Unlock)
✓ Re-Trigger via Footer-Link "Take the tour"

C3. Press-Kit-Page (apps/web/app/[locale]/press/page.tsx):
✓ Vision-Statement (Plan v1.0 Sektion Vision)
✓ Roadmap-Visualization: Phase 1-21 als Timeline (kompakt, nur Highlights)
✓ Team-Section (MVP: Lou's Founder-Story, Platzhalter für künftige)
✓ Numbers-Section (Mocks im Demo-Mode):
  - "5 launch artists, 3 audiovisual DJs, 8 unique drops"
  - "60/20/20 Revenue Split, transparent"
  - "Privacy by Architecture, GDPR-ready"
✓ Demo-Video-Embed-Slot (URL als ENV)
✓ Press-Contact: hallo@elbtronika.de
✓ Download-Link für PDF-Pitch-Deck (Optional, Stub mit "coming soon")

C4. Pitch-Dashboard für Lee (apps/web/app/[locale]/pitch/page.tsx):
✓ Login-only (role-gated, Custom-Role 'investor' in Supabase)
✓ Read-only Dashboards:
  - Mock-Sales-Volume-Chart (Demo-Daten)
  - Artist-Onboarding-Pipeline (Mock 5 Künstler verschiedene Stadien)
  - AI-Kuration-Mock-Cost (Anthropic-Estimate)
  - Trust-Audit-Log-Sample (letzte 50 MCP-Calls)
✓ "Test the Checkout"-Button → eingebettet 4242-Card-Hint

C5. Stripe-Test-Card-Hint:
✓ Im Checkout-Flow für ELT_MODE === 'demo': subtiler Hinweis "Use card 4242 4242 4242 4242 with any future date and any CVC."

C6. Investor-Login-Flow:
✓ Magic-Link an Lee's Mail-Adresse
✓ Bei Erst-Login: Auto-Welcome-Modal "Hi Lee, welcome to ELBTRONIKA. Take the tour or explore freely."
✓ Role 'investor' in profiles-Tabelle (Migration)

C7. i18n:
✓ Alle neuen Strings in messages/de.json + messages/en.json
✓ Press-Kit + Pitch-Dashboard primary in EN (Investor-Sprache)

C8. Tests:
✓ pnpm.cmd --filter @elbtronika/web test -- __tests__/landing __tests__/press __tests__/pitch
✓ E2E: Walkthrough-Tour 5 Steps, Pitch-Dashboard-Login, Press-Kit-Render
✓ Lighthouse Pitch-Pages: Performance ≥ 90, a11y ≥ 95

C9. Demo-Video-Skript (docs/marketing/demo-video-script.md):
✓ 60-90s Skript (Voice-Over + Visual-Cues)
✓ Englisch primär, deutsche Untertitel-Notiz
✓ Open-End: Lou kann selbst recorden mit Loom oder ähnlich

C10. ADR docs/adr/0019-pitch-architecture.md

DOD PHASE 19:
- Landing-Page poliert, Hero performant
- Walkthrough-Tour 5 Steps grün
- Press-Kit live
- Pitch-Dashboard für 'investor'-Role gegated und gefüllt mit Mock-Daten
- Stripe-Test-Card-Hint im Demo-Mode sichtbar
- Lighthouse-Budget gehalten
- Demo-Video-Skript als Doku vorhanden
- ADR 0019 geschrieben

KONFLIKT-PRÄVENTION:
- Exklusiver Scope: apps/web/app/[locale]/page.tsx, /press/, /pitch/, packages/ui/src/components/WalkthroughTour.tsx, messages/, docs/marketing/, docs/adr/0019
- NICHT anfassen: Stripe-Demo-Layer (Sonnet), Demo-Banner (Sonnet), packages/three, packages/audio

WORKFLOW-MODUS:
1. Run-Log: memory/runs/2026-04-30_GPT-54.md
2. Sub-Plan
3. STOP, "GO Phase 19" abwarten
4. NACH GO: autonom bis DoD
5. Bei Lee-spezifischen Inhalts-Fragen (was Lee sehen soll): Lou fragen

OUTPUT:
- Sub-Plan, STOP
- Iterativ, Diff-Summary pro Sektion
- Final: PR feat/phase-19-pitch-polish gegen feature/phase-11-ai (draft)
=== ENDE ===
```

---

## § C — Codex 5.3 · Tests + Doppler-prd-Setup-Doku + Cleanup

**Branch:** `feature/phase-18-19-tests-and-prd-docs` (NEU, von `feature/phase-11-ai`)
**Eigentum:** E2E-Tests für Demo-Flow, Pitch-Probelauf-Skript, Doppler-prd-Schritt-für-Schritt-Anleitung, README-Update, Cleanup von Drift

```
=== CODEX 5.3 :: SESSION 3 :: TESTS + DOPPLER-PRD-DOKU + CLEANUP ===

KONTEXT:
1. STATUS.md
2. ELBTRONIKA_Architekturplan_v1.2.md (insb. § 4 Live-Switch + § 9 Doppler-Strategie)
3. OPUS_47_HANDOVER.md (Section 0 Drift-Audit)

ZIEL:
Test-Coverage für Demo-Mode-Flow, sauberes Run-Through-Skript für Pitch, vollständige Doppler-prd-Befüllungs-Dokumentation, Drift-Cleanup.

BRANCHING:
> git checkout -b feature/phase-18-19-tests-and-prd-docs feature/phase-11-ai

DELIVERABLES:

D1. Cleanup Plan-File-Naming (Drift aus Handover § 0.2):
✓ git mv ELBTRONIKA_Architekturplan_v1.0.md ELBTRONIKA_Architekturplan_v1.md  (FALLS BEIDE VARIANTEN EXISTIEREN)
✓ Wenn nur eine: prüfen welche tatsächlich Inhalt hat, ggf. nichts tun
✓ Alle Verweise in STATUS.md, OPUS_47_HANDOVER.md, COPILOT_PROMPTS*.md auf v1.md updaten

D2. Tag-Cleanup:
✓ git tag --list zeigt aktuell: v0.6.0..v0.12.0 (nicht-monoton verteilt auf Branches)
✓ Annotated-Rename statt Delete: für alle vorhandenen Tags Annotation hinzu mit Phase-Bezug
  Beispiel:
  > git tag -a v0.9.0-mode-transitions <sha-of-old-v0.9.0-on-phase-8-branch> -m "Mode Transitions"
  > git tag -d v0.9.0
✓ Skript für Lou: docs/git-tags-cleanup.sh (NICHT auto-ausführen, nur dokumentieren)

D3. E2E-Tests Demo-Mode-Flow (apps/web/e2e/demo-flow.spec.ts):
✓ Step 1: Landing → Click "Enter Experience" → AudioContext entriegelt
✓ Step 2: 3D-Galerie lädt, FPS > 30 nach 5s
✓ Step 3: Annähern an Artwork → Audio-Stream startet (mock HLS)
✓ Step 4: Click Artwork → Detail-Page, Story sichtbar
✓ Step 5: Click "Acquire Artwork" → Checkout
✓ Step 6: Stripe Test-Card 4242…
✓ Step 7: Success-Page, Download-Code generiert
✓ Step 8: Stripe-Test-Mode-Dashboard (manuell, dokumentiert) zeigt Transfer-Group + 2 Transfers

D4. Pitch-Probelauf-Skript (docs/runbooks/pitch-rehearsal.md):
✓ Lou's Pre-Pitch-Checkliste (15 Min vorher)
✓ Lee's Erlebnis-Choreografie aus Plan v1.2 § 3.1
✓ Was Lou sagen sollte / was demonstriert wird
✓ Backup-Plan wenn Audio nicht startet (Browser-spezifisch)
✓ Backup-Plan wenn 3D-Performance schwach (Lite-Mode-Toggle)

D5. Doppler-prd-Befüllungs-Anleitung (docs/runbooks/doppler-prd-setup.md):
✓ Prerequisites:
  - Doppler Account (Lou's Login)
  - Project 'elbtronika' bereits vorhanden
  - Environments dev, preview, prd vorhanden
✓ Schritt-für-Schritt mit Screenshots (Platzhalter, real Lou füllt):
  1. Login → Project elbtronika → Environment prd
  2. Pro Variable Eintrag (mit Wert-Quelle und Bemerkung):
     - ELT_MODE = "demo" (initial; "live" beim Switch)
     - SUPABASE_URL = aus Supabase-Dashboard prd-Project Settings → API
     - SUPABASE_ANON_KEY = aus Supabase prd Settings
     - SUPABASE_SERVICE_ROLE_KEY = aus Supabase prd Settings (KRITISCH: nur server-side nutzen)
     - STRIPE_SECRET_KEY = sk_test_... (Demo-Phase) → später sk_live_...
     - STRIPE_PUBLISHABLE_KEY = pk_test_... → später pk_live_...
     - STRIPE_WEBHOOK_SECRET = whsec_test_... → später whsec_live_...
     - STRIPE_CONNECT_REDIRECT_URL = https://elbtronika.art/onboarding/stripe/callback
     - SANITY_PROJECT_ID = aus Sanity-Dashboard
     - SANITY_DATASET = production (wenn separater Sanity-Project) oder demo
     - SANITY_API_TOKEN = aus Sanity Tokens
     - SANITY_WEBHOOK_SECRET = self-generated (32+ Zeichen)
     - CLOUDFLARE_R2_ACCOUNT_ID = aus CF-Dashboard
     - CLOUDFLARE_R2_ACCESS_KEY_ID = aus CF R2 API Tokens
     - CLOUDFLARE_R2_SECRET_ACCESS_KEY = idem
     - CLOUDFLARE_R2_BUCKET = elbtronika-assets-prd
     - CLOUDFLARE_R2_PUBLIC_URL = https://cdn.elbtronika.art
     - ANTHROPIC_API_KEY = aus Anthropic Console (separater Prod-Key empfohlen)
     - RESEND_API_KEY = aus Resend
     - SENTRY_DSN = aus Sentry-Project
     - NEXT_PUBLIC_SITE_URL = https://elbtronika.art
     - MCP_AUDIT_DB = "true"
  3. Sync nach Netlify Deploy-Context "prd"
  4. Sync nach GitHub Actions DOPPLER_TOKEN_PRD
  5. Verify: Netlify-Build picks up env, Test-Deploy zeigt korrekte Mode
✓ Validation-Skript (Bash + PowerShell) das alle ENV-Vars im Doppler-prd-Environment auf Vorhandensein prüft

D6. Live-Switch-Choreografie-Skript (docs/runbooks/live-switch-post-lee-ok.md):
✓ Detaillierter 15-Minuten-Plan aus Plan v1.2 § 4
✓ Pro Schritt: exakter Befehl, expected Output, Rollback-Schritt
✓ Smoke-Test-Suite post-Switch

D7. README-Update:
✓ Section "Modes (demo/staging/live)" erklären
✓ Quick-Start für neue Devs: pnpm.cmd install + doppler login + doppler setup --project elbtronika --config dev + pnpm.cmd dev
✓ Test-Befehle pro Slice
✓ Trouble-shooting: häufige Probleme (Docker fehlt, Doppler-Token expired)

D8. ADR docs/adr/0020-modes-and-prd-doppler.md

DOD:
- File-Drift bereinigt (oder dokumentiert wenn nicht behebbar)
- E2E demo-flow.spec.ts grün auf CI
- Pitch-Rehearsal-Skript geschrieben + von Lou approved
- Doppler-prd-Setup-Anleitung komplett mit allen ENV-Vars
- Live-Switch-Skript komplett mit Rollback
- README + ADR 0020

KONFLIKT-PRÄVENTION:
- Exklusiver Scope: apps/web/e2e/, docs/runbooks/, docs/git-tags-cleanup.sh, README.md, docs/adr/0020
- NICHT modifizieren: src-Code in apps/web (das ist Sonnet/GPT)

WORKFLOW-MODUS:
1. Run-Log: memory/runs/2026-04-30_Codex-53.md
2. Sub-Plan
3. STOP, "GO Tests + PRD-Doku" abwarten
4. NACH GO: autonom bis DoD

OUTPUT:
- Sub-Plan, STOP
- Iterativ
- Final: PR feat/phase-18-19-tests-and-prd-docs gegen feature/phase-11-ai
=== ENDE ===
```

---

## § D — Coordinator-Notes für Lou (Session 3)

### D.1 Branch-Topologie
```
main (v0.5.0) ← merge target nach Pitch-OK
  └── feature/phase-11-ai (alle Phase 6-13+Trust)
        ├── feature/phase-18-demo-readiness          ← Sonnet 4.6 (Phase 18 + Trust-Residuals)
        ├── feature/phase-19-pitch-polish            ← GPT 5.4 (Pitch + Lee-Dashboard)
        └── feature/phase-18-19-tests-and-prd-docs   ← Codex 5.3 (Tests + Doppler + Cleanup)
```

Alle Sub-PRs gegen `feature/phase-11-ai`, NICHT main. Final-Merge nach Lee-OK.

### D.2 Merge-Reihenfolge (kritisch)
1. **Codex zuerst** — Cleanup + Doppler-Doku (keine Code-Konflikte mit anderen)
2. **Sonnet zweitens** — Phase 18 + Trust-Residuals (definiert ELT_MODE-Layer und Demo-Banner, GPT braucht das)
3. **GPT zuletzt** — Phase 19 baut auf ELT_MODE auf

### D.3 Pitch-Termin-Vorbereitung
Sobald alle drei PRs gemergt sind in `feature/phase-11-ai`:
1. Lou + Opus: gemeinsame Chrome-MCP-Session für Doppler-prd-Befüllung (30 Min)
2. Pitch-Probelauf intern (Lou testet als wäre er Lee, 15 Min)
3. Bei Bedarf: Korrektur-Sub-Sprint
4. Pitch zu Lee
5. Bei Lee-OK → Live-Switch-Skript

### D.4 Run-Log-Format (verbindlich)
```
# memory/runs/2026-04-30_<MODEL>.md

## Run NN — <Titel>
- Phase: <X>
- Was: <1 Satz>
- Tests: <grün/rot/skipped + filter>
- Branch: <name>
- Commit: <sha>
```

### D.5 Wenn Sonnet/GPT/Codex driftet
Drift-Signale + Eingriff identisch zu Session 2 § D.4 in `PROMPTS_SESSION2_2026-04-29.md`.

### D.6 Architektur-Frage-Routing
Wenn ein Modell auf eine Frage stößt, die nicht in v1.0/v1.1/v1.2 steht:
1. Modell stoppt, formuliert Frage
2. Lou pasted Frage in Opus-Session (hier)
3. Opus liefert Patch-Text + Plan-v1.3-Update
4. Lou pasted zurück

### D.7 Doppler-prd-Session — wann + wie
Lou's F7-Antwort lautete "mach das selbst mit Headless Browser". Strategie-Update aus Plan v1.2 § 9:
- **Jetzt nicht** — keine Live-Keys vorhanden, prd-Befüllung wäre redundant zu dev
- **Phase 19.5 (kurz vor Pitch)** — gemeinsame Chrome-MCP-Session: Lou loggt sich in Doppler ein (Login bleibt dein), Opus klickt durch ENV-Setup mit den Demo-Werten
- **Phase 20 (post-Lee-OK)** — Lou tauscht Werte auf Live (allein, mit Skript aus Codex-Output § C D6)

Sag Bescheid, wann du die Phase-19.5-Session machen willst.

### D.8 Was Lou parallel admin-mäßig machen sollte
Auch wenn Phase 0 deferred ist: einige Items sind nicht-blockierend und sollten parallel laufen, weil sie Vorlauf brauchen:
- ✅ Domains sichern (elbtronika.de/.com/.art) — kann jetzt
- ✅ Markenrecherche DPMA + EUIPO starten — kann jetzt
- ✅ UG-Gründung (online-Notar) — kann jetzt, dauert 2-4 Wochen
- ✅ Stripe-KYC-Antrag stellen mit aktuellen Daten — kann jetzt, dauert 5-10 Werktage
- ⏸ Anwalt-Termin für AGB/Datenschutz — kann jetzt buchen, Review erst post-Lee-OK
- ⏸ Künstler-Verträge unterzeichnen — pre-Vereinbarungen jetzt, Final-Verträge post-Lee-OK

So ist beim Live-Switch fast alles vorbereitet.

---

**Ziel der Session 3:** in 5-7 Tagen Pitch-Ready für Lee Hoops. Trust-Boundaries scharf, Demo-Layer professionell, Investor-Erlebnis poliert, Doppler-prd auf Stand-by für 15-Min-Live-Switch.
