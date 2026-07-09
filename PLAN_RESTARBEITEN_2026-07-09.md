# ELBTRONIKA — Ist-Analyse & Restarbeiten-Plan

**Datum:** 2026-07-09 · **Analysiert:** komplettes Monorepo (Docs, apps/web, alle 12 Packages, Supabase, Tests) + Verifikation durch lokalen Testlauf im Sandbox-Klon.

---

## 1. Kurzfassung

Das Projekt ist deutlich weiter als CLAUDE.md behauptet: Phasen 1–19 sind laut STATUS.md done, der Code ist grün (165/165 Unit-Tests, tsc 0 Fehler). **Aber:** Die Arbeit vom 26.06. liegt seit 44 Tagen uncommitted im Working Tree, `main` hängt ~82 Commits zurück, und der wichtigste User-Flow — **Checkout** — ist im Backend fertig, aber im Frontend nicht verdrahtet. Dazu kommen eine kaputte DB-Migration (investor-Rolle), nie applied Migrationen, zwei als „echt" verkaufte Fake-Implementierungen (Audio-Analyse) und ein Stripe-Idempotenz-Bug, der bei Editionsverkäufen Geld kosten kann.

Die gute Nachricht: Nichts davon ist groß. Der kritische Pfad bis „demo-/pitch-fertig ohne Asterisken" ist ca. **7–10 Arbeitstage**, plus die externen Lou-Themen (Legal, Stripe-Keys, Lee-Termin).

---

## 2. Verifizierter Ist-Stand (heute getestet, Sandbox-Klon des Working Trees)

| Check | Ergebnis |
|---|---|
| `pnpm install --frozen-lockfile` | ✅ OK (Hinweis: `@parcel/watcher`, `@swc/core` fehlen in `onlyBuiltDependencies`) |
| `tsc --noEmit` (apps/web) | ✅ 0 Fehler |
| Vitest apps/web | ✅ 85/85 (16 Dateien) |
| Vitest Packages | ✅ 80/80 (ai 24, payments 20, audio 10, flow 9, three 6, agent 5, mcp 4, contracts 2) |
| Biome check apps/web | ⚠️ **18 Fehler, 31 Warnungen** (a11y useButtonType, noImgElement, 4× noExplicitAny in flow-Routes) |
| `next build` | ❓ In der Sandbox nicht verifizierbar (45s-Limit, langsames FS). Letzter Commit 59d6884 fixt explizit Build-OOM → lokal gegenprüfen |
| Playwright E2E | ❓ Nicht lauffähig in Sandbox. Laut Commit 59d6884: 26/26 grün (24.05.) |

**Git-Zustand (kritisch):**
- HEAD = `59d6884` vom **24.05.2026** auf `feature/phase-11-ai`
- **22 modifizierte Dateien uncommitted** — das ist die komplette Juni-Session (Logger-Migration in 17 API-Routes, STATUS.md-Update). Mein Testlauf lief gegen genau diesen Stand: er ist grün, aber ungesichert.
- **3 Stashes** (u.a. „WIP before merge" auf phase-18-19-Branch)
- `main` wurde am 01.05. letztmalig gemerged (`3c5b021`), seitdem ~82 Commits nur auf dem Feature-Branch. README & Setup-Docs behaupten weiter, `main` sei die Referenz.

---

## 3. Phasenstatus (konsolidiert)

| Phase | Status |
|---|---|
| 0 Legal/Business | 🔴 **Offen seit Projektbeginn** — einziger durchgängiger Blocker (Rechtsform, Anwalt, Stripe-KYC, Marke) |
| 1–15, 17 | ✅ Done (Tags bis v0.13.0-demo) |
| 16 Launch-Prep | 🟡 „ready", nie abgeschlossen |
| 18/19 Demo/Pitch | ✅ Done (Namens-Drift in Docs, s. §4.3) |
| 20 Pre-Pitch-Cleanup | 🟡 Widersprüchlich: Handoff sagt „Complete", v1.4 sagt „TOP-PRIORITÄT offen", Tag v0.14.0-prepitch nie gesetzt |
| 21 Live-Switch / 22 Launch | 🔒 Blocked auf Phase 0 + Lee-OK (Runbook liegt fertig vor) |
| 8′ VR/XR | 📋 Nur Plan+ADR („Proposed"), 0 Code |

---

## 4. Gap-Analyse

### 4.1 P0 — Kritisch (blockiert Demo-Ehrlichkeit, Datenintegrität oder Geld)

**P0-1 · Uncommittete Arbeit + Git-Hygiene**
44 Tage Arbeit ungesichert; ein `git checkout .` würde die Juni-Session vernichten. `main` tot, 3 Stashes, 6 verwaiste Branches, Tag-Drift (v0.9.0 doppelt, v0.12.0 vor v0.11.0).

**P0-2 · Checkout-Frontend nicht verdrahtet** — größte funktionale Lücke
- Backend komplett fertig: `/api/checkout/session` (Order + Preisvalidierung + Split), `/api/stripe/webhook` (idempotent), `packages/payments` getestet.
- Frontend: `AddToCartButton`/`CartDrawer`/`CartOpenButton` existieren + sind unit-getestet, werden aber **von keiner Seite importiert**. Checkout-Seite = `comingSoon`-Text. CTA auf Artwork-Detail hart `disabled` („Phase 10"-Kommentar — Phase 10 ist längst done!). Keine `/checkout/success`- oder `/cancel`-Routen.

**P0-3 · Kaputte Migration `20260430_investor_role.sql`**
`profiles.role` ist ein Postgres-ENUM, die Migration setzt aber einen CHECK-Constraint mit falschen Text-Werten (`'user'` statt `'visitor'`, `'collector'` fehlt) und vergisst `ALTER TYPE profile_role ADD VALUE 'investor'`. Die investor-Rolle, auf der die komplette Pitch-Seite aufbaut, ist auf DB-Ebene so nicht vergebbar.

**P0-4 · Migrationen nie applied + Typ-Drift**
5+ Migrationen (Flow-Engine, agent_tasks, mcp_audit_log, …) laut allen Docs nie gegen dev/prd gepusht. `packages/contracts/src/supabase/types.ts` fehlen 3 Flow-Tabellen → die dokumentierten 4× `as any`. Zusätzlich: **RLS auf den 3 Flow-Tabellen ist auskommentiert** (einziger RLS-Ausreißer im Schema) und 5 Migrationen teilen den Datumspräfix `20260430` ohne Uhrzeit — Apply-Reihenfolge (alphabetisch) widerspricht der Wave-Logik in den Kommentaren.

**P0-5 · Stripe-Transfer-Idempotenz-Bug (Geld!)**
`createCheckoutSession()` setzt `orderId` nicht in `payment_intent_data.metadata`; der Webhook fällt deshalb immer auf `artworkId` zurück. Idempotency-Key = `transfer_artist_${orderId}_${amountCents}` basiert damit faktisch auf artworkId. Bei Editionen (zweiter Verkauf desselben Werks zum selben Preis) behandelt Stripe den zweiten Artist-Transfer stillschweigend als Duplikat → **Künstler bekommt kein Geld für Verkauf #2**.

**P0-6 · Fehlende Dependencies**
`apps/web` importiert `@elbtronika/three` + `@elbtronika/audio`, deklariert beide aber nicht in package.json (nur tsconfig-paths + transpilePackages maskieren das). Unter pnpm-Isolation ein latentes Auflösungsrisiko bei jedem frischen Install.

### 4.2 P1 — Wichtig (sichtbare Bugs & falsche Versprechen)

- **P1-1 HLS nicht abspielbar:** Artwork-Detail bindet `.m3u8` per rohem `<audio src>` ein → in Chrome/Firefox stumm. Der fertige `HLSLoader` aus `packages/audio` wird im Shop nie benutzt.
- **P1-2 DJ-Profil zeigt nie Werke:** Filter hart `false` (`dj/[slug]/page.tsx:46`).
- **P1-3 MoodRecommender-Links kaputt:** `/artwork/${id}` — ohne Locale, falscher Pfad, ID statt Slug.
- **P1-4 Middleware-Duplikat:** `apps/web/middleware.ts` (simpel) vs. `src/middleware.ts` (mit Supabase-Session-Refresh). Vermutlich ist die simple aktiv → Session-Refresh tot → potenzielle Login-Ablauf-Bugs.
- **P1-5 Doppelte Routen/Endpoints:** zwei Artwork-Detailseiten (`/artwork/` verwaist mit disabled-Button vs. `/shop/artwork/`), zwei DSGVO-Paare (`/api/account/*` vs. `/api/user/*`) mit abweichender Lösch-Logik.
- **P1-6 Fake-Audio-Analyse an zwei Stellen:** `/api/flow/analyze` = mulberry32-PRNG (immerhin als `simulated` deklariert); `packages/mcp` Audio-Server = derselbe Fake **ohne** Deklaration + `audio_match_artwork_to_track` liefert immer dieselben 2 hartkodierten Artworks. Die echte DSP-Implementierung `packages/flow/audio/analyzer.ts` wird **nirgends aufgerufen**, `analyzeArt` ebenso tot → `/api/flow/match` läuft praktisch immer auf 0.5-Fallbacks.
- **P1-7 Landingpage ignoriert i18n:** komplett hartkodiert Englisch trotz vollständiger de/en-Messages (186 Keys synchron). Diverse Seiten übersetzen per `locale === "de" ? … : …` statt next-intl.
- **P1-8 Veraltete UI-Texte:** Dashboard sagt „Galerie wird in Phase 7 freigeschaltet" (Gallery existiert); Checkout-Kommentare verweisen auf „Phase 10" als Zukunft.
- **P1-9 Monitoring-Dashboard:** Web Vitals hartkodiert 0, `/api/analytics/vitals` loggt nur, keine Persistenz; Route liegt als einzige außerhalb `[locale]`.
- **P1-10 Biome:** 18 Fehler (a11y-relevant: useButtonType, useMediaCaption, noLabelWithoutControl).

### 4.3 P2 — Qualität & Aufräumen

- **Doku-Chaos:** CLAUDE.md 2 Monate veraltet (führt jeden Agenten in die Irre); README/STATUS verweisen auf v1.3 als „kanonisch" obwohl v1.4 existiert; **3 kollidierende ADR-Nummernkreise** (docs/adr, docs/adrs, docs/architecture/adr — 0010–0013, 0020–0023 mehrfach vergeben, dazu 0014/0018/0019 doppelt im selben Ordner); Phase-8-Nummernkollision (Spatial Audio vs. VR/XR); Phase-14–16-Bedeutung alt vs. neu; TASKS.md intern widersprüchlich.
- **Test-Qualität:** Trust-Boundary-„Tests" sind String-Greps auf den Quelltext (fs.readFileSync + toContain) statt Verhaltenstests; demo-flow.spec nutzt weiche Assertions mit skip-reason-Annotationen, die teils veraltet sind; keine Route-Tests für ai/*, checkout/session, stripe/connect, flow/*; keine Coverage-Schwelle; keine Tests für flow-Analyzer, MCP-Tool-Server, HermesAgent-Loop, three-Szenen, ui-Package.
- **Tote/verwaiste Artefakte:** `packages/config`, `packages/browser`, `packages/sanity-studio` (0 Importe); **3× Sanity-Schema-Duplikation** (apps/cms = deployt, apps/web/sanity, packages/sanity-studio) bereits auseinandergelaufen; verwaiste `exhibition.ts`; `web-coming-soon` (laut eigenem README nach Phase 7 löschen).
- **Sonstiges:** ~30 `console.*` in packages (kein isomorpher Logger); Lighthouse-Baseline ungültig (0/null-Reports); `RoomReverb`-Doku behauptet AudioWorklet (ist DelayNode-Graph); WebGPU nur Feature-Detection, gerendert wird immer WebGL; nur 1 Galerie-Raum + Lobby; Agent-`executeStep` = naiver Substring-Match statt Tool-Calling; AI-Rate-Limit/Audit in-memory (verliert Status bei jedem Deploy/Restart).

### 4.4 Extern — nur Lou kann das (unverändert offen)

Rechtsform + Anwalt (Impressum/AGB/DSE final), Stripe-KYC + Live-Keys, 8 Stripe-Test-Connected-Accounts, Netlify↔Doppler-Sync + echte Test-Keys, Doppler prd (22 Vars), Domains laut TASKS.md, echte Demo-Assets (Lizenzen!), Investor-Magic-Link mit Lees echter Mail, Pitch-Termin.

---

## 5. Umsetzungsplan

Reihenfolge ist bewusst: erst sichern, dann den Kern-Flow, dann Datenbasis, dann Politur. Aufwände = fokussierte Solo-Tage mit Claude.

### Sprint 1 — Sichern & Aufräumen (0,5–1 Tag) ⚡ SOFORT
1. **Committen:** Die 22 Dateien reviewen (`git diff`), als `chore(logger): migrate 17 api routes to central logger + status docs` committen. Danach Stashes sichten: verwertbares cherry-picken, Rest droppen.
2. **Branch-Strategie klären:** `feature/phase-11-ai` → `main` mergen (der eine main-Commit `3c5b021` vorher reconcilen). Ab dann: main = Wahrheit, kurze Feature-Branches. 6 tote Branches löschen.
3. **Tags bereinigen** (v0.9.0-Dublette, Reihenfolge) + `v0.14.0-prepitch` setzen, sobald Sprint 1 done.
4. **Lokal verifizieren** (echter Rechner, nicht Sandbox): `pnpm build` + `pnpm test:e2e` einmal komplett grün laufen lassen.
5. `onlyBuiltDependencies` um `@parcel/watcher`, `@swc/core` ergänzen.
**DoD:** Working Tree clean, main aktuell, Build+E2E lokal bestätigt grün.

### Sprint 2 — Checkout end-to-end (2–3 Tage) 🎯 Kern-Lücke
1. `@elbtronika/three` + `@elbtronika/audio` in apps/web/package.json deklarieren (P0-6, 5 Min).
2. **Stripe-Metadata-Fix (P0-5):** `orderId` in `payment_intent_data.metadata` setzen; Webhook-Fallback auf artworkId entfernen (stattdessen Fehler loggen); Idempotency-Key-Test für den Editions-Fall schreiben.
3. **Cart einbinden:** CartOpenButton in Navbar, AddToCartButton auf Artwork-Detail (`/shop/artwork/[slug]`), CartDrawer-CTA von `disabled` auf `POST /api/checkout/session` + Redirect zur Stripe-Checkout-URL.
4. **Checkout-Seiten bauen:** `/[locale]/checkout/success` (Session-Verify via Backend, Order-Bestätigung, Download-/Zugangs-Hinweis) + `/cancel`. Demo-Mode: Test-Karten-Hinweis (4242…) beibehalten.
5. **Duplikate auflösen (P1-5):** verwaiste `/artwork/[slug]`-Route löschen (Redirect auf `/shop/artwork/[slug]`), `/api/user/*` in `/api/account/*` konsolidieren (eine Lösch-Logik, die strengere).
6. **E2E:** demo-flow.spec Checkout-Pfad von weicher Assertion auf harte umstellen (Stripe-Test-Mode).
**DoD:** Kauf-Flow klickbar von Shop-Grid bis Success-Page, Editions-Doppelverkauf-Test grün, keine disabled-CTAs mehr.

### Sprint 3 — Datenbank & Typen (1 Tag)
1. **Investor-Migration neu schreiben (P0-3):** `ALTER TYPE profile_role ADD VALUE 'investor'`; fehlerhaften CHECK-Constraint droppen. Neue Migration, alte nie applied → kann ersetzt werden, aber sauber dokumentieren.
2. **Migrations-Präfixe fixen:** die fünf `20260430_*` auf volle Timestamps umbenennen, Reihenfolge = Wave-Logik.
3. **RLS für Flow-Tabellen aktivieren** (auskommentierten Block einschalten, Policies analog agent_tasks).
4. Supabase CLI installieren → `supabase db push` (dev), `supabase gen types` → `packages/contracts` aktualisieren → **4× `as any` entfernen**.
5. `supabase/seed.sql` um `artwork_features`-Seeds ergänzen, damit `/api/flow/match` nicht mehr nur 0.5-Fallbacks matcht.
**DoD:** Alle Migrationen applied (dev), Types synchron, 0× `as any` in flow-Routes, RLS lückenlos.

### Sprint 4 — Audio & Ehrlichkeit der Features (2–3 Tage)
1. **HLS-Playback (P1-1):** Shop-Detail auf `HLSLoader` aus `packages/audio` umstellen (hls.js für Chrome/Firefox, natives HLS für Safari).
2. **Echte Audio-Analyse verdrahten (P1-6):** `/api/flow/analyze` ruft `analyzeAudio()` aus `packages/flow` gegen die R2-Audio-URL auf; PRNG-Kopie löschen. MCP-Audio-Server: entweder auf dieselbe echte Analyse umstellen ODER unübersehbar als `simulated` kennzeichnen (wie die API es vormacht) — hartkodierte Fake-Matches raus.
3. `analyzeArt` anbinden (beim Artwork-Upload/Sanity-Sync Features berechnen → `artwork_features`) — damit wird das Music-Art-Matching real.
4. **Kleine Bugs:** DJ-Profil-Filter (P1-2, GROQ-Query erweitern), MoodRecommender-Links (P1-3), Dashboard-Phase-7-Text (P1-8).
5. **Middleware konsolidieren (P1-4):** eine middleware.ts mit next-intl + Supabase-Session-Refresh, die andere löschen; Session-Ablauf manuell testen.
**DoD:** Set-Audio spielt in allen Browsern, analyze liefert echte Werte (source: "measured"), Matching nutzt echte Features, DJ-Seiten zeigen Werke.

### Sprint 5 — Politur & Doku (1–2 Tage)
1. **Biome auf 0 Fehler** (a11y-Fixes sind schnell: button type, captions, labels).
2. **i18n:** Landingpage auf useTranslations umstellen; Inline-Ternaries schrittweise in messages/*.json überführen.
3. **Doku-Reset in einem Rutsch:** CLAUDE.md neu schreiben (aktueller Stand, kurz); Architekturplan **v1.5** als einzige Wahrheit (Phasen-Nummerierung final, VR/XR wird „Phase 23", 14–16-Altbedeutungen gestrichen); ADRs in EINEN Ordner mergen mit durchgängiger Nummerierung; README/STATUS auf v1.5 + main zeigen; TASKS.md bereinigen.
4. **Tote Artefakte:** packages/config + browser + sanity-studio entweder löschen oder als experimental markieren; Sanity-Schemas auf apps/cms als Single Source konsolidieren; exhibition.ts löschen.
5. **Monitoring:** Vitals in Supabase-Tabelle persistieren, Dashboard liest echte Werte; Route unter `[locale]` ziehen.
**DoD:** Biome 0/0, jeder neue Agent/Reviewer findet in CLAUDE.md + v1.5 die Wahrheit, keine toten Packages.

### Sprint 6 — Test-Härtung & Launch-Prep (1–2 Tage, parallel zu Lou-Aktionen)
1. String-Grep-„Guards" durch echte Handler-Tests ersetzen (Request/Response mit gemocktem Supabase).
2. Route-Tests für checkout/session, stripe/connect, ai/*, flow/* (Happy Path + Auth-Fail).
3. Coverage-Schwelle in Vitest (Start: 60%, Ziel 75%).
4. demo-flow.spec: alle veralteten skip-reasons entfernen, harte Assertions.
5. Lighthouse-Baseline neu erzeugen (lokal), Budgets in CI reaktivieren; Phase 16 formal abschließen.
6. packages-console.* auf isomorphen Logger.
**DoD:** Testsuite beweist Verhalten statt Wortlaut, Phase 16 + 20 formal geschlossen, Repo launch-ready bis auf Phase 0.

### Danach (blocked bis Lou/extern)
Phase 21 Live-Switch exakt nach vorhandenem Runbook (Doppler prd, Sanity unpublish, Webhook-Swap) → Phase 22 Launch → Backlog (VR/XR, Multi-Cart, weitere Galerie-Räume, echtes WebGPU-Rendering, Agent-Tool-Calling statt Substring-Match, persistentes Rate-Limiting via Upstash/Supabase).

---

## 6. Entscheidungen, die nur du treffen kannst

1. **Split ohne DJ:** Aktuell bekommt die Plattform 40% wenn kein DJ verknüpft ist (statt fix 20%). Gewollt oder Bug? → bestimmt, ob `computeRevenueSplit` angefasst wird.
2. **MCP-Audio-Fake:** echt machen (Sprint 4) oder transparent als Demo kennzeichnen? Für den Investor-Pitch reicht Kennzeichnung; für Launch nicht.
3. **Phasen-Nummerierung v1.5:** VR/XR als Phase 23 (mein Vorschlag) oder 8b?
4. **web-coming-soon:** bleibt bis Launch auf Cloudflare Pages (DNS liegt eh dort) oder schon vorher durch die echte App ersetzen?

## 7. In dieser Session nicht prüfbar (bitte lokal einmal laufen lassen)

`pnpm build` (Sandbox-Zeitlimit), `pnpm test:e2e` (kein Browser in Sandbox), Netlify-/Cloudflare-Deploy-Status, Supabase-Remote-Zustand (welche Migrationen wirklich applied sind), Doppler-Secrets-Vollständigkeit, GitHub-Actions-Status.

## 8. Wichtigste Quellen

STATUS.md · OPTIMIZATION_REPORT_2026-06-26.md · ELBTRONIKA_Architekturplan_v1.4.md (§6 Blocker, §9 offene Fragen) · docs/runbooks/live-switch-post-lee-ok.md · packages/payments/src/{transfers,webhook}.ts · apps/web/app/api/flow/analyze/route.ts · packages/mcp/src/servers/audio.ts · supabase/migrations/20260430_investor_role.sql · apps/web/app/[locale]/(shop)/… (Cart-Komponenten)
