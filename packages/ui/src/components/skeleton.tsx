import * as React from "react";
import { cn } from "../lib/cn.js";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Predefined shape variant */
  variant?: "box" | "text" | "circle";
  /** Width – defaults to 100% for box/text */
  width?: string | number;
  /** Height – defaults to variant-specific value */
  height?: string | number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "box", width, height, style, ...props }, ref) => {
    const variantStyles: Record<string, string> = {
      box: "rounded-[var(--radius-md)]",
      text: "rounded-[var(--radius-sm)] h-[1em]",
      circle: "rounded-full aspect-square",
    };

    const defaultHeights: Record<string, string> = {
      box: "40px",
      text: "1em",
      circle: "40px",
    };

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(
          "animate-pulse",
          "bg-[var(--color-surface-hover)]",
          "[background-image:linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.04)_50%,transparent_100%)]",
          "[background-size:200%_100%]",
          "[animation:shimmer_1.5s_infinite]",
          variantStyles[variant],
          className,
        )}
        style={{
          width: width ?? (variant === "circle" ? defaultHeights[variant] : "100%"),
          height: height ?? defaultHeights[variant],
          ...style,
        }}
        {...props}
      />
    );
  },
);
Skeleton.displayName = "Skeleton";

export { Skeleton };
