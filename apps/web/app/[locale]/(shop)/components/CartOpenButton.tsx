"use client";

import { useTranslations } from "next-intl";
import { useCartStore } from "@/src/lib/cart/store";

export function CartOpenButton() {
  const t = useTranslations("cart");
  const item = useCartStore((state) => state.item);
  const openCart = useCartStore((state) => state.openCart);

  return (
    <button
      type="button"
      onClick={openCart}
      className="inline-flex min-h-11 items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-primary)]/50 hover:text-[var(--color-primary)]"
      aria-label={t("openButtonLabel")}
    >
      <span
        aria-hidden="true"
        className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[var(--color-primary)]/15 px-2 text-xs font-semibold text-[var(--color-primary)]"
      >
        {item ? 1 : 0}
      </span>
      <span>{t("openButtonText")}</span>
    </button>
  );
}
