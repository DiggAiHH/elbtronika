// React Theme — extracted from https://superrare.com
// Compatible with: Chakra UI, Stitches, Vanilla Extract, or any CSS-in-JS

/**
 * TypeScript type definition for this theme:
 *
 * interface Theme {
 *   colors: {
    primary: string;
    background: string;
    foreground: string;
    neutral50: string;
    neutral100: string;
    neutral200: string;
    neutral300: string;
    neutral400: string;
    neutral500: string;
    neutral600: string;
    neutral700: string;
    neutral800: string;
    neutral900: string;
 *   };
 *   fonts: {
    body: string;
 *   };
 *   fontSizes: {
    '10': string;
    '12': string;
    '14': string;
    '16': string;
    '20': string;
    '24': string;
    '28': string;
 *   };
 *   space: {
    '3': string;
    '32': string;
    '40': string;
    '48': string;
    '56': string;
    '78': string;
    '90': string;
    '96': string;
    '119': string;
    '128': string;
    '160': string;
 *   };
 *   radii: {
    xs: string;
    xl: string;
    full: string;
 *   };
 *   shadows: {
    xs: string;
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
    primary: "#180d43",
    background: "#ffffff",
    foreground: "#000000",
    neutral50: "#e5e7eb",
    neutral100: "#000000",
    neutral200: "#ffffff",
    neutral300: "#f0f0f0",
    neutral400: "#6b6b6b",
    neutral500: "#a0a0a0",
    neutral600: "#0a0a0a",
    neutral700: "#dcdcdc",
    neutral800: "#bdbdbd",
    neutral900: "#aaaaaa",
  },
  fonts: {
    body: "'Times New Roman', sans-serif",
  },
  fontSizes: {
    10: "10px",
    12: "12px",
    14: "14px",
    16: "16px",
    20: "20px",
    24: "24px",
    28: "28px",
  },
  space: {
    3: "3px",
    32: "32px",
    40: "40px",
    48: "48px",
    56: "56px",
    78: "78px",
    90: "90px",
    96: "96px",
    119: "119px",
    128: "128px",
    160: "160px",
  },
  radii: {
    xs: "2px",
    xl: "20px",
    full: "9999px",
  },
  shadows: {
    xs: "rgb(204, 204, 204) 0px 0px 2px 2px",
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
      main: "#180d43",
      light: "hsl(252, 68%, 31%)",
      dark: "hsl(252, 68%, 10%)",
    },
    background: {
      default: "#ffffff",
      paper: "#000000",
    },
    text: {
      primary: "#000000",
      secondary: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'ui-sans-serif', sans-serif",
    h2: {
      fontSize: "24px",
      fontWeight: "400",
      lineHeight: "36px",
    },
    h3: {
      fontSize: "20px",
      fontWeight: "300",
      lineHeight: "30px",
    },
    body1: {
      fontSize: "16px",
      fontWeight: "400",
      lineHeight: "24px",
    },
    body2: {
      fontSize: "12px",
      fontWeight: "400",
      lineHeight: "15px",
    },
  },
  shape: {
    borderRadius: 2,
  },
  shadows: ["rgb(204, 204, 204) 0px 0px 2px 2px"],
};

export default theme;
