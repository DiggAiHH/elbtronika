class MockAudioContext {
  state = "suspended";
  listener = {
    positionX: { value: 0 },
    positionY: { value: 0 },
    positionZ: { value: 0 },
    setPosition: () => {},
  };
  currentTime = 0;

  resume() {
    this.state = "running";
    return Promise.resolve();
  }

  createGain() {
    return {
      gain: { value: 1, setTargetAtTime: () => {} },
      connect: () => {},
      disconnect: () => {},
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
      positionX: { value: 0 },
      positionY: { value: 0 },
      positionZ: { value: 0 },
      connect: () => {},
      disconnect: () => {},
    };
  }

  createDynamicsCompressor() {
    return {
      threshold: { value: 0 },
      knee: { value: 0 },
      ratio: { value: 0 },
      attack: { value: 0 },
      release: { value: 0 },
      connect: () => {},
      disconnect: () => {},
    };
  }

  createMediaElementSource() {
    return {
      connect: () => {},
      disconnect: () => {},
    };
  }

  createDelay() {
    return {
      delayTime: { value: 0, setTargetAtTime: () => {} },
      connect: () => {},
      disconnect: () => {},
    };
  }

  get destination() {
    return {} as AudioDestinationNode;
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
