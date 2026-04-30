# Betriebshandbuch ELBTRONIKA

## Incident Response

### P1: Seite nicht erreichbar
1. Prüfe `/api/health` — gibt es Subsystem-Fehler?
2. Netlify Status prüfen: https://www.netlifystatus.com/
3. Supabase Status prüfen: https://status.supabase.com/
4. Rollback auf letzte stable Version via Netlify

### P2: Zahlungen funktionieren nicht
1. Stripe Dashboard prüfen: https://dashboard.stripe.com/
2. Webhook-Logs in Stripe prüfen
3. `/api/health` — Sanity-Check
4. `STRIPE_SECRET_KEY` und `STRIPE_WEBHOOK_SECRET` prüfen

### P3: KI-Features nicht verfügbar
1. Anthropic API Status prüfen
2. Rate-Limiting prüfen (`ai_decisions` Tabelle)
3. API-Key-Rotation prüfen

## Rollback-Verfahren
1. `git revert` auf letzten stabilen Commit
2. `pnpm build` lokal testen
3. Deployment via CI/CD oder manuelles Netlify-Deploy

## Datenbank-Backup
- Supabase bietet automatische Point-in-Time-Recovery (PITR)
- Manuelles Backup: Supabase Dashboard → Database → Backups

## SSL-Zertifikat
- Von Netlify automatisch verwaltet (Let's Encrypt)
- HSTS in `next.config.ts` konfiguriert
