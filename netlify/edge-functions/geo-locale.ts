/**
 * Netlify Edge Function: Geo-based Locale Detection + Consent Policy
 * Eselbrücke: "Der Grenzbeamte" — prüft Geo-Location, setzt Locale-Cookie
 * und DSGVO/CCPA-konforme Consent-Policy.
 *
 * Path: /edge/geo-locale
 * Deployed to: Netlify Edge (Deno runtime)
 */

import type { Context } from "@netlify/edge-functions";

interface GeoData {
  country: string;
  subdivision: string | null;
  city: string | null;
}

interface ConsentPolicy {
  region: "EU" | "US-CA" | "other";
  strictConsent: boolean;
  analyticsDefault: boolean;
  spatialTrackingDefault: boolean;
}

const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
]);

function detectPolicy(geo: GeoData): ConsentPolicy {
  if (EU_COUNTRIES.has(geo.country)) {
    return {
      region: "EU",
      strictConsent: true,
      analyticsDefault: false,
      spatialTrackingDefault: false,
    };
  }
  if (geo.country === "US") {
    // CCPA applies to California only
    if (geo.subdivision === "CA") {
      return {
        region: "US-CA",
        strictConsent: true,
        analyticsDefault: false,
        spatialTrackingDefault: false,
      };
    }
    return {
      region: "other",
      strictConsent: false,
      analyticsDefault: true,
      spatialTrackingDefault: false,
    };
  }
  // Conservative default for all others
  return {
    region: "other",
    strictConsent: true,
    analyticsDefault: false,
    spatialTrackingDefault: false,
  };
}

export default async function handler(request: Request, context: Context) {
  const geo: GeoData = {
    country: context.geo?.country?.code ?? "UN",
    subdivision: context.geo?.subdivision?.code ?? null,
    city: context.geo?.city ?? null,
  };

  const policy = detectPolicy(geo);

  // Set locale based on country (simplified — real i18n uses Accept-Language)
  const locale = geo.country === "DE" || geo.country === "AT" ? "de" : "en";

  const cookieValue = encodeURIComponent(
    JSON.stringify({
      locale,
      region: policy.region,
      strict: policy.strictConsent,
      ts: Date.now(),
    }),
  );

  // Pass through to the origin with enriched headers
  const response = await context.next();

  // Add consent-policy header for client-side JS to read
  response.headers.set("X-Consent-Region", policy.region);
  response.headers.set("X-Consent-Strict", String(policy.strictConsent));
  response.headers.set("X-Locale", locale);

  // Set cookie
  response.headers.append(
    "Set-Cookie",
    `elt_geo=${cookieValue}; Path=/; Max-Age=86400; Secure; SameSite=Strict`,
  );

  return response;
}
