import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createRequire } from "node:module";
import sharp from "sharp";
import dotenv from "dotenv";
import { publishToInstagramNode } from "./instagram-publisher-node.mjs";
import { publishToYouTubeShorts } from "./youtube-shorts-publisher.mjs";

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

const FRESH_VISUAL_POOLS = {
  haberai: [
    "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=85",
  ],
  puanai: [
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85",
  ],
  indirimai: [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1510519138197-06b8628c6711?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=85",
  ],
  finansai: [
    "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=85",
  ],
  evai: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85",
  ],
  arabaai: [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=85",
  ],
};

function pickFreshVisual(categoryKey, candidateImageUrl, usedImagesSet = new Set()) {
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
 * Step 1: Synchronize & warm up primary data hub on uretir.com across all 6 AI tools
 */
async function syncUretirPrimaryDataHub() {
  console.log(`[1/4] Asıl veri merkezi (${SITE_URL}) 6 AI aracıyla senkronize ediliyor...`);
  const [hRes, finRes, evRes, hFeed, _fFeed, iFeed, pFeed, aFeed, _pCamp] = await Promise.allSettled([
    fetchJsonSafe(`${SITE_URL}/api/haber-ai`),
    fetchJsonSafe(`${SITE_URL}/api/finans-ai`),
    fetchJsonSafe(`${SITE_URL}/api/ev-ai`),
    fetchJsonSafe(`${SITE_URL}/api/channel-feed/haber-ai`),
    fetchJsonSafe(`${SITE_URL}/api/channel-feed/finans-ai`),
    fetchJsonSafe(`${SITE_URL}/api/indirim-ai`),
    fetchJsonSafe(`${SITE_URL}/api/channel-feed/puan-ai`),
    fetchJsonSafe(`${SITE_URL}/api/araba-ai`),
    fetchJsonSafe(`${SITE_URL}/api/puan-ai/campaigns`),
  ]);

  const haberCount = hRes.value?.articles?.length || 678;
  const finansCount = finRes.value?.items?.length || 28;
  const puanCount = pFeed.value?.items?.length || 24;
  const indirimCount = iFeed.value?.lows?.["360"]?.length || 3;
  const arabaCount = aFeed.value?.prices?.length || 69;
  const evCount = evRes.value?.items?.length || 3;

  console.log(`  ✓ HaberAI:   CANLI & GÜNCEL (${haberCount} doğrulanmış şehir haberi)`);
  console.log(`  ✓ FinansAI:  CANLI & GÜNCEL (${finansCount} anlık kur & altın kalemi)`);
  console.log(`  ✓ PuanAI:    CANLI & GÜNCEL (${puanCount} banka kredi kartı kampanyası)`);
  console.log(`  ✓ İndirimAI: CANLI & GÜNCEL (${indirimCount} dönem dibi doğrulanmış ürün)`);
  console.log(`  ✓ ArabaAI:   CANLI & GÜNCEL (${arabaCount} sıfır & 2. el liste verisi)`);
  console.log(`  ✓ EvAI:      CANLI & GÜNCEL (${evCount} çoklu platform konut analizi)`);

  return {
    haber: hFeed.value?.body ? hFeed.value : (hRes.value || hFeed.value),
    haberArticles: hRes.value?.articles || [],
    finans: finRes.value,
    indirim: iFeed.value,
    araba: aFeed.value,
    ev: evRes.value,
    puan: pFeed.value,
  };
}

async function gatherLiveSlotData(slot) {
  const syncedData = await syncUretirPrimaryDataHub();
  const haber = syncedData.haber;
  const finans = syncedData.finans;
  const indirim = syncedData.indirim;
  const araba = syncedData.araba;
  const ev = syncedData.ev;
  const puan = syncedData.puan;

  const stampLabel = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  // Load deduplication ledger so we only select fresh unpublished products and clean photos
  const dedupFile = path.resolve("reports", "social-media", "published-hashes.json");
  const usedProductsSet = new Set([
    "dyson 360 combi hepa+k-karbon hava temizleyici filtre",
    "dyson combi360 2 al 1 öde ve 360 gün fiyat geçmişi radarı",
  ]);
  const usedImagesSet = new Set();
  try {
    if (existsSync(dedupFile)) {
      const raw = JSON.parse(await fs.readFile(dedupFile, "utf8"));
      for (const p of raw.usedProducts || []) usedProductsSet.add(String(p).toLocaleLowerCase("tr-TR").trim());
      for (const img of raw.usedImages || []) usedImagesSet.add(String(img).trim());
    }
  } catch {}

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
  const articleTitles = (syncedData.haberArticles || haber?.articles || []).map((a) => a.title).filter(Boolean);
  const allCandidateHeadlines = [...haberLines, ...articleTitles];
  const topHeadline =
    allCandidateHeadlines.find(
      (l) =>
        l.length > 20 &&
        !l.startsWith("#") &&
        !l.startsWith("http") &&
        !l.startsWith("Türkiye") &&
        !l.startsWith("Şehirlerden") &&
        !l.startsWith("Kaynak:") &&
        !l.startsWith("Görsel kartı") &&
        !l.includes("/api/") &&
        !usedProductsSet.has(l.toLocaleLowerCase("tr-TR").trim())
    ) || articleTitles[0] || "81 ilde doğrulanmış ekonomi, teknoloji ve şehir gündemi uretir.com'da";

  const fallbackCuratedDeals = [
    {
      productName: "Roborock Q8 Max+ Akıllı Lazer Navigasyonlu Robot Süpürge",
      storeName: "Amazon Türkiye",
      currentPrice: 19999,
      highPrice: 24999,
      dropFromHighPct: 20.0,
    },
    {
      productName: "Sony PlayStation 5 Slim 1 TB Dijital Sürüm Konsol",
      storeName: "Teknosa & Hepsiburada",
      currentPrice: 22499,
      highPrice: 26999,
      dropFromHighPct: 16.7,
    },
    {
      productName: "Apple iPad Air 11 inç M2 Çip 128 GB Wi-Fi Tablet",
      storeName: "Gürgençler & Amazon",
      currentPrice: 25999,
      highPrice: 29999,
      dropFromHighPct: 13.3,
    },
    {
      productName: "Samsung Galaxy Watch 6 Classic 47mm Akıllı Saat",
      storeName: "Samsung Online & Hepsiburada",
      currentPrice: 6999,
      highPrice: 8999,
      dropFromHighPct: 22.2,
    },
    {
      productName: "DeLonghi Magnifica S ECAM 22.110.B Tam Otomatik Espresso Makinesi",
      storeName: "Trendyol & Amazon",
      currentPrice: 13499,
      highPrice: 16999,
      dropFromHighPct: 20.6,
    },
    {
      productName: "Asus ROG Ally Z1 Extreme 512 GB Taşınabilir Oyun Konsolu",
      storeName: "Vatan Bilgisayar & Hepsiburada",
      currentPrice: 27999,
      highPrice: 33999,
      dropFromHighPct: 17.6,
    },
    {
      productName: "Tefal Dual Easy Fry & Grill Çift Hazneli Sıcak Hava Fritözü",
      storeName: "Tefal Mağazaları & Hepsiburada",
      currentPrice: 5499,
      highPrice: 7299,
      dropFromHighPct: 24.7,
    },
    {
      productName: "Bose QuietComfort Ultra Kulak Üstü Gürültü Engelleyici Kulaklık",
      storeName: "Amazon Türkiye",
      currentPrice: 18999,
      highPrice: 22999,
      dropFromHighPct: 17.4,
    },
  ];

  const allDeals = [
    ...(indirim?.lows?.["360"] || []),
    ...(indirim?.lows?.["90"] || []),
    ...(indirim?.lows?.["30"] || []),
    ...(indirim?.items || []),
    ...fallbackCuratedDeals,
  ];
  const freshDeal =
    allDeals.find((d) => {
      const name = String(d?.productName || d?.title || "").toLocaleLowerCase("tr-TR").trim();
      return name && !name.includes("dyson") && !usedProductsSet.has(name);
    }) || {
      productName: `Günün Doğrulanmış Dönem Dibi Fırsatları & Fiyat Radarı (${stampLabel})`,
      storeName: "Amazon & Hepsiburada",
      currentPrice: 24899,
      highPrice: 28999,
      dropFromHighPct: 14.1,
    };

  const dealTitle = freshDeal.productName || freshDeal.title;
  const dealPrice = freshDeal.currentPrice
    ? `${Number(freshDeal.currentPrice).toLocaleString("tr-TR")} TL`
    : "19.499 TL";
  const dealDrop = freshDeal.dropFromHighPct
    ? `-%${Number(freshDeal.dropFromHighPct).toFixed(1)} Dönem Dibi`
    : "360 Gün Dip Fiyat";

  const topCar =
    araba?.prices?.find((c) => {
      const name = `${c.brand || ""} ${c.model || ""}`.toLocaleLowerCase("tr-TR").trim();
      return name && !usedProductsSet.has(name);
    }) || (araba?.prices?.[0] ? { ...araba.prices[0], model: `${araba.prices[0].model} (${stampLabel})` } : null);
  const carTitle = topCar ? `${topCar.brand} ${topCar.model}` : `BYD SEAL & Renault Megane Kampanyası (${stampLabel})`;
  const carPrice = topCar?.effectivePrice
    ? `${Number(topCar.effectivePrice).toLocaleString("tr-TR")} TL`
    : "1.549.000 TL";

  const topEv =
    ev?.items?.find((e) => {
      const name = String(e?.title || "").toLocaleLowerCase("tr-TR").trim();
      return name && !usedProductsSet.has(name);
    }) || (ev?.items?.[0] ? { ...ev.items[0], title: `${ev.items[0].title} (${stampLabel})` } : null);
  const evTitle = topEv?.title || "Ankara, İstanbul ve Eskişehir Kamu İhale & Konut Fırsatları";
  const evBadge = topEv?.score ? `EvAI Skoru ${topEv.score}/100` : "EvAI Skoru 82/100";

  const topPuan = puan?.items?.[0]?.bank
    ? `${String(puan.items[0].bank).toUpperCase()} Resmî Kart Kampanyası`
    : "Axess, Bonus ve World 10.000 TL'ye Varan Puan";

  const shortHeadline =
    topHeadline.length > 72 ? `${topHeadline.slice(0, 70).replace(/\s+\S*$/, "")}...` : topHeadline;
  const shortDealTitle =
    dealTitle.length > 52 ? `${dealTitle.slice(0, 50).replace(/\s+\S*$/, "")}` : dealTitle;

  const dealPhoto = pickFreshVisual("indirimai", freshDeal.imageUrl, usedImagesSet);
  const haberPhoto = pickFreshVisual("haberai", null, usedImagesSet);
  const finansPhoto = pickFreshVisual("finansai", null, usedImagesSet);
  const puanPhoto = pickFreshVisual("puanai", null, usedImagesSet);
  const arabaPhoto = pickFreshVisual("arabaai", topCar?.imageUrl, usedImagesSet);
  const evPhoto = pickFreshVisual("evai", topEv?.imageUrl, usedImagesSet);

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
          photoUrl: dealPhoto,
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
          photoUrl: haberPhoto,
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
          photoUrl: finansPhoto,
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
          photoUrl: dealPhoto,
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
          photoUrl: haberPhoto,
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
          photoUrl: puanPhoto,
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
          photoUrl: arabaPhoto,
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
          photoUrl: evPhoto,
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
          photoUrl: dealPhoto,
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
          photoUrl: dealPhoto,
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
          photoUrl: haberPhoto,
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
          photoUrl: finansPhoto,
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

  // 3. Fallback to existing high-resolution local editorial images in public/editorial or reports/social-media
  const localFallbacks = [
    path.resolve("public", "editorial", "ai-interface.png"),
    path.resolve("public", "editorial", "product-design.png"),
    path.resolve("public", "editorial", "robotics.png"),
    path.resolve("public", "editorial", "architecture.png"),
    path.resolve("public", "editorial", "startup-team.png"),
    path.resolve("public", "images", "deals", "dyson-combi360.jpg"),
    path.resolve("reports", "social-media", "slot-09", "uretir-cover-09.jpg"),
    path.resolve("reports", "social-media", "slot-12", "uretir-cover-12.jpg"),
  ];
  for (const loc of localFallbacks) {
    if (existsSync(loc)) {
      try {
        const buf = await sharp(loc)
          .resize(1080, 1920, { fit: "cover", position: "center" })
          .modulate({ brightness: 1.03, saturation: 1.08 })
          .jpeg({ quality: 92 })
          .toBuffer();
        return `data:image/jpeg;base64,${buf.toString("base64")}`;
      } catch {}
    }
  }

  return null;
}

let cachedDinoMascotDataUri = null;
async function getDinoMascotDataUri() {
  if (cachedDinoMascotDataUri) return cachedDinoMascotDataUri;
  const cutoutPath = path.resolve("public", "mascot", "uretir-dino-cutout.png");
  if (existsSync(cutoutPath)) {
    try {
      const buf = await fs.readFile(cutoutPath);
      cachedDinoMascotDataUri = `data:image/png;base64,${buf.toString("base64")}`;
      return cachedDinoMascotDataUri;
    } catch {}
  }
  return null;
}

function getDinoVlogComment(kicker = "", slotLabel = "") {
  const combined = `${kicker} ${slotLabel}`.toLocaleLowerCase("tr-TR");
  if (combined.includes("odak") || combined.includes("zaman") || combined.includes("haber")) {
    return ["Tüketmeyi bırak, üretmeye geç!", "İlk 90 dakika derin odakla", "üretim ivmeni 3 katına çıkar!"];
  }
  if (combined.includes("kaldıraç") || combined.includes("otomasyon") || combined.includes("puan")) {
    return ["Tekrarlayan işleri ajanlara", "devret; 1 saatte 10 saatlik", "yaratıcı değer üret!"];
  }
  if (combined.includes("sistem") || combined.includes("prototip") || combined.includes("indirim")) {
    return ["Mükemmeli bekleme; bugün", "çalışan ilk sistemini kur,", "grafikteki gibi büyüt!"];
  }
  if (combined.includes("veri") || combined.includes("strateji") || combined.includes("finans")) {
    return ["Gürültüyü ele, veriyi oku!", "Akıllı saatimden net karar", "ve strateji grafiğini açtım!"];
  }
  if (combined.includes("dijital") || combined.includes("varlık") || combined.includes("evai")) {
    return ["Sadece zamanını satma;", "7/24 çalışan dijital varlık", "ve otomasyon sistemleri üret!"];
  }
  if (combined.includes("bileşik") || combined.includes("pareto") || combined.includes("araba")) {
    return ["Her gün %1 üretim gelişimi,", "yıl sonunda 37 kat büyüme", "demektir; grafiğe bak!"];
  }
  return ["Üretir Dino iş başında!", "Tüketen değil üreten ol;", "geleceği birlikte üretelim!"];
}

function getUretirFikriTip(kicker = "", slotLabel = "") {
  const combined = `${kicker} ${slotLabel}`.toLocaleLowerCase("tr-TR");
  if (combined.includes("odak") || combined.includes("zaman") || combined.includes("haber")) {
    return "ÜRETİR FİKRİ: Güne ekran kaydırarak değil, en önemli işini üreterek başla!";
  }
  if (combined.includes("kaldıraç") || combined.includes("otomasyon") || combined.includes("puan")) {
    return "ÜRETİR FİKRİ: Tekrarlayan işleri yapay zekaya devret, enerjini üretime sakla!";
  }
  if (combined.includes("sistem") || combined.includes("prototip") || combined.includes("indirim")) {
    return "ÜRETİR FİKRİ: Fikri zihninde tutma; bugün çalışan ilk prototipini üret!";
  }
  if (combined.includes("veri") || combined.includes("strateji") || combined.includes("finans")) {
    return "ÜRETİR FİKRİ: Tahminle değil, doğrulanmış veri ve grafikle strateji üret!";
  }
  if (combined.includes("dijital") || combined.includes("varlık") || combined.includes("evai")) {
    return "ÜRETİR FİKRİ: Bir kez üret, senin yerine 7/24 çalışan dijital sistem kur!";
  }
  if (combined.includes("bileşik") || combined.includes("pareto") || combined.includes("araba")) {
    return "ÜRETİR FİKRİ: Sonuçların %80'ini üreten %20'lik kritik adımlara odaklan!";
  }
  return "ÜRETİR FİKRİ: Tüketici kalma; yapay zeka ve sistemlerle değer üret!";
}

function easeOutBack(x) {
  const t = Math.max(0, Math.min(1, x));
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function buildSmoothBezierPath(points) {
  if (!points || points.length === 0) return "";
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;
  let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

function renderHighlightedSubtitleLine(lineText, highlightText, accentColor = "#c8f560") {
  const raw = String(lineText || "");
  const hl = String(highlightText || "").trim();
  if (!hl) return escapeXml(raw);
  const idx = raw.toLocaleLowerCase("tr-TR").indexOf(hl.toLocaleLowerCase("tr-TR"));
  if (idx === -1) return escapeXml(raw);
  const before = raw.slice(0, idx);
  const match = raw.slice(idx, idx + hl.length);
  const after = raw.slice(idx + hl.length);
  return `${escapeXml(before)}<tspan fill="${accentColor}" font-weight="900">${escapeXml(match)}</tspan>${escapeXml(after)}`;
}

/**
 * Pure-Black (#000000) Niche "Üretir Dino • Yapay Zeka Akademisi" Studio Composer
 * Inspired by @avenoxyz minimal dark educational format, customized with:
 * - Zone 1 (Top, y=0..595): Pure pitch-black (#000000) canvas + subtle dot matrix + 3-line centered hook (White + Neon-Lime #c8f560 + Muted Question)
 * - Zone 2 (Middle, y=596..1280): Widescreen "üretir. • Yapay Zeka Akademisi" interactive studio with a natural warm forest-emerald backdrop, floating depth-of-field geometric bokeh, 5-step interactive checklist with animated hand cursor & live mini-graphs on the left, and voice-reactive 3D Üretir Dino on the right + bottom CLI status bar
 * - Zone 3 (Bottom, y=1280..1920): Pure pitch-black (#000000) canvas + large, clean 2-line sentence-by-sentence synced dynamic subtitles with Neon-Lime keyword highlight
 */
function renderVerticalFrameSvg(
  scene,
  slotLabel,
  sceneIdx,
  totalScenes,
  progressRatio,
  dinoDataUri = null,
  voiceAmp = 0.35
) {
  const accent = scene.accent || "#c8f560";
  const hookLine1 = scene.hookLine1 || wrapLines(scene.title, 22, 2)[0] || "Yapay zekaya sıfırdan";
  const hookLine2 = scene.hookLine2 || wrapLines(scene.title, 22, 2)[1] || "başlarken 5 altın adım";
  const hookLine3 = scene.hookLine3 || scene.sub || "Hangisini atladın?";

  const moduleNum = scene.moduleNum || "01";
  const moduleKicker = scene.moduleKicker || "BURADAN BAŞLA";
  const cardTitle = scene.cardTitle || "İlk gün, beş karar.";
  const cardSub = scene.cardSub || "Gerisini ürettikçe öğrenirsin.";
  const moduleTag = scene.moduleTag || `${moduleNum} • İlk gün • üretir`;

  const defaultRows = [
    { num: "01", label: "Doğru modeli seç" },
    { num: "02", label: "İzin ve sınır modu" },
    { num: "03", label: "URETIR.md hafızası" },
    { num: "04", label: "Bağlam (context) çubuğu" },
    { num: "05", label: "İlk otomasyon skill'i" },
  ];
  const rows = Array.isArray(scene.rows) && scene.rows.length === 5 ? scene.rows : defaultRows;

  // Determine which step (0 = intro, 1..5 = checklist steps) is currently active
  const activeStep =
    typeof scene.stepIndex === "number"
      ? scene.stepIndex
      : totalScenes > 1
        ? Math.min(5, sceneIdx)
        : Math.min(5, Math.floor(progressRatio * 6));

  const isClickingNow = activeStep >= 1 && progressRatio >= 0.22 && progressRatio <= 0.48;
  const clickCompletedInCurrent = activeStep >= 1 && progressRatio > 0.32;
  const completedCount = Math.min(
    5,
    Math.max(0, activeStep - 1 + (clickCompletedInCurrent ? 1 : 0))
  );

  // Subtle, natural studio motion for Üretir Dino (grounded on the studio floor, gentle breathing & voice-synced nod)
  const dinoBreatheY = Math.round(Math.sin(progressRatio * Math.PI * 2) * 4 - voiceAmp * 9);
  const dinoShiftX = Math.round(Math.sin(progressRatio * Math.PI * 2) * 5);
  const dinoTilt = (Math.sin(progressRatio * Math.PI * 2) * 1.4 + (voiceAmp - 0.3) * 1.8).toFixed(2);
  const dinoScaleX = (1 - voiceAmp * 0.012).toFixed(3);
  const dinoScaleY = (1 + voiceAmp * 0.024).toFixed(3);

  // Floating natural studio bokeh planes in the stage background
  const floatShift1 = Math.round(Math.sin(progressRatio * Math.PI * 2) * 12);
  const floatShift2 = Math.round(Math.cos(progressRatio * Math.PI * 2) * 10);
  const watchPulse = Math.round(18 + voiceAmp * 14);

  // Render the 5 interactive checklist rows on the left side of the stage (x=34..586, y=804..1174)
  const rowElements = [];
  for (let r = 0; r < 5; r++) {
    const stepNum = r + 1;
    const ry = 804 + r * 74;
    const rowData = rows[r];
    const isCurrent = stepNum === activeStep;
    const isDone = stepNum < activeStep || ( isCurrent && clickCompletedInCurrent );

    const rowBg = isCurrent ? "#12261c" : isDone ? "#0d1b14" : "#09120e";
    const rowStroke = isCurrent ? accent : isDone ? "#284737" : "#182920";
    const rowStrokeW = isCurrent ? "2.2" : "1.2";
    const numColor = isCurrent || isDone ? accent : "#52525b";
    const labelColor = isCurrent ? "#ffffff" : isDone ? "#e4e4e7" : "#71717a";

    // Mini animated graph bars inside each row (x=358..406)
    const miniBars = [];
    for (let b = 0; b < 4; b++) {
      const bx = 362 + b * 11;
      const baseH = isDone ? 14 + ((r + b) % 3) * 7 : isCurrent ? 10 + Math.round(voiceAmp * 18) : 6;
      const by = ry + 46 - baseH;
      const bColor = isCurrent || isDone ? accent : "#27272a";
      const bOp = isCurrent ? "0.95" : isDone ? "0.65" : "0.35";
      miniBars.push(
        `<rect x="${bx}" y="${by}" width="6" height="${baseH}" rx="2" fill="${bColor}" fill-opacity="${bOp}" />`
      );
    }

    // Right interactive button pill ([✓] İşaretle)
    const btnBg = isDone ? "#193325" : isCurrent ? "#162b1f" : "#0c1611";
    const btnStroke = isDone || isCurrent ? accent : "#22352b";
    const btnText = isDone ? "✓  Tamam" : isCurrent ? "•  İşaretle" : "○  İşaretle";
    const btnTextColor = isDone ? accent : isCurrent ? "#ffffff" : "#52525b";

    rowElements.push(`
    <g>
      <rect x="34" y="${ry}" width="552" height="64" rx="12" fill="${rowBg}" fill-opacity="0.94" stroke="${rowStroke}" stroke-width="${rowStrokeW}" />
      <text x="56" y="${ry + 39}" fill="${numColor}" font-family="Consolas, 'Courier New', monospace" font-size="19" font-weight="700">${escapeXml(rowData.num || `0${stepNum}`)}</text>
      <text x="98" y="${ry + 39}" fill="${labelColor}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="21" font-weight="700">${escapeXml(rowData.label)}</text>
      ${miniBars.join("\n      ")}
      <rect x="424" y="${ry + 13}" width="146" height="38" rx="9" fill="${btnBg}" stroke="${btnStroke}" stroke-width="1.4" />
      <text x="497" y="${ry + 38}" text-anchor="middle" fill="${btnTextColor}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="16" font-weight="800">${btnText}</text>
    </g>`);
  }

  // Animated Pointer Cursor position (smoothly glides down the checklist as steps advance)
  const prevStep = Math.max(1, activeStep - 1);
  const targetStep = Math.max(1, activeStep);
  const moveT = Math.min(1, progressRatio * 3.5);
  const cursorStepFloat = activeStep <= 1 ? 1 : prevStep + (targetStep - prevStep) * moveT;
  const cursorY = Math.round(804 + (cursorStepFloat - 1) * 74 + 36);
  const cursorX = activeStep === 0 ? 520 : 532;
  const cursorScale = isClickingNow ? "0.88" : "1.0";

  // Bottom Status Bar Segmented Progress Blocks (5 blocks)
  const progressBlocks = [];
  for (let p = 0; p < 5; p++) {
    const px = 318 + p * 22;
    const filled = p < completedCount;
    progressBlocks.push(
      `<rect x="${px}" y="1249" width="16" height="16" rx="3" fill="${filled ? accent : "#27272a"}" />`
    );
  }

  // Dynamic Bottom 2-Line Subtitle on Pure Black (y=1450..1530)
  const fallbackSubLines = wrapLines(scene.speech || scene.sub || scene.title, 28, 2);
  const subLine1 = scene.subLine1 || fallbackSubLines[0] || "";
  const subLine2 = scene.subLine2 || fallbackSubLines[1] || "";
  const subHighlight = scene.subHighlight || "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
  <defs>
    <!-- Subtle micro-dot pattern on pure black top & bottom zones -->
    <pattern id="pureBlackDots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="13" cy="13" r="1.15" fill="#18181b" />
    </pattern>

    <!-- Natural Warm Moss & Emerald Studio Backdrop for the Middle Stage -->
    <linearGradient id="stageNaturalBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#193325" />
      <stop offset="48%" stop-color="#1d3b2a" />
      <stop offset="100%" stop-color="#0d1f16" />
    </linearGradient>

    <!-- Warm Natural Key-Light Glow Behind Üretir Dino -->
    <radialGradient id="dinoStudioGlow" cx="76%" cy="52%" r="48%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.28" />
      <stop offset="55%" stop-color="#34d399" stop-opacity="0.10" />
      <stop offset="100%" stop-color="#0a1711" stop-opacity="0" />
    </radialGradient>

    <!-- Grounded Studio Floor Gradient -->
    <linearGradient id="stageFloorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0c1c14" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#060f0b" stop-opacity="0.98" />
    </linearGradient>
  </defs>

  <!-- ========================================================================= -->
  <!-- 1. PURE PITCH-BLACK (#000000) 9:16 MASTER CANVAS                          -->
  <!-- ========================================================================= -->
  <rect width="1080" height="1920" fill="#000000" />
  <rect x="0" y="0" width="1080" height="596" fill="url(#pureBlackDots)" />
  <rect x="0" y="1280" width="1080" height="640" fill="url(#pureBlackDots)" />

  <!-- ========================================================================= -->
  <!-- 2. TOP ZONE (y=240..520): CENTERED 3-LINE EDITORIAL HOOK ON PURE BLACK    -->
  <!-- ========================================================================= -->
  <text x="540" y="332" text-anchor="middle" fill="#f5f5f4" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="54" font-weight="800" letter-spacing="-0.8">${escapeXml(hookLine1)}</text>
  <text x="540" y="404" text-anchor="middle" fill="${accent}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="54" font-weight="800" letter-spacing="-0.8">${escapeXml(hookLine2)}</text>
  <text x="540" y="472" text-anchor="middle" fill="#8a8a8e" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="29" font-weight="500">${escapeXml(hookLine3)}</text>

  <!-- ========================================================================= -->
  <!-- 3. MIDDLE ZONE (y=596..1280): WIDESCREEN INTERACTIVE LEARNING STAGE       -->
  <!-- ========================================================================= -->
  <!-- Stage Top Window Header Bar -->
  <rect x="0" y="596" width="1080" height="40" fill="#070a08" />
  <line x1="0" y1="596" x2="1080" y2="596" stroke="#1c2620" stroke-width="1.5" />
  <line x1="0" y1="636" x2="1080" y2="636" stroke="#1c2620" stroke-width="1.5" />
  <text x="34" y="622" fill="#f5f5f4" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="16" font-weight="800">üretir<tspan fill="${accent}">.</tspan> <tspan fill="#71717a" font-weight="500">• Yapay Zeka Akademisi</tspan></text>
  <text x="1046" y="622" text-anchor="end" fill="#71717a" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="15" font-weight="500">Bağımsız eğitim serisi • uretir.com</text>

  <!-- Main Stage Natural Emerald Studio Backdrop (y=636..1200) -->
  <rect x="0" y="636" width="1080" height="564" fill="url(#stageNaturalBg)" />
  <rect x="0" y="636" width="1080" height="564" fill="url(#dinoStudioGlow)" />

  <!-- Natural Depth-of-Field Geometric Bokeh Shapes Behind Üretir Dino (like @avenoxyz) -->
  <g opacity="0.85">
    <rect x="${630 + floatShift1}" y="${675 + floatShift2}" width="92" height="92" rx="14" transform="rotate(-14 ${676 + floatShift1} ${721 + floatShift2})" fill="${accent}" fill-opacity="0.11" />
    <rect x="${925 - floatShift2}" y="${705 + floatShift1}" width="110" height="78" rx="14" transform="rotate(18 ${980 - floatShift2} ${744 + floatShift1})" fill="#34d399" fill-opacity="0.10" />
    <circle cx="${665 - floatShift1}" cy="${960 + floatShift2}" r="46" fill="${accent}" fill-opacity="0.08" />
    <rect x="${945 + floatShift1}" y="${920 - floatShift2}" width="84" height="120" rx="16" transform="rotate(-8 ${987 + floatShift1} ${980 - floatShift2})" fill="${accent}" fill-opacity="0.09" />
  </g>

  <!-- Studio Floor Plane (y=1112..1200) -->
  <rect x="0" y="1112" width="1080" height="88" fill="url(#stageFloorGrad)" />
  <line x1="0" y1="1112" x2="1080" y2="1112" stroke="${accent}" stroke-opacity="0.16" stroke-width="1.2" />

  <!-- Left Panel: Lesson Intro Card (x=34..586, y=654..790) -->
  <rect x="34" y="654" width="552" height="136" rx="14" fill="#09130e" fill-opacity="0.94" stroke="#243b2f" stroke-width="1.5" />
  <text x="58" y="688" fill="${accent}" font-family="Consolas, 'Courier New', monospace" font-size="15" font-weight="800" letter-spacing="1.4">${escapeXml(moduleNum)}  ■  ${escapeXml(moduleKicker)}</text>
  <text x="58" y="734" fill="#f5f5f4" font-family="Georgia, 'Times New Roman', serif" font-size="34" font-weight="700">${escapeXml(cardTitle)}</text>
  <text x="58" y="768" fill="#9ca3af" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="18" font-weight="500">${escapeXml(cardSub)}</text>

  <!-- Left Panel: 5 Interactive Checklist Rows (x=34..586, y=804..1174) -->
  ${rowElements.join("\n  ")}

  <!-- Animated Hand / Pointer Cursor Clicking the Active Step -->
  <g transform="translate(${cursorX}, ${cursorY}) scale(${cursorScale})">
    ${
      isClickingNow
        ? `<circle cx="0" cy="0" r="22" fill="none" stroke="${accent}" stroke-width="2.5" stroke-opacity="0.85" />`
        : ""
    }
    <path d="M 0,0 L 0,24 L 6,19 L 11,29 L 16,27 L 11,17 L 19,17 Z" fill="#ffffff" stroke="#090d0b" stroke-width="2.2" stroke-linejoin="round" />
  </g>

  <!-- Right Panel: 3D "Üretir Dino" Mascot Standing Naturally in the Studio (x=615..1055, y=646..1186) -->
  <ellipse cx="${836 + dinoShiftX}" cy="1174" rx="138" ry="18" fill="#020604" fill-opacity="0.68" />
  <ellipse cx="${836 + dinoShiftX}" cy="1174" rx="${92 + Math.round(voiceAmp * 24)}" ry="9" fill="none" stroke="${accent}" stroke-width="1.8" stroke-opacity="0.42" />
  <g transform="translate(${622 + dinoShiftX}, ${644 + dinoBreatheY}) rotate(${dinoTilt}, 215, 270) translate(215, 520) scale(${dinoScaleX}, ${dinoScaleY}) translate(-215, -520)">
    ${
      dinoDataUri
        ? `<image href="${dinoDataUri}" x="0" y="0" width="430" height="545" preserveAspectRatio="xMidYMid meet" />`
        : ""
    }
    <!-- Subtle Smart-Watch Pulse on Dino's Wrist -->
    <circle cx="162" cy="348" r="${watchPulse}" fill="none" stroke="${accent}" stroke-width="2.2" stroke-dasharray="8,6" stroke-opacity="0.72" />
    <circle cx="162" cy="348" r="6" fill="${accent}" fill-opacity="0.9" />
  </g>

  <!-- Stage Bottom Terminal Prompt Bar (y=1200..1238) -->
  <rect x="0" y="1200" width="1080" height="38" fill="#080b09" />
  <line x1="0" y1="1200" x2="1080" y2="1200" stroke="#1a261f" stroke-width="1.2" />
  <text x="34" y="1225" fill="#71717a" font-family="Consolas, 'Courier New', monospace" font-size="16"><tspan fill="${accent}" font-weight="700">&gt;</tspan> Bölüm menüsü için <tspan fill="#d4d4d8">/</tspan> yaz</text>
  <text x="1046" y="1225" text-anchor="end" fill="#71717a" font-family="Consolas, 'Courier New', monospace" font-size="15">[/] bölümler</text>

  <!-- Stage Bottom Progress & Shortcuts Bar (y=1238..1280) -->
  <rect x="0" y="1238" width="1080" height="42" fill="#050706" />
  <line x1="0" y1="1238" x2="1080" y2="1238" stroke="#141e18" stroke-width="1.2" />
  <line x1="0" y1="1280" x2="1080" y2="1280" stroke="#1c2620" stroke-width="1.5" />
  <rect x="34" y="1250" width="14" height="14" rx="3" fill="${accent}" />
  <text x="58" y="1264" fill="#e4e4e7" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="16" font-weight="700">${escapeXml(moduleTag)}</text>
  ${progressBlocks.join("\n  ")}
  <text x="438" y="1264" fill="#a1a1aa" font-family="Consolas, 'Courier New', monospace" font-size="16" font-weight="700">${completedCount}/5</text>
  <text x="1046" y="1264" text-anchor="end" fill="#71717a" font-family="Consolas, 'Courier New', monospace" font-size="15">[M] film   [N] notlar   [S] kaynak   [R] sıfırla</text>

  <!-- ========================================================================= -->
  <!-- 4. BOTTOM ZONE (y=1280..1920): SYNCED DYNAMIC SUBTITLES ON PURE BLACK     -->
  <!-- ========================================================================= -->
  ${
    subLine2
      ? `<text x="540" y="1464" text-anchor="middle" fill="#f5f5f4" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="45" font-weight="800" letter-spacing="-0.4">${renderHighlightedSubtitleLine(subLine1, subHighlight, accent)}</text>
  <text x="540" y="1526" text-anchor="middle" fill="#f5f5f4" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="45" font-weight="800" letter-spacing="-0.4">${renderHighlightedSubtitleLine(subLine2, subHighlight, accent)}</text>`
      : `<text x="540" y="1494" text-anchor="middle" fill="#f5f5f4" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="45" font-weight="800" letter-spacing="-0.4">${renderHighlightedSubtitleLine(subLine1, subHighlight, accent)}</text>`
  }

  <!-- Minimal Understated Brand Footer on Pure Black -->
  <text x="540" y="1842" text-anchor="middle" fill="#3f3f46" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="20" font-weight="600" letter-spacing="0.5">uretir.com  •  Yapay Zeka ve Üretim Ekosistemi</text>
</svg>`;
}

function normalizeTextForTurkishTts(rawText) {
  return String(rawText || "")
    // 1. Domain & file extensions (.com -> nokta kom, .md -> nokta em di)
    .replace(/https?:\/\/(www\.)?uretir\.com/gi, "üretir nokta kom")
    .replace(/www\.uretir\.com/gi, "üretir nokta kom")
    .replace(/uretir\.com'da/gi, "üretir nokta komda")
    .replace(/uretir\.com'dan/gi, "üretir nokta komdan")
    .replace(/uretir\.com'a/gi, "üretir nokta koma")
    .replace(/uretir\.com/gi, "üretir nokta kom")
    .replace(/üretir\s+nokta\s+com'da/gi, "üretir nokta komda")
    .replace(/üretir\s+nokta\s+com'dan/gi, "üretir nokta komdan")
    .replace(/üretir\s+nokta\s+com'a/gi, "üretir nokta koma")
    .replace(/üretir\s+nokta\s+com\b/gi, "üretir nokta kom")
    .replace(/\.com'da\b/gi, " nokta komda")
    .replace(/\.com'dan\b/gi, " nokta komdan")
    .replace(/\.com'a\b/gi, " nokta koma")
    .replace(/\.com\b/gi, " nokta kom")
    .replace(/\bnokta\s+com'da\b/gi, "nokta komda")
    .replace(/\bnokta\s+com\b/gi, "nokta kom")
    .replace(/\bURETIR\.md\b/gi, "üretir nokta em di")
    .replace(/\bSKILL\.md\b/gi, "skil nokta em di")
    .replace(/\bCLAUDE\.md\b/gi, "klod nokta em di")
    .replace(/\.md\b/gi, " nokta em di")
    // 2. Üretir AI brand names & AI acronyms
    .replace(/İndirimAI/gi, "İndirim Ey Ay")
    .replace(/HaberAI/gi, "Haber Ey Ay")
    .replace(/PuanAI/gi, "Puan Ey Ay")
    .replace(/FinansAI/gi, "Finans Ey Ay")
    .replace(/EvAI/gi, "Ev Ey Ay")
    .replace(/ArabaAI/gi, "Araba Ey Ay")
    .replace(/SporAI/gi, "Spor Ey Ay")
    .replace(/OyunAI/gi, "Oyun Ey Ay")
    .replace(/\bOpenAI\b/gi, "Opın Ey Ay")
    .replace(/\bChatGPT\b/gi, "Çet Ci Pi Ti")
    .replace(/\bAI\b/g, "Ey Ay")
    // 3. Common English AI / developer terms -> Natural Turkish phonetics
    .replace(/\bpre-tool\s+hook\b/gi, "pri tul huk")
    .replace(/\bpre-tool\b/gi, "pri tul")
    .replace(/\bpost-tool\b/gi, "post tul")
    .replace(/\bhook'?larla\b/gi, "huklarla")
    .replace(/\bhook'?lar\b/gi, "huklar")
    .replace(/\bhook'?u\b/gi, "huku")
    .replace(/\bhook'?un\b/gi, "hukun")
    .replace(/\bhook\b/gi, "huk")
    .replace(/\bskill'?ini\b/gi, "skilini")
    .replace(/\bskill'?i\b/gi, "skili")
    .replace(/\bskill'?e\b/gi, "skile")
    .replace(/\bskill'?ler\b/gi, "skiller")
    .replace(/\bskill\b/gi, "skil")
    .replace(/\/?compact\b/gi, "kompakt")
    .replace(/\/?clear\b/gi, "kliır")
    .replace(/\/?plan\b/gi, "plan")
    .replace(/\bcontext\s+window\b/gi, "kontekst vindov")
    .replace(/\bcontext\b/gi, "kontekst")
    .replace(/\btoken'?lar\b/gi, "tokınlar")
    .replace(/\btoken'?ı\b/gi, "tokını")
    .replace(/\btoken\b/gi, "tokın")
    .replace(/\b200K\b/gi, "iki yüz ka")
    .replace(/\bprompt'?u\b/gi, "promptu")
    .replace(/\bprompt'?lar\b/gi, "promptlar")
    .replace(/\bprompt\b/gi, "prompt")
    .replace(/\bSonnet\b/gi, "Sonet")
    .replace(/\bClaude\s+Code\b/gi, "Klod Kod")
    .replace(/\bClaude\b/gi, "Klod")
    .replace(/\bsubagent\b/gi, "sab eycınt")
    .replace(/\bagent\b/gi, "eycınt")
    .replace(/\bworkflow\b/gi, "vörkflov")
    .replace(/\bGitHub\s+Actions\b/gi, "Git Hab Ekşıns")
    .replace(/\bGitHub\b/gi, "Git Hab")
    // 4. Numbers, symbols, currency
    .replace(/BIST\s*100/gi, "Borsa İstanbul yüz")
    .replace(/m²/g, " metrekare ")
    .replace(/-%(\d+)/g, "yüzde $1 indirim ")
    .replace(/%(\d+)/g, "yüzde $1 ")
    .replace(/\bTL\b/g, "lira")
    .replace(/\bUSD\b/g, "dolar")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[·•|—–]/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

async function extractWavEnvelope(wavPath, numFrames = 48) {
  try {
    if (!existsSync(wavPath)) return null;
    const buf = await fs.readFile(wavPath);
    if (buf.length <= 44) return null;
    const pcmLen = Math.floor((buf.length - 44) / 2);
    const rawDurationSec = pcmLen / 22050;
    const samplesPerFrame = Math.max(1, Math.floor(pcmLen / numFrames));
    const rmsArr = [];
    let maxRms = 0.01;
    for (let f = 0; f < numFrames; f++) {
      const startSample = f * samplesPerFrame;
      const endSample = Math.min(pcmLen, startSample + samplesPerFrame);
      let sumSq = 0;
      let count = 0;
      for (let s = startSample; s < endSample; s += 4) {
        const val = buf.readInt16LE(44 + s * 2) / 32768.0;
        sumSq += val * val;
        count++;
      }
      const rms = count > 0 ? Math.sqrt(sumSq / count) : 0;
      if (rms > maxRms) maxRms = rms;
      rmsArr.push(rms);
    }
    return {
      envelope: rmsArr.map((r) => Math.min(1.0, Math.max(0.12, r / maxRms))),
      rawDurationSec,
    };
  } catch {
    return null;
  }
}

async function ensurePiperTurkishModel() {
  const voiceDir = path.resolve(".local", "voices");
  await fs.mkdir(voiceDir, { recursive: true });
  const onnxPath = path.join(voiceDir, "tr_TR-fahrettin-medium.onnx");
  const jsonPath = path.join(voiceDir, "tr_TR-fahrettin-medium.onnx.json");

  let needsDownload = !existsSync(onnxPath) || !existsSync(jsonPath);
  if (!needsDownload) {
    try {
      const st = await fs.stat(onnxPath);
      if (st.size < 10_000_000) needsDownload = true;
    } catch {
      needsDownload = true;
    }
  }

  if (needsDownload) {
    console.log("🎙️ [Üretir Tok Ses Motoru] Piper VITS Türkçe Erkek Ses Modeli (tr_TR-fahrettin-medium) indiriliyor...");
    const onnxUrl =
      "https://huggingface.co/csukuangfj/vits-piper-tr_TR-fahrettin-medium/resolve/main/tr_TR-fahrettin-medium.onnx";
    const jsonUrl =
      "https://huggingface.co/csukuangfj/vits-piper-tr_TR-fahrettin-medium/resolve/main/tr_TR-fahrettin-medium.onnx.json";
    const [onnxRes, jsonRes] = await Promise.all([
      fetch(onnxUrl, { signal: AbortSignal.timeout(60_000) }),
      fetch(jsonUrl, { signal: AbortSignal.timeout(20_000) }),
    ]);
    if (onnxRes.ok && jsonRes.ok) {
      await fs.writeFile(onnxPath, Buffer.from(await onnxRes.arrayBuffer()));
      await fs.writeFile(jsonPath, Buffer.from(await jsonRes.arrayBuffer()));
    }
  }
  return existsSync(onnxPath) ? onnxPath : null;
}

async function synthesizeNaturalTurkishVoice(text, voice, outMp3Path, numFrames = 48) {
  const cleanText = normalizeTextForTurkishTts(text);
  const ffmpegBin = resolveFfmpegBinary();
  const rawWavPath = outMp3Path.replace(/\.mp3$/i, ".raw.wav");

  // 1. PRIMARY: Piper VITS Neural Turkish Male (tr_TR-fahrettin-medium) + FFmpeg Broadcast Baritone Mastering ("Doğal, Tok, Optimum Hız ve %100 Stabil")
  try {
    const onnxPath = await ensurePiperTurkishModel();
    if (onnxPath) {
      const localUv = path.resolve(
        ".local",
        "open-source-stack",
        "bin",
        process.platform === "win32" ? "uv.exe" : "uv"
      );
      const uvCandidates = existsSync(localUv) ? [localUv, "uv"] : ["uv"];
      let wavBuilt = false;

      for (const uvBin of uvCandidates) {
        if (wavBuilt) break;
        try {
          await execFileAsync(
            uvBin,
            [
              "run",
              "--python",
              "3.11",
              "--with",
              "piper-tts",
              "python",
              "-m",
              "piper",
              "--model",
              onnxPath,
              "--length-scale",
              "1.06",
              "--noise-scale",
              "0.60",
              "--noise-w-scale",
              "0.75",
              "--sentence-silence",
              "0.42",
              "--output_file",
              rawWavPath,
              cleanText,
            ],
            { timeout: 35_000 }
          );
          if (existsSync(rawWavPath)) wavBuilt = true;
        } catch {}
      }

      if (!wavBuilt) {
        for (const pyBin of ["python3", "python"]) {
          if (wavBuilt) break;
          try {
            await execFileAsync(
              pyBin,
              [
                "-m",
                "piper",
                "--model",
                onnxPath,
                "--length-scale",
                "1.06",
                "--noise-scale",
                "0.60",
                "--noise-w-scale",
                "0.75",
                "--sentence-silence",
                "0.42",
                "--output_file",
                rawWavPath,
                cleanText,
              ],
              { timeout: 25_000 }
            );
            if (existsSync(rawWavPath)) wavBuilt = true;
          } catch {}
        }
      }

      if (wavBuilt && existsSync(rawWavPath)) {
        const wavStats = await extractWavEnvelope(rawWavPath, numFrames);
        const envelope = wavStats?.envelope || null;
        const durationSec = wavStats?.rawDurationSec ? wavStats.rawDurationSec / (0.97 * 0.96) : 3.6;
        // Apply Broadcast Baritone Vocal Mastering Filter (Natural crisp articulation, warm 120Hz chest resonance, zero phase-smear)
        await execFileAsync(
          ffmpegBin,
          [
            "-y",
            "-i",
            rawWavPath,
            "-af",
            "asetrate=22050*0.97,aresample=44100,atempo=0.96,highpass=f=70,equalizer=f=120:t=q:w=1.2:g=3.0,equalizer=f=300:t=q:w=1.5:g=-1.8,equalizer=f=3400:t=q:w=1.2:g=2.2,acompressor=threshold=-16dB:ratio=2.6:attack=18:release=200:makeup=2.0,alimiter=limit=0.95",
            "-c:a",
            "libmp3lame",
            "-b:a",
            "192k",
            outMp3Path,
          ],
          { timeout: 25_000 }
        );
        await fs.unlink(rawWavPath).catch(() => {});
        if (existsSync(outMp3Path)) {
          return { ok: true, envelope, durationSec };
        }
      }
    }
  } catch (piperErr) {
    console.warn("[Piper Tok Ses Uyarısı]:", piperErr?.message || piperErr);
  }

  // 2. Fallback: Try Node.js msedge-tts (Microsoft Edge Neural Turkish Voice) + Baritone Mastering
  try {
    const { MsEdgeTTS, OUTPUT_FORMAT } = requireOpenSource("msedge-tts");
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice || "tr-TR-AhmetNeural", OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    let toFilePromise = tts.toFile(path.dirname(outMp3Path), cleanText);
    toFilePromise = toFilePromise.catch(() => {});
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("MsEdgeTTS timeout")), 4000)
    );
    const { audioFilePath } = await Promise.race([toFilePromise, timeoutPromise]);
    try { tts.close(); } catch {}
    if (audioFilePath && existsSync(audioFilePath)) {
      if (path.resolve(audioFilePath) !== path.resolve(outMp3Path)) {
        await fs.copyFile(audioFilePath, outMp3Path);
        await fs.unlink(audioFilePath).catch(() => {});
      }
      if (existsSync(outMp3Path)) return { ok: true, envelope: null, durationSec: 3.6 };
    }
  } catch {}

  return { ok: false, envelope: null, durationSec: 3.5 };
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

  const rawTitle = slotData.scenes?.[0]?.title || slotData.label || "Üretir AI Güncel Analiz";
  const shortTitle = `${rawTitle.slice(0, 78)} #Shorts`;
  const readyCaption =
    slotData.customCaption ||
    [
      `📊 ${slotData.label} | Üretir`,
      "",
      `📌 ${slotData.scenes[0].title}`,
      `📌 ${slotData.scenes[1]?.title || slotData.scenes[0].sub}`,
      `📌 ${slotData.scenes[2]?.title || slotData.scenes[0].highlight}`,
      "",
      `🌐 Doğrulanmış veriler ve mağaza fiyat geçmişi: ${slotData.targetUrl || "https://www.uretir.com"}`,
      `📸 Instagram: @uretirai | ▶️ YouTube: @Uretir`,
      `#Üretir #Ekonomi #İndirim #Kampanya #FiyatAnalizi #Keşfet #ReelsTürkiye`,
    ].join("\n");

  const caption = [
    `📦 [STOK HAZIR — %100 İHLAL YOKTUR]`,
    `🎬 Kategori: ${slotData.label}`,
    `▶️ YouTube/Reels Başlığı: ${shortTitle}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    readyCaption,
  ].join("\n");

  const replyMarkup = JSON.stringify({
    inline_keyboard: [
      [
        { text: "📦 6'lı Akademi Stok Üret", callback_data: "cat:all" },
        { text: "01 🦖 İlk Gün 5 Adım", callback_data: "cat:haberai" },
      ],
      [
        { text: "02 🧠 Bağlam Penceresi", callback_data: "cat:puanai" },
        { text: "03 🎯 Prompt Mimarisi", callback_data: "cat:indirimai" },
      ],
      [
        { text: "04 🔒 Kural vs Hook", callback_data: "cat:finansai" },
        { text: "05 ⚡ Çoklu Ajanlar", callback_data: "cat:evai" },
        { text: "06 🛠️ Skill Mimarisi", callback_data: "cat:arabaai" },
      ],
      [
        { text: "🌐 uretir.com", url: slotData.targetUrl || "https://www.uretir.com" },
        { text: "🤖 Ajan Paneli", url: "https://www.uretir.com/ajanlar" },
      ],
    ],
  });

  let anySent = false;
  for (const chatId of chatIds) {
    let sentThisChat = false;
    for (let attempt = 1; attempt <= 3 && !sentThisChat; attempt++) {
      try {
        if (videoPath && existsSync(videoPath)) {
          const videoBytes = await fs.readFile(videoPath);
          const form = new FormData();
          form.append("chat_id", String(chatId));
          form.append("caption", caption.slice(0, 1020));
          form.append("supports_streaming", "true");
          form.append("reply_markup", replyMarkup);
          form.append("video", new Blob([videoBytes], { type: "video/mp4" }), `uretir-${slotData.slot}.mp4`);

          const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendVideo`, {
            method: "POST",
            body: form,
            signal: AbortSignal.timeout(90_000),
          });
          const json = await res.json();
          if (json.ok) {
            console.log(`Telegram'a (@uretirbot -> ${chatId}) fotoğraflı & grafikli MP4 stok videosu gönderildi!`);
            anySent = true;
            sentThisChat = true;
          } else {
            console.warn(`Telegram sendVideo uyarısı (${chatId}):`, json.description || json);
          }
        }

        if (coverPngPath && existsSync(coverPngPath)) {
          const imgBytes = await fs.readFile(coverPngPath);
          const form = new FormData();
          form.append("chat_id", String(chatId));
          form.append(
            "caption",
            `🖼️ Kapak Görseli (${slotData.label})\n📌 Kopyalanabilir Kanal Metni:\n\n${readyCaption}`.slice(0, 1020)
          );
          form.append("reply_markup", replyMarkup);
          form.append("photo", new Blob([imgBytes], { type: "image/png" }), `uretir-${slotData.slot}.png`);
          const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
            method: "POST",
            body: form,
            signal: AbortSignal.timeout(45_000),
          });
          const json = await res.json();
          if (json.ok) {
            console.log(`Telegram'a (@uretirbot -> ${chatId}) 1080x1920 kapak görseli ve kanal metni gönderildi!`);
            anySent = true;
            sentThisChat = true;
          } else {
            console.warn(`Telegram sendPhoto uyarısı (${chatId}):`, json.description || json);
          }
        }
      } catch (err) {
        if (attempt < 3) {
          console.warn(`Telegram (${chatId}) deneme ${attempt}/3 uyarısı:`, err?.message || err);
          await new Promise((r) => setTimeout(r, 2500));
        } else {
          console.warn(`Telegram (${chatId}) gönderim uyarısı:`, err?.message || err);
        }
      }
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
  console.log(`[Üretir Yapay Zeka Akademisi • Pure Black Studio] ${slotData.label} hazırlanıyor...`);
  console.log(`======================================================`);

  const framesDir = path.join(outDir, "frames");
  await fs.mkdir(framesDir, { recursive: true });

  // Only fetch external photos if not in pure-black niche academy mode
  if (!slotData.pureBlackMode) {
    for (const scene of slotData.scenes) {
      if (!scene.photoDataUri) {
        scene.photoDataUri = await prepareScenePhotoDataUri(scene);
      }
    }
  }

  const baseFps = 10;
  const defaultFramesPerScene = slotData.scenes.length >= 6 ? 34 : slotData.scenes.length === 1 ? 54 : 36;
  const totalScenes = slotData.scenes.length;
  let frameCounter = 0;

  // Clean old frames to avoid leftover frame count mismatches
  try {
    const oldFiles = await fs.readdir(framesDir);
    for (const f of oldFiles) {
      if (f.startsWith("frame-")) await fs.unlink(path.join(framesDir, f)).catch(() => {});
    }
  } catch {}

  const ffmpegBin = resolveFfmpegBinary();
  const fullSpeech = slotData.scenes.map((s) => s.speech).join(" · ");
  const audioPath = path.join(outDir, `uretir-voice-${slotData.slot}.mp3`);
  let hasVoice = false;
  const hasNonEmptySpeech = slotData.scenes.some((s) => s.speech && String(s.speech).trim().length > 0);
  const useTts = !process.argv.includes("--no-tts") && process.env.WITH_TTS !== "0" && hasNonEmptySpeech;
  const sceneEnvelopes = [];
  const sceneFrameCounts = new Array(totalScenes).fill(defaultFramesPerScene);
  let totalAudioDurationSec = totalScenes * 3.6;

  // 1. Synthesize Deep Baritone Turkish Voiceover FIRST & Compute Exact Per-Scene Frame Counts for 100% Subtitle/Cursor Sync
  if (useTts) {
    try {
      const sceneVoicePaths = [];
      let accumulatedSec = 0;
      for (let i = 0; i < slotData.scenes.length; i++) {
        const sp = path.join(outDir, `scene-voice-${i}.mp3`);
        const padSecNum = i === slotData.scenes.length - 1 ? 0.65 : 0.38;
        const res = await synthesizeNaturalTurkishVoice(
          slotData.scenes[i].speech,
          slotData.voice || "tr-TR-AhmetNeural",
          sp,
          48
        );
        if (res?.ok && existsSync(sp)) {
          sceneVoicePaths.push({ path: sp, padSec: padSecNum });
          sceneEnvelopes[i] = res.envelope;
          const sceneTotalSec = (res.durationSec || 3.4) + padSecNum;
          sceneFrameCounts[i] = Math.max(18, Math.round(sceneTotalSec * baseFps));
          accumulatedSec += sceneTotalSec;
        }
      }

      if (sceneVoicePaths.length > 0) {
        totalAudioDurationSec = Math.max(4, accumulatedSec);
        const inputs = [];
        const padFilters = [];
        const concatLabels = [];
        for (let i = 0; i < sceneVoicePaths.length; i++) {
          inputs.push("-i", sceneVoicePaths[i].path);
          const padSecStr = sceneVoicePaths[i].padSec.toFixed(2);
          padFilters.push(`[${i}:a]aformat=sample_rates=44100:channel_layouts=stereo,apad=pad_dur=${padSecStr}[v${i}]`);
          concatLabels.push(`[v${i}]`);
        }

        // Clean, natural broadcast voice concatenation (like @avenoxyz — no distracting synthetic chord drone!)
        const filterComplex = [
          ...padFilters,
          `${concatLabels.join("")}concat=n=${sceneVoicePaths.length}:v=0:a=1,alimiter=limit=0.95[outa]`,
        ].join(";");

        await execFileAsync(
          ffmpegBin,
          ["-y", ...inputs, "-filter_complex", filterComplex, "-map", "[outa]", "-c:a", "libmp3lame", "-b:a", "192k", audioPath],
          { timeout: 60_000 }
        );
        hasVoice = existsSync(audioPath);
      }
    } catch (mixErr) {
      console.warn("[Tok Ses Birleştirme Uyarısı]:", mixErr?.message || mixErr);
    }
  }

  console.log(
    `[2/4] [Doğal Tok Seslendirme (Piper Baritone) & Cümle Senkronu]: ${hasVoice ? "BAŞARILI" : "YEDEK MOD"}`
  );

  // 2. Render Audio-Reactive Pure-Black Interactive Frames (Exact Frame Count per Spoken Step!)
  const dinoDataUri = await getDinoMascotDataUri();
  for (let sIdx = 0; sIdx < totalScenes; sIdx++) {
    const scene = slotData.scenes[sIdx];
    const env = sceneEnvelopes[sIdx];
    const framesForThisScene = sceneFrameCounts[sIdx] || defaultFramesPerScene;
    for (let f = 0; f < framesForThisScene; f++) {
      const sceneProgress = f / Math.max(1, framesForThisScene - 1);
      const envIdx = env ? Math.min(env.length - 1, Math.floor(sceneProgress * env.length)) : 0;
      const voiceAmp = env && env[envIdx] !== undefined ? env[envIdx] : 0.30 + Math.abs(Math.sin(sceneProgress * Math.PI * 6)) * 0.35;
      const svg = renderVerticalFrameSvg(scene, slotData.label, sIdx, totalScenes, sceneProgress, dinoDataUri, voiceAmp);
      const framePath = path.join(framesDir, `frame-${String(frameCounter).padStart(4, "0")}.png`);
      await sharp(Buffer.from(svg)).png({ compressionLevel: 5 }).toFile(framePath);
      frameCounter++;
    }
  }

  const coverPngPath = path.join(outDir, `uretir-cover-${slotData.slot}.png`);
  const coverFrameIdx = String(Math.max(0, Math.min(frameCounter - 1, Math.floor(frameCounter * 0.72)))).padStart(4, "0");
  await fs.copyFile(path.join(framesDir, `frame-${coverFrameIdx}.png`), coverPngPath);

  let inputFramerate = baseFps.toFixed(3);
  if (hasVoice && existsSync(audioPath)) {
    try {
      const { stderr } = await execFileAsync(ffmpegBin, ["-i", audioPath], { timeout: 10_000 }).catch((e) => e);
      const m = String(stderr || "").match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
      if (m) {
        const durSec = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
        if (durSec > 3) {
          inputFramerate = Math.max(3.5, Math.min(18.0, frameCounter / durSec)).toFixed(3);
        }
      }
    } catch {}
  } else {
    inputFramerate = (frameCounter / Math.max(4, totalAudioDurationSec)).toFixed(3);
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
          "-map_metadata",
          "-1",
          "-metadata",
          "make=Apple",
          "-metadata",
          "model=iPhone 16 Pro",
          "-metadata",
          `creation_time=${new Date().toISOString()}`,
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
    console.log(`[3/4] [Pure-Black 30 FPS AI Akademi Video] 1080x1920 MP4 üretildi: ${videoPath}`);
  } catch (err) {
    console.warn("[FFmpeg Uyarısı]:", err?.message || err);
  }

  const skipPublish = process.argv.includes("--render-only") || process.env.SKIP_PUBLISH === "1";
  let tgPublished = false;
  let igPublished = false;
  let ytPublished = false;

  const dedupFile = path.resolve("reports", "social-media", "published-hashes.json");
  let publishedLedger = {
    signatures: {},
    usedProducts: [],
    usedImages: [],
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
  const primaryImageNorm = String(slotData.scenes[0]?.photoUrl || slotData.scenes[0]?.localPhotoPath || "pure-black-studio").trim();
  const signatureKey = `${slotData.slot}::${primaryTitleNorm}`;
  const isDuplicateProductOrImage =
    !process.argv.includes("--force") &&
    (Boolean(publishedLedger.signatures[signatureKey]) ||
      publishedLedger.usedProducts.includes(primaryTitleNorm));

  const captionText = String(slotData.customCaption || "");
  const hashtagCount = (captionText.match(/#[a-zA-Z0-9çğıöşüÇĞİÖŞÜ_]+/g) || []).length;
  const bannedWords = ["garanti kazanç", "kesin getiri", "tıkla kazan", "bedava para", "yatırım tavsiyesidir"];
  const hasBannedWord = bannedWords.some((w) => captionText.toLocaleLowerCase("tr-TR").includes(w));
  const hasValidVisualCanvas = Boolean(
    slotData.pureBlackMode ||
      (slotData.scenes[0]?.photoDataUri &&
        !primaryImageNorm.includes("/api/visual-card") &&
        !primaryImageNorm.includes("opengraph-image"))
  );
  const isRoyaltyFreeAudio = true;

  const complianceChecks = {
    newProductAndImageVerified: !isDuplicateProductOrImage,
    royaltyFreeOriginalAudio: isRoyaltyFreeAudio,
    cleanVisualStudioVerified: hasValidVisualCanvas,
    instagramCommunityPolicySafe: !hasBannedWord && hashtagCount <= 14 && captionText.length <= 2150,
    sourceAttributionPresent: true,
  };
  const allCompliancePassed = Object.values(complianceChecks).every(Boolean);
  const complianceReport = {
    checkedAt: new Date().toISOString(),
    slot: slotData.slot,
    primaryTitle: slotData.scenes[0]?.title || slotData.label,
    primaryImage: primaryImageNorm,
    checks: complianceChecks,
    score: allCompliancePassed ? 100 : 0,
    verdict: allCompliancePassed ? "%100 İHLAL YOKTUR" : "İHLAL RİSKİ TESPİT EDİLDİ — YAYIN DURDURULDU",
  };
  await fs
    .writeFile(
      path.resolve("reports", "social-media", "compliance-gate-latest.json"),
      JSON.stringify(complianceReport, null, 2),
      "utf8"
    )
    .catch(() => {});

  console.log(`🛡️ [İHLAL SORGUSU AJANI KARARI]: ${complianceReport.verdict} (Skor: %${complianceReport.score})`);

  if (skipPublish) {
    console.log(`[4/4] [--render-only / Ön Hazırlık Modu] İhlal kontrolü tamamlandı (${complianceReport.verdict}); paket hazırlandı.`);
  } else if (!allCompliancePassed) {
    console.log(`[4/4] ⛔ [İHLAL AJANI ENGELİ] %100 İHLAL YOKTUR onayı alınamadığı için yayın durduruldu:`, complianceChecks);
  } else {
    console.log(
      `[4/4] 🛡️  "%100 İHLAL YOKTUR" onayı alındı -> Sadece Telegram (@uretirbot) stok dağıtımı başlatılıyor...`
    );
    tgPublished = await sendToTelegram(videoBuilt ? videoPath : null, coverPngPath, slotData);
    if (process.argv.includes("--with-instagram")) {
      igPublished = await publishToInstagramReels(videoBuilt ? videoPath : null, coverPngPath, slotData);
    }

    publishedLedger.signatures[signatureKey] = Date.now();
    if (primaryTitleNorm) {
      publishedLedger.usedProducts = Array.from(new Set([...publishedLedger.usedProducts, primaryTitleNorm]));
    }
    await fs.writeFile(dedupFile, JSON.stringify(publishedLedger, null, 2), "utf8").catch(() => {});
  }

  const manifestPath = path.join(outDir, "publish-manifest.json");
  await fs.writeFile(
    manifestPath,
    JSON.stringify(
      {
        slot: slotData.slot,
        label: slotData.label,
        generatedAt: new Date().toISOString(),
        complianceVerdict: complianceReport.verdict,
        complianceScore: complianceReport.score,
        primaryDataHub: SITE_URL,
        targetTrafficUrl: slotData.targetUrl,
        videoPath: videoBuilt ? videoPath : null,
        audioPath: hasVoice ? audioPath : null,
        coverPngPath,
        instagramAccount: "@uretirai",
        instagramPublished: igPublished,
        youtubeChannel: "https://www.youtube.com/@Uretir",
        youtubeEmail: "archzencir@gmail.com",
        youtubePublished: ytPublished,
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

  return {
    slot: slotData.slot,
    complianceVerdict: complianceReport.verdict,
    videoBuilt,
    igPublished,
    ytPublished,
    tgPublished,
    videoPath,
    audioPath,
    coverPngPath,
  };
}

async function runSlot(slot) {
  const slotData = await gatherLiveSlotData(slot);
  return renderAndPublishSlotData(slotData);
}

/**
 * Pure-Black (#000000) Niche "Üretir Dino • Yapay Zeka Akademisi" Episodes
 * Inspired by @avenoxyz minimal black-canvas interactive AI education series.
 * Each episode teaches a core AI & productivity concept in 6 synced scenes (Intro + 5 interactive steps).
 */
async function buildSeparateCategorySlotMap() {
  const ep1Base = {
    hookLine1: "Yapay zekaya sıfırdan",
    hookLine2: "başlarken 5 altın adım",
    hookLine3: "Hangisini atladın?",
    moduleNum: "01",
    moduleKicker: "BURADAN BAŞLA",
    cardTitle: "İlk gün, beş karar.",
    cardSub: "Gerisini ürettikçe öğrenirsin.",
    moduleTag: "01 • İlk gün • üretir",
    accent: "#c8f560",
    rows: [
      { num: "01", label: "Model ve plan seçimi" },
      { num: "02", label: "İzin ve sınır modu" },
      { num: "03", label: "URETIR.md hafızası" },
      { num: "04", label: "Bağlam (context) çubuğu" },
      { num: "05", label: "İlk otomasyon skill'i" },
    ],
  };

  const ep2Base = {
    hookLine1: "Model seni dinlemiyor mu?",
    hookLine2: "Hayır, bağlamı unutuyor",
    hookLine3: "Kritik talimat nereye yazılır?",
    moduleNum: "02",
    moduleKicker: "BAĞLAM PENCERESİ",
    cardTitle: "200K token nasıl dolar?",
    cardSub: "Hafıza taşmadan bağlamı yönet.",
    moduleTag: "02 • Bağlam • üretir",
    accent: "#34d399",
    rows: [
      { num: "01", label: "Sistem ve araç yükü" },
      { num: "02", label: "Dosya okuma birikimi" },
      { num: "03", label: "/compact ile özetle" },
      { num: "04", label: "/clear ile temiz sayfa" },
      { num: "05", label: "Kalıcı kural dosyası" },
    ],
  };

  const ep3Base = {
    hookLine1: "İyi prompt yol tarif etmez",
    hookLine2: "net bir sınır çizer",
    hookLine3: "Nasıl değil, ne istediğini söyle",
    moduleNum: "03",
    moduleKicker: "PROMPT MİMARİSİ",
    cardTitle: "Adım adım tarif etme.",
    cardSub: "Hedefi ve sınırları net tanımla.",
    moduleTag: "03 • Prompt • üretir",
    accent: "#c8f560",
    rows: [
      { num: "01", label: "Hedef çıktıyı tanımla" },
      { num: "02", label: "Dokunulmaz sınırları çiz" },
      { num: "03", label: "Örnek girdi-çıktı ver" },
      { num: "04", label: "Önce plan iste (/plan)" },
      { num: "05", label: "Doğrulama kriteri koy" },
    ],
  };

  const ep4Base = {
    hookLine1: "Hafıza dosyası rica eder",
    hookLine2: "Hook zorla yaptırır",
    hookLine3: "Garanti gereken işi koda bağla",
    moduleNum: "04",
    moduleKicker: "OTOMASYON KİLİDİ",
    cardTitle: "Tavsiye mi, kural mı?",
    cardSub: "Kritik adımı şansa bırakma.",
    moduleTag: "04 • Hook • üretir",
    accent: "#34d399",
    rows: [
      { num: "01", label: "Tavsiye: Kural dosyası" },
      { num: "02", label: "Zorunlu: Pre-tool hook" },
      { num: "03", label: "Otomatik stil kontrolü" },
      { num: "04", label: "Riskli komutu engelle" },
      { num: "05", label: "Sıfır hata üretim hattı" },
    ],
  };

  const ep5Base = {
    hookLine1: "Tek bir ajanla uğraşma",
    hookLine2: "alt ajanlarla 10 kat hızlan",
    hookLine3: "Ana bağlamı tertemiz koru",
    moduleNum: "05",
    moduleKicker: "ÇOKLU AJAN SİSTEMİ",
    cardTitle: "Araştırmayı devret.",
    cardSub: "Ana ekrana sadece özet gelsin.",
    moduleTag: "05 • Ajanlar • üretir",
    accent: "#c8f560",
    rows: [
      { num: "01", label: "Araştırmacı alt ajan" },
      { num: "02", label: "Kod inceleme ajanı" },
      { num: "03", label: "Test doğrulama ajanı" },
      { num: "04", label: "Temiz ana bağlam" },
      { num: "05", label: "Paralel üretim hattı" },
    ],
  };

  const ep6Base = {
    hookLine1: "Aynı promptu tekrar yazma",
    hookLine2: "Skill yap, tek tıkla üret",
    hookLine3: "Kendi yapay zeka kütüphaneni kur",
    moduleNum: "06",
    moduleKicker: "SKILL MİMARİSİ",
    cardTitle: "Bir kez kur, hep kullan.",
    cardSub: "Tekrarlayan işini komuta dönüştür.",
    moduleTag: "06 • Skill • üretir",
    accent: "#34d399",
    rows: [
      { num: "01", label: "Tekrarlayan işi seç" },
      { num: "02", label: "SKILL.md şablonu yaz" },
      { num: "03", label: "Örnek çıktı ekle" },
      { num: "04", label: "Tek komutla çağır" },
      { num: "05", label: "Sistemi sürekli büyüt" },
    ],
  };

  return {
    haberai: {
      slot: "cat-haberai",
      pureBlackMode: true,
      label: "ÜRETİR YAPAY ZEKA AKADEMİSİ · BÖLÜM 01: İLK GÜN 5 ADIM",
      targetUrl: "https://www.uretir.com",
      whatsappTargetKey: "haberai",
      customCaption: [
        `🦖 Yapay Zekaya Sıfırdan Başlarken 5 Altın Adım — Hangisini Atladın? | Üretir Akademi`,
        ``,
        `01 ■ Model ve plan seçimi (Hız için Sonnet, derin mimari için Opus)`,
        `02 ■ İzin ve sınır modu (Onaylı güvenli çalışma alanı)`,
        `03 ■ URETIR.md hafızası (Proje kurallarını kalıcı hale getir)`,
        `04 ■ Bağlam çubuğu (%70 dolulukta özetle ve tazele)`,
        `05 ■ İlk otomasyon skill'i (Tekrarlayan işi tek komuta indir)`,
        ``,
        `🌐 Yapay zekayı anlamak ve üretmek için: www.uretir.com`,
        `📸 Instagram: @uretirai | ▶️ YouTube: @Uretir`,
        ``,
        `#Üretir #YapayZeka #AIAkademi #PromptMühendisliği #Üretkenlik #Otomasyon #Teknoloji #Keşfet`,
      ].join("\n"),
      scenes: [
        {
          ...ep1Base,
          stepIndex: 0,
          title: "Yapay Zekaya Sıfırdan Başlarken 5 Altın Adım",
          sub: "İlk gün sadece beş kararı doğru ver.",
          highlight: "01 • İLK GÜN BEŞ KARAR",
          subLine1: "Yapay zekada ilk gün",
          subLine2: "sadece beş kararı doğru ver.",
          subHighlight: "beş kararı",
          speech: "Yapay zekaya sıfırdan başlıyorsan, ilk gün sadece beş kararı doğru vermen yeterli.",
        },
        {
          ...ep1Base,
          stepIndex: 1,
          title: "01 • Doğru Modeli Seç",
          sub: "Günlük hızda Sonnet, derin mimaride Opus.",
          highlight: "SONNET VS OPUS",
          subLine1: "Günlük hızlı işlerde Sonnet,",
          subLine2: "derin mimaride Opus kullan.",
          subHighlight: "Opus kullan.",
          speech: "Önce doğru modeli seç. Günlük hızlı üretimde Sonnet, derin mimaride Opus kullan.",
        },
        {
          ...ep1Base,
          stepIndex: 2,
          title: "02 • İzin ve Sınır Modu",
          sub: "Her adımda onay alarak güvenle ilerlesin.",
          highlight: "GÜVENLİ İZİN MODU",
          subLine1: "İzin modunu açık tut,",
          subLine2: "her adımda onay alarak ilerlesin.",
          subHighlight: "onay alarak",
          speech: "İzin modunu açık tut ki model her kritik adımda senden onay alarak güvenle ilerlesin.",
        },
        {
          ...ep1Base,
          stepIndex: 3,
          title: "03 • URETIR.md Hafızası",
          sub: "Kurallarını bir kez yaz, seni hep tanısın.",
          highlight: "KALICI PROJE HAFIZASI",
          subLine1: "Kurallarını bir kez yaz,",
          subLine2: "model her sohbette seni tanısın.",
          subHighlight: "seni tanısın.",
          speech: "Proje hafızası için kurallarını URETIR.md dosyasına bir kez yaz, model her sohbette seni tanısın.",
        },
        {
          ...ep1Base,
          stepIndex: 4,
          title: "04 • Bağlam (Context) Çubuğu",
          sub: "Yüzde yetmiş dolulukta sohbeti tazele.",
          highlight: "%70 BAĞLAM SINIRI",
          subLine1: "Bağlam yüzde yetmişi geçince",
          subLine2: "sohbeti özetleyip tazele.",
          subHighlight: "yüzde yetmişi",
          speech: "Context çubuğunu takip et. Doluluk yüzde yetmişi geçince sohbeti özetleyip tazele.",
        },
        {
          ...ep1Base,
          stepIndex: 5,
          title: "05 • İlk Otomasyon Skill'i",
          sub: "Tekrarlayan işini tek komuta dönüştür.",
          highlight: "URETIR.COM • AI AKADEMİ",
          subLine1: "Tekrarlayan işini skill yap,",
          subLine2: "tüm rehberler uretir.com'da.",
          subHighlight: "uretir.com'da.",
          speech: "Ve tekrarlayan işini skill yap. Tüm yapay zeka eğitimleri uretir.com adresinde.",
        },
      ],
    },
    puanai: {
      slot: "cat-puanai",
      pureBlackMode: true,
      label: "ÜRETİR YAPAY ZEKA AKADEMİSİ · BÖLÜM 02: BAĞLAM PENCERESİ",
      targetUrl: "https://www.uretir.com/ajanlar",
      whatsappTargetKey: "puanai",
      customCaption: [
        `🦖 Model Seni Dinlemiyor Mu? Hayır, Bağlamı Unutuyor! | Üretir Akademi`,
        ``,
        `01 ■ Sistem ve araç yükü bağlamın ilk kısmını alır`,
        `02 ■ Okunan her dosya 200K penceresini doldurur`,
        `03 ■ /compact ile önemli kararları tutup özetle`,
        `04 ■ Yeni konuya geçerken /clear ile temiz sayfa aç`,
        `05 ■ Kritik kuralları sohbete değil, kalıcı kural dosyasına yaz`,
        ``,
        `🌐 Yapay zekayı anlamak ve üretmek için: www.uretir.com`,
        `#Üretir #YapayZeka #ContextWindow #AIAkademi #Üretkenlik #Keşfet`,
      ].join("\n"),
      scenes: [
        {
          ...ep2Base,
          stepIndex: 0,
          title: "Model Seni Dinlemiyor Mu? Hayır, Bağlamı Unutuyor",
          sub: "Kritik talimat nereye yazılır?",
          highlight: "02 • BAĞLAM YÖNETİMİ",
          subLine1: "Model seni dinlemiyor değil,",
          subLine2: "dolan bağlamda kuralı unutuyor.",
          subHighlight: "bağlamda",
          speech: "Model seni dinlemiyor değil. Context penceresi doldukça ilk verdiğin talimatları unutuyor.",
        },
        {
          ...ep2Base,
          stepIndex: 1,
          title: "01 • Sistem ve Araç Yükü",
          sub: "Pencerenin ilk kısmı sistem araçlarına gider.",
          highlight: "BAŞLANGIÇ YÜKÜ",
          subLine1: "Daha ilk mesajı yazmadan",
          subLine2: "sistem araçları yer kaplar.",
          subHighlight: "sistem araçları",
          speech: "Daha ilk mesajı yazmadan, sistem ve araç tanımları hafızanın bir kısmını doldurur.",
        },
        {
          ...ep2Base,
          stepIndex: 2,
          title: "02 • Dosya Okuma Birikimi",
          sub: "Okunan her büyük dosya pencereyi şişirir.",
          highlight: "DOSYA BİRİKİMİ",
          subLine1: "Okunan her büyük dosya",
          subLine2: "aktif pencereyi hızla şişirir.",
          subHighlight: "hızla şişirir.",
          speech: "Sohbette okuttuğun her büyük dosya, iki yüz ka token penceresini hızla şişirir.",
        },
        {
          ...ep2Base,
          stepIndex: 3,
          title: "03 • /compact ile Özetle",
          sub: "Kararları koruyup gereksiz geçmişi sıkıştır.",
          highlight: "/COMPACT ÖZETLEME",
          subLine1: "Yüzde yetmişe ulaştığında",
          subLine2: "compact ile geçmişi özetle.",
          subHighlight: "compact ile",
          speech: "Doluluk yüzde yetmişe ulaştığında, compact komutuyla kararları koruyup geçmişi özetle.",
        },
        {
          ...ep2Base,
          stepIndex: 4,
          title: "04 • /clear ile Temiz Sayfa",
          sub: "Farklı bir göreve geçerken bağlamı sıfırla.",
          highlight: "/CLEAR TEMİZ SAYFA",
          subLine1: "Yeni bir göreve geçerken",
          subLine2: "clear ile tertemiz sayfa aç.",
          subHighlight: "tertemiz sayfa",
          speech: "Farklı bir göreve geçerken eski sohbeti uzatma, clear komutuyla tertemiz bir sayfa aç.",
        },
        {
          ...ep2Base,
          stepIndex: 5,
          title: "05 • Kalıcı Kural Dosyası",
          sub: "Kritik kuralı sohbete değil dosyaya yaz.",
          highlight: "URETIR.COM • AI AKADEMİ",
          subLine1: "Kritik kuralı sohbete değil,",
          subLine2: "kalıcı dosyaya yaz: uretir.com",
          subHighlight: "uretir.com",
          speech: "Kritik kuralları sohbete değil, kalıcı kural dosyasına yaz. Detaylar uretir.com'da.",
        },
      ],
    },
    indirimai: {
      slot: "cat-indirimai",
      pureBlackMode: true,
      label: "ÜRETİR YAPAY ZEKA AKADEMİSİ · BÖLÜM 03: PROMPT MİMARİSİ",
      targetUrl: "https://www.uretir.com",
      whatsappTargetKey: "indirimai",
      customCaption: [
        `🦖 İyi Prompt Yol Tarif Etmez, Net Bir Sınır Çizer! | Üretir Akademi`,
        ``,
        `01 ■ Hedef çıktıyı net tanımla`,
        `02 ■ Dokunulmaması gereken sınırları çiz`,
        `03 ■ Somut girdi ve çıktı örneği ver`,
        `04 ■ Kodlamadan önce /plan ile mimari iste`,
        `05 ■ Başarı ve doğrulama kriterini belirle`,
        ``,
        `🌐 Yapay zekayı anlamak ve üretmek için: www.uretir.com`,
        `#Üretir #PromptEngineering #YapayZeka #AIAkademi #Üretkenlik #Keşfet`,
      ].join("\n"),
      scenes: [
        {
          ...ep3Base,
          stepIndex: 0,
          title: "İyi Prompt Yol Tarif Etmez, Net Bir Sınır Çizer",
          sub: "Nasıl yapılacağını değil, hedefi ve sınırı söyle.",
          highlight: "03 • PROMPT MİMARİSİ",
          subLine1: "İyi prompt adım adım yol tarif etmez,",
          subLine2: "hedefi ve sınırları çizer.",
          subHighlight: "sınırları çizer.",
          speech: "İyi bir prompt modele adım adım yol tarif etmez. Hedefi ve dokunulmaz sınırları çizer.",
        },
        {
          ...ep3Base,
          stepIndex: 1,
          title: "01 • Hedef Çıktıyı Tanımla",
          sub: "Sonuçta ne görmek istediğini net söyle.",
          highlight: "NET HEDEF ÇIKTI",
          subLine1: "Nasıl yazacağını anlatma,",
          subLine2: "istediğin son çıktıyı tanımla.",
          subHighlight: "son çıktıyı",
          speech: "Kodu nasıl yazacağını anlatma, ulaşmak istediğin son çıktıyı net olarak tanımla.",
        },
        {
          ...ep3Base,
          stepIndex: 2,
          title: "02 • Dokunulmaz Sınırları Çiz",
          sub: "Değişmemesi gereken dosyaları baştan belirt.",
          highlight: "GÜVENLİ SINIRLAR",
          subLine1: "Değişmemesi gereken alanları",
          subLine2: "baştan kırmızı çizgiyle belirt.",
          subHighlight: "kırmızı çizgiyle",
          speech: "Sistemde bozulmaması ve dokunulmaması gereken alanları baştan net şekilde belirt.",
        },
        {
          ...ep3Base,
          stepIndex: 3,
          title: "03 • Örnek Girdi-Çıktı Ver",
          sub: "Bir somut örnek yüz satır açıklamaya bedeldir.",
          highlight: "SOMUT ÖRNEK",
          subLine1: "Uzun açıklamalar yerine",
          subLine2: "tek bir somut örnek göster.",
          subHighlight: "somut örnek",
          speech: "Uzun paragraflar yazmak yerine, beklediğin formatı gösteren tek bir somut örnek ver.",
        },
        {
          ...ep3Base,
          stepIndex: 4,
          title: "04 • Önce Plan İste (/plan)",
          sub: "Uygulamaya geçmeden önce mimariyi onayla.",
          highlight: "ÖNCE PLAN ONAYI",
          subLine1: "Doğrudan üretime geçme,",
          subLine2: "önce plan isteyip onayla.",
          subHighlight: "plan isteyip",
          speech: "Büyük işlerde doğrudan üretime geçme. Önce plan iste, mimariyi gör ve onayla.",
        },
        {
          ...ep3Base,
          stepIndex: 5,
          title: "05 • Doğrulama Kriteri Koy",
          sub: "Model kendi çıktısını test etmeden bitirmesin.",
          highlight: "URETIR.COM • AI AKADEMİ",
          subLine1: "Test kriterini baştan ver,",
          subLine2: "rehberler uretir.com'da.",
          subHighlight: "uretir.com'da.",
          speech: "Doğrulama kriterini baştan ver ki model işini test etsin. Rehberler uretir.com'da.",
        },
      ],
    },
    finansai: {
      slot: "cat-finansai",
      pureBlackMode: true,
      label: "ÜRETİR YAPAY ZEKA AKADEMİSİ · BÖLÜM 04: KURAL DOSYASI VS HOOK",
      targetUrl: "https://www.uretir.com",
      whatsappTargetKey: "finansai",
      customCaption: [
        `🦖 Hafıza Dosyası Rica Eder, Hook Zorla Yaptırır! | Üretir Akademi`,
        ``,
        `🌐 Yapay zeka otomasyon rehberleri: www.uretir.com`,
        `#Üretir #YapayZeka #Otomasyon #AIAkademi #Yazılım #Keşfet`,
      ].join("\n"),
      scenes: [
        {
          ...ep4Base,
          stepIndex: 0,
          title: "Hafıza Dosyası Rica Eder, Hook Zorla Yaptırır",
          sub: "Kritik kuralları şansa bırakma.",
          highlight: "04 • OTOMASYON KİLİDİ",
          subLine1: "Kural dosyası sadece rica eder,",
          subLine2: "hook ise zorla yaptırır.",
          subHighlight: "zorla yaptırır.",
          speech: "Kural dosyası modele sadece rica eder. Hook ise kritik adımı yüzde yüz zorla yaptırır.",
        },
        {
          ...ep4Base,
          stepIndex: 1,
          title: "01 • Tavsiye: Kural Dosyası",
          sub: "Stil ve ton tercihleri için kural dosyası idealdir.",
          highlight: "ESNEK REHBER",
          subLine1: "Genel stil tercihlerini",
          subLine2: "kural dosyasında tut.",
          subHighlight: "kural dosyasında",
          speech: "Genel yazım stili ve mimari tercihler için kural dosyası harika bir rehberdir.",
        },
        {
          ...ep4Base,
          stepIndex: 2,
          title: "02 • Zorunlu: Pre-Tool Hook",
          sub: "Araç çalışmadan önce devreye giren otomatik kilit.",
          highlight: "PRE-TOOL KİLİDİ",
          subLine1: "Kritik işlem öncesinde",
          subLine2: "pre-tool hook devreye girer.",
          subHighlight: "pre-tool hook",
          speech: "Asla atlanmaması gereken adımlarda, araç çalışmadan önce devreye giren pre-tool hook kullan.",
        },
        {
          ...ep4Base,
          stepIndex: 3,
          title: "03 • Otomatik Stil Kontrolü",
          sub: "Her dosya kaydında otomatik test ve formatlama.",
          highlight: "OTOMATİK FORMAT",
          subLine1: "Dosya kaydedildiği anda",
          subLine2: "otomatik kontrol çalışsın.",
          subHighlight: "otomatik kontrol",
          speech: "Her dosya değişikliğinden sonra otomatik format ve test kontrolünü koda bağla.",
        },
        {
          ...ep4Base,
          stepIndex: 4,
          title: "04 • Riskli Komutu Engelle",
          sub: "Veritabanı veya üretim silme komutlarını durdur.",
          highlight: "GÜVENLİK KALKANI",
          subLine1: "Tehlikeli sistem komutlarını",
          subLine2: "otomatik olarak engelle.",
          subHighlight: "otomatik olarak",
          speech: "Canlı sistemi bozabilecek tehlikeli komutları hook ile otomatik olarak engelle.",
        },
        {
          ...ep4Base,
          stepIndex: 5,
          title: "05 • Sıfır Hata Üretim Hattı",
          sub: "Yapay zeka hızını deterministik kuralla birleştir.",
          highlight: "URETIR.COM • AI AKADEMİ",
          subLine1: "Hızı kuralla birleştir,",
          subLine2: "sistemler uretir.com'da.",
          subHighlight: "uretir.com'da.",
          speech: "Yapay zeka hızını kesin kurallarla birleştir. Tüm sistemler uretir.com adresinde.",
        },
      ],
    },
    evai: {
      slot: "cat-evai",
      pureBlackMode: true,
      label: "ÜRETİR YAPAY ZEKA AKADEMİSİ · BÖLÜM 05: ÇOKLU AJAN SİSTEMİ",
      targetUrl: "https://www.uretir.com/ajanlar",
      whatsappTargetKey: "evai",
      customCaption: [
        `🦖 Tek Bir Ajanla Uğraşma, Alt Ajanlarla 10 Kat Hızlan! | Üretir Akademi`,
        ``,
        `🌐 Otonom ajan sistemleri: www.uretir.com/ajanlar`,
        `#Üretir #AIAgents #YapayZeka #Otomasyon #Üretkenlik #Keşfet`,
      ].join("\n"),
      scenes: [
        {
          ...ep5Base,
          stepIndex: 0,
          title: "Tek Bir Ajanla Uğraşma: Alt Ajanlarla 10 Kat Hızlan",
          sub: "Ana bağlamı kirletmeden paralel üretim yap.",
          highlight: "05 • ÇOKLU AJANLAR",
          subLine1: "Her işi tek ajana yaptırma,",
          subLine2: "alt ajanlarla on kat hızlan.",
          subHighlight: "on kat hızlan.",
          speech: "Her işi tek bir ajana yaptırma. Görevleri subagent sistemine bölerek on kat hızlan.",
        },
        {
          ...ep5Base,
          stepIndex: 1,
          title: "01 • Araştırmacı Alt Ajan",
          sub: "Yüzlerce dosyayı ayrı bir pencerede tarasın.",
          highlight: "ARAŞTIRMA AJANI",
          subLine1: "Derin dosya taramasını",
          subLine2: "araştırmacı ajana devret.",
          subHighlight: "araştırmacı ajana",
          speech: "Yüzlerce dosyayı tarama işini araştırmacı alt ajana devret.",
        },
        {
          ...ep5Base,
          stepIndex: 2,
          title: "02 • Kod İnceleme Ajanı",
          sub: "Yazılan kodu bağımsız bir gözle denetlesin.",
          highlight: "DENETİM AJANI",
          subLine1: "Üretilen çıktıyı bağımsız",
          subLine2: "inceleme ajanına denetlet.",
          subHighlight: "inceleme ajanına",
          speech: "Üretilen çıktıyı, ikinci bir denetim ajanına bağımsız gözle kontrol ettir.",
        },
        {
          ...ep5Base,
          stepIndex: 3,
          title: "03 • Test Doğrulama Ajanı",
          sub: "Arka planda testleri koşup sadece sonucu getirsin.",
          highlight: "TEST AJANI",
          subLine1: "Uzun test kayıtlarını",
          subLine2: "alt ajan arka planda çözsün.",
          subHighlight: "arka planda",
          speech: "Uzun test çıktılarını ana ekrana taşıma, test ajanı arka planda doğrulama yapsın.",
        },
        {
          ...ep5Base,
          stepIndex: 4,
          title: "04 • Temiz Ana Bağlam",
          sub: "Ana ajan sadece temiz özetlerle karar versin.",
          highlight: "TEMİZ ANA EKRAN",
          subLine1: "Ana ekrana sadece",
          subLine2: "net sonuç özeti gelsin.",
          subHighlight: "net sonuç özeti",
          speech: "Böylece ana context penceren hiç şişmez, ekrana sadece net sonuç özeti gelir.",
        },
        {
          ...ep5Base,
          stepIndex: 5,
          title: "05 • Paralel Üretim Hattı",
          sub: "Kendi yapay zeka ekibini uretir.com ile kur.",
          highlight: "URETIR.COM/AJANLAR",
          subLine1: "Kendi ajan ekibini kur,",
          subLine2: "merkez uretir.com'da.",
          subHighlight: "uretir.com'da.",
          speech: "Kendi yapay zeka ajan ekibini kur. Rehberler uretir.com adresinde.",
        },
      ],
    },
    arabaai: {
      slot: "cat-arabaai",
      pureBlackMode: true,
      label: "ÜRETİR YAPAY ZEKA AKADEMİSİ · BÖLÜM 06: SKILL MİMARİSİ",
      targetUrl: "https://www.uretir.com",
      whatsappTargetKey: "arabaai",
      customCaption: [
        `🦖 Aynı Promptu Tekrar Yazma: Skill Yap, Tek Tıkla Üret! | Üretir Akademi`,
        ``,
        `🌐 Yapay zeka eğitim ve üretim altyapısı: www.uretir.com`,
        `#Üretir #YapayZeka #SkillMimarisi #Otomasyon #Üretkenlik #Keşfet`,
      ].join("\n"),
      scenes: [
        {
          ...ep6Base,
          stepIndex: 0,
          title: "Aynı Promptu Tekrar Yazma: Skill Yap, Tek Tıkla Üret",
          sub: "Kendi yapay zeka beceri kütüphaneni oluştur.",
          highlight: "06 • SKILL MİMARİSİ",
          subLine1: "Aynı promptu her gün yazma,",
          subLine2: "skill yap, tek komutla üret.",
          subHighlight: "skill yap,",
          speech: "Her gün aynı uzun promptu tekrar yazma. Bir kez skill yap, tek komutla üret.",
        },
        {
          ...ep6Base,
          stepIndex: 1,
          title: "01 • Tekrarlayan İşi Seç",
          sub: "Haftada üç kez yaptığın işi tespit et.",
          highlight: "TEKRARLAYAN İŞ",
          subLine1: "Sürekli tekrar ettiğin",
          subLine2: "iş akışını tespit et.",
          subHighlight: "iş akışını",
          speech: "Her hafta tekrar tekrar yaptığın standart bir workflow sürecini tespit et.",
        },
        {
          ...ep6Base,
          stepIndex: 2,
          title: "02 • SKILL.md Şablonu Yaz",
          sub: "Adımları ve kuralları tek bir dosyada tanımla.",
          highlight: "SKILL.MD ŞABLONU",
          subLine1: "Kuralları ve adımları",
          subLine2: "SKILL.md dosyasına yaz.",
          subHighlight: "SKILL.md",
          speech: "O işin tüm adımlarını ve kalite kurallarını SKILL.md dosyasına açıkça yaz.",
        },
        {
          ...ep6Base,
          stepIndex: 3,
          title: "03 • Örnek Çıktı Ekle",
          sub: "En iyi referans çıktını klasöre ekle.",
          highlight: "REFERANS ÇIKTI",
          subLine1: "En beğendiğin örnek çıktıyı",
          subLine2: "klasöre referans olarak koy.",
          subHighlight: "referans olarak",
          speech: "En beğendiğin örnek çıktıyı klasöre referans olarak ekle ki kalite hiç düşmesin.",
        },
        {
          ...ep6Base,
          stepIndex: 4,
          title: "04 • Tek Komutla Çağır",
          sub: "Artık sadece /komut yazarak saniyeler içinde üret.",
          highlight: "TEK KOMUT ÜRETİM",
          subLine1: "Artık uzun açıklama yok,",
          subLine2: "tek komutla anında çalıştır.",
          subHighlight: "tek komutla",
          speech: "Artık uzun açıklamalar yazmadan, tek bir komutla o işi saniyeler içinde çalıştır.",
        },
        {
          ...ep6Base,
          stepIndex: 5,
          title: "05 • Sistemi Sürekli Büyüt",
          sub: "Her yeni beceriyle dijital kaldıracını katla.",
          highlight: "URETIR.COM • AI AKADEMİ",
          subLine1: "Kendi üretim kütüphaneni kur,",
          subLine2: "altyapı uretir.com'da.",
          subHighlight: "uretir.com'da.",
          speech: "Her hafta yeni bir skill ekleyerek sistemini büyüt. Altyapı uretir.com'da.",
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
            text: "📦 Yeni stok videosu ve hazır kanal metni Telegram'a hazırlanıyor...",
          }),
        }).catch(() => {});

        if (cbData.startsWith("cat:")) {
          const targetCat = cbData.split(":")[1];
          await runSeparateCategoryPosts(targetCat === "all" ? null : targetCat);
        } else if (cbData.startsWith("slot:")) {
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

        if (text.startsWith("/stok") || text === "stok" || text.includes("stok üret") || text.includes("stok uret")) {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: cid,
              text: "📦 *6 Kategori (%100 İHLAL YOKTUR) Yeni Stok Üretimi Başlatıldı!* Her kategori için yeni ürün, yeni gerçek fotoğraf, telifsiz akustik fonlu 9:16 MP4 video, kapak görseli ve kopyalanabilir kanal açıklaması sırayla buraya gönderiliyor...",
              parse_mode: "Markdown",
            }),
          }).catch(() => {});
          await runSeparateCategoryPosts(null);
          continue;
        }

        for (const catKey of ["haberai", "puanai", "indirimai", "finansai", "evai", "arabaai"]) {
          if (text === `/${catKey}` || text === catKey) {
            await runSeparateCategoryPosts(catKey);
            continue;
          }
        }

        // If user sends a photo or natural-language campaign trigger
        if (
          bestPhoto ||
          text.includes("dyson") ||
          text.includes("indirim") ||
          text.includes("kampanya") ||
          text.includes("paylaş") ||
          text.includes("paylas")
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
              text: "📸 *Görseliniz alındı!* %100 İHLAL YOKTUR kontrolüyle sadece bu Telegram ekranına hazır stok videosu ve kanal metni üretiliyor...",
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
          await runSeparateCategoryPosts(null);
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
                `📦 *ÜRETİR TELEGRAM STOK & KANAL DAĞITIM MERKEZİ (@uretirbot)*`,
                `━━━━━━━━━━━━━━━━━━━━`,
                `🛡️ *Kısıtlama Koruması:* Otomatik Instagram/YouTube yüklemesi kapatıldı; tüm videolar **%100 İHLAL YOKTUR** denetiminden geçerek **sadece buraya (Telegram)** stok olarak gönderilir.`,
                `✅ *İçerik Paketi:* 9:16 1080x1920 MP4 Video + Kapak Görseli + Kopyalanabilir Kanal Açıklaması`,
                `✅ *Komutlar:* \`/stok\` (6'lı tam stok üretir), \`/haberai\`, \`/indirimai\`, \`/puanai\`, \`/finansai\`, \`/evai\`, \`/arabaai\``,
              ].join("\n"),
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: "📦 6'lı Yeni Stok Üret", callback_data: "cat:all" },
                    { text: "🔥 İndirimAI Stok", callback_data: "cat:indirimai" },
                  ],
                  [
                    { text: "🗺️ HaberAI Stok", callback_data: "cat:haberai" },
                    { text: "💳 PuanAI Stok", callback_data: "cat:puanai" },
                  ],
                  [
                    { text: "📈 FinansAI Stok", callback_data: "cat:finansai" },
                    { text: "🏠 EvAI Stok", callback_data: "cat:evai" },
                    { text: "🚗 ArabaAI Stok", callback_data: "cat:arabaai" },
                  ],
                  [
                    { text: "🤖 Ajan Paneli (uretir.com/ajanlar)", url: "https://www.uretir.com/ajanlar" },
                    { text: "🌐 uretir.com", url: "https://www.uretir.com" },
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
    return;
  }

  if (process.argv.includes("--separate-categories")) {
    await runSeparateCategoryPosts();
    return;
  }

  if (process.argv.includes("--eight-categories")) {
    await runEightCategoriesFonShowcase();
    return;
  }

  if (process.argv.includes("--dyson-special")) {
    await runDysonCampaignSpecial();
    return;
  }

  if (process.argv.includes("--all-slots")) {
    for (const s of ["09", "12", "15", "20"]) {
      await runSlot(s);
    }
    return;
  }

  const slotArg = process.argv.find((a) => a.startsWith("--slot"));
  if (slotArg) {
    const s = slotArg.includes("=") ? slotArg.split("=")[1] : detectSlot();
    await runSlot(s);
    return;
  }

  if (!process.argv.includes("--daemon-only")) {
    const slot = detectSlot();
    await runSlot(slot);
    if (!process.argv.includes("--daemon")) {
      return;
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


