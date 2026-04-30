# Session 3 — Komplettes Wissensarchiv

> **Datum:** 2026-04-30
> **Agent:** Kimi K-2.6
> **Session:** 3 (Demo-Readiness + Pitch-Polish + Tests/Doku)
> **Finaler Branch:** `feature/phase-11-ai` @ `0dc365a`
> **Tag:** `v0.13.0-demo`

---

## 1. Tools & Commands (Session 3)

### Git
```bash
git checkout -b feature/phase-18-demo-readiness feature/phase-11-ai
git checkout -b feature/phase-19-pitch-polish feature/phase-11-ai
git checkout -b feature/phase-18-19-tests-and-prd-docs feature/phase-11-ai
git merge --no-ff feature/phase-18-19-tests-and-prd-docs -m "merge(codex): ..."
git merge --no-ff feature/phase-18-demo-readiness -m "merge(sonnet): ..."
git merge --no-ff feature/phase-19-pitch-polish -m "merge(gpt): ..."
git tag -a v0.13.0-demo -m "ELBTRONIKA v0.13.0-demo — Pitch-Ready + Trust-Hardened"
git push origin v0.13.0-demo
git push origin feature/phase-11-ai --force-with-lease
```

### pnpm / Node
```bash
pnpm --filter @elbtronika/web typecheck        # TypeScript-Check
pnpm --filter @elbtronika/web test             # Vitest Unit-Tests
pnpm --filter @elbtronika/web test:e2e         # Playwright E2E
pnpm --filter @elbtronika/contracts typecheck  # Contracts Type-Check
```

### Supabase
```bash
pnpm supabase db push                          # Migrations auf dev
pnpm supabase migration list                   # Applied-Migrations anzeigen
pnpm supabase gen types typescript --project-id <id> > packages/contracts/src/supabase/types.ts
```

---

## 2. Architektur-Entscheidungen (ADRs)

| ADR | Titel | Status |
|-----|-------|--------|
| 0014 | Trust Residuals: Audit DB + Service-Role Key | Accepted |
| 0018 | Demo-Mode Architecture (demo/staging/live) | Accepted |
| 0019 | Pitch Architecture (WalkthroughTour, Press-Kit, Pitch-Dashboard) | Accepted |
| 0020 | Modes + Doppler prd Strategy | Accepted |

---

## 3. ELT_MODE System

### Env-Variable
```typescript
ELT_MODE: "demo" | "staging" | "live"  // default: "demo"
```

### Verhalten pro Modus
| Modus | Shop-Filter | Banner | Stripe |
|-------|-------------|--------|--------|
| demo | Nur `isDemo=true` | Demo-Banner bottom-right | Test + Mock-Accounts |
| staging | Beides | Staging-Banner top | Test + Real-Accounts |
| live | Nur `isDemo=false` | Kein Banner | Live |

### Client-Zugriff
```tsx
const { mode, isDemo, isStaging, isLive } = useElbMode();
```

---

## 4. Demo-Personas (Seed)

### Artists (5)
- Mira Volk — Berlin, abstract digital painter
- Kenji Aoki — Tokyo, post-cyberpunk visuals
- Helena Moraes — São Paulo, glitch art
- Theo Karagiannis — Athens, mediterranean futurism
- Sasha Wren — London, dark surrealism

### DJs (3)
- Lior K. — minimal techno
- Nightform — ambient + breakbeat
- Velvetrace — house + downtempo

### Rooms (3)
- Lobby, Neon Hall, Quiet Garden

### Mock Stripe Accounts (8)
```typescript
DEMO_CONNECTED_ACCOUNTS = {
  "mira-volk": "acct_demo_mira_volk_001",
  "kenji-aoki": "acct_demo_kenji_aoki_002",
  // ... etc
}
```

---

## 5. Trust-Residuals (Wave 1 Final)

### mcp_audit_log Tabelle
```sql
create table mcp_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  role text not null,
  server text not null,
  tool text not null,
  status text not null check (status in ('ok','denied','error')),
  duration_ms int,
  error_class text,
  request_hash text,
  created_at timestamptz default now()
);
```

### Dual-Mode Logger
- **Console:** Immer aktiv (Fallback, Zero-Dependency)
- **DB:** Hinter `MCP_AUDIT_DB=true` (Feature-Flag)

### Service-Role-Key
- `apps/web/src/lib/supabase/admin.ts` nutzt `SUPABASE_SERVICE_ROLE_KEY`
- Für `account/delete` und Audit-DB-Writes

---

## 6. Pitch-Erlebnis-Choreografie (5 Min)

| Minute | Aktion | Tech |
|--------|--------|------|
| 0:00–0:30 | Landing öffnet, Audio-Unlock | SoundToggle, Enter Experience CTA |
| 0:30–1:30 | WalkthroughTour auto-start | 5 Steps, dismissible |
| 1:30–3:00 | 3D-Galerie + Spatial Audio | CanvasRoot, PannerNode |
| 3:00–4:00 | Artwork-Detail + Checkout | Test-Card-Hint: 4242... |
| 4:00–4:30 | Stripe-Dashboard Split | Transfer-Group Mock |
| 4:30–5:00 | Press-Kit + Pitch-Dashboard | `/press`, `/pitch` |

---

## 7. Neue Routen & Komponenten

### Routen
| Route | Zweck | Gating |
|-------|-------|--------|
| `/de/press` | Press-Kit (Vision, Roadmap, Team) | Öffentlich |
| `/de/pitch` | Investor Dashboard | `role === 'investor'` |
| `/de/checkout` | Checkout + Test-Card-Hint | Demo-Mode only |

### Komponenten
| Komponente | Ort | Zweck |
|------------|-----|-------|
| `DemoBanner` | `packages/ui` | Mode-Indikator (demo/staging/live) |
| `WalkthroughTour` | `packages/ui` | 5-Step Onboarding |
| `SoundToggle` | `apps/web/app/[locale]/page.tsx` | Audio-Unlock |
| `EnvProvider` | `apps/web/src/components/providers` | ELT_MODE Hydration |

---

## 8. i18n Keys (neu)

### messages/de.json + en.json
- `press.*` — Press-Kit-Texte
- `pitch.*` — Investor-Dashboard-Texte
- `tour.*` — WalkthroughTour-Texte
- `common.usp` — "Where art meets frequency"
- `common.enterExperience` — "Enter Experience"
- `common.viewCatalog` — "View Catalog"

---

## 9. Migrations (Supabase)

| Datei | Inhalt |
|-------|--------|
| `20260430_agent_tasks.sql` | Durable Agent Tasks (Wave 3+4) |
| `20260430_orders_session_id.sql` | `stripe_session_id` für Webhook-Lookup |
| `20260430_mcp_audit_log.sql` | Audit-Tabelle + RLS |
| `20260430_artworks_is_demo.sql` | `is_demo` Spalte + Index |
| `20260430_investor_role.sql` | `investor` Role in profiles |

---

## 10. Runbooks (Doku)

| Runbook | Zweck |
|---------|-------|
| `docs/runbooks/pitch-rehearsal.md` | Lou's 5-Minuten-Script |
| `docs/runbooks/doppler-prd-setup.md` | 22 ENV-Variablen + Validation |
| `docs/runbooks/live-switch-post-lee-ok.md` | 15-Minuten Live-Switch |
| `docs/git-tags-cleanup.sh` | Annotated Tag-Migration |
| `docs/demo-assets-license.md` | Asset-Quellen + Lizenz |
| `docs/marketing/demo-video-script.md` | 60–90s Voice-Over |

---

## 11. Test-Coverage

### Unit Tests (41 passing)
- `__tests__/env/mode.test.ts` — ELT_MODE Validation
- `__tests__/stripe/demo.test.ts` — Mock-Account-Mapping
- `__tests__/shop/demo-mode.test.tsx` — Shop-Filter-Logik
- `__tests__/landing/hero.test.tsx` — Placeholder
- `__tests__/press/press-kit.test.tsx` — Placeholder
- `__tests__/pitch/dashboard.test.tsx` — Placeholder

### E2E Tests
- `apps/web/e2e/demo-flow.spec.ts` — 8-Step Investor Flow
- `apps/web/e2e/shop.spec.ts` — Bestehend
- `apps/web/e2e/health.spec.ts` — Bestehend

---

## 12. Offene Punkte (Next Steps)

1. **Demo-Artwork-Bilder** — 8 Stück generieren (AI oder lizenzfrei)
2. **Stripe Test-Connected-Accounts** — 8 Accounts erstellen + IDs updaten
3. **Supabase Migrations** — Auf dev pushen (`supabase db push`)
4. **Doppler dev** — `ELT_MODE=demo` + `MCP_AUDIT_DB=true`
5. **Pitch-Termin** — Mit Lee Hoops terminieren

---

## 13. Konflikt-Prävention (für zukünftige Sessions)

- **Exklusiver Scope pro Session:** Siehe PROMPTS_SESSION3_2026-04-30.md
- **Merge-Reihenfolge:** Codex → Sonnet → GPT
- **Branch-Gate:** `git status -sb` + `git log --oneline -10` vor Implementation
- **Status-Update:** STATUS.md nach jedem Schritt aktualisieren
