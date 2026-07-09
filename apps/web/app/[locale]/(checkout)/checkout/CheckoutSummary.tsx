"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { startCheckout } from "@/src/lib/cart/checkout-client";
import { useCartStore } from "@/src/lib/cart/store";

export function CheckoutSummary({ locale }: { locale: string }) {
  const item = useCartStore((state) => state.item);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const de = locale === "de";

  if (!item) {
    return (
      <div className="text-center" data-testid="checkout-empty">
        <p className="text-[var(--color-text-secondary)]">
          {de ? "Dein Warenkorb ist leer." : "Your cart is empty."}
        </p>
        <Link
          href={`/${locale}/shop`}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-medium text-[var(--color-text-inverse)] transition-colors hover:opacity-90"
        >
          {de ? "Zum Shop" : "Browse the shop"}
        </Link>
      </div>
    );
  }

  const priceLabel = (item.priceCents / 100).toLocaleString(de ? "de-DE" : "en-US", {
    style: "currency",
    currency: item.currency,
  });

  const handlePay = () => {
    setError(null);
    startTransition(async () => {
      const result = await startCheckout(item, locale);
      if (!result.ok) {
        if (result.reason === "unauthorized") {
          window.location.assign(`/${locale}/login`);
          return;
        }
        setError(
          result.message ??
            (de
              ? "Checkout konnte nicht gestartet werden. Bitte erneut versuchen."
              : "Could not start checkout. Please try again."),
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        {item.imageUrl && (
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-[var(--color-background)]">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
        )}
        <div className="flex flex-1 flex-col justify-center gap-1">
          <p className="font-medium text-[var(--color-text-primary)]">{item.title}</p>
          <p className="text-sm text-[var(--color-text-secondary)]">{priceLabel}</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
        <span className="text-sm text-[var(--color-text-secondary)]">
          {de ? "Gesamt" : "Total"}
        </span>
        <span className="font-semibold text-[var(--color-text-primary)]">{priceLabel}</span>
      </div>

      {error && (
        <p className="text-xs text-[var(--color-error)]" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handlePay}
        disabled={isPending}
        data-testid="checkout-pay-button"
        className="w-full rounded-lg bg-[var(--color-primary)] px-6 py-3 font-semibold text-[var(--color-text-inverse)] transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
      >
        {isPending ? (de ? "Wird geladen …" : "Loading …") : de ? "Jetzt bezahlen" : "Pay now"}
      </button>
    </div>
  );
}
