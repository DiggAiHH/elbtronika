# Live-Switch Choreografie (post-Lee-OK)

> **Ziel:** In 15 Minuten von Demo-Mode auf Live-Mode schalten.
> **Voraussetzung:** Lee hat grünes Licht gegeben. UG-Steuernummer, Stripe-KYC, Anwalt-Review sind im Gange oder fertig.
> **Dauer:** 15 Minuten + 15 Minuten Smoke-Test
> **Rollback:** Jeder Schritt ist reversible innerhalb von 5 Minuten.
> **Letztes Update:** 2026-04-30

---

## Vorbereitung (vor dem Switch)

- [ ] Stripe-KYC abgeschlossen, Account verifiziert
- [ ] Stripe-Live-Keys generiert (`sk_live_...`, `pk_live_...`, `whsec_live_...`)
- [ ] Stripe-Webhook-Endpoint in Dashboard auf `https://elbtronika.art/api/stripe/webhook` gesetzt
- [ ] UG-Steuernummer + Gewerbeanmeldung vorhanden
- [ ] Anwalt hat AGB/Datenschutz/Impressum final reviewed
- [ ] Domains (`elbtronika.de`, `.com`, `.art`) auf Netlify-Production zeigend
- [ ] Mindestens 1 echter Künstler-Vertrag unterzeichnet
- [ ] Sanity: echte Künstler-Content published, Demo-Content unpublished
- [ ] Doppler `prd` mit Live-Keys befüllt (siehe `doppler-prd-setup.md`)
- [ ] Smoke-Test-Skript bereit (`pnpm test:e2e`)
- [ ] Hypercare-Rotation geplant (Lou + ggf. Kimi-Agent für 48h)

---

## Der 15-Minuten-Switch

### Schritt 1 — Doppler `prd` updaten (5 Min)

**Befehl:**
```bash
doppler login
doppler setup --project elbtronika --config prd
```

**Variablen ändern:**

| Variable | Alt | Neu | Rollback |
|----------|-----|-----|----------|
| `ELT_MODE` | `demo` | `live` | `demo` |
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_live_...` | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | `pk_live_...` | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_test_...` | `whsec_live_...` | `whsec_test_...` |
| `ANTHROPIC_API_KEY` | dev-key | prod-key (falls separat) | dev-key |

**Verify:**
```bash
doppler secrets get ELT_MODE --plain
# → live
```

**Expected Output:** `live`

---

### Schritt 2 — Sanity-Filter (2 Min)

**Ziel:** Demo-Content ausblenden, echte Künstler-Content zeigen.

**Option A — Unpublish (empfohlen):**
1. Sanity Studio öffnen
2. Filter: `isDemo == true`
3. Alle 8 Demo-Artworks → Unpublish
4. Filter: `isDemo == false || isDemo == null`
5. Echte Artworks → Publish

**Option B — Hard Delete (nur wenn sicher):**
```bash
# Sanity CLI (lokal ausgeführt)
sanity documents query '*[_type == "artwork" && isDemo == true]._id' --dataset production
# Dann einzeln löschen — nur nach Backup!
```

**Rollback:** Re-publish Demo-Artworks in Sanity Studio (1 Klick pro Dokument).

---

### Schritt 3 — Netlify Production Deploy (3 Min)

1. Doppler-Sync triggert automatischen Deploy
2. Oder: Netlify Dashboard → Deploys → "Trigger deploy"
3. Warten auf Build-Status "Published" (ca. 2–3 Min)

**Verify:**
```bash
curl -s https://elbtronika.art/api/health | jq .
# → {"status":"ok","mode":"live"}
```

**Rollback:** Netlify Dashboard → Deploys → vorherigen Deploy "Publish" klicken.

---

### Schritt 4 — Stripe Webhook-Endpoint (2 Min)

1. Stripe Dashboard → Developers → Webhooks
2. Endpoint `https://elbtronika.art/api/stripe/webhook`
3. Signing Secret kopieren
4. In Doppler `prd` als `STRIPE_WEBHOOK_SECRET` aktualisieren (falls neu)
5. Test-Event senden: `checkout.session.completed`

**Verify:**
```bash
curl -X POST https://elbtronika.art/api/stripe/webhook \
  -H "Stripe-Signature: <test-signature>" \
  -d '{"type":"checkout.session.completed"}'
# → 200 OK
```

**Rollback:** Webhook auf Test-Endpoint zurücksetzen.

---

### Schritt 5 — DNS / CDN (1 Min)

Falls DNS-Änderungen nötig:
- Cloudflare → DNS → TTL auf `60` Sekunden gesetzt (vorher schon konfiguriert)
- Keine Änderung nötig, wenn Domains bereits auf Netlify zeigen

---

### Schritt 6 — Smoke-Test (2 Min)

**Automatisiert:**
```bash
cd apps/web
pnpm test:e2e --grep "live-smoke"
```

**Manuell (Lou):**
1. `https://elbtronika.art` öffnen
2. Kein Demo-Banner sichtbar → `live`-Mode bestätigt
3. `/de/shop` → Nur echte Artworks (keine Demo-Personas)
4. Test-Kauf mit Lou's eigener Karte (1 € Artwork)
5. Stripe-Live-Dashboard zeigt Transaction
6. Webhook hat Order erstellt (Supabase-Dashboard → `orders` Tabelle)
7. Download-Code generiert

---

## Post-Switch Checkliste

- [ ] Demo-Banner ist NICHT sichtbar
- [ ] Shop zeigt nur echte Artworks
- [ ] Checkout funktioniert mit echter Karte
- [ ] Stripe-Live-Dashboard zeigt Transfer-Group + 2 Transfers
- [ ] Supabase `orders` Tabelle hat neue Row
- [ ] Resend-Mail mit Download-Link versendet
- [ ] Sentry zeigt keine neuen Errors
- [ ] `/api/health` gibt `"mode":"live"` zurück

---

## Rollback-Plan (falls etwas schiefgeht)

**Szenario: Checkout bricht**
1. Doppler `ELT_MODE` → `demo`
2. Netlify vorherigen Deploy publishen
3. Stripe Webhook auf Test-Endpoint
4. Sanity Demo-Artworks re-publish
5. Dauer: < 5 Minuten

**Szenario: Kritischer Bug nach 1h**
1. Branch `hotfix/rollback-live` von letztem pre-live Commit erstellen
2. Fix implementieren
3. Schneller Deploy über Netlify
4. Hypercare-Team informieren

---

## Hypercare (48h)

| Zeit | Aktion |
|------|--------|
| 0–2h | Lou überwacht Sentry + Stripe-Dashboard manuell |
| 2–24h | Automatisierte Alerts (Sentry, Stripe webhooks) |
| 24–48h | Täglicher Check-In, Lighthouse-Run |

Nach 48h ohne kritische Incidents: Hypercare beenden, normale Monitoring-Routine.
