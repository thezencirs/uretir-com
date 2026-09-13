import dotenv from "dotenv";
dotenv.config({ path: "../.env.production.local", quiet: true });
dotenv.config({ quiet: true });
import qrcode from "qrcode-terminal";
import QRCode from "qrcode";
import { createServer } from "node:http";
import pkg from "whatsapp-web.js";

const { Client, LocalAuth } = pkg;
const siteUrl = (process.env.SITE_URL || "https://www.uretir.com").replace(/\/$/, "");
const secret = process.env.WHATSAPP_BOT_SECRET || process.env.CRON_SECRET;
const channelName = process.env.CHANNEL_NAME || "HaberAI";
const pollMs = 30 * 60_000;
const channelUrl = "https://whatsapp.com/channel/0029VbDk4gHGpLHXkGseaf3Y";
let busy = false;
let qrImage = "";
let connectionStatus = "WhatsApp bağlantısı hazırlanıyor";
createServer((req,res)=>{
  if(req.headers.host!=="127.0.0.1:3217"){res.writeHead(403);res.end();return;}
  res.writeHead(200,{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store","Content-Security-Policy":"default-src 'none'; img-src data:; style-src 'unsafe-inline'; frame-ancestors 'none'"});
  res.end(`<!doctype html><html lang="tr"><head><meta http-equiv="refresh" content="8"><title>HaberAI Bot Bağlantısı</title></head><body style="font:18px system-ui;text-align:center;background:#f6f8f2;padding:30px"><h1>HaberAI · WhatsApp bağlantısı</h1><p>${connectionStatus}</p>${qrImage?`<img width="360" height="360" alt="WhatsApp bot eşleştirme QR kodu" src="${qrImage}"><p>Telefonda WhatsApp → Bağlı cihazlar → Cihaz bağla</p>`:""}<p>Hedef: HaberAI · Kontrol aralığı: 30 dakika</p></body></html>`);
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
client.on("authenticated", () => {qrImage="";connectionStatus="Oturum doğrulandı; kanal bağlantısı hazırlanıyor";console.log("WhatsApp oturumu doğrulandı.");});
client.on("auth_failure", (message) => console.error("WhatsApp oturum hatası:", message));
client.on("ready", async () => {
  connectionStatus="Bağlandı. Yeni şehir haberleri kontrol ediliyor.";
  console.log(`Hazır. '${channelName}' kanalı için ${pollMs / 60000} dakikada bir kontrol ediliyor.`);
  await poll();
  setInterval(poll, pollMs);
});

async function poll() {
  if (busy) return;
  busy = true;
  try {
    const channel = await client.getChannelByInviteCode("0029VbDk4gHGpLHXkGseaf3Y");
    const role = channel?.channelMetadata?.membershipType;
    if (!channel?.id?._serialized || !["owner", "admin"].includes(role)) throw new Error(`Hedef kanal yazma yetkisi doğrulanamadı (${role || "bilinmiyor"}).`);
    const refresh = await fetch(`${siteUrl}/api/cron/haber-ai`, {headers:{Authorization:`Bearer ${secret}`},signal:AbortSignal.timeout(60000)});
    if (!refresh.ok) throw new Error(`Kaynak yenileme ${refresh.status}`);
    const response = await fetch(`${siteUrl}/api/haber-ai/whatsapp`, {
      method: "POST", body: JSON.stringify({action:"claim"}),
      signal: AbortSignal.timeout(30000),
      headers: { Authorization: `Bearer ${secret}`, "Content-Type":"application/json" },
    });
    if (!response.ok) throw new Error(`Site ${response.status}`);
    const { bulletin } = await response.json();
    if (!bulletin) { connectionStatus="Kontrol tamamlandı; yeni şehir haberi yok. Son kontrol: "+new Date().toLocaleString("tr-TR"); return; }

    if (bulletin.channel_url !== channelUrl) throw new Error("Kanal hedefi uyuşmuyor.");
    const message = await channel.sendMessage(bulletin.body);
    if (!message?.id?._serialized) throw new Error("Gönderim sonucu belirsiz; otomatik tekrar yapılmayacak.");
    const acknowledged = await fetch(`${siteUrl}/api/haber-ai/whatsapp`, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action:"ack", claimId:bulletin.claimId, messageId:message.id._serialized }),
    });
    if (!acknowledged.ok) throw new Error(`Gönderim onayı ${acknowledged.status}`);
    console.log(`Bülten gönderildi: ${bulletin.claimId}`);
    connectionStatus="Son bülten gönderildi: "+new Date().toLocaleString("tr-TR",{timeZone:"Europe/Istanbul"});
  } catch (error) {
    connectionStatus="Kontrol başarısız: "+String(error instanceof Error ? error.message : error).replace(/[<>&"']/g, " ");
    console.error("Bülten kontrolü başarısız:", error instanceof Error ? error.message : error);
  } finally { busy = false; }
}

client.initialize();
