import OpenAI from "openai";
import { getRuleValue } from "@/lib/puan-ai/rule-engine";
import type { CampaignMatch } from "@/lib/puan-ai/types";
import { UNVERIFIED_RESPONSE } from "@/lib/puan-ai/types";

function requiresEnrollment(campaign: CampaignMatch) { return campaign.rules.some((rule) => rule.kind === "REQUIRED_ENROLLMENT"); }

function enrollmentNote(campaign: CampaignMatch) {
  return requiresEnrollment(campaign)
    ? `Puanı veya avantajı kazanmak için harcamadan önce ${campaign.bank.name} mobil uygulamasından ya da resmî kampanya sayfasından kampanyaya katılmayı unutma.`
    : "Bazı kampanyalar katılım gerektirir; puanı kazanmak için bankanın mobil uygulamasından ya da resmî kampanya sayfasından katılım koşulunu kontrol et.";
}

function compactCampaign(campaign: CampaignMatch) {
  return {
    bank: campaign.bank.officialName,
    enrollmentRequired: requiresEnrollment(campaign),
    cards: campaign.cards.map((card) => card.name),
    title: campaign.title,
    merchant: campaign.merchant?.name ?? campaign.category.name,
    dates: { start: campaign.startDate, end: campaign.endDate },
    benefit: campaign.benefitSummary,
    rewardAmount: getRuleValue(campaign, ["MAX_REWARD", "REWARD_AMOUNT"]),
    rewardType: campaign.rewardType?.name ?? null,
    installments: campaign.installments.map((item) => ({
      count: item.count,
      feeFree: item.feeFree,
      scope: item.productScope,
    })),
    conditions: campaign.rules.map((rule) => rule.description),
    verifiedAt: campaign.verification?.checkedAt,
    officialSources: campaign.sources
      .filter((source) => source.id === campaign.verification?.officialSourceId)
      .map((source) => source.url),
    matchReasons: campaign.matchReasons,
    calculatedBenefit: campaign.decision.totalVerifiedBenefit,
    purchaseAmount: campaign.decision.price,
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
      "Ne alacağını, yaklaşık tutarı ve hangi kartı kullanmayı düşündüğünü yazarsan (kart numarası veya kişisel bilgi gerekmez) aşağıdaki güncel seçenekleri koşullarına göre karşılaştırabilirim.",
    ].join(" ");
  }
  const first = campaigns[0];
  const alternatives = campaigns.length - 1;
  const installment = first.installments.length > 0
    ? `${first.installments.map((item) => item.count).join(", ")} taksit seçeneği`
    : "taksit avantajı yok";
  return [
    `${campaigns.length} güncel ve doğrulanmış kampanya buldum.`,
    `Kayıtlı seçeneklerde öne çıkan eşleşme ${first.bank.name} tarafından sunulan “${first.title}”: ${first.benefitSummary}; ${installment}.`,
    first.decision.totalVerifiedBenefit > 0 ? `Girdiğin tutar için koşullar sağlanırsa hesaplanan avantaj ${first.decision.totalVerifiedBenefit.toLocaleString("tr-TR")} TL değerindedir.` : "Kesin kazanç hesaplanamadı; tutar ve birden fazla işlem gerekliliği dahil katılım koşullarını kontrol et.",
    alternatives > 0 ? `${alternatives} doğrulanmış alternatifi de koşullarıyla birlikte aşağıda karşılaştırabilirsin.` : "Tüm katılım ve istisna koşullarını aşağıdaki kartta kontrol et.",
    enrollmentNote(first),
    "Bu bir finansal tavsiye değildir; işlemden hemen önce resmî kampanya sayfasını yeniden kontrol et.",
  ].join(" ");
}

export async function* streamGroundedExplanation(query: string, campaigns: CampaignMatch[]) {
  if (campaigns.length === 0) {
    yield UNVERIFIED_RESPONSE;
    return;
  }

  const instructions = [
    "Sen PuanAI'sın; kullanıcının yapacağı alışverişi, tutarı ve kullanmayı düşündüğü kartı doğal dille anlayan bir kampanya ajanısın. Türkçe, kısa ve anlaşılır yanıt ver.",
    "Kart numarası, TC kimlik numarası, telefon veya başka kişisel bilgi isteme; kullanıcı paylaşsa bile yanıtta tekrar etme ve bunlara ihtiyacın olmadığını belirt.",
    "Önerdiğin kampanyada enrollmentRequired true ise veya katılım koşulundan emin değilsen, puanı kazanmak için harcamadan önce bankanın mobil uygulamasından ya da resmî kampanya sayfasından kampanyaya katılması gerektiğini mutlaka söyle.",
    "Yalnızca verilen doğrulanmış kampanya JSON'undaki bilgileri kullan.",
    "Kampanya, puan, taksit, tarih, tutar, limit, banka, kart veya koşul uydurma.",
    "Kesin kazancı yalnızca calculatedBenefit alanından al. Üst limit veya benefit metnini kesin kazanç sayma. Sıfır hesaplanan avantaj, koşulların doğrulanmadığı anlamına gelebilir. Tüm piyasada en iyi olduğunu iddia etme.",
    "Kullanıcı tek bir en iyi kartı soruyor ama mağaza, kategori, tutar, kart veya taksit bağlamı vermiyorsa kazanan seçme; eksik bağlamı sor.",
    "En iyi eşleşmeyi neden seçtiğini ve önemli katılım/istisna koşullarını açıkla.",
    "Aşağıdaki arayüz kampanya ayrıntılarını ayrıca göstereceği için URL listesi üretme.",
    "Belirsizlik varsa açıkça belirt ve işlemden önce resmi kaynağın kontrol edilmesini söyle.",
    "Yanıtı finansal tavsiye gibi sunma.",
  ].join(" ");

  const input = [
    "Kullanıcı sorusu:",
    query,
    "",
    "Kural motorundan geçen doğrulanmış kampanyalar:",
    JSON.stringify(campaigns.map(compactCampaign)),
  ].join("\n");

  const nimKey = process.env.NVIDIA_NIM_API_KEY;
  const fccEnabled = process.env.PUANAI_FREECLAUDE_ENABLED === "true" || Boolean(nimKey);

  if (fccEnabled && !process.env.VITEST) {
    try {
      const fccUrl = process.env.PUANAI_FREECLAUDE_URL || "http://127.0.0.1:8082/v1/messages";
      let replyText = "";
      try {
        const fccRes = await fetch(fccUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "freecc",
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 450,
            system: instructions,
            messages: [{ role: "user", content: input }],
          }),
          signal: AbortSignal.timeout(12_000),
        });
        if (fccRes.ok) {
          const data = (await fccRes.json()) as { content?: Array<{ type?: string; text?: string }> };
          replyText = data.content?.find((c) => c.type === "text")?.text?.trim() || "";
        }
      } catch {
        // Fallback to direct NVIDIA NIM if local FCC daemon is unreachable
      }

      if (!replyText && nimKey) {
        const nimRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${nimKey}`,
          },
          body: JSON.stringify({
            model: process.env.FCC_NIM_MODEL || "nvidia/nemotron-3.5-super-vl-120b-a12b",
            max_tokens: 1500,
            temperature: 0.3,
            chat_template_kwargs: { enable_thinking: false },
            messages: [
              { role: "system", content: instructions },
              { role: "user", content: input },
            ],
          }),
          signal: AbortSignal.timeout(14_000),
        });
        if (nimRes.ok) {
          const nimData = (await nimRes.json()) as { choices?: Array<{ message?: { content?: string } }> };
          replyText = nimData.choices?.[0]?.message?.content?.trim() || "";
        }
      }

      if (replyText) {
        if (!/katıl/i.test(replyText)) {
          replyText = `${replyText}\n\n${enrollmentNote(campaigns[0])}`;
        }
        yield replyText;
        return;
      }
    } catch {
      // Fallback to OpenAI or deterministicAnswer
    }
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || process.env.PUANAI_PAID_AI_ENABLED !== "true") {
    yield deterministicAnswer(campaigns);
    return;
  }

  const client = new OpenAI({ apiKey, timeout: 20000, maxRetries: 1 });
  const model = process.env.OPENAI_MODEL || "gpt-5.6-sol";

  try {
    const stream = await client.responses.create({
      model,
      instructions,
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
