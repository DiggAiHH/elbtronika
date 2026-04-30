"use client";

// Re-export from EnvProvider for convenience and discoverability.
// Consumers: import { useElbMode } from "@/src/lib/hooks/useElbMode"
export { useElbMode } from "@/src/components/providers/EnvProvider";
export type { ElbMode } from "@/src/components/providers/EnvProvider";
