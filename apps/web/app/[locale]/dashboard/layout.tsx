// Dashboard layout — server-side auth guard
// Eselbrücke: "bouncer" — no token, no entry, redirect to login

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/supabase/auth-actions";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DashboardLayout({ children, params }: Props) {
  const { locale } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return <>{children}</>;
}
