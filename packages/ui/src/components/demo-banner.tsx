"use client";

export interface DemoBannerProps {
  mode: "demo" | "staging" | "live";
  version?: string;
}

export function DemoBanner({ mode, version }: DemoBannerProps) {
  if (mode === "live") return null;

  const displayVersion = version ?? "v0.13";

  if (mode === "staging") {
    return (
      <div
        data-testid="staging-banner"
        title="This is a fully-functional pitch demo. Real launch coming soon."
      >
        Internal Staging
      </div>
    );
  }

  return (
    <div
      data-testid="demo-banner"
      title="This is a fully-functional pitch demo. Real launch coming soon."
    >
      Demo Environment — {displayVersion}
    </div>
  );
}
