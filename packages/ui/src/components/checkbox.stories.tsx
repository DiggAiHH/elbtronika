import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "./checkbox.js";

const meta: Meta<typeof Checkbox> = {
  title: "Form Controls/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    label: "AGBs akzeptieren",
  },
};

export const WithDescription: Story = {
  args: {
    label: "Newsletter abonnieren",
    description: "Wöchentliche Updates zu neuen Künstlern und Events",
  },
};

export const Checked: Story = {
  args: {
    label: "Lizenzrechte bestätigt",
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: "Exklusiver Zugang",
    description: "Nur für verifizierte Galeristen",
    disabled: true,
  },
};
