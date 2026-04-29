"use client";

import type { ReactNode } from "react";
import { AudioUnlockOverlay } from "@elbtronika/audio";
import { NowPlayingHUD } from "@elbtronika/audio";
import { useModeTransitionAudio } from "@elbtronika/audio";
import { ModeToggle, TransitionOverlay, useThreeStore } from "@elbtronika/three";

export default function ImmersiveLayout({
  children,
}: {
  children: ReactNode;
}) {
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
