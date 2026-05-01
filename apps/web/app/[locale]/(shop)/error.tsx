"use client";

import { Button } from "@elbtronika/ui";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ShopErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Shop error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-2xl font-bold text-white">Shop Error</h2>
      <p className="text-zinc-400">Something went wrong loading the shop.</p>
      <Button onClick={reset} variant="primary">
        Try Again
      </Button>
    </div>
  );
}
