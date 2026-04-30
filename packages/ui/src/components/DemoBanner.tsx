"use client";

type ElbMode = "demo" | "staging" | "live";

interface DemoBannerProps {
  mode: ElbMode;
  version?: string;
}

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
    </div>
  );
}