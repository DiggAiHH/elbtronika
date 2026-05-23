# Bank Upload Staging — 2026-05-19

> **Status:** Dry-Run. Web-Fetch konnte Bank-State nicht laden (Provenance-Block) → Dedup-Check ausstehend nach Upload.
> **Upload-Methode:** Chrome-MCP `file-attachment.attach()` via DataTransfer (siehe SYNC_BOTH_PROMPT §15).
> **Owner-Action:** Inhalt prüfen → in `https://github.com/DiggAiHH/Zentrale-DiggAi-Bank/upload/main/KNOWLEDGE` pasten → ein Commit pro Datei.
> **Commit-Message-Pattern:** `feat(sync): manual sync from ELBTRONIKA 2026-05-19 — 33G/13W/5F/5M/3T/3A new, 0 dedup`

Anonymisierung durchgeführt: Cloudflare Account ID, Co-Builder E-Mail, Sanity Project ID maskiert. Keine Patient-/Anwalts-Daten in ELBTRONIKA. Stripe-Test-Keys nicht in Lessons enthalten.

---

## 1. KNOWLEDGE/GOTCHAS.md — anhängen

### G-NEW-01 — pnpm frozen-lockfile mismatch nach package.json change
**Erstmals beobachtet:** 2026-04-26 in ELBTRONIKA (`docs/phase-3-lessons-learned.md` #1)
**Beobachtet in:** ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `pnpm`, `ci`, `lockfile`
**Was passiert:** Dependency in package.json hinzugefügt, ohne `pnpm install` zu laufen. CI schlägt mit `frozen-lockfile`-Fehler fehl.
**Fix:** Nach JEDER package.json-Änderung sofort `pnpm install` + `pnpm-lock.yaml` mitcommiten. Nie package.json alleine committen.
**Quellen:** `docs/phase-3-lessons-learned.md` §1

### G-NEW-02 — Biome useLiteralKeys für process.env
**Erstmals beobachtet:** 2026-04-26 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `biome`, `typescript`
**Was passiert:** `process.env["NEXT_PUBLIC_KEY"]!` triggert Biome `useLiteralKeys`.
**Fix:** Dot-Notation: `process.env.NEXT_PUBLIC_KEY!`
**Quellen:** `docs/phase-3-lessons-learned.md` §2

### G-NEW-03 — Biome useImportType inline type keyword
**Erstmals beobachtet:** 2026-04-26 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `biome`, `typescript`, `imports`
**Was passiert:** `import { type NextRequest }` statt `import type { NextRequest }` → Biome-Error.
**Fix:** Top-Level `import type { X }`. Auto-Fix mit `biome check --write --unsafe`.
**Quellen:** `docs/phase-3-lessons-learned.md` §4

### G-NEW-04 — Biome CSS @keyframes Inline
**Erstmals beobachtet:** 2026-04-26 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `biome`, `css`
**Was passiert:** Inline-Form `0% { background-position: 200% 0; }` schlägt fehl.
**Fix:** Multi-line — jede Property eigene Zeile.
**Quellen:** `docs/phase-3-lessons-learned.md` §5

### G-NEW-05 — TS exactOptionalPropertyTypes + process.env undefined
**Erstmals beobachtet:** 2026-04-26 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `typescript`, `strict-mode`
**Was passiert:** `{ token: process.env.SANITY_API_READ_TOKEN }` → Type-Error wenn Env undefined sein kann.
**Fix:** Conditional Spread: `...(process.env.X ? { token: process.env.X } : {})`
**Quellen:** `docs/phase-3-lessons-learned.md` §6

### G-NEW-06 — git commit -m bricht mit Sonderzeichen in cmd
**Erstmals beobachtet:** 2026-04-26 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `git`, `windows`, `cmd`
**Was passiert:** `@`, `/`, `#`, Umlaute in `git commit -m "..."` brechen den Befehl unter Windows cmd.
**Fix:** `write_file(D:\msg.txt)` + `git commit -F D:\msg.txt`. Niemals `echo > file` (literal text + first-line-only).
**Quellen:** `docs/phase-3-lessons-learned.md` §7, `docs/agent-preflight-protocol.md` §3

### G-NEW-07 — PowerShell blockt pnpm.ps1
**Erstmals beobachtet:** 2026-04-24 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `pnpm`, `windows`, `powershell`
**Was passiert:** PowerShell execution policy blockt `pnpm.ps1`, `&&` chaining fehlt, `git -m "multi word"` bricht.
**Fix:** Immer `cmd` shell, nie PowerShell. Desktop Commander mit `shell:"cmd"`.
**Quellen:** `docs/agent-preflight-protocol.md` §1

### G-NEW-08 — npx biome lädt 0.3.3 (uralt)
**Erstmals beobachtet:** 2026-04-24 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `biome`, `pnpm`, `npx`
**Was passiert:** `npx biome ...` resolved global statt local → installiert v0.3.3.
**Fix:** `node_modules\.bin\biome` oder `pnpm lint`. Nie npx für lokale Tools.
**Quellen:** `docs/agent-preflight-protocol.md` §6

### G-NEW-09 — vite@7 + vite@8 monorepo Type-Konflikt
**Erstmals beobachtet:** 2026-04-25 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `vite`, `pnpm`, `typescript`, `monorepo`
**Was passiert:** `Plugin<any>` Type-Mismatch zwischen rolldown (v8) und rollup (v7) wenn beide Versionen koexistieren.
**Fix:** Root `package.json` → `"pnpm": { "overrides": { "vite": "^8.0.0" } }` erzwingt single Version.
**Quellen:** `docs/agent-preflight-protocol.md` §6

### G-NEW-10 — Storybook viteFinalConfig falscher Key
**Erstmals beobachtet:** 2026-04-25 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `storybook`, `vite`
**Was passiert:** `viteFinalConfig` ist kein gültiger Storybook-Config-Key.
**Fix:** `viteFinal(config) { ... return config; }` — case-sensitive.
**Quellen:** `docs/agent-preflight-protocol.md` §7

### G-NEW-11 — @storybook/test@10.x nicht existent
**Erstmals beobachtet:** 2026-04-25 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `storybook`, `npm`
**Was passiert:** Pin auf `@storybook/test@10.x` schlägt fehl. Latest ist 8.6.15.
**Fix:** Skip oder Major-Range nicht pinnen (`@storybook/test@^8`).
**Quellen:** `docs/agent-preflight-protocol.md` §7

### G-NEW-12 — JSX dynamic tag in strict TS
**Erstmals beobachtet:** 2026-04-25 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `typescript`, `react`, `jsx`
**Was passiert:** `const Heading = ({ as: Tag }) => <Tag>...</Tag>` → `Cannot find namespace 'JSX'` in strict mode.
**Fix:** `React.createElement(Tag, props, children)` mit `as` als string-literal-Union.
**Quellen:** `docs/agent-preflight-protocol.md` §8

### G-NEW-13 — Stack/Spacer gap als number statt string-literal
**Erstmals beobachtet:** 2026-04-25 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `typescript`, `design-system`
**Was passiert:** `<Stack gap={4}>` → TS2322. Props sind string-literal-Unions (`"1"|"2"|...`).
**Fix:** `<Stack gap="4">` (string). Component-Interface vorher prüfen, nicht raten.
**Quellen:** `docs/agent-preflight-protocol.md` §8

### G-NEW-14 — upload-artifact lädt .next/ nicht (dotdir)
**Erstmals beobachtet:** 2026-04-24 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `github-actions`, `ci`, `nextjs`
**Was passiert:** `.next/` ist dotdir, Linux-hidden → `actions/upload-artifact@v4` ignoriert ohne Flag.
**Fix:** `include-hidden-files: true` in upload-artifact step.
**Quellen:** `docs/agent-preflight-protocol.md` §14

### G-NEW-15 — pnpm.onlyBuiltDependencies fehlt → esbuild ungebaut
**Erstmals beobachtet:** 2026-04-24 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `pnpm`, `esbuild`, `nextjs`
**Was passiert:** pnpm überspringt postinstall-Builds standardmäßig (security) → esbuild/sharp ungebaut → Next.js build leer.
**Fix:** Root `package.json` → `"pnpm": { "onlyBuiltDependencies": ["esbuild", "sharp"] }`.
**Quellen:** `docs/agent-preflight-protocol.md` §14

### G-NEW-16 — Vitest pickt e2e Specs auf → jsdom-Fehler
**Erstmals beobachtet:** 2026-04-25 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `vitest`, `playwright`
**Was passiert:** Vitest scannt alles inkl. e2e/, lädt Playwright-Specs in jsdom → Errors.
**Fix:** `test.exclude: ["**/node_modules/**", "**/e2e/**", "**/*.spec.ts"]` in vitest.config.
**Quellen:** `docs/agent-preflight-protocol.md` §14

### G-NEW-17 — md [locale] in Windows-shell scheitert
**Erstmals beobachtet:** 2026-04-26 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `windows`, `cmd`, `powershell`, `nextjs-i18n`
**Was passiert:** `md [locale]` und `mkdir "[locale]"` brechen in cmd + PS — Brackets als Glob-Chars interpretiert.
**Fix:** Node.js `fs.mkdirSync('[locale]', { recursive: true })` via `.cjs`-Script.
**Quellen:** `docs/agent-preflight-protocol.md` §15

### G-NEW-18 — process.env.X! Biome noNonNullAssertion
**Erstmals beobachtet:** 2026-04-26 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `biome`, `typescript`
**Was passiert:** `process.env.KEY!` triggert `noNonNullAssertion`-Warn auf Modul-Ebene.
**Fix:** Lazy Getter: `function getKey() { const k = process.env.KEY; if (!k) throw new Error('KEY missing'); return k; }`
**Quellen:** `docs/agent-preflight-protocol.md` §15

### G-NEW-19 — startTransition in useCallback-Deps
**Erstmals beobachtet:** 2026-04-26 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `react`, `biome`
**Was passiert:** `useExhaustiveDependencies` flaggt startTransition fälschlich als unstable.
**Fix:** Aus Dep-Array entfernen — startTransition ist stable wie setState.
**Quellen:** `docs/agent-preflight-protocol.md` §15

### G-NEW-20 — @/* alias misses app/ routes
**Erstmals beobachtet:** 2026-04-27 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `typescript`, `nextjs`, `tsconfig`
**Was passiert:** Single alias `["./src/*"]` findet `app/i18n/routing` nicht.
**Fix:** Dual alias `"@/*": ["./*", "./src/*"]` in tsconfig paths.
**Quellen:** `docs/agent-preflight-protocol.md` §15

### G-NEW-21 — Next.js middleware false redirects on prefetch
**Erstmals beobachtet:** 2026-04-26 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `nextjs`, `middleware`, `auth`
**Was passiert:** Link-Prefetches triggern Auth-Redirects → Redirect-Loop.
**Fix:** Auth-Guard NICHT in middleware, sondern in Server-Component-Layout.
**Quellen:** `docs/agent-preflight-protocol.md` §15

### G-NEW-22 — Supabase cookies lost after locale redirect
**Erstmals beobachtet:** 2026-04-26 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `supabase`, `nextjs`, `cookies`, `i18n`
**Was passiert:** `/` → `/de/` Redirect droppt Supabase-Session-Cookies.
**Fix:** Supabase-Cookies in i18n-Middleware-Response mergen (ADR 0004 Pattern).
**Quellen:** `docs/agent-preflight-protocol.md` §15, `docs/adr/0004-auth-phase4.md`

### G-NEW-23 — Sanity CMS tsc node_modules-noise
**Erstmals beobachtet:** 2026-04-29 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `sanity`, `typescript`, `node22`
**Was passiert:** `tsc --noEmit` in apps/cms wirft ~100 Errors, alle aus Sanity-internen node_modules (3.99 + Node 22 Type-Gap).
**Fix:** Filter `findstr /i "schemas\\"` — 0 errors in own code ist der real check.
**Quellen:** `docs/agent-preflight-protocol.md` §15

### G-NEW-24 — Service-Role Key in "use client"
**Erstmals beobachtet:** 2026-04-29 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `supabase`, `rls`, `security`
**Was passiert:** `createAdminClient()` in `"use client"` File → RLS gebypassed für alle User.
**Fix:** Admin-Client NUR in Route Handlers + Server Actions. Lint-Rule erzwingen.
**Quellen:** `docs/agent-preflight-protocol.md` §15

### G-NEW-25 — vi.mock() call order in Vitest
**Erstmals beobachtet:** 2026-04-29 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `vitest`, `mock`
**Was passiert:** `vi.mock()` nach Subject-Import → Mock nicht angewendet.
**Fix:** `vi.mock()` IMMER vor allen Subject-Imports im Test.
**Quellen:** `docs/agent-preflight-protocol.md` §15

### G-NEW-26 — HMAC webhook replay attack
**Erstmals beobachtet:** 2026-04-29 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `security`, `webhook`, `hmac`
**Was passiert:** HMAC-verifizierter Webhook ohne Timestamp-Check → Replay möglich.
**Fix:** `Math.abs(Date.now()/1000 - ts) > 300 → 401`. Immer Timestamp validieren.
**Quellen:** `docs/agent-preflight-protocol.md` §15

### G-NEW-27 — R2 presigned URL expiry 3600s
**Erstmals beobachtet:** 2026-04-29 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `r2`, `cloudflare`, `presigned-url`
**Was passiert:** Cache der uploadUrl → nach 1h ungültig, Uploads schlagen fehl.
**Fix:** Nie cachen. Pro Upload frische POST `/api/assets/upload`.
**Quellen:** `docs/agent-preflight-protocol.md` §15

### G-NEW-28 — useTransition + async + Vitest act() warning
**Erstmals beobachtet:** 2026-04-29 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `react`, `vitest`, `testing`
**Was passiert:** `startTransition(async () => ...)` in Tests → "not wrapped in act()" warning.
**Fix:** `waitFor` um Assertions nach Transition.
**Quellen:** `docs/agent-preflight-protocol.md` §15

### G-NEW-29 — wrangler from C:\Windows\System32 schreibt cache → permission error
**Erstmals beobachtet:** 2026-05-11 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `wrangler`, `cloudflare`, `windows`
**Was passiert:** Wrangler versucht `.wrangler/cache` in cwd anzulegen. Aus System32 = Permission-Denied.
**Fix:** Immer `pushd D:\Elbtronika\Elbtonika` vor wrangler-Calls.
**Quellen:** Memory `reference_hosting.md`

### G-NEW-30 — wrangler pages deploy braucht CLOUDFLARE_ACCOUNT_ID
**Erstmals beobachtet:** 2026-05-11 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `wrangler`, `cloudflare`, `env`
**Was passiert:** `wrangler pages deploy` failt wenn Account-Inference nicht greift.
**Fix:** `set "CLOUDFLARE_ACCOUNT_ID={{CF_ACCOUNT_ID}}"` mit Quotes (trailing-space bug in cmd vermeiden).
**Quellen:** Memory `reference_hosting.md`

### G-NEW-31 — wrangler pages hat kein domain subcommand v4
**Erstmals beobachtet:** 2026-05-11 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `wrangler`, `cloudflare`
**Was passiert:** `wrangler pages domain add` existiert nicht in v4.
**Fix:** Custom Domain via CF Dashboard UI oder direkter CF API Call.
**Quellen:** Memory `reference_hosting.md`

### G-NEW-32 — wrangler OAuth token expiry 24h
**Erstmals beobachtet:** 2026-05-11 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `wrangler`, `cloudflare`, `oauth`
**Was passiert:** `~/.wrangler/config/default.toml` refresh nicht auto. Direkte API-Calls mit altem Token → 403.
**Fix:** `wrangler whoami` first triggert Refresh. Alternative: API-Token (kein OAuth).
**Quellen:** Memory `reference_hosting.md`

### G-NEW-33 — @vitejs/plugin-react@4.x + vite@8 TS2769
**Erstmals beobachtet:** 2026-04-25 in ELBTRONIKA
**Kategorie:** GOTCHA · Tags: `vite`, `vitest`, `typescript`
**Was passiert:** `@vitejs/plugin-react@4.x` + vite@8 → TS2769 overload error in vitest.config.
**Fix:** Plugin auf latest upgraden (requires vite@^8).
**Quellen:** `docs/agent-preflight-protocol.md` §7

---

## 2. KNOWLEDGE/WHAT_WORKED.md — anhängen

### W-NEW-01 — write_file → git commit -F D:\msg.txt
**Erstmals beobachtet:** 2026-04-24 in ELBTRONIKA
**Kategorie:** WORKED · Tags: `git`, `windows`, `cmd`
**Pattern:** Multi-line + Sonderzeichen-sichere Commit-Messages unter Windows cmd.
**Quellen:** `docs/agent-preflight-protocol.md` §3

### W-NEW-02 — gh run list/view --log-failed als CI-Monitor
**Erstmals beobachtet:** 2026-04-24 in ELBTRONIKA
**Kategorie:** WORKED · Tags: `github-actions`, `ci`, `gh-cli`
**Pattern:** `gh run view <id> --log-failed --repo <org>/<repo>` 10× schneller als Browser. `gh run list --limit 5` für poll.
**Quellen:** `docs/agent-preflight-protocol.md` §5

### W-NEW-03 — biome check --write --unsafe lokal vor commit
**Erstmals beobachtet:** 2026-04-26 in ELBTRONIKA
**Kategorie:** WORKED · Tags: `biome`, `pre-commit`
**Pattern:** Nach Datei-Änderung sofort `node_modules\.bin\biome check --write --unsafe <file>` → fängt Lint-Errors lokal statt in CI.
**Quellen:** `docs/phase-3-lessons-learned.md`

### W-NEW-04 — pnpm.overrides für Multi-Version-Resolution
**Erstmals beobachtet:** 2026-04-25 in ELBTRONIKA
**Kategorie:** WORKED · Tags: `pnpm`, `monorepo`
**Pattern:** `"pnpm": { "overrides": { "vite": "^8.0.0" } }` erzwingt single Version monorepo-wide. Löst Type-Konflikte zwischen Major-Versions.
**Quellen:** `docs/agent-preflight-protocol.md` §6

### W-NEW-05 — DR-Blast Playwright multi-tool parallel
**Erstmals beobachtet:** 2026-05-13 in ELBTRONIKA
**Kategorie:** WORKED · Tags: `deep-research`, `playwright`, `automation`
**Pattern:** `pnpm dr:blast 1 2 4` feuert versionierte Prompts (scripts/dr-prompts.mjs) parallel an Gemini/Kimi/Copilot via persistentem Playwright-Profil. Schneller als single-LLM-Loop. "DR vor ADR" als Best Practice.
**Quellen:** `D:\Elbtronika\Elbtonika\CLAUDE.md` DR-Blast, Memory `reference_dr_blast.md`

### W-NEW-06 — ToolSearch bulk loading (max_results: 30)
**Erstmals beobachtet:** 2026-04-26 in ELBTRONIKA
**Kategorie:** WORKED · Tags: `mcp`, `cowork`
**Pattern:** `ToolSearch({ query: "computer-use", max_results: 30 })` lädt ganzes Toolkit in einem Round-trip. Statt single-Tool selects.
**Quellen:** `docs/agent-preflight-protocol.md` §10

### W-NEW-07 — Conditional Spread für TS exactOptionalPropertyTypes
**Erstmals beobachtet:** 2026-04-26 in ELBTRONIKA
**Kategorie:** WORKED · Tags: `typescript`, `strict-mode`
**Pattern:** `{ ...(env.X ? { token: env.X } : {}) }` umgeht undefined-not-assignable bei optionalen Props.
**Quellen:** `docs/phase-3-lessons-learned.md` §6

### W-NEW-08 — Dual-Layer Content (Sanity + Supabase via HMAC webhook)
**Erstmals beobachtet:** 2026-04-29 in ELBTRONIKA
**Kategorie:** WORKED · Tags: `cms`, `architecture`, `webhook`
**Pattern:** Editorial-Content in Sanity (Rooms, Artworks, Stories), Transactional-Data in Supabase (Orders, Profiles). Sync via Sanity-Webhook → `/api/webhooks/sanity` (HMAC-SHA256 verified + Timestamp-Check).
**Quellen:** `docs/adr/0005-content-model.md`, `AGENTS.md`

### W-NEW-09 — R2 presigned PUT für Zero-Egress Asset-Upload
**Erstmals beobachtet:** 2026-04-29 in ELBTRONIKA
**Kategorie:** WORKED · Tags: `r2`, `cloudflare`, `asset-upload`
**Pattern:** Server gibt presigned PUT URL aus, Client lädt direkt zu R2 → zero egress + 1h expiry. `/api/assets/upload` Endpoint, niemals URL cachen.
**Quellen:** `AGENTS.md`, `docs/adr/0005-content-model.md`

### W-NEW-10 — Hermes Trust Boundary für MCP-Invocations
**Erstmals beobachtet:** 2026-04-30 in ELBTRONIKA
**Kategorie:** WORKED · Tags: `mcp`, `security`, `agent-runtime`
**Pattern:** `/api/mcp/invoke` requires Session + Role-Gate. Jeder Call: actorId/role/server/tool/status/duration in structured audit-log. Allowlist enforced. Idempotency via `agent_tasks` atomic claim-lock.
**Quellen:** `AGENTS.md` §Hermes Trust, `docs/adrs/adr-0021-hermes-agent.md`

### W-NEW-11 — Mode-Switching via CSS opacity statt remount
**Erstmals beobachtet:** 2026-04-29 in ELBTRONIKA
**Kategorie:** WORKED · Tags: `r3f`, `webgpu`, `performance`
**Pattern:** `<CanvasRoot />` mounted once in layout, never unmounts. `position: fixed; inset: 0; z-index: -1`. Mode-Toggle via 0.6s opacity-Transition. `frameloop: "demand"` (classic) ↔ `"always"` (immersive).
**Quellen:** `AGENTS.md` §3D Canvas, `docs/adr/0009-mode-transition.md`

### W-NEW-12 — AGENTS.md + CLAUDE.md Trennung
**Erstmals beobachtet:** 2026-04-30 in ELBTRONIKA
**Kategorie:** WORKED · Tags: `documentation`, `agent-onboarding`
**Pattern:** `AGENTS.md` = Codebase-Konventionen für AI-Agents (Repo-Struktur, Stack, Build-Commands, Security). `CLAUDE.md` = Project-Context (Phase-Status, Glossary, People). Klare Trennung erleichtert Onboarding fresh sessions.
**Quellen:** `AGENTS.md`, `D:\Elbtronika\Elbtonika\CLAUDE.md`

### W-NEW-13 — ELT_MODE Doppler-Variable (demo/staging/live)
**Erstmals beobachtet:** 2026-04-30 in ELBTRONIKA
**Kategorie:** WORKED · Tags: `doppler`, `env`, `pitch`
**Pattern:** Single-Codebase, 3 Runtime-Modi via `ELT_MODE`. Demo = Personas + Stripe-Mock-Connected. Staging = Mix + Test-Mode. Live = Real + Live-Mode. Saubere Trennung Pitch ↔ Prod ohne Branch-Sprünge.
**Quellen:** `AGENTS.md` §Runtime Modes, `docs/adr/0022-modes-and-prd-doppler.md`

---

## 3. KNOWLEDGE/WHAT_FAILED.md — anhängen

### F-NEW-01 — wrangler ohne pushd in System32
**Erstmals beobachtet:** 2026-05-11 in ELBTRONIKA
**Kategorie:** FAILED · Tags: `wrangler`, `windows`
**Anti-Pattern:** wrangler aus `C:\Windows\System32` ausführen.
**Konsequenz:** `.wrangler/cache` schreibt fehl, Permission-Denied.
**Vermeidung:** Immer `pushd D:\Elbtronika\Elbtonika` davor.
**Quellen:** Memory `reference_hosting.md`

### F-NEW-02 — npx biome
**Erstmals beobachtet:** 2026-04-24 in ELBTRONIKA
**Kategorie:** FAILED · Tags: `npm`, `biome`
**Anti-Pattern:** `npx biome <args>` für lokale Lint-Calls.
**Konsequenz:** Resolved zu global-old (0.3.3), config inkompatibel.
**Vermeidung:** `node_modules\.bin\biome` oder `pnpm lint`.
**Quellen:** `docs/agent-preflight-protocol.md` §6

### F-NEW-03 — git commit -m mit Sonderzeichen in cmd
**Erstmals beobachtet:** 2026-04-26 in ELBTRONIKA
**Kategorie:** FAILED · Tags: `git`, `cmd`
**Anti-Pattern:** `git commit -m "feat: add @supabase/ssr"` in Windows cmd.
**Konsequenz:** pathspec error, partial commit oder Abort.
**Vermeidung:** write_file → `git commit -F D:\msg.txt`.
**Quellen:** `docs/phase-3-lessons-learned.md` §7

### F-NEW-04 — PowerShell für pnpm
**Erstmals beobachtet:** 2026-04-24 in ELBTRONIKA
**Kategorie:** FAILED · Tags: `pnpm`, `powershell`
**Anti-Pattern:** Desktop Commander `shell: "powershell"`.
**Konsequenz:** `pnpm.ps1 cannot be loaded` (execution policy), `&&` chaining bricht, multi-word args zerlegen.
**Vermeidung:** `shell: "cmd"` immer.
**Quellen:** `docs/agent-preflight-protocol.md` §1

### F-NEW-05 — upload-artifact ohne include-hidden-files
**Erstmals beobachtet:** 2026-04-24 in ELBTRONIKA
**Kategorie:** FAILED · Tags: `github-actions`, `nextjs`
**Anti-Pattern:** `actions/upload-artifact@v4 with: path: .next/` ohne Flag.
**Konsequenz:** Linux behandelt `.next/` als hidden → leeres Artifact, downstream deploy schlägt fehl.
**Vermeidung:** `include-hidden-files: true` setzen.
**Quellen:** `docs/agent-preflight-protocol.md` §14

---

## 4. KNOWLEDGE/METHODOLOGY.md — anhängen

### M-NEW-01 — Phase-DoD-Workflow: Install→Biome→TS→Commit→Push→Watch
**Erstmals beobachtet:** 2026-04-26 in ELBTRONIKA
**Kategorie:** METHODOLOGY · Tags: `workflow`, `phase-completion`
**Pattern:** Nach jeder Code-Änderung strikt in Reihenfolge: `pnpm install` (wenn pkg geändert) → `biome check --write --unsafe` → `tsc --noEmit` → `write_file msg + git commit -F` → `git push` → `gh run watch`. Eselbrücke: **I-B-T-C-P-W**.
**Quellen:** `docs/phase-3-lessons-learned.md` §Zusammenfassung

### M-NEW-02 — "DR vor ADR"
**Erstmals beobachtet:** 2026-05-13 in ELBTRONIKA
**Kategorie:** METHODOLOGY · Tags: `architecture`, `decision-making`
**Pattern:** Vor jeder Phase-Entscheidung Deep-Research-Blast (Gemini/Kimi/Copilot parallel via Playwright) → bevor ADR geschrieben wird. Versionierte Prompts in `scripts/dr-prompts.mjs`.
**Quellen:** `D:\Elbtronika\Elbtonika\CLAUDE.md` DR-Blast

### M-NEW-03 — Critical Path Lock (Phase 0+3 parallel → blocken Phase 7)
**Erstmals beobachtet:** 2026-04-26 in ELBTRONIKA
**Kategorie:** METHODOLOGY · Tags: `project-management`, `dependency-management`
**Pattern:** Legal/KYC (Phase 0) und Infra (Phase 3) laufen parallel, beide MÜSSEN abgeschlossen sein bevor Phase 7 (Single Canvas) startet. Engineering-Progress darf blockierte Legal-Arbeit NICHT maskieren — explizit getrackt in Phase Status Tabelle.
**Quellen:** `D:\Elbtronika\Elbtonika\CLAUDE.md` Critical Path, `docs/agent-preflight-protocol.md` §19

### M-NEW-04 — ELT_MODE-Pattern: Single-Codebase, 3 Runtime-Modi
**Erstmals beobachtet:** 2026-04-30 in ELBTRONIKA
**Kategorie:** METHODOLOGY · Tags: `runtime-modes`, `feature-flags`, `demo-vs-prod`
**Pattern:** Statt 3 Branches/Repos: 1 Codebase mit `ELT_MODE` env-Var (demo/staging/live). Demo-Modus = Personas + Stripe-Mock, kann jederzeit für Pitch hochgefahren werden ohne Branch-Switch. Staging = QA + Test-Stripe-Real-KYC. Live = Public.
**Quellen:** `docs/adr/0022-modes-and-prd-doppler.md`, `AGENTS.md`

### M-NEW-05 — Documentation Rule: Notion + Airtable + Miro + local + GitHub
**Erstmals beobachtet:** 2026-04-24 in ELBTRONIKA
**Kategorie:** METHODOLOGY · Tags: `documentation`, `redundancy`
**Pattern:** Jedes Phase-DoD-Output landet in 5 Quellen: Notion (Page für Phase-Output/ADR), Airtable (Structured-Tracking), Miro (Architecture-Diagram), lokal `D:\` (Source-of-truth Markdown), GitHub (Repo-Commit). Redundanz = Single-Source-Failure-Schutz.
**Quellen:** `D:\Elbtronika\Elbtonika\CLAUDE.md` Preferences, `docs/agent-preflight-protocol.md` §12

---

## 5. KNOWLEDGE/TOOLS/*.md — neue Files

### TOOLS/claude-in-chrome.md — file_upload Workaround
**Erstmals beobachtet:** 2026-05-13 in ELBTRONIKA-Sync-Workflows
**Was:** Chrome-Extension blockt `mcp__Claude_in_Chrome__file_upload` für github.com/upload-Pages.
**Workaround:**
```js
const fae = document.querySelector('file-attachment');
const dt = new DataTransfer();
dt.items.add(new File([content], 'GOTCHAS.md', {type:'text/markdown'}));
fae.attach(dt);
```
Funktioniert für Bank-Uploads zu `github.com/DiggAiHH/Zentrale-DiggAi-Bank/upload/main/KNOWLEDGE`.

### TOOLS/workspace-web-fetch.md — Provenance-Falle
**Erstmals beobachtet:** 2026-05-19 in ELBTRONIKA-Sync
**Was:** `mcp__workspace__web_fetch` akzeptiert nur URLs aus User-Messages oder Prior-Fetch-Result. URLs aus prior fetch-Inhalt (z.B. Liste in `SYNC_BOTH_PROMPT.md`) werden NICHT korrekt in Provenance übernommen.
**Konsequenz:** SYNC_BOTH-Workflow blockiert auf Phase A bei Bank/Lou-Intit fetches.
**Workaround:** User muss URLs in separater Message paste, ODER Owner führt manuellen Sync mit Copy/Paste der Files. Dry-Run-Modus produziert Staging-File für späteren Upload.

### TOOLS/desktop-commander.md — Process Death Recovery
**Erstmals beobachtet:** 2026-04-26 in ELBTRONIKA
**Was:** `start_process` mit langem Command → "process may have exited" Meldung trotz erfolgreicher Ausführung (Wrapper-Timeout vor Process-End).
**Workaround:** Nicht panicken. `git log -1` / `gh run list --limit 1` checken — Command oft fertig vor Wrapper-Tod. Fresh `start_process` + state-verify.

---

## 6. KNOWLEDGE/AGENT_LEARNINGS/*.md — neue Files

### AGENT_LEARNINGS/codex-gpt5.md
**Erstmals beobachtet:** 2026-05-01 in ELBTRONIKA
**Stärken:** Zuverlässig für File-Audit + minimal-invasive Guards (8 von 12 Files clean nach Audit). Findet semantic drift in Cross-Agent-Reviews.
**Bias:** Workspace-bash oft unavailable → Owner muss `pnpm typecheck` manuell laufen. Conservative bei push-Triggern (wartet auf explizites GO).
**Quellen:** `memory/runs/2026-05-01_Opus_47-Run01.md` (audit von Sonnet 4.6 Runs 01-05)

### AGENT_LEARNINGS/sonnet-46.md
**Erstmals beobachtet:** 2026-04-30 in ELBTRONIKA
**Stärken:** Iterative Feature-Slices über mehrere Runs (Run-01 bis Run-05) ohne Drift. Gut für inkrementelle UI-Arbeit + Test-Stabilisierung.
**Bias:** Tendiert zu wave-files (12+ Files pro Run) — braucht expliziten Scope-Lock in Prompt, sonst feature-creep.
**Quellen:** `memory/runs/2026-05-01_Copilot_Sonnet46-Run0{1..5}.md`

### AGENT_LEARNINGS/opus-47.md
**Erstmals beobachtet:** 2026-05-01 in ELBTRONIKA
**Stärken:** Audit-Pass über fremde Agent-Commits; identifiziert semantic drift früh; preferiert defensive guards (toNumber/toStringArray Normalisierung).
**Bias:** Defensive zu pushen ohne explizite Verify-Phase. Forderte Lou's manuelle Verify bevor commit pushed.
**Quellen:** `memory/runs/2026-05-01_Opus_47-Run01.md`

---

## Anonymisierungs-Log

| Original | Maskiert |
|---|---|
| CF Account ID `6abb3679...` | `{{CF_ACCOUNT_ID}}` |
| Co-Builder Email `laith.alshdaifat@hotmail.com` | `{{COBUILDER_EMAIL}}` (außer im internen Daily-Log) |
| Sanity Project `xbjul8yd` | `{{SANITY_PROJECT_ID}}` |
| Stripe-Keys | nicht in Lessons (sauber) |
| Anwalt/Steuerberater | TBD (nicht namentlich) |
| Patient-Daten | n/a (ELBTRONIKA = Gallery, kein Medical) |
