# Phase 3 Closeout — Manual Steps Checklist

Generated: 2026-05-10 | Owner: Lou | Modus: manual + Chrome MCP next session

Ziel: Stripe Test Keys einsetzen + Netlify <-> Doppler Sync (Option B) aktivieren.
Eselsbruecke: **3 Keys holen, in Doppler kippen, Netlify-Sync einklicken, fertig.**

---

## Step 1 — Stripe Test Keys holen (5 min)

Login: https://dashboard.stripe.com/test/apikeys

| # | Key | Wo klicken | Format |
|---|-----|-----------|--------|
| 1 | `STRIPE_SECRET_KEY` | "Standard keys" -> "Secret key" -> "Reveal test key" -> Copy | `sk_test_...` |
| 2 | `STRIPE_PUBLISHABLE_KEY` | Gleiche Seite -> "Publishable key" -> Copy (sichtbar, kein Reveal) | `pk_test_...` |
| 3 | `STRIPE_WEBHOOK_SECRET` | https://dashboard.stripe.com/test/webhooks -> "Add endpoint" | `whsec_...` |

### Webhook Endpoint Setup (fuer Key #3)

- Endpoint URL: `https://elbtronika.art/api/stripe/webhook` (prd) ODER lokal `https://<ngrok>.ngrok.io/api/stripe/webhook` fuer dev
- Events to listen: `account.updated` (Phase 4), spaeter `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded` (Phase 6)
- Nach "Add endpoint" -> "Signing secret" -> "Reveal" -> Copy

Eselsbruecke: **sk = secret, pk = public, whsec = webhook**.

---

## Step 2 — Keys in Doppler kippen (3 min)

Login: https://dashboard.doppler.com/workplace/projects/elbtronika/configs/dev

Pro Key:
1. Suche Variable (z.B. `STRIPE_SECRET_KEY`) oder klicke auf den PLACEHOLDER-Wert
2. Edit -> Wert einfuegen
3. **WICHTIG:** Nur via `execCommand('insertText')` paste — Doppler Headless UI bug ([feedback_doppler_input.md](../local_606fbd20-6d9f-4c7a-be0d-e2905d6ba0a8/.claude/CLAUDE.md))
   - Praktisch: rechtsklick "Paste" funktioniert NICHT zuverlaessig
   - Workaround: ins Feld klicken, dann `Ctrl+Shift+V` (paste plain) ODER manuell tippen
4. Save -> propagate to **preview** + **prd** (Checkbox)

Reihenfolge: dev -> propagate-checkbox -> Save. Eselsbruecke: **Dev fuellt, Prod erbt**.

| # | Doppler Variable | Wert |
|---|-----------------|------|
| 1 | `STRIPE_SECRET_KEY` | `sk_test_...` |
| 2 | `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |
| 3 | `STRIPE_WEBHOOK_SECRET` | `whsec_...` |

Verify nachher via CLI:
```cmd
doppler secrets get STRIPE_SECRET_KEY --project elbtronika --config dev --plain
```

---

## Step 3 — Netlify <-> Doppler Sync (Option B, 5 min)

Login: https://dashboard.doppler.com/workplace/projects/elbtronika/integrations

1. Klick **"Add Sync"** -> waehle **"Netlify"**
2. **OAuth-Flow:** authorize Doppler bei Netlify (User akzeptiert Scope)
3. Source-Config: **`prd`** (Doppler-seite)
4. Destination: Site **`elbtronika`** (Netlify-seite)
5. Variables: **"Sync All"** (oder selektiere alle 17 ENV vars manuell)
6. Save -> Sync triggert sofort, danach auto bei jedem Doppler-Save

Verify in Netlify:
- https://app.netlify.com -> Site -> Site configuration -> Environment variables
- Alle 17 Vars sichtbar mit Quelle "Doppler"

Eselsbruecke: **Doppler druckt, Netlify nimmt, Sync laeuft**.

---

## Step 4 — Smoke Test (lokal, 2 min)

```cmd
cd D:\Elbtronika\Elbtonika
doppler run --project elbtronika --config dev -- pnpm --filter @elbtronika/web build
```

Erfolg = Build gruen + alle ENV vars geladen. Fehler = falscher Doppler Token oder Variable fehlt.

---

## Step 5 — Sag mir Bescheid

Sobald Steps 1-4 done -> sage **"phase 3 closed"** und ich:

- ✅ `phase-3-doppler-github-netlify-setup.md` Status auf done updaten
- ✅ `CLAUDE.md` Phase 3 manual steps abhaken
- ✅ Memory update (`project_phase_status.md`)
- ✅ Commit + push (`docs(phase-3): close out manual steps`)
- ✅ Doku-Sync Notion / Airtable / Miro
- ✅ Phase 6 Entry-Plan triggern (auch wenn Legal blockt — wir bauen Cart-UI parallel)

---

## Best Practice / Automation Empfehlung

- **Doppler Sync = Push-Modell** statt Run-Modell. Vorteil: kein `doppler` CLI im Netlify-Build, keine Latenz, keine Token-Rotation pro Deploy.
- **Stripe Webhook Secret** rotiert nach Endpoint-Update. Sobald prd-Endpoint live geht, neuen `whsec_` ziehen + in Doppler nachziehen.
- **Naechste Iteration:** Chrome MCP Extension (https://claude.ai/chrome) installieren -> ich kann diesen ganzen Flow autonom in 30s machen.
- **Engineering-Harness Regel:** Jeder manuelle Step jetzt = ein Skript / GitHub Action spaeter. Stripe-Key-Rotation kandidiert fuer scheduled task (90-Tage-Rotation).
