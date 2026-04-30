(globalThis as any).__audioMocks = {
  setTargetAtTime: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  setOrientation: vi.fn(),
  setPosition: vi.fn(),
};

const m = (globalThis as any).__audioMocks;

class MockAudioContext {
  state = "suspended";
  listener = {
    positionX: { value: 0, setTargetAtTime: m.setTargetAtTime },
    positionY: { value: 0, setTargetAtTime: m.setTargetAtTime },
    positionZ: { value: 0, setTargetAtTime: m.setTargetAtTime },
    forwardX: { value: 0, setTargetAtTime: m.setTargetAtTime },
    forwardY: { value: 0, setTargetAtTime: m.setTargetAtTime },
    forwardZ: { value: 0, setTargetAtTime: m.setTargetAtTime },
    upX: { value: 0, setTargetAtTime: m.setTargetAtTime },
    upY: { value: 0, setTargetAtTime: m.setTargetAtTime },
    upZ: { value: 0, setTargetAtTime: m.setTargetAtTime },
    setOrientation: m.setOrientation,
    setPosition: m.setPosition,
  };
  currentTime = 0;

  resume() {
    this.state = "running";
    return Promise.resolve();
  }

  createGain() {
    return {
      gain: { value: 1, setTargetAtTime: m.setTargetAtTime },
      connect: m.connect,
      disconnect: m.disconnect,
    };
  }

  createPanner() {
    return {
      panningModel: "",
      distanceModel: "",
      refDistance: 1,
      maxDistance: 100,
      rolloffFactor: 1,
      coneInnerAngle: 360,
      coneOuterAngle: 360,
      positionX: { value: 0, setTargetAtTime: m.setTargetAtTime },
      positionY: { value: 0, setTargetAtTime: m.setTargetAtTime },
      positionZ: { value: 0, setTargetAtTime: m.setTargetAtTime },
      connect: m.connect,
      disconnect: m.disconnect,
    };
  }

  createDynamicsCompressor() {
    return {
      threshold: { value: 0 },
      knee: { value: 0 },
      ratio: { value: 0 },
      attack: { value: 0 },
      release: { value: 0 },
      connect: m.connect,
      disconnect: m.disconnect,
    };
  }

  createMediaElementSource() {
    return {
      connect: m.connect,
      disconnect: m.disconnect,
    };
  }

  createDelay() {
    return {
      delayTime: { value: 0, setTargetAtTime: m.setTargetAtTime },
      connect: m.connect,
      disconnect: m.disconnect,
    };
  }

  get destination() {
    return { connect: m.connect, disconnect: m.disconnect } as AudioDestinationNode;
  }
}

// @ts-expect-error mock for jsdom
globalThis.AudioContext = MockAudioContext;
// @ts-expect-error mock for jsdom
globalThis.sessionStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};
