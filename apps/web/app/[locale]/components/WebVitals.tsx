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

      // Queue to analytics endpoint (non-blocking)
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/analytics/vitals", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/analytics/vitals", {
          method: "POST",
          body,
          keepalive: true,
        }).catch(() => {});
      }
    }
  });

  return null;
}
