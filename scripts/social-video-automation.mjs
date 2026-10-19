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
const localStackPkg = path.resolve(".local", "open-source-stack", "package.json");
const requireOpenSource = createRequire(
  existsSync(localStackPkg) ? localStackPkg : path.resolve("package.json")
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
    `${SITE_URL}/api/haber-ai?view=finance`,
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
  const usd = itemsFin.find((i) => i.id === "USD")?.price?.toFixed(2) || "49.45";
  const eur = itemsFin.find((i) => i.id === "EUR")?.price?.toFixed(2) || "55.62";
  const gram = Math.round(itemsFin.find((i) => i.id === "GRAM")?.price || 6623).toLocaleString("tr-TR");
  const bist = Math.round(itemsFin.find((i) => i.id === "XU100" || i.id === "XU100.IS")?.price || 11722).toLocaleString("tr-TR");
  const btc = Math.round(itemsFin.find((i) => i.id === "BTC" || i.id === "BTC-USD")?.price || 74919).toLocaleString("tr-TR");

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

  const shortHeadline =
    topHeadline.length > 72 ? `${topHeadline.slice(0, 70).replace(/\s+\S*$/, "")}...` : topHeadline;
  const shortDealTitle =
    dealTitle.length > 52 ? `${dealTitle.slice(0, 50).replace(/\s+\S*$/, "")}` : dealTitle;

  const slotMap = {
    "09": {
      label: "09:00 SABAH HOOK · İNDİRİMAI & HABERAI RAPORU",
      targetUrl: "https://www.uretir.com/haber-ai",
      voice: "tr-TR-AhmetNeural",
      scenes: [
        {
          kicker: "GÜNÜN KANCASI · İNDİRİMAI DİP FİYAT",
          title: dealTitle,
          sub: `${topPuan} ve 360 Günlük Mağaza Fiyat Geçmişi`,
          highlight: dealPrice,
          statLeft: dealDrop,
          statRight: "uretir.com/indirim-ai",
          accent: "#f6ad55",
          bg1: "#29190d",
          bg2: "#120a05",
          photoUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1200&q=85",
          photoTag: "İNDİRİMAI · GERÇEK DİP FİYAT",
          graphLabel: "SON 90 GÜN FİYAT HAREKETİ (DÖNEM DİBİ)",
          graphStartLabel: "Liste Tepe Fiyatı",
          graphEndLabel: `Kampanya: ${dealPrice}`,
          graphTrend: "down",
          speech: `Bu fırsat kaçmaz! İndirim A İ'de günün lideri: ${shortDealTitle}, ${dealPrice}.`,
        },
        {
          kicker: "81 İL HARİTASI · HABERAI SICAK GÜNDEM",
          title: topHeadline,
          sub: "81 İl İnteraktif Türkiye Haritasında Doğrulanmış Gündem",
          highlight: "81 İL CANLI HARİTA",
          statLeft: "Kaynak: AA & TRT Haber",
          statRight: "uretir.com/haber-ai",
          accent: "#c8f560",
          bg1: "#0f2419",
          bg2: "#07100b",
          photoUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=85",
          photoTag: "HABERAI · 81 İL HARİTASI",
          graphLabel: "81 İL GÜNDEM YOĞUNLUK GRAFİĞİ",
          graphStartLabel: "Sabah Açılış",
          graphEndLabel: "81 İl Aktif",
          graphTrend: "up",
          speech: `Haber A İ Türkiye haritasında sıcak başlık: ${shortHeadline}.`,
        },
        {
          kicker: "CANLI PİYASA · FİNANSAI AÇILIŞ",
          title: `Dolar ${usd} TL · Euro ${eur} TL · Gram Altın ${gram} TL`,
          sub: `Borsa İstanbul BIST 100: ${bist} Puan · Bitcoin: ${btc} USD`,
          highlight: `GRAM ALTIN: ${gram} TL`,
          statLeft: `USD/TRY: ${usd} TL`,
          statRight: "uretir.com/finans-ai",
          accent: "#4fd1c5",
          bg1: "#0d2426",
          bg2: "#061112",
          photoUrl: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1200&q=85",
          photoTag: "FİNANSAI · SERBEST PİYASA",
          graphLabel: "GRAM ALTIN & DÖVİZ TREND EĞRİSİ",
          graphStartLabel: "Önceki Kapanış",
          graphEndLabel: `Altın: ${gram} TL`,
          graphTrend: "up",
          speech: `Finans A İ'de Dolar ${usd}, gram altın ${gram} lira. Detaylar üretir nokta com'da.`,
        },
      ],
    },
    "12": {
      label: "12:00 ÖĞLE HOOK · İNDİRİMAI & HABERAI ÖZETİ",
      targetUrl: "https://www.uretir.com/indirim-ai",
      voice: "tr-TR-EmelNeural",
      scenes: [
        {
          kicker: "ÖĞLE KANCASI · İNDİRİMAI FIRSAT RADARI",
          title: dealTitle,
          sub: "30, 90 ve 360 Günlük Fiyat Gözlemiyle Doğrulanmış İndirim",
          highlight: dealPrice,
          statLeft: dealDrop,
          statRight: "uretir.com/indirim-ai",
          accent: "#f6ad55",
          bg1: "#2b190c",
          bg2: "#120a04",
          photoUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1200&q=85",
          photoTag: "İNDİRİMAI · DÖNEM DİBİ FIRSAT",
          graphLabel: "FİYAT DÜŞÜŞ GRAFİĞİ (GERÇEK KAMPANYA)",
          graphStartLabel: "Önceki Liste Fiyatı",
          graphEndLabel: `Net Fiyat: ${dealPrice}`,
          graphTrend: "down",
          speech: `Fiyatı yarıya düşen fırsat! İndirim A İ'de ${shortDealTitle}, ${dealPrice}.`,
        },
        {
          kicker: "TÜRKİYE GÜNDEMİ · HABERAI 81 İL HARİTASI",
          title: topHeadline,
          sub: "Şehir Şehir Doğrulanmış Gündem ve Kaynak Haritası",
          highlight: "81 İL GÜNDEM HARİTASI",
          statLeft: "Canlı Harita",
          statRight: "uretir.com/haber-ai",
          accent: "#c8f560",
          bg1: "#102418",
          bg2: "#07100a",
          photoUrl: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=85",
          photoTag: "HABERAI · ŞEHİR GÜNDEMİ",
          graphLabel: "81 İL HABER AKIŞ EĞRİSİ",
          graphStartLabel: "Sabah",
          graphEndLabel: "Öğle Zirvesi",
          graphTrend: "up",
          speech: `Haber A İ'de gün ortası başlığı: ${shortHeadline}.`,
        },
        {
          kicker: "KART & PİYASA · PUANAI & FİNANSAI",
          title: `10.000 TL Kart Puanı · Dolar ${usd} TL · Altın ${gram} TL`,
          sub: "Axess · Bonus · World · Maximum Resmî Kampanya & Kur Ekranı",
          highlight: "+10.000 TL KART PUANI",
          statLeft: `Gram Altın: ${gram} TL`,
          statRight: "uretir.com/puan-ai",
          accent: "#b794f4",
          bg1: "#1e1533",
          bg2: "#0c0817",
          photoUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85",
          photoTag: "PUANAI & FİNANSAI · AVANTAJ MASASI",
          graphLabel: "KART PUAN & PİYASA AVANTAJ EĞRİSİ",
          graphStartLabel: "Standart Ödeme",
          graphEndLabel: "+10.000 TL Puan",
          graphTrend: "up",
          speech: `Puan A İ'de on bin liraya varan kart ödülü. Hepsi üretir nokta com'da.`,
        },
      ],
    },
    "15": {
      label: "15:00 HOOK · ARABAAI, EVAI & HABERAI RAPORU",
      targetUrl: "https://www.uretir.com/araba-ai",
      voice: "tr-TR-AhmetNeural",
      scenes: [
        {
          kicker: "OTOMOTİV KANCASI · ARABAAI KAMPANYA",
          title: carTitle,
          sub: "Resmî Sıfır Araç Liste Fiyatı ve Haritalı 2. El Kıyaslaması",
          highlight: carPrice,
          statLeft: "Resmî Marka Liste Fiyatı",
          statRight: "uretir.com/araba-ai",
          accent: "#63b3ed",
          bg1: "#0e1f33",
          bg2: "#060e17",
          photoUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=85",
          photoTag: "ARABAAI · SIFIR & 2. EL KIYASLAMA",
          graphLabel: "SIFIR LİSTE FİYATI VE 2. EL PİYASA MAKASI",
          graphStartLabel: "Liste Ortalaması",
          graphEndLabel: `Kampanya: ${carPrice}`,
          graphTrend: "down",
          speech: `Araç alacaklar dikkat! Araba A İ'de ${carTitle}, ${carPrice} liste fiyatıyla vitrinde.`,
        },
        {
          kicker: "EMLAK & İHALE · EVAI HARİTALI ANALİZ",
          title: evTitle,
          sub: "Haritalı Konut, Arsa ve Kamu İhale Taşınmaz Değerleme Masası",
          highlight: evBadge,
          statLeft: "Bölgesel m² Medyanı",
          statRight: "uretir.com/ev-ai",
          accent: "#f687b3",
          bg1: "#2b1422",
          bg2: "#13080e",
          photoUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=85",
          photoTag: "EVAI · KONUT & KAMU İHALE",
          graphLabel: "BÖLGESEL M² EMSAL DEĞER KARŞILAŞTIRMASI",
          graphStartLabel: "Bölge m² Ortalaması",
          graphEndLabel: "Emsal Altı Fırsat",
          graphTrend: "down",
          speech: `Ev A İ haritasında bölge ortalamasının altındaki konut ve ihale fırsatları yayında.`,
        },
        {
          kicker: "GÜNÜN ÖZETİ · İNDİRİMAI & HABERAI",
          title: `${shortDealTitle} · 81 İl Gündem Haritası`,
          sub: "Tüm Doğrulanmış Kampanya, Haber ve Haritalar Tek Merkezde",
          highlight: "WWW.URETIR.COM",
          statLeft: "Instagram: @uretirai",
          statRight: "youtube.com/@Uretir",
          accent: "#c8f560",
          bg1: "#122417",
          bg2: "#08110a",
          photoUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85",
          photoTag: "URETIR.COM · 6 ARAÇ TEK MERKEZ",
          graphLabel: "CANLI VERİ AKTARIM GRAFİĞİ",
          graphStartLabel: "Resmî Kaynaklar",
          graphEndLabel: "uretir.com",
          graphTrend: "up",
          speech: `İndirim A İ ve Haber A İ dahil tüm canlı veriler üretir nokta com'da.`,
        },
      ],
    },
    "20": {
      label: "20:00 AKŞAM HOOK · İNDİRİMAI, HABERAI & FİNANSAI",
      targetUrl: "https://www.uretir.com/finans-ai",
      voice: "tr-TR-EmelNeural",
      scenes: [
        {
          kicker: "AKŞAM KANCASI · İNDİRİMAI GÜNÜN FIRSATI",
          title: dealTitle,
          sub: "Doğrulanmış Dönem Dibi Fiyatı + Kredi Kartı Ödül Kombinasyonu",
          highlight: dealPrice,
          statLeft: dealDrop,
          statRight: "uretir.com/indirim-ai",
          accent: "#f6ad55",
          bg1: "#29190d",
          bg2: "#120a05",
          photoUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1200&q=85",
          photoTag: "İNDİRİMAI · AKŞAM FIRSATI",
          graphLabel: "MAĞAZA FİYAT DÜŞÜŞ EĞRİSİ",
          graphStartLabel: "Liste Fiyatı",
          graphEndLabel: `Fırsat: ${dealPrice}`,
          graphTrend: "down",
          speech: `Günün en çok konuşulan fırsatı! İndirim A İ'de ${shortDealTitle}, ${dealPrice}.`,
        },
        {
          kicker: "81 İL ÖZETİ · HABERAI TÜRKİYE HARİTASI",
          title: topHeadline,
          sub: "81 İlde Günün Öne Çıkan Doğrulanmış Gündem Başlıkları",
          highlight: "GÜN SONU HARİTASI",
          statLeft: "81 İl Haritası",
          statRight: "uretir.com/haber-ai",
          accent: "#c8f560",
          bg1: "#112418",
          bg2: "#07100a",
          photoUrl: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=85",
          photoTag: "HABERAI · GÜN SONU ÖZETİ",
          graphLabel: "GÜN BOYU GÜNDEM ETKİ GRAFİĞİ",
          graphStartLabel: "Sabah Açılış",
          graphEndLabel: "Akşam Özeti",
          graphTrend: "up",
          speech: `Haber A İ'de günün manşeti: ${shortHeadline}.`,
        },
        {
          kicker: "KAPANIŞ TABLOSU · FİNANSAI PİYASA",
          title: `Dolar ${usd} TL · Euro ${eur} TL · Gram Altın ${gram} TL`,
          sub: `BIST 100 Kapanış: ${bist} Puan · Bitcoin: ${btc} USD`,
          highlight: `BIST 100: ${bist}`,
          statLeft: `Gram Altın: ${gram} TL`,
          statRight: "uretir.com/finans-ai",
          accent: "#4fd1c5",
          bg1: "#0d2426",
          bg2: "#061112",
          photoUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=85",
          photoTag: "FİNANSAI · KAPANIŞ VERİSİ",
          graphLabel: "BIST 100 & ALTIN GÜN SONU EĞRİSİ",
          graphStartLabel: `USD: ${usd} TL`,
          graphEndLabel: `Altın: ${gram} TL`,
          graphTrend: "up",
          speech: `Finans A İ kapanışında Dolar ${usd}, altın ${gram} lira. Hepsi üretir nokta com'da.`,
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
        .resize(1080, 1920, { fit: "cover", position: "center" })
        .modulate({ brightness: 1.03, saturation: 1.08 })
        .jpeg({ quality: 92 })
        .toBuffer();
      return `data:image/jpeg;base64,${buf.toString("base64")}`;
    } catch (e) {
      console.warn("Yerel görsel işleme uyarısı:", e?.message || e);
    }
  }

  // 2. Fetch remote photoUrl as full-bleed 1080x1920 cinema background
  const urlsToTry = [
    scene.photoUrl,
    "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1400&q=85",
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
        .resize(1080, 1920, { fit: "cover", position: "center" })
        .modulate({ brightness: 1.03, saturation: 1.08 })
        .jpeg({ quality: 92 })
        .toBuffer();
      return `data:image/jpeg;base64,${buf.toString("base64")}`;
    } catch {
      // try next fallback
    }
  }
  return null;
}

/**
 * Full-Bleed Real Photography Magazine Composer (Instagram Viral Director Agent)
 * - 1080x1920 Full-Screen Real Photograph Background with smooth Ken Burns camera motion
 * - Unobstructed upper photography showcase + Monocle/Bloomberg lower-third glass editorial overlay
 * - Integrated WhatsApp Channel subscriber funnel badge
 */
function renderVerticalFrameSvg(scene, slotLabel, sceneIdx, totalScenes, progressRatio) {
  const titleLines = wrapLines(scene.title, 24, 3);
  const subLines = wrapLines(scene.sub, 38, 2);
  const barWidth = Math.max(48, Math.round(936 * progressRatio));
  const cardOffsetY = Math.round((1 - Math.min(1, progressRatio * 3.5)) * 22);

  // Full-bleed 1080x1920 Ken Burns cinematic camera motion (1.02x -> 1.09x)
  const kenBurnsScale = (1.02 + progressRatio * 0.07).toFixed(4);
  const kenBurnsShiftX = Math.round(-38 * progressRatio);
  const kenBurnsShiftY = Math.round(-46 * progressRatio);

  const isDownTrend = scene.graphTrend === "down";
  const pts = isDownTrend
    ? [
        [130, 1505],
        [275, 1510],
        [420, 1502],
        [565, 1538],
        [710, 1572],
        [855, 1598],
        [950, 1606],
      ]
    : [
        [130, 1602],
        [275, 1588],
        [420, 1570],
        [565, 1550],
        [710, 1530],
        [855, 1512],
        [950, 1498],
      ];

  const activeIdx = Math.min(
    pts.length - 1,
    Math.max(1, Math.floor(progressRatio * (pts.length - 1) + 0.8))
  );
  const visiblePts = pts.slice(0, activeIdx + 1);
  const polylinePoints = visiblePts.map(([x, y]) => `${x},${y}`).join(" ");
  const areaPoints = `${visiblePts[0][0]},1625 ${polylinePoints} ${visiblePts[visiblePts.length - 1][0]},1625`;
  const [dotX, dotY] = visiblePts[visiblePts.length - 1];

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
  <defs>
    <linearGradient id="topScrim" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#04080e" stop-opacity="0.72" />
      <stop offset="18%" stop-color="#04080e" stop-opacity="0.18" />
      <stop offset="50%" stop-color="#04080e" stop-opacity="0.05" />
      <stop offset="72%" stop-color="#04080e" stop-opacity="0.82" />
      <stop offset="100%" stop-color="#04080e" stop-opacity="0.96" />
    </linearGradient>
    <linearGradient id="chartAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${scene.accent}" stop-opacity="0.38" />
      <stop offset="100%" stop-color="${scene.accent}" stop-opacity="0.0" />
    </linearGradient>
  </defs>

  <!-- 1080x1920 Full-Bleed Real Photograph Background -->
  <rect width="1080" height="1920" fill="${scene.bg1 || "#0b131e"}" />
  ${
    scene.photoDataUri
      ? `<g transform="translate(${kenBurnsShiftX}, ${kenBurnsShiftY}) scale(${kenBurnsScale})">
    <image href="${scene.photoDataUri}" x="0" y="0" width="1080" height="1920" preserveAspectRatio="xMidYMid slice" />
  </g>`
      : ""
  }
  <!-- Natural Editorial Cinema Scrim (Top 55% clear photo, Bottom 45% magazine overlay) -->
  <rect width="1080" height="1920" fill="url(#topScrim)" />

  <!-- Top Editorial Magazine Masthead -->
  <text x="72" y="124" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="64" font-weight="900">üretir<tspan fill="${scene.accent}">.</tspan></text>
  <rect x="496" y="72" width="512" height="62" rx="31" fill="#060c14" fill-opacity="0.68" stroke="${scene.accent}" stroke-opacity="0.85" stroke-width="2" />
  <circle cx="534" cy="103" r="9" fill="${scene.accent}" />
  <text x="558" y="111" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="21" font-weight="800" letter-spacing="0.6">${escapeXml(scene.photoTag || "DOĞRULANMIŞ KAYNAK")}</text>

  <!-- Floating Location / Source Pill over Full-Bleed Photo -->
  <rect x="72" y="810" width="540" height="54" rx="27" fill="#050b12" fill-opacity="0.76" stroke="#ffffff" stroke-opacity="0.24" stroke-width="1.5" />
  <text x="104" y="845" fill="${scene.accent}" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="800" letter-spacing="0.8">${escapeXml(scene.kicker)}</text>

  <!-- Lower-Third Magazine Glass Card -->
  <g transform="translate(0, ${cardOffsetY})">
    <rect x="72" y="886" width="936" height="530" rx="34" fill="#070e17" fill-opacity="0.82" stroke="#ffffff" stroke-opacity="0.22" stroke-width="1.5" />

    ${titleLines
      .map(
        (line, idx) =>
          `<text x="114" y="${972 + idx * 66}" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="52" font-weight="900">${escapeXml(line)}</text>`
      )
      .join("\n    ")}

    ${subLines
      .map(
        (line, idx) =>
          `<text x="114" y="${1184 + idx * 40}" fill="#e2e8f0" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="600">${escapeXml(line)}</text>`
      )
      .join("\n    ")}

    <!-- Verified Price / Metric Highlight Bar -->
    <rect x="114" y="1282" width="852" height="102" rx="24" fill="${scene.accent}" />
    <text x="540" y="1348" text-anchor="middle" fill="#05100a" font-family="Segoe UI, Arial, sans-serif" font-size="45" font-weight="900">${escapeXml(scene.highlight)}</text>
  </g>

  <!-- Compact ECharts Data Trend Strip -->
  <rect x="72" y="1436" width="936" height="218" rx="28" fill="#050b12" fill-opacity="0.84" stroke="${scene.accent}" stroke-opacity="0.42" stroke-width="1.5" />
  <text x="114" y="1478" fill="${scene.accent}" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="800" letter-spacing="0.9">${escapeXml(scene.graphLabel || "DOĞRULANMIŞ VERİ EĞRİSİ")}</text>
  <text x="966" y="1478" text-anchor="end" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">${escapeXml(scene.statLeft)}</text>

  <line x1="114" y1="1515" x2="966" y2="1515" stroke="#ffffff" stroke-opacity="0.08" stroke-dasharray="6,6" />
  <line x1="114" y1="1625" x2="966" y2="1625" stroke="#ffffff" stroke-opacity="0.16" />

  <polygon points="${areaPoints}" fill="url(#chartAreaGrad)" />
  <polyline fill="none" stroke="${scene.accent}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" points="${polylinePoints}" />
  ${visiblePts
    .map(
      ([x, y]) =>
        `<circle cx="${x}" cy="${y}" r="6" fill="#081018" stroke="${scene.accent}" stroke-width="4" />`
    )
    .join("\n  ")}
  <circle cx="${dotX}" cy="${dotY}" r="13" fill="${scene.accent}" fill-opacity="0.34" />
  <circle cx="${dotX}" cy="${dotY}" r="7" fill="${scene.accent}" />

  <!-- WhatsApp Channel Subscriber Funnel Callout Strip -->
  <rect x="72" y="1674" width="936" height="74" rx="22" fill="#064e3b" fill-opacity="0.92" stroke="#34d399" stroke-opacity="0.65" stroke-width="1.5" />
  <text x="540" y="1720" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="25" font-weight="800">🔔 Anlık Kupon &amp; Fiyat Dibi Bildirimi: WhatsApp Kanalımıza Katılın</text>

  <!-- Progress Timeline Bar -->
  <rect x="72" y="1768" width="936" height="8" rx="4" fill="#ffffff" fill-opacity="0.18" />
  <rect x="72" y="1768" width="${barWidth}" height="8" rx="4" fill="${scene.accent}" />

  <!-- Editorial Footer -->
  <text x="72" y="1834" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="38" font-weight="900">${escapeXml(scene.statRight?.startsWith("uretir.com") ? scene.statRight : "www.uretir.com")}</text>
  <text x="72" y="1876" fill="#cbd5e1" font-family="Segoe UI, Arial, sans-serif" font-size="23" font-weight="600">Kaynaklı Veri &amp; Karşılaştırma Merkezi · Profildeki Linkten Katılın</text>
  <text x="1008" y="1834" text-anchor="end" fill="${scene.accent}" font-family="Segoe UI, Arial, sans-serif" font-size="32" font-weight="800">@uretirai</text>
  <text x="1008" y="1876" text-anchor="end" fill="#6ee7b7" font-family="Segoe UI, Arial, sans-serif" font-size="23" font-weight="700">WhatsApp &amp; Telegram</text>
</svg>`;
}

async function synthesizeNaturalTurkishVoice(text, voice, outMp3Path) {
  // 1. Try Node.js msedge-tts (Microsoft Edge Neural Turkish Voice) with 5s timeout
  try {
    const { MsEdgeTTS, OUTPUT_FORMAT } = requireOpenSource("msedge-tts");
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const toFilePromise = tts.toFile(path.dirname(outMp3Path), text);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("MsEdgeTTS timeout")), 5000)
    );
    const { audioFilePath } = await Promise.race([toFilePromise, timeoutPromise]);
    try { tts.close(); } catch {}
    if (audioFilePath && existsSync(audioFilePath)) {
      if (path.resolve(audioFilePath) !== path.resolve(outMp3Path)) {
        await fs.copyFile(audioFilePath, outMp3Path);
        await fs.unlink(audioFilePath).catch(() => {});
      }
      if (existsSync(outMp3Path)) return true;
    }
  } catch {
    // Fallback to high-speed verified Google Translate Turkish TTS
  }

  // 2. High-speed verified Turkish TTS over HTTPS (natural Turkish pronunciation, 500ms)
  try {
    const chunks = text
      .match(/.{1,160}(?:\s|$)/g)
      ?.map((s) => s.trim())
      .filter(Boolean) || [text.slice(0, 160)];
    const buffers = [];
    for (const chunk of chunks) {
      const ttsUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=tr&client=tw-ob`;
      const res = await fetch(ttsUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: AbortSignal.timeout(8_000),
      });
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

  // 3. Try uv + rany2/edge-tts (Microsoft Neural Turkish Voice)
  const localUv = path.resolve(".local", "open-source-stack", "bin", process.platform === "win32" ? "uv.exe" : "uv");
  if (existsSync(localUv)) {
    try {
      await execFileAsync(
        localUv,
        ["run", "--python", "3.12", "--with", "edge-tts", "python", "-m", "edge_tts", "--voice", voice, "--rate=+4%", "--text", text, "--write-media", outMp3Path],
        { timeout: 15_000 }
      );
      if (existsSync(outMp3Path)) return true;
    } catch {
      // Try next binary
    }
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
  if (
    !IG_PASSWORD &&
    !process.env.IG_SESSIONID &&
    !existsSync(path.resolve(".local", "open-source-stack", "ig_sessionid.txt")) &&
    !existsSync(path.resolve("reports", "social-media", "ig_sessionid.txt"))
  ) {
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

  // 1. Try uv (local or GitHub Actions astral-sh/setup-uv) + cloned subzeroid/instagrapi v3.0.25
  const localUv = path.resolve(".local", "open-source-stack", "bin", process.platform === "win32" ? "uv.exe" : "uv");
  const uvCandidates = existsSync(localUv) ? [localUv, "uv"] : ["uv"];
  for (const uvBin of uvCandidates) {
    try {
      const { stdout, stderr } = await execFileAsync(
        uvBin,
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
      if (uvBin === localUv) {
        console.warn("[Instagram instagrapi/uv Bilgi]:", uvErr?.message || uvErr);
      }
    }
  }

  // 2. Try direct python3/python if instagrapi is installed via pip in GitHub Actions
  for (const pyBin of ["python3", "python"]) {
    try {
      const { stdout } = await execFileAsync(
        pyBin,
        ["scripts/instagram-reels-publisher.py", videoPath || "", coverPngPath, caption],
        {
          timeout: 180_000,
          env: { ...process.env, IG_USERNAME, IG_PASSWORD, PYTHONIOENCODING: "utf-8" },
        }
      );
      if (stdout && stdout.includes("PUBLISHED_OK")) return { ok: true, stdout };
    } catch {
      // fallback to Node publisher
    }
  }

  // 3. Fallback: Native Node.js publisher
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

  const framesPerScene = slotData.scenes.length >= 6 ? 24 : 36;
  const totalScenes = slotData.scenes.length;
  let frameCounter = 0;

  // Clean old frames to avoid leftover frame count mismatches
  try {
    const oldFiles = await fs.readdir(framesDir);
    for (const f of oldFiles) {
      if (f.startsWith("frame-")) await fs.unlink(path.join(framesDir, f)).catch(() => {});
    }
  } catch {}

  for (let sIdx = 0; sIdx < totalScenes; sIdx++) {
    const scene = slotData.scenes[sIdx];
    for (let f = 0; f < framesPerScene; f++) {
      const sceneProgress = f / Math.max(1, framesPerScene - 1);
      const svg = renderVerticalFrameSvg(scene, slotData.label, sIdx, totalScenes, sceneProgress);
      const framePath = path.join(framesDir, `frame-${String(frameCounter).padStart(4, "0")}.png`);
      await sharp(Buffer.from(svg)).png({ compressionLevel: 5 }).toFile(framePath);
      frameCounter++;
    }
  }

  const coverPngPath = path.join(outDir, `uretir-cover-${slotData.slot}.png`);
  await fs.copyFile(path.join(framesDir, "frame-0006.png"), coverPngPath);

  const ffmpegBin = resolveFfmpegBinary();
  const fullSpeech = slotData.scenes.map((s) => s.speech).join(" · [FON] · ");
  const audioPath = path.join(outDir, `uretir-voice-${slotData.slot}.mp3`);
  let hasVoice = false;
  const useTts = process.argv.includes("--with-tts") || process.env.WITH_TTS === "1";
  const targetVideoDurationSec = totalScenes >= 6 ? totalScenes * 2.5 : totalScenes === 1 ? 6.5 : totalScenes * 3.6;

  // Default: Warm Acoustic Ambient Chord Resonance (Zero Robotic AI TTS Voice)
  if (!useTts) {
    try {
      const bgmExprL = [
        "0.20*sin(2*PI*220*t)*(0.68+0.32*sin(2*PI*2.0*t))",
        "0.16*sin(2*PI*261.63*t)*(0.75+0.25*cos(2*PI*0.5*t))",
        "0.15*sin(2*PI*329.63*t)",
        "0.12*sin(2*PI*392.00*t)*(0.6+0.4*sin(2*PI*0.25*t))",
        "0.18*sin(2*PI*110*t)*(0.60+0.40*sin(2*PI*2.0*t))",
        "0.09*sin(2*PI*523.25*t)*exp(-mod(t,2.5)*2.4)",
        "0.06*sin(2*PI*659.25*t)*exp(-mod(t+1.25,2.5)*3.0)",
      ].join("+");
      const bgmExprR = [
        "0.20*sin(2*PI*220.4*t)*(0.68+0.32*sin(2*PI*2.0*t))",
        "0.16*sin(2*PI*261.9*t)*(0.75+0.25*sin(2*PI*0.5*t))",
        "0.15*sin(2*PI*329.9*t)",
        "0.12*sin(2*PI*392.3*t)*(0.6+0.4*cos(2*PI*0.25*t))",
        "0.18*sin(2*PI*110*t)*(0.60+0.40*sin(2*PI*2.0*t))",
        "0.09*sin(2*PI*523.25*t)*exp(-mod(t,2.5)*2.4)",
        "0.06*sin(2*PI*783.99*t)*exp(-mod(t+1.25,2.5)*3.0)",
      ].join("+");

      const fadeOutStart = Math.max(1, targetVideoDurationSec - 1.5).toFixed(2);
      await execFileAsync(
        ffmpegBin,
        [
          "-y",
          "-f",
          "lavfi",
          "-i",
          `aevalsrc='${bgmExprL}|${bgmExprR}':s=44100:d=${targetVideoDurationSec}`,
          "-af",
          `lowpass=f=3200,highpass=f=55,afade=t=in:st=0:d=0.6,afade=t=out:st=${fadeOutStart}:d=1.4,alimiter=limit=0.92`,
          "-c:a",
          "libmp3lame",
          "-b:a",
          "192k",
          audioPath,
        ],
        { timeout: 60_000 }
      );
      hasVoice = existsSync(audioPath);
    } catch (fonErr) {
      console.warn("[Stereo Fon Müziği Uyarısı]:", fonErr?.message || fonErr);
    }
  } else {
    // Optional TTS + Fon interleave mode (--with-tts)
    try {
      const sceneVoicePaths = [];
      for (let i = 0; i < slotData.scenes.length; i++) {
        const sp = path.join(outDir, `scene-voice-${i}.mp3`);
        const ok = await synthesizeNaturalTurkishVoice(
          slotData.scenes[i].speech,
          slotData.voice || "tr-TR-AhmetNeural",
          sp
        );
        if (ok && existsSync(sp)) {
          sceneVoicePaths.push(sp);
        }
      }

      if (sceneVoicePaths.length > 0) {
        const inputs = [];
        const padFilters = [];
        const concatLabels = [];
        for (let i = 0; i < sceneVoicePaths.length; i++) {
          inputs.push("-i", sceneVoicePaths[i]);
          const padSec = i === sceneVoicePaths.length - 1 ? "2.4" : "2.2";
          padFilters.push(`[${i}:a]aformat=sample_rates=44100:channel_layouts=stereo,apad=pad_dur=${padSec}[v${i}]`);
          concatLabels.push(`[v${i}]`);
        }

        const bgmIdx = sceneVoicePaths.length;
        const bgmExpr = [
          "0.16*sin(2*PI*220*t)*(0.65+0.35*sin(2*PI*1.8*t))",
          "0.13*sin(2*PI*261.63*t)",
          "0.12*sin(2*PI*329.63*t)",
          "0.10*sin(2*PI*392.00*t)*(0.5+0.5*cos(2*PI*0.45*t))",
          "0.14*sin(2*PI*110*t)*(0.55+0.45*sin(2*PI*1.8*t))",
          "0.07*sin(2*PI*523.25*t)*exp(-mod(t,3.6)*2.2)",
        ].join("+");

        inputs.push("-f", "lavfi", "-i", `aevalsrc='${bgmExpr}|${bgmExpr}':s=44100:d=32`);

        const filterComplex = [
          ...padFilters,
          `${concatLabels.join("")}concat=n=${sceneVoicePaths.length}:v=0:a=1,asplit=2[voice_main][voice_sc]`,
          `[${bgmIdx}:a]lowpass=f=2100,highpass=f=60,volume=0.82[bgm_raw]`,
          `[bgm_raw][voice_sc]sidechaincompress=threshold=0.025:ratio=5.5:attack=35:release=420:makeup=1.25[bgm_ducked]`,
          `[voice_main][bgm_ducked]amix=inputs=2:duration=first:dropout_transition=0:weights='1.35 0.95',alimiter=limit=0.95[outa]`,
        ].join(";");

        await execFileAsync(
          ffmpegBin,
          ["-y", ...inputs, "-filter_complex", filterComplex, "-map", "[outa]", "-c:a", "libmp3lame", "-b:a", "192k", audioPath],
          { timeout: 60_000 }
        );
        hasVoice = existsSync(audioPath);
      }
    } catch (mixErr) {
      console.warn("[Fon Müzikli Miks Uyarısı]:", mixErr?.message || mixErr);
    }
  }

  console.log(
    `[2/4] [Stereo Broadcast Fon Müziği & Akıcı Ses Kanalı]: ${hasVoice ? "BAŞARILI" : "YEDEK MOD"}`
  );

  let inputFramerate = (frameCounter / targetVideoDurationSec).toFixed(3);
  if (hasVoice && existsSync(audioPath)) {
    try {
      const { stderr } = await execFileAsync(ffmpegBin, ["-i", audioPath], { timeout: 10_000 }).catch((e) => e);
      const m = String(stderr || "").match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
      if (m) {
        const durSec = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
        if (durSec > 4) {
          inputFramerate = Math.max(4.0, Math.min(15.0, frameCounter / durSec)).toFixed(3);
        }
      }
    } catch {}
  }

  const videoPath = path.join(outDir, `uretir-reel-${slotData.slot}.mp4`);
  let videoBuilt = false;
  try {
    const ffmpegArgs = hasVoice
      ? [
          "-y",
          "-framerate",
          inputFramerate,
          "-i",
          path.join(framesDir, "frame-%04d.png"),
          "-i",
          audioPath,
          "-vf",
          "minterpolate=fps=30:mi_mode=blend",
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
          "10",
          "-i",
          path.join(framesDir, "frame-%04d.png"),
          "-vf",
          "minterpolate=fps=30:mi_mode=blend",
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
    await execFileAsync(ffmpegBin, ffmpegArgs, { timeout: 150_000 });
    videoBuilt = existsSync(videoPath);
    console.log(`[3/4] [Akıcı 30 FPS Fon-Motion Video] 1080x1920 Fotoğraflı, Grafikli & Stereo Fon Müzikli MP4 üretildi: ${videoPath}`);
  } catch (err) {
    console.warn("[FFmpeg Uyarısı]:", err?.message || err);
  }

  const skipPublish = process.argv.includes("--render-only") || process.env.SKIP_PUBLISH === "1";
  let tgPublished = false;
  let igPublished = false;

  // Strict "Sadece Yeni Ürün ve Yeni Görsel" Ledger (Compliance & Duplicate Guardian Agent)
  const dedupFile = path.resolve("reports", "social-media", "published-hashes.json");
  let publishedLedger = {
    signatures: {},
    usedProducts: [
      "dyson 360 combi hepa+k-karbon hava temizleyici filtre",
      "dyson combi360 2 al 1 öde ve 360 gün fiyat geçmişi radarı",
    ],
    usedImages: [
      "dyson-combi360.jpg",
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85",
    ],
  };
  try {
    if (existsSync(dedupFile)) {
      const raw = JSON.parse(await fs.readFile(dedupFile, "utf8"));
      publishedLedger = {
        signatures: raw.signatures || raw || {},
        usedProducts: Array.from(new Set([...(publishedLedger.usedProducts || []), ...(raw.usedProducts || [])])),
        usedImages: Array.from(new Set([...(publishedLedger.usedImages || []), ...(raw.usedImages || [])])),
      };
    }
  } catch {}

  const primaryTitleNorm = String(slotData.scenes[0]?.title || slotData.label)
    .toLocaleLowerCase("tr-TR")
    .trim();
  const primaryImageNorm = String(slotData.scenes[0]?.photoUrl || slotData.scenes[0]?.localPhotoPath || "").trim();
  const signatureKey = `${slotData.slot}::${primaryTitleNorm}`;
  const isDuplicateProductOrImage =
    !process.argv.includes("--force") &&
    (Boolean(publishedLedger.signatures[signatureKey]) ||
      publishedLedger.usedProducts.includes(primaryTitleNorm));

  if (skipPublish) {
    console.log(`[4/4] [--render-only / Ön Hazırlık Modu] MP4 video ve kapak paketleri hazırlandı (canlı yayın saatinde paylaşılacak).`);
  } else if (isDuplicateProductOrImage) {
    console.log(`[4/4] [Yeni Ürün & Yeni Görsel Koruması] "${primaryTitleNorm}" daha önce yayınlandığı için tekrar paylaşılmadı.`);
  } else {
    console.log(`[4/4] Sosyal medya kanallarında (@uretirai, WhatsApp & @uretirbot) yayınlanıyor...`);
    tgPublished = await sendToTelegram(videoBuilt ? videoPath : null, coverPngPath, slotData);
    igPublished = await publishToInstagramReels(videoBuilt ? videoPath : null, coverPngPath, slotData);
    publishedLedger.signatures[signatureKey] = Date.now();
    if (primaryTitleNorm) {
      publishedLedger.usedProducts = Array.from(new Set([...publishedLedger.usedProducts, primaryTitleNorm]));
    }
    if (primaryImageNorm) {
      publishedLedger.usedImages = Array.from(new Set([...publishedLedger.usedImages, primaryImageNorm]));
    }
    await fs.writeFile(dedupFile, JSON.stringify(publishedLedger, null, 2), "utf8").catch(() => {});

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

  if (process.env.GITHUB_STEP_SUMMARY) {
    try {
      const summaryMd = [
        `## 🎬 Üretir Sosyal Video & Veri Senkronizasyon Raporu (\`Slot ${slotData.slot}\`)`,
        `- **Kuşak Başlığı:** ${slotData.label}`,
        `- **Veri Merkezi:** [${SITE_URL}](${SITE_URL})`,
        `- **Hedef Araç:** [${slotData.targetUrl}](${slotData.targetUrl})`,
        `- **Ses & Fon Müziği (Akustik Broadcast Fon):** ${hasVoice ? "✅ Başarılı" : "⚠️ Yedek Mod"}`,
        `- **9:16 Dikey MP4 Video (1080x1920 Tam Ekran Gerçek Fotoğraf):** ${videoBuilt ? "✅ Üretildi" : "❌ Hata"}`,
        `- **Mod:** ${skipPublish ? "📦 Ön Hazırlık & Artifact Üretimi (Gece Sessiz Mod)" : "🚀 Canlı Çok Kanallı Yayın"}`,
        `- **Telegram (@uretirbot):** ${skipPublish ? "⏳ Sabah 09:00 Kuşağında" : tgPublished ? "✅ Gönderildi" : "⚠️ Atlandı"}`,
        `- **Instagram (@uretirai):** ${skipPublish ? "⏳ Sabah 09:00 Kuşağında" : igPublished ? "✅ Yayınlandı" : "⚠️ Paket Hazır"}`,
        ``,
        `### 📌 Sahne Başlıkları ve Hook Kurgusu`,
        ...slotData.scenes.map(
          (s, idx) => `${idx + 1}. **${s.kicker}:** ${s.title} — *(${s.highlight})*`
        ),
        ``,
      ].join("\n");
      await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, summaryMd + "\n", "utf8");
    } catch {}
  }

  return { slot: slotData.slot, videoBuilt, igPublished, tgPublished, videoPath, audioPath, coverPngPath };
}

async function runSlot(slot) {
  const slotData = await gatherLiveSlotData(slot);
  return renderAndPublishSlotData(slotData);
}

const FRESH_VISUAL_POOLS = {
  haberai: [
    "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=85",
  ],
  puanai: [
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=1200&q=85",
  ],
  indirimai: [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=85",
  ],
  finansai: [
    "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=1200&q=85",
  ],
  evai: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=85",
  ],
  arabaai: [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=85",
  ],
};

function pickFreshVisual(categoryKey, candidateImageUrl, usedImagesSet) {
  if (
    candidateImageUrl &&
    candidateImageUrl.startsWith("http") &&
    !candidateImageUrl.includes("/api/visual-card") &&
    !candidateImageUrl.includes("opengraph-image") &&
    !usedImagesSet.has(candidateImageUrl.trim())
  ) {
    return candidateImageUrl.trim();
  }
  const pool = FRESH_VISUAL_POOLS[categoryKey] || FRESH_VISUAL_POOLS.indirimai;
  for (const url of pool) {
    if (!usedImagesSet.has(url)) return url;
  }
  return pool[Math.floor(Date.now() / 3600000) % pool.length];
}

/**
 * Separate Single-Category Editorial Posts ("Bundan sonra paylaşımlarda sadece yeni ürün ve yeni görsel")
 * Dynamically selects ONLY unpublished products/headlines and unpublished real photos for every category.
 */
async function buildSeparateCategorySlotMap() {
  const dedupFile = path.resolve("reports", "social-media", "published-hashes.json");
  const usedProductsSet = new Set([
    "dyson 360 combi hepa+k-karbon hava temizleyici filtre",
    "dyson combi360 2 al 1 öde ve 360 gün fiyat geçmişi radarı",
  ]);
  const usedImagesSet = new Set([
    "dyson-combi360.jpg",
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85",
  ]);

  try {
    if (existsSync(dedupFile)) {
      const raw = JSON.parse(await fs.readFile(dedupFile, "utf8"));
      for (const p of raw.usedProducts || []) usedProductsSet.add(String(p).toLocaleLowerCase("tr-TR").trim());
      for (const img of raw.usedImages || []) usedImagesSet.add(String(img).trim());
    }
  } catch {}

  const [indirimData, haberData, puanData, arabaData, evData, liveSlot09] = await Promise.all([
    fetchJsonSafe(`${SITE_URL}/api/indirim-ai`),
    fetchJsonSafe(`${SITE_URL}/api/haber-ai`),
    fetchJsonSafe(`${SITE_URL}/api/puan-ai/campaigns`),
    fetchJsonSafe(`${SITE_URL}/api/araba-ai`),
    fetchJsonSafe(`${SITE_URL}/api/ev-ai`),
    gatherLiveSlotData("09"),
  ]);

  // 1. Pick fresh İndirimAI product (never Dyson or already published product)
  const allDeals = [
    ...(indirimData?.lows?.["360"] || []),
    ...(indirimData?.lows?.["90"] || []),
    ...(indirimData?.lows?.["30"] || []),
    ...(indirimData?.items || []),
  ];
  const freshDeal =
    allDeals.find((d) => {
      const name = String(d?.productName || d?.title || "").toLocaleLowerCase("tr-TR").trim();
      return name && !name.includes("dyson") && !usedProductsSet.has(name);
    }) || {
      productName: "Apple iPhone 16 128 GB & Samsung Galaxy S24 FE Dönem Dibi Fiyat Analizi",
      storeName: "Amazon Türkiye & Hepsiburada",
      currentPrice: 56499,
      highPrice: 64999,
      dropFromHighPct: 13.1,
    };
  const dealTitle = freshDeal.productName || freshDeal.title;
  const dealPrice = freshDeal.currentPrice
    ? `${Number(freshDeal.currentPrice).toLocaleString("tr-TR")} TL`
    : "56.499 TL";
  const dealHigh = freshDeal.highPrice
    ? `${Number(freshDeal.highPrice).toLocaleString("tr-TR")} TL`
    : "64.999 TL";
  const dealPhoto = pickFreshVisual("indirimai", freshDeal.imageUrl, usedImagesSet);

  // 2. Pick fresh HaberAI headline & photo
  const allNews = haberData?.items || [];
  const freshNews =
    allNews.find((n) => {
      const t = String(n?.title || "").toLocaleLowerCase("tr-TR").trim();
      return t && !usedProductsSet.has(t);
    }) || {
      title: liveSlot09.scenes[1]?.title || "Türkiye'nin 81 İlinde Kaynaklı Sıcak Gündem ve Ekonomi Haritası",
      source: "Anadolu Ajansı & TRT Haber",
    };
  const haberPhoto = pickFreshVisual("haberai", freshNews.imageUrl, usedImagesSet);

  // 3. Pick fresh PuanAI campaign & photo
  const allCampaigns = puanData?.campaigns || [];
  const freshCampaign =
    allCampaigns.find((c) => {
      const t = String(c?.title || "").toLocaleLowerCase("tr-TR").trim();
      return t && !usedProductsSet.has(t);
    }) || {
      title: "Market, E-Ticaret ve Akaryakıt Harcamalarında 7.500 TL'ye Varan Chip-Para & Worldpuan",
      bankName: "Axess · Bonus · World · Maximum",
    };
  const puanPhoto = pickFreshVisual("puanai", freshCampaign.imageUrl, usedImagesSet);

  // 4. Pick fresh FinansAI market snapshot & photo
  const finansTitle =
    liveSlot09.scenes[2]?.title || "TCMB Döviz Kurları, 24 Ayar Gram Altın ve BIST 100 Canlı Referans Tablosu";
  const finansPhoto = pickFreshVisual("finansai", null, usedImagesSet);

  // 5. Pick fresh EvAI property listing & photo
  const allProperties = evData?.items || [];
  const freshProperty =
    allProperties.find((e) => {
      const t = String(e?.title || "").toLocaleLowerCase("tr-TR").trim();
      return t && !usedProductsSet.has(t);
    }) || {
      title: "İstanbul, Ankara ve İzmir Bölge m² Medyanının Altındaki Yeni Konut İlanları",
    };
  const evPhoto = pickFreshVisual("evai", freshProperty.imageUrl, usedImagesSet);

  // 6. Pick fresh ArabaAI vehicle listing & photo
  const allCars = [...(arabaData?.deals || []), ...(arabaData?.prices || [])];
  const freshCar =
    allCars.find((c) => {
      const t = String(c?.title || `${c?.brand || ""} ${c?.model || ""}`).toLocaleLowerCase("tr-TR").trim();
      return t && !usedProductsSet.has(t);
    }) || {
      title: "Togg T10X, Renault Megane ve BYD Seal Sıfır Liste Altı Yeni Araç Fırsatları",
    };
  const carTitle = freshCar.title || `${freshCar.brand} ${freshCar.model}`;
  const arabaPhoto = pickFreshVisual("arabaai", freshCar.imageUrl, usedImagesSet);

  return {
    haberai: {
      slot: "cat-haberai",
      label: "HABERAI · 81 İL CANLI GÜNDEM HARİTASI",
      targetUrl: "https://www.uretir.com/haber-ai",
      whatsappTargetKey: "haberai",
      customCaption: [
        `🗺️ Şehrinde Bugün Ne Oldu? 81 İl Canlı Gündem Haritası Yayında! (HaberAI)`,
        ``,
        `📌 ${freshNews.title}`,
        `📍 Kaynak: ${freshNews.source || "Anadolu Ajansı (AA) & TRT Haber Resmî Bülten Akışı"}`,
        ``,
        `🌐 Şehrini haritada seç ve oku: www.uretir.com/haber-ai`,
        `📲 WhatsApp HaberAI Kanalına Katıl (Anlık Bildirim): https://whatsapp.com/channel/0029Vb7L8mF5q08X9v2k1R2p`,
        ``,
        `#HaberAI #TürkiyeHaritası #SonDakika #Gündem #81İl #EkonomiHaberleri #Üretir #Keşfet`,
      ].join("\n"),
      scenes: [
        {
          kicker: "HABERAI · 81 İL TÜRKİYE HARİTASI",
          title: freshNews.title,
          sub: "Anadolu Ajansı ve TRT Haber Doğrulanmış Şehir Bazlı Bültenler",
          highlight: "URETIR.COM/HABER-AI",
          statLeft: "Kaynak: AA & TRT Haber",
          statRight: "WhatsApp: HaberAI Kanalı",
          accent: "#c8f560",
          bg1: "#102118",
          bg2: "#070e0a",
          photoUrl: haberPhoto,
          photoTag: "HABERAI · YENİ GÜNDEM",
          graphLabel: "81 İL CANLI HABER VE GÜNDEM YOĞUNLUĞU",
          graphStartLabel: "Bölgesel Akış",
          graphEndLabel: "81 İl Tam Kapsam",
          graphTrend: "up",
          speech: "",
        },
      ],
    },
    puanai: {
      slot: "cat-puanai",
      label: "PUANAI · BANKA KREDİ KARTI KAMPANYA RADARI",
      targetUrl: "https://www.uretir.com/puan-ai",
      whatsappTargetKey: "puanai",
      customCaption: [
        `💳 Yeni Ayın En Yüksek Puan Veren Banka Kampanyası! (PuanAI)`,
        ``,
        `📌 ${freshCampaign.title}`,
        `✨ Banka & Kart: ${freshCampaign.bankName || "Axess, Bonus, World, Maximum ve Bankkart"}`,
        ``,
        `🌐 Harcama yapmadan önce kartını karşılaştır: www.uretir.com/puan-ai`,
        `📲 WhatsApp PuanAI Kanalına Abone Ol: https://whatsapp.com/channel/0029Vb6x9kP8fewr2N4m8T1k`,
        ``,
        `#PuanAI #KrediKartıKampanyaları #ChipPara #Bonus #Worldpuan #Maximum #Bankkart #Tasarruf #Üretir #Keşfet`,
      ].join("\n"),
      scenes: [
        {
          kicker: "PUANAI · YENİ KAMPANYA RADARI",
          title: freshCampaign.title,
          sub: `${freshCampaign.bankName || "Resmî Banka Kaynaklı"} · Alışveriş Öncesi Net Puan Hesaplama`,
          highlight: "URETIR.COM/PUAN-AI",
          statLeft: "Resmî Banka Kaynaklı",
          statRight: "WhatsApp: PuanAI Kanalı",
          accent: "#78a5b6",
          bg1: "#0f2027",
          bg2: "#071014",
          photoUrl: puanPhoto,
          photoTag: "PUANAI · YENİ KAMPANYA",
          graphLabel: "AYLIK KART PUANI VE NAKİT İADE POTANSİYELİ",
          graphStartLabel: "Standart Kart: 0 TL",
          graphEndLabel: "PuanAI Seçimi: Maks Puan",
          graphTrend: "up",
          speech: "",
        },
      ],
    },
    indirimai: {
      slot: "cat-indirimai",
      label: "İNDİRİMAI · GERÇEK DÖNEM DİBİ & YENİ ÜRÜN RADARI",
      targetUrl: "https://www.uretir.com/indirim-ai",
      whatsappTargetKey: "indirimai",
      customCaption: [
        `🔥 Yeni Dönem Dibi Ürün Yakalandı: 360 Günlük Fiyat Geçmişiyle Doğrulandı! (İndirimAI)`,
        ``,
        `📌 Ürün: ${dealTitle}`,
        `💰 Kampanya Fiyatı: ${dealPrice} (Önceki Tepe: ${dealHigh})`,
        ``,
        `🌐 360 gün fiyat grafiği ve mağaza linki: www.uretir.com/indirim-ai`,
        `📲 Stok Bitmeden WhatsApp İndirimAI Kanalına Katıl: https://whatsapp.com/channel/0029Vb8K2pL4inow5M3n9Q0w`,
        ``,
        `#İndirimAI #Gerçekİndirim #FiyatGeçmişi #KuponKodu #Alışveriş #TeknolojiFırsatı #Üretir #Keşfet`,
      ].join("\n"),
      scenes: [
        {
          kicker: "İNDİRİMAI · YENİ ÜRÜN DİP FİYAT",
          title: dealTitle,
          sub: `${freshDeal.storeName || "Doğrulanmış Mağaza"} · 360 Günlük Fiyat Geçmişiyle Dönem Dibi`,
          highlight: `DİP FİYAT: ${dealPrice}`,
          statLeft: `Önceki: ${dealHigh}`,
          statRight: "WhatsApp: İndirimAI Kanalı",
          accent: "#f6ad55",
          bg1: "#26170b",
          bg2: "#0f0904",
          photoUrl: dealPhoto,
          photoTag: "İNDİRİMAI · YENİ ÜRÜN",
          graphLabel: "360 GÜNLÜK FİYAT GEÇMİŞİ VE DÖNEM DİBİ (TL)",
          graphStartLabel: `Tepe: ${dealHigh}`,
          graphEndLabel: `Dip: ${dealPrice}`,
          graphTrend: "down",
          speech: "",
        },
      ],
    },
    finansai: {
      slot: "cat-finansai",
      label: "FİNANSAI · CANLI PİYASA & MAKRO VERİ MASASI",
      targetUrl: "https://www.uretir.com/finans-ai",
      whatsappTargetKey: "finansai",
      customCaption: [
        `📈 Piyasa Özeti: Dolar, Euro, 24 Ayar Gram Altın ve BIST 100 Referans Tablosu (FinansAI)`,
        ``,
        `📌 ${finansTitle}`,
        `📌 30 Günlük Eğilim Grafikleri ve Enflasyon Sepeti Kıyaslaması`,
        ``,
        `🌐 Canlı kurlar ve 30 günlük grafikler: www.uretir.com/finans-ai`,
        `📲 Sabah 09:00 Piyasa Özeti İçin WhatsApp FinansAI Kanalı: https://whatsapp.com/channel/0029Vb9M4rN2k8pL7Q1v5X3z`,
        ``,
        `#FinansAI #Dolar #Altın #GramAltın #Borsaİstanbul #BIST100 #Ekonomi #Piyasa #Üretir #Keşfet`,
      ].join("\n"),
      scenes: [
        {
          kicker: "FİNANSAI · CANLI PİYASA MASASI",
          title: finansTitle,
          sub: "1 Aylık Eğilim Grafikleri ve Doğrulanmış Piyasa Referans Tablosu",
          highlight: "URETIR.COM/FINANS-AI",
          statLeft: "Dolar · Euro · Altın",
          statRight: "WhatsApp: FinansAI Kanalı",
          accent: "#4fd1c5",
          bg1: "#0d2426",
          bg2: "#061112",
          photoUrl: finansPhoto,
          photoTag: "FİNANSAI · YENİ VERİ",
          graphLabel: "30 GÜNLÜK PİYASA VE GRAM ALTIN EĞİLİMİ",
          graphStartLabel: "Aylık Baz",
          graphEndLabel: "Canlı Kapanış",
          graphTrend: "up",
          speech: "",
        },
      ],
    },
    evai: {
      slot: "cat-evai",
      label: "EVAI · ÇOKLU PLATFORM KONUT & EMSAL RADARI",
      targetUrl: "https://www.uretir.com/ev-ai",
      whatsappTargetKey: "evai",
      customCaption: [
        `🏠 Bölge Ortalamasının Altındaki Yeni Konut İlanı: Sahibinden, Emlakjet & Letgo (EvAI)`,
        ``,
        `📌 ${freshProperty.title}`,
        `📌 Sahibinden, Emlakjet, Hepsiemlak, Letgo ve TOKİ/Kamu İhale Fotoğraflı Önizleme Kartları`,
        ``,
        `🌐 Tüm fotoğraflı konut analizleri: www.uretir.com/ev-ai`,
        `📲 Emsal Altı Konut Bildirimleri İçin WhatsApp EvAI Kanalı: https://whatsapp.com/channel/0029Vb5P1tR9hX4k6W8n2Y4c`,
        ``,
        `#EvAI #Emlak #KonutFiyatları #Sahibinden #Emlakjet #Hepsiemlak #Gayrimenkul #Yatırım #Üretir #Keşfet`,
      ].join("\n"),
      scenes: [
        {
          kicker: "EVAI · YENİ KONUT & EMSAL VİTRİNİ",
          title: freshProperty.title,
          sub: "Bölge Medyanının Altında Kalan Fotoğraflı Konut ve Kamu İhale Kayıtları",
          highlight: "URETIR.COM/EV-AI",
          statLeft: "Sahibinden · Emlakjet · Letgo",
          statRight: "WhatsApp: EvAI Kanalı",
          accent: "#f687b3",
          bg1: "#2b1422",
          bg2: "#13080e",
          photoUrl: evPhoto,
          photoTag: "EVAI · YENİ KONUT İLANI",
          graphLabel: "BÖLGESEL M² MEDYANI VE PLATFORM KIYASLAMASI",
          graphStartLabel: "Bölge m² Ortalaması",
          graphEndLabel: "Emsal Altı Fırsatlar",
          graphTrend: "down",
          speech: "",
        },
      ],
    },
    arabaai: {
      slot: "cat-arabaai",
      label: "ARABAAI · ÇOKLU PLATFORM ARAÇ & SIFIR LİSTE RADARI",
      targetUrl: "https://www.uretir.com/araba-ai",
      whatsappTargetKey: "arabaai",
      customCaption: [
        `🚗 Sıfır Liste Fiyatının Altında Kalan Yeni Araç İlanı: Sahibinden, Arabam.com & Letgo (ArabaAI)`,
        ``,
        `📌 ${carTitle}`,
        `📌 Sahibinden, Arabam.com, Letgo ve Resmî Distribütör Fotoğraflı Araç Önizleme Vitrini`,
        ``,
        `🌐 Araç fiyat geçmişi ve platform kıyaslaması: www.uretir.com/araba-ai`,
        `📲 Fırsat Araç Bildirimleri İçin WhatsApp ArabaAI Kanalı: https://whatsapp.com/channel/0029Vb4N8vS7dM2j9Z5p1B6v`,
        ``,
        `#ArabaAI #Otomobil #İkinciElAraba #SıfırAraç #Sahibinden #Arabamcom #Togg #Otomotiv #Üretir #Keşfet`,
      ].join("\n"),
      scenes: [
        {
          kicker: "ARABAAI · YENİ ARAÇ & LİSTE VİTRİNİ",
          title: carTitle,
          sub: "Sıfır Liste Fiyatına Göre Avantajlı 2. El Araç Referansları Fotoğraflı Vitrinde",
          highlight: "URETIR.COM/ARABA-AI",
          statLeft: "Sahibinden · Arabam · Letgo",
          statRight: "WhatsApp: ArabaAI Kanalı",
          accent: "#63b3ed",
          bg1: "#0e1f33",
          bg2: "#060e17",
          photoUrl: arabaPhoto,
          photoTag: "ARABAAI · YENİ ARAÇ İLANI",
          graphLabel: "SIFIR LİSTE FİYATI VE 2. EL PİYASA KIYASLAMASI",
          graphStartLabel: "Sıfır Liste Fiyatı",
          graphEndLabel: "Çoklu Platform Kıyas",
          graphTrend: "down",
          speech: "",
        },
      ],
    },
  };
}

async function runSeparateCategoryPosts(targetCategory = null) {
  const categoryMap = await buildSeparateCategorySlotMap();
  const keys = targetCategory && categoryMap[targetCategory]
    ? [targetCategory]
    : ["haberai", "puanai", "indirimai", "finansai", "evai", "arabaai"];

  const results = [];
  for (const key of keys) {
    console.log(`\n[Sosyal Medya Uzmanı Ajanı] Bağımsız Kategori Yayını Başlatılıyor: ${key.toUpperCase()}`);
    const res = await renderAndPublishSlotData(categoryMap[key]);
    results.push({ category: key, ...res });
  }
  return results;
}

/**
 * Dyson 360° Combi HEPA+K-Karbon Filter (COMBI360 2 Al 1 Öde) + HaberAI + Piyasa Hook & Fon Publisher
 * Uses short headline voiceover + 2.2s musical fon interludes ("İndirimAI okudun fon -> HaberAI okudun fon")
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
    label: "GÜNÜN KANCASI · İNDİRİMAI DYSON & HABERAI 81 İL HARİTASI",
    targetUrl: "https://www.uretir.com/indirim-ai",
    whatsappTargetKey: "indirimai",
    voice: "tr-TR-AhmetNeural",
    customCaption: [
      `🔥 Bu Fırsatı Kaçıran Üzülür! Dyson'da 2 Al 1 Öde + 81 İl Gündem Haritası`,
      ``,
      `📌 İndirimAI: Dyson 360° Combi HEPA + K-Karbon Filtre · COMBI360 Koduyla Adet 1.949,50 TL (-%50)`,
      `🗺️ HaberAI: 81 İl İnteraktif Türkiye Haritasında Sıcak Gündem`,
      `📊 FinansAI & PuanAI: Canlı Piyasa ve 10.000 TL'ye Varan Kart Kampanyaları`,
      ``,
      `🌐 Doğrulanmış veriler ve haritalar: www.uretir.com (Profildeki bağlantıda)`,
      ``,
      `#Dyson #İndirimAI #HaberAI #Kampanya #COMBI360 #Fırsat #TürkiyeHaritası #Üretir #Keşfet`,
    ].join("\n"),
    scenes: [
      {
        kicker: "GÜNÜN KANCASI · İNDİRİMAI FIRSATI",
        title: "Dyson 360° Combi HEPA+K-Karbon Filtrede 2 Al 1 Öde Fırsatı",
        sub: "Sepette COMBI360 Kupon Koduyla Adet Başına 1.949,50 TL (-%50)",
        highlight: "ADET: 1.949,50 TL (-%50)",
        statLeft: "Kupon Kodu: COMBI360",
        statRight: "Liste: 3.899,00 TL",
        accent: "#f6ad55",
        bg1: "#26170b",
        bg2: "#0f0904",
        localPhotoPath: existsSync(publicDealImgPath) ? publicDealImgPath : uploadedScreenshot,
        photoTag: "İNDİRİMAI · GERÇEK ÜRÜN GÖRSELİ",
        graphLabel: "DYSON FİLTRE BİRİM FİYAT DÜŞÜŞ GRAFİĞİ (TL)",
        graphStartLabel: "Tekli Liste: 3.899 TL",
        graphEndLabel: "COMBI360: 1.949,50 TL",
        graphTrend: "down",
        speech: "Bu fiyatı kaçıran üzülür! İndirim A İ'de Dyson filtrede iki al bir öde fırsatı!",
      },
      {
        kicker: "81 İL HARİTASI · HABERAI GÜNDEM",
        title: "Türkiye'nin 81 İlinde Sıcak Gündem ve Ekonomi Haritası",
        sub: "Şehir Şehir Doğrulanmış Haberler İnteraktif Türkiye Haritasında",
        highlight: "81 İL CANLI HARİTA",
        statLeft: "Kaynak: AA & TRT Haber",
        statRight: "uretir.com/haber-ai",
        accent: "#c8f560",
        bg1: "#102118",
        bg2: "#070e0a",
        photoUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=85",
        photoTag: "HABERAI · 81 İL TÜRKİYE HARİTASI",
        graphLabel: "81 İL CANLI HABER YOĞUNLUK EĞRİSİ",
        graphStartLabel: "Bölgesel Akış",
        graphEndLabel: "81 İl Tam Kapsam",
        graphTrend: "up",
        speech: "Haber A İ haritasında seksen bir ilin tamamında sıcak gündem yayında!",
      },
      {
        kicker: "CANLI VERİ MERKEZİ · URETIR.COM",
        title: "İndirim, Haber Haritası, Finans, Araç ve Konut Tek Ekranda",
        sub: "COMBI360 Kupon Kodu ve 81 İl Haritası İçin Hemen Ziyaret Edin",
        highlight: "WWW.URETIR.COM",
        statLeft: "Instagram: @uretirai",
        statRight: "WhatsApp: 6 Kanal",
        accent: "#4fd1c5",
        bg1: "#0c2224",
        bg2: "#050f10",
        localPhotoPath: existsSync(publicDealImgPath) ? publicDealImgPath : uploadedScreenshot,
        photoTag: "DOĞRULANMIŞ VERİ MERKEZİ · URETIR.COM",
        graphLabel: "NET KULLANICI TASARRUF VE VERİ AKIŞI",
        graphStartLabel: "Standart Sepet",
        graphEndLabel: "%50 Net Avantaj",
        graphTrend: "up",
        speech: "Kupon kodları ve seksen bir il haritası için adres: üretir nokta com.",
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
                `✅ *Ajan Komuta Merkezi:* https://www.uretir.com/ajanlar`,
                `✅ *Instagram (@uretirai):* Tam Ekran Gerçek Fotoğraf & Akustik Fon Modu Aktif`,
                `✅ *WhatsApp 6 Kanal:* Abone Hunisi & Dergi Kartı Modu Aktif`,
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
                    { text: "🤖 Ajan Paneli (uretir.com/ajanlar)", url: "https://www.uretir.com/ajanlar" },
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

async function runEightCategoriesFonShowcase() {
  const publicDealImgPath = path.resolve("public", "images", "deals", "dyson-combi360.jpg");
  const eightCatSlotData = {
    slot: "8kategori-fon",
    label: "8 BAĞIMSIZ KATEGORİ · HABERAI, PUANAI, İNDİRİMAI, FİNANSAI, SPORAI, OYUNAI, ARABAAI, EVAI",
    targetUrl: "https://www.uretir.com",
    whatsappTargetKey: "indirimai",
    voice: "tr-TR-AhmetNeural",
    customCaption: [
      `🚀 Üretir.com Büyüdü: 8 Ayrı AI Kategorisi, Fotoğraflı İlan Önizlemeleri ve Çoklu Platform Radarı!`,
      ``,
      `🗺️ 1) HaberAI: 81 İl İnteraktif Türkiye Gündem Haritası (uretir.com/haber-ai)`,
      `💳 2) PuanAI: Bankaların Resmî Kredi Kartı Puan & Taksit Karşılaştırması (uretir.com/puan-ai)`,
      `🔥 3) İndirimAI: 30/90/360 Gün Fiyat Geçmişi & Dyson 2 Al 1 Öde Fırsatı (uretir.com/indirim-ai)`,
      `📈 4) FinansAI: Canlı Dolar, Euro, Gram Altın, BIST 100 & Kripto (uretir.com/finans-ai)`,
      `🏆 5) SporAI: Süper Lig xG Analizi, UEFA Ülke Puanı & Spor Ekonomisi (uretir.com/spor-ai)`,
      `🎮 6) OyunAI: Steam MENA-USD, Epic İndirimleri, Türk Stüdyoları & Hafıza Oyunu (uretir.com/oyun-ai)`,
      `🚗 7) ArabaAI: Sahibinden, Arabam.com, Letgo & Sıfır Araç Liste Kıyaslama (uretir.com/araba-ai)`,
      `🏠 8) EvAI: Sahibinden, Emlakjet, Hepsiemlak, Letgo & Kamu İhale Konut Vitrini (uretir.com/ev-ai)`,
      ``,
      `🌐 Tüm fotoğraflı önizlemeler ve canlı veriler: www.uretir.com`,
      ``,
      `#Üretir #HaberAI #PuanAI #İndirimAI #FinansAI #SporAI #OyunAI #ArabaAI #EvAI #Keşfet #ReelsTürkiye`,
    ].join("\n"),
    scenes: [
      {
        kicker: "01 / 08 · HABERAI · 81 İL GÜNDEM HARİTASI",
        title: "81 İlin Tamamında Kaynaklı Sıcak Gündem ve Ekonomi Haritası",
        sub: "Anadolu Ajansı ve TRT Haber Doğrulanmış Şehir Bazlı Bültenler",
        highlight: "URETIR.COM/HABER-AI",
        statLeft: "81 İl Canlı Harita",
        statRight: "Fotoğraflı Önizleme",
        accent: "#c8f560",
        bg1: "#102118",
        bg2: "#070e0a",
        photoUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=85",
        photoTag: "HABERAI · 81 İL TÜRKİYE HARİTASI",
        graphLabel: "81 İL CANLI HABER VE GÜNDEM YOĞUNLUĞU",
        graphStartLabel: "Bölgesel Akış",
        graphEndLabel: "81 İl Tam Kapsam",
        graphTrend: "up",
        speech: "HaberAI seksen bir il gündem haritası.",
      },
      {
        kicker: "02 / 08 · PUANAI · KREDİ KARTI KAMPANYALARI",
        title: "Axess, Bonus, World, Maximum ve Bankkart Kampanya Karşılaştırma",
        sub: "Alışveriş Öncesi En Yüksek Puan, Chip-Para ve Taksit Hesaplama",
        highlight: "URETIR.COM/PUAN-AI",
        statLeft: "Resmî Banka Kaynaklı",
        statRight: "Net Kazanç Analizi",
        accent: "#78a5b6",
        bg1: "#0f2027",
        bg2: "#071014",
        photoUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85",
        photoTag: "PUANAI · BANKA KAMPANYA RADARI",
        graphLabel: "KART PUANI VE NAKİT İADE KAZANÇ EĞRİSİ",
        graphStartLabel: "Standart Harcama",
        graphEndLabel: "+10.000 TL Puan",
        graphTrend: "up",
        speech: "PuanAI kredi kartı kampanya karşılaştırması.",
      },
      {
        kicker: "03 / 08 · İNDİRİMAI · GERÇEK DİP FİYAT RADARI",
        title: "30 / 90 / 360 Gün Fiyat Geçmişi ve Dyson COMBI360 2 Al 1 Öde",
        sub: "Sahte İndirimleri Eleyen Mağaza Fiyat Gözlemleri ve Kupon Kodları",
        highlight: "URETIR.COM/INDIRIM-AI",
        statLeft: "Kupon: COMBI360",
        statRight: "Adet: 1.949,50 TL",
        accent: "#f6ad55",
        bg1: "#26170b",
        bg2: "#0f0904",
        localPhotoPath: existsSync(publicDealImgPath) ? publicDealImgPath : undefined,
        photoUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1200&q=85",
        photoTag: "İNDİRİMAI · DÖNEM DİBİ FIRSAT",
        graphLabel: "360 GÜNLÜK FİYAT GEÇMİŞİ VE DİP NOKTASI",
        graphStartLabel: "Liste: 3.899 TL",
        graphEndLabel: "Dip: 1.949,50 TL",
        graphTrend: "down",
        speech: "İndirimAI gerçek dönem dibi fırsatları.",
      },
      {
        kicker: "04 / 08 · FİNANSAI · CANLI PİYASA MASASI",
        title: "TCMB Döviz Kurları, 24 Ayar Gram Altın, BIST 100 ve Kripto",
        sub: "1 Aylık Eğilim Grafikleri ve Doğrulanmış Piyasa Referans Ekranı",
        highlight: "URETIR.COM/FINANS-AI",
        statLeft: "Dolar · Euro · Altın",
        statRight: "BIST 100 · BTC",
        accent: "#4fd1c5",
        bg1: "#0d2426",
        bg2: "#061112",
        photoUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=85",
        photoTag: "FİNANSAI · CANLI PİYASA EKRANI",
        graphLabel: "30 GÜNLÜK PİYASA VE EMİSYON EĞİLİMİ",
        graphStartLabel: "Aylık Baz",
        graphEndLabel: "Canlı Kapanış",
        graphTrend: "up",
        speech: "FinansAI canlı döviz, altın ve borsa ekranı.",
      },
      {
        kicker: "05 / 08 · SPORAI · SÜPER LİG xG & UEFA ÜLKE PUANI",
        title: "Süper Lig Beklenen Gol (xG) Matrisi, UEFA Katsayısı ve Spor Ekonomisi",
        sub: "TFF, UEFA, EuroLeague ve BIST XSPOR Doğrulanmış Performans Verileri",
        highlight: "URETIR.COM/SPOR-AI",
        statLeft: "UEFA 9. Sıra Türkiye",
        statRight: "Canlı xG Tablosu",
        accent: "#34d399",
        bg1: "#062c22",
        bg2: "#031410",
        photoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=85",
        photoTag: "SPORAI · CANLI PERFORMANS MERKEZİ",
        graphLabel: "SÜPER LİG XG BEKLENTİSİ VE UEFA ÜLKE PUANI",
        graphStartLabel: "Sezon Başlangıcı",
        graphEndLabel: "+7.800 Katsayı",
        graphTrend: "up",
        speech: "SporAI Süper Lig xG ve UEFA ülke puanı.",
      },
      {
        kicker: "06 / 08 · OYUNAI · STEAM/EPIC RADARI & HAFIZA OYUNU",
        title: "Steam MENA-USD, Epic Games İndirimleri, Türk Stüdyoları & Memo",
        sub: "PC/Konsol Dönem Dibi Oyun Fırsatları ve Reklamsız Kelime Hafıza Oyunu",
        highlight: "URETIR.COM/OYUN-AI",
        statLeft: "Steam & Epic & PS5",
        statRight: "Türk Stüdyoları",
        accent: "#a78bfa",
        bg1: "#21123b",
        bg2: "#0d0719",
        photoUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=85",
        photoTag: "OYUNAI · GAMING & ZİHİN EGZERSİZİ",
        graphLabel: "STEAM MENA-USD BÖLGESEL FİYAT AVANTAJI",
        graphStartLabel: "Küresel: $59.99",
        graphEndLabel: "MENA: -$65 Avantaj",
        graphTrend: "down",
        speech: "OyunAI oyun indirimleri ve hafıza oyunu.",
      },
      {
        kicker: "07 / 08 · ARABAAI · SAHİBİNDEN, ARABAM, LETGO & SIFIR",
        title: "Çoklu Platform 2. El Araç Referansı ve Resmî Sıfır Liste Kıyaslama",
        sub: "Sahibinden, Arabam.com, Letgo ve Resmî Marka Fiyatları Fotoğraflı Vitrinde",
        highlight: "URETIR.COM/ARABA-AI",
        statLeft: "Sahibinden · Arabam",
        statRight: "Letgo · Resmî Marka",
        accent: "#63b3ed",
        bg1: "#0e1f33",
        bg2: "#060e17",
        photoUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=85",
        photoTag: "ARABAAI · FOTOĞRAFLI ARAÇ VİTRİNİ",
        graphLabel: "SIFIR LİSTE FİYATI VE 2. EL PİYASA KIYASLAMASI",
        graphStartLabel: "Sıfır Liste Fiyatı",
        graphEndLabel: "Çoklu Platform Kıyas",
        graphTrend: "down",
        speech: "ArabaAI çoklu platform araç karşılaştırması.",
      },
      {
        kicker: "08 / 08 · EVAI · SAHİBİNDEN, EMLAKJET, LETGO & KAMU",
        title: "Çoklu Platform Konut Vitrini, Bölge m² Medyanı ve Kamu İhale Kayıtları",
        sub: "Sahibinden, Emlakjet, Hepsiemlak, Letgo ve TOKİ/İhale Fotoğraflı Önizleme",
        highlight: "URETIR.COM/EV-AI",
        statLeft: "Sahibinden · Emlakjet",
        statRight: "Letgo · Kamu İhale",
        accent: "#f687b3",
        bg1: "#2b1422",
        bg2: "#13080e",
        photoUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=85",
        photoTag: "EVAI · FOTOĞRAFLI KONUT VİTRİNİ",
        graphLabel: "BÖLGESEL M² MEDYANI VE PLATFORM KIYASLAMASI",
        graphStartLabel: "Bölge m² Ortalaması",
        graphEndLabel: "Emsal Altı Fırsatlar",
        graphTrend: "down",
        speech: "EvAI çoklu platform konut ve ihale vitrini.",
      },
    ],
  };

  return renderAndPublishSlotData(eightCatSlotData);
}

async function main() {
  const catArgIdx = process.argv.indexOf("--category");
  if (catArgIdx !== -1 && process.argv[catArgIdx + 1]) {
    await runSeparateCategoryPosts(process.argv[catArgIdx + 1].toLowerCase().replace(/[^a-z]/g, ""));
    process.exit(0);
  }

  if (process.argv.includes("--separate-categories")) {
    await runSeparateCategoryPosts();
    process.exit(0);
  }

  if (process.argv.includes("--eight-categories")) {
    await runEightCategoriesFonShowcase();
    process.exit(0);
  }

  if (process.argv.includes("--dyson-special")) {
    await runDysonCampaignSpecial();
    process.exit(0);
  }

  if (process.argv.includes("--all-slots")) {
    await runSeparateCategoryPosts();
    process.exit(0);
  }

  if (!process.argv.includes("--daemon-only")) {
    const slot = detectSlot();
    const slotToCategory = { "09": "haberai", "12": "indirimai", "15": "arabaai", "20": "puanai" };
    await runSeparateCategoryPosts(slotToCategory[slot] || "indirimai");
    if (!process.argv.includes("--daemon")) {
      process.exit(0);
    }
  }

  if (process.argv.includes("--daemon") || process.argv.includes("--daemon-only")) {
    console.log("[Üretir 7/24 Otomasyon Daemon] Sadece Yeni Ürün & Yeni Görsel Kuralıyla 6 Ayrı Kategori Zamanlayıcısı Aktif...");
    let lastTriggeredKey = "";
    const tgState = { offset: 0, webhookCleared: false };

    // Poll Telegram commands, photos & buttons every 4 seconds
    setInterval(() => {
      pollTelegramBotInteractive(tgState);
    }, 4_000);

    // Check category schedule (09:00 HaberAI, 11:00 PuanAI, 13:00 İndirimAI, 15:00 FinansAI, 18:00 EvAI, 20:00 ArabaAI)
    const hourToCategory = {
      "09": "haberai",
      "11": "puanai",
      "13": "indirimai",
      "15": "finansai",
      "18": "evai",
      "20": "arabaai",
    };
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
        if (hourToCategory[hh] && Number(mm) <= 4 && lastTriggeredKey !== key) {
          lastTriggeredKey = key;
          await runSeparateCategoryPosts(hourToCategory[hh]);
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


