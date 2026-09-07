import type { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/puan-ai/db";
import { verifyCampaignUrl } from "@/lib/puan-ai/source-verifier";
import { extractMessageFacts, extractUrls, type IncomingCampaignMessage } from "@/lib/puan-ai/whatsapp-intake";

function json(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function storeCampaignSubmission(message: IncomingCampaignMessage) {
  const sourceUrl = extractUrls(message.text)[0] ?? null;
  return getPrisma().campaignSubmission.upsert({
    where: { providerMessageId: message.providerMessageId },
    update: {},
    create: {
      providerMessageId: message.providerMessageId,
      channelId: message.channelId,
      senderId: message.senderId,
      rawText: message.text,
      sourceUrl,
      receivedAt: message.receivedAt,
      status: sourceUrl ? "RECEIVED" : "URL_REQUIRED",
      normalizedDraft: json({ ...extractMessageFacts(message.text), sourceUrl }),
    },
  });
}

export async function processCampaignSubmission(id: string, now = new Date()) {
  const prisma = getPrisma();
  const submission = await prisma.campaignSubmission.findUniqueOrThrow({ where: { id } });
  if (!submission.sourceUrl) return prisma.campaignSubmission.update({
    where: { id },
    data: { status: "URL_REQUIRED", processedAt: now, error: "Kampanya kaynağı URL olarak paylaşılmadı." },
  });

  await prisma.campaignSubmission.update({ where: { id }, data: { status: "VERIFYING", attemptCount: { increment: 1 }, error: null } });
  try {
    const verification = await verifyCampaignUrl(submission.sourceUrl, now);
    const messageFacts = extractMessageFacts(submission.rawText);
    const hasDecisionFacts = Boolean(
      verification.validUntil
      && (messageFacts.minimumSpend !== null || messageFacts.statedReward !== null || messageFacts.installmentCounts.length > 0)
      && messageFacts.cardPrograms.length > 0,
    );
    const status = verification.status === "SOURCE_UNAVAILABLE"
      ? "SOURCE_UNAVAILABLE"
      : verification.status === "EXPIRED"
        ? "EXPIRED"
        : verification.status === "VERIFIED" && hasDecisionFacts
          ? "VERIFIED"
          : "NEEDS_REVIEW";
    return prisma.campaignSubmission.update({
      where: { id },
      data: {
        status,
        verification: json(verification),
        normalizedDraft: json({ ...messageFacts, sourceUrl: submission.sourceUrl, validFrom: verification.validFrom, validUntil: verification.validUntil, sourceTitle: verification.title }),
        processedAt: now,
        nextAttemptAt: status === "SOURCE_UNAVAILABLE" ? new Date(now.getTime() + 6 * 3_600_000) : null,
        error: status === "VERIFIED" ? null : verification.reason,
      },
    });
  } catch (error) {
    return prisma.campaignSubmission.update({
      where: { id },
      data: {
        status: "SOURCE_UNAVAILABLE",
        processedAt: now,
        nextAttemptAt: new Date(now.getTime() + 6 * 3_600_000),
        error: error instanceof Error ? error.message : "Kaynak doğrulaması başarısız oldu.",
      },
    });
  }
}

export async function processPendingCampaignSubmissions(limit = 25, now = new Date()) {
  const pending = await getPrisma().campaignSubmission.findMany({
    where: {
      OR: [
        { status: "RECEIVED" },
        { status: "SOURCE_UNAVAILABLE", nextAttemptAt: { lte: now }, attemptCount: { lt: 5 } },
      ],
    },
    orderBy: { receivedAt: "asc" },
    take: Math.min(Math.max(limit, 1), 100),
  });
  const results = [];
  for (const item of pending) results.push(await processCampaignSubmission(item.id, now));
  return results;
}
