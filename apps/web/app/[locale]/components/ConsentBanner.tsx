"use client";

import { useEffect, useState } from "react";

interface Consent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

function getConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("elbtronika-consent");
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

function setConsent(consent: Consent) {
  if (typeof window === "undefined") return;
  localStorage.setItem("elbtronika-consent", JSON.stringify(consent));
}

export function ConsentBanner({ locale }: { locale: "de" | "en" }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getConsent();
    if (!consent) setVisible(true);
  }, []);

  function acceptAll() {
    const consent: Consent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    setConsent(consent);
    setVisible(false);
    // Send to server
    fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(consent),
    }).catch(() => {});
  }

  function acceptNecessaryOnly() {
    const consent: Consent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    setConsent(consent);
    setVisible(false);
    fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(consent),
    }).catch(() => {});
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label={locale === "de" ? "Cookie-Einwilligung" : "Cookie consent"}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-sm px-4 py-4"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-300">
          {locale === "de"
            ? "Wir verwenden Cookies für grundlegende Funktionen, Analysen und Marketing. Du kannst deine Einwilligung jederzeit widerrufen."
            : "We use cookies for essential functions, analytics, and marketing. You can revoke your consent at any time."}
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={acceptNecessaryOnly}
            className="rounded-md border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            {locale === "de" ? "Nur Notwendige" : "Necessary only"}
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="rounded-md bg-white px-3 py-2 text-xs font-medium text-black hover:bg-zinc-200 transition-colors"
          >
            {locale === "de" ? "Alle akzeptieren" : "Accept all"}
          </button>
        </div>
      </div>
    </div>
  );
}
