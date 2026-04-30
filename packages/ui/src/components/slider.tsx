"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";
import { cn } from "../lib/cn";

export interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, label, showValue = false, formatValue, id, ...props }, ref) => {
    const generatedId = React.useId();
    const sliderId = id ?? generatedId;
    const currentValue = props.value ?? props.defaultValue ?? [0];
    const rawDisplay = Array.isArray(currentValue) ? currentValue[0] : currentValue;
    const displayValue: number = rawDisplay ?? 0;
    const formatted = formatValue ? formatValue(displayValue) : String(displayValue);

    return (
      <div className="flex flex-col gap-[var(--spacing-2)]">
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && (
              <label
                htmlFor={sliderId}
                className="text-sm font-medium text-[var(--color-text-primary)]"
              >
                {label}
              </label>
            )}
            {showValue && (
              <span
                className="text-xs text-[var(--color-text-secondary)] tabular-nums"
                aria-live="polite"
              >
                {formatted}
              </span>
            )}
          </div>
        )}
        <SliderPrimitive.Root
          id={sliderId}
          ref={ref}
          className={cn(
            "relative flex w-full touch-none select-none items-center",
            "disabled:pointer-events-none disabled:opacity-40",
            className,
          )}
          {...props}
        >
          {/* Track */}
          <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-[var(--color-border)]">
            <SliderPrimitive.Range className="absolute h-full bg-[var(--color-primary)]" />
          </SliderPrimitive.Track>

          {/* Thumb(s) */}
          {(Array.isArray(currentValue) ? currentValue : [currentValue]).map((v) => (
            <SliderPrimitive.Thumb
              key={String(v)}
              className={cn(
                "block h-4 w-4 rounded-full",
                "bg-[var(--color-primary)]",
                "border-2 border-[var(--color-background)]",
                "ring-offset-[var(--color-background)]",
                "transition-transform duration-[var(--duration-fast)]",
                "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2",
                "hover:scale-110 active:scale-95",
              )}
            />
          ))}
        </SliderPrimitive.Root>
      </div>
    );
  },
);
Slider.displayName = "Slider";

export { Slider };
