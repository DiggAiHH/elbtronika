"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

type ElbMode = "demo" | "staging" | "live";

interface EnvContextValue {
  mode: ElbMode;
  isDemo: boolean;
  isStaging: boolean;
  isLive: boolean;
}

const EnvContext = createContext<EnvContextValue | null>(null);

export function EnvProvider({
  children,
  mode,
}: {
  children: ReactNode;
  mode: ElbMode;
}) {
  const value = useMemo<EnvContextValue>(
    () => ({
      mode,
      isDemo: mode === "demo",
      isStaging: mode === "staging",
      isLive: mode === "live",
    }),
    [mode],
  );

  return <EnvContext.Provider value={value}>{children}</EnvContext.Provider>;
}

export function useElbMode(): EnvContextValue {
  const ctx = useContext(EnvContext);
  if (!ctx) {
    throw new Error("useElbMode must be used within <EnvProvider>");
  }
  return ctx;
}
