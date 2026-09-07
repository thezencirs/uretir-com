import type { CampaignRuleView, CampaignView } from "@/lib/puan-ai/types";

function rule(overrides: Partial<CampaignRuleView> & Pick<CampaignRuleView, "kind" | "description">): CampaignRuleView {
  return {
    id: crypto.randomUUID(),
    operator: "INFO",
    numericValue: null,
    textValue: null,
    unit: null,
    priority: 0,
    ...overrides,
  };
}

export function campaignFixture(overrides: Partial<CampaignView> = {}): CampaignView {
  const fingerprint = "a".repeat(64);
  const officialSourceId = crypto.randomUUID();
  return {
    id: crypto.randomUUID(),
    slug: "migros-worldpuan",
    title: "Migros alışverişine Worldpuan",
    description: "Üç farklı günde uygun market alışverişi.",
    benefitSummary: "150 TL Worldpuan",
    startDate: "2026-07-01T00:00:00.000Z",
    endDate: "2026-07-31T20:59:59.000Z",
    status: "VERIFIED",
    published: true,
    updatedAt: "2026-07-25T06:00:00.000Z",
    bank: {
      id: crypto.randomUUID(),
      slug: "yapi-kredi",
      name: "Yapı Kredi",
      officialName: "Yapı ve Kredi Bankası A.Ş.",
      shortName: "YK",
      websiteUrl: "https://www.yapikredi.com.tr",
      color: "#663399",
      status: "ACTIVE",
    },
    merchant: { id: crypto.randomUUID(), slug: "migros", name: "Migros", aliases: ["Macrocenter"], status: "ACTIVE" },
    category: { id: crypto.randomUUID(), slug: "market", name: "Market", aliases: ["gıda"], status: "ACTIVE" },
    rewardType: { id: crypto.randomUUID(), slug: "worldpuan", name: "Worldpuan", kind: "POINTS", unit: "TL değerinde puan", status: "ACTIVE" },
    cards: [{ id: crypto.randomUUID(), slug: "worldcard", name: "Worldcard", network: "VISA", rewardProgram: "Worldpuan", active: true }],
    rules: [
      rule({ kind: "MIN_SPEND", operator: "GTE", numericValue: 1000, unit: "TRY", description: "En az 1.000 TL." }),
      rule({ kind: "MAX_REWARD", operator: "LTE", numericValue: 150, unit: "TRY", description: "En fazla 150 TL Worldpuan." }),
    ],
    installments: [],
    sources: [{ id: officialSourceId, url: "https://www.worldcard.com.tr/kampanya", title: "Resmî kampanya", publisher: "Worldcard", fetchedAt: "2026-07-25T06:00:00.000Z", fingerprint }],
    verification: { officialSourceId, status: "VERIFIED", checkedAt: "2026-07-25T06:00:00.000Z", nextCheckAt: "2026-07-27T06:00:00.000Z", checker: "test", summary: "Kontrol edildi.", fingerprint },
    ...overrides,
  };
}
