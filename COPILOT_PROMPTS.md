# ELBTRONIKA – GitHub Copilot Prompt Pack

> **Zweck:** Prompts für GitHub Copilot Chat in VS Code, eine pro Modell und Phase. Selbst-bootstrappend.
> **Setup:** VS Code öffnen, Repository als Workspace laden, Copilot Chat öffnen, Modell wechseln, Prompt einfügen.
> **Datum:** 2026-04-29
> **Wichtig:** Jeder Prompt hat ein **STOP**-Pattern. Modell macht zuerst Sub-Plan, wartet auf Lou's „GO".

## Inhaltsverzeichnis

1. § 1 – Bootstrap-Prompt (universell, jede Session zuerst)
2. § 2 – Phase-Prompts für Sonnet 4.6
3. § 3 – Phase-Prompts für GPT 5.4
4. § 4 – Phase-Prompts für Codex 5.3
5. § 5 – Spezial-Prompts (Reviews, Tests, Doku)
6. § 6 – Coordinator-Notes für Lou

---

# § 1 – Universal Bootstrap-Prompt

**Verwendung:** Bei jedem neuen Copilot-Chat ZUERST einfügen, egal welches Modell. Der Prompt orientiert das Modell, prüft Repo-Stand, schlägt nächste Phase vor.

```
=== ELBTRONIKA BOOTSTRAP ===

Du bist Senior Full-Stack Developer für ELBTRONIKA. Solo-Build mit Lou (Owner).
Stand: 29.04.2026.

PFLICHT-LESE-SEQUENZ (in dieser Reihenfolge):
1. STATUS.md            → aktueller Phasen-Stand
2. ELBTRONIKA_Architekturplan_v1.0.md  → Master-Architektur
3. ELBTRONIKA_Architekturplan_v1.1.md  → aktive Version mit Updates

Alle drei Files liegen im Workspace-Root.

DEINE ERSTE AKTION:
1. Lies die drei Files vollständig.
2. Inspiziere Repo-Stand: git log --oneline -20 ; git status ; ls apps/ packages/
3. Erstelle Status-Bericht mit:
   - Was schon existiert (Phasen, Files)
   - Was als nächstes laut Plan dran ist
   - Welche Phase DU heute übernehmen sollst (Vorschlag)
   - Welche Konflikte mit anderen parallelen Sessions möglich sind

DANACH STOPPEN. Keine Code-Änderungen.

Antwort-Format:
## Status-Bericht
- Repository-Stand: ...
- Erkannte abgeschlossene Phasen: ...
- Erkannte offene Phasen: ...

## Vorschlag für diese Session
- Phase: ...
- Begründung: ...
- Geschätzter Aufwand: ...
- Nötige MCP/Tools/CLIs: ...
- Mögliche Konflikte mit Parallel-Sessions: ...

## Frage an Lou
Soll ich Phase X übernehmen? Bestätige mit "GO Phase X" oder weise andere Phase zu.

Lou wird dir explizit zuweisen. Erst dann arbeitest du.
=== ENDE BOOTSTRAP ===
```

---

# § 2 – Sonnet 4.6 Phase-Prompts

Sonnet 4.6 ist stark in Architektur, komplexem Reasoning, Refactoring. Empfohlen für: Phase 1, 3, 7, 8, 9, 10, 13.

## § 2.1 Sonnet → Phase 1: Repo & Tooling

```
=== SONNET 4.6 :: PHASE 1 :: REPO & TOOLING ===

Bootstrap zuerst (siehe § 1). Wenn STATUS.md zeigt Phase 1 = ⬜ oder 🟡:

ZIEL Phase 1:
Monorepo-Fundament für ELBTRONIKA aufsetzen, lauffähig auf Netlify Preview.

LIES JETZT:
- ELBTRONIKA_Architekturplan_v1.0.md → Sektion 3 (Repo-Struktur) + Phase 1
- ELBTRONIKA_Architekturplan_v1.1.md → Sektion 4.5 (i18n!) + Sektion 6 (MCP-Map Phase 1)

DELIVERABLES Phase 1:
✓ pnpm-workspace.yaml mit apps/web, apps/edge, packages/ui, packages/three, packages/audio, packages/contracts, packages/sanity-studio, packages/config
✓ Turborepo: turbo.json mit Pipelines build/dev/test/lint
✓ Next.js 15.3 in apps/web (App Router, TypeScript strict, Tailwind v4, Biome)
✓ next-intl konfiguriert mit /de und /en Routes (Default DE)
✓ Biome v2 (biome.json) gemeinsam für alle Packages
✓ Husky + lint-staged Pre-commit (Biome + Typecheck)
✓ Commitlint Conventional Commits
✓ tsconfig.base.json mit strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes
✓ packages/contracts mit Zod-Schema-Stub für User, Artwork, Artist, DJ, Order
✓ packages/ui Stub
✓ packages/config (Tailwind, TS, Biome configs)
✓ .github/workflows/ci.yml: install, typecheck, lint, test, build
✓ Netlify-Verbindung: netlify.toml, Preview-Deploy auf PR funktioniert
✓ Branch Protection auf main (Status-Checks required)
✓ ADR docs/adr/0001-monorepo-tooling.md
✓ README.md mit Quick-Start

DOD (Definition of Done):
- pnpm install läuft sauber
- pnpm dev startet Next.js
- pnpm test läuft (auch wenn leer)
- pnpm build erfolgreich
- CI grün auf Test-PR
- Netlify Preview-URL erreichbar
- Tag v0.1.0 vorbereitet (NICHT pushen ohne Lou's GO)

ARBEITSWEISE:
1. Sub-Plan als Todo-Liste schreiben
2. Auf Lou's "GO" warten
3. Schritt für Schritt, häufig committen (Conventional Commits)
4. Branch: feature/phase-1-repo-tooling
5. Push zu GitHub, Pull Request gegen main, Preview-Deploy verifizieren
6. STATUS.md am Ende updaten

KONFLIKT-PRÄVENTION:
- Du arbeitest exklusiv in: Repo-Root, alle config files, apps/web Skelett
- NICHT anfassen: apps/web/app/(routes Subverzeichnisse), die andere Sessions parallel bauen

STOPPE NACH SUB-PLAN. Warte auf "GO Phase 1".
=== ENDE ===
```

## § 2.2 Sonnet → Phase 3: Infrastruktur (Supabase + R2 + Sanity + Doppler)

```
=== SONNET 4.6 :: PHASE 3 :: INFRASTRUKTUR ===

Voraussetzung: Phase 1 ✅ in STATUS.md.

LIES:
- v1.0 Phase 3
- v1.1 § 6 (Phase 3 MCP-Map)

ZIEL:
Vollständige Cloud-Infra für Dev + Staging.

DELIVERABLES:
✓ Supabase Projekt EU-Frankfurt angelegt (manuell oder via supabase CLI)
✓ supabase/migrations/0001_init.sql mit Tabellen profiles, artists, djs, artworks, sets, orders, transactions, consent_log, audit_events, webhook_events, ai_decisions
✓ RLS Policies pro Tabelle (deny-all default, explicit owner-read, public-read-published, admin-all) — separat dokumentiert in supabase/migrations/0002_rls.sql
✓ Triggers für updated_at + finanzielles Audit-Log
✓ pgvector Extension aktiviert
✓ supabase/seed.sql deterministisch + idempotent
✓ Sanity Projekt EU-Dataset, Embedded Studio in packages/sanity-studio
✓ Sanity Schemas: artwork, artist, dj, room, set, story (PortableText) mit lokalisierten Strings (DE/EN)
✓ Cloudflare R2 Bucket "elbtronika-assets-dev" + Custom Domain cdn.elbtronika.art (DNS bei Cloudflare)
✓ R2 CORS-Policy nur für https://elbtronika.art + Netlify-Preview-URLs
✓ Doppler Project "elbtronika" mit Environments dev/preview/prd
✓ Alle Service-API-Keys in Doppler (Stripe Test, Supabase Anon+Service, Sanity Token, Cloudflare API, Anthropic, Resend o.Ä.)
✓ Doppler Integration in Netlify Build + GitHub Actions (DOPPLER_TOKEN_DEV/STG/PRD)
✓ apps/web/src/lib/supabase/server.ts + browser.ts (SSR-fähige Clients via @supabase/ssr)
✓ apps/web/src/lib/supabase/admin.ts (Service-Role)
✓ ADR docs/adr/0003-infrastruktur.md
✓ docs/architecture/system-overview.mmd (Mermaid)

DOD:
- pnpm dev verbindet zu Supabase Dev
- Test-Insert + RLS-Read über Test-Suite verifiziert (vitest + supabase-js)
- R2-Upload via Test-Script läuft
- Sanity Studio im Browser zugänglich
- Doppler-Secrets in Preview-Deploy verfügbar
- Schema-Migrations im Repo, idempotent

ACHTUNG:
- Production-Werte erst kurz vor Launch. Heute nur Dev + Preview.
- KEINE echten Stripe-Keys in Doppler (nur Test-Mode).

KONFLIKT-PRÄVENTION:
- Exklusiv in: supabase/, packages/sanity-studio/, apps/web/src/lib/supabase/
- Nicht anfassen: apps/web/app/(routes), die parallel gebaut werden

Sub-Plan zuerst. Warte auf "GO Phase 3".
=== ENDE ===
```

## § 2.3 Sonnet → Phase 7: Immersive Mode (3D Single Canvas)

```
=== SONNET 4.6 :: PHASE 7 :: IMMERSIVE MODE ===

Voraussetzung: Phase 1 + 2 + 3 + 6 ✅. Sonst stoppen und reportieren.

LIES:
- v1.0 Phase 7 vollständig
- v1.0 Sektion 1 ADR (Three.js r184 + WebGPU + R3F v9)
- v1.1 § 6 Phase 7

DAS IST DIE ARCHITEKTONISCH HEIKELSTE PHASE. Keine Shortcuts.

DELIVERABLES:
✓ apps/web/app/layout.tsx mit persistentem <CanvasRoot /> (position: fixed, z-index: -1, pointer-events: none)
✓ packages/three/src/CanvasRoot.tsx — niemals unmount, dynamic Scene-Push aus globalem Store
✓ packages/three/src/scenes/{Lobby,Room1,...}.tsx — modulare Räume aus Sanity-Daten
✓ WebGPURenderer Setup mit automatischem WebGL2-Fallback
✓ packages/three/src/lib/feature-detection.ts (navigator.gpu Check, Cookie-Persistierung)
✓ packages/three/src/loaders/* — KTX2 + Draco + Web Worker
✓ packages/three/src/post/Bloom.tsx — TSL-basierte Bloom-Pipeline (NICHT EffectComposer)
✓ <Preload all /> beim initialen Landing
✓ packages/three/src/store.ts (Zustand) — proximity, mode, currentRoom, listenerPosition
✓ packages/three/src/components/Artwork.tsx — Mesh + Proximity-Trigger
✓ packages/three/src/controls/ScrollSpline.tsx — Kamera folgt Spline (MVP)
✓ Mobile: Tilt-Parallax + Auto-Scroll Fallback
✓ HUD-Komponente: Minimap + Room-Indikator
✓ Performance-Budget: Stats.js dev-only, FPS-Test mit Playwright
✓ Erste Implementierung: 1 Lobby + 1 Room mit 3 Artworks
✓ ADR docs/adr/0007-immersive-architektur.md

ZWINGEND BEACHTEN:
- KEIN setState im useFrame-Hook → Mutable Refs nutzen
- KEIN Canvas Unmount bei Mode-Wechsel — nur Camera + Scene mutieren
- Geometrien + Materialien mit useMemo kappen
- Max VRAM 500 MB, Target 60 FPS Desktop, 45 FPS Mobile
- @react-three/drei <View> Pattern für späteren 2D-Mix vorbereiten

DOD:
- 1 Raum mit 3 Artworks navigierbar (Scroll auf Desktop, Tilt auf Mobile)
- 60 FPS auf Mid-Range-Hardware (verifiziert mit Playwright FPS-Test)
- Visual Regression Test grün
- Memory Leak Check: 5 min Navigation, kein VRAM-Anstieg
- WebGL2 Fallback funktioniert (manueller Browser-Override)
- ADR geschrieben

KONFLIKT-PRÄVENTION:
- Exklusiv in: packages/three/, apps/web/app/(immersive)/
- Touch nur lesen: packages/contracts/ (Schemas), Sanity-Client

Sub-Plan zuerst. Warte auf "GO Phase 7".
=== ENDE ===
```

## § 2.4 Sonnet → Phase 8: Spatial Audio

```
=== SONNET 4.6 :: PHASE 8 :: SPATIAL AUDIO ===

Voraussetzung: Phase 7 lebt. Mindestens CanvasRoot existiert.

LIES:
- v1.0 Phase 8 vollständig (Audio-Math!)
- v1.0 Sektion 1 (Audio-Stack-Entscheidung)

ARCHITEKTUR-PRINZIP:
PannerNode native (NICHT AudioWorklet — siehe Research-Dossier 128-Sample-Bug).
Inverse Square Law für Distance Model.
DynamicsCompressor zwingend pre-Destination.

DELIVERABLES:
✓ packages/audio/src/context.ts — globaler AudioContext-Singleton, suspended-by-default
✓ packages/audio/src/unlock.tsx — Entry-Overlay-Komponente, audioContext.resume() nach User-Click, sessionStorage-Flag
✓ packages/audio/src/spatial.tsx — PositionalAudio Wrapper, PannerNode Setup
✓ packages/audio/src/proximity.ts — Distance-Calc + Gain-Math (refDistance / (refDistance + rolloffFactor * (distance - refDistance)))
✓ packages/audio/src/hls.ts — hls.js v1.6+ als Web Worker, MediaElementAudioSourceNode erst nach MANIFEST_PARSED
✓ packages/audio/src/master-bus.ts — DynamicsCompressorNode pre-Destination
✓ apps/web/app/api/proxy/soundcloud/[trackId]/route.ts — Edge Function reverse-proxy, IP-Maskierung (DSGVO)
✓ Cache-Header per Asset-Typ (Manifest 2s + SWR, Segmente 365d immutable)
✓ Now-Playing HUD-Komponente
✓ Tests:
  - Unit: Gain-Formel exakt (Vitest)
  - Integration: HLS-Stream startet nach Click, stoppt bei Distance > maxDistance
  - E2E: Mobile Safari Test (Playwright Webkit) — kritisch wegen iOS-Restrictions
✓ ADR docs/adr/0008-spatial-audio.md

DOD:
- 3 Artworks im Room mit Audio
- Smooth Fade beim Annähern (kein Knack)
- Cross-Fade zwischen 2 nahen Sources
- Safari iOS startet Audio nach Tap auf Entry-Overlay
- Master-Compressor verhindert Clipping bei mehreren simultanen Sources

KONFLIKT-PRÄVENTION:
- Exklusiv in: packages/audio/, apps/web/app/api/proxy/
- packages/three liest nur, Mod nicht erlaubt ohne Coordination

Sub-Plan zuerst. Warte auf "GO Phase 8".
=== ENDE ===
```

## § 2.5 Sonnet → Phase 10: Stripe Connect & Checkout

```
=== SONNET 4.6 :: PHASE 10 :: STRIPE CONNECT ===

Voraussetzung: Phase 0 (Stripe-Account) + Phase 4 (Auth) + Phase 5 (Content) ✅.
ACHTUNG: NUR Test-Mode bis Phase 15 explizit freigegeben.

LIES:
- v1.0 Phase 10 vollständig
- v1.0 Sektion 5 Compliance-Matrix (PCI, Webhook-Sicherheit)
- v1.1 § 6 Phase 10

DELIVERABLES:
✓ apps/web/src/lib/stripe/client.ts — lazy getStripe() (kein top-level new Stripe)
✓ apps/web/app/[locale]/onboarding/stripe/page.tsx — Express Account Onboarding
✓ apps/web/app/api/stripe/connect/route.ts — Account creation + Account Link
✓ apps/web/app/api/stripe/webhook/route.ts — RAW BODY (kein body-parser!), Signature-Verify
✓ Webhook-Idempotenz: webhook_events Tabelle, atomar event.id INSERT mit ON CONFLICT DO NOTHING
✓ Server Action createCheckoutSession(artworkId)
✓ apps/web/app/[locale]/(checkout)/* — Confirm, Success, Fail
✓ Transfer-Logik bei checkout.session.completed:
  - Calc artist 60% / dj 20% mit BigInt-Cent-Math
  - stripe.transfers.create x2 mit gleicher transfer_group + source_transaction
  - Order in DB persistieren
✓ Refund-Logik: charge.refunded → reverse-Transfers automatisch via transfer_group
✓ Post-Purchase:
  - Signed R2 URL für Exclusive DJ Set (Phase 10.5: physische Lieferung manuell, Download-Code generieren)
  - E-Mail via Resend mit Order-Details
✓ Tests:
  - Unit: Cent-Math (60/20/20 mit Rundung)
  - Integration: Webhook-Idempotenz (2x gleichen Event → 1x Transfer)
  - E2E: Stripe Test-Card kauft Artwork, beide Connected Accounts erhalten Transfer
✓ ADR docs/adr/0010-payment-split.md

ZWINGEND:
- Webhook-Route hat KEINEN edge-runtime export. Node Runtime wegen raw body.
- Idempotenz-Schlüssel ist event.id, NICHT order-id.
- 60/20/20 immer in Integer-Cent, nie Float.
- Stripe Live-Mode-Trigger ist eigene Phase (15). Heute nur sk_test.

KONFLIKT-PRÄVENTION:
- Exklusiv in: apps/web/src/lib/stripe/, apps/web/app/api/stripe/, apps/web/app/[locale]/(checkout)/
- Liest: profiles (für stripe_account_id)

Sub-Plan zuerst. Warte auf "GO Phase 10".
=== ENDE ===
```

---

# § 3 – GPT 5.4 Phase-Prompts

GPT 5.4: stark in UI-Code, Business-Logic, Content-orientiert. Empfohlen: Phase 2, 4, 5, 6, 11.

## § 3.1 GPT 5.4 → Phase 2: Design System

```
=== GPT 5.4 :: PHASE 2 :: DESIGN SYSTEM ===

Bootstrap (§ 1) zuerst. Wenn Phase 1 ✅ und Phase 2 ⬜:

LIES:
- v1.0 Phase 2 vollständig
- v1.1 § 7 (Claude Design — externer Workflow)

ZIEL:
Komplettes Design System: Tokens, Komponenten, Storybook, Dark-Mode default.

DELIVERABLES:
✓ packages/config/tailwind/tokens.css mit CSS Custom Properties:
  - --color-bg, --color-surface (3% white), --color-primary-cyan, --color-secondary-magenta
  - --font-display, --font-body (Inter), --font-mono (JetBrains)
  - --space-1 .. --space-32 (4px-Basis)
  - --motion-fast/normal/slow/cinematic (120/260/480/1200ms)
  - --bp-mobile/tablet/desktop/wide (360/768/1280/1920)
✓ packages/ui/src/components/:
  - Button (primary/secondary/ghost/destructive, loading, icon-prop)
  - Input, Textarea, Select, Checkbox, Slider (Radix-based)
  - Dialog, Sheet, Toast (Radix Dialog/Toast)
  - Skeleton
  - Heading, Text, Caption, Numeric (Typography)
  - Container, Stack, Grid, Spacer (Layout)
✓ Storybook 9 in packages/ui mit:
  - Story pro Komponente
  - Dark-Mode-Snapshot als Visual-Regression-Baseline (Playwright Screenshots)
  - axe-core Accessibility Test pro Story
✓ Storybook-Deploy auf eigene Netlify-Site oder Chromatic
✓ ADR docs/adr/0002-design-system.md

ZWINGEND TAILWIND v4 SYNTAX:
- Tokens als CSS Custom Properties, nicht JS-Object
- @theme Block in globals.css
- Keine Tailwind-Config-Plugins, die Tailwind v3-API erwarten

WORKFLOW MIT CLAUDE DESIGN (extern, claude.com/design):
- Komponenten-Spec hier formulieren
- Lou triggert Claude Design separat (eigenes Token-Budget)
- Lou paste'd den Output hier zurück
- Du integrierst in packages/ui, schreibst Tests

DOD:
- Storybook deployed
- Alle Komponenten WCAG 2.1 AA (axe-Tests grün)
- Visual Regression-Baseline vorhanden
- Dark Mode default, kein Light-Mode-Code-Bloat
- ADR geschrieben

KONFLIKT-PRÄVENTION:
- Exklusiv in: packages/ui/, packages/config/tailwind/
- apps/web nur Imports anpassen, keine UI-Komponenten dort schreiben

Sub-Plan zuerst. Warte auf "GO Phase 2".
=== ENDE ===
```

## § 3.2 GPT 5.4 → Phase 4: Auth & Roles

```
=== GPT 5.4 :: PHASE 4 :: AUTH & ROLES ===

Voraussetzung: Phase 1 + 3 ✅.

LIES:
- v1.0 Phase 4
- v1.1 § 6 Phase 4

DELIVERABLES:
✓ apps/web/app/[locale]/(auth)/login/page.tsx — Magic Link UI + Google + Apple OAuth
✓ apps/web/app/auth/callback/route.ts — OAuth + Magic-Link Exchange, new-user-detect
✓ apps/web/src/lib/supabase/auth-actions.ts — server actions
✓ apps/web/app/[locale]/profile/setup/page.tsx — display_name + role-Wahl (visitor/collector/artist/dj)
✓ apps/web/app/[locale]/dashboard/layout.tsx — Server Component Auth Guard
✓ apps/web/app/[locale]/dashboard/page.tsx — role-spezifisch
✓ Custom-Access-Token-Hook in Supabase: role als JWT-Claim
✓ RLS-Policies für jede Rolle (Test in tests/integration/rls.test.ts)
✓ Rate-Limiting auf Magic-Link (Supabase + Netlify Edge)
✓ Cookie-basierte Session, HttpOnly, Secure, SameSite=Lax
✓ Consent-Log-Eintrag pro Registrierung (DSGVO Opt-in-Nachweis)
✓ E2E Test: Magic Link Flow durch
✓ ADR docs/adr/0004-auth.md

DOD:
- Anmeldung via Magic Link funktioniert
- OAuth Google + Apple funktioniert
- RLS verifiziert: User A sieht keine Order von User B
- Rate-Limit: 5 Magic-Link-Requests / 5 min, dann 429
- ADR geschrieben

KONFLIKT-PRÄVENTION:
- Exklusiv in: apps/web/app/[locale]/(auth)/, apps/web/app/[locale]/dashboard/, apps/web/src/lib/supabase/auth-*

Sub-Plan zuerst. Warte auf "GO Phase 4".
=== ENDE ===
```

## § 3.3 GPT 5.4 → Phase 5: Content Model & CMS

```
=== GPT 5.4 :: PHASE 5 :: CONTENT MODEL & CMS ===

Voraussetzung: Phase 3 + 4 ✅.

LIES:
- v1.0 Phase 5
- v1.1 § 4.5 (i18n!) — Sanity-Schemas brauchen DE/EN-Felder
- v1.1 § 6 Phase 5

DELIVERABLES:
✓ packages/sanity-studio/schemas/ vollständig (artwork, artist, dj, room, set, story)
  - Lokalisierte String-Felder { de: ..., en: ... }
  - Reference-Felder Artwork ↔ Artist ↔ DJ ↔ Set ↔ Room
  - Custom Image-Field mit R2-Upload-Hook
✓ apps/web/app/api/webhooks/sanity/route.ts — HMAC-verified Sanity → Supabase Mirror
✓ apps/web/app/api/assets/upload/route.ts — Presigned R2 PUT URL (image/model/audio)
  - Server-Validation Mime + Max-Size
  - Virus-Scan Stub (Phase 13 erweitert)
✓ apps/web/app/[locale]/dashboard/artist/page.tsx — Artist-Dashboard
✓ apps/web/app/[locale]/dashboard/artist/new/page.tsx — Artwork erstellen (RHF + Zod)
✓ apps/web/app/[locale]/dashboard/artist/new/actions.ts — createArtworkDraft Server Action
✓ apps/web/app/[locale]/dashboard/dj/page.tsx — DJ-Dashboard mit Set-Verwaltung
✓ Idempotenz Sync-Webhook (mehrfache Sanity-Publishes → kein Duplicate)
✓ Tests:
  - Integration: Webhook-Sync-Idempotenz
  - Integration: Upload-Pipeline (Mock R2)
✓ ADR docs/adr/0005-content-model.md

DOD:
- 3 Beispiel-Artworks (mit GLB + HLS) angelegt, in Frontend abrufbar
- Upload via Dashboard erfolgreich
- Sanity-Studio editiert, Sync greift, Supabase mirror-Tabelle aktualisiert
- ADR geschrieben

KONFLIKT-PRÄVENTION:
- Exklusiv in: packages/sanity-studio/, apps/web/app/api/(webhooks|assets)/, apps/web/app/[locale]/dashboard/(artist|dj)/

Sub-Plan zuerst. Warte auf "GO Phase 5".
=== ENDE ===
```

## § 3.4 GPT 5.4 → Phase 6: Classic Mode (Shop)

```
=== GPT 5.4 :: PHASE 6 :: CLASSIC MODE ===

Voraussetzung: Phase 5 ✅.

LIES:
- v1.0 Phase 6
- v1.1 § 4.5 (i18n)

DELIVERABLES:
✓ apps/web/app/[locale]/(shop)/shop/page.tsx — SSR Liste, SEO-Metadata
✓ Filter-Komponenten (Artist, DJ, Preis-Range, Raum, Medium) mit URL-State (nuqs)
✓ Pagination cursor-basiert, Skeleton-Loading
✓ apps/web/app/[locale]/(shop)/artwork/[slug]/page.tsx — SSR mit dynamischem OG-Image
✓ Hero-Bild + Galerie + Story (PortableText) + Audio-Preview-Player
✓ apps/web/app/[locale]/(profile)/artist/[slug]/page.tsx + dj/[slug]/page.tsx
✓ Cart-Drawer Komponente (Zustand-Store, persistent in DB für angemeldete + localStorage Fallback)
  - MVP: Single Item, kein Multi-Item-Flow
✓ "Acquire Artwork" CTA → Phase 10 Checkout-Flow (jetzt nur Stub-Link)
✓ Lighthouse Performance ≥ 90, SEO 100, a11y ≥ 95
✓ ADR docs/adr/0006-shop-architektur.md

DOD:
- Shop-Liste mit echten Daten aus Supabase
- Detail-Seite mit Audio-Preview (HLS)
- OG-Image dynamisch generiert
- Lighthouse Budget gehalten

KONFLIKT-PRÄVENTION:
- Exklusiv in: apps/web/app/[locale]/(shop)/, apps/web/app/[locale]/(profile)/
- Liest packages/three nur via Mini-Preview (keine Modifikation)

Sub-Plan zuerst. Warte auf "GO Phase 6".
=== ENDE ===
```

## § 3.5 GPT 5.4 → Phase 11: AI-Kuration

```
=== GPT 5.4 :: PHASE 11 :: AI-KURATION ===

Voraussetzung: Phase 6 ✅.

LIES:
- v1.0 Phase 11
- v1.0 Sektion 5 (EU AI Act)

DELIVERABLES:
✓ apps/web/src/lib/ai/anthropic.ts — Anthropic SDK lazy init
✓ Server-Actions:
  - generateArtworkDescriptionVariants(prompt) — Claude Sonnet 4.6, returns 3 Varianten
  - recommendArtworksByMood(mood, userId) — Sonnet, max 3 results, prompt-cached system
  - suggestArtworkTags(imageUrl) — Sonnet Vision
✓ apps/web/src/lib/ai/audit.ts — schreibt jeden AI-Call in ai_decisions
✓ Rate-Limiting: 10 Empfehlungen/Tag Gast, 50 angemeldet
✓ Token-Budget-Cap in Doppler-Config, Alert via Sentry bei >80%
✓ "Why?"-Tooltip pro Empfehlung mit gekürzter Reasoning-Erklärung
✓ Override-Mechanismus (User klickt "Empfehlung ablehnen")
✓ Human-in-the-Loop UI für Künstler-Beschreibung-Auswahl (3 Varianten anzeigen, Künstler wählt/editiert)
✓ Tests:
  - Unit: Audit-Log schreibt korrekt
  - Integration: Rate-Limit greift
  - E2E: Empfehlung erscheint, "Warum?" funktioniert
✓ ADR docs/adr/0011-ai-architektur.md

ZWINGEND AI-Act-konform:
- KEIN automatisches Publishing von KI-Output ohne Human-Review
- Audit-Log lückenlos
- User kann widersprechen

KONFLIKT-PRÄVENTION:
- Exklusiv in: apps/web/src/lib/ai/, apps/web/app/api/ai/
- Liest: artwork, profiles

Sub-Plan zuerst. Warte auf "GO Phase 11".
=== ENDE ===
```

---

# § 4 – Codex 5.3 Phase-Prompts

Codex 5.3: stark in pure Code-Generation, Boilerplate, Tests, Migrations. Empfohlen: Phase 2 (Boilerplate), 12, 14.

## § 4.1 Codex 5.3 → SQL-Migrations + Sanity-Schemas Boilerplate

```
=== CODEX 5.3 :: PHASE 3-PRELOAD :: MIGRATIONS BOILERPLATE ===

KONTEXT:
ELBTRONIKA Solo-Build. Stand 29.04.2026. Repo lebt bereits.

ZIEL:
Reine Code-Generation:
1. Vollständige SQL-Migrations für Supabase (alle Tabellen + RLS)
2. Vollständige Sanity-Schema-Files
3. TypeScript-Types daraus generiert

LIES VORHER:
- ELBTRONIKA_Architekturplan_v1.0.md → Sektion 3.5 Verifizierte Parameter, Phase 3 Schritt 3.1, Phase 5 Schritt 5.1

DELIVERABLES:
✓ supabase/migrations/0001_init.sql:
  - profiles (id uuid PK ref auth.users, display_name, role enum, created_at, updated_at, country_code, stripe_account_id)
  - artists (profile_id PK ref profiles, bio_de, bio_en, portrait_url, social_links jsonb)
  - djs (profile_id PK ref profiles, bio_de, bio_en, portrait_url, soundcloud_handle)
  - rooms (id uuid PK, slug, name_de, name_en, scene_config jsonb, created_at)
  - artworks (id uuid PK, slug unique, artist_id ref artists, dj_id ref djs, room_id ref rooms, set_id ref sets, title_de, title_en, story_de jsonb, story_en jsonb, price_cents bigint, currency text default 'EUR', medium, dimensions jsonb, image_url, gltf_url, textures jsonb, status enum draft|published|sold|archived, published_at, created_at, updated_at)
  - sets (id uuid PK, slug unique, dj_id ref djs, title_de, title_en, hls_manifest_url, soundcloud_track_id, duration_seconds int, cover_artwork_id ref artworks)
  - orders (id uuid PK, user_id ref profiles, artwork_id ref artworks, stripe_session_id unique, transfer_group unique, amount_cents bigint, status enum, paid_at, shipped_at, delivered_at, created_at)
  - transactions (id uuid PK, order_id ref orders, kind enum charge|transfer|refund, stripe_object_id unique, amount_cents bigint, destination_account text nullable, created_at)
  - consent_log (id uuid PK, user_id nullable ref profiles, ip_hash text, user_agent text, consent_version text, consents jsonb, created_at)
  - audit_events (id uuid PK, actor_id nullable, action text, resource_type, resource_id, before jsonb, after jsonb, created_at)
  - webhook_events (id uuid PK, source enum stripe|sanity|cloudflare, event_id unique, payload jsonb, processed_at, created_at)
  - ai_decisions (id uuid PK, user_id ref profiles, model text, prompt_hash text, output jsonb, decision_type enum, created_at)
  - Alle Tabellen: Enable RLS

✓ supabase/migrations/0002_rls.sql:
  - Default deny-all
  - profiles: own-read/update, public-read mit display_name + portrait
  - artworks: public-read where status='published', own-write (artist_id matches)
  - orders: own-read, no client write (server-only via service-role)
  - transactions: server-only
  - consent_log: server-only insert, own-read
  - audit_events: admin-only
  - webhook_events: server-only
  - ai_decisions: own-read

✓ supabase/migrations/0003_triggers.sql:
  - updated_at-Trigger auf alle relevanten Tabellen
  - audit_event-Trigger für orders, transactions, profiles

✓ supabase/seed.sql — deterministisch, idempotent (ON CONFLICT DO NOTHING) — 3 artists, 3 djs, 3 rooms, 6 artworks

✓ packages/sanity-studio/schemas/ (Sanity v4 syntax):
  - artwork.ts, artist.ts, dj.ts, room.ts, set.ts, story.ts
  - Alle String-Felder mit { de, en } Object-Type
  - Reference-Felder typisiert
  - Image-Felder mit Custom-Upload-Hook-Anker

✓ packages/contracts/src/schemas.ts — Zod-Schemas, die von beiden Backend (Supabase) und CMS (Sanity) konsumiert werden

KONVENTIONEN:
- snake_case in SQL
- camelCase in TypeScript/Zod/Sanity
- Mapping über Drizzle/zod-Transform-Helpers in packages/contracts/src/transformers.ts

DOD:
- pnpm supabase migration list zeigt 3 Migrations
- pnpm supabase db reset + seed läuft idempotent
- Alle Sanity-Schemas typecheck-grün
- packages/contracts exports tested mit vitest

KONFLIKT-PRÄVENTION:
- Exklusiv in: supabase/migrations/, supabase/seed.sql, packages/sanity-studio/schemas/, packages/contracts/src/

Sub-Plan zuerst. Warte auf "GO Codex Migrations".
=== ENDE ===
```

## § 4.2 Codex 5.3 → Phase 12: Edge Functions + Cache-Strategie

```
=== CODEX 5.3 :: PHASE 12 :: EDGE & PERFORMANCE ===

Voraussetzung: Phase 7 + 10 ✅.

LIES:
- v1.0 Phase 12

DELIVERABLES:
✓ apps/web/netlify/edge-functions/ab-test.ts — WebGPU-Detection + Cookie + Redirect
✓ apps/web/netlify/edge-functions/locale-detect.ts — geo + Accept-Language → Locale
✓ apps/web/netlify/edge-functions/r2-sign.ts — Cloudflare R2 Signed URL Generation für Exclusive Set
✓ apps/web/netlify/edge-functions/proxy-soundcloud.ts — Reverse Proxy für HLS Manifest + Segments (DSGVO IP-Maskierung)
✓ netlify.toml:
  - Edge-Function-Routes
  - Cache-Header pro Pfad-Pattern:
    /_next/static/*       → max-age=315360000, immutable
    /api/proxy/sc/*       → max-age=2, stale-while-revalidate=5  (für Manifest)
    /assets/segments/*    → max-age=315360000, immutable
    /api/*                → private, no-store
    /                     → s-maxage=60, stale-while-revalidate=600
✓ apps/web/next.config.ts:
  - Image-Optimization mit AVIF + WebP
  - Compress = true
  - PoweredByHeader = false
  - Headers: HSTS, CSP (vorbereitet, in Phase 13 konsolidiert)
✓ Lighthouse-CI in .github/workflows/lighthouse.yml — Budgets: LCP < 2s, CLS < 0.05, INP < 150ms
✓ Tests:
  - Cache-Header-Verify mit Playwright (response.headers checks)
  - Edge-Function-Smoke-Tests
✓ ADR docs/adr/0012-edge-performance.md

DOD:
- Cache-Header in Production-Preview verifiziert
- Lighthouse-CI grün auf jedem PR
- WebGPU-Detection-Cookie wird gesetzt + respektiert
- ADR geschrieben

KONFLIKT-PRÄVENTION:
- Exklusiv in: apps/web/netlify/edge-functions/, netlify.toml, apps/web/next.config.ts

Sub-Plan zuerst. Warte auf "GO Phase 12".
=== ENDE ===
```

## § 4.3 Codex 5.3 → Phase 14: Test-Suite konsolidieren

```
=== CODEX 5.3 :: PHASE 14 :: TESTING & QA ===

Voraussetzung: Mindestens Phase 6, idealerweise alles bis 13.

LIES:
- v1.0 Phase 14

ZIEL:
Test-Pyramide vollständig, Coverage ≥ 70% Branch auf kritischen Packages, alle E2E grün.

DELIVERABLES:
✓ vitest.config.ts (root) + per-package overrides
✓ Unit-Tests:
  - packages/audio/* (Math-Formeln zu 100%)
  - packages/contracts/* (Zod-Schemas)
  - apps/web/src/lib/payments/* (Cent-Math, Transfer-Calc)
  - apps/web/src/lib/ai/* (Audit-Log)
✓ Component-Tests Testing Library:
  - packages/ui/* — alle Komponenten
  - Auth-Forms, Cart-Drawer
✓ Integration-Tests:
  - Supabase RLS (User A kann nicht User B's Order lesen)
  - Webhook-Idempotenz (Stripe + Sanity)
  - Upload-Pipeline (gemockt)
✓ E2E Playwright:
  - Auth: Magic-Link Flow
  - Shop: Filter, Detail, OG-Preview
  - Immersive: 1 Raum durchnavigieren, FPS-Check
  - Audio: Entry-Overlay → Audio startet
  - Checkout: Stripe Test-Card → Success
  - Mode-Switch: Shop ↔ Immersive ohne Canvas-Reload
✓ Visual Regression Playwright Screenshots — Design System + kritische Pages
✓ Accessibility: @axe-core/playwright auf jeder Route
✓ Performance: Playwright FPS-Measurement im Immersive Mode (> 45 FPS Mid-Range)
✓ k6 Load-Test-Script für /shop und /api/stripe/webhook (50 RPS Baseline)
✓ Coverage-Report → GitHub Actions Artifact
✓ ADR docs/adr/0014-test-strategie.md

DOD:
- Coverage gemäß Targets erreicht
- Alle E2E in CI grün
- Visual Regression Baseline approved
- a11y violations = 0
- ADR geschrieben

KONFLIKT-PRÄVENTION:
- Exklusiv in: tests/, vitest.config.ts, playwright.config.ts, .github/workflows/

Sub-Plan zuerst. Warte auf "GO Phase 14".
=== ENDE ===
```

---

# § 5 – Spezial-Prompts

## § 5.1 Code-Review-Prompt (jedes Modell)

Wenn ein Pull Request reviewt werden soll:

```
=== CODE REVIEW :: PR #<NUMMER> ===

Lies STATUS.md + ELBTRONIKA_Architekturplan_v1.0.md + v1.1.md.
Lies das Diff: gh pr diff <NUMMER>
Lies betroffene Files in voller Länge, nicht nur das Diff.

PRÜFE:
1. Architektur-Konsistenz mit v1.0 ADRs
2. DSGVO/Compliance-relevante Punkte (Phase 13)
3. Webhook-Signaturen, Idempotenz, Raw-Body bei Stripe
4. RLS bei jeder neuen Supabase-Query
5. i18n vorhanden? (DE+EN)
6. Tests vorhanden? Coverage ausreichend?
7. ADR ergänzt/erstellt?
8. Performance-Budget gehalten?
9. a11y-Aspekte berücksichtigt?

OUTPUT:
- ✅ approved, falls alles passt
- 🔴 blocked, mit nummerierter Liste was zu fixen ist
- 💡 Optionale Verbesserungen (nice-to-have, nicht blockierend)

Antwort als GitHub-Review-Comment-Format.
=== ENDE ===
```

## § 5.2 ADR-Schreib-Prompt

Wenn nach einer Phase nur die ADR fehlt:

```
=== ADR SCHREIBEN ===

Lies die Phase im Plan + den fertigen Code.
Schreibe docs/adr/XXXX-<phase-name>.md im MADR-Format:

# ADR XXXX: <Titel>
- Status: accepted
- Datum: <heute>
- Deciders: Lou, Claude

## Kontext und Problem
<Was war das Problem?>

## Berücksichtigte Optionen
- Option 1: ...
- Option 2: ...
- Option 3: ...

## Entscheidung
<Welche Option und warum>

## Konsequenzen
- Positiv: ...
- Negativ: ...
- Neutral: ...

## Verifikation
<Wie wird die Entscheidung getestet/überwacht?>

Stoppe nach Datei-Schreiben, Lou bestätigt.
=== ENDE ===
```

## § 5.3 Status-Update-Prompt

Wenn eine Phase fertig ist:

```
=== STATUS UPDATE ===

Lies STATUS.md und die abgeschlossene Phase.
Update STATUS.md:
- Setze Phase auf ✅ done
- Trage Owner ein (Sonnet/GPT/Codex)
- Trage Notiz ein: kurze Zusammenfassung
- Update "Letztes Update"-Datum

Schreibe + commit:
git add STATUS.md
git commit -m "docs(status): Phase X abgeschlossen"

Bestätige Lou.
=== ENDE ===
```

---

# § 6 – Coordinator-Notes für Lou

## 6.1 Heute parallel laufen lassen (3 Sessions)

Empfehlung wenn Phase 1+2+3 noch nicht stehen:

| Window | Modell | Prompt aus | Branch | ETA |
|---|---|---|---|---|
| A | Sonnet 4.6 | § 2.1 Phase 1 | feature/phase-1-repo | 2-3h |
| B | GPT 5.4 | § 3.1 Phase 2 | feature/phase-2-design | 3-4h |
| C | Codex 5.3 | § 4.1 Migrations | feature/phase-3-migrations | 1-2h |

**Reihenfolge des Mergens:**
1. Phase 1 zuerst (alle anderen brauchen das Repo).
2. Phase 2 + 3 Migrations parallel rebasen + mergen.
3. Dann Phase 3 vollständig (Sonnet § 2.2).

## 6.2 Wenn Phase 1+2+3 schon stehen

| Window | Modell | Prompt aus | Branch |
|---|---|---|---|
| A | Sonnet 4.6 | § 2.5 Phase 10 (wenn Stripe KYC schon durch) | feature/phase-10 |
| B | GPT 5.4 | § 3.2 Phase 4 oder § 3.3 Phase 5 | feature/phase-4 oder 5 |
| C | Codex 5.3 | § 4.3 Phase 14 (Tests konsolidieren) | feature/phase-14 |

## 6.3 Status updaten heute

- Nach jeder Phase: STATUS.md updaten.
- Spät am Abend: Tag setzen `git tag phase-X-done && git push --tags`.
- Tagebuch in `docs/journal/2026-04-29.md` schreiben (1-Satz pro Aktion).

## 6.4 Wenn ein Modell driftet

Drift-Signale:
- Modell schreibt ohne Sub-Plan.
- Modell ignoriert Konflikt-Prävention (greift in fremde Verzeichnisse).
- Modell macht „kreative" Architektur ohne ADR-Begründung.

Eingriff:
> "STOP. Lies STATUS.md, v1.1 § 8.4. Reset State. Sub-Plan neu, GO abwarten."

## 6.5 Konflikte beim Merge

Drei parallele PRs → Merge-Konflikte erwartbar in:
- pnpm-lock.yaml → akzeptiere "ours" auf main, dann pnpm install neu
- biome.json → manuell mergen, beide Side-Effects behalten
- package.json (deps) → manuell mergen

Verwende `git rerere` aktiviert für wiederkehrende Konflikte:
```
git config --global rerere.enabled true
```

## 6.6 Token-Budget-Hygiene

GitHub Copilot zählt Token. Maxime:
- Pro Phase ein Chat. Nicht alles in einen Chat.
- Wenn der Chat-Kontext > 80% voll: neuen Chat, Bootstrap-Prompt erneut.
- Plan-Files referenzieren statt rein-pasten — Copilot liest aus Workspace.

## 6.7 Was zu Anthropic-Claude-Sonnet 4.6 hier

Wenn du in Copilot Chat Sonnet 4.6 wählst, ist das im Hintergrund Claude. Die Prompts in § 2 sind für genau dieses Modell abgestimmt — dichter, mehr Architektur-Kontext, weniger Boilerplate.

## 6.8 Final-Push-Routine am Tagesende

```
# In jedem Branch
git push origin feature/phase-X
gh pr create --fill --base main

# STATUS.md updaten
# Tagebuch schreiben
# Tag setzen wenn Phase done
```

---

## Letztes Wort

Du hast 24h Copilot. Drei Sessions parallel = ~9h Wall-Clock-Time, real ~6-7h dank Wartezeiten. In dieser Zeit realistisch:
- Phase 1 ✅
- Phase 2 ✅ oder substantiell
- Phase 3 Boilerplate ✅, Sanity-Setup manuell
- Bonus: Phase 4 Auth angefangen

Das ist viel. Don't burn out — Pause-Cycles einbauen.

Los.
