import { NextResponse } from "next/server";
import { getClient } from "@/src/lib/sanity/client";
import { createClient } from "@/src/lib/supabase/server";

/**
 * GET /api/health
 * Comprehensive health check for Netlify + Uptime monitoring.
 * Checks: Supabase connection, Sanity API, app status.
 */
export async function GET() {
  const checks: Record<string, "ok" | "fail"> = {
    app: "ok",
    supabase: "ok",
    sanity: "ok",
  };

  // Check Supabase
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").select("id", { count: "exact", head: true });
    if (error) checks.supabase = "fail";
  } catch {
    checks.supabase = "fail";
  }

  // Check Sanity
  try {
    const client = getClient();
    await client.fetch(`count(*[_type == "artwork"])`, {}, { cache: "no-store" });
  } catch {
    checks.sanity = "fail";
  }

  const allOk = Object.values(checks).every((v) => v === "ok");

  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "unknown",
      checks,
    },
    { status: allOk ? 200 : 503 },
  );
}
