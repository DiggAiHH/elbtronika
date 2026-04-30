/**
 * Feature detection for WebGPU support.
 * Runs client-side only – server-side rendering returns null.
 *
 * ARCHITECTURE NOTE (ADR 0007):
 * We cannot detect navigator.gpu server-side. Instead, the client detects
 * once, stores in a cookie, and the Netlify Edge Function reads it to decide
 * which asset quality tier to serve on subsequent requests.
 */

const COOKIE_NAME = "elt_webgpu";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/** Returns true if WebGPU is available in this browser. */
export async function detectWebGPU(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!("gpu" in navigator)) return false;
  try {
    const adapter = await (
      navigator as unknown as { gpu: { requestAdapter: () => Promise<unknown> } }
    ).gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
}

/** Persists WebGPU capability to a cookie for Edge Function consumption. */
export function setWebGPUCookie(supported: boolean): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${supported ? "1" : "0"}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/** Reads the cached WebGPU cookie. Returns null if not yet set. */
export function getWebGPUCookie(): boolean | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  return match.split("=")[1] === "1";
}
