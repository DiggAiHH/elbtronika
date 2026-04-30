"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "elt-investor-welcomed";

interface Props {
  locale: string;
}

export function InvestorWelcomeModal({ locale }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  }

  function takeTour() {
    localStorage.removeItem("elt-tour-dismissed");
    dismiss();
    window.location.href = `/${locale}`;
  }

  if (!open) return null;

  return (
    <div
      data-testid="investor-welcome-modal"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-sm mx-4 rounded-2xl bg-[#0a0a0f] border border-white/[0.08] p-8 shadow-2xl text-center">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-gradient-to-r from-[#00f5d4] to-[#7b2fff]" />

        <h2 className="text-2xl font-bold text-white mt-4 mb-2">
          Hi Lee 👋
        </h2>
        <p className="text-white/60 mb-8 leading-relaxed">
          Welcome to ELBTRONIKA.{" "}
          <span className="text-white/90">Take the tour</span> to see the full
          experience, or explore freely on your own.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={takeTour}
            className="w-full px-6 py-3 text-sm font-semibold text-[#050508] bg-gradient-to-r from-[#00f5d4] to-[#00d4b8] rounded-full hover:shadow-[0_0_30px_rgba(0,245,212,0.3)] transition-all duration-300"
          >
            Take the Tour →
          </button>
          <button
            onClick={dismiss}
            className="w-full px-6 py-3 text-sm font-medium text-white/50 hover:text-white transition-colors"
          >
            Explore Freely
          </button>
        </div>

        <p className="mt-6 text-xs text-white/20">
          Demo Environment ·{" "}
          <Link href={`/${locale}/press`} onClick={dismiss} className="hover:text-white/40 underline underline-offset-2 transition-colors">
            View Press Kit
          </Link>
        </p>
      </div>
    </div>
  );
}
