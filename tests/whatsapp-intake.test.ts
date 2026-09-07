import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { extractMessageFacts, extractUrls, parseMetaWebhook, verifyMetaSignature } from "@/lib/puan-ai/whatsapp-intake";

describe("WhatsApp campaign intake", () => {
  it("accepts only a valid Meta SHA-256 signature", () => {
    const body = JSON.stringify({ object: "whatsapp_business_account" });
    const signature = `sha256=${createHmac("sha256", "secret").update(body).digest("hex")}`;
    expect(verifyMetaSignature(body, signature, "secret")).toBe(true);
    expect(verifyMetaSignature(`${body}x`, signature, "secret")).toBe(false);
    expect(verifyMetaSignature(body, null, "secret")).toBe(false);
  });

  it("normalizes text messages without inventing unsupported fields", () => {
    const messages = parseMetaWebhook({ entry: [{ changes: [{ value: {
      metadata: { phone_number_id: "channel-1" },
      messages: [{ id: "wamid.1", from: "90500", timestamp: "1788768000", type: "text", text: { body: "Kampanya: https://bank.example/kampanya" } }],
    } }] }] });
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ providerMessageId: "wamid.1", channelId: "channel-1", senderId: "90500" });
  });

  it("extracts only explicit campaign facts and source URLs", () => {
    const text = "Bankkart ile 10.000 TL ve üzeri alışverişe 1.000 TL Bankkart Lira, 6 taksit. Katılmak gerekir. https://bank.example/kampanya.";
    expect(extractUrls(text)).toEqual(["https://bank.example/kampanya"]);
    expect(extractMessageFacts(text)).toEqual({
      minimumSpend: 10_000,
      statedReward: 1_000,
      installmentCounts: [6],
      participationRequired: true,
      cardPrograms: ["Bankkart"],
    });
  });

  it("leaves absent amounts and programs null or empty", () => {
    expect(extractMessageFacts("Yeni kampanya başladı")).toEqual({
      minimumSpend: null,
      statedReward: null,
      installmentCounts: [],
      participationRequired: false,
      cardPrograms: [],
    });
  });
});
