import { describe, expect, it } from "vitest";
import {
  buildShopFilterHref,
  fallbackLabel,
  formatArtworkPrice,
  formatEditionSummary,
  portableTextToPlainText,
} from "../../src/lib/shop";

describe("shop utilities", () => {
  it("builds filter URLs while preserving existing params", () => {
    expect(
      buildShopFilterHref("de", { artist: "eva-richter", medium: "photography" }, { dj: "dj-koi" }),
    ).toBe("/de/shop?artist=eva-richter&medium=photography&dj=dj-koi");
  });

  it("removes a filter when patch value is null", () => {
    expect(
      buildShopFilterHref(
        "en",
        { artist: "eva-richter", dj: "dj-koi", medium: "digital" },
        { artist: null },
      ),
    ).toBe("/en/shop?dj=dj-koi&medium=digital");
  });

  it("flattens portable text blocks into plain text", () => {
    expect(
      portableTextToPlainText([
        {
          _type: "block",
          children: [{ text: "Licht" }, { text: "fragment" }],
        },
        {
          _type: "block",
          children: [{ text: "im" }, { text: "Clubraum" }],
        },
      ]),
    ).toBe("Licht fragment im Clubraum");
  });

  it("formats commerce copy for price and edition", () => {
    expect(formatArtworkPrice(1200, "de")).toContain("1.200");
    expect(formatEditionSummary(5, 2, "en")).toBe("2 of 5 sold");
  });

  it("returns locale-aware fallback labels", () => {
    expect(fallbackLabel("de")).toBe("Noch offen");
    expect(fallbackLabel("en")).toBe("Pending");
  });
});
