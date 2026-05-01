import { describe, expect, it, vi } from "vitest";
import { useThreeStore } from "./store";

describe("ThreeStore mode transitions", () => {
  it("starts in immersive mode", () => {
    expect(useThreeStore.getState().mode).toBe("immersive");
  });

  it("transitions to classic via transitionToMode", () => {
    vi.useFakeTimers();
    useThreeStore.getState().transitionToMode("classic");
    expect(useThreeStore.getState().mode).toBe("transitioning");
    vi.advanceTimersByTime(1200);
    expect(useThreeStore.getState().mode).toBe("classic");
    vi.useRealTimers();
  });

  it("transitions to immersive via transitionToMode", () => {
    vi.useFakeTimers();
    useThreeStore.setState({ mode: "classic" });
    useThreeStore.getState().transitionToMode("immersive");
    expect(useThreeStore.getState().mode).toBe("transitioning");
    vi.advanceTimersByTime(1200);
    expect(useThreeStore.getState().mode).toBe("immersive");
    vi.useRealTimers();
  });

  it("is idempotent – ignores transition while already transitioning", () => {
    vi.useFakeTimers();
    useThreeStore.getState().transitionToMode("classic");
    useThreeStore.getState().transitionToMode("immersive");
    expect(useThreeStore.getState().mode).toBe("transitioning");
    vi.advanceTimersByTime(1200);
    // First transition wins
    expect(useThreeStore.getState().mode).toBe("classic");
    vi.useRealTimers();
  });
});
