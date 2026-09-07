import { createHash } from "node:crypto";
import { CampaignStatus, HistoryAction, type Prisma, VerificationStatus } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/puan-ai/db";
import type { AdminResource } from "@/lib/puan-ai/admin-schemas";

function snapshot(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function campaignStatusForVerification(status: VerificationStatus) {
  if (status === VerificationStatus.VERIFIED) return CampaignStatus.VERIFIED;
  if (status === VerificationStatus.REJECTED) return CampaignStatus.REJECTED;
  return CampaignStatus.PENDING_VERIFICATION;
}

async function invalidateCampaign(
  tx: Prisma.TransactionClient,
  campaignId: string,
  reason: string,
) {
  const current = await tx.campaign.findUniqueOrThrow({ where: { id: campaignId } });
  const latestVerification = await tx.verificationLog.findFirst({
    where: { campaignId },
    orderBy: [{ checkedAt: "desc" }, { createdAt: "desc" }],
  });
  if (latestVerification) {
    const checkedAt = new Date();
    await tx.verificationLog.create({
      data: {
        campaignId,
        officialSourceId: latestVerification.officialSourceId,
        status: VerificationStatus.STALE,
        checkedAt,
        nextCheckAt: new Date(checkedAt.getTime() + 60_000),
        checker: "admin",
        summary: `Doğrulanmış veri değişti; yeniden kaynak kontrolü gerekiyor (${reason}).`,
        fingerprint: latestVerification.fingerprint,
      },
    });
  }
  await tx.campaign.update({
    where: { id: campaignId },
    data: {
      status: current.status === CampaignStatus.DRAFT ? CampaignStatus.DRAFT : CampaignStatus.PENDING_VERIFICATION,
      published: false,
    },
  });
  await tx.campaignHistory.create({
    data: {
      campaignId,
      action: HistoryAction.UPDATED,
      snapshot: snapshot({ verificationInvalidated: true, reason }),
      changedBy: "admin",
    },
  });
}

async function invalidateCampaigns(
  tx: Prisma.TransactionClient,
  campaignIds: string[],
  reason: string,
) {
  for (const campaignId of new Set(campaignIds)) {
    await invalidateCampaign(tx, campaignId, reason);
  }
}

export async function listAdminResources(resource: AdminResource) {
  const prisma = getPrisma();
  switch (resource) {
    case "banks":
      return prisma.bank.findMany({ orderBy: { name: "asc" } });
    case "cards":
      return prisma.card.findMany({ include: { bank: { select: { name: true } } }, orderBy: { name: "asc" } });
    case "categories":
      return prisma.merchantCategory.findMany({ include: { parent: { select: { name: true } } }, orderBy: { name: "asc" } });
    case "merchants":
      return prisma.merchant.findMany({ include: { category: { select: { name: true } } }, orderBy: { name: "asc" } });
    case "reward-types":
      return prisma.rewardType.findMany({ orderBy: { name: "asc" } });
    case "campaigns":
      return prisma.campaign.findMany({
        include: {
          bank: { select: { name: true } },
          merchant: { select: { name: true } },
          merchantCategory: { select: { name: true } },
          rewardType: { select: { name: true } },
          cards: { select: { cardId: true } },
          verificationLogs: { orderBy: [{ checkedAt: "desc" }, { createdAt: "desc" }], take: 1 },
        },
        orderBy: { updatedAt: "desc" },
      });
    case "rules":
      return prisma.campaignRule.findMany({ include: { campaign: { select: { title: true } } }, orderBy: [{ campaignId: "asc" }, { priority: "asc" }] });
    case "installments":
      return prisma.installment.findMany({ include: { campaign: { select: { title: true } } }, orderBy: [{ campaignId: "asc" }, { count: "asc" }] });
    case "verifications":
      return prisma.verificationLog.findMany({
        include: {
          campaign: { select: { title: true } },
          officialSource: { select: { url: true, title: true, publisher: true } },
        },
        orderBy: [{ checkedAt: "desc" }, { createdAt: "desc" }],
      });
    case "scoring":
      return prisma.scoringConfiguration.findMany({ orderBy: [{ active: "desc" }, { version: "desc" }] });
  }
}

async function canPublishCampaign(campaignId: string) {
  const latest = await getPrisma().verificationLog.findFirst({
    where: { campaignId },
    include: { officialSource: true },
    orderBy: [{ checkedAt: "desc" }, { createdAt: "desc" }],
  });
  return Boolean(
    latest
    && latest.status === VerificationStatus.VERIFIED
    && latest.checkedAt <= new Date()
    && latest.nextCheckAt >= new Date()
    && latest.officialSource.active
    && latest.officialSource.url.startsWith("https://")
    && latest.fingerprint === latest.officialSource.fingerprint,
  );
}

export async function createAdminResource(resource: AdminResource, data: Record<string, unknown>) {
  const prisma = getPrisma();
  switch (resource) {
    case "banks":
      return prisma.bank.create({ data: data as Prisma.BankCreateInput });
    case "cards": {
      const { bankId, ...values } = data;
      return prisma.card.create({ data: { ...(values as Omit<Prisma.CardUncheckedCreateInput, "bankId">), bankId: String(bankId) } });
    }
    case "categories": {
      const { parentId, ...values } = data;
      return prisma.merchantCategory.create({ data: { ...(values as Omit<Prisma.MerchantCategoryUncheckedCreateInput, "parentId">), parentId: parentId ? String(parentId) : null } });
    }
    case "merchants": {
      const { categoryId, ...values } = data;
      return prisma.merchant.create({ data: { ...(values as Omit<Prisma.MerchantUncheckedCreateInput, "categoryId">), categoryId: String(categoryId) } });
    }
    case "reward-types":
      return prisma.rewardType.create({ data: data as Prisma.RewardTypeCreateInput });
    case "campaigns": {
      const { cardIds, ...values } = data;
      if ((values.published || values.status === CampaignStatus.VERIFIED)) {
        throw new Error("Yeni kampanya önce taslak olarak oluşturulmalı ve doğrulanmalıdır.");
      }
      return prisma.campaign.create({
        data: {
          ...(values as Prisma.CampaignUncheckedCreateInput),
          cards: { create: (cardIds as string[]).map((cardId) => ({ cardId })) },
          history: { create: { action: HistoryAction.CREATED, snapshot: snapshot(values), changedBy: "admin" } },
        },
        include: { cards: true },
      });
    }
    case "rules": {
      return prisma.$transaction(async (tx) => {
        const rule = await tx.campaignRule.create({ data: data as Prisma.CampaignRuleUncheckedCreateInput });
        await invalidateCampaign(tx, rule.campaignId, "campaign_rule_created");
        return rule;
      });
    }
    case "installments": {
      return prisma.$transaction(async (tx) => {
        const installment = await tx.installment.create({ data: data as Prisma.InstallmentUncheckedCreateInput });
        await invalidateCampaign(tx, installment.campaignId, "installment_created");
        return installment;
      });
    }
    case "verifications": {
      const { campaignId, url, title, publisher, evidence, ...logData } = data;
      const campaign = await prisma.campaign.findUnique({ where: { id: String(campaignId) } });
      if (!campaign) throw new Error("Kampanya bulunamadı.");
      if (
        logData.status === VerificationStatus.VERIFIED
        && ((logData.checkedAt as Date) > new Date() || (logData.nextCheckAt as Date) <= new Date())
      ) {
        throw new Error("Doğrulama zamanı gelecekte veya sonraki kontrol tarihi geçmiş olamaz.");
      }
      const fingerprint = createHash("sha256").update(String(evidence)).digest("hex");
      return prisma.$transaction(async (tx) => {
        const source = await tx.officialSource.upsert({
          where: { campaignId_url: { campaignId: campaign.id, url: String(url) } },
          update: {
            title: String(title),
            publisher: String(publisher),
            bankId: campaign.bankId,
            fetchedAt: logData.checkedAt as Date,
            fingerprint,
            active: true,
          },
          create: {
            campaignId: campaign.id,
            bankId: campaign.bankId,
            url: String(url),
            title: String(title),
            publisher: String(publisher),
            fetchedAt: logData.checkedAt as Date,
            fingerprint,
          },
        });
        const log = await tx.verificationLog.create({
          data: {
            campaignId: campaign.id,
            officialSourceId: source.id,
            status: logData.status as VerificationStatus,
            checkedAt: logData.checkedAt as Date,
            nextCheckAt: logData.nextCheckAt as Date,
            checker: String(logData.checker),
            summary: String(logData.summary),
            fingerprint,
          },
        });
        await tx.campaign.update({
          where: { id: campaign.id },
          data: {
            status: campaignStatusForVerification(log.status),
            published: log.status === VerificationStatus.VERIFIED ? campaign.published : false,
          },
        });
        await tx.campaignHistory.create({
          data: {
            campaignId: campaign.id,
            action: log.status === VerificationStatus.VERIFIED ? HistoryAction.VERIFIED : HistoryAction.UPDATED,
            snapshot: snapshot({ verificationId: log.id, status: log.status, fingerprint }),
            changedBy: String(logData.checker),
          },
        });
        return log;
      });
    }
    case "scoring":
      return prisma.scoringConfiguration.create({ data: data as Prisma.ScoringConfigurationCreateInput });
  }
}

export async function updateAdminResource(resource: AdminResource, id: string, data: Record<string, unknown>) {
  const prisma = getPrisma();
  switch (resource) {
    case "banks":
      return prisma.$transaction(async (tx) => {
        const related = await tx.campaign.findMany({ where: { bankId: id }, select: { id: true } });
        const bank = await tx.bank.update({ where: { id }, data: data as Prisma.BankUpdateInput });
        await invalidateCampaigns(tx, related.map((item) => item.id), "bank_updated");
        return bank;
      });
    case "cards":
      return prisma.$transaction(async (tx) => {
        const related = await tx.campaignCard.findMany({ where: { cardId: id }, select: { campaignId: true } });
        const card = await tx.card.update({ where: { id }, data: data as Prisma.CardUncheckedUpdateInput });
        await invalidateCampaigns(tx, related.map((item) => item.campaignId), "card_updated");
        return card;
      });
    case "categories":
      return prisma.$transaction(async (tx) => {
        const related = await tx.campaign.findMany({ where: { merchantCategoryId: id }, select: { id: true } });
        const category = await tx.merchantCategory.update({ where: { id }, data: data as Prisma.MerchantCategoryUncheckedUpdateInput });
        await invalidateCampaigns(tx, related.map((item) => item.id), "merchant_category_updated");
        return category;
      });
    case "merchants":
      return prisma.$transaction(async (tx) => {
        const related = await tx.campaign.findMany({ where: { merchantId: id }, select: { id: true } });
        const merchant = await tx.merchant.update({ where: { id }, data: data as Prisma.MerchantUncheckedUpdateInput });
        await invalidateCampaigns(tx, related.map((item) => item.id), "merchant_updated");
        return merchant;
      });
    case "reward-types":
      return prisma.$transaction(async (tx) => {
        const related = await tx.campaign.findMany({ where: { rewardTypeId: id }, select: { id: true } });
        const rewardType = await tx.rewardType.update({ where: { id }, data: data as Prisma.RewardTypeUpdateInput });
        await invalidateCampaigns(tx, related.map((item) => item.id), "reward_type_updated");
        return rewardType;
      });
    case "campaigns": {
      const { cardIds, ...values } = data;
      const changesEvidence = Array.isArray(cardIds)
        || Object.keys(values).some((key) => key !== "published" && key !== "status");
      if (!changesEvidence && (values.published || values.status === CampaignStatus.VERIFIED) && !(await canPublishCampaign(id))) {
        throw new Error("Kampanya güncel ve eşleşen bir resmi kaynak doğrulaması olmadan yayımlanamaz.");
      }
      return prisma.$transaction(async (tx) => {
        const current = await tx.campaign.findUniqueOrThrow({ where: { id } });
        const startDate = values.startDate instanceof Date ? values.startDate : current.startDate;
        const endDate = values.endDate instanceof Date ? values.endDate : current.endDate;
        if (endDate <= startDate) throw new Error("Bitiş tarihi başlangıçtan sonra olmalıdır.");
        if (Array.isArray(cardIds)) {
          await tx.campaignCard.deleteMany({ where: { campaignId: id } });
          await tx.campaignCard.createMany({ data: cardIds.map((cardId) => ({ campaignId: id, cardId: String(cardId) })) });
        }
        const updateData: Prisma.CampaignUncheckedUpdateInput = changesEvidence
          ? {
              ...(values as Prisma.CampaignUncheckedUpdateInput),
              status: current.status === CampaignStatus.DRAFT ? CampaignStatus.DRAFT : CampaignStatus.PENDING_VERIFICATION,
              published: false,
            }
          : values as Prisma.CampaignUncheckedUpdateInput;
        const campaign = await tx.campaign.update({ where: { id }, data: updateData });
        if (changesEvidence) await invalidateCampaign(tx, id, "campaign_updated");
        await tx.campaignHistory.create({
          data: {
            campaignId: id,
            action: HistoryAction.UPDATED,
            snapshot: snapshot({ ...values, verificationInvalidated: changesEvidence }),
            changedBy: "admin",
          },
        });
        return campaign;
      });
    }
    case "rules": {
      return prisma.$transaction(async (tx) => {
        const previous = await tx.campaignRule.findUniqueOrThrow({ where: { id } });
        const rule = await tx.campaignRule.update({ where: { id }, data: data as Prisma.CampaignRuleUncheckedUpdateInput });
        await invalidateCampaign(tx, previous.campaignId, "campaign_rule_updated");
        if (rule.campaignId !== previous.campaignId) await invalidateCampaign(tx, rule.campaignId, "campaign_rule_moved");
        return rule;
      });
    }
    case "installments": {
      return prisma.$transaction(async (tx) => {
        const previous = await tx.installment.findUniqueOrThrow({ where: { id } });
        const installment = await tx.installment.update({ where: { id }, data: data as Prisma.InstallmentUncheckedUpdateInput });
        await invalidateCampaign(tx, previous.campaignId, "installment_updated");
        if (installment.campaignId !== previous.campaignId) await invalidateCampaign(tx, installment.campaignId, "installment_moved");
        return installment;
      });
    }
    case "verifications": {
      return prisma.$transaction(async (tx) => {
        const existing = await tx.verificationLog.findUniqueOrThrow({
          where: { id },
          include: { officialSource: true, campaign: true },
        });
        const status = (data.status as VerificationStatus | undefined) ?? existing.status;
        const checkedAt = (data.checkedAt as Date | undefined) ?? existing.checkedAt;
        const nextCheckAt = (data.nextCheckAt as Date | undefined) ?? existing.nextCheckAt;
        if (nextCheckAt <= checkedAt) throw new Error("Sonraki kontrol tarihi kontrol tarihinden sonra olmalıdır.");
        if (status === VerificationStatus.VERIFIED && existing.status !== VerificationStatus.VERIFIED) {
          throw new Error("Eski bir kayıt doğrulanmışa çevrilemez; yeni kaynak kanıtıyla yeni doğrulama oluşturun.");
        }
        if (
          status === VerificationStatus.VERIFIED
          && (
            checkedAt > new Date()
            || nextCheckAt <= new Date()
            || !existing.officialSource.active
            || !existing.officialSource.url.startsWith("https://")
            || existing.fingerprint !== existing.officialSource.fingerprint
          )
        ) {
          throw new Error("Bu kayıt güncel ve eşleşen resmî kaynak kanıtı olmadan doğrulanamaz.");
        }
        const log = await tx.verificationLog.update({
          where: { id },
          data: data as Prisma.VerificationLogUpdateInput,
        });
        await tx.campaign.update({
          where: { id: existing.campaignId },
          data: {
            status: campaignStatusForVerification(status),
            published: status === VerificationStatus.VERIFIED ? existing.campaign.published : false,
          },
        });
        await tx.campaignHistory.create({
          data: {
            campaignId: existing.campaignId,
            action: status === VerificationStatus.VERIFIED ? HistoryAction.VERIFIED : HistoryAction.UPDATED,
            snapshot: snapshot({ verificationId: id, status, checkedAt, nextCheckAt }),
            changedBy: String(data.checker ?? existing.checker),
          },
        });
        return log;
      });
    }
    case "scoring":
      return prisma.scoringConfiguration.update({ where: { id }, data: data as Prisma.ScoringConfigurationUpdateInput });
  }
}

export async function deleteAdminResource(resource: AdminResource, id: string) {
  const prisma = getPrisma();
  switch (resource) {
    case "banks":
      return prisma.$transaction(async (tx) => {
        const related = await tx.campaign.findMany({ where: { bankId: id }, select: { id: true } });
        const bank = await tx.bank.update({ where: { id }, data: { status: "INACTIVE" } });
        await invalidateCampaigns(tx, related.map((item) => item.id), "bank_deactivated");
        return bank;
      });
    case "cards":
      return prisma.$transaction(async (tx) => {
        const related = await tx.campaignCard.findMany({ where: { cardId: id }, select: { campaignId: true } });
        const card = await tx.card.update({ where: { id }, data: { active: false } });
        await invalidateCampaigns(tx, related.map((item) => item.campaignId), "card_deactivated");
        return card;
      });
    case "categories":
      return prisma.$transaction(async (tx) => {
        const related = await tx.campaign.findMany({ where: { merchantCategoryId: id }, select: { id: true } });
        const category = await tx.merchantCategory.update({ where: { id }, data: { status: "INACTIVE" } });
        await invalidateCampaigns(tx, related.map((item) => item.id), "merchant_category_deactivated");
        return category;
      });
    case "merchants":
      return prisma.$transaction(async (tx) => {
        const related = await tx.campaign.findMany({ where: { merchantId: id }, select: { id: true } });
        const merchant = await tx.merchant.update({ where: { id }, data: { status: "INACTIVE" } });
        await invalidateCampaigns(tx, related.map((item) => item.id), "merchant_deactivated");
        return merchant;
      });
    case "reward-types":
      return prisma.$transaction(async (tx) => {
        const related = await tx.campaign.findMany({ where: { rewardTypeId: id }, select: { id: true } });
        const rewardType = await tx.rewardType.update({ where: { id }, data: { status: "INACTIVE" } });
        await invalidateCampaigns(tx, related.map((item) => item.id), "reward_type_deactivated");
        return rewardType;
      });
    case "campaigns":
      return prisma.$transaction(async (tx) => {
        const campaign = await tx.campaign.update({ where: { id }, data: { status: "REJECTED", published: false } });
        await tx.campaignHistory.create({
          data: { campaignId: id, action: HistoryAction.DELETED, snapshot: snapshot({ softDeleted: true }), changedBy: "admin" },
        });
        return campaign;
      });
    case "rules": {
      return prisma.$transaction(async (tx) => {
        const rule = await tx.campaignRule.delete({ where: { id } });
        await invalidateCampaign(tx, rule.campaignId, "campaign_rule_deleted");
        return rule;
      });
    }
    case "installments": {
      return prisma.$transaction(async (tx) => {
        const installment = await tx.installment.delete({ where: { id } });
        await invalidateCampaign(tx, installment.campaignId, "installment_deleted");
        return installment;
      });
    }
    case "verifications": {
      return prisma.$transaction(async (tx) => {
        const deleted = await tx.verificationLog.delete({ where: { id } });
        const checkedAt = new Date();
        await tx.verificationLog.create({
          data: {
            campaignId: deleted.campaignId,
            officialSourceId: deleted.officialSourceId,
            status: VerificationStatus.STALE,
            checkedAt,
            nextCheckAt: new Date(checkedAt.getTime() + 60_000),
            checker: "admin",
            summary: "Doğrulama kaydı silindi; kampanya yeniden doğrulanmalıdır.",
            fingerprint: deleted.fingerprint,
          },
        });
        await tx.campaign.update({
          where: { id: deleted.campaignId },
          data: {
            status: CampaignStatus.PENDING_VERIFICATION,
            published: false,
          },
        });
        await tx.campaignHistory.create({
          data: {
            campaignId: deleted.campaignId,
            action: HistoryAction.UPDATED,
            snapshot: snapshot({ deletedVerificationId: id, verificationInvalidated: true }),
            changedBy: "admin",
          },
        });
        return deleted;
      });
    }
    case "scoring":
      return prisma.scoringConfiguration.update({ where: { id }, data: { active: false } });
  }
}
