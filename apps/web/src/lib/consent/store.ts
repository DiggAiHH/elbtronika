/**
 * Client-side consent state management.
 * Persists choices in localStorage + syncs to Supabase consent_log.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ConsentCategory =
  | "essential"
  | "analytics"
  | "spatial_tracking"
  | "marketing";

export interface ConsentState {
  // Consent choices (null = not yet decided)
  choices: Record<ConsentCategory, boolean | null>;
  // Document version user agreed to
  version: string;
  // Whether banner was shown
  bannerShown: boolean;
  // Actions
  setConsent: (category: ConsentCategory, granted: boolean) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  showBanner: () => void;
  hideBanner: () => void;
}

const CONSENT_VERSION = "2026-04-29-v1";

const DEFAULT_CHOICES: Record<ConsentCategory, boolean | null> = {
  essential: true, // Always true, not toggleable
  analytics: null,
  spatial_tracking: null,
  marketing: null,
};

export const useConsentStore = create<ConsentState>()(
  persist(
    (set) => ({
      choices: { ...DEFAULT_CHOICES },
      version: CONSENT_VERSION,
      bannerShown: false,

      setConsent: (category, granted) =>
        set((state) => ({
          choices: { ...state.choices, [category]: granted },
        })),

      acceptAll: () =>
        set({
          choices: {
            essential: true,
            analytics: true,
            spatial_tracking: true,
            marketing: true,
          },
          bannerShown: false,
        }),

      rejectAll: () =>
        set({
          choices: {
            essential: true,
            analytics: false,
            spatial_tracking: false,
            marketing: false,
          },
          bannerShown: false,
        }),

      showBanner: () => set({ bannerShown: true }),
      hideBanner: () => set({ bannerShown: false }),
    }),
    {
      name: "elt-consent",
    },
  ),
);

export function hasConsent(category: ConsentCategory): boolean {
  return useConsentStore.getState().choices[category] === true;
}

export function isEssentialOnly(): boolean {
  const { choices } = useConsentStore.getState();
  return (
    choices.analytics === false &&
    choices.spatial_tracking === false &&
    choices.marketing === false
  );
}
