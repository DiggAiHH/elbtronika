import { describe, it, expect } from "vitest";

/**
 * Shop Demo-Mode Filter Tests
 * Note: The actual filtering happens server-side in shop/page.tsx.
 * These tests verify the filter logic in isolation.
 */

function filterByMode(artworks: Array<{ isDemo?: boolean }>, mode: string) {
  return artworks.filter((artwork) => {
    if (mode === "demo") return artwork.isDemo === true;
    if (mode === "live") return artwork.isDemo !== true;
    return true;
  });
}

describe("Shop — Demo Mode Filtering", () => {
  const artworks = [
    { id: "a1", isDemo: true },
    { id: "a2", isDemo: true },
    { id: "a3", isDemo: false },
    { id: "a4", isDemo: false },
    { id: "a5" }, // undefined isDemo
  ];

  it("demo mode shows only demo artworks", () => {
    const filtered = filterByMode(artworks, "demo");
    expect(filtered).toHaveLength(2);
    expect(filtered.every((a) => a.isDemo === true)).toBe(true);
  });

  it("live mode shows only non-demo artworks", () => {
    const filtered = filterByMode(artworks, "live");
    expect(filtered).toHaveLength(3);
    expect(filtered.every((a) => a.isDemo !== true)).toBe(true);
  });

  it("staging mode shows all artworks", () => {
    const filtered = filterByMode(artworks, "staging");
    expect(filtered).toHaveLength(5);
  });
});
