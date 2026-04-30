# ADR 0006: Shop-Architektur (Phase 6)

**Status:** Accepted  
**Date:** 2025-04-29  
**Authors:** Sonnet 4.6 (Phase 7 session)

## Kontext

ELBTRONIKA benötigt einen klassischen E-Commerce-Layer als Einstiegspunkt für Nutzende, die nicht die immersive 3D-Galerie nutzen wollen oder können. Dieser muss SSR-fähig, SEO-optimiert und mit dem bestehenden Next.js 15 App Router kompatibel sein.

## Entscheidung

### Routing-Struktur

```
app/[locale]/(shop)/shop/page.tsx          – Artwork-Grid (SSR)
app/[locale]/(shop)/shop/ShopGrid.tsx      – Client-Komponente für Filter-Interaktion
app/[locale]/(shop)/shop/ShopFilters.tsx   – URL-State-basierte Filter (useSearchParams)
app/[locale]/(shop)/artwork/[slug]/page.tsx – Artwork-Detailseite (SSR + OG)
app/[locale]/(profile)/artist/[slug]/page.tsx
app/[locale]/(profile)/dj/[slug]/page.tsx
```

### Warenkorb

- **Zustand v5** mit `persist` Middleware (localStorage).
- **Single-item MVP**: Nur ein Kunstwerk im Warenkorb (bis Phase 10 Stripe-Integration).
- Checkout-CTA ist disabled bis Phase 10.
- CartDrawer als Slide-over, außerhalb des Route-Trees, gesteuert über den Zustand-Store.

### Daten-Layer

- Alle Seiten fetchen direkt aus Sanity über `getClient()` mit `{ next: { revalidate: 60 } }`.
- Kein API-Route-Layer – direkte Sanity-Abfragen in Server Components.
- Typen kommen aus `@elbtronika/contracts`.

### Audio-Player

- `ArtworkAudioPlayer` ist in Phase 6 ein disabled Stub.
- Phase 8 (Spatial Audio) verdrahtet ihn mit dem HLS-Player und dem Proximity-System aus Phase 7.

## Alternativen abgelehnt

- **Eigener API-Layer**: Unnötige Komplexität für eine Galerie ohne Nutzermanagement im Shop.
- **SWR/React Query**: Overkill für überwiegend SSR-Content mit gelegentlicher Client-seitiger Filterung.

## Konsequenzen

- Shop ist vollständig SEO-crawlbar (kein Client-only Rendering für Hauptcontent).
- Checkout muss in Phase 10 als separater Flow implementiert werden (Stripe Checkout).
- CartDrawer muss in Phase 10 auf Multi-Item ausgebaut werden.
