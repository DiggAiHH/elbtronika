"use client";

import * as React from "react";

export interface TourStep {
  title: string;
  description: string;
}

export interface WalkthroughTourProps {
  delayMs?: number;
  locale?: "de" | "en";
  steps?: TourStep[];
}

const DEFAULT_STEPS_DE: TourStep[] = [
  { title: "Willkommen", description: "Willkommen bei Elbtronika." },
  { title: "3D-Navigation", description: "Erkunden Sie die 3D-Umgebung." },
  { title: "Künstlerprofile", description: "Entdecken Sie Künstler und ihre Werke." },
];

const DEFAULT_STEPS_EN: TourStep[] = [
  { title: "Welcome", description: "Welcome to Elbtronika." },
  { title: "3D Navigation", description: "Explore the 3D environment." },
  { title: "Artist Profiles", description: "Discover artists and their works." },
];

const LABELS = {
  de: {
    next: "Weiter",
    skip: "Tour überspringen",
    done: "Fertig",
  },
  en: {
    next: "Next",
    skip: "Skip Tour",
    done: "Done",
  },
};

export function resetTour(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("elt-tour-dismissed");
  }
}

export function WalkthroughTour({ delayMs = 0, locale = "de", steps }: WalkthroughTourProps) {
  const [visible, setVisible] = React.useState(delayMs === 0);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [dismissed, setDismissed] = React.useState(false);

  const effectiveSteps = steps ?? (locale === "en" ? DEFAULT_STEPS_EN : DEFAULT_STEPS_DE);
  const labels = LABELS[locale];

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const isDismissed = localStorage.getItem("elt-tour-dismissed") === "true";
      if (isDismissed) {
        setDismissed(true);
        return;
      }
    }

    if (delayMs > 0) {
      const timer = setTimeout(() => setVisible(true), delayMs);
      return () => clearTimeout(timer);
    }
  }, [delayMs]);

  if (dismissed) return null;
  if (!visible) return null;

  const step = effectiveSteps[currentStep];
  const isLastStep = currentStep >= effectiveSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleDismiss();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("elt-tour-dismissed", "true");
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleDismiss();
    }
  };

  return (
    <div
      data-testid="walkthrough-tour"
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === "Escape") handleDismiss();
      }}
      role="dialog"
      tabIndex={-1}
    >
      <div>
        <h3>{step.title}</h3>
        <p>{step.description}</p>
        <button onClick={handleNext} type="button">
          {isLastStep ? labels.done : labels.next}
        </button>
        <button onClick={handleDismiss} type="button">
          {labels.skip}
        </button>
      </div>
    </div>
  );
}
