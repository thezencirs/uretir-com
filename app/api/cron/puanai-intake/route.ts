import { NextResponse, type NextRequest } from "next/server";
import { processPendingCampaignSubmissions } from "@/lib/puan-ai/intake-service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  const results = await processPendingCampaignSubmissions(25);
  return NextResponse.json({ processed: results.length, results: results.map(({ id, status }) => ({ id, status })) });
}
