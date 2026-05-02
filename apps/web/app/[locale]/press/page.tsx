import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

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
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "press" });

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      {/* Hero */}
      <section className="border-b border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            For Media
          </p>
          <h1 className="text-4xl font-semibold text-[var(--color-text-primary)] sm:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-lg text-[var(--color-text-secondary)]">
            {t("heroSubtitle")}
          </p>
        </div>
      </section>

      {/* Vision */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            {t("visionTitle")}
          </h2>
          <p className="mt-4 text-[var(--color-text-secondary)] leading-relaxed">
            {t("visionText")}
          </p>
        </div>
      </section>

      {/* Numbers */}
      <section className="border-y border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] text-center mb-12">
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
                <div className="text-3xl md:text-4xl font-semibold text-[var(--color-primary)]">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-[var(--color-text-muted)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] text-center mb-12">
            {t("roadmapTitle")}
          </h2>
          <div className="space-y-4">
            {[
              { phase: "0–5", title: t("roadmapFoundation"), status: "done" },
              { phase: "6–10", title: t("roadmapCommerce"), status: "done" },
              { phase: "11–15", title: t("roadmapAi"), status: "wip" },
              { phase: "16–21", title: t("roadmapScale"), status: "todo" },
            ].map((item) => (
              <div
                key={item.phase}
                className="flex items-center gap-4 p-4 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)]"
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
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="border-y border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] text-center mb-12">
            {t("teamTitle")}
          </h2>
          <div className="p-6 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)]">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              {t("teamLouName")}
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{t("teamLouRole")}</p>
            <p className="mt-4 text-[var(--color-text-secondary)] leading-relaxed">
              {t("teamLouBio")}
            </p>
          </div>
        </div>
      </section>

      {/* Video Slot */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-8">
            {t("videoTitle")}
          </h2>
          <div className="aspect-video rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center">
            <p className="text-[var(--color-text-muted)]">{t("videoPlaceholder")}</p>
          </div>
        </div>
      </section>

      {/* Contact + Deck */}
      <section className="border-t border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4">
            {t("contactTitle")}
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-8">{t("contactText")}</p>
          <a
            href="mailto:hallo@elbtronika.de"
            className="inline-flex items-center px-6 py-3 rounded-full bg-[var(--color-primary)] text-[var(--color-background)] font-medium hover:opacity-90 transition-opacity"
          >
            hallo@elbtronika.de
          </a>
          <p className="mt-8 text-sm text-[var(--color-text-muted)]">{t("deckDownload")}</p>
        </div>
      </section>
    </main>
  );
}
