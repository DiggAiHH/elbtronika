# OPUS 4.8 HANDOFF — Paste this into Claude CoWork

> Repository: `D:\Elbtronika\Elbtonika` (Windows PowerShell)
> Branch: `feature/phase-11-ai` @ `dc25926`
> Tag: `v0.13.0-demo`
> Session 3 Status: 3 Workstreams merged, typecheck green, 41 tests passing, 8 demo artworks generated

---

## YOU ARE OPUS — READ FIRST (60 seconds)

```
1. engineering-harness/PRE_FLIGHT_PROTOCOL.md   ← NEW — Session 3 bootstrap protocol
2. STATUS.md                                     ← Live state
3. OPUS_47_HANDOVER.md Section 0                 ← Session 3 knowledge layer
4. TASKS.md                                      ← Active / waiting / done
```

**Key facts:**
- Phase 0–19 all ✅ except Phase 0 (legal, Lou's task) and Phase 16 (🟡 ready)
- 5 Supabase migrations NOT yet pushed to dev (`20260430_*.sql` in `supabase/migrations/`)
- 8 demo artworks generated (1024×1024px PNG in `apps/web/public/demo/artworks/`)
- ELT_MODE system live: `demo` | `staging` | `live` (default `demo`)
- Trust Waves 0–8 ✅, but migrations need `supabase db push`

---

## YOUR JOBS (Opus — Strategy + Planning)

### Job 1: Plan Update (v1.2 → v1.3)

Update `ELBTRONIKA_Architekturplan_v1.2.md`:
- Insert Phase 14a Optimization, 14b Testing, 14c Hermes-Trust
- Phase 16 = Launch (canonical)
- Phase 17 = Post-Launch Backlog (Audit-Dashboard, Multi-Item-Cart, NFT-Layer, Vinyl-Pipeline, Live-Vernissage)
- ADR-Index 0001–0020 complete
- Risk Register: Stripe Live + Künstler-Pipeline-Stand
- Mark `v0.13.0-demo` as current release

### Job 2: Prepare Next Prompts for Code Agents

Output 3 ready-to-paste prompt blocks:

#### Prompt A — for SONNET (Implementation)
```
=== PROMPT FOR SONNET 4.6 ===
Repo: D:\Elbtronika\Elbtonika | Branch: feature/phase-11-ai
Read: PRE_FLIGHT_PROTOCOL.md Section 3 (Windows), Section 9 (Commands)

Task 1: Push 5 Supabase migrations to dev
- cd D:\Elbtronika\Elbtonika
- pnpm.cmd supabase db push
- Verify: pnpm.cmd supabase migration list
- Smoke-test each: insert + select round-trip

Task 2: Doppler dev — set ELT_MODE=demo, MCP_AUDIT_DB=true
- Use Doppler CLI or dashboard
- Verify: pnpm.cmd --filter @elbtronika/web dev starts without env errors

Task 3: Regenerate Supabase types
- pnpm.cmd supabase gen types typescript --project-id <ID> > packages/contracts/src/supabase/types.ts
- Remove all `as any` casts in audit.ts and related files
- Run pnpm.cmd --filter @elbtronika/web typecheck — must be green

Task 4: Service-Role-Key verification
- Verify apps/web/src/lib/supabase/admin.ts uses SUPABASE_SERVICE_ROLE_KEY
- Negativ-test: temporarily break key → /api/account/delete must 500 with "service-role required"
- Revert, test green

Exclusivity: supabase/migrations/, apps/web/src/lib/mcp/audit.ts, apps/web/src/lib/supabase/admin.ts
Do NOT touch: other branch files
When done: update STATUS.md, write run log, output next prompt.
=== END ===
```

#### Prompt B — for GPT (UI/Business Logic)
```
=== PROMPT FOR GPT 5.4 ===
Repo: D:\Elbtronika\Elbtonika | Branch: feature/phase-11-ai
Read: PRE_FLIGHT_PROTOCOL.md Section 2 (Tool Matrix), Section 8 (Error Registry)

Task 1: Wire demo artworks into Sanity
- Upload 8 PNGs from apps/web/public/demo/artworks/ to Sanity
- Set isDemo=true on each artwork document
- Verify: /de/shop filters correctly in demo mode

Task 2: Artist profile pages
- Create /de/artist/mira-volk, /de/artist/kenji-aoki, etc.
- Use existing artist schema from Sanity
- Link from artwork detail pages

Task 3: DJ profile pages
- Create /de/dj/lior-k, /de/dj/nightform, /de/dj/velvetrace
- Show associated sets/artworks

Exclusivity: apps/web/app/[locale]/(profile)/, Sanity studio
When done: update STATUS.md, write run log, output next prompt.
=== END ===
```

#### Prompt C — for CODEX (Tests + Docs)
```
=== PROMPT FOR CODEX 5.3 ===
Repo: D:\Elbtronika\Elbtonika | Branch: feature/phase-11-ai
Read: PRE_FLIGHT_PROTOCOL.md Section 4 (Memory), Section 9 (Test Commands)

Task 1: Expand E2E demo-flow.spec.ts
- Step 9: Artist profile page navigation
- Step 10: DJ profile page navigation
- Step 11: Pitch dashboard investor-gate check
- Run: pnpm.cmd --filter @elbtronika/web test:e2e

Task 2: Unit tests for new components
- WalkthroughTour: test skip/dismiss/complete states
- DemoBanner: test mode rendering (demo/staging/live)
- PressKit: test i18n DE/EN content

Task 3: Doppler prd setup verification
- Cross-check docs/runbooks/doppler-prd-setup.md against actual Doppler dashboard
- Mark any missing ENV vars

Exclusivity: apps/web/e2e/, apps/web/__tests__/, docs/runbooks/
When done: update STATUS.md, write run log, output next prompt.
=== END ===
```

### Job 3: Lou's Action Items (Consolidated)

Extract from STATUS.md + OPUS_47_HANDOVER.md into a single message for Lou:

```
Lou — Deine P0-Aktionen (kein Code nötig):

1. Stripe Test-Connected-Accounts erstellen (8 Stück)
   → dashboard.stripe.com/test/apikeys → Connected Accounts
   → IDs eintragen in apps/web/src/lib/stripe/demo.ts

2. Pitch-Termin mit Lee Hoops terminieren
   → Ziel: 5-Minuten-Demo mit WalkthroughTour + Checkout + PressKit
   → docs/runbooks/pitch-rehearsal.md liegt bereit

3. Demo-Artwork-Bilder review
   → apps/web/public/demo/artworks/*.png
   → Falls nicht gut genug: ersetzen durch eigene / AI-generierte

4. Doppler prd — 22 ENV-Variablen vorbereiten (noch nicht eintragen!)
   → docs/runbooks/doppler-prd-setup.md
   → Erst nach Lee-OK eintragen

Wenn 1+2+3 done → Sag "GO Final-Merge" → Opus führt Merge-Strategie aus.
```

---

## END-OF-SESSION PROTOCOL (Opus)

Before handing off:

1. **Update STATUS.md** — phase rows, last action date, residual risks
2. **Update TASKS.md** — move done items, add new discoveries
3. **Write run log** — `memory/runs/2026-04-30_Opus-48.md` with 5-line format
4. **Output next prompt** — ready-to-paste block for next agent

Run-log format:
```
## Run NN — [What]
- Phase: [N]
- Was: [summary]
- Tests: [result]
- Branch: `branch` @ `sha`
- Commit: `sha type(scope): message`
```

---

> **Decision format:** `Decision [N]: [Option] — Reason: [1 sentence]. Handoff: [agent + task].`
> **When stuck:** Read PRE_FLIGHT_PROTOCOL.md Section 8 (Error Registry) — 12 Session-3 bugs with prevention.
