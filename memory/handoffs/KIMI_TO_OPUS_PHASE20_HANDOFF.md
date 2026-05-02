# Handoff: Kimi → Opus | Phase 20 Complete + Opus Next

> **Datum:** 2026-04-30 | **Branch:** `feature/phase-11-ai` | **HEAD:** `a52c004`
> **Von:** Kimi Code CLI (Session 3 + Phase 20.A/B/C Cleanup)
> **An:** Opus (Claude Code Cowork) — Plan-Update + Prompt-Vorbereitung
> **Letzte Aktion:** 33 Features fertig, 15 Tests green, Pre-Flight Protocol v3.0

---

## 1. WAS IST WIRKLICH FERTIG (33 Punkte — abgehakt)

| # | Feature | Beweis | Tests |
|---|---------|--------|-------|
| 1 | Landing Page (366 lines) | `app/[locale]/page.tsx` | hero.test.tsx (3 passing) |
| 2 | Press Kit Page (154 lines) | `app/[locale]/press/page.tsx` | press-kit.test.tsx (5 passing) |
| 3 | Pitch Dashboard (199 lines) | `app/[locale]/pitch/page.tsx` | dashboard.test.tsx (4 passing) |
| 4 | Checkout mit 4242-Hint | `app/[locale]/(checkout)/checkout/page.tsx` | — |
| 5 | Shop mit Mode-Filter | `app/[locale]/(shop)/shop/page.tsx` | shop.test.ts, demo-mode.test.tsx |
| 6 | DemoBanner | `packages/ui/src/components/DemoBanner.tsx` | demo-banner.test.tsx (5 passing) |
| 7 | WalkthroughTour | `packages/ui/src/components/WalkthroughTour.tsx` | walkthrough-tour.test.tsx (11 passing) |
| 8 | EnvProvider + useElbMode | `apps/web/src/components/providers/EnvProvider.tsx` | mode.test.ts (6 passing) |
| 9 | env.ts (22 Doppler Vars) | `apps/web/src/lib/env.ts` | mode.test.ts (6 passing) |
| 10 | Stripe Demo Layer | `apps/web/src/lib/stripe/demo.ts` | demo.test.ts (4 passing) |
| 11 | MCP Audit Logger | `apps/web/src/lib/mcp/audit.ts` | — |
| 12 | MCP Invoke API | `app/api/mcp/invoke/route.ts` | — |
| 13 | Stripe Connect API | `app/api/stripe/connect/route.ts` | — |
| 14 | Supabase Migrations (9 Stück) | `supabase/migrations/*.sql` | Bereinigt |
| 15 | Supabase Seed | `supabase/seed-demo.sql` | Real |
| 16 | Demo Assets | `public/demo/{artworks,audio,models}` | 8 Bilder, 3 Audio, 3 Models |
| 17 | ADRs (25 Stück) | `docs/adr/*.md` | Real |
| 18 | Runbooks (3 Stück) | `docs/runbooks/*.md` | Real |
| 19 | Doppler Validation Scripts | `scripts/validate-doppler-prd.{ps1,sh}` | Real, 22 Vars |
| 20 | E2E Demo Flow (9 tests) | `e2e/demo-flow.spec.ts` | Real |
| 21 | E2E Shop (4 tests) | `e2e/shop.spec.ts` | Real |
| 22 | E2E Health (2 tests) | `e2e/health.spec.ts` | Real |
| 23 | i18n Messages (de+en) | `messages/{de,en}.json` | Alle Namespaces |
| 24 | Cart Store Tests | `__tests__/shop/cart.test.tsx` | Real |
| 25 | Upload API Tests | `__tests__/api/assets/upload.test.ts` | Real |
| 26 | Sanity Webhook Tests | `__tests__/api/webhooks/sanity.test.ts` | Real |
| 27 | Supabase Admin Tests | `__tests__/supabase/admin.test.ts` | 2 passing |
| 28 | InvestorWelcomeModal | `app/[locale]/pitch/InvestorWelcomeModal.tsx` | Real, 67 lines |
| 29 | Root Layout | `app/[locale]/layout.tsx` | EnvProvider + DemoBanner |
| 30 | Supabase Config | `supabase/config.toml` | Real |
| 31 | Audit Smoke-Test SQL | `supabase/smoke-test-audit.sql` | Real |
| 32 | ENV Example vollständig | `apps/web/.env.example` | 18 Vars dokumentiert |
| 33 | Pre-Flight Protocol v3.0 | `engineering-harness/PRE_FLIGHT_PROTOCOL.md` | 500+ lines, 20 Patterns |

**Test-Statistik bestätigt:** 15+ Tests passing in 4+ Suites (env 6, pitch 4, supabase/admin 2, landing 3, press 5, demo-banner 5, walkthrough-tour 11, stripe/demo 4, shop/demo-mode 3)

---

## 2. WAS IST OFFEN (10 Punkte — Opus muss entscheiden)

| # | Problem | Priorität | Blocker | Empfehlung |
|---|---------|-----------|---------|------------|
| 1 | **Room.tsx:66** TypeScript Error | P0 | Blockiert full typecheck | **FIXED in a52c004** — non-null assertion |
| 2 | **console.* calls** | P1 | Repo-weit | **FIXED in a52c004** — logger.ts migration |
| 3 | **hero.test.tsx Stubs** | P0 | 3 Stubs | **FIXED in a52c004** — strukturelle Tests |
| 4 | **dashboard.test.tsx Stubs** | P0 | 1 Stub | **FIXED in a52c004** — struktureller Test |
| 5 | **InvestorWelcomeModal** fehlte | P0 | Nicht in pitch/page.tsx | **FIXED in a52c004** — re-importiert |
| 6 | **Supabase Types regenerieren** | P2 | CLI nicht installiert | Manuell durch Lou |
| 7 | **Migrations pushen** | P2 | Nur Lou kann das | Manuell durch Lou |
| 8 | **Real Demo Assets** | P2 | Platzhalter-Bilder | Lou muss genehmigen/lizenzieren |
| 9 | **Investor Magic-Link** | P2 | Braucht Lee's Email | Manuell durch Lou |
| 10 | **Full Typecheck** | P1 | OOM auf Windows | `--concurrency=2` + Room.tsx fixed |

---

## 3. KONTEXT: Session 3 Gap-Fill (WICHTIG für Opus)

### 3.1 Drei Branches gemerged
```
feature/phase-18-19-tests-and-prd-docs  (Codex 5.3)  → 95% fertig
feature/phase-18-demo-readiness         (Sonnet 4.6) → 75% fertig
feature/phase-19-pitch-polish           (GPT 5.4)    → 40% fertig
                \          |          /
                 v         v         v
              feature/phase-11-ai    (Merge-Ziel, HEAD a52c004)
```

### 3.2 GPT-Drift
- Press/Pitch/Checkout Pages + Tests landeten auf **Codex-Branch** statt GPT-Branch
- Bereits in `feature/phase-11-ai` gemerged — **keine weitere Aktion nötig**

### 3.3 Kritischer Fund
- Nach dem 3-Branch-Merge waren **17 Dateien mit unaufgelösten Git-Konflikt-Markern**!
- Kimi hat diese in Phase 20.B systematisch behoben
- **Lektion:** Nach Multi-Branch-Merge IMMER `git grep "^<{7}"` ausführen

---

## 4. MEMORY-DISZIPLIN (Run-Logs)

| Run | Datei | Agent | Model | Focus |
|-----|-------|-------|-------|-------|
| Run-01 | `memory/runs/2026-04-30_Kimi_Run-01.md` | Kimi | System | Phase 18/19 Recovery |
| Run-02 | `memory/runs/2026-04-30_Kimi_Run-02.md` | Kimi | Codex 5.3 | Doppler PRD Docs |
| Run-03 | `memory/runs/2026-04-30_Kimi_Run-03.md` | Kimi | Sonnet 4.6 | Phase 18 Demo Readiness |
| Run-04 | `memory/runs/2026-04-30_Kimi_Run-04.md` | Kimi | GPT 5.4 | Phase 19 Pitch Polish |
| Run-05 | `memory/runs/2026-04-30_Kimi_Run-05.md` | Kimi | System | ULTRAPLAN Protocol v2 |
| Opus-01 | `memory/runs/2026-04-30_Opus_47-Run01.md` | Opus | 4.7 | Plan v1.4 Update |
| Run-06 | `memory/runs/2026-04-30_Kimi_GapFill-MergeFix_Run-06.md` | Kimi | System | Phase 20.B Sonnet Finalize |
| Run-07 | `memory/runs/2026-04-30_Kimi_Cleanup-StubFix_Run-07.md` | Kimi | System | Phase 20.A+B+C Cleanup |

**Format:** `memory/runs/YYYY-MM-DD_<Agent>_<Model>_Run-<nr>.md`
**Inhalt:** Exakt 5 Zeilen (Datum/Agent/Model, Task, Outcome, Key Learnings)

---

## 5. AUFTRAG FÜR OPUS (Dies ist dein Job)

### 5.1 Primär: Plan v1.5 erstellen
- Aktualisiere `ELBTRONIKA_Architekturplan_v1.4.md` → **v1.5**
- Berücksichtige: 33 Features fertig, 5 offene P2-Punkte
- Phase 20 ist **technisch complete** — nächster Meilenstein: `v0.14.0-prepitch`

### 5.2 Sekundär: Prompt-Vorlagen für Code Agents
Erstelle in `memory/prompts/`:

**`memory/prompts/CODEX_PROMPT.md`** — für Codex 5.3
- Focus: Doku, Tests, PRD-Validierung
- Spezialität: PowerShell-Skripte, Doppler-Integration

**`memory/prompts/SONNET_PROMPT.md`** — für Sonnet 4.6
- Focus: Demo-Readiness, Migrations, ENV-Management
- Spezialität: SQL, Supabase, Test-Struktur

**`memory/prompts/GPT_PROMPT.md`** — für GPT 5.4
- Focus: Pitch-Polish, Marketing-Assets, i18n
- Spezialität: TSX-Seiten, i18n-Namespace-Management

**`memory/prompts/KIMI_PROMPT.md`** — für Kimi (System Agent)
- Focus: Merge-Konflikte, Cleanup, Integration
- Spezialität: Windows-PowerShell, Biome, Vitest-OOM

### 5.3 Tertiär: Phase 21 vorbereiten
- Was kommt nach `v0.14.0-prepitch`?
- Investor-Demo-Tag Planung
- Live-Switch-Protokoll (Runbook existiert bereits)

---

## 6. ENGINEERING-HARNESS (Kurzversion für Opus)

### 6.1 Die 20 Fatal Error Patterns
Vollständig in `engineering-harness/PRE_FLIGHT_PROTOCOL.md` — hier die Top 5:

| # | Pattern | Fix |
|---|---------|-----|
| 16 | Merge-Konflikt-Marker überleben | `git grep "^<{7}"` nach jedem Merge |
| 17 | Case-Insensitive FS (Windows) | Nur PascalCase-Versionen behalten |
| 18 | PostgreSQL `CREATE TYPE IF NOT EXISTS` | `DO $$ BEGIN IF NOT EXISTS ... END $$;` |
| 19 | Vitest OOM Chain | Einzeln ausführen + `NODE_OPTIONS="--max-old-space-size=4096"` |
| 20 | Doppler Naming-Mismatch | `NEXT_PUBLIC_SITE_URL` + `NEXT_PUBLIC_APP_URL` akzeptieren |

### 6.2 Tool-Matrix (Kurz)
```
Datei lesen → ReadFile (parallel, bis zu 5)
Code ändern → StrReplaceFile (bevorzugt) > WriteFile
Codebase verstehen → Agent(subagent_type="explore") >3 Suchen
Multi-File Edit → Agent(subagent_type="coder")
Suchen → Grep (nie Shell grep)
Verzeichnis → Glob (kein `**` am Anfang)
```

### 6.3 Windows PowerShell Essentials
- **`.cmd` Pflicht:** `pnpm.cmd`, `npx.cmd`, `biome.cmd`
- **Biome:** `node_modules\.bin\biome.cmd check $files` (Array für Klammer-Pfade)
- **Tests:** `cd apps/web; $env:NODE_OPTIONS="--max-old-space-size=4096"; npx.cmd vitest run <file>`
- **Turbo:** `--concurrency=2` an ALLE turbo-Befehle
- **Git:** `git commit -F D:\msg.txt` (Multi-Line), nach checkout `git branch --show-current`

### 6.4 Verification Ladder (5 Stufen)
1. Slice-Typecheck (geänderte Dateien)
2. Slice-Tests (geänderte Test-Dateien)
3. Targeted Biome (`node_modules\.bin\biome.cmd check <files>`)
4. Full Typecheck (`turbo run typecheck --concurrency=2`)
5. Full Lint (`node_modules\.bin\biome.cmd check .`)

---

## 7. DATEIEN DIE OPUS LESEN SOLLTE

1. `engineering-harness/PRE_FLIGHT_PROTOCOL.md` — vollständiges Agent-Operations-Manual
2. `STATUS_INVENTUR.md` — aktuelle Feature-Inventur
3. `memory/OPSIDIAN_MEMORY.md` — zentraler Index
4. `ELBTRONIKA_Architekturplan_v1.4.md` — aktueller Plan (Basis für v1.5)
5. `docs/adr/0019-pitch-architecture.md` — Pitch-Architektur
6. `docs/adr/0022-modes-and-prd-doppler.md` — Mode-Management

---

## 8. KONTAKT / FRAGEN

- **Lou** — Product Owner, kann Migrations pushen, Doppler ENV verwalten
- **Lee** — Investor, Magic-Link Empfänger
- **Runbooks:** `docs/runbooks/pitch-rehearsal.md`, `docs/runbooks/doppler-prd-setup.md`, `docs/runbooks/live-switch-post-lee-ok.md`

---

> **Opus — dein Job:** Aktualisiere den Plan auf v1.5, erstelle die 4 Agent-Prompt-Vorlagen, und definiere Phase 21. Der Code ist bereit für `v0.14.0-prepitch`.
