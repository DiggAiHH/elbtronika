# Phase 3.2 — Cloudflare R2 Setup (Manual Steps)

> Eselbrücke: "R2 = S3 ohne Egress-Kosten" — Zero egress fees, ideal für CDN-Heavy Workloads.

## Voraussetzungen
- Cloudflare-Account mit aktiviertem R2 (dash.cloudflare.com → R2)
- Domain `elbtronika.art` in Cloudflare DNS verwaltet
- Doppler CLI installiert (kommt in Task 8)

---

## Schritt 1 — R2 Bucket anlegen

1. Öffne **dash.cloudflare.com → R2 Object Storage → Create bucket**
2. Bucket-Name: `elbtronika-assets`
3. Location: **EEUR** (Eastern Europe / Frankfurt-nahe) — **WICHTIG: nicht auto**
4. Default storage class: Standard
5. → **Create bucket**

---

## Schritt 2 — Custom Domain (CDN) verknüpfen

1. Im Bucket → Tab **Settings** → **Custom Domains** → **Connect Domain**
2. Domain eingeben: `cdn.elbtronika.art`
3. Cloudflare legt automatisch einen CNAME-Record an (da Domain in Cloudflare DNS)
4. Status sollte nach ~1 Min auf **Active** wechseln

Ergebnis: Objekte aus dem Bucket sind über `https://cdn.elbtronika.art/<pfad>` erreichbar.

---

## Schritt 3 — CORS Policy setzen

Im Bucket → **Settings** → **CORS Policy** → folgendes JSON eintragen:

```json
[
  {
    "AllowedOrigins": [
      "https://elbtronika.art",
      "https://www.elbtronika.art",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 86400
  }
]
```

---

## Schritt 4 — R2 API Token erstellen

1. **dash.cloudflare.com → R2 → Manage R2 API Tokens → Create API Token**
2. Berechtigungen:
   - **Object Read & Write** für Bucket `elbtronika-assets`
   - **Bucket Read** für alle Buckets (für Listing, optional)
3. TTL: kein Ablauf (oder 1 Jahr)
4. → **Create API Token**
5. Notiere:
   - `Access Key ID`
   - `Secret Access Key`
   - `Account ID` (oben rechts in der Sidebar)
   - `Endpoint`: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`

---

## Schritt 5 — Signed URL Worker (Upload-Proxy)

Uploads aus dem Browser gehen NICHT direkt zu R2 — das würde die Secret Keys exponieren.
Stattdessen: Edge Function generiert eine Presigned URL, Browser lädt direkt hoch.

Datei bereits vorbereitet: `apps/web/src/app/api/upload/route.ts` (wird in Phase 5 gebaut).

Für jetzt: Keys in Doppler speichern (→ Schritt 6).

---

## Schritt 6 — Keys in Doppler eintragen

```bash
doppler secrets set R2_ACCESS_KEY_ID=<access-key-id>
doppler secrets set R2_SECRET_ACCESS_KEY=<secret-access-key>
doppler secrets set R2_ACCOUNT_ID=<account-id>
doppler secrets set R2_BUCKET_NAME=elbtronika-assets
doppler secrets set R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
doppler secrets set NEXT_PUBLIC_CDN_URL=https://cdn.elbtronika.art
```

---

## Ordnerstruktur im Bucket (Konvention)

```
elbtronika-assets/
├── artworks/
│   └── <artwork-uuid>/
│       ├── image.webp        ← Hauptbild (optimiert, max 4000px)
│       ├── image-thumb.webp  ← Thumbnail (400px)
│       └── model.glb         ← 3D-Modell für Immersive Mode (optional)
├── artists/
│   └── <artist-uuid>/
│       └── avatar.webp
├── djs/
│   └── <dj-uuid>/
│       ├── avatar.webp
│       └── cover.webp
└── sets/
    └── <set-uuid>/
        ├── index.m3u8        ← HLS Playlist
        ├── segment-000.ts    ← HLS Segmente
        └── cover.webp
```

---

## Checklist

- [ ] Bucket `elbtronika-assets` angelegt (Location: EEUR)
- [ ] Custom Domain `cdn.elbtronika.art` aktiv
- [ ] CORS Policy gesetzt
- [ ] API Token erstellt (Access Key ID + Secret)
- [ ] Keys in Doppler eingetragen (nach Task 8)
- [ ] Test-Upload: `curl -X PUT https://cdn.elbtronika.art/test.txt` → sollte 403 returnen (kein direkter Write)
- [ ] Test-GET: `curl https://cdn.elbtronika.art/test.txt` → 404 (leer, aber erreichbar)
