# ADR-0010: Content Security Policy (CSP) Strategie

## Status
Accepted

## Context
ELBTRONIKA verarbeitet sensible Daten (Zahlungen, KI-Interaktionen, Nutzerprofile). Eine robuste CSP ist zwingend erforderlich, um XSS und Injection-Angriffe zu verhindern.

## Decision
CSP wird in `next.config.ts` als Header konfiguriert (nicht als Meta-Tag), um:
1. Frame-Options (`DENY`) zu erzwingen
2. Stripe-Checkout (`frame-src`) zu erlauben
3. Sanity-CDN und R2 (`img-src`, `media-src`) zu erlauben
4. `unsafe-inline` für Styles zu erlauben (Tailwind v4 erfordert dies)

## Consequences
- ✅ Schutz vor XSS, Clickjacking, Injection
- ✅ Stripe-Integration funktioniert
- ⚠️ `style-src 'unsafe-inline'` notwendig für Tailwind

## Compliance
- OWASP Top 10 2025: A03 (Injection)
- DSGVO Art. 32 (Technische Sicherheit)
