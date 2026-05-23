# DR-Blast — Deep-Research Multi-Tool Automation

## Was

Schlägt Prompts parallel in Gemini / Kimi / Copilot Deep-Research-Mode rein.
Spart Token + Klicks weil Claude / Cowork den Browser nicht steuern müssen.

## Setup (einmalig)

```cmd
pnpm i -D playwright
pnpm exec playwright install chromium
pnpm dr:blast --setup    :: öffnet Chromium mit 3 Tabs → einloggen in Gemini/Kimi/Copilot → Window schließen
```

Logins werden in `./browser-profile/` persistiert (in `.gitignore`).

## Feuern

```cmd
pnpm dr:blast              :: alle Prompts in scripts/dr-prompts.mjs
pnpm dr:blast 1 2 4        :: nur Prompts 1, 2, 4
```

## Eselbrücke

**S P F** — **S**etup einmal, **P**rompts pflegen, **F**euern.

## Best Practice

- Prompts in `scripts/dr-prompts.mjs` versionieren → Git-History zeigt was wir gefragt haben
- DR-Results manuell sichern in `D:\Elbtronika\Elbtonika\research\YYYY-MM-DD-prompt-N.md`
- Vor wichtigen Phase-Entscheidungen IMMER DR feuern → Best-Practice = "DR vor ADR"

## Automation-Empfehlung

- GitHub Actions Cron (z.B. monatlich) → `pnpm dr:blast` für strategische Themen
- ABER: DR-UIs brechen Selektoren häufig → Selektor-Health-Check vor CI nötig
- Alternative: nur lokal triggern wenn neue Strategie-Frage auftaucht

## Tier-Check

```cmd
pnpm dr:tiers
```

Liest Supabase + Netlify + Sanity Plans via API. Tokens via Doppler oder lokales `.env`.

## To-Do

- [ ] Initial: `pnpm dr:blast --setup` und in Gemini/Kimi/Copilot einloggen
- [ ] Test-Run: `pnpm dr:blast 4` (nur Copilot, prüft ob Researcher-Mode-Toggle gefunden wird)
- [ ] Tokens in Doppler für `pnpm dr:tiers`:
  - `SUPABASE_ACCESS_TOKEN` (https://supabase.com/dashboard/account/tokens)
  - `NETLIFY_AUTH_TOKEN` (https://app.netlify.com/user/applications#personal-access-tokens)
  - `SANITY_AUTH_TOKEN` (https://www.sanity.io/manage/personal/tokens)
