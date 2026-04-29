import { describe, it, expect } from "vitest";
import { computeGain } from "./SpatialAudioEngine";

describe("computeGain (Inverse-Square-Law)", () => {
  it("returns 1 at refDistance or closer", () => {
    expect(computeGain(0)).toBe(1);
    expect(computeGain(1)).toBe(1);
    expect(computeGain(2)).toBe(1);
  });

  it("halves gain at refDistance + rolloffFactor * refDistance", () => {
    // ref=2, rolloff=1 => at distance=4 => 2/(2+1*(4-2)) = 2/4 = 0.5
    expect(computeGain(4)).toBe(0.5);
  });

  it("approaches 0 at large distances", () => {
    const gain = computeGain(40); // below maxDistance=50, should be small
    expect(gain).toBeGreaterThan(0);
    expect(gain).toBeLessThan(0.1);
  });

  it("clamps to 0..1", () => {
    expect(computeGain(-5)).toBe(1);
    expect(computeGain(1000)).toBe(0);
  });
});
