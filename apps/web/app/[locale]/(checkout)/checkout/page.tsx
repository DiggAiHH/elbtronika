"use client";

import { useElbMode } from "@/src/components/providers/EnvProvider";

// Phase 10: Stripe Checkout flow + Phase 19: Demo test-card hint
export default function CheckoutPage() {
  const { isDemo } = useElbMode();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-background)] px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Checkout</h1>
        <p className="text-white/50 mb-8">Coming in Phase 10 — Stripe integration.</p>

        {isDemo && (
          <div
            data-testid="test-card-hint"
            className="p-4 rounded-xl bg-[#00f5d4]/10 border border-[#00f5d4]/20 text-sm text-[#00f5d4]"
          >
            <p className="font-medium mb-1">Demo Mode</p>
            <p className="text-white/60">
              Use card{" "}
              <span className="font-mono text-white">4242 4242 4242 4242</span>
              {" "}with any future date and any CVC.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
