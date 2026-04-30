import type { Meta, StoryObj } from "@storybook/react-vite";
import { Container, Grid, Spacer, Stack } from "./layout";
import { Text } from "./typography";

const meta: Meta = {
  title: "Layout",
  parameters: { layout: "fullscreen" },
};

export default meta;

const Box = ({ label }: { label: string }) => (
  <div
    style={{
      background: "rgba(0,245,212,0.08)",
      border: "1px solid rgba(0,245,212,0.2)",
      borderRadius: 8,
      padding: "12px 16px",
    }}
  >
    <Text size="sm" muted>
      {label}
    </Text>
  </div>
);

export const ContainerSizes: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-4 py-4">
      {(["sm", "md", "lg", "xl", "full"] as const).map((size) => (
        <Container
          key={size}
          size={size}
          style={{ background: "rgba(255,255,255,0.02)", padding: 16 }}
        >
          <Text size="sm" muted>
            Container size="{size}"
          </Text>
        </Container>
      ))}
    </div>
  ),
};

export const StackVertical: StoryObj = {
  render: () => (
    <Container size="sm" style={{ paddingTop: 32 }}>
      <Stack gap="4">
        <Box label="Item 1" />
        <Box label="Item 2" />
        <Box label="Item 3" />
      </Stack>
    </Container>
  ),
};

export const StackHorizontal: StoryObj = {
  render: () => (
    <Container size="sm" style={{ paddingTop: 32 }}>
      <Stack gap="3" align="center">
        <Box label="Links" />
        <Box label="Mitte" />
        <Box label="Rechts" />
      </Stack>
    </Container>
  ),
};

export const GridLayout: StoryObj = {
  render: () => (
    <Container size="lg" style={{ paddingTop: 32 }}>
      <Grid cols={3} gap="4">
        {(["Werk 1", "Werk 2", "Werk 3", "Werk 4", "Werk 5", "Werk 6"] as const).map((label) => (
          <Box key={label} label={label} />
        ))}
      </Grid>
    </Container>
  ),
};

export const SpacerUsage: StoryObj = {
  render: () => (
    <Container size="sm">
      <Box label="Oben" />
      <Spacer size="8" />
      <Box label="Nach 32px Spacer" />
      <Spacer size="16" />
      <Box label="Nach 64px Spacer" />
    </Container>
  ),
};
