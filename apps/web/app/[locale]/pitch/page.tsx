import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
<<<<<<< HEAD
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { InvestorWelcomeModal } from "./InvestorWelcomeModal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pitch" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function PitchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pitch" });

  // Auth + role gate
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
=======
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pitch" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function PitchPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pitch" });

  // Role gate: require investor role
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
>>>>>>> feature/phase-18-19-tests-and-prd-docs

  if (!user) {
    redirect(`/${locale}/login?redirect=/${locale}/pitch`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "investor") {
<<<<<<< HEAD
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">{t("forbiddenTitle")}</h1>
          <p className="text-white/50">{t("forbiddenBody")}</p>
        </div>
      </main>
    );
  }

  // Mock data for investor dashboard
  const mockSalesData = [
    { month: "Jan", value: 0 },
    { month: "Feb", value: 0 },
    { month: "Mar", value: 0 },
    { month: "Apr", value: 0 },
    { month: "Mai", value: 2 },
    { month: "Jun", value: 5 },
  ];

  const mockPipeline = [
    { name: "Mira Volk", stage: t("stageOnboarded"), progress: 100 },
    { name: "Kenji Aoki", stage: t("stageContract"), progress: 80 },
    { name: "Helena Moraes", stage: t("stageKyc"), progress: 60 },
    { name: "Theo Karagiannis", stage: t("stageInvite"), progress: 40 },
    { name: "Sasha Wren", stage: t("stageNegotiate"), progress: 20 },
  ];

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-8 sm:px-6 lg:px-8">
      <InvestorWelcomeModal locale={locale} />
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t("heading")}</h1>
          <p className="text-white/50">{t("subheading")}</p>
        </header>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <DashboardCard title={t("cardSales")} value="€0" subtitle={t("subtitlePreLaunch")} />
          <DashboardCard title={t("cardArtists")} value="5" subtitle={t("subtitleOnboarded")} />
          <DashboardCard title={t("cardDjs")} value="3" subtitle={t("subtitleCurated")} />
        </div>

        {/* Sales chart mock */}
        <section className="mb-8 p-6 rounded-2xl glass border border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white mb-4">{t("chartSalesTitle")}</h2>
          <div className="flex items-end gap-3 h-32">
            {mockSalesData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-[#00f5d4]/30 rounded-t"
                  style={{ height: `${Math.max(d.value * 16, 4)}px` }}
                />
                <span className="text-[10px] text-white/40">{d.month}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/30 mt-3">{t("chartSalesNote")}</p>
        </section>

        {/* Artist pipeline */}
        <section className="mb-8 p-6 rounded-2xl glass border border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white mb-4">{t("pipelineTitle")}</h2>
          <div className="space-y-3">
            {mockPipeline.map((artist) => (
              <div key={artist.name} className="flex items-center gap-3">
                <span className="text-sm text-white w-32 shrink-0">{artist.name}</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00f5d4] to-[#7b2fff] rounded-full"
                    style={{ width: `${artist.progress}%` }}
                  />
                </div>
                <span className="text-xs text-white/40 w-24 text-right">{artist.stage}</span>
              </div>
            ))}
          </div>
        </section>

        {/* AI cost estimate */}
        <section className="mb-8 p-6 rounded-2xl glass border border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white mb-2">{t("aiCostTitle")}</h2>
          <p className="text-sm text-white/50 mb-3">{t("aiCostBody")}</p>
          <div className="text-2xl font-bold gradient-text">~$120 / Monat</div>
          <p className="text-xs text-white/30 mt-1">{t("aiCostNote")}</p>
        </section>

        {/* Trust audit sample */}
        <section className="mb-8 p-6 rounded-2xl glass border border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white mb-4">{t("auditTitle")}</h2>
          <div className="space-y-2">
            {[
              { server: "supabase", tool: "supabase_query_artworks", status: "ok" },
              { server: "sanity", tool: "sanity_list_artworks", status: "ok" },
              { server: "stripe", tool: "stripe_get_account_balance", status: "ok" },
              { server: "audio", tool: "audio_analyze_track", status: "ok" },
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="text-white/30 w-20">{log.server}</span>
                <span className="text-white/50 flex-1">{log.tool}</span>
                <span className="text-[#00f5d4]">{log.status}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Test checkout CTA */}
        <section className="p-6 rounded-2xl border border-[#00f5d4]/20 bg-[#00f5d4]/5">
          <h2 className="text-lg font-semibold text-white mb-2">{t("testCheckoutTitle")}</h2>
          <p className="text-sm text-white/50 mb-4">{t("testCheckoutBody")}</p>
          <a
            href={`/${locale}/shop`}
            className="inline-block px-6 py-3 text-sm font-semibold text-[#050508] bg-gradient-to-r from-[#00f5d4] to-[#00d4b8] rounded-full hover:shadow-[0_0_40px_rgba(0,245,212,0.3)] transition-all"
          >
            {t("testCheckoutCta")}
          </a>
          <p className="text-xs text-white/30 mt-3">{t("testCardHint")}</p>
        </section>
=======
    redirect(`/${locale}/login?error=unauthorized`);
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">{t("title")}</h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">{t("subtitle")}</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Volume Chart (Mock) */}
          <section className="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              {t("salesTitle")}
            </h2>
            <div className="space-y-3">
              {[
                { month: "Jan", value: 12 },
                { month: "Feb", value: 19 },
                { month: "Mar", value: 15 },
                { month: "Apr", value: 28 },
                { month: "Mai", value: 34 },
                { month: "Jun", value: 42 },
              ].map((item) => (
                <div key={item.month} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--color-text-muted)] w-8">{item.month}</span>
                  <div className="flex-1 h-6 bg-[var(--color-background)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-primary)] rounded-full transition-all"
                      style={{ width: `${(item.value / 50) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)] w-8 text-right">
                    {item.value}k
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t("salesNote")}</p>
          </section>

          {/* Artist Pipeline */}
          <section className="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              {t("pipelineTitle")}
            </h2>
            <div className="space-y-3">
              {[
                { name: "Mira Volk", status: "live", stage: 100 },
                { name: "Kenji Aoki", status: "live", stage: 100 },
                { name: "Helena Moraes", status: "onboarding", stage: 75 },
                { name: "Theo Karagiannis", status: "contract", stage: 50 },
                { name: "Sasha Wren", status: "contact", stage: 25 },
              ].map((artist) => (
                <div key={artist.name} className="flex items-center gap-3">
                  <span className="text-sm text-[var(--color-text-primary)] w-32 truncate">
                    {artist.name}
                  </span>
                  <div className="flex-1 h-2 bg-[var(--color-background)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        artist.status === "live" ? "bg-green-500" : "bg-[var(--color-primary)]"
                      }`}
                      style={{ width: `${artist.stage}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      artist.status === "live"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                    }`}
                  >
                    {t(`status${artist.status}`)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* AI Curation Cost */}
          <section className="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              {t("aiCostTitle")}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[var(--color-background)]">
                <div className="text-2xl font-bold text-[var(--color-primary)]">$0.12</div>
                <div className="text-xs text-[var(--color-text-muted)]">{t("aiCostPerMatch")}</div>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-background)]">
                <div className="text-2xl font-bold text-[var(--color-primary)]">2.4k</div>
                <div className="text-xs text-[var(--color-text-muted)]">{t("aiCostMonthly")}</div>
              </div>
            </div>
            <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t("aiCostNote")}</p>
          </section>

          {/* Audit Log Sample */}
          <section className="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              {t("auditTitle")}
            </h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {[
                { tool: "supabase_query_artworks", status: "ok", time: "12ms" },
                { tool: "sanity_fetch_document", status: "ok", time: "45ms" },
                { tool: "audio_analyze_track", status: "ok", time: "120ms" },
                { tool: "stripe_list_transfers", status: "ok", time: "89ms" },
                { tool: "supabase_query_profiles", status: "denied", time: "3ms" },
              ].map((log, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded bg-[var(--color-background)]"
                >
                  <span className="text-[var(--color-text-secondary)] font-mono">{log.tool}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        log.status === "ok"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {log.status}
                    </span>
                    <span className="text-[var(--color-text-muted)]">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Test Checkout CTA */}
        <div className="mt-8 p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-center">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            {t("testCheckoutTitle")}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">{t("testCheckoutText")}</p>
          <a
            href={`/${locale}/shop`}
            className="inline-block px-6 py-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-background)] font-medium hover:opacity-90 transition-opacity"
          >
            {t("testCheckoutCta")}
          </a>
          <p className="mt-4 text-xs text-[var(--color-text-muted)]" data-testid="test-card-hint">
            {t("testCardHint")}
          </p>
        </div>
>>>>>>> feature/phase-18-19-tests-and-prd-docs
      </div>
    </main>
  );
}
<<<<<<< HEAD

function DashboardCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="p-5 rounded-2xl glass border border-white/[0.06]">
      <div className="text-xs text-white/40 uppercase tracking-wider mb-1">{title}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-white/30">{subtitle}</div>
    </div>
  );
}
=======
>>>>>>> feature/phase-18-19-tests-and-prd-docs
