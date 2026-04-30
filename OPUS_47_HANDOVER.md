# ELBTRONIKA — Opus 4.7 Handover

> **Layered handover.** Section 0 (Session 3 / Kimi K-2.6) is the current top layer. Sections 1–10 (Opus 4.6) remain valid as ground truth — read them after Section 0.
> Date: 2026-04-30 | Authors: Kimi K-2.6 (Section 0) → Opus 4.6 (Sections 1–10)
> Repo: `d:\Elbtronika\Elbtonika` (Windows) | Org: DiggAiHH/elbtronika
> Branch: `feature/phase-11-ai` @ `666bc8c` | Tag: `v0.13.0-demo`

---

## 0 · SESSION 3 LAYER — DEMO-READINESS + PITCH-POLISH + TRUST-HARDENING

### 0.1 Was passiert ist (2026-04-30, Kimi K-2.6)

3 parallele Workstreams auf `feature/phase-11-ai` abgewickelt und gemergt:

| Workstream | Branch | Agent | Deliverables |
|---|---|---|---|
| Phase 18–19 Tests & PRD-Doku | `feature/phase-18-19-tests-and-prd-docs` | Codex | E2E demo-flow.spec.ts (8 Steps), Doppler-prd runbook, live-switch script, pitch-rehearsal script, README, ADR 0020, file drift cleanup |
| Phase 18 Demo-Readiness | `feature/phase-18-demo-readiness` | Sonnet | ELT_MODE layer, EnvProvider + useElbMode, Stripe demo layer (8 mock accounts), DemoBanner, shop filtering by mode, mcp_audit_log table + dual-mode logger, demo persona seed, Sanity `isDemo`, ADR 0014 + 0018, unit tests |
| Phase 19 Pitch-Polish | `feature/phase-19-pitch-polish` | GPT | Landing refinement (USP, CTA, sound toggle), WalkthroughTour (5 steps), PressKit page, Pitch dashboard (investor-gated), Stripe test card hint, i18n DE/EN, investor role migration, demo video script, ADR 0019 |

**Merge-Reihenfolge:** Codex → Sonnet → GPT (no-ff, jeweils mit Merge-Commit). Konflikte in `invoke/route.ts` (audit module), `layout.tsx` (integrations), `STATUS.md`, `packages/ui/src/index.ts` (exports) manuell gelöst.

**Ergebnis:** Typecheck grün, 41 Unit-Tests passing, E2E-Suite erweitert. Branch force-pushed, Tag `v0.13.0-demo` annotiert + gepusht.

### 0.2 Neue Architektur-Entscheidungen (ADRs)

| ADR | Titel | Status | Autor |
|-----|-------|--------|-------|
| 0014 | Trust Residuals: Audit DB + Service-Role Key | Accepted | Sonnet 4.6 |
| 0018 | Demo-Mode Architecture (demo/staging/live) | Accepted | Sonnet 4.6 |
| 0019 | Pitch Architecture (WalkthroughTour, Press-Kit, Pitch-Dashboard) | Accepted | GPT 4.6 |
| 0020 | Modes + Doppler prd Strategy | Accepted | Codex 5.3 |

Lesen vor Änderungen: `docs/adr/0018-demo-mode.md`, `docs/adr/0019-pitch-architecture.md`, `docs/adr/0020-doppler-prd-strategy.md`.

### 0.3 ELT_MODE System

Runtime-Variable steuert Demo/Staging/Live-Verhalten:

```typescript
// apps/web/src/lib/env.ts
ELT_MODE: "demo" | "staging" | "live"  // default: "demo"
```

| Modus | Shop-Filter | Banner | Stripe |
|-------|-------------|--------|--------|
| demo | Nur `isDemo == true` | DemoBanner bottom-right teal | Test + Mock-Accounts |
| staging | Kein Filter (beides) | Staging-Banner top orange | Test + Real-Accounts |
| live | Nur `isDemo == false` | Kein Banner | Live |

Client-Zugriff:
```tsx
const mode = useElbMode();  // "demo" | "staging" | "live"
```

Server-Zugriff:
```ts
const { ELT_MODE } = getEnv();
```

### 0.4 Demo-Personas (Seed-Daten)

**Artists (5):** Mira Volk (Berlin, abstract digital), Kenji Aoki (Tokyo, post-cyberpunk), Helena Moraes (São Paulo, glitch), Theo Karagiannis (Athens, mediterranean futurism), Sasha Wren (London, dark surrealism)

**DJs (3):** Lior K. (minimal techno), Nightform (ambient + breakbeat), Velvetrace (house + downtempo)

**Rooms (3):** Lobby, Neon Hall, Quiet Garden

**Mock Stripe Connected Accounts (8):** Platzhalter in `apps/web/src/lib/stripe/demo.ts` — müssen durch echte Stripe-Test-Account-IDs ersetzt werden (`acct_1...`).

### 0.5 Trust Residuals — Stand nach Session 3

| Wave | Boundary | Status |
|------|----------|--------|
| 0 | MCP auth + role gate + tool allowlist | ✅ |
| 1 | Structured audit log → DB + console | ✅ Dual-Mode (MCP_AUDIT_DB flag) |
| 2 | Canonical `server/tool` naming | ✅ |
| 3 | `agent_tasks` DB table (durable, not in-memory) | ✅ Migration pending dev push |
| 4 | Idempotency + atomic claim lock + DB status | ✅ |
| 5 | Flow APIs return `source: "simulated"\|"measured"` | ✅ |
| 6 | `/api/analytics/vitals` gates on consent header | ✅ |
| 7 | Stripe webhook order lookup via `stripe_session_id` | ✅ Migration pending dev push |
| 8 | STATUS.md + TASKS.md updated | ✅ |

**Dual-Mode Logger:** `apps/web/src/lib/mcp/audit.ts`
- Console.log = immer aktiv (Zero-Dependency Fallback)
- DB-Insert = nur wenn `MCP_AUDIT_DB=true`
- Untyped Supabase-Insert (`as any`) um Typen-Drift zu bypassen — nach `supabase gen types` auflösen

**Service-Role-Key:** `apps/web/src/lib/supabase/admin.ts` nutzt `SUPABASE_SERVICE_ROLE_KEY` (nicht Anon-Key). Für `account/delete` und Audit-DB-Writes.

### 0.6 Pitch-Erlebnis-Choreografie (5 Min für Lee Hoops)

| Minute | Aktion | Tech |
|--------|--------|------|
| 0:00–0:30 | Landing öffnet, Audio-Unlock, USP | SoundToggle, Enter Experience CTA |
| 0:30–1:30 | WalkthroughTour auto-start (5 Steps) | WalkthroughTour, dismissible |
| 1:30–3:00 | 3D-Galerie + Spatial Audio | CanvasRoot, PannerNode |
| 3:00–4:00 | Artwork-Detail + Checkout | Test-Card-Hint: 4242 4242 4242 4242 |
| 4:00–4:30 | Stripe-Dashboard Split | Transfer-Group Mock |
| 4:30–5:00 | Press-Kit + Pitch-Dashboard | `/press`, `/pitch` (investor-gated) |

### 0.7 Neue Routen & Komponenten

**Routen:**
| Route | Zweck | Gating |
|-------|-------|--------|
| `/:locale/press` | Press-Kit (Vision, Roadmap, Team) | Öffentlich |
| `/:locale/pitch` | Investor Dashboard | `role === 'investor'` |
| `/:locale/checkout` | Checkout + Test-Card-Hint | Demo-Mode only |

**Komponenten (packages/ui):**
| Komponente | Zweck |
|------------|-------|
| `DemoBanner` | Mode-Indikator (demo/staging/live), fixed position |
| `WalkthroughTour` | 5-Step Onboarding, auto-start, skip/dismiss, i18n |

**Provider (apps/web):**
| Provider | Zweck |
|----------|-------|
| `EnvProvider` | ELT_MODE server→client Hydration via `window.__ELT_ENV__` |
| `useElbMode()` | Hook liest Modus client-seitig |

### 0.8 Migrations (Supabase — NOCH NICHT auf dev gepusht)

| Datei | Inhalt | Blockiert auf |
|-------|--------|---------------|
| `20260430_agent_tasks.sql` | Durable Agent Tasks (Wave 3+4) | `supabase db push` |
| `20260430_orders_session_id.sql` | `stripe_session_id` für Webhook-Lookup | `supabase db push` |
| `20260430_mcp_audit_log.sql` | Audit-Tabelle + RLS + service-role policy | `supabase db push` |
| `20260430_artworks_is_demo.sql` | `is_demo` Spalte + Index | `supabase db push` |
| `20260430_investor_role.sql` | `investor` Role in profiles | `supabase db push` |

**Wichtig:** Nach `db push` → `pnpm supabase gen types typescript` ausführen, um `packages/contracts/src/supabase/types.ts` zu regenerieren. Die manuellen Patches (`agent_tasks`, `orders.stripe_session_id`, `artworks.is_demo`, `profiles.role`) werden dann automatisch korrekt.

### 0.9 Runbooks (neu in Session 3)

| Runbook | Zweck | Pfad |
|---------|-------|------|
| Pitch-Rehearsal | Lou's 5-Minuten-Script | `docs/runbooks/pitch-rehearsal.md` |
| Doppler prd Setup | 22 ENV-Variablen + Validation | `docs/runbooks/doppler-prd-setup.md` |
| Live-Switch post-Lee-OK | 15-Minuten Live-Switch | `docs/runbooks/live-switch-post-lee-ok.md` |
| Git Tags Cleanup | Annotated Tag-Migration | `docs/git-tags-cleanup.sh` |
| Demo Assets License | Asset-Quellen + Lizenz | `docs/marketing/demo-assets-license.md` |
| Demo Video Script | 60–90s Voice-Over | `docs/marketing/demo-video-script.md` |

### 0.10 Test-Coverage nach Session 3

**Unit Tests (41 passing):**
- `__tests__/env/mode.test.ts` — ELT_MODE Validation
- `__tests__/stripe/demo.test.ts` — Mock-Account-Mapping
- `__tests__/shop/demo-mode.test.tsx` — Shop-Filter-Logik
- `__tests__/landing/hero.test.tsx` — Placeholder
- `__tests__/press/press-kit.test.tsx` — Placeholder
- `__tests__/pitch/dashboard.test.tsx` — Placeholder

**E2E Tests:**
- `e2e/demo-flow.spec.ts` — 8-Step Investor Flow (Landing → Gallery → Shop → Detail → Checkout → Success → Tour → PressKit)
- `e2e/shop.spec.ts` — Bestehend
- `e2e/health.spec.ts` — Bestehend

### 0.11 Offene Punkte (Session 3 → Opus 4.7)

| Prio | Punkt | Owner | Blocker |
|------|-------|-------|---------|
| P0 | Supabase Migrations auf dev pushen | Opus/Sonnet | Doppler dev Zugriff |
| P0 | Demo-Artwork-Bilder (8 Stück) generieren | Lou / Design | Asset-Quellen |
| P0 | Stripe Test-Connected-Accounts (8) erstellen + IDs updaten | Lou | Stripe-KYC noch nicht fertig → Mock-IDs reichen für Demo |
| P1 | Doppler dev: `ELT_MODE=demo` + `MCP_AUDIT_DB=true` setzen | Opus/Sonnet | Doppler dev Zugriff |
| P1 | Doppler prd: 22 ENV-Variablen füllen (runbook vorhanden) | Lou + Opus | Live-Keys nicht vor Lee-OK |
| P1 | Supabase types regenerieren nach Migration-Push | Sonnet | Migrations müssen applied sein |
| P1 | Pitch-Termin mit Lee Hoops terminieren | Lou | — |
| P2 | Demo-Video (60–90s) produzieren | Lou | Script vorhanden |
| P2 | `packages/contracts/src/supabase/types.ts` — `as any` casts entfernen | Sonnet | Nach type regeneration |

### 0.12 Was Opus 4.7 als nächstes machen sollte

1. **Read:** Dieser Handover (Section 0), dann STATUS.md, TASKS.md, ADRs 0014/0018/0019/0020.
2. **Verify-Pass:** `git status -sb`, `git log --oneline -20`, `git branch --show-current`, `git tag`.
3. **Lou abholen** mit Status-Bericht (max 150 Wörter): Was seit v0.13.0-demo passiert ist / nächster empfohlener Schritt / Blocker.
4. **Migrations pushen** (P0): `pnpm supabase db push` für alle 5 Migrations auf dev.
5. **Doppler dev konfigurieren** (P0): `ELT_MODE=demo`, `MCP_AUDIT_DB=true`.
6. **Supabase types regenerieren** nach erfolgreichem Push.
7. **ADR 0021** schreiben: "Session 3 Integration — 3-Workstream Merge Pattern" (optional, für Dokumentation).

### 0.13 Konflikt-Prävention für zukünftige Sessions

- **Exklusiver Scope pro Session:** Siehe `PROMPTS_SESSION3_2026-04-30.md`
- **Merge-Reihenfolge:** Codex → Sonnet → GPT (bewährt in Session 3)
- **Branch-Gate:** `git status -sb` + `git log --oneline -10` vor jeder Implementation
- **Status-Update:** STATUS.md nach jedem Schritt aktualisieren
- **Typecheck:** `pnpm --filter @elbtronika/web typecheck` vor jedem Commit
- **Keine Cross-Branch-Edits:** Ein File nur von einem Agenten gleichzeitig bearbeitet

---

> **Folgende Sektionen 1–10 sind das Original-Handover von Opus 4.6 vom 2026-04-30. Bleiben gültig als Detail-Grundlage für Architektur-Entscheidungen.**

---

## 1 · YOU ARE OPUS — ROUTING RULES

```
Opus role  → Strategy, architecture escalation, ADR decisions, unblocking agents.
Sonnet role → Implementation, file edits, tests, commits.
You do NOT write code unless the task has zero ambiguity AND fits in <50 lines.
When done: hand back a next-prompt block for Sonnet (or whichever agent fits).
```

**Escalate to you when:**
- Architectural trade-off with no clear answer in plan v1.1
- Trust/legal/compliance question (DSGVO, Stripe, GEMA)
- Multi-agent routing decision needed
- Something is blocked and Sonnet couldn't resolve after 2 retries

---

## 2 · PROJECT SNAPSHOT (2026-04-30)

**ELBTRONIKA** = immersive 3D art gallery + spatial audio + classic e-commerce.
Revenue: 60% artist / 20% DJ / 20% platform. Solo dev: Lou.

### Phase Status (authoritative: `STATUS.md`)

| # | Phase | Status |
|---|-------|--------|
| 0–5 | Legal, Repo, Design, Infra, Auth, CMS | ✅ done |
| 6 | Classic Mode Shop | ✅ v0.6.0 |
| 7 | Immersive 3D (R3F/WebGPU) | ✅ v0.7.0 |
| 8 | Spatial Audio | ✅ v0.8.0 |
| 9 | Mode Transitions (1200ms) | ✅ v0.9.0 |
| 10 | Stripe Connect | ✅ v0.12.0 |
| 11 | AI Curation (Claude) | ✅ v0.9.0 |
| 12 | Edge & Performance | ✅ v0.10.0 |
| 13 | Compliance/DSGVO | ✅ v0.11.0 |
| 14 | Optimization | ✅ Build 53 pages, 102kB FLJS |
| 15 | Testing & QA | ✅ 104 tests pass, Lighthouse CI, ZAP |
| 16 | Launch | 🟡 ready — Lighthouse CI, staging/prod deploy, 48h monitoring |
| 18 | Demo-Readiness | ✅ v0.13.0-demo |
| 19 | Pitch-Polish | ✅ v0.13.0-demo |

### Active Branch
```
main ← merge target
feature/phase-11-ai ← last major feature branch @ 666bc8c, tag v0.13.0-demo
```

---

## 3 · HERMES TRUST — WHAT JUST HAPPENED

All 8 waves from `engineering-harness/HERMES_TRUST_HARNESS.md` implemented today (2026-04-30):

| Wave | Boundary | Status |
|------|----------|--------|
| 0 | MCP auth + role gate + allowlist | ✅ |
| 1 | Structured audit log (actorId, role, server, tool, status, duration) | ✅ Dual-Mode |
| 2 | Canonical `server/tool` naming at invoke boundary | ✅ |
| 3 | `agent_tasks` DB table — durable, not in-memory | ✅ Migration pending |
| 4 | Idempotency + atomic claim lock + DB status on complete/fail | ✅ |
| 5 | Flow APIs return explicit `source: "simulated"\|"measured"` | ✅ |
| 6 | `/api/analytics/vitals` gates on consent header; client checks localStorage | ✅ |
| 7 | Stripe webhook order lookup fixed (`stripe_session_id` stored + queried) | ✅ Migration pending |
| 8 | STATUS.md + TASKS.md updated | ✅ |

### Residual Risks → Your First Decision Point

| Risk | Action needed |
|------|--------------|
| Audit events → console.log only when MCP_AUDIT_DB=false | DB table exists, migration pending push. Set MCP_AUDIT_DB=true after push. |
| 5 pending migrations not applied | `20260430_*.sql` → `supabase db push` auf dev |
| `account/delete` needs service-role key | Confirm env var; service-role ≠ anon key. Verified in admin.ts. |

---

## 4 · TECH STACK (frozen, no upgrades without ADR)

| Layer | Tech | Version |
|-------|------|---------|
| Frontend | Next.js App Router | 15.3.0 |
| React | React | 19.1.0 |
| Styling | Tailwind v4 | `@theme {}` — no `tailwind.config.js` |
| 3D | Three.js r184, R3F v9, Drei v10 | WebGPURenderer + WebGL2 fallback |
| Audio | Web Audio API + PannerNode + hls.js v1.6+ | Web Worker for HLS |
| State | Zustand v5 + TanStack Query v5 | |
| DB/Auth | Supabase (Postgres 16, pgvector, RLS, EU-Frankfurt) | |
| Payments | Stripe Connect — Separate Charges and Transfers | Test mode until Phase 15 |
| CMS | Sanity v4 + Embedded Studio | |
| Storage | Cloudflare R2 | `cdn.elbtronika.art` |
| Lint | Biome v2 | no Prettier, no ESLint |
| Build | Turborepo + pnpm workspaces | |
| Deploy | Netlify (web) + Sanity.io (cms) | |
| Secrets | Doppler | |

---

## 5 · REPO STRUCTURE (key paths only)

```
apps/web/          → Next.js 15 frontend
apps/cms/          → Sanity Studio v3
packages/ui/       → @elbtronika/ui (Radix + CVA)
packages/contracts/→ Zod schemas + Supabase types
packages/three/    → R3F 3D canvas system
packages/audio/    → Spatial audio engine
packages/ai/       → Claude curation API
packages/flow/     → Audio-visual flow analysis
packages/mcp/      → Hermes MCP connector
supabase/migrations/ → Versioned SQL (apply via Supabase CLI)
docs/adr/          → ADR 0001–0020+ (read before overriding decisions)
engineering-harness/HERMES_TRUST_HARNESS.md → Trust harness (read before MCP edits)
STATUS.md          → Live project state (update after every session)
TASKS.md           → Active / waiting / done tasks
memory/            → Glossary, run logs, context, people
```

---

## 6 · OPEN DECISIONS FOR OPUS

Prioritized. Address top-down:

### 6.1 — Launch Readiness (Phase 16)
Phase 16 is "🟡 ready." **Your call:**
- Is there a blockers list before Go-Live? (check `docs/phase-3-dod.md` and `docs/phase-1-dod.md`)
- Are the 5 pending migrations safe to apply to Supabase dev now?
- Is the 48h monitoring plan written? If not, draft it.

### 6.2 — Audit Log Architecture
`logAuditEvent()` writes to console.log always; writes to DB when `MCP_AUDIT_DB=true`.
Decision: **Session 3 hat Dual-Mode implementiert.** Nächster Schritt: Migration pushen + Flag aktivieren.

### 6.3 — Stripe Live Mode Enablement
Phase 15 (Public Launch) gates Stripe live mode. Current state: test mode.
Before enabling:
- KYC completed? (Lou: "noch nicht fertig, erst nach Lee-OK")
- Webhook signing secrets rotated for prod?
- Transfer group logic tested end-to-end with real funds?

**Decision:** Mock-Accounts reichen für Demo. Live-Switch erst nach Lee-OK.

### 6.4 — Legal Blocklist (blocks Phase 15)
Still open per TASKS.md:
- Steuerberater Rechtsform-Entscheidung
- Fachanwalt Impressum/Datenschutz/AGB
- Markenrecherche ELBTRONIKA (DPMA + EUIPO)
- Domains: elbtronika.de / .com / .art

These are Lou's tasks, not agent tasks. **Your role: flag if any is technically blocking Phase 16.**

---

## 7 · AGENT ROUTING MATRIX

| Task type | Agent | Notes |
|-----------|-------|-------|
| Architecture decision | **Opus** | Write ADR, return decision |
| Implementation (any size) | **Sonnet** | Has full harness access |
| UI/Business logic | **Sonnet** / GPT-4 | Both capable |
| Code scaffolding / tests | **Sonnet** | Preferred |
| Legal/compliance advice | **Opus** | Review only, Lou gets lawyer |
| Trust boundary changes | **Opus** → **Sonnet** | Opus decides, Sonnet implements |
| Memory updates | Both | Always update STATUS.md + TASKS.md |

---

## 8 · CONSTRAINTS (non-negotiable)

```
- TypeScript strict: no `any`, no `@ts-ignore`
- RLS on every Supabase table — never bypass
- Stripe test mode until Phase 15 explicitly unlocked by Lou
- Biome only (no Prettier, no ESLint)
- Webhook idempotency: always verify event not already processed
- Consent before analytics: `elt-consent` localStorage check mandatory
- No hallucinated versions, APIs, or CLI flags — WebSearch or ask Lou
- Code: English. Chat with Lou: German/English mixed. Commits: Conventional Commits EN.
- No fire-and-forget: all async work writes to DB before starting
```

---

## 9 · HOW TO READ THE CODEBASE FAST

```bash
# State check
git log --oneline -10
git status
git branch -a

# Open decisions
cat STATUS.md          # Phase table + last action
cat TASKS.md           # Active / Waiting / Done

# Architecture ground truth
cat ELBTRONIKA_Architekturplan_v1.1.md   # Active plan
cat docs/adr/           # All ADRs (don't override without new ADR)

# Trust harness
cat engineering-harness/HERMES_TRUST_HARNESS.md

# Session 3 context
cat memory/context/session-3-knowledge.md

# Run history
ls memory/runs/         # Per-session logs
```

---

## 10 · END-OF-SESSION PROTOCOL (MANDATORY)

**After every Opus session, before handing off:**

### Step A — Update STATUS.md
Edit `STATUS.md`:
- Update the phase row(s) you touched
- Add an entry under `## 🔄 Letzte Aktion` with: date, agent, what changed
- Update residual risk list if any resolved

### Step B — Update TASKS.md
- Move completed tasks to `## Done` with date + agent
- Add new tasks discovered during session to `## Active` or `## Waiting On`
- Add new trust tasks to `## Remaining Trust Tasks` if applicable

### Step C — Update memory/
If you learned a new glossary term, project fact, or person: add to `memory/glossary.md` or appropriate `memory/context/` file.

Write a new run log: `memory/runs/YYYY-MM-DD_Opus-47.md` with:
```
# Run-Log: Opus 4.7 — [Session Title]
## Run 01 — [What]
- Phase: [N]
- Was: [summary]
- Decisions: [list]
- Handoff: [next agent + task]
```

### Step D — Write Next Prompt

After updating memory, output a **ready-to-paste prompt block** for the next agent:

```
=== NEXT PROMPT FOR [SONNET/OPUS/GPT] ===

Repository root: d:\Elbtronika\Elbtonika

Read before acting: STATUS.md, TASKS.md, CLAUDE.md, engineering-harness/HERMES_TRUST_HARNESS.md

[Specific task description — what, where, acceptance criteria]

[Any blockers or questions for Lou]

Focus only on [scoped area]. Smallest safe implementation. Tests first.
When done: update STATUS.md + TASKS.md, write run log, output next prompt.

=== END NEXT PROMPT ===
```

---

> **First action NOW:** Read `STATUS.md` and `TASKS.md`. Then address Section 6 decisions top-down.
> Output format for decisions: `Decision [N]: [Option chosen] — Reason: [1 sentence]. Handoff: [agent + task].`
> When done with all decisions: execute the End-of-Session Protocol (Section 10) in full.
