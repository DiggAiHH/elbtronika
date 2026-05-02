"use client";

import { Button } from "@elbtronika/ui";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ShopErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Shop error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-2xl font-semibold">Shop temporarily unavailable</h2>
      <p className="max-w-sm text-neutral-400">
        We could not load the shop. Please try again or browse the gallery instead.
      </p>
      {error.digest && (
        <p className="text-xs text-neutral-500 font-mono">Error ID: {error.digest}</p>
      )}
      <div className="flex gap-3">
        <Button onClick={reset} variant="primary" size="sm">
          Retry
        </Button>
        <Button onClick={() => (window.location.href = "/")} variant="secondary" size="sm">
          Back to Gallery
        </Button>
      </div>
    </div>
  );
}
