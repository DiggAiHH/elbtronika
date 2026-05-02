"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics endpoint
    if (typeof window !== "undefined") {
      // Use navigator.sendBeacon for reliable delivery
      const body = JSON.stringify({
        metric: metric.name,
        value: metric.value,
        id: metric.id,
        startTime: metric.startTime,
        label: metric.label,
        path: window.location.pathname,
      });

      // Wave 6: Only report if user has granted analytics consent
      let analyticsConsented = false;
      try {
        // Try Zustand store format first (elt-consent)
        const stored = localStorage.getItem("elt-consent");
        if (stored) {
          const parsed = JSON.parse(stored) as { state?: { choices?: { analytics?: boolean } } };
          analyticsConsented = parsed?.state?.choices?.analytics === true;
        }
        // Fallback: ConsentBanner format (elbtronika-consent)
        if (!analyticsConsented) {
          const bannerStored = localStorage.getItem("elbtronika-consent");
          if (bannerStored) {
            const bannerParsed = JSON.parse(bannerStored) as { analytics?: boolean };
            analyticsConsented = bannerParsed?.analytics === true;
          }
        }
      } catch {
        // localStorage not available — skip reporting
      }
      if (!analyticsConsented) return;

      // Queue to analytics endpoint with consent signal (non-blocking)
      fetch("/api/analytics/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-consent-analytics": "true" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  });

  return null;
}
