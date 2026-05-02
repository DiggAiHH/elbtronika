"use client";

type ElbMode = "demo" | "staging" | "live";

export interface DemoBannerProps {
  mode: ElbMode;
  version?: string;
}

/**
 * DemoBanner — subtle but visible indicator of the current environment mode.
 * - demo: bottom-right, teal badge
 * - staging: top, orange banner
 * - live: hidden
 *
 * Usage in app:
 *   const { mode } = useElbMode();
 *   <DemoBanner mode={mode} />
 */
export function DemoBanner({ mode, version = "v0.13" }: DemoBannerProps) {
  if (mode === "live") return null;

  if (mode === "staging") {
    return (
      <div
        data-testid="staging-banner"
        className="fixed top-0 left-0 right-0 z-50 bg-orange-500/90 text-white text-xs font-semibold px-4 py-1.5 text-center backdrop-blur-sm"
      >
        Internal Staging — Not Public
      </div>
    );
  }

  // Demo mode
  return (
    <div
      data-testid="demo-banner"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-[#00f5d4]/10 border border-[#00f5d4]/20 px-3 py-2 text-xs text-[#00f5d4] backdrop-blur-sm"
      title="This is a fully-functional pitch demo. Real launch coming soon."
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f5d4] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00f5d4]" />
      </span>
      <span className="font-medium">Demo Environment · {version}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-70"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    </div>
  );
}
