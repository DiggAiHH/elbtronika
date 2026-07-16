import type { Metadata } from "next";

/**
 * AGB — Entwurf für den Verkauf digitaler und physischer Kunstwerke.
 * Anwaltliche Prüfung vor Live-Switch (Launch-Checkliste).
 */

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "de" ? "AGB" : "Terms of Service",
    robots: { index: true, follow: true },
  };
}

export default async function AgbPage({ params }: Props) {
  const { locale } = await params;
  const de = locale === "de";

  const sections: Array<{ title: string; body: string[] }> = de
    ? [
        {
          title: "§ 1 Geltungsbereich",
          body: [
            "Diese AGB gelten für alle Käufe über elbtronika.art zwischen der ELBTRONIKA UG (haftungsbeschränkt) i.G. (siehe Impressum) und Verbrauchern oder Unternehmern.",
          ],
        },
        {
          title: "§ 2 Vertragsgegenstand",
          body: [
            "ELBTRONIKA verkauft limitierte Kunstwerke (digital und/oder physisch) im eigenen Namen für die jeweiligen Künstler:innen. Auflage und Nummerierung sind auf der Produktseite ausgewiesen.",
          ],
        },
        {
          title: "§ 3 Vertragsschluss",
          body: [
            "Die Darstellung der Werke ist kein bindendes Angebot. Mit Abschluss des Bezahlvorgangs über Stripe gibt der Kunde ein Angebot ab; der Vertrag kommt mit der Bestellbestätigung per E-Mail zustande.",
          ],
        },
        {
          title: "§ 4 Preise und Zahlung",
          body: [
            "Alle Preise in Euro inkl. gesetzlicher USt. Zahlung über Stripe (Karte u.a.). Der Kaufbetrag wird nach Maßgabe der Plattform-Vereinbarung zwischen Künstler:in, ggf. DJ und Plattform aufgeteilt; für Käufer entstehen dadurch keine Zusatzkosten.",
          ],
        },
        {
          title: "§ 5 Lieferung / Bereitstellung",
          body: [
            "Digitale Werke: Bereitstellung des Downloads/Zugangs unmittelbar nach Zahlungseingang. Physische Werke: Versand innerhalb der auf der Produktseite genannten Frist.",
          ],
        },
        {
          title: "§ 6 Widerrufsrecht",
          body: [
            "Verbrauchern steht das gesetzliche Widerrufsrecht (14 Tage) zu. Bei digitalen Inhalten erlischt es, wenn der Kunde ausdrücklich zustimmt, dass mit der Ausführung vor Ablauf der Widerrufsfrist begonnen wird, und seine Kenntnis vom Erlöschen bestätigt (§ 356 Abs. 5 BGB). Die Widerrufsbelehrung wird im Checkout bereitgestellt.",
          ],
        },
        {
          title: "§ 7 Urheberrecht und Nutzungsrechte",
          body: [
            "Das Urheberrecht verbleibt bei den Künstler:innen. Der Kauf umfasst das Eigentum am Werkstück bzw. eine einfache, nicht übertragbare Lizenz zur privaten Nutzung der digitalen Datei, sofern auf der Produktseite nichts anderes ausgewiesen ist.",
          ],
        },
        {
          title: "§ 8 Gewährleistung und Haftung",
          body: [
            "Es gilt das gesetzliche Mängelhaftungsrecht. Für einfache Fahrlässigkeit haften wir nur bei Verletzung wesentlicher Vertragspflichten, begrenzt auf den vorhersehbaren, vertragstypischen Schaden; die Haftung für Leben, Körper und Gesundheit bleibt unberührt.",
          ],
        },
        {
          title: "§ 9 Schlussbestimmungen",
          body: [
            "Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts; gegenüber Verbrauchern nur, soweit der Schutz des Wohnsitzstaates nicht entzogen wird. Sollten einzelne Klauseln unwirksam sein, bleibt der Vertrag im Übrigen wirksam.",
          ],
        },
      ]
    : [
        {
          title: "§ 1 Scope",
          body: [
            "These terms govern all purchases via elbtronika.art between ELBTRONIKA UG (haftungsbeschränkt) i.G. (see Legal Notice) and consumers or businesses.",
          ],
        },
        {
          title: "§ 2 Subject",
          body: [
            "ELBTRONIKA sells limited artworks (digital and/or physical) in its own name on behalf of the respective artists. Edition size and numbering are stated on the product page.",
          ],
        },
        {
          title: "§ 3 Conclusion of Contract",
          body: [
            "The presentation of works is not a binding offer. By completing the Stripe checkout the customer submits an offer; the contract is concluded with the order confirmation e-mail.",
          ],
        },
        {
          title: "§ 4 Prices and Payment",
          body: [
            "All prices in euros incl. VAT. Payment via Stripe. The purchase amount is split between artist, DJ (where applicable) and platform under the platform agreement; buyers incur no additional costs.",
          ],
        },
        {
          title: "§ 5 Delivery / Provision",
          body: [
            "Digital works: download/access is provided immediately after payment. Physical works: shipped within the period stated on the product page.",
          ],
        },
        {
          title: "§ 6 Right of Withdrawal",
          body: [
            "Consumers have the statutory 14-day right of withdrawal. For digital content it expires when the customer expressly consents to performance before the withdrawal period ends and confirms knowledge of the expiry (§ 356 (5) BGB). The withdrawal notice is provided at checkout.",
          ],
        },
        {
          title: "§ 7 Copyright and Licences",
          body: [
            "Copyright remains with the artists. A purchase transfers ownership of the physical piece or a simple, non-transferable licence for private use of the digital file unless the product page states otherwise.",
          ],
        },
        {
          title: "§ 8 Warranty and Liability",
          body: [
            "Statutory warranty law applies. For simple negligence we are liable only for breaches of essential contractual duties, limited to foreseeable, typical damage; liability for life, body and health remains unaffected.",
          ],
        },
        {
          title: "§ 9 Final Provisions",
          body: [
            "German law applies, excluding the UN Convention on Contracts for the International Sale of Goods; for consumers only insofar as the protection of their state of residence is not withdrawn. Should individual clauses be invalid, the remainder of the contract remains effective.",
          ],
        },
      ];

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-16 text-[var(--color-text-primary)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            {de ? "Rechtliches" : "Legal"}
          </p>
          <h1 className="text-4xl font-semibold">
            {de ? "Allgemeine Geschäftsbedingungen" : "Terms of Service"}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {de
              ? "Stand: Juli 2026 — Entwurf, anwaltliche Prüfung vor dem Live-Start."
              : "As of July 2026 — draft, pending legal review before launch."}
          </p>
        </header>

        {sections.map((s) => (
          <section key={s.title} className="space-y-2">
            <h2 className="text-lg font-semibold">{s.title}</h2>
            {s.body.map((p) => (
              <p
                key={p.slice(0, 40)}
                className="text-sm leading-7 text-[var(--color-text-secondary)]"
              >
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
