import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = (globalThis as any).__audioMocks;

describe("SpatialAudioEngine", () => {
  let SpatialAudioEngine: typeof import("./SpatialAudioEngine").SpatialAudioEngine;
  let engine: InstanceType<typeof SpatialAudioEngine>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    const mod = await import("./SpatialAudioEngine");
    SpatialAudioEngine = mod.SpatialAudioEngine;
    engine = new SpatialAudioEngine();
  });

  it("adds source with directional config", () => {
    const audioEl = document.createElement("audio");
    engine.addSource("track-1", audioEl, {
      directional: true,
      coneInnerAngle: 60,
      coneOuterAngle: 120,
      coneOuterGain: 0.1,
    });

    expect(engine.activeCount).toBe(1);
  });

  it("uses setTargetAtTime for listener position", () => {
    engine.setListenerPosition(1, 2, 3);

    expect(mocks.setTargetAtTime).toHaveBeenCalledWith(
      1,
      expect.any(Number),
      0.01,
    );
  });

  it("uses setTargetAtTime for source position", () => {
    const audioEl = document.createElement("audio");
    engine.addSource("track-1", audioEl);
    engine.setSourcePosition("track-1", 10, 20, 30);

    expect(mocks.setTargetAtTime).toHaveBeenCalledWith(
      10,
      expect.any(Number),
      0.01,
    );
  });

  it("sets listener orientation with setTargetAtTime", () => {
    engine.setListenerOrientation(0, 0, -1, 0, 1, 0);

    expect(mocks.setTargetAtTime).toHaveBeenCalledWith(
      -1,
      expect.any(Number),
      0.01,
    );
    expect(mocks.setTargetAtTime).toHaveBeenCalledWith(
      1,
      expect.any(Number),
      0.01,
    );
  });

  it("disposes all sources", () => {
    const audioEl = document.createElement("audio");
    engine.addSource("track-1", audioEl);
    expect(engine.activeCount).toBe(1);

    engine.dispose();
    expect(engine.activeCount).toBe(0);
  });
});
