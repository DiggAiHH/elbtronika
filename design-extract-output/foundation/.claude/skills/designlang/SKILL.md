---
name: designlang-tokens
description: Use when styling UI for foundation.app — references the extracted design system tokens instead of inventing colors, spacing, or typography.
---

# designlang tokens
Source: https://foundation.app
Extracted by designlang v7.0.0 on 2026-04-25T17:55:25.449Z

## Semantic tokens (use these)
- color.action.primary: #0f863e
- color.surface.default: #000000
- color.text.body: #000000
- radius.control: 4px
- typography.body.fontFamily: Suisse

## Regions
- content
- footer

## How to use
- Prefer `semantic.*` tokens over `primitive.*`.
- Never invent new tokens or hex values; reuse the ones above.
- When a value is missing, pick the closest existing semantic token and flag the gap.
- Reference tokens by their dotted path (e.g. `semantic.color.action.primary`).
