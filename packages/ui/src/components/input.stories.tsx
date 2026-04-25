import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input, Textarea } from "./input.js";

const inputMeta: Meta<typeof Input> = {
  title: "Form Controls/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export default inputMeta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: "E-Mail-Adresse",
    placeholder: "name@example.com",
    type: "email",
  },
};

export const WithHint: Story = {
  args: {
    label: "Benutzername",
    placeholder: "@dj_handle",
    hint: "Wird öffentlich auf deinem Profil angezeigt",
  },
};

export const WithError: Story = {
  args: {
    label: "Passwort",
    type: "password",
    placeholder: "Mindestens 8 Zeichen",
    error: "Passwort ist zu kurz",
  },
};

export const Disabled: Story = {
  args: {
    label: "Read-only Feld",
    value: "Gesperrter Wert",
    disabled: true,
  },
};

// Textarea story in same file
export const TextareaDefault: StoryObj<typeof Textarea> = {
  render: () => (
    <div style={{ width: 360 }}>
      <Textarea
        label="Künstler-Bio"
        placeholder="Erzähl der Community etwas über dich…"
        hint="Max. 500 Zeichen"
        rows={4}
      />
    </div>
  ),
};
