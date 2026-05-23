# elbtronika.art — Coming Soon

Static placeholder served via Cloudflare Pages.
Replaced by full Next.js app once Phase 6+7 deploy-ready.

## Deploy

```cmd
wrangler pages deploy apps/web-coming-soon --project-name=elbtronika-art --commit-dirty=true
```

## Preview lokal

Open `index.html` direkt im Browser. Alles inline (HTML+CSS+JS), keine deps.

## Inhalt

- `index.html` — Mark + tagline + Phase-Status + animated grid (canvas, no libs)
- `_headers` — CF Pages headers (CSP-ready)
- `robots.txt` — allow all + sitemap pointer

## Naechster Schritt

Nach Phase 7 DoD: dieses Verzeichnis loeschen, CF Pages Project auf opennext-Build umstellen.
