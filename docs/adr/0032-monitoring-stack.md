# ADR-0012: Monitoring-Stack

## Status
Accepted

## Context
Für Production-Betrieb benötigen wir Echtzeit-Einblick in Performance, Fehler und Systemzustand.

## Decision
1. **RUM (Real User Monitoring)**: `next/web-vitals` + `/api/analytics/vitals`
2. **Health Checks**: `/api/health` mit Subsystem-Checks (Supabase, Sanity)
3. **Logging**: `src/lib/logger.ts` — strukturiertes JSON-Logging
4. **Error Tracking**: Sentry (optional, bei Bedarf nachinstallierbar)

## Consequences
- ✅ Echtzeit-Web-Vitals-Messung
- ✅ Frühwarnsystem bei Subsystem-Ausfällen
- ✅ Strukturierte Logs für Debugging
- ⚠️ Sentry erfordert zusätzliche Konfiguration

## Compliance
- ISO 27001 A.12.4 (Logging und Monitoring)
- DSGVO Art. 32 (Verfügbarkeit überwachen)
