"use client";

import Link from "next/link";

const footerLinks = {
  platform: [
    { label: "Gallery", href: "/gallery" },
    { label: "Shop", href: "/shop" },
    { label: "Artists", href: "/about" },
  ],
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Imprint", href: "#" },
  ],
  connect: [
    { label: "Instagram", href: "#" },
    { label: "Discord", href: "#" },
    { label: "Newsletter", href: "#" },
  ],
  discover: [
    { label: "Press Kit", href: "/press" },
    { label: "Take the tour", href: "#", action: "reset-tour" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-[#050508]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00f5d4] to-[#7b2fff] flex items-center justify-center">
                <span className="text-[#050508] font-bold text-sm">E</span>
              </div>
              <span className="text-lg font-bold tracking-[0.15em] text-white">
                ELBTRONIKA
              </span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed">
              Where techno meets art. A curated platform connecting visionary artists with electronic music culture.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-4">Platform</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/50 hover:text-[#00f5d4] transition-colors duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/50 hover:text-[#00f5d4] transition-colors duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-4">Connect</h4>
            <ul className="space-y-2">
              {footerLinks.connect.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/50 hover:text-[#00f5d4] transition-colors duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-4">Discover</h4>
            <ul className="space-y-2">
              {footerLinks.discover.map((link) => (
                <li key={link.label}>
                  {link.action === "reset-tour" ? (
                    <button
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          localStorage.removeItem("elt-tour-dismissed");
                          window.location.reload();
                        }
                      }}
                      className="text-sm text-white/50 hover:text-[#00f5d4] transition-colors duration-300"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link href={link.href} className="text-sm text-white/50 hover:text-[#00f5d4] transition-colors duration-300">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} ELBTRONIKA. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-white/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
