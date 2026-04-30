import type { Context } from "@netlify/edge-functions";

/**
 * Edge Proxy — routes API requests and adds request ID tracing.
 * Used for: rate limiting headers, request correlation, path rewriting.
 */

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const requestId = crypto.randomUUID();

  // Add request ID for tracing
  context.log(`[proxy] ${request.method} ${url.pathname} — ${requestId}`);

  // Rate limiting headers (informative — real rate limiting via Netlify API)
  const response = await context.next();
  response.headers.set("X-Request-ID", requestId);
  response.headers.set("X-Proxy-Edge", "true");

  return response;
};

export const config = {
  path: "/api/proxy/*",
};
