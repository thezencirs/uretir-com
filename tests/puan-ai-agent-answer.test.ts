import { afterEach, describe, expect, it, vi } from "vitest";
import { streamGroundedExplanation } from "@/lib/puan-ai/ai-service";
import { evaluateCampaigns } from "@/lib/puan-ai/rule-engine";
import { campaignFixture } from "@/tests/support/puan-ai-fixture";

afterEach(() => vi.unstubAllEnvs());

async function answerFor(query: string, enrollment: boolean) {
  vi.stubEnv("OPENAI_API_KEY", "");
  const base = campaignFixture();
  const campaign = enrollment
    ? { ...base, rules: [...base.rules, { id: "enroll", kind: "REQUIRED_ENROLLMENT" as const, operator: "INFO" as const, numericValue: null, textValue: null, unit: null, description: "Kampanyaya katılım gerekir", priority: 1 }] }
    : base;
  const matches = evaluateCampaigns([campaign], query, new Date("2026-07-25T09:00:00.000Z"));
  let answer = "";
  for await (const delta of streamGroundedExplanation(query, matches)) answer += delta;
  return answer;
}

describe("PuanAI agent answer", () => {
  it("tells the user to join the campaign at their bank when enrollment is required", async () => {
    const answer = await answerFor("Migros'ta 1.000 TL harcayacağım, Worldcard kullanıyorum", true);
    expect(answer).toContain("kampanyaya katılmayı unutma");
  });

  it("still reminds the user to check participation when enrollment is not recorded", async () => {
    const answer = await answerFor("Migros'ta 1.000 TL harcayacağım, Worldcard kullanıyorum", false);
    expect(answer).toContain("katılım");
    expect(answer).toContain("puanı kazanmak için");
  });
});
