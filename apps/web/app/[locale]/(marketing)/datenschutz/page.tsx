import type { Metadata } from "next";

/**
 * Datenschutzerklärung (DSGVO) — Entwurf für den Launch.
 * Deckt die real eingesetzten Dienste ab: Supabase (Auth/DB, EU-Region
 * Frankfurt), Stripe (Zahlungen), Sanity (Content-CDN), Netlify (Hosting),
 * eigene Web-Vitals-Messung (ohne Cookies, ohne PII — siehe
 * 20260709120000_web_vitals.sql). Anwaltliche Prüfung vor Live-Switch.
 */

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "de" ? "Datenschutzerklärung" : "Privacy Policy",
    robots: { index: true, follow: true },
  };
}

export default async function DatenschutzPage({ params }: Props) {
  const { locale } = await params;
  const de = locale === "de";

  const sections: Array<{ title: string; body: string[] }> = de
    ? [
        {
          title: "1. Verantwortlicher",
          body: [
            "ELBTRONIKA UG (haftungsbeschränkt) i.G., [EINTRAGEN: Anschrift], E-Mail: kontakt@elbtronika.art (siehe Impressum).",
          ],
        },
        {
          title: "2. Welche Daten wir verarbeiten",
          body: [
            "Konto: E-Mail-Adresse, Anzeigename und Rolle, gespeichert bei unserem Auth-/Datenbank-Dienst Supabase (Region EU/Frankfurt). Passwörter werden ausschließlich als Hash gespeichert.",
            "Kauf: Bestelldaten (Werk, Betrag, Zeitpunkt, Bestellstatus). Die Zahlungsabwicklung übernimmt Stripe; Kartendaten erreichen unsere Server zu keinem Zeitpunkt.",
            "Nutzung: aggregierte Web-Vitals-Messwerte (Ladezeiten) ohne Cookies, ohne IP-Speicherung und ohne personenbezogene Kennungen.",
            "Inhalte: Bilder und Audiodateien der Galerie werden über das Content-CDN von Sanity ausgeliefert; dabei fallen technisch notwendige Zugriffs-Logs beim CDN an.",
          ],
        },
        {
          title: "3. Rechtsgrundlagen",
          body: [
            "Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO) für Konto und Kauf; berechtigtes Interesse (lit. f) für Betriebssicherheit und aggregierte Performance-Messung; Einwilligung (lit. a), wo wir sie gesondert einholen.",
          ],
        },
        {
          title: "4. Empfänger und Drittland-Transfers",
          body: [
            "Supabase (EU-Hosting, Frankfurt) für Auth und Datenbank; Stripe Payments Europe Ltd. für Zahlungen; Sanity AS für Content-Auslieferung; Netlify für das Hosting der Anwendung. Mit allen Anbietern bestehen Auftragsverarbeitungsverträge; Transfers in Drittländer erfolgen auf Basis der EU-Standardvertragsklauseln.",
          ],
        },
        {
          title: "5. Speicherdauer",
          body: [
            "Kontodaten bis zur Löschung des Kontos (Selbst-Löschung unter /account — Bestelldaten werden dabei anonymisiert, nicht gelöscht, solange handels- und steuerrechtliche Aufbewahrungsfristen laufen: §§ 147 AO, 257 HGB).",
          ],
        },
        {
          title: "6. Ihre Rechte",
          body: [
            "Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch (Art. 15–21 DSGVO) sowie Beschwerde bei einer Aufsichtsbehörde. Datenexport und Konto-Löschung stehen direkt im Konto-Bereich zur Verfügung.",
          ],
        },
        {
          title: "7. Keine Werbe-Cookies",
          body: [
            "Wir setzen keine Werbe- oder Tracking-Cookies. Technisch notwendige Cookies beschränken sich auf Login-Session und Spracheinstellung.",
          ],
        },
      ]
    : [
        {
          title: "1. Controller",
          body: [
            "ELBTRONIKA UG (haftungsbeschränkt) i.G., [TO BE COMPLETED: address], e-mail: kontakt@elbtronika.art (see Legal Notice).",
          ],
        },
        {
          title: "2. What we process",
          body: [
            "Account: e-mail address, display name and role, stored with our auth/database provider Supabase (EU region, Frankfurt). Passwords are stored as hashes only.",
            "Purchases: order data (artwork, amount, time, order status). Payments are processed by Stripe; card data never reaches our servers.",
            "Usage: aggregated web-vitals metrics (load times) without cookies, IP storage or personal identifiers.",
            "Content: gallery images and audio are delivered through Sanity's content CDN; technically required access logs occur at the CDN.",
          ],
        },
        {
          title: "3. Legal bases",
          body: [
            "Contract performance (Art. 6(1)(b) GDPR) for account and purchases; legitimate interest (f) for operational security and aggregated performance measurement; consent (a) where we ask for it separately.",
          ],
        },
        {
          title: "4. Recipients and third-country transfers",
          body: [
            "Supabase (EU hosting, Frankfurt) for auth and database; Stripe Payments Europe Ltd. for payments; Sanity AS for content delivery; Netlify for application hosting. Data-processing agreements are in place with all providers; third-country transfers rely on the EU Standard Contractual Clauses.",
          ],
        },
        {
          title: "5. Retention",
          body: [
            "Account data until account deletion (self-service under /account — order data is anonymised rather than deleted while statutory commercial and tax retention periods apply).",
          ],
        },
        {
          title: "6. Your rights",
          body: [
            "Access, rectification, erasure, restriction, portability, objection (Art. 15–21 GDPR) and complaint to a supervisory authority. Data export and account deletion are available directly in your account area.",
          ],
        },
        {
          title: "7. No advertising cookies",
          body: [
            "We use no advertising or tracking cookies. Technically required cookies are limited to the login session and language preference.",
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
            {de ? "Datenschutzerklärung" : "Privacy Policy"}
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
