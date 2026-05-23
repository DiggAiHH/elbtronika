"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

type FooterLink = {
  label: string;
  href?: string;
  external?: boolean;
  action?: "reset-tour";
  note?: string;
};

const footerLinks: {
  platform: FooterLink[];
  legal: FooterLink[];
  connect: FooterLink[];
  discover: FooterLink[];
} = {
  platform: [
    { label: "Gallery", href: "/gallery" },
    { label: "Shop", href: "/shop" },
    { label: "Artists", href: "/about" },
  ],
  legal: [
    {
      label: "Privacy by Architecture",
      href: "/press",
      note: "Current privacy posture and compliance status.",
    },
    {
      label: "Legal Review",
      note: "German legal texts are pending final attorney review before launch.",
    },
    {
      label: "Legal Contact",
      href: "mailto:hallo@elbtronika.de?subject=ELBTRONIKA%20Legal%20Request",
      external: true,
    },
  ],
  connect: [
    { label: "Email", href: "mailto:hallo@elbtronika.de", external: true },
    { label: "Press Kit", href: "/press" },
    {
      label: "Newsletter Interest",
      href: "mailto:hallo@elbtronika.de?subject=ELBTRONIKA%20Newsletter",
      external: true,
    },
  ],
  discover: [
    { label: "Press Kit", href: "/press" },
    { label: "Take the tour", href: "#", action: "reset-tour" },
  ],
};

function localeHref(locale: string, href: string) {
  return `/${locale}${href}`;
}

export default function Footer() {
  const params = useParams<{ locale?: string }>();
  const locale = params.locale ?? "de";

  const renderFooterLink = (link: FooterLink) => {
    const classes = "text-sm text-white/50 hover:text-[#e8a020] transition-colors duration-300";

    if (link.action === "reset-tour") {
      return (
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("elt-tour-dismissed");
              window.location.reload();
            }
          }}
          className={classes}
        >
          {link.label}
        </button>
      );
    }

    if (!link.href) {
      return (
        <div>
          <span className="text-sm text-white/50">{link.label}</span>
          {link.note ? <p className="mt-1 text-xs text-white/25">{link.note}</p> : null}
        </div>
      );
    }

    if (link.external) {
      return (
        <a href={link.href} className={classes}>
          {link.label}
        </a>
      );
    }

    return (
      <Link href={localeHref(locale, link.href)} className={classes}>
        {link.label}
      </Link>
    );
  };

  return (
    <footer className="relative border-t border-white/[0.06] bg-[#050508]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e8a020] to-[#2aada8] flex items-center justify-center">
                <span className="text-[#050508] font-bold text-sm">E</span>
              </div>
              <span className="text-lg font-bold tracking-[0.15em] text-white">ELBTRONIKA</span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed">
              Where techno meets art. A curated platform connecting visionary artists with
              electronic music culture.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-4">
              Platform
            </h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  {renderFooterLink(link)}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  {renderFooterLink(link)}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-4">
              Connect
            </h4>
            <ul className="space-y-2">
              {footerLinks.connect.map((link) => (
                <li key={link.label}>
                  {renderFooterLink(link)}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-4">Discover</h4>
            <ul className="space-y-2">
              {footerLinks.discover.map((link) => (
                <li key={link.label}>
                  {renderFooterLink(link)}
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
