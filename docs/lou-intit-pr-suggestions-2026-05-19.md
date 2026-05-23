# PR-Vorschläge für Lou-Intit (Stand 2026-05-19)

> Generic-Filter: nur Patterns die für JEDES künftige Projekt gelten, nicht ELBTRONIKA-spezifisch.
> Quelle: lokale Sync-Extraktion aus `docs/bank-upload-staging-2026-05-19.md`.
> Niemals automatisch in Lou-Intit pushen — Owner reviewt + entscheidet pro Vorschlag.

---

## Vorschlag 1: G15+ — Windows-cmd-Commit-Pattern in `_bootstrap/04_MEMORY_LEARNINGS.md` § 1 ergänzen

**Begründung:** Gilt für JEDES Windows-Dev-Projekt mit Multi-Line- oder Sonderzeichen-Commits. Aktuell wahrscheinlich nur impliziert.
**Position:** § 1 Gotchas, nach den existierenden cmd/PS-Einträgen.
**Inhalt:**

```
### G-NEW — git commit -m bricht in Windows cmd mit Sonderzeichen
Was passiert: `@`, `/`, `#`, Umlaute in `git commit -m "..."` brechen cmd.
Fix: write_file(D:\msg.txt) + `git commit -F D:\msg.txt`. Niemals `echo > file` (literal text + first-line-only).
Tags: git, windows, cmd
```

**PR-Branch-Name:** `feat/memory-windows-commit-pattern`
**PR-Title:** `feat(memory): Windows-cmd commit pattern (write_file → git commit -F)`

---

## Vorschlag 2: G+ — pnpm.overrides für Multi-Version Type-Conflicts

**Begründung:** Gilt für JEDES pnpm-Monorepo mit Multi-Version-Deps. Häufiger Issue bei vite/rollup, react, typescript Major-Wechseln.
**Position:** § 1 Gotchas (Cluster: pnpm).
**Inhalt:**

```
### G-NEW — pnpm Multi-Version Type-Konflikt (z.B. vite@7 + vite@8)
Was passiert: Type-Mismatch zwischen Major-Versions wenn workspace-pkgs unterschiedliche Major-Versions ziehen (rollup vs rolldown Plugin<any>).
Fix: Root `package.json`:
"pnpm": { "overrides": { "vite": "^8.0.0" } }
Erzwingt single Version monorepo-wide.
Tags: pnpm, monorepo, typescript
```

**PR-Branch-Name:** `feat/memory-pnpm-overrides-pattern`
**PR-Title:** `feat(memory): pnpm.overrides for multi-version type conflicts`

---

## Vorschlag 3: G+ — pnpm.onlyBuiltDependencies für esbuild/sharp

**Begründung:** pnpm überspringt postinstall-Builds (security default). Jedes Next.js / SWC / Sharp-Image-Projekt benötigt dies. Häufige CI-Failure-Quelle.
**Position:** § 1 Gotchas (Cluster: pnpm/build).
**Inhalt:**

```
### G-NEW — pnpm.onlyBuiltDependencies fehlt → esbuild/sharp ungebaut
Was passiert: pnpm skipped postinstall (security) → esbuild/sharp uncompiled → Next.js build leer oder Image-Optim broken.
Fix: Root `package.json`:
"pnpm": { "onlyBuiltDependencies": ["esbuild", "sharp"] }
Tags: pnpm, esbuild, nextjs, ci
```

**PR-Branch-Name:** `feat/memory-pnpm-only-built-deps`
**PR-Title:** `feat(memory): pnpm.onlyBuiltDependencies for esbuild/sharp builds`

---

## Vorschlag 4: G+ — upload-artifact @v4 include-hidden-files für .next/

**Begründung:** Universal für alle Next.js + GitHub-Actions Projekte. v4 behandelt dotdirs anders als v3.
**Position:** § 1 Gotchas (Cluster: github-actions).
**Inhalt:**

```
### G-NEW — actions/upload-artifact @v4 ignoriert .next/ ohne Flag
Was passiert: `.next/` ist dotdir, Linux-hidden → v4 ignoriert ohne expliziten Flag.
Fix:
- uses: actions/upload-artifact@v4
  with:
    path: apps/web/.next/
    include-hidden-files: true
Tags: github-actions, nextjs, ci
```

**PR-Branch-Name:** `feat/memory-upload-artifact-hidden`
**PR-Title:** `feat(memory): upload-artifact v4 include-hidden-files for .next/`

---

## Vorschlag 5: G+ — vi.mock() call order

**Begründung:** Universal Vitest-Falle in JEDEM Vitest-Projekt. Häufige Source für "mock not applied" Bugs.
**Position:** § 1 Gotchas (Cluster: vitest/testing).
**Inhalt:**

```
### G-NEW — vi.mock() call order in Vitest
Was passiert: `vi.mock()` nach Subject-Import → Mock nicht angewendet (hoisting greift, aber Subject schon evaluiert).
Fix: `vi.mock(...)` IMMER vor allen Subject-Imports in Test-File.
Tags: vitest, mock, testing
```

**PR-Branch-Name:** `feat/memory-vi-mock-order`
**PR-Title:** `feat(memory): vi.mock() call order in Vitest`

---

## Vorschlag 6: G+ — HMAC webhook replay attack (Timestamp-Check fehlt)

**Begründung:** Universal Security-Pattern für JEDES Webhook-Empfänger-Projekt. HMAC ohne Timestamp = Replay-Lücke.
**Position:** § 1 Gotchas (Cluster: security/webhook).
**Inhalt:**

```
### G-NEW — HMAC webhook ohne Timestamp-Check → Replay-Angriff möglich
Was passiert: HMAC-verifizierter Webhook ohne Timestamp-Check kann replay'd werden.
Fix:
const skew = Math.abs(Date.now() / 1000 - ts);
if (skew > 300) return new Response('expired', { status: 401 });
Tags: security, webhook, hmac
```

**PR-Branch-Name:** `feat/memory-hmac-replay-check`
**PR-Title:** `feat(memory): HMAC webhook timestamp check (anti-replay)`

---

## Vorschlag 7: G+ — Wrangler-Quirks Cluster (4 Einträge)

**Begründung:** Cloudflare Pages + Wrangler ist Default-Hosting in vielen DiggAi-Projekten. Vier verwandte Quirks gehören als Cluster in Memory.
**Position:** § 1 Gotchas (Cluster: cloudflare/wrangler).
**Inhalt:**

```
### G-NEW — Wrangler Quirks Cluster

(a) Niemals wrangler aus C:\Windows\System32 — schreibt .wrangler/cache in cwd, Permission-Denied.
    Fix: Immer `pushd D:\<repo>` davor.

(b) wrangler pages deploy braucht CLOUDFLARE_ACCOUNT_ID wenn Account-Inference fails.
    Fix: `set "CLOUDFLARE_ACCOUNT_ID=<id>"` mit Quotes (vermeidet trailing-space bug in cmd).

(c) wrangler pages hat KEIN `domain` subcommand in v4.
    Fix: Custom Domain via CF Dashboard UI oder direkter CF API Call.

(d) OAuth Token expiry ~24h, refresh nicht auto.
    Fix: `wrangler whoami` first triggert Refresh. Alternativ: API-Token statt OAuth.

Tags: wrangler, cloudflare, windows
```

**PR-Branch-Name:** `feat/memory-wrangler-quirks`
**PR-Title:** `feat(memory): Wrangler quirks cluster (cwd, env, domain, oauth)`

---

## Vorschlag 8: W+ — `gh run list/view --log-failed` als CI-Monitor

**Begründung:** Universal Best-Practice für ALLE GitHub-Actions-Projekte. Kein Browser-Klicken nötig.
**Position:** § 2 What Worked (Cluster: ci/github).
**Inhalt:**

```
### W-NEW — gh run view --log-failed als CI-Monitor
Pattern: `gh run view <id> --log-failed --repo <org>/<repo>` 10× schneller als Browser.
Poll-Loop: push → wait 30s → `gh run list --limit 5` → `gh run view --log-failed`.
Niemals GitHub im Browser für CI-Monitoring.
Tags: github-actions, ci, gh-cli
```

**PR-Branch-Name:** `feat/memory-gh-cli-ci-monitor`
**PR-Title:** `feat(memory): gh CLI as CI monitor (no browser needed)`

---

## Vorschlag 9: W+ — ToolSearch Bulk Loading Pattern

**Begründung:** Universal Cowork-Pattern, gilt für JEDES Cowork-Projekt mit deferred Tools. Erspart pro-Tool Round-Trips.
**Position:** § 2 What Worked (Cluster: cowork/mcp).
**Inhalt:**

```
### W-NEW — ToolSearch bulk loading
Pattern: `ToolSearch({ query: "computer-use", max_results: 30 })` lädt ganzes Toolkit in einem Round-trip statt single-Tool selects.
Andere Cluster: `chrome` (20), `notion`, `desktop-commander`.
Exact: `ToolSearch({ query: "select:TaskCreate,TaskUpdate,TaskList", max_results: 3 })`.
Tags: cowork, mcp, tool-loading
```

**PR-Branch-Name:** `feat/memory-toolsearch-bulk`
**PR-Title:** `feat(memory): ToolSearch bulk loading pattern`

---

## Vorschlag 10: M+ — Phase-DoD-Workflow "Install→Biome→TS→Commit→Push→Watch"

**Begründung:** Universal Engineering-Harness-Pattern für JEDES Code-Projekt mit Biome+TS+CI. Eselbrücke "I-B-T-C-P-W".
**Position:** § 2 Methodology (Cluster: workflow/dod).
**Inhalt:**

```
### M-NEW — Phase-DoD-Workflow nach Code-Änderung
Pflicht-Reihenfolge, kein Schritt überspringen:
1. pnpm install            (wenn package.json geändert)
2. biome check --write --unsafe <file>   (lokal, vor commit)
3. tsc --noEmit            (typecheck)
4. write_file msg + git commit -F D:\msg.txt
5. git push
6. gh run watch            (CI bestätigen)

Eselbrücke: I-B-T-C-P-W (Install, Biome, TypeScript, Commit, Push, Watch).
Tags: workflow, dod, ci
```

**PR-Branch-Name:** `feat/memory-phase-dod-workflow`
**PR-Title:** `feat(memory): Phase-DoD workflow (Install→Biome→TS→Commit→Push→Watch)`

---

## Vorschlag 11: M+ — "DR vor ADR" Best Practice

**Begründung:** Universal Decision-Making-Pattern. Deep-Research-Blast (Multi-LLM parallel) bevor Architectural Decision Record.
**Position:** § 2 Methodology (Cluster: decision-making).
**Inhalt:**

```
### M-NEW — "DR vor ADR"
Pattern: Vor jeder Architectural-Decision-Record (ADR) ein Deep-Research-Blast (Gemini/Kimi/Copilot parallel via Playwright-Profil).
Versionierte Prompts in `scripts/dr-prompts.mjs`.
Command: `pnpm dr:blast 1 2 4` feuert IDs parallel.
Tier-Check: `pnpm dr:tiers` (Supabase/Netlify/Sanity/CF Plan-Limits via API).
Tags: decision-making, deep-research, architecture
```

**PR-Branch-Name:** `feat/memory-dr-vor-adr`
**PR-Title:** `feat(memory): "DR vor ADR" methodology (multi-LLM research before decisions)`

---

## Vorschlag 12: M+ — ELT_MODE-Pattern (Single-Codebase, 3 Runtime-Modes)

**Begründung:** Pitch-Demo vs. Staging vs. Live als Runtime-Flag statt Branch-Switch. Sinnvoll für JEDES Investor-Pitch + Public-Launch-Projekt.
**Position:** § 2 Methodology (Cluster: feature-flags/demo-vs-prod).
**Inhalt:**

```
### M-NEW — Runtime-Mode Pattern (demo/staging/live als env-Flag)
Statt 3 Branches/Repos: 1 Codebase mit env-Var (z.B. `APP_MODE=demo|staging|live`).
- demo:    Personas + Mock-Connected-Accounts + Test-Stripe
- staging: Mix von Personas + echte Daten + Test-Stripe + echte KYC
- live:    Nur Real-Daten + Live-Mode
Saubere Trennung Pitch ↔ Prod ohne Branch-Sprünge. Doppler/env-Manager verwaltet Mode-Switch.
Tags: feature-flags, demo, env, runtime-modes
```

**PR-Branch-Name:** `feat/memory-runtime-mode-pattern`
**PR-Title:** `feat(memory): runtime-mode pattern (demo/staging/live as env flag)`

---

## Vorschlag 13: M+ — Documentation Rule: 5-Source-Redundanz

**Begründung:** Bereits in CLAUDE.md verankert für ELBTRONIKA, sollte Bootstrap-Kit-Default für alle DiggAi-Projekte werden.
**Position:** § 2 Methodology (Cluster: documentation).
**Inhalt:**

```
### M-NEW — Documentation Rule: 5-Source-Redundanz
Pattern: Jedes Phase-DoD-Output landet in 5 Quellen:
1. Notion         (Page für Phase-Output/ADR)
2. Airtable       (Structured-Tracking)
3. Miro           (Architecture-Diagram)
4. lokal `D:\`    (Source-of-truth Markdown)
5. GitHub         (Repo-Commit)

Redundanz = Single-Source-Failure-Schutz. Reihenfolge sortiert nach Update-Frequenz (lokal+GitHub zuerst, externe sync danach).
Tags: documentation, redundancy, single-source-failure
```

**PR-Branch-Name:** `feat/memory-doku-redundanz`
**PR-Title:** `feat(memory): 5-source documentation redundancy rule`

---

## Vorschlag 14: T+ — Tools-Reference erweitern (Cowork-spezifisch)

**Begründung:** workspace web_fetch Provenance-Falle ist Cowork-spezifisch und blockiert genau SYNC_BOTH-Workflows wie heute beobachtet.
**Position:** Neuer Eintrag in `03_TOOLS_REPOS.md` (Cluster: cowork-tools).
**Inhalt:**

```
### Tool: mcp__workspace__web_fetch — Provenance-Falle

Beobachtet: 2026-05-19 in ELBTRONIKA-Sync.

Was: `web_fetch` akzeptiert nur URLs aus User-Messages oder Prior-Fetch-Result. URLs die NUR im Inhalt eines prior fetch erscheinen (z.B. Liste in einem fetched-Prompt-File) werden NICHT korrekt in Provenance übernommen.

Konsequenz: Workflows die "fetch a URL → that URL contains URLs → fetch those" brauchen, sind hart blockiert. SYNC_BOTH-Workflow betroffen.

Workaround:
1. User paste URLs in separater Message (bringt sie in Provenance).
2. Dry-Run-Modus: Staging-File lokal generieren, manueller Upload via Chrome-MCP später.
3. ODER WebSearch mit gezielter Query, falls Repos public-indexed sind.
```

**PR-Branch-Name:** `feat/tools-web-fetch-provenance`
**PR-Title:** `feat(tools): document web_fetch provenance trap (workspace MCP)`

---

## Zusammenfassung

| # | Kategorie | Titel | Branch |
|---|---|---|---|
| 1 | Gotcha | Windows-cmd Commit-Pattern | `feat/memory-windows-commit-pattern` |
| 2 | Gotcha | pnpm.overrides Multi-Version | `feat/memory-pnpm-overrides-pattern` |
| 3 | Gotcha | pnpm.onlyBuiltDependencies | `feat/memory-pnpm-only-built-deps` |
| 4 | Gotcha | upload-artifact hidden-files | `feat/memory-upload-artifact-hidden` |
| 5 | Gotcha | vi.mock() call order | `feat/memory-vi-mock-order` |
| 6 | Gotcha | HMAC webhook replay | `feat/memory-hmac-replay-check` |
| 7 | Gotcha | Wrangler Quirks Cluster (4×) | `feat/memory-wrangler-quirks` |
| 8 | What Worked | gh CLI als CI-Monitor | `feat/memory-gh-cli-ci-monitor` |
| 9 | What Worked | ToolSearch bulk loading | `feat/memory-toolsearch-bulk` |
| 10 | Methodology | Phase-DoD I-B-T-C-P-W | `feat/memory-phase-dod-workflow` |
| 11 | Methodology | DR vor ADR | `feat/memory-dr-vor-adr` |
| 12 | Methodology | Runtime-Mode-Pattern | `feat/memory-runtime-mode-pattern` |
| 13 | Methodology | 5-Source-Dokumentation | `feat/memory-doku-redundanz` |
| 14 | Tools | web_fetch Provenance-Falle | `feat/tools-web-fetch-provenance` |

**Owner-Action:**
1. Lou-Intit-Repo lokal clonen (oder `gh repo clone DiggAiHH/Lou-Intit`)
2. Pro Vorschlag → Branch + Edit `_bootstrap/04_MEMORY_LEARNINGS.md` (oder `_bootstrap/03_TOOLS_REPOS.md` für #14)
3. PR aufmachen, Title + Body aus Vorschlag übernehmen
4. Mergen wenn Self-Review ok

**Top-3 Pareto** (höchste Wirkung bei wenig Aufwand): #1 (Commit-Pattern), #10 (Phase-DoD), #11 (DR vor ADR).
