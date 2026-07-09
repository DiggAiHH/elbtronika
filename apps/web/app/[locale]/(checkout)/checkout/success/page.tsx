import { getStripe } from "@elbtronika/payments";
import Link from "next/link";
import { logger } from "@/src/lib/logger";
import { ClearCartOnSuccess } from "./ClearCartOnSuccess";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string; demo?: string }>;
}

// Payment confirmation must never be served from a prerender cache.
export const dynamic = "force-dynamic";

type VerifyResult =
  | { kind: "demo" }
  | { kind: "paid"; orderRef: string | null }
  | { kind: "processing"; orderRef: string | null }
  | { kind: "unknown" };

async function verifySession(sessionId: string | undefined, demo: boolean): Promise<VerifyResult> {
  if (demo) return { kind: "demo" };
  if (!sessionId || sessionId.startsWith("demo_"))
    return sessionId ? { kind: "demo" } : { kind: "unknown" };

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderRef = session.client_reference_id ?? null;
    if (session.payment_status === "paid") return { kind: "paid", orderRef };
    return { kind: "processing", orderRef };
  } catch (err) {
    // Missing key (dev) or Stripe error: stay honest — show "processing",
    // the webhook/order status remains the source of truth.
    logger.warn("[checkout/success] session verify failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return { kind: "processing", orderRef: null };
  }
}

export default async function CheckoutSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { session_id, demo } = await searchParams;
  const de = locale === "de";

  const result = await verifySession(session_id, demo === "1");

  const heading =
    result.kind === "unknown"
      ? de
        ? "Keine Bestellung gefunden"
        : "No order found"
      : de
        ? "Danke für deinen Kauf!"
        : "Thank you for your purchase!";

  const body = (() => {
    switch (result.kind) {
      case "demo":
        return de
          ? "Demo-Modus: Der Kauf wurde simuliert — es wurde nichts berechnet. In der Live-Version bestätigt Stripe hier deine Zahlung."
          : "Demo mode: this purchase was simulated — nothing was charged. In the live version Stripe confirms your payment here.";
      case "paid":
        return de
          ? "Deine Zahlung ist bestätigt. Du erhältst in Kürze eine Bestätigung per E-Mail. Das Werk wird deinem Profil zugeordnet."
          : "Your payment is confirmed. You will receive an email confirmation shortly. The artwork will be linked to your profile.";
      case "processing":
        return de
          ? "Deine Zahlung wird verarbeitet. Sobald sie bestätigt ist, erhältst du eine E-Mail-Bestätigung."
          : "Your payment is being processed. You will receive an email confirmation once it clears.";
      default:
        return de
          ? "Wir konnten keine Checkout-Sitzung finden. Falls du bezahlt hast, prüfe deine E-Mails oder kontaktiere uns."
          : "We could not find a checkout session. If you paid, check your email or contact us.";
    }
  })();

  const showOrderRef = (result.kind === "paid" || result.kind === "processing") && result.orderRef;

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-16">
      {result.kind !== "unknown" && <ClearCartOnSuccess />}
      <div className="mx-auto max-w-xl text-center" data-testid="checkout-success">
        <div
          aria-hidden="true"
          className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-2xl text-[var(--color-primary)]"
        >
          {result.kind === "unknown" ? "?" : "✓"}
        </div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4">{heading}</h1>
        <p className="text-[var(--color-text-secondary)] mb-4">{body}</p>

        {showOrderRef && (
          <p className="mb-8 text-xs text-[var(--color-text-muted)]">
            {de ? "Bestellreferenz:" : "Order reference:"}{" "}
            <span className="font-mono">{result.orderRef}</span>
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={`/${locale}/shop`}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-medium text-[var(--color-text-inverse)] transition-colors hover:opacity-90"
          >
            {de ? "Weiter stöbern" : "Keep browsing"}
          </Link>
          <Link
            href={`/${locale}/gallery`}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-5 py-3 text-sm text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-primary)]/50 hover:text-[var(--color-text-primary)]"
          >
            {de ? "Zur Galerie" : "Visit the gallery"}
          </Link>
        </div>
      </div>
    </main>
  );
}
