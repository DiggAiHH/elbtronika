import type { ReactNode } from "react";
import { CartDrawer } from "./components/CartDrawer";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ShopGroupLayout({ children, params }: Props) {
  const { locale } = await params;

  return (
    <>
      {children}
      <CartDrawer locale={locale} />
    </>
  );
}