import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/src/lib/logger";
import { createAdminClient } from "@/src/lib/supabase/admin";

/**
 * POST /api/analytics/vitals — accepts Web Vitals beacons from the browser.
 * Wave 6: only with explicit consent (x-consent-analytics: true), else 204.
 * Sprint 6: metrics are persisted to web_vitals (service role). Until the
 * migration is applied remotely the insert fails gracefully and we keep the
 * structured log as before.
 *
 * GET /api/analytics/vitals — p75 per metric over the last 24h for the
 * monitoring dashboard. Returns zeros when the table does not exist yet.
 */

const MetricSchema = z.object({
  name: z.enum(["LCP", "FID", "CLS", "INP", "TTFB", "FCP"]),
  value: z.number().nonnegative(),
  rating: z.enum(["good", "needs-improvement", "poor"]).optional(),
  path: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  const consentHeader = request.headers.get("x-consent-analytics");
  if (consentHeader !== "true") {
    return new NextResponse(null, { status: 204 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const parsed = MetricSchema.safeParse(body);
  if (!parsed.success) {
    // Tolerate unknown shapes (older clients) — log only.
    logger.info("[vitals] unparsed beacon", { detail: JSON.stringify(body) });
    return NextResponse.json({ success: true });
  }

  const metric = parsed.data;
  logger.info("[vitals]", { detail: JSON.stringify(metric) });

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("web_vitals").insert({
      metric: metric.name,
      value: metric.value,
      rating: metric.rating ?? null,
      // strip query/hash — pathname only, no PII
      path: metric.path ? (metric.path.split(/[?#]/)[0] ?? null) : null,
    });
    if (error) {
      // Table not applied yet or transient failure — beacon is best-effort.
      logger.warn("[vitals] persist failed (best-effort)", { error: error.message });
    }
  } catch (err) {
    logger.warn("[vitals] persist skipped", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  const empty = { lcp: 0, fid: 0, cls: 0, inp: 0, samples: 0 };
  try {
    const admin = createAdminClient();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await admin
      .from("web_vitals")
      .select("metric, value")
      .gte("created_at", since)
      .limit(5000);

    if (error || !data) {
      return NextResponse.json({ ...empty, note: "web_vitals table not available yet" });
    }

    const p75 = (name: string) => {
      const values = data
        .filter((row) => row.metric === name)
        .map((row) => Number(row.value))
        .sort((a, b) => a - b);
      if (values.length === 0) return 0;
      return values[Math.min(values.length - 1, Math.floor(values.length * 0.75))] ?? 0;
    };

    return NextResponse.json({
      lcp: p75("LCP"),
      fid: p75("FID"),
      cls: p75("CLS"),
      inp: p75("INP"),
      samples: data.length,
    });
  } catch {
    return NextResponse.json(empty);
  }
}
