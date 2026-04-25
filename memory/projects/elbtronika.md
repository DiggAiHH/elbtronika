# ELBTRONIKA

**Status:** Plan v1.0 approved — Phase 0 läuft (Legal + Stripe KYC)
**Zielwochen:** 20–24 Kalenderwochen Solo-Development mit Claude-Pairing
**Plan-Dokument:** `D:\Elbtronika\Elbtonika\ELBTRONIKA_Architekturplan_v1.md`

## Mission

Immersive, audiovisuelle Online-Galerie die **elektronische Musik (DJs) und visuelle Kunst verschmilzt**. Käufer kauft ein Original-Artwork bundled mit einem Exclusive DJ-Set. Die Plattform-Differenzierung: nahtloser Wechsel zwischen "Immersive Mode" (3D + Spatial Audio) und "Classic Mode" (Shop-Grid).

## Revenue Model

60% Künstler / 20% DJ / 20% Plattform — via Stripe Connect Separate Charges and Transfers.

## Domains

- elbtronika.de
- elbtronika.com
- elbtronika.art (Primary)
- cdn.elbtronika.art (R2-Proxy)

## Architektur-Prinzipien

1. **Single Canvas, multiple Projections** — WebGPU-Canvas nie unmounted, Mode-Switch via Kamera-Interpolation + Shader-Blend
2. **Privacy by Architecture** — alle Third-Party-Requests (SoundCloud, Stripe) über Edge-Proxy oder cookieless
3. **Deterministische Commerce-Layer** — Idempotenz + RLS + Audit-Log, Finanzströme nicht verhandelbar

## Phasen-Übersicht

| # | Phase | Wochen |
|---|-------|--------|
| 0 | Legal + Stripe KYC + Domains + Accounts | 1–2 |
| 1 | Repo + Tooling + DX | 2 |
| 2 | Design System + Core UI | 3 |
| 3 | Infra: Supabase + R2 + Sanity | 3–4 |
| 4 | Auth + Rollen | 4 |
| 5 | Content Model + Asset-Pipeline | 5 |
| 6 | Classic Mode Shop | 6–7 |
| 7 | Immersive 3D Gallery (Single Canvas) | 8–11 |
| 8 | Spatial Audio System | 11–13 |
| 9 | Mode Transitions | 13–14 |
| 10 | Stripe Connect Checkout | 14–16 |
| 11 | Claude-Kuration (AI) | 16–17 |
| 12 | DSGVO Consent + Analytics | 17 |
| 13 | Performance + Monitoring | 18 |
| 14 | Beta Closed | 19 |
| 15 | Public Launch | 20 |
| 16 | Automation + Agents | 21–24 |

## Critical Path Blockers

- **Phase 0 → alle Commerce-Phasen:** Stripe KYC dauert 5–10 Werktage, blockt Phase 10
- **Phase 3 → Phase 5+:** ohne Supabase + R2 keine Content-Pipeline
- **Phase 7 → Phase 8, 9:** Single-Canvas-Architektur muss stehen, sonst teure technische Schuld

## Beteiligte Entities (TBD)

- Steuerberater — Rechtsform-Entscheidung
- Fachanwalt IT-Recht — Impressum/DSE/AGB/Markenrecht
- Kuratorin — Sanity Review-Rolle
- Erste 2–3 Partner-DJs (für Beta)
- Erste 2–3 Partner-Künstler (für Beta)

## Risk Items

- GEMA-Problematik bei DJ-Sets → Rechte-Klärung in DJ-Vertrag
- Digitalgüter-Widerrufsrecht § 356 Abs. 5 BGB → Consent-Mechanismus vor Lieferung
- WebGPU-Support-Matrix — WebGL2-Fallback zwingend
- Safari AudioContext-Unlock-Verhalten (je Tab) → Fallback-Banner
- R2-CORS fein konfigurieren, sonst blockierte Assets

## Status-Log

- **2026-04-24** — Architekturplan v1.0 approved, Plan ist nicht committed, wartet auf Freigabe von Lou vor erstem Code-Commit.
