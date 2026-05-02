export async function onRequest(request: Request, _context: { requestId: string }): Promise<void> {
  // Attach request start time for server-side latency tracking
  (request as Request & { __startTime?: number }).__startTime = Date.now();
}

export async function onError(err: Error, request: Request): Promise<void> {
  // Log server errors for monitoring
  console.error("[Instrumentation] Server error:", err.message, {
    url: request.url,
    method: request.method,
  });
}
