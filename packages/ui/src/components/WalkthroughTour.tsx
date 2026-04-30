"use client";

import { useState, useEffect, useCallback } from "react";

export interface TourStep {
  title: string;
  description: string;
}

interface WalkthroughTourProps {
  steps?: TourStep[];
  locale?: string;
  delayMs?: number;
  storageKey?: string;
}

const defaultStepsDe: TourStep[] = [
  { title: "Willkommen", description: "Das ist ELBTRONIKA — wo Kunst auf Frequenz trifft." },
  { title: "3D-Navigation", description: "Scrolle durch die Galerie. Die Kamera folgt deinem Blick." },
  { title: "Audio-Proximity", description: "Je näher du einem Werk kommst, desto intensiver der Sound." },
  { title: "Artwork-Detail", description: "Klicke auf ein Werk — Story, Künstler, Preis." },
  { title: "Checkout", description: "Erwerbe limitierte Werke. Der Split ist transparent: 60/20/20." },
];

const defaultStepsEn: TourStep[] = [
  { title: "Welcome", description: "This is ELBTRONIKA — where art meets frequency." },
  { title: "3D Navigation", description: "Scroll through the gallery. The camera follows your gaze." },
  { title: "Audio Proximity", description: "The closer you get to a piece, the more intense the sound." },
  { title: "Artwork Detail", description: "Click a piece — story, artist, price." },
  { title: "Checkout", description: "Acquire limited editions. The split is transparent: 60/20/20." },
];

export function WalkthroughTour({
  steps = [],
  locale = "de",
  delayMs = 2000,
  storageKey = "elt-tour-dismissed",
}: WalkthroughTourProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const effectiveSteps = steps.length > 0 ? steps : locale === "de" ? defaultStepsDe : defaultStepsEn;

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey);
    if (dismissed) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs, storageKey]);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem(storageKey, "true");
  }, [storageKey]);

  const nextStep = useCallback(() => {
    if (currentStep < effectiveSteps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      dismiss();
    }
  }, [currentStep, effectiveSteps.length, dismiss]);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  if (!isVisible) return null;

  const step = effectiveSteps[currentStep];
  if (!step) return null;
  const isLast = currentStep === effectiveSteps.length - 1;

  return (
    <div
      data-testid="walkthrough-tour"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-[#0a0a0f] border border-white/[0.08] p-6 shadow-2xl">
        {/* Step indicator */}
        <div className="flex gap-1.5 mb-6">
          {effectiveSteps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full flex-1 transition-colors ${
                i <= currentStep ? "bg-[#00f5d4]" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
        <p className="text-white/60 text-sm leading-relaxed mb-6">{step.description}</p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={dismiss}
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            {locale === "de" ? "Tour überspringen" : "Skip tour"}
          </button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="px-4 py-2 text-xs font-medium text-white/70 border border-white/10 rounded-lg hover:bg-white/[0.05] transition-colors"
              >
                {locale === "de" ? "Zurück" : "Back"}
              </button>
            )}
            <button
              onClick={nextStep}
              className="px-4 py-2 text-xs font-semibold text-[#050508] bg-gradient-to-r from-[#00f5d4] to-[#00d4b8] rounded-lg hover:shadow-[0_0_20px_rgba(0,245,212,0.3)] transition-all"
            >
              {isLast
                ? locale === "de"
                  ? "Fertig"
                  : "Done"
                : locale === "de"
                  ? "Weiter"
                  : "Next"}
            </button>
          </div>
        </div>

        {/* Step count */}
        <div className="absolute top-4 right-4 text-[10px] text-white/30 font-medium">
          {currentStep + 1} / {effectiveSteps.length}
        </div>
      </div>
    </div>
  );
}

export function resetTour(storageKey = "elt-tour-dismissed") {
  if (typeof window !== "undefined") {
    localStorage.removeItem(storageKey);
  }
}
