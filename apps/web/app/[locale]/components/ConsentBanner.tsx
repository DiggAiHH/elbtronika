"use client";

import { useEffect } from "react";
import { Button } from "@elbtronika/ui";
import { useConsentStore } from "@/src/lib/consent/store";

interface Props {
  locale?: "de" | "en";
}

const LABELS = {
  de: {
    title: "Datenschutz-Einstellungen",
    description:
      "Wir verwenden Cookies und Tracking-Technologien, um dein Erlebnis zu verbessern. Du kannst deine Zustimmung jederzeit widerrufen.",
    essential: "Essenziell (erforderlich)",
    analytics: "Analytics (anonymisiert)",
    spatial: "Spatial Tracking (3D-Galerie)",
    marketing: "Marketing",
    acceptAll: "Alle akzeptieren",
    rejectAll: "Nur Essenzielle",
    save: "Speichern",
    manage: "Datenschutz-Einstellungen",
  },
  en: {
    title: "Privacy Settings",
    description:
      "We use cookies and tracking technologies to improve your experience. You can withdraw consent at any time.",
    essential: "Essential (required)",
    analytics: "Analytics (anonymised)",
    spatial: "Spatial Tracking (3D Gallery)",
    marketing: "Marketing",
    acceptAll: "Accept All",
    rejectAll: "Essential Only",
    save: "Save",
    manage: "Privacy Settings",
  },
};

export function ConsentBanner({ locale = "de" }: Props) {
  const {
    choices,
    bannerShown,
    setConsent,
    acceptAll,
    rejectAll,
    showBanner,
    hideBanner,
  } = useConsentStore();

  const t = LABELS[locale];

  // Show banner on first visit if any non-essential choice is undecided
  useEffect(() => {
    const hasDecided =
      choices.analytics !== null &&
      choices.spatial_tracking !== null &&
      choices.marketing !== null;
    if (!hasDecided && !bannerShown) {
      showBanner();
    }
  }, [choices, bannerShown, showBanner]);

  // Sync consent to server when choices change
  useEffect(() => {
    const hasDecided =
      choices.analytics !== null &&
      choices.spatial_tracking !== null &&
      choices.marketing !== null;
    if (!hasDecided) return;

    // Fire-and-forget log to server
    fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        analytics: choices.analytics,
        spatial_tracking: choices.spatial_tracking,
        marketing: choices.marketing,
      }),
    }).catch(() => {
      /* best-effort logging */
    });
  }, [choices]);

  if (!bannerShown) {
    return (
      <button
        onClick={showBanner}
        className="fixed bottom-2 right-2 z-50 rounded-[var(--radius-md)] bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] shadow hover:text-[var(--color-text-primary)]"
      >
        {t.manage}
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-lg">
      <div className="mx-auto max-w-4xl">
        <h3 className="mb-1 text-sm font-semibold text-[var(--color-text-primary)]">
          {t.title}
        </h3>
        <p className="mb-3 text-xs text-[var(--color-text-secondary)]">
          {t.description}
        </p>

        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <ConsentToggle
            label={t.essential}
            checked={true}
            disabled
            onChange={() => {}}
          />
          <ConsentToggle
            label={t.analytics}
            checked={choices.analytics ?? false}
            onChange={(v) => setConsent("analytics", v)}
          />
          <ConsentToggle
            label={t.spatial}
            checked={choices.spatial_tracking ?? false}
            onChange={(v) => setConsent("spatial_tracking", v)}
          />
          <ConsentToggle
            label={t.marketing}
            checked={choices.marketing ?? false}
            onChange={(v) => setConsent("marketing", v)}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={acceptAll}>
            {t.acceptAll}
          </Button>
          <Button variant="secondary" size="sm" onClick={rejectAll}>
            {t.rejectAll}
          </Button>
          <Button variant="ghost" size="sm" onClick={hideBanner}>
            {t.save}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ConsentToggle({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[var(--color-primary)]"
      />
      <span
        className={`text-xs ${disabled ? "text-[var(--color-text-tertiary)]" : "text-[var(--color-text-primary)]"}`}
      >
        {label}
      </span>
    </label>
  );
}
