import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
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

  if (!user) {
    redirect(`/${locale}/login?redirect=/${locale}/pitch`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "investor") {
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
      </div>
    </main>
  );
}

function DashboardCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="p-5 rounded-2xl glass border border-white/[0.06]">
      <div className="text-xs text-white/40 uppercase tracking-wider mb-1">{title}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-white/30">{subtitle}</div>
    </div>
  );
}
