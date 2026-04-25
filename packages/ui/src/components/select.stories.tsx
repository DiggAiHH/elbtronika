import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "./select.js";

const meta: Meta<typeof Select> = {
  title: "Form Controls/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Select>;

const genreOptions = [
  { value: "techno", label: "Techno" },
  { value: "house", label: "House" },
  { value: "ambient", label: "Ambient" },
  { value: "dnb", label: "Drum & Bass" },
  { value: "experimental", label: "Experimental" },
];

export const Default: Story = {
  args: {
    label: "Genre",
    options: genreOptions,
    placeholder: "Genre wählen…",
  },
};

export const WithError: Story = {
  args: {
    label: "Medium",
    options: [
      { value: "digital", label: "Digital" },
      { value: "print", label: "Print / Siebdruck" },
      { value: "installation", label: "Installation" },
    ],
    error: "Bitte wähle ein Medium",
  },
};

export const Disabled: Story = {
  args: {
    label: "Region",
    options: [{ value: "eu", label: "Europa" }],
    disabled: true,
  },
};
