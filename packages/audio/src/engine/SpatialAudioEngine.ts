/**
 * SpatialAudioEngine – Web Audio API graph for proximity-driven audio.
 *
 * ARCHITECTURE:
 * - One PannerNode per active stream.
 * - Inverse-Square-Law gain calculation (native via PannerNode.distanceModel).
 * - Listener position updated from cameraPosition ref (NOT React state).
 * - DynamicsCompressor pre-destination to prevent clipping.
 * - setTargetAtTime for ALL parameter changes (no pops/clicks).
 *
 * OPTIMIZATIONS (ADR 0016):
 * - setListenerPosition uses setTargetAtTime for smooth listener movement.
 * - setSourcePosition uses setTargetAtTime for smooth source movement.
 * - setListenerOrientation couples camera direction to HRTF forward/up vectors.
 * - Directional audio: coneInnerAngle=60, coneOuterAngle=120, coneOuterGain=0.1
 *   for artwork description sources.
 * - Removed manual computeGain — PannerNode handles this natively with distanceModel="inverse".
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

/** Inverse-square-law gain helper. */
export function computeGain(distance: number, opts: SpatialAudioOptions = {}): number {
  const { refDistance, rolloffFactor, maxDistance } = { ...DEFAULT_OPTIONS, ...opts };
  if (distance <= refDistance) return 1;
  if (distance >= maxDistance) return 0;
  const gain = refDistance / (refDistance + rolloffFactor * (distance - refDistance));
  return Math.max(0, Math.min(1, gain));
}

export interface SourceConfig {
  /** If true, audio is directional (e.g. artwork description). Default: omnidirectional. */
  directional?: boolean;
  /** Inner cone angle in degrees for directional sources. Default: 60. */
  coneInnerAngle?: number;
  /** Outer cone angle in degrees for directional sources. Default: 120. */
  coneOuterAngle?: number;
  /** Gain outside the outer cone. Default: 0.1. */
  coneOuterGain?: number;
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
    config?: SourceConfig,
  ): MediaElementAudioSourceNode {
    if (this.pannerPool.has(trackId)) {
      const existing = this.pannerPool.get(trackId);
      if (existing) {
        return existing.source;
      }
    }

    const source = this.ctx.createMediaElementSource(audioEl);
    const gain = this.ctx.createGain();
    const panner = this.ctx.createPanner();

    panner.panningModel = "HRTF";
    panner.distanceModel = "inverse";
    panner.refDistance = this.opts.refDistance;
    panner.maxDistance = this.opts.maxDistance;
    panner.rolloffFactor = this.opts.rolloffFactor;

    // Directional audio configuration
    if (config?.directional) {
      panner.coneInnerAngle = config.coneInnerAngle ?? 60;
      panner.coneOuterAngle = config.coneOuterAngle ?? 120;
      panner.coneOuterGain = config.coneOuterGain ?? 0.1;
    } else {
      panner.coneInnerAngle = 360;
      panner.coneOuterAngle = 360;
      panner.coneOuterGain = 0;
    }

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

  /** Update listener position from camera (called at ~10Hz, not 60fps).
   *  Uses setTargetAtTime for smooth movement (no audio pops). */
  setListenerPosition(x: number, y: number, z: number): void {
    const listener = this.ctx.listener;
    const now = this.ctx.currentTime;
    const timeConstant = 0.01; // ~10ms smoothing

    if (listener.positionX) {
      // Standard Web Audio API (AudioParam)
      listener.positionX.setTargetAtTime(x, now, timeConstant);
      listener.positionY.setTargetAtTime(y, now, timeConstant);
      listener.positionZ.setTargetAtTime(z, now, timeConstant);
    } else {
      // Fallback for older browsers
      (
        listener as unknown as { setPosition: (x: number, y: number, z: number) => void }
      ).setPosition(x, y, z);
    }
  }

  /** Update listener orientation from camera forward/up vectors.
   *  Essential for HRTF spatial accuracy. */
  setListenerOrientation(
    forwardX: number,
    forwardY: number,
    forwardZ: number,
    upX: number,
    upY: number,
    upZ: number,
  ): void {
    const listener = this.ctx.listener;
    const now = this.ctx.currentTime;
    const timeConstant = 0.01;

    if (listener.forwardX) {
      listener.forwardX.setTargetAtTime(forwardX, now, timeConstant);
      listener.forwardY.setTargetAtTime(forwardY, now, timeConstant);
      listener.forwardZ.setTargetAtTime(forwardZ, now, timeConstant);
      listener.upX.setTargetAtTime(upX, now, timeConstant);
      listener.upY.setTargetAtTime(upY, now, timeConstant);
      listener.upZ.setTargetAtTime(upZ, now, timeConstant);
    } else {
      // Fallback for older browsers
      (
        listener as unknown as {
          setOrientation: (
            fx: number,
            fy: number,
            fz: number,
            ux: number,
            uy: number,
            uz: number,
          ) => void;
        }
      ).setOrientation(forwardX, forwardY, forwardZ, upX, upY, upZ);
    }
  }

  /** Update a source's position (artwork world coordinates).
   *  Uses setTargetAtTime for smooth movement (no pops on rapid updates). */
  setSourcePosition(trackId: string, x: number, y: number, z: number): void {
    const entry = this.pannerPool.get(trackId);
    if (!entry) return;
    const now = this.ctx.currentTime;
    const timeConstant = 0.01;
    entry.panner.positionX.setTargetAtTime(x, now, timeConstant);
    entry.panner.positionY.setTargetAtTime(y, now, timeConstant);
    entry.panner.positionZ.setTargetAtTime(z, now, timeConstant);
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

  /** Dispose all nodes and clear internal state. */
  dispose(): void {
    // Snapshot the keys before iterating because removeSource() mutates pannerPool.
    // Map iterators are spec-stable, but a snapshot keeps dispose() resilient if the
    // implementation later switches to a different container (e.g. WeakMap).
    const ids = [...this.pannerPool.keys()];
    for (const id of ids) {
      this.removeSource(id);
    }
    this.pannerPool.clear();
    this.masterGain.disconnect();
    this.compressor.disconnect();
  }
}
