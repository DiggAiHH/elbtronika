"use client";

// Browser Supabase client — singleton, safe to call in Client Components
// Eselbrücke: "one tab = one client" — createBrowserClient memoizes automatically

import type { Database } from "@elbtronika/contracts";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Static member access so Next.js inlines the values into the client
  // bundle; explicit guard instead of non-null assertions.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createBrowserClient<Database>(url, anonKey);
}
