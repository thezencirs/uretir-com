import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/puan-ai/admin-auth";
import { getPrisma } from "@/lib/puan-ai/db";
import { storeCampaignSubmission } from "@/lib/puan-ai/intake-service";

export const runtime = "nodejs";

const bodySchema = z.object({
  messageId: z.string().min(1).max(200).optional(),
  channelId: z.string().max(200).optional(),
  senderId: z.string().max(200).optional(),
  text: z.string().min(1).max(20_000),
  receivedAt: z.iso.datetime().optional(),
});

function bearer(request: NextRequest) {
  return request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
}

export async function POST(request: NextRequest) {
  if (!process.env.PUANAI_INGEST_TOKEN || bearer(request) !== process.env.PUANAI_INGEST_TOKEN) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Mesaj biçimi geçersiz.", issues: parsed.error.flatten() }, { status: 400 });
  const data = await storeCampaignSubmission({
    providerMessageId: parsed.data.messageId ?? `agent:${randomUUID()}`,
    channelId: parsed.data.channelId ?? null,
    senderId: parsed.data.senderId ?? null,
    text: parsed.data.text,
    receivedAt: parsed.data.receivedAt ? new Date(parsed.data.receivedAt) : new Date(),
  });
  return NextResponse.json({ data }, { status: 202 });
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  const data = await getPrisma().campaignSubmission.findMany({ orderBy: { receivedAt: "desc" }, take: 100 });
  return NextResponse.json({ data });
}
