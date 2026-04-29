import type { ReactNode } from "react";
import { AudioUnlockOverlay } from "@elbtronika/audio";
import { NowPlayingHUD } from "@elbtronika/audio";

export default function ImmersiveLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {children}
      <AudioUnlockOverlay />
      <NowPlayingHUD />
    </>
  );
}
