import { NextResponse, type NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/puan-ai/admin-auth";
import { getPrisma } from "@/lib/puan-ai/db";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  const prisma = getPrisma();
  try {
    const [runs, submissions, sources, campaigns, oldestPending] = await Promise.all([
      prisma.automationRun.findMany({ orderBy: { startedAt: "desc" }, take: 50 }),
      prisma.campaignSubmission.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.officialSource.groupBy({ by: ["health"], _count: { _all: true } }),
      prisma.campaign.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.campaignSubmission.findFirst({ where: { status: { in: ["RECEIVED", "SOURCE_UNAVAILABLE", "VERIFYING"] } }, orderBy: { receivedAt: "asc" }, select: { receivedAt: true } }),
    ]);
    return NextResponse.json({ data: { runs, submissions, sources, campaigns, oldestPendingAt: oldestPending?.receivedAt ?? null } });
  } catch {
    return NextResponse.json({ error: "Otomasyon durumu okunamadı." }, { status: 503 });
  }
}
