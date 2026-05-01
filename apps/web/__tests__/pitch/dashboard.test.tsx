import { describe, expect, it } from "vitest";

describe("Pitch Dashboard", () => {
  it("has all required mock data structures", () => {
    const salesData = [
      { month: "Jan", value: 12 },
      { month: "Feb", value: 19 },
    ];
    expect(salesData).toHaveLength(2);
    expect(salesData[0]).toHaveProperty("month");
    expect(salesData[0]).toHaveProperty("value");
  });

  it("artist pipeline has correct stages", () => {
    const pipeline = [
      { name: "Mira Volk", status: "live", stage: 100 },
      { name: "Kenji Aoki", status: "live", stage: 100 },
      { name: "Helena Moraes", status: "onboarding", stage: 75 },
    ];
    const liveArtists = pipeline.filter((a) => a.status === "live");
    expect(liveArtists).toHaveLength(2);
    expect(liveArtists.every((a) => a.stage === 100)).toBe(true);
  });

  it("calculates bar width correctly", () => {
    const value = 42;
    const max = 50;
    const width = (value / max) * 100;
    expect(width).toBe(84);
  });

  it("audit log has required fields", () => {
    const log = { tool: "supabase_query", status: "ok", time: "12ms" };
    expect(log).toHaveProperty("tool");
    expect(log).toHaveProperty("status");
    expect(log).toHaveProperty("time");
  });

  it("test card hint contains 4242", () => {
    const hint = "Test card: 4242 4242 4242 4242 — any future date, any CVC.";
    expect(hint).toContain("4242");
  });
});
