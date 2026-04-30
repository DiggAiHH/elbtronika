"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useCallback } from "react";

function localeHref(locale: string, href: string) {
  return `/${locale}${href}`;
}

/* ─────────── HERO SECTION ─────────── */
function HeroSection({ locale }: { locale: string }) {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#00f5d4]/[0.03] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#f720b8]/[0.03] blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#7b2fff]/[0.02] blur-[150px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-[#00f5d4] animate-pulse" />
          <span className="text-xs font-medium text-white/60">Now Live — Berlin & Digital</span>
        </div>

        <p className="text-sm md:text-base text-[#00f5d4]/70 font-medium tracking-[0.2em] uppercase mb-4 animate-fade-in-up">
          Where art meets frequency
        </p>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 animate-fade-in-up delay-100">
          <span className="text-white">Where</span> <span className="gradient-text">Techno</span>
          <br />
          <span className="text-white">Meets</span> <span className="gradient-text">Art</span>
        </h1>

        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
          ELBTRONIKA is a curated platform where electronic music culture and visionary digital art
          collide. Discover, collect, and experience art that moves with the beat.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
          <Link
            href={localeHref(locale, "/gallery")}
            className="group px-8 py-4 text-sm font-semibold text-[#050508] bg-gradient-to-r from-[#00f5d4] to-[#00d4b8] rounded-full hover:shadow-[0_0_40px_rgba(0,245,212,0.3)] transition-all duration-500 hover:scale-105"
          >
            Enter Experience
            <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link
            href={localeHref(locale, "/shop")}
            className="px-8 py-4 text-sm font-semibold text-white border border-white/15 rounded-full hover:bg-white/[0.05] hover:border-white/30 transition-all duration-300"
          >
            View Catalog
          </Link>
        </div>

        <SoundToggle />

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in delay-700">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/20">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </div>
    </section>
  );
}

/* ─────────── FEATURES SECTION ─────────── */
function FeaturesSection({ locale }: { locale: string }) {
  const features = [
    {
      icon: "🎨",
      title: "Curated Gallery",
      description:
        "Immersive 3D gallery spaces where each room is paired with a unique DJ set. Art that responds to sound.",
      href: "/gallery",
      color: "#00f5d4",
    },
    {
      icon: "🛒",
      title: "Artist Shop",
      description:
        "Collect limited-edition digital and physical artworks directly from visionary artists. Fair revenue split.",
      href: "/shop",
      color: "#f720b8",
    },
    {
      icon: "🎵",
      title: "AI Matching",
      description:
        "Our Hermes Agent analyzes audio features and artwork metadata to find perfect music-art pairings.",
      href: "/dashboard/pm/curation",
      color: "#7b2fff",
    },
  ];

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-white">Three Ways to</span>{" "}
            <span className="gradient-text">Experience</span>
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">
            Gallery immersion, direct collection, or AI-powered curation — choose your entry point.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Link
              key={f.title}
              href={localeHref(locale, f.href)}
              className="group relative p-8 rounded-2xl glass border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-6 transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundColor: `${f.color}15` }}
              >
                {f.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-[#00f5d4] transition-colors duration-300">
                {f.title}
              </h3>
              <p className="text-sm text-white/40 leading-relaxed mb-6">{f.description}</p>
              <span className="text-sm font-medium" style={{ color: f.color }}>
                Explore →
              </span>

              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(600px circle at 50% 0%, ${f.color}08, transparent 40%)`,
                }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── STATS SECTION ─────────── */
function StatsSection() {
  const stats = [
    { value: "50+", label: "Artists" },
    { value: "200+", label: "Artworks" },
    { value: "12", label: "DJ Sets" },
    { value: "4", label: "Gallery Rooms" },
  ];

  return (
    <section className="relative py-24 px-6 border-y border-white/[0.04]">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="text-center"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{stat.value}</div>
              <div className="text-sm text-white/40 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── HOW IT WORKS ─────────── */
function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Explore",
      desc: "Browse immersive gallery rooms, each paired with a curated DJ set.",
    },
    {
      num: "02",
      title: "Connect",
      desc: "Our AI matches artworks to music based on mood, energy, and style.",
    },
    {
      num: "03",
      title: "Collect",
      desc: "Purchase limited-edition pieces directly from the artist.",
    },
  ];

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-white">How It</span> <span className="gradient-text">Works</span>
          </h2>
        </div>

        <div className="space-y-8">
          {steps.map((step) => (
            <div
              key={step.num}
              className="flex items-start gap-6 md:gap-10 p-8 rounded-2xl glass border border-white/[0.06]"
            >
              <span className="text-4xl md:text-5xl font-bold text-white/10 shrink-0">
                {step.num}
              </span>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-white/40">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── CTA SECTION ─────────── */
function CTASection({ locale }: { locale: string }) {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#00f5d4]/10 to-transparent blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="text-white">Ready to</span>{" "}
          <span className="gradient-text">Dive In?</span>
        </h2>
        <p className="text-lg text-white/40 mb-10 max-w-xl mx-auto">
          Join the intersection of electronic music and digital art. Your next favorite piece is
          waiting.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={localeHref(locale, "/gallery")}
            className="px-10 py-4 text-sm font-semibold text-[#050508] bg-gradient-to-r from-[#00f5d4] to-[#00d4b8] rounded-full hover:shadow-[0_0_60px_rgba(0,245,212,0.4)] transition-all duration-500 hover:scale-105"
          >
            Enter the Gallery
          </Link>
          <Link
            href={localeHref(locale, "/artist-onboarding/stripe")}
            className="px-10 py-4 text-sm font-semibold text-white border border-white/15 rounded-full hover:bg-white/[0.05] transition-all duration-300"
          >
            Become an Artist
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────── MARQUEE SECTION ─────────── */
function MarqueeSection() {
  const words = [
    "TECHNO",
    "ART",
    "CULTURE",
    "SOUND",
    "VISION",
    "MOVEMENT",
    "BERLIN",
    "DIGITAL",
    "RHYTHM",
    "COLOR",
  ];
  const marqueeWords = [...words, ...words, ...words].map((word, index) => ({
    id: `${word}-${index}`,
    word,
  }));

  return (
    <section className="py-12 border-y border-white/[0.04] overflow-hidden">
      <div className="flex animate-[scroll_30s_linear_infinite] whitespace-nowrap">
        {marqueeWords.map(({ id, word }) => (
          <span
            key={id}
            className="mx-8 text-4xl md:text-6xl font-bold text-white/[0.04] select-none"
          >
            {word}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-33.33%); }
        }
      `}</style>
    </section>
  );
}

/* ─────────── SOUND TOGGLE ─────────── */
function SoundToggle() {
  const [audioEnabled, setAudioEnabled] = useState(false);

  const toggleAudio = useCallback(() => {
    setAudioEnabled((prev) => !prev);
    // In a real implementation, this would unlock/resume the AudioContext
    // and start ambient background audio.
  }, []);

  return (
    <button
      onClick={toggleAudio}
      className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-xs text-white/50 hover:text-white/80 hover:border-white/20 transition-all"
      aria-label={audioEnabled ? "Disable sound" : "Enable sound"}
    >
      {audioEnabled ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      )}
      <span>{audioEnabled ? "Sound on" : "Sound off"}</span>
    </button>
  );
}

/* ─────────── MAIN PAGE ─────────── */
export default function HomePage() {
  const params = useParams<{ locale?: string }>();
  const locale = params.locale ?? "de";

  return (
    <>
      <HeroSection locale={locale} />
      <MarqueeSection />
      <FeaturesSection locale={locale} />
      <StatsSection />
      <HowItWorksSection />
      <CTASection locale={locale} />
    </>
  );
}
