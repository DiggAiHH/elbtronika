"use client";

import { useEffect, useState } from "react";

/**
 * GalleryEntryOverlay — editorial intro panel for the immersive gallery.
 * Fixed to the bottom-left of the first viewport, fades out as the user scrolls.
 * pointer-events: none so it never blocks the 3D canvas interaction.
 */
export default function GalleryEntryOverlay({ locale }: { locale: string }) {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const onScroll = () => {
      const progress = Math.min(window.scrollY / (window.innerHeight * 0.4), 1);
      setOpacity(1 - progress);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed bottom-10 left-6 z-10 pointer-events-none select-none"
      style={{ opacity, transition: "opacity 0.1s linear" }}
      aria-hidden="true"
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/40 mb-1">
        {locale === "de" ? "Immersive Galerie" : "Immersive Gallery"}
      </p>
      <p className="text-sm text-white/60 max-w-[200px] leading-relaxed">
        {locale === "de" ? "Scrolle, um den Raum zu betreten." : "Scroll to enter the space."}
      </p>
      <div className="mt-3 flex items-center gap-1.5">
        <span className="block h-px w-6 bg-white/20" />
        <span className="text-[10px] text-white/30 uppercase tracking-widest">
          {locale === "de" ? "Runterscrollen" : "Scroll down"}
        </span>
      </div>
    </div>
  );
}
