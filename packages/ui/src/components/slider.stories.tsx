import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slider } from "./slider";

const meta: Meta<typeof Slider> = {
  title: "Form Controls/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: {
    label: "Lautstärke",
    defaultValue: [70],
    min: 0,
    max: 100,
    showValue: true,
  },
};

export const WithFormat: Story = {
  args: {
    label: "Preis bis",
    defaultValue: [250],
    min: 0,
    max: 1000,
    step: 10,
    showValue: true,
    formatValue: (v) => `${v} €`,
  },
};

export const Range: Story = {
  args: {
    label: "Preisbereich",
    defaultValue: [100, 500],
    min: 0,
    max: 1000,
    step: 10,
    showValue: true,
    formatValue: (v) => `${v} €`,
  },
};

export const Disabled: Story = {
  args: {
    label: "Gesperrt",
    defaultValue: [40],
    disabled: true,
  },
};
