# ADR 0014 — Trust Residuals (OPUS_47 Handover § 0.3)

| Feld | Wert |
|------|------|
| Status | Accepted |
| Datum | 2026-04-30 |
| Autor | Sonnet 4.6 |
| Betroffene Phasen | 18, Trust-Waves 0–3 |

---

## Kontext

Der OPUS_47 Handover identifizierte drei offene Trust-Boundary-Items:
1. Audit-DB-Table fehlte (Wave 1)
2. Migrations waren nicht appliziert (Supabase `agent_tasks`, `stripe_session_id`)
3. Service-Role-Key für `account/delete` war nicht verifiziert

Diese ADR dokumentiert die Abschluss-Entscheidungen.

---

## Entscheidungen

### A1: Audit-DB-Table

**Tabelle:** `mcp_audit_log`
**Pfad:** `supabase/migrations/20260430000001_mcp_audit_log.sql`
**Code:** `apps/web/src/lib/mcp/audit.ts`

- Dual-mode Logging: console.log (always) + DB insert (hinter `MCP_AUDIT_DB=true`)
- Service-role only RLS-Policy
- Indizes auf `created_at`, `actor_id`, `status`
- Audit darf Main-Flow NIEMALS brechen (try/catch + console.error)

### A2: Migration-Applizierung

**Strategie:** `pnpm supabase db push` gegen Dev-Project.
**Verifikation:** `pnpm supabase migration list` zeigt alle als `applied`.
**Migrationen:**
- `agent_tasks` (Wave 3: Durable Agent Memory)
- `orders_session_id` (Stripe Checkout)
- `mcp_audit_log` (Wave 1: Audit Trail)

### A3: Service-Role-Key

**Client:** `apps/web/src/lib/supabase/admin.ts`
- Erstellt Supabase-Client mit `SUPABASE_SERVICE_ROLE_KEY`
- Wirft klare Fehlermeldung wenn URL oder Key fehlt
- `autoRefreshToken: false`, `persistSession: false` → kein Session-Leak

**Negativ-Test:**
```ts
// Ohne SUPABASE_SERVICE_ROLE_KEY → 500 mit "SUPABASE_SERVICE_ROLE_KEY not configured"
```

---

## Konsequenzen

### Positiv
- Audit-Trail ist jetzt dauerhaft (Wave 1 abgeschlossen)
- Agent-Memory überlebt Server-Restarts (Wave 3 abgeschlossen)
- Account-Deletion ist mit Service-Role abgesichert

### Negativ
- `mcp_audit_log` wächst unbegrenzt → Retention-Policy nötig (Phase 20)
- DB-Write pro MCP-Call = Latenz + Kosten → Feature-Flag `MCP_AUDIT_DB` als Circuit-Breaker

---

## Offene Punkte

- [ ] Retention-Policy für `mcp_audit_log` (90 Tage?)
- [ ] Audit-Log-Dashboard im Pitch-Dashboard (Phase 19)
- [ ] Performance-Monitoring: DB-Insert-Latenz < 50ms
