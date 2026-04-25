import type { Preview } from "@storybook/react-vite";
import "../src/styles.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#0a0a0b" },
        { name: "surface", value: "rgba(255,255,255,0.03)" },
        { name: "light", value: "#ffffff" },
      ],
    },
    a11y: {
      // WCAG 2.1 AA — axe-core config
      config: {
        rules: [
          { id: "color-contrast", enabled: true },
          { id: "label", enabled: true },
          { id: "aria-required-attr", enabled: true },
        ],
      },
    },
  },
  globalTypes: {
    locale: {
      description: "Internationalization locale",
      defaultValue: "de",
      toolbar: {
        icon: "globe",
        items: [
          { value: "de", title: "Deutsch" },
          { value: "en", title: "English" },
        ],
      },
    },
  },
};

export default preview;
