# ADR 0002 – Design System Architecture

**Status:** Accepted  
**Date:** 2026-04-25  
**Deciders:** Lou (Solo-Builder)  
**Phase:** 2 – Design System & Core UI

---

## Context

ELBTRONIKA needs a shared UI component library that:
- Serves both the Next.js 15 App Router (`apps/web`) and future micro-frontends
- Supports a club/gallery aesthetic: near-black background, neon accents (Cyan `#00f5d4`, Magenta `#f720b8`, Violet `#7b2fff`)
- Meets WCAG 2.1 AA accessibility requirements
- Enables Storybook-driven development with visual regression and a11y automation
- Keeps bundle size minimal for the immersive 3D experience

## Decision

### 1. Tailwind v4 with CSS Custom Properties (`@theme {}`)

No `tailwind.config.js`. All tokens live in `packages/ui/src/styles.css` and `apps/web/app/globals.css` as CSS custom properties. Benefits:
- Zero JS config overhead
- Native CSS cascade — tokens accessible to Three.js shaders and WebGPU pipelines
- Single source of truth across `@theme {}` blocks

### 2. Radix UI Primitives + CVA

Headless Radix primitives (`@radix-ui/react-*`) composed with `class-variance-authority` + `clsx` + `tailwind-merge`. Benefits:
- Accessible by default (ARIA, keyboard, focus management)
- No opinion on styling — ELBTRONIKA tokens applied via CSS vars
- Tree-shakeable

### 3. `packages/ui` as workspace package

All components in `@elbtronika/ui` (private workspace package). Exported as TypeScript source (`"exports": { ".": "./src/index.ts" }`), consumed by `apps/web` directly. No build step needed during development.

### 4. Storybook 10 + @storybook/react-vite + @storybook/addon-a11y

Storybook 10 with Vite 8 as the bundler inside `packages/ui`. axe-core runs on every story via `@storybook/addon-a11y`. WCAG 2.1 AA is part of the Definition of Done.

### 5. pnpm override: `vite@^8.0.0`

Single vite version enforced across the monorepo via `pnpm.overrides` in root `package.json`. Eliminates plugin type conflicts between rolldown (vite 8) and rollup (vite 7).

---

## Components Delivered (Phase 2)

| Category | Components |
|----------|-----------|
| Form Controls | Button (5 variants + loading), Input, Textarea, Select, Checkbox, Slider (single + range) |
| Overlay & Feedback | Dialog, Toast, Skeleton (box/text/circle) |
| Typography | Heading (h1–h6), Text (5 sizes × 3 weights), Caption, Numeric |
| Layout | Container (5 sizes), Stack, Grid (responsive), Spacer |

---

## Consequences

**Positive:**
- WCAG 2.1 AA verified per component via axe-core in CI
- Zero runtime token overhead — CSS vars resolve natively
- Design tokens reusable in Three.js shaders via `getComputedStyle`
- Storybook deployable to Netlify Preview per PR

**Negative / Trade-offs:**
- Tailwind v4 `@theme {}` syntax is newer — fewer community examples
- No Figma file yet; tokens built from plan specs (to be synced in Phase 3 via Figma MCP)
- `packages/ui` has no build output (`.js` dist) — consumers must handle TypeScript transpilation

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|-----------------|
| shadcn/ui copy-paste | Would duplicate code into `apps/web`; no shared package |
| MUI / Chakra | Heavy runtime, CSS-in-JS conflicts with Tailwind v4 |
| Tailwind v3 with `tailwind.config.js` | No CSS-native tokens; can't pass vars to WebGPU shaders |
| Storybook 8 | Incompatible `@storybook/test` peer deps with storybook@10 |
