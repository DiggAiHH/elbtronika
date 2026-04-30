export type ShopFilterState = {
  artist?: string;
  dj?: string;
  medium?: string;
  minPrice?: string;
  maxPrice?: string;
};

export type ShopFilterPatch = {
  [Key in keyof ShopFilterState]?: string | null;
};

export function buildShopFilterHref(
  locale: string,
  current: ShopFilterState,
  patch: ShopFilterPatch,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(current)) {
    if (typeof value === "string" && value.length > 0) {
      params.set(key, value);
    }
  }

  for (const [key, value] of Object.entries(patch)) {
    if (typeof value === "string" && value.length > 0) {
      params.set(key, value);
      continue;
    }

    params.delete(key);
  }

  const query = params.toString();
  return query ? `/${locale}/shop?${query}` : `/${locale}/shop`;
}

export function isNonEmptyString(value: string | undefined): value is string {
  return typeof value === "string" && value.length > 0;
}

export function portableTextToPlainText(value: unknown) {
  if (typeof value === "string") {
    return value.trim() || null;
  }

  if (!Array.isArray(value)) {
    return null;
  }

  const text = value
    .flatMap((block) => {
      if (!block || typeof block !== "object" || !("children" in block)) {
        return [];
      }

      const children = (block as { children?: Array<{ text?: string }> }).children;
      if (!Array.isArray(children)) {
        return [];
      }

      return children.map((child) => child.text ?? "");
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return text || null;
}

export function formatArtworkPrice(value: number | null | undefined, locale: string) {
  if (value == null) {
    return fallbackLabel(locale);
  }

  return new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatEditionSummary(total: number | null, sold: number | null, locale: string) {
  if (!total) {
    return fallbackLabel(locale);
  }

  const soldCount = sold ?? 0;
  return locale === "de" ? `${soldCount} von ${total} verkauft` : `${soldCount} of ${total} sold`;
}

export function fallbackLabel(locale: string) {
  return locale === "de" ? "Noch offen" : "Pending";
}