import { NextResponse } from "next/server";

// Health check endpoint – used by Netlify + Uptime monitoring (Phase 15)
export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: process.env["npm_package_version"] ?? "unknown",
    },
    { status: 200 },
  );
}
