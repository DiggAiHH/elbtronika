/**
 * Netlify Edge Function: WebGPU AB-Test + Mode Default
 * Eselbrücke: "Der Türsteher" — erster Request: detect WebGPU, setze Cookie,
 * leite zu Immersive (GPU) oder Classic (keine GPU) weiter.
 *
 * Path: /edge/ab-test
 * Deployed to: Netlify Edge (Deno runtime)
 */

import type { Context } from "@netlify/edge-functions";

interface WebGPUCookie {
  supported: boolean;
  timestamp: number;
}

const COOKIE_NAME = "elt_webgpu";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function parseCookie(header: string | null): WebGPUCookie | null {
  if (!header) return null;
  const match = header.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1])) as WebGPUCookie;
  } catch {
    return null;
  }
}

function setCookie(value: WebGPUCookie): string {
  const encoded = encodeURIComponent(JSON.stringify(value));
  return `${COOKIE_NAME}=${encoded}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Strict`;
}

export default async function handler(request: Request, _context: Context) {
  const url = new URL(request.url);
  const cookieHeader = request.headers.get("cookie");
  const existing = parseCookie(cookieHeader);

  // If cookie already set, redirect based on stored preference
  if (existing) {
    const target = existing.supported ? "/gallery" : "/shop";
    return Response.redirect(new URL(target, url.origin), 302);
  }

  // First visit: detect WebGPU via Accept-CH or user-agent heuristics
  // Note: navigator.gpu is NOT available in Edge Functions (server-side).
  // We rely on client-side detection that sets the cookie via JS,
  // OR we default to classic mode for safety.
  const clientHint = request.headers.get("sec-ch-ua-platform");
  const isDesktop =
    clientHint === '"Windows"' || clientHint === '"macOS"' || clientHint === '"Linux"';

  // Conservative default: assume WebGPU only on desktop Chrome/Edge
  const userAgent = request.headers.get("user-agent") ?? "";
  const isChrome = /Chrome\/(\d+)/.test(userAgent) && !/Edg\//.test(userAgent);
  const isEdge = /Edg\/(\d+)/.test(userAgent);
  const chromeVersion = parseInt(userAgent.match(/Chrome\/(\d+)/)?.[1] ?? "0", 10);
  const edgeVersion = parseInt(userAgent.match(/Edg\/(\d+)/)?.[1] ?? "0", 10);

  const supportsWebGPU =
    (isDesktop && isChrome && chromeVersion >= 113) || (isEdge && edgeVersion >= 113);

  const cookieValue: WebGPUCookie = {
    supported: supportsWebGPU,
    timestamp: Date.now(),
  };

  const target = supportsWebGPU ? "/gallery" : "/shop";

  return new Response(null, {
    status: 302,
    headers: {
      Location: target,
      "Set-Cookie": setCookie(cookieValue),
      "Cache-Control": "private, no-store",
    },
  });
}
