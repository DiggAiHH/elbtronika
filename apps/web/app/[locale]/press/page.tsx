import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

<<<<<<< HEAD
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "press" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function PressPage({ params }: { params: Promise<{ locale: string }> }) {
=======
interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "press" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function PressPage({ params }: Props) {
>>>>>>> feature/phase-18-19-tests-and-prd-docs
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "press" });

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      {/* Hero */}
<<<<<<< HEAD
      <section className="relative px-4 py-20 sm:px-6 lg:px-8 border-b border-white/[0.04]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-white">{t("heading")}</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
            {t("vision")}
=======
      <section className="border-b border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold text-[var(--color-text-primary)] sm:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
            {t("heroSubtitle")}
          </p>
        </div>
      </section>

      {/* Vision */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {t("visionTitle")}
          </h2>
          <p className="mt-4 text-[var(--color-text-secondary)] leading-relaxed">
            {t("visionText")}
>>>>>>> feature/phase-18-19-tests-and-prd-docs
          </p>
        </div>
      </section>

      {/* Numbers */}
<<<<<<< HEAD
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
=======
      <section className="border-y border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] text-center mb-12">
            {t("numbersTitle")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "5", label: t("numberArtists") },
              { value: "3", label: t("numberDjs") },
              { value: "8", label: t("numberDrops") },
              { value: "60/20/20", label: t("numberSplit") },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[var(--color-primary)]">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-[var(--color-text-muted)]">{stat.label}</div>
              </div>
            ))}
>>>>>>> feature/phase-18-19-tests-and-prd-docs
          </div>
        </div>
      </section>

      {/* Roadmap */}
<<<<<<< HEAD
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
=======
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] text-center mb-12">
            {t("roadmapTitle")}
          </h2>
          <div className="space-y-6">
            {[
              { phase: "0–5", title: t("roadmapFoundation"), status: "done" },
              { phase: "6–10", title: t("roadmapCommerce"), status: "done" },
              { phase: "11–15", title: t("roadmapAi"), status: "wip" },
              { phase: "16–21", title: t("roadmapScale"), status: "todo" },
            ].map((item) => (
              <div
                key={item.phase}
                className="flex items-center gap-4 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <span
                  className={`shrink-0 w-3 h-3 rounded-full ${
                    item.status === "done"
                      ? "bg-green-500"
                      : item.status === "wip"
                        ? "bg-yellow-500"
                        : "bg-[var(--color-text-muted)]"
                  }`}
                />
                <span className="text-sm font-mono text-[var(--color-text-muted)] w-16">
                  {item.phase}
                </span>
                <span className="text-[var(--color-text-primary)]">{item.title}</span>
              </div>
            ))}
>>>>>>> feature/phase-18-19-tests-and-prd-docs
          </div>
        </div>
      </section>

      {/* Team */}
<<<<<<< HEAD
      <section className="px-4 py-16 sm:px-6 lg:px-8 border-b border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">{t("teamTitle")}</h2>
          <div className="max-w-md mx-auto p-6 rounded-2xl glass border border-white/[0.06]">
            <h3 className="text-lg font-semibold text-white mb-1">Lou</h3>
            <p className="text-sm text-[#00f5d4] mb-3">{t("founderRole")}</p>
            <p className="text-sm text-white/50 leading-relaxed">{t("founderStory")}</p>
=======
      <section className="border-y border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] text-center mb-12">
            {t("teamTitle")}
          </h2>
          <div className="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              {t("teamLouName")}
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{t("teamLouRole")}</p>
            <p className="mt-4 text-[var(--color-text-secondary)] leading-relaxed">
              {t("teamLouBio")}
            </p>
>>>>>>> feature/phase-18-19-tests-and-prd-docs
          </div>
        </div>
      </section>

<<<<<<< HEAD
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
=======
      {/* Video Slot */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-8">
            {t("videoTitle")}
          </h2>
          <div className="aspect-video rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center">
            <p className="text-[var(--color-text-muted)]">{t("videoPlaceholder")}</p>
          </div>
        </div>
      </section>

      {/* Contact + Deck */}
      <section className="border-t border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
            {t("contactTitle")}
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-8">
            {t("contactText")}
          </p>
          <a
            href="mailto:hallo@elbtronika.de"
            className="inline-block px-6 py-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-background)] font-medium hover:opacity-90 transition-opacity"
          >
            hallo@elbtronika.de
          </a>
          <p className="mt-8 text-sm text-[var(--color-text-muted)]">
            {t("deckDownload")}
          </p>
>>>>>>> feature/phase-18-19-tests-and-prd-docs
        </div>
      </section>
    </main>
  );
}
<<<<<<< HEAD

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
=======
>>>>>>> feature/phase-18-19-tests-and-prd-docs
