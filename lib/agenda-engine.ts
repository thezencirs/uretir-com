export type AgendaChannel = {
  key: string;
  name: string;
  badge: string;
  description: string;
  channelUrl: string;
  primaryToolHref: string;
  coveredTools: string[];
};

export const OFFICIAL_WHATSAPP_CHANNELS: AgendaChannel[] = [
  {
    key: "haberai",
    name: "HaberAI · Yapay Zeka & 81 İl Gündem",
    badge: "🤖 YAPAY ZEKA & GÜNDEM",
    description: "Yapay zeka gelişmeleri, 81 il son dakika haberleri ve KPSS/kamu personeli alım duyuruları.",
    channelUrl: "https://whatsapp.com/channel/0029VbDk4gHGpLHXkGseaf3Y",
    primaryToolHref: "/haber-ai",
    coveredTools: ["haber-ai", "memur-ai", "gelismeler", "spor-ai"],
  },
  {
    key: "finansai",
    name: "FinansAI · Piyasa, Maaş & Teşvik",
    badge: "📊 PİYASA & TEŞVİK",
    description: "Canlı döviz, altın, borsa, aile yardımları (TeşvikAI) ve memur/emekli maaş zam hesaplamaları.",
    channelUrl: "https://whatsapp.com/channel/0029VbDIS6B4inoiXI8jeE05",
    primaryToolHref: "/finans-ai",
    coveredTools: ["finans-ai", "tesvik-ai"],
  },
  {
    key: "puanai",
    name: "PuanAI · Banka Kampanya & Promosyon",
    badge: "💳 KART & PROMOSYON",
    description: "Resmî banka kart puanları, market/akaryakıt iadeleri ve en yüksek emekli banka promosyonları.",
    channelUrl: "https://whatsapp.com/channel/0029VbDbbII8PgsA574OLl1H",
    primaryToolHref: "/puan-ai",
    coveredTools: ["puan-ai", "memur-ai"],
  },
  {
    key: "indirimai",
    name: "indirimAI · 30/90/360 Gün Dip Fiyat",
    badge: "🏷️ GERÇEK DİP FİYAT",
    description: "Sahte indirimleri eleyen 360 günlük fiyat geçmişi radarı, teknoloji ve ev elektroniği fırsatları.",
    channelUrl: "https://whatsapp.com/channel/0029VbEFC5zICVfmJzjAfY2Q",
    primaryToolHref: "/indirim-ai",
    coveredTools: ["indirim-ai", "oyun-ai"],
  },
  {
    key: "arabaai",
    name: "ArabaAI · Sıfır & 2. El Araç Radarı",
    badge: "🚗 SIFIR & 2. EL OTO",
    description: "Markaların resmî sıfır araç liste fiyatları, faizsiz taşıt kampanyaları ve 2. el piyasa kıyaslaması.",
    channelUrl: "https://whatsapp.com/channel/0029Vb8r7Vh8F2p8FcGDsj1L",
    primaryToolHref: "/araba-ai",
    coveredTools: ["araba-ai"],
  },
  {
    key: "evai",
    name: "EvAI · Emlak, İnşaat & Kamu İhale",
    badge: "🏠 EMLAK & İNŞAAT",
    description: "TOKİ, Yarısı Bizden, müstakil ev inşaat maliyeti, TÜFE kira artış oranı, tapu harcı ve Hazine arsaları.",
    channelUrl: "https://whatsapp.com/channel/0029VaBzvL33gvWb52bNHv0q",
    primaryToolHref: "/ev-ai",
    coveredTools: ["ev-ai", "insaat-ai", "emlak-ai"],
  },
];

export function getChannelForTool(toolSlug: string): AgendaChannel {
  return (
    OFFICIAL_WHATSAPP_CHANNELS.find((c) => c.coveredTools.includes(toolSlug)) ||
    OFFICIAL_WHATSAPP_CHANNELS[0]
  );
}

export function buildWhatsAppShareUrl(text: string, pagePath = ""): string {
  const fullUrl = pagePath.startsWith("http")
    ? pagePath
    : `https://www.uretir.com${pagePath.startsWith("/") ? pagePath : `/${pagePath}`}`;
  const message = `${text}\n\n🔗 Hesaplama & Detay: ${fullUrl}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

export function getDailyAgendaContext(now = new Date()) {
  const parts = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "long",
  }).formatToParts(now);

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const day = Number(map.day || 15);
  const month = Number(map.month || 11);
  const year = Number(map.year || 2026);

  const formattedDateTR = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(now);

  const isWinterSeason = month === 11 || month === 12 || month === 1 || month === 2;
  const isYearEndTransition = month === 11 || month === 12 || month === 1;

  let periodBadge = "GÜNÜN CANLI GÜNDEMİ";
  let periodTitle = "Güncel Teşvik, Maaş, Emlak ve Yapay Zeka Takvimi";
  let periodSummary =
    "Bugünün tarihine göre en çok aranan resmî destek başvuruları, maaş/kira hesaplamaları ve yapay zeka gelişmeleri otomatik sıralandı.";

  if (day <= 7) {
    periodBadge = "📅 AY BAŞI ENFLASYON & KİRA HAFTASI";
    periodTitle = "TÜİK TÜFE Kira Artış Oranı, Maaş Enflasyon Farkı ve Yeni Ay Kampanyaları";
    periodSummary =
      "Ayın ilk haftasında açıklanan TÜİK 12 aylık TÜFE kira tavan oranı, memur/emekli enflasyon farkı ve yeni başlayan banka kart kampanyaları gündemin ilk sırasında.";
  } else if (day <= 18) {
    periodBadge = "📅 SOSYAL YARDIM & MAAŞ ÖDEME HAFTASI";
    periodTitle = "e-Devlet Doğum Yardımı, SED, Evde Bakım Maaşı Yatış Günleri ve Memur Maaş Hesabı";
    periodSummary =
      "Ayın 8–18'i arasında hesaplara yatan Aile Bakanlığı sosyal destek ödemeleri, 15'i memur maaş bordrosu ve banka promosyon güncellemeleri öne çıkıyor.";
  } else {
    periodBadge = isYearEndTransition
      ? "🔥 YILSONU & YENİ DÖNEM GEÇİŞ GÜNDEMİ"
      : "📅 AY SONU FIRSAT & İHALE TAKVİMİ";
    periodTitle = isYearEndTransition
      ? "Yeni Dönem Maaş/Promosyon Hesabı, Kış Doğalgaz Desteği, Yılsonu Araç & Yapay Zeka Gündemi"
      : "Ay Sonu Banka Puan Son Günleri, TOKİ/Milli Emlak İhaleleri ve İndirim Radarı";
    periodSummary = isYearEndTransition
      ? `${year} yılsonu ve yeni dönem memur/emekli maaş zam senaryoları, kış doğalgaz/elektrik fatura desteği, 150.000 TL evlilik kredisi ve küresel yapay zeka gelişmeleri canlı takipte.`
      : "Ay sonunda süresi dolacak banka kart puan kampanyaları, sıfır araç bayi indirimleri, Hazine arsası ihaleleri ve dip fiyatlı teknoloji ürünleri.";
  }

  const hotTopics = [
    {
      id: "agenda-ai",
      badge: "🤖 YAPAY ZEKA RADARI",
      title: "Günün Yapay Zeka & Otonom Teknoloji Gelişmeleri",
      summary: "OpenAI, Gemini, DeepSeek, çip teknolojileri ve Türkiye teknoparklarındaki saatlik canlı haber akışı.",
      href: "/gelismeler",
      channelUrl: "https://whatsapp.com/channel/0029VbDk4gHGpLHXkGseaf3Y",
      channelName: "HaberAI Kanalı",
    },
    {
      id: "agenda-tesvik",
      badge: isWinterSeason ? "❄️ KIŞ & AİLE DESTEĞİ" : "🍼 AİLE DESTEK PAKETİ",
      title: isWinterSeason
        ? "Doğalgaz Tüketim Desteği, 5.000 TL Doğum Yardımı & 150.000 TL Evlilik Kredisi"
        : "e-Devlet Doğum Yardımı, SED Çocuk Desteği & 150.000 TL Faizsiz Kredi Sorgulama",
      summary: "Hane kişi başı gelirinize göre bugün başvurabileceğiniz tüm devlet yardımlarını 10 saniyede hesaplayın.",
      href: "/tesvik-ai",
      channelUrl: "https://whatsapp.com/channel/0029VbDIS6B4inoiXI8jeE05",
      channelName: "FinansAI & Teşvik Kanalı",
    },
    {
      id: "agenda-memur",
      badge: "🎯 MAAŞ & KPSS GÜNDEMİ",
      title: "Memur/Emekli Maaş Zammı, En Yüksek Banka Promosyonu & KPSS Şartsız İŞKUR İlanları",
      summary: "14 günlük maaş farkınızı, 24.000 TL'ye varan emekli promosyonlarını ve aktif kamu ilanlarını karşılaştırın.",
      href: "/memur-ai",
      channelUrl: "https://whatsapp.com/channel/0029VbDbbII8PgsA574OLl1H",
      channelName: "PuanAI & Promosyon Kanalı",
    },
    {
      id: "agenda-insaat",
      badge: "🏗️ İNŞAAT & DÖNÜŞÜM",
      title: "Müstakil Ev m² İnşaat Maliyeti, Yarısı Bizden 1.75 Milyon TL Destek & TOKİ Takvimi",
      summary: "Betonarme, çelik ve prefabrik ev anahtar teslim maliyetini, demir/beton metrajını ve imar hakkını hesaplayın.",
      href: "/insaat-ai",
      channelUrl: "https://whatsapp.com/channel/0029VaBzvL33gvWb52bNHv0q",
      channelName: "EvAI & İnşaat Kanalı",
    },
    {
      id: "agenda-emlak",
      badge: "🏠 KİRA & TAPU HESABI",
      title: "TÜİK 12 Aylık TÜFE Kira Artış Oranı, %4 Tapu Harcı ve Milli Emlak Hazine Arsaları",
      summary: "Bu ayki yasal kira zam tavanını, WebTapu alıcı-satıcı harcını ve 120 ay konut kredisi taksitini görün.",
      href: "/emlak-ai",
      channelUrl: "https://whatsapp.com/channel/0029VaBzvL33gvWb52bNHv0q",
      channelName: "EvAI & Emlak Kanalı",
    },
    {
      id: "agenda-puan-indirim",
      badge: "💳 KAMPANYA & DİP FİYAT",
      title: "Bu Ayın Kart Puan Kazanımları, Sıfır Araç Kampanyaları ve 360 Gün Dip Fiyatları",
      summary: "Market/akaryakıt harcamanızdan net kart iadesini ve gerçek fiyat geçmişiyle dip yapan ürünleri yakalayın.",
      href: "/puan-ai",
      channelUrl: "https://whatsapp.com/channel/0029VbEFC5zICVfmJzjAfY2Q",
      channelName: "indirimAI Kanalı",
    },
  ];

  return {
    formattedDateTR,
    day,
    month,
    year,
    periodBadge,
    periodTitle,
    periodSummary,
    hotTopics,
    channels: OFFICIAL_WHATSAPP_CHANNELS,
  };
}
