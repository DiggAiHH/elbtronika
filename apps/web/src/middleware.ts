// Middleware: chains Supabase session refresh + next-intl locale routing
// Eselbrücke: "passport control" — 1) renew JWT, 2) stamp locale, 3) forward
// Auth protection is in layout.tsx server components, NOT here.

import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "../i18n/routing.js";
import { updateSession } from "./lib/supabase/middleware.js";

const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. Supabase session refresh — must run on every request
  const supabaseResponse = await updateSession(request);

  // 2. i18n locale routing — handles /de/... /en/... prefix
  const i18nResponse = handleI18nRouting(request);

  // 3. Merge Supabase auth cookies into the i18n response
  //    Without this step the session token is lost after locale redirect.
  for (const cookie of supabaseResponse.cookies.getAll()) {
    i18nResponse.cookies.set(cookie.name, cookie.value, cookie);
  }

  return i18nResponse;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image  (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
