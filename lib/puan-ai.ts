export type CampaignCategory = "Market" | "Akaryakıt" | "Restoran" | "E-ticaret" | "Seyahat" | "Teknoloji";

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
};

export const puanAIBanks: PuanAIBank[] = [
  { id: "akbank", name: "Akbank", shortName: "AK", color: "#e33b32", cardCount: 2 },
  { id: "garanti", name: "Garanti BBVA", shortName: "GB", color: "#00a651", cardCount: 2 },
  { id: "is-bankasi", name: "İş Bankası", shortName: "İŞ", color: "#1261a0", cardCount: 1 },
  { id: "yapi-kredi", name: "Yapı Kredi", shortName: "YK", color: "#283593", cardCount: 1 },
  { id: "qnb", name: "QNB", shortName: "QNB", color: "#5b2c83", cardCount: 1 },
];

export const puanAICards: PuanAICard[] = [
  { id: "axess", bankId: "akbank", name: "Axess", network: "Visa", color: "red", reward: "Joker Vadaa", annualFee: "1.191 TL", highlight: "Market ve akaryakıtta güçlü" },
  { id: "maximum", bankId: "is-bankasi", name: "Maximum", network: "Mastercard", color: "blue", reward: "MaxiPuan", annualFee: "1.080 TL", highlight: "Geniş marka ağı" },
  { id: "bonus", bankId: "garanti", name: "Bonus Platinum", network: "Mastercard", color: "green", reward: "Bonus", annualFee: "1.354 TL", highlight: "Taksit ve e-ticaret avantajı" },
  { id: "world", bankId: "yapi-kredi", name: "Worldcard", network: "Visa", color: "violet", reward: "Worldpuan", annualFee: "1.420 TL", highlight: "Seyahat ve teknoloji" },
  { id: "cardfinans", bankId: "qnb", name: "CardFinans", network: "Mastercard", color: "purple", reward: "ParaPuan", annualFee: "990 TL", highlight: "Restoran ve günlük harcama" },
];

export const puanAICampaigns: PuanAICampaign[] = [
  { slug: "migros-750-tl-market-alisverisine-100-tl-puan", title: "750 TL ve üzeri market alışverişine 100 TL puan", bankId: "akbank", category: "Market", merchant: "Migros", description: "Axess ile yapacağın seçili Migros alışverişlerinde toplam 100 TL puan kazan.", benefit: "100 TL", benefitType: "Puan", minSpend: "750 TL", installment: "Peşin veya 3 taksit", expiresAt: "31 Ağustos 2026", updatedAt: "2 saat önce", active: true, featured: true, cardIds: ["axess"], terms: ["Kampanyaya Akbank Mobil üzerinden katılım gerekir.", "Kampanya döneminde en fazla 100 TL puan kazanılabilir.", "Online market siparişleri kampanyaya dahil değildir."] },
  { slug: "hepsiburada-3-taksit", title: "Hepsiburada'da peşin fiyatına 3 taksit", bankId: "garanti", category: "E-ticaret", merchant: "Hepsiburada", description: "Bonus kartınla seçili ürün gruplarında peşin fiyatına 3 taksit fırsatından yararlan.", benefit: "3 taksit", benefitType: "Taksit", minSpend: "1.000 TL", installment: "3 taksit", expiresAt: "15 Eylül 2026", updatedAt: "35 dk önce", active: true, cardIds: ["bonus"], terms: ["Kampanya seçili satıcılarda ve ürünlerde geçerlidir.", "Taksit seçenekleri ödeme adımında görüntülenir."] },
  { slug: "shell-500-tl-akaryakita-50-tl-puan", title: "500 TL akaryakıt alışverişine 50 TL puan", bankId: "is-bankasi", category: "Akaryakıt", merchant: "Shell", description: "Maximum kart ile Shell istasyonlarında yapacağın alışverişlerde MaxiPuan kazan.", benefit: "50 TL", benefitType: "Puan", minSpend: "500 TL", installment: "Peşin", expiresAt: "30 Ağustos 2026", updatedAt: "1 saat önce", active: true, cardIds: ["maximum"], terms: ["Kampanyaya Maximum Mobil üzerinden katılım gerekir.", "Aynı gün içinde yapılan işlemler birleştirilmez."] },
  { slug: "teknosa-2500-tl-alisverise-6-taksit", title: "Teknosa'da 2.500 TL üzeri alışverişe 6 taksit", bankId: "yapi-kredi", category: "Teknoloji", merchant: "Teknosa", description: "Worldcard ile teknoloji alışverişini vade farksız 6 taksite böl.", benefit: "6 taksit", benefitType: "Taksit", minSpend: "2.500 TL", installment: "6 taksit", expiresAt: "30 Eylül 2026", updatedAt: "3 saat önce", active: true, cardIds: ["world"], terms: ["Kampanya Teknosa mağazalarında ve teknosa.com'da geçerlidir.", "Cep telefonu alımlarında geçerli değildir."] },
  { slug: "getir-yemek-300-tl-alisverise-75-tl-indirim", title: "GetirYemek'te 300 TL üzeri alışverişe 75 TL indirim", bankId: "qnb", category: "Restoran", merchant: "GetirYemek", description: "CardFinans ile vereceğin siparişlerde sepette anında 75 TL indirim kazan.", benefit: "75 TL", benefitType: "İndirim", minSpend: "300 TL", installment: "Peşin", expiresAt: "25 Ağustos 2026", updatedAt: "4 saat önce", active: true, cardIds: ["cardfinans"], terms: ["İndirim kodu kampanya koşullarında belirtilen kanaldan alınır.", "Günde bir, ayda üç kez kullanılabilir."] },
  { slug: "amazon-1000-tl-alisverise-100-tl-puan", title: "Amazon'da 1.000 TL alışverişe 100 TL puan", bankId: "garanti", category: "E-ticaret", merchant: "Amazon Türkiye", description: "Bonus kart ile Amazon Türkiye'de yapacağın seçili alışverişlerde Bonus kazan.", benefit: "100 TL", benefitType: "Puan", minSpend: "1.000 TL", installment: "Peşin veya 3 taksit", expiresAt: "10 Eylül 2026", updatedAt: "6 saat önce", active: true, cardIds: ["bonus"], terms: ["Kampanyaya BonusFlaş uygulamasından katılım gerekir.", "Amazon Prime üyelik ödemeleri dahil değildir."] },
  { slug: "thy-yurt-disi-biletlerinde-10-indirim", title: "Yurt dışı uçuşlarında %10 indirim", bankId: "akbank", category: "Seyahat", merchant: "Türk Hava Yolları", description: "Axess ile seçili yurt dışı uçuşlarında indirimli seyahat et.", benefit: "%10", benefitType: "İndirim", minSpend: "5.000 TL", installment: "6 taksit", expiresAt: "20 Eylül 2026", updatedAt: "Dün", active: true, cardIds: ["axess"], terms: ["İndirim, kampanya kodu ile online bilet alımlarında uygulanır.", "Vergi ve hizmet bedelleri kampanyaya dahil değildir."] },
  { slug: "starbucks-10-kahveye-1-bedava", title: "Starbucks'ta her 10. kahveye 1 kahve hediye", bankId: "is-bankasi", category: "Restoran", merchant: "Starbucks", description: "Maximum mobil ödeme ile yaptığın alışverişlerde ekstra MaxiPuan kazan.", benefit: "1 hediye", benefitType: "Puan", minSpend: "250 TL", installment: "Peşin", expiresAt: "31 Ağustos 2026", updatedAt: "Dün", active: true, cardIds: ["maximum"], terms: ["Kampanya Maximum Mobil ile yapılan ödemelerde geçerlidir.", "Hediye kahve bir sonraki alışverişte kullanılabilir."] },
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

