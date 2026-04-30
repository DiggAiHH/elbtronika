import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "press" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function PressPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "press" });

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      {/* Hero */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8 border-b border-white/[0.04]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-white">{t("heading")}</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
            {t("vision")}
          </p>
        </div>
      </section>

      {/* Numbers */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 border-b border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">{t("numbersTitle")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard value="5" label={t("statArtists")} />
            <StatCard value="3" label={t("statDjs")} />
            <StatCard value="8" label={t("statDrops")} />
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InfoCard title={t("revenueSplitTitle")} body={t("revenueSplitBody")} />
            <InfoCard title={t("privacyTitle")} body={t("privacyBody")} />
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 border-b border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">{t("roadmapTitle")}</h2>
          <div className="space-y-4">
            <RoadmapItem phase="1–5" title={t("roadmap1")} status="done" />
            <RoadmapItem phase="6–10" title={t("roadmap2")} status="done" />
            <RoadmapItem phase="11–13" title={t("roadmap3")} status="done" />
            <RoadmapItem phase="14–17" title={t("roadmap4")} status="done" />
            <RoadmapItem phase="18–19" title={t("roadmap5")} status="active" />
            <RoadmapItem phase="20–21" title={t("roadmap6")} status="pending" />
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 border-b border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">{t("teamTitle")}</h2>
          <div className="max-w-md mx-auto p-6 rounded-2xl glass border border-white/[0.06]">
            <h3 className="text-lg font-semibold text-white mb-1">Lou</h3>
            <p className="text-sm text-[#00f5d4] mb-3">{t("founderRole")}</p>
            <p className="text-sm text-white/50 leading-relaxed">{t("founderStory")}</p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{t("contactTitle")}</h2>
          <a
            href="mailto:hallo@elbtronika.de"
            className="inline-block text-lg text-[#00f5d4] hover:underline"
          >
            hallo@elbtronika.de
          </a>
        </div>
      </section>
    </main>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center p-6 rounded-2xl glass border border-white/[0.06]">
      <div className="text-3xl font-bold gradient-text mb-1">{value}</div>
      <div className="text-sm text-white/40">{label}</div>
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-6 rounded-2xl glass border border-white/[0.06]">
      <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/50 leading-relaxed">{body}</p>
    </div>
  );
}

function RoadmapItem({ phase, title, status }: { phase: string; title: string; status: "done" | "active" | "pending" }) {
  const statusColors = {
    done: "bg-[#00f5d4]/20 text-[#00f5d4] border-[#00f5d4]/30",
    active: "bg-[#f720b8]/20 text-[#f720b8] border-[#f720b8]/30",
    pending: "bg-white/5 text-white/30 border-white/10",
  };

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border ${statusColors[status]}`}>
      <span className="text-xs font-mono font-bold shrink-0 w-12">{phase}</span>
      <span className="text-sm font-medium">{title}</span>
    </div>
  );
}
