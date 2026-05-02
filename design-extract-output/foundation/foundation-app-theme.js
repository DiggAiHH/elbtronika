// React Theme — extracted from https://foundation.app
// Compatible with: Chakra UI, Stitches, Vanilla Extract, or any CSS-in-JS

/**
 * TypeScript type definition for this theme:
 *
 * interface Theme {
 *   colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    neutral50: string;
    neutral100: string;
    neutral200: string;
    neutral300: string;
    neutral400: string;
 *   };
 *   fonts: {
    body: string;
    mono: string;
 *   };
 *   fontSizes: {
    '12': string;
    '13': string;
    '14': string;
    '16': string;
    '20': string;
    '24': string;
    '26': string;
    '32': string;
    '40': string;
 *   };
 *   space: {
    '1': string;
    '32': string;
    '40': string;
    '48': string;
    '61': string;
    '120': string;
    '419': string;
 *   };
 *   radii: {
    sm: string;
    lg: string;
    full: string;
 *   };
 *   shadows: {
    sm: string;
 *   };
 *   states: {
 *     hover: { opacity: number };
 *     focus: { opacity: number };
 *     active: { opacity: number };
 *     disabled: { opacity: number };
 *   };
 * }
 */

export const theme = {
  colors: {
    primary: "#0f863e",
    secondary: "#c6248b",
    background: "#000000",
    foreground: "#000000",
    neutral50: "#000000",
    neutral100: "#ffffff",
    neutral200: "#f2f2f2",
    neutral300: "#2a2a2a",
    neutral400: "#1a1a1a",
  },
  fonts: {
    body: "'Times New Roman', sans-serif",
    mono: "'SuisseMono', monospace",
  },
  fontSizes: {
    12: "12px",
    13: "13px",
    14: "14px",
    16: "16px",
    20: "20px",
    24: "24px",
    26: "26px",
    32: "32px",
    40: "40px",
  },
  space: {
    1: "1px",
    32: "32px",
    40: "40px",
    48: "48px",
    61: "61px",
    120: "120px",
    419: "419px",
  },
  radii: {
    sm: "4px",
    lg: "12px",
    full: "9999px",
  },
  shadows: {
    sm: "rgba(0, 0, 0, 0.05) 0px 0px 0px 1px inset",
  },
  states: {
    hover: {
      opacity: 0.08,
    },
    focus: {
      opacity: 0.12,
    },
    active: {
      opacity: 0.16,
    },
    disabled: {
      opacity: 0.38,
    },
  },
};

// MUI v5 theme
export const muiTheme = {
  palette: {
    primary: {
      main: "#0f863e",
      light: "hsl(144, 80%, 44%)",
      dark: "hsl(144, 80%, 14%)",
    },
    secondary: {
      main: "#c6248b",
      light: "hsl(322, 69%, 61%)",
      dark: "hsl(322, 69%, 31%)",
    },
    background: {
      default: "#000000",
      paper: "#f2f2f2",
    },
    text: {
      primary: "#000000",
      secondary: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'Times New Roman', sans-serif",
    h1: {
      fontSize: "32px",
      fontWeight: "500",
      lineHeight: "32px",
    },
    h2: {
      fontSize: "24px",
      fontWeight: "500",
      lineHeight: "normal",
    },
    h3: {
      fontSize: "20px",
      fontWeight: "500",
      lineHeight: "normal",
    },
    body1: {
      fontSize: "16px",
      fontWeight: "400",
      lineHeight: "normal",
    },
  },
  shape: {
    borderRadius: 4,
  },
  shadows: ["rgba(0, 0, 0, 0) 0px 0px 0px 1px", "rgba(0, 0, 0, 0.05) 0px 0px 0px 1px inset"],
};

export default theme;
