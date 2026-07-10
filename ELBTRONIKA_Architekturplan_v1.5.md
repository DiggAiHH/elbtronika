# ELBTRONIKA Architekturplan v1.5

**Datum:** 2026-07-09 · **Status:** AKTIV — ersetzt v1.4 (v1.0–v1.4 sind Audit-Trail, nicht mehr pflegen).

> v1.5 ist bewusst schlank: Die Vorgänger versuchten, Plan UND Status UND Log zu sein —
> und drifteten. Ab jetzt gilt: **Dieser Plan = Grundsatzentscheidungen.**
> **STATUS.md = Zustand + Sessions-Log.** **PLAN_RESTARBEITEN_2026-07-09.md = operatives Backlog.**
> **docs/adr/INDEX.md = Architekturentscheidungen im Detail.** **CLAUDE.md = Agenten-Regeln.**

## 1. Entscheidungen, die v1.4 offen ließ (hiermit fixiert)

1. **Phasen-Nummerierung final:** Phasen 1–19 wie in STATUS.md. Phase 20 = Pre-Pitch-Cleanup
   (abgeschlossen mit Tag `v0.14.0-prepitch`, 2026-07-09). Phase 21 = Live-Switch,
   Phase 22 = Public Launch. **VR/XR = Phase 23** (löst die „Phase 8"-Nummernkollision;
   ADR 0023 bleibt gültig). Backlog danach: 24 Multi-Cart, 25 NFT, 26 Vinyl/USB, 27 Live-Vernissage.
   Die alte v1.0-Bedeutung von Phase 14–16 ist gestrichen.
2. **Phase-18/19-Namens-Drift (v1.4 §9 I6):** Kanonisch sind die STATUS.md-Namen
   („Unit Tests Recovery" / „Lint & Tooling Health"); Demo-Readiness/Pitch-Polish waren
   dieselbe Arbeit unter Pitch-Blickwinkel. Kein Umbenennen mehr.
3. **Ein ADR-Nummernkreis** in `docs/adr/` (Merge + Mapping: siehe `docs/adr/INDEX.md`). Nächste Nummer: 0034.
4. **Branch-Modell:** `main` = Wahrheit. Kurze Feature-Branches, nach Merge löschen.
   `feature/phase-11-ai` wird nur noch als Spiegel von main gepusht (Alt-Referenzen) und
   kann nach dem Launch gelöscht werden.
5. **Deploy-Politik:** Production-Deploy NUR manuell (workflow_dispatch + „DEPLOY")
   bis Phase-21-Runbook. Kein Auto-Deploy auf main-Push.
6. **Supabase-Baseline:** Repo-Dateien 0001–0003 sind KEINE gültige Baseline (Schema-Drift,
   siehe STATUS.md 09.07.). Vorgehen: CLI + `db pull` → echte Baseline ersetzt 0001–0003 →
   nur echte Deltas pushen (flow_engine, investor_role). `seed.sql` wird danach gegen das
   echte Schema neu geschrieben.
7. **Ehrlichkeits-Regel:** Simulierte/Platzhalter-Funktionalität trägt `source: "simulated"`
   bzw. explizite `implemented: false`-Antworten. Kein Feature „verkauft" mehr, was es nicht tut.
   Echte Audio-/Bild-Analyse erfordert eine Decode-Pipeline (ffmpeg serverseitig ODER
   Client-seitige Analyse im Kurations-UI) — Entscheidung dazu fällt in Phase 23+.
8. **Split ohne DJ:** bleibt 60/0/40 (Plattform erhält den Rest), bis Lou anders entscheidet.
   Öffentlich kommuniziert wird der Split „bis zu 60/20/20" — Marketing-Texte prüfen (Phase 21).

## 2. Zielbild (unverändert aus v1.4, komprimiert)

Immersive 3D-Galerie (Single Canvas, R3F/WebGL, WebGPU wenn reif) + Classic Shop +
Spatial Audio (hls.js/PannerNode) + Stripe Connect (Separate Charges & Transfers) +
Sanity-CMS → Supabase-Sync + Claude-basierte Kuration (beschreiben/empfehlen/matchen)
mit Audit-Log + Hermes-Agent/MCP für Betriebsautomatisierung. Privacy by Architecture.

## 3. Weg zum Launch (kritischer Pfad)

1. **Lou:** Phase 0 (Rechtsform, Anwalt, Stripe-KYC, Marken/Domains) — einziger externer Blocker.
2. **Lou (30 Min):** Supabase-CLI + Doppler installieren, Credentials — dann DB-Deltas + gen types (Anleitung in STATUS.md).
3. Sprint-6-Rest laut PLAN_RESTARBEITEN (Test-Härtung, Lighthouse-Baseline, Dependabot).
4. Phase 21 exakt nach `docs/runbooks/live-switch-post-lee-ok.md` → Phase 22 Launch → 48h Hypercare.
