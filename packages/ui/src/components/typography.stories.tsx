import type { Meta, StoryObj } from "@storybook/react-vite";
import { Caption, Heading, Numeric, Text } from "./typography.js";

const meta: Meta = {
  title: "Typography",
  parameters: { layout: "padded" },
};

export default meta;

export const Headings: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Heading level="h1">H1 – Immersive Galerie</Heading>
      <Heading level="h2">H2 – Neue Werke</Heading>
      <Heading level="h3">H3 – Featured Artists</Heading>
      <Heading level="h4">H4 – Kategorie</Heading>
      <Heading level="h5">H5 – Unterabschnitt</Heading>
      <Heading level="h6">H6 – Meta-Info</Heading>
    </div>
  ),
};

export const TextVariants: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-3" style={{ maxWidth: 480 }}>
      <Text size="xl">XL – Intro-Text für Künstlerseiten</Text>
      <Text size="lg">LG – Beschreibungstext im Immersive Mode</Text>
      <Text size="md">MD – Standard-Fließtext überall in der App</Text>
      <Text size="sm">SM – Metadaten, Labels, Hinweise</Text>
      <Text size="xs">XS – Timestamps, Rechtliches</Text>
      <Text size="md" muted>
        Muted – Sekundäre Information
      </Text>
      <Text size="md" weight="semibold">
        Semibold – Hervorhebung
      </Text>
    </div>
  ),
};

export const CaptionVariant: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Caption>Techno · Berlin · 2024</Caption>
      <Caption as="p">Limited Edition — 5 of 20</Caption>
    </div>
  ),
};

export const NumericVariant: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Numeric>320,00 €</Numeric>
      <Numeric accent>320,00 €</Numeric>
      <div className="flex items-baseline gap-2">
        <Numeric accent>320 €</Numeric>
        <Text size="sm" muted>
          inkl. MwSt.
        </Text>
      </div>
    </div>
  ),
};

export const ArtworkCard: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-1" style={{ maxWidth: 280 }}>
      <Caption>Limitiert · 3 von 20</Caption>
      <Heading level="h4">Neon Decay #003</Heading>
      <Text size="sm" muted>
        DJ Parallax × NOIA
      </Text>
      <div className="flex items-baseline gap-2 mt-2">
        <Numeric accent>320,00 €</Numeric>
        <Text size="xs" muted>
          + Versand
        </Text>
      </div>
    </div>
  ),
};
