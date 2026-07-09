// Supabase session refresh for Next.js middleware
// Eselbrücke: "border control" — renews JWT before every request, no auth guard here
// Auth protection lives in route layouts (server components) — not middleware.

import type { Database } from "@elbtronika/contracts";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    // Fail open: without config we cannot refresh, but the request must pass.
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        supabaseResponse = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  // MUST NOT remove: keeps user session alive by refreshing the JWT.
  // Do not add auth guard here — use server component layouts instead.
  await supabase.auth.getUser();

  return supabaseResponse;
}
