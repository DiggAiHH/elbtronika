import * as React from "react";
import { cn } from "../lib/cn";

// ── Container ──────────────────────────────────────────────────────────────
// Constrained max-width wrapper, horizontally centred

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const containerSizes: Record<string, string> = {
  sm: "max-w-[640px]",
  md: "max-w-[768px]",
  lg: "max-w-[1024px]",
  xl: "max-w-[1280px]",
  full: "max-w-none",
};

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "xl", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mx-auto w-full px-[var(--spacing-4)] md:px-[var(--spacing-8)]",
        containerSizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Container.displayName = "Container";

// ── Stack ──────────────────────────────────────────────────────────────────
// Vertical flex stack with consistent gap

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: "1" | "2" | "3" | "4" | "6" | "8" | "10" | "12";
  align?: "start" | "center" | "end" | "stretch";
}

const gapMap: Record<string, string> = {
  "1": "gap-[var(--spacing-1)]",
  "2": "gap-[var(--spacing-2)]",
  "3": "gap-[var(--spacing-3)]",
  "4": "gap-[var(--spacing-4)]",
  "6": "gap-[var(--spacing-6)]",
  "8": "gap-[var(--spacing-8)]",
  "10": "gap-[var(--spacing-10)]",
  "12": "gap-[var(--spacing-12)]",
};

const alignMap: Record<string, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, gap = "4", align = "stretch", ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col", gapMap[gap], alignMap[align], className)}
      {...props}
    />
  ),
);
Stack.displayName = "Stack";

// ── Grid ───────────────────────────────────────────────────────────────────

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: "1" | "2" | "3" | "4" | "6" | "8";
}

const colsMap: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
  12: "grid-cols-12",
};

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 3, gap = "4", ...props }, ref) => (
    <div ref={ref} className={cn("grid", colsMap[cols], gapMap[gap], className)} {...props} />
  ),
);
Grid.displayName = "Grid";

// ── Spacer ─────────────────────────────────────────────────────────────────

export interface SpacerProps {
  size?: "1" | "2" | "3" | "4" | "6" | "8" | "10" | "12" | "16" | "20" | "24";
  axis?: "vertical" | "horizontal";
  className?: string;
}

const spacerSizeMap: Record<string, string> = {
  "1": "4px",
  "2": "8px",
  "3": "12px",
  "4": "16px",
  "6": "24px",
  "8": "32px",
  "10": "40px",
  "12": "48px",
  "16": "64px",
  "20": "80px",
  "24": "96px",
};

const Spacer = ({ size = "4", axis = "vertical", className }: SpacerProps) => {
  const dimension = spacerSizeMap[size];
  return (
    <span
      aria-hidden="true"
      className={className}
      style={
        axis === "vertical"
          ? { display: "block", height: dimension }
          : { display: "inline-block", width: dimension }
      }
    />
  );
};
Spacer.displayName = "Spacer";

export { Container, Grid, Spacer, Stack };
