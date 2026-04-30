/**
 * Audit logging for AI decisions.
 * Every curatorial AI output is written to the ai_decisions table.
 */

import type { AIDecisionLog } from "./types";
import { createHash } from "node:crypto";

export interface AuditStore {
  insert(log: Omit<AIDecisionLog, "id" | "createdAt">): Promise<void>;
  getById(id: string): Promise<AIDecisionLog | null>;
  markOverride(id: string): Promise<void>;
}

export function hashPrompt(prompt: string): string {
  return createHash("sha256").update(prompt).digest("hex").slice(0, 32);
}

export async function logDecision(
  store: AuditStore,
  entry: Omit<AIDecisionLog, "id" | "createdAt" | "promptHash">,
  promptText: string,
): Promise<AIDecisionLog> {
  const log: Omit<AIDecisionLog, "id" | "createdAt"> = {
    ...entry,
    promptHash: hashPrompt(promptText),
  };
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  // Insert with known id so tests can correlate
  await store.insert({ ...log, id, createdAt } as Omit<AIDecisionLog, "id" | "createdAt">);
  return {
    ...log,
    id,
    createdAt,
  };
}

/** In-memory audit store for testing. */
export function createMemoryAuditStore(): AuditStore {
  const logs = new Map<string, AIDecisionLog>();
  return {
    async insert(entry) {
      const id = (entry as AIDecisionLog).id ?? crypto.randomUUID();
      const createdAt =
        (entry as AIDecisionLog).createdAt ?? new Date().toISOString();
      logs.set(id, {
        ...entry,
        id,
        createdAt,
      } as AIDecisionLog);
    },
    async getById(id) {
      return logs.get(id) ?? null;
    },
    async markOverride(id) {
      const log = logs.get(id);
      if (log) {
        log.userOverride = true;
      }
    },
  };
}
