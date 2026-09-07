import { NextResponse, type NextRequest } from "next/server";
import { parseMetaWebhook, verifyMetaSignature } from "@/lib/puan-ai/whatsapp-intake";
import { storeCampaignSubmission } from "@/lib/puan-ai/intake-service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  if (query.get("hub.mode") !== "subscribe" || query.get("hub.verify_token") !== process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  return new NextResponse(query.get("hub.challenge") ?? "", { status: 200 });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (!verifyMetaSignature(rawBody, request.headers.get("x-hub-signature-256"), process.env.WHATSAPP_APP_SECRET)) {
    return NextResponse.json({ error: "Geçersiz WhatsApp imzası." }, { status: 401 });
  }
  let payload: unknown;
  try { payload = JSON.parse(rawBody); } catch { return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 }); }
  const messages = parseMetaWebhook(payload);
  await Promise.all(messages.map(storeCampaignSubmission));
  return NextResponse.json({ accepted: messages.length });
}
