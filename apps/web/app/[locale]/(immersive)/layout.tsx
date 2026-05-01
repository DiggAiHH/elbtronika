"use client";

import { AudioUnlockOverlay, NowPlayingHUD, useModeTransitionAudio } from "@elbtronika/audio";
import { ModeToggle, TransitionOverlay, useThreeStore } from "@elbtronika/three";
import type { ReactNode } from "react";

export default function ImmersiveLayout({ children }: { children: ReactNode }) {
  const mode = useThreeStore((s) => s.mode);
  useModeTransitionAudio(mode);

  return (
    <>
      {children}
      <TransitionOverlay />
      <AudioUnlockOverlay />
      <NowPlayingHUD />
      <ModeToggle />
    </>
  );
}
