# ELBTRONIKA — Opus 4.7 Handover

> **Layered handover.** Section 0 (Opus 4.6) is the current top layer. Sections 1–10 (Sonnet 4.6) remain valid as ground truth — read them after Section 0.
> Date: 2026-04-30 | Authors: Opus 4.6 (Section 0, layered patch) → Sonnet 4.6 via Copilot (Sections 1–10, original handover)
> Repo: `d:\Elbtronika\Elbtonika` (Windows) | Org: DiggAiHH/elbtronika

---

## 0 · OPUS 4.6 LAYER — VALIDATION + NEXT-STEP PATCH (added 2026-04-30 evening)

### 0.1 Was ich validiert habe
Sonnet's Handover ist sauber. Tech-Stack (Section 4) und Constraints (Section 8) bleiben unverändert gültig. Routing-Matrix (Section 7) und End-of-Session-Protocol (Section 10) sind als Pflicht-Standard zu übernehmen.

### 0.2 STATUS-Drift, die du als Opus 4.7 zuerst auflösen musst

| Drift | Befund | Fix |
|---|---|---|
| Tag-Versionskonflikt | `v0.9.0` ist sowohl auf `feature/phase-8-audio` (Phase 9) **als auch** auf `feature/phase-11-ai` (Phase 11). Tags sind nicht-monoton. | Bei finalem Main-Merge: alte Branch-Tags annotieren (`v0.9.0-audio`, `v0.9.0-ai`) oder löschen, dann `v1.0.0` neu setzen. |
| Plan-File-Naming | STATUS-Block in Sonnet-Handover Section 9 verweist auf `ELBTRONIKA_Architekturplan_v1.1.md` (korrekt). Im Workspace existiert noch `_v1.0.md` parallel mit `_v1.md`. | `git mv ELBTRONIKA_Architekturplan_v1.0.md ELBTRONIKA_Architekturplan_v1.md` (nur eine kanonische Datei). |
| Phase-14/15/16 Naming | Kimi K-NN hat "Phase 14 Optimization", "Phase 15 Testing", "Phase 16 Launch" eingeführt. Plan v1.1 nennt Phase 14 = Testing, 15 = Launch. | Plan zu **v1.2** updaten: Optimization als Phase 14a, Testing als 14b, Launch bleibt 15, Hermes Trust als 16. Phase-Nummerierung kanonisieren. |
| `v0.12.0 vor v0.11.0` | Tag `v0.12.0` (Phase 10 Stripe) wurde vor `v0.11.0` (Phase 13 Compliance) gesetzt — chronologisch ok, semantisch verwirrend. | Tolerieren bis Main-Merge, dann `v1.0.0` clean. |

### 0.3 P0-Trust-Residuals — als ready-to-paste Sub-Prompt für Sonnet

```
=== SONNET 4.6 :: TRUST-RESIDUALS-CLEANUP ===

KONTEXT:
Hermes Trust Waves 0–8 sind implementiert. Drei Residuals blockieren Production.
Lies: STATUS.md, OPUS_47_HANDOVER.md Section 0, engineering-harness/HERMES_TRUST_HARNESS.md.

GIT-GATE:
> git status -sb
> git log --oneline -10
> git branch --show-current

BRANCH:
feature/trust-residuals-cleanup (von aktuellem feature/phase-11-ai)

TEIL 1 — Audit-DB-Table aktivieren (Wave 1 final):
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
✓ apps/web/src/lib/mcp/audit.ts: zweite Implementation hinter Feature-Flag MCP_AUDIT_DB=true; console.log bleibt als Fallback.
✓ Test: invoke-Route triggert mit ENV=true → DB-Row vorhanden; mit ENV=false → console.log.

TEIL 2 — Migrations applizieren:
✓ Doppler dev: pnpm.cmd supabase db push
✓ Verify: pnpm.cmd supabase migration list zeigt agent_tasks + orders_session_id + mcp_audit_log als applied.
✓ Smoke-Test pro Migration: insert + select round-trip.
✓ Doppler prd: dieselben Schritte gegen Production-Project (NUR nach Lou's GO!).

TEIL 3 — Service-Role-Key für account/delete:
✓ apps/web/src/lib/supabase/admin.ts: prüfen, dass createClient() mit SUPABASE_SERVICE_ROLE_KEY (nicht NEXT_PUBLIC_SUPABASE_ANON_KEY) aufgerufen wird.
✓ Doppler dev/preview/prd: SUPABASE_SERVICE_ROLE_KEY gesetzt verifizieren.
✓ Negativ-Test: temporär anon-Key in admin.ts → /api/account/delete muss 500 werfen mit klarer Fehlermeldung "service-role required".
✓ Re-revert auf SR-Key, Test grün.

DOD:
- 3 Migrations live auf dev (prd nach Lou's GO)
- mcp_audit_log schreibt unter Feature-Flag
- account/delete läuft nur mit SR-Key
- ADR docs/adr/0014-trust-residuals.md
- pnpm.cmd --filter @elbtronika/web typecheck grün
- Run-Log memory/runs/2026-04-30_Sonnet-46-trust-residuals.md
- PR feat/trust-residuals-cleanup gegen feature/phase-11-ai, draft

KONFLIKT-PRÄVENTION:
- Exklusiv: supabase/migrations/, apps/web/src/lib/mcp/audit.ts, apps/web/src/lib/supabase/admin.ts
- NICHT anfassen: andere Branch-Files

STOPPE NACH SUB-PLAN, warte auf "GO Trust-Residuals".
=== ENDE ===
```

### 0.4 Final-Merge-Strategie (linear, audit-trail-clean)

```
Schritt 1: feature/trust-residuals-cleanup → mergen in feature/phase-11-ai (squash)
Schritt 2: feature/phase-11-ai rebase auf main, Konfliktauflösung (Lou + Opus)
Schritt 3: PR feature/phase-11-ai → main (squash merge)
Schritt 4: alte Tags v0.6.0..v0.12.0 als annotated tags umbenennen oder löschen
Schritt 5: tag v1.0.0 auf main HEAD
Schritt 6: Doppler prd final scharf, Netlify Production-Promote
Schritt 7: DNS-TTL 60s, Switch, 48h Hypercare (Kimi-Setup)
```

### 0.5 Was Opus 4.7 als allererstes machen sollte

1. Read STATUS.md (latest), TASKS.md, diese Section 0 + Sonnet-Sections 1–10.
2. Verify-Pass: `git status -sb`, `git log --oneline -20`, `gh pr list --state open`.
3. Lou abholen mit Status-Bericht (max 150 Wörter): "Hier ist, was seit Handover passiert ist / als nächstes empfehle ich X / blockiert auf Y."
4. **Validiere Session 3 readiness:** Open [SESSION3_EXECUTION_CHECKLIST.md](SESSION3_EXECUTION_CHECKLIST.md), walk through Pre-Launch sections A–B.
5. Sub-Prompt für Sonnet aus Section 0.3 ausführen (oder anpassen, wenn Drift sich verschoben hat).
6. Phase 0 Admin (Lou direkt) aktiv treiben: UG-Status, Stripe-KYC-Status, Anwalt-Termin.
7. Erst nach Trust-Residuals + Phase 0 GREEN: Final-Merge-Strategie aus 0.4 ausführen.

### 0.6 Plan-Update-Pflicht

Nach Final-Merge: **Plan v1.2 schreiben.** Inhalt:
- Phase 14a Optimization, 14b Testing, 14c Hermes-Trust eingearbeitet
- Phase 16 = Launch (canonical)
- ADR-Index 0001..0014 vollständig
- Risk Register aktualisiert (Stripe Live + Künstler-Pipeline-Stand)
- Post-Launch Phase 17 Backlog: Audit-Dashboard, Multi-Item-Cart, NFT-Layer, Vinyl-Pipeline, Live-Vernissage

### 0.7 Strategische Offen-Fragen für Lou

| # | Frage | Block für |
|---|---|---|
| F1 | Stripe-KYC durch oder noch in Bearbeitung? Antwort : "nein der ist noch nciht fertig aber erstelle mocks und irgendwas damit alles läudt bis das erledigt ist. was ich mache ist alles für den Heeren "Lee Hoops" liefern und wenn er überzeugt ist, danach kann man die Rechtliche Regulatorische sachen angehen. aber bis dahin brauche ich wirklich alle soweit perfekt fertig, damit wenn wir das Ok Kriegen von Lee  und die REgulatorische behördliche sachen anfangen, denn müssen wir ncuht erst da angfangen, sondern ist alles fertig um nur einfach paar werte zu schreiben. | Phase 10 Live, Final-Merge |
| F2 | UG-Eintragung Status? Steuernummer da?  Antowrt:""| Stripe-KYC Abschluss |Siehe Frage F1 antwort.
| F3 | Mind. 3 Künstler-Verträge unterzeichnet? Siehe Frage F1 antwort | Live-Content |
| F4 | Anwalt-Final-Review der AGB/Datenschutz/Impressum durch? Siehe Frage F1 antwort | Production-Deploy |
| F5 | DJ-Pipeline-Stand (mind. 2 unterzeichnet)? Siehe Frage F1 antwort | Launch-Content |
| F6 | Stripe-Webhook-Signing-Secrets für prod rotated ?  Siehe Frage F1 antwort| Phase 10 Live |
| F7 | Doppler `prd`-Environment final mit allen Live-Keys? " neien mach das selbst beitte emeit dem headless browser here " | Production-Deploy |

Wenn alle 7 = ja → Final-Merge ausführen. Wenn ≥1 = nein → Phase 0 weiter, Code-Stand bleibt auf `feature/phase-11-ai`.

---

> **Folgende Sektionen 1–10 sind das Original-Handover von Sonnet 4.6 vom Vormittag des 2026-04-30. Bleiben gültig, sind die Detailtiefe für die Implementierungs-Routing-Entscheidungen.**

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
| 17 | Hermes Trust (Waves 0–8) | ✅ 2026-04-30 |

### Active Branch
```
main ← merge target
feature/phase-11-ai ← last major feature branch (may need merge check)
```

---

## 3 · HERMES TRUST — WHAT JUST HAPPENED

All 8 waves from `engineering-harness/HERMES_TRUST_HARNESS.md` implemented today (2026-04-30):

| Wave | Boundary | Status |
|------|----------|--------|
| 0 | MCP auth + role gate + allowlist | ✅ |
| 1 | Structured audit log (actorId, role, server, tool, status, duration) | ✅ |
| 2 | Canonical `server/tool` naming at invoke boundary | ✅ |
| 3 | `agent_tasks` DB table — durable, not in-memory | ✅ |
| 4 | Idempotency + atomic claim lock + DB status on complete/fail | ✅ |
| 5 | Flow APIs return explicit `source: "simulated"\|"measured"` | ✅ |
| 6 | `/api/analytics/vitals` gates on consent header; client checks localStorage | ✅ |
| 7 | Stripe webhook order lookup fixed (`stripe_session_id` stored + queried) | ✅ |
| 8 | STATUS.md + TASKS.md updated | ✅ |

### Residual Risks → Your First Decision Point

| Risk | Action needed |
|------|--------------|
| Audit events → console.log only | Decide: add `mcp_audit_log` Supabase table now or post-launch? |
| 2 pending migrations not applied | `20260430_agent_tasks.sql` + `20260430_orders_session_id.sql` → Supabase prod |
| `account/delete` needs service-role key | Confirm env var; service-role ≠ anon key |

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
docs/adr/          → ADR 0001–0013+ (read before overriding decisions)
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
- Are the 2 pending migrations safe to apply to Supabase prod now?
- Is the 48h monitoring plan written? If not, draft it.

### 6.2 — Audit Log Architecture
`logAuditEvent()` currently writes to `console.log`.
Options:
- A) Add `mcp_audit_log` Supabase table now (pre-launch, trust-critical)
- B) Defer to post-launch, log to Sentry in the meantime
- C) Use Supabase's built-in audit extension

**Recommendation needed from you.** Then hand to Sonnet for implementation.

### 6.3 — Stripe Live Mode Enablement
Phase 15 (Public Launch) gates Stripe live mode. Current state: test mode.
Before enabling:
- KYC completed? (was TBD in TASKS.md)
- Webhook signing secrets rotated for prod?
- Transfer group logic tested end-to-end with real funds?

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
