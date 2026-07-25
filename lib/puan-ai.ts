export type CampaignCategory = "Market" | "Akaryakıt" | "Restoran" | "E-ticaret" | "Seyahat" | "Teknoloji";

export type PuanAIDataMode = "verified" | "estimated" | "sample" | "future_integration";

export type PuanAICampaignProvenance = {
  mode: PuanAIDataMode;
  label: string;
  provider: string;
  sourceUrl?: string;
  retrievedAt?: string;
  verifiedAt?: string;
  disclaimer?: string;
};

/**
 * Production safety contract:
 * - sample records are explicitly hypothetical and never use real campaign claims;
 * - verified records require a source URL and machine-readable retrieval/review dates;
 * - incomplete provider records are downgraded before they reach the UI.
 */
export const puanAIDataSet: PuanAICampaignProvenance = {
  mode: "sample",
  label: "Varsayımsal örnek senaryo",
  provider: "PuanAI karar modeli",
  disclaimer: "Bu kayıt gerçek bir banka, kart, mağaza veya kampanyayı temsil etmez.",
};

export type PuanAIBank = {
  id: string;
  name: string;
  shortName: string;
  color: string;
  cardCount: number;
};

export type PuanAICard = {
  id: string;
  bankId: string;
  name: string;
  network: "Visa" | "Mastercard";
  color: string;
  reward: string;
  annualFee: string;
  highlight: string;
};

export type PuanAICampaign = {
  slug: string;
  title: string;
  bankId: string;
  category: CampaignCategory;
  merchant: string;
  description: string;
  benefit: string;
  benefitType: "Puan" | "İndirim" | "Taksit";
  minSpend: string;
  installment: string;
  expiresAt: string;
  updatedAt: string;
  active: boolean;
  featured?: boolean;
  cardIds: string[];
  terms: string[];
  provenance?: PuanAICampaignProvenance;
};

export const puanAIBanks: PuanAIBank[] = [
  { id: "provider-a", name: "Örnek sağlayıcı A", shortName: "A", color: "#6e766d", cardCount: 1 },
  { id: "provider-b", name: "Örnek sağlayıcı B", shortName: "B", color: "#64748b", cardCount: 1 },
  { id: "provider-c", name: "Örnek sağlayıcı C", shortName: "C", color: "#756a86", cardCount: 1 },
];

export const puanAICards: PuanAICard[] = [
  { id: "sample-card-a", bankId: "provider-a", name: "Örnek kart A", network: "Visa", color: "green", reward: "Örnek puan modeli", annualFee: "Canlı veri yok", highlight: "Market senaryosu" },
  { id: "sample-card-b", bankId: "provider-b", name: "Örnek kart B", network: "Mastercard", color: "blue", reward: "Örnek indirim modeli", annualFee: "Canlı veri yok", highlight: "E-ticaret senaryosu" },
  { id: "sample-card-c", bankId: "provider-c", name: "Örnek kart C", network: "Visa", color: "violet", reward: "Örnek taksit modeli", annualFee: "Canlı veri yok", highlight: "Teknoloji senaryosu" },
];

export const puanAICampaigns: PuanAICampaign[] = [
  {
    slug: "ornek-market-puan-senaryosu",
    title: "Örnek senaryo: market alışverişinde puan",
    bankId: "provider-a",
    category: "Market",
    merchant: "Varsayımsal market",
    description: "Karar akışının puan önceliğini nasıl değerlendirdiğini göstermek için oluşturulmuş, gerçek bir kampanyayı temsil etmeyen senaryo.",
    benefit: "Örnek puan",
    benefitType: "Puan",
    minSpend: "Varsayımsal eşik",
    installment: "Koşul belirtilmez",
    expiresAt: "Gerçek tarih yok",
    updatedAt: "2026-07-25",
    active: true,
    featured: true,
    cardIds: ["sample-card-a"],
    terms: ["Gerçek banka veya mağaza kampanyası değildir.", "Tutar, tarih ve uygunluk koşulu içermez.", "Canlı sürümde her koşul sağlayıcının resmî kaynağına bağlanacaktır."],
  },
  {
    slug: "ornek-e-ticaret-indirim-senaryosu",
    title: "Örnek senaryo: e-ticarette indirim",
    bankId: "provider-b",
    category: "E-ticaret",
    merchant: "Varsayımsal çevrim içi mağaza",
    description: "İndirim önceliğine göre açıklanabilir öneri üretimini gösteren, ticari teklif niteliği taşımayan örnek karar senaryosu.",
    benefit: "Örnek indirim",
    benefitType: "İndirim",
    minSpend: "Varsayımsal eşik",
    installment: "Koşul belirtilmez",
    expiresAt: "Gerçek tarih yok",
    updatedAt: "2026-07-25",
    active: true,
    cardIds: ["sample-card-b"],
    terms: ["Gerçek kampanya veya fiyat avantajı değildir.", "Herhangi bir satın alma kararında kullanılamaz.", "Gelecekte kaynak, erişim zamanı ve doğrulama tarihi zorunlu olacaktır."],
  },
  {
    slug: "ornek-teknoloji-taksit-senaryosu",
    title: "Örnek senaryo: teknoloji alışverişinde taksit",
    bankId: "provider-c",
    category: "Teknoloji",
    merchant: "Varsayımsal teknoloji mağazası",
    description: "Taksit önceliğinin toplam maliyet ve uygunluk koşullarıyla birlikte nasıl ele alınacağını gösteren varsayımsal senaryo.",
    benefit: "Örnek taksit",
    benefitType: "Taksit",
    minSpend: "Varsayımsal eşik",
    installment: "Taksit sayısı belirtilmez",
    expiresAt: "Gerçek tarih yok",
    updatedAt: "2026-07-25",
    active: true,
    cardIds: ["sample-card-c"],
    terms: ["Gerçek kart veya mağaza teklifi değildir.", "Taksit sayısı ve maliyet bilgisi özellikle verilmez.", "Canlı veride yasal ve sağlayıcı koşulları ayrıca doğrulanacaktır."],
  },
];

export function getPuanAIBank(bankId: string) {
  return puanAIBanks.find((bank) => bank.id === bankId);
}

export function getPuanAICard(cardId: string) {
  return puanAICards.find((card) => card.id === cardId);
}

export function getPuanAICampaign(slug: string) {
  return puanAICampaigns.find((campaign) => campaign.slug === slug);
}

export function isVerifiedPuanAIProvenance(provenance: PuanAICampaignProvenance) {
  return provenance.mode === "verified"
    && Boolean(provenance.sourceUrl)
    && Boolean(provenance.retrievedAt)
    && Boolean(provenance.verifiedAt);
}

export function getPuanAICampaignProvenance(campaign: PuanAICampaign): PuanAICampaignProvenance {
  const provenance = campaign.provenance ?? puanAIDataSet;
  if (provenance.mode !== "verified" || isVerifiedPuanAIProvenance(provenance)) return provenance;
  return {
    ...provenance,
    mode: "estimated",
    label: "Doğrulama bilgisi eksik",
    disclaimer: "Kaynak ve güncellik alanları tamamlanmadığı için bu kayıt doğrulanmış olarak gösterilemez.",
  };
}
