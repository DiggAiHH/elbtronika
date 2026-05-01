"use client";

/**
 * ArtworkAudioPlayer – simple preview player for the shop detail page.
 *
 * NOT spatial audio (that lives in packages/audio for immersive mode).
 * Pure HTMLAudio with Play/Pause and a progress bar.
 */

import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  artworkId: string;
  previewUrl?: string;
}

export function ArtworkAudioPlayer({ artworkId, previewUrl }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setProgress(audio.currentTime);
    const onDuration = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onDuration);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onDuration);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  const percent = duration > 0 ? (progress / duration) * 100 : 0;

  if (!previewUrl) {
    return (
      <div
        className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
        aria-label="No audio preview available"
        data-artwork-id={artworkId}
      >
        <p className="text-xs text-[var(--color-text-muted)]">No audio preview available</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
      data-artwork-id={artworkId}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text)] hover:text-[var(--color-primary)]"
        >
          {isPlaying ? (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="4" height="12" rx="1" fill="currentColor" />
              <rect x="7" y="1" width="4" height="12" rx="1" fill="currentColor" />
            </svg>
          ) : (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true">
              <path d="M1 1l10 6-10 6V1z" fill="currentColor" />
            </svg>
          )}
        </button>
        <span className="text-xs text-[var(--color-text-muted)]">
          {isPlaying ? "Playing preview" : "Play preview"}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden rounded bg-[var(--color-border)]">
        <div
          className="h-full rounded bg-[var(--color-primary)] transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <audio ref={audioRef} src={previewUrl} preload="metadata" />
    </div>
  );
}
