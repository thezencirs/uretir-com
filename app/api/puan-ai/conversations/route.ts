import { NextResponse, type NextRequest } from "next/server";
import { deleteAllConversations, getAnonymousClient, listConversations } from "@/lib/puan-ai/conversation-service";

export const dynamic = "force-dynamic";

function withClientCookie(response: NextResponse, cookie: string | null) {
  if (cookie) response.headers.set("Set-Cookie", cookie);
  return response;
}

export async function GET(request: NextRequest) {
  const { clientKey, cookie } = getAnonymousClient(request);
  try {
    return withClientCookie(NextResponse.json({ data: await listConversations(clientKey) }), cookie);
  } catch {
    return withClientCookie(NextResponse.json({ data: [], error: "Sohbet geçmişi yüklenemedi." }, { status: 503 }), cookie);
  }
}

export async function DELETE(request: NextRequest) {
  const { clientKey, cookie } = getAnonymousClient(request);
  try {
    await deleteAllConversations(clientKey);
    return withClientCookie(NextResponse.json({ ok: true }), cookie);
  } catch {
    return withClientCookie(NextResponse.json({ ok: false }, { status: 503 }), cookie);
  }
}

