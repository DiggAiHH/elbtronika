# Design Language: Foundation

> Extracted from `https://foundation.app` on April 25, 2026
> 696 elements analyzed

This document describes the complete design language of the website. It is structured for AI/LLM consumption — use it to faithfully recreate the visual design in any framework.

## Color Palette

### Primary Colors

| Role | Hex | RGB | HSL | Usage Count |
|------|-----|-----|-----|-------------|
| Primary | `#0f863e` | rgb(15, 134, 62) | hsl(144, 80%, 29%) | 28 |
| Secondary | `#c6248b` | rgb(198, 36, 139) | hsl(322, 69%, 46%) | 2 |

### Neutral Colors

| Hex | HSL | Usage Count |
|-----|-----|-------------|
| `#000000` | hsl(0, 0%, 0%) | 1269 |
| `#ffffff` | hsl(0, 0%, 100%) | 112 |
| `#f2f2f2` | hsl(0, 0%, 95%) | 19 |
| `#2a2a2a` | hsl(0, 0%, 16%) | 2 |
| `#1a1a1a` | hsl(0, 0%, 10%) | 1 |

### Background Colors

Used on large-area elements: `#000000`, `#f2f2f2`, `#1a1a1a`

### Text Colors

Text color palette: `#000000`, `#ffffff`, `#0f863e`, `#c6248b`

### Gradients

```css
background-image: linear-gradient(135deg, rgb(237, 83, 86), rgb(249, 214, 73));
```

### Full Color Inventory

| Hex | Contexts | Count |
|-----|----------|-------|
| `#000000` | text, border, background | 1269 |
| `#ffffff` | text, border, background | 112 |
| `#0f863e` | text, border | 28 |
| `#f2f2f2` | background | 19 |
| `#c6248b` | text, border | 2 |
| `#2a2a2a` | border | 2 |
| `#1a1a1a` | background | 1 |

## Typography

### Font Families

- **Suisse** — used for all (590 elements)
- **Times New Roman** — used for body (105 elements)
- **SuisseMono** — used for body (1 elements)

### Type Scale

| Size (px) | Size (rem) | Weight | Line Height | Letter Spacing | Used On |
|-----------|------------|--------|-------------|----------------|---------|
| 40px | 2.5rem | 500 | 44px | -0.8px | a |
| 32px | 2rem | 500 | 32px | -0.64px | div, span |
| 26px | 1.625rem | 500 | normal | normal | div |
| 24px | 1.5rem | 500 | normal | -0.24px | h2, div |
| 20px | 1.25rem | 500 | normal | normal | h2 |
| 16px | 1rem | 400 | normal | normal | html, head, meta, style |
| 14px | 0.875rem | 500 | normal | normal | a, button, input, svg |
| 13px | 0.8125rem | 400 | 16.25px | normal | span |
| 12px | 0.75rem | 400 | normal | normal | div, span, a |

### Heading Scale

```css
h2 { font-size: 24px; font-weight: 500; line-height: normal; }
h2 { font-size: 20px; font-weight: 500; line-height: normal; }
h2 { font-size: 16px; font-weight: 400; line-height: normal; }
h3 { font-size: 14px; font-weight: 500; line-height: normal; }
```

### Body Text

```css
body { font-size: 16px; font-weight: 400; line-height: normal; }
```

### Font Weights in Use

`400` (611x), `500` (71x), `600` (14x)

## Spacing

| Token | Value | Rem |
|-------|-------|-----|
| spacing-1 | 1px | 0.0625rem |
| spacing-32 | 32px | 2rem |
| spacing-40 | 40px | 2.5rem |
| spacing-48 | 48px | 3rem |
| spacing-61 | 61px | 3.8125rem |
| spacing-120 | 120px | 7.5rem |
| spacing-419 | 419px | 26.1875rem |

## Border Radii

| Label | Value | Count |
|-------|-------|-------|
| sm | 4px | 21 |
| lg | 12px | 2 |
| full | 50px | 2 |
| full | 9999px | 25 |

## Box Shadows

**sm** — blur: 0px
```css
box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 1px;
```

**sm (inset)** — blur: 0px
```css
box-shadow: rgba(0, 0, 0, 0.05) 0px 0px 0px 1px inset;
```

## CSS Custom Properties

### Colors

```css
--privy-color-background: #FFFFFF;
--privy-color-background-2: #F1F2F9;
--privy-color-background-3: #5B4FFF;
--privy-color-foreground: #040217;
--privy-color-foreground-2: #64668B;
--privy-color-foreground-3: #9498B8;
--privy-color-foreground-4: #E2E3F0;
--privy-color-foreground-accent: hsl(0, 0%, 97%);
--privy-color-accent: hsl(244, 100%, 65%);
--privy-color-accent-light: hsl(244, 100%, 65%);
--privy-color-accent-hover: hsl(243, 75%, 59%);
--privy-color-accent-dark: hsl(245, 58%, 51%);
--privy-color-accent-darkest: hsl(233, 40%, 96%);
--privy-color-success: #DCFCE7;
--privy-color-success-dark: #135638;
--privy-color-success-light: #DCFCE7;
--privy-color-success-bg: #DCFCE7;
--privy-color-error: #991B1B;
--privy-color-error-light: #FEE2E2;
--privy-color-error-bg: #FEE2E2;
--privy-color-error-bg-hover: #FECACA;
--privy-color-warn: #FEF3C7;
--privy-color-warn-light: #FEF3C7;
--privy-color-warn-bg: #FEF3C7;
--privy-color-warning-dark: #906218;
--privy-color-error-dark: #991B1B;
--privy-color-info-bg: #E0E7FF;
--privy-color-info-bg-hover: #EEF2FF;
--privy-color-border-default: #E2E3F0;
--privy-color-border-hover: #E2E3F0;
--privy-color-border-focus: #949DF9;
--privy-color-border-error: #F69393;
--privy-color-border-success: #87D7B7;
--privy-color-border-warning: #FACD63;
--privy-color-border-info: #F1F2F9;
--privy-color-border-interactive: #5B4FFF;
--privy-color-border-interactive-hover: #5B4FFF;
--privy-color-background-hover: #F8F9FC;
--privy-color-background-clicked: #F1F2F9;
--privy-color-background-disabled: #FFFFFF;
--privy-color-background-interactive: #5B4FFF;
--privy-color-background-interactive-hover: #4F46E5;
--privy-color-background-interactive-clicked: #4338CA;
--privy-color-background-interactive-disabled: #F1F2F9;
--privy-color-foreground-hover: #040217;
--privy-color-foreground-clicked: #040217;
--privy-color-foreground-disabled: #CBCDE1;
--privy-color-foreground-interactive: #5B4FFF;
--privy-color-foreground-interactive-hover: #5B4FFF;
--privy-link-navigation-color: hsl(244, 100%, 65%);
--privy-accent-has-good-contrast: 1;
--privy-color-icon-default: #110F2A;
--privy-color-icon-muted: #64668B;
--privy-color-icon-subtle: #9498B8;
--privy-color-icon-inverse: #FFFFFF;
--privy-color-icon-success: #33B287;
--privy-color-icon-warning: #F59E0B;
--privy-color-icon-error: #EF4444;
--privy-color-icon-interactive: #564FFF;
--privy-color-icon-default-hover: #1D1B35;
--privy-color-icon-muted-hover: #64668B;
--privy-color-icon-subtle-hover: #888AAE;
--privy-color-icon-default-clicked: #060C23;
--privy-color-icon-muted-clicked: #64668B;
--privy-color-icon-subtle-clicked: #788804;
--privy-color-icon-default-disabled: #CBCDE1;
--privy-color-icon-muted-disabled: #CBCDE1;
--privy-color-icon-subtle-disabled: #CBCDE1;
--privy-color-icon-error-hover: #F06060;
--privy-color-icon-interactive-hover: #4F46E5;
--privy-color-icon-error-clicked: #DC3838;
--privy-color-icon-interactive-clicked: #2BA482;
--privy-color-icon-muted-disabled-alt: #CBCDE1;
--privy-color-icon-subtle-disabled-alt: #CBCDE1;
--privy-border-radius-xs: 6px;
--privy-border-radius-sm: 8px;
--privy-border-radius-md: 12px;
--privy-border-radius-mdlg: 16px;
--privy-border-radius-lg: 24px;
--privy-border-radius-full: 9999px;
--st--colors-white1: rgba(255, 255, 255, 0.01);
--st--colors-blue1: #D7F3FE;
--st--colors-purple1: #E5D2FE;
--st--colors-editionsForeground: #CBA1FC;
--st--colors-pink2: #F698D5;
--st--colors-black30: rgba(0, 0, 0, 0.3);
--st--colors-orange6: #211002;
--st--colors-black25: rgba(0, 0, 0, 0.25);
--st--colors-lime0: #FAFFDE;
--st--colors-black45: rgba(0, 0, 0, 0.45);
--st--colors-black90: rgba(0, 0, 0, 0.9);
--st--colors-blue6: #020A1D;
--st--colors-pink1: #FBCBEA;
--st--colors-green0: #F0FFE9;
--st--colors-black20: rgba(0, 0, 0, 0.2);
--st--colors-black0: rgba(0, 0, 0, 0);
--st--colors-white3: rgba(255, 255, 255, 0.03);
--st--colors-black100: rgba(0, 0, 0, 1);
--st--colors-yellow4: #FECE0A;
--st--colors-yellow1: #FFFAC2;
--st--colors-available: #0F863E;
--st--colors-editionsBackground: #120128;
--st--colors-green2: #B8FF93;
--st--colors-blue0: #F1FBFF;
--st--colors-yellow2: #FFF97F;
--st--colors-white10: rgba(255, 255, 255, 0.1);
--st--colors-blue4: #0657FA;
--st--colors-overlay: rgba(0, 0, 0, 0.54);
--st--colors-orange4: #F87225;
--st--colors-green1: #E1FFD1;
--st--colors-orange5: #733507;
--st--colors-pink0: #FFF1FA;
--st--colors-lime6: #112207;
--st--colors-purple5: #3C0480;
--st--colors-white50: rgba(255, 255, 255, 0.5);
--st--colors-white45: rgba(255, 255, 255, 0.45);
--st--colors-white100: rgba(255, 255, 255, 1);
--st--colors-lime2: #EDFF7F;
--st--colors-purple2: #CBA1FC;
--st--colors-black5: rgba(0, 0, 0, 0.05);
--st--colors-white20: rgba(255, 255, 255, 0.2);
--st--colors-unavailable: #C6248B;
--st--colors-red5: #7B0000;
--st--colors-pink3: #FF52BF;
--st--colors-black10: rgba(0, 0, 0, 0.1);
--st--colors-white40: rgba(255, 255, 255, 0.4);
--progress-color: #000;
--st--colors-white60: rgba(255, 255, 255, 0.6);
--st--colors-green4: #23AE00;
--st--colors-white25: rgba(255, 255, 255, 0.25);
--st--colors-white30: rgba(255, 255, 255, 0.3);
--tiptap-placeholder-color: rgba(0, 0, 0, 0.4);
--st--colors-white4: rgba(255, 255, 255, 0.04);
--st--colors-red6: #240000;
--st--colors-lime5: #4D5E0A;
--st--colors-white2: rgba(255, 255, 255, 0.02);
--st--colors-black15: rgba(0, 0, 0, 0.15);
--st--colors-red1: #FFC7C7;
--st--colors-live: #7001E1;
--st--colors-white70: rgba(255, 255, 255, 0.7);
--st--colors-red2: #FF918F;
--st--colors-white5: rgba(255, 255, 255, 0.05);
--st--colors-yellow5: #735D17;
--st--colors-blue5: #022669;
--st--colors-black50: rgba(0, 0, 0, 0.5);
--st--colors-black40: rgba(0, 0, 0, 0.4);
--st--colors-yellow3: #FFEB3D;
--st--colors-blue3: #15A8FF;
--st--colors-upcoming: #81754E;
--st--colors-purple6: #120128;
--st--colors-lime4: #ADD800;
--st--colors-black70: rgba(0, 0, 0, 0.7);
--st--colors-green3: #7FFF4D;
--st--colors-orange1: #FBE7C1;
--st--colors-green5: #106E03;
--st--colors-lime1: #F6FFC2;
--st--colors-red0: #FFEEEE;
--st--colors-white35: rgba(255, 255, 255, 0.35);
--st--colors-green6: #041E01;
--st--colors-blue2: #90DAF9;
--st--colors-white90: rgba(255, 255, 255, 0.9);
--st--colors-black3: rgba(0, 0, 0, 0.03);
--st--colors-white0: rgba(255, 255, 255, 0);
--st--colors-purple4: #7001E1;
--st--colors-black1: rgba(0, 0, 0, 0.01);
--st--colors-orange0: #FFF1E3;
--st--colors-black80: rgba(0, 0, 0, 0.8);
--st--colors-black4: rgba(0, 0, 0, 0.04);
--st--colors-black35: rgba(0, 0, 0, 0.35);
--st--colors-black90-solid: #1A1A1A;
--st--colors-black60: rgba(0, 0, 0, 0.6);
--st--colors-orange3: #FF9632;
--st--colors-purple3: #9547F6;
--st--colors-yellow6: #221C07;
--st--colors-purple0: #F9F4FF;
--st--colors-orange2: #FFC58E;
--st--colors-adminOnlyStrong: #C6248B;
--st--colors-yellow0: #FFFCE0;
--st--colors-pink5: #710B4B;
--st--colors-black5-solid: #F2F2F2;
--st--colors-white15: rgba(255, 255, 255, 0.15);
--st--colors-white80: rgba(255, 255, 255, 0.8);
--st--colors-adminOnlyLight: #FFF1FA;
--body-bg-color: transparent;
--st--colors-lime3: #DBFF00;
--st--colors-red4: #DA2020;
--st--colors-pink6: #200217;
--st--colors-red3: #FF5147;
--st--colors-black10-solid: #E6E6E6;
--st--colors-black2: rgba(0, 0, 0, 0.02);
--st--colors-pink4: #C6248B;
--toggle-track-bg: #e6e6e6;
```

### Spacing

```css
--st--fontSizes-4: 24px;
--st--fontSizes-2: 16px;
--st--fontSizes-1: 14px;
--st--sizes-avatar3: 32px;
--st--letterSpacings-mono: 0.0725em;
--st--space-8: 48px;
--st--space-11: 128px;
--st--sizes-formElement0: 36px;
--st--fontSizes-mono1: 13px;
--st--sizes-formElement1: 48px;
--st--space-0: 0px;
--st--fontSizes-5: 32px;
--st--fontSizes-3: 20px;
--st--fontSizes-10: 88px;
--st--sizes-avatar4: 40px;
--st--sizes-avatar8: 96px;
--st--space-1: 4px;
--st--space-5: 20px;
--st--sizes-container: 2000px;
--st--letterSpacings-0: 0em;
--st--space-2: 8px;
--st--sizes-searchInput: 500px;
--st--fontSizes-mono5: 30px;
--st--sizes-avatar1: 20px;
--st--letterSpacings--1: -0.01em;
--st--sizes-icon4: 32px;
--st--fontSizes-mono6: 38px;
--st--fontSizes-mono2: 15px;
--st--sizes-avatar7: 72px;
--st--sizes-formElement2: 60px;
--st--sizes-avatar6: 64px;
--st--fontSizes-mono7: 52px;
--st--space-9: 64px;
--st--fontSizes-0: 12px;
--st--sizes-avatar5: 48px;
--st--sizes-avatar0: 16px;
--st--space-3: 12px;
--st--letterSpacings--3: -0.025em;
--st--space-10: 96px;
--st--space-7: 32px;
--st--sizes-avatar2: 24px;
--st--fontSizes-mono4: 23px;
--st--space-6: 24px;
--st--letterSpacings-2: 0.02em;
--st--sizes-icon0: 12px;
--st--fontSizes-mono3: 19px;
--st--space-4: 16px;
--st--sizes-icon3: 24px;
--st--letterSpacings-3: 0.025em;
--st--fontSizes-7: 56px;
--st--letterSpacings-1: 0.01em;
--st--fontSizes-mono0: 11px;
--st--letterSpacings--2: -0.02em;
--st--sizes-icon1: 16px;
--st--sizes-avatar9: 128px;
--st--fontSizes-8: 64px;
--st--fontSizes-6: 40px;
--st--fontSizes-9: 76px;
--st--sizes-icon2: 18px;
```

### Typography

```css
--st--fontWeights-semibold: 600;
--st--fonts-body: "Suisse", "Suisse Fallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
--st--fonts-mono: "SuisseMono", Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier, monospace;
--st--fontWeights-regular: 400;
--st--fontWeights-medium: 500;
```

### Shadows

```css
--st--shadows-soft0: 0px 0px 4px rgba(0, 0, 0, 0.02), 0px 8px 16px rgba(0, 0, 0, 0.02), 0px 16px 32px rgba(0, 0, 0, 0.04);
--st--shadows-regular1: 0px 0px 2px rgba(0, 0, 0, 0.15), 0px 4px 7px rgba(0, 0, 0, 0.05), 0px 12px 40px rgba(0, 0, 0, 0.1);
--st--shadows-soft1: 0px 0px 4px rgba(0, 0, 0, 0.02), 0px 10px 16px rgba(0, 0, 0, 0.03), 0px 18px 32px rgba(0, 0, 0, 0.05);
--st--shadows-regular2: 0px 0px 2px rgba(0, 0, 0, 0.15), 0px 4px 7px rgba(0, 0, 0, 0.07), 0px 12px 40px rgba(0, 0, 0, 0.15);
--st--shadows-regular0: 0px 0px 2px rgba(0, 0, 0, 0.15), 0px 2px 5px rgba(0, 0, 0, 0.05), 0px 8px 40px rgba(0, 0, 0, 0.04);
--st--shadows-soft2: 0px 0px 4px rgba(0, 0, 0, 0.02), 0px 12px 16px rgba(0, 0, 0, 0.04), 0px 20px 32px rgba(0, 0, 0, 0.08);
```

### Other

```css
--privy-link-navigation-decoration: none;
--privy-height-modal-full: 620px;
--privy-height-modal-compact: 480px;
--st--radii-round: 9999px;
--st--lineHeights-formElement1: 48px;
--st--radii-2: 8px;
--st--lineHeights-formElement2: 60px;
--toggle-track-hover: #ccc;
--st--transitions-3: 1000ms;
--st--radii-3: 12px;
--st--transitions-2: 500ms;
--st--radii-0: 0px;
--toggle-track-checked: #000;
--st--lineHeights-0: 1;
--st--radii-4: 16px;
--st--radii-5: 24px;
--st--lineHeights-2: 1.5;
--st--transitions-ease: cubic-bezier(0.23, 1, 0.32, 1);
--st--radii-1: 4px;
--st--transitions-expo: cubic-bezier(0.19, 1, 0.22, 1);
--st--lineHeights-3: 1.75;
--st--lineHeights-formElement0: 36px;
--st--transitions-1: 300ms;
--st--transitions-0: 100ms;
--st--lineHeights-1: 1.25;
```

### Semantic

```css
success: [object Object];
warning: [object Object];
error: [object Object];
info: [object Object];
```

## Breakpoints

| Name | Value | Type |
|------|-------|------|
| sm | 639px | max-width |

## Transitions & Animations

**Easing functions:** `[object Object]`

**Durations:** `0.5s`, `0.3s`, `0.1s`, `0.6s`, `1s`

### Common Transitions

```css
transition: all;
transition: background-color 0.5s cubic-bezier(0.23, 1, 0.32, 1);
transition: opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1);
transition: background-color 0.3s cubic-bezier(0.23, 1, 0.32, 1), border 0.3s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.3s cubic-bezier(0.23, 1, 0.32, 1), color 0.3s cubic-bezier(0.23, 1, 0.32, 1), outline 0.3s cubic-bezier(0.23, 1, 0.32, 1), transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
transition: box-shadow 0.3s;
transition: color 0.1s cubic-bezier(0.23, 1, 0.32, 1);
transition: opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1);
transition: background-color 0.3s cubic-bezier(0.23, 1, 0.32, 1);
transition: color 0.3s cubic-bezier(0.23, 1, 0.32, 1), background-color 0.3s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1), outline 0.3s cubic-bezier(0.23, 1, 0.32, 1), transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
```

### Keyframe Animations

**nprogress-spinner**
```css
@keyframes nprogress-spinner {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(1turn); }
}
```

## Component Patterns

Detected UI component patterns and their most common styles:

### Buttons (7 instances)

```css
.button {
  background-color: rgb(0, 0, 0);
  color: rgb(0, 0, 0);
  font-size: 14px;
  font-weight: 500;
  padding-top: 0px;
  padding-right: 16px;
  border-radius: 9999px;
}
```

### Cards (3 instances)

```css
.card {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 0px 0px 1px inset;
  padding-top: 0px;
  padding-right: 0px;
}
```

### Inputs (1 instances)

```css
.input {
  background-color: rgba(0, 0, 0, 0.05);
  color: rgb(0, 0, 0);
  border-color: rgb(0, 0, 0);
  border-radius: 9999px;
  font-size: 14px;
  padding-top: 1px;
  padding-right: 32px;
}
```

### Links (42 instances)

```css
.link {
  color: rgb(0, 0, 0);
  font-size: 16px;
  font-weight: 400;
}
```

### Footer (1 instances)

```css
.foote {
  background-color: rgb(26, 26, 26);
  color: rgb(255, 255, 255);
  padding-top: 0px;
  padding-bottom: 0px;
  font-size: 16px;
}
```

### Modals (2 instances)

```css
.modal {
  background-color: rgb(0, 0, 0);
  border-radius: 4px;
  padding-top: 0px;
  padding-right: 0px;
}
```

## Component Clusters

Reusable component instances grouped by DOM structure and style similarity:

### Button — 3 instances, 1 variant

**Variant 1** (3 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgba(0, 0, 0, 0.7);
  padding: 0px 32px 0px 16px;
  border-radius: 9999px;
  border: 1px solid rgba(0, 0, 0, 0);
  font-size: 14px;
  font-weight: 500;
```

### Button — 2 instances, 1 variant

**Variant 1** (2 instances)

```css
  background: rgba(0, 0, 0, 0.05);
  color: rgb(0, 0, 0);
  padding: 0px 16px 0px 16px;
  border-radius: 9999px;
  border: 1px solid rgba(0, 0, 0, 0);
  font-size: 14px;
  font-weight: 500;
```

## Layout System

**4 grid containers** and **164 flex containers** detected.

### Container Widths

| Max Width | Padding |
|-----------|---------|
| 2000px | 48px |
| 100% | 0px |
| 1000px | 20px |

### Grid Column Patterns

| Columns | Usage Count |
|---------|-------------|
| 2-column | 3x |
| 4-column | 1x |

### Grid Templates

```css
grid-template-columns: 278px 278px 278px 278px;
gap: 48px 24px;
grid-template-columns: 768px 384px;
gap: 32px;
grid-template-columns: 584px 584px;
gap: 16px;
grid-template-columns: 580px 580px;
gap: 48px 24px;
```

### Flex Patterns

| Direction/Wrap | Count |
|----------------|-------|
| column/nowrap | 49x |
| row/nowrap | 113x |
| row-reverse/nowrap | 2x |

**Gap values:** `12px`, `16px`, `20px`, `32px`, `48px 24px`, `6px`, `8px`

## Responsive Design

### Viewport Snapshots

| Viewport | Body Font | Nav Visible | Max Columns | Hamburger | Page Height |
|----------|-----------|-------------|-------------|-----------|-------------|
| mobile (375px) | 16px | No | 1 | No | 11959px |
| tablet (768px) | 16px | No | 2 | No | 7593px |
| desktop (1280px) | 16px | No | 4 | No | 4715px |
| wide (1920px) | 16px | No | 4 | No | 5824px |

### Breakpoint Changes

**375px → 768px** (mobile → tablet):
- Max grid columns: `1` → `2`
- Page height: `11959px` → `7593px`

**768px → 1280px** (tablet → desktop):
- Max grid columns: `2` → `4`
- Page height: `7593px` → `4715px`

**1280px → 1920px** (desktop → wide):
- Page height: `4715px` → `5824px`

## Interaction States

### Button States

**"Trending"**
```css
/* Hover */
color: rgba(0, 0, 0, 0.7) → rgba(0, 0, 0, 1);
background-color: rgba(0, 0, 0, 0) → rgba(0, 0, 0, 0.05);
outline: rgba(0, 0, 0, 0.7) none 3px → rgba(0, 0, 0, 1) none 3px;
```
```css
/* Focus */
color: rgba(0, 0, 0, 0.7) → rgb(0, 0, 0);
background-color: rgba(0, 0, 0, 0) → rgba(0, 0, 0, 0.05);
border-color: rgba(0, 0, 0, 0) → rgba(0, 0, 0, 0.945);
outline: rgba(0, 0, 0, 0.7) none 3px → rgba(0, 0, 0, 0.337) solid 3px;
```

**"Place bid"**
```css
/* Hover */
box-shadow: none → rgba(0, 0, 0, 0.14) 0px 0px 1.89373px 0px, rgba(0, 0, 0, 0.047) 0px 3.78745px 6.62804px 0px, rgba(0, 0, 0, 0.098) 0px 11.3624px 37.8745px 0px;
transform: none → matrix(1, 0, 0, 1, 0, -0.946869);
```
```css
/* Focus */
border-color: rgba(0, 0, 0, 0) → rgba(255, 255, 255, 0.98);
box-shadow: none → rgba(0, 0, 0, 0.15) 0px 0px 2px 0px, rgba(0, 0, 0, 0.05) 0px 4px 7px 0px, rgba(0, 0, 0, 0.1) 0px 12px 40px 0px;
transform: none → matrix(1, 0, 0, 1, 0, -1);
outline: rgb(255, 255, 255) none 3px → rgba(17, 17, 17, 0.318) solid 3px;
```

**"Save"**
```css
/* Focus */
background-color: rgba(0, 0, 0, 0.05) → rgba(0, 0, 0, 0.07);
border-color: rgba(0, 0, 0, 0) → rgba(0, 0, 0, 0.604);
outline: rgb(0, 0, 0) none 3px → rgba(0, 0, 0, 0.58) solid 3px;
```

### Link Hover

```css
opacity: 1 → 0.877683;
```

## Accessibility (WCAG 2.1)

**Overall Score: 100%** — 2 passing, 0 failing color pairs

### Passing Color Pairs

| Foreground | Background | Ratio | Level |
|------------|------------|-------|-------|
| `#ffffff` | `#000000` | 21:1 | AAA |

## Design System Score

**Overall: 87/100 (Grade: B)**

| Category | Score |
|----------|-------|
| Color Discipline | 100/100 |
| Typography Consistency | 80/100 |
| Spacing System | 70/100 |
| Shadow Consistency | 100/100 |
| Border Radius Consistency | 100/100 |
| Accessibility | 100/100 |
| CSS Tokenization | 100/100 |

**Strengths:** Tight, disciplined color palette, Clean elevation system, Consistent border radii, Strong accessibility compliance, Good CSS variable tokenization

**Issues:**
- 26 !important rules — prefer specificity over overrides
- 52% of CSS is unused — consider purging
- 139 duplicate CSS declarations

## Gradients

**1 unique gradients** detected.

| Type | Direction | Stops | Classification |
|------|-----------|-------|----------------|
| linear | 135deg | 2 | brand |

```css
background: linear-gradient(135deg, rgb(237, 83, 86), rgb(249, 214, 73));
```

## Z-Index Map

**7 unique z-index values** across 4 layers.

| Layer | Range | Elements |
|-------|-------|----------|
| modal | 2000,2000 | div |
| dropdown | 990,999 | div.s.t.-.-.c.-.P.J.L.V. .s.t.-.-.c.-.f.W.I.m.C.j. .s.t.-.-.c.-.P.J.L.V.-.i.j.C.w.I.Q.L.-.c.s.s, div.s.t.-.-.c.-.P.J.L.V. .s.t.-.-.c.-.P.J.L.V.-.i.k.d.l.m.N.A.-.c.s.s |
| sticky | 10,20 | ol.s.t.-.-.c.-.i.B.N.c.w.J, ol.s.t.-.-.c.-.i.B.N.c.w.J. .s.t.-.-.c.-.i.B.N.c.w.J.-.i.e.U.V.M.K.O.-.c.s.s, div.s.t.-.-.c.-.l.l.g.s.k.H. .s.t.-.-.c.-.l.l.g.s.k.H.-.c.m.p.v.r.W.-.a.b.s.o.l.u.t.e.-.f.a.l.s.e |
| base | 1,2 | a.s.t.-.-.c.-.i.c.n.x.D.P, a.s.t.-.-.c.-.i.c.n.x.D.P, a.s.t.-.-.c.-.i.c.n.x.D.P |

## SVG Icons

**5 unique SVG icons** detected. Dominant style: **filled**.

| Size Class | Count |
|------------|-------|
| xs | 2 |
| sm | 1 |
| xl | 2 |

**Icon colors:** `currentColor`

## Font Files

| Family | Source | Weights | Styles |
|--------|--------|---------|--------|
| Suisse | self-hosted | 400, 500, 600, 700 | normal |
| SuisseMono | self-hosted | 400 | normal |

## Image Style Patterns

| Pattern | Count | Key Styles |
|---------|-------|------------|
| general | 5 | objectFit: cover, borderRadius: 0px, shape: square |
| thumbnail | 2 | objectFit: cover, borderRadius: 0px, shape: square |

**Aspect ratios:** 3:4 (3x), 3:2 (3x), 16:9 (1x)

## Motion Language

**Feel:** responsive · **Scroll-linked:** yes

### Duration Tokens

| name | value | ms |
|---|---|---|
| `xs` | `100ms` | 100 |
| `md` | `300ms` | 300 |
| `lg` | `500ms` | 500 |
| `xl` | `1s` | 1000 |

### Easing Families

- **ease-out** (206 uses) — `cubic-bezier(0.23, 1, 0.32, 1)`

## Component Anatomy

### button — 5 instances

**Slots:** label
**Variants:** ghost · primary · subtle

| variant | count | sample label |
|---|---|---|
| primary | 2 | Connect |
| subtle | 2 | Save |
| ghost | 1 | Trending |

## Brand Voice

**Tone:** neutral · **Pronoun:** third-person · **Headings:** Sentence case (tight)

### Top CTA Verbs

- **save** (2)
- **trending** (1)
- **connect** (1)
- **place** (1)

### Button Copy Patterns

- "save" (2×)
- "trending" (1×)
- "connect" (1×)
- "place bid" (1×)

### Sample Headings

> Company
> Connect

## Page Intent

**Type:** `landing` (confidence 0.29)
**Description:** The start of something new

Alternates: legal (0.4)

## Section Roles

Reading order (top→bottom): content → footer

| # | Role | Heading | Confidence |
|---|------|---------|------------|
| 0 | content | — | 0.3 |
| 1 | footer | Company | 0.95 |

## Material Language

**Label:** `flat` (confidence 0)

| Metric | Value |
|--------|-------|
| Avg saturation | 0.244 |
| Shadow profile | soft |
| Avg shadow blur | 0px |
| Max radius | 9999px |
| backdrop-filter in use | no |
| Gradients | 1 |

## Imagery Style

**Label:** `photography` (confidence 0.5)
**Counts:** total 7, svg 0, icon 0, screenshot-like 0, photo-like 5
**Dominant aspect:** landscape
**Radius profile on images:** square

## Component Screenshots

5 retina crops written to `screenshots/`. Index: `*-screenshots.json`.

| Cluster | Variant | Size (px) | File |
|---------|---------|-----------|------|
| button--ghost | 0 | 108 × 36 | `screenshots/button-ghost-0.png` |
| button--primary | 0 | 90 × 36 | `screenshots/button-primary-0.png` |
| button--primary | 1 | 119 × 48 | `screenshots/button-primary-1.png` |
| button--subtle | 0 | 84 × 36 | `screenshots/button-subtle-0.png` |
| button--subtle | 1 | 84 × 36 | `screenshots/button-subtle-1.png` |

Full-page: `screenshots/full-page.png`

## Quick Start

To recreate this design in a new project:

1. **Install fonts:** Add `Suisse` from Google Fonts or your font provider
2. **Import CSS variables:** Copy `variables.css` into your project
3. **Tailwind users:** Use the generated `tailwind.config.js` to extend your theme
4. **Design tokens:** Import `design-tokens.json` for tooling integration
