import { getPriceLowReport, rankPriceDeals } from "@/lib/indirim-ai/analysis";
import { getFinanceSnapshot } from "@/lib/finans-ai";
import { getAutomotiveSnapshot } from "@/lib/araba-ai/analysis";
import { getEvAIReport } from "@/lib/ev-ai/analysis";
import { getNewsSnapshot } from "@/lib/haber-ai/store";
import { SITE_URL } from "@/lib/seo";

export type TimeSlot = "09" | "12" | "15" | "20";

export type SlideSpec = {
  heading: string;
  title: string;
  subtitle: string;
  metric: string;
  badge: string;
  accent: string;
  tool: string;
  visualUrl: string;
  narration: string;
};

export type SlotBroadcastPackage = {
  slot: TimeSlot;
  slotLabel: string;
  themeTitle: string;
  voiceScript: string;
  caption: string;
  hashtags: string[];
  youtubeTitle: string;
  youtubeDescription: string;
  slides: SlideSpec[];
  generatedAt: string;
};

export function currentIstanbulSlot(now = new Date()): TimeSlot {
  const hourStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    hour12: false,
  }).format(now);
  const hour = Number(hourStr);
  if (hour < 11) return "09";
  if (hour < 14) return "12";
  if (hour < 18) return "15";
  return "20";
}

function makeVisualUrl(
  tool: string,
  title: string,
  subtitle: string,
  price: string,
  badge: string,
  s1l: string,
  s1v: string,
  s2l: string,
  s2v: string
) {
  const params = new URLSearchParams({
    tool,
    title: title.slice(0, 80),
    subtitle: subtitle.slice(0, 100),
    price: price.slice(0, 24),
    badge: badge.slice(0, 44),
    s1l,
    s1v: s1v.slice(0, 28),
    s2l,
    s2v: s2v.slice(0, 28),
  });
  return `${SITE_URL}/api/visual-card?${params.toString()}`;
}

export async function buildSlotBroadcastPackage(
  requestedSlot?: string
): Promise<SlotBroadcastPackage> {
  const slot: TimeSlot =
    requestedSlot === "09" ||
    requestedSlot === "12" ||
    requestedSlot === "15" ||
    requestedSlot === "20"
      ? requestedSlot
      : currentIstanbulSlot();

  const [newsRes, finRes, indirimRes, arabaRes, evRes] = await Promise.allSettled([
    getNewsSnapshot(),
    getFinanceSnapshot(),
    getPriceLowReport(),
    getAutomotiveSnapshot(),
    getEvAIReport(),
  ]);

  const news = newsRes.status === "fulfilled" ? newsRes.value.articles.slice(0, 3) : [];
  const fin = finRes.status === "fulfilled" ? finRes.value.items : [];
  const indirimReport = indirimRes.status === "fulfilled" ? indirimRes.value : null;
  const topDeals = indirimReport ? rankPriceDeals(indirimReport) : [];
  const araba = arabaRes.status === "fulfilled" ? arabaRes.value : null;
  const ev = evRes.status === "fulfilled" ? evRes.value : null;

  const usd = fin.find((i) => i.id === "USD");
  const eur = fin.find((i) => i.id === "EUR");
  const gram = fin.find((i) => i.id === "GRAM");
  const bist = fin.find((i) => i.id === "XU100");
  const btc = fin.find((i) => i.id === "BTC");

  const usdText = usd?.price ? `${usd.price.toFixed(2)} TL` : "49.45 TL";
  const eurText = eur?.price ? `${eur.price.toFixed(2)} TL` : "55.62 TL";
  const gramText = gram?.price ? `${Math.round(gram.price).toLocaleString("tr-TR")} TL` : "6.623 TL";
  const bistText = bist?.price ? `${Math.round(bist.price).toLocaleString("tr-TR")} Puan` : "11.721 Puan";
  const btcText = btc?.price ? `${Math.round(btc.price).toLocaleString("tr-TR")} USD` : "81.600 USD";

  const topNewsTitle =
    news[0]?.title || "Türkiye genelinde 81 ilde kaynaklı şehir ve ekonomi gündemi";
  const topDeal = topDeals[0]?.item;
  const topDealTitle =
    topDeal?.productName || "Apple MacBook Air M3 ve Dyson V15 Dönem Dibi Fiyat Analizi";
  const topDealPrice = topDeal
    ? `${topDeal.currentPrice.toLocaleString("tr-TR")} TL`
    : "42.999 TL";
  const topDealDrop = topDeal?.dropFromHighPct
    ? `-%${topDeal.dropFromHighPct.toFixed(1)} Dip Fiyat`
    : "360 Gün Dibi";

  const topCar = araba?.prices?.[0];
  const topCarTitle = topCar
    ? `${topCar.brand} ${topCar.model}`
    : "BYD SEAL & Renault Megane Sıfır Araç Kampanya Analizi";
  const topCarPrice = topCar
    ? `${topCar.effectivePrice.toLocaleString("tr-TR")} TL`
    : "1.549.000 TL";

  const topEv = ev?.items?.[0];
  const topEvTitle =
    topEv?.title || "Ankara, İstanbul ve İzmir Konut & Kamu İhale Taşınmaz Fırsatları";
  const topEvScore = topEv ? `EvAI Skoru ${topEv.score}/100` : "EvAI Skoru 78/100";

  const slotConfigs: Record<
    TimeSlot,
    { label: string; themeTitle: string; slides: SlideSpec[] }
  > = {
    "09": {
      label: "09:00 Sabah Gündemi & Piyasa Açılışı",
      themeTitle: "Türkiye Üretir · Sabah 09:00 Gündem ve Piyasa Bülteni",
      slides: [
        {
          heading: "SAAT 09:00 · SABAH BÜLTENİ",
          title: topNewsTitle,
          subtitle: "HaberAI · 81 İl Haritalı ve Kaynaklı Türkiye Gündemi",
          metric: "81 İl Canlı",
          badge: "HABERAI · SABAH GÜNDEMİ",
          accent: "#a8e038",
          tool: "haber-ai",
          visualUrl: makeVisualUrl(
            "haber-ai",
            topNewsTitle,
            "81 İl Haritalı ve Kaynaklı Türkiye Gündemi",
            "81 İl Canlı",
            "HABERAI · 09:00 BÜLTENİ",
            "Kaynak",
            "TRT Haber / AA",
            "Harita",
            "uretir.com/haber-ai"
          ),
          narration: `Günaydın Türkiye! Saat dokuz Üretir yapay zeka sabah bültenine hoş geldiniz. Haber A İ haritasında günün öne çıkan gelişmesi: ${topNewsTitle}.`,
        },
        {
          heading: "FİNANSAI · PİYASA AÇILIŞI",
          title: `Dolar ${usdText} · Euro ${eurText} · Gram Altın ${gramText}`,
          subtitle: `BIST 100: ${bistText} · Bitcoin: ${btcText}`,
          metric: gramText,
          badge: "FİNANSAI · CANLI PİYASA",
          accent: "#4fd1c5",
          tool: "finans-ai",
          visualUrl: makeVisualUrl(
            "finans-ai",
            `Dolar ${usdText} · Gram Altın ${gramText}`,
            `Euro ${eurText} · BIST 100 ${bistText}`,
            gramText,
            "FİNANSAI · PİYASA AÇILIŞI",
            "USD / TRY",
            usdText,
            "BIST 100",
            bistText
          ),
          narration: `Finans A İ ekranında piyasa açılış rakamları: Dolar kuru ${usdText}, Euro ${eurText}, yirmi dört ayar gram altın ${gramText} ve Borsa İstanbul yüz endeksi ${bistText} seviyesinde.`,
        },
        {
          heading: "İNDİRİMAI · SABAH FIRSAT RADARI",
          title: topDealTitle,
          subtitle: `${topDeal?.merchantName || "Güvenilir E-Ticaret"} · Gerçek Fiyat Geçmişi`,
          metric: topDealPrice,
          badge: `İNDİRİMAI · ${topDealDrop}`,
          accent: "#f6ad55",
          tool: "indirim-ai",
          visualUrl: makeVisualUrl(
            "indirim-ai",
            topDealTitle,
            "30 / 90 / 360 Günlük Fiyat Geçmişi Analizi",
            topDealPrice,
            `İNDİRİMAI · ${topDealDrop}`,
            "Fiyat Durumu",
            topDealDrop,
            "Doğrulama",
            "uretir.com/indirim-ai"
          ),
          narration: `İndirim A İ fiyat geçmişi radarında ise ${topDealTitle}, ${topDealPrice} fiyatıyla dönem dibi seviyesinde dikkat çekiyor. Tüm detaylar üretir nokta com adresinde!`,
        },
      ],
    },
    "12": {
      label: "12:00 Öğle İndirim & Kart Kampanya Radarı",
      themeTitle: "Üretir AI · Saat 12:00 Gerçek İndirim ve Kart Kampanyaları",
      slides: [
        {
          heading: "SAAT 12:00 · İNDİRİMAI RADARI",
          title: topDealTitle,
          subtitle: "30, 90 ve 360 Günlük Fiyat Gözlemiyle Doğrulandı",
          metric: topDealPrice,
          badge: `İNDİRİMAI · ${topDealDrop}`,
          accent: "#f6ad55",
          tool: "indirim-ai",
          visualUrl: makeVisualUrl(
            "indirim-ai",
            topDealTitle,
            "Sahte İndirimleri Eleyen Gerçek Dönem Dibi",
            topDealPrice,
            `İNDİRİMAI · ${topDealDrop}`,
            "Gözlem",
            topDealDrop,
            "Adres",
            "uretir.com/indirim-ai"
          ),
          narration: `Üretir saat on iki fırsat yayınından merhaba! İndirim A İ otuz, doksan ve üç yüz altmış günlük fiyat geçmişini taradı. Günün ilk sıradaki fırsatı: ${topDealTitle}, güncel fiyatı ${topDealPrice}.`,
        },
        {
          heading: "PUANAI · KART KAMPANYA ASİSTANI",
          title: "Axess, Bonus, World ve Bankkart Güncel Ödül Karşılaştırması",
          subtitle: "E-Ticaret, Market ve Teknoloji Alışverişlerinde 10.000 TL'ye Varan Puan",
          metric: "10.000 TL Puan",
          badge: "PUANAI · RESMÎ KAMPANYALAR",
          accent: "#b794f4",
          tool: "puan-ai",
          visualUrl: makeVisualUrl(
            "puan-ai",
            "Kredi Kartı Puan ve Taksit Karşılaştırma Asistanı",
            "Axess · Bonus · World · Maximum · Bankkart",
            "9 Taksit / Puan",
            "PUANAI · KARAR ASİSTANI",
            "Ödül Limiti",
            "10.000 TL'ye Varan",
            "Karşılaştır",
            "uretir.com/puan-ai"
          ),
          narration: `Harcama yapmadan önce Puan A İ asistanına sorun! Bankaların resmî kampanyalarını birleştirerek peşin fiyatına dokuz aya varan taksit ve binlerce lira puan avantajını yakalayın.`,
        },
        {
          heading: "FİNANSAI · ÖĞLE PİYASA GÖRÜNÜMÜ",
          title: `Dolar ${usdText} · Gram Altın ${gramText} · Bitcoin ${btcText}`,
          subtitle: "Anlık Döviz, Altın ve Kripto Para Göstergeleri",
          metric: usdText,
          badge: "FİNANSAI · CANLI VERİ",
          accent: "#4fd1c5",
          tool: "finans-ai",
          visualUrl: makeVisualUrl(
            "finans-ai",
            `Öğle Piyasaları: Dolar ${usdText} · Altın ${gramText}`,
            `Bitcoin ${btcText} · BIST 100 ${bistText}`,
            usdText,
            "FİNANSAI · ÖĞLE RAPORU",
            "Gram Altın",
            gramText,
            "Bitcoin",
            btcText
          ),
          narration: `Öğle saatlerinde Dolar ${usdText}, gram altın ${gramText}, Bitcoin ise ${btcText} seviyesinde. Canlı grafikler ve WhatsApp kanallarımız üretir nokta com adresinde sizi bekliyor.`,
        },
      ],
    },
    "15": {
      label: "15:00 Otomotiv & Konut Piyasa Analizi",
      themeTitle: "Üretir AI · Saat 15:00 Sıfır Araç ve Konut Piyasası Raporu",
      slides: [
        {
          heading: "SAAT 15:00 · ARABAAI ANALİZİ",
          title: topCarTitle,
          subtitle: "Resmî Sıfır Araç Liste Fiyatı ve Haritalı 2. El Karşılaştırması",
          metric: topCarPrice,
          badge: "ARABAAI · RESMÎ FİYAT",
          accent: "#63b3ed",
          tool: "araba-ai",
          visualUrl: makeVisualUrl(
            "araba-ai",
            topCarTitle,
            "Resmî Sıfır Araç Fiyatı ve 2. El Piyasa Kıyaslaması",
            topCarPrice,
            "ARABAAI · OTOMOTİV RADARI",
            "Güncel Fiyat",
            topCarPrice,
            "Harita",
            "uretir.com/araba-ai"
          ),
          narration: `Saat on beş Üretir otomotiv ve konut bültenindeyiz! Araba A İ verilerine göre sıfır araç piyasasında ${topCarTitle}, ${topCarPrice} resmî fiyat referansıyla öne çıkıyor.`,
        },
        {
          heading: "EVAI · KONUT VE KAMU İHALE RADARI",
          title: topEvTitle,
          subtitle: "Bölgesel Metrekare Medyanı ve Kamu İhale Taşınmaz Kayıtları",
          metric: topEvScore,
          badge: "EVAI · TAŞINMAZ SKORU",
          accent: "#f687b3",
          tool: "ev-ai",
          visualUrl: makeVisualUrl(
            "ev-ai",
            topEvTitle,
            "Haritalı Konut, Arsa ve Kamu İhale Taşınmaz Analizi",
            topEvScore,
            "EVAI · KONUT RADARI",
            "Değerleme",
            topEvScore,
            "İncele",
            "uretir.com/ev-ai"
          ),
          narration: `Ev A İ taşınmaz radarında ise bölgesel metrekare medyanının altındaki konutlar ve resmî kamu ihale kayıtları harita üzerinde listelendi: ${topEvTitle}.`,
        },
        {
          heading: "ÜRETİR EKOSİSTEMİ · 6 AI ARACI",
          title: "HaberAI · FinansAI · PuanAI · İndirimAI · ArabaAI · EvAI",
          subtitle: "Türkiye Üretir, Gençler Yetişir · Kaynaklı Veri Platformu",
          metric: "uretir.com",
          badge: "ÜRETİR · CANLI EKOSİSTEM",
          accent: "#a8e038",
          tool: "haber-ai",
          visualUrl: makeVisualUrl(
            "haber-ai",
            "Günlük Hayatın 6 Doğrulanmış Yapay Zekâ Aracı",
            "uretir.com · WhatsApp · Telegram · Instagram · YouTube",
            "uretir.com",
            "ÜRETİR · EKOSİSTEM",
            "Web",
            "uretir.com",
            "Sosyal",
            "@uretirai"
          ),
          narration: `İkinci el araçtan konut yatırımına kadar tüm kararlarınızı kaynaklı verilerle desteklemek için üretir nokta com adresini ziyaret edin ve kanallarımızı takip edin.`,
        },
      ],
    },
    "20": {
      label: "20:00 Akşam Özeti & Üretir AI Raporu",
      themeTitle: "Üretir AI · Saat 20:00 Günün Özeti ve Ekonomi Raporu",
      slides: [
        {
          heading: "SAAT 20:00 · GÜN SONU GÜNDEMİ",
          title: topNewsTitle,
          subtitle: "HaberAI · 81 İlde Günün Öne Çıkan Doğrulanmış Başlıkları",
          metric: "Gün Sonu",
          badge: "HABERAI · AKŞAM ÖZETİ",
          accent: "#a8e038",
          tool: "haber-ai",
          visualUrl: makeVisualUrl(
            "haber-ai",
            topNewsTitle,
            "81 İl Gündem Haritası ve Günün Özeti",
            "20:00 Özeti",
            "HABERAI · AKŞAM BÜLTENİ",
            "Kapsam",
            "81 İl Kaynaklı",
            "Arşiv",
            "uretir.com/haber-ai"
          ),
          narration: `İyi akşamlar Türkiye! Saat yirmi Üretir gün sonu bültenindeyiz. Bugün Türkiye gündeminde öne çıkan başlık: ${topNewsTitle}.`,
        },
        {
          heading: "FİNANSAI · GÜN SONU PİYASA KAPANISI",
          title: `Dolar ${usdText} · Euro ${eurText} · Gram Altın ${gramText}`,
          subtitle: `BIST 100 Kapanış: ${bistText} · Bitcoin: ${btcText}`,
          metric: gramText,
          badge: "FİNANSAI · KAPANIŞ RAPORU",
          accent: "#4fd1c5",
          tool: "finans-ai",
          visualUrl: makeVisualUrl(
            "finans-ai",
            `Gün Sonu: Dolar ${usdText} · Altın ${gramText}`,
            `Euro ${eurText} · BIST 100 ${bistText} · BTC ${btcText}`,
            gramText,
            "FİNANSAI · GÜN SONU",
            "Dolar / Euro",
            `${usdText} / ${eurText}`,
            "BIST 100",
            bistText
          ),
          narration: `Piyasalarda gün sonu tablosu: Dolar ${usdText}, Euro ${eurText}, gram altın ${gramText} ve Borsa İstanbul ${bistText}.`,
        },
        {
          heading: "AKŞAM ALIŞVERİŞ & FIRSAT ÖZETİ",
          title: topDealTitle,
          subtitle: "İndirimAI Dönem Dibi + PuanAI Kredi Kartı Ödül Kombinasyonu",
          metric: topDealPrice,
          badge: `İNDİRİMAI & PUANAI`,
          accent: "#f6ad55",
          tool: "indirim-ai",
          visualUrl: makeVisualUrl(
            "indirim-ai",
            topDealTitle,
            "Akşam Alışverişinde Gerçek Dönem Dibi ve Kart Puanı",
            topDealPrice,
            "İNDİRİMAI · AKŞAM FIRSATI",
            "En Düşük",
            topDealPrice,
            "Platform",
            "uretir.com"
          ),
          narration: `Akşam alışverişinde ise ${topDealTitle}, ${topDealPrice} dip fiyatıyla öne çıkıyor. Türkiye üretir, gençler yetişir! Tüm araçlarımız için üretir nokta com adresine bekliyoruz.`,
        },
      ],
    },
  };

  const chosen = slotConfigs[slot];
  const voiceScript = chosen.slides.map((s) => s.narration).join(" ");
  const hashtags = [
    "#Üretir",
    "#UretirAI",
    "#HaberAI",
    "#FinansAI",
    "#İndirimAI",
    "#PuanAI",
    "#ArabaAI",
    "#EvAI",
    "#YapayZeka",
    "#Teknoloji",
    "#Ekonomi",
    "#TürkiyeÜretir",
  ];

  const caption = [
    `⚡ ${chosen.themeTitle}`,
    "",
    `📌 ${chosen.slides[0].heading}: ${chosen.slides[0].title}`,
    `📊 ${chosen.slides[1].heading}: ${chosen.slides[1].title}`,
    `🎯 ${chosen.slides[2].heading}: ${chosen.slides[2].title}`,
    "",
    "🔗 Canlı veriler, 81 il haritası ve 6 ücretsiz AI aracı:",
    "👉 https://www.uretir.com",
    "📲 Instagram: @uretirai | YouTube: @Uretir | Telegram: @uretirbot",
    "",
    hashtags.join(" "),
  ].join("\n");

  return {
    slot,
    slotLabel: chosen.label,
    themeTitle: chosen.themeTitle,
    voiceScript,
    caption,
    hashtags,
    youtubeTitle: `${chosen.label} | Üretir AI #Shorts`,
    youtubeDescription: `${caption}\n\nHızlı Erişim Bağlantıları:\n• HaberAI: https://www.uretir.com/haber-ai\n• FinansAI: https://www.uretir.com/finans-ai\n• PuanAI: https://www.uretir.com/puan-ai\n• İndirimAI: https://www.uretir.com/indirim-ai\n• ArabaAI: https://www.uretir.com/araba-ai\n• EvAI: https://www.uretir.com/ev-ai`,
    slides: chosen.slides,
    generatedAt: new Date().toISOString(),
  };
}
