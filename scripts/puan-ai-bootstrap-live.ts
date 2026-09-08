import "dotenv/config";
import { getPrisma } from "../lib/puan-ai/db";
import { verifyCampaignUrl } from "../lib/puan-ai/source-verifier";

const sourceUrl = "https://www.bankkart.com.tr/kampanyalar/elektronik-ve-telekomunikasyon/okula-donus-elektronik-alisverislerinize-7500-tl-jest-lira";

async function main() {
  const verification = await verifyCampaignUrl(sourceUrl);
  if (
    verification.status !== "VERIFIED"
    || !verification.fingerprint
    || !verification.validFrom
    || !verification.validUntil
    || verification.evidence.sourceKind !== "OFFICIAL_BANK_CARD"
    || !verification.evidence.cardPrograms.includes("Bankkart")
    || verification.evidence.rewardTiers.length !== 4
  ) {
    throw new Error(`Resmî kampanya güvenle içe aktarılamadı: ${verification.reason}`);
  }

  const orderedTiers = [...verification.evidence.rewardTiers].sort((a, b) => a.minimumSpend - b.minimumSpend);
  for (let index = 0; index < orderedTiers.length; index += 1) {
    const tier = orderedTiers[index];
    const next = orderedTiers[index + 1];
    if (tier.minimumSpend <= 0 || tier.rewardAmount <= 0 || (tier.maximumSpend !== null && tier.maximumSpend < tier.minimumSpend)) {
      throw new Error("Kaynakta geçersiz kampanya kademesi bulundu.");
    }
    if (next && tier.maximumSpend !== null && tier.maximumSpend >= next.minimumSpend) {
      throw new Error("Kaynakta çakışan kampanya kademeleri bulundu.");
    }
  }

  const prisma = getPrisma();
  const fetchedAt = new Date(verification.fetchedAt);
  const startDate = new Date(verification.validFrom);
  const endDate = new Date(verification.validUntil);
  const maxReward = Math.max(...orderedTiers.map((tier) => tier.rewardAmount));

  await prisma.$transaction(async (tx) => {
    const bank = await tx.bank.upsert({
      where: { slug: "ziraat-bankasi" },
      update: { name: "Ziraat Bankası", officialName: "T.C. Ziraat Bankası A.Ş.", shortName: "Ziraat", websiteUrl: "https://www.ziraatbank.com.tr", color: "#e30613", status: "ACTIVE" },
      create: { slug: "ziraat-bankasi", name: "Ziraat Bankası", officialName: "T.C. Ziraat Bankası A.Ş.", shortName: "Ziraat", websiteUrl: "https://www.ziraatbank.com.tr", color: "#e30613" },
    });
    const program = await tx.cardProgram.upsert({
      where: { slug: "bankkart" },
      update: { bankId: bank.id, name: "Bankkart", websiteUrl: "https://www.bankkart.com.tr", status: "ACTIVE" },
      create: { bankId: bank.id, slug: "bankkart", name: "Bankkart", websiteUrl: "https://www.bankkart.com.tr" },
    });
    const card = await tx.card.upsert({
      where: { slug: "bankkart-kredi-karti" },
      update: { bankId: bank.id, cardProgramId: program.id, name: "Bireysel Bankkart", network: "OTHER", rewardProgram: "Jest Lira", active: true },
      create: { bankId: bank.id, cardProgramId: program.id, slug: "bankkart-kredi-karti", name: "Bireysel Bankkart", network: "OTHER", rewardProgram: "Jest Lira" },
    });
    const category = await tx.merchantCategory.upsert({
      where: { slug: "elektronik-beyaz-esya" },
      update: { name: "Elektronik ve Beyaz Eşya", aliases: ["elektronik", "teknoloji", "beyaz eşya", "bilgisayar"], status: "ACTIVE" },
      create: { slug: "elektronik-beyaz-esya", name: "Elektronik ve Beyaz Eşya", aliases: ["elektronik", "teknoloji", "beyaz eşya", "bilgisayar"] },
    });
    const rewardType = await tx.rewardType.upsert({
      where: { slug: "jest-lira" },
      update: { name: "Jest Lira", kind: "POINTS", unit: "TL değerinde ödül", status: "ACTIVE" },
      create: { slug: "jest-lira", name: "Jest Lira", kind: "POINTS", unit: "TL değerinde ödül" },
    });
    const campaign = await tx.campaign.upsert({
      where: { slug: "bankkart-okula-donus-elektronik-eylul-2026" },
      update: { bankId: bank.id, merchantId: null, merchantCategoryId: category.id, rewardTypeId: rewardType.id, title: "Okula Dönüş Elektronik Alışverişlerine Jest Lira", description: "Bireysel Bankkart kredi kartıyla, Bankkart POS üzerinden elektronik ve beyaz eşya sektöründeki uygun üye işyerlerinde yapılan tek seferlik alışverişler için kademeli Jest Lira kampanyası.", benefitSummary: `25.000 TL'den başlayan uygun alışverişlere ${maxReward.toLocaleString("tr-TR")} TL'ye varan Jest Lira`, startDate, endDate, status: "ACTIVE", published: true },
      create: { slug: "bankkart-okula-donus-elektronik-eylul-2026", bankId: bank.id, merchantCategoryId: category.id, rewardTypeId: rewardType.id, title: "Okula Dönüş Elektronik Alışverişlerine Jest Lira", description: "Bireysel Bankkart kredi kartıyla, Bankkart POS üzerinden elektronik ve beyaz eşya sektöründeki uygun üye işyerlerinde yapılan tek seferlik alışverişler için kademeli Jest Lira kampanyası.", benefitSummary: `25.000 TL'den başlayan uygun alışverişlere ${maxReward.toLocaleString("tr-TR")} TL'ye varan Jest Lira`, startDate, endDate, status: "ACTIVE", published: true },
    });

    await tx.campaignCard.deleteMany({ where: { campaignId: campaign.id } });
    await tx.campaignCard.create({ data: { campaignId: campaign.id, cardId: card.id } });
    await tx.campaignTier.deleteMany({ where: { campaignId: campaign.id } });
    await tx.campaignTier.createMany({ data: orderedTiers.map((tier, priority) => ({ campaignId: campaign.id, ...tier, description: tier.maximumSpend === null ? `${tier.minimumSpend.toLocaleString("tr-TR")} TL ve üzeri alışverişe ${tier.rewardAmount.toLocaleString("tr-TR")} TL Jest Lira` : `${tier.minimumSpend.toLocaleString("tr-TR")}-${tier.maximumSpend.toLocaleString("tr-TR")} TL alışverişe ${tier.rewardAmount.toLocaleString("tr-TR")} TL Jest Lira`, priority })) });
    await tx.campaignRule.deleteMany({ where: { campaignId: campaign.id } });
    await tx.campaignRule.createMany({ data: [
      { campaignId: campaign.id, kind: "MIN_SPEND", operator: "GTE", numericValue: orderedTiers[0].minimumSpend, unit: "TRY", description: "Tek seferde en az 25.000 TL uygun alışveriş gerekir.", priority: 0 },
      { campaignId: campaign.id, kind: "MAX_REWARD", operator: "LTE", numericValue: maxReward, unit: "TRY", description: `Müşteri başına en fazla ${maxReward.toLocaleString("tr-TR")} TL Jest Lira kazanılabilir.`, priority: 1 },
      { campaignId: campaign.id, kind: "REQUIRED_ENROLLMENT", operator: "INFO", textValue: "Bankkart Mobil veya bankkart.com.tr", description: "Alışverişten önce kampanyaya katılım gerekir.", priority: 2 },
      { campaignId: campaign.id, kind: "REQUIRED_PAYMENT_METHOD", operator: "INFO", textValue: "Bankkart kredi kartı özelliği ve Bankkart POS", description: "İşlem bireysel Bankkart kredi kartı özelliğiyle, anlaşmalı üye işyerinde Bankkart POS üzerinden yapılmalıdır.", priority: 3 },
      { campaignId: campaign.id, kind: "EXCLUSION", operator: "EXCLUDES", textValue: "Bankkart Başak, Bankkart Business, Bankkart Jest Ücretsiz", description: "Bankkart Başak, Bankkart Business ve Bankkart Jest Ücretsiz kartlar dahil değildir.", priority: 4 },
      { campaignId: campaign.id, kind: "EXCLUSION", operator: "EXCLUDES", textValue: "klima, kombi, ısıtma, soğutma", description: "Klima, kombi, ısıtma ve soğutma sektöründeki işlemler dahil değildir.", priority: 5 },
    ] });

    const source = await tx.officialSource.upsert({
      where: { campaignId_url: { campaignId: campaign.id, url: sourceUrl } },
      update: { bankId: bank.id, title: verification.title ?? campaign.title, publisher: "Bankkart", fetchedAt, fingerprint: verification.fingerprint!, active: true, sourceKind: "OFFICIAL_CARD_PROGRAM", trustScore: verification.evidence.trustScore, health: "ONLINE", lastVerifiedAt: fetchedAt, validFrom: startDate, validUntil: endDate },
      create: { campaignId: campaign.id, bankId: bank.id, url: sourceUrl, title: verification.title ?? campaign.title, publisher: "Bankkart", fetchedAt, fingerprint: verification.fingerprint!, sourceKind: "OFFICIAL_CARD_PROGRAM", trustScore: verification.evidence.trustScore, health: "ONLINE", lastVerifiedAt: fetchedAt, validFrom: startDate, validUntil: endDate },
    });
    await tx.verificationLog.create({ data: { campaignId: campaign.id, officialSourceId: source.id, status: "VERIFIED", checkedAt: fetchedAt, nextCheckAt: new Date(fetchedAt.getTime() + 6 * 3_600_000), checker: "bootstrap:live-official-source", summary: "Resmî Bankkart sayfasında tarih, kart programı, katılım şartı ve dört ödül kademesi doğrulandı.", fingerprint: verification.fingerprint! } });
    await tx.campaignHistory.create({ data: { campaignId: campaign.id, action: "VERIFIED", changedBy: "bootstrap:live-official-source", snapshot: { sourceUrl, fetchedAt: fetchedAt.toISOString(), validFrom: verification.validFrom, validUntil: verification.validUntil, rewardTiers: orderedTiers } } });
  });

  console.log(JSON.stringify({ imported: true, source: sourceUrl, fetchedAt: verification.fetchedAt, validUntil: verification.validUntil, tiers: orderedTiers.length }));
  await prisma.$disconnect();
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
