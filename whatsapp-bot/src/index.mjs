import dotenv from "dotenv";
dotenv.config({ path: "../.env.production.local", quiet: true });
dotenv.config({ quiet: true });
import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";

const { Client, LocalAuth } = pkg;
const siteUrl = (process.env.SITE_URL || "https://www.uretir.com").replace(/\/$/, "");
const secret = process.env.CRON_SECRET;
const channelName = process.env.CHANNEL_NAME || "HaberAI";
const pollMs = 30 * 60_000;
const channelUrl = "https://whatsapp.com/channel/0029VbDk4gHGpLHXkGseaf3Y";
let busy = false;

if (!secret) throw new Error("CRON_SECRET eksik.");

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "./data/auth" }),
  puppeteer: { headless: true },
});

client.on("qr", (value) => {
  console.log("WhatsApp Web QR kodunu kanal yöneticisi hesabıyla okutun:");
  qrcode.generate(value, { small: true });
});
client.on("authenticated", () => console.log("WhatsApp oturumu doğrulandı."));
client.on("auth_failure", (message) => console.error("WhatsApp oturum hatası:", message));
client.on("ready", async () => {
  console.log(`Hazır. '${channelName}' kanalı için ${pollMs / 60000} dakikada bir kontrol ediliyor.`);
  await poll();
  setInterval(poll, pollMs);
});

async function poll() {
  if (busy) return;
  busy = true;
  try {
    const channel = await client.getChannelByInviteCode("0029VbDk4gHGpLHXkGseaf3Y");
    if (!channel?.id?._serialized || channel.isReadOnly !== false) throw new Error("Hedef kanal yazma yetkisi doğrulanamadı.");
    const refresh = await fetch(`${siteUrl}/api/cron/haber-ai`, {headers:{Authorization:`Bearer ${secret}`},signal:AbortSignal.timeout(60000)});
    if (!refresh.ok) throw new Error(`Kaynak yenileme ${refresh.status}`);
    const response = await fetch(`${siteUrl}/api/haber-ai/whatsapp`, {
      method: "POST", body: JSON.stringify({action:"claim"}),
      signal: AbortSignal.timeout(30000),
      headers: { Authorization: `Bearer ${secret}`, "Content-Type":"application/json" },
    });
    if (!response.ok) throw new Error(`Site ${response.status}`);
    const { bulletin } = await response.json();
    if (!bulletin) return;

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
  } catch (error) {
    console.error("Bülten kontrolü başarısız:", error instanceof Error ? error.message : error);
  } finally { busy = false; }
}

client.initialize();
