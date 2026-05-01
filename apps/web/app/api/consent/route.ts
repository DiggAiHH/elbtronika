import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ConsentSchema = z.object({
  necessary: z.literal(true),
  analytics: z.boolean(),
  marketing: z.boolean(),
  timestamp: z.string().datetime(),
});

/**
 * POST /api/consent
 * Validates consent payload. Storage is client-side (localStorage).
 * Server-side validation ensures schema compliance.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parse = ConsentSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid consent data" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
