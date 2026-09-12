import { createHmac, timingSafeEqual } from "node:crypto";

export type IncomingCampaignMessage = {
  providerMessageId: string;
  channelId: string | null;
  senderId: string | null;
  text: string;
  receivedAt: Date;
};

type MetaWebhook = {
  entry?: Array<{ changes?: Array<{ value?: {
    metadata?: { phone_number_id?: string };
    messages?: Array<{ id?: string; from?: string; timestamp?: string; type?: string; text?: { body?: string } }>;
  } }> }>;
};

export function verifyMetaSignature(rawBody: string, signature: string | null, appSecret: string | undefined) {
  if (!signature || !appSecret || !signature.startsWith("sha256=")) return false;
  const received = Buffer.from(signature.slice(7), "hex");
  const expected = Buffer.from(createHmac("sha256", appSecret).update(rawBody).digest("hex"), "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export function extractUrls(text: string) {
  const matches = text.match(/https:\/\/[^\s<>"']+/gi) ?? [];
  return [...new Set(matches.map((url) => url.replace(/[),.;!?]+$/, "")))];
}

export function parseMetaWebhook(payload: unknown): IncomingCampaignMessage[] {
  const data = payload as MetaWebhook;
  const result: IncomingCampaignMessage[] = [];
  for (const entry of data.entry ?? []) for (const change of entry.changes ?? []) {
    const value = change.value;
    for (const message of value?.messages ?? []) {
      const text = message.type === "text" ? message.text?.body?.trim() : "";
      if (!message.id || !text) continue;
      const epoch = Number(message.timestamp);
      result.push({
        providerMessageId: message.id,
        channelId: value?.metadata?.phone_number_id ?? null,
        senderId: message.from ?? null,
        text,
        receivedAt: Number.isFinite(epoch) && epoch > 0 ? new Date(epoch * 1000) : new Date(),
      });
    }
  }
  return result;
}

function numberFromTr(value: string) {
  const compact = value.replace(/\s/g, "");
  const normalized = compact.includes(",") ? compact.replace(/\./g, "").replace(",", ".") : compact.replace(/\./g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function extractMessageFacts(text: string) {
  const min = text.match(/([\d.]+(?:,\d+)?)\s*(?:TL|₺)\s*(?:ve\s+üzeri|üzeri|minimum|alt\s+limit)/i);
  const reward = text.match(/([\d.]+(?:,\d+)?)\s*(?:TL|₺)\s*(?:puan|bonus|worldpuan|bankkart\s+lira|parafpara|chip-para|cashback|iade|indirim)/i);
  const installment = [...text.matchAll(/(\d{1,2})\s*(?:aya\s+varan\s+)?taksit/gi)].map((match) => Number(match[1])).filter((value) => value > 1 && value <= 36);
  const participationRequired = /(katıl(?:ım|mak)|mobil uygulama|sms|kampanyaya katıl)/i.test(text);
  const cardPrograms = ["Bankkart", "World", "Paraf", "Maximum", "Bonus", "Axess", "CardFinans"]
    .filter((name) => new RegExp(name, "i").test(text));
  return {
    minimumSpend: min ? numberFromTr(min[1]) : null,
    statedReward: reward ? numberFromTr(reward[1]) : null,
    installmentCounts: [...new Set(installment)].sort((a, b) => a - b),
    participationRequired,
    cardPrograms,
  };
}
