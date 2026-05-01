"use client";

import { Button } from "@elbtronika/ui";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CanvasErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Canvas error boundary caught:", error);
  }, [error]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-neutral-950/90 backdrop-blur-sm text-center">
      <h2 className="text-2xl font-semibold tracking-tight">3D Gallery unavailable</h2>
      <p className="max-w-sm text-sm text-neutral-400">
        The immersive gallery could not be loaded. You can still browse the shop in classic mode.
      </p>
      {error.digest && (
        <p className="text-xs text-neutral-500 font-mono">Error ID: {error.digest}</p>
      )}
      <div className="flex gap-3">
        <Button onClick={reset} variant="primary" size="sm">
          Retry Gallery
        </Button>
        <Button onClick={() => (window.location.href = "/shop")} variant="secondary" size="sm">
          Browse Shop
        </Button>
      </div>
    </div>
  );
}
