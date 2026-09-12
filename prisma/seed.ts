import "dotenv/config";
import { createHash } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  CampaignStatus,
  CardNetwork,
  HistoryAction,
  PrismaClient,
  RecordStatus,
  RewardKind,
  RuleKind,
  RuleOperator,
  VerificationStatus,
} from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to seed PuanAI.");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString, connectionTimeoutMillis: 5_000 }),
});

const verifiedAt = new Date("2026-07-25T06:00:00.000Z");
const nextCheckAt = new Date("2026-07-27T06:00:00.000Z");

function fingerprint(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function main() {
  const [yapiKredi, garanti, isBankasi] = await Promise.all([
    prisma.bank.upsert({
      where: { slug: "yapi-kredi" },
      update: {
        name: "Yapı Kredi",
        officialName: "Yapı ve Kredi Bankası A.Ş.",
        shortName: "YK",
        websiteUrl: "https://www.yapikredi.com.tr",
        color: "#6b2f91",
        status: RecordStatus.ACTIVE,
      },
      create: {
        slug: "yapi-kredi",
        name: "Yapı Kredi",
        officialName: "Yapı ve Kredi Bankası A.Ş.",
        shortName: "YK",
        websiteUrl: "https://www.yapikredi.com.tr",
        color: "#6b2f91",
      },
    }),
    prisma.bank.upsert({
      where: { slug: "garanti-bbva" },
      update: {
        name: "Garanti BBVA",
        officialName: "Türkiye Garanti Bankası A.Ş.",
        shortName: "GB",
        websiteUrl: "https://www.garantibbva.com.tr",
        color: "#2d8b57",
        status: RecordStatus.ACTIVE,
      },
      create: {
        slug: "garanti-bbva",
        name: "Garanti BBVA",
        officialName: "Türkiye Garanti Bankası A.Ş.",
        shortName: "GB",
        websiteUrl: "https://www.garantibbva.com.tr",
        color: "#2d8b57",
      },
    }),
    prisma.bank.upsert({
      where: { slug: "is-bankasi" },
      update: {
        name: "İş Bankası",
        officialName: "Türkiye İş Bankası A.Ş.",
        shortName: "İB",
        websiteUrl: "https://www.isbank.com.tr",
        color: "#2674b9",
        status: RecordStatus.ACTIVE,
      },
      create: {
        slug: "is-bankasi",
        name: "İş Bankası",
        officialName: "Türkiye İş Bankası A.Ş.",
        shortName: "İB",
        websiteUrl: "https://www.isbank.com.tr",
        color: "#2674b9",
      },
    }),
  ]);

  const [market, electronics, ecommerce] = await Promise.all([
    prisma.merchantCategory.upsert({
      where: { slug: "market" },
      update: { name: "Market", aliases: ["market", "süpermarket", "gıda"], status: RecordStatus.ACTIVE },
      create: { slug: "market", name: "Market", aliases: ["market", "süpermarket", "gıda"] },
    }),
    prisma.merchantCategory.upsert({
      where: { slug: "elektronik" },
      update: { name: "Elektronik", aliases: ["teknoloji", "elektronik", "telefon", "iPhone", "bilgisayar"], status: RecordStatus.ACTIVE },
      create: { slug: "elektronik", name: "Elektronik", aliases: ["teknoloji", "elektronik", "telefon", "iPhone", "bilgisayar"] },
    }),
    prisma.merchantCategory.upsert({
      where: { slug: "e-ticaret" },
      update: { name: "E-ticaret", aliases: ["online alışveriş", "internet alışverişi", "pazaryeri"], status: RecordStatus.ACTIVE },
      create: { slug: "e-ticaret", name: "E-ticaret", aliases: ["online alışveriş", "internet alışverişi", "pazaryeri"] },
    }),
  ]);

  const [migros, ecommerceSites] = await Promise.all([
    prisma.merchant.upsert({
      where: { slug: "migros" },
      update: {
        name: "Migros",
        aliases: ["5M Migros", "Migros Jet", "Macrocenter", "Migros Ekstra"],
        categoryId: market.id,
        websiteUrl: "https://www.migros.com.tr",
        status: RecordStatus.ACTIVE,
      },
      create: {
        slug: "migros",
        name: "Migros",
        aliases: ["5M Migros", "Migros Jet", "Macrocenter", "Migros Ekstra"],
        categoryId: market.id,
        websiteUrl: "https://www.migros.com.tr",
      },
    }),
    prisma.merchant.upsert({
      where: { slug: "katilimci-e-ticaret-siteleri" },
      update: {
        name: "Katılımcı e-ticaret siteleri",
        aliases: ["Amazon", "Hepsiburada", "İncehesap", "n11", "Pazarama", "Trendyol"],
        categoryId: ecommerce.id,
        status: RecordStatus.ACTIVE,
      },
      create: {
        slug: "katilimci-e-ticaret-siteleri",
        name: "Katılımcı e-ticaret siteleri",
        aliases: ["Amazon", "Hepsiburada", "İncehesap", "n11", "Pazarama", "Trendyol"],
        categoryId: ecommerce.id,
      },
    }),
  ]);

  const [worldpuan, maxipuan] = await Promise.all([
    prisma.rewardType.upsert({
      where: { slug: "worldpuan" },
      update: { name: "Worldpuan", kind: RewardKind.POINTS, unit: "TL değerinde puan", status: RecordStatus.ACTIVE },
      create: { slug: "worldpuan", name: "Worldpuan", kind: RewardKind.POINTS, unit: "TL değerinde puan" },
    }),
    prisma.rewardType.upsert({
      where: { slug: "maxipuan" },
      update: { name: "MaxiPuan", kind: RewardKind.POINTS, unit: "TL değerinde puan", status: RecordStatus.ACTIVE },
      create: { slug: "maxipuan", name: "MaxiPuan", kind: RewardKind.POINTS, unit: "TL değerinde puan" },
    }),
  ]);

  const [worldcard, bonus, maximum, maximiles] = await Promise.all([
    prisma.card.upsert({
      where: { slug: "worldcard" },
      update: { bankId: yapiKredi.id, name: "Worldcard", network: CardNetwork.VISA, rewardProgram: "Worldpuan", active: true },
      create: { bankId: yapiKredi.id, slug: "worldcard", name: "Worldcard", network: CardNetwork.VISA, rewardProgram: "Worldpuan" },
    }),
    prisma.card.upsert({
      where: { slug: "bonus-card" },
      update: { bankId: garanti.id, name: "Bonus Card", network: CardNetwork.VISA, rewardProgram: "Bonus", active: true },
      create: { bankId: garanti.id, slug: "bonus-card", name: "Bonus Card", network: CardNetwork.VISA, rewardProgram: "Bonus" },
    }),
    prisma.card.upsert({
      where: { slug: "maximum-kart" },
      update: { bankId: isBankasi.id, name: "Maximum Kart", network: CardNetwork.VISA, rewardProgram: "MaxiPuan", active: true },
      create: { bankId: isBankasi.id, slug: "maximum-kart", name: "Maximum Kart", network: CardNetwork.VISA, rewardProgram: "MaxiPuan" },
    }),
    prisma.card.upsert({
      where: { slug: "maximiles" },
      update: { bankId: isBankasi.id, name: "Maximiles", network: CardNetwork.MASTERCARD, rewardProgram: "MaxiMil / MaxiPuan", active: true },
      create: { bankId: isBankasi.id, slug: "maximiles", name: "Maximiles", network: CardNetwork.MASTERCARD, rewardProgram: "MaxiMil / MaxiPuan" },
    }),
  ]);

  await seedVerifiedCampaign({
    slug: "migros-chippin-150-worldpuan-temmuz-2026",
    title: "Migros Chippin alışverişlerine 150 TL Worldpuan",
    description: "Migros ve Macro mağazalarında Chippin üzerinden üç farklı günde yapılan uygun alışverişler için geçerli Worldpuan kampanyası.",
    benefitSummary: "3 farklı günde 1.000 TL ve üzeri alışverişe 150 TL Worldpuan",
    bankId: yapiKredi.id,
    merchantId: migros.id,
    categoryId: market.id,
    rewardTypeId: worldpuan.id,
    cardIds: [worldcard.id],
    startDate: new Date("2026-06-30T21:00:00.000Z"),
    endDate: new Date("2026-07-31T20:59:59.000Z"),
    rules: [
      [RuleKind.MIN_SPEND, RuleOperator.GTE, 1000, null, "TRY", "Her uygun işlem tek seferde en az 1.000 TL olmalıdır."],
      [RuleKind.REWARD_AMOUNT, RuleOperator.EQ, 150, null, "TRY", "Kazanılabilecek ödül 150 TL Worldpuan'dır."],
      [RuleKind.MAX_REWARD, RuleOperator.LTE, 150, null, "TRY", "Bir müşteri en fazla 150 TL Worldpuan kazanabilir."],
      [RuleKind.REQUIRED_PURCHASE_COUNT, RuleOperator.GTE, 3, null, "işlem", "1.000 TL ve üzeri alışveriş üç farklı günde yapılmalıdır."],
      [RuleKind.REQUIRED_ENROLLMENT, RuleOperator.INFO, null, "World Mobil", null, "Alışverişten önce World Mobil üzerinden kampanyaya katılım gerekir."],
      [RuleKind.REQUIRED_PAYMENT_METHOD, RuleOperator.INFO, null, "Chippin", null, "Ödeme Chippin'e ekli uygun World kartı ve Yapı Kredi World POS üzerinden yapılmalıdır."],
      [RuleKind.EXCLUSION, RuleOperator.EXCLUDES, null, "taksitli işlemler", null, "Yalnızca peşin işlemler dahildir; taksitli işlemler dahil değildir."],
      [RuleKind.EXCLUSION, RuleOperator.EXCLUDES, null, "alkollü içecekler", null, "Alkollü içecekler, tütün, TL yükleme, piyango, E-PIN ve kuyum harcamaları dahil değildir."],
    ],
    installments: [],
    source: {
      url: "https://www.worldcard.com.tr/kampanyalar/migrosta-chippin-uygulamasi-uzerinden-3-farkli-gunde-yapacaginiz-1000-tl-ve-uzeri-alisverisinize-tem",
      title: "Migros'ta Chippin üzerinden 150 TL Worldpuan",
      publisher: "Yapı Kredi Worldcard",
      evidence: "01.07.2026-31.07.2026|3 farklı gün|1000 TL|150 TL Worldpuan|Chippin|peşin",
    },
  });

  await seedVerifiedCampaign({
    slug: "migros-elektronikte-9-aya-varan-taksit-2026",
    title: "Migros elektronik alışverişlerinde 9 aya varan taksit",
    description: "Migros mağazaları ve Migros Ekstra'daki uygun elektronik ürünlerde Garanti BBVA POS üzerinden sunulan vade farksız taksit seçenekleri.",
    benefitSummary: "Uygun elektronik ürünlerde 2, 3, 4 veya 6; klimalarda 9 aya varan taksit",
    bankId: garanti.id,
    merchantId: migros.id,
    categoryId: electronics.id,
    rewardTypeId: null,
    cardIds: [bonus.id],
    startDate: new Date("2026-01-31T21:00:00.000Z"),
    endDate: new Date("2026-07-31T20:59:59.000Z"),
    rules: [
      [RuleKind.MIN_SPEND, RuleOperator.GTE, 20, null, "TRY", "Uygun elektronik alışverişi en az 20 TL olmalıdır."],
      [RuleKind.REQUIRED_PAYMENT_METHOD, RuleOperator.INFO, null, "Garanti BBVA POS", null, "İşlemin Garanti BBVA POS üzerinden geçmesi gerekir."],
      [RuleKind.EXCLUSION, RuleOperator.EXCLUDES, null, "cep telefonu", null, "Yasal taksit kısıtı bulunan cep telefonu ve hizmetler kapsam dışıdır."],
      [RuleKind.EXCLUSION, RuleOperator.EXCLUDES, null, "GarantiPay", null, "GarantiPay ve MoneyPay ile yapılan işlemler dahil değildir."],
      [RuleKind.ELIGIBILITY, RuleOperator.INFO, null, "uygun kartlar", null, "Kart kapsamı ve istisnalar resmi kampanya sayfasındaki güncel listeye göre değerlendirilmelidir."],
    ],
    installments: [
      [2, true, "Elektronik ürünler", "Ürün ve yasal sınırlara göre değişebilir."],
      [3, true, "Elektronik ürünler", "Ürün ve yasal sınırlara göre değişebilir."],
      [4, true, "Elektronik ürünler", "Ürün ve yasal sınırlara göre değişebilir."],
      [6, true, "Uygun elektronik ve ev aletleri", "En yüksek elektronik taksit sınırı 6'dır."],
      [9, true, "Klima", "Yalnızca uygun klima ürünleri için."],
    ],
    source: {
      url: "https://www.bonus.com.tr/kampanyalar/migros-elektronik-taksit-kampanyalari",
      title: "Migros’ta peşin fiyatına 9 aya varan taksit",
      publisher: "Garanti Bonus",
      evidence: "01.02.2026-31.07.2026|20 TL|2-3-4-6 taksit|klima 9|telefon hariç|Garanti BBVA POS",
    },
  });

  await seedVerifiedCampaign({
    slug: "e-ticarette-1000-tl-maxipuan-temmuz-2026",
    title: "E-ticaret alışverişlerine 1.000 TL'ye varan MaxiPuan",
    description: "Katılımcı e-ticaret sitelerinde farklı günlerde yapılan uygun alışverişler için İş Bankası bireysel kredi kartlarına MaxiPuan kampanyası.",
    benefitSummary: "İkinci ve sonraki 3.000 TL alışverişlere 250 TL, toplam 1.000 TL MaxiPuan",
    bankId: isBankasi.id,
    merchantId: ecommerceSites.id,
    categoryId: ecommerce.id,
    rewardTypeId: maxipuan.id,
    cardIds: [maximum.id, maximiles.id],
    startDate: new Date("2026-06-30T21:00:00.000Z"),
    endDate: new Date("2026-07-31T20:59:59.000Z"),
    rules: [
      [RuleKind.MIN_SPEND, RuleOperator.GTE, 3000, null, "TRY", "Her uygun alışveriş tek seferde en az 3.000 TL olmalıdır."],
      [RuleKind.REWARD_AMOUNT, RuleOperator.EQ, 250, null, "TRY", "İkinci ve sonraki her uygun alışveriş 250 TL MaxiPuan kazandırır."],
      [RuleKind.MAX_REWARD, RuleOperator.LTE, 1000, null, "TRY", "Bir müşteri kampanyadan en fazla 1.000 TL MaxiPuan kazanabilir."],
      [RuleKind.REQUIRED_PURCHASE_COUNT, RuleOperator.GTE, 2, null, "işlem", "Ödül ikinci ve sonraki uygun alışverişlerden başlar; işlemler farklı günlerde olmalıdır."],
      [RuleKind.REQUIRED_ENROLLMENT, RuleOperator.INFO, null, "Maximum Mobil veya İşCep", null, "Kampanyaya Maximum Mobil ya da İşCep üzerinden katılım gerekir."],
      [RuleKind.EXCLUSION, RuleOperator.EXCLUDES, null, "market", null, "Market, yatırım amaçlı altın-gümüş, kontör, hat ve seyahat işlemleri dahil değildir."],
      [RuleKind.EXCLUSION, RuleOperator.EXCLUDES, null, "dijital cüzdan", null, "Dijital cüzdan yüklemeleri ve cüzdan üzerinden yapılan işlemler dahil değildir."],
    ],
    installments: [],
    source: {
      url: "https://www.maximum.com.tr/kampanyalar/e-ticaret-alisverislerinizde-maxipuan-kampanyasi",
      title: "E-Ticaret Alışverişlerinizde MaxiPuan Fırsatı",
      publisher: "Maximum",
      evidence: "01.07.2026-31.07.2026|3000 TL|ikinci ve sonraki|250 TL|max 1000 TL|katılım",
    },
  });

  await seedVerifiedCampaign({
    slug: "market-alisverislerinde-1250-maxipuan-temmuz-2026",
    title: "Market alışverişlerine 1.250 TL'ye varan MaxiPuan",
    description: "Maximum anlaşmalı marketlerde farklı günlerde yapılan uygun peşin alışverişler için MaxiPuan kampanyası.",
    benefitSummary: "İlk alışverişten sonra her 2.000 TL'lik uygun işleme 125 TL, toplam 1.250 TL MaxiPuan",
    bankId: isBankasi.id,
    merchantId: null,
    categoryId: market.id,
    rewardTypeId: maxipuan.id,
    cardIds: [maximum.id, maximiles.id],
    startDate: new Date("2026-06-30T21:00:00.000Z"),
    endDate: new Date("2026-07-31T20:59:59.000Z"),
    rules: [
      [RuleKind.MIN_SPEND, RuleOperator.GTE, 2000, null, "TRY", "Her uygun peşin market alışverişi en az 2.000 TL olmalıdır."],
      [RuleKind.REWARD_AMOUNT, RuleOperator.EQ, 125, null, "TRY", "İlk işlemden sonraki her uygun farklı gün alışverişi 125 TL MaxiPuan kazandırır."],
      [RuleKind.MAX_REWARD, RuleOperator.LTE, 1250, null, "TRY", "Bir müşteri en fazla 1.250 TL MaxiPuan kazanabilir."],
      [RuleKind.REQUIRED_PURCHASE_COUNT, RuleOperator.GTE, 2, null, "işlem", "Ödül ilk uygun alışverişten sonraki farklı gün işlemlerinde başlar."],
      [RuleKind.REQUIRED_ENROLLMENT, RuleOperator.INFO, null, "Maximum Mobil veya İşCep", null, "Asıl kart sahibinin kampanyaya uygulama üzerinden katılması gerekir."],
      [RuleKind.EXCLUSION, RuleOperator.EXCLUDES, null, "elektronik", null, "Elektronik ve beyaz eşya ürünleri kampanya kapsamında değildir."],
    ],
    installments: [],
    source: {
      url: "https://www.maximum.com.tr/kampanyalar/maximum-kartinizla-market-alisverislerinize-maxipuan-hediye",
      title: "Maximum Kart’ınızla Market Alışverişlerinize MaxiPuan Hediye",
      publisher: "Maximum",
      evidence: "01.07.2026-31.07.2026|2000 TL|125 TL|max 1250 TL|peşin|farklı gün|katılım",
    },
  });

  const draft = await prisma.campaign.upsert({
    where: { slug: "admin-dogrulama-akisi-ornegi" },
    update: {
      bankId: garanti.id,
      merchantCategoryId: electronics.id,
      merchantId: null,
      rewardTypeId: null,
      title: "Yeni kampanya doğrulama taslağı",
      description: "Admin panelindeki kaynak, kural ve doğrulama akışını test etmek için yayımlanmayan taslak.",
      benefitSummary: "Doğrulama tamamlanmadan kullanıcıya gösterilmez.",
      startDate: new Date("2026-07-01T00:00:00.000Z"),
      endDate: new Date("2026-08-31T20:59:59.000Z"),
      status: CampaignStatus.DRAFT,
      published: false,
    },
    create: {
      slug: "admin-dogrulama-akisi-ornegi",
      bankId: garanti.id,
      merchantCategoryId: electronics.id,
      title: "Yeni kampanya doğrulama taslağı",
      description: "Admin panelindeki kaynak, kural ve doğrulama akışını test etmek için yayımlanmayan taslak.",
      benefitSummary: "Doğrulama tamamlanmadan kullanıcıya gösterilmez.",
      startDate: new Date("2026-07-01T00:00:00.000Z"),
      endDate: new Date("2026-08-31T20:59:59.000Z"),
    },
  });
  await prisma.campaignHistory.deleteMany({ where: { campaignId: draft.id, changedBy: "seed:puanai-v1" } });
  await prisma.campaignHistory.create({
    data: {
      campaignId: draft.id,
      action: HistoryAction.CREATED,
      snapshot: { status: "DRAFT", published: false },
      changedBy: "seed:puanai-v1",
    },
  });
}

type RuleSeed = [
  RuleKind,
  RuleOperator,
  number | null,
  string | null,
  string | null,
  string,
];

type CampaignSeed = {
  slug: string;
  title: string;
  description: string;
  benefitSummary: string;
  bankId: string;
  merchantId: string | null;
  categoryId: string;
  rewardTypeId: string | null;
  cardIds: string[];
  startDate: Date;
  endDate: Date;
  rules: RuleSeed[];
  installments: Array<[number, boolean, string | null, string | null]>;
  source: {
    url: string;
    title: string;
    publisher: string;
    evidence: string;
  };
};

async function seedVerifiedCampaign(seed: CampaignSeed) {
  const sourceFingerprint = fingerprint(seed.source.evidence);
  await prisma.$transaction(async (tx) => {
    const campaign = await tx.campaign.upsert({
      where: { slug: seed.slug },
      update: {
        title: seed.title,
        description: seed.description,
        benefitSummary: seed.benefitSummary,
        bankId: seed.bankId,
        merchantId: seed.merchantId,
        merchantCategoryId: seed.categoryId,
        rewardTypeId: seed.rewardTypeId,
        startDate: seed.startDate,
        endDate: seed.endDate,
        status: CampaignStatus.VERIFIED,
        published: true,
      },
      create: {
        slug: seed.slug,
        title: seed.title,
        description: seed.description,
        benefitSummary: seed.benefitSummary,
        bankId: seed.bankId,
        merchantId: seed.merchantId,
        merchantCategoryId: seed.categoryId,
        rewardTypeId: seed.rewardTypeId,
        startDate: seed.startDate,
        endDate: seed.endDate,
        status: CampaignStatus.VERIFIED,
        published: true,
      },
    });

    await tx.campaignCard.deleteMany({ where: { campaignId: campaign.id } });
    await tx.campaignCard.createMany({
      data: seed.cardIds.map((cardId) => ({ campaignId: campaign.id, cardId })),
    });

    await tx.campaignRule.deleteMany({ where: { campaignId: campaign.id } });
    await tx.campaignRule.createMany({
      data: seed.rules.map(([kind, operator, numericValue, textValue, unit, description], priority) => ({
        campaignId: campaign.id,
        kind,
        operator,
        numericValue,
        textValue,
        unit,
        description,
        priority,
      })),
    });

    await tx.installment.deleteMany({ where: { campaignId: campaign.id } });
    if (seed.installments.length > 0) {
      await tx.installment.createMany({
        data: seed.installments.map(([count, feeFree, productScope, notes]) => ({
          campaignId: campaign.id,
          count,
          feeFree,
          productScope,
          notes,
        })),
      });
    }

    const source = await tx.officialSource.upsert({
      where: { campaignId_url: { campaignId: campaign.id, url: seed.source.url } },
      update: {
        bankId: seed.bankId,
        title: seed.source.title,
        publisher: seed.source.publisher,
        fetchedAt: verifiedAt,
        fingerprint: sourceFingerprint,
        active: true,
      },
      create: {
        campaignId: campaign.id,
        bankId: seed.bankId,
        url: seed.source.url,
        title: seed.source.title,
        publisher: seed.source.publisher,
        fetchedAt: verifiedAt,
        fingerprint: sourceFingerprint,
      },
    });

    await tx.verificationLog.deleteMany({ where: { campaignId: campaign.id, checker: "seed:official-source-review" } });
    await tx.verificationLog.create({
      data: {
        campaignId: campaign.id,
        officialSourceId: source.id,
        status: VerificationStatus.VERIFIED,
        checkedAt: verifiedAt,
        nextCheckAt,
        checker: "seed:official-source-review",
        summary: "Kampanya tarihleri, kart/ödeme kapsamı, tutar, ödül veya taksit ve temel istisnalar resmi kaynaktan kontrol edildi.",
        fingerprint: sourceFingerprint,
      },
    });

    await tx.campaignHistory.deleteMany({ where: { campaignId: campaign.id, changedBy: "seed:puanai-v1" } });
    await tx.campaignHistory.create({
      data: {
        campaignId: campaign.id,
        action: HistoryAction.VERIFIED,
        snapshot: {
          title: seed.title,
          status: CampaignStatus.VERIFIED,
          published: true,
          sourceUrl: seed.source.url,
          fingerprint: sourceFingerprint,
        },
        changedBy: "seed:puanai-v1",
      },
    });
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });

