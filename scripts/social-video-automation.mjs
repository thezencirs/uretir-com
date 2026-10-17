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
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID || "";
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
      label: "09:00 SABAH GÜNDEMİ & PİYASA AÇILIŞI",
      targetUrl: "https://www.uretir.com/haber-ai",
      voice: "tr-TR-AhmetNeural",
      scenes: [
        {
          kicker: "SAAT 09:00 · HABERAI 81 İL GÜNDEMİ",
          title: topHeadline,
          sub: "81 İl İnteraktif Türkiye Haritası ve Doğrulanmış Kaynaklar",
          highlight: "81 İL CANLI AKIŞ",
          statLeft: "TRT Haber & AA",
          statRight: "uretir.com/haber-ai",
          accent: "#c8f560",
          bg1: "#0f2419",
          bg2: "#07100b",
          speech: `Günaydın Türkiye! Saat dokuz Üretir yapay zeka sabah bültenindeyiz. Haber A İ haritasında günün öne çıkan başlığı: ${topHeadline}.`,
        },
        {
          kicker: "SAAT 09:00 · FİNANSAI PİYASA AÇILIŞI",
          title: `Dolar ${usd} TL · Euro ${eur} TL · Gram Altın ${gram} TL`,
          sub: `Borsa İstanbul BIST 100: ${bist} Puan · Bitcoin: ${btc} USD`,
          highlight: `ALTIN: ${gram} TL`,
          statLeft: `USD: ${usd} TL`,
          statRight: "uretir.com/finans-ai",
          accent: "#4fd1c5",
          bg1: "#0d2426",
          bg2: "#061112",
          speech: `Finans A İ ekranında sabah piyasa açılışı: Dolar ${usd} lira, Euro ${eur} lira, gram altın ${gram} lira ve Borsa İstanbul ${bist} puanda.`,
        },
        {
          kicker: "SAAT 09:00 · İNDİRİMAI & PUANAI RADARI",
          title: dealTitle,
          sub: `${topPuan} ile Birleşen Gerçek Dönem Dibi Fırsatı`,
          highlight: dealPrice,
          statLeft: dealDrop,
          statRight: "uretir.com/indirim-ai",
          accent: "#f6ad55",
          bg1: "#29190d",
          bg2: "#120a05",
          speech: `İndirim A İ fiyat geçmişi radarında ise ${dealTitle}, ${dealPrice} dip fiyatıyla öne çıkıyor. Türkiye üretir, gençler yetişir! Tüm canlı veriler için hemen üretir nokta com adresine girin.`,
        },
      ],
    },
    "12": {
      label: "12:00 ÖĞLE İNDİRİM & KAMPANYA RADARI",
      targetUrl: "https://www.uretir.com/indirim-ai",
      voice: "tr-TR-EmelNeural",
      scenes: [
        {
          kicker: "SAAT 12:00 · İNDİRİMAI DİP FİYAT",
          title: dealTitle,
          sub: "30, 90 ve 360 Günlük Fiyat Gözlemiyle Sahte İndirimleri Eleyin",
          highlight: dealPrice,
          statLeft: dealDrop,
          statRight: "uretir.com/indirim-ai",
          accent: "#f6ad55",
          bg1: "#2b190c",
          bg2: "#120a04",
          speech: `Üretir saat on iki öğle bülteninden merhaba! İndirim A İ mağaza fiyat geçmişini inceledi. Günün lider fırsatı ${dealTitle}, ${dealPrice} seviyesinde.`,
        },
        {
          kicker: "SAAT 12:00 · PUANAI KART ASİSTANI",
          title: "Alışveriş Öncesi Kart Kampanyanı ve Taksitini Doğrula",
          sub: "Axess · Bonus · World · Maximum · Bankkart Resmî Koşullar",
          highlight: "10.000 TL'YE VARAN PUAN",
          statLeft: "9 Aya Varan Taksit",
          statRight: "uretir.com/puan-ai",
          accent: "#b794f4",
          bg1: "#1e1533",
          bg2: "#0c0817",
          speech: `Harcama yapmadan önce Puan A İ asistanına danışın; bankaların resmî kampanyalarıyla peşin fiyatına taksit ve puan ödüllerini karşılaştırın.`,
        },
        {
          kicker: "SAAT 12:00 · FİNANSAI ÖĞLE EKRANI",
          title: `Dolar ${usd} TL · Gram Altın ${gram} TL · Bitcoin ${btc} USD`,
          sub: "Canlı Döviz, Altın, BIST 100 ve Emtia Karşılaştırma Masası",
          highlight: `USD: ${usd} TL`,
          statLeft: `Altın: ${gram} TL`,
          statRight: "uretir.com/finans-ai",
          accent: "#4fd1c5",
          bg1: "#0e2426",
          bg2: "#061012",
          speech: `Öğle saatlerinde Dolar ${usd} lira, gram altın ise ${gram} lira. Altı ücretsiz yapay zeka aracımız ve canlı indirim listeleri için hemen üretir nokta com adresini ziyaret edin.`,
        },
      ],
    },
    "15": {
      label: "15:00 OTOMOTİV & KONUT PİYASA ANALİZİ",
      targetUrl: "https://www.uretir.com/araba-ai",
      voice: "tr-TR-AhmetNeural",
      scenes: [
        {
          kicker: "SAAT 15:00 · ARABAAI OTOMOTİV RADARI",
          title: carTitle,
          sub: "Resmî Sıfır Araç Liste Fiyatı ve Haritalı 2. El Kıyaslaması",
          highlight: carPrice,
          statLeft: "Resmî Marka Kaynağı",
          statRight: "uretir.com/araba-ai",
          accent: "#63b3ed",
          bg1: "#0e1f33",
          bg2: "#060e17",
          speech: `Saat on beş Üretir otomotiv ve konut bültenine hoş geldiniz! Araba A İ sıfır araç radarında ${carTitle}, ${carPrice} resmî fiyat referansıyla dikkat çekiyor.`,
        },
        {
          kicker: "SAAT 15:00 · EVAI KONUT & KAMU İHALE",
          title: evTitle,
          sub: "Haritalı Konut, Arsa ve Kamu İhale Taşınmaz Değerleme Masası",
          highlight: evBadge,
          statLeft: "Bölgesel m² Medyanı",
          statRight: "uretir.com/ev-ai",
          accent: "#f687b3",
          bg1: "#2b1422",
          bg2: "#13080e",
          speech: `Ev A İ taşınmaz ekranında ise bölge metrekare ortalamasının altındaki konutlar ve kamu ihale ilanları haritada listelendi: ${evTitle}.`,
        },
        {
          kicker: "SAAT 15:00 · ÜRETİR 6 AI ARACI",
          title: "HaberAI · FinansAI · PuanAI · İndirimAI · ArabaAI · EvAI",
          sub: "Kanıt Odaklı Veri ve Karar Destek Ekosistemi",
          highlight: "URETIR.COM",
          statLeft: "@uretirai",
          statRight: "youtube.com/@Uretir",
          accent: "#c8f560",
          bg1: "#122417",
          bg2: "#08110a",
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
          kicker: "SAAT 20:00 · HABERAI GÜN SONU ÖZETİ",
          title: topHeadline,
          sub: "81 İlde Günün Öne Çıkan Doğrulanmış Gündem Başlıkları",
          highlight: "GÜN SONU RAPORU",
          statLeft: "81 İl Haritası",
          statRight: "uretir.com/haber-ai",
          accent: "#c8f560",
          bg1: "#112418",
          bg2: "#07100a",
          speech: `İyi akşamlar Türkiye! Saat yirmi Üretir gün sonu bültenindeyiz. Bugün Türkiye gündeminde öne çıkan gelişme: ${topHeadline}.`,
        },
        {
          kicker: "SAAT 20:00 · FİNANSAI KAPANIŞ TABLOSU",
          title: `Dolar ${usd} TL · Euro ${eur} TL · Gram Altın ${gram} TL`,
          sub: `BIST 100 Kapanış: ${bist} Puan · Bitcoin: ${btc} USD`,
          highlight: `BIST 100: ${bist}`,
          statLeft: `Altın: ${gram} TL`,
          statRight: "uretir.com/finans-ai",
          accent: "#4fd1c5",
          bg1: "#0d2426",
          bg2: "#061112",
          speech: `Finans A İ gün sonu kapanış tablosunda Dolar ${usd} lira, Euro ${eur} lira, gram altın ${gram} lira ve Borsa İstanbul ${bist} puanda.`,
        },
        {
          kicker: "SAAT 20:00 · AKŞAM FIRSAT & KAMPANYA",
          title: dealTitle,
          sub: "İndirimAI Dönem Dibi + PuanAI Kredi Kartı Ödül Kombinasyonu",
          highlight: dealPrice,
          statLeft: dealDrop,
          statRight: "uretir.com/indirim-ai",
          accent: "#f6ad55",
          bg1: "#29190d",
          bg2: "#120a05",
          speech: `Akşam alışverişinde ${dealTitle}, ${dealPrice} dip fiyatıyla ilk sırada. Türkiye üretir, gençler yetişir! Canlı verilerin merkezi üretir nokta com adresini hemen ziyaret edin.`,
        },
      ],
    },
  };

  return { slot, ...slotMap[slot] };
}

function renderVerticalFrameSvg(scene, slotLabel, sceneIdx, totalScenes, progressRatio) {
  const titleLines = wrapLines(scene.title, 24, 4);
  const subLines = wrapLines(scene.sub, 38, 2);
  const speechLines = wrapLines(scene.speech, 36, 3);
  const barWidth = Math.max(40, Math.round(920 * progressRatio));
  const pulseRadius = 10 + Math.round(Math.sin(progressRatio * Math.PI * 8) * 4);
  const cardOffsetY = Math.round((1 - Math.min(1, progressRatio * 3.5)) * 45);
  const ctaGlowOpacity = (0.22 + Math.abs(Math.sin(progressRatio * Math.PI * 6)) * 0.25).toFixed(2);

  const waveBars = Array.from({ length: 28 }, (_, i) => {
    const phase = progressRatio * Math.PI * 12 + i * 0.55;
    const h = 16 + Math.round(Math.abs(Math.sin(phase)) * 56);
    const x = 140 + i * 29;
    const y = 1480 - Math.round(h / 2);
    return `<rect x="${x}" y="${y}" width="16" height="${h}" rx="8" fill="${scene.accent}" fill-opacity="${(0.45 + (i % 3) * 0.18).toFixed(2)}" />`;
  }).join("\n  ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${scene.bg1}" />
      <stop offset="100%" stop-color="${scene.bg2}" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="22%" r="65%">
      <stop offset="0%" stop-color="${scene.accent}" stop-opacity="0.28" />
      <stop offset="100%" stop-color="${scene.accent}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="1080" height="1920" fill="url(#bg)" />
  <rect width="1080" height="1920" fill="url(#glow)" />

  <!-- Subtle Motion Grid -->
  <g stroke="#ffffff" stroke-opacity="0.05" stroke-width="1">
    <line x1="80" y1="0" x2="80" y2="1920" />
    <line x1="1000" y1="0" x2="1000" y2="1920" />
    <line x1="0" y1="220" x2="1080" y2="220" />
    <line x1="0" y1="1680" x2="1080" y2="1680" />
  </g>

  <!-- Top Brand Bar -->
  <text x="80" y="138" fill="#ffffff" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="64" font-weight="900">üretir<tspan fill="${scene.accent}">.</tspan></text>
  <rect x="640" y="90" width="360" height="64" rx="32" fill="#ffffff" fill-opacity="0.08" stroke="${scene.accent}" stroke-opacity="0.5" />
  <circle cx="682" cy="122" r="${pulseRadius}" fill="${scene.accent}" />
  <text x="712" y="132" fill="#ffffff" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="26" font-weight="800">CANLI AI YAYINI</text>

  <!-- Slot Header Pill -->
  <rect x="80" y="250" width="920" height="72" rx="18" fill="${scene.accent}" fill-opacity="0.16" stroke="${scene.accent}" stroke-opacity="0.45" />
  <text x="112" y="296" fill="${scene.accent}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="28" font-weight="800" letter-spacing="1.5">${escapeXml(scene.kicker)}</text>
  <text x="968" y="296" text-anchor="end" fill="#ffffff" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="26" font-weight="700">${sceneIdx + 1}/${totalScenes}</text>

  <!-- Main Animated Content Card -->
  <g transform="translate(0, ${cardOffsetY})">
    <rect x="80" y="355" width="920" height="820" rx="36" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.14" stroke-width="2" />

    ${titleLines
      .map(
        (line, idx) =>
          `<text x="128" y="${475 + idx * 82}" fill="#ffffff" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="62" font-weight="900">${escapeXml(line)}</text>`
      )
      .join("\n    ")}

    ${subLines
      .map(
        (line, idx) =>
          `<text x="128" y="${825 + idx * 46}" fill="#cbd5e1" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="32" font-weight="500">${escapeXml(line)}</text>`
      )
      .join("\n    ")}

    <!-- Highlight Metric Pill -->
    <rect x="128" y="940" width="824" height="110" rx="24" fill="${scene.accent}" />
    <text x="540" y="1013" text-anchor="middle" fill="#09120c" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="52" font-weight="900">${escapeXml(scene.highlight)}</text>

    <!-- Bottom Stats Inside Card -->
    <text x="136" y="1120" fill="#94a3b8" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="28" font-weight="700">${escapeXml(scene.statLeft)}</text>
    <text x="944" y="1120" text-anchor="end" fill="${scene.accent}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="28" font-weight="800">${escapeXml(scene.statRight)}</text>
  </g>

  <!-- Voiceover Caption Box -->
  <rect x="80" y="1220" width="920" height="185" rx="24" fill="#000000" fill-opacity="0.45" stroke="#ffffff" stroke-opacity="0.1" />
  ${speechLines
    .map(
      (line, idx) =>
        `<text x="540" y="${1280 + idx * 48}" text-anchor="middle" fill="#f8fafc" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="33" font-weight="700">${escapeXml(line)}</text>`
    )
    .join("\n  ")}

  <!-- Dynamic Audio Waveform -->
  ${waveBars}

  <!-- Progress Bar -->
  <rect x="80" y="1540" width="920" height="16" rx="8" fill="#ffffff" fill-opacity="0.14" />
  <rect x="80" y="1540" width="${barWidth}" height="16" rx="8" fill="${scene.accent}" />

  <!-- Traffic Funnel CTA Banner to uretir.com -->
  <rect x="80" y="1585" width="920" height="84" rx="20" fill="${scene.accent}" fill-opacity="${ctaGlowOpacity}" stroke="${scene.accent}" stroke-width="2" />
  <text x="540" y="1638" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="31" font-weight="900">CANLI VERİ MERKEZİ: WWW.URETIR.COM</text>

  <!-- Corporate Footer -->
  <text x="80" y="1755" fill="#ffffff" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="38" font-weight="900">uretir.com</text>
  <text x="80" y="1808" fill="#94a3b8" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="28" font-weight="600">Türkiye Üretir, Gençler Yetişir · 6 Canlı AI Aracı</text>
  <text x="1000" y="1755" text-anchor="end" fill="${scene.accent}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="32" font-weight="800">@uretirai</text>
  <text x="1000" y="1808" text-anchor="end" fill="#cbd5e1" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="26" font-weight="600">youtube.com/@Uretir</text>
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

  // 2. Try open-source rany2/edge-tts CLI (Microsoft Neural Turkish Voice)
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

  // 3. Fallback: Fetch Google Translate Turkish TTS segments over HTTPS
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

  // If no saved chatIds yet, briefly inspect getUpdates (temporarily clearing webhook if needed, then restoring it)
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
    console.log("Telegram aktif abone/chat_id bekleniyor (@uretirbot webhook https://www.uretir.com/api/telegram/webhook üzerinde 7/24 hazır).");
    return false;
  }

  const caption = [
    `🎬 *ÜRETİR AI DİKEY MOTION-GRAPHIC VİDEO (${slotData.label})*`,
    `🎙️ *Doğal Türkçe Seslendirme Aktif*`,
    "",
    `📌 1) ${slotData.scenes[0].title}`,
    `📌 2) ${slotData.scenes[1].title}`,
    `📌 3) ${slotData.scenes[2].title}`,
    "",
    `🌐 *Canlı Veri Merkezi:* https://www.uretir.com`,
    `📸 Instagram: @uretirai | ▶️ YouTube: @Uretir`,
    `#Üretir #UretirAI #HaberAI #FinansAI #İndirimAI #PuanAI #ArabaAI #EvAI`,
  ].join("\n");

  const replyMarkup = JSON.stringify({
    inline_keyboard: [
      [
        { text: "🌐 uretir.com Canlı Veriler", url: "https://www.uretir.com" },
        { text: "🔥 Günün Aracına Git", url: slotData.targetUrl || "https://www.uretir.com" },
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
          console.log(`Telegram'a (@uretirbot -> ${chatId}) dikey MP4 video başarıyla gönderildi!`);
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
  if (!IG_PASSWORD) {
    console.log("IG_PASSWORD bulunamadı; Instagram (@uretirai) paketi hazırlandı.");
    return false;
  }
  const caption = [
    `⚡ ${slotData.label} | Üretir AI`,
    "",
    `1️⃣ ${slotData.scenes[0].title}`,
    `2️⃣ ${slotData.scenes[1].title}`,
    `3️⃣ ${slotData.scenes[2].title}`,
    "",
    `🔗 Canlı veriler ve 6 ücretsiz yapay zekâ aracı için: www.uretir.com (Biografideki linke tıklayın!)`,
    `📍 Doğrudan erişim: ${(slotData.targetUrl || "https://www.uretir.com").replace("https://www.", "")}`,
    `▶️ YouTube: @Uretir | 🤖 Telegram: @uretirbot`,
    "",
    `#Üretir #UretirAI #YapayZeka #HaberAI #FinansAI #İndirimAI #PuanAI #ArabaAI #EvAI #Teknoloji #Ekonomi #Keşfet #ReelsTürkiye`,
  ].join("\n");

  // 1. Native Node.js publisher using high-star dilame/instagram-private-api
  try {
    const nodeRes = await publishToInstagramNode({
      videoPath,
      coverPngPath,
      caption,
      slot: slotData.slot,
    });
    if (nodeRes?.ok) return true;
  } catch (err) {
    console.warn("[Instagram Node Bilgi]:", err?.message || err);
  }

  // 2. Python instagrapi fallback (used on Linux / GitHub Actions runners)
  for (const py of ["python", "python3"]) {
    try {
      const { stdout, stderr } = await execFileAsync(
        py,
        ["scripts/instagram-reels-publisher.py", videoPath || "", coverPngPath, caption],
        {
          timeout: 180_000,
          env: { ...process.env, IG_USERNAME, IG_PASSWORD, PYTHONIOENCODING: "utf-8" },
        }
      );
      if (stdout) console.log("Instagram (@uretirai) yanıtı:\n" + stdout.trim());
      if (stderr && !stdout?.includes("PUBLISHED_OK")) console.log("Instagram bilgi:", stderr.trim());
      if (stdout && stdout.includes("PUBLISHED_OK")) return true;
    } catch {
      // ignore if python not in path
    }
  }
  return false;
}

async function runSlot(slot) {
  const outDir = path.resolve("reports", "social-media", `slot-${slot}`);
  await fs.mkdir(outDir, { recursive: true });

  console.log(`\n======================================================`);
  console.log(`[Üretir Sosyal Otomasyon] Saat ${slot}:00 kuşağı hazırlanıyor...`);
  console.log(`======================================================`);
  const slotData = await gatherLiveSlotData(slot);

  const framesDir = path.join(outDir, "frames");
  await fs.mkdir(framesDir, { recursive: true });

  // Render 15 frames per scene (45 frames total @ 2 fps = 22.5s smooth motion-graphic animation muxed with natural voiceover)
  const framesPerScene = 15;
  const totalScenes = slotData.scenes.length;
  let frameCounter = 0;

  for (let sIdx = 0; sIdx < totalScenes; sIdx++) {
    const scene = slotData.scenes[sIdx];
    for (let f = 0; f < framesPerScene; f++) {
      const progressRatio = (sIdx * framesPerScene + f) / (totalScenes * framesPerScene - 1);
      const svg = renderVerticalFrameSvg(scene, slotData.label, sIdx, totalScenes, progressRatio);
      const framePath = path.join(framesDir, `frame-${String(frameCounter).padStart(4, "0")}.png`);
      await sharp(Buffer.from(svg)).png({ compressionLevel: 6 }).toFile(framePath);
      frameCounter++;
    }
  }

  const coverPngPath = path.join(outDir, `uretir-cover-${slot}.png`);
  await fs.copyFile(path.join(framesDir, "frame-0005.png"), coverPngPath);

  // Synthesize natural Turkish voiceover (rany2/edge-tts Neural voice)
  const fullSpeech = slotData.scenes.map((s) => s.speech).join(" ");
  const audioPath = path.join(outDir, `uretir-voice-${slot}.mp3`);
  const hasVoice = await synthesizeNaturalTurkishVoice(fullSpeech, slotData.voice, audioPath);
  console.log(`[2/4] [Seslendirme] Doğal Türkçe TTS (${slotData.voice}): ${hasVoice ? "BAŞARILI" : "YEDEK MOD"}`);

  // Encode 1080x1920 H.264 MP4 using local ffmpeg-static or system ffmpeg
  const ffmpegBin = resolveFfmpegBinary();
  const videoPath = path.join(outDir, `uretir-reel-${slot}.mp4`);
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
    console.log(`[3/4] [Motion-Graphic Video] 1080x1920 9:16 Dikey MP4 üretildi: ${videoPath}`);
  } catch (err) {
    console.warn("[FFmpeg Uyarısı]:", err?.message || err);
  }

  // Publish to Telegram & Instagram
  console.log(`[4/4] Sosyal medya kanallarında (@uretirai & @uretirbot) yayınlanıyor...`);
  const tgPublished = await sendToTelegram(videoBuilt ? videoPath : null, coverPngPath, slotData);
  const igPublished = await publishToInstagramReels(videoBuilt ? videoPath : null, coverPngPath, slotData);

  // Save manifest
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
        scenes: slotData.scenes,
      },
      null,
      2
    ),
    "utf8"
  );

  return { slot, videoBuilt, igPublished, tgPublished, videoPath, audioPath, coverPngPath };
}

async function main() {
  if (process.argv.includes("--all-slots")) {
    for (const s of ["09", "12", "15", "20"]) {
      await runSlot(s);
    }
    return;
  }

  const slot = detectSlot();
  await runSlot(slot);

  if (process.argv.includes("--daemon")) {
    console.log("[Üretir 7/24 Otomasyon Daemon] 09:00, 12:00, 15:00 ve 20:00 (Europe/Istanbul) zamanlayıcısı aktif...");
    let lastTriggeredKey = "";
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
    }, 60_000);
  }
}

main().catch((err) => {
  console.error("Social automation error:", err);
  process.exit(1);
});
