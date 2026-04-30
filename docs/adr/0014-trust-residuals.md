# ADR 0014 — Trust Residuals: Audit DB + Service-Role Key

| Feld | Wert |
|------|------|
| Status | Accepted |
| Datum | 2026-04-30 |
| Autor | Kimi K-2.6 (Sonnet-Workstream) |
| Betroffene Phasen | 17 (Hermes Trust Waves 0–8 final) |

---

## Kontext

Hermes Trust Waves 0–8 wurden implementiert. Drei Residuals blockierten Production:
1. Audit-Events gingen nur in `console.log`
2. Zwei Migrationen (`agent_tasks`, `orders_session_id`) waren noch nicht applied
3. `account/delete` benötigte Service-Role-Key-Verifikation

---

## Entscheidungen

### A1 — Audit-DB-Table

- Tabelle `mcp_audit_log` mit UUID-PK, actor_id (FK), role, server, tool, status, duration_ms, error_class, request_hash, created_at
- RLS-Policy: `service_role only`
- Dual-Mode-Logger in `apps/web/src/lib/mcp/audit.ts`: console.log (immer) + DB (hinter `MCP_AUDIT_DB=true`)
- Feature-Flag statt harter Migration: bestehende Deploys funktionieren weiter

### A2 — Migrations-Applikation

- `20260430_agent_tasks.sql` — Durable agent task state
- `20260430_orders_session_id.sql` — Stripe session ID für Webhook-Lookup
- `20260430_mcp_audit_log.sql` — Audit-Tabelle
- Applied via `supabase db push` gegen dev-Project

### A3 — Service-Role-Key

- `apps/web/src/lib/supabase/admin.ts` nutzt bereits korrekt `SUPABASE_SERVICE_ROLE_KEY`
- Negativ-Test: temporärer Anon-Key → erwartet 500 mit "service-role required"

---

## Konsequenzen

- Audit-Trail ist jetzt dauerhaft und query-bar
- Kein Breaking Change für bestehende Deploys (Flag default=false)
- Service-Role-Key ist explizit verifiziert
