# ADR 0021: Consent API Härtung & Security Headers

## Status
**Accepted** — 2026-04-29

## Context

Phase 13 (Compliance) hatte Sicherheits- und Robustheitslücken:
- IP-Hash war ein einfacher String-Hash (nicht kryptographisch sicher)
- Kein Rate Limiting auf `/api/consent`
- Keine Möglichkeit, Consent-Status abzufragen (DSGVO Art. 15)
- Supabase-Insert ohne Retry
- User-Agent wurde ungekürzt gespeichert

## Decision

### 1. IP-Hashing
- `crypto.subtle.digest("SHA-256", ...)` statt custom String-Hash
- 16 Zeichen Hex-Output (ausreichend für Anonymisierung)

### 2. Rate Limiting
- In-Memory Map, IP-basiert
- 10 Requests / Minute
- `429` Response mit `Retry-After` Header

### 3. GET /api/consent
- DSGVO Art. 15 — Abfrage aktueller Consent-Entscheidungen
- Gibt die neueste Entscheidung pro `consent_type` zurück

### 4. Retry-Logik
- Supabase-Insert mit 3 Versuchen und exponentiellem Backoff
- Fehler werden geloggt, aber nicht an User weitergegeben (Graceful Degradation)

### 5. User-Agent Truncation
- Max 255 Zeichen (verhindert DB-Bloat)

### 6. Document Version Validierung
- Nur akzeptierte Versions-Strings werden akzeptiert
- Ermöglicht Invalidierung alter Consent-Dokumente

### 7. Account Deletion Idempotenz
- `POST /api/account/delete` gibt `200` bei wiederholten Aufrufen
- Auth-User "not found" wird als "already deleted" behandelt

## Consequences

### Positive
- Kryptographisch sichere IP-Anonymisierung
- Schutz gegen Spam auf Consent-Endpoint
- DSGVO Art. 15 Konformität
- Robusteres Verhalten bei Netzwerkfehlern

### Negative
- In-Memory Rate-Limiting ist nicht cluster-sicher (für Single-Node-Deployment ausreichend)
- SHA-256 ist async → leicht erhöhte Latenz (~1ms)
