import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/analytics/vitals
 * Accepts Web Vitals metrics from the browser.
 * Stores in console/logs for now — can be extended to DB/Telemetry.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Log to server console (structured logging)
    console.log("[vitals]", JSON.stringify(body));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
