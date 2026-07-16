# GO-LIVE Checkliste — Stand 2026-07-16

> Ergebnis der „Ready für Verkauf"-Session. Technische Arbeit: erledigt oder vorbereitet.
> Verbleibende Schritte sind extern (Accounts/Recht) und liegen bei Lou.
> Reihenfolge einhalten — jeder Block schaltet den nächsten frei.

## Was diese Session geliefert hat

| Bereich | Ergebnis |
|---|---|
| Objekte | 8 Kunstwerke, 8 Avatare, 3 Set-Cover, 3 Raum-Cover — generiert, lizenzfrei, `is_demo=true` (jederzeit durch echte Kunst ersetzbar) |
| Frequenzen | 3 DJ-Sets + 3 Raum-Ambients synthetisiert (128/102/122 BPM); **Analyzer v2**: BPM-Oktavfehler gefixt, echte Chromagramm-Tonarterkennung (Krumhansl), 8 neue Unit-Tests; alle Assets mit dem Produkt-Analyzer **echt vermessen** (`source: "measured"`) |
| 3D | `GalleryHall`: achteckiger Hauptsaal, zeigt die **gesamte Kollektion** (bis 12 Werke, 8 Wände + 4 Pfeiler) statt 3 Slots; Galerie filtert jetzt wie der Shop nach `ELT_MODE` |
| Ehrlichkeit | `/api/flow/analyze` liefert measured-first; Simulation nur noch als Fallback und klar gelabelt; Migration `20260716120000_features_source.sql` |
| Pipeline | `scripts/analyze-assets.mts` = echte Decode-Pipeline (ffmpeg → packages/flow) für alle zukünftigen echten Uploads; `scripts/seed-sanity-demo.mjs` befüllt das leere CMS idempotent |
| Qualität | Biome-Fehler gefixt (SVG-Titel, a11y-Dialog, Test-Mock); Logger-Migration (uncommitted vom 10.07.) verifiziert und mit committet |

## Lou: die 4 Freischalter (in dieser Reihenfolge)

### 1. GitHub-Billing entsperren (5 Min) — schaltet CI + Deploys frei
github.com → Settings → Billing and plans → Zahlungsmittel prüfen/erneuern.
Symptom bis dahin: jeder Actions-Lauf failt nach 3 s („account is locked due to a billing issue").

### 2. `doppler login` (2 Min) — schaltet Secrets frei (Supabase, Stripe, Netlify)
Neues Terminal (nicht das CLAUDE-RUNNER-Fenster):
```
doppler login
doppler setup --project elbtronika --config dev
```

### 3. Sanity-Schreib-Token (3 Min) — schaltet Inhalte frei
sanity.io/manage → Projekt xbjul8yd → API → Tokens → Add token (Rechte: **Editor**)
→ Token als `D:\Elbtronika\_assets_generated\sanity_token.txt` speichern.
Danach läuft: `node scripts/seed-sanity-demo.mjs --assets D:\Elbtronika\_assets_generated`
und die Analyse: `pnpm tsx scripts/analyze-assets.mts D:\Elbtronika\_assets_generated\manifest.json --upsert`

### 4. Stripe Live (Vorlauf mehrere Tage) — schaltet echten Verkauf frei
Stripe-Dashboard → Aktivierung/KYC abschließen → Live-Keys (`sk_live/pk_live/whsec_live`)
→ in Doppler `prd` eintragen. Bis dahin verkauft die Seite im Test-Modus (Karte 4242…).

## Danach: Live-Switch
Exakt nach `docs/runbooks/live-switch-post-lee-ok.md` (15 Min + Smoke-Test):
Doppler prd `ELT_MODE=live` → Sanity: Demo unpublish/echte Kunst publish → Netlify-Deploy →
Stripe-Webhook auf `https://elbtronika.art/api/stripe/webhook` → Smoke-Test.
DNS: elbtronika.art zeigt noch auf Cloudflare Pages (Coming-Soon) — beim Launch auf
Netlify-Production umhängen (Cloudflare DNS-Record ändern, NICHT die Nameserver).

## Offene Rest-Punkte (nicht blockierend)
- Supabase: Baseline `db pull` + 3 Deltas (`flow_engine`, `investor_role`, `features_source`) pushen, `gen types` (braucht Schritt 2)
- Impressum/AGB/Datenschutz final vom Anwalt (UG i.G.-Daten eintragen)
- Dependabot-Majors, Lighthouse-Baseline lokal
