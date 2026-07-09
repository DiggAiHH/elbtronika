// Server Supabase client — for Server Components, Route Handlers, Server Actions
// Eselbrücke: "cookies in, cookies out" — createServerClient wires Next.js cookie jar

import type { Database } from "@elbtronika/contracts";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  // Static member access (not process.env[name]) so Next.js can inline the
  // values; explicit guard instead of non-null assertions.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // setAll is called from Server Components where cookies() is read-only.
          // The middleware (see middleware.ts) handles session refresh instead.
        }
      },
    },
  });
}
