import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyCampaignUrl } from "@/lib/puan-ai/source-verifier";

const payloadSchema = z.object({ url: z.string().url().max(2_000) });
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const payload = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ error: "Geçerli bir kampanya URL'si girin." }, { status: 400 });
  const result = await verifyCampaignUrl(payload.data.url);
  return NextResponse.json({ data: result }, { status: result.status === "SOURCE_UNAVAILABLE" ? 503 : 200 });
}
