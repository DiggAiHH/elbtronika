# Design Language: SuperRare | Premier Digital Art Gallery & Auction House

> Extracted from `https://superrare.com` on April 25, 2026
> 800 elements analyzed

This document describes the complete design language of the website. It is structured for AI/LLM consumption — use it to faithfully recreate the visual design in any framework.

## Color Palette

### Primary Colors

| Role | Hex | RGB | HSL | Usage Count |
|------|-----|-----|-----|-------------|
| Primary | `#180d43` | rgb(24, 13, 67) | hsl(252, 68%, 16%) | 1 |

### Neutral Colors

| Hex | HSL | Usage Count |
|-----|-----|-------------|
| `#e5e7eb` | hsl(220, 13%, 91%) | 766 |
| `#000000` | hsl(0, 0%, 0%) | 723 |
| `#ffffff` | hsl(0, 0%, 100%) | 67 |
| `#f0f0f0` | hsl(0, 0%, 94%) | 24 |
| `#6b6b6b` | hsl(0, 0%, 42%) | 24 |
| `#a0a0a0` | hsl(0, 0%, 63%) | 18 |
| `#0a0a0a` | hsl(0, 0%, 4%) | 9 |
| `#dcdcdc` | hsl(0, 0%, 86%) | 4 |
| `#bdbdbd` | hsl(0, 0%, 74%) | 2 |
| `#aaaaaa` | hsl(0, 0%, 67%) | 1 |

### Background Colors

Used on large-area elements: `#ffffff`, `#000000`, `#180d43`, `#f5f5f5`, `#fafafa`

### Text Colors

Text color palette: `#000000`, `#ffffff`, `#a0a0a0`, `#aaaaaa`, `#6b6b6b`

### Gradients

```css
background-image: linear-gradient(rgb(24, 13, 67) 40px, rgba(24, 13, 67, 0) 100%);
```

```css
background-image: linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 50%);
```

### Full Color Inventory

| Hex | Contexts | Count |
|-----|----------|-------|
| `#e5e7eb` | border | 766 |
| `#000000` | text, background, border | 723 |
| `#ffffff` | background, text, border | 67 |
| `#f0f0f0` | border, background | 24 |
| `#6b6b6b` | text | 24 |
| `#a0a0a0` | text | 18 |
| `#0a0a0a` | border | 9 |
| `#dcdcdc` | border | 4 |
| `#bdbdbd` | border | 2 |
| `#180d43` | background | 1 |
| `#aaaaaa` | text | 1 |

## Typography

### Font Families

- **Inter** — used for all (642 elements)
- **ui-sans-serif** — used for body (157 elements)
- **Times New Roman** — used for body (1 elements)

### Type Scale

| Size (px) | Size (rem) | Weight | Line Height | Letter Spacing | Used On |
|-----------|------------|--------|-------------|----------------|---------|
| 28px | 1.75rem | 400 | 33.6px | normal | div, p, h2 |
| 24px | 1.5rem | 400 | 36px | normal | h1 |
| 20px | 1.25rem | 300 | 30px | normal | div, p |
| 16px | 1rem | 400 | 24px | normal | html, head, style, meta |
| 14px | 0.875rem | 400 | 21px | normal | body, div, header, a |
| 12px | 0.75rem | 400 | 15px | normal | div, span, a, button |
| 10px | 0.625rem | 400 | 15px | normal | p, a |

### Heading Scale

```css
h2 { font-size: 28px; font-weight: 400; line-height: 33.6px; }
h1 { font-size: 24px; font-weight: 400; line-height: 36px; }
h3 { font-size: 14px; font-weight: 400; line-height: 21px; }
```

### Body Text

```css
body { font-size: 12px; font-weight: 400; line-height: 15px; }
```

### Font Weights in Use

`400` (792x), `300` (6x), `450` (2x)

## Spacing

**Base unit:** 2px

| Token | Value | Rem |
|-------|-------|-----|
| spacing-3 | 3px | 0.1875rem |
| spacing-32 | 32px | 2rem |
| spacing-40 | 40px | 2.5rem |
| spacing-48 | 48px | 3rem |
| spacing-56 | 56px | 3.5rem |
| spacing-78 | 78px | 4.875rem |
| spacing-90 | 90px | 5.625rem |
| spacing-96 | 96px | 6rem |
| spacing-119 | 119px | 7.4375rem |
| spacing-128 | 128px | 8rem |
| spacing-160 | 160px | 10rem |

## Border Radii

| Label | Value | Count |
|-------|-------|-------|
| xs | 2px | 3 |
| xl | 20px | 1 |
| full | 50px | 2 |
| full | 9999px | 15 |

## Box Shadows

**xs** — blur: 2px
```css
box-shadow: rgb(204, 204, 204) 0px 0px 2px 2px;
```

## CSS Custom Properties

### Colors

```css
--text-primary: #000;
--text-secondary: #6b6b6b;
--border-primary: #0a0a0a;
--border-secondary: #bdbdbd;
--border-tertiary: #dcdcdc;
--border-quaternary: #f0f0f0;
--bg-primary: #fff;
--bg-secondary: #6b6b6b;
--bg-secondary-option2: #d1d1d1;
--bg-tertiary: #f5f5f5;
--bg-quaternary: #fafafa;
--bg-quinary: #d8d8d8;
--error-color: #e62600;
--success-color: #03d00c;
--apkt-colors-black: #202020;
--apkt-colors-white: #FFFFFF;
--apkt-colors-white010: rgba(255, 255, 255, 0.1);
--apkt-colors-accent010: rgba(9, 136, 240, 0.1);
--apkt-colors-accent020: rgba(9, 136, 240, 0.2);
--apkt-colors-accent030: rgba(9, 136, 240, 0.3);
--apkt-colors-accent040: rgba(9, 136, 240, 0.4);
--apkt-colors-accent050: rgba(9, 136, 240, 0.5);
--apkt-colors-accent060: rgba(9, 136, 240, 0.6);
--apkt-colors-accent070: rgba(9, 136, 240, 0.7);
--apkt-colors-accent080: rgba(9, 136, 240, 0.8);
--apkt-colors-accent090: rgba(9, 136, 240, 0.9);
--apkt-colors-accent100: rgba(9, 136, 240, 1.0);
--apkt-colors-accentSecondary010: rgba(199, 185, 148, 0.1);
--apkt-colors-accentSecondary020: rgba(199, 185, 148, 0.2);
--apkt-colors-accentSecondary030: rgba(199, 185, 148, 0.3);
--apkt-colors-accentSecondary040: rgba(199, 185, 148, 0.4);
--apkt-colors-accentSecondary050: rgba(199, 185, 148, 0.5);
--apkt-colors-accentSecondary060: rgba(199, 185, 148, 0.6);
--apkt-colors-accentSecondary070: rgba(199, 185, 148, 0.7);
--apkt-colors-accentSecondary080: rgba(199, 185, 148, 0.8);
--apkt-colors-accentSecondary090: rgba(199, 185, 148, 0.9);
--apkt-colors-accentSecondary100: rgba(199, 185, 148, 1.0);
--apkt-colors-productWalletKit: #FFB800;
--apkt-colors-productAppKit: #FF573B;
--apkt-colors-productCloud: #0988F0;
--apkt-colors-productDocumentation: #008847;
--apkt-colors-neutrals050: #F6F6F6;
--apkt-colors-neutrals100: #F3F3F3;
--apkt-colors-neutrals200: #E9E9E9;
--apkt-colors-neutrals300: #D0D0D0;
--apkt-colors-neutrals400: #BBB;
--apkt-colors-neutrals500: #9A9A9A;
--apkt-colors-neutrals600: #6C6C6C;
--apkt-colors-neutrals700: #4F4F4F;
--apkt-colors-neutrals800: #363636;
--apkt-colors-neutrals900: #2A2A2A;
--apkt-colors-neutrals1000: #252525;
--apkt-colors-semanticSuccess010: rgba(48, 164, 107, 0.1);
--apkt-colors-semanticSuccess020: rgba(48, 164, 107, 0.2);
--apkt-colors-semanticSuccess030: rgba(48, 164, 107, 0.3);
--apkt-colors-semanticSuccess040: rgba(48, 164, 107, 0.4);
--apkt-colors-semanticSuccess050: rgba(48, 164, 107, 0.5);
--apkt-colors-semanticSuccess060: rgba(48, 164, 107, 0.6);
--apkt-colors-semanticSuccess070: rgba(48, 164, 107, 0.7);
--apkt-colors-semanticSuccess080: rgba(48, 164, 107, 0.8);
--apkt-colors-semanticSuccess090: rgba(48, 164, 107, 0.9);
--apkt-colors-semanticSuccess100: rgba(48, 164, 107, 1.0);
--apkt-colors-semanticError010: rgba(223, 74, 52, 0.1);
--apkt-colors-semanticError020: rgba(223, 74, 52, 0.2);
--apkt-colors-semanticError030: rgba(223, 74, 52, 0.3);
--apkt-colors-semanticError040: rgba(223, 74, 52, 0.4);
--apkt-colors-semanticError050: rgba(223, 74, 52, 0.5);
--apkt-colors-semanticError060: rgba(223, 74, 52, 0.6);
--apkt-colors-semanticError070: rgba(223, 74, 52, 0.7);
--apkt-colors-semanticError080: rgba(223, 74, 52, 0.8);
--apkt-colors-semanticError090: rgba(223, 74, 52, 0.9);
--apkt-colors-semanticError100: rgba(223, 74, 52, 1.0);
--apkt-colors-semanticWarning010: rgba(243, 161, 63, 0.1);
--apkt-colors-semanticWarning020: rgba(243, 161, 63, 0.2);
--apkt-colors-semanticWarning030: rgba(243, 161, 63, 0.3);
--apkt-colors-semanticWarning040: rgba(243, 161, 63, 0.4);
--apkt-colors-semanticWarning050: rgba(243, 161, 63, 0.5);
--apkt-colors-semanticWarning060: rgba(243, 161, 63, 0.6);
--apkt-colors-semanticWarning070: rgba(243, 161, 63, 0.7);
--apkt-colors-semanticWarning080: rgba(243, 161, 63, 0.8);
--apkt-colors-semanticWarning090: rgba(243, 161, 63, 0.9);
--apkt-colors-semanticWarning100: rgba(243, 161, 63, 1.0);
--apkt-tokens-core-backgroundAccentPrimary: var(--apkt-tokens-core-backgroundAccentPrimary-base);
--apkt-tokens-core-backgroundAccentCertified: #C7B994;
--apkt-tokens-core-textAccentPrimary: #0988F0;
--apkt-tokens-core-textAccentCertified: #C7B994;
--apkt-tokens-core-borderAccentPrimary: #0988F0;
--apkt-tokens-core-borderSecondary: #C7B994;
--apkt-tokens-core-borderSuccess: #30A46B;
--apkt-tokens-core-borderError: #DF4A34;
--apkt-tokens-core-borderWarning: #F3A13F;
--apkt-tokens-core-foregroundAccent010: rgba(9, 136, 240, 0.1);
--apkt-tokens-core-foregroundAccent020: rgba(9, 136, 240, 0.2);
--apkt-tokens-core-foregroundAccent040: rgba(9, 136, 240, 0.4);
--apkt-tokens-core-foregroundAccent060: rgba(9, 136, 240, 0.6);
--apkt-tokens-core-foregroundSecondary020: rgba(199, 185, 148, 0.2);
--apkt-tokens-core-foregroundSecondary040: rgba(199, 185, 148, 0.4);
--apkt-tokens-core-foregroundSecondary060: rgba(199, 185, 148, 0.6);
--apkt-tokens-core-iconAccentPrimary: #0988F0;
--apkt-tokens-core-iconAccentCertified: #C7B994;
--apkt-tokens-theme-backgroundPrimary: var(--apkt-tokens-theme-backgroundPrimary-base);
--apkt-tokens-theme-textPrimary: #FFFFFF;
--apkt-tokens-theme-textSecondary: #9A9A9A;
--apkt-tokens-theme-borderPrimary: #2A2A2A;
--apkt-tokens-theme-borderPrimaryDark: #363636;
--apkt-tokens-theme-borderSecondary: #4F4F4F;
--apkt-tokens-theme-foregroundPrimary: #252525;
--apkt-tokens-theme-foregroundSecondary: #2A2A2A;
--apkt-tokens-theme-foregroundTertiary: #363636;
--apkt-borderRadius-1: 4px;
--apkt-borderRadius-2: 8px;
--apkt-borderRadius-3: 12px;
--apkt-borderRadius-4: 16px;
--apkt-borderRadius-5: 20px;
--apkt-borderRadius-6: 24px;
--apkt-borderRadius-8: 32px;
--apkt-borderRadius-10: 10px;
--apkt-borderRadius-16: 64px;
--apkt-borderRadius-20: 80px;
--apkt-borderRadius-32: 128px;
--apkt-borderRadius-64: 256px;
--apkt-borderRadius-128: 512px;
--apkt-borderRadius-round: 9999px;
--apkt-tokens-theme-backgroundPrimary-base: #202020;
--apkt-tokens-core-backgroundAccentPrimary-base: #0988F0;
--w3m-accent: #0988F0;
--w3m-color-mix: #000;
--w3m-color-mix-strength: 0%;
--w3m-border-radius-master: 4px;
--tw-ring-color: #3b82f680;
--tw-border-spacing-y: 0;
--tw-ring-shadow: 0 0 #0000;
--tw-border-spacing-x: 0;
--tw-ring-offset-color: #fff;
--tw-ring-offset-width: 0px;
--tw-shadow-colored: 0 0 #0000;
--tw-ring-offset-shadow: 0 0 #0000;
--tw-ring-inset: ;
```

### Spacing

```css
--yarl__toolbar_padding: 16px;
--apkt-visual-size-inherit: inherit;
--apkt-visual-size-sm: 40px;
--apkt-visual-size-md: 55px;
--apkt-visual-size-lg: 80px;
--apkt-textSize-h1: 50px;
--apkt-textSize-h2: 44px;
--apkt-textSize-h3: 38px;
--apkt-textSize-h4: 32px;
--apkt-textSize-h5: 26px;
--apkt-textSize-h6: 20px;
--apkt-textSize-large: 16px;
--apkt-textSize-medium: 14px;
--apkt-textSize-small: 12px;
--apkt-typography-h1-regular-mono-letterSpacing: -3px;
--apkt-typography-h1-regular-letterSpacing: -1px;
--apkt-typography-h1-medium-letterSpacing: -0.84px;
--apkt-typography-h2-regular-mono-letterSpacing: -2.64px;
--apkt-typography-h2-regular-letterSpacing: -0.88px;
--apkt-typography-h2-medium-letterSpacing: -0.88px;
--apkt-typography-h3-regular-mono-letterSpacing: -2.28px;
--apkt-typography-h3-regular-letterSpacing: -0.76px;
--apkt-typography-h3-medium-letterSpacing: -0.76px;
--apkt-typography-h4-regular-mono-letterSpacing: -1.92px;
--apkt-typography-h4-regular-letterSpacing: -0.32px;
--apkt-typography-h4-medium-letterSpacing: -0.32px;
--apkt-typography-h5-regular-mono-letterSpacing: -1.56px;
--apkt-typography-h5-regular-letterSpacing: -0.26px;
--apkt-typography-h5-medium-letterSpacing: -0.26px;
--apkt-typography-h6-regular-mono-letterSpacing: -1.2px;
--apkt-typography-h6-regular-letterSpacing: -0.6px;
--apkt-typography-h6-medium-letterSpacing: -0.6px;
--apkt-typography-lg-regular-mono-letterSpacing: -0.96px;
--apkt-typography-lg-regular-letterSpacing: -0.16px;
--apkt-typography-lg-medium-letterSpacing: -0.16px;
--apkt-typography-md-regular-mono-letterSpacing: -0.84px;
--apkt-typography-md-regular-letterSpacing: -0.14px;
--apkt-typography-md-medium-letterSpacing: -0.14px;
--apkt-typography-sm-regular-mono-letterSpacing: -0.72px;
--apkt-typography-sm-regular-letterSpacing: -0.12px;
--apkt-typography-sm-medium-letterSpacing: -0.12px;
--apkt-spacing-0: 0px;
--apkt-spacing-1: 4px;
--apkt-spacing-2: 8px;
--apkt-spacing-3: 12px;
--apkt-spacing-4: 16px;
--apkt-spacing-5: 20px;
--apkt-spacing-6: 24px;
--apkt-spacing-7: 28px;
--apkt-spacing-8: 32px;
--apkt-spacing-9: 36px;
--apkt-spacing-10: 40px;
--apkt-spacing-12: 48px;
--apkt-spacing-14: 56px;
--apkt-spacing-16: 64px;
--apkt-spacing-20: 80px;
--apkt-spacing-32: 128px;
--apkt-spacing-64: 256px;
--apkt-spacing-01: 2px;
--w3m-font-size-master: 10px;
--tw-numeric-spacing: ;
--tw-contain-size: ;
```

### Typography

```css
--text-tertiary: #a0a0a0;
--apkt-fontFamily-regular: KHTeka;
--apkt-fontFamily-mono: KHTekaMono;
--apkt-fontWeight-regular: 400;
--apkt-fontWeight-medium: 500;
--apkt-tokens-core-textWalletKit: #FFB800;
--apkt-tokens-core-textAppKit: #FF573B;
--apkt-tokens-core-textCloud: #0988F0;
--apkt-tokens-core-textDocumentation: #008847;
--apkt-tokens-core-textSuccess: #30A46B;
--apkt-tokens-core-textError: #DF4A34;
--apkt-tokens-core-textWarning: #F3A13F;
--apkt-tokens-theme-textTertiary: #BBBBBB;
--apkt-tokens-theme-textInvert: #202020;
--w3m-font-family: KHTeka;
```

### Shadows

```css
--tw-drop-shadow: ;
--tw-shadow: 0 0 #0000;
```

### Other

```css
--apkt-modal-width: 370px;
--apkt-path-network-sm: path(
          'M15.4 2.1a5.21 5.21 0 0 1 5.2 0l11.61 6.7a5.21 5.21 0 0 1 2.61 4.52v13.4c0 1.87-1 3.59-2.6 4.52l-11.61 6.7c-1.62.93-3.6.93-5.22 0l-11.6-6.7a5.21 5.21 0 0 1-2.61-4.51v-13.4c0-1.87 1-3.6 2.6-4.52L15.4 2.1Z'
        );
--apkt-path-network-md: path(
          'M43.4605 10.7248L28.0485 1.61089C25.5438 0.129705 22.4562 0.129705 19.9515 1.61088L4.53951 10.7248C2.03626 12.2051 0.5 14.9365 0.5 17.886V36.1139C0.5 39.0635 2.03626 41.7949 4.53951 43.2752L19.9515 52.3891C22.4562 53.8703 25.5438 53.8703 28.0485 52.3891L43.4605 43.2752C45.9637 41.7949 47.5 39.0635 47.5 36.114V17.8861C47.5 14.9365 45.9637 12.2051 43.4605 10.7248Z'
        );
--apkt-path-network-lg: path(
          'M78.3244 18.926L50.1808 2.45078C45.7376 -0.150261 40.2624 -0.150262 35.8192 2.45078L7.6756 18.926C3.23322 21.5266 0.5 26.3301 0.5 31.5248V64.4752C0.5 69.6699 3.23322 74.4734 7.6756 77.074L35.8192 93.5492C40.2624 96.1503 45.7376 96.1503 50.1808 93.5492L78.3244 77.074C82.7668 74.4734 85.5 69.6699 85.5 64.4752V31.5248C85.5 26.3301 82.7668 21.5266 78.3244 18.926Z'
        );
--apkt-width-network-sm: 36px;
--apkt-width-network-md: 48px;
--apkt-width-network-lg: 86px;
--apkt-duration-dynamic: 0ms;
--apkt-height-network-sm: 40px;
--apkt-height-network-md: 54px;
--apkt-height-network-lg: 96px;
--apkt-typography-h1-regular-mono-lineHeight: 50px;
--apkt-typography-h1-regular-lineHeight: 50px;
--apkt-typography-h1-medium-lineHeight: 50px;
--apkt-typography-h2-regular-mono-lineHeight: 44px;
--apkt-typography-h2-regular-lineHeight: 44px;
--apkt-typography-h2-medium-lineHeight: 44px;
--apkt-typography-h3-regular-mono-lineHeight: 38px;
--apkt-typography-h3-regular-lineHeight: 38px;
--apkt-typography-h3-medium-lineHeight: 38px;
--apkt-typography-h4-regular-mono-lineHeight: 32px;
--apkt-typography-h4-regular-lineHeight: 32px;
--apkt-typography-h4-medium-lineHeight: 32px;
--apkt-typography-h5-regular-mono-lineHeight: 26px;
--apkt-typography-h5-regular-lineHeight: 26px;
--apkt-typography-h5-medium-lineHeight: 26px;
--apkt-typography-h6-regular-mono-lineHeight: 20px;
--apkt-typography-h6-regular-lineHeight: 20px;
--apkt-typography-h6-medium-lineHeight: 20px;
--apkt-typography-lg-regular-mono-lineHeight: 16px;
--apkt-typography-lg-regular-lineHeight: 18px;
--apkt-typography-lg-medium-lineHeight: 18px;
--apkt-typography-md-regular-mono-lineHeight: 14px;
--apkt-typography-md-regular-lineHeight: 16px;
--apkt-typography-md-medium-lineHeight: 16px;
--apkt-typography-sm-regular-mono-lineHeight: 12px;
--apkt-typography-sm-regular-lineHeight: 14px;
--apkt-typography-sm-medium-lineHeight: 14px;
--apkt-tokens-core-backgroundWalletKit: #FFB800;
--apkt-tokens-core-backgroundAppKit: #FF573B;
--apkt-tokens-core-backgroundCloud: #0988F0;
--apkt-tokens-core-backgroundDocumentation: #008847;
--apkt-tokens-core-backgroundSuccess: rgba(48, 164, 107, 0.20);
--apkt-tokens-core-backgroundError: rgba(223, 74, 52, 0.20);
--apkt-tokens-core-backgroundWarning: rgba(243, 161, 63, 0.20);
--apkt-tokens-core-iconSuccess: #30A46B;
--apkt-tokens-core-iconError: #DF4A34;
--apkt-tokens-core-iconWarning: #F3A13F;
--apkt-tokens-core-glass010: rgba(255, 255, 255, 0.1);
--apkt-tokens-core-zIndex: 9999;
--apkt-tokens-theme-overlay: rgba(0, 0, 0, 0.50);
--apkt-tokens-theme-backgroundInvert: #FFFFFF;
--apkt-tokens-theme-iconDefault: #9A9A9A;
--apkt-tokens-theme-iconInverse: #FFFFFF;
--apkt-durations-xl: 400ms;
--apkt-durations-lg: 200ms;
--apkt-durations-md: 125ms;
--apkt-durations-sm: 75ms;
--apkt-easings-ease-out-power-2: cubic-bezier(0.23, 0.09, 0.08, 1.13);
--apkt-easings-ease-out-power-1: cubic-bezier(0.12, 0.04, 0.2, 1.06);
--apkt-easings-ease-in-power-2: cubic-bezier(0.92, -0.13, 0.77, 0.91);
--apkt-easings-ease-in-power-1: cubic-bezier(0.88, -0.06, 0.8, 0.96);
--apkt-easings-ease-inout-power-2: cubic-bezier(0.77, 0.09, 0.23, 1.13);
--apkt-easings-ease-inout-power-1: cubic-bezier(0.88, 0.04, 0.12, 1.06);
--apkt-footer-height: 0px;
--tw-gradient-via-position: ;
--tw-saturate: ;
--tw-grayscale: ;
--tw-gradient-to-position: ;
--tw-pinch-zoom: ;
--tw-scale-y: 1;
--tw-backdrop-contrast: ;
--tw-pan-x: ;
--tw-translate-y: 0;
--tw-translate-x: 0;
--tw-blur: ;
--tw-invert: ;
--tw-contain-layout: ;
--tw-backdrop-sepia: ;
--tw-sepia: ;
--tw-ordinal: ;
--tw-contain-style: ;
--tw-backdrop-invert: ;
--tw-hue-rotate: ;
--tw-backdrop-grayscale: ;
--tw-pan-y: ;
--tw-rotate: 0;
--tw-scroll-snap-strictness: proximity;
--tw-backdrop-hue-rotate: ;
--tw-numeric-fraction: ;
--tw-skew-y: 0;
--tw-slashed-zero: ;
--tw-backdrop-opacity: ;
--tw-gradient-from-position: ;
--tw-contain-paint: ;
--tw-backdrop-saturate: ;
--tw-brightness: ;
--tw-backdrop-brightness: ;
--tw-contrast: ;
--tw-skew-x: 0;
--tw-backdrop-blur: ;
--tw-scale-x: 1;
--tw-numeric-figure: ;
```

### Dependencies

```css
--apkt-tokens-core-backgroundAccentPrimary: --apkt-tokens-core-backgroundAccentPrimary-base;
--apkt-tokens-theme-backgroundPrimary: --apkt-tokens-theme-backgroundPrimary-base;
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
| xs | 376px | min-width |
| sm | 640px | min-width |
| md | 768px | max-width |
| md | 769px | min-width |
| lg | 1023px | max-width |
| lg | 1024px | min-width |
| 1200px | 1200px | max-width |
| xl | 1280px | min-width |
| 1920px | 1920px | min-width |

## Transitions & Animations

**Easing functions:** `[object Object]`, `[object Object]`, `[object Object]`, `[object Object]`

**Durations:** `0.7s`, `0.2s`, `0.1s`, `0s`, `0.4s`, `0.3s`, `0.15s`

### Common Transitions

```css
transition: all;
transition: opacity 0.7s, visibility;
transition: transform 0.2s ease-out, color 0.2s ease-out, background-color 0.2s ease-out, stroke 0.2s ease-out, stroke-width 0.2s ease-out;
transition: color 0.2s ease-out;
transition: background-color 0.2s ease-out;
transition: transform 0.1s linear, opacity 0.2s linear, visibility linear;
transition: opacity 0.2s, visibility 0s 0.2s;
transition: transform 0.4s;
transition: 0.3s;
transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
```

### Keyframe Animations

**delay-overflow**
```css
@keyframes delay-overflow {
  0% { overflow: hidden auto; }
}
```

**osano-load-scale**
```css
@keyframes osano-load-scale {
  0% { transform: translateY(-50%) scale(0); }
  100% { opacity: 0; transform: translateY(-50%) scale(1); }
}
```

**moveX**
```css
@keyframes moveX {
  0% { left: 0px; }
  100% { left: calc(-242px + 100vw); }
}
```

**moveY**
```css
@keyframes moveY {
  0% { top: 65px; }
  100% { top: calc(-400px + 100vh); }
}
```

**overlayShow**
```css
@keyframes overlayShow {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
```

**ping**
```css
@keyframes ping {
  75%, 100% { opacity: 0; transform: scale(2); }
}
```

**pulse**
```css
@keyframes pulse {
  50% { opacity: 0.5; }
}
```

**scaleIn**
```css
@keyframes scaleIn {
  0% { opacity: 0; transform: scale(0); }
  100% { opacity: 1; transform: scale(1); }
}
```

**spin**
```css
@keyframes spin {
  100% { transform: rotate(360deg); }
}
```

**fadeIn**
```css
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0px); }
}
```

## Component Patterns

Detected UI component patterns and their most common styles:

### Buttons (33 instances)

```css
.button {
  background-color: rgb(255, 255, 255);
  color: rgb(0, 0, 0);
  font-size: 12px;
  font-weight: 400;
  padding-top: 0px;
  padding-right: 0px;
  border-radius: 0px;
}
```

### Inputs (1 instances)

```css
.input {
  background-color: rgb(255, 255, 255);
  color: rgb(0, 0, 0);
  border-color: rgb(229, 229, 229);
  border-radius: 9999px;
  font-size: 14px;
  padding-top: 16px;
  padding-right: 80px;
}
```

### Links (73 instances)

```css
.link {
  color: rgb(0, 0, 0);
  font-size: 14px;
  font-weight: 400;
}
```

### Navigation (10 instances)

```css
.navigatio {
  color: rgb(0, 0, 0);
  padding-top: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  padding-right: 0px;
  position: static;
}
```

### Footer (1 instances)

```css
.foote {
  background-color: rgb(250, 250, 250);
  color: rgb(0, 0, 0);
  padding-top: 48px;
  padding-bottom: 48px;
  font-size: 14px;
}
```

### Modals (9 instances)

```css
.modal {
  background-color: rgb(0, 0, 0);
  border-radius: 0px;
  box-shadow: rgb(204, 204, 204) 0px 0px 2px 2px;
  padding-top: 0px;
  padding-right: 0px;
  max-width: 128px;
}
```

### Avatars (16 instances)

```css
.avatar {
  border-radius: 0px;
}
```

## Component Clusters

Reusable component instances grouped by DOM structure and style similarity:

### Button — 6 instances, 3 variants

**Variant 1** (2 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(255, 255, 255);
  padding: 0px 0px 0px 0px;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0);
  font-size: 16px;
  font-weight: 400;
```

**Variant 2** (3 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(0, 0, 0);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px solid rgb(229, 231, 235);
  font-size: 14px;
  font-weight: 400;
```

**Variant 3** (1 instance)

```css
  background: rgb(0, 0, 0);
  color: rgb(255, 255, 255);
  padding: 12px 12px 12px 12px;
  border-radius: 9999px;
  border: 0px solid rgb(229, 231, 235);
  font-size: 14px;
  font-weight: 400;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(255, 255, 255);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px solid rgb(229, 231, 235);
  font-size: 16px;
  font-weight: 400;
```

### Button — 5 instances, 3 variants

**Variant 1** (3 instances)

```css
  background: rgb(0, 0, 0);
  color: rgb(255, 255, 255);
  padding: 0px 0px 0px 0px;
  border-radius: 20px;
  border: 1px solid rgb(255, 255, 255);
  font-size: 12px;
  font-weight: 400;
```

**Variant 2** (1 instance)

```css
  background: rgb(251, 250, 244);
  color: rgb(255, 255, 255);
  padding: 6px 9px 6px 9px;
  border-radius: 3px;
  border: 1px solid rgb(255, 255, 255);
  font-size: 12px;
  font-weight: 450;
```

**Variant 3** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(0, 0, 0);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px solid rgb(229, 231, 235);
  font-size: 12px;
  font-weight: 400;
```

### Button — 11 instances, 2 variants

**Variant 1** (3 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(0, 0, 0);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px solid rgb(229, 231, 235);
  font-size: 14px;
  font-weight: 400;
```

**Variant 2** (8 instances)

```css
  background: rgb(255, 255, 255);
  color: rgb(0, 0, 0);
  padding: 0px 16px 0px 16px;
  border-radius: 4px;
  border: 1px solid rgb(10, 10, 10);
  font-size: 12px;
  font-weight: 400;
```

### Button — 3 instances, 1 variant

**Variant 1** (3 instances)

```css
  background: rgb(0, 0, 0);
  color: rgb(255, 255, 255);
  padding: 0px 16px 0px 16px;
  border-radius: 4px;
  border: 0px solid rgb(229, 231, 235);
  font-size: 12px;
  font-weight: 400;
```

### Input — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgb(255, 255, 255);
  color: rgb(0, 0, 0);
  padding: 16px 80px 16px 24px;
  border-radius: 9999px;
  border: 1px solid rgb(229, 229, 229);
  font-size: 14px;
  font-weight: 400;
```

## Layout System

**9 grid containers** and **185 flex containers** detected.

### Container Widths

| Max Width | Padding |
|-----------|---------|
| 320px | 0px |
| 100% | 0px |
| 1280px | 24px |
| 994px | 0px |
| 610px | 0px |
| 896px | 16px |

### Grid Column Patterns

| Columns | Usage Count |
|---------|-------------|
| 2-column | 4x |
| 3-column | 2x |
| 1-column | 2x |
| 4-column | 1x |

### Grid Templates

```css
grid-template-columns: 389.328px 389.328px 389.344px;
gap: 72px 32px;
grid-template-columns: 389.328px 389.328px 389.344px;
gap: 72px 32px;
grid-template-columns: 582px 388px;
gap: 24px;
grid-template-columns: 284px 284px 284px 284px;
gap: 72px 32px;
grid-template-columns: 388px;
```

### Flex Patterns

| Direction/Wrap | Count |
|----------------|-------|
| row/nowrap | 115x |
| row/wrap | 8x |
| row-reverse/nowrap | 1x |
| column/nowrap | 61x |

**Gap values:** `12px`, `12px normal`, `14px 41px`, `24px`, `32px`, `4px 36px`, `6px`, `72px 32px`, `80px`, `8px`, `8px 12px`, `normal 0px`, `normal 12px`, `normal 24px`, `normal 64px`, `normal 8px`

## Responsive Design

### Viewport Snapshots

| Viewport | Body Font | Nav Visible | Max Columns | Hamburger | Page Height |
|----------|-----------|-------------|-------------|-----------|-------------|
| mobile (375px) | 14px | Yes | 2 | No | 8426px |
| tablet (768px) | 14px | Yes | 2 | No | 12060px |
| desktop (1280px) | 14px | Yes | 4 | No | 4225px |
| wide (1920px) | 14px | Yes | 4 | No | 5404px |

### Breakpoint Changes

**375px → 768px** (mobile → tablet):
- Page height: `8426px` → `12060px`

**768px → 1280px** (tablet → desktop):
- H1 size: `16px` → `24px`
- Max grid columns: `2` → `4`
- Page height: `12060px` → `4225px`

**1280px → 1920px** (desktop → wide):
- Page height: `4225px` → `5404px`

## Interaction States

### Button States

**"Manage Preferences"**
```css
/* Focus */
outline: rgb(255, 255, 255) none 3px → rgba(0, 0, 0, 0) solid 2px;
```

**"Accept All"**
```css
/* Hover */
background-color: rgb(251, 250, 244) → rgb(234, 233, 227);
```
```css
/* Focus */
background-color: rgb(251, 250, 244) → rgb(231, 230, 224);
outline: rgb(255, 255, 255) none 3px → rgba(0, 0, 0, 0) solid 2px;
```

**"Reject Non-Essential"**
```css
/* Hover */
background-color: rgb(0, 0, 0) → rgb(209, 208, 203);
```
```css
/* Focus */
background-color: rgb(0, 0, 0) → rgb(231, 230, 224);
outline: rgb(255, 255, 255) none 3px → rgba(0, 0, 0, 0) solid 2px;
```

### Link Hover

```css
color: rgb(255, 255, 255) → rgb(163, 163, 163);
outline: rgb(255, 255, 255) none 3px → rgb(163, 163, 163) none 3px;
```

### Input Focus

```css
box-shadow: none → rgb(255, 255, 255) 0px 0px 0px 0px, rgb(0, 0, 0) 0px 0px 0px 2px, rgba(0, 0, 0, 0) 0px 0px 0px 0px;
outline: rgb(0, 0, 0) none 3px → rgba(0, 0, 0, 0) solid 2px;
```

## Accessibility (WCAG 2.1)

**Overall Score: 80%** — 4 passing, 1 failing color pairs

### Failing Color Pairs

| Foreground | Background | Ratio | Level | Used On |
|------------|------------|-------|-------|---------|
| `#ffffff` | `#fbfaf4` | 1.05:1 | FAIL | button (1x) |

### Passing Color Pairs

| Foreground | Background | Ratio | Level |
|------------|------------|-------|-------|
| `#ffffff` | `#000000` | 21:1 | AAA |
| `#aaaaaa` | `#000000` | 9.04:1 | AAA |
| `#000000` | `#ffffff` | 21:1 | AAA |

## Design System Score

**Overall: 88/100 (Grade: B)**

| Category | Score |
|----------|-------|
| Color Discipline | 100/100 |
| Typography Consistency | 80/100 |
| Spacing System | 100/100 |
| Shadow Consistency | 100/100 |
| Border Radius Consistency | 100/100 |
| Accessibility | 80/100 |
| CSS Tokenization | 100/100 |

**Strengths:** Tight, disciplined color palette, Well-defined spacing scale, Clean elevation system, Consistent border radii, Good CSS variable tokenization

**Issues:**
- 1 WCAG contrast failures
- 98 !important rules — prefer specificity over overrides
- 84% of CSS is unused — consider purging
- 1156 duplicate CSS declarations

## Gradients

**2 unique gradients** detected.

| Type | Direction | Stops | Classification |
|------|-----------|-------|----------------|
| linear | — | 2 | brand |
| linear | to top | 2 | brand |

```css
background: linear-gradient(rgb(24, 13, 67) 40px, rgba(24, 13, 67, 0) 100%);
background: linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 50%);
```

## Z-Index Map

**8 unique z-index values** across 3 layers.

| Layer | Range | Elements |
|-------|-------|----------|
| modal | 9999,2147483638 | div, w3m-modal, button.o.s.a.n.o.-.c.m.-.w.i.n.d.o.w._._.w.i.d.g.e.t. .o.s.a.n.o.-.c.m.-.w.i.d.g.e.t. .o.s.a.n.o.-.c.m.-.w.i.d.g.e.t.-.-.h.i.d.d.e.n. .o.s.a.n.o.-.c.m.-.w.i.d.g.e.t.-.-.p.o.s.i.t.i.o.n._.l.e.f.t |
| sticky | 10,88 | a.r.e.l.a.t.i.v.e. .z.-.1.0. .h.-.[.1.8.p.x.]. .w.-.3.2, div.a.b.s.o.l.u.t.e. .-.i.n.s.e.t.-.y.-.[.1.p.x.]. .z.-.1.0. .b.o.r.d.e.r. .b.o.r.d.e.r.-.s.r.-.b.o.r.d.e.r.-.p.r.i.m.a.r.y. .b.g.-.t.r.a.n.s.p.a.r.e.n.t. .d.i.m.:.b.o.r.d.e.r.-.w.h.i.t.e. .m.l.-.[.-.1.p.x.]. .w.-.[.1.0.1.%.]. .r.o.u.n.d.e.d.-.l.-.m.d, header.s.t.i.c.k.y. .t.o.p.-.0. .z.-.[.8.8.]. .b.o.r.d.e.r.-.b. .b.o.r.d.e.r.-.s.r.-.b.o.r.d.e.r.-.q.u.a.t.e.r.n.a.r.y. .b.g.-.s.r.-.b.g.-.p.r.i.m.a.r.y. .[.@.m.e.d.i.a.(.m.i.n.-.w.i.d.t.h.:.2.0.0.0.p.x.).].:.p.x.-.4.8 |
| base | 1,2 | div.o.s.a.n.o.-.c.m.-.i.n.f.o._._.i.n.f.o.-.d.i.a.l.o.g.-.h.e.a.d.e.r. .o.s.a.n.o.-.c.m.-.i.n.f.o.-.d.i.a.l.o.g.-.h.e.a.d.e.r, p.o.s.a.n.o.-.c.m.-.i.n.f.o.-.d.i.a.l.o.g.-.h.e.a.d.e.r._._.h.e.a.d.e.r. .o.s.a.n.o.-.c.m.-.h.e.a.d.e.r, button.o.s.a.n.o.-.c.m.-.d.i.a.l.o.g._._.c.l.o.s.e. .o.s.a.n.o.-.c.m.-.c.l.o.s.e |

**Issues:**
- [object Object]

## SVG Icons

**11 unique SVG icons** detected. Dominant style: **filled**.

| Size Class | Count |
|------------|-------|
| sm | 5 |
| md | 5 |
| lg | 1 |

**Icon colors:** `rgb(0, 0, 0)`, `rgb(255, 255, 255)`, `#6B6B6B`, `black`, `currentColor`

## Font Files

| Family | Source | Weights | Styles |
|--------|--------|---------|--------|
| Inter | self-hosted | 100 900 | normal |
| KHTeka | self-hosted | 300, 400 | normal |
| KHTekaMono | self-hosted | 400 | normal |

## Image Style Patterns

| Pattern | Count | Key Styles |
|---------|-------|------------|
| thumbnail | 16 | objectFit: fill, borderRadius: 0px, shape: square |
| general | 6 | objectFit: contain, borderRadius: 0px, shape: square |
| hero | 3 | objectFit: cover, borderRadius: 0px, shape: square |

**Aspect ratios:** 1:1 (15x), 3:4 (5x), 1.96:1 (3x), 7.11:1 (1x), 16:9 (1x)

## Motion Language

**Feel:** springy · **Scroll-linked:** yes

### Duration Tokens

| name | value | ms |
|---|---|---|
| `xs` | `100ms` | 100 |
| `sm` | `200ms` | 200 |
| `md` | `300ms` | 300 |
| `lg` | `700ms` | 700 |

### Easing Families

- **ease-in-out** (6 uses) — `ease`
- **linear** (1 uses) — `linear`
- **custom** (1 uses) — `cubic-bezier(0.4, 0, 0.2, 1)`
- **spring** (1 uses) — `cubic-bezier(0.23, 0.09, 0.08, 1.13)`

### Spring / Overshoot Easings

- `cubic-bezier(0.23, 0.09, 0.08, 1.13)`

### Keyframes In Use

| name | kind | properties | uses |
|---|---|---|---|
| `delay-overflow` | custom | overflow | 1 |

## Component Anatomy

### button — 26 instances

**Slots:** label, icon
**Variants:** outline · primary
**Sizes:** xl · md · sm

| variant | count | sample label |
|---|---|---|
| default | 13 | Close this dialog |
| primary | 12 | Log In |
| outline | 1 |  |

## Brand Voice

**Tone:** friendly · **Pronoun:** you-only · **Headings:** Sentence case (tight)

### Top CTA Verbs

- **place** (6)
- **h** (3)
- **close** (2)
- **manage** (2)
- **make** (2)
- **accept** (1)
- **reject** (1)
- **log** (1)

### Button Copy Patterns

- "place a bid" (6×)
- "make an offer" (2×)
- "close this dialog" (1×)
- "manage preferences
accept all
reject non-essential" (1×)
- "manage preferences" (1×)
- "accept all" (1×)
- "reject non-essential" (1×)
- "close cookie preferences" (1×)
- "log in" (1×)
- "20h 8m 14s" (1×)

### Sample Headings

> Featured
> Panorama Tableau
> Auctions
> Human After All by Elnaz Mansouri
> Featured
> Panorama Tableau
> Human After All by Elnaz Mansouri
> Subscribe for weekly updates on art and culture

## Page Intent

**Type:** `landing` (confidence 0.29)
**Description:** Since 2018, SuperRare has elevated digital art into cultural history—providing a trusted destination to discover, collect, and exhibit original digital works.

Alternates: legal (0.4), blog-post (0.35)

## Section Roles

Reading order (top→bottom): pricing-table → content → pricing-table → hero → pricing-table → nav → nav → nav → nav → nav → content → footer → nav → nav → nav

| # | Role | Heading | Confidence |
|---|------|---------|------------|
| 0 | nav | — | 0.4 |
| 1 | nav | — | 0.9 |
| 2 | nav | — | 0.9 |
| 3 | nav | — | 0.9 |
| 4 | pricing-table | Featured | 0.9 |
| 5 | content | — | 0.3 |
| 6 | pricing-table | Featured | 0.9 |
| 7 | hero | Panorama Tableau | 0.85 |
| 8 | pricing-table | Human After All by Elnaz Mansouri | 0.9 |
| 9 | content | Subscribe for weekly updates on art and culture | 0.3 |
| 10 | nav | — | 0.9 |
| 11 | footer | — | 0.95 |
| 12 | nav | — | 0.9 |
| 13 | nav | — | 0.9 |
| 14 | nav | — | 0.9 |

## Material Language

**Label:** `flat` (confidence 0)

| Metric | Value |
|--------|-------|
| Avg saturation | 0.076 |
| Shadow profile | soft |
| Avg shadow blur | 0px |
| Max radius | 9999px |
| backdrop-filter in use | no |
| Gradients | 2 |

## Imagery Style

**Label:** `photography` (confidence 0.12)
**Counts:** total 25, svg 3, icon 16, screenshot-like 1, photo-like 6
**Dominant aspect:** square-ish
**Radius profile on images:** square

## Component Library

**Detected:** `tailwindcss` (confidence 0.742)

Evidence:
- tailwind-like class density 72%

## Component Screenshots

10 retina crops written to `screenshots/`. Index: `*-screenshots.json`.

| Cluster | Variant | Size (px) | File |
|---------|---------|-----------|------|
| button--default | 0 | 24 × 24 | `screenshots/button-default-0.png` |
| button--default | 1 | 128 × 114 | `screenshots/button-default-1.png` |
| button--default | 2 | 128 × 17 | `screenshots/button-default-2.png` |
| button--outline--xl | 0 | 20 × 20 | `screenshots/button-outline-xl-0.png` |
| button--primary--md | 0 | 89 × 32 | `screenshots/button-primary-md-0.png` |
| button--primary--md | 1 | 97 × 28 | `screenshots/button-primary-md-1.png` |
| button--primary--md | 2 | 97 × 28 | `screenshots/button-primary-md-2.png` |
| input--outline | 0 | 864 × 55 | `screenshots/input-outline-0.png` |
| button--default--sm | 0 | 69 × 18 | `screenshots/button-default-sm-0.png` |
| button--default--sm | 1 | 112 × 18 | `screenshots/button-default-sm-1.png` |

Full-page: `screenshots/full-page.png`

## Quick Start

To recreate this design in a new project:

1. **Install fonts:** Add `Inter` from Google Fonts or your font provider
2. **Import CSS variables:** Copy `variables.css` into your project
3. **Tailwind users:** Use the generated `tailwind.config.js` to extend your theme
4. **Design tokens:** Import `design-tokens.json` for tooling integration
