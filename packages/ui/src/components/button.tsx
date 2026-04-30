import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../lib/cn";

const buttonVariants = cva(
  // Base styles – using CSS variables defined in globals.css
  [
    "inline-flex items-center justify-center gap-2",
    "rounded-[var(--radius-md)] font-medium text-sm",
    "transition-all duration-[var(--duration-fast)] ease-[var(--ease-default)]",
    "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2",
    "disabled:pointer-events-none disabled:opacity-40",
    "cursor-pointer select-none",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-[var(--color-primary)] text-[var(--color-text-inverse)]",
          "hover:bg-[var(--color-primary-hover)]",
          "active:scale-[0.98]",
        ],
        secondary: [
          "bg-[var(--color-surface)] text-[var(--color-text-primary)]",
          "border border-[var(--color-border)]",
          "hover:bg-[var(--color-surface-hover)]",
        ],
        ghost: [
          "text-[var(--color-text-secondary)]",
          "hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]",
        ],
        destructive: ["bg-[var(--color-error)] text-white", "hover:opacity-90"],
        link: ["text-[var(--color-primary)] underline-offset-4", "hover:underline", "p-0 h-auto"],
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
      loading: {
        true: "pointer-events-none opacity-70",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as child element (Radix Slot pattern) */
  asChild?: boolean;
  /** Show loading spinner */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading = false, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, loading, className }))}
        disabled={props.disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
