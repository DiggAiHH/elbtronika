# ADR 0013: Compliance, Security & Privacy by Design (Phase 13)

**Status:** Accepted  
**Date:** 2026-04-29  
**Authors:** Sonnet 4.6 (Phase 13 session)

## Context

ELBTRONIKA processes personal data (profiles, orders, spatial tracking, AI decisions) and must comply with:
- **DSGVO (GDPR)** — Art. 5-35 full checklist
- **EU AI Act** — Transparency for AI curation (Phase 11)
- **ISO/IEC 27001 principles** — Information security management

This ADR documents the compliance architecture decisions.

## Decisions

### 13.1 Consent Management

**Component:** `ConsentBanner` + `useConsentStore` + `/api/consent`

- Explicit opt-in for every category (no pre-ticked boxes)
- Categories: Essential (required), Analytics, Spatial Tracking, Marketing
- Choices persisted in `localStorage` via Zustand
- Every decision logged to `consent_log` table with:
  - `ip_hash` (SHA-256 truncated to 16 chars)
  - `user_agent`
  - `document_version` (for consent versioning)
  - `profile_id` (or anonymous UUID for guests)
- Banner re-openable via footer button at any time

### 13.2 Tracking Minimization

- **Default:** No spatial tracking, no camera path analytics
- **After consent:** Aggregated heatmaps only (no individual paths)
- **IP anonymization:** Last octet removed in all analytics logs

### 13.3 DSGVO Article Checklist

| Article | Implementation | Status |
|---|---|---|
| Art. 5 (Principles) | Documented in Privacy Policy | ✅ |
| Art. 13/14 (Info) | Datenschutzerklärung page (Phase 13b) | 📝 |
| Art. 15 (Auskunft) | `GET /api/account/data` — JSON export | ✅ |
| Art. 17 (Löschung) | `POST /api/account/delete` — cascaded + anonymized | ✅ |
| Art. 20 (Portability) | Same JSON export as Art. 15 | ✅ |
| Art. 25 (PbD) | This architecture = proof | ✅ |
| Art. 32 (TOMs) | `/docs/compliance/toms.md` (Phase 13b) | 📝 |
| Art. 33/34 (Breach) | Incident response plan (Phase 15) | 📝 |
| Art. 35 (DPIA) | Required for spatial tracking + AI | 📝 |

### 13.4 EU AI Act

- AI recommendations show "KI-empfohlen" badge + "Warum?" explanation
- Audit log (`ai_decisions`) records every curatorial output
- Human-in-the-loop: artists approve AI-generated descriptions
- No high-risk categories — recommendation system is informational only

### 13.5 Security Hardening

**Headers (next.config.ts):**
- CSP: default-src 'self', connect-src includes Supabase + Stripe + Anthropic
- HSTS: max-age=63072000, includeSubDomains, preload
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()

**GitHub Actions (`.github/workflows/security.yml`):**
- `pnpm audit` — weekly
- TruffleHog — secret scanning on every PR
- CodeQL — JavaScript/TypeScript analysis
- OWASP Dependency-Check — weekly

### 13.6 Backup & Disaster Recovery

| System | Strategy | Status |
|---|---|---|
| Supabase | Point-in-Time Recovery + daily backup to R2 | 📝 Configured in Supabase dashboard |
| R2 | Versioning + 30-day retention | 📝 Configured in Cloudflare |
| Sanity | Weekly automated export | 📝 Configured in Sanity dashboard |

## Consequences

- **Positive:** Comprehensive compliance foundation before public launch.
- **Positive:** Security scanning automated in CI — regressions caught early.
- **Risk:** `POST /api/account/delete` requires `supabase.auth.admin.deleteUser()` which needs service role key — ensure this route is protected.
- **Risk:** Consent logging for anonymous users uses a zero UUID — may inflate table size. Cleanup job recommended.

## Deferred to Phase 13b / Post-Launch

1. Full Datenschutzerklärung page (legal text)
2. TOMs documentation (`/docs/compliance/toms.md`)
3. Incident Response Plan
4. DPIA formal assessment
5. Manual screenreader tests (VoiceOver + NVDA)
6. External penetration test
