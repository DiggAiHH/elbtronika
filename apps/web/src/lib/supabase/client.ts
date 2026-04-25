"use client";

// Browser Supabase client — singleton, safe to call in Client Components
// Eselbrücke: "one tab = one client" — createBrowserClient memoizes automatically

import type { Database } from "@elbtronika/contracts";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
