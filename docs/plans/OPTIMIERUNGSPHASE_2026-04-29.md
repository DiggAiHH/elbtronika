# 🎯 Gesamt-Optimierungsplan ELBTRONIKA
## Stand der Recherche: 29.04.2026 | Next.js 15.5 / React 19.1 / TypeScript 5.8

---

## EXECUTIVE SUMMARY

Dieser Plan bringt das ELBTRONIKA-Projekt auf den aktuellen Production-Standard von April 2026. Er umfasst **10 Phasen** mit insgesamt **47 Schritten**, gegliedert nach: Security & Compliance → Performance & Caching → Architecture & Rendering → Monitoring & Observability → Testing & QA → Deployment.

**Geschätzter Aufwand:** 14-18 Entwicklertage  
**Kritikalität:** 3 BLOCKER (Security, Caching, Compliance) müssen vor Deployment gelöst werden.

---

## PHASE 0: VORBEREITUNG & AUDIT (Tag 0,5)

### Schritt 0.1: Baseline-Messung
- **0.1.1** Lighthouse-Score (Mobile + Desktop) für `/`, `/shop`, `/gallery` dokumentieren
- **0.1.2** `pnpm build` Dauer messen und dokumentieren (vorher/nachher)
- **0.1.3** Bundle-Analyse mit `@next/bundle-analyzer` erstellen: `ANALYZE=true pnpm build`
- **0.1.4** `web-vitals` Library in `apps/web` aktivieren und Baseline-Werte (LCP, INP, CLS, TTFB, FCP) in Analytics speichern
- **0.1.5** Dependency-Tree audit: `pnpm audit --json > audit-baseline.json`

### Schritt 0.2: TypeScript OOM-Problem beheben
- **0.2.1** `turbo.json` Task `typecheck` um `env.NODE_OPTIONS = "--max-old-space-size=4096"` erweitern
- **0.2.2** Alternative: `typecheck` Task in `turbo.json` auf `concurrency: 1` setzen (sequentielle Ausführung)
- **0.2.3** Sanity Studio (`apps/cms`) separat behandeln — eigener Worker oder Heap-Limit-Erhöhung

### Definition of Done (Phase 0):
- [ ] Lighthouse-Baseline in `docs/performance/baseline-YYYY-MM-DD.md`
- [ ] Bundle-Report in `docs/performance/bundle-analysis.html`
- [ ] `pnpm typecheck` läuft ohne OOM durch alle Packages
- [ ] Audit-Baseline dokumentiert

---

## PHASE 1: SECURITY HARDENING (Tag 1-2) — 🔴 BLOCKER

### Schritt 1.1: Content Security Policy (CSP)
- **1.1.1** CSP-Header in `next.config.ts` konfigurieren (Strict Policy)
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-inline' 'unsafe-eval'` (für Next.js SPA-Hydration notwendig, mit Nonce nach Möglichkeit)
  - `style-src 'self' 'unsafe-inline'` (Tailwind benötigt inline styles)
  - `img-src 'self' https://cdn.elbtronika.art https://cdn.sanity.io data:`
  - `connect-src 'self' https://*.supabase.co https://api.stripe.com`
  - `frame-src https://checkout.stripe.com`
  - `font-src 'self'`
  - `object-src 'none'`
  - `base-uri 'self'`
  - `form-action 'self'`
- **1.1.2** Nonce-Generierung via Middleware für `script-src` und `style-src` implementieren (wenn Strict-CSP ohne `'unsafe-inline'` gewünscht)
- **1.1.3** CSP-Reporting Endpoint (`report-uri` oder `report-to`) einrichten — optional: `https://csp-report.elbtronika.art`

### Schritt 1.2: Security Headers
- **1.2.1** `X-Frame-Options: DENY` (oder `SAMEORIGIN` für eingebettete Inhalte)
- **1.2.2** `X-Content-Type-Options: nosniff`
- **1.2.3** `Referrer-Policy: strict-origin-when-cross-origin`
- **1.2.4** `Permissions-Policy` konfigurieren (z.B. `camera=(), microphone=(), geolocation=()`)
- **1.2.5** `Strict-Transport-Security` (HSTS) mit `max-age=63072000; includeSubDomains; preload`

### Schritt 1.3: Server Actions Hardening
- **1.3.1** `server-only` Package installieren: `pnpm add -D server-only`
- **1.3.2** Alle server-seitigen Helper (`apps/web/src/lib/ai/server.ts`, `apps/web/src/lib/payments/webhook-context.ts`) mit `import "server-only"` markieren
- **1.3.3** Zod-Schemata für ALLE Server Actions erstellen:
  - `CreateOrderSchema`
  - `UpdateProfileSchema`
  - `ContactFormSchema`
  - AI-Action-Schemas (`DescribeSchema`, `ExplainSchema`, etc.)
- **1.3.4** Input-Sanitierung für alle Form-Submissions via Zod in Server Actions
- **1.3.5** Rate-Limiting für Server Actions (nicht nur AI-Routes) — `apps/web/src/lib/rate-limit.ts` als generisches Modul

### Schritt 1.4: Auth & Authorization Audit
- **1.4.1** Supabase RLS-Policies review: Jede Tabelle muss RLS aktiviert haben
- **1.4.2** Server Actions: Auth-Check in JEDER Action (nicht nur im Layout)
- **1.4.3** `aud` Claim Validation für JWTs
- **1.4.4** Session-Refresh-Logik review (Timing-Attack-Prävention)

### Definition of Done (Phase 1):
- [ ] CSP-Header in allen Responses (lokal testen via `curl -I`)
- [ ] Security-Header-Score A+ auf securityheaders.com (Staging)
- [ ] Alle Server Actions haben Zod-Validierung
- [ ] `server-only` importiert in allen server-seitigen Modulen
- [ ] RLS Policies dokumentiert in `docs/security/rls-policies.md`

---

## PHASE 2: DSGVO / GDPR COMPLIANCE (Tag 2-3) — 🔴 BLOCKER

### Schritt 2.1: Datenschutz-Dokumentation
- **2.1.1** `docs/legal/privacy-policy.md` erstellen (technische Umsetzung der Datenschutzerklärung)
- **2.1.2** Datenverarbeitungsverzeichnis (DVR) erstellen: Welche Daten? Wo gespeichert? Wie lange?
  - Supabase (PostgreSQL): User-Profile, Bestellungen, KI-Entscheidungen
  - Stripe: Zahlungsdaten (PCI-DSS relevant)
  - Sanity: Content-Management-Daten
  - AWS S3 / R2: Bilddaten
- **2.1.3** Drittanbieter-Liste mit Datenweitergabe-Zwecken

### Schritt 2.2: Technische DSGVO-Maßnahmen (Art. 32)
- **2.2.1** **Recht auf Löschung**: Endpoint `/api/user/delete` implementieren (kaskadierende Löschung: User → Profile → Orders → ai_decisions)
- **2.2.2** **Recht auf Auskunft**: Endpoint `/api/user/export` implementieren (GDPR Data Export als JSON)
- **2.2.3** **Einwilligungs-Management**: Cookie-Banner + Consent-Manager (z.B. `cookieconsent` oder Custom)
  - Kategorien: Notwendig, Analytics, Marketing, Drittanbieter (Stripe, Sanity)
  - Einwilligung in Supabase `user_consents` Tabelle speichern
- **2.2.4** **Privacy by Design**: Keine Telemetrie ohne Consent, keine PII in Logs
- **2.2.5** **Auftragsverarbeitung (AVV)**: Stripe + Supabase + Sanity AVVs prüfen und dokumentieren

### Schritt 2.3: Cookie & Tracking
- **2.3.1** Alle Cookies identifizieren und kategorisieren
- **2.3.2** `__Host-` Prefix für Session-Cookies (wenn eigene Cookies gesetzt werden)
- **2.3.3** `SameSite=Strict` für Auth-Cookies
- **2.3.4** Analytics (wenn vorhanden) nur nach Consent laden

### Definition of Done (Phase 2):
- [ ] Cookie-Banner implementiert und getestet
- [ ] `/api/user/delete` und `/api/user/export` funktional
- [ ] DVR in `docs/legal/dvr.md` dokumentiert
- [ ] AVV-Dokumentation für alle Drittanbieter
- [ ] Penetration-Test-Readiness (OWASP Top 10 Check)

---

## PHASE 3: CACHING & DATA FETCHING OPTIMIZATION (Tag 3-4) — 🔴 BLOCKER

### Schritt 3.1: Next.js 15 Caching-Defaults fixen
- **3.1.1** ALLE `fetch()`-Aufrufe im Projekt auditieren (Next.js 15: **kein Caching mehr by default**)
- **3.1.2** Server Components: `fetch()` mit explizitem Caching versehen:
  ```ts
  fetch('/api/artworks', { cache: 'force-cache', next: { revalidate: 3600 } })
  ```
- **3.1.3** Route Handlers: `Cache-Control`-Header setzen
  ```ts
  return Response.json(data, {
    headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' }
  })
  ```
- **3.1.4** Supabase-Queries: `unstable_cache` aus `next/cache` verwenden für DB-Queries in Server Components
  ```ts
  import { unstable_cache } from 'next/cache'
  const getArtworks = unstable_cache(
    async () => supabase.from('artworks').select('*'),
    ['artworks'],
    { revalidate: 3600 }
  )
  ```

### Schritt 3.2: ISR & Static Generation
- **3.2.1** `generateStaticParams()` für alle dynamischen Routen prüfen:
  - `/[locale]/shop/[slug]`
  - `/[locale]/artist/[slug]`
  - `/[locale]/gallery` (wenn statisch möglich)
- **3.2.2** `revalidatePath()` und `revalidateTag()` für Cache-Invalidation implementieren (nach CMS-Update, nach Bestellung)
- **3.2.3** `dynamicParams = false` setzen, wenn nicht-existierende Slugs 404 liefern sollen (statt SSR)

### Schritt 3.3: Partial Prerendering (PPR)
- **3.3.1** `next.config.ts`: `experimental.ppr = true` aktivieren (Next.js 15 — stable)
- **3.3.2** Routen identifizieren, die von PPR profitieren:
  - `/shop` (statisch: Produktliste, dynamisch: Preise/Verfügbarkeit)
  - `/artist/[slug]` (statisch: Bio, dynamisch: neueste Werke)
- **3.3.3** `<Suspense>`-Grenzen um dynamische Teile legen
- **3.3.4** PPR-Build testen und LCP/INP messen

### Definition of Done (Phase 3):
- [ ] Alle `fetch()`-Aufrufe haben explizite Caching-Direktiven
- [ ] `unstable_cache` für wiederholte DB-Queries
- [ ] ISR funktioniert für alle Shop-/Artist-Routen
- [ ] PPR aktiviert und getestet
- [ ] LCP verbessert um mindestens 15% gegenüber Baseline

---

## PHASE 4: PERFORMANCE & CORE WEB VITALS (Tag 4-6)

### Schritt 4.1: INP (Interaction to Next Paint) Optimierung
- **4.1.1** React 19 `useTransition()` für ALLE nicht-urgenten State-Updates:
  - Filter in Shop (Kategorien, Preisrange)
  - AI-Generierung (Describe/Explain/Recommend)
  - Warenkorb-Updates
- **4.1.2** React 19 `useDeferredValue()` für Search-Inputs
- **4.1.3** `React.memo` + `useCallback` review: NUR dort, wo Profiler es zeigt (React Compiler übernimmt den Rest)
- **4.1.4** Event-Handler debouncen (300ms für Search, 100ms für Resize/Scroll)

### Schritt 4.2: Bundle Optimization
- **4.2.1** Bundle-Analyse aus Phase 0 auswerten — Top-10 größte Dependencies identifizieren
- **4.2.2** Heavy Dependencies dynamisch importieren:
  - `framer-motion` (nur dort, wo Animationen gebraucht werden)
  - `@sanity/vision` (nur CMS)
  - `three` + R3F (nur in 3D-Gallery)
- **4.2.3** Tree-Shaking review: Named imports statt Full-Package (z.B. `lodash/debounce` statt `lodash`)
- **4.2.4** Bundle-Budget in CI einrichten:
  ```json
  // budget.json
  { "budgets": [{ "type": "bundle", "name": "app", "maximumWarning": "200kb", "maximumError": "300kb" }] }
  ```

### Schritt 4.3: Image & Asset Optimization
- **4.3.1** ALLE `<img>`-Tags durch `next/image` ersetzen (wenn noch vorhanden)
- **4.3.2** `placeholder="blur"` + `blurDataURL` für Hero-Images
- **4.3.3** `priority` für Above-the-Fold Images (LCP-Optimierung)
- **4.3.4** AVIF-Format priorisieren (bereits in `next.config.ts` konfiguriert)
- **4.3.5** Sanity-Bilder: `next-sanity`'s `Image` Component oder `urlFor().auto('format').quality(80)`

### Schritt 4.4: List Virtualization
- **4.4.1** `@tanstack/react-virtual` installieren
- **4.4.2** `ShopGrid` virtualisieren (wenn > 50 Artworks)
- **4.4.3** Gallery-Listen virtualisieren (wenn > 50 Items)
- **4.4.4** Testen mit 500+ Items

### Schritt 4.5: Web Workers für CPU-Intensive Tasks
- **4.5.1** Web Worker für AI-Text-Hashing (`hashText` in `apps/web/src/lib/ai/server.ts`)
- **4.5.2** Web Worker für Bild-Resizing/Compression (Client-seitig vor Upload)
- **4.5.3** `comlink` als Wrapper für Worker-Typisierung

### Definition of Done (Phase 4):
- [ ] INP < 200ms auf Mobile (Lighthouse)
- [ ] LCP < 2,5s auf Mobile
- [ ] Bundle-Size pro Route < 300kb (initial JS)
- [ ] Virtuelle Listen für alle > 50 Elemente
- [ ] Web Workers für CPU-intensive Tasks

---

## PHASE 5: ARCHITECTURE & CODE QUALITY (Tag 6-7)

### Schritt 5.1: Server/Client Component Boundary Review
- **5.1.1** ALLE `"use client"`-Direktiven auditieren
- **5.1.2** Ziel: Minimiere Client-Bundle durch Verschieben von Logik in Server Components
- **5.1.3** Pattern anwenden: Server Component als Wrapper, Client Component als Child für Interaktivität
- **5.1.4** `next-intl`: `getTranslations()` in Server Components nutzen (nicht nur `useTranslations()`)

### Schritt 5.2: Error Boundaries & Resilience
- **5.2.1** `error.tsx` für jede Route-Gruppe erstellen (`[locale]/(shop)/error.tsx`, `[locale]/(immersive)/error.tsx`)
- **5.2.2** `global-error.tsx` auf Root-Level erstellen (Next.js 15 Standard)
- **5.2.3** `loading.tsx` für jede Route-Gruppe (bereits teilweise vorhanden?)
- **5.2.4** `not-found.tsx` für jede Route-Gruppe
- **5.2.5** API-Routes: Konsistentes Error-Response-Format:
  ```json
  { "error": { "code": "INVALID_INPUT", "message": "...", "details": [...] } }
  ```

### Schritt 5.3: Type Safety Strengthening
- **5.3.1** `strict` + `exactOptionalPropertyTypes: true` review — alle `undefined`-Unions prüfen
- **5.3.2** `noUncheckedIndexedAccess: true` aktivieren (wenn machbar)
- **5.3.3** Generische Typen für API-Responses (`ApiResponse<T>`, `ApiError`)
- **5.3.4** Branded Types für IDs (`type ArtworkId = string & { __brand: 'ArtworkId' }`)

### Schritt 5.4: Code Deduplication
- **5.4.1** `packages/ui/src/components` review — Duplikate zwischen `apps/web` und `packages/ui`?
- **5.4.2** Shared Hooks extrahieren (wenn `apps/web` und `apps/cms` ähnliche Patterns haben)
- **5.4.3** `packages/config` als Single Source of Truth für ESLint, TS, Tailwind-Config

### Definition of Done (Phase 5):
- [ ] Jede Route hat `error.tsx`, `loading.tsx`, `not-found.tsx`
- [ ] `"use client"` um mindestens 20% reduziert
- [ ] API-Error-Format konsistent
- [ ] Keine TypeScript `any`-Typen mehr (außer in Legacy-Mocks)

---

## PHASE 6: MONITORING & OBSERVABILITY (Tag 7-8)

### Schritt 6.1: Real User Monitoring (RUM)
- **6.1.1** `@vercel/speed-insights` installieren und konfigurieren (oder eigenes RUM)
- **6.1.2** `useReportWebVitals()` Hook in `apps/web/app/layout.tsx` integrieren
- **6.1.3** Web Vitals an Analytics-Endpunkt senden (Supabase-Tabelle `web_vitals`)
  ```ts
  // app/layout.tsx
  import { useReportWebVitals } from 'next/web-vitals'
  useReportWebVitals((metric) => {
    fetch('/api/analytics/vitals', { method: 'POST', body: JSON.stringify(metric) })
  })
  ```

### Schritt 6.2: Error Tracking
- **6.2.1** Sentry Integration:
  - `@sentry/nextjs` installieren
  - `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
  - Source Maps Upload in CI
- **6.2.2** Sentry-Error-Boundary um globale App legen
- **6.2.3** Server Actions: `Sentry.captureException()` in Catch-Blöcken

### Schritt 6.3: Logging & Tracing
- **6.3.1** `pino` als strukturierter Logger (Server-seitig)
- **6.3.2** Log-Levels: `debug` (Dev), `info` (Staging), `warn/error` (Production)
- **6.3.3** OpenTelemetry (optional): `instrumentation.ts` in `apps/web`
  ```ts
  export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await import('./lib/instrumentation-node')
    }
  }
  ```
- **6.3.4** Request-ID-Propagation (für Distributed Tracing)

### Schritt 6.4: Health Checks
- **6.4.1** `/api/health` Endpoint erstellen:
  - Supabase-Connection-Check
  - Stripe-API-Check
  - S3/R2-Check
- **6.4.2** Health-Check für Sanity CMS
- **6.4.3** Uptime-Monitoring einrichten (z.B. UptimeRobot oder Pingdom)

### Definition of Done (Phase 6):
- [ ] Web Vitals werden in Produktion gesammelt
- [ ] Sentry zeigt Fehler mit Stacktraces (Source Maps)
- [ ] `/api/health` liefert 200 mit allen Subsystem-Status
- [ ] Logs sind strukturiert und durchsuchbar

---

## PHASE 7: TESTING & QUALITÄTSSICHERUNG (Tag 8-10)

### Schritt 7.1: Unit & Integration Tests
- **7.1.1** Test-Coverage-Baseline messen: `vitest run --coverage`
- **7.1.2** Coverage-Ziel: 80% für `packages/ai`, `packages/payments`, `packages/audio`
- **7.1.3** Fehlende Tests für `packages/three` (CanvasRoot, ArtworkMesh)
- **7.1.4** Mock-Strategie konsolidieren: Zentrale Mock-Factory für Supabase, Stripe, Anthropic

### Schritt 7.2: E2E Tests (Playwright)
- **7.2.1** E2E-Tests für kritische User Journeys:
  - Shop → Produkt → Warenkorb → Checkout (Stripe Test Mode)
  - Sprachwechsel (de/en)
  - 3D-Gallery Navigation (wenn mit Playwright möglich)
  - AI-Describe/Explain Flow
- **7.2.2** `@axe-core/playwright` für automatisierte a11y-Tests in E2E
- **7.2.3** Visual Regression Tests (Screenshots pro Route)
- **7.2.4** E2E-Tests in CI integrieren (nach Deployment auf Preview)

### Schritt 7.3: Accessibility (a11y)
- **7.3.1** `@axe-core/react` für Entwicklungszeit-Checks
- **7.3.2** WCAG 2.1 AA Compliance-Check:
  - Alle Bilder haben `alt`-Text
  - Formularfelder haben Labels
  - Farbkontrast > 4.5:1
  - Keyboard-Navigation funktioniert
  - ARIA-Landmarks vorhanden
- **7.3.3** Screenreader-Test (NVDA/VoiceOver) für Checkout-Flow
- **7.3.4** `prefers-reduced-motion` bereits implementiert — review auf Vollständigkeit

### Schritt 7.4: Performance Regression Testing
- **7.4.1** Lighthouse CI einrichten (`.github/workflows/lighthouse-ci.yml`)
  ```yaml
  - name: Lighthouse CI
    run: |
      npm install -g @lhci/cli
      lhci autorun
  ```
- **7.4.2** Performance-Budget: LCP < 2.5s, INP < 200ms, CLS < 0.1
- **7.4.3` Budget-Breach blockiert Merge

### Definition of Done (Phase 7):
- [ ] Test-Coverage > 80% für Business-Logic-Packages
- [ ] E2E-Tests für alle kritischen User Journeys
- [ ] a11y-Score 100% in Lighthouse
- [ ] Lighthouse CI blockiert bei Performance-Regression

---

## PHASE 8: CI/CD & AUTOMATISIERUNG (Tag 10-11)

### Schritt 8.1: GitHub Actions Pipeline
- **8.1.1** `.github/workflows/ci.yml` erweitern:
  ```yaml
  jobs:
    quality:
      steps:
        - checkout
        - setup-node
        - pnpm install
        - pnpm lint
        - pnpm typecheck
        - pnpm test
        - pnpm build
    security:
      steps:
        - pnpm audit --audit-level moderate
        - trivy filesystem . (Container-Scan)
    e2e:
      needs: [quality]
      steps:
        - deploy-preview
        - pnpm test:e2e
  ```
- **8.1.2** Parallelisierung: `turbo` Caching in CI aktivieren (`actions/cache`)
- **8.1.3** Dependabot für automatische Security-Updates

### Schritt 8.2: Deployment Pipeline
- **8.2.1** Netlify-Deploy-Config für `apps/web`:
  - `netlify.toml` mit Header-Rewrites, Redirects, Security-Headers
  - Edge Functions für Geo-Blocking/Redirects (falls nötig)
- **8.2.2** Sanity CMS Deploy separat (`apps/cms`)
- **8.2.3** Preview-Deployments für Feature-Branches
- **8.2.4** Production-Deploy nur nach E2E-Test-Erfolg

### Schritt 8.3: Environment Management
- **8.3.1** `lib/env.ts` — zentrale, typ-sichere Env-Validierung mit Zod:
  ```ts
  import { z } from 'zod'
  export const env = z.object({
    NEXT_PUBLIC_APP_URL: z.string().url(),
    SUPABASE_URL: z.string().url(),
    STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
    // ...
  }).parse(process.env)
  ```
- **8.3.2** `.env.example` aktualisieren mit ALLEN benötigten Variablen
- **8.3.3** Secrets-Rotation-Policy dokumentieren

### Definition of Done (Phase 8):
- [ ] CI-Pipeline grün für alle Checks
- [ ] Preview-Deployments für PRs
- [ ] Production-Deploy automatisch nach Main-Merge
- [ ] Env-Validierung blockiert Start bei fehlenden Variablen

---

## PHASE 9: DOKUMENTATION & WISSENSMANAGEMENT (Tag 11-12)

### Schritt 9.1: Technische Dokumentation
- **9.1.1** `docs/architecture/adr/` — Architecture Decision Records für:
  - ADR-0010: CSP-Strategie
  - ADR-0011: Caching-Strategie (Next.js 15)
  - ADR-0012: Monitoring-Stack (Sentry + RUM)
  - ADR-0013: DSGVO-Implementierung
- **9.1.2** `docs/api/` — API-Dokumentation (OpenAPI/Swagger für Route Handlers)
- **9.1.3** `docs/development/setup.md` — Onboarding für neue Entwickler

### Schritt 9.2: Betriebshandbuch
- **9.2.1** `docs/operations/runbook.md`:
  - Incident Response Playbook
  - Rollback-Verfahren
  - Datenbank-Backup/Restore
  - SSL-Zertifikat-Renewal
- **9.2.2** `docs/operations/monitoring.md`:
  - Dashboard-Links (Sentry, RUM, Supabase)
  - Alert-Routing (wer wird bei was benachrichtigt?)
  - Eskalationsmatrix

### Schritt 9.3: Google Drive Sync (falls gefordert)
- **9.3.1** Export der technischen Doku als PDF
- **9.3.2** Rechtliche Dokumente (AVV, DVR, Datenschutzerklärung) auf Drive
- **9.3.3** Zugriffsrechte: Entwicklungsteam read-only, Admin read-write

### Definition of Done (Phase 9):
- [ ] Alle ADRs geschrieben und im Repo
- [ ] API-Doku generierbar (`pnpm docs:generate`)
- [ ] Runbook existiert und ist getestet
- [ ] Onboarding-Zeit für neue Devs < 30 Minuten

---

## PHASE 10: FINALES REVIEW & GO-LIVE (Tag 12-14)

### Schritt 10.1: Pre-Production Checklist
- **10.1.1** Security-Scan: `pnpm audit` → 0 Critical/High
- **10.1.2** Penetration-Test: OWASP ZAP oder Burp Suite (Basis-Scan)
- **10.1.3** Load-Test: k6 oder Artillery (100 gleichzeitige User, 5 Minuten)
- **10.1.4** Cross-Browser-Test: Chrome, Firefox, Safari, Edge (latest + 1 Version zurück)
- **10.1.5** Mobile-Test: iOS Safari, Android Chrome (Geräte oder Emulator)

### Schritt 10.2: Performance-Final
- **10.2.1** Lighthouse-Final für alle Pages:
  - Home: > 90 Performance
  - Shop: > 90 Performance
  - Gallery: > 85 Performance (3D ist anspruchsvoll)
  - Checkout: > 95 Performance
- **10.2.2** INP < 200ms, LCP < 2.5s, CLS < 0.1
- **10.2.3** Bundle-Analyse-Final: Gesamt-JS < 500kb (initial)

### Schritt 10.3: Deployment
- **10.3.1** Staging-Deploy: `staging.elbtronika.art`
- **10.3.2** Smoke-Tests auf Staging (E2E-Suite)
- **10.3.3** Production-Deploy: `elbtronika.art` (Netlify)
- **10.3.4** DNS/Domain-Config prüfen (SSL, HSTS, CDN)
- **10.3.5** Post-Deploy-Verification: `/api/health`, Sentry-First-Error-Check, RUM-Daten-Eingang

### Schritt 10.4: Go-Live Dokumentation
- **10.4.1** Deploy-Log in `docs/operations/deploys/YYYY-MM-DD-vX.Y.Z.md`
- **10.4.2** Changelog-Update (Conventional Commits → `CHANGELOG.md`)
- **10.4.3** Team-Kommunikation: Deploy-Notification (Slack/Discord)
- **10.4.4** 48h Monitoring-Intensivphase nach Go-Live

### Definition of Done (Phase 10):
- [ ] Lighthouse > 90 für alle Pages
- [ ] Security-Scan grün
- [ ] Load-Test besteht (100 concurrent users)
- [ ] Production-URL live und funktional
- [ ] Monitoring empfängt Daten

---

## RISIKEN & MITIGATIONEN

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Next.js 15 PPR verursacht Build-Fehler | Mittel | Hoch | Fallback: PPR deaktivieren, ISR-only |
| Sentry-Integration erhöht Bundle-Size | Hoch | Mittel | Tree-shaking, nur Fehler-Reporting (kein Session-Replay) |
| DSGVO-Lösch-Endpoint komplex (Fremdschlüssel) | Mittel | Hoch | Cascade-Delete in Supabase konfigurieren, soft-delete als Fallback |
| TypeScript strictMode + noUncheckedIndexedAccess bricht Build | Hoch | Mittel | Schrittweise aktivieren, nicht alles auf einmal |
| 3D-Gallery INP > 200ms trotz Optimierung | Mittel | Hoch | Progressive Enhancement: Classic-Shop als Fallback |

---

## ZEITPLAN (KOMPAKT)

| Tag | Phase | Fokus |
|-----|-------|-------|
| 0,5 | 0 | Baseline, OOM-Fix |
| 1-2 | 1 | Security (CSP, Headers, Server Actions) |
| 2-3 | 2 | DSGVO/GDPR Compliance |
| 3-4 | 3 | Caching & PPR |
| 4-6 | 4 | Performance & Core Web Vitals |
| 6-7 | 5 | Architecture & Code Quality |
| 7-8 | 6 | Monitoring & Observability |
| 8-10 | 7 | Testing & QA |
| 10-11 | 8 | CI/CD & Automation |
| 11-12 | 9 | Documentation |
| 12-14 | 10 | Final Review & Go-Live |

---

## COMPLIANCE-REFERENZEN

- **DSGVO / GDPR:** Art. 5 (Grundsätze), Art. 25 (Privacy by Design), Art. 32 (Sicherheit der Verarbeitung), Art. 17 (Recht auf Löschung)
- **ISO/IEC 27001:2022:** A.5.1 (Policies), A.8.1 (User Endpoint Devices), A.12.3 (Backup), A.14.2 (Secure Development)
- **OWASP Top 10 2025:** A01 (Broken Access Control), A03 (Injection), A07 (Auth Failures)
- **PCI-DSS v4.0:** SAQ-A (Stripe Checkout redirect = kein PCI-Scope für uns)

---

*Plan erstellt am: 29.04.2026*  
*Autor: Kimi Code CLI (Principal Software Architect)*  
*Status: WARTET AUF FREIGABE*
