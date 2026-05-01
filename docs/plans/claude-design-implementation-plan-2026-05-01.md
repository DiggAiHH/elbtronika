# Claude Design Implementation Plan - 2026-05-01

## Objective

Translate the Claude design direction into production-safe increments in apps/web.

## Systematic Plan

### Phase 1 - Landing Hero and Trust Slice

Files:
- apps/web/app/[locale]/page.tsx
- apps/web/app/globals.css

Actions:
1. Introduce editorial hero layout with restrained atmosphere.
2. Add trust split block (60/20/20) below hero copy and CTA.
3. Add utility classes for trust cards and atmospheric background where needed.
4. Preserve CTA labels and links to avoid behavior regressions.

Verification:
1. Playwright Chromium smoke test.
2. Type/lint spot checks for changed files.

### Phase 2 - Commerce Surface Alignment

Files (next pass):
- apps/web/app/[locale]/shop/page.tsx
- apps/web/app/[locale]/shop/components/*
- apps/web/app/[locale]/shop/artwork/[slug]/*

Actions:
1. Bring card metadata parity (artist + DJ visual balance).
2. Add trust split mini-component to artwork detail purchase section.
3. Normalize commerce typography and spacing rhythm.

Verification:
1. Existing shop e2e tests + route smoke.

### Phase 3 - Gallery Entry and Press/Investor Trust

Files (next pass):
- apps/web/app/[locale]/gallery/*
- apps/web/app/[locale]/press/page.tsx
- apps/web/app/[locale]/pitch/page.tsx

Actions:
1. Align gallery entry visual language with landing hero tone.
2. Standardize trust and roadmap messaging blocks for press/investor.

Verification:
1. Route-level smoke for /gallery, /press, /pitch.

## Execution Notes

1. Keep each phase independently shippable.
2. Avoid replacing broad layout architecture in one commit.
3. Prefer additive utility classes over sweeping style rewrites.
4. Maintain i18n compatibility and reduced-motion behavior.
