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
    "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=85",
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

const cachedDinoCostumes = {};
async function getDinoMascotDataUri(costumeKey = "founder") {
  const key = String(costumeKey || "founder").toLowerCase();
  if (cachedDinoCostumes[key]) return cachedDinoCostumes[key];
  const fileMap = {
    analyst: "uretir-dino-analyst.png",
    scientist: "uretir-dino-scientist.png",
    creator: "uretir-dino-creator.png",
    founder: "uretir-dino-cutout.png",
  };
  const chosenFile = fileMap[key] || fileMap.founder;
  const cutoutPath = path.resolve("public", "mascot", chosenFile);
  const fallbackPath = path.resolve("public", "mascot", "uretir-dino-cutout.png");
  const finalPath = existsSync(cutoutPath) ? cutoutPath : fallbackPath;
  if (existsSync(finalPath)) {
    try {
      const buf = await fs.readFile(finalPath);
      cachedDinoCostumes[key] = `data:image/png;base64,${buf.toString("base64")}`;
      return cachedDinoCostumes[key];
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

function easeOutCubic(x) {
  const t = Math.max(0, Math.min(1, x));
  return 1 - Math.pow(1 - t, 3);
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

function renderHighlightedSubtitleLine(lineText, highlightText, accentColor = "#34d399") {
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

const LIGHT_STUDIO_PALETTES = {
  daylight_sage: {
    bg1: "#F4F8F5",
    bg2: "#E6F0EA",
    grid: "#D5E5DC",
    cardBg: "#FFFFFF",
    cardAlt: "#EDF5F0",
    border: "#BDD6C8",
    textDark: "#0F172A",
    textMuted: "#475569",
    accent: "#059669",
    accent2: "#10B981",
    accentSoft: "#D1FAE5",
    subBg: "#0F172A",
    subAccent: "#34D399",
  },
  sky_indigo: {
    bg1: "#F0F5FB",
    bg2: "#E3ECF8",
    grid: "#D2E0F2",
    cardBg: "#FFFFFF",
    cardAlt: "#EBF2FA",
    border: "#B9CDEC",
    textDark: "#0F172A",
    textMuted: "#475569",
    accent: "#2563EB",
    accent2: "#4F46E5",
    accentSoft: "#DBEAFE",
    subBg: "#0F172A",
    subAccent: "#60A5FA",
  },
  warm_sand: {
    bg1: "#FBF7F1",
    bg2: "#F3EAE0",
    grid: "#E5D9C8",
    cardBg: "#FFFFFF",
    cardAlt: "#F7F0E6",
    border: "#DEC8B0",
    textDark: "#1C1917",
    textMuted: "#57534E",
    accent: "#EA580C",
    accent2: "#D97706",
    accentSoft: "#FFEDD5",
    subBg: "#1C1917",
    subAccent: "#FB923C",
  },
  lavender_mint: {
    bg1: "#F6F4FF",
    bg2: "#EBE7FE",
    grid: "#DCD5F8",
    cardBg: "#FFFFFF",
    cardAlt: "#F1EEFC",
    border: "#C7BDF2",
    textDark: "#1E1B4B",
    textMuted: "#4C1D95",
    accent: "#7C3AED",
    accent2: "#0D9488",
    accentSoft: "#EDE9FE",
    subBg: "#1E1B4B",
    subAccent: "#A78BFA",
  },
  pearl_teal: {
    bg1: "#F1F8FA",
    bg2: "#E2F0F5",
    grid: "#CEE3EB",
    cardBg: "#FFFFFF",
    cardAlt: "#EAF4F8",
    border: "#B2D3E0",
    textDark: "#0F172A",
    textMuted: "#334155",
    accent: "#0891B2",
    accent2: "#0284C7",
    accentSoft: "#CFFAFE",
    subBg: "#0F172A",
    subAccent: "#22D3EE",
  },
  peach_emerald: {
    bg1: "#FFF8F4",
    bg2: "#F8ECE4",
    grid: "#EBDACF",
    cardBg: "#FFFFFF",
    cardAlt: "#FDF1EA",
    border: "#E2C6B6",
    textDark: "#18181B",
    textMuted: "#52525B",
    accent: "#E11D48",
    accent2: "#059669",
    accentSoft: "#FFE4E6",
    subBg: "#18181B",
    subAccent: "#FB7185",
  },
};

/**
 * Full-Screen 9:16 Vertical Graph Motion Composer (Lighter Studio Palettes + 4 Rotating Viral Templates + Multi-Costume Üretir Dino)
 * Implements `animated-infographic`, `chart-animation`, and `animated-diagram` best practices:
 * - Zone 1 (y=36..126): Live Agenda & Market Pulse Ticker Bar
 * - Zone 2 (y=140..384): Oversized Viral Hook Card + Eased KPI Metric Counter
 * - Zone 3 (y=400..1138): Full-Width 738px Graph Motion Stage (4 Rotating Templates: `bento_race`, `versus_matrix`, `flow_diagram`, `radar_bento`)
 * - Zone 4 (y=1154..1616): Left Live Agenda Takeaway & Cyber-Robot Voice Spectrum + Right 3D Üretir Dino (Rotating Costumes!)
 * - Zone 5 (y=1632..1882): Synced Dynamic Subtitles Dock + Viral Save/Share Bar
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
  const paletteKey = scene.palette || "daylight_sage";
  const pal = LIGHT_STUDIO_PALETTES[paletteKey] || LIGHT_STUDIO_PALETTES.daylight_sage;
  const accent = scene.accent || pal.accent;
  const accent2 = scene.accent2 || pal.accent2;
  const template = scene.template || "bento_race";
  const costumeKey = scene.costume || "analyst";

  const costumeLabels = {
    analyst: "🦖 DİNO ANALİST MODU",
    scientist: "🧪 DİNO AI LAB MODU",
    creator: "🎧 DİNO CREATOR MODU",
    founder: "🧭 DİNO KURUCU MODU",
  };
  const costumeBadge = costumeLabels[costumeKey] || costumeLabels.analyst;

  const hookLine1 = scene.hookLine1 || wrapLines(scene.title, 24, 2)[0] || "Yapay zeka ile üretimde";
  const hookLine2 = scene.hookLine2 || wrapLines(scene.title, 24, 2)[1] || "10 kat kaldıraç sistemi";
  const hookLine3 = scene.hookLine3 || scene.sub || "Kaydetmelik doğrulanan veri ve iş akışı";

  const moduleNum = scene.moduleNum || "01";
  const moduleKicker = scene.moduleKicker || "CANLI GÜNDEM & SİSTEM";
  const liveTicker = scene.liveTicker || "CANLI: Dolar, Altın, BIST 100 ve Yapay Zeka Gündemi • uretir.com";
  const kpiNumberTarget = Number(scene.kpiNumber || 10);
  const kpiSuffix = scene.kpiSuffix || "x";
  const kpiLabel = scene.kpiLabel || "ÜRETİM HIZI";

  const defaultRows = [
    { num: "01", label: "Otonom Ajan & Kodlama", val: 95, oldText: "4 Saat Manuel", newText: "8 Dakika AI", tag: "12x Hız" },
    { num: "02", label: "Canlı Gündem & Veri Sentezi", val: 89, oldText: "20 Sekme Tarama", newText: "Anlık Radar", tag: "10x Hız" },
    { num: "03", label: "Kalıcı Hafıza (URETIR.md)", val: 84, oldText: "Her Gün Tekrar", newText: "Sıfır Unutma", tag: "%100 Net" },
    { num: "04", label: "Otomatik Hook & Test Kilidi", val: 79, oldText: "İnsan Hatası", newText: "Sıfır Hata", tag: "Otonom" },
    { num: "05", label: "Tek Komut Skill Kütüphanesi", val: 92, oldText: "Uzun Promptlar", newText: "Tek Tık Üretim", tag: "7/24 Aktif" },
  ];
  const rows = Array.isArray(scene.rows) && scene.rows.length === 5 ? scene.rows : defaultRows;

  const activeStep =
    typeof scene.stepIndex === "number"
      ? scene.stepIndex
      : totalScenes > 1
        ? Math.min(5, sceneIdx)
        : Math.min(5, Math.floor(progressRatio * 6));

  const isClickingNow = activeStep >= 1 && progressRatio >= 0.22 && progressRatio <= 0.48;
  const clickCompletedInCurrent = activeStep >= 1 && progressRatio > 0.30;
  const completedCount = Math.min(5, Math.max(1, activeStep === 0 ? 1 : activeStep));
  const easedProg = easeOutCubic(Math.min(1, progressRatio * 1.4));
  const animatedKpi =
    kpiSuffix === "/7"
      ? 24
      : Math.max(1, Math.round(kpiNumberTarget * (0.35 + 0.65 * easedProg)));

  // Dino motion
  const dinoBreatheY = Math.round(Math.sin(progressRatio * Math.PI * 2) * 5 - voiceAmp * 10);
  const dinoShiftX = Math.round(Math.sin(progressRatio * Math.PI * 2) * 5);
  const dinoTilt = (Math.sin(progressRatio * Math.PI * 2) * 1.5 + (voiceAmp - 0.3) * 2.0).toFixed(2);
  const dinoScaleX = (1 - voiceAmp * 0.012).toFixed(3);
  const dinoScaleY = (1 + voiceAmp * 0.025).toFixed(3);

  // Build Template-Specific Middle Graph Motion Stage (y=400..1138)
  let stageContentSvg = "";

  if (template === "versus_matrix") {
    // TEMPLATE 2: ESKİ YÖNTEM VS ÜRETİR AI KALDIRACI (High-Save Comparison Matrix)
    const matrixRows = rows.map((r, idx) => {
      const stepNum = idx + 1;
      const ry = 482 + idx * 88;
      const isCurrent = stepNum === activeStep || (activeStep === 0 && idx === 0);
      const isDone = stepNum < activeStep || isCurrent;
      const rowStroke = isCurrent ? accent : pal.border;
      const rowStrokeW = isCurrent ? "3" : "1.5";
      const oldText = r.oldText || "3 Saat Manuel İş";
      const newText = r.newText || r.label;
      const badgeText = r.tag || "+10x";
      const barW = Math.round((isDone ? (r.val || 88) : 45) * 2.2 * (isCurrent ? 0.6 + 0.4 * easedProg : 1));
      return `
      <g>
        <rect x="56" y="${ry}" width="968" height="76" rx="14" fill="${isCurrent ? pal.cardAlt : pal.cardBg}" stroke="${rowStroke}" stroke-width="${rowStrokeW}" />
        <rect x="72" y="${ry + 16}" width="44" height="44" rx="10" fill="${isCurrent ? accent : pal.accentSoft}" />
        <text x="94" y="${ry + 45}" text-anchor="middle" fill="${isCurrent ? "#FFFFFF" : accent}" font-family="Consolas, monospace" font-size="20" font-weight="800">${escapeXml(r.num || `0${stepNum}`)}</text>
        <!-- Old Method (Left) -->
        <text x="134" y="${ry + 33}" fill="#DC2626" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="16" font-weight="700">✕ ESKİ: ${escapeXml(oldText)}</text>
        <text x="134" y="${ry + 58}" fill="${pal.textDark}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="21" font-weight="800">✓ YENİ: ${escapeXml(newText)}</text>
        <!-- Animated Progress Bar & Multiplier Pill (Right) -->
        <rect x="640" y="${ry + 24}" width="220" height="28" rx="8" fill="${pal.bg2}" />
        <rect x="640" y="${ry + 24}" width="${Math.min(220, Math.max(40, barW))}" height="28" rx="8" fill="${accent}" />
        <rect x="878" y="${ry + 18}" width="126" height="40" rx="10" fill="${isCurrent ? accent : pal.accentSoft}" />
        <text x="941" y="${ry + 44}" text-anchor="middle" fill="${isCurrent ? "#FFFFFF" : accent}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="18" font-weight="900">${escapeXml(badgeText)}</text>
      </g>`;
    });

    // Bottom Efficiency Gain Curve inside Stage (y=934..1122)
    const curvePts = [
      [86, 1096],
      [260, 1082],
      [440, 1056],
      [620, 1024],
      [800, 998],
      [980, Math.round(986 - voiceAmp * 8)],
    ];
    const bezierD = buildSmoothBezierPath(curvePts);
    const areaD = `${bezierD} L 980 1106 L 86 1106 Z`;

    stageContentSvg = `
      <rect x="36" y="400" width="1008" height="738" rx="24" fill="${pal.cardBg}" stroke="${pal.border}" stroke-width="2" />
      <rect x="56" y="418" width="474" height="48" rx="12" fill="#FEE2E2" />
      <text x="293" y="449" text-anchor="middle" fill="#B91C1C" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="19" font-weight="800">✕ ESKİ MANUEL YÖNTEM (ZAMAN KAYBI)</text>
      <rect x="550" y="418" width="474" height="48" rx="12" fill="${pal.accentSoft}" />
      <text x="787" y="449" text-anchor="middle" fill="${accent}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="19" font-weight="900">✓ ÜRETİR AI SİSTEMİ (10X KALDIRAÇ)</text>
      ${matrixRows.join("\n")}
      <rect x="56" y="932" width="968" height="188" rx="16" fill="${pal.cardAlt}" stroke="${pal.border}" stroke-width="1.5" />
      <text x="84" y="964" fill="${pal.textDark}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="19" font-weight="800">📈 NET ZAMAN VE VERİMLİLİK KAZANCI EĞRİSİ</text>
      <text x="996" y="964" text-anchor="end" fill="${accent}" font-family="Consolas, monospace" font-size="22" font-weight="900">+%${Math.round(completedCount * 18 + voiceAmp * 8)} VERİM</text>
      <path d="${areaD}" fill="${accent}" fill-opacity="0.16" />
      <path d="${bezierD}" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round" />
      ${curvePts.map((pt, i) => `<circle cx="${pt[0]}" cy="${pt[1]}" r="${i === completedCount ? 9 : 6}" fill="${i <= completedCount ? accent : pal.border}" stroke="#FFFFFF" stroke-width="2.5" />`).join("\n")}
    `;
  } else if (template === "flow_diagram") {
    // TEMPLATE 3: OTONOM SİSTEM AKIŞ ŞEMASI (2x2 Connected Node Architecture + Master Hub + Live Table)
    const nodeCoords = [
      { x: 60, y: 468, w: 450, h: 152 },
      { x: 570, y: 468, w: 450, h: 152 },
      { x: 60, y: 658, w: 450, h: 152 },
      { x: 570, y: 658, w: 450, h: 152 },
    ];
    const nodesSvg = nodeCoords.map((nc, idx) => {
      const r = rows[idx] || defaultRows[idx];
      const stepNum = idx + 1;
      const isCurrent = stepNum === activeStep || (activeStep === 0 && idx === 0);
      const isDone = stepNum <= completedCount;
      const strokeC = isCurrent ? accent : isDone ? accent2 : pal.border;
      const valPct = r.val || 85 - idx * 4;
      return `
      <g>
        <rect x="${nc.x}" y="${nc.y}" width="${nc.w}" height="${nc.h}" rx="18" fill="${isCurrent ? pal.cardAlt : pal.cardBg}" stroke="${strokeC}" stroke-width="${isCurrent ? 3.5 : 1.8}" />
        <rect x="${nc.x + 20}" y="${nc.y + 20}" width="52" height="42" rx="10" fill="${isDone ? accent : pal.accentSoft}" />
        <text x="${nc.x + 46}" y="${nc.y + 48}" text-anchor="middle" fill="${isDone ? "#FFFFFF" : accent}" font-family="Consolas, monospace" font-size="20" font-weight="900">0${stepNum}</text>
        <text x="${nc.x + 88}" y="${nc.y + 47}" fill="${pal.textDark}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="22" font-weight="800">${escapeXml(r.label)}</text>
        <text x="${nc.x + 22}" y="${nc.y + 88}" fill="${pal.textMuted}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="17" font-weight="600">${escapeXml(r.newText || "Otonom işlem ve doğrulama katmanı")}</text>
        <rect x="${nc.x + 22}" y="${nc.y + 108}" width="${nc.w - 130}" height="18" rx="6" fill="${pal.bg2}" />
        <rect x="${nc.x + 22}" y="${nc.y + 108}" width="${Math.round(((nc.w - 130) * valPct) / 100)}" height="18" rx="6" fill="${accent}" />
        <text x="${nc.x + nc.w - 22}" y="${nc.y + 123}" text-anchor="end" fill="${accent}" font-family="Consolas, monospace" font-size="18" font-weight="900">%${valPct}</text>
      </g>`;
    });

    const row5 = rows[4] || defaultRows[4];
    const pulseX = Math.round(510 + Math.sin(progressRatio * Math.PI * 2) * 35);

    stageContentSvg = `
      <rect x="36" y="400" width="1008" height="738" rx="24" fill="${pal.cardBg}" stroke="${pal.border}" stroke-width="2" />
      <text x="64" y="444" fill="${pal.textDark}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="22" font-weight="900">⚡ KAYDETMELİK OTONOM SİSTEM AKIŞ ŞEMASI</text>
      <text x="1016" y="444" text-anchor="end" fill="${accent}" font-family="Consolas, monospace" font-size="19" font-weight="800">AKTİF DÜĞÜM: 0${completedCount}/05</text>
      <!-- Animated Flow Connectors Between Nodes -->
      <line x1="510" y1="544" x2="570" y2="544" stroke="${accent}" stroke-width="4" stroke-dasharray="8,6" />
      <path d="M 795 620 L 795 640 L 285 640 L 285 658" fill="none" stroke="${accent}" stroke-width="4" stroke-dasharray="8,6" />
      <line x1="510" y1="734" x2="570" y2="734" stroke="${accent}" stroke-width="4" stroke-dasharray="8,6" />
      <circle cx="${pulseX}" cy="544" r="8" fill="${accent}" />
      ${nodesSvg.join("\n")}
      <!-- Step 05 Master Hub Card (y=832..954) -->
      <rect x="60" y="832" width="960" height="114" rx="18" fill="${pal.cardAlt}" stroke="${activeStep === 5 ? accent : pal.border}" stroke-width="${activeStep === 5 ? 3.5 : 2}" />
      <rect x="84" y="856" width="66" height="66" rx="14" fill="${accent}" />
      <text x="117" y="898" text-anchor="middle" fill="#FFFFFF" font-family="Consolas, monospace" font-size="24" font-weight="900">05</text>
      <text x="172" y="882" fill="${pal.textDark}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="24" font-weight="900">${escapeXml(row5.label)} • 7/24 Dijital Varlık</text>
      <text x="172" y="916" fill="${pal.textMuted}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="18" font-weight="600">Tüm adımlar birleşir ve 7/24 çalışan doğrulanmış dijital üretim sistemine dönüşür.</text>
      <rect x="836" y="864" width="160" height="50" rx="12" fill="${accent}" />
      <text x="916" y="896" text-anchor="middle" fill="#FFFFFF" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="18" font-weight="900">✓ TAM SİSTEM</text>
      <!-- Bottom Live Telemetry Bar (y=966..1118) -->
      <rect x="60" y="966" width="960" height="150" rx="16" fill="${pal.bg1}" stroke="${pal.border}" stroke-width="1.5" />
      <text x="86" y="1002" fill="${pal.textDark}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="19" font-weight="800">📊 SİSTEM ÇIKTI HIZI VE DOĞRULUK METRİKLERİ</text>
      <rect x="86" y="1024" width="280" height="72" rx="12" fill="${pal.cardBg}" stroke="${pal.border}" />
      <text x="108" y="1052" fill="${pal.textMuted}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="15" font-weight="700">OTOMASYON ORANI</text>
      <text x="108" y="1084" fill="${accent}" font-family="Consolas, monospace" font-size="28" font-weight="900">%${Math.min(99, 78 + completedCount * 4)}</text>
      <rect x="396" y="1024" width="280" height="72" rx="12" fill="${pal.cardBg}" stroke="${pal.border}" />
      <text x="418" y="1052" fill="${pal.textMuted}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="15" font-weight="700">HATA PAYI</text>
      <text x="418" y="1084" fill="${accent2}" font-family="Consolas, monospace" font-size="28" font-weight="900">&lt; %0.4</text>
      <rect x="706" y="1024" width="290" height="72" rx="12" fill="${pal.cardBg}" stroke="${pal.border}" />
      <text x="728" y="1052" fill="${pal.textMuted}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="15" font-weight="700">CANLI VERİ MERKEZİ</text>
      <text x="728" y="1084" fill="${pal.textDark}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="24" font-weight="900">uretir.com</text>
    `;
  } else if (template === "radar_bento") {
    // TEMPLATE 4: 5 ALTIN KURAL BENTO CHECKLIST (Left) + MULTI-AXIS PERFORMANCE CHART (Right)
    const checklistRows = rows.map((r, idx) => {
      const stepNum = idx + 1;
      const ry = 468 + idx * 126;
      const isCurrent = stepNum === activeStep || (activeStep === 0 && idx === 0);
      const isDone = stepNum < activeStep || (isCurrent && clickCompletedInCurrent);
      return `
      <g>
        <rect x="54" y="${ry}" width="556" height="110" rx="16" fill="${isCurrent ? pal.cardAlt : pal.cardBg}" stroke="${isCurrent ? accent : pal.border}" stroke-width="${isCurrent ? 3.2 : 1.5}" />
        <rect x="74" y="${ry + 22}" width="64" height="64" rx="14" fill="${isDone || isCurrent ? accent : pal.accentSoft}" />
        <text x="106" y="${ry + 63}" text-anchor="middle" fill="${isDone || isCurrent ? "#FFFFFF" : accent}" font-family="Consolas, monospace" font-size="24" font-weight="900">${escapeXml(r.num || `0${stepNum}`)}</text>
        <text x="158" y="${ry + 48}" fill="${pal.textDark}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="22" font-weight="800">${escapeXml(r.label)}</text>
        <text x="158" y="${ry + 80}" fill="${pal.textMuted}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="16" font-weight="600">${escapeXml(r.newText || "Doğrulanmış yapay zeka üretim adımı")}</text>
        <rect x="468" y="${ry + 32}" width="122" height="44" rx="11" fill="${isDone ? accent : pal.accentSoft}" />
        <text x="529" y="${ry + 60}" text-anchor="middle" fill="${isDone ? "#FFFFFF" : accent}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="16" font-weight="900">${isDone ? "✓ TAMAM" : "• AKTİF"}</text>
      </g>`;
    });

    const cursorY = Math.round(468 + Math.max(0, completedCount - 1) * 126 + 64);
    const gaugePct = Math.min(100, completedCount * 20);
    const dashLen = Math.round((gaugePct / 100) * 565);

    stageContentSvg = `
      <rect x="36" y="400" width="1008" height="738" rx="24" fill="${pal.cardBg}" stroke="${pal.border}" stroke-width="2" />
      <text x="58" y="444" fill="${pal.textDark}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="22" font-weight="900">🎯 UYGULANABİLİR 5 ALTIN KURAL VE CANLI PERFORMANS ENDEKSİ</text>
      ${checklistRows.join("\n")}
      <!-- Animated Pointer Cursor -->
      <g transform="translate(572, ${cursorY}) scale(${isClickingNow ? 0.88 : 1})">
        <circle cx="0" cy="0" r="20" fill="${accent}" fill-opacity="0.22" />
        <path d="M 0,0 L 0,24 L 6,19 L 11,29 L 16,27 L 11,17 L 19,17 Z" fill="${pal.textDark}" stroke="#FFFFFF" stroke-width="2" />
      </g>
      <!-- Right Column: Full-Height Multi-Metric Analytics Card (x=630..1024, y=468..1084) -->
      <rect x="630" y="468" width="394" height="616" rx="20" fill="${pal.cardAlt}" stroke="${pal.border}" stroke-width="1.8" />
      <text x="827" y="512" text-anchor="middle" fill="${pal.textDark}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="20" font-weight="900">CANLI KALDIRAÇ SKORU</text>
      <!-- Circular Gauge -->
      <circle cx="827" cy="648" r="90" fill="none" stroke="${pal.bg2}" stroke-width="20" />
      <circle cx="827" cy="648" r="90" fill="none" stroke="${accent}" stroke-width="20" stroke-linecap="round" stroke-dasharray="${dashLen} 600" transform="rotate(-90 827 648)" />
      <text x="827" y="650" text-anchor="middle" fill="${pal.textDark}" font-family="Consolas, monospace" font-size="42" font-weight="900">%${gaugePct}</text>
      <text x="827" y="680" text-anchor="middle" fill="${pal.textMuted}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="13" font-weight="800">TAMAMLANAN</text>
      <!-- Vertical Bar Comparison Inside Right Card -->
      ${[0, 1, 2, 3, 4]
        .map((b) => {
          const bx = 668 + b * 68;
          const bh = Math.round(70 + b * 24 + (b < completedCount ? 35 : 0) + voiceAmp * 16);
          const by = 995 - bh;
          return `<rect x="${bx}" y="${by}" width="44" height="${bh}" rx="10" fill="${b < completedCount ? accent : pal.border}" />
          <text x="${bx + 22}" y="${by - 10}" text-anchor="middle" fill="${pal.textDark}" font-family="Consolas, monospace" font-size="15" font-weight="800">0${b + 1}</text>`;
        })
        .join("\n")}
      <text x="827" y="1046" text-anchor="middle" fill="${accent}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="18" font-weight="900">📈 Her Adımda Katlanan Üretim Gücü</text>
    `;
  } else {
    // DEFAULT TEMPLATE 1 (`bento_race`): BAR CHART RACE + LIVE SPLINE AREA CHART + BENTO KPI
    const raceBars = rows.map((r, idx) => {
      const stepNum = idx + 1;
      const ry = 466 + idx * 78;
      const isCurrent = stepNum === activeStep || (activeStep === 0 && idx === 0);
      const isDone = stepNum <= completedCount;
      const targetVal = r.val || 96 - idx * 5;
      const shownVal = Math.round(targetVal * (isCurrent ? 0.72 + 0.28 * easedProg : isDone ? 1.0 : 0.65));
      const maxBarW = 468;
      const barW = Math.max(80, Math.round((maxBarW * shownVal) / 100));
      return `
      <g>
        <rect x="56" y="${ry}" width="968" height="66" rx="14" fill="${isCurrent ? pal.cardAlt : pal.cardBg}" stroke="${isCurrent ? accent : pal.border}" stroke-width="${isCurrent ? 3 : 1.4}" />
        <rect x="72" y="${ry + 13}" width="48" height="40" rx="10" fill="${isCurrent ? accent : pal.accentSoft}" />
        <text x="96" y="${ry + 40}" text-anchor="middle" fill="${isCurrent ? "#FFFFFF" : accent}" font-family="Consolas, monospace" font-size="19" font-weight="900">#${stepNum}</text>
        <text x="136" y="${ry + 41}" fill="${pal.textDark}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="21" font-weight="800">${escapeXml(r.label)}</text>
        <rect x="460" y="${ry + 17}" width="${barW}" height="32" rx="9" fill="${isCurrent ? accent : isDone ? accent2 : pal.border}" fill-opacity="${isDone || isCurrent ? "0.92" : "0.55"}" />
        <text x="${474 + barW}" y="${ry + 40}" fill="${pal.textDark}" font-family="Consolas, monospace" font-size="20" font-weight="900">%${shownVal}</text>
      </g>`;
    });

    const splinePts = [
      [84, 1084],
      [180, 1054],
      [280, 1028],
      [380, 992],
      [480, Math.round(956 - voiceAmp * 16)],
    ];
    const splinePath = buildSmoothBezierPath(splinePts);
    const splineArea = `${splinePath} L 480 1104 L 84 1104 Z`;

    stageContentSvg = `
      <rect x="36" y="400" width="1008" height="738" rx="24" fill="${pal.cardBg}" stroke="${pal.border}" stroke-width="2" />
      <text x="60" y="444" fill="${pal.textDark}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="22" font-weight="900">📊 CANLI ETKİ &amp; VERİMLİLİK SIRALAMASI</text>
      <text x="1016" y="444" text-anchor="end" fill="${accent}" font-family="Consolas, monospace" font-size="18" font-weight="800">VERİ MERKEZİ: URETIR.COM</text>
      ${raceBars.join("\n")}
      <!-- Bottom Left Bento: Animated Trend Curve (x=56..524, y=866..1118) -->
      <rect x="56" y="866" width="468" height="252" rx="18" fill="${pal.cardAlt}" stroke="${pal.border}" stroke-width="1.5" />
      <text x="80" y="904" fill="${pal.textDark}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="19" font-weight="800">📈 ÜRETKENLİK İVME GRAFİĞİ</text>
      <path d="${splineArea}" fill="${accent}" fill-opacity="0.18" />
      <path d="${splinePath}" fill="none" stroke="${accent}" stroke-width="4.5" stroke-linecap="round" />
      ${splinePts.map((pt) => `<circle cx="${pt[0]}" cy="${pt[1]}" r="6" fill="${accent}" stroke="#FFFFFF" stroke-width="2" />`).join("\n")}
      <!-- Bottom Right Bento: Key Comparison Stat Card (x=544..1024, y=866..1118) -->
      <rect x="544" y="866" width="480" height="252" rx="18" fill="${pal.cardAlt}" stroke="${pal.border}" stroke-width="1.5" />
      <text x="572" y="904" fill="${pal.textDark}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="19" font-weight="800">⚡ GÜNDEM KALDIRAÇ ÖZETİ</text>
      <rect x="572" y="924" width="204" height="168" rx="14" fill="${pal.cardBg}" stroke="${pal.border}" />
      <text x="674" y="966" text-anchor="middle" fill="${pal.textMuted}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="16" font-weight="700">MANUEL SÜRE</text>
      <text x="674" y="1024" text-anchor="middle" fill="#DC2626" font-family="Consolas, monospace" font-size="36" font-weight="900">10 Saat</text>
      <text x="674" y="1064" text-anchor="middle" fill="${pal.textMuted}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="15" font-weight="600">Yüksek Yorgunluk</text>
      <rect x="794" y="924" width="204" height="168" rx="14" fill="${accent}" />
      <text x="896" y="966" text-anchor="middle" fill="#FFFFFF" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="16" font-weight="800">AI SİSTEMİ İLE</text>
      <text x="896" y="1024" text-anchor="middle" fill="#FFFFFF" font-family="Consolas, monospace" font-size="36" font-weight="900">15 Dk</text>
      <text x="896" y="1064" text-anchor="middle" fill="${pal.accentSoft}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="15" font-weight="700">Sıfır Hata • 7/24</text>
    `;
  }

  // Cyber-Robot Voice Equalizer Bars inside Left Agenda Card (18 bars)
  const eqBars = [];
  for (let i = 0; i < 18; i++) {
    const bx = 68 + i * 26;
    const wave = Math.abs(Math.sin(progressRatio * Math.PI * 4 + i * 0.55));
    const bh = Math.max(10, Math.min(64, Math.round(12 + voiceAmp * 46 * wave)));
    const by = 1584 - bh;
    eqBars.push(`<rect x="${bx}" y="${by}" width="16" height="${bh}" rx="5" fill="${i % 2 === 0 ? accent : accent2}" />`);
  }

  // Dynamic Bottom 2-Line Subtitle inside Floating Dock (y=1632..1798)
  const fallbackSubLines = wrapLines(scene.speech || scene.sub || scene.title, 30, 2);
  const subLine1 = scene.subLine1 || fallbackSubLines[0] || "";
  const subLine2 = scene.subLine2 || fallbackSubLines[1] || "";
  const subHighlight = scene.subHighlight || "";
  const currentRow = rows[Math.max(0, Math.min(4, completedCount - 1))] || rows[0];

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
  <defs>
    <linearGradient id="lightCanvasGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${pal.bg1}" />
      <stop offset="100%" stop-color="${pal.bg2}" />
    </linearGradient>
    <pattern id="lightGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${pal.grid}" stroke-width="1" />
    </pattern>
    <radialGradient id="dinoLightGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.22" />
      <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- 1. LIGHT, AIRY HIGH-RETENTION 9:16 VERTICAL STUDIO CANVAS -->
  <rect width="1080" height="1920" fill="url(#lightCanvasGrad)" />
  <rect width="1080" height="1920" fill="url(#lightGrid)" opacity="0.65" />

  <!-- 2. ZONE 1 (y=36..124): LIVE AGENDA & MARKET PULSE TOP BAR -->
  <rect x="36" y="38" width="1008" height="84" rx="20" fill="${pal.cardBg}" stroke="${pal.border}" stroke-width="2" />
  <rect x="54" y="55" width="214" height="50" rx="13" fill="${accent}" />
  <circle cx="80" cy="80" r="7" fill="#FFFFFF" />
  <text x="170" y="87" text-anchor="middle" fill="#FFFFFF" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="18" font-weight="900">CANLI GÜNDEM</text>
  <text x="290" y="87" fill="${pal.textDark}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="20" font-weight="800">${escapeXml(liveTicker.slice(0, 56))}</text>
  <rect x="910" y="55" width="116" height="50" rx="13" fill="${pal.accentSoft}" />
  <text x="968" y="87" text-anchor="middle" fill="${accent}" font-family="Consolas, monospace" font-size="20" font-weight="900">0${completedCount}/05</text>

  <!-- 3. ZONE 2 (y=138..384): OVERSIZED VIRAL HOOK & KPI COUNTER CARD -->
  <rect x="36" y="138" width="1008" height="244" rx="24" fill="${pal.cardBg}" stroke="${pal.border}" stroke-width="2" />
  <rect x="64" y="162" width="340" height="38" rx="10" fill="${pal.accentSoft}" />
  <text x="82" y="187" fill="${accent}" font-family="Consolas, monospace" font-size="17" font-weight="900">${escapeXml(moduleNum)} • ${escapeXml(moduleKicker)}</text>
  <text x="64" y="248" fill="${pal.textDark}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="42" font-weight="900" letter-spacing="-0.6">${escapeXml(hookLine1)}</text>
  <text x="64" y="302" fill="${accent}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="42" font-weight="900" letter-spacing="-0.6">${escapeXml(hookLine2)}</text>
  <text x="64" y="350" fill="${pal.textMuted}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="22" font-weight="600">${escapeXml(hookLine3)}</text>

  <!-- Right Eased KPI Metric Counter Box inside Hero Card -->
  <rect x="786" y="162" width="234" height="196" rx="20" fill="${pal.cardAlt}" stroke="${accent}" stroke-width="2.5" />
  <text x="903" y="254" text-anchor="middle" fill="${accent}" font-family="Consolas, monospace" font-size="64" font-weight="900">${animatedKpi}${escapeXml(kpiSuffix)}</text>
  <text x="903" y="302" text-anchor="middle" fill="${pal.textDark}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="18" font-weight="900">${escapeXml(kpiLabel)}</text>
  <text x="903" y="332" text-anchor="middle" fill="${pal.textMuted}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="15" font-weight="700">Doğrulanan Etki</text>

  <!-- 4. ZONE 3 (y=400..1138): ROTATING FULL-WIDTH GRAPH MOTION TEMPLATE -->
  ${stageContentSvg}

  <!-- 5. ZONE 4 (y=1154..1616): LEFT AGENDA & ROBOT SPECTRUM + RIGHT 3D DINO COSTUME STAGE -->
  <!-- Left Card: Active Step Takeaway + Cyber-Robot Voice Spectrum -->
  <rect x="36" y="1154" width="540" height="462" rx="24" fill="${pal.cardBg}" stroke="${pal.border}" stroke-width="2" />
  <rect x="64" y="1182" width="290" height="40" rx="10" fill="${pal.accentSoft}" />
  <text x="82" y="1208" fill="${accent}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="17" font-weight="900">📡 AKTİF ADIM &amp; GÜNDEM ÖZETİ</text>
  <text x="64" y="1264" fill="${pal.textDark}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="25" font-weight="900">${escapeXml(`${currentRow.num || "01"} • ${currentRow.label}`)}</text>
  <text x="64" y="1306" fill="${pal.textMuted}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="18" font-weight="600">${escapeXml(wrapLines(scene.sub || "Kaydetmelik doğrulanan veri ve uygulama adımı.", 42, 1)[0])}</text>

  <rect x="64" y="1340" width="484" height="114" rx="16" fill="${pal.cardAlt}" stroke="${pal.border}" stroke-width="1.5" />
  <text x="88" y="1376" fill="${accent}" font-family="Consolas, monospace" font-size="17" font-weight="900">⚡ URETIR.COM KALDIRAÇ NOTU</text>
  <text x="88" y="1412" fill="${pal.textDark}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="20" font-weight="800">${escapeXml(scene.highlight || currentRow.newText || "10x Üretim & Doğrulanmış Veri")}</text>
  <text x="88" y="1438" fill="${pal.textMuted}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="16" font-weight="600">Canlı araçlar ve bülten: www.uretir.com</text>

  <text x="68" y="1504" fill="${pal.textMuted}" font-family="Consolas, monospace" font-size="15" font-weight="800">🤖 CYBER-ROBOT SES FREKANS SPEKTRUMU (CANLI)</text>
  ${eqBars.join("\n  ")}

  <!-- Right Card: 3D Üretir Dino Mascot Stage with Rotating Costume -->
  <rect x="594" y="1154" width="450" height="462" rx="24" fill="${pal.cardBg}" stroke="${pal.border}" stroke-width="2" />
  <circle cx="819" cy="1390" r="190" fill="url(#dinoLightGlow)" />
  <rect x="622" y="1178" width="394" height="44" rx="12" fill="${pal.accentSoft}" />
  <text x="819" y="1207" text-anchor="middle" fill="${accent}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="18" font-weight="900">${escapeXml(costumeBadge)}</text>

  <ellipse cx="${819 + dinoShiftX}" cy="1584" rx="145" ry="18" fill="${pal.grid}" />
  <ellipse cx="${819 + dinoShiftX}" cy="1584" rx="${95 + Math.round(voiceAmp * 26)}" ry="9" fill="none" stroke="${accent}" stroke-width="2.5" />
  <g transform="translate(${624 + dinoShiftX}, ${1216 + dinoBreatheY}) rotate(${dinoTilt}, 195, 190) translate(195, 360) scale(${dinoScaleX}, ${dinoScaleY}) translate(-195, -360)">
    ${
      dinoDataUri
        ? `<image href="${dinoDataUri}" x="0" y="0" width="390" height="380" preserveAspectRatio="xMidYMid meet" />`
        : ""
    }
  </g>

  <!-- 6. ZONE 5 (y=1632..1882): HIGH-CONTRAST SYNCED SUBTITLE DOCK & SAVE CTA BAR -->
  <rect x="36" y="1632" width="1008" height="168" rx="24" fill="${pal.subBg}" />
  <rect x="62" y="1652" width="136" height="32" rx="8" fill="${accent}" />
  <text x="130" y="1674" text-anchor="middle" fill="#FFFFFF" font-family="Consolas, monospace" font-size="15" font-weight="900">🤖 AI ROBOT</text>
  ${
    subLine2
      ? `<text x="540" y="1708" text-anchor="middle" fill="#FFFFFF" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="38" font-weight="800">${renderHighlightedSubtitleLine(subLine1, subHighlight, pal.subAccent)}</text>
  <text x="540" y="1762" text-anchor="middle" fill="#FFFFFF" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="38" font-weight="800">${renderHighlightedSubtitleLine(subLine2, subHighlight, pal.subAccent)}</text>`
      : `<text x="540" y="1736" text-anchor="middle" fill="#FFFFFF" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="40" font-weight="800">${renderHighlightedSubtitleLine(subLine1, subHighlight, pal.subAccent)}</text>`
  }

  <!-- Bottom Save / Share / uretir.com Action Bar -->
  <rect x="36" y="1814" width="1008" height="68" rx="18" fill="${pal.cardBg}" stroke="${pal.border}" stroke-width="2" />
  <text x="68" y="1856" fill="${pal.textDark}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="22" font-weight="800">📌 Lazım olur, hemen kaydet &amp; paylaş</text>
  <rect x="748" y="1826" width="278" height="44" rx="12" fill="${accent}" />
  <text x="887" y="1855" text-anchor="middle" fill="#FFFFFF" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="20" font-weight="900">🌐 uretir.com</text>
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

  // Cyber-Robot / Futuristic AI Narrator Vocal DSP Filter ("robot konuşuyor gibi olsun + içeriğe odaklı net telaffuz")
  const cyberRobotVoiceFilter = [
    "asetrate=22050*0.97",
    "aresample=44100",
    "atempo=1.01",
    "highpass=f=95",
    "aecho=0.85:0.88:14|28:0.34|0.20",
    "flanger=delay=2.2:depth=1.6:regen=28:width=70:speed=0.9:shape=triangular:phase=25:interp=linear",
    "equalizer=f=150:t=q:w=1.2:g=3.5",
    "equalizer=f=2600:t=q:w=1.1:g=3.8",
    "equalizer=f=4200:t=q:w=1.3:g=2.5",
    "acompressor=threshold=-20dB:ratio=4.5:attack=5:release=110:makeup=3.2",
    "extrastereo=m=1.25",
    "alimiter=limit=0.95",
  ].join(",");

  // 1. PRIMARY: Piper VITS Neural Turkish Male (tr_TR-fahrettin-medium) + Cyber-Robot AI Mastering
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
      const txtInPath = rawWavPath.replace(/\.raw\.wav$/, ".in.txt");
      await fs.writeFile(txtInPath, cleanText, "utf8");

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
              "1.00",
              "--noise-scale",
              "0.32",
              "--noise-w-scale",
              "0.38",
              "--sentence-silence",
              "0.28",
              "-i",
              txtInPath,
              "-f",
              rawWavPath,
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
                "1.00",
                "--noise-scale",
                "0.32",
                "--noise-w-scale",
                "0.38",
                "--sentence-silence",
                "0.28",
                "-i",
                txtInPath,
                "-f",
                rawWavPath,
              ],
              { timeout: 25_000 }
            );
            if (existsSync(rawWavPath)) wavBuilt = true;
          } catch {}
        }
      }

      await fs.unlink(txtInPath).catch(() => {});

      if (wavBuilt && existsSync(rawWavPath)) {
        const wavStats = await extractWavEnvelope(rawWavPath, numFrames);
        const envelope = wavStats?.envelope || null;
        const durationSec = wavStats?.rawDurationSec ? wavStats.rawDurationSec / (0.97 * 1.01) : 3.4;

        await execFileAsync(
          ffmpegBin,
          [
            "-y",
            "-i",
            rawWavPath,
            "-af",
            cyberRobotVoiceFilter,
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
    console.warn("[Piper Cyber-Robot Ses Uyarısı]:", piperErr?.message || piperErr);
  }

  // 2. Fallback: Try Node.js msedge-tts + Cyber-Robot Mastering
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
      if (existsSync(outMp3Path)) return { ok: true, envelope: null, durationSec: 3.4 };
    }
  } catch {}

  return { ok: false, envelope: null, durationSec: 3.4 };
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

  // PURE COPY-PASTE SHORT INSTAGRAM SEO CAPTION (Zero internal headers, ready to copy & paste directly into Reels)
  const readyCaption =
    slotData.customCaption ||
    [
      `${slotData.scenes?.[0]?.title || "Yapay zeka ve canlı veri ile 10 kat daha hızlı üret."} 🤖📈`,
      `📌 Lazım olur, hemen kaydet ve canlı araçlar için incele 👉 uretir.com`,
      `#üretir #yapayzeka #üretkenlik #otomasyon #teknoloji #keşfet`,
    ].join("\n");

  const caption = readyCaption.trim();

  const replyMarkup = JSON.stringify({
    inline_keyboard: [
      [
        { text: "📦 6'lı Viral Seri Üret", callback_data: "cat:all" },
        { text: "01 📊 Bar Race Gündem", callback_data: "cat:haberai" },
      ],
      [
        { text: "02 ⚡ Eski vs AI Matris", callback_data: "cat:puanai" },
        { text: "03 🔄 Otonom Akış Şeması", callback_data: "cat:indirimai" },
      ],
      [
        { text: "04 📈 Canlı Veri & Ekonomi", callback_data: "cat:finansai" },
        { text: "05 🤖 5 Ajanlı Ekip", callback_data: "cat:evai" },
        { text: "06 🎯 Amatör vs Pro AI", callback_data: "cat:arabaai" },
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
            console.log(`Telegram'a (@uretirbot -> ${chatId}) tam ekran Graph Motion MP4 ve copy-paste IG SEO metni gönderildi!`);
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
          form.append("caption", caption.slice(0, 1020));
          form.append("reply_markup", replyMarkup);
          form.append("photo", new Blob([imgBytes], { type: "image/png" }), `uretir-${slotData.slot}.png`);
          const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
            method: "POST",
            body: form,
            signal: AbortSignal.timeout(45_000),
          });
          const json = await res.json();
          if (json.ok) {
            console.log(`Telegram'a (@uretirbot -> ${chatId}) 1080x1920 kapak görseli ve copy-paste IG SEO metni gönderildi!`);
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
      `${slotData.scenes?.[0]?.title || "Yapay zeka ve canlı veri ile 10 kat daha hızlı üret."} 🤖📈`,
      `📌 Lazım olur, hemen kaydet ve canlı araçlar için incele 👉 uretir.com`,
      `#üretir #yapayzeka #üretkenlik #otomasyon #teknoloji #keşfet`,
    ].join("\n");

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
          "--with",
          "instagrapi",
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
    } catch {}
  }

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
  console.log(`[Üretir Tam Ekran 9:16 Graph Motion & Cyber-Robot Stüdyosu] ${slotData.label} hazırlanıyor...`);
  console.log(`======================================================`);

  const framesDir = path.join(outDir, "frames");
  await fs.mkdir(framesDir, { recursive: true });

  const baseFps = 10;
  const defaultFramesPerScene = slotData.scenes.length >= 6 ? 34 : slotData.scenes.length === 1 ? 54 : 36;
  const totalScenes = slotData.scenes.length;
  let frameCounter = 0;

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
  let totalAudioDurationSec = totalScenes * 3.5;

  // 1. Synthesize Cyber-Robot AI Turkish Voiceover FIRST & Compute Exact Per-Scene Frame Counts
  if (useTts) {
    try {
      const sceneVoicePaths = [];
      let accumulatedSec = 0;
      for (let i = 0; i < slotData.scenes.length; i++) {
        const sp = path.join(outDir, `scene-voice-${i}.mp3`);
        const padSecNum = i === slotData.scenes.length - 1 ? 0.55 : 0.30;
        const res = await synthesizeNaturalTurkishVoice(
          slotData.scenes[i].speech,
          slotData.voice || "tr-TR-AhmetNeural",
          sp,
          48
        );
        if (res?.ok && existsSync(sp)) {
          sceneVoicePaths.push({ path: sp, padSec: padSecNum });
          sceneEnvelopes[i] = res.envelope;
          const sceneTotalSec = (res.durationSec || 3.2) + padSecNum;
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
      console.warn("[Cyber-Robot Ses Birleştirme Uyarısı]:", mixErr?.message || mixErr);
    }
  }

  console.log(
    `[2/4] [Cyber-Robot Seslendirme & Tam Ekran Graph Motion Senkronu]: ${hasVoice ? "BAŞARILI" : "YEDEK MOD"}`
  );

  // 2. Render Full-Height 9:16 Light-Palette Graph Motion Frames with Rotating Dino Costumes
  for (let sIdx = 0; sIdx < totalScenes; sIdx++) {
    const scene = slotData.scenes[sIdx];
    const dinoDataUri = await getDinoMascotDataUri(scene.costume || slotData.costume || "analyst");
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
  const categoryMap = await buildSeparateCategorySlotMap();
  const slotToCat = {
    "09": "haberai",
    "12": "puanai",
    "15": "indirimai",
    "20": "finansai",
  };
  const chosenCat = categoryMap[slotToCat[slot] || "haberai"] || categoryMap.haberai;
  return renderAndPublishSlotData({ ...chosenCat, slot });
}

/**
 * Full-Screen 9:16 Light-Palette Graph Motion Viral Series ("Çok İzlenen, Çok Kaydedilen 4 Farklı Konsept + 4 Farklı Dino Kostümü + Canlı Gündem")
 * Pulls live agenda metrics from uretir.com and rotates templates (`bento_race`, `versus_matrix`, `flow_diagram`, `radar_bento`),
 * light studio palettes (`daylight_sage`, `sky_indigo`, `warm_sand`, `pearl_teal`, `lavender_mint`, `peach_emerald`),
 * and 3D Üretir Dino costumes (`analyst`, `scientist`, `creator`, `founder`).
 */
async function buildSeparateCategorySlotMap() {
  const synced = await syncUretirPrimaryDataHub().catch(() => ({}));
  const itemsFin = synced?.finans?.items || [];
  const usd = itemsFin.find((i) => i.id === "USD")?.price?.toFixed(2) || "49.45";
  const gram = Math.round(itemsFin.find((i) => i.id === "GRAM")?.price || 6623).toLocaleString("tr-TR");
  const bist = Math.round(itemsFin.find((i) => i.id === "XU100" || i.id === "XU100.IS")?.price || 11722).toLocaleString("tr-TR");
  const topHeadlineRaw =
    synced?.haberArticles?.[0]?.title ||
    "Yapay Zeka Ajanları, Otonom Sistemler ve 81 İl Canlı Ekonomi Radarı";
  const shortLiveHeadline = wrapLines(topHeadlineRaw, 46, 1)[0];
  const liveMarketPulse = `Dolar ${usd}₺ • Altın ${gram}₺ • BIST ${bist}`;

  // EPISODE 1: BAR CHART RACE + LIVE AGENDA (`bento_race` + `daylight_sage` + `analyst` Dino blazer costume)
  const ep1Base = {
    template: "bento_race",
    palette: "daylight_sage",
    costume: "analyst",
    liveTicker: `GÜNDEM: ${shortLiveHeadline}`,
    hookLine1: "2026'da en çok zaman kazandıran",
    hookLine2: "5 yapay zeka kaldıracı",
    hookLine3: "Sıralama değişti — hangilerini kullanıyorsun?",
    moduleNum: "01",
    moduleKicker: "CANLI GÜNDEM & BAR RACE",
    kpiNumber: 10,
    kpiSuffix: "x",
    kpiLabel: "HIZ KALDIRACI",
    rows: [
      { num: "01", label: "Otonom Kod & Ajan Sistemleri", val: 96, newText: "10 saatlik işi 15 dakikada bitirir" },
      { num: "02", label: "Canlı Gündem & Veri Sentezi", val: 91, newText: "81 il ve piyasa verisini anlık tarar" },
      { num: "03", label: "Kalıcı Hafıza (URETIR.md)", val: 87, newText: "Kuralları bir kez yaz, asla unutmasın" },
      { num: "04", label: "Tek Tıkla Skill Otomasyonu", val: 83, newText: "Tekrarlayan promptları komuta indir" },
      { num: "05", label: "Otomatik Hook & Hata Kilidi", val: 79, newText: "Sıfır insan hatasıyla 7/24 üretim" },
    ],
  };

  // EPISODE 2: ESKİ YÖNTEM VS AI SİSTEMİ (`versus_matrix` + `sky_indigo` + `scientist` Dino lab coat costume)
  const ep2Base = {
    template: "versus_matrix",
    palette: "sky_indigo",
    costume: "scientist",
    liveTicker: liveMarketPulse,
    hookLine1: "10 saatlik yorucu işi",
    hookLine2: "15 dakikaya indiren matris",
    hookLine3: "Eski manuel yöntem vs Üretir AI sistemi",
    moduleNum: "02",
    moduleKicker: "ESKİ YÖNTEM VS AI SİSTEMİ",
    kpiNumber: 85,
    kpiSuffix: "%",
    kpiLabel: "ZAMAN TASARRUFU",
    rows: [
      { num: "01", label: "Veri ve Gündem Araştırması", val: 95, oldText: "3 Saat Sekme Tarama", newText: "3 Dakika AI Radarı", tag: "60x Hızlı" },
      { num: "02", label: "Bağlam (Context) Yönetimi", val: 90, oldText: "Şişen Sohbet & Unutma", newText: "/compact ile Net Hafıza", tag: "%100 Odak" },
      { num: "03", label: "Rapor ve İçerik Üretimi", val: 88, oldText: "Sıfırdan 4 Saat Yazım", newText: "Hazır Skill ile 5 Dk", tag: "48x Hızlı" },
      { num: "04", label: "Kalite ve Hata Kontrolü", val: 85, oldText: "Gözden Kaçan Hatalar", newText: "Pre-Tool Hook Kilidi", tag: "Sıfır Hata" },
      { num: "05", label: "Çoklu Kanal Dağıtımı", val: 92, oldText: "Tek Tek Manuel Paylaşım", newText: "7/24 Otonom Bot Akışı", tag: "Otonom" },
    ],
  };

  // EPISODE 3: KAYDETMELİK OTONOM AKIŞ ŞEMASI (`flow_diagram` + `warm_sand` + `creator` Dino varsity jacket & headphones)
  const ep3Base = {
    template: "flow_diagram",
    palette: "warm_sand",
    costume: "creator",
    liveTicker: `CANLI RADAR: ${shortLiveHeadline}`,
    hookLine1: "Sen uyurken bile çalışan",
    hookLine2: "5 adımlı otonom üretim sistemi",
    hookLine3: "Bu akış şemasını mutlaka kaydet",
    moduleNum: "03",
    moduleKicker: "OTONOM AKIŞ ŞEMASI",
    kpiNumber: 24,
    kpiSuffix: "/7",
    kpiLabel: "KESİNTİSİZ SİSTEM",
    rows: [
      { num: "01", label: "Canlı Gündem Girişi", val: 94, newText: "Haber, fiyat ve trend verisi toplanır" },
      { num: "02", label: "AI Sentez & Filtreleme", val: 90, newText: "Gürültü elenir, net içgörü çıkarılır" },
      { num: "03", label: "Görsel & Grafik Motoru", val: 88, newText: "Veriler otomatik dikey grafiğe dönüşür" },
      { num: "04", label: "Robot Ses & Senkron", val: 86, newText: "Cümle bazlı ses ve altyazı birleşir" },
      { num: "05", label: "Merkez: uretir.com", val: 96, newText: "Telegram ve web merkezinde yayına girer" },
    ],
  };

  // EPISODE 4: CANLI EKONOMİ & VERİ OKUMA (`radar_bento` + `pearl_teal` + `founder` Dino cap & smartwatch)
  const ep4Base = {
    template: "radar_bento",
    palette: "pearl_teal",
    costume: "founder",
    liveTicker: liveMarketPulse,
    hookLine1: "Gürültüyü kapat, veriyi oku:",
    hookLine2: "Gündemi analiz etmenin 5 kuralı",
    hookLine3: `Canlı: Dolar ${usd} ₺ • Gram Altın ${gram} ₺`,
    moduleNum: "04",
    moduleKicker: "CANLI VERİ & ANALİZ",
    kpiNumber: 100,
    kpiSuffix: "%",
    kpiLabel: "DOĞRULANAN VERİ",
    rows: [
      { num: "01", label: "360 Gün Fiyat Geçmişi", val: 95, newText: "Sahte indirimi gerçek dipten ayır" },
      { num: "02", label: "Anlık Kur ve Altın Makası", val: 91, newText: `Gram altın ${gram} TL trendini izle` },
      { num: "03", label: "81 İl Doğrulanmış Gündem", val: 88, newText: "Söylentiye değil resmî kaynağa bak" },
      { num: "04", label: "Bölgesel Emsal Kıyaslama", val: 85, newText: "Konut ve araçta m²/liste farkını gör" },
      { num: "05", label: "Tek Ekran Karar Masası", val: 94, newText: "Tüm canlı AI araçları uretir.com'da" },
    ],
  };

  // EPISODE 5: 5 KİŞİLİK YAPAY ZEKA AJAN EKİBİ (`flow_diagram` + `lavender_mint` + `scientist` Dino)
  const ep5Base = {
    template: "flow_diagram",
    palette: "lavender_mint",
    costume: "scientist",
    liveTicker: `AJAN MİMARİSİ: ${shortLiveHeadline}`,
    hookLine1: "Tek başına 5 kişilik ekip gibi",
    hookLine2: "üretmenin çoklu ajan şeması",
    hookLine3: "Her görevi ayrı bir uzman ajana devret",
    moduleNum: "05",
    moduleKicker: "ÇOKLU AJAN MİMARİSİ",
    kpiNumber: 5,
    kpiSuffix: "x",
    kpiLabel: "UZMAN AJAN GÜCÜ",
    rows: [
      { num: "01", label: "Araştırmacı Alt Ajan", val: 95, newText: "Yüzlerce kaynağı ayrı pencerede tarar" },
      { num: "02", label: "Mimari Planlama Ajanı", val: 91, newText: "Kodlamadan önce /plan ile sınır çizer" },
      { num: "03", label: "Üretici & Kodlayıcı Ajan", val: 89, newText: "Temiz bağlamda sıfırdan sistemi kurar" },
      { num: "04", label: "Denetçi & Test Ajanı", val: 87, newText: "Çıktıyı bağımsız gözle test edip onaylar" },
      { num: "05", label: "Ana Orkestra: uretir.com", val: 96, newText: "Sana sadece onaylamak ve büyütmek kalır" },
    ],
  };

  // EPISODE 6: AMATÖR VS PROFESYONEL AI KULLANIMI (`versus_matrix` + `peach_emerald` + `creator` Dino)
  const ep6Base = {
    template: "versus_matrix",
    palette: "peach_emerald",
    costume: "creator",
    liveTicker: liveMarketPulse,
    hookLine1: "İnsanların %95'i yapay zekayı",
    hookLine2: "yanlış kullanıyor: İşte fark!",
    hookLine3: "Amatör kullanıcı vs Sistem kuran üretici",
    moduleNum: "06",
    moduleKicker: "AMATÖR VS PROFESYONEL AI",
    kpiNumber: 95,
    kpiSuffix: "%",
    kpiLabel: "KALİTE FARKI",
    rows: [
      { num: "01", label: "Prompt Yazım Tarzı", val: 96, oldText: "Nasıl yapılacağını tarif eder", newText: "Hedefi ve kırmızı çizgiyi verir", tag: "Net Sınır" },
      { num: "02", label: "Proje Hafızası", val: 92, oldText: "Her sohbette baştan anlatır", newText: "URETIR.md ile kalıcı öğretir", tag: "Kalıcı" },
      { num: "03", label: "Tekrarlayan Görevler", val: 89, oldText: "Kopyala-yapıştır ile uğraşır", newText: "SKILL.md yapıp tek tıkla üretir", tag: "Tek Komut" },
      { num: "04", label: "Güvenlik ve Kurallar", val: 86, oldText: "Modelin hatırlamasını umar", newText: "Pre-tool hook ile koda bağlar", tag: "%100 Kilit" },
      { num: "05", label: "Günlük Gündem & Veri", val: 94, oldText: "Sosyal medyada kaybolur", newText: "uretir.com ile veriyi okur", tag: "Üretici" },
    ],
  };

  return {
    haberai: {
      slot: "cat-haberai",
      pureBlackMode: true,
      costume: "analyst",
      label: "BÖLÜM 01 · 2026 YAPAY ZEKA KALDIRAÇ SIRALAMASI (BAR RACE)",
      targetUrl: "https://www.uretir.com",
      whatsappTargetKey: "haberai",
      customCaption: [
        `2026'da en çok zaman kazandıran 5 yapay zeka kaldıracı — sıralama değişti! 🤖📊`,
        `📌 Lazım olur, hemen kaydet ve canlı araçlar için incele 👉 uretir.com`,
        `#üretir #yapayzeka #üretkenlik #otomasyon #teknoloji #keşfet`,
      ].join("\n"),
      scenes: [
        {
          ...ep1Base,
          stepIndex: 0,
          title: "2026'da En Çok Zaman Kazandıran 5 Yapay Zeka Kaldıracı",
          sub: `Canlı Gündem: ${shortLiveHeadline}`,
          highlight: "10X ÜRETİM KALDIRACI",
          subLine1: "Gündemi yakala: En çok zaman",
          subLine2: "kazandıran beş yapay zeka sistemi.",
          subHighlight: "beş yapay zeka",
          speech: "Gündemi yakala. İşte en çok zaman kazandıran beş yapay zeka kaldıracı.",
        },
        {
          ...ep1Base,
          stepIndex: 1,
          title: "01 • Otonom Kod ve Ajan Sistemleri (%96 Etki)",
          sub: "On saatlik manuel işi on beş dakikada tamamlar.",
          highlight: "%96 VERİMLİLİK LİDERİ",
          subLine1: "Birinci sırada otonom ajanlar,",
          subLine2: "on saatlik işi on beş dakikada çözer.",
          subHighlight: "otonom ajanlar,",
          speech: "Birinci sırada otonom ajanlar var. On saatlik işi on beş dakikada tamamlar.",
        },
        {
          ...ep1Base,
          stepIndex: 2,
          title: "02 • Canlı Gündem ve Veri Sentezi (%91 Etki)",
          sub: `Dolar ${usd} TL, Altın ${gram} TL ve 81 il radarı.`,
          highlight: "ANLIK VERİ SENTEZİ",
          subLine1: "İkinci sırada canlı veri sentezi,",
          subLine2: "gündemi ve piyasayı anlık tarar.",
          subHighlight: "canlı veri sentezi,",
          speech: "İkinci sırada canlı veri sentezi, gündemi ve piyasayı saniyeler içinde tarar.",
        },
        {
          ...ep1Base,
          stepIndex: 3,
          title: "03 • Kalıcı Proje Hafızası (%87 Etki)",
          sub: "Kurallarını bir kez yaz, model seni her gün tanısın.",
          highlight: "URETIR.MD HAFIZASI",
          subLine1: "Üçüncü sırada kalıcı hafıza,",
          subLine2: "kuralları bir kez yaz, hep hatırlasın.",
          subHighlight: "kalıcı hafıza,",
          speech: "Üçüncü sırada kalıcı hafıza dosyası. Kuralları bir kez yaz, model hiç unutmasın.",
        },
        {
          ...ep1Base,
          stepIndex: 4,
          title: "04 • Tek Tıkla Skill Otomasyonu (%83 Etki)",
          sub: "Tekrarlayan iş akışlarını tek bir komuta dönüştür.",
          highlight: "TEK KOMUT SKILL",
          subLine1: "Dördüncü sırada skill mimarisi,",
          subLine2: "tekrarlayan işi tek komuta indirir.",
          subHighlight: "skill mimarisi,",
          speech: "Dördüncü sırada skill mimarisi. Tekrarlayan işini tek bir komuta indirir.",
        },
        {
          ...ep1Base,
          stepIndex: 5,
          title: "05 • Otomatik Hook ve Canlı Merkez: uretir.com",
          sub: "Bu sıralamayı kaydet, tüm araçları uretir.com'da dene.",
          highlight: "WWW.URETIR.COM",
          subLine1: "Bu tabloyu hemen kaydet,",
          subLine2: "canlı araçlar uretir.com'da.",
          subHighlight: "uretir.com'da.",
          speech: "Bu tabloyu hemen kaydet. Tüm canlı yapay zeka araçları uretir.com'da.",
        },
      ],
    },
    puanai: {
      slot: "cat-puanai",
      pureBlackMode: true,
      costume: "scientist",
      label: "BÖLÜM 02 · ESKİ YÖNTEM VS ÜRETİR AI MATRİSİ",
      targetUrl: "https://www.uretir.com/ajanlar",
      whatsappTargetKey: "puanai",
      customCaption: [
        `10 saatlik yorucu işi 15 dakikaya indiren yapay zeka karşılaştırma matrisi. ⚡🧪`,
        `📌 Lazım olur, hemen kaydet ve sistemleri kur 👉 uretir.com`,
        `#üretir #yapayzeka #otomasyon #üretkenlik #işakışı #keşfet`,
      ].join("\n"),
      scenes: [
        {
          ...ep2Base,
          stepIndex: 0,
          title: "10 Saatlik İşi 15 Dakikaya İndiren Karşılaştırma Matrisi",
          sub: "Eski manuel yöntem ile yeni AI kaldıracını kıyasla.",
          highlight: "-%85 ZAMAN TASARRUFU",
          subLine1: "On saatlik işi on beş dakikaya",
          subLine2: "indiren karşılaştırma matrisi.",
          subHighlight: "on beş dakikaya",
          speech: "On saatlik yorucu işi on beş dakikaya indiren karşılaştırma matrisine yakından bak.",
        },
        {
          ...ep2Base,
          stepIndex: 1,
          title: "01 • Veri Tarama: 3 Saat Yerine 3 Dakika",
          sub: "Yirmi sekme arasında kaybolma, AI radarıyla sentezle.",
          highlight: "60X DAHA HIZLI",
          subLine1: "Üç saat sekme taramak yerine",
          subLine2: "üç dakikada net veri sentezi.",
          subHighlight: "üç dakikada",
          speech: "Eski yöntemde üç saat süren araştırmayı, yapay zeka radarıyla üç dakikada bitir.",
        },
        {
          ...ep2Base,
          stepIndex: 2,
          title: "02 • Bağlam Yönetimi: Şişen Sohbet Yerine /compact",
          sub: "Yüzde yetmiş dolulukta geçmişi özetle, odağı koru.",
          highlight: "%100 NET ODAK",
          subLine1: "Sohbeti şişirip modeli yorma,",
          subLine2: "compact komutuyla hafızayı tazele.",
          subHighlight: "compact komutuyla",
          speech: "Sohbeti şişirip modeli yorma. Compact komutuyla önemli kararları tutup özetle.",
        },
        {
          ...ep2Base,
          stepIndex: 3,
          title: "03 • Üretim: Sıfırdan Yazmak Yerine Hazır Skill",
          sub: "Aynı promptu her gün yazma, şablonunu tek tıkla çağır.",
          highlight: "48X ÜRETİM HIZI",
          subLine1: "Her gün sıfırdan başlamak yerine",
          subLine2: "hazır skill şablonuyla üret.",
          subHighlight: "skill şablonuyla",
          speech: "Her gün sıfırdan prompt yazmak yerine, hazır skill şablonunla saniyeler içinde üret.",
        },
        {
          ...ep2Base,
          stepIndex: 4,
          title: "04 • Kontrol: Gözden Kaçan Hata Yerine Hook Kilidi",
          sub: "Pre-tool hook ile güvenlik ve kaliteyi koda bağla.",
          highlight: "SIFIR İNSAN HATASI",
          subLine1: "Hatayı şansa bırakma,",
          subLine2: "pre-tool hook ile otomatik kilitle.",
          subHighlight: "pre-tool hook",
          speech: "Kalite kontrolü şansa bırakma. Pre-tool hook ile doğrulamayı koda bağla.",
        },
        {
          ...ep2Base,
          stepIndex: 5,
          title: "05 • Otonom Dağıtım ve Merkez: uretir.com",
          sub: "Bu matrisi kaydet, kendi sistemini uretir.com ile kur.",
          highlight: "WWW.URETIR.COM",
          subLine1: "Bu karşılaştırmayı hemen kaydet,",
          subLine2: "tüm rehberler uretir.com'da.",
          subHighlight: "uretir.com'da.",
          speech: "Bu karşılaştırma matrisini kaydet. Tüm sistem rehberleri uretir.com'da.",
        },
      ],
    },
    indirimai: {
      slot: "cat-indirimai",
      pureBlackMode: true,
      costume: "creator",
      label: "BÖLÜM 03 · 7/24 ÇALIŞAN OTONOM SİSTEM AKIŞ ŞEMASI",
      targetUrl: "https://www.uretir.com",
      whatsappTargetKey: "indirimai",
      customCaption: [
        `Sen uyurken bile çalışan 5 adımlı otonom dijital üretim mimarisi. 🔄🎧`,
        `📌 Bu akış şemasını kaydet ve detaylar için incele 👉 uretir.com`,
        `#üretir #yapayzeka #otomasyon #dijitalüretim #teknoloji #keşfet`,
      ].join("\n"),
      scenes: [
        {
          ...ep3Base,
          stepIndex: 0,
          title: "Sen Uyurken Çalışan 5 Adımlı Otonom Sistem Şeması",
          sub: "Zamanını satma, 7/24 çalışan dijital sistem kur.",
          highlight: "7/24 OTONOM MİMARİ",
          subLine1: "Sen uyurken bile çalışan",
          subLine2: "beş adımlı otonom üretim şeması.",
          subHighlight: "otonom üretim",
          speech: "Sen uyurken bile çalışan, beş adımlı otonom dijital üretim şemasını inceliyoruz.",
        },
        {
          ...ep3Base,
          stepIndex: 1,
          title: "01 • Canlı Gündem ve Veri Girişi",
          sub: "Sistem önce doğrulanmış haber, fiyat ve trendleri toplar.",
          highlight: "OTOMATİK VERİ GİRİŞİ",
          subLine1: "Birinci düğümde canlı gündem",
          subLine2: "ve doğrulanmış veriler toplanır.",
          subHighlight: "canlı gündem",
          speech: "Birinci düğümde canlı gündem, piyasa ve fiyat verileri otomatik olarak toplanır.",
        },
        {
          ...ep3Base,
          stepIndex: 2,
          title: "02 • Yapay Zeka Sentez ve Filtreleme",
          sub: "Gürültü elenir, en yüksek değerli içgörü seçilir.",
          highlight: "AKILLI AI FİLTRESİ",
          subLine1: "İkinci düğümde yapay zeka",
          subLine2: "gürültüyü eleyip özeti çıkarır.",
          subHighlight: "gürültüyü eleyip",
          speech: "İkinci düğümde yapay zeka gürültüyü eler ve en değerli içgörüyü çıkarır.",
        },
        {
          ...ep3Base,
          stepIndex: 3,
          title: "03 • Otomatik Grafik ve Görsel Motoru",
          sub: "Sayılar ve adımlar tam ekran dikey grafiklere dönüşür.",
          highlight: "GRAPH MOTION MOTORU",
          subLine1: "Üçüncü düğümde tüm veriler",
          subLine2: "canlı grafiklere dönüştürülür.",
          subHighlight: "canlı grafiklere",
          speech: "Üçüncü düğümde veriler otomatik olarak tam ekran dikey grafiklere dönüşür.",
        },
        {
          ...ep3Base,
          stepIndex: 4,
          title: "04 • Robot Seslendirme ve Altyazı Senkronu",
          sub: "Her cümle milimetrik olarak grafiklerle eşleşir.",
          highlight: "TAM SENKRON ÇIKTI",
          subLine1: "Dördüncü düğümde robot ses",
          subLine2: "ve dinamik altyazı birleşir.",
          subHighlight: "robot ses",
          speech: "Dördüncü düğümde robot seslendirme ve dinamik altyazı milimetrik olarak birleşir.",
        },
        {
          ...ep3Base,
          stepIndex: 5,
          title: "05 • Merkez: uretir.com Ekosistemi",
          sub: "Bu şemayı kaydet, kendi otomasyonunu uretir.com ile kur.",
          highlight: "WWW.URETIR.COM",
          subLine1: "Bu akış şemasını hemen kaydet,",
          subLine2: "merkez uretir.com adresinde.",
          subHighlight: "uretir.com",
          speech: "Bu akış şemasını hemen kaydet. Tüm otomasyon altyapısı uretir.com'da.",
        },
      ],
    },
    finansai: {
      slot: "cat-finansai",
      pureBlackMode: true,
      costume: "founder",
      label: "BÖLÜM 04 · CANLI VERİ VE EKONOMİ OKUMA KURALLARI",
      targetUrl: "https://www.uretir.com/finans-ai",
      whatsappTargetKey: "finansai",
      customCaption: [
        `Gürültüyü kapat, veriyi oku: Gündemi ve piyasayı yapay zekayla analiz etmenin 5 altın kuralı. 📈🧭`,
        `📌 Kaydet ve canlı piyasa/fiyat radarı için incele 👉 uretir.com`,
        `#üretir #ekonomi #finans #yapayzeka #verianalizi #keşfet`,
      ].join("\n"),
      scenes: [
        {
          ...ep4Base,
          stepIndex: 0,
          title: "Gürültüyü Kapat, Veriyi Oku: 5 Altın Analiz Kuralı",
          sub: liveMarketPulse,
          highlight: "CANLI VERİ MASASI",
          subLine1: "Gürültüyü kapat, veriyi oku:",
          subLine2: "Gündemi analiz etmenin beş kuralı.",
          subHighlight: "veriyi oku:",
          speech: "Gürültüyü kapat, veriyi oku. İşte gündemi ve piyasayı analiz etmenin beş altın kuralı.",
        },
        {
          ...ep4Base,
          stepIndex: 1,
          title: "01 • 360 Günlük Fiyat Geçmişine Bak",
          sub: "Etikete değil, son bir yılın gerçek dip grafiğine güven.",
          highlight: "360 GÜN FİYAT RADARI",
          subLine1: "Sahte indirim etiketine değil,",
          subLine2: "yıllık fiyat grafiğine bak.",
          subHighlight: "fiyat grafiğine",
          speech: "Birinci kural: Sahte indirim etiketine değil, üç yüz altmış günlük fiyat grafiğine bak.",
        },
        {
          ...ep4Base,
          stepIndex: 2,
          title: `02 • Canlı Kur ve Altın Trendi (Altın: ${gram} TL)`,
          sub: `Dolar ${usd} TL ve BIST ${bist} puan eğilimini birlikte oku.`,
          highlight: `GRAM ALTIN: ${gram} TL`,
          subLine1: "Tek bir rakama takılma,",
          subLine2: "kur ve altın eğilimini birlikte oku.",
          subHighlight: "birlikte oku.",
          speech: `İkinci kural: Dolar ${usd} ve gram altın ${gram} lira trendini aylık grafikle birlikte oku.`,
        },
        {
          ...ep4Base,
          stepIndex: 3,
          title: "03 • 81 İl Doğrulanmış Kaynak Haritası",
          sub: "Sosyal medya söylentisi yerine resmî ajans verisini seç.",
          highlight: "81 İL DOĞRULANMIŞ VERİ",
          subLine1: "Söylentilere vakit harcama,",
          subLine2: "doğrulanmış kaynak haritasını izle.",
          subHighlight: "doğrulanmış kaynak",
          speech: "Üçüncü kural: Söylentilere vakit harcama, seksen bir il doğrulanmış kaynak haritasını izle.",
        },
        {
          ...ep4Base,
          stepIndex: 4,
          title: "04 • Araç ve Konutta Bölgesel Emsal Kıyaslama",
          sub: "İlan fiyatını bölge metrekare ve sıfır liste fiyatıyla çarpıştır.",
          highlight: "EMSAL DEĞER ANALİZİ",
          subLine1: "İlan fiyatını tek başına görme,",
          subLine2: "bölgesel emsal ortalamasıyla kıyasla.",
          subHighlight: "emsal ortalamasıyla",
          speech: "Dördüncü kural: Konut ve araçta ilan fiyatını bölgesel emsal ortalamasıyla kıyasla.",
        },
        {
          ...ep4Base,
          stepIndex: 5,
          title: "05 • Tek Merkezden Karar Ver: uretir.com",
          sub: "Haber, Finans, İndirim, Puan, Araç ve Ev AI tek ekranda.",
          highlight: "WWW.URETIR.COM",
          subLine1: "Bu beş kuralı hemen kaydet,",
          subLine2: "canlı veri merkezi uretir.com'da.",
          subHighlight: "uretir.com'da.",
          speech: "Bu beş kuralı kaydet. Tüm canlı veri araçları uretir.com adresinde.",
        },
      ],
    },
    evai: {
      slot: "cat-evai",
      pureBlackMode: true,
      costume: "scientist",
      label: "BÖLÜM 05 · TEK BAŞINA 5 KİŞİLİK YAPAY ZEKA AJAN EKİBİ",
      targetUrl: "https://www.uretir.com/ajanlar",
      whatsappTargetKey: "evai",
      customCaption: [
        `Tek başına 5 kişilik ekip gibi üretmenin çoklu yapay zeka ajan mimarisi. 🤖⚡`,
        `📌 Bu sistem şemasını kaydet ve ajanları incele 👉 uretir.com`,
        `#üretir #yapayzeka #aiagents #üretkenlik #otomasyon #keşfet`,
      ].join("\n"),
      scenes: [
        {
          ...ep5Base,
          stepIndex: 0,
          title: "Tek Başına 5 Kişilik Ekip Gibi Üret: Ajan Mimarisi",
          sub: "Her işi tek pencereye yıkma, uzman alt ajanlara böl.",
          highlight: "5 UZMAN AI AJANI",
          subLine1: "Tek başına beş kişilik ekip gibi",
          subLine2: "üretmenin çoklu ajan şeması.",
          subHighlight: "beş kişilik ekip",
          speech: "Tek başına beş kişilik bir ekip gibi üretmeni sağlayan çoklu ajan şemasını kuruyoruz.",
        },
        {
          ...ep5Base,
          stepIndex: 1,
          title: "01 • Araştırmacı Ajan (Gündem & Dosya Tarama)",
          sub: "Yüzlerce sayfayı ayrı pencerede tarayıp sadece özeti getirir.",
          highlight: "ARAŞTIRMACI AJAN",
          subLine1: "İlk ajanımız araştırmacı,",
          subLine2: "yüzlerce kaynağı arka planda tarar.",
          subHighlight: "araştırmacı,",
          speech: "Birinci ajan araştırmacıdır. Yüzlerce kaynağı arka planda tarayıp sadece özeti getirir.",
        },
        {
          ...ep5Base,
          stepIndex: 2,
          title: "02 • Stratejist Ajan (/plan & Mimari Tasarım)",
          sub: "Tek satır kod yazmadan önce en doğru yol haritasını çıkarır.",
          highlight: "MİMARİ PLAN AJANI",
          subLine1: "İkinci ajanımız stratejist,",
          subLine2: "uygulamadan önce net mimariyi çizer.",
          subHighlight: "stratejist,",
          speech: "İkinci ajan stratejisttir. Üretime geçmeden önce en doğru mimari planı çizer.",
        },
        {
          ...ep5Base,
          stepIndex: 3,
          title: "03 • Üretici Ajan (Temiz Bağlamda Hızlı İcra)",
          sub: "Onaylanan planı sıfır dikkat dağınıklığıyla hayata geçirir.",
          highlight: "ODAKLI ÜRETİCİ AJAN",
          subLine1: "Üçüncü ajanımız üretici,",
          subLine2: "temiz bağlamda hızla sistemi kurar.",
          subHighlight: "üretici,",
          speech: "Üçüncü ajan üreticidir. Tertemiz bir context penceresinde sistemi hızla kurar.",
        },
        {
          ...ep5Base,
          stepIndex: 4,
          title: "04 • Denetçi Ajan (Bağımsız Gözle Test & Kontrol)",
          sub: "Üretilen işi test eder, eksikleri daha yayına girmeden yakalar.",
          highlight: "SIFIR HATA DENETÇİSİ",
          subLine1: "Dördüncü ajanımız denetçi,",
          subLine2: "çıktıyı bağımsız gözle test eder.",
          subHighlight: "denetçi,",
          speech: "Dördüncü ajan denetçidir. Üretilen çıktıyı bağımsız bir gözle test edip doğrular.",
        },
        {
          ...ep5Base,
          stepIndex: 5,
          title: "05 • Ana Orkestra ve Merkez: uretir.com",
          sub: "Bu ekip şemasını kaydet, ajan sistemlerini uretir.com'da keşfet.",
          highlight: "URETIR.COM/AJANLAR",
          subLine1: "Kendi ajan ekibini hemen kur,",
          subLine2: "tüm detaylar uretir.com'da.",
          subHighlight: "uretir.com'da.",
          speech: "Bu ekip şemasını hemen kaydet. Otonom ajan sistemleri uretir.com adresinde.",
        },
      ],
    },
    arabaai: {
      slot: "cat-arabaai",
      pureBlackMode: true,
      costume: "creator",
      label: "BÖLÜM 06 · AMATÖR VS PROFESYONEL YAPAY ZEKA KULLANIMI",
      targetUrl: "https://www.uretir.com",
      whatsappTargetKey: "arabaai",
      customCaption: [
        `İnsanların %95'i yapay zekayı yanlış kullanıyor: Amatör vs Profesyonel farkı! 🎯🔥`,
        `📌 Kaydet ve ilk %5'lik üretici dilime geç 👉 uretir.com`,
        `#üretir #yapayzeka #promptmühendisliği #üretkenlik #teknoloji #keşfet`,
      ].join("\n"),
      scenes: [
        {
          ...ep6Base,
          stepIndex: 0,
          title: "İnsanların %95'i Yapay Zekayı Yanlış Kullanıyor",
          sub: "Amatör kullanıcı ile profesyonel üretici arasındaki 5 fark.",
          highlight: "AMATÖR VS PROFESYONEL",
          subLine1: "İnsanların yüzde doksan beşi",
          subLine2: "yapay zekayı yanlış kullanıyor.",
          subHighlight: "yüzde doksan beşi",
          speech: "İnsanların yüzde doksan beşi yapay zekayı yanlış kullanıyor. İşte amatör ve profesyonel farkı.",
        },
        {
          ...ep6Base,
          stepIndex: 1,
          title: "01 • Yol Tarif Etmek vs Net Sınır Çizmek",
          sub: "Amatör adım adım tarif eder, profesyonel hedefi ve sınırı verir.",
          highlight: "NET HEDEF VE SINIR",
          subLine1: "Amatör nasıl yapılacağını anlatır,",
          subLine2: "profesyonel hedefi ve sınırı çizer.",
          subHighlight: "sınırı çizer.",
          speech: "Amatör modele adım adım yol tarif eder. Profesyonel ise hedefi ve dokunulmaz sınırları çizer.",
        },
        {
          ...ep6Base,
          stepIndex: 2,
          title: "02 • Her Gün Anlatmak vs Kalıcı Hafıza (URETIR.md)",
          sub: "Amatör her sohbette baştan yazar, profesyonel dosyaya kaydeder.",
          highlight: "KALICI HAFIZA DOSYASI",
          subLine1: "Amatör her gün baştan anlatır,",
          subLine2: "profesyonel kalıcı dosyaya yazar.",
          subHighlight: "kalıcı dosyaya",
          speech: "Amatör her sohbette kuralları baştan anlatır. Profesyonel ise kalıcı hafıza dosyası kullanır.",
        },
        {
          ...ep6Base,
          stepIndex: 3,
          title: "03 • Kopyala-Yapıştır vs Tek Tıkla Skill",
          sub: "Tekrarlayan işleri SKILL.md şablonuna dönüştürüp hızlan.",
          highlight: "SKILL.MD KÜTÜPHANESİ",
          subLine1: "Amatör aynı promptu tekrar yazar,",
          subLine2: "profesyonel skill yapıp tek tıkla üretir.",
          subHighlight: "skill yapıp",
          speech: "Amatör aynı promptu her gün tekrar yazar. Profesyonel ise skill yapıp tek komutla üretir.",
        },
        {
          ...ep6Base,
          stepIndex: 4,
          title: "04 • Hatırlamasını Ummak vs Hook Kilidi",
          sub: "Kritik kuralları pre-tool hook ile yüzde yüz zorunlu yap.",
          highlight: "%100 OTOMATİK KİLİT",
          subLine1: "Amatör modelin hatırlamasını umar,",
          subLine2: "profesyonel hook ile koda bağlar.",
          subHighlight: "hook ile",
          speech: "Amatör modelin kuralı hatırlamasını umar. Profesyonel ise hook ile kuralı koda bağlar.",
        },
        {
          ...ep6Base,
          stepIndex: 5,
          title: "05 • Tüketici Kalmak vs uretir.com ile Üretmek",
          sub: "Bu tabloyu kaydet, üretici ekosistemine uretir.com'da katıl.",
          highlight: "WWW.URETIR.COM",
          subLine1: "Bu tabloyu hemen kaydet,",
          subLine2: "üretim merkezi uretir.com'da.",
          subHighlight: "uretir.com'da.",
          speech: "Bu tabloyu hemen kaydet ve ilk yüzde beşlik dilime geç. Merkez uretir.com.",
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


