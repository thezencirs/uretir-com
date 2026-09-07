import type { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/puan-ai/db";
import { verifyCampaignUrl } from "@/lib/puan-ai/source-verifier";
import { extractMessageFacts, extractUrls, type IncomingCampaignMessage } from "@/lib/puan-ai/whatsapp-intake";

function json(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

type MessageFacts = ReturnType<typeof extractMessageFacts>;

export function compareMessageWithSource(message: MessageFacts, source: Awaited<ReturnType<typeof verifyCampaignUrl>>["evidence"]) {
  const conflicts: string[] = [];
  for (const value of [message.minimumSpend, message.statedReward]) {
    if (value !== null && !source.monetaryAmounts.includes(value)) conflicts.push(`Mesajdaki ${value} TL kaynak metninde doğrulanamadı.`);
  }
  for (const count of message.installmentCounts) {
    if (!source.installmentCounts.includes(count)) conflicts.push(`Mesajdaki ${count} taksit kaynak metninde doğrulanamadı.`);
  }
  const normalizedSourcePrograms = source.cardPrograms.map((item) => item.toLocaleLowerCase("tr-TR"));
  for (const program of message.cardPrograms) {
    const normalized = program.toLocaleLowerCase("tr-TR");
    const compatible = normalizedSourcePrograms.some((item) => item === normalized || item.includes(normalized) || normalized.includes(item));
    if (!compatible) conflicts.push(`Mesajdaki ${program} kart programı kaynak metninde doğrulanamadı.`);
  }
  if (message.participationRequired && !source.participationRequired) conflicts.push("Mesajdaki katılım zorunluluğu kaynak metninde doğrulanamadı.");
  return conflicts;
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

export async function processCampaignSubmission(id: string, now = new Date(), verifier: typeof verifyCampaignUrl = verifyCampaignUrl) {
  const prisma = getPrisma();
  let submission = await prisma.campaignSubmission.findUniqueOrThrow({ where: { id } });
  if (!submission.sourceUrl) return prisma.campaignSubmission.update({
    where: { id },
    data: { status: "URL_REQUIRED", processedAt: now, error: "Kampanya kaynağı URL olarak paylaşılmadı." },
  });

  const claimed = await prisma.campaignSubmission.updateMany({
    where: { id, status: { in: ["RECEIVED", "SOURCE_UNAVAILABLE"] } },
    data: { status: "VERIFYING", attemptCount: { increment: 1 }, error: null },
  });
  if (claimed.count === 0) return submission;
  submission = await prisma.campaignSubmission.findUniqueOrThrow({ where: { id } });
  const sourceUrl = submission.sourceUrl;
  if (!sourceUrl) return submission;
  try {
    const verification = await verifier(sourceUrl, now);
    const messageFacts = extractMessageFacts(submission.rawText);
    const conflicts = compareMessageWithSource(messageFacts, verification.evidence);
    const hasDecisionFacts = Boolean(
      verification.validUntil
      && (verification.evidence.monetaryAmounts.length > 0 || verification.evidence.installmentCounts.length > 0)
      && verification.evidence.cardPrograms.length > 0,
    );
    const status = verification.status === "SOURCE_UNAVAILABLE"
      ? "SOURCE_UNAVAILABLE"
      : verification.status === "EXPIRED"
        ? "EXPIRED"
        : verification.status === "VERIFIED" && verification.evidence.sourceKind === "OFFICIAL_BANK_CARD" && hasDecisionFacts && conflicts.length === 0
          ? "VERIFIED"
          : "NEEDS_REVIEW";
    const reason = status === "VERIFIED"
      ? null
      : conflicts.length > 0
        ? `Kaynaklar arasında farklılık var: ${conflicts.join(" ")}`
        : verification.evidence.sourceKind !== "OFFICIAL_BANK_CARD"
          ? "Kaynak resmî banka veya kart programı alan adı olarak doğrulanamadı."
          : verification.reason;
    return prisma.campaignSubmission.update({
      where: { id },
      data: {
        status,
        verification: json(verification),
        normalizedDraft: json({ messageFacts, sourceFacts: verification.evidence, conflicts, sourceUrl, validFrom: verification.validFrom, validUntil: verification.validUntil, sourceTitle: verification.title }),
        processedAt: now,
        nextAttemptAt: status === "SOURCE_UNAVAILABLE"
          ? new Date(now.getTime() + Math.min(24, 2 ** Math.max(submission.attemptCount, 1)) * 3_600_000)
          : null,
        error: reason,
      },
    });
  } catch (error) {
    return prisma.campaignSubmission.update({
      where: { id },
      data: {
        status: "SOURCE_UNAVAILABLE",
        processedAt: now,
        nextAttemptAt: new Date(now.getTime() + Math.min(24, 2 ** Math.max(submission.attemptCount, 1)) * 3_600_000),
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
