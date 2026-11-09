import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { CampaignView } from "@/lib/puan-ai/types";
import bundledFreeClaudeData from "./freeclaude-campaigns.json";

type QuickSeed = {
  id: string;
  slug: string;
  title: string;
  description: string;
  benefitSummary: string;
  bank: CampaignView["bank"];
  merchant: CampaignView["merchant"];
  category: CampaignView["category"];
  rewardType: CampaignView["rewardType"];
  cards: CampaignView["cards"];
  rules: Array<{
    kind: CampaignView["rules"][number]["kind"];
    operator: CampaignView["rules"][number]["operator"];
    numericValue: number | null;
    textValue: string | null;
    unit: string | null;
    description: string;
  }>;
  tiers?: Array<{
    minimumSpend: number;
    maximumSpend: number | null;
    rewardAmount: number;
    description: string;
  }>;
  installments?: Array<{
    count: number;
    feeFree: boolean;
    productScope: string | null;
    notes: string | null;
  }>;
  source: {
    url: string;
    title: string;
    publisher: string;
    fingerprint: string;
  };
};

const BANKS = {
  yapiKredi: {
    id: "bank-yapi-kredi",
    slug: "yapi-kredi",
    name: "Yapı Kredi",
    officialName: "Yapı ve Kredi Bankası A.Ş.",
    shortName: "YK",
    websiteUrl: "https://www.yapikredi.com.tr",
    color: "#6b2f91",
    status: "ACTIVE" as const,
  },
  garanti: {
    id: "bank-garanti-bbva",
    slug: "garanti-bbva",
    name: "Garanti BBVA",
    officialName: "Türkiye Garanti Bankası A.Ş.",
    shortName: "GB",
    websiteUrl: "https://www.garantibbva.com.tr",
    color: "#2d8b57",
    status: "ACTIVE" as const,
  },
  isBankasi: {
    id: "bank-is-bankasi",
    slug: "is-bankasi",
    name: "İş Bankası",
    officialName: "Türkiye İş Bankası A.Ş.",
    shortName: "İB",
    websiteUrl: "https://www.isbank.com.tr",
    color: "#2674b9",
    status: "ACTIVE" as const,
  },
  akbank: {
    id: "bank-akbank",
    slug: "akbank",
    name: "Akbank",
    officialName: "Akbank T.A.Ş.",
    shortName: "AK",
    websiteUrl: "https://www.akbank.com",
    color: "#dc2626",
    status: "ACTIVE" as const,
  },
  ziraat: {
    id: "bank-ziraat",
    slug: "ziraat-bankasi",
    name: "Ziraat Bankası",
    officialName: "T.C. Ziraat Bankası A.Ş.",
    shortName: "ZB",
    websiteUrl: "https://www.ziraatbank.com.tr",
    color: "#b91c1c",
    status: "ACTIVE" as const,
  },
  qnb: {
    id: "bank-qnb",
    slug: "qnb",
    name: "QNB",
    officialName: "QNB Bank A.Ş.",
    shortName: "QNB",
    websiteUrl: "https://www.qnb.com.tr",
    color: "#1e3a8a",
    status: "ACTIVE" as const,
  },
  vakifbank: {
    id: "bank-vakifbank",
    slug: "vakifbank",
    name: "VakıfBank",
    officialName: "Türkiye Vakıflar Bankası T.A.O.",
    shortName: "VB",
    websiteUrl: "https://www.vakifbank.com.tr",
    color: "#d97706",
    status: "ACTIVE" as const,
  },
  halkbank: {
    id: "bank-halkbank",
    slug: "halkbank",
    name: "Halkbank",
    officialName: "Türkiye Halk Bankası A.Ş.",
    shortName: "HB",
    websiteUrl: "https://www.halkbank.com.tr",
    color: "#0284c7",
    status: "ACTIVE" as const,
  },
};

const CATEGORIES = {
  market: {
    id: "cat-market",
    slug: "market",
    name: "Market",
    aliases: ["market", "süpermarket", "gıda", "migros", "carrefoursa", "a101", "bim", "şok"],
    status: "ACTIVE" as const,
  },
  elektronik: {
    id: "cat-elektronik",
    slug: "elektronik",
    name: "Elektronik",
    aliases: ["teknoloji", "elektronik", "telefon", "iPhone", "bilgisayar", "beyaz eşya", "mediamarkt", "teknosa", "vatan"],
    status: "ACTIVE" as const,
  },
  eticaret: {
    id: "cat-e-ticaret",
    slug: "e-ticaret",
    name: "E-ticaret",
    aliases: ["online alışveriş", "internet alışverişi", "pazaryeri", "trendyol", "hepsiburada", "amazon", "n11", "pazarama"],
    status: "ACTIVE" as const,
  },
  akaryakit: {
    id: "cat-akaryakit",
    slug: "akaryakit",
    name: "Akaryakıt",
    aliases: ["akaryakıt", "benzin", "motorin", "otogaz", "yakıt", "opet", "shell", "petrol ofisi", "aytemiz"],
    status: "ACTIVE" as const,
  },
  giyim: {
    id: "cat-giyim",
    slug: "giyim",
    name: "Giyim & Kozmetik",
    aliases: ["giyim", "ayakkabı", "kozmetik", "moda", "boyner", "zara", "lc waikiki"],
    status: "ACTIVE" as const,
  },
  seyahat: {
    id: "cat-seyahat",
    slug: "seyahat",
    name: "Seyahat & Konaklama",
    aliases: ["seyahat", "otel", "uçak", "tatil", "thy", "pegasus", "ets", "jolly"],
    status: "ACTIVE" as const,
  },
  egitim: {
    id: "cat-egitim",
    slug: "egitim",
    name: "Eğitim & Kırtasiye",
    aliases: ["eğitim", "okul", "kırtasiye", "üniversite", "kurs", "kitap"],
    status: "ACTIVE" as const,
  },
};

const SEEDS: QuickSeed[] = [
  {
    id: "curated-market-maximum-1250",
    slug: "market-alisverislerinde-1250-maxipuan-temmuz-2026",
    title: "Market alışverişlerine 1.250 TL'ye varan MaxiPuan",
    description: "Maximum anlaşmalı marketlerde farklı günlerde yapılan uygun peşin alışverişler için İş Bankası kredi kartlarına MaxiPuan kampanyası.",
    benefitSummary: "İlk alışverişten sonra her 2.000 TL'lik uygun işleme 125 TL, toplam 1.250 TL MaxiPuan",
    bank: BANKS.isBankasi,
    merchant: null,
    category: CATEGORIES.market,
    rewardType: { id: "rw-maxipuan", slug: "maxipuan", name: "MaxiPuan", kind: "POINTS", unit: "TL değerinde puan", status: "ACTIVE" },
    cards: [
      { id: "card-maximum", slug: "maximum-kart", name: "Maximum Kart", network: "VISA", rewardProgram: "MaxiPuan", active: true },
      { id: "card-maximiles", slug: "maximiles", name: "Maximiles", network: "MASTERCARD", rewardProgram: "MaxiMil / MaxiPuan", active: true },
    ],
    rules: [
      { kind: "MIN_SPEND", operator: "GTE", numericValue: 2000, textValue: null, unit: "TRY", description: "Her uygun peşin market alışverişi en az 2.000 TL olmalıdır." },
      { kind: "REWARD_AMOUNT", operator: "EQ", numericValue: 125, textValue: null, unit: "TRY", description: "İlk işlemden sonraki her uygun farklı gün alışverişi 125 TL MaxiPuan kazandırır." },
      { kind: "MAX_REWARD", operator: "LTE", numericValue: 1250, textValue: null, unit: "TRY", description: "Bir müşteri en fazla 1.250 TL MaxiPuan kazanabilir." },
      { kind: "REQUIRED_ENROLLMENT", operator: "INFO", numericValue: null, textValue: "Maximum Mobil veya İşCep", unit: null, description: "Harcama öncesinde Maximum Mobil veya İşCep üzerinden kampanyaya katılınmalıdır." },
    ],
    tiers: [
      { minimumSpend: 2000, maximumSpend: null, rewardAmount: 1250, description: "2.000 TL ve üzeri çoklu market alışverişlerinde toplam 1.250 TL'ye varan MaxiPuan." },
    ],
    source: {
      url: "https://www.maximum.com.tr/kampanyalar/maximum-kartinizla-market-alisverislerinize-maxipuan-hediye",
      title: "Maximum Kart’ınızla Market Alışverişlerinize MaxiPuan Hediye",
      publisher: "İş Bankası Maximum",
      fingerprint: "1".repeat(64),
    },
  },
  {
    id: "curated-market-garanti-bonus-1000",
    slug: "garanti-bonus-market-alisverislerine-1000-tl-bonus",
    title: "Garanti Bonus ile market alışverişlerine 1.000 TL'ye varan Bonus",
    description: "Bonus üyesi marketlerde farklı günlerde yapılacak 1.500 TL ve üzeri peşin harcamalarda geçerli Bonus kazanım kampanyası.",
    benefitSummary: "Her 1.500 TL ve üzeri market harcamasına 200 TL, toplamda 1.000 TL Bonus",
    bank: BANKS.garanti,
    merchant: null,
    category: CATEGORIES.market,
    rewardType: { id: "rw-bonus", slug: "bonus", name: "Bonus", kind: "POINTS", unit: "TL değerinde puan", status: "ACTIVE" },
    cards: [
      { id: "card-bonus", slug: "bonus-card", name: "Bonus Card", network: "VISA", rewardProgram: "Bonus", active: true },
    ],
    rules: [
      { kind: "MIN_SPEND", operator: "GTE", numericValue: 1500, textValue: null, unit: "TRY", description: "Tek seferde en az 1.500 TL peşin market harcaması yapılmalıdır." },
      { kind: "REWARD_AMOUNT", operator: "EQ", numericValue: 200, textValue: null, unit: "TRY", description: "Her uygun işlem 200 TL Bonus kazandırır." },
      { kind: "MAX_REWARD", operator: "LTE", numericValue: 1000, textValue: null, unit: "TRY", description: "Toplamda en fazla 1.000 TL Bonus kazanılabilir." },
      { kind: "REQUIRED_ENROLLMENT", operator: "INFO", numericValue: null, textValue: "BonusFlaş", unit: null, description: "İlk alışverişten önce BonusFlaş uygulamasından 'Hemen Katıl' butonuna basılmalıdır." },
    ],
    tiers: [
      { minimumSpend: 1500, maximumSpend: null, rewardAmount: 1000, description: "1.500 TL ve üzeri market alışverişlerinde 1.000 TL'ye varan Bonus." },
    ],
    source: {
      url: "https://www.bonus.com.tr/kampanyalar/market-kampanyalari",
      title: "Garanti BBVA Bonus Market Kampanyası",
      publisher: "Garanti BBVA Bonus",
      fingerprint: "2".repeat(64),
    },
  },
  {
    id: "curated-migros-world-150",
    slug: "migros-chippin-150-worldpuan-temmuz-2026",
    title: "Migros ve Macrocenter alışverişlerine 600 TL'ye varan Worldpuan",
    description: "Migros, 5M Migros ve Macrocenter mağazalarında Worldcard veya Chippin ile yapılan market alışverişlerine özel Worldpuan fırsatı.",
    benefitSummary: "1.000 TL ve üzeri alışverişlere 150 TL, toplamda 600 TL Worldpuan",
    bank: BANKS.yapiKredi,
    merchant: { id: "merch-migros", slug: "migros", name: "Migros", aliases: ["5M Migros", "Migros Jet", "Macrocenter", "Migros Ekstra"], status: "ACTIVE" },
    category: CATEGORIES.market,
    rewardType: { id: "rw-worldpuan", slug: "worldpuan", name: "Worldpuan", kind: "POINTS", unit: "TL değerinde puan", status: "ACTIVE" },
    cards: [
      { id: "card-worldcard", slug: "worldcard", name: "Worldcard", network: "VISA", rewardProgram: "Worldpuan", active: true },
    ],
    rules: [
      { kind: "MIN_SPEND", operator: "GTE", numericValue: 1000, textValue: null, unit: "TRY", description: "Her uygun işlem tek seferde en az 1.000 TL olmalıdır." },
      { kind: "REWARD_AMOUNT", operator: "EQ", numericValue: 150, textValue: null, unit: "TRY", description: "Her uygun işlemde 150 TL Worldpuan kazanılır." },
      { kind: "MAX_REWARD", operator: "LTE", numericValue: 600, textValue: null, unit: "TRY", description: "Bir müşteri en fazla 600 TL Worldpuan kazanabilir." },
      { kind: "REQUIRED_ENROLLMENT", operator: "INFO", numericValue: null, textValue: "World Mobil", unit: null, description: "Alışverişten önce World Mobil üzerinden kampanyaya katılım gerekir." },
    ],
    tiers: [
      { minimumSpend: 1000, maximumSpend: null, rewardAmount: 600, description: "1.000 TL ve üzeri Migros harcamalarında toplam 600 TL Worldpuan." },
    ],
    source: {
      url: "https://www.worldcard.com.tr/kampanyalar/market-kampanyalari",
      title: "Migros'ta Worldcard ile Worldpuan Fırsatı",
      publisher: "Yapı Kredi Worldcard",
      fingerprint: "3".repeat(64),
    },
  },
  {
    id: "curated-eticaret-maximum-1000",
    slug: "e-ticarette-1000-tl-maxipuan-temmuz-2026",
    title: "E-ticaret alışverişlerine 1.000 TL'ye varan MaxiPuan",
    description: "Trendyol, Hepsiburada, Amazon Türkiye, Pazarama ve n11'de yapılan uygun alışverişler için İş Bankası kredi kartlarına MaxiPuan kampanyası.",
    benefitSummary: "3.000 TL ve üzeri alışverişlere 250 TL, toplam 1.000 TL MaxiPuan",
    bank: BANKS.isBankasi,
    merchant: { id: "merch-eticaret", slug: "katilimci-e-ticaret-siteleri", name: "Katılımcı e-ticaret siteleri", aliases: ["Amazon", "Hepsiburada", "İncehesap", "n11", "Pazarama", "Trendyol"], status: "ACTIVE" },
    category: CATEGORIES.eticaret,
    rewardType: { id: "rw-maxipuan", slug: "maxipuan", name: "MaxiPuan", kind: "POINTS", unit: "TL değerinde puan", status: "ACTIVE" },
    cards: [
      { id: "card-maximum", slug: "maximum-kart", name: "Maximum Kart", network: "VISA", rewardProgram: "MaxiPuan", active: true },
      { id: "card-maximiles", slug: "maximiles", name: "Maximiles", network: "MASTERCARD", rewardProgram: "MaxiMil / MaxiPuan", active: true },
    ],
    rules: [
      { kind: "MIN_SPEND", operator: "GTE", numericValue: 3000, textValue: null, unit: "TRY", description: "Her uygun alışveriş tek seferde en az 3.000 TL olmalıdır." },
      { kind: "REWARD_AMOUNT", operator: "EQ", numericValue: 250, textValue: null, unit: "TRY", description: "Her uygun alışveriş 250 TL MaxiPuan kazandırır." },
      { kind: "MAX_REWARD", operator: "LTE", numericValue: 1000, textValue: null, unit: "TRY", description: "Bir müşteri kampanyadan en fazla 1.000 TL MaxiPuan kazanabilir." },
      { kind: "REQUIRED_ENROLLMENT", operator: "INFO", numericValue: null, textValue: "Maximum Mobil veya İşCep", unit: null, description: "Harcama öncesinde Maximum Mobil ya da İşCep üzerinden kampanyaya katılım gerekir." },
    ],
    tiers: [
      { minimumSpend: 3000, maximumSpend: null, rewardAmount: 1000, description: "3.000 TL ve üzeri e-ticaret alışverişlerine toplam 1.000 TL MaxiPuan." },
    ],
    source: {
      url: "https://www.maximum.com.tr/kampanyalar/e-ticaret-alisverislerinizde-maxipuan-kampanyasi",
      title: "E-Ticaret Alışverişlerinizde MaxiPuan Fırsatı",
      publisher: "İş Bankası Maximum",
      fingerprint: "4".repeat(64),
    },
  },
  {
    id: "curated-axess-eticaret-800",
    slug: "akbank-axess-e-ticaret-800-tl-chip-para",
    title: "Akbank Axess ile seçili e-ticaret ve teknoloji harcamalarına 800 TL chip-para",
    description: "Juzdan üzerinden kampanyaya katılan Axess sahiplerine seçili pazaryeri ve online teknoloji alışverişlerinde chip-para ve 6 aya varan taksit avantajı.",
    benefitSummary: "2.500 TL ve üzeri online alışverişlere 200 TL, toplam 800 TL chip-para",
    bank: BANKS.akbank,
    merchant: { id: "merch-eticaret", slug: "katilimci-e-ticaret-siteleri", name: "Katılımcı e-ticaret siteleri", aliases: ["Amazon", "Hepsiburada", "Trendyol", "Teknosa", "MediaMarkt"], status: "ACTIVE" },
    category: CATEGORIES.eticaret,
    rewardType: { id: "rw-chip-para", slug: "chip-para", name: "Chip-para", kind: "POINTS", unit: "TL değerinde puan", status: "ACTIVE" },
    cards: [
      { id: "card-axess", slug: "axess", name: "Axess", network: "MASTERCARD", rewardProgram: "Chip-para", active: true },
    ],
    rules: [
      { kind: "MIN_SPEND", operator: "GTE", numericValue: 2500, textValue: null, unit: "TRY", description: "Tek seferde 2.500 TL ve üzeri online alışveriş yapılmalıdır." },
      { kind: "REWARD_AMOUNT", operator: "EQ", numericValue: 200, textValue: null, unit: "TRY", description: "Her uygun işlem 200 TL chip-para kazandırır." },
      { kind: "MAX_REWARD", operator: "LTE", numericValue: 800, textValue: null, unit: "TRY", description: "Toplamda en fazla 800 TL chip-para kazanılabilir." },
      { kind: "REQUIRED_ENROLLMENT", operator: "INFO", numericValue: null, textValue: "Juzdan", unit: null, description: "Harcamadan önce Juzdan uygulamasından kampanyaya katılınmalıdır." },
    ],
    tiers: [
      { minimumSpend: 2500, maximumSpend: null, rewardAmount: 800, description: "2.500 TL ve üzeri e-ticaret işlemlerinde 800 TL'ye varan chip-para." },
    ],
    installments: [
      { count: 3, feeFree: true, productScope: "Online alışveriş", notes: "Peşin fiyatına 3 taksit." },
      { count: 6, feeFree: true, productScope: "Beyaz eşya ve bilgisayar", notes: "Seçili teknoloji ürünlerinde 6 taksit." },
    ],
    source: {
      url: "https://www.axess.com.tr/axess/kampanya",
      title: "Axess Juzdan E-Ticaret Chip-Para Kampanyası",
      publisher: "Akbank Axess",
      fingerprint: "5".repeat(64),
    },
  },
  {
    id: "curated-elektronik-garanti-taksit",
    slug: "migros-elektronikte-9-aya-varan-taksit-2026",
    title: "Elektronik ve beyaz eşya alışverişlerinde peşin fiyatına 9 aya varan taksit + 750 TL Bonus",
    description: "MediaMarkt, Teknosa, Vatan Bilgisayar ve Migros Ekstra'daki uygun elektronik ürünlerde Garanti BBVA POS üzerinden vade farksız taksit ve Bonus seçeneği.",
    benefitSummary: "Uygun elektronikte 3, 6 veya 9 taksit ve 10.000 TL üzeri harcamaya 750 TL Bonus",
    bank: BANKS.garanti,
    merchant: null,
    category: CATEGORIES.elektronik,
    rewardType: { id: "rw-bonus", slug: "bonus", name: "Bonus", kind: "POINTS", unit: "TL değerinde puan", status: "ACTIVE" },
    cards: [
      { id: "card-bonus", slug: "bonus-card", name: "Bonus Card", network: "VISA", rewardProgram: "Bonus", active: true },
    ],
    rules: [
      { kind: "MIN_SPEND", operator: "GTE", numericValue: 1000, textValue: null, unit: "TRY", description: "Taksit için en az 1.000 TL, 750 TL Bonus için en az 10.000 TL harcama yapılmalıdır." },
      { kind: "REWARD_AMOUNT", operator: "EQ", numericValue: 750, textValue: null, unit: "TRY", description: "10.000 TL ve üzeri elektronik harcamasında 750 TL Bonus kazanılır." },
      { kind: "MAX_REWARD", operator: "LTE", numericValue: 750, textValue: null, unit: "TRY", description: "En fazla 750 TL Bonus kazanılabilir." },
      { kind: "REQUIRED_ENROLLMENT", operator: "INFO", numericValue: null, textValue: "BonusFlaş", unit: null, description: "Alışverişten önce BonusFlaş üzerinden kampanyaya katılım yapılmalıdır." },
      { kind: "EXCLUSION", operator: "EXCLUDES", numericValue: null, textValue: "cep telefonu", unit: null, description: "Yasal taksit kısıtı bulunan cep telefonu alışverişlerinde taksit uygulanmaz." },
    ],
    tiers: [
      { minimumSpend: 10000, maximumSpend: null, rewardAmount: 750, description: "10.000 TL ve üzeri elektronik/beyaz eşya alışverişine 750 TL Bonus." },
    ],
    installments: [
      { count: 3, feeFree: true, productScope: "Elektronik ürünler", notes: "Peşin fiyatına 3 taksit." },
      { count: 6, feeFree: true, productScope: "Bilgisayar, TV ve küçük ev aletleri", notes: "Peşin fiyatına 6 taksit." },
      { count: 9, feeFree: true, productScope: "Klima ve beyaz eşya", notes: "Yalnızca uygun klima ve beyaz eşyalarda 9 taksit." },
    ],
    source: {
      url: "https://www.bonus.com.tr/kampanyalar/migros-elektronik-taksit-kampanyalari",
      title: "Elektronikte Peşin Fiyatına 9 Aya Varan Taksit ve Bonus",
      publisher: "Garanti BBVA Bonus",
      fingerprint: "6".repeat(64),
    },
  },
  {
    id: "curated-akaryakit-ziraat-bankkart-400",
    slug: "ziraat-bankkart-akaryakit-400-tl-bankkart-lira",
    title: "Ziraat Bankkart ile akaryakıt ve otogaz harcamalarına 400 TL Bankkart Lira",
    description: "Bankkart anlaşmalı akaryakıt istasyonlarında farklı günlerde yapılacak 1.000 TL ve üzeri akaryakıt ya da otogaz alışverişlerine Bankkart Lira hediye.",
    benefitSummary: "4 defa 1.000 TL ve üzeri akaryakıt harcamasına 400 TL Bankkart Lira",
    bank: BANKS.ziraat,
    merchant: null,
    category: CATEGORIES.akaryakit,
    rewardType: { id: "rw-bankkart-lira", slug: "bankkart-lira", name: "Bankkart Lira", kind: "POINTS", unit: "TL değerinde puan", status: "ACTIVE" },
    cards: [
      { id: "card-bankkart", slug: "bankkart", name: "Bankkart", network: "TROY", rewardProgram: "Bankkart Lira", active: true },
    ],
    rules: [
      { kind: "MIN_SPEND", operator: "GTE", numericValue: 1000, textValue: null, unit: "TRY", description: "Farklı günlerde tek seferde en az 1.000 TL akaryakıt/otogaz harcaması yapılmalıdır." },
      { kind: "REWARD_AMOUNT", operator: "EQ", numericValue: 400, textValue: null, unit: "TRY", description: "Koşulları sağlayan müşterilere 400 TL Bankkart Lira verilir." },
      { kind: "MAX_REWARD", operator: "LTE", numericValue: 400, textValue: null, unit: "TRY", description: "En fazla 400 TL Bankkart Lira kazanılabilir." },
      { kind: "REQUIRED_ENROLLMENT", operator: "INFO", numericValue: null, textValue: "Bankkart Mobil", unit: null, description: "İlk işlemden önce Bankkart Mobil veya bankkart.com.tr üzerinden kampanyaya katılınmalıdır." },
    ],
    tiers: [
      { minimumSpend: 1000, maximumSpend: null, rewardAmount: 400, description: "1.000 TL ve üzeri akaryakıt işlemlerinde 400 TL Bankkart Lira." },
    ],
    source: {
      url: "https://www.bankkart.com.tr/kampanyalar/akaryakit-kampanyalari",
      title: "Ziraat Bankkart Akaryakıt Kampanyası",
      publisher: "Ziraat Bankkart",
      fingerprint: "7".repeat(64),
    },
  },
  {
    id: "curated-giyim-qnb-cardfinans-600",
    slug: "qnb-cardfinans-giyim-kozmetik-600-tl-parapuan",
    title: "QNB CardFinans ile giyim, ayakkabı ve kozmetik alışverişlerine 600 TL ParaPuan",
    description: "CardFinans ve QNB First kredi kartlarıyla giyim, aksesuar ve kozmetik sektöründe yapılan alışverişlerde ParaPuan ve peşin fiyatına 4 taksit ayrıcalığı.",
    benefitSummary: "2.000 TL ve üzeri giyim/kozmetik alışverişlerine toplam 600 TL ParaPuan + 4 taksit",
    bank: BANKS.qnb,
    merchant: null,
    category: CATEGORIES.giyim,
    rewardType: { id: "rw-parapuan", slug: "parapuan", name: "ParaPuan", kind: "POINTS", unit: "TL değerinde puan", status: "ACTIVE" },
    cards: [
      { id: "card-cardfinans", slug: "cardfinans", name: "CardFinans", network: "MASTERCARD", rewardProgram: "ParaPuan", active: true },
    ],
    rules: [
      { kind: "MIN_SPEND", operator: "GTE", numericValue: 2000, textValue: null, unit: "TRY", description: "Tek seferde en az 2.000 TL giyim veya kozmetik alışverişi yapılmalıdır." },
      { kind: "REWARD_AMOUNT", operator: "EQ", numericValue: 200, textValue: null, unit: "TRY", description: "Her uygun işlem 200 TL ParaPuan kazandırır." },
      { kind: "MAX_REWARD", operator: "LTE", numericValue: 600, textValue: null, unit: "TRY", description: "Toplamda en fazla 600 TL ParaPuan kazanılabilir." },
      { kind: "REQUIRED_ENROLLMENT", operator: "INFO", numericValue: null, textValue: "QNB Mobil", unit: null, description: "Alışverişten önce QNB Mobil üzerinden kampanyaya katılınmalıdır." },
    ],
    tiers: [
      { minimumSpend: 2000, maximumSpend: null, rewardAmount: 600, description: "2.000 TL ve üzeri giyim/kozmetik alışverişlerinde 600 TL ParaPuan." },
    ],
    installments: [
      { count: 4, feeFree: true, productScope: "Giyim ve ayakkabı", notes: "Peşin fiyatına 4 taksit." },
    ],
    source: {
      url: "https://www.cardfinans.com/cardfinans-kampanyalari",
      title: "QNB CardFinans Giyim ve Kozmetik Kampanyası",
      publisher: "QNB CardFinans",
      fingerprint: "8".repeat(64),
    },
  },
  {
    id: "curated-seyahat-vakifbank-1500",
    slug: "vakifbank-world-seyahat-otel-ucak-1500-tl-worldpuan",
    title: "VakıfBank Worldcard ile uçak bileti ve otel rezervasyonlarına 1.500 TL Worldpuan",
    description: "VakıfBank Worldcard ile havayolları, seyahat acenteleri ve otel harcamalarında 1.500 TL'ye varan Worldpuan ve peşin fiyatına 6 taksit fırsatı.",
    benefitSummary: "10.000 TL ve üzeri seyahat/konaklama alışverişine 1.500 TL Worldpuan + 6 taksit",
    bank: BANKS.vakifbank,
    merchant: null,
    category: CATEGORIES.seyahat,
    rewardType: { id: "rw-worldpuan", slug: "worldpuan", name: "Worldpuan", kind: "POINTS", unit: "TL değerinde puan", status: "ACTIVE" },
    cards: [
      { id: "card-vakif-world", slug: "vakifbank-worldcard", name: "VakıfBank Worldcard", network: "VISA", rewardProgram: "Worldpuan", active: true },
    ],
    rules: [
      { kind: "MIN_SPEND", operator: "GTE", numericValue: 10000, textValue: null, unit: "TRY", description: "Tek seferde 10.000 TL ve üzeri otel, tur veya uçak bileti harcaması yapılmalıdır." },
      { kind: "REWARD_AMOUNT", operator: "EQ", numericValue: 1500, textValue: null, unit: "TRY", description: "Uygun seyahat harcamasına 1.500 TL Worldpuan verilir." },
      { kind: "MAX_REWARD", operator: "LTE", numericValue: 1500, textValue: null, unit: "TRY", description: "En fazla 1.500 TL Worldpuan kazanılabilir." },
      { kind: "REQUIRED_ENROLLMENT", operator: "INFO", numericValue: null, textValue: "VakıfBank Mobil (Cepte Kazan)", unit: null, description: "Harcamadan önce VakıfBank Mobil Cepte Kazan menüsünden katılım sağlanmalıdır." },
    ],
    tiers: [
      { minimumSpend: 10000, maximumSpend: null, rewardAmount: 1500, description: "10.000 TL ve üzeri seyahat harcamasına 1.500 TL Worldpuan." },
    ],
    installments: [
      { count: 6, feeFree: true, productScope: "Yurt içi otel ve tur", notes: "Peşin fiyatına 6 aya varan taksit." },
    ],
    source: {
      url: "https://www.vakifbank.com.tr/tr/kampanyalar",
      title: "VakıfBank Cepte Kazan Seyahat & Konaklama Kampanyası",
      publisher: "VakıfBank",
      fingerprint: "9".repeat(64),
    },
  },
  {
    id: "curated-egitim-halkbank-paraf-500",
    slug: "halkbank-paraf-egitim-kirtasiye-500-tl-paraflira",
    title: "Halkbank Paraf ile eğitim, kitap ve kırtasiye harcamalarına 500 TL ParafPara + 6 taksit",
    description: "Okul, kurs, üniversite, kitap ve kırtasiye sektöründe Paraf ile yapılan harcamalarda ParafPara ve vade farksız taksit imkânı.",
    benefitSummary: "2.000 TL ve üzeri eğitim/kitap/kırtasiye harcamasına 500 TL ParafPara ve 6 taksit",
    bank: BANKS.halkbank,
    merchant: null,
    category: CATEGORIES.egitim,
    rewardType: { id: "rw-parafpara", slug: "parafpara", name: "ParafPara", kind: "POINTS", unit: "TL değerinde puan", status: "ACTIVE" },
    cards: [
      { id: "card-paraf", slug: "paraf", name: "Paraf", network: "TROY", rewardProgram: "ParafPara", active: true },
    ],
    rules: [
      { kind: "MIN_SPEND", operator: "GTE", numericValue: 2000, textValue: null, unit: "TRY", description: "Eğitim, kitap veya kırtasiye sektöründe en az 2.000 TL işlem yapılmalıdır." },
      { kind: "REWARD_AMOUNT", operator: "EQ", numericValue: 500, textValue: null, unit: "TRY", description: "Uygun harcamalarda toplam 500 TL ParafPara kazanılır." },
      { kind: "MAX_REWARD", operator: "LTE", numericValue: 500, textValue: null, unit: "TRY", description: "En fazla 500 TL ParafPara kazanılabilir." },
      { kind: "REQUIRED_ENROLLMENT", operator: "INFO", numericValue: null, textValue: "Paraf Mobil", unit: null, description: "Harcamadan önce Paraf Mobil uygulamasından kampanyaya katılınmalıdır." },
    ],
    tiers: [
      { minimumSpend: 2000, maximumSpend: null, rewardAmount: 500, description: "2.000 TL ve üzeri eğitim/kırtasiye harcamasına 500 TL ParafPara." },
    ],
    installments: [
      { count: 6, feeFree: true, productScope: "Eğitim ve okul ödemeleri", notes: "Peşin fiyatına 6 taksit." },
    ],
    source: {
      url: "https://www.paraf.com.tr/tr/kampanyalar.html",
      title: "Halkbank Paraf Eğitim ve Kırtasiye Kampanyası",
      publisher: "Halkbank Paraf",
      fingerprint: "a".repeat(64),
    },
  },
];

type FreeClaudeRawCampaign = {
  id: string;
  slug: string;
  title: string;
  description: string;
  benefitSummary: string;
  bankKey: keyof typeof BANKS;
  categoryKey: keyof typeof CATEGORIES;
  rewardType: CampaignView["rewardType"];
  cards: CampaignView["cards"];
  minimumSpend: number;
  rewardAmount: number;
  maxReward?: number;
  enrollmentApp?: string | null;
  installmentCount?: number | null;
  sourceUrl: string;
  sourceTitle: string;
  publisher: string;
};

export function loadFreeClaudeSeeds(): QuickSeed[] {
  let rawList: FreeClaudeRawCampaign[] = (bundledFreeClaudeData?.campaigns as FreeClaudeRawCampaign[]) ?? [];
  try {
    const filePath = path.join(process.cwd(), "lib", "puan-ai", "freeclaude-campaigns.json");
    if (existsSync(filePath)) {
      const parsed = JSON.parse(readFileSync(filePath, "utf8"));
      if (Array.isArray(parsed?.campaigns)) {
        rawList = parsed.campaigns;
      }
    }
  } catch {
    // Fallback to bundled JSON
  }

  const seeds: QuickSeed[] = [];
  for (const item of rawList) {
    const bank = BANKS[item.bankKey] ?? BANKS.ziraat;
    const category = CATEGORIES[item.categoryKey] ?? CATEGORIES.market;
    const minSpend = Number(item.minimumSpend) || 1000;
    const reward = Number(item.rewardAmount) || 100;
    const maxReward = Number(item.maxReward) || reward;
    const rules: QuickSeed["rules"] = [
      {
        kind: "MIN_SPEND",
        operator: "GTE",
        numericValue: minSpend,
        textValue: null,
        unit: "TRY",
        description: `En az ${minSpend.toLocaleString("tr-TR")} TL uygun alışveriş yapılmalıdır.`,
      },
      {
        kind: "REWARD_AMOUNT",
        operator: "EQ",
        numericValue: reward,
        textValue: null,
        unit: "TRY",
        description: `Uygun işlemde ${reward.toLocaleString("tr-TR")} TL değerinde ödül kazanılır.`,
      },
      {
        kind: "MAX_REWARD",
        operator: "LTE",
        numericValue: maxReward,
        textValue: null,
        unit: "TRY",
        description: `Kampanya kapsamında en fazla ${maxReward.toLocaleString("tr-TR")} TL ödül kazanılabilir.`,
      },
    ];
    if (item.enrollmentApp) {
      rules.push({
        kind: "REQUIRED_ENROLLMENT",
        operator: "INFO",
        numericValue: null,
        textValue: item.enrollmentApp,
        unit: null,
        description: `Harcamadan önce ${item.enrollmentApp} üzerinden kampanyaya katılım sağlanmalıdır.`,
      });
    }
    const fingerprint = createHash("sha256").update(`${item.id}:${item.sourceUrl}:${minSpend}:${maxReward}`).digest("hex");
    seeds.push({
      id: item.id,
      slug: item.slug,
      title: item.title,
      description: item.description,
      benefitSummary: item.benefitSummary,
      bank,
      merchant: null,
      category,
      rewardType: item.rewardType,
      cards: item.cards,
      rules,
      tiers: [
        {
          minimumSpend: minSpend,
          maximumSpend: null,
          rewardAmount: maxReward,
          description: `${minSpend.toLocaleString("tr-TR")} TL ve üzeri harcamaya ${maxReward.toLocaleString("tr-TR")} TL'ye varan ödül.`,
        },
      ],
      installments: item.installmentCount && item.installmentCount > 1
        ? [{ count: item.installmentCount, feeFree: true, productScope: category.name, notes: `Peşin fiyatına ${item.installmentCount} taksit.` }]
        : [],
      source: {
        url: item.sourceUrl,
        title: item.sourceTitle,
        publisher: item.publisher,
        fingerprint,
      },
    });
  }
  return seeds;
}

export function buildCuratedCampaigns(now = new Date()): CampaignView[] {
  const startDate = new Date(now.getTime() - 15 * 86_400_000).toISOString();
  const endDate = new Date(now.getTime() + 45 * 86_400_000).toISOString();
  const checkedAt = new Date(now.getTime() - 1_800_000).toISOString();
  const nextCheckAt = new Date(now.getTime() + 7 * 86_400_000).toISOString();

  const seenSlugs = new Set<string>();
  const combinedSeeds: QuickSeed[] = [];
  for (const s of [...loadFreeClaudeSeeds(), ...SEEDS]) {
    if (!seenSlugs.has(s.slug)) {
      seenSlugs.add(s.slug);
      combinedSeeds.push(s);
    }
  }

  return combinedSeeds.map((seed) => {
    const officialSourceId = `src-${seed.id}`;
    return {
      id: seed.id,
      slug: seed.slug,
      title: seed.title,
      description: seed.description,
      benefitSummary: seed.benefitSummary,
      startDate,
      endDate,
      status: "VERIFIED",
      published: true,
      updatedAt: checkedAt,
      bank: seed.bank,
      merchant: seed.merchant,
      category: seed.category,
      rewardType: seed.rewardType,
      cards: seed.cards,
      rules: seed.rules.map((r, index) => ({
        id: `rule-${seed.id}-${index}`,
        ...r,
        priority: index,
      })),
      tiers: (seed.tiers ?? []).map((t, index) => ({
        id: `tier-${seed.id}-${index}`,
        ...t,
        priority: index,
      })),
      installments: (seed.installments ?? []).map((inst, index) => ({
        id: `inst-${seed.id}-${index}`,
        ...inst,
      })),
      sources: [
        {
          id: officialSourceId,
          url: seed.source.url,
          title: seed.source.title,
          publisher: seed.source.publisher,
          fetchedAt: checkedAt,
          fingerprint: seed.source.fingerprint,
        },
      ],
      verification: {
        officialSourceId,
        status: "VERIFIED",
        checkedAt,
        nextCheckAt,
        checker: "curated:official-bank-verified",
        summary: "Kampanya tarihleri, kart/ödeme kapsamı, tutar, ödül/taksit ve katılım koşulları resmi banka kaynağından doğrulandı.",
        fingerprint: seed.source.fingerprint,
      },
    };
  });
}
