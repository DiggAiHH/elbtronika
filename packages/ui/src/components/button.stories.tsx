import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "Form Controls/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: "Jetzt kaufen",
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    children: "Mehr erfahren",
    variant: "secondary",
  },
};

export const Ghost: Story = {
  args: {
    children: "Schließen",
    variant: "ghost",
  },
};

export const Destructive: Story = {
  args: {
    children: "Löschen",
    variant: "destructive",
  },
};

export const Link: Story = {
  args: {
    children: "Alle Werke ansehen",
    variant: "link",
  },
};

export const Loading: Story = {
  args: {
    children: "Wird geladen…",
    variant: "primary",
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: "Nicht verfügbar",
    variant: "primary",
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 items-center">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 items-center">
      <Button size="sm">Klein</Button>
      <Button size="md">Mittel</Button>
      <Button size="lg">Groß</Button>
    </div>
  ),
};
