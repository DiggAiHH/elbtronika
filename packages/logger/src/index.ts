/**
 * @elbtronika/logger — isomorphic structured logger for shared packages.
 *
 * Same call shape as apps/web/src/lib/logger (message + context object) so
 * call sites read identically across the monorepo, plus a namespace so
 * package logs are attributable: createLogger("payments").error("…", { … }).
 *
 * Browser + node safe: no node builtins, single console sink. In production
 * (server) it emits one JSON line per entry for log collectors; in the
 * browser and in dev it stays human-readable.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  [key: string]: unknown;
}

export interface Logger {
  debug: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, context?: LogContext) => void;
}

const isBrowser = typeof window !== "undefined";

function emit(namespace: string, level: LogLevel, message: string, context?: LogContext): void {
  const sink =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : // biome-ignore lint/suspicious/noConsole: this IS the logger sink
          console.log;

  if (!isBrowser && process.env.NODE_ENV === "production") {
    sink(
      JSON.stringify({
        level,
        ns: namespace,
        message,
        timestamp: new Date().toISOString(),
        ...(context ? { context } : {}),
      }),
    );
    return;
  }

  sink(`[${level.toUpperCase()}][${namespace}] ${message}`, context ?? "");
}

/** Create a namespaced logger, e.g. `const log = createLogger("payments")`. */
export function createLogger(namespace: string): Logger {
  return {
    debug: (message, context) => emit(namespace, "debug", message, context),
    info: (message, context) => emit(namespace, "info", message, context),
    warn: (message, context) => emit(namespace, "warn", message, context),
    error: (message, context) => emit(namespace, "error", message, context),
  };
}
