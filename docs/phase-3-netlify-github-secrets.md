# Phase 3 — Netlify Site + GitHub Secrets

> **Manuelle Schritte für Lou.** CI-Workflow (`.github/workflows/ci.yml`) ist fertig — er wartet nur auf diese beiden Secrets.

---

## Eselbrücke

`NETLIFY_SITE_ID` = Welche Site. `NETLIFY_AUTH_TOKEN` = Darf ich deployen?  
Beide in GitHub → dann deployed CI automatisch bei jedem `main`-Push.

---

## 1. Netlify Site anlegen

### Option A — Netlify CLI (empfohlen)

```bash
npm install -g netlify-cli
netlify login
cd D:\Elbtronika\Elbtonika

# Neue Site anlegen (ohne automatischen Deploy)
netlify sites:create --name elbtronika

# Site ID kopieren aus der Ausgabe: "Site ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### Option B — Netlify Dashboard

1. → [app.netlify.com](https://app.netlify.com) → **Add new site** → **Deploy manually**
2. Beliebige Datei hochladen (wird überschrieben)
3. Site Settings → **Site information** → **Site ID** kopieren
4. Site umbenennen: Settings → **Site name** → `elbtronika`

---

## 2. Netlify Personal Access Token

1. → [app.netlify.com/user/applications](https://app.netlify.com/user/applications)
2. **Personal access tokens** → **New access token**
3. Description: `github-actions-elbtronika`
4. Expiration: **No expiry** (oder 1 year — dann Reminder setzen)
5. Token kopieren: `nfp_xxxx...`

---

## 3. GitHub Secrets setzen

```bash
# Mit GitHub CLI (empfohlen)
gh secret set NETLIFY_SITE_ID --repo DiggAiHH/elbtronika
# Paste: <Site ID aus Schritt 1>

gh secret set NETLIFY_AUTH_TOKEN --repo DiggAiHH/elbtronika
# Paste: <Token aus Schritt 2>
```

**Manuell über Dashboard:**

1. → [github.com/DiggAiHH/elbtronika/settings/secrets/actions](https://github.com/DiggAiHH/elbtronika/settings/secrets/actions)
2. **New repository secret** × 2:
   - `NETLIFY_SITE_ID` → `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - `NETLIFY_AUTH_TOKEN` → `nfp_xxxx...`

---

## 4. Netlify Build Settings konfigurieren

In Netlify Dashboard → Site → **Build & deploy** → **Build settings**:

| Setting | Value |
|---------|-------|
| Base directory | `apps/web` |
| Build command | `pnpm build` |
| Publish directory | `apps/web/.next` |
| Functions directory | *(leer lassen)* |

> ⚠️ Netlify baut NICHT selbst — CI (`ci.yml`) baut und pusht den Output.  
> Netlify CLI `--dir=apps/web/.next` deployed das fertige `.next`-Verzeichnis direkt.

---

## 5. Netlify Environment Variables (für Netlify-seitige Previews)

Falls Lou später Netlify-native Previews nutzen will (ohne GitHub CI):

1. Netlify → Site → **Site configuration** → **Environment variables**
2. Alle Secrets aus Doppler `preview` Environment hier eintragen

**Für Phase 3 reicht:** Secrets in GitHub → CI deployed via `netlify-cli`.

---

## 6. Verify

Nach dem Setzen der Secrets:

```bash
# Neuen CI-Run triggern
git commit --allow-empty -m "chore: trigger CI deploy test"
git push origin main

# CI beobachten
gh run list --repo DiggAiHH/elbtronika --limit 3
gh run watch <RUN_ID> --repo DiggAiHH/elbtronika
```

Erwartetes Ergebnis: Deploy-Step zeigt `Website URL: https://elbtronika.netlify.app` (oder custom domain).

---

## Checkliste

- [ ] Netlify Site `elbtronika` angelegt
- [ ] `NETLIFY_SITE_ID` in GitHub Secrets gesetzt
- [ ] `NETLIFY_AUTH_TOKEN` in GitHub Secrets gesetzt
- [ ] Netlify Build Settings konfiguriert (base: `apps/web`)
- [ ] Test-Push → Deploy-Step in CI erfolgreich (kein `continue-on-error`)
- [ ] Netlify URL aufrufbar: `https://elbtronika.netlify.app`
