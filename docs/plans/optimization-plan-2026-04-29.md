# ELBTRONIKA — Optimierungsplan (Recherche-Stand 29.04.2026)

**Datum:** 2026-04-29  
**Branch:** `feature/phase-11-ai`  
**Ziel:** Alle Phasen (7–13) + Foundation auf aktuellen 2026-Standard heben  
**Autor:** Kimi K-NN (System-Agent)

---

## Executive Summary

Basierend auf Recherche aktueller Best Practices (React 19.2, Next.js 15.3, Three.js r176 WebGPU, R3F 9.6, Stripe SDK v22, Anthropic SDK) und Code-Analyse wurden **47 konkrete Optimierungsmaßnahmen** identifiziert. Der Plan ist in 8 Phasen gegliedert, jeweils mit Testing, Dokumentation und Compliance-Check.

---

## Phase 0: Foundation & Monorepo-Tooling

### Schritt 0.1: Dependency Alignment
- **0.1.1:** `vitest` auf v4.1.5 in ALLEN Packages angleichen (aktuell: `apps/web` und `packages/three` nutzen v3.x, `ai`/`payments`/`audio` nutzen v4.1.5)
- **0.1.2:** `typescript` prüfen auf Upgrade auf 5.8.x (Vorteil: `isolatedDeclarations`, schnelleres `tsc`)
- **0.1.3:** `turbo` auf v2.5.x prüfen (Vorteil: verbesserte Remote Caching, `turbo watch`)
- **0.1.4:** `@types/react` auf 19.2.x angleichen (konfliktfreie R3F-JSX-Typen)
- **0.1.5:** Peer-Dependency-Warnungen (`@emnapi/core`, `@emnapi/runtime`) beheben via `packageManager` override oder `pnpm.overrides`

### Schritt 0.2: Bundle-Analyse-Infrastruktur
- **0.2.1:** `@next/bundle-analyzer` installieren und in `next.config.ts` integrieren (bedingt via `ANALYZE=true`)
- **0.2.2:** Bundle-Budget in `package.json` definieren (z. B. `main` < 200KB, `three` chunk < 500KB)
- **0.2.3:** CI-Integration: Bundle-Size-Regression-Check in GitHub Actions (fails if > 10% increase)

### Schritt 0.3: TypeScript-Konsolidierung
- **0.3.1:** `apps/web/tsconfig.json` enthält `../../packages/three/src/**/*.ts` — entfernen, stattdessen `references` oder `paths` korrekt nutzen
- **0.3.2:** `exactOptionalPropertyTypes` Patterns auditieren (viele TS2379-Fehler in Phase-10/11 bereits behoben, Rest prüfen)

### Testing
- **0.3.3:** Einheitliche `vitest` Config im Root (`vitest.workspace.ts`) für konsistente Test-Runner-Einstellungen
- **0.3.4:** Coverage-Thresholds definieren: 80% branches, 75% functions, 70% lines

### Dokumentation
- **0.3.5:** ADR `0014` — "Dependency Alignment & Bundle Budgets"

---

## Phase 1 (ex Phase 7): 3D-Performance & Stabilität

### Schritt 1.1: React-Compiler-Aktivierung
- **1.1.1:** `babel-plugin-react-compiler` installieren
- **1.1.2:** `experimental.reactCompiler = true` in `next.config.ts` aktivieren
- **1.1.3:** `CanvasRoot.tsx` und `ActiveSceneRenderer` auf Compiler-Kompatibilität prüfen (keine Seiteneffekte im Render)

### Schritt 1.2: Memoization & Re-render-Prevention
- **1.2.1:** `CanvasRoot` mit `React.memo` wrappen (verhindert Re-renders bei irrelevanten Layout-Änderungen)
- **1.2.2:** `ActiveSceneRenderer` mit `React.memo` + custom `areEqual` für `activeScene` prop
- **1.2.3:** `onCreated` in `CanvasRoot` mit `useCallback` stabilisieren
- **1.2.4:** Inline-Style-Objekt (`{ position: "fixed", ... }`) in `useMemo` auslagern oder CSS-Variable nutzen

### Schritt 1.3: Code-Splitting & Lazy Loading
- **1.3.1:** `LobbyScene` via `React.lazy(() => import("./scenes/LobbyScene"))` laden (wird nur bei `activeScene === null` benötigt)
- **1.3.2:** `DevStats` bleibt lazy (bereits implementiert) — verifizieren, dass `Suspense` boundary korrekt ist
- **1.3.3:** WebGPU-Detection-Logik aus `useEffect` extrahieren in separaten Hook `useWebGPUDetection`

### Schritt 1.4: R3F Best Practices 2026
- **1.4.1:** `frameloop="demand"` für statische Szenen (Lobby) aktivieren; `invalidate()` bei Interaktion aufrufen
- **1.4.2:** `dpr` dynamisch anpassen: `dpr={[1, Math.min(window.devicePixelRatio, 2)]}` mit Performance-Observer
- **1.4.3:** Drei's `<Preload all />` vor Scene-Wechsel nutzen (verhindert Pop-in)
- **1.4.4:** `useFrame` statt `useEffect` + `requestAnimationFrame` für alle Animationen (bereits implementiert — verifizieren)
- **1.4.5:** Three.js-Objekte via Refs mutieren, nicht via React State (bereits implementiert — verifizieren)

### Schritt 1.5: Error Boundaries
- **1.5.1:** React Error Boundary um `<CanvasRoot>` in `layout.tsx` wrappen (verhindert App-Crash bei Three.js-Fehlern)
- **1.5.2:** `error.tsx` in `app/[locale]/canvas/` erstellen (Next.js Error Boundary für Route-Segment)
- **1.5.3:** `ErrorFallback`-Komponente mit "Reset to Lobby"-Funktion

### Schritt 1.6: Accessibility
- **1.6.1:** `prefers-reduced-motion` Media Query in `CanvasRoot` auswerten (bei true: Canvas ausblenden oder statisch rendern)
- **1.6.2:** Canvas mit `role="img"` und `aria-label="3D Galerie-Ansicht"` versehen

### Testing
- **1.6.3:** `CanvasRoot.test.tsx` erstellen (Render-Test + Memoization-Test mit `@testing-library/react`)
- **1.6.4:** Error Boundary Test: Simuliere Three.js-Fehler, verifiziere Fallback-Render
- **1.6.5:** Performance-Test: `renderer.info.render.calls` soll < 100 Draw Calls pro Frame sein

### Dokumentation
- **1.6.6:** ADR `0015` — "React Compiler & R3F Performance Optimizations"

### Compliance
- **1.6.7:** `prefers-reduced-motion` entspricht WCAG 2.1 Level A (Criterion 2.2.2)

---

## Phase 2 (ex Phase 8): Spatial Audio Performance

### Schritt 2.1: Audio Parameter Smoothing
- **2.1.1:** `setListenerPosition` auf `setTargetAtTime` umstellen (aktuell: direkte `.value` Zuweisung → Audio-Pops)
- **2.1.2:** `setSourcePosition` auf `setTargetAtTime` mit `timeConstant = 0.01` umstellen
- **2.1.3:** `setSourceGain` prüfen — bereits `setTargetAtTime` implementiert, verifizieren

### Schritt 2.2: Listener Orientation
- **2.2.1:** Listener-Orientierung an Kamera-Richtung koppeln (HRTF braucht Forward/Up-Vektor für räumliche Auflösung)
- **2.2.2:** `setListenerOrientation(forwardX, forwardY, forwardZ, upX, upY, upZ)` in `SpatialAudioEngine` implementieren
- **2.2.3:** Hook `useCameraOrientation` in `packages/audio` erstellen (abonniert R3F-Camera-Quaternion)

### Schritt 2.3: Advanced Audio Features
- **2.3.1:** Directional Audio für Artwork-Descriptions: `coneInnerAngle = 60`, `coneOuterAngle = 120`, `coneOuterGain = 0.1`
- **2.3.2:** `maxDistance` und `refDistance` für realistischen Distanz-Roll-off konfigurieren
- **2.3.3:** `distanceModel = "inverse"` — manuelle `computeGain` entfernen oder anpassen (aktuell driftet von nativem Web Audio Verhalten ab)

### Schritt 2.4: Memory Management
- **2.4.1:** `dispose()` Idempotenz-Test erweitern (doppelter Aufruf sollte nicht crashen)
- **2.4.2:** `AudioBuffer` Pooling für häufige Sound-Effekte (falls zukünftig benötigt)

### Testing
- **2.4.3:** Test für `setTargetAtTime` Smoothing (Mock AudioParam, verifiziere `setTargetAtTime` Aufrufe)
- **2.4.4:** Test für Listener Orientation (Quaternion → Forward/Up Vektor Mapping)
- **2.4.5:** Test für Directional Audio Cone-Parameter

### Dokumentation
- **2.4.6:** ADR `0016` — "Spatial Audio Smoothing & HRTF Orientation"

### Compliance
- **2.4.7:** `prefers-reduced-motion` sollte auch Audio-Fades betreffen (keine plötzlichen Lautstärkesprünge)

---

## Phase 3 (ex Phase 9): Mode Transitions & UI

### Schritt 3.1: Memoization & Performance
- **3.1.1:** `ModeToggle` mit `React.memo` wrappen
- **3.1.2:** Inline-Style-Objekt in `ModeToggle` in `useMemo` auslagern oder Tailwind-Klassen nutzen
- **3.1.3:** `transitionToMode` mit `useCallback` stabilisieren (verhindert Re-renders bei identischer Funktion)

### Schritt 3.2: Accessibility
- **3.2.1:** `aria-pressed={mode === "immersive"}` auf Toggle-Button
- **3.2.2:** `aria-live="polite"` Region für Transition-Status ("Wechsel zu Galerie-Modus...")
- **3.2.3:** `prefers-reduced-motion` — bei true: Transition-Dauer auf 0ms setzen, sofortiger Wechsel
- **3.2.4:** Tastatur-Shortcut: `Escape` für "Zurück zu Lobby", `Space` für Modus-Toggle

### Schritt 3.3: Design Tokens
- **3.3.1:** Hardcodierte Farben (`#00f5d4`, `#0a0a0b`) durch CSS-Variablen / Tailwind-Theme ersetzen
- **3.3.2:** Transition-Dauer als CSS-Variable `--transition-duration` definieren

### Testing
- **3.3.3:** `ModeToggle.test.tsx` erstellen (Render, Click, aria-pressed Toggle)
- **3.3.4:** `prefers-reduced-motion` Test mit `window.matchMedia` Mock
- **3.3.5:** Tastatur-Shortcut Test (`fireEvent.keyDown`)

### Dokumentation
- **3.3.6:** ADR `0017` — "Mode Toggle Accessibility & Motion Preferences"

### Compliance
- **3.3.7:** WCAG 2.1 Level AA — Criterion 2.2.2 (Pause, Stop, Hide) via `prefers-reduced-motion`

---

## Phase 4 (ex Phase 10): Stripe Connect Härtung

### Schritt 4.1: Idempotenz & Transaktionssicherheit
- **4.1.1:** `createTransfers` mit Stripe `idempotencyKey` versehen (`idempotencyKey: `transfer_${orderId}_${splitHash}``)
- **4.1.2:** `createCheckoutSession` mit `idempotencyKey` versehen (`idempotencyKey: `checkout_${artworkId}_${timestamp}``)
- **4.1.3:** Sequentielle Transfer-Erstellung → `Promise.all` für Artist + DJ Transfer (unabhängige Operationen)
- **4.1.4:** `client_reference_id` setzen (Verknüpfung Stripe Session ↔ interne Order)

### Schritt 4.2: API-Härtung
- **4.2.1:** `paymentIntentId` Validierung: `startsWith("pi_")` prüfen
- **4.2.2:** `application_fee_amount` prüfen — aktuell wird `platformFeeCents` Parameter akzeptiert aber nicht an Stripe übergeben
- **4.2.3:** Currency-String `"eur"` als konstante `const CURRENCY = "eur"` exportieren
- **4.2.4:** Rückgabewert von `createCheckoutSession` auf `{ url: string; sessionId: string }` beschränken (nicht gesamtes Session-Objekt)

### Schritt 4.3: Testing
- **4.3.1:** Error-Handling Tests: Stripe wirft 500, 429, CardError → verifiziere korrekte Fehlerweitergabe
- **4.3.2:** Idempotenz-Test: Doppelter Aufruf mit gleichem Key → Stripe gibt identische Response
- **4.3.3:** Rounding-Edge-Case Test: `totalCents = 1` mit `hasDj = true` (0.6 + 0.2 + 0.2 ≠ 1 wegen floor)
- **4.3.4:** `Promise.all` Test: Artist + DJ Transfer werden parallel erstellt

### Dokumentation
- **4.3.5:** ADR `0018` — "Stripe Connect Idempotency & Parallel Transfers"

### Compliance
- **4.3.6:** PCI DSS — keine Kartendaten im eigenen System speichern (bereits implementiert, verifizieren)
- **4.3.7:** GoBD — Transfer-IDs und Order-IDs müssen immutable und auditierbar sein

---

## Phase 5 (ex Phase 11): AI-Client Robustheit

### Schritt 5.1: Retry-Logik & Resilienz
- **5.1.1:** Exponentieller Backoff für Anthropic-Errors: 429 (Rate Limit) → Retry nach `Retry-After` Header, 503 → Retry 3x mit 1s, 2s, 4s Delay
- **5.1.2:** Custom Error Class `AIClientError` mit `code`, `retryable`, `retryAfterMs`
- **5.1.3:** `maxRetries` und `retryDelay` als Optionen in `callClaude` exposen
- **5.1.4:** AbortController für Timeout — bereits implementiert, verifizieren, dass es auch Retries abbricht

### Schritt 5.2: Streaming-Unterstützung
- **5.2.1:** `callClaude` um `stream: boolean` Option erweitern
- **5.2.2:** `streamClaude(prompt, opts)` als separate Funktion (Streaming API nutzt `for await...of` auf `message_stream`)
- **5.2.3:** `AIDescriptionAssistant` um Streaming-UI erweitern (Typing-Effekt)

### Schritt 5.3: Zod-Integration
- **5.3.1:** `generateJson` statt loose `validator` mit Zod-Schema akzeptieren: `generateJson<T>(prompt, zodSchema: z.ZodSchema<T>)`
- **5.3.2:** JSON-Extraction aus Markdown-Code-Blocks bereits implementiert — Zod-Parse danach hinzufügen

### Schritt 5.4: Client-Tests
- **5.4.1:** `client.test.ts` erstellen (Mock Anthropic SDK via `vitest.mock`)
- **5.4.2:** Retry-Test: 429 → Retry → Erfolg
- **5.4.3:** Timeout-Test: Langsame Response → AbortError nach 25s
- **5.4.4:** JSON-Extraction Test: Markdown-Block → geparstes JSON
- **5.4.5:** Streaming Test: Simuliere chunked Response

### Schritt 5.5: Observability
- **5.5.1:** Request/Response Logging Hook (für Produktion, nicht nur Audit-Log)
- **5.5.2:** Latency-Metriken: Dauer pro Request, Token-Count, Cache-Hit-Rate

### Dokumentation
- **5.5.3:** ADR `0019` — "AI Client Resilience & Streaming"

### Compliance
- **5.5.4:** DSGVO Art. 22 — KI-Entscheidungen müssen erklärbar sein (bereits via `/api/ai/explain` implementiert, verifizieren)
- **5.5.5:** ISO/IEC 27001 — Audit-Trail aller AI-Requests (bereits via `ai_decisions` Tabelle, verifizieren)

---

## Phase 6 (ex Phase 12): Edge & Performance Härtung

### Schritt 6.1: React Compiler
- **6.1.1:** `babel-plugin-react-compiler` installieren und konfigurieren
- **6.1.2:** `experimental.reactCompiler = true` in `next.config.ts` aktivieren
- **6.1.3:** Build testen — React Compiler kann Seiteneffekte im Render erkennen und warnen

### Schritt 6.2: Next.js Config Optimierung
- **6.2.1:** `output: "standalone"` für containerisierte Deployments
- **6.2.2:** `poweredByHeader: false` (Security Header entfernen)
- **6.2.3:** `compress: true` explizit setzen
- **6.2.4:** `images.remotePatterns` einschränken (nicht `"/**"`, sondern spezifische Sanity-Domains)
- **6.2.5:** Bundle Analyzer konfigurieren (siehe Phase 0.2)

### Schritt 6.3: Caching & CDN
- **6.3.1:** Cache-Headers für statische Assets: `Cache-Control: public, max-age=31536000, immutable` für JS/CSS Chunks
- **6.3.2:** ISR für semi-dynamische Routen: `revalidate = 3600` für Galerie-Seiten
- **6.3.3:** Edge Function `geo-locale.ts` optimieren: `Cache-Control: public, max-age=86400` für Geo-Antworten
- **6.3.4:** Lighthouse CI Budgets definieren: LCP < 2.5s, CLS < 0.1, INP < 200ms

### Schritt 6.4: Performance Monitoring
- **6.4.1:** `web-vitals` Paket integrieren für RUM (Real User Monitoring)
- **6.4.2:** Vitals an `/api/analytics` senden (Datenbank oder externer Service)
- **6.4.3:** `next.config.ts` `experimental.instrumentationHook = true` für Server-Monitoring

### Testing
- **6.4.4:** Lighthouse CI E2E Test erweitern: INP-Messung hinzufügen (neu in 2026)
- **6.4.5:** Bundle-Size-Test: `main` chunk < 200KB nach gzip
- **6.4.6:** Memory-Budget-Test: Heap nach 5min < 100MB

### Dokumentation
- **6.4.7:** ADR `0020` — "React Compiler & RUM Integration"

### Compliance
- **6.4.8:** ISO/IEC 27001 — Logging aller Security-relevanten Events

---

## Phase 7 (ex Phase 13): Compliance & Security Härtung

### Schritt 7.1: Consent API Härtung
- **7.1.1:** Rate Limiting auf `/api/consent`: IP-basiert, 10 Requests / Minute
- **7.1.2:** IP-Hash durch `crypto.subtle.digest("SHA-256", ...)` ersetzen (aktuell: custom String-Hash, nicht kryptographisch sicher)
- **7.1.3:** User-Agent auf max 255 Zeichen truncaten (verhindert DB-Bloat)
- **7.1.4:** `GET /api/consent` erstellen (DSGVO Art. 15 — Abfrage aktueller Consent-Status)
- **7.1.5:** `document_version` Validierung: Nur akzeptierte Versions-Strings zulassen
- **7.1.6:** Supabase-Insert mit Retry-Logik (bei Netzwerkfehlern)

### Schritt 7.2: Account Deletion Härtung
- **7.2.1:** `POST /api/account/delete` — idempotente Operation (doppelter Aufruf gibt 200, nicht Fehler)
- **7.2.2:** Soft-Delete Option für Orders (nicht nur `buyer_id = null`, sondern `deleted_at` Timestamp)
- **7.2.3:** Cascading Delete Verifikation: Prüfen, dass keine Foreign-Key-Verletzungen auftreten

### Schritt 7.3: CSP & Headers
- **7.3.1:** CSP `nonce` für inline Scripts generieren (verhindert XSS)
- **7.3.2:** `Content-Security-Policy-Report-Only` Header für Monitoring
- **7.3.3:** `Permissions-Policy` Header hinzufügen (z. B. `geolocation=(), microphone=()`)
- **7.3.4:** `Referrer-Policy: strict-origin-when-cross-origin`

### Testing
- **7.3.5:** `consent.test.ts` erstellen (POST, GET, Rate Limit, IP-Hash)
- **7.3.6:** `account-delete.test.ts` erstellen (Auth, Idempotenz, Cascade)
- **7.3.7:** Security-Header-Test: Verifiziere CSP, HSTS, Permissions-Policy in Response

### Dokumentation
- **7.3.8:** ADR `0021` — "Consent API Härtung & Security Headers"

### Compliance
- **7.3.9:** DSGVO Art. 15 (Recht auf Auskunft) — `GET /api/consent`
- **7.3.10:** DSGVO Art. 17 (Recht auf Löschung) — `POST /api/account/delete`
- **7.3.11:** DSGVO Art. 7 (Nachweisbarkeit der Einwilligung) — `consent_log` Tabelle
- **7.3.12:** TTDSG § 25 — Consent-Banner muss vor nicht-essentiellen Cookies blockieren
- **7.3.13:** ISO/IEC 27001 A.12.6 — Technische Schwachstellenmanagement (Dependabot 36 Vulns)

---

## Phase 8: Cross-Cutting & Quality Gates

### Schritt 8.1: Error Boundaries (Überall)
- **8.1.1:** `app/[locale]/error.tsx` (Root Error Boundary)
- **8.1.2:** `app/[locale]/canvas/error.tsx` (Canvas-spezifisch)
- **8.1.3:** `app/[locale]/shop/error.tsx` (Shop-spezifisch)
- **8.1.4:** `ErrorFallback`-Komponente mit "Zurück zur Startseite" und Error-ID für Support

### Schritt 8.2: Accessibility (a11y)
- **8.2.1:** Alle Buttons müssen `aria-label` oder sichtbaren Text haben
- **8.2.2:** Focus-Indikatoren für Tastaturnavigation (Tailwind `focus-visible:ring`)
- **8.2.3:** Farbkontrast prüfen: WCAG 2.1 AA (4.5:1 für normalen Text)
- **8.2.4:** Screen-Reader-Tests mit NVDA / VoiceOver

### Schritt 8.3: TypeScript Strictness
- **8.3.1:** `noImplicitReturns` aktivieren (falls noch nicht)
- **8.3.2:** `noFallthroughCasesInSwitch` aktivieren
- **8.3.3:** Phase-6 WIP Dateien (`cart.test.tsx`, `AddToCartButton.tsx`, etc.) — **NICHT ANFASSEN** (GPT 5.4 Scope)

### Schritt 8.4: GitHub Actions
- **8.4.1:** `security.yml` erweitern: Dependabot Auto-Merge für Patch-Level Updates
- **8.4.2:** Bundle-Size-Check in CI (fails bei > 10% Regression)
- **8.4.3:** Lighthouse CI in PR-Checks integrieren
- **8.4.4:** Type-Check-Job: `tsc --noEmit` für alle Packages

---

## Definition of Done (Global)

Jeder Schritt gilt erst als abgeschlossen, wenn:

1. **Testing:** Automatisierte Tests vorhanden und passing (Vitest + Playwright E2E wo relevant)
2. **Dokumentation:** Code kommentiert, ADR aktualisiert/erstellt
3. **Compliance:** Relevante DSGVO/ISO/PCI-Regelungen berücksichtigt und dokumentiert
4. **Type Safety:** `tsc --noEmit` fehlerfrei für den eigenen Slice (Phase-6 WIP ausgenommen)
5. **Bundle Impact:** Keine Regression > 5KB gzip im Haupt-Chunk

---

## Zeitplan & Priorisierung

| Phase | Dauer (geschätzt) | Prio |
|-------|-------------------|------|
| 0: Foundation | 2h | 🔴 Kritisch |
| 1: 3D Performance | 3h | 🔴 Kritisch |
| 2: Audio | 2h | 🟡 Hoch |
| 3: Mode Transitions | 1.5h | 🟡 Hoch |
| 4: Stripe | 2h | 🔴 Kritisch |
| 5: AI | 3h | 🟡 Hoch |
| 6: Edge/Perf | 2h | 🟡 Hoch |
| 7: Compliance | 2h | 🟡 Hoch |
| 8: Cross-Cutting | 2.5h | 🟢 Mittel |
| **Gesamt** | **~20h** | — |

---

## Risiken & Blocker

| Risiko | Mitigation |
|--------|-----------|
| React Compiler könnte R3F-JSX-Typen brechen | Ausführliche Tests nach Aktivierung, ggf. `exclude` für R3F-Dateien |
| Stripe Idempotency Keys erfordern API-Key-Reset bei Konflikten | Testen in Stripe Test-Modus vor Production |
| AI Streaming erfordert UI-Änderungen in `AIDescriptionAssistant` | Separate Sub-Task, Fallback auf non-Streaming möglich |
| Phase-6 WIP TypeScript-Fehler blockieren `tsc --noEmit` | `skipLibCheck` für WIP-Dateien oder separate tsconfig |

---

*Plan erstellt am 29.04.2026 von Kimi K-NN (System-Agent)*
*Recherche-Quellen: React 19 Performance Guide 2026, Three.js 100 Tips 2026, Next.js 15 Performance Strategies 2026*
