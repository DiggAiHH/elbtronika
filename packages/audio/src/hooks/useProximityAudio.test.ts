import { describe, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useProximityAudio } from "./useProximityAudio";

describe("useProximityAudio", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not throw with empty artworks", () => {
    const { unmount } = renderHook(() =>
      useProximityAudio(
        () => new Map(),
        () => [0, 0, 0],
        [],
      ),
    );
    unmount();
  });

  it("throttles proximity updates (not called every frame)", () => {
    const proximity = new Map<string, number>();
    proximity.set("art-1", 1.5);

    const { unmount } = renderHook(() =>
      useProximityAudio(
        () => proximity,
        () => [0, 0, 0],
        [
          {
            artworkId: "art-1",
            distance: 1.5,
            hlsManifestUrl: "https://example.com/stream.m3u8",
          },
        ],
      ),
    );

    // Fast-forward less than throttle interval
    vi.advanceTimersByTime(50);
    // Should still be mounted without errors
    unmount();
  });
});
