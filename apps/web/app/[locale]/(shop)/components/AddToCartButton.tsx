"use client";

import { useCartStore } from "@/src/lib/cart/store";

type Props = {
  locale: string;
  artworkId: string | null;
  artistId: string | null;
  slug: string;
  title: string;
  imageUrl?: string | null;
  priceEur: number | null;
};

export function AddToCartButton({
  locale,
  artworkId,
  artistId,
  slug,
  title,
  imageUrl,
  priceEur,
}: Props) {
  const setItem = useCartStore((state) => state.setItem);
  const disabled = !artworkId || !artistId || priceEur == null;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) {
          return;
        }

        setItem({
          artworkId,
          artistId,
          slug,
          title,
          imageUrl: imageUrl ?? undefined,
          priceCents: Math.round(priceEur * 100),
          currency: "EUR",
        });
      }}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-medium text-[var(--color-text-inverse)] transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {disabled
        ? locale === "de"
          ? "Bald verfuegbar"
          : "Coming soon"
        : locale === "de"
          ? "In den Warenkorb"
          : "Add to cart"}
    </button>
  );
}