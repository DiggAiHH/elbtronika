// Client-side checkout starter — shared by CartDrawer and the checkout page.
// POSTs the minimal contract to /api/checkout/session and follows the
// returned Stripe (or demo) URL. Redirect targets are derived server-side.

import type { CartItem } from "./store";

export type StartCheckoutResult =
  | { ok: true }
  | { ok: false; reason: "unauthorized" | "error"; message?: string };

export async function startCheckout(
  item: Pick<CartItem, "artworkId" | "priceCents">,
  locale: string,
): Promise<StartCheckoutResult> {
  let res: Response;
  try {
    res = await fetch("/api/checkout/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artworkId: item.artworkId,
        priceCents: item.priceCents,
        locale: locale === "de" ? "de" : "en",
      }),
    });
  } catch {
    return { ok: false, reason: "error" };
  }

  if (res.status === 401) {
    return { ok: false, reason: "unauthorized" };
  }

  if (!res.ok) {
    let message: string | undefined;
    try {
      message = ((await res.json()) as { error?: string }).error;
    } catch {
      // ignore parse errors — generic message is fine
    }
    return { ok: false, reason: "error", ...(message ? { message } : {}) };
  }

  const data = (await res.json()) as { url?: string | null };
  if (!data.url) {
    return { ok: false, reason: "error" };
  }

  window.location.assign(data.url);
  return { ok: true };
}
