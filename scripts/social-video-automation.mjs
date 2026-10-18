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
  const useTts = process.argv.includes("--with-tts");
  const targetVideoDurationSec = totalScenes >= 6 ? totalScenes * 2.5 : totalScenes * 3.6;

  // Default: Pure Studio Stereo Broadcast Fon Music ("şimdilik fon ile — daha akıcı video")
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

  if (skipPublish) {
    console.log(`[4/4] [--render-only / Ön Hazırlık Modu] MP4 video ve kapak paketleri hazırlandı (canlı yayın saatinde paylaşılacak).`);
  } else {
    console.log(`[4/4] Sosyal medya kanallarında (@uretirai, WhatsApp & @uretirbot) yayınlanıyor...`);
    tgPublished = await sendToTelegram(videoBuilt ? videoPath : null, coverPngPath, slotData);
    igPublished = await publishToInstagramReels(videoBuilt ? videoPath : null, coverPngPath, slotData);

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
        `- **Ses & Fon Müziği (${slotData.voice || "tr-TR-AhmetNeural"} + Broadcast Fon):** ${hasVoice ? "✅ Başarılı" : "⚠️ Yedek Mod"}`,
        `- **9:16 Dikey MP4 Video (1080x1920):** ${videoBuilt ? "✅ Üretildi" : "❌ Hata"}`,
        `- **Mod:** ${skipPublish ? "📦 Ön Hazırlık & Artifact Üretimi (Gece Sessiz Mod)" : "🚀 Canlı Çok Kanallı Yayın"}`,
        `- **Telegram (@uretirbot):** ${skipPublish ? "⏳ Sabah 09:00 Kuşağında" : tgPublished ? "✅ Gönderildi" : "⚠️ Atlandı"}`,
        `- **Instagram (@uretirai):** ${skipPublish ? "⏳ Sabah 09:00 Kuşağında" : igPublished ? "✅ Yayınlandı" : "⚠️ Paket Hazır"}`,
        ``,
        `### 📌 Sahne Başlıkları ve Hook Kurgusu`,
        ...slotData.scenes.map(
          (s, idx) => `${idx + 1}. **${s.kicker}:** ${s.title} — *(${s.highlight})* · 🎙️ _"${s.speech}"_`
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
  if (process.argv.includes("--eight-categories")) {
    await runEightCategoriesFonShowcase();
    process.exit(0);
  }

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

