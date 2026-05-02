import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/analytics/vitals
 * Accepts Web Vitals metrics from the browser.
 * Wave 6: Only processes metrics when the client signals analytics consent via
 * the x-consent-analytics: true header. Returns 204 without logging if absent.
 */
export async function POST(request: NextRequest) {
  // Wave 6: Gate on analytics consent — client must opt in explicitly
  const consentHeader = request.headers.get("x-consent-analytics");
  if (consentHeader !== "true") {
    // Silently ignore — no consent, no logging
    return new NextResponse(null, { status: 204 });
  }

  try {
    const body = await request.json();
    // Log to server console (structured logging)
    console.log("[vitals]", JSON.stringify(body));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
