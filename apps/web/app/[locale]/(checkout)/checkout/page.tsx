import { getTranslations } from "next-intl/server";
import { getEnv } from "@/src/lib/env";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  const env = getEnv();
  const isDemo = env.ELT_MODE === "demo";

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-16">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] text-center mb-8">
          {t("title")}
        </h1>

        <div className="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <p className="text-[var(--color-text-secondary)] text-center mb-6">{t("comingSoon")}</p>

          {isDemo && (
            <div
              className="p-4 rounded-lg border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 text-center"
              data-testid="test-card-hint"
            >
              <p className="text-sm text-[var(--color-text-primary)] font-medium">
                {t("testCardTitle")}
              </p>
              <p className="mt-2 text-lg font-mono text-[var(--color-primary)] tracking-wider">
                4242 4242 4242 4242
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">{t("testCardHint")}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
