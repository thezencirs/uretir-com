import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { deleteConversation, getAnonymousClient, getConversation } from "@/lib/puan-ai/conversation-service";

const paramsSchema = z.object({ id: z.string().uuid() });
type RouteContext = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: RouteContext) {
  const parsed = paramsSchema.safeParse(await context.params);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz sohbet." }, { status: 400 });
  const { clientKey, cookie } = getAnonymousClient(request);
  try {
    const data = await getConversation(clientKey, parsed.data.id);
    const response = data
      ? NextResponse.json({ data })
      : NextResponse.json({ error: "Sohbet bulunamadı." }, { status: 404 });
    if (cookie) response.headers.set("Set-Cookie", cookie);
    return response;
  } catch {
    return NextResponse.json({ error: "Sohbet yüklenemedi." }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const parsed = paramsSchema.safeParse(await context.params);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz sohbet." }, { status: 400 });
  const { clientKey } = getAnonymousClient(request);
  try {
    const deleted = await deleteConversation(clientKey, parsed.data.id);
    return deleted
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Sohbet bulunamadı." }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Sohbet silinemedi." }, { status: 503 });
  }
}

