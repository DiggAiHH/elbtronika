# ADR-0011: Caching-Strategie (Next.js 15)

## Status
Accepted

## Context
Next.js 15 ändert das Default-Caching-Verhalten: `fetch()` ist jetzt **uncached by default**. Für ELBTRONIKA müssen wir explizite Caching-Strategien definieren.

## Decision
1. **Statische Daten** (Artwork-Listen): `unstable_cache` mit 1h Revalidation
2. **Sanity-Queries**: `{ next: { revalidate: 60 } }` für Content-Updates
3. **API-Routen**: `Cache-Control: private, no-store` für mutierende Endpoints
4. **Asset-Dateien**: `immutable` für `_next/static/`, 1 Jahr Cache

## Consequences
- ✅ Explizite Kontrolle über Cache-Verhalten
- ✅ Schnellere Ladezeiten durch statische Generierung
- ⚠️ Erhöhte Komplexität bei Cache-Invalidation

## Compliance
- DSGVO Art. 5 (Datenminimierung — kein übermäßiges Tracking-Caching)
