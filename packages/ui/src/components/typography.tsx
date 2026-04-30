import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../lib/cn";

// ── Heading ────────────────────────────────────────────────────────────────

const headingVariants = cva("font-semibold text-[var(--color-text-primary)] leading-tight", {
  variants: {
    level: {
      h1: "text-4xl md:text-5xl",
      h2: "text-3xl md:text-4xl",
      h3: "text-2xl md:text-3xl",
      h4: "text-xl md:text-2xl",
      h5: "text-lg md:text-xl",
      h6: "text-base md:text-lg",
    },
  },
  defaultVariants: { level: "h2" },
});

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: HeadingLevel;
}

function Heading({ className, level = "h2", as, children, ...props }: HeadingProps) {
  const Tag = (as ?? level ?? "h2") as HeadingLevel;
  return React.createElement(
    Tag,
    { className: cn(headingVariants({ level }), className), ...props },
    children,
  );
}
Heading.displayName = "Heading";

// ── Text ───────────────────────────────────────────────────────────────────

const textVariants = cva("text-[var(--color-text-primary)]", {
  variants: {
    size: {
      xs: "text-xs leading-4",
      sm: "text-sm leading-5",
      md: "text-base leading-6",
      lg: "text-lg leading-7",
      xl: "text-xl leading-8",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
    },
    muted: {
      true: "text-[var(--color-text-secondary)]",
    },
  },
  defaultVariants: { size: "md", weight: "normal" },
});

type TextTag = "p" | "span" | "div" | "li";

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: TextTag;
}

function Text({ className, size, weight, muted, as = "p", children, ...props }: TextProps) {
  return React.createElement(
    as,
    { className: cn(textVariants({ size, weight, muted }), className), ...props },
    children,
  );
}
Text.displayName = "Text";

// ── Caption ────────────────────────────────────────────────────────────────

type CaptionTag = "span" | "p" | "figcaption";

export interface CaptionProps extends React.HTMLAttributes<HTMLElement> {
  as?: CaptionTag;
}

function Caption({ className, as = "span", children, ...props }: CaptionProps) {
  return React.createElement(
    as,
    {
      className: cn(
        "text-xs text-[var(--color-text-muted)] leading-4 tracking-wide uppercase",
        className,
      ),
      ...props,
    },
    children,
  );
}
Caption.displayName = "Caption";

// ── Numeric ────────────────────────────────────────────────────────────────
// For artist attributes, prices, counters — monospaced

export interface NumericProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Highlight with primary color (e.g. price) */
  accent?: boolean;
}

const Numeric = React.forwardRef<HTMLSpanElement, NumericProps>(
  ({ className, accent = false, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "font-[var(--font-mono)] tabular-nums",
        accent ? "text-[var(--color-primary)]" : "text-[var(--color-text-primary)]",
        className,
      )}
      {...props}
    />
  ),
);
Numeric.displayName = "Numeric";

export { Caption, Heading, Numeric, Text };
