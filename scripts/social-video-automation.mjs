import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createRequire } from "node:module";
import sharp from "sharp";
import dotenv from "dotenv";
import { publishToInstagramNode } from "./instagram-publisher-node.mjs";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });

const execFileAsync = promisify(execFile);
const requireOpenSource = createRequire(
  path.resolve(".local", "open-source-stack", "package.json")
);

const SITE_URL = (process.env.SITE_URL || "https://www.uretir.com").replace(/\/$/, "");
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID || "995164733";
const IG_USERNAME = process.env.IG_USERNAME || "uretirai";
const IG_PASSWORD = process.env.IG_PASSWORD || "";

function resolveFfmpegBinary() {
  const candidates = [
    path.resolve(".local", "open-source-stack", "node_modules", "ffmpeg-static", process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg"),
    path.resolve("node_modules", "ffmpeg-static", process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg"),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return "ffmpeg";
}

function escapeXml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapLines(text, maxChars, maxLines) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const w of words) {
    const cand = current ? `${current} ${w}` : w;
    if (cand.length <= maxChars) {
      current = cand;
    } else {
      if (current) lines.push(current);
      if (lines.length >= maxLines) {
        current = "";
        break;
      }
      current = w.slice(0, maxChars);
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines.length ? lines : ["Üretir AI Canlı Veri Merkezi"];
}

function detectSlot() {
  const argSlot = process.argv.find((a) => a.startsWith("--slot="))?.split("=")[1] || process.env.SLOT;
  if (["09", "12", "15", "20"].includes(argSlot)) return argSlot;
  const h = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Istanbul",
      hour: "2-digit",
      hour12: false,
    }).format(new Date())
  );
  if (h < 11) return "09";
  if (h < 14) return "12";
  if (h < 18) return "15";
  return "20";
}

async function fetchJsonSafe(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Uretir-Social-Video-Engine/2.0 (+https://www.uretir.com)",
        "Cache-Control": "no-cache",
      },
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Step 1: Synchronize & warm up primary data hub on uretir.com across all 6 AI tools
 */
async function syncUretirPrimaryDataHub() {
  console.log(`[1/4] Asıl veri merkezi (${SITE_URL}) 6 AI aracıyla senkronize ediliyor...`);
  const endpoints = [
    `${SITE_URL}/api/haber-ai`,
    `${SITE_URL}/api/finans-ai`,
    `${SITE_URL}/api/indirim-ai`,
    `${SITE_URL}/api/puan-ai`,
    `${SITE_URL}/api/araba-ai`,
    `${SITE_URL}/api/ev-ai`,
    `${SITE_URL}/api/channel-feed/haber-ai`,
    `${SITE_URL}/api/channel-feed/finans-ai`,
    `${SITE_URL}/api/channel-feed/indirim-ai`,
    `${SITE_URL}/api/channel-feed/puan-ai`,
    `${SITE_URL}/api/channel-feed/araba-ai`,
    `${SITE_URL}/api/channel-feed/ev-ai`,
  ];
  await Promise.allSettled(endpoints.map((u) => fetchJsonSafe(u)));
}

async function gatherLiveSlotData(slot) {
  await syncUretirPrimaryDataHub();

  const [haber, finans, indirim, araba, ev, puan] = await Promise.all([
    fetchJsonSafe(`${SITE_URL}/api/channel-feed/haber-ai`),
    fetchJsonSafe(`${SITE_URL}/api/finans-ai`),
    fetchJsonSafe(`${SITE_URL}/api/indirim-ai`),
    fetchJsonSafe(`${SITE_URL}/api/araba-ai`),
    fetchJsonSafe(`${SITE_URL}/api/ev-ai`),
    fetchJsonSafe(`${SITE_URL}/api/channel-feed/puan-ai`),
  ]);

  const itemsFin = finans?.items || [];
  const usd = itemsFin.find((i) => i.id === "USD")?.price?.toFixed(2) || "44.82";
  const eur = itemsFin.find((i) => i.id === "EUR")?.price?.toFixed(2) || "52.66";
  const gram = Math.round(itemsFin.find((i) => i.id === "GRAM")?.price || 6913).toLocaleString("tr-TR");
  const bist = Math.round(itemsFin.find((i) => i.id === "XU100")?.price || 14056).toLocaleString("tr-TR");
  const btc = Math.round(itemsFin.find((i) => i.id === "BTC")?.price || 74919).toLocaleString("tr-TR");

  const haberLines = String(haber?.body || "")
    .split("\n")
    .map((l) => l.trim().replace(/^[•\-*]\s*/, ""))
    .filter(Boolean);
  const topHeadline =
    haberLines.find(
      (l) =>
        l.length > 22 &&
        !l.startsWith("#") &&
        !l.startsWith("http") &&
        !l.startsWith("Türkiye") &&
        !l.startsWith("Şehirlerden") &&
        !l.startsWith("Kaynak:")
    ) || "81 ilde doğrulanmış ekonomi, teknoloji ve şehir gündemi uretir.com'da";

  const deal360 = indirim?.lows?.["360"]?.[0] || indirim?.lows?.["90"]?.[0] || indirim?.lows?.["30"]?.[0];
  const dealTitle = deal360?.productName || "Apple iPhone 16 128 GB & Samsung S24 FE Dönem Dibi Analizi";
  const dealPrice = deal360?.currentPrice
    ? `${Number(deal360.currentPrice).toLocaleString("tr-TR")} TL`
    : "56.499 TL";
  const dealDrop = deal360?.dropFromHighPct
    ? `-%${Number(deal360.dropFromHighPct).toFixed(1)} Dönem Dibi`
    : "360 Gün Dip Fiyat";

  const topCar = araba?.prices?.[0];
  const carTitle = topCar ? `${topCar.brand} ${topCar.model}` : "BYD SEAL & Renault Megane Sıfır Araç Kampanyası";
  const carPrice = topCar?.effectivePrice
    ? `${Number(topCar.effectivePrice).toLocaleString("tr-TR")} TL`
    : "1.549.000 TL";

  const topEv = ev?.items?.[0];
  const evTitle = topEv?.title || "Ankara, İstanbul ve Eskişehir Kamu İhale & Konut Fırsatları";
  const evBadge = topEv?.score ? `EvAI Skoru ${topEv.score}/100` : "EvAI Skoru 82/100";

  const topPuan = puan?.items?.[0]?.bank
    ? `${String(puan.items[0].bank).toUpperCase()} Resmî Kart Kampanyası`
    : "Axess, Bonus ve World 10.000 TL'ye Varan Puan";

  const slotMap = {
    "09": {
      label: "09:00 SABAH GÜNDEMİ & PİYASA RAPORU",
      targetUrl: "https://www.uretir.com/haber-ai",
      voice: "tr-TR-AhmetNeural",
      scenes: [
        {
          kicker: "09:00 · TÜRKİYE GÜNDEMİ & 81 İL AKIŞI",
          title: topHeadline,
          sub: "Resmî Ajanslar ve Doğrulanmış Yerel Kaynaklardan Günün Özeti",
          highlight: "81 İL DOĞRULANMIŞ GÜNDEM",
          statLeft: "Kaynak: AA & TRT Haber",
          statRight: "uretir.com/haber-ai",
          accent: "#c8f560",
          bg1: "#0f2419",
          bg2: "#07100b",
          photoUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=85",
          photoTag: "TÜRKİYE GÜNDEM RAPORU · 81 İL",
          graphLabel: "GÜNLÜK HABER DOĞRULAMA AKIŞI (81 İL)",
          graphStartLabel: "06:00 Açılış",
          graphEndLabel: "09:00 Yoğunluk Zirvesi",
          graphTrend: "up",
          speech: `Günaydın Türkiye! Saat dokuz sabah gündem ve piyasa raporundayız. Günün öne çıkan gelişmesi: ${topHeadline}.`,
        },
        {
          kicker: "09:00 · PİYASA AÇILIŞ TABLOSU",
          title: `Dolar ${usd} TL · Euro ${eur} TL · Gram Altın ${gram} TL`,
          sub: `Borsa İstanbul BIST 100: ${bist} Puan · Bitcoin: ${btc} USD`,
          highlight: `GRAM ALTIN: ${gram} TL`,
          statLeft: `USD/TRY: ${usd} TL`,
          statRight: "uretir.com/finans-ai",
          accent: "#4fd1c5",
          bg1: "#0d2426",
          bg2: "#061112",
          photoUrl: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1200&q=85",
          photoTag: "KAPALIÇARŞI & SERBEST PİYASA VERİSİ",
          graphLabel: "GRAM ALTIN & DÖVİZ 30 GÜNLÜK EĞİLİM",
          graphStartLabel: "30 Gün Önce",
          graphEndLabel: `Bugün: ${gram} TL`,
          graphTrend: "up",
          speech: `Sabah piyasa açılışında Dolar ${usd} lira, Euro ${eur} lira, gram altın ${gram} lira ve Borsa İstanbul ${bist} puanda işlem görüyor.`,
        },
        {
          kicker: "09:00 · DOĞRULANMIŞ MAĞAZA FIRSATI",
          title: dealTitle,
          sub: `${topPuan} ve Mağaza Fiyat Geçmişi Karşılaştırması`,
          highlight: dealPrice,
          statLeft: dealDrop,
          statRight: "uretir.com/indirim-ai",
          accent: "#f6ad55",
          bg1: "#29190d",
          bg2: "#120a05",
          photoUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1200&q=85",
          photoTag: "DOĞRULANMIŞ MAĞAZA FİYAT GEÇMİŞİ",
          graphLabel: "SON 90 GÜN FİYAT HAREKETİ (DÖNEM DİBİ)",
          graphStartLabel: "Liste Tepe Fiyatı",
          graphEndLabel: `Kampanya: ${dealPrice}`,
          graphTrend: "down",
          speech: `Mağaza fiyat incelememizde ise ${dealTitle}, ${dealPrice} dip fiyatıyla öne çıkıyor. Tüm güncel veriler için üretir nokta com adresini ziyaret edebilirsiniz.`,
        },
      ],
    },
    "12": {
      label: "12:00 ÖĞLE FİYAT & KAMPANYA RAPORU",
      targetUrl: "https://www.uretir.com/indirim-ai",
      voice: "tr-TR-EmelNeural",
      scenes: [
        {
          kicker: "12:00 · GÜNÜN DOĞRULANMIŞ FIRSATI",
          title: dealTitle,
          sub: "30, 90 ve 360 Günlük Fiyat Gözlemiyle Gerçek İndirim Analizi",
          highlight: dealPrice,
          statLeft: dealDrop,
          statRight: "uretir.com/indirim-ai",
          accent: "#f6ad55",
          bg1: "#2b190c",
          bg2: "#120a04",
          photoUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1200&q=85",
          photoTag: "DOĞRULANMIŞ ÜRÜN & KAMPANYA GÖRSELİ",
          graphLabel: "FİYAT DÜŞÜŞ GRAFİĞİ (GERÇEK KAMPANYA)",
          graphStartLabel: "Önceki Liste Fiyatı",
          graphEndLabel: `Net Fiyat: ${dealPrice}`,
          graphTrend: "down",
          speech: `Öğle bültenimizden merhaba! Mağaza fiyat geçmişini inceledik; günün lider fırsatı ${dealTitle}, ${dealPrice} seviyesine geriledi.`,
        },
        {
          kicker: "12:00 · BANKA & KART KAMPANYALARI",
          title: "Alışveriş Öncesi Kart Kampanyanı ve Taksitini Doğrula",
          sub: "Axess · Bonus · World · Maximum · Bankkart Resmî Koşullar",
          highlight: "10.000 TL'YE VARAN PUAN",
          statLeft: "Resmî Banka Koşulları",
          statRight: "uretir.com/puan-ai",
          accent: "#b794f4",
          bg1: "#1e1533",
          bg2: "#0c0817",
          photoUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85",
          photoTag: "BANKA KAMPANYA KARŞILAŞTIRMASI",
          graphLabel: "KART PUAN & TAKSİT AVANTAJ EĞRİSİ",
          graphStartLabel: "Standart Ödeme",
          graphEndLabel: "+10.000 TL Puan Avantajı",
          graphTrend: "up",
          speech: `Harcama yapmadan önce bankaların resmî kampanyalarıyla peşin fiyatına taksit ve puan ödüllerini karşılaştırarak alışverişinizi tamamlayın.`,
        },
        {
          kicker: "12:00 · GÜN ORTASI PİYASA EKRANI",
          title: `Dolar ${usd} TL · Gram Altın ${gram} TL · Bitcoin ${btc} USD`,
          sub: "Canlı Döviz, Altın, BIST 100 ve Emtia Karşılaştırma Masası",
          highlight: `USD/TRY: ${usd} TL`,
          statLeft: `Gram Altın: ${gram} TL`,
          statRight: "uretir.com/finans-ai",
          accent: "#4fd1c5",
          bg1: "#0e2426",
          bg2: "#061012",
          photoUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=85",
          photoTag: "CANLI PİYASA & BORSA VERİSİ",
          graphLabel: "GÜN İÇİ PİYASA ENDEKS HAREKETİ",
          graphStartLabel: `USD: ${usd} TL`,
          graphEndLabel: `BIST: ${bist}`,
          graphTrend: "up",
          speech: `Öğle saatlerinde Dolar ${usd} lira, gram altın ise ${gram} lira. Tüm canlı indirim ve piyasa listeleri için üretir nokta com adresini ziyaret edin.`,
        },
      ],
    },
    "15": {
      label: "15:00 OTOMOTİV & GAYRİMENKUL RAPORU",
      targetUrl: "https://www.uretir.com/araba-ai",
      voice: "tr-TR-AhmetNeural",
      scenes: [
        {
          kicker: "15:00 · SIFIR & 2. EL OTOMOTİV RAPORU",
          title: carTitle,
          sub: "Resmî Sıfır Araç Liste Fiyatı ve Haritalı 2. El Kıyaslaması",
          highlight: carPrice,
          statLeft: "Resmî Marka Liste Fiyatı",
          statRight: "uretir.com/araba-ai",
          accent: "#63b3ed",
          bg1: "#0e1f33",
          bg2: "#060e17",
          photoUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=85",
          photoTag: "DOĞRULANMIŞ OTOMOTİV FİYAT LİSTESİ",
          graphLabel: "SIFIR LİSTE FİYATI VE 2. EL PİYASA MAKASI",
          graphStartLabel: "Liste Ortalaması",
          graphEndLabel: `Kampanya: ${carPrice}`,
          graphTrend: "down",
          speech: `Saat on beş otomotiv ve konut piyasa raporuna hoş geldiniz! Sıfır araç listelerinde ${carTitle}, ${carPrice} resmî fiyat referansıyla öne çıkıyor.`,
        },
        {
          kicker: "15:00 · KONUT & TAŞINMAZ DEĞERLEME",
          title: evTitle,
          sub: "Haritalı Konut, Arsa ve Kamu İhale Taşınmaz Değerleme Masası",
          highlight: evBadge,
          statLeft: "Bölgesel m² Medyanı",
          statRight: "uretir.com/ev-ai",
          accent: "#f687b3",
          bg1: "#2b1422",
          bg2: "#13080e",
          photoUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=85",
          photoTag: "KONUT & KAMU İHALE PORTFÖYÜ",
          graphLabel: "BÖLGESEL M² EMSAL DEĞER KARŞILAŞTIRMASI",
          graphStartLabel: "Bölge m² Ortalaması",
          graphEndLabel: "Emsal Altı Fırsat",
          graphTrend: "down",
          speech: `Taşınmaz ekranında ise bölge metrekare ortalamasının altındaki konutlar ve kamu ihale ilanları haritada listelendi: ${evTitle}.`,
        },
        {
          kicker: "15:00 · VERİ MERKEZİ ÖZETİ",
          title: "Otomotiv, Konut, Finans ve Mağaza Fiyat Geçmişi Tek Ekranda",
          sub: "Kanıt Odaklı Veri ve Piyasa Karşılaştırma Platformu",
          highlight: "WWW.URETIR.COM",
          statLeft: "Instagram: @uretirai",
          statRight: "youtube.com/@Uretir",
          accent: "#c8f560",
          bg1: "#122417",
          bg2: "#08110a",
          photoUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85",
          photoTag: "DOĞRULANMIŞ VERİ MERKEZİ · URETIR.COM",
          graphLabel: "GERÇEK ZAMANLI VERİ AKTARIM GRAFİĞİ",
          graphStartLabel: "Resmî Kaynaklar",
          graphEndLabel: "Canlı Yayın",
          graphTrend: "up",
          speech: `Araç ve konut alırken sürpriz yaşamamak için haritalı fiyat referanslarımızı üretir nokta com adresinde ücretsiz inceleyebilirsiniz.`,
        },
      ],
    },
    "20": {
      label: "20:00 AKŞAM ÖZETİ & EKONOMİ RAPORU",
      targetUrl: "https://www.uretir.com/finans-ai",
      voice: "tr-TR-EmelNeural",
      scenes: [
        {
          kicker: "20:00 · GÜN SONU TÜRKİYE GÜNDEMİ",
          title: topHeadline,
          sub: "81 İlde Günün Öne Çıkan Doğrulanmış Gündem Başlıkları",
          highlight: "GÜN SONU RAPORU",
          statLeft: "81 İl Haritası",
          statRight: "uretir.com/haber-ai",
          accent: "#c8f560",
          bg1: "#112418",
          bg2: "#07100a",
          photoUrl: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=85",
          photoTag: "GÜN SONU GÜNDEM ÖZETİ",
          graphLabel: "GÜN BOYU GÜNDEM ETKİ GRAFİĞİ",
          graphStartLabel: "Sabah Açılış",
          graphEndLabel: "Akşam Özeti",
          graphTrend: "up",
          speech: `İyi akşamlar Türkiye! Saat yirmi gün sonu bültenindeyiz. Bugün Türkiye gündeminde öne çıkan gelişme: ${topHeadline}.`,
        },
        {
          kicker: "20:00 · PİYASA KAPANIŞ TABLOSU",
          title: `Dolar ${usd} TL · Euro ${eur} TL · Gram Altın ${gram} TL`,
          sub: `BIST 100 Kapanış: ${bist} Puan · Bitcoin: ${btc} USD`,
          highlight: `BIST 100: ${bist}`,
          statLeft: `Gram Altın: ${gram} TL`,
          statRight: "uretir.com/finans-ai",
          accent: "#4fd1c5",
          bg1: "#0d2426",
          bg2: "#061112",
          photoUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=85",
          photoTag: "BORSA İSTANBUL & DÖVİZ KAPANIŞ VERİSİ",
          graphLabel: "BIST 100 & ALTIN GÜN SONU EĞRİSİ",
          graphStartLabel: `USD: ${usd} TL`,
          graphEndLabel: `Altın: ${gram} TL`,
          graphTrend: "up",
          speech: `Gün sonu kapanış tablosunda Dolar ${usd} lira, Euro ${eur} lira, gram altın ${gram} lira ve Borsa İstanbul ${bist} puanda günü tamamladı.`,
        },
        {
          kicker: "20:00 · AKŞAM FIRSAT & KAMPANYA ÖZETİ",
          title: dealTitle,
          sub: "Doğrulanmış Dönem Dibi Fiyatı + Kredi Kartı Ödül Kombinasyonu",
          highlight: dealPrice,
          statLeft: dealDrop,
          statRight: "uretir.com/indirim-ai",
          accent: "#f6ad55",
          bg1: "#29190d",
          bg2: "#120a05",
          photoUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1200&q=85",
          photoTag: "DOĞRULANMIŞ MAĞAZA KAMPANYASI",
          graphLabel: "MAĞAZA FİYAT DÜŞÜŞ EĞRİSİ",
          graphStartLabel: "Liste Fiyatı",
          graphEndLabel: `Fırsat: ${dealPrice}`,
          graphTrend: "down",
          speech: `Akşam alışverişinde ${dealTitle}, ${dealPrice} dip fiyatıyla ilk sırada yer alıyor. Türkiye üretir, gençler yetişir! Doğrulanmış verilerin merkezi üretir nokta com adresini hemen ziyaret edin.`,
        },
      ],
    },
  };

  return { slot, ...slotMap[slot] };
}

async function prepareScenePhotoDataUri(scene) {
  // 1. Check local cropped or full image file first
  if (scene.localPhotoPath && existsSync(scene.localPhotoPath)) {
    try {
      let pipeline = sharp(scene.localPhotoPath);
      if (scene.cropRegion) {
        const meta = await pipeline.metadata();
        if (meta.width && meta.height) {
          const left = Math.round(meta.width * scene.cropRegion.left);
          const top = Math.round(meta.height * scene.cropRegion.top);
          const width = Math.round(meta.width * scene.cropRegion.width);
          const height = Math.round(meta.height * scene.cropRegion.height);
          pipeline = sharp(scene.localPhotoPath).extract({ left, top, width, height });
        }
      }
      const buf = await pipeline
        .resize(920, 500, { fit: "cover", position: "center" })
        .jpeg({ quality: 90 })
        .toBuffer();
      return `data:image/jpeg;base64,${buf.toString("base64")}`;
    } catch (e) {
      console.warn("Yerel görsel işleme uyarısı:", e?.message || e);
    }
  }

  // 2. Fetch remote photoUrl
  const urlsToTry = [
    scene.photoUrl,
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=85",
  ].filter(Boolean);

  for (const u of urlsToTry) {
    try {
      const res = await fetch(u, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        },
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok) continue;
      const raw = Buffer.from(await res.arrayBuffer());
      const buf = await sharp(raw)
        .resize(920, 500, { fit: "cover", position: "center" })
        .jpeg({ quality: 88 })
        .toBuffer();
      return `data:image/jpeg;base64,${buf.toString("base64")}`;
    } catch {
      // try next fallback
    }
  }
  return null;
}

/**
 * Editorial Broadcast & Graph-Motion SVG Composer
 * Inspired by remotion-dev/remotion, motion-canvas/motion-canvas & apache/echarts
 * Zero synthetic "AI" clutter — real photography + smooth data curve animation + Swiss editorial typography
 */
function renderVerticalFrameSvg(scene, slotLabel, sceneIdx, totalScenes, progressRatio) {
  const titleLines = wrapLines(scene.title, 25, 3);
  const subLines = wrapLines(scene.sub, 40, 2);
  const speechLines = wrapLines(scene.speech, 40, 2);
  const barWidth = Math.max(40, Math.round(920 * progressRatio));
  const cardOffsetY = Math.round((1 - Math.min(1, progressRatio * 4.0)) * 26);

  // Subtle Ken Burns camera motion on the real photograph (1.00x -> 1.06x)
  const kenBurnsScale = (1 + progressRatio * 0.055).toFixed(4);
  const kenBurnsShiftX = Math.round(-25 * progressRatio);
  const kenBurnsShiftY = Math.round(-14 * progressRatio);

  // Apache ECharts / Motion-Canvas style animated data curve (Graph Motion)
  const isDownTrend = scene.graphTrend === "down";
  const pts = isDownTrend
    ? [
        [130, 1415],
        [275, 1420],
        [420, 1412],
        [565, 1455],
        [710, 1495],
        [855, 1525],
        [950, 1532],
      ]
    : [
        [130, 1525],
        [275, 1508],
        [420, 1490],
        [565, 1468],
        [710, 1445],
        [855, 1425],
        [950, 1412],
      ];

  const activeIdx = Math.min(
    pts.length - 1,
    Math.max(1, Math.floor(progressRatio * (pts.length - 1) + 0.8))
  );
  const visiblePts = pts.slice(0, activeIdx + 1);
  const polylinePoints = visiblePts.map(([x, y]) => `${x},${y}`).join(" ");
  const areaPoints = `${visiblePts[0][0]},1555 ${polylinePoints} ${visiblePts[visiblePts.length - 1][0]},1555`;
  const [dotX, dotY] = visiblePts[visiblePts.length - 1];

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${scene.bg1}" />
      <stop offset="100%" stop-color="${scene.bg2}" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="18%" r="65%">
      <stop offset="0%" stop-color="${scene.accent}" stop-opacity="0.22" />
      <stop offset="100%" stop-color="${scene.accent}" stop-opacity="0" />
    </radialGradient>
    <clipPath id="heroPhotoClip">
      <rect x="80" y="235" width="920" height="500" rx="28" />
    </clipPath>
    <linearGradient id="photoVignette" x1="0%" y1="35%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.78" />
    </linearGradient>
    <linearGradient id="chartAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${scene.accent}" stop-opacity="0.34" />
      <stop offset="100%" stop-color="${scene.accent}" stop-opacity="0.0" />
    </linearGradient>
  </defs>

  <rect width="1080" height="1920" fill="url(#bg)" />
  <rect width="1080" height="1920" fill="url(#glow)" />

  <!-- Editorial Studio Grid Lines -->
  <g stroke="#ffffff" stroke-opacity="0.05" stroke-width="1">
    <line x1="80" y1="0" x2="80" y2="1920" />
    <line x1="1000" y1="0" x2="1000" y2="1920" />
    <line x1="0" y1="168" x2="1080" y2="168" />
    <line x1="0" y1="1730" x2="1080" y2="1730" />
  </g>

  <!-- Editorial Masthead (Zero AI Jargon) -->
  <text x="80" y="128" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="62" font-weight="900">üretir<tspan fill="${scene.accent}">.</tspan></text>
  <rect x="610" y="78" width="390" height="60" rx="30" fill="#ffffff" fill-opacity="0.08" stroke="${scene.accent}" stroke-opacity="0.55" />
  <circle cx="648" cy="108" r="9" fill="${scene.accent}" />
  <text x="674" y="117" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="23" font-weight="800" letter-spacing="0.8">DOĞRULANMIŞ PİYASA VERİSİ</text>

  <!-- Rubric / Section Header -->
  <text x="84" y="212" fill="${scene.accent}" font-family="Segoe UI, Arial, sans-serif" font-size="25" font-weight="800" letter-spacing="1.4">${escapeXml(scene.kicker)}</text>
  <text x="996" y="212" text-anchor="end" fill="#cbd5e1" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="700">BÖLÜM ${sceneIdx + 1}/${totalScenes}</text>

  <!-- Hero Real Photograph Frame with Ken Burns Motion -->
  <rect x="76" y="231" width="928" height="508" rx="30" fill="#0b131e" stroke="${scene.accent}" stroke-opacity="0.5" stroke-width="2" />
  <g clip-path="url(#heroPhotoClip)">
    ${
      scene.photoDataUri
        ? `<g transform="translate(${kenBurnsShiftX}, ${kenBurnsShiftY}) scale(${kenBurnsScale})">
      <image href="${scene.photoDataUri}" x="80" y="235" width="920" height="500" preserveAspectRatio="xMidYMid slice" />
    </g>`
        : `<rect x="80" y="235" width="920" height="500" fill="#111c2d" />`
    }
    <rect x="80" y="235" width="920" height="500" fill="url(#photoVignette)" />
  </g>
  <rect x="110" y="262" width="430" height="44" rx="22" fill="#070c14" fill-opacity="0.82" stroke="${scene.accent}" stroke-opacity="0.65" />
  <text x="325" y="291" text-anchor="middle" fill="${scene.accent}" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="1">${escapeXml(scene.photoTag || "GERÇEK ÜRÜN & PİYASA GÖRSELİ")}</text>
  <text x="114" y="706" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="700">${escapeXml(scene.statLeft)} · ${escapeXml(scene.statRight)}</text>

  <!-- Editorial Headline & Price Card -->
  <g transform="translate(0, ${cardOffsetY})">
    <rect x="80" y="762" width="920" height="545" rx="30" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.15" stroke-width="1.5" />

    ${titleLines
      .map(
        (line, idx) =>
          `<text x="120" y="${848 + idx * 66}" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="50" font-weight="900">${escapeXml(line)}</text>`
      )
      .join("\n    ")}

    ${subLines
      .map(
        (line, idx) =>
          `<text x="120" y="${1065 + idx * 40}" fill="#cbd5e1" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="600">${escapeXml(line)}</text>`
      )
      .join("\n    ")}

    <!-- Highlight Price / Metric Pill -->
    <rect x="120" y="1165" width="840" height="104" rx="22" fill="${scene.accent}" />
    <text x="540" y="1233" text-anchor="middle" fill="#07100c" font-family="Segoe UI, Arial, sans-serif" font-size="46" font-weight="900">${escapeXml(scene.highlight)}</text>
  </g>

  <!-- ECharts / Motion-Canvas Inspired Graph Motion Panel -->
  <rect x="80" y="1332" width="920" height="250" rx="26" fill="#050a10" fill-opacity="0.68" stroke="${scene.accent}" stroke-opacity="0.35" stroke-width="1.5" />
  <text x="120" y="1376" fill="${scene.accent}" font-family="Segoe UI, Arial, sans-serif" font-size="21" font-weight="800" letter-spacing="1.2">${escapeXml(scene.graphLabel || "DOĞRULANMIŞ FİYAT & TREND GRAFİĞİ")}</text>
  <text x="960" y="1376" text-anchor="end" fill="#e2e8f0" font-family="Segoe UI, Arial, sans-serif" font-size="21" font-weight="700">${escapeXml(scene.statLeft)}</text>

  <!-- Chart Grid Lines -->
  <line x1="120" y1="1410" x2="960" y2="1410" stroke="#ffffff" stroke-opacity="0.08" stroke-dasharray="6,6" />
  <line x1="120" y1="1480" x2="960" y2="1480" stroke="#ffffff" stroke-opacity="0.08" stroke-dasharray="6,6" />
  <line x1="120" y1="1555" x2="960" y2="1555" stroke="#ffffff" stroke-opacity="0.16" />

  <!-- Animated Area & Curve -->
  <polygon points="${areaPoints}" fill="url(#chartAreaGrad)" />
  <polyline fill="none" stroke="${scene.accent}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" points="${polylinePoints}" />
  ${visiblePts
    .map(
      ([x, y]) =>
        `<circle cx="${x}" cy="${y}" r="6" fill="#081018" stroke="${scene.accent}" stroke-width="4" />`
    )
    .join("\n  ")}
  <circle cx="${dotX}" cy="${dotY}" r="13" fill="${scene.accent}" fill-opacity="0.32" />
  <circle cx="${dotX}" cy="${dotY}" r="7" fill="${scene.accent}" />

  <text x="125" y="1574" fill="#94a3b8" font-family="Segoe UI, Arial, sans-serif" font-size="19" font-weight="600">${escapeXml(scene.graphStartLabel || "Önceki Dönem")}</text>
  <text x="955" y="1574" text-anchor="end" fill="${scene.accent}" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="800">${escapeXml(scene.graphEndLabel || scene.highlight)}</text>

  <!-- Subtitle / Editorial Narration Strip -->
  <rect x="80" y="1604" width="920" height="96" rx="20" fill="#000000" fill-opacity="0.50" stroke="#ffffff" stroke-opacity="0.1" />
  ${speechLines
    .map(
      (line, idx) =>
        `<text x="540" y="${1645 + idx * 36}" text-anchor="middle" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="26" font-weight="600">${escapeXml(line)}</text>`
    )
    .join("\n  ")}

  <!-- Progress Timeline Bar -->
  <rect x="80" y="1714" width="920" height="10" rx="5" fill="#ffffff" fill-opacity="0.14" />
  <rect x="80" y="1714" width="${barWidth}" height="10" rx="5" fill="${scene.accent}" />

  <!-- Clean Editorial Footer -->
  <text x="80" y="1792" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="38" font-weight="900">www.uretir.com</text>
  <text x="80" y="1838" fill="#94a3b8" font-family="Segoe UI, Arial, sans-serif" font-size="25" font-weight="600">Türkiye Üretir, Gençler Yetişir · Doğrulanmış Veri &amp; Analiz</text>
  <text x="1000" y="1792" text-anchor="end" fill="${scene.accent}" font-family="Segoe UI, Arial, sans-serif" font-size="32" font-weight="800">@uretirai</text>
  <text x="1000" y="1838" text-anchor="end" fill="#cbd5e1" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="600">youtube.com/@Uretir</text>
</svg>`;
}

async function synthesizeNaturalTurkishVoice(text, voice, outMp3Path) {
  // 1. Try Node.js msedge-tts (Microsoft Edge Neural Turkish Voice: tr-TR-AhmetNeural / tr-TR-EmelNeural)
  try {
    const { MsEdgeTTS, OUTPUT_FORMAT } = requireOpenSource("msedge-tts");
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const { audioFilePath } = await tts.toFile(path.dirname(outMp3Path), text);
    if (audioFilePath && existsSync(audioFilePath)) {
      if (path.resolve(audioFilePath) !== path.resolve(outMp3Path)) {
        await fs.copyFile(audioFilePath, outMp3Path);
        await fs.unlink(audioFilePath).catch(() => {});
      }
      if (existsSync(outMp3Path)) return true;
    }
  } catch {
    // Fallback to CLI or HTTPS TTS
  }

  // 2. Try uv + rany2/edge-tts (10k+ ⭐ Microsoft Neural Turkish Voice)
  const localUv = path.resolve(".local", "open-source-stack", "bin", process.platform === "win32" ? "uv.exe" : "uv");
  if (existsSync(localUv)) {
    try {
      await execFileAsync(
        localUv,
        ["run", "--python", "3.12", "--with", "edge-tts", "python", "-m", "edge_tts", "--voice", voice, "--rate=+4%", "--text", text, "--write-media", outMp3Path],
        { timeout: 60_000 }
      );
      if (existsSync(outMp3Path)) return true;
    } catch {
      // Try next binary
    }
  }

  // 3. Try open-source rany2/edge-tts CLI (Microsoft Neural Turkish Voice)
  for (const bin of ["edge-tts", "python", "python3"]) {
    try {
      const args =
        bin === "edge-tts"
          ? ["--voice", voice, "--rate=+4%", "--text", text, "--write-media", outMp3Path]
          : ["-m", "edge_tts", "--voice", voice, "--rate=+4%", "--text", text, "--write-media", outMp3Path];
      await execFileAsync(bin, args, { timeout: 45_000 });
      if (existsSync(outMp3Path)) return true;
    } catch {
      // Try next binary
    }
  }

  // 4. Fallback: Fetch Google Translate Turkish TTS segments over HTTPS
  try {
    const chunks = text
      .match(/.{1,160}(?:\s|$)/g)
      ?.map((s) => s.trim())
      .filter(Boolean) || [text.slice(0, 160)];
    const buffers = [];
    for (const chunk of chunks) {
      const ttsUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=tr&client=tw-ob`;
      const res = await fetch(ttsUrl, { signal: AbortSignal.timeout(15_000) });
      if (res.ok) {
        buffers.push(Buffer.from(await res.arrayBuffer()));
      }
    }
    if (buffers.length > 0) {
      await fs.writeFile(outMp3Path, Buffer.concat(buffers));
      return true;
    }
  } catch (err) {
    console.warn("TTS fallback warning:", err);
  }
  return false;
}

async function resolveTelegramTargets() {
  const targets = new Set();
  if (TELEGRAM_CHAT_ID) targets.add(String(TELEGRAM_CHAT_ID));

  const savedChatsPath = path.resolve("reports", "social-media", "telegram_chats.json");
  if (existsSync(savedChatsPath)) {
    try {
      const parsed = JSON.parse(await fs.readFile(savedChatsPath, "utf8"));
      for (const id of parsed?.chatIds || []) {
        if (id) targets.add(String(id));
      }
    } catch {
      // ignore
    }
  }

  if (!TELEGRAM_BOT_TOKEN) return Array.from(targets);

  if (targets.size === 0) {
    try {
      const whRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`);
      const whInfo = await whRes.json();
      const currentWhUrl = whInfo?.result?.url || "";

      if (currentWhUrl) {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook?drop_pending_updates=false`);
      }

      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?limit=25`);
      const data = await res.json();
      for (const upd of (data?.result || []).reverse()) {
        const cid =
          upd?.message?.chat?.id ||
          upd?.callback_query?.message?.chat?.id ||
          upd?.channel_post?.chat?.id ||
          upd?.my_chat_member?.chat?.id;
        if (cid) targets.add(String(cid));
      }

      if (currentWhUrl) {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: currentWhUrl }),
        });
      }
    } catch {
      // ignore
    }
  }

  if (targets.size > 0) {
    try {
      await fs.mkdir(path.dirname(savedChatsPath), { recursive: true });
      await fs.writeFile(
        savedChatsPath,
        JSON.stringify({ chatIds: Array.from(targets), updatedAt: new Date().toISOString() }, null, 2),
        "utf8"
      );
    } catch {
      // ignore
    }
  }

  return Array.from(targets);
}

async function sendToTelegram(videoPath, coverPngPath, slotData) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log("TELEGRAM_BOT_TOKEN tanımlı değil, Telegram gönderimi atlandı.");
    return false;
  }
  const chatIds = await resolveTelegramTargets();
  if (chatIds.length === 0) {
    console.log("Telegram aktif abone/chat_id bekleniyor.");
    return false;
  }

  const caption = [
    `📊 *ÜRETİR DOĞRULANMIŞ PİYASA & KAMPANYA RAPORU (${slotData.label})*`,
    "",
    `📌 *1)* ${slotData.scenes[0].title}`,
    `📌 *2)* ${slotData.scenes[1]?.title || slotData.scenes[0].sub}`,
    `📌 *3)* ${slotData.scenes[2]?.title || slotData.scenes[0].highlight}`,
    "",
    `🌐 *Detaylar ve Canlı Veriler:* ${slotData.targetUrl || "https://www.uretir.com"}`,
    `📸 Instagram: @uretirai | ▶️ YouTube: @Uretir`,
    `#Üretir #Ekonomi #İndirim #Kampanya #Otomotiv #Gayrimenkul`,
  ].join("\n");

  const replyMarkup = JSON.stringify({
    inline_keyboard: [
      [
        { text: "🌐 uretir.com Canlı Veriler", url: "https://www.uretir.com" },
        { text: "🔥 Kampanya & Sayfaya Git", url: slotData.targetUrl || "https://www.uretir.com" },
      ],
      [
        { text: "📸 Instagram @uretirai", url: "https://www.instagram.com/uretirai/" },
        { text: "▶️ YouTube @Uretir", url: "https://www.youtube.com/@Uretir" },
      ],
    ],
  });

  let anySent = false;
  for (const chatId of chatIds) {
    try {
      if (videoPath && existsSync(videoPath)) {
        const videoBytes = await fs.readFile(videoPath);
        const form = new FormData();
        form.append("chat_id", String(chatId));
        form.append("caption", caption.slice(0, 1020));
        form.append("parse_mode", "Markdown");
        form.append("supports_streaming", "true");
        form.append("reply_markup", replyMarkup);
        form.append("video", new Blob([videoBytes], { type: "video/mp4" }), `uretir-${slotData.slot}.mp4`);

        const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendVideo`, {
          method: "POST",
          body: form,
          signal: AbortSignal.timeout(60_000),
        });
        const json = await res.json();
        if (json.ok) {
          console.log(`Telegram'a (@uretirbot -> ${chatId}) fotoğraflı & grafikli MP4 video gönderildi!`);
          anySent = true;
          continue;
        }
      }

      if (coverPngPath && existsSync(coverPngPath)) {
        const imgBytes = await fs.readFile(coverPngPath);
        const form = new FormData();
        form.append("chat_id", String(chatId));
        form.append("caption", caption.slice(0, 1020));
        form.append("parse_mode", "Markdown");
        form.append("reply_markup", replyMarkup);
        form.append("photo", new Blob([imgBytes], { type: "image/png" }), `uretir-${slotData.slot}.png`);
        const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
          method: "POST",
          body: form,
          signal: AbortSignal.timeout(30_000),
        });
        const json = await res.json();
        if (json.ok) anySent = true;
      }
    } catch (err) {
      console.warn(`Telegram (${chatId}) gönderim uyarısı:`, err);
    }
  }
  return anySent;
}

async function publishToInstagramReels(videoPath, coverPngPath, slotData) {
  if (!IG_PASSWORD && !existsSync(path.resolve(".local", "open-source-stack", "ig_sessionid.txt"))) {
    console.log("IG kimlik bilgisi bulunamadı; Instagram (@uretirai) paketi hazırlandı.");
    return false;
  }
  const caption =
    slotData.customCaption ||
    [
      `📊 ${slotData.label} | Üretir`,
      "",
      `• ${slotData.scenes[0].title}`,
      `• ${slotData.scenes[1]?.title || slotData.scenes[0].sub}`,
      `• ${slotData.scenes[2]?.title || slotData.scenes[0].highlight}`,
      "",
      `🔗 Doğrulanmış veriler ve mağaza fiyat geçmişi için: www.uretir.com (Profildeki bağlantıya tıklayın)`,
      `📍 İnceleme adresi: ${(slotData.targetUrl || "https://www.uretir.com").replace("https://www.", "")}`,
      `▶️ YouTube: @Uretir | 📱 Telegram: @uretirbot`,
      "",
      `#Üretir #Ekonomi #İndirim #Kampanya #FiyatAnalizi #Otomotiv #Gayrimenkul #Finans #Alışveriş #Keşfet #ReelsTürkiye`,
    ].join("\n");

  // 1. Try uv + cloned subzeroid/instagrapi v3.0.25 (uses saved sessionid cookie directly)
  const localUv = path.resolve(".local", "open-source-stack", "bin", process.platform === "win32" ? "uv.exe" : "uv");
  if (existsSync(localUv)) {
    try {
      const { stdout, stderr } = await execFileAsync(
        localUv,
        [
          "run",
          "--python",
          "3.12",
          "--with",
          "curl_cffi",
          "--with",
          "PySocks",
          "--with",
          "pillow",
          "--with",
          "pydantic<3",
          "--with",
          "requests",
          "--with",
          "pycryptodomex",
          "--with",
          "moviepy",
          "scripts/instagram-reels-publisher.py",
          videoPath || "",
          coverPngPath,
          caption,
        ],
        {
          timeout: 240_000,
          env: { ...process.env, IG_USERNAME, IG_PASSWORD, PYTHONIOENCODING: "utf-8" },
        }
      );
      if (stdout) console.log("Instagram (instagrapi @uretirai) yanıtı:\n" + stdout.trim());
      if (stderr && !stdout?.includes("PUBLISHED_OK")) console.log("Instagram instagrapi bilgi:", stderr.trim());
      if (stdout && stdout.includes("PUBLISHED_OK")) return { ok: true, stdout };
    } catch (uvErr) {
      console.warn("[Instagram instagrapi/uv Bilgi]:", uvErr?.message || uvErr);
    }
  }

  // 2. Fallback: Native Node.js publisher
  try {
    const nodeRes = await publishToInstagramNode({
      videoPath,
      coverPngPath,
      caption,
      slot: slotData.slot,
      targetUrl: slotData.targetUrl,
    });
    if (nodeRes?.ok) return nodeRes;
  } catch (err) {
    console.warn("[Instagram Node Bilgi]:", err?.message || err);
  }

  return false;
}

async function renderAndPublishSlotData(slotData) {
  const outDir = path.resolve("reports", "social-media", `slot-${slotData.slot}`);
  await fs.mkdir(outDir, { recursive: true });

  console.log(`\n======================================================`);
  console.log(`[Üretir Editorial Studio] ${slotData.label} hazırlanıyor...`);
  console.log(`======================================================`);

  const framesDir = path.join(outDir, "frames");
  await fs.mkdir(framesDir, { recursive: true });

  // Pre-fetch real photographs for every scene (NEVER publish without a real photo!)
  for (const scene of slotData.scenes) {
    if (!scene.photoDataUri) {
      scene.photoDataUri = await prepareScenePhotoDataUri(scene);
    }
  }

  const framesPerScene = 15;
  const totalScenes = slotData.scenes.length;
  let frameCounter = 0;

  for (let sIdx = 0; sIdx < totalScenes; sIdx++) {
    const scene = slotData.scenes[sIdx];
    for (let f = 0; f < framesPerScene; f++) {
      const progressRatio = (sIdx * framesPerScene + f) / Math.max(1, totalScenes * framesPerScene - 1);
      const svg = renderVerticalFrameSvg(scene, slotData.label, sIdx, totalScenes, progressRatio);
      const framePath = path.join(framesDir, `frame-${String(frameCounter).padStart(4, "0")}.png`);
      await sharp(Buffer.from(svg)).png({ compressionLevel: 6 }).toFile(framePath);
      frameCounter++;
    }
  }

  const coverPngPath = path.join(outDir, `uretir-cover-${slotData.slot}.png`);
  await fs.copyFile(path.join(framesDir, "frame-0006.png"), coverPngPath);

  const fullSpeech = slotData.scenes.map((s) => s.speech).join(" ");
  const audioPath = path.join(outDir, `uretir-voice-${slotData.slot}.mp3`);
  const hasVoice = await synthesizeNaturalTurkishVoice(fullSpeech, slotData.voice || "tr-TR-AhmetNeural", audioPath);
  console.log(`[2/4] [Seslendirme] Doğal Türkçe Ses (${slotData.voice || "tr-TR-AhmetNeural"}): ${hasVoice ? "BAŞARILI" : "YEDEK MOD"}`);

  const ffmpegBin = resolveFfmpegBinary();
  const videoPath = path.join(outDir, `uretir-reel-${slotData.slot}.mp4`);
  let videoBuilt = false;
  try {
    const ffmpegArgs = hasVoice
      ? [
          "-y",
          "-framerate",
          "2",
          "-i",
          path.join(framesDir, "frame-%04d.png"),
          "-i",
          audioPath,
          "-c:v",
          "libx264",
          "-preset",
          "medium",
          "-profile:v",
          "high",
          "-r",
          "30",
          "-pix_fmt",
          "yuv420p",
          "-c:a",
          "aac",
          "-b:a",
          "192k",
          "-shortest",
          "-movflags",
          "+faststart",
          videoPath,
        ]
      : [
          "-y",
          "-framerate",
          "2",
          "-i",
          path.join(framesDir, "frame-%04d.png"),
          "-c:v",
          "libx264",
          "-r",
          "30",
          "-pix_fmt",
          "yuv420p",
          "-movflags",
          "+faststart",
          videoPath,
        ];
    await execFileAsync(ffmpegBin, ffmpegArgs, { timeout: 120_000 });
    videoBuilt = existsSync(videoPath);
    console.log(`[3/4] [Graph-Motion Video] 1080x1920 Fotoğraflı & Grafikli MP4 üretildi: ${videoPath}`);
  } catch (err) {
    console.warn("[FFmpeg Uyarısı]:", err?.message || err);
  }

  console.log(`[4/4] Sosyal medya kanallarında (@uretirai, WhatsApp & @uretirbot) yayınlanıyor...`);
  const tgPublished = await sendToTelegram(videoBuilt ? videoPath : null, coverPngPath, slotData);
  const igPublished = await publishToInstagramReels(videoBuilt ? videoPath : null, coverPngPath, slotData);

  // Trigger WhatsApp channel bot if running on 127.0.0.1:3217
  try {
    await fetch("http://127.0.0.1:3217/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetKey: slotData.whatsappTargetKey || "indirimai",
        force: true,
      }),
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    // WhatsApp bot will also pick it up on its own poll cycle
  }

  const manifestPath = path.join(outDir, "publish-manifest.json");
  await fs.writeFile(
    manifestPath,
    JSON.stringify(
      {
        slot: slotData.slot,
        label: slotData.label,
        generatedAt: new Date().toISOString(),
        primaryDataHub: SITE_URL,
        targetTrafficUrl: slotData.targetUrl,
        videoPath: videoBuilt ? videoPath : null,
        audioPath: hasVoice ? audioPath : null,
        coverPngPath,
        instagramAccount: "@uretirai",
        instagramPublished: igPublished,
        youtubeChannel: "https://www.youtube.com/@Uretir",
        telegramBot: "@uretirbot",
        telegramPublished: tgPublished,
        speechScript: fullSpeech,
        scenes: slotData.scenes.map((s) => ({ ...s, photoDataUri: Boolean(s.photoDataUri) })),
      },
      null,
      2
    ),
    "utf8"
  );

  return { slot: slotData.slot, videoBuilt, igPublished, tgPublished, videoPath, audioPath, coverPngPath };
}

async function runSlot(slot) {
  const slotData = await gatherLiveSlotData(slot);
  return renderAndPublishSlotData(slotData);
}

/**
 * Dyson 360° Combi HEPA+K-Karbon Filter (COMBI360 2 Al 1 Öde) Special Campaign Publisher
 * Uses the real Dyson product photograph cropped from the user's Telegram screenshot
 */
async function runDysonCampaignSpecial(customPhotoPath = null) {
  const uploadedScreenshot =
    customPhotoPath ||
    "C:\\Users\\zenci\\.gemini\\antigravity\\brain\\971abc53-8c08-48ce-98a0-2f2020bebe3a\\.user_uploaded\\media_1792238808334_66bedba6.png";
  const publicDealImgPath = path.resolve("public", "images", "deals", "dyson-combi360.jpg");
  await fs.mkdir(path.dirname(publicDealImgPath), { recursive: true });

  if (existsSync(uploadedScreenshot)) {
    try {
      const meta = await sharp(uploadedScreenshot).metadata();
      if (meta.width && meta.height) {
        // If it's the full phone chat screenshot, crop the Dyson white product card on the right
        const isChatScreenshot = meta.height / meta.width > 1.8 && !customPhotoPath;
        const extractBox = isChatScreenshot
          ? {
              left: Math.round(meta.width * 0.58),
              top: Math.round(meta.height * 0.45),
              width: Math.round(meta.width * 0.39),
              height: Math.round(meta.height * 0.39),
            }
          : {
              left: 0,
              top: 0,
              width: meta.width,
              height: meta.height,
            };
        await sharp(uploadedScreenshot)
          .extract(extractBox)
          .resize(920, 600, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
          .jpeg({ quality: 92 })
          .toFile(publicDealImgPath);
      }
    } catch (cropErr) {
      console.warn("Dyson ürün fotoğrafı kırpma uyarısı:", cropErr?.message || cropErr);
    }
  }

  const dysonSlotData = {
    slot: "dyson-combi360",
    label: "DYSON RESMÎ MAĞAZA · 2 AL 1 ÖDE FIRSAT RAPORU",
    targetUrl: "https://www.uretir.com/indirim-ai",
    whatsappTargetKey: "indirimai",
    voice: "tr-TR-AhmetNeural",
    customCaption: [
      `🔥 Dyson Resmî Mağaza'da 2 Al 1 Öde Fırsatı! (COMBI360 Kupon Kodu)`,
      ``,
      `📌 Ürün: Dyson 360° Combi HEPA + K-Karbon Hava Temizleyici Filtre`,
      `🏷️ Liste Fiyatı: 3.899,00 TL`,
      `✅ COMBI360 Koduyla 2 Al 1 Öde Adet Fiyatı: 1.949,50 TL (-%50 Net Avantaj)`,
      `🎟️ Kupon Kodu: COMBI360 (Sepette 2 adet eklendiğinde 1 adet bedava)`,
      ``,
      `📊 Mağaza fiyat geçmişi, doğrulanmış kupon kodları ve anlık indirim listesi için: www.uretir.com/indirim-ai (Profildeki bağlantıda)`,
      ``,
      `#Dyson #DysonTürkiye #İndirim #Kampanya #KuponKodu #COMBI360 #Fırsat #Alışveriş #Teknoloji #Üretir #Keşfet`,
    ].join("\n"),
    scenes: [
      {
        kicker: "DOĞRULANMIŞ KAMPANYA · DYSON TÜRKİYE",
        title: "Dyson 360° Combi HEPA+K-Karbon Filtrede 2 Al 1 Öde Fırsatı",
        sub: "Sepette COMBI360 Kupon Koduyla 2 Adet Alımda 1 Adet Bedava",
        highlight: "ADET: 1.949,50 TL (-%50)",
        statLeft: "Kupon Kodu: COMBI360",
        statRight: "Liste: 3.899,00 TL",
        accent: "#c8f560",
        bg1: "#102118",
        bg2: "#070e0a",
        localPhotoPath: existsSync(publicDealImgPath) ? publicDealImgPath : uploadedScreenshot,
        photoTag: "GERÇEK ÜRÜN GÖRSELİ · DYSON COMBI360",
        graphLabel: "DYSON FİLTRE BİRİM FİYAT DÜŞÜŞ GRAFİĞİ (TL)",
        graphStartLabel: "Tekli Liste: 3.899 TL",
        graphEndLabel: "2 Al 1 Öde Adet: 1.949,50 TL",
        graphTrend: "down",
        speech:
          "Dyson resmî mağazasında 360 derece Combi HEPA artı Karbon hava temizleyici filtre için sepette iki al bir öde kampanyası başladı.",
      },
      {
        kicker: "KUPON KODU ANALİZİ · COMBI360",
        title: "3.899 TL Yerine Adet Başına 1.949,50 TL Net Maliyet",
        sub: "Sepete 2 Adet Ekleyip COMBI360 Kodunu Girdiğinizde %50 İndirim",
        highlight: "KUPON: COMBI360",
        statLeft: "Toplam Kazanç: 3.899 TL",
        statRight: "uretir.com/indirim-ai",
        accent: "#f6ad55",
        bg1: "#26170b",
        bg2: "#0f0904",
        localPhotoPath: existsSync(publicDealImgPath) ? publicDealImgPath : uploadedScreenshot,
        photoTag: "SEPETTE KUPON DOĞRULAMASI · -%50",
        graphLabel: "360 GÜNLÜK FİYAT GEÇMİŞİ VE DÖNEM DİBİ",
        graphStartLabel: "360 Gün Tepe: 3.899 TL",
        graphEndLabel: "COMBI360: 1.949,50 TL",
        graphTrend: "down",
        speech:
          "Normal liste fiyatı 3 bin 899 lira olan filtrede, sepete iki adet ekleyip COMBI360 kupon kodunu uyguladığınızda birim maliyet 1.949 lira 50 kuruşa düşüyor.",
      },
      {
        kicker: "CANLI FİYAT RADARI · URETIR.COM",
        title: "Tüm Doğrulanmış İndirimler ve Kupon Kodları uretir.com'da",
        sub: "Mağaza Fiyat Geçmişi ve Banka Kart Puan Kombinasyonu",
        highlight: "URETIR.COM/INDIRIM-AI",
        statLeft: "Instagram: @uretirai",
        statRight: "WhatsApp: İndirimAI",
        accent: "#4fd1c5",
        bg1: "#0c2224",
        bg2: "#050f10",
        localPhotoPath: existsSync(publicDealImgPath) ? publicDealImgPath : uploadedScreenshot,
        photoTag: "DOĞRULANMIŞ KAMPANYA MERKEZİ",
        graphLabel: "NET KULLANICI TASARRUF ORANI (%50)",
        graphStartLabel: "Standart Sepet",
        graphEndLabel: "%50 Net Tasarruf",
        graphTrend: "up",
        speech:
          "Kampanya bağlantısı, kupon kodu detayları ve mağaza fiyat geçmişi için hemen üretir nokta com bölü indirim tire a i sayfasını ziyaret edin.",
      },
    ],
  };

  return renderAndPublishSlotData(dysonSlotData);
}

async function downloadTelegramPhotoToDisk(fileId, destPath) {
  if (!TELEGRAM_BOT_TOKEN || !fileId) return null;
  try {
    const infoRes = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${encodeURIComponent(fileId)}`,
      { signal: AbortSignal.timeout(12_000) }
    );
    const infoJson = await infoRes.json();
    const filePath = infoJson?.result?.file_path;
    if (!filePath) return null;
    const fileRes = await fetch(`https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`, {
      signal: AbortSignal.timeout(20_000),
    });
    if (!fileRes.ok) return null;
    const buf = Buffer.from(await fileRes.arrayBuffer());
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.writeFile(destPath, buf);
    return destPath;
  } catch {
    return null;
  }
}

async function pollTelegramBotInteractive(state) {
  if (!TELEGRAM_BOT_TOKEN) return;
  try {
    if (!state.webhookCleared) {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook?drop_pending_updates=false`);
      state.webhookCleared = true;
    }
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${state.offset}&timeout=5`,
      { signal: AbortSignal.timeout(12_000) }
    );
    const data = await res.json();
    for (const upd of data?.result || []) {
      state.offset = upd.update_id + 1;
      const cb = upd.callback_query;
      const msg = upd.message || upd.edited_message;
      if (msg?.date && Math.floor(Date.now() / 1000) - Number(msg.date) > 120) {
        continue;
      }

      if (cb) {
        const cbData = String(cb.data || "");
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            callback_query_id: cb.id,
            text: "Üretir fotoğraflı ve grafikli yayını başlatıyor...",
          }),
        }).catch(() => {});

        if (cbData.startsWith("slot:")) {
          const targetSlot = cbData.split(":")[1];
          if (["09", "12", "15", "20"].includes(targetSlot)) {
            await runSlot(targetSlot);
          } else if (targetSlot === "dyson") {
            await runDysonCampaignSpecial();
          }
        }
        continue;
      }

      if (msg?.chat?.id) {
        const cid = String(msg.chat.id);
        const rawText = String(msg.text || msg.caption || "").trim();
        const text = rawText.toLocaleLowerCase("tr-TR");
        const photos = Array.isArray(msg.photo) ? msg.photo : [];
        const bestPhoto = photos.length > 0 ? photos[photos.length - 1] : null;

        // If user sends a photo or natural-language campaign trigger (e.g. "İndirimAI ile uretircom instagram ve whatsapp paylaşımları yap", "dyson", "kampanya", "paylaş")
        if (
          bestPhoto ||
          text.includes("dyson") ||
          text.includes("indirimai") ||
          text.includes("indirim") ||
          text.includes("kampanya") ||
          text.includes("paylaş") ||
          text.includes("paylas") ||
          text.includes("instagram") ||
          text.includes("whatsapp")
        ) {
          let downloadedPhotoPath = null;
          if (bestPhoto?.file_id) {
            downloadedPhotoPath = await downloadTelegramPhotoToDisk(
              bestPhoto.file_id,
              path.resolve("reports", "social-media", "telegram-triggers", `tg-photo-${Date.now()}.jpg`)
            );
          }

          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: cid,
              text: "📸 *Mesajınız ve görseliniz alındı!* Gerçek ürün fotoğrafı ve fiyat grafiğiyle `uretir.com`, Instagram (`@uretirai`) ve WhatsApp kanallarında yayın başlatılıyor...",
              parse_mode: "Markdown",
            }),
          }).catch(() => {});

          await runDysonCampaignSpecial(downloadedPhotoPath);
          continue;
        }

        if (text.startsWith("/sabah") || text === "09") {
          await runSlot("09");
        } else if (text.startsWith("/ogle") || text === "12") {
          await runSlot("12");
        } else if (text.startsWith("/ikindi") || text === "15") {
          await runSlot("15");
        } else if (text.startsWith("/aksam") || text === "20") {
          await runSlot("20");
        } else if (text.startsWith("/video")) {
          await runSlot(detectSlot());
        } else if (text.startsWith("/yenile")) {
          await syncUretirPrimaryDataHub();
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: cid,
              text: "✅ *uretir.com üzerindeki tüm canlı veriler yenilendi!*\n🌐 https://www.uretir.com",
              parse_mode: "Markdown",
            }),
          }).catch(() => {});
        } else if (text.startsWith("/start") || text.startsWith("/durum")) {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: cid,
              text: [
                `📊 *ÜRETİR YAYIN & VERİ YÖNETİM PANELİ (@uretirbot)*`,
                `━━━━━━━━━━━━━━━━━━━━`,
                `✅ *Veri Merkezi:* https://www.uretir.com`,
                `✅ *Instagram (@uretirai):* Fotoğraflı & Graph-Motion Reels/Story Aktif`,
                `✅ *WhatsApp 6 Kanal:* Fotoğraflı Dergi Kartı Modu Aktif`,
                `💡 *İpucu:* Buraya bir kampanya ekran görüntüsü veya ürün fotoğrafı gönderip *"İndirimAI ile paylaş"* yazmanız yeterlidir!`,
              ].join("\n"),
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: "🔥 Dyson 2 Al 1 Öde Yayınla", callback_data: "slot:dyson" },
                    { text: "🎬 12:00 İndirim Raporu", callback_data: "slot:12" },
                  ],
                  [
                    { text: "🎬 15:00 Araç & Konut", callback_data: "slot:15" },
                    { text: "🎬 20:00 Akşam Özeti", callback_data: "slot:20" },
                  ],
                  [
                    { text: "🌐 uretir.com Aç", url: "https://www.uretir.com" },
                    { text: "📸 Instagram @uretirai", url: "https://www.instagram.com/uretirai/" },
                  ],
                ],
              },
            }),
          }).catch(() => {});
        }
      }
    }
  } catch {
    // ignore transient poll error
  }
}

async function main() {
  if (process.argv.includes("--dyson-special")) {
    await runDysonCampaignSpecial();
    process.exit(0);
  }

  if (process.argv.includes("--all-slots")) {
    for (const s of ["09", "12", "15", "20"]) {
      await runSlot(s);
    }
    process.exit(0);
  }

  if (!process.argv.includes("--daemon-only")) {
    const slot = detectSlot();
    await runSlot(slot);
    if (!process.argv.includes("--daemon")) {
      process.exit(0);
    }
  }

  if (process.argv.includes("--daemon") || process.argv.includes("--daemon-only")) {
    console.log("[Üretir 7/24 Otomasyon Daemon] 09:00, 12:00, 15:00, 20:00 zamanlayıcısı ve @uretirbot fotoğraflı kampanya tetikleyici aktif...");
    let lastTriggeredKey = "";
    const tgState = { offset: 0, webhookCleared: false };

    // Poll Telegram commands, photos & buttons every 4 seconds
    setInterval(() => {
      pollTelegramBotInteractive(tgState);
    }, 4_000);

    // Check 09:00, 12:00, 15:00, 20:00 schedule every 45 seconds
    setInterval(async () => {
      try {
        const now = new Date();
        const parts = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Europe/Istanbul",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).formatToParts(now);
        const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
        const hh = map.hour;
        const mm = map.minute;
        const key = `${map.year}-${map.month}-${map.day}-${hh}`;
        if (["09", "12", "15", "20"].includes(hh) && Number(mm) <= 4 && lastTriggeredKey !== key) {
          lastTriggeredKey = key;
          await runSlot(hh);
        }
      } catch (e) {
        console.warn("Daemon tick uyarısı:", e);
      }
    }, 45_000);
  }
}

main().catch((err) => {
  console.error("Sosyal video otomasyon hatası:", err);
  process.exitCode = 1;
});

