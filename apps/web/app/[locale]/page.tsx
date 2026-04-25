import { useTranslations } from "next-intl";

// Phase 2+: Replace with actual landing page / entry experience component.
export default function HomePage() {
  const t = useTranslations("common");

  return (
    <main
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          letterSpacing: "0.2em",
          color: "var(--color-primary)",
        }}
      >
        ELBTRONIKA
      </h1>
      <p style={{ color: "var(--color-text-secondary)" }}>{t("loading")}</p>
    </main>
  );
}
