// Supabase admin client — SERVICE ROLE key, server-only
// Eselbrücke: "master key" — bypasses RLS, ONLY for trusted server contexts
// (webhooks, background jobs). NEVER import in Client Components or expose to browser.

import type { Database } from "@elbtronika/contracts";
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL not configured");
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");

  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
