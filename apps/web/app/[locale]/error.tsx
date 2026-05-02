"use client";

import { Button } from "@elbtronika/ui";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error tracking service (e.g. Sentry, LogRocket)
    console.error("Root error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Something went wrong</h1>
      <p className="max-w-md text-neutral-400">
        An unexpected error occurred. Please try again or contact support if the problem persists.
      </p>
      {error.digest && (
        <p className="text-sm text-neutral-500 font-mono">Error ID: {error.digest}</p>
      )}
      <div className="flex gap-4">
        <Button onClick={reset} variant="primary">
          Try Again
        </Button>
        <Button onClick={() => (window.location.href = "/")} variant="secondary">
          Go Home
        </Button>
      </div>
    </div>
  );
}
