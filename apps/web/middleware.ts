// Middleware: chains Supabase session refresh + next-intl locale routing.
// Eselsbrücke: "passport control" — 1) renew JWT, 2) stamp locale, 3) forward.
// Auth protection lives in layout.tsx server components, NOT here.
//
// NOTE (Sprint 4, 2026-07-09): there used to be TWO middleware files — this
// one (i18n only) and src/middleware.ts (i18n + session refresh). Next.js
// only picks up the root-level file when /app lives at the root, so the
// session-refresh variant was dead code and expiring sessions were never
// renewed during RSC navigation. Consolidated here; src/middleware.ts removed.

import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./src/lib/supabase/middleware";

const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. Supabase session refresh — must run on every matched request
  const supabaseResponse = await updateSession(request);

  // 2. i18n locale routing — handles /de/... /en/... prefix
  const i18nResponse = handleI18nRouting(request);

  // 3. Merge Supabase auth cookies into the i18n response.
  //    Without this step the refreshed token is lost after locale redirect.
  for (const cookie of supabaseResponse.cookies.getAll()) {
    i18nResponse.cookies.set(cookie.name, cookie.value, cookie);
  }

  return i18nResponse;
}

export const config = {
  // Match all pathnames except static files, API routes, and Next.js internals.
  // API routes authenticate themselves; the browser SDK refreshes tokens for
  // client-side calls.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)).*)",
  ],
};
