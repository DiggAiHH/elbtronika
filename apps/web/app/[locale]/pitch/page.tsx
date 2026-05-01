import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { InvestorWelcomeModal } from "./InvestorWelcomeModal";

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

  if (!user) {
    redirect(`/${locale}/login?redirect=/${locale}/pitch`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "investor") {
    redirect(`/${locale}/login?error=unauthorized`);
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <InvestorWelcomeModal locale={locale} />
      {/* Header */}
      <div className="border-b border-[var(--color-border)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Investor Access
          </p>
          <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">{t("title")}</h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">{t("subtitle")}</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Volume Chart (Mock) */}
          <section className="p-6 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)]">
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
          <section className="p-6 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)]">
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
          <section className="p-6 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)]">
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
          <section className="p-6 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)]">
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
                  // biome-ignore lint/suspicious/noArrayIndexKey: static audit log mock
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
        <div className="mt-8 p-6 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] text-center">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            {t("testCheckoutTitle")}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">{t("testCheckoutText")}</p>
          <a
            href={`/${locale}/shop`}
            className="inline-flex items-center px-6 py-3 rounded-full bg-[var(--color-primary)] text-[var(--color-background)] font-medium hover:opacity-90 transition-opacity"
          >
            {t("testCheckoutCta")}
          </a>
          <p className="mt-4 text-xs text-[var(--color-text-muted)]" data-testid="test-card-hint">
            {t("testCardHint")}
          </p>
        </div>
      </div>
    </main>
  );
}
