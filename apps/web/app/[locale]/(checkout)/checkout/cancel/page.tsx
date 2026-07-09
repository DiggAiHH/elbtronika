import Link from "next/link";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function CheckoutCancelPage({ params }: Props) {
  const { locale } = await params;
  const de = locale === "de";

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-16">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4">
          {de ? "Zahlung abgebrochen" : "Payment cancelled"}
        </h1>
        <p className="text-[var(--color-text-secondary)] mb-8">
          {de
            ? "Kein Problem — dein Warenkorb ist noch da. Du kannst den Kauf jederzeit abschließen."
            : "No problem — your cart is still here. You can complete the purchase anytime."}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={`/${locale}/checkout`}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-medium text-[var(--color-text-inverse)] transition-colors hover:opacity-90"
          >
            {de ? "Zurück zur Kasse" : "Back to checkout"}
          </Link>
          <Link
            href={`/${locale}/shop`}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-5 py-3 text-sm text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-primary)]/50 hover:text-[var(--color-text-primary)]"
          >
            {de ? "Weiter stöbern" : "Keep browsing"}
          </Link>
        </div>
      </div>
    </main>
  );
}
