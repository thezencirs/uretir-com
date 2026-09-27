import dotenv from "dotenv";
dotenv.config({ path: "../.env.production.local", quiet: true });
dotenv.config({ quiet: true });
import qrcode from "qrcode-terminal";
import QRCode from "qrcode";
import { createServer } from "node:http";
import fs from "node:fs/promises";
import pkg from "whatsapp-web.js";

const { Client, LocalAuth } = pkg;
const siteUrl = (process.env.SITE_URL || "https://www.uretir.com").replace(/\/$/, "");
const secret = process.env.WHATSAPP_BOT_SECRET || process.env.CRON_SECRET;
const pollMs = 30 * 60_000;
const statePath = "./data/channel-state.json";

const targets = [
  {
    key: "haberai",
    name: "HaberAI",
    inviteCode: "0029VbDk4gHGpLHXkGseaf3Y",
    endpoint: "/api/haber-ai/whatsapp",
    mode: "claim",
    minIntervalMs: 0,
  },
  {
    key: "finansai",
    name: "FinansAI",
    inviteCode: "0029VbDIS6B4inoiXI8jeE05",
    endpoint: "/api/finans-ai/whatsapp",
    mode: "snapshot",
    minIntervalMs: 60 * 60_000,
  },
  {
    key: "puanai",
    name: "PuanAI",
    inviteCode: "0029VbDbbII8PgsA574OLl1H",
    endpoint: "/api/puan-ai/whatsapp",
    mode: "queue",
    minIntervalMs: 60 * 60_000,
  },
];

let busy = false;
let qrImage = "";
let connectionStatus = "WhatsApp bağlantısı hazırlanıyor";
const targetStatus = Object.fromEntries(targets.map((target) => [target.key, "bekleniyor"]));

createServer((req,res)=>{
  if(req.headers.host!=="127.0.0.1:3217"){res.writeHead(403);res.end();return;}
  res.writeHead(200,{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store","Content-Security-Policy":"default-src 'none'; img-src data:; style-src 'unsafe-inline'; frame-ancestors 'none'"});
  const rows = targets.map((target) => `<li><strong>${target.name}</strong>: ${escapeHtml(targetStatus[target.key])}</li>`).join("");
  res.end(`<!doctype html><html lang="tr"><head><meta http-equiv="refresh" content="8"><title>Üretir WhatsApp Kanal Botu</title></head><body style="font:18px system-ui;text-align:center;background:#f6f8f2;padding:30px"><h1>uretir.com · WhatsApp kanal motoru</h1><p>${escapeHtml(connectionStatus)}</p>${qrImage?`<img width="360" height="360" alt="WhatsApp bot eşleştirme QR kodu" src="${qrImage}"><p>Telefonda WhatsApp → Bağlı cihazlar → Cihaz bağla</p>`:""}<ul style="max-width:640px;margin:24px auto;text-align:left">${rows}</ul><p>Kontrol aralığı: ${pollMs / 60000} dakika</p></body></html>`);
}).listen(3217,"127.0.0.1");

if (!secret || secret === "[SENSITIVE]") throw new Error("Bot erişim anahtarı eksik.");

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "./data/auth" }),
  puppeteer: { headless: true },
});

client.on("qr", async (value) => {
  qrImage = await QRCode.toDataURL(value,{width:480,margin:3});
  connectionStatus = "Kanal yöneticisi hesabınızla QR kodunu okutun";
  console.log("WhatsApp Web QR kodunu kanal yöneticisi hesabıyla okutun:");
  qrcode.generate(value, { small: true });
});
client.on("authenticated", () => {
  qrImage="";
  connectionStatus="Oturum doğrulandı; kanal bağlantıları hazırlanıyor";
  console.log("WhatsApp oturumu doğrulandı.");
});
client.on("auth_failure", (message) => console.error("WhatsApp oturum hatası:", message));
client.on("ready", async () => {
  connectionStatus="Bağlandı. HaberAI, FinansAI ve PuanAI kanalları kontrol ediliyor.";
  console.log(`Hazır. ${targets.map((target) => target.name).join(", ")} için ${pollMs / 60000} dakikada bir kontrol ediliyor.`);
  await poll();
  setInterval(poll, pollMs);
});

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;",
  })[char]);
}

async function readState() {
  try {
    return JSON.parse(await fs.readFile(statePath, "utf8"));
  } catch {
    return {};
  }
}

async function writeState(state) {
  await fs.mkdir("./data", { recursive: true });
  await fs.writeFile(statePath, JSON.stringify(state, null, 2), "utf8");
}

function due(target, state) {
  if (!target.minIntervalMs) return true;
  const last = Date.parse(state?.[target.key]?.lastSentAt || "");
  return !Number.isFinite(last) || Date.now() - last >= target.minIntervalMs;
}

function findChannel(channels, target) {
  const matches = channels.filter((channel) =>
    channel.channelMetadata?.inviteCode === target.inviteCode
    || channel.channelMetadata?.inviteLink === `https://whatsapp.com/channel/${target.inviteCode}`
  );
  if (matches.length !== 1) throw new Error(`${target.name} kanal davet bağlantısı doğrulanamadı.`);
  const channel = matches[0];
  const role = channel?.channelMetadata?.membershipType;
  if (!channel?.id?._serialized || !["owner", "admin"].includes(role)) {
    throw new Error(`${target.name} yazma yetkisi doğrulanamadı (${role || "bilinmiyor"}).`);
  }
  return channel;
}

async function api(path, init = {}) {
  const response = await fetch(`${siteUrl}${path}`, {
    ...init,
    signal: AbortSignal.timeout(60000),
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`uretir.com ${path} → HTTP ${response.status}`);
  return response.json();
}

async function sendMessage(channel, body) {
  const message = await channel.sendMessage(body);
  if (!message?.id?._serialized) throw new Error("Gönderim sonucu belirsiz; otomatik tekrar yapılmayacak.");
  return message.id._serialized;
}

async function publishHaberAI(target, channel) {
  const refresh = await fetch(`${siteUrl}/api/cron/haber-ai`, {
    headers:{Authorization:`Bearer ${secret}`},
    signal:AbortSignal.timeout(60000),
  });
  if (!refresh.ok) throw new Error(`HaberAI kaynak yenileme ${refresh.status}`);

  const { bulletin } = await api(target.endpoint, {
    method: "POST",
    body: JSON.stringify({ action:"claim" }),
  });
  if (!bulletin) return { sent:false, status:"yeni şehir haberi yok" };

  const expectedUrl = `https://whatsapp.com/channel/${target.inviteCode}`;
  if (bulletin.channel_url !== expectedUrl) throw new Error("HaberAI kanal hedefi uyuşmuyor.");

  const messageId = await sendMessage(channel, bulletin.body);
  await api(target.endpoint, {
    method: "POST",
    body: JSON.stringify({ action:"ack", claimId:bulletin.claimId, messageId }),
  });
  return { sent:true, status:"bülten gönderildi", messageId };
}

async function publishSnapshot(target, channel, state) {
  if (!due(target, state)) return { sent:false, status:"sıradaki yayın saati bekleniyor" };
  const payload = await api(target.endpoint);
  if (!payload?.body || !payload?.fingerprint) return { sent:false, status:"yayınlanabilir veri yok" };
  const own = state[target.key] || {};
  if (own.lastFingerprint === payload.fingerprint) return { sent:false, status:"veri değişmedi" };

  const expectedUrl = `https://whatsapp.com/channel/${target.inviteCode}`;
  if (payload.channel_url !== expectedUrl) throw new Error(`${target.name} kanal hedefi uyuşmuyor.`);

  const messageId = await sendMessage(channel, payload.body);
  state[target.key] = {
    ...own,
    lastFingerprint: payload.fingerprint,
    lastSentAt: new Date().toISOString(),
    messageId,
  };
  await writeState(state);
  return { sent:true, status:"piyasa özeti gönderildi", messageId };
}

async function publishQueue(target, channel, state) {
  if (!due(target, state)) return { sent:false, status:"sıradaki yayın saati bekleniyor" };
  const payload = await api(target.endpoint);
  const items = Array.isArray(payload?.items) ? payload.items : [];
  if (!items.length) return { sent:false, status:"taze doğrulanmış kampanya yok" };

  const expectedUrl = `https://whatsapp.com/channel/${target.inviteCode}`;
  if (payload.channel_url !== expectedUrl) throw new Error(`${target.name} kanal hedefi uyuşmuyor.`);

  const own = state[target.key] || {};
  const sentFingerprints = Array.isArray(own.sentFingerprints) ? own.sentFingerprints : [];
  const seen = new Set(sentFingerprints);
  const unseen = items.filter((item) => item?.fingerprint && item?.body && !seen.has(item.fingerprint));
  if (!unseen.length) return { sent:false, status:"yeni kampanya yok" };

  const selected = unseen.find((item) => item.bank !== own.lastBank && item.category !== own.lastCategory) || unseen[0];
  const messageId = await sendMessage(channel, selected.body);
  state[target.key] = {
    ...own,
    sentFingerprints: [...sentFingerprints, selected.fingerprint].slice(-200),
    lastBank: selected.bank,
    lastCategory: selected.category,
    lastSentAt: new Date().toISOString(),
    messageId,
  };
  await writeState(state);
  return { sent:true, status:"kampanya gönderildi", messageId };
}

async function pollTarget(target, channels, state) {
  try {
    const channel = findChannel(channels, target);
    const result = target.mode === "claim"
      ? await publishHaberAI(target, channel)
      : target.mode === "snapshot"
        ? await publishSnapshot(target, channel, state)
        : await publishQueue(target, channel, state);
    targetStatus[target.key] = `${result.status} · ${new Date().toLocaleString("tr-TR",{timeZone:"Europe/Istanbul"})}`;
    if (result.sent) console.log(`${target.name}: ${result.status} (${result.messageId})`);
  } catch (error) {
    const message = String(error instanceof Error ? error.message : error);
    targetStatus[target.key] = "hata: " + message;
    console.error(`${target.name} kontrolü başarısız:`, message);
  }
}

async function poll() {
  if (busy) return;
  busy = true;
  try {
    const channels = await client.getChannels();
    const state = await readState();
    for (const target of targets) {
      await pollTarget(target, channels, state);
    }
    connectionStatus = "Son kanal kontrolü: " + new Date().toLocaleString("tr-TR",{timeZone:"Europe/Istanbul"});
  } catch (error) {
    connectionStatus = "Kontrol başarısız: " + String(error instanceof Error ? error.message : error);
    console.error("Kanal kontrolü başarısız:", error instanceof Error ? error.message : error);
  } finally {
    busy = false;
  }
}

client.initialize();
