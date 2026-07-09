// biome-ignore-all lint/performance/noBarrelFile: intentional alias module for a single hook
"use client";

// Re-export from EnvProvider for convenience and discoverability.
// Consumers: import { useElbMode } from "@/src/lib/hooks/useElbMode"
export type { ElbMode } from "@/src/components/providers/EnvProvider";
export { useElbMode } from "@/src/components/providers/EnvProvider";
