# Pitch-Rehearsal Runbook

> **Ziel:** Lou fühlt sich sicher im 5-Minuten-Pitch zu Lee Hoops.
> **Dauer:** 15 Min Vorbereitung + 5 Min Pitch + 5 Min Q&A
> **Letztes Update:** 2026-04-30

---

## Pre-Pitch Checkliste (15 Min vorher)

- [ ] Laptop voll geladen oder Stromkabel dabei
- [ ] Chrome/Edge im Vollbildmodus, alle anderen Tabs geschlossen
- [ ] `https://elbtronika.art` (oder Preview-URL) im Browser geladen
- [ ] Audio-Lautstärke auf 30–40 % (nicht zu laut für Büroumgebung)
- [ ] Demo-Banner sichtbar? → Bestätigt: `ELT_MODE=demo`
- [ ] Test-Card-Hinweis im Checkout sichtbar? → `4242 4242 4242 4242`
- [ ] Supabase-Dashboard offen im Hintergrund (für Audit-Log-Showcase)
- [ ] Stripe-Dashboard Test-Mode offen (für Split-Transfer-Showcase)
- [ ] Pitch-Dashboard-Login getestet (Magic-Link an Lee's Mail)
- [ ] Walkthrough-Tour manuell durchgespielt (1x)
- [ ] Backup-Lite-Mode im Kopf: falls 3D ruckelt → `?lite=1` an URL anhängen

---

## Lee's Erlebnis-Choreografie (5 Minuten)

### 0:00–0:30 — Landing-Page Hook
**Was Lou sagt:**
> "Lee, das ist ELBTRONIKA. Kein PowerPoint — das ist die echte Plattform."

**Was demonstriert wird:**
- Landing-Page öffnet, subtiler Ambient-Sound startet bei Klick auf "Enter Gallery"
- Hero-Animation läuft flüssig (60 FPS)
- Demo-Banner unten rechts sichtbar: "Demo Environment · v0.13"

---

### 0:30–1:30 — Walkthrough-Tour
**Was Lou sagt:**
> "Wir führen Lee durch 5 Schritte — skippbar jederzeit."

**Was demonstriert wird:**
- Tour startet automatisch (2s Delay nach Audio-Unlock)
- Step 1: Willkommen
- Step 2: 3D-Navigation erklärt
- Step 3: Audio-Proximity (Sound ändert sich, wenn man näher kommt)
- Step 4: Artwork-Detail (Story, Künstler, Preis)
- Step 5: Checkout-Flow

**Backup:** Falls Tour nicht startet → Footer-Link "Take the tour" manuell klicken.

---

### 1:30–3:00 — 3D-Galerie + Spatial Audio
**Was Lou sagt:**
> "Das ist der immersive Kern. Jeder Raum hat einen DJ-Set. Die Kunst reagiert auf den Sound."

**Was demonstriert wird:**
- Scroll durch Galerie, Kamera folgt Spline
- Annäherung an Artwork → Audio-Stream wird lauter (PannerNode)
- Klick auf Artwork → Detail-Overlay mit Story

**Backup:** Falls Audio nicht startet →
- Chrome: `chrome://settings/content/sound` prüfen
- Oder: Reload, dann direkt auf Artwork klicken (AudioContext resume)

---

### 3:00–4:00 — Artwork-Detail + Checkout
**Was Lou sagt:**
> "Lee kann hier kaufen — Test-Modus, keine echte Transaktion. Wir zeigen den Split."

**Was demonstriert wird:**
- Artwork-Detail: Story, Künstler-Profil, Preis
- "Acquire Artwork" → Checkout
- Stripe-Test-Card-Hinweis: "Use card 4242 4242 4242 4242"
- Kauf abschließen → Success-Page mit Download-Code

---

### 4:00–4:30 — Stripe-Dashboard: Der Split
**Was Lou sagt:**
> "60 % Künstler, 20 % DJ, 20 % Plattform. Transparent, automatisch."

**Was demonstriert wird:**
- Stripe Test-Dashboard öffnen
- Transfer-Group zeigt 3 Transfers
- Künstler-Connected-Account zeigt eingehenden Transfer

---

### 4:30–5:00 — Press-Kit + Pitch-Dashboard
**Was Lou sagt:**
> "Und hier ist die Business-Seite. Roadmap, Team, Zahlen."

**Was demonstriert wird:**
- `/press` öffnen: Vision, Roadmap, Numbers
- `/pitch` öffnen (investor-gated): Mock-Sales-Chart, Artist-Pipeline, AI-Kuration-Kosten

---

## Backup-Pläne

### Audio startet nicht
1. Browser-Tab neu laden
2. Direkt auf "Enter Gallery" klicken (nicht scrollen)
3. Fallback: "Der Sound ist ein nice-to-have — die Visuals sprechen für sich."

### 3D-Performance ist schwach
1. URL um `?lite=1` erweitern → Lite-Mode ohne Volumetric Effects
2. Oder: Direkt zum `/shop` wechseln (Classic Mode)

### Stripe-Checkout spinnt
1. Stripe-Dashboard direkt zeigen (vorbereiteter Screenshot als Ultima-Ratio)
2. "Das ist Test-Mode — Live ist identisch, nur mit echten Karten."

### Internet ist langsam
1. Localhost-Version (`pnpm dev`) als Backup auf demselben Laptop
2. Screenshot-PDF im Downloads-Ordner

---

## Post-Pitch Q&A (erwartete Fragen + Antworten)

| Frage | Antwort |
|-------|---------|
| "Wie viel Kunden habt ihr?" | "Noch keine — das ist die Pitch-Demo. First Sale kommt nach Lee-OK + Live-Switch." |
| "Was kostet der Live-Switch?" | "15 Minuten Doppler-Update + Sanity-Filter. Kein Code-Deploy nötig." |
| "Wie sicher ist das Payment?" | "Stripe Connect, PCI-compliant, wir berühren keine Karten-Daten." |
| "Was ist der USP gegenüber Artsy/Saatchi?" | "Spatial Audio + 3D-Immersion + faire Revenue-Splits. Keine Gallery nimmt 50 %." |
| "Wann ist Public Launch?" | "2–4 Wochen nach Lee-OK: UG-Steuernummer + Stripe-KYC + Anwalt-Review." |

---

## Nach dem Pitch

- [ ] Lou schickt Danke-Mail mit Pitch-Dashboard-Zugang (Magic-Link)
- [ ] Follow-up nach 48h falls kein Feedback
- [ ] Bei Lee-OK → Live-Switch-Choreografie starten (`docs/runbooks/live-switch-post-lee-ok.md`)
