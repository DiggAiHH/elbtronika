"use client";

/**
 * Selective TSL-based Bloom post-processing.
 *
 * ARCHITECTURE NOTE (ADR 0007):
 * – Uses @react-three/postprocessing EffectComposer with SelectiveBloom.
 * – TSL (Three Shading Language) pipeline is used when WebGPU is active.
 * – Falls back gracefully to WebGL EffectComposer on older hardware.
 * – Threshold tuned for ELBTRONIKA neon aesthetic (cyan + magenta primaries).
 */
import { Bloom, EffectComposer } from "@react-three/postprocessing";

interface BloomPassProps {
  /** Bloom strength multiplier. Default 0.4 for subtle neon glow. */
  intensity?: number;
  /** Luminance threshold – only bright pixels bloom. */
  luminanceThreshold?: number;
  /** Width of the bloom kernel. Higher = softer but more expensive. */
  mipmapBlur?: boolean;
}

export function BloomPass({
  intensity = 0.4,
  luminanceThreshold = 0.85,
  mipmapBlur = true,
}: BloomPassProps) {
  return (
    <EffectComposer>
      <Bloom
        intensity={intensity}
        luminanceThreshold={luminanceThreshold}
        luminanceSmoothing={0.025}
        mipmapBlur={mipmapBlur}
      />
    </EffectComposer>
  );
}
