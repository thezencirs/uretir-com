import type { NextRequest } from "next/server";
import { z } from "zod";
import { streamGroundedExplanation } from "@/lib/puan-ai/ai-service";
import { searchVerifiedCampaigns } from "@/lib/puan-ai/catalog-service";
import { getAnonymousClient, getOrCreateConversation } from "@/lib/puan-ai/conversation-service";
import { getPrisma } from "@/lib/puan-ai/db";
import type { ChatEvent } from "@/lib/puan-ai/types";
import { UNVERIFIED_RESPONSE } from "@/lib/puan-ai/types";

const chatSchema = z.object({
  message: z.string().trim().min(1).max(1_200),
  conversationId: z.string().uuid().optional(),
});

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function encodeEvent(event: ChatEvent) {
  return new TextEncoder().encode(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
}

export async function POST(request: NextRequest) {
  const payload = chatSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return new Response("Geçersiz istek.", { status: 400 });

  const { clientKey, cookie } = getAnonymousClient(request);
  let conversationId = payload.data.conversationId ?? "";
  let conversationReady = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const prisma = getPrisma();
        const conversation = await getOrCreateConversation(clientKey, payload.data.conversationId, payload.data.message);
        conversationId = conversation.id;
        conversationReady = true;

        const previousMessages = await prisma.chatMessage.findMany({
          where: { conversationId, role: "USER" },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: { content: true },
        });

        await prisma.chatMessage.create({
          data: { conversationId, role: "USER", content: payload.data.message },
        });

        const groundedQuery = [...previousMessages.reverse().map((item) => item.content), payload.data.message].join(" ");
        const campaigns = await searchVerifiedCampaigns(groundedQuery);
        controller.enqueue(encodeEvent({ type: "meta", conversationId, campaigns }));

        let answer = "";
        if (campaigns.length === 0) {
          answer = UNVERIFIED_RESPONSE;
          controller.enqueue(encodeEvent({ type: "delta", delta: answer }));
        } else {
          for await (const delta of streamGroundedExplanation(payload.data.message, campaigns)) {
            answer += delta;
            controller.enqueue(encodeEvent({ type: "delta", delta }));
          }
        }

        await prisma.chatMessage.create({
          data: {
            conversationId,
            role: "ASSISTANT",
            content: answer || UNVERIFIED_RESPONSE,
            campaignIds: campaigns.map((campaign) => campaign.id),
          },
        });
        await prisma.chatConversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
        controller.enqueue(encodeEvent({ type: "done", conversationId }));
      } catch {
        const message = UNVERIFIED_RESPONSE;
        if (!conversationReady) controller.enqueue(encodeEvent({ type: "meta", conversationId, campaigns: [] }));
        controller.enqueue(encodeEvent({ type: "delta", delta: message }));
        controller.enqueue(encodeEvent({ type: "done", conversationId }));
      } finally {
        controller.close();
      }
    },
  });

  const headers = new Headers({
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  if (cookie) headers.set("Set-Cookie", cookie);
  return new Response(stream, { headers });
}

