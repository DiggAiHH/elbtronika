"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as React from "react";
import { cn } from "../lib/cn.js";

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string;
  description?: string;
}

const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id ?? generatedId;

    return (
      <div className="flex items-start gap-[var(--spacing-2)]">
        <CheckboxPrimitive.Root
          id={checkboxId}
          ref={ref}
          className={cn(
            "peer h-4 w-4 shrink-0 mt-0.5",
            "rounded-[var(--radius-sm)] border border-[var(--color-border)]",
            "bg-[var(--color-surface)]",
            "transition-all duration-[var(--duration-fast)]",
            "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-40",
            "data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]",
            className,
          )}
          {...props}
        >
          <CheckboxPrimitive.Indicator className="flex items-center justify-center text-[var(--color-text-inverse)]">
            {/* Checkmark SVG */}
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
              <path
                d="M1 4L3.5 6.5L9 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>

        {(label || description) && (
          <div className="flex flex-col gap-[var(--spacing-1)]">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-sm font-medium text-[var(--color-text-primary)] leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-40"
              >
                {label}
              </label>
            )}
            {description && <p className="text-xs text-[var(--color-text-muted)]">{description}</p>}
          </div>
        )}
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
