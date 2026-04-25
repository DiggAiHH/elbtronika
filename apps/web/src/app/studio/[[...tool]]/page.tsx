"use client";

/**
 * Embedded Sanity Studio — accessible at /studio
 * Protected: only users with role='curator' or role='admin' should reach this route.
 * Auth guard lives in middleware.ts (extend when auth is wired in Phase 4).
 */
import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
