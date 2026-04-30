import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Overlay & Feedback/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Box: Story = {
  args: { variant: "box", width: 240, height: 160 },
};

export const Text: Story = {
  render: () => (
    <div className="flex flex-col gap-2" style={{ width: 280 }}>
      <Skeleton variant="text" width="100%" height={16} />
      <Skeleton variant="text" width="80%" height={16} />
      <Skeleton variant="text" width="60%" height={16} />
    </div>
  ),
};

export const Circle: Story = {
  args: { variant: "circle", width: 56, height: 56 },
};

export const ArtworkCardSkeleton: Story = {
  render: () => (
    <div className="flex flex-col gap-3" style={{ width: 280 }}>
      <Skeleton variant="box" width="100%" height={320} />
      <Skeleton variant="text" width="70%" height={18} />
      <Skeleton variant="text" width="40%" height={14} />
      <div className="flex items-center gap-2 mt-1">
        <Skeleton variant="circle" width={32} height={32} />
        <Skeleton variant="text" width="50%" height={14} />
      </div>
    </div>
  ),
};
