import { describe, expect, it } from "vitest";
import { calculateDecision } from "@/lib/puan-ai/decision-engine";
import { calculateCampaignBenefit, evaluateCampaigns } from "@/lib/puan-ai/rule-engine";
import { campaignLifecycle, dataFreshness, detectConflicts } from "@/lib/puan-ai/verification-engine";
import { extractSourceEvidence, verifyCampaignUrl } from "@/lib/puan-ai/source-verifier";
import { campaignFixture } from "@/tests/support/puan-ai-fixture";

const NOW = new Date("2026-09-06T09:00:00.000Z");
const publicResolver = (async () => [{ address: "93.184.216.34", family: 4 }]) as never;

describe("PuanAI 2.0 zorunlu karar senaryoları", () => {
  it("Test 1 — doğrulanmış tarih aralığını ACTIVE yapar", () => {
    expect(campaignLifecycle({ validFrom: new Date("2026-09-01"), validUntil: new Date("2026-09-30"), verified: true, sourceAvailable: true }, NOW)).toBe("ACTIVE");
  });

  it("Test 2 — süresi geçmiş kampanyayı EXPIRED yapar", () => {
    expect(campaignLifecycle({ validFrom: new Date("2026-08-01"), validUntil: new Date("2026-08-31"), verified: true, sourceAvailable: true }, NOW)).toBe("EXPIRED");
  });

  it("Test 3 — erişilemeyen URL'yi SOURCE_UNAVAILABLE yapar", async () => {
    const result = await verifyCampaignUrl("https://bank.example/kampanya", NOW, (async () => { throw new Error("offline"); }) as typeof fetch, publicResolver);
    expect(result.status).toBe("SOURCE_UNAVAILABLE");
    expect(result.reason).toContain("erişilemedi");
  });

  it("Test 4 — iki farklı kaynak değerini CONFLICT olarak yakalar ve resmî kaynağı tercih eder", () => {
    const conflicts = detectConflicts([
      { sourceId: "official", trustScore: 100, fetchedAt: NOW, data: { reward: 1000 } },
      { sourceId: "third-party", trustScore: 75, fetchedAt: new Date("2026-09-06T10:00:00Z"), data: { reward: 750 } },
    ], ["reward"]);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].preferredSourceId).toBe("official");
  });

  it("Test 5 — kullanıcının kartı kampanyaya uygun değilse eşleşme üretmez", () => {
    const campaign = campaignFixture({ startDate: "2026-09-01T00:00:00Z", endDate: "2026-09-30T20:59:59Z", verification: { ...campaignFixture().verification!, checkedAt: "2026-09-06T08:00:00Z", nextCheckAt: "2026-09-07T08:00:00Z" }, sources: campaignFixture().sources.map((source) => ({ ...source, fetchedAt: "2026-09-06T08:00:00Z" })) });
    expect(evaluateCampaigns([campaign], "1.000 TL harcayacağım, Bonus kartım var", NOW)).toHaveLength(0);
  });

  it("Test 6 — minimum harcama sağlanmıyorsa fayda sıfırdır", () => {
    expect(calculateCampaignBenefit(campaignFixture(), 999)).toEqual({ eligible: false, amount: 0 });
  });

  it("Test 7 — minimum harcama sağlanıyorsa doğrulanmış faydayı hesaplar", () => {
    expect(calculateCampaignBenefit(campaignFixture(), 1000)).toEqual({ eligible: true, amount: 150 });
  });

  it("kademeli ödülü tutar aralığına göre deterministik hesaplar", () => {
    const tiered = campaignFixture({
      tiers: [
        { id: "t1", minimumSpend: 25_000, maximumSpend: 49_999, rewardAmount: 1_500, description: "25.000-49.999 TL", priority: 0 },
        { id: "t2", minimumSpend: 50_000, maximumSpend: 99_999, rewardAmount: 3_000, description: "50.000-99.999 TL", priority: 1 },
        { id: "t3", minimumSpend: 100_000, maximumSpend: 174_999, rewardAmount: 5_000, description: "100.000-174.999 TL", priority: 2 },
        { id: "t4", minimumSpend: 175_000, maximumSpend: null, rewardAmount: 7_500, description: "175.000 TL ve üzeri", priority: 3 },
      ],
    });
    expect(calculateCampaignBenefit(tiered, 24_999)).toEqual({ eligible: false, amount: 0 });
    expect(calculateCampaignBenefit(tiered, 25_000).amount).toBe(1_500);
    expect(calculateCampaignBenefit(tiered, 50_000).amount).toBe(3_000);
    expect(calculateCampaignBenefit(tiered, 175_000).amount).toBe(7_500);
  });

  it("kart programını daha uzun kart adının içinde güvenle eşleştirir", () => {
    const base = campaignFixture();
    const bankkart = campaignFixture({
      ...base,
      startDate: "2026-09-01T00:00:00Z",
      endDate: "2026-09-30T20:59:59Z",
      cards: [{ ...base.cards[0], name: "Bireysel Bankkart", rewardProgram: "Jest Lira" }],
      verification: { ...base.verification!, checkedAt: "2026-09-06T08:00:00Z", nextCheckAt: "2026-09-07T08:00:00Z" },
      sources: base.sources.map((source) => ({ ...source, fetchedAt: "2026-09-06T08:00:00Z" })),
    });
    expect(evaluateCampaigns([bankkart], "1.000 TL Bankkart ile harcayacağım", NOW)).toHaveLength(1);
  });

  it("Test 8 — taksit tercihini yalnız mevcut taksit sayısıyla skorlar", () => {
    const withInstallment = calculateDecision({ price: 10_000, benefits: [], installmentCount: 6, campaignMatch: 1, preferenceMatch: 1, merchantReliability: 1, dataConfidence: 1 });
    const cash = calculateDecision({ price: 10_000, benefits: [], installmentCount: 0, campaignMatch: 1, preferenceMatch: 1, merchantReliability: 1, dataConfidence: 1 });
    expect(withInstallment.components.installment).toBeGreaterThan(cash.components.installment);
  });

  it("Test 9 — ödül puanını doğrudan indirimden ayrı gösterir", () => {
    const result = calculateDecision({ price: 70_000, benefits: [
      { kind: "DIRECT_DISCOUNT", amount: 3000, label: "İndirim", verified: true },
      { kind: "REWARD_POINTS", amount: 1000, label: "Puan", verified: true },
    ] });
    expect(result.effectiveCashCost).toBe(67_000);
    expect(result.effectiveValueCost).toBe(66_000);
    expect(result.rewardValue).toBe(1000);
  });

  it("Test 10 — içerikte tarihler yoksa doğrulanmış kampanya üretmez", async () => {
    const html = `<html><head><title>Kampanya</title></head><body>${"Kampanya koşulları ".repeat(20)}</body></html>`;
    const result = await verifyCampaignUrl("https://bank.example/kampanya", NOW, (async () => new Response(html, { status: 200 })) as typeof fetch, publicResolver);
    expect(result.status).toBe("UNVERIFIED");
    expect(result.validUntil).toBeNull();
  });

  it("Türkçe ay adlarıyla verilen kampanya tarihlerini doğrular", async () => {
    const html = `<html><head><title>Resmî Kampanya</title></head><body>Kampanya Dönemi 1-30 Eylül 2026 ${"Kampanya koşulları ".repeat(20)}</body></html>`;
    const result = await verifyCampaignUrl("https://bank.example/kampanya", NOW, (async () => new Response(html, { status: 200 })) as typeof fetch, publicResolver);
    expect(result.status).toBe("VERIFIED");
    expect(result.validUntil).toContain("2026-09-30");
  });

  it("resmî metindeki harcama-ödül kademelerini yapılandırılmış veriye dönüştürür", () => {
    const evidence = extractSourceEvidence("25.000 TL - 49.999 TL arasındaki alışverişiniz ile 1.500 TL Jest Lira, 50.000 TL - 99.999 TL arasındaki alışverişiniz ile 3.000 TL Jest Lira, 175.000 ve üzeri alışverişiniz ile 7.500 TL Jest Lira", "bankkart.com.tr");
    expect(evidence.rewardTiers).toEqual([
      { minimumSpend: 25_000, maximumSpend: 49_999, rewardAmount: 1_500 },
      { minimumSpend: 50_000, maximumSpend: 99_999, rewardAmount: 3_000 },
      { minimumSpend: 175_000, maximumSpend: null, rewardAmount: 7_500 },
    ]);
    expect(evidence.trustScore).toBe(100);
  });

  it("veri tazeliğini sınır değerlerde sınıflandırır", () => {
    expect(dataFreshness(new Date(NOW.getTime() - 24 * 3_600_000), NOW)).toBe("FRESH");
    expect(dataFreshness(new Date(NOW.getTime() - 31 * 24 * 3_600_000), NOW)).toBe("VERY_STALE");
  });
});
