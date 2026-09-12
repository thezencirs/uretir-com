import { describe, expect, it } from "vitest";
import { detectIntent, evaluateCampaigns, isVerifiedAndCurrent } from "@/lib/puan-ai/rule-engine";
import type { CampaignRuleView, CampaignView } from "@/lib/puan-ai/types";

const NOW = new Date("2026-07-25T09:00:00.000Z");

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

function campaign(overrides: Partial<CampaignView> = {}): CampaignView {
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

describe("PuanAI intent detection", () => {
  it("extracts amount, installment and a Turkish date", () => {
    const intent = detectIntent("Migros'ta 2.500 TL için 3 taksit 26.07.2026", NOW);
    expect(intent.amount).toBe(2500);
    expect(intent.installmentCount).toBe(3);
    expect(intent.date.toISOString()).toContain("2026-07-26");
    expect(intent.dateValid).toBe(true);
  });

  it("rejects an impossible explicit date instead of guessing", () => {
    expect(detectIntent("Migros 32.13.2026", NOW).dateValid).toBe(false);
    expect(evaluateCampaigns([campaign()], "Migros 32.13.2026", NOW)).toHaveLength(0);
  });

  it("expands iPhone into phone terms used by exclusions", () => {
    expect(detectIntent("iPhone alacağım", NOW).expanded).toContain("cep telefonu");
  });
});

describe("PuanAI verification and rule evaluation", () => {
  it("requires a fresh matching source fingerprint", () => {
    const valid = campaign();
    expect(isVerifiedAndCurrent(valid, NOW, NOW)).toBe(true);
    expect(isVerifiedAndCurrent({ ...valid, verification: { ...valid.verification!, fingerprint: "b".repeat(64) } }, NOW, NOW)).toBe(false);
    expect(isVerifiedAndCurrent({ ...valid, verification: { ...valid.verification!, officialSourceId: crypto.randomUUID() } }, NOW, NOW)).toBe(false);
    expect(isVerifiedAndCurrent({ ...valid, verification: { ...valid.verification!, nextCheckAt: "2026-07-24T00:00:00.000Z" } }, NOW, NOW)).toBe(false);
    expect(isVerifiedAndCurrent({ ...valid, bank: { ...valid.bank, status: "INACTIVE" } }, NOW, NOW)).toBe(false);
  });

  it("rejects purchases below the minimum spend", () => {
    expect(evaluateCampaigns([campaign()], "Migros 900 TL", NOW)).toHaveLength(0);
    expect(evaluateCampaigns([campaign()], "Migros 1.000 TL", NOW)).toHaveLength(1);
  });

  it("applies installment and product exclusion rules", () => {
    const installments = campaign({
      slug: "migros-elektronik",
      rewardType: null,
      category: { id: crypto.randomUUID(), slug: "elektronik", name: "Elektronik", aliases: ["teknoloji", "iPhone", "telefon"], status: "ACTIVE" },
      installments: [{ id: crypto.randomUUID(), count: 3, feeFree: true, productScope: "Elektronik", notes: null }],
      rules: [
        rule({ kind: "MIN_SPEND", numericValue: 20, operator: "GTE", description: "En az 20 TL." }),
        rule({ kind: "EXCLUSION", textValue: "cep telefonu", operator: "EXCLUDES", description: "Cep telefonu dahil değildir." }),
      ],
    });
    expect(evaluateCampaigns([installments], "Migros'ta 3 taksit var mı?", NOW)).toHaveLength(1);
    expect(evaluateCampaigns([installments], "iPhone için 3 taksit var mı?", NOW)).toHaveLength(0);
  });

  it("ranks the larger verified reward first", () => {
    const larger = campaign({
      id: crypto.randomUUID(),
      slug: "market-maxipuan",
      bank: { ...campaign().bank, id: crypto.randomUUID(), name: "İş Bankası", officialName: "Türkiye İş Bankası A.Ş.", slug: "is-bankasi", shortName: "İB" },
      rules: [rule({ kind: "MAX_REWARD", numericValue: 1250, operator: "LTE", description: "En fazla 1.250 TL MaxiPuan." })],
    });
    const results = evaluateCampaigns([campaign(), larger], "En yüksek güncel puan hangi kartta?", NOW);
    expect(results[0].slug).toBe("market-maxipuan");
  });
});
