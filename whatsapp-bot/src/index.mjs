import dotenv from "dotenv";
import qrcode from "qrcode-terminal";
import QRCode from "qrcode";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pkg from "whatsapp-web.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const botRoot = path.resolve(__dirname, "..");
const projectRoot = path.resolve(botRoot, "..");

dotenv.config({ path: path.join(projectRoot, ".env.local"), quiet: true });
dotenv.config({ path: path.join(projectRoot, ".env.production.local"), quiet: true });
dotenv.config({ path: path.join(botRoot, ".env"), quiet: true });

const { Client, LocalAuth } = pkg;
const siteUrl = (process.env.SITE_URL || "https://www.uretir.com").replace(/\/$/, "");
const pollMs = Math.max(5, Number(process.env.POLL_MINUTES || 10)) * 60_000;
const dataDir = process.env.BOT_DATA_DIR || path.join(botRoot, "data");
const statePath = path.join(dataDir, "channel-state.json");
const panelToken = process.env.PANEL_TOKEN || "";
const port = Number(process.env.PORT || 3217);
const runOnce = process.env.RUN_ONCE === "1";
const tgBotToken = process.env.TELEGRAM_BOT_TOKEN || "";
const tgChatId = process.env.TELEGRAM_CHAT_ID || "995164733";

function resolveBrowserExecutable() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH && existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  const winPaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  for (const p of winPaths) {
    if (existsSync(p)) return p;
  }
  return undefined;
}

const TOOL_THEMES = {
  "haber-ai": {
    name: "HaberAI",
    tag: "81 İL KAYNAKLI GÜNDEM RADARI",
    accent: "#a8e038",
    bgStart: "#0f2017",
    bgEnd: "#070f0b",
    photos: [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=900&q=82",
    ],
  },
  "finans-ai": {
    name: "FinansAI",
    tag: "CANLI PİYASA & EKONOMİ EKRANI",
    accent: "#4fd1c5",
    bgStart: "#0d2224",
    bgEnd: "#061012",
    photos: [
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=900&q=82",
    ],
  },
  "puan-ai": {
    name: "PuanAI",
    tag: "DOĞRULANMIŞ KART KAMPANYA ASİSTANI",
    accent: "#b794f4",
    bgStart: "#1a142b",
    bgEnd: "#0b0814",
    photos: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=900&q=82",
    ],
  },
  "indirim-ai": {
    name: "İndirimAI",
    tag: "30 / 90 / 360 GÜN DİP FİYAT RADARI",
    accent: "#f6ad55",
    bgStart: "#26170c",
    bgEnd: "#110a04",
    photos: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=82",
    ],
  },
  "araba-ai": {
    name: "ArabaAI",
    tag: "SIFIR & 2. EL OTOMOBİL FİYAT REFERANSI",
    accent: "#63b3ed",
    bgStart: "#0d1b2a",
    bgEnd: "#060d15",
    photos: [
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=82",
    ],
  },
  "ev-ai": {
    name: "EvAI",
    tag: "KONUT, ARSA & KAMU İHALE ANALİZİ",
    accent: "#f687b3",
    bgStart: "#25131d",
    bgEnd: "#11080d",
    photos: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=82",
    ],
  },
};

const targets = [
  { key: "haberai", name: "HaberAI", toolSlug: "haber-ai", endpoint: "/api/channel-feed/haber-ai", inviteCode: "0029VbDk4gHGpLHXkGseaf3Y", mode: "snapshot", minIntervalMs: 55 * 60_000 },
  { key: "finansai", name: "FinansAI", toolSlug: "finans-ai", endpoint: "/api/channel-feed/finans-ai", inviteCode: "0029VbDIS6B4inoiXI8jeE05", mode: "snapshot", minIntervalMs: 30 * 60_000 },
  { key: "puanai", name: "PuanAI", toolSlug: "puan-ai", endpoint: "/api/channel-feed/puan-ai", inviteCode: "0029VbDbbII8PgsA574OLl1H", mode: "queue", minIntervalMs: 20 * 60_000, dailyLimit: 48 },
  { key: "indirimai", name: "İndirimAI", toolSlug: "indirim-ai", endpoint: "/api/channel-feed/indirim-ai", inviteCode: "0029VbEFC5zICVfmJzjAfY2Q", mode: "snapshot", minIntervalMs: 30 * 60_000 },
  { key: "arabaai", name: "ArabaAI", toolSlug: "araba-ai", endpoint: "/api/channel-feed/araba-ai", inviteCode: "0029Vb8r7Vh8F2p8FcGDsj1L", mode: "queue", minIntervalMs: 30 * 60_000, dailyLimit: 36 },
  { key: "evai", name: "EvAI", toolSlug: "ev-ai", endpoint: "/api/channel-feed/ev-ai", inviteCode: "0029VaBzvL33gvWb52bNHv0q", mode: "queue", minIntervalMs: 30 * 60_000, dailyLimit: 36 },
];

let ready = false;
let busy = false;
let qrImage = "";
let connectionStatus = "WhatsApp oturumu başlatılıyor";
let lastTgQrSentAt = 0;
const targetStatus = Object.fromEntries(targets.map((target) => [target.key, "beklemede"]));

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
function escapeXml(input) {
  return String(input || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
function wrapLines(text, maxCharsPerLine, maxLines) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word.slice(0, maxCharsPerLine);
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines.length ? lines : ["Üretir AI Doğrulanmış Kayıt"];
}

function panelAuthorized(req) {
  if (!panelToken) return false;
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  return url.searchParams.get("token") === panelToken || req.headers.authorization === `Bearer ${panelToken}`;
}
if (!runOnce)
  createServer((req, res) => {
    if (req.url?.startsWith("/health")) {
      res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
      res.end(JSON.stringify({ ok: true, ready, status: connectionStatus, targets: targetStatus }));
      return;
    }
    if (req.url?.startsWith("/trigger") && req.method === "POST") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, scheduled: true, ready }));
      setTimeout(() => {
        poll(true).catch(() => {});
      }, 200);
      return;
    }
    if (!panelAuthorized(req)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Yetkisiz panel erişimi.");
      return;
    }
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Security-Policy": "default-src 'none'; img-src data:; style-src 'unsafe-inline'; frame-ancestors 'none'",
    });
    const rows = targets.map((target) => `<li><strong>${target.name}</strong>: ${escapeHtml(targetStatus[target.key])}</li>`).join("");
    res.end(
      `<!doctype html><html lang="tr"><head><meta http-equiv="refresh" content="8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Üretir WhatsApp Kanal Motoru</title></head><body style="font:18px system-ui;text-align:center;background:#f6f8f2;padding:24px"><h1>uretir.com · WhatsApp kanal motoru</h1><p>${escapeHtml(connectionStatus)}</p>${qrImage ? `<img style="max-width:90vw;height:auto" width="420" height="420" alt="WhatsApp bot eşleştirme QR kodu" src="${qrImage}"><p>WhatsApp → Bağlı cihazlar → Cihaz bağla</p>` : ""}<ul style="max-width:720px;margin:24px auto;text-align:left">${rows}</ul><p>Kontrol aralığı: ${pollMs / 60000} dakika</p></body></html>`
    );
  }).listen(port, "0.0.0.0", () => console.log(`Durum paneli 0.0.0.0:${port} üzerinde hazır.`));

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: path.join(dataDir, "auth") }),
  puppeteer: {
    headless: true,
    executablePath: resolveBrowserExecutable(),
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  },
});

client.on("qr", async (value) => {
  ready = false;
  qrImage = await QRCode.toDataURL(value, { width: 480, margin: 3 });
  connectionStatus = "Kanal yöneticisi hesabınızla QR kodunu bir kez okutun";
  console.log("WhatsApp Web QR kodu üretildi.");
  qrcode.generate(value, { small: true });

  try {
    const qrPngPath = path.join(projectRoot, "reports", "social-media", "whatsapp-qr.png");
    await fs.mkdir(path.dirname(qrPngPath), { recursive: true });
    const qrBuffer = await QRCode.toBuffer(value, { width: 520, margin: 3 });
    await fs.writeFile(qrPngPath, qrBuffer);
    if (process.env.QR_ARTIFACT_PATH) {
      await fs.mkdir(path.dirname(process.env.QR_ARTIFACT_PATH), { recursive: true });
      await fs.writeFile(process.env.QR_ARTIFACT_PATH, qrBuffer);
    }

    if (tgBotToken && tgChatId && Date.now() - lastTgQrSentAt > 45_000) {
      lastTgQrSentAt = Date.now();
      const form = new FormData();
      form.append("chat_id", String(tgChatId));
      form.append(
        "caption",
        "📱 *ÜRETİR WHATSAPP 6 AI KANAL MOTORU QR KODU*\n\nHaberAI · FinansAI · PuanAI · İndirimAI · ArabaAI · EvAI kanallarının `uretir.com` üzerinden otomatik paylaşım yapması için bu QR kodunu telefonunuzdan *(WhatsApp → Bağlı Cihazlar → Cihaz Bağla)* bir kez okutun."
      );
      form.append("parse_mode", "Markdown");
      form.append("photo", new Blob([qrBuffer], { type: "image/png" }), "whatsapp-qr.png");
      await fetch(`https://api.telegram.org/bot${tgBotToken}/sendPhoto`, {
        method: "POST",
        body: form,
      }).catch(() => {});
    }
  } catch (qrErr) {
    console.warn("QR kayıt/Telegram uyarısı:", qrErr);
  }
});
client.on("authenticated", () => {
  qrImage = "";
  connectionStatus = "Oturum doğrulandı; kanallar hazırlanıyor";
  console.log("WhatsApp oturumu doğrulandı.");
  const checkHydrated = async (attempt = 0) => {
    if (ready || !client.pupPage) return;
    try {
      const hydrated = await client.pupPage.evaluate(() => {
        try {
          const { getMaybeMeLidUser, getMaybeMePnUser } = window.require("WAWebUserPrefsMeUser");
          const me = getMaybeMePnUser?.() || getMaybeMeLidUser?.() || window.require("WAWebConnModel")?.Conn?.wid;
          const newsletters = window.require("WAWebCollections")?.WAWebNewsletterCollection?.getModelsArray?.() || [];
          if (me && (newsletters.length > 0 || window.__uretirWaitTicks > 3)) {
            if (typeof window.onAppStateHasSyncedEvent === "function") {
              window.onAppStateHasSyncedEvent();
              return true;
            }
          }
          window.__uretirWaitTicks = (window.__uretirWaitTicks || 0) + 1;
        } catch {}
        return false;
      });
      if (!hydrated && attempt < 15) {
        setTimeout(() => checkHydrated(attempt + 1), 3000);
      }
    } catch {
      if (attempt < 15) setTimeout(() => checkHydrated(attempt + 1), 3000);
    }
  };
  setTimeout(() => checkHydrated(0), 5000);
});
client.on("auth_failure", (message) => {
  ready = false;
  connectionStatus = "WhatsApp oturum hatası";
  console.error("WhatsApp oturum hatası:", message);
  if (runOnce) setTimeout(() => process.exit(2), 500);
});
client.on("disconnected", (reason) => {
  ready = false;
  connectionStatus = "WhatsApp bağlantısı koptu; servis yeniden başlatılıyor";
  console.error("WhatsApp bağlantısı koptu:", reason);
  setTimeout(() => process.exit(1), 1000);
});
client.on("ready", async () => {
  ready = true;
  qrImage = "";
  connectionStatus = "Bağlandı. Altı Üretir kanalı fotoğraflı ve grafikli otomatik yayın modunda.";
  console.log(`Hazır. ${targets.map((target) => target.name).join(", ")} için ${runOnce ? "tek seferlik" : "sürekli"} kontrol başlıyor.`);
  await new Promise((resolve) => setTimeout(resolve, 3500));
  await poll();
  if (runOnce) {
    await new Promise((resolve) => setTimeout(resolve, 2500));
    await client.destroy();
    process.exit(0);
  }
  setInterval(poll, pollMs);
});

async function readState() {
  try {
    return JSON.parse(await fs.readFile(statePath, "utf8"));
  } catch {
    return {};
  }
}
async function writeState(state) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(statePath, JSON.stringify(state, null, 2), "utf8");
}
function istanbulDay() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
function isBroadcastWindowOpen() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const totalMinutes = Number(map.hour || 0) * 60 + Number(map.minute || 0);
  // Daily active broadcast window: 08:55 (535m) to 20:20 (1220m) Europe/Istanbul
  return totalMinutes >= 8 * 60 + 55 && totalMinutes <= 20 * 60 + 20;
}
function due(target, state, force = false) {
  if (force) return true;
  if (!isBroadcastWindowOpen()) return false;
  const own = state?.[target.key] || {};
  if (target.dailyLimit && own.dailyDay === istanbulDay() && (own.dailyCount || 0) >= target.dailyLimit) return false;
  if (!target.minIntervalMs) return true;
  const last = Date.parse(own.lastSentAt || "");
  return !Number.isFinite(last) || Date.now() - last >= target.minIntervalMs;
}
function normalizedChannelName(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ");
}

async function resolveChannel(target) {
  let channels = [];
  for (let attempt = 0; attempt < 4; attempt++) {
    channels = await client.pupPage.evaluate(() => {
      const collection = window.require("WAWebCollections").WAWebNewsletterCollection;
      return collection
        .getModelsArray()
        .map((chat) => {
          let data = {};
          let metadata = {};
          try {
            data = chat.serialize?.() || {};
          } catch {}
          try {
            metadata = chat.newsletterMetadata?.serialize?.() || {};
          } catch {}
          const id =
            chat.id?._serialized || data.id?._serialized || chat.id?.toString?.() || data.id?.toString?.() || null;
          const name =
            chat.name || data.name || metadata.name || metadata.nameElementValue || metadata.title || data.formattedTitle || "";
          const membershipType =
            chat.newsletterMetadata?.membershipType ||
            metadata.membershipType ||
            data.newsletterMetadata?.membershipType ||
            data.channelMetadata?.membershipType ||
            null;
          return { id, name, membershipType };
        })
        .filter((item) => item.id && item.name);
    });
    if (channels.length > 0) break;
    await new Promise((r) => setTimeout(r, 1500));
  }

  const expected = normalizedChannelName(target.name);
  const matches = channels.filter((channel) => normalizedChannelName(channel.name) === expected);
  if (matches.length !== 1) {
    const visible = channels.map((channel) => `${channel.name}[${channel.membershipType || "?"}]`).slice(0, 30);
    throw new Error(`${target.name} güvenli biçimde bulunamadı. Görünen kanallar: ${visible.join(" | ") || "yok"}`);
  }

  const channel = matches[0];
  if (!channel.id.endsWith("@newsletter")) {
    throw new Error(`${target.name} hedefi geçerli bir WhatsApp kanalı değil.`);
  }
  const role = String(channel.membershipType || "").toLocaleLowerCase("en-US");
  if (!["owner", "admin"].includes(role)) {
    throw new Error(`${target.name} kanalında owner/admin yetkisi doğrulanamadı (${role || "bilinmiyor"}).`);
  }
  return channel;
}

async function api(endpoint) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(`${siteUrl}${endpoint}`, {
        signal: AbortSignal.timeout(65_000),
        headers: { "User-Agent": "Uretir-WhatsApp-Publisher/2.0" },
      });
      if (response.ok) return response.json();
      lastError = new Error(`uretir.com ${endpoint} → HTTP ${response.status}`);
      if (response.status < 500 && response.status !== 429) break;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
  }
  throw lastError || new Error("uretir.com bağlantı hatası");
}

async function extractOgImageFromSourceUrl(sourceUrl) {
  if (!sourceUrl || !/^https?:\/\//i.test(sourceUrl)) return null;
  if (sourceUrl.includes("ilan.gov.tr")) return null;
  try {
    const res = await fetch(sourceUrl, {
      signal: AbortSignal.timeout(6_000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return null;
    const html = (await res.text()).slice(0, 120_000);
    const ogMatch =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (ogMatch && ogMatch[1]) {
      const resolved = new URL(ogMatch[1].replace(/&amp;/g, "&"), sourceUrl).toString();
      if (/^https:\/\//i.test(resolved) && !resolved.includes("logo") && !resolved.includes("favicon")) {
        return resolved;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function selectCategoryPhoto(toolSlug, text) {
  const theme = TOOL_THEMES[toolSlug] || TOOL_THEMES["indirim-ai"];
  const lower = String(text || "").toLocaleLowerCase("tr-TR");
  if (toolSlug === "ev-ai") {
    if (lower.includes("arsa") || lower.includes("tarla") || lower.includes("parsel")) return theme.photos[4];
    if (lower.includes("dubleks") || lower.includes("villa") || lower.includes("müstakil")) return theme.photos[3];
  }
  if (toolSlug === "araba-ai") {
    if (lower.includes("byd") || lower.includes("seal") || lower.includes("elektrik") || lower.includes("togg")) return theme.photos[0];
    if (lower.includes("suv") || lower.includes("qashqai") || lower.includes("duster") || lower.includes("tiguan") || lower.includes("rifter")) return theme.photos[1];
  }
  const hash = createHash("sha256").update(`${toolSlug}:${text}`).digest()[0];
  return theme.photos[hash % theme.photos.length];
}

async function fetchPhotoAsDataUri(photoUrl) {
  try {
    const res = await fetch(photoUrl, {
      signal: AbortSignal.timeout(10_000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
    });
    if (!res.ok) return null;
    const raw = Buffer.from(await res.arrayBuffer());
    const resized = await sharp(raw)
      .resize(410, 440, { fit: "cover", position: "center" })
      .jpeg({ quality: 86 })
      .toBuffer();
    return `data:image/jpeg;base64,${resized.toString("base64")}`;
  } catch {
    return null;
  }
}

function parseMetaFromBody(target, body, item = {}) {
  const lines = String(body || "")
    .split("\n")
    .map((l) => l.replace(/[*_~`]/g, "").trim())
    .filter(Boolean);
  const cleanTitle =
    item.title ||
    lines.find((l, idx) => idx > 0 && l.length > 10 && !l.startsWith("http") && !l.startsWith("•")) ||
    lines[0] ||
    `${target.name} Güncel Analiz`;
  const priceMatch = String(body || "").match(/([0-9]{1,3}(?:\.[0-9]{3})+(?:,[0-9]+)?\s*TL)/);
  const priceStr = priceMatch ? priceMatch[1] : target.name + " Canlı";
  const urlMatch = String(body || "").match(/https?:\/\/[^\s)]+/g) || [];
  const sourceUrl = item.source_url || urlMatch.find((u) => !u.includes("uretir.com")) || null;
  const locOrSub =
    item.city
      ? `${item.city} · Doğrulanmış İlan & Emsal Analizi`
      : item.brand
        ? `${item.brand} Türkiye Resmî Fiyat & 2. El Emsal Karşılaştırması`
        : `${target.name} Resmî WhatsApp Kanalı · uretir.com`;

  return {
    title: cleanTitle.replace(/^[📌🏠🚗💳🏷️📊🏛️🥇🥈🥉•\s]+/u, "").slice(0, 82),
    subtitle: locOrSub,
    price: priceStr,
    sourceUrl,
    stat1Label: item.city ? "Konum" : item.brand ? "Marka" : "Kaynak",
    stat1Val: item.city || item.brand || "Resmî Veri",
    stat2Label: "Platform",
    stat2Val: `uretir.com/${target.toolSlug}`,
  };
}

async function generateMagazineCardPngBuffer(target, body, item = {}) {
  const theme = TOOL_THEMES[target.toolSlug] || TOOL_THEMES["indirim-ai"];
  const meta = parseMetaFromBody(target, body, item);

  let photoDataUri = null;
  const combinedText = `${meta.title} ${body}`.toLocaleLowerCase("tr-TR");
  const localDysonPhoto = path.join(projectRoot, "public", "images", "deals", "dyson-combi360.jpg");

  if ((combinedText.includes("dyson") || combinedText.includes("combi360")) && existsSync(localDysonPhoto)) {
    try {
      const resized = await sharp(localDysonPhoto)
        .resize(410, 440, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .jpeg({ quality: 90 })
        .toBuffer();
      photoDataUri = `data:image/jpeg;base64,${resized.toString("base64")}`;
    } catch {
      // fallback to remote
    }
  }

  if (!photoDataUri && item.image_url && !item.image_url.includes("/api/visual-card")) {
    photoDataUri = await fetchPhotoAsDataUri(item.image_url);
  }
  if (!photoDataUri && meta.sourceUrl) {
    const ogUrl = await extractOgImageFromSourceUrl(meta.sourceUrl);
    if (ogUrl) photoDataUri = await fetchPhotoAsDataUri(ogUrl);
  }
  if (!photoDataUri) {
    const catPhotoUrl = selectCategoryPhoto(target.toolSlug, `${meta.title} ${body}`);
    photoDataUri = await fetchPhotoAsDataUri(catPhotoUrl);
  }

  const titleLines = wrapLines(meta.title, 25, 3);
  const subLines = wrapLines(meta.subtitle, 40, 2);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bgStart}" />
      <stop offset="100%" stop-color="${theme.bgEnd}" />
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="25%" r="65%">
      <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.24" />
      <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.10" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.03" />
    </linearGradient>
    <clipPath id="photoClip">
      <rect x="738" y="118" width="410" height="440" rx="24" />
    </clipPath>
    <linearGradient id="photoOverlay" x1="0%" y1="45%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.75" />
    </linearGradient>
  </defs>

  <rect width="1200" height="675" fill="url(#bg)" />
  <rect width="1200" height="675" fill="url(#glow)" />

  <g stroke="#ffffff" stroke-opacity="0.06" stroke-width="1">
    <line x1="52" y1="0" x2="52" y2="675" />
    <line x1="1148" y1="0" x2="1148" y2="675" />
    <line x1="0" y1="96" x2="1200" y2="96" />
    <line x1="0" y1="590" x2="1200" y2="590" />
  </g>

  <rect x="52" y="28" width="210" height="46" rx="23" fill="${theme.accent}" fill-opacity="0.18" stroke="${theme.accent}" stroke-opacity="0.55" />
  <text x="84" y="58" fill="${theme.accent}" font-family="Segoe UI, Arial, sans-serif" font-size="21" font-weight="800">${escapeXml(theme.name)}</text>
  <text x="284" y="57" fill="#e5e7eb" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="1.4">${escapeXml(theme.tag)}</text>
  <text x="1148" y="60" text-anchor="end" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="900">üretir<tspan fill="${theme.accent}">.</tspan></text>

  ${titleLines
    .map(
      (line, idx) =>
        `<text x="52" y="${158 + idx * 52}" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="40" font-weight="800">${escapeXml(line)}</text>`
    )
    .join("\n  ")}

  ${subLines
    .map(
      (line, idx) =>
        `<text x="52" y="${324 + idx * 30}" fill="#cbd5e1" font-family="Segoe UI, Arial, sans-serif" font-size="21" font-weight="500">${escapeXml(line)}</text>`
    )
    .join("\n  ")}

  <rect x="52" y="395" width="656" height="164" rx="20" fill="url(#cardGrad)" stroke="#ffffff" stroke-opacity="0.16" />
  <rect x="72" y="415" width="290" height="54" rx="12" fill="${theme.accent}" />
  <text x="217" y="451" text-anchor="middle" fill="#07100c" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="900">${escapeXml(meta.price.slice(0, 22))}</text>
  <text x="384" y="435" fill="#94a3b8" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="700">${escapeXml(meta.stat1Label.toUpperCase())}</text>
  <text x="384" y="460" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="19" font-weight="800">${escapeXml(String(meta.stat1Val).slice(0, 24))}</text>

  <!-- ECharts-Inspired Embedded Price / Market Sparkline -->
  <line x1="72" y1="484" x2="688" y2="484" stroke="#ffffff" stroke-opacity="0.10" />
  <text x="72" y="516" fill="#94a3b8" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="700">FİYAT / ENDEKS EĞRİSİ:</text>
  <polyline fill="none" stroke="${theme.accent}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" points="255,502 310,506 365,498 420,518 475,532 530,538" />
  <circle cx="530" cy="538" r="5" fill="${theme.accent}" />
  <text x="688" y="536" text-anchor="end" fill="${theme.accent}" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="800">${escapeXml(meta.stat2Val)}</text>

  <rect x="734" y="114" width="418" height="448" rx="26" fill="#0f172a" stroke="${theme.accent}" stroke-opacity="0.55" stroke-width="2" />
  ${
    photoDataUri
      ? `<image href="${photoDataUri}" x="738" y="118" width="410" height="440" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)" />
  <rect x="738" y="118" width="410" height="440" rx="24" fill="url(#photoOverlay)" />`
      : `<rect x="738" y="118" width="410" height="440" rx="24" fill="url(#cardGrad)" />`
  }
  <rect x="758" y="138" width="196" height="34" rx="17" fill="#090d16" fill-opacity="0.82" stroke="${theme.accent}" stroke-opacity="0.6" />
  <text x="856" y="160" text-anchor="middle" fill="${theme.accent}" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="800">GERÇEK ÜRÜN GÖRSELİ</text>
  <text x="762" y="512" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="800">${escapeXml(theme.name)} · Doğrulanmış Veri</text>
  <text x="762" y="538" fill="${theme.accent}" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="700">www.uretir.com/${escapeXml(target.toolSlug)}</text>

  <circle cx="66" cy="632" r="6" fill="${theme.accent}" />
  <text x="84" y="639" fill="#d1d5db" font-family="Segoe UI, Arial, sans-serif" font-size="19" font-weight="600">Doğrulanmış Veri Merkezi · Türkiye Üretir, Gençler Yetişir</text>
  <text x="1148" y="639" text-anchor="end" fill="${theme.accent}" font-family="Segoe UI, Arial, sans-serif" font-size="19" font-weight="800">uretir.com/${escapeXml(target.toolSlug)} · @uretirai</text>
</svg>`;

  return sharp(Buffer.from(svg)).png({ compressionLevel: 6 }).toBuffer();
}

function enrichBodyText(target, rawBody, item = {}) {
  const text = String(rawBody || "").trim();
  if (!text) return text;
  if (text.includes("Türkiye Üretir, Gençler Yetişir")) return text;

  const lines = text.split("\n");
  if (target.key === "evai") {
    return [
      ...lines,
      "",
      "🗺️ *Bölgesel m² Endeksi, Haritalı Konum ve Emsal Analizi:*",
      "https://www.uretir.com/ev-ai",
      "📸 *Instagram:* @uretirai · 🤖 *Telegram:* @uretirbot",
      "*EvAI • uretir.com | Türkiye Üretir, Gençler Yetişir*",
    ].join("\n");
  }
  if (target.key === "arabaai") {
    return [
      ...lines,
      "",
      "🗺️ *Sıfır Araç Kampanyaları ve 2. El Haritalı Fiyat Kıyaslama:*",
      "https://www.uretir.com/araba-ai",
      "📸 *Instagram:* @uretirai · 🤖 *Telegram:* @uretirbot",
      "*ArabaAI • uretir.com | Türkiye Üretir, Gençler Yetişir*",
    ].join("\n");
  }
  return [
    ...lines,
    "",
    `🌐 *Doğrulanmış Veriler ve Fiyat Geçmişi:* https://www.uretir.com/${target.toolSlug}`,
    "📸 *Instagram:* @uretirai · 🤖 *Telegram:* @uretirbot",
  ].join("\n");
}

async function sendMessage(channel, body, target, item = {}) {
  const enrichedBody = enrichBodyText(target, body, item);
  let mediaBase64 = null;
  let mediaMime = "image/png";

  try {
    const pngBytes = await generateMagazineCardPngBuffer(target, enrichedBody, item);
    const previewDir = path.join(projectRoot, "reports", "social-media", "whatsapp-cards");
    await fs.mkdir(previewDir, { recursive: true });
    await fs.writeFile(path.join(previewDir, `${target.key}-latest.png`), pngBytes);
    mediaBase64 = pngBytes.toString("base64");
  } catch (cardErr) {
    console.warn(`${target.name} görsel kart üretim uyarısı:`, cardErr?.message || cardErr);
  }

  const result = await client.pupPage.evaluate(
    async ({ channelId, body, mediaBase64, mediaMime }) => {
      const collection = window.require("WAWebCollections").WAWebNewsletterCollection;
      const chats = collection.getModelsArray();
      const chat = chats.find((model) => {
        const id = model?.id?._serialized || model?.id?.toString?.() || "";
        return id === channelId;
      });
      if (!chat) return { ok: false, reason: "channel_not_cached" };

      const recent = () => {
        const models = chat.msgs?.getModelsArray?.() || chat.msgs?._models || [];
        return models.slice(-40);
      };
      const idOf = (msg) => msg?.id?._serialized || msg?.id?.toString?.() || msg?.serverId || null;

      let mediaError = null;
      if (mediaBase64) {
        let step = "init";
        try {
          const mediaInfo = {
            mimetype: mediaMime,
            data: mediaBase64,
            filename: "uretir-card.png",
          };
          step = "WWebJS.sendMessage(media)";
          const msg = await window.WWebJS.sendMessage(chat, "", {
            media: mediaInfo,
            caption: body,
            linkPreview: false,
            parseVCards: false,
          });
          await new Promise((resolve) => setTimeout(resolve, 1500));
          const serverId = msg?.serverId || null;
          const ack = Number(msg?.ack ?? 1);
          const id = idOf(msg);
          if (msg && (serverId || ack >= 1 || id)) {
            return {
              ok: true,
              withMedia: true,
              id,
              serverId,
              ack,
            };
          }
        } catch (mediaErr) {
          mediaError = `[${step}] ` + String(mediaErr?.stack || mediaErr?.message || mediaErr);
        }
      }

      const msg = await window.WWebJS.sendMessage(chat, body, {
        linkPreview: false,
        parseVCards: false,
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));
      const confirmed = msg || recent().find((item) => item?.body === body && item?.self === "out");
      const serverId = confirmed?.serverId || null;
      const ack = Number(confirmed?.ack ?? 0);
      const id = idOf(confirmed);
      return {
        ok: Boolean(confirmed && (serverId || ack >= 1)),
        withMedia: false,
        mediaError,
        id,
        serverId,
        ack,
        reason: confirmed ? "not_server_confirmed" : "message_not_created",
      };
    },
    { channelId: channel.id, body: enrichedBody, mediaBase64, mediaMime }
  );

  if (result?.mediaError) {
    console.warn(`${target.name} görselli gönderim detayı:`, result.mediaError);
  }
  if (!result?.ok) {
    throw new Error(`WhatsApp sunucu onayı alınamadı (${result?.reason || result?.mediaError || "bilinmiyor"}).`);
  }
  const messageId = result.serverId || result.id || `confirmed-${Date.now()}`;
  console.log(`${target.name}: ${result.withMedia ? "📸 GÖRSELLİ KART + İLAN" : "metin"} gönderildi (${messageId}).`);
  return messageId;
}

async function publishSnapshot(target, channel, state, force = false) {
  if (!due(target, state, force)) {
    return {
      sent: false,
      status: isBroadcastWindowOpen()
        ? "sıradaki yayın saati bekleniyor"
        : "bugünkü yayınlar tamamlandı · yarın 09:00 planında",
    };
  }
  const payload = await api(target.endpoint);
  if (!payload?.body) return { sent: false, status: payload?.status || "yayınlanabilir veri yok" };
  const fingerprint = payload.fingerprint || createHash("sha256").update(payload.body).digest("hex").slice(0, 24);
  const own = state[target.key] || {};
  if (!force && own.lastFingerprint === fingerprint) return { sent: false, status: "veri değişmedi" };
  const expectedUrl = `https://whatsapp.com/channel/${target.inviteCode}`;
  const actualUrl = payload.channel_url || payload.channel;
  if (actualUrl !== expectedUrl) throw new Error(`${target.name} kanal hedefi uyuşmuyor.`);
  const messageId = await sendMessage(channel, payload.body, target, payload);
  state[target.key] = { ...own, lastFingerprint: fingerprint, lastSentAt: new Date().toISOString(), messageId };
  await writeState(state);
  return { sent: true, status: "fotoğraflı özet gönderildi", messageId };
}
async function publishQueue(target, channel, state, force = false) {
  if (!due(target, state, force)) {
    return {
      sent: false,
      status: isBroadcastWindowOpen()
        ? "sıradaki yayın saati bekleniyor"
        : "bugünkü yayınlar tamamlandı · yarın 09:00 planında",
    };
  }
  const payload = await api(target.endpoint),
    items = Array.isArray(payload?.items) ? payload.items : [];
  if (!items.length) return { sent: false, status: "yayınlanabilir yeni içerik yok" };
  const expectedUrl = `https://whatsapp.com/channel/${target.inviteCode}`;
  if (payload.channel_url !== expectedUrl) throw new Error(`${target.name} kanal hedefi uyuşmuyor.`);
  const own = state[target.key] || {},
    sentFingerprints = Array.isArray(own.sentFingerprints) ? own.sentFingerprints : [],
    seen = new Set(sentFingerprints);
  const unseen = force
    ? items.filter((item) => item?.body)
    : items.filter((item) => item?.fingerprint && item?.body && !seen.has(item.fingerprint));
  if (!unseen.length) return { sent: false, status: "daha önce gönderilmemiş yeni içerik yok" };
  const groupOf = (item) => item.bank || item.brand || item.source || item.city || "";
  const selected = unseen.find((item) => groupOf(item) !== own.lastGroup && item.category !== own.lastCategory) || unseen[0];
  const messageId = await sendMessage(channel, selected.body, target, selected),
    day = istanbulDay();
  state[target.key] = {
    ...own,
    sentFingerprints: [...sentFingerprints, selected.fingerprint].slice(-500),
    lastGroup: groupOf(selected),
    lastCategory: selected.category,
    lastSentAt: new Date().toISOString(),
    messageId,
    dailyDay: day,
    dailyCount: own.dailyDay === day ? (own.dailyCount || 0) + 1 : 1,
  };
  await writeState(state);
  return { sent: true, status: "fotoğraflı içerik gönderildi", messageId };
}
async function pollTarget(target, state, force = false) {
  try {
    const channel = await resolveChannel(target);
    const result =
      target.mode === "snapshot"
        ? await publishSnapshot(target, channel, state, force)
        : await publishQueue(target, channel, state, force);
    targetStatus[target.key] = `${result.status} · ${new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}`;
    console.log(`${target.name}: ${result.status}${result.messageId ? ` (${result.messageId})` : ""}`);
  } catch (error) {
    const message = String(error instanceof Error ? error.message : error);
    targetStatus[target.key] = "hata: " + message;
    console.error(`${target.name} kontrolü başarısız:`, message);
  }
}
async function poll(forceRequest = false) {
  if (busy || !ready) return;
  busy = true;
  try {
    const state = await readState();
    for (const target of targets) await pollTarget(target, state, forceRequest);
    connectionStatus = "Son kanal kontrolü: " + new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
  } catch (error) {
    connectionStatus = "Kontrol başarısız: " + String(error instanceof Error ? error.message : error);
    console.error("Kanal kontrolü başarısız:", error instanceof Error ? error.message : error);
  } finally {
    busy = false;
  }
}

await fs.mkdir(dataDir, { recursive: true });
client.initialize();

