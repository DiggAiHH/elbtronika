# ELBTRONIKA – Architektur- und Ausführungsplan v1.0

> **Dokument-Typ:** Principal Architect Execution Plan
> **Stand:** 24. April 2026
> **Autor:** Lou (diggai@tutanota.de) in Zusammenarbeit mit Claude (Principal Architect Mode)
> **Basis:** State-of-the-Art Research-Dossier vom 24.04.2026 + Projekt-Brief ELBTRONIKA
> **Zielmodus:** Solo-Entwicklung (Lou + Claude als Pair), Ground Zero, Claude-First AI-Stack, Netlify-Deployment
> **Status:** PLAN – nicht zur Ausführung freigegeben. Warte auf Freigabe durch Lou vor jedem Code-Commit.

---

## 0. Executive Summary

ELBTRONIKA vereint eine immersive 3D-Kunstgalerie mit räumlichem Audio und einem tripartiten E-Commerce-Splittingmodell (60% Künstler / 20% DJ / 20% Plattform). Das Projekt ist architektonisch kein "klassisches Web-Projekt", sondern ein hybrides System, das einen WebGPU-Canvas als persistente Rendering-Schicht mit einer klassischen DOM-basierten Commerce-UI verschmilzt. Die geschäftskritische Differenzierung liegt in der nahtlosen, reload-freien Transition zwischen "Immersive Mode" (Emotion, Entdeckung) und "Classic Mode" (Conversion, Kauf).

Die Roadmap umfasst 16 Phasen über geschätzte 20–24 Kalenderwochen (Solo-Development mit Claude-Pairing). Der kritische Pfad verläuft über: (1) rechtliche Grundlagen + Stripe-KYC (blockiert alles Kommerzielle), (2) Asset-Pipeline + R2 (blockiert Content), (3) Single-Canvas-Architektur (blockiert Mode-Switching). Alle drei müssen vor Phase 7 abgeschlossen sein, sonst ergibt sich technische Schuld, die im Nachgang teuer ist.

**Drei architektonische Prinzipien, die der Plan durchzieht:**

1. **Single Canvas, multiple Projections** – Der WebGPU-Canvas wird niemals unmountet. Mode-Switching geschieht über Kamera-Interpolation und Shader-Transitions, nicht über Route-Changes mit Canvas-Recreation.
2. **Privacy by Architecture** – Jeder externe Request (SoundCloud, Stripe, Analytics) läuft entweder über einen Netlify-Edge-Proxy oder ist cookieless. DSGVO ist keine Nachträgliche Compliance, sondern Grundriss.
3. **Deterministische Commerce-Layer** – Stripe Connect mit "Separate Charges and Transfers" + strikte Idempotenz + Row Level Security. Finanzströme sind nicht verhandelbar.

---

## 1. Architektur-Entscheidungen (ADRs Kurzform)

| Entscheidung | Gewählt | Alternative(n) | Begründung |
|---|---|---|---|
| Frontend-Framework | **Next.js 15 App Router** | Vite+TanStack Start, Astro 5 | Mischung aus SSR für SEO (Artworks, Artists) und Client-SPA für Gallery-Canvas. Native Netlify-Runtime-Integration. |
| Rendering Engine | **Three.js r184 + R3F v9 (WebGPURenderer)** | Native WebGPU, Babylon.js 7 | Laut Research-Dossier produktionsreif, minimale Migrations-Hürde, automatisches WebGL2-Fallback. |
| State (global) | **Zustand v5** | Redux Toolkit, Jotai | Shallow-subscribe kompatibel mit `useFrame`-Loop, kein Context-Re-Render. |
| State (async/server) | **TanStack Query v5** | SWR, RTK Query | Idempotente Cache-Invalidation, kompatibel mit Server Components. |
| Audio | **Native Web Audio API + PannerNode** | Howler.js, Tone.js, AudioWorklet | Research explizit: AudioWorklet 128-Sample-Bug auf Mobile. PannerNode läuft native C++, stabil. |
| HLS-Ingestion | **hls.js v1.6+** | Shaka Player, native Safari | Shaka hat mehr Features, hls.js ist leichter + Safari braucht sowieso `canPlayType` Branching. |
| Headless CMS | **Sanity v4** | Payload CMS, Contentful, Strapi | Portable Text für Story-Erzählungen, GROQ-Queries sehr mächtig, gutes Preview-Setup, kostenloses Hobby-Tier reicht für MVP. |
| Datenbank | **Supabase (Postgres 16 + RLS + pgvector)** | Neon, PlanetScale, Firebase | RLS zwingend für Mandantentrennung (Künstler ↔ DJs ↔ Käufer), pgvector für spätere Embedding-basierte Empfehlungen, eingebautes Auth. |
| Auth | **Supabase Auth (Magic Link + OAuth)** | Clerk, Auth.js | Keine zusätzlichen Vendor, DSGVO-konform (EU-Region wählbar). |
| Payments | **Stripe Connect (Standard Accounts) + Separate Charges and Transfers** | Mangopay, Adyen for Platforms | Research-Dossier explizit: rechtssicher, KYC-Delegation, React-Integration reif. |
| Storage | **Cloudflare R2** | AWS S3, Backblaze B2, Supabase Storage | Zero-Egress → entscheidend bei Terabyte-skalierendem Traffic. R2 Local Uploads (2026) minimiert Ingestion-Latenz. |
| Hosting Frontend | **Netlify (Multi-Cloud CDN)** | Vercel, Cloudflare Pages | User-Vorgabe. Edge Functions auf Deno-Runtime für Reverse Proxy. |
| Edge Functions | **Netlify Edge Functions (Deno)** | Cloudflare Workers (später möglich) | Native Next.js-Integration, kein zweiter Deployment-Pfad. |
| AI-Provider | **Anthropic API – Claude Sonnet 4.6 / Opus 4.6** | OpenAI, Google Gemini | User-Entscheidung: Claude-First. Sonnet für produktive Kuration, Opus für komplexe Autoren-Texte. |
| Analytics | **Plausible (EU-gehostet) ODER Matomo Self-Hosted** | Google Analytics 4, Mixpanel | Cookieless, CNIL-konform → Consent-Pflicht umgangen. |
| Consent Management | **Custom Banner + Klaro.js als Fallback** | Cookiebot, Usercentrics | Eigenbau ist bei minimalem Tracking-Scope zumutbar; Klaro als getesteter OSS-Fallback. |
| Forms & Validation | **React Hook Form + Zod** | Formik, Yup | Schemas als Single Source of Truth (shared zwischen Client/Server). |
| Testing | **Vitest + Testing Library + Playwright** | Jest, Cypress | Vitest native ESM, Playwright auch für 3D-Screenshots. |
| Monitoring | **Sentry (Frontend + Serverless)** | Datadog, LogRocket | Kostenlose Developer-Stufe, DSGVO-EU-Region. |
| CI/CD | **GitHub Actions + Netlify Deploy** | GitLab CI, CircleCI | Frei bis Limit, reicht für Solo. |
| Secret Management | **Doppler** | 1Password, Vault, .env | Zentrale Secret-Rotation, Integration mit Netlify und GitHub Actions. |
| Linting / Formatting | **Biome v2** | ESLint + Prettier | 2026 mature, 10x schneller, ein Tool statt zwei. |
| Package Manager | **pnpm v10** | npm, yarn, bun | Workspaces + Symlink-Effizienz. |

---

## 2. Tech-Stack in Versionen (April 2026)

### 2.1 Runtime & Core
- Node.js: 22.x LTS (nur für Build/Tooling)
- Deno: 2.x (Netlify Edge Functions Runtime, vom Host verwaltet)
- TypeScript: 5.7+ (strict mode, exactOptionalPropertyTypes)
- pnpm: 10.x

### 2.2 Frontend
- Next.js: 15.3.x
- React: 19.1.x
- Tailwind CSS: v4.x (neue Oxide-Engine)
- shadcn/ui: Canary (2026 Tailwind v4 compatible)
- Radix UI Primitives: 2.x
- Framer Motion: 12.x
- Lucide React: 0.5+

### 2.3 3D
- three: r184
- @react-three/fiber: v9
- @react-three/drei: v10
- @react-three/postprocessing: v3
- @react-three/rapier: v2 (Physics, optional für Avatar)
- three-mesh-bvh: v0.8 (Raycasting-Optimierung)
- ktx2-parser, draco3d (Asset-Kompression)

### 2.4 Audio
- hls.js: v1.6+
- Web Audio API (Browser-Native)

### 2.5 State / Data
- zustand: v5
- @tanstack/react-query: v5
- react-hook-form: v7.5+
- zod: v4

### 2.6 Backend / Integrations
- @supabase/supabase-js: v3
- stripe: v20
- @sanity/client: v8
- @anthropic-ai/sdk: v0.60+

### 2.7 DevOps / Testing
- vitest: v3
- @playwright/test: v2 (2026-Generation)
- @testing-library/react: v17
- biome: v2
- lighthouse-ci: v0.14
- @axe-core/playwright: v4.10

---

## 3. Repo-Struktur (Monorepo via pnpm workspaces)

```
elbtronika/
├── apps/
│   ├── web/                      # Next.js 15 – Haupt-Frontend
│   │   ├── app/                  # App Router
│   │   │   ├── (marketing)/      # Landing, About
│   │   │   ├── (shop)/           # Classic Mode: /shop, /artwork/[id]
│   │   │   ├── (immersive)/      # 3D Gallery: /gallery
│   │   │   ├── (profile)/        # Artists, DJs
│   │   │   ├── (checkout)/       # Stripe Flow
│   │   │   ├── api/              # Route Handlers (Webhooks, Server Actions)
│   │   │   └── layout.tsx        # Root: enthält persistent <CanvasRoot />
│   │   ├── components/
│   │   ├── lib/
│   │   └── public/
│   └── edge/                     # Standalone Edge Functions (falls Next-API nicht reicht)
├── packages/
│   ├── ui/                       # Shadcn + eigene Components
│   ├── three/                    # R3F-Scenes, Shader, Materials
│   ├── audio/                    # Web Audio Graph, HLS-Loader, Proximity-Fader
│   ├── contracts/                # Zod-Schemas (shared Client/Server)
│   ├── sanity-studio/            # Embedded Sanity Studio
│   └── config/                   # Tailwind, TS, Biome configs
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── netlify.toml
├── turbo.json                    # Turborepo Pipelines
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

## 4. Phasenplan

### Legende der Definition of Done (DoD) pro Phase

Jede Phase ist erst abgeschlossen, wenn **alle vier DoD-Säulen** erfüllt sind:

- ✅ **Testing** – Mindestens ein automatisierter Test (Unit/Integration/E2E) je neuer Funktion, im CI grün.
- ✅ **Dokumentation** – Code-Kommentare bei nicht-trivialer Logik; API-Dokumentation (OpenAPI oder TSDoc); Architekturentscheidung als ADR in `/docs/adr/`; optional Sync nach Google Drive über Claude.
- ✅ **Compliance** – DSGVO/GDPR, ISO/IEC 27001-Prinzipien, AI-Act-relevante Punkte dokumentiert und technisch umgesetzt.
- ✅ **Deployment-Ready** – Lauffähig auf Netlify Preview-Branch, Monitoring greift, Rollback getestet.

---

### Phase 0 – Rechtliche und geschäftliche Fundamente (Woche 1–2)

Der technologische Stack ist nutzlos, wenn Stripe-KYC nicht abgeschlossen ist und keine Verträge stehen. Dieser Block läuft parallel zu Phase 1.

#### Schritt 0.1 – Rechtsform & Identität
- 0.1.1 Entscheidung über Rechtsform (Einzelunternehmen mit Gewerbe, UG, GmbH) – **Blocker: Steuerberater-Rückfrage**.
- 0.1.2 Eintragung beim Finanzamt, Steuernummer beschaffen.
- 0.1.3 Impressum, Datenschutzerklärung, AGB – rechtssicher, nicht generiert. Budget für Fachanwalt IT-Recht einplanen.
- 0.1.4 Markenrecherche "ELBTRONIKA" (DPMA + EUIPO), ggf. Markenanmeldung.

#### Schritt 0.2 – Verträge
- 0.2.1 Künstler-Nutzungsvertrag (Rechteübertragung für digitale Präsentation, Verkaufsprovision, Laufzeit, DSGVO-Auftragsverarbeitung wo nötig).
- 0.2.2 DJ-Vertrag (Rechte an Set, Remix-/Cover-Lizenzen, GEMA-Problematik adressieren).
- 0.2.3 Käufer-AGB mit klarer Regelung zu Original + Exclusive Set (physisch/digital).
- 0.2.4 Widerrufsrecht: Digitalgüter nach § 356 Abs. 5 BGB – korrekter Consent-Mechanismus vor Lieferung.

#### Schritt 0.3 – Stripe KYC (zeitkritisch, 5–10 Werktage Bearbeitung)
- 0.3.1 Stripe-Business-Account beantragen (für Plattform-Konto).
- 0.3.2 Stripe Connect aktivieren (Platform + Connected Accounts).
- 0.3.3 Testmodus-Schlüssel sichern in Doppler.
- 0.3.4 Produktiv-Schlüssel erst kurz vor Launch aktivieren.

#### Schritt 0.4 – Domains, Branding, Basiskonten
- 0.4.1 Domains: `elbtronika.de`, `elbtronika.com`, `elbtronika.art`. DNS bei Cloudflare.
- 0.4.2 Google Workspace o.Ä. für `hallo@elbtronika.de`, `rechnung@elbtronika.de`.
- 0.4.3 GitHub Organisation: `elbtronika`.
- 0.4.4 Netlify, Cloudflare, Supabase, Sanity, Anthropic, Stripe, Sentry: alle Konten mit Team-E-Mail, nicht privater Adresse.

**DoD Phase 0:** Alle Konten angelegt, Juristische Dokumente final, Stripe KYC in Bearbeitung. Dokumentiert in `/docs/legal/` + Google Drive.

---

### Phase 1 – Repository, Tooling, Developer Experience (Woche 2)

#### Schritt 1.1 – Repo-Initialisierung
- 1.1.1 GitHub-Repo `elbtronika/elbtronika` erstellen (privat).
- 1.1.2 `pnpm init` + `pnpm-workspace.yaml` mit `apps/*`, `packages/*`, `supabase`.
- 1.1.3 Turborepo installieren + `turbo.json` für Pipelines (`build`, `dev`, `test`, `lint`).
- 1.1.4 `.gitignore`, `.editorconfig`, `.nvmrc` (Node 22).

#### Schritt 1.2 – TypeScript & Linting
- 1.2.1 Root `tsconfig.base.json` mit `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- 1.2.2 Biome v2 konfigurieren (`biome.json`) – einheitliche Rules für alle Packages.
- 1.2.3 Husky + lint-staged: Pre-commit Biome + Typecheck.
- 1.2.4 Commitlint + Conventional Commits.

#### Schritt 1.3 – Next.js 15 Scaffold
- 1.3.1 `apps/web`: `create-next-app@latest --app --typescript --tailwind --biome`.
- 1.3.2 Tailwind v4 Konfiguration mit Design Tokens (CSS Custom Properties statt JS-Config).
- 1.3.3 shadcn/ui initialisieren, Dark-Mode als Default.
- 1.3.4 App-Router Struktur aus Repo-Struktur anlegen.

#### Schritt 1.4 – Shared Packages
- 1.4.1 `packages/ui` mit Button, Dialog, Slider, Toast – barrierearme Radix-basierte Primitives.
- 1.4.2 `packages/contracts` mit Zod-Schemas für User, Artwork, Artist, DJ, Order.
- 1.4.3 `packages/config` mit geteilten Tailwind-, TS-, Biome-Configs.

#### Schritt 1.5 – CI/CD initial
- 1.5.1 `.github/workflows/ci.yml`: Install, Typecheck, Lint, Test, Build auf jede PR.
- 1.5.2 Netlify verknüpfen, Preview-Deploys auf PRs.
- 1.5.3 Branch-Protection auf `main`: Status-Checks required, keine Force-Pushes.

**DoD Phase 1:** `pnpm dev` startet leere Next.js-App lokal. `pnpm test` läuft (leer) grün. CI baut grün, Preview-URL verfügbar. ADR `0001-monorepo-tooling.md` geschrieben.

---

### Phase 2 – Design System & Core UI (Woche 3)

#### Schritt 2.1 – Design Tokens
- 2.1.1 Farbpalette (dunkel, club-inspiriert): Primary Neon-Cyan, Secondary Magenta, Background Near-Black (#0A0A0B), Surface 3%-Weiß.
- 2.1.2 Typographie: Display (Serif, custom) + Body (Inter), Monospace (JetBrains Mono) für Künstler-Attribute.
- 2.1.3 Spacing-Scale 4px-Basis, Breakpoints (mobile 360, tablet 768, desktop 1280, wide 1920).
- 2.1.4 Motion-Tokens: easing, duration (fast=120ms, normal=260ms, slow=480ms, cinematic=1200ms).

#### Schritt 2.2 – Basis-Komponenten
- 2.2.1 Button (primary/secondary/ghost/destructive, Loading-State, Icon-Prop).
- 2.2.2 Input, Textarea, Select, Checkbox, Slider – alle via Radix Primitives.
- 2.2.3 Modal/Dialog (für Artwork Overlay), Toast (für Feedback), Skeleton.
- 2.2.4 Typography-Components: Heading, Text, Caption, Numeric.
- 2.2.5 Layout: Container, Stack, Grid, Spacer.

#### Schritt 2.3 – Visueller Identitätstest
- 2.3.1 Storybook 9 aufsetzen (`packages/ui/stories`).
- 2.3.2 Dunkelmodus-Screenshot jeder Komponente als Visual-Regression-Baseline.
- 2.3.3 Accessibility-Smoke-Test mit axe-core je Story.

**DoD Phase 2:** Storybook deployed auf Netlify Preview. Alle Komponenten a11y-konform (WCAG 2.1 AA, verifiziert). ADR `0002-design-system.md`.

---

### Phase 3 – Infrastruktur: Supabase, Cloudflare R2, Sanity (Woche 3–4, parallel zu Phase 2)

#### Schritt 3.1 – Supabase Setup
- 3.1.1 Neues Projekt in EU-Region (Frankfurt).
- 3.1.2 Datenbank-Schema aus Zod-Schemas ableiten. Tabellen: `profiles`, `artists`, `djs`, `artworks`, `sets`, `orders`, `transactions`, `consent_log`.
- 3.1.3 Row Level Security (RLS) **pro Tabelle** aktivieren. Default: deny-all. Policies explizit für: owner-read, public-read-published, admin-all.
- 3.1.4 Migrations über Supabase CLI (`supabase/migrations/`), versioniert im Git.
- 3.1.5 pgvector-Extension für spätere Empfehlungs-Embeddings.
- 3.1.6 Triggers: `updated_at` automatisch, Audit-Log in `audit_events` für finanzrelevante Änderungen.

#### Schritt 3.2 – Cloudflare R2 & Domain
- 3.2.1 Cloudflare Account, Domains auf CF-Nameserver umziehen.
- 3.2.2 R2-Bucket `elbtronika-assets` in EU, öffentlicher Custom-Domain-Zugriff über `cdn.elbtronika.art`.
- 3.2.3 CORS-Policy konfigurieren: nur `https://elbtronika.art` und Preview-Deploys erlaubt.
- 3.2.4 Signed-URL-Worker für privaten Download (Exclusive DJ Sets nach Kauf).
- 3.2.5 R2 Local Uploads aktivieren für Artist-Ingestion (laut Research-Dossier 2026 Feature).

#### Schritt 3.3 – Sanity CMS
- 3.3.1 Sanity-Projekt, EU-Dataset, Embedded Studio unter `/studio` auf Netlify.
- 3.3.2 Schemas: `artwork`, `artist`, `dj`, `room`, `set`, `story` (Portable Text).
- 3.3.3 Referenzfelder: Artwork ↔ Artist, Artwork ↔ DJ ↔ Set, Artwork ↔ Room.
- 3.3.4 Media-Felder mit direkter Weiterleitung zu R2 via Custom Upload-Handler.
- 3.3.5 Draft/Publish-Workflow + Review-Rollen für Kuratorin.

#### Schritt 3.4 – Secrets Management
- 3.4.1 Doppler-Projekt `elbtronika`, Environments: `dev`, `preview`, `prod`.
- 3.4.2 Alle API-Keys nur in Doppler, Injection in Netlify Build und GitHub Actions.
- 3.4.3 Lokale `.env.local` nur via `doppler run` – keine Plain-Secrets im Repo.

**DoD Phase 3:** Supabase schema migrated + seeded mit Dummy-Daten, RLS-Policies durch SQL-Unit-Tests verifiziert. R2-Upload durch Test-Script erfolgreich. Sanity Studio live, erste Dummy-Artwork angelegt. ADR `0003-infrastruktur.md` + Architektur-Diagramm in `/docs/architecture/`.

---

### Phase 4 – Authentication & Benutzer-Rollen (Woche 4)

#### Schritt 4.1 – Auth-Flow
- 4.1.1 Supabase Auth mit Magic Link (E-Mail passwordless) als primäre Methode.
- 4.1.2 OAuth: Google, Apple – für Käufer-Convenience.
- 4.1.3 Server-seitig via `@supabase/ssr` in Next.js App Router.
- 4.1.4 Cookie-basierte Session, `HttpOnly`, `Secure`, `SameSite=Lax`.

#### Schritt 4.2 – Rollen & Profiles
- 4.2.1 Rollen: `visitor`, `collector` (Käufer), `artist`, `dj`, `curator`, `admin`.
- 4.2.2 Rolle im `profiles`-Table, JWT-Claim via Custom-Access-Token-Hook.
- 4.2.3 Onboarding-Flow für Artists und DJs: Profil ausfüllen → Stripe-Connect-Onboarding (Phase 11).

#### Schritt 4.3 – Auth-UI
- 4.3.1 `/login`, `/signup`, `/verify`, `/logout` Routes.
- 4.3.2 Passwortloser Flow als Default.
- 4.3.3 Post-Login Redirect zu Rollen-Dashboard.

#### Schritt 4.4 – Sicherheit & Tests
- 4.4.1 RLS-Policy-Tests: authentifizierter User sieht nur eigene Order-History.
- 4.4.2 Rate-Limiting auf Magic-Link-Anforderung (Supabase-Built-in + Netlify Edge).
- 4.4.3 E2E-Test: Magic Link Flow durchläuft erfolgreich.

**DoD Phase 4:** Auth-Flow auf Preview-Deploy getestet. Alle RLS-Policies mit negativem Testcase abgesichert. Consent-Log-Eintrag pro Registrierung (für DSGVO Opt-in-Nachweis). ADR `0004-auth.md`.

---

### Phase 5 – Content Model & CMS Integration (Woche 5)

#### Schritt 5.1 – Content-Modellierung
- 5.1.1 `Artwork`-Entity: titel, künstler, dj, set, room, preis, medium, dimensionen, story (PortableText), gltf-model (R2-ref), textures (R2-refs), primary-image, secondary-images.
- 5.1.2 `Artist`-Entity: name, bio, portrait, social-links, stripe-connect-id, ländercode (für Steuer).
- 5.1.3 `DJ`-Entity: analog zu Artist + soundcloud-handle.
- 5.1.4 `Set`-Entity: titel, soundcloud-track-id, hls-manifest-url, duration, cover-artwork-ref.
- 5.1.5 `Room`-Entity: 3D-Szenen-Konfiguration (position, skybox, lighting, artwork-slots).

#### Schritt 5.2 – Sync Sanity → Supabase
- 5.2.1 Sanity Webhook bei publish → Netlify Edge Function → Supabase Mirror-Tabelle.
- 5.2.2 Content-Draft nur in Sanity, Lese-Performance über Supabase + On-Demand-Revalidation in Next.js.
- 5.2.3 Tests für Sync-Idempotenz (wiederholtes Webhook darf nicht doppelt einfügen).

#### Schritt 5.3 – Asset-Pipeline
- 5.3.1 Upload-Endpoint `/api/assets/upload` → signed URL zu R2.
- 5.3.2 Server-side Validation: Max-Size, Mime-Types, Virus-Scan (ClamAV via VirusTotal-API o.ä. bei sensiblen Uploads).
- 5.3.3 Automatische Transkodierung: Bilder → AVIF + WebP in mehreren Größen (Netlify Image Transform oder Cloudflare Images).
- 5.3.4 3D-Models: Draco-Kompression + KTX2-Texturen beim Upload.
- 5.3.5 Audio → HLS-Encoding via externe Pipeline (FFmpeg in Netlify Background Function oder externer Worker).

#### Schritt 5.4 – Künstler-Dashboard
- 5.4.1 `/dashboard/artist` – Artworks listen, neue einreichen, Status-Tracking.
- 5.4.2 Upload-Forms mit React Hook Form + Zod.
- 5.4.3 Preview-Modus: Artwork in einer Mini-3D-Ansicht testen.

**DoD Phase 5:** Drei Beispiel-Artworks (inkl. GLB-Modell + HLS-Stream) angelegt, in Frontend abrufbar. Upload-Pipeline mit Virus-Scan verifiziert. ADR `0005-content-model.md`.

---

### Phase 6 – Classic Mode: Shop & Browse (Woche 6–7)

#### Schritt 6.1 – Shop-Grid `/shop`
- 6.1.1 SSR mit Next.js Server Components für initiale Liste (SEO).
- 6.1.2 Client-Components für Filter (Artist, DJ, Preis-Range, Raum, Medium).
- 6.1.3 URL-State für Filter (`nuqs` Library oder eigene URLSearchParams-Hook).
- 6.1.4 Skeleton-Loading, Pagination (Cursor-basiert, nicht Offset).

#### Schritt 6.2 – Artwork Detail `/artwork/[slug]`
- 6.2.1 SSR mit Open-Graph-Meta-Tags (dynamisch: Artwork-Bild als OG-Image).
- 6.2.2 Hero-Bild + Galerie-Thumbnails.
- 6.2.3 Story-Abschnitt (Sanity PortableText Renderer).
- 6.2.4 Audio-Player mit HLS-Support (Vorschau-30s oder Volle, je nach Rechtesituation mit DJ).
- 6.2.5 "Acquire Artwork"-CTA → Checkout (Phase 11).
- 6.2.6 Related Artworks (gleicher Künstler / DJ / Raum).

#### Schritt 6.3 – Artist/DJ Profile `/artist/[slug]` & `/dj/[slug]`
- 6.3.1 Profil-Hero mit Porträt, Bio.
- 6.3.2 Werke-Liste (bei Künstlern) / Sets-Liste (bei DJs).
- 6.3.3 Cross-Links zu jeweils Gegenpart.

#### Schritt 6.4 – Warenkorb (Lean)
- 6.4.1 Zustand-Store für Cart; persistenter Storage in Supabase für angemeldete User, localStorage als Fallback.
- 6.4.2 Minimal-Cart: Ein Artwork gleichzeitig (das MVP braucht keinen Multi-Item-Flow).
- 6.4.3 Cart-Drawer-UI.

**DoD Phase 6:** Shop-Seite Lighthouse Performance ≥ 90, Best Practices ≥ 95, SEO 100. Alle Route auf a11y mit Playwright + axe getestet. ADR `0006-shop-architektur.md`.

---

### Phase 7 – Immersive Mode: 3D Gallery & Persistent Canvas (Woche 8–11)

Dies ist die architektonisch heikelste Phase. Die im Research-Dossier geforderte "Single Canvas Overlay"-Architektur muss im App Router konsequent implementiert werden.

#### Schritt 7.1 – CanvasRoot-Architektur
- 7.1.1 `<CanvasRoot />` wird in `app/layout.tsx` ganz oben montiert, `position: fixed`, `z-index: -1`, `pointer-events: none` default.
- 7.1.2 Der Canvas bleibt zwischen allen Routen erhalten (kein Remount).
- 7.1.3 Seiten-spezifische Szenen werden über einen globalen Zustand-Store an CanvasRoot gepusht, nicht umgekehrt.
- 7.1.4 `@react-three/drei <View />` Pattern für orthografische 2D-Projektion im Shop.

#### Schritt 7.2 – R3F + WebGPU Setup
- 7.2.1 `<Canvas gl={{ renderer: 'webgpu' }} />` mit automatischem WebGL2-Fallback.
- 7.2.2 Feature-Detection: Edge Function checkt `navigator.gpu` nicht (Server), sondern Client setzt Cookie nach erster Detection. Nächster Request served andere Scene-Qualität.
- 7.2.3 Global Lighting Rig: Ambient + Directional + Custom Bloom-Pass.
- 7.2.4 PostProcessing via `@react-three/postprocessing` mit TSL-basierter Bloom-Pipeline.

#### Schritt 7.3 – Asset-Loader
- 7.3.1 `<Preload all />` beim initialen Landing für kritische Assets.
- 7.3.2 Dynamic Import für Raum-spezifische Assets.
- 7.3.3 Draco + KTX2-Decoder als Web Worker.
- 7.3.4 Fallback-Placeholders (Low-Poly + Solid Color).
- 7.3.5 Progressive Loading mit Priority-Queue: Nahe Artworks zuerst.

#### Schritt 7.4 – Raum-Architektur
- 7.4.1 Ein `Room` = Gruppe aus Wänden, Beleuchtung, bis zu N Artwork-Slots.
- 7.4.2 Artwork-Komponente: Display-Mesh + positional Audio (Phase 8) + Proximity-Trigger.
- 7.4.3 Room-Konfiguration aus Sanity geladen, parametrisierbar ohne Code-Deploy.
- 7.4.4 Instanced Rendering für Wiederholungselemente (Boden-Tiles, Spots).

#### Schritt 7.5 – Navigation
- 7.5.1 MVP: Scroll-Path (Kamera folgt Spline durch die Galerie). Intuitiv, keine Avatar-Kontrolle nötig.
- 7.5.2 Optional: FirstPerson-Controls für Desktop, disabled auf Mobile.
- 7.5.3 Mobile: Tilt-basierte Parallax + Auto-Scroll auf Tap.
- 7.5.4 HUD: Minimap mit Room-Indikator, Jump-to-Room-Shortcuts.

#### Schritt 7.6 – Proximity-System
- 7.6.1 `useFrame`-Hook berechnet pro Frame die Distanz Kamera ↔ Artwork.
- 7.6.2 Distance wird im Zustand-Store geschrieben (via `mutate`, kein React setState).
- 7.6.3 Subscribed Components (Audio, UI) konsumieren über `useStore(selector)` mit `shallow`.
- 7.6.4 Performance-Limit: max. 10 gleichzeitige Proximity-Tracks aktiv.

#### Schritt 7.7 – Performance-Budget
- 7.7.1 Max. 500MB VRAM-Nutzung.
- 7.7.2 Target: 60 FPS Desktop, 45 FPS Mobile Mid-Range.
- 7.7.3 Stats.js in Dev-Mode, `spector.js` für Frame-Inspektion bei Regressionen.
- 7.7.4 Playwright-Performance-Tests: FPS-Measurement bei Standard-Traversierung.

**DoD Phase 7:** Ein vollständiger Raum mit 3 Artworks navigierbar, 60 FPS auf Mid-Range-Hardware. Mode-Switching (zu 2D Shop) funktioniert ohne Canvas-Unmount. Visuelle Regressions-Tests grün. ADR `0007-immersive-architektur.md`.

---

### Phase 8 – Spatial Audio System (Woche 11–13)

#### Schritt 8.1 – AudioContext Bootstrap
- 8.1.1 Landing-Page `/` mit Entry-Overlay ("Enter Experience" Button).
- 8.1.2 Click → `audioContext.resume()` + Persistent `sessionStorage`-Flag "unlocked".
- 8.1.3 Auf Folge-Routes: falls Flag gesetzt, Context direkt aktivieren.
- 8.1.4 Browser-Detection: Safari/iOS brauchen bei jedem Tab-Switch ggf. Re-Unlock → Fallback-Banner.

#### Schritt 8.2 – Audio-Graph
- 8.2.1 Globaler `AudioContext`-Singleton in `packages/audio/src/context.ts`.
- 8.2.2 `AudioListener` gebunden an Kamera-Position (via R3F `<PositionalAudio />` aus drei-fiber).
- 8.2.3 Pro Artwork ein `PannerNode` mit `InverseDistance`-Model, `refDistance=2`, `maxDistance=50`, `rolloffFactor=1`.
- 8.2.4 `GainNode` pro Source für Master-Volume-Kontrolle.
- 8.2.5 Pre-Destination: ein gemeinsamer `DynamicsCompressorNode` gegen Clipping.

#### Schritt 8.3 – HLS-Integration
- 8.3.1 `hls.js` als Web Worker instanziert (für CPU-Entlastung).
- 8.3.2 Hidden `<audio>`-Element pro aktivem Stream.
- 8.3.3 **Kritisch:** `createMediaElementSource()` erst nach `Hls.Events.MANIFEST_PARSED`, sonst Safari-Deadlock.
- 8.3.4 Adaptive Bitrate: Manifest liefert 96k + 160k; hls.js wählt basierend auf `downlinkMax`.
- 8.3.5 Stream-Lifecycle: Start bei Proximity < threshold, Stop bei Proximity > threshold + hysteresis.

#### Schritt 8.4 – Proximity-Fading
- 8.4.1 Gain-Berechnung via Research-Dossier-Formel: `refDistance / (refDistance + rolloffFactor * (distance - refDistance))`.
- 8.4.2 Smoothing mit `setTargetAtTime`, nicht `gain.value=` (sonst Knackgeräusche).
- 8.4.3 Cross-Fade zwischen zwei Sources, wenn Besucher zwischen Artworks wandert.

#### Schritt 8.5 – SoundCloud-Proxy
- 8.5.1 Netlify Edge Function `/api/proxy/soundcloud/[trackId]`.
- 8.5.2 Function holt HLS-Manifest von SoundCloud API, ersetzt Segment-URLs durch eigene Proxy-Route.
- 8.5.3 **Zweck DSGVO:** SoundCloud sieht nur Netlify-Edge-IP, nicht Nutzer-IP.
- 8.5.4 Cache-Header: Manifest `max-age=2, stale-while-revalidate=5`, Segmente `max-age=315360000, immutable`.
- 8.5.5 Rate-Limiting gegen Abuse.

#### Schritt 8.6 – Now-Playing HUD
- 8.6.1 Globale `<NowPlaying />`-Komponente, rendert Track-Name + DJ + Album-Art (= Artwork).
- 8.6.2 Pause/Resume-Control, Master-Volume-Slider.
- 8.6.3 Transport-State im Zustand-Store.

**DoD Phase 8:** Drei Artworks in einem Raum mit synchronem Spatial Audio. Audio-Fade weich, keine Clipping-Artefakte. SoundCloud-IP-Maskierung durch Edge-Function-Log verifiziert. ADR `0008-spatial-audio.md`.

---

### Phase 9 – Mode Transitions (Woche 13–14)

#### Schritt 9.1 – Transition-State
- 9.1.1 Zustand-Store: `mode: 'immersive' | 'classic' | 'transitioning'`.
- 9.1.2 Trigger via Menu-Toggle oder Deep-Link (`/shop` setzt automatisch Classic).
- 9.1.3 Transition-Timeline: 1200ms, choreographed.

#### Schritt 9.2 – Kamera-Interpolation
- 9.2.1 Wechsel von `PerspectiveCamera` (Immersive) zu `OrthographicCamera` (Classic Grid).
- 9.2.2 Smooth-Damp-Interpolation via `THREE.MathUtils.damp` im `useFrame`.
- 9.2.3 Während Transition: UI auf `pointer-events: none`, Mode-Indicator visible.

#### Schritt 9.3 – Shader-Transition
- 9.3.1 `WebGLRenderTarget` captured letzten Immersive-Frame.
- 9.3.2 Custom-Shader (Displacement + Dissolve) überblendet zu orthogonalem Layout.
- 9.3.3 Artworks werden im Classic-Mode über `<View />`-Scissor in HTML-Grid-Boxen projiziert.

#### Schritt 9.4 – UI-Choreografie
- 9.4.1 Framer Motion Orchestriert DOM-Elemente (Header, Filters, Grid-Cards).
- 9.4.2 Nach abgeschlossener 3D-Transition erscheinen UI-Elemente staggered.
- 9.4.3 Audio-Fade: Globale Audio-Ebene (ambient Room Sound) dimt auf 30%, Artwork-Audio pausiert.

**DoD Phase 9:** Transition sieht auf Desktop + Mobile clean aus, keine FOUC, kein Canvas-Flash. Playwright-Video-Capture-Tests verifizieren Transition. ADR `0009-mode-transition.md`.

---

### Phase 10 – Checkout & Stripe Connect (Woche 14–16)

#### Schritt 10.1 – Stripe Connect Onboarding
- 10.1.1 `/onboarding/stripe` für Artists und DJs.
- 10.1.2 Stripe Express Account Link API → Stripe-gehostetes Onboarding.
- 10.1.3 `account.updated` Webhook → Update `profiles.stripe_status`.
- 10.1.4 Block: Artworks erst publishable, wenn Stripe-Status `enabled`.

#### Schritt 10.2 – Checkout Session
- 10.2.1 Server Action `createCheckoutSession(artworkId)`.
- 10.2.2 Parameter: `mode=payment`, `payment_method_types=['card', 'sepa_debit', 'paypal']`, `line_items`.
- 10.2.3 `metadata`: `artwork_id`, `artist_account_id`, `dj_account_id`, `transfer_group=order_xyz`.
- 10.2.4 Redirect zu Stripe Checkout.

#### Schritt 10.3 – Webhook-Handler
- 10.3.1 Route `/api/webhooks/stripe` – Edge-Runtime deaktiviert (nötig für raw body signature).
- 10.3.2 Signature-Verifikation mit `stripe.webhooks.constructEvent(rawBody, sig, secret)`.
- 10.3.3 Events: `checkout.session.completed`, `payment_intent.succeeded`, `charge.refunded`.
- 10.3.4 Idempotenz: `event.id` atomar in `webhook_events`-Tabelle speichern; Duplikate → 200 OK ohne Nebenwirkung.
- 10.3.5 Bei `checkout.session.completed`: Transfers erstellen (Separate Charges and Transfers).

#### Schritt 10.4 – Transfer-Logik
- 10.4.1 Aus `session.amount_total` den Künstler-Anteil (60%) und DJ-Anteil (20%) berechnen, ganzzahlig in Cent.
- 10.4.2 `stripe.transfers.create({ amount, currency, destination: artist_account, transfer_group, source_transaction })`.
- 10.4.3 Zweiter Transfer für DJ.
- 10.4.4 Rest verbleibt auf Plattform-Saldo (= Plattform-Anteil abzgl. Stripe-Gebühr).
- 10.4.5 Order in `orders`-Tabelle anlegen, Status `paid`, Artwork auf `sold`.

#### Schritt 10.5 – Post-Purchase Flow
- 10.5.1 Success-Page `/checkout/success?session_id=...` mit Bestätigung.
- 10.5.2 Signed Download-Link für Exclusive Set via Cloudflare R2.
- 10.5.3 E-Mail-Delivery via Resend oder Postmark mit Details.
- 10.5.4 Physische Lieferung: Order-Ticket in internem Dashboard für manuellen Versand.

#### Schritt 10.6 – Refund & Dispute
- 10.6.1 Webhook `charge.refunded`: Reverse-Transfers automatisch (Stripe handelt das bei `transfer_group`).
- 10.6.2 Dispute-Events geloggt, manueller Review.

**DoD Phase 10:** End-to-End Stripe-Test: Testkarte kauft Artwork, beide Transfers landen auf Test-Connected-Accounts, Webhook-Idempotenz verifiziert (2x gleichen Event → nur 1x Transfer). ADR `0010-payment-split.md` + Sicherheits-Review dokumentiert.

---

### Phase 11 – KI-gestützte Kuration (Claude) (Woche 16–17)

#### Schritt 11.1 – Integration
- 11.1.1 Anthropic-SDK in `apps/web`.
- 11.1.2 Claude Sonnet 4.6 als Default, Opus 4.6 für aufwendige Aufgaben (längere Stories).
- 11.1.3 Server-seitige Aufrufe ausschließlich in Route Handlers / Server Actions; Key niemals Client-seitig.

#### Schritt 11.2 – Use Cases (MVP)
- 11.2.1 **Artwork-Beschreibung unterstützen**: Künstler schreibt Stichpunkte, Claude generiert 3 Varianten, Künstler wählt/editiert. Human-in-the-Loop garantiert (AI-Act-konform).
- 11.2.2 **Mood-basierte Empfehlung**: Nutzer beschreibt Stimmung, Claude schlägt 3 Artworks vor. Prompt injiziert aktuellen Artwork-Katalog (als Structured Context, kompakt).
- 11.2.3 **Tag-Vorschläge**: Claude analysiert Artwork-Bild (Vision) und schlägt Tags/Stichworte für Filter vor.

#### Schritt 11.3 – XAI & Audit-Log
- 11.3.1 Jede KI-Ausgabe, die kuratorisch wirkt (Empfehlung, Tag), wird in `ai_decisions`-Tabelle geloggt: prompt-hash, modell, output, user-id, timestamp.
- 11.3.2 Nutzer kann pro Empfehlung "Warum?" klicken → Claude erklärt kurz die Reasoning (ohne sensible Trainingsdaten zu behaupten).
- 11.3.3 Widerspruchs-Mechanismus: Nutzer kann algorithmische Empfehlung ablehnen → Override manuelle Kuration.
- 11.3.4 Human-in-the-Loop bei Risk-Features: automatische Moderation-Decisions haben immer Review-Queue.

#### Schritt 11.4 – Cost Guardrails
- 11.4.1 Per-User Rate Limit (z.B. 10 Empfehlungen/Tag für Gäste, 50 für angemeldete).
- 11.4.2 Prompt Caching aktivieren (Anthropic-Feature) für wiederkehrende Systemprompts.
- 11.4.3 Token-Budget in Doppler als Config, Alert bei Überschreitung.

**DoD Phase 11:** Empfehlungs-Endpunkt mit SLA < 3s Median. Audit-Log schreibt lückenlos. Kostenalarm getestet. ADR `0011-ai-architektur.md`.

---

### Phase 12 – Edge & Performance-Optimierung (Woche 17–18)

#### Schritt 12.1 – Netlify Edge Functions
- 12.1.1 `/api/proxy/*` – Reverse Proxies für SoundCloud, Cloudflare R2-signing.
- 12.1.2 `/edge/ab-test` – bei erstem Request: WebGPU-Detection, Cookie setzen, Redirect passend zu Immersive/Classic Default.
- 12.1.3 Geo-basierte Locale-Detection: EU → DSGVO-strikte Consent-Policy, US → CCPA, alle anderen → konservativ DSGVO.

#### Schritt 12.2 – Cache-Strategie
- 12.2.1 Statische Assets (GLB, KTX2, Hashes im Dateinamen): `Cache-Control: public, max-age=315360000, immutable`.
- 12.2.2 HLS-Manifeste: `max-age=2, stale-while-revalidate=5`.
- 12.2.3 Next.js SSG-Pages: `s-maxage=60, stale-while-revalidate=600`.
- 12.2.4 API-Routes (user-specific): `private, no-store`.
- 12.2.5 Bildformate: AVIF → WebP → JPEG mit `Vary: Accept`.

#### Schritt 12.3 – Performance-Audit
- 12.3.1 Lighthouse CI auf PRs, Budget-Gate: LCP < 2.0s, CLS < 0.05, INP < 150ms.
- 12.3.2 WebPageTest monatlich aus Frankfurt, Amsterdam, Paris, Berlin.
- 12.3.3 3D-Specific: FPS-Profiling mit Playwright + `performance.measureUserAgentSpecificMemory()`.

#### Schritt 12.4 – Bildoptimierung
- 12.4.1 Alle User-Uploads über Cloudflare Images (optional) oder Netlify Image Transform.
- 12.4.2 Responsive Sizes: 320, 640, 1024, 1920, 3840 (für 4K-Display).
- 12.4.3 `<Image priority />` nur für Above-the-Fold-Hero.

**DoD Phase 12:** Lighthouse Score Shop: Performance ≥ 95, Best Practices ≥ 95, SEO 100, Accessibility ≥ 95. Cache-Headers per Asset-Typ verifiziert. ADR `0012-edge-performance.md`.

---

### Phase 13 – Compliance, Security, Privacy by Design (Woche 18–19)

Diese Phase ist teilweise verteilt (viele Compliance-Aspekte werden in früheren Phasen bereits umgesetzt). Hier wird konsolidiert, dokumentiert, auditiert.

#### Schritt 13.1 – Consent Management
- 13.1.1 Eigener Consent Banner mit **expliziter Opt-in**-Logik (keine Pre-ticked Boxes).
- 13.1.2 Kategorien: Essenziell (ohne Consent), Analytics (Matomo/Plausible cookieless – theoretisch ohne Consent möglich, aber wir loggen trotzdem transparent), Spatial Tracking (immer Opt-in), Marketing (falls später hinzukommt).
- 13.1.3 Consent-Log-Tabelle mit Zeitstempel, IP-Hash (SHA-256 + Salt), User-Agent, Consent-Version.
- 13.1.4 Consent-Widget jederzeit über Footer-Link erneut aufrufbar.

#### Schritt 13.2 – Tracking-Minimierung
- 13.2.1 Default: KEIN Spatial-Tracking, keine Kamera-Pfad-Analytics.
- 13.2.2 Nach explizitem Consent: Aggregierte Heatmaps (z.B. welche Artworks am längsten angesehen), **nie** individuelle Pfade gespeichert.
- 13.2.3 IP-Adressen in Analytics-Logs sofort anonymisiert (letzte 2 Oktette entfernt).

#### Schritt 13.3 – DSGVO-Artikel-Checkliste
- 13.3.1 Art. 5 (Grundsätze): Datenminimierung dokumentiert.
- 13.3.2 Art. 13/14 (Informationspflicht): Datenschutzerklärung mit allen Verarbeitern (Supabase, Cloudflare, Stripe, Anthropic, SoundCloud-Proxy, Sanity).
- 13.3.3 Art. 15 (Auskunft): Endpoint `/account/data` → JSON-Export alle Daten des Users.
- 13.3.4 Art. 17 (Löschung): `/account/delete` → kaskadierte Löschung, Anonymisierung der Bestellungen (Buchhaltungsrecht überwiegt: Bestellungen bleiben anonymisiert 10 Jahre).
- 13.3.5 Art. 20 (Datenübertragbarkeit): JSON-Export in strukturiertem Format.
- 13.3.6 Art. 25 (Privacy by Design/Default): Diese Architektur = Nachweis. Dokumentiert in Privacy-Impact-Assessment.
- 13.3.7 Art. 32 (TOMs): Technische und organisatorische Maßnahmen dokumentiert (`/docs/compliance/toms.md`).
- 13.3.8 Art. 33/34 (Data Breach): Incident-Response-Plan (Phase 15).
- 13.3.9 Art. 35 (DPIA): Datenschutz-Folgenabschätzung für Spatial-Tracking + AI-Kuration (wegen High-Risk-Potenzial).

#### Schritt 13.4 – EU AI Act (ab August 2026 aktiv)
- 13.4.1 KI-Nutzung transparent kommunizieren (Hinweis bei Empfehlungen).
- 13.4.2 XAI-Layer (Phase 11) dokumentiert.
- 13.4.3 Kein Einsatz in High-Risk-Kategorien. Falls Empfehlungen wirtschaftliche Auswirkungen auf Künstler haben → Assessment durchführen, ggf. Human Review verpflichtend.

#### Schritt 13.5 – ISO-Prinzipien (ohne Zertifizierung anstreben, aber folgen)
- 13.5.1 **ISO/IEC 27001**: Informationssicherheits-Management: Secret Management, Zugriffskontrolle (RLS), Audit-Logs, Backup-Strategie → dokumentiert.
- 13.5.2 **ISO/IEC 27701**: Privacy-Extension → mappt auf DSGVO-Dokumente.
- 13.5.3 **ISO/IEC 27018**: Cloud-spezifisch (Supabase, Cloudflare, Netlify → deren SOC2/ISO sind belegt).
- 13.5.4 **ISO/IEC 25010**: Qualitätsmodell als Grundlage für Performance-Tests.

#### Schritt 13.6 – Security Hardening
- 13.6.1 Content-Security-Policy Header: nur erlaubte Origins.
- 13.6.2 HTTPS Only, HSTS, SameSite Cookies.
- 13.6.3 Subresource Integrity (SRI) für alle externen Scripts (keine CDN-Drift).
- 13.6.4 Regelmäßige Dependency-Scans: `pnpm audit`, Dependabot, Snyk (Free Tier).
- 13.6.5 Secret-Scanning in GitHub Actions.
- 13.6.6 OWASP Top 10 Review durchlaufen.

#### Schritt 13.7 – Backup & Disaster Recovery
- 13.7.1 Supabase: Point-in-Time Recovery aktiviert, Daily Backup in eigenen R2-Bucket.
- 13.7.2 R2: Versioning aktiviert, 30-Tage-Aufbewahrung für gelöschte Objekte.
- 13.7.3 Sanity: Export automatisiert wöchentlich.
- 13.7.4 Recovery-Plan dokumentiert + einmal übungsweise durchgespielt.

**DoD Phase 13:** Privacy-Impact-Assessment abgeschlossen, durch IT-Rechts-Anwalt gegengelesen. TOMs-Dokument finalisiert. Consent-Flow in Playwright-Test lückenlos. ADR `0013-compliance-architektur.md` + `/docs/compliance/` komplett befüllt.

---

### Phase 14 – Tests, QA, Performance-Verifikation (Woche 19–20)

Tests entstehen in allen vorherigen Phasen parallel. Hier wird konsolidiert und die Gesamtsystem-Sicherheit geprüft.

#### Schritt 14.1 – Test-Pyramide
- 14.1.1 **Unit-Tests (Vitest)**: reine Logikfunktionen, Schema-Validierung, Audio-Math, Transfer-Berechnung.
- 14.1.2 **Component-Tests (Testing Library)**: UI-Komponenten isoliert, inkl. a11y-Assertions.
- 14.1.3 **Integration-Tests**: API-Routes mit Supabase-Testinstanz.
- 14.1.4 **E2E (Playwright)**: Kritische Flows — Signup, Upload, Checkout, Mode-Switch.
- 14.1.5 **Visual Regression (Playwright Screenshots)**: Design-System + kritische Seiten.
- 14.1.6 **Performance-Tests**: Lighthouse CI, FPS-Measurement, Load-Test via k6.

#### Schritt 14.2 – Coverage-Ziele
- 14.2.1 Branch-Coverage ≥ 70% für `packages/contracts`, `packages/audio`, `apps/web/lib/payments`.
- 14.2.2 Kritische Pfade (Checkout, Auth, Webhook) 100% Unit + E2E.
- 14.2.3 3D-Code: nicht Coverage, sondern Frame-Budget-Tests.

#### Schritt 14.3 – Accessibility-Audit
- 14.3.1 WCAG 2.1 AA als Mindestanforderung.
- 14.3.2 Playwright + axe-core für alle Routes.
- 14.3.3 Manuelle Screenreader-Tests mit VoiceOver + NVDA.
- 14.3.4 Immersive-Mode: 3D-Inhalte haben text-basierte Alternativen (Artwork-Beschreibung liest bei Focus).
- 14.3.5 `prefers-reduced-motion` respektiert – Immersive-Mode bietet statische Fallback-Ansicht.

#### Schritt 14.4 – Security-Audit
- 14.4.1 Penetration-Test (extern beauftragt oder Self-Assessment mit Burp Suite Community).
- 14.4.2 Webhook-Replay-Test.
- 14.4.3 RLS-Bypass-Test (versuche Cross-Tenant-Zugriff).
- 14.4.4 CSP-Test.

#### Schritt 14.5 – Chaos & Resilience
- 14.5.1 Netlify-Ausfall-Simulation: Static Assets via Cloudflare erreichbar.
- 14.5.2 Supabase-Ausfall: Frontend zeigt Maintenance-State, nicht Error-Boundaries.
- 14.5.3 Stripe-Webhook-Delay: Order zeigt "Processing" statt falsch "Paid".

**DoD Phase 14:** Alle Tests grün, Security-Audit-Report dokumentiert, Accessibility-Zertifizierung (Selbsteinschätzung mit Evidence). ADR `0014-test-strategie.md`.

---

### Phase 15 – Launch & Observability (Woche 20–22)

#### Schritt 15.1 – Staging vs. Production
- 15.1.1 Staging auf `staging.elbtronika.art` — echter Stripe-Testmodus, Supabase-Staging-Projekt.
- 15.1.2 Production nur via manuellem Promote aus Staging (Netlify Deploy Context).
- 15.1.3 Feature-Flags via environment variables (MVP: simple Booleans, später ggf. OpenFeature).

#### Schritt 15.2 – Monitoring & Alerting
- 15.2.1 Sentry in Frontend + Serverless, mit Source Maps.
- 15.2.2 Alert-Channels: E-Mail (sofort), Slack/Discord (falls vorhanden), PagerDuty (nur bei P1).
- 15.2.3 Dashboards: Sentry Performance + Web Vitals; Custom-Dashboard in Grafana (mit Supabase Data Source).
- 15.2.4 Key Metrics: Conversion-Rate, FPS-Mean Immersive, Audio-Start-Errors, Webhook-Failures.
- 15.2.5 Uptime Monitoring: Uptime Robot oder Better Stack — Check alle 5min auf `/health`, `/api/health`.

#### Schritt 15.3 – Launch-Checkliste
- 15.3.1 DNS-TTL auf 60s setzen vor Launch (schnelles Rollback).
- 15.3.2 Stripe Live-Keys in Doppler aktiviert.
- 15.3.3 Webhook-Endpoints in Stripe registriert (Live + Connect).
- 15.3.4 Impressum + Datenschutz final verlinkt.
- 15.3.5 Google Search Console, Bing Webmaster, sitemap.xml, robots.txt.
- 15.3.6 OG-Image-Generator getestet (Social Previews).
- 15.3.7 First-Time-Visitor-Flow live probegespielt auf 3 Devices.
- 15.3.8 Rollback-Plan: git revert + netlify rollback zu letztem grünem Deploy.

#### Schritt 15.4 – Post-Launch
- 15.4.1 1 Woche Hypercare: tägliches Monitoring-Review, schnelle Fixes.
- 15.4.2 User-Feedback-Channel: Formular in Footer + `feedback@elbtronika.de`.
- 15.4.3 Wöchentlicher Check: Web Vitals, Core Web Vitals vs. Budget.

**DoD Phase 15:** Live auf `https://elbtronika.art`, Stripe-Verkauf funktioniert real, Monitoring aktiv, Rollback-Probe erfolgreich. Launch-Retrospektive in `/docs/retrospectives/launch.md`.

---

## 5. Compliance-Matrix (zusammengefasst)

| Norm / Gesetz | Anforderung | Umsetzung in ELBTRONIKA | Phase |
|---|---|---|---|
| DSGVO Art. 5-6 | Rechtmäßigkeit, Einwilligung | Explizites Opt-in, Consent-Log | 13.1, 13.3 |
| DSGVO Art. 13-14 | Informationspflicht | Datenschutzerklärung mit allen Auftragsverarbeitern | 0.1.3, 13.3 |
| DSGVO Art. 15 | Auskunftsrecht | `/account/data` JSON-Export | 13.3.3 |
| DSGVO Art. 17 | Recht auf Löschung | `/account/delete` + Anonymisierungs-Kaskade | 13.3.4 |
| DSGVO Art. 20 | Datenübertragbarkeit | Strukturierter Export | 13.3.5 |
| DSGVO Art. 25 | Privacy by Design | Gesamtarchitektur-Nachweis | Alle |
| DSGVO Art. 32 | Technische Maßnahmen | RLS, Encryption at Rest, Secret Rotation, TOMs-Doc | 3, 13 |
| DSGVO Art. 33-34 | Data Breach | Incident-Response-Plan | 13.7, 15.2 |
| DSGVO Art. 35 | DPIA | Für Spatial-Tracking + AI | 13.3.9 |
| DSGVO Omnibus 2026 | Verschärfungen | Biometrisch-abgeleitete Daten → Opt-in-Pflicht | 13.1, 13.2 |
| EU AI Act (Aug 2026) | Transparenz | XAI-Log, Human-in-the-Loop | 11.3 |
| Schrems II | EU-Datentransfer | Proxy für externe Dienste, EU-Hosting | 8.5, 3 |
| ePrivacy / TTDSG | Cookie-Consent | Cookieless + Consent-Banner | 13.1 |
| § 312j BGB (Button-Lösung) | Kauf-Prozess | "Zahlungspflichtig bestellen"-Button | 10.2, 10.5 |
| § 356 Abs. 5 BGB | Widerruf Digitalgüter | Consent vor Lieferung | 0.2.4, 10.5 |
| GEMA | Musik-Lizenzen | Vertragliche Klarstellung mit DJs | 0.2.2 |
| ISO/IEC 27001 (Prinzipien) | InfoSec Management | Secret Mgmt, Access, Audit, Backup | 1, 3, 13 |
| ISO/IEC 27701 | Privacy Extension | Mappt auf DSGVO | 13 |
| ISO/IEC 27018 | Cloud Privacy | Vendor-Vertrauen via SOC2-Nachweise | 3 |
| WCAG 2.1 AA | Accessibility | axe-core-Tests, Screenreader, reduced-motion | 2.3, 14.3 |
| CCPA (USA) | Privacy US | Geo-abhängige Consent-Policy | 12.1 |
| PCI DSS | Zahlungsdaten | Stripe-hosted → Scope reduziert auf SAQ-A | 10 |

---

## 6. Kritische Pfade & Bottlenecks

### 6.1 Blockierende externe Abhängigkeiten
- **Stripe KYC** (5–10 Werktage): MUSS in Woche 1 starten, sonst Phase 10 verschoben.
- **Anwalt IT-Recht**: 2 Wochen Vorlauf für Vertragsprüfung; rechtzeitig briefen.
- **Künstler-Akquise**: Mindestens 3–5 Künstler + 3 DJs für Launch, Verträge brauchen Zeit. Parallel-Track seit Phase 0.
- **Markenrecherche**: Bei Konflikten alternativer Name nötig — Domain-Strategie muss Reserve haben.

### 6.2 Technische Bottlenecks
- **Single Canvas Architektur** (Phase 7): Wenn das nicht früh in Root-Layout gerichtet, ist späterer Umbau teuer.
- **Audio-Autoplay-Restriktion**: Auf Safari iOS besonders restriktiv. Evaluations-Test früh (Phase 8.1) auf echtem iPhone.
- **Stripe Connect Verify-Zeit**: Test-Accounts aktivieren Transfers mit Verzögerung. Im Dev-Setup vorausplanen.
- **R2 CORS**: Fehlkonfiguration bricht WebGPU-Texturladung. Monitoring-Gate.
- **Sanity-Freelance-Schwelle**: Kostenlos bis 3 Users, 100GB Assets, 100k API-Requests/Monat. Bei Skalierung Budget vorsehen.

### 6.3 Leistungsbudget (nicht verhandelbar)
- LCP ≤ 2.0s auf 4G Mobile Mid-Range
- INP ≤ 150ms
- CLS ≤ 0.05
- FPS Immersive ≥ 45 Mobile, ≥ 60 Desktop
- Initial JS-Bundle ≤ 250KB gzipped (ohne 3D; 3D Lazy-Loaded)
- Total-Page-Weight Above-the-Fold ≤ 1.5MB

---

## 7. Kostenschätzung (monatlich nach Launch)

| Service | Tier | Kosten | Bemerkung |
|---|---|---|---|
| Netlify | Pro | ~$19 | Reicht bis mittlere Traffic, Analytics optional extra |
| Cloudflare R2 | Pay-as-you-go | ~$5–30 | Abhängig von Asset-Volumen, Zero-Egress |
| Supabase | Pro | ~$25 | 8GB DB, 100GB Egress reicht MVP |
| Sanity | Growth | $99 / frei MVP | Frei reicht erstmal |
| Stripe Connect | Transaction-based | 1.5% + 0.25€ + Connect-Fee | kein Fixum |
| Anthropic API | Usage | ~$20–100 | Sonnet dominant, Budget-Cap konfiguriert |
| Sentry | Team | $26 | Deep Observability |
| Doppler | Free/Pro | $0–18 | Free reicht Solo |
| Domain + Mail | - | ~$10 | Cloudflare Registrar + Workspace |
| Plausible/Matomo | Hosting | $9–19 | Matomo self-hosted auf kleinem VPS |
| **Gesamt** | | **~$120–280/mo** | ohne Transaction-Fees |

Dazu einmalig: IT-Recht-Anwalt (~500–2000€), Logo/Brand-Design (~0 wenn Solo, sonst 1000–5000€), Pen-Test optional (1000–5000€).

---

## 8. Arbeits-Rhythmus (Claude als Pair)

### 8.1 Tägliche Struktur (empfohlen)
- **Morgens (Plan-Mode):** Claude erstellt Micro-Plan für den Tag basierend auf Roadmap-Phase.
- **Vormittags:** Lou führt aus (in Cowork oder eigenem Editor), Claude als Code-Reviewer + Sparringspartner.
- **Nachmittags:** Tests schreiben, Dokumentation updaten, Claude als Doku-Generator.
- **Abends:** Deploy-Preview review, Retro der gelaufenen Arbeit, Commit-Nachrichten mit Claude strukturiert.

### 8.2 Wöchentliche Routine
- **Montag:** Sprint-Plan (1 Phase oder Teilphase als Fokus).
- **Mittwoch:** Mid-Sprint Review.
- **Freitag:** Sprint-Abschluss, Docs-Sync nach Google Drive, ADR ggf. updaten.

### 8.3 Prompt-Hygiene (wichtig für Claude-Pairing)
- Jede Session startet mit: "Wir sind in Phase X, Schritt Y. Bisher erledigt: [Stand]. Heutiges Ziel: [Ziel]. Constraints: [...]"
- Keine "Kannst du mal schnell..."-Prompts ohne Kontext.
- Bei Rückfragen von Claude: sofort beantworten, nicht raten.
- Nach jeder Feature-Einheit: "Test + Doku + ADR?"-Checkliste.

---

## 9. Offene Fragen / Rückfragen an Lou

Ich habe den Plan so gebaut, dass er maximal selbständig ist. Folgende Entscheidungen sind aber vor Code-Start unbedingt zu klären:

- **Frage 1:** Hast du schon 3–5 Künstler und 2–3 DJs, die beim MVP-Launch dabei sein würden? Falls nein, wann starten wir die Akquise? Das beeinflusst Phase 0 direkt.
- **Frage 2:** Rechtsform schon entschieden (Einzelunternehmen / UG / GmbH)? Oder brauchen wir zuerst Steuerberater-Termin?
- **Frage 3:** Budget-Rahmen fürs MVP: Hast du ~1500–3500€ für Anwaltsprüfung + Marken + Hosting-Monate eingeplant, oder müssen wir Low-Budget-Variante fahren (geringere rechtliche Absicherung akzeptieren)?
- **Frage 4:** Physische Lieferung der Original-Artworks — wie wird der Versand gehandled? Selbst verpacken/versenden, oder soll Phase 10 einen externen Fulfillment-Partner integrieren (z.B. Packlink PRO)?
- **Frage 5:** Exclusive-Set-Delivery: Download-Code (einfachster MVP) oder tatsächliche Vinyl/USB (teuer, later)? MVP-Empfehlung: Download-Code.
- **Frage 6:** Lokalisierung: Deutsch, Englisch, beides? Beeinflusst i18n-Setup in Phase 1.
- **Frage 7:** Claude in Chrome / Claude Code / Cowork-Modus: Soll ich voraussetzen, dass du Claude Code + Netlify-CLI lokal installierst, oder arbeitest du ausschließlich über Cowork? Das beeinflusst die Schritt-für-Schritt-Anleitungen später.

Solange diese nicht geklärt sind, halte ich mich strikt daran, keinen Code zu schreiben.

---

## 10. Nächste konkrete Schritte (wenn Plan freigegeben)

1. **Antworten auf Fragen 1–7** oben.
2. **Go/No-Go** auf Phase 0 (rechtliche Fundamente parallel anstoßen).
3. **Freigabe für Phase 1** (Repo-Setup + Tooling) — das kann ich als erstes konkret vorbereiten.
4. Nach Phase-1-Freigabe erhältst du einen **Sub-Plan für Phase 1** mit granularen Schritten, konkreten Befehlen und Acceptance-Kriterien.

---

## 11. Anhang – Terminologie & Begriffsklärung

- **Single Canvas Overlay**: Ein persistentes `<canvas>`-Element, das über alle Routen hinweg lebt. Mode-Switches ändern nur die Kamera + Scene, nie das Canvas selbst.
- **Separate Charges and Transfers**: Stripe-Muster, bei dem Plattform-Konto zuerst voll belastet wird und separate Transfers an Connected Accounts folgen.
- **Crypto-Shredding**: Personendaten werden nur verschlüsselt gespeichert, Löschung = Key-Vernichtung, nicht Datenlöschung. DSGVO-Art.-17-kompatibel auch für unveränderliche Ledger.
- **Inverse Square Law**: Physikalisches Lautstärke-Distanz-Modell; Gain = refDist / (refDist + rolloff × (dist − refDist)).
- **TSL (Three Shader Language)**: Abstraktion über WGSL/GLSL in Three.js ab r171.
- **RLS (Row Level Security)**: Postgres-Feature, um Datenbank-seitig Zeilen-Zugriff per Policy zu kontrollieren — essentielle Multi-Tenancy-Sicherung.
- **Idempotenz-Schlüssel**: Identifier eines Requests, der sicherstellt, dass wiederholte Ausführung keinen doppelten Effekt hat. Für Webhooks unverzichtbar.
- **XAI (Explainable AI)**: Systeme, die nachvollziehbar machen, warum ein KI-Output zustande kam — AI-Act-Anforderung für High-Risk.

---

## 12. Dokumenten-Versionierung

| Version | Datum | Änderung | Autor |
|---|---|---|---|
| v1.0 | 2026-04-24 | Initial Plan basierend auf Research-Dossier | Claude + Lou |

> **Nächste Aktion:** Lou liest, markiert Einwände, beantwortet die 7 offenen Fragen. Dann Kickoff Phase 0+1.
