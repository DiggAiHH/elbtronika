/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: "hsl(252, 68%, 97%)",
          100: "hsl(252, 68%, 94%)",
          200: "hsl(252, 68%, 86%)",
          300: "hsl(252, 68%, 76%)",
          400: "hsl(252, 68%, 64%)",
          500: "hsl(252, 68%, 50%)",
          600: "hsl(252, 68%, 40%)",
          700: "hsl(252, 68%, 32%)",
          800: "hsl(252, 68%, 24%)",
          900: "hsl(252, 68%, 16%)",
          950: "hsl(252, 68%, 10%)",
          DEFAULT: "#180d43",
        },
        "neutral-50": "#e5e7eb",
        "neutral-100": "#000000",
        "neutral-200": "#ffffff",
        "neutral-300": "#f0f0f0",
        "neutral-400": "#6b6b6b",
        "neutral-500": "#a0a0a0",
        "neutral-600": "#0a0a0a",
        "neutral-700": "#dcdcdc",
        "neutral-800": "#bdbdbd",
        "neutral-900": "#aaaaaa",
        background: "#ffffff",
        foreground: "#000000",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        body: ["Times New Roman", "sans-serif"],
      },
      fontSize: {
        10: [
          "10px",
          {
            lineHeight: "15px",
          },
        ],
        12: [
          "12px",
          {
            lineHeight: "15px",
          },
        ],
        14: [
          "14px",
          {
            lineHeight: "21px",
          },
        ],
        16: [
          "16px",
          {
            lineHeight: "24px",
          },
        ],
        20: [
          "20px",
          {
            lineHeight: "30px",
          },
        ],
        24: [
          "24px",
          {
            lineHeight: "36px",
          },
        ],
        28: [
          "28px",
          {
            lineHeight: "33.6px",
          },
        ],
      },
      spacing: {
        16: "32px",
        20: "40px",
        24: "48px",
        28: "56px",
        39: "78px",
        45: "90px",
        48: "96px",
        64: "128px",
        80: "160px",
        "3px": "3px",
        "119px": "119px",
      },
      borderRadius: {
        xs: "2px",
        xl: "20px",
        full: "9999px",
      },
      boxShadow: {
        xs: "rgb(204, 204, 204) 0px 0px 2px 2px",
      },
      screens: {
        xs: "376px",
        sm: "640px",
        md: "769px",
        lg: "1024px",
        xl: "1280px",
        "1920px": "1920px",
      },
      transitionDuration: {
        0: "0s",
        100: "0.1s",
        150: "0.15s",
        200: "0.2s",
        300: "0.3s",
        400: "0.4s",
        700: "0.7s",
      },
      transitionTimingFunction: {
        default: "ease",
        linear: "linear",
        custom: "cubic-bezier(0.23, 0.09, 0.08, 1.13)",
      },
      container: {
        center: true,
        padding: "0px",
      },
      maxWidth: {
        container: "320px",
      },
    },
  },
};
