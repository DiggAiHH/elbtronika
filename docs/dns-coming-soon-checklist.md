# elbtronika.art + elbtronika.diggai.de — DNS Checklist

Generated: 2026-05-11 | Status: Coming-Soon deployed @ elbtronika-art.pages.dev | Domains pending

Ziel: `elbtronika.art` und `elbtronika.diggai.de` auf die Coming-Soon-Page binden.
Eselsbruecke: **Apex bei CF (1 Klick), Subdomain bei INWX (1 CNAME)**.

---

## Schritt 1 — elbtronika.art binden (1 min)

**Direkt-Link:** https://dash.cloudflare.com/6abb3679bb27b6d7182ab01d290a3aeb/pages/view/elbtronika-art/domains

1. Klick **"Set up a custom domain"**
2. Eingabe: `elbtronika.art`
3. Klick **"Continue"** -> CF erkennt: Zone bereits im Account -> bietet **"Activate Domain"**
4. Klick **"Activate Domain"** -> DNS Record wird **automatisch** angelegt + SSL Cert via Let's Encrypt provisioniert

Eselsbruecke: **Zone bei CF = One-Click. Kein DNS-Editor noetig.**

Nach ~30s Propagierung erreichbar unter: **https://elbtronika.art**

Optional: Auch `www.elbtronika.art` adden (gleicher Prozess, 1 weiterer Klick).

---

## Schritt 2 — elbtronika.diggai.de via INWX (3 min)

**INWX DNS Editor:** https://www.inwx.de/de/dns

1. Domain `diggai.de` waehlen -> Tab **"Nameserver"** oder **"DNS"**
2. **"Neuer Eintrag"** klicken
3. Eingaben:

   | Feld | Wert |
   |------|------|
   | Typ | `CNAME` |
   | Name | `elbtronika` |
   | Wert | `elbtronika-art.pages.dev` |
   | TTL | `3600` (1h, Default OK) |
   | Prio | (leer / 0) |

4. **Speichern**

Eselsbruecke: **CNAME = Schild umlenken. Name 'elbtronika' verweist auf pages.dev.**

---

## Schritt 3 — elbtronika.diggai.de in CF Pages adden (1 min)

Gleicher Link wie Schritt 1:
https://dash.cloudflare.com/6abb3679bb27b6d7182ab01d290a3aeb/pages/view/elbtronika-art/domains

1. Klick **"Set up a custom domain"**
2. Eingabe: `elbtronika.diggai.de`
3. CF prueft den CNAME -> wenn Schritt 2 propagiert ist (~5-10 min Wartezeit): **"Activate"**
4. SSL Cert auto

Falls CF Aktivierung nicht funktioniert: 10 min warten, dann nochmal versuchen (DNS Propagation).

---

## Verify (3 min spaeter)

```cmd
nslookup elbtronika.art 8.8.8.8
nslookup elbtronika.diggai.de 8.8.8.8
curl -I https://elbtronika.art
curl -I https://elbtronika.diggai.de
```

Beide HTTP/2 200 = done.

---

## Naechster Schritt: Engineering Harness Upgrade

Damit ich dieses naechste Mal autonom mache:
1. CF Dashboard -> My Profile -> API Tokens -> **Create Token**
2. Template: **"Edit Cloudflare Workers"** + zusaetzlich:
   - Zone | DNS | Edit (alle Zonen)
   - Account | Cloudflare Pages | Edit
   - Account | Workers Scripts | Edit
3. Token in Doppler ablegen: `CLOUDFLARE_API_TOKEN`
4. Beim naechsten Domain-Wechsel ruft Claude direkt die API -> 0 Klicks

Eselsbruecke: **Heute 1x Token, immer Auto-Domains.**

---

## Sag mir Bescheid

Sobald Schritte 1+2+3 done -> sage **"domains live"** und ich:

- ✅ Verify mit curl + nslookup
- ✅ Update memory + project_phase_status.md
- ✅ Commit + push (coming-soon + scripts + docs)
- ✅ Notion/Airtable/Miro Sync
- ✅ Track B starten: @opennextjs/cloudflare Adapter im Repo
