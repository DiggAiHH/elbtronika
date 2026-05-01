# Claude Design Handoff - 2026-05-01

## Source

- Claude Design project: ELBTRONIKA Immersive Art Commerce v1
- Project URL: https://claude.ai/design/p/019de41f-8fc7-7d14-98b1-96c7dbb9168f
- Captured output structure: A-G (creative direction, tokens, screens, components, interactions, copy, build checklist)

## A) Creative Direction Summary (Condensed)

1. Sonic futurism + gallery minimalism, with strict restraint.
2. Nocturnal editorial atmosphere, near-black base.
3. Typography split by role: editorial display, sans UI scaffold, mono metadata.
4. Accent discipline: amber primary, teal secondary, red for unavailable/error.
5. Artist and DJ metadata treated as equal, first-class entities.
6. 60/20/20 trust split visible in commerce contexts.
7. Mode switch is product philosophy (Classic vs Immersive), not cosmetic toggle.
8. Motion is controlled and purposeful; reduced-motion behavior is explicit.
9. Infrastructure aesthetic: thin borders, layout rhythm, data-first clarity.
10. Premium, culturally credible tone; no startup-template visual language.

## B) Token Direction (Mapped)

### Color direction

- Ground: #050507
- Surface: #0E0E12 / #16161C
- Text primary: #F2EDE4
- Text secondary: #9A9590
- Accent amber: #E8A020
- Accent teal: #2AADA8
- Error red: #E05040

### Type direction

- Display: DM Serif Display
- Body/UI: Space Grotesk
- Mono/meta: JetBrains Mono

### Motion direction

- Primary easing: cubic-bezier(0.16, 1, 0.3, 1)
- Micro interactions: 150-300ms
- Section/hero reveals: 600-800ms

## C) Screen Coverage Requested by Claude Prompt

1. /en landing
2. /en/shop index
3. /en/shop/artwork/[slug] detail
4. /en/gallery entry
5. Press/investor trust section excerpt

## D) Current Repo Mapping

- Landing implementation: apps/web/app/[locale]/page.tsx
- Global tokens and utility classes: apps/web/app/globals.css
- Existing ADR context: docs/adr/0019-pitch-architecture.md
- Existing i18n keys: apps/web/messages/en.json and apps/web/messages/de.json

## E) First Production Slice (This Pass)

Scope for immediate implementation in current pass:

1. Refactor landing hero toward editorial/nocturnal direction.
2. Add explicit trust split panel (60/20/20) near hero.
3. Keep existing route and navigation logic unchanged.
4. Keep changes localized to page + global style tokens/utilities.

## F) Constraints and Risk Controls

1. Minimize blast radius: do not re-architect full page in one pass.
2. Preserve test anchors where possible (hero copy, CTA labels, sound toggle presence).
3. Keep reduced-motion support intact.
4. Verify with Chromium smoke test plus targeted checks.

## G) Build Handoff Checklist

1. New hero and trust split render in /[locale].
2. CTA paths remain /gallery and /shop.
3. Sound toggle remains present and functional.
4. Existing smoke tests still discoverable/executable.
5. Follow-up slices planned for shop/detail/gallery pages.
