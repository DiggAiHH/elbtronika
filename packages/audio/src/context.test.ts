import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAudioContext, unlockAudioContext, isUnlocked } from "./context";

describe("unlockAudioContext", () => {
  beforeEach(() => {
    // Reset module state by clearing the internal audioContext
    // Note: In real vitest with isolateModules this isn't needed,
    // but we guard against sequential test pollution.
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    });
  });

  it("is idempotent – multiple calls do not throw", async () => {
    await unlockAudioContext();
    await unlockAudioContext();
    await unlockAudioContext();
    expect(getAudioContext().state).toBe("running");
  });

  it("sets sessionStorage flag after unlock", async () => {
    await unlockAudioContext();
    expect(sessionStorage.setItem).toHaveBeenCalledWith("elt_audio_unlocked", "1");
  });

  it("isUnlocked returns true after unlock", async () => {
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn(() => "1"),
      setItem: vi.fn(),
    });
    expect(isUnlocked()).toBe(true);
  });
});
