/**
 * Structured logger for server-side code.
 * In production: logs to console (can be replaced with pino/winston).
 * In development: pretty-prints with colors.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown> | undefined;
  requestId?: string | undefined;
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    requestId: (globalThis as unknown as { __requestId?: string }).__requestId,
  };

  // In production, use JSON for structured logging
  if (process.env.NODE_ENV === "production") {
    console.log(JSON.stringify(entry));
  } else {
    const color =
      level === "error" ? "\x1b[31m" :
      level === "warn" ? "\x1b[33m" :
      level === "info" ? "\x1b[36m" :
      "\x1b[90m";
    console.log(`${color}[${entry.level.toUpperCase()}]\x1b[0m ${entry.message}`, context ?? "");
  }
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => log("debug", msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => log("info", msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => log("warn", msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => log("error", msg, ctx),
};
