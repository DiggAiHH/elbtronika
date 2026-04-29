/**
 * SpatialAudioEngine – Web Audio API graph for proximity-driven audio.
 *
 * ARCHITECTURE:
 * - One PannerNode per active stream.
 * - Inverse-Square-Law gain calculation.
 * - Listener position updated from cameraPosition ref (NOT React state).
 * - DynamicsCompressor pre-destination to prevent clipping.
 * - setTargetAtTime for smooth gain transitions (no pops/clicks).
 */

import { getAudioContext } from "../context";

export interface SpatialAudioOptions {
  /** Distance at which gain = 1 (world units) */
  refDistance?: number;
  /** Distance at which gain approaches 0 (world units) */
  maxDistance?: number;
  /** How fast gain drops off (1 = realistic) */
  rolloffFactor?: number;
}

const DEFAULT_OPTIONS: Required<SpatialAudioOptions> = {
  refDistance: 2,
  maxDistance: 50,
  rolloffFactor: 1,
};

/** Inverse-square-law gain calculation. */
export function computeGain(
  distance: number,
  opts: SpatialAudioOptions = {},
): number {
  const { refDistance, rolloffFactor, maxDistance } = { ...DEFAULT_OPTIONS, ...opts };
  if (distance <= refDistance) return 1;
  if (distance >= maxDistance) return 0;
  const gain =
    refDistance / (refDistance + rolloffFactor * (distance - refDistance));
  return Math.max(0, Math.min(1, gain));
}

export class SpatialAudioEngine {
  private ctx: AudioContext;
  private compressor: DynamicsCompressorNode;
  private masterGain: GainNode;
  private pannerPool = new Map<
    string,
    { panner: PannerNode; gain: GainNode; source: MediaElementAudioSourceNode }
  >();
  private opts: Required<SpatialAudioOptions>;

  constructor(opts: SpatialAudioOptions = {}) {
    this.ctx = getAudioContext();
    this.opts = { ...DEFAULT_OPTIONS, ...opts };

    // Master gain for volume control
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.8;

    // Compressor pre-destination prevents clipping with many sources
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 30;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;

    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);
  }

  /** Connect a new <audio> element to the spatial graph. */
  addSource(
    trackId: string,
    audioEl: HTMLAudioElement,
  ): MediaElementAudioSourceNode {
    if (this.pannerPool.has(trackId)) {
      return this.pannerPool.get(trackId)!.source;
    }

    const source = this.ctx.createMediaElementSource(audioEl);
    const gain = this.ctx.createGain();
    const panner = this.ctx.createPanner();

    panner.panningModel = "HRTF";
    panner.distanceModel = "inverse";
    panner.refDistance = this.opts.refDistance;
    panner.maxDistance = this.opts.maxDistance;
    panner.rolloffFactor = this.opts.rolloffFactor;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 360;

    source.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);

    this.pannerPool.set(trackId, { panner, gain, source });
    return source;
  }

  /** Remove a source and dispose its nodes. */
  removeSource(trackId: string): void {
    const entry = this.pannerPool.get(trackId);
    if (!entry) return;
    entry.source.disconnect();
    entry.gain.disconnect();
    entry.panner.disconnect();
    this.pannerPool.delete(trackId);
  }

  /** Update listener position from camera (called at ~10Hz, not 60fps). */
  setListenerPosition(x: number, y: number, z: number): void {
    const listener = this.ctx.listener;
    if (listener.positionX) {
      // Standard Web Audio API
      listener.positionX.value = x;
      listener.positionY.value = y;
      listener.positionZ.value = z;
    } else {
      // Fallback for older browsers
      (listener as unknown as { setPosition: (x: number, y: number, z: number) => void }).setPosition(x, y, z);
    }
  }

  /** Update a source's position (artwork world coordinates). */
  setSourcePosition(trackId: string, x: number, y: number, z: number): void {
    const entry = this.pannerPool.get(trackId);
    if (!entry) return;
    entry.panner.positionX.value = x;
    entry.panner.positionY.value = y;
    entry.panner.positionZ.value = z;
  }

  /** Smoothly set gain for a source using setTargetAtTime. */
  setSourceGain(trackId: string, targetGain: number, timeConstant = 0.1): void {
    const entry = this.pannerPool.get(trackId);
    if (!entry) return;
    const now = this.ctx.currentTime;
    entry.gain.gain.setTargetAtTime(targetGain, now, timeConstant);
  }

  /** Set master volume (0..1). */
  setMasterVolume(vol: number): void {
    const now = this.ctx.currentTime;
    this.masterGain.gain.setTargetAtTime(vol, now, 0.1);
  }

  /** Active source count. */
  get activeCount(): number {
    return this.pannerPool.size;
  }

  /** Dispose all nodes. */
  dispose(): void {
    for (const [id] of this.pannerPool) {
      this.removeSource(id);
    }
    this.masterGain.disconnect();
    this.compressor.disconnect();
  }
}
