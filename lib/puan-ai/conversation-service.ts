import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { getPrisma } from "@/lib/puan-ai/db";
import { getVerifiedCampaignsByIds } from "@/lib/puan-ai/catalog-service";

const CLIENT_COOKIE = "puanai_client";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getAnonymousClient(request: NextRequest) {
  const existing = request.cookies.get(CLIENT_COOKIE)?.value;
  if (existing && UUID_PATTERN.test(existing)) return { clientKey: existing, cookie: null };
  const clientKey = randomUUID();
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return {
    clientKey,
    cookie: `${CLIENT_COOKIE}=${clientKey}; Path=/; HttpOnly; SameSite=Strict; Max-Age=31536000${secure}`,
  };
}

export async function getOrCreateConversation(clientKey: string, conversationId: string | undefined, message: string) {
  const prisma = getPrisma();
  if (conversationId) {
    const existing = await prisma.chatConversation.findFirst({ where: { id: conversationId, clientKey } });
    if (existing) return existing;
  }
  return prisma.chatConversation.create({
    data: {
      clientKey,
      title: message.trim().replace(/\s+/g, " ").slice(0, 72),
    },
  });
}

export async function listConversations(clientKey: string) {
  return getPrisma().chatConversation.findMany({
    where: { clientKey },
    orderBy: { updatedAt: "desc" },
    take: 30,
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
  });
}

export async function getConversation(clientKey: string, conversationId: string) {
  const conversation = await getPrisma().chatConversation.findFirst({
    where: { id: conversationId, clientKey },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conversation) return null;

  const campaignIds = [...new Set(conversation.messages.flatMap((message) => message.campaignIds))];
  const campaigns = await getVerifiedCampaignsByIds(campaignIds);
  const campaignMap = new Map(campaigns.map((campaign) => [campaign.id, campaign]));

  return {
    id: conversation.id,
    title: conversation.title,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    messages: conversation.messages.map((message) => ({
      id: message.id,
      role: message.role.toLowerCase() as "user" | "assistant",
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      campaigns: message.campaignIds.flatMap((id) => campaignMap.get(id) ?? []),
    })),
  };
}

export async function deleteConversation(clientKey: string, conversationId: string) {
  const result = await getPrisma().chatConversation.deleteMany({ where: { id: conversationId, clientKey } });
  return result.count > 0;
}

export async function deleteAllConversations(clientKey: string) {
  return getPrisma().chatConversation.deleteMany({ where: { clientKey } });
}

