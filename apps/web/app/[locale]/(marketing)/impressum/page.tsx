import type { Metadata } from "next";

/**
 * Impressum (§ 5 DDG) — Pflichtseite für den Verkauf.
 * Die [EINTRAGEN]-Platzhalter füllt Lou vor dem Live-Switch aus;
 * anwaltliche Prüfung ist Teil der Launch-Checkliste (live-switch runbook).
 */

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "de" ? "Impressum" : "Legal Notice",
    robots: { index: true, follow: true },
  };
}

const COMPANY = {
  name: "ELBTRONIKA UG (haftungsbeschränkt) i.G.",
  address: "[EINTRAGEN: Straße Hausnummer]",
  city: "[EINTRAGEN: PLZ Ort]",
  country: "Deutschland",
  managingDirector: "[EINTRAGEN: Geschäftsführer:in]",
  email: "kontakt@elbtronika.art",
  register: "[EINTRAGEN: Amtsgericht + HRB nach Eintragung]",
  vatId: "[EINTRAGEN: USt-IdNr. nach Vergabe]",
};

export default async function ImpressumPage({ params }: Props) {
  const { locale } = await params;
  const de = locale === "de";

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-16 text-[var(--color-text-primary)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            {de ? "Rechtliches" : "Legal"}
          </p>
          <h1 className="text-4xl font-semibold">{de ? "Impressum" : "Legal Notice"}</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {de
              ? "Angaben gemäß § 5 DDG"
              : "Information pursuant to § 5 DDG (German Digital Services Act)"}
          </p>
        </header>

        <section className="space-y-2 text-sm leading-7 text-[var(--color-text-secondary)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {de ? "Anbieter" : "Provider"}
          </h2>
          <p>
            {COMPANY.name}
            <br />
            {COMPANY.address}
            <br />
            {COMPANY.city}
            <br />
            {COMPANY.country}
          </p>
        </section>

        <section className="space-y-2 text-sm leading-7 text-[var(--color-text-secondary)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {de ? "Vertreten durch" : "Represented by"}
          </h2>
          <p>{COMPANY.managingDirector}</p>
        </section>

        <section className="space-y-2 text-sm leading-7 text-[var(--color-text-secondary)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {de ? "Kontakt" : "Contact"}
          </h2>
          <p>
            E-Mail:{" "}
            <a
              className="text-[var(--color-primary)] hover:underline"
              href={`mailto:${COMPANY.email}`}
            >
              {COMPANY.email}
            </a>
          </p>
        </section>

        <section className="space-y-2 text-sm leading-7 text-[var(--color-text-secondary)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {de ? "Registereintrag" : "Register Entry"}
          </h2>
          <p>
            {de ? "Registergericht/-nummer: " : "Register court/number: "}
            {COMPANY.register}
            <br />
            {de ? "Umsatzsteuer-ID: " : "VAT ID: "}
            {COMPANY.vatId}
          </p>
        </section>

        <section className="space-y-2 text-sm leading-7 text-[var(--color-text-secondary)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {de ? "Verantwortlich für den Inhalt" : "Responsible for Content"}
          </h2>
          <p>
            {de
              ? `Inhaltlich verantwortlich gemäß § 18 Abs. 2 MStV: ${COMPANY.managingDirector}, Anschrift wie oben.`
              : `Responsible for content pursuant to § 18 (2) MStV: ${COMPANY.managingDirector}, address as above.`}
          </p>
        </section>

        <section className="space-y-2 text-sm leading-7 text-[var(--color-text-secondary)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {de ? "Streitbeilegung" : "Dispute Resolution"}
          </h2>
          <p>
            {de
              ? "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."
              : "The European Commission provides a platform for online dispute resolution (ODR): https://ec.europa.eu/consumers/odr. We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board."}
          </p>
        </section>
      </div>
    </main>
  );
}
