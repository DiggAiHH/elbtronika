# Phase 3 — Lessons Learned & Fehler-Prävention

**Datum:** 2026-04-26  
**Phase:** 3 — Infrastructure  
**Ziel:** Kein Fehler darf technisch zweimal hintereinander passieren.

---

## Fehler #1 — pnpm frozen-lockfile mismatch

**Was passierte:**  
`@supabase/supabase-js` zu `contracts/package.json` hinzugefügt, ohne danach `pnpm install` zu laufen. CI schlägt mit `frozen-lockfile`-Fehler fehl.

**Root Cause:** Dependency hinzugefügt → lockfile nicht aktualisiert → CI kann nicht installieren.

**Fix:** `pnpm install` lokal laufen lassen → `pnpm-lock.yaml` committen.

**Prävention (Regel):**
> Nach JEDER Änderung an `package.json` (egal in welchem Workspace) sofort `pnpm install` laufen lassen und `pnpm-lock.yaml` mitcommiten. Nie `package.json` alleine committen.

---

## Fehler #2 — Biome `useLiteralKeys`

**Was passierte:**  
`process.env["NEXT_PUBLIC_SUPABASE_URL"]!` statt `process.env.NEXT_PUBLIC_SUPABASE_URL!`. Biome erzwingt Dot-Notation für bekannte Keys.

**Root Cause:** Bracket-Notation verwendet bei string-literalen Property-Zugriffen.

**Fix:** `process.env.KEY!` statt `process.env["KEY"]!`

**Prävention (Regel):**
> `process.env` immer mit Dot-Notation. `process.env["KEY"]` = Biome-Error.

---

## Fehler #3 — Biome `organizeImports`

**Was passierte:**  
Import-Blöcke nicht alphabetisch sortiert → Biome-Check fehlgeschlagen.

**Root Cause:** Importe in logischer Reihenfolge (nicht alphabetisch) geschrieben.

**Fix:** `node_modules\.bin\biome check --write --unsafe <datei>`

**Prävention (Regel):**
> Nach jeder neuen Datei sofort `biome check --write --unsafe` laufen lassen, BEVOR commit. Nie auf CI warten um Lint-Fehler zu finden.

---

## Fehler #4 — Biome `useImportType`

**Was passierte:**  
`import { type NextRequest }` statt `import type { NextRequest }`. Biome erzwingt Top-Level-Type-Import.

**Root Cause:** Inline `type` Keyword statt separater `import type` Statement.

**Fix:** `import type { X }` statt `import { type X }`

**Prävention (Regel):**
> Typ-only Imports → immer `import type { X }`. Biome Auto-Fix deckt das ab wenn `--write --unsafe` läuft.

---

## Fehler #5 — Biome CSS Format (`@keyframes`)

**Was passierte:**  
```css
/* ❌ Inline — Biome will multi-line */
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```
Biome CSS-Formatter erzwingt multi-line Deklarationen in Keyframes.

**Fix:**
```css
/* ✅ Multi-line */
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

**Prävention (Regel):**
> CSS `@keyframes` → immer multi-line. `biome check --write` auf CSS-Dateien nach Änderungen.

---

## Fehler #6 — TypeScript `exactOptionalPropertyTypes`

**Was passierte:**  
```typescript
// ❌ string | undefined nicht assignable zu optionalem string
const client = createClient({
  token: process.env.SANITY_API_READ_TOKEN, // Type error!
});
```
`tsconfig.json` hat `exactOptionalPropertyTypes: true` → `undefined` kann nicht explizit an optionalen Property übergeben werden.

**Fix — Conditional Spread:**
```typescript
// ✅
const client = createClient({
  ...(process.env.SANITY_API_READ_TOKEN
    ? { token: process.env.SANITY_API_READ_TOKEN }
    : {}),
});
```

**Prävention (Regel):**
> Bei optionalen Properties mit `process.env.*`: immer conditional spread. Nie `prop: process.env.X` wenn `X` undefined sein kann und `exactOptionalPropertyTypes: true`.

---

## Fehler #7 — Git Commit Message mit Sonderzeichen in cmd

**Was passierte:**  
`git commit -m "feat: add @supabase/ssr client"` — `@` und `/` in cmd-Anführungszeichen brechen den Befehl.

**Fix:**
```cmd
echo commit message > D:\msg.txt
git commit -F D:\msg.txt
```

**Prävention (Regel):**
> In cmd IMMER `write_file(D:\msg.txt)` + `git commit -F D:\msg.txt`. Nie `git commit -m "..."` mit Sonderzeichen (`@`, `/`, `#`, Umlaute etc.).

---

## Zusammenfassung — Standard-Workflow nach jeder Code-Änderung

```
1. Datei schreiben/ändern
2. pnpm install (wenn package.json geändert)
3. node_modules\.bin\biome check --write --unsafe <datei>
4. node_modules\.bin\tsc --noEmit -p apps/web/tsconfig.json
5. write_file(D:\msg.txt) + git add + git commit -F D:\msg.txt
6. git push + gh run watch
```

**Eselbrücke:** Install → Biome → TS → Commit → Push → Watch. Nie einen Schritt überspringen.

---

## Automation-Empfehlung

Ein Pre-Commit-Hook (Husky) läuft bereits (`lint-staged`). Für Phase 4+:
- `lint-staged` erweitern: TypeScript-Check auf geänderte `.ts`-Dateien
- Doppler `run --` in dev-Scripts integrieren sobald Lou Doppler befüllt hat
