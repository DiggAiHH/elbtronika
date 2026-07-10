# ADR-0013: DSGVO / GDPR Implementierung

## Status
Accepted

## Context
ELBTRONIKA verarbeitet personenbezogene Daten (E-Mails, Bestellungen, KI-Interaktionen). DSGVO-Compliance ist gesetzlich vorgeschrieben.

## Decision
1. **Cookie-Banner**: `ConsentBanner.tsx` mit Kategorien (necessary, analytics, marketing)
2. **Recht auf Löschung**: `/api/account/delete` — Orders werden anonymisiert (handelsrechtliche Aufbewahrung), personenbezogene Daten gelöscht, Auth-User entfernt
3. **Recht auf Auskunft**: `/api/account/data` — JSON-Export aller Daten

> Hinweis (Sprint 2, 2026-07-09): Die redundanten `/api/user/*`-Duplikate wurden entfernt. `/api/user/delete` löschte Orders hart — das kollidierte mit der Aufbewahrungspflicht; die `/api/account/*`-Variante ist die kanonische.
4. **Einwilligung**: `/api/consent` — Validierung + localStorage
5. **Privacy by Design**: Keine Telemetrie ohne Consent

## Consequences
- ✅ Rechtliche Compliance
- ✅ Transparenz für Nutzer
- ⚠️ `consent_log` Tabelle hat eingeschränktes Schema (nur `profile_id`, nicht `user_id`)

## Compliance
- DSGVO Art. 5, 15, 17, 25, 32
- ISO 27001 A.18.1 (Datenschutz)
