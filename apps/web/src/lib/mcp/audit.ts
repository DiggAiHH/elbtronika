/**
 * MCP Audit Logger
 * Wave 1 final: Dual-mode logging.
 * - Always writes structured JSON to console.log (fallback, zero dependency)
 * - If MCP_AUDIT_DB=true, additionally persists to Supabase mcp_audit_log table
 */

import { createClient } from "@supabase/supabase-js";
import { logger } from "@/src/lib/logger";

export interface AuditEvent {
  actorId: string;
  role: string;
  server: string;
  tool: string;
  status: "ok" | "denied" | "error";
  durationMs?: number;
  errorClass?: string;
  requestHash?: string;
}

function toStatus(status: number | string): "ok" | "denied" | "error" {
  if (typeof status === "string") return status as "ok" | "denied" | "error";
  if (status >= 200 && status < 300) return "ok";
  if (status === 403 || status === 401 || status === 404) return "denied";
  return "error";
}

/**
 * Log an audit event.
 * @param event — structured audit data (no secrets, no tokens)
 */
export async function logAuditEvent(event: {
  actorId: string;
  role: string;
  server: string;
  tool: string;
  status: number | string;
  durationMs?: number;
  errorClass?: string;
  requestHash?: string;
}): Promise<void> {
  const normalizedStatus = toStatus(event.status);

  // 1. Console fallback — always works, zero dependencies
  console.log(
    JSON.stringify({
      event: "mcp_invoke",
      ts: new Date().toISOString(),
      actorId: event.actorId,
      role: event.role,
      server: event.server,
      tool: event.tool,
      status: normalizedStatus,
      durationMs: event.durationMs,
      errorClass: event.errorClass,
      requestHash: event.requestHash,
    }),
  );

  // 2. DB persistence — behind feature flag
  if (process.env.MCP_AUDIT_DB === "true") {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !serviceKey) return;
      const admin = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { error } = await admin.from("mcp_audit_log").insert({
        actor_id: event.actorId,
        role: event.role,
        server: event.server,
        tool: event.tool,
        status: normalizedStatus,
        duration_ms: event.durationMs ?? null,
        error_class: event.errorClass ?? null,
        request_hash: event.requestHash ?? null,
      });

      if (error) {
        logger.error("[audit] DB insert failed", { message: error.message });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("[audit] DB client failed", { message });
      // Never throw — audit must not break the main flow
    }
  }
}
