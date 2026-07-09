"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { startCheckout } from "@/src/lib/cart/checkout-client";
import { useCartStore } from "@/src/lib/cart/store";

export function CartDrawer({ locale = "en" }: { locale?: string }) {
  const { item, isOpen, closeCart, removeItem } = useCartStore();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCheckout = () => {
    if (!item) return;
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
            (locale === "de"
              ? "Checkout konnte nicht gestartet werden. Bitte erneut versuchen."
              : "Could not start checkout. Please try again."),
        );
      }
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={closeCart}
      />

      {/* Drawer */}
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-[#111112] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={locale === "de" ? "Warenkorb" : "Cart"}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <h2 className="font-semibold text-[var(--color-text-primary)]">
            {locale === "de" ? "Warenkorb" : "Cart"}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label={locale === "de" ? "Schließen" : "Close"}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!item ? (
            <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
              {locale === "de" ? "Dein Warenkorb ist leer." : "Your cart is empty."}
            </p>
          ) : (
            <div className="flex gap-4">
              {item.imageUrl && (
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-[var(--color-surface)]">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col gap-1">
                <p className="font-medium text-[var(--color-text-primary)] line-clamp-2">
                  {item.title}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {(item.priceCents / 100).toLocaleString(locale === "de" ? "de-DE" : "en-US", {
                    style: "currency",
                    currency: item.currency,
                  })}
                </p>
                <button
                  type="button"
                  onClick={removeItem}
                  className="mt-1 w-fit text-xs text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
                >
                  {locale === "de" ? "Entfernen" : "Remove"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {item && (
          <div className="border-t border-[var(--color-border)] px-6 py-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-secondary)]">
                {locale === "de" ? "Gesamt" : "Total"}
              </span>
              <span className="font-semibold text-[var(--color-text-primary)]">
                {(item.priceCents / 100).toLocaleString(locale === "de" ? "de-DE" : "en-US", {
                  style: "currency",
                  currency: item.currency,
                })}
              </span>
            </div>
            {error && (
              <p className="mb-3 text-xs text-[var(--color-error)]" role="alert">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isPending}
              data-testid="cart-checkout-button"
              className="w-full rounded-lg bg-[var(--color-primary)] px-6 py-3 font-semibold text-[var(--color-text-inverse)] transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
            >
              {isPending
                ? locale === "de"
                  ? "Wird geladen …"
                  : "Loading …"
                : locale === "de"
                  ? "Zur Kasse"
                  : "Checkout"}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
