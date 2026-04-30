# ADR 0014: Dependency Alignment & Bundle Budgets

## Status
**Accepted** — 2026-04-29

## Context

Das Monorepo enthielt inkonsistente Dependency-Versionen über Workspace-Packages hinweg:

- `vitest`: v3.0.0 in `apps/web`, `packages/three`, `packages/ui` vs. v4.1.5 in `packages/ai`, `packages/payments`, `packages/audio`
- `@types/react`: ^19.1.0 in `apps/web` vs. 19.2.14 in `packages/three`, `packages/audio`
- `typescript`: ^5.7.3 überall (Stand: 29.04.2026)

Diese Inkonsistenzen führten zu:
- Duplizierten Installationen im pnpm-Store
- Unterschiedlichem Test-Verhalten (Vitest v3 vs. v4 Breaking Changes)
- TypeScript-Compiler-Konflikten bei `@types/react` zwischen R3F-JSX und Next.js

Zusätzlich fehlte eine definierte Bundle-Größen-Strategie für das Next.js-Frontend.

## Decision

### 1. Vitest-Version Angleichung
Alle Packages auf **Vitest v4.1.5** angleichen. Vitest v4 bringt:
- Verbesserte Workspace-Unterstützung (`vitest.workspace.ts`)
- Stabilere Pool-Isolation für parallele Tests
- Bessere Source-Map-Unterstützung für Coverage

### 2. @types/react Angleichung
Alle Packages auf **@types/react ^19.2.14** angleichen. Diese Version ist kompatibel mit:
- React 19.2.x (aktuell im Projekt: 19.1.0–19.2.5)
- R3F 9.6.x JSX-Typen (via `skipLibCheck: true` in `packages/three`)

### 3. TypeScript-Upgrade
Root-DevDependency auf **^5.8.0** angehoben. TypeScript 5.8 bietet:
- `isolatedDeclarations` für schnelleres `tsc --noEmit`
- Verbesserte `moduleResolution: "bundler"` Performance

### 4. Bundle-Budgets
Bundle-Größen-Limits in `apps/web/bundlesize.config.json` definiert:

| Chunk | Limit | Begründung |
|-------|-------|------------|
| `main-*.js` | 200 KB | Core-App-Logik, nicht 3D |
| `pages/_app-*.js` | 150 KB | Shared Layout-Code |
| `framework-*.js` | 50 KB | React-Framework-Chunk |
| `*three*` (Gruppe) | 500 KB | Three.js + R3F ist inhärent groß |

### 5. Next.js Config Optimierungen
- `output: "standalone"` für containerisierte Deployments
- `poweredByHeader: false` für Security
- `compress: true` explizit
- `images.remotePatterns` auf spezifische Sanity-Domains eingeschränkt
- `@next/bundle-analyzer` für Ad-hoc-Analyse integriert

### 6. TypeScript Include-Pfade bereinigt
`apps/web/tsconfig.json` enthielt direkte Includes auf `../../packages/three/src/**/*.ts`. Entfernt — Workspace-Packages werden über `paths` Mapping aufgelöst.

## Consequences

### Positive
- Einheitliche Test-Infrastruktur über alle Packages
- Keine doppelten Vitest-Installationen mehr
- Klar definierte Bundle-Limits für CI-Regression-Checks
- Verbesserte Security durch explizite Header-Konfiguration

### Negative
- TypeScript 5.8 könnte neue strikte Checks einführen, die bestehende Phase-6-WIP-Dateien betreffen (diese werden jedoch nicht von diesem Scope berührt)
- Bundle-Budgets erfordern Monitoring in CI

## References
- [Vitest v4 Migration Guide](https://vitest.dev/guide/migration.html#vitest-4)
- [TypeScript 5.8 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8/)
- [Next.js standalone output](https://nextjs.org/docs/pages/api-reference/config/next-config-js/output)
