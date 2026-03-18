import { NextRequest, NextResponse } from "next/server";
import { processExpiredWaitlistDeadlines } from "@/lib/lifecycle";

function verifyCronAuth(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // Skip auth for local dev
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await processExpiredWaitlistDeadlines();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[cron/waitlist-deadlines] Error:", error);
    return NextResponse.json(
      { error: "Failed to process waitlist deadlines" },
      { status: 500 }
    );
  }
}
