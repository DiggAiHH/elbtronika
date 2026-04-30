import { Suspense } from "react";
import StripeOnboardingClient from "./StripeOnboardingClient";

export default function StripeOnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0b]" />}>
      <StripeOnboardingClient />
    </Suspense>
  );
}
