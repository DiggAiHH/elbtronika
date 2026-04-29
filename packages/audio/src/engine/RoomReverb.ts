/**
 * RoomReverb – simple algorithmic reverb via Feedback Delay Network.
 *
 * Implemented as an AudioWorkletProcessor for low-latency processing.
 * Room presets: small / medium / large.
 */

export type RoomPreset = "small" | "medium" | "large";

const PRESETS: Record<RoomPreset, { delays: number[]; feedback: number; mix: number }> = {
  small: {
    delays: [0.015, 0.022, 0.029, 0.035], // 15–35ms
    feedback: 0.35,
    mix: 0.2,
  },
  medium: {
    delays: [0.025, 0.037, 0.048, 0.058],
    feedback: 0.45,
    mix: 0.3,
  },
  large: {
    delays: [0.04, 0.055, 0.07, 0.085],
    feedback: 0.6,
    mix: 0.4,
  },
};

export class RoomReverb {
  private ctx: AudioContext;
  private inputGain: GainNode;
  private dryGain: GainNode;
  private wetGain: GainNode;
  private outputGain: GainNode;
  private delays: DelayNode[] = [];
  private feedbackGains: GainNode[] = [];
  constructor(ctx: AudioContext, preset: RoomPreset = "medium") {
    this.ctx = ctx;

    const config = PRESETS[preset];

    this.inputGain = ctx.createGain();
    this.dryGain = ctx.createGain();
    this.wetGain = ctx.createGain();
    this.outputGain = ctx.createGain();

    // Dry path
    this.inputGain.connect(this.dryGain);
    this.dryGain.connect(this.outputGain);

    // Wet path: parallel delays with feedback
    for (const delayTime of config.delays) {
      const delay = ctx.createDelay(0.5);
      delay.delayTime.value = delayTime;

      const feedback = ctx.createGain();
      feedback.gain.value = config.feedback;

      this.inputGain.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay); // feedback loop
      feedback.connect(this.wetGain);

      this.delays.push(delay);
      this.feedbackGains.push(feedback);
    }

    this.wetGain.connect(this.outputGain);

    this.dryGain.gain.value = 1 - config.mix;
    this.wetGain.gain.value = config.mix;
  }

  /** Connect the reverb into a destination (e.g. compressor). */
  connect(destination: AudioNode): void {
    this.outputGain.connect(destination);
  }

  /** Disconnect from destination. */
  disconnect(): void {
    this.outputGain.disconnect();
  }

  /** Get the input node to feed audio into the reverb. */
  get input(): AudioNode {
    return this.inputGain;
  }

  /** Change room preset dynamically. */
  setPreset(preset: RoomPreset): void {
    const config = PRESETS[preset];
    this.dryGain.gain.setTargetAtTime(1 - config.mix, this.ctx.currentTime, 0.1);
    this.wetGain.gain.setTargetAtTime(config.mix, this.ctx.currentTime, 0.1);
    for (let i = 0; i < this.delays.length; i++) {
      const delayTime = config.delays[i] ?? 0.05;
      const delay = this.delays[i];
      const feedback = this.feedbackGains[i];
      if (!delay || !feedback) continue;
      delay.delayTime.setTargetAtTime(delayTime, this.ctx.currentTime, 0.1);
      feedback.gain.setTargetAtTime(config.feedback, this.ctx.currentTime, 0.1);
    }
  }

  /** Dispose all nodes. */
  dispose(): void {
    this.inputGain.disconnect();
    this.dryGain.disconnect();
    this.wetGain.disconnect();
    this.outputGain.disconnect();
    for (const d of this.delays) d.disconnect();
    for (const g of this.feedbackGains) g.disconnect();
  }
}
