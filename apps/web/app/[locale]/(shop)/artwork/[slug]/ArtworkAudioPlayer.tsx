"use client";

// Audio preview player stub for Phase 6.
// Full HLS spatial audio integration is Phase 8 (packages/audio).
// This renders a placeholder that Phase 8 will replace with real HLS playback.
export function ArtworkAudioPlayer({ artworkId }: { artworkId: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
      aria-label="Audio preview – available in gallery mode"
      data-artwork-id={artworkId}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)]">
        <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true">
          <path d="M1 1l10 6-10 6V1z" fill="currentColor" />
        </svg>
      </div>
      <p className="text-xs text-[var(--color-text-muted)]">
        Audio preview · available in gallery mode
      </p>
    </div>
  );
}
