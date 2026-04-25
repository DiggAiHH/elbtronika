# Company Context — ELBTRONIKA (pre-incorporation)

**Status:** Pre-Incorporation (Rechtsform steht noch aus, Steuerberater-Rückfrage)
**Arbeits-Setup:** Solo-Builder Lou + Claude als Pair
**Standort:** Hamburg, Deutschland
**Domain/Markenrecht:** Recherche DPMA + EUIPO offen, Domains elbtronika.{de|com|art} gesichert (TBD)

## Compliance-Frameworks
- DSGVO / GDPR (EU)
- ISO/IEC 27001 Prinzipien (Security)
- EU AI Act (für Claude-Kuration: Human-in-the-Loop, XAI, Audit-Log)
- § 356 Abs. 5 BGB (Widerrufsrecht Digitalgüter)

## Finanzströme
- Stripe Connect Standard Accounts (Artists, DJs)
- 60% Künstler / 20% DJ / 20% Plattform
- Plattform-Anteil abzgl. Stripe-Gebühr verbleibt auf Plattform-Saldo
- Refunds: automatische Reverse-Transfers via transfer_group

## Kanäle (geplant)
- Website: elbtronika.art
- E-Mail: hallo@elbtronika.de, rechnung@elbtronika.de (Google Workspace)
- GitHub: github.com/elbtronika
- Social: TBD

## Rollen im System
| Rolle | Hauptaufgabe |
|-------|--------------|
| visitor | Browse ohne Account |
| collector | Käufer — Artwork + Exclusive DJ Set |
| artist | Upload + Stripe-Connect-Onboarding |
| dj | Set-Upload + Stripe-Connect-Onboarding |
| curator | Review in Sanity, Moderation Queue |
| admin | Lou — alle Rechte, manueller Versand, Dispute-Review |

## Externe Partner / Vendors
| Rolle | Vendor | Stand |
|-------|--------|-------|
| Hosting Frontend | Netlify | Account TBD |
| CDN + DNS + Storage | Cloudflare | Account TBD |
| DB + Auth | Supabase (EU Frankfurt) | Account TBD |
| CMS | Sanity v4 | Account TBD |
| Payments | Stripe | KYC TBD |
| AI | Anthropic | Account TBD |
| Monitoring | Sentry | Account TBD |
| Secrets | Doppler | Account TBD |
| Analytics | Plausible oder Matomo | TBD |
| E-Mail-Delivery | Resend oder Postmark | TBD |
| Legal | Fachanwalt IT-Recht | TBD |
| Finanzen | Steuerberater | TBD |
