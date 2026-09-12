import { afterEach, describe, expect, it, vi } from "vitest";
import { streamGroundedExplanation } from "@/lib/puan-ai/ai-service";
import { evaluateCampaigns } from "@/lib/puan-ai/rule-engine";
import { campaignFixture } from "@/tests/support/puan-ai-fixture";

const responsesCreate = vi.hoisted(() => vi.fn());

vi.mock("openai", () => ({
  default: class {
    responses = { create: responsesCreate };
  },
}));

afterEach(() => {
  responsesCreate.mockReset();
  vi.unstubAllEnvs();
});

describe("grounded recommendation pipeline", () => {
  it("connects intent, rule evaluation, and the safe explanation fallback", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const matches = evaluateCampaigns(
      [campaignFixture()],
      "Migros'ta 1.000 TL harcayacağım, hangi kart?",
      new Date("2026-07-25T09:00:00.000Z"),
    );
    let answer = "";
    for await (const delta of streamGroundedExplanation("hangi kart?", matches)) answer += delta;
    expect(matches).toHaveLength(1);
    expect(answer).toContain("Yapı Kredi");
    expect(answer).toContain("150 TL Worldpuan");
    expect(answer).toContain("resmî kampanya");
  });

  it("returns the canonical refusal when no verified record survives", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    let answer = "";
    for await (const delta of streamGroundedExplanation("iPhone için taksit?", [])) answer += delta;
    expect(answer).toContain("Güncel kampanya bilgisini doğrulayamadım");
  });

  it("does not guess a best card when decision context is missing", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const matches = evaluateCampaigns(
      [campaignFixture()],
      "Hangi kart en iyi?",
      new Date("2026-07-25T09:00:00.000Z"),
    );
    let answer = "";
    for await (const delta of streamGroundedExplanation("Hangi kart en iyi?", matches)) answer += delta;
    expect(answer).toContain("tek bir kartı");
    expect(answer).toContain("doğrulayamam");
  });

  it("streams a Responses API explanation from only the verified result payload", async () => {
    async function* providerStream() {
      yield { type: "response.output_text.delta", delta: "Doğrulanmış yanıt" };
      yield { type: "response.completed" };
    }
    responsesCreate.mockResolvedValue(providerStream());
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubEnv("OPENAI_MODEL", "gpt-5.6-sol");
    const matches = evaluateCampaigns(
      [campaignFixture()],
      "Migros'ta 1.000 TL harcayacağım",
      new Date("2026-07-25T09:00:00.000Z"),
    );

    let answer = "";
    for await (const delta of streamGroundedExplanation("Migros'ta alışveriş", matches)) answer += delta;

    expect(answer).toBe("Doğrulanmış yanıt");
    expect(responsesCreate).toHaveBeenCalledOnce();
    const request = responsesCreate.mock.calls[0][0] as { input: string; store: boolean; stream: boolean };
    expect(request.input).toContain("www.worldcard.com.tr");
    expect(request.input).not.toContain("test-key");
    expect(request.store).toBe(false);
    expect(request.stream).toBe(true);
  });
});
