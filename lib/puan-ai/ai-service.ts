import OpenAI from "openai";
import type { CampaignMatch } from "@/lib/puan-ai/types";
import { UNVERIFIED_RESPONSE } from "@/lib/puan-ai/types";

function compactCampaign(campaign: CampaignMatch) {
  return {
    bank: campaign.bank.officialName,
    cards: campaign.cards.map((card) => card.name),
    title: campaign.title,
    merchant: campaign.merchant?.name ?? campaign.category.name,
    dates: { start: campaign.startDate, end: campaign.endDate },
    benefit: campaign.benefitSummary,
    rewardAmount: campaign.decision.rewardValue,
    rewardType: campaign.rewardType?.name ?? null,
    installments: campaign.installments.map((item) => ({
      count: item.count,
      feeFree: item.feeFree,
      scope: item.productScope,
    })),
    conditions: [...campaign.tiers.map((tier) => tier.description), ...campaign.rules.map((rule) => rule.description)],
    verifiedAt: campaign.verification?.checkedAt,
    officialSources: campaign.sources
      .filter((source) => source.id === campaign.verification?.officialSourceId)
      .map((source) => source.url),
    matchReasons: campaign.matchReasons,
    calculation: campaign.decision,
  };
}

function deterministicAnswer(campaigns: CampaignMatch[]) {
  if (campaigns.length === 0) return UNVERIFIED_RESPONSE;
  const lacksDecisionContext = campaigns.every((campaign) =>
    campaign.matchReasons.every((reason) => reason === "Güncel ve doğrulanmış kampanya"),
  );
  if (lacksDecisionContext) {
    return [
      `${campaigns.length} güncel ve doğrulanmış kampanya buldum.`,
      "Ancak mağaza, kategori, tutar, kart veya taksit tercihi olmadan tek bir kartı “en iyi” olarak doğrulayamam.",
      "Bu ayrıntılardan birini yazarsan aşağıdaki güncel seçenekleri koşullarına göre karşılaştırabilirim.",
    ].join(" ");
  }
  const first = campaigns[0];
  const alternatives = campaigns.length - 1;
  const installment = first.installments.length > 0
    ? `${first.installments.map((item) => item.count).join(", ")} taksit seçeneği`
    : "taksit avantajı yok";
  const verifiedBenefit = first.decision.rewardValue > 0
    ? `${first.decision.price?.toLocaleString("tr-TR")} TL işlem için ${first.decision.rewardValue.toLocaleString("tr-TR")} TL ${first.rewardType?.name ?? "ödül"} karşılığı (doğrudan indirim değildir)${first.decision.effectiveValueCost !== null ? `; değer bazlı efektif maliyet ${first.decision.effectiveValueCost.toLocaleString("tr-TR")} TL` : ""}`
    : first.benefitSummary;
  return [
    `${campaigns.length} güncel ve doğrulanmış kampanya buldum.`,
    `En güçlü eşleşme ${first.bank.name} tarafından sunulan “${first.title}”: ${verifiedBenefit}; ${installment}.`,
    alternatives > 0 ? `${alternatives} doğrulanmış alternatifi de koşullarıyla birlikte aşağıda karşılaştırabilirsin.` : "Tüm katılım ve istisna koşullarını aşağıdaki kartta kontrol et.",
    "Bu bir finansal tavsiye değildir; işlemden hemen önce resmî kampanya sayfasını yeniden kontrol et.",
  ].join(" ");
}

export async function* streamGroundedExplanation(query: string, campaigns: CampaignMatch[]) {
  if (campaigns.length === 0) {
    yield UNVERIFIED_RESPONSE;
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    yield deterministicAnswer(campaigns);
    return;
  }

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || "gpt-5.6-sol";
  const input = [
    "Kullanıcı sorusu:",
    query,
    "",
    "Kural motorundan geçen doğrulanmış kampanyalar:",
    JSON.stringify(campaigns.map(compactCampaign)),
  ].join("\n");

  try {
    const stream = await client.responses.create({
      model,
      instructions: [
        "Sen PuanAI'sın. Türkçe, kısa ve anlaşılır yanıt ver.",
        "Yalnızca verilen doğrulanmış kampanya JSON'undaki bilgileri kullan.",
        "Kampanya, puan, taksit, tarih, tutar, limit, banka, kart, skor veya koşul uydurma; hesaplama alanındaki sayıları değiştirme.",
        "Kullanıcı tek bir en iyi kartı soruyor ama mağaza, kategori, tutar, kart veya taksit bağlamı vermiyorsa kazanan seçme; eksik bağlamı sor.",
        "En iyi eşleşmeyi neden seçtiğini ve önemli katılım/istisna koşullarını açıkla.",
        "Aşağıdaki arayüz kampanya ayrıntılarını ayrıca göstereceği için URL listesi üretme.",
        "Belirsizlik varsa açıkça belirt ve işlemden önce resmi kaynağın kontrol edilmesini söyle.",
        "Yanıtı finansal tavsiye gibi sunma.",
      ].join(" "),
      input,
      reasoning: { effort: "low" },
      text: { verbosity: "low" },
      max_output_tokens: 450,
      store: false,
      stream: true,
    });

    let emitted = false;
    for await (const event of stream) {
      if (event.type === "response.output_text.delta" && event.delta) {
        emitted = true;
        yield event.delta;
      }
    }
    if (!emitted) yield deterministicAnswer(campaigns);
  } catch {
    yield deterministicAnswer(campaigns);
  }
}
