# ADR 0017: Mode Toggle Accessibility & Motion Preferences

## Status
**Accepted** — 2026-04-29

## Context

Phase 9 (Mode Transitions) hatte keine Accessibility-Funktionen:
- Screen-Reader erhielten keine Information über den aktuellen Modus
- Keine `aria-pressed` für den Toggle-Button
- 1200ms Transition ohne `prefers-reduced-motion` Check
- Keine Tastatur-Shortcuts

## Decision

### 1. ARIA-Attribute
- `aria-pressed={!isClassic}` auf Toggle-Button
- `aria-live="polite"` Region für Transition-Status-Ankündigungen
- `aria-label` bleibt bestehen (bereits implementiert)

### 2. Motion Preferences
- `prefers-reduced-motion: reduce` → CSS-Transition auf `none`
- Sofortiger Modus-Wechsel statt 1200ms Fade

### 3. Tastatur-Shortcuts
- `Escape` → Wechsel zu Classic/Shop-Modus
- `Space` (wenn `document.body` fokussiert) → Modus-Toggle

### 4. Performance
- `ModeToggle` mit `React.memo` wrappen
- `handleToggle` mit `useCallback` stabilisieren
- Inline-Style-Objekt mit `useMemo` cachen

## Consequences

### Positive
- WCAG 2.1 Level AA Konformität (Criterion 2.2.2)
- Bessere Screen-Reader-Erfahrung
- Tastatur-Navigation verbessert

### Negative
- Keine nennenswerten Negativen
