import dotenv from "dotenv";
dotenv.config({ path: "../.env.production.local", quiet: true });
dotenv.config({ quiet: true });
import qrcode from "qrcode-terminal";
import QRCode from "qrcode";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import pkg from "whatsapp-web.js";

const { Client, LocalAuth } = pkg;
const siteUrl = (process.env.SITE_URL || "https://www.uretir.com").replace(/\/$/, "");
const pollMs = Math.max(5, Number(process.env.POLL_MINUTES || 10)) * 60_000;
const dataDir = process.env.BOT_DATA_DIR || "./data";
const statePath = path.join(dataDir, "channel-state.json");
const panelToken = process.env.PANEL_TOKEN || "";
const port = Number(process.env.PORT || 3217);
const runOnce = process.env.RUN_ONCE === "1";

const targets = [
  { key:"haberai", name:"HaberAI", inviteCode:"0029VbDk4gHGpLHXkGseaf3Y", endpoint:"/api/channel-feed/haber-ai", mode:"snapshot", minIntervalMs:0 },
  { key:"finansai", name:"FinansAI", inviteCode:"0029VbDIS6B4inoiXI8jeE05", endpoint:"/api/channel-feed/finans-ai", mode:"snapshot", minIntervalMs:60*60_000 },
  { key:"puanai", name:"PuanAI", inviteCode:"0029VbDbbII8PgsA574OLl1H", endpoint:"/api/channel-feed/puan-ai", mode:"queue", minIntervalMs:60*60_000 },
  { key:"indirimai", name:"İndirimAI", inviteCode:"0029VbEFC5zICVfmJzjAfY2Q", endpoint:"/api/channel-feed/indirim-ai", mode:"snapshot", minIntervalMs:60*60_000 },
  { key:"arabaai", name:"ArabaAI", inviteCode:"0029Vb8r7Vh8F2p8FcGDsj1L", endpoint:"/api/channel-feed/araba-ai", mode:"queue", minIntervalMs:60*60_000 },
  { key:"evai", name:"EvAI", inviteCode:"0029VaBzvL33gvWb52bNHv0q", endpoint:"/api/channel-feed/ev-ai", mode:"queue", minIntervalMs:75*60_000, dailyLimit:10 },
];

let busy=false;
let qrImage="";
let ready=false;
let connectionStatus="WhatsApp bağlantısı hazırlanıyor";
const targetStatus=Object.fromEntries(targets.map(target=>[target.key,"bekleniyor"]));

function escapeHtml(value){
  return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function panelAuthorized(req){
  if(!panelToken)return false;
  const url=new URL(req.url||"/",`http://${req.headers.host||"localhost"}`);
  return url.searchParams.get("token")===panelToken || req.headers.authorization===`Bearer ${panelToken}`;
}
if (!runOnce) createServer((req,res)=>{
  if(req.url?.startsWith("/health")){
    res.writeHead(200,{"Content-Type":"application/json","Cache-Control":"no-store"});
    res.end(JSON.stringify({ok:true,ready,status:connectionStatus,targets:targetStatus}));
    return;
  }
  if(!panelAuthorized(req)){
    res.writeHead(403,{"Content-Type":"text/plain; charset=utf-8"});
    res.end("Yetkisiz panel erişimi.");
    return;
  }
  res.writeHead(200,{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store","Content-Security-Policy":"default-src 'none'; img-src data:; style-src 'unsafe-inline'; frame-ancestors 'none'"});
  const rows=targets.map(target=>`<li><strong>${target.name}</strong>: ${escapeHtml(targetStatus[target.key])}</li>`).join("");
  res.end(`<!doctype html><html lang="tr"><head><meta http-equiv="refresh" content="8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Üretir WhatsApp Kanal Motoru</title></head><body style="font:18px system-ui;text-align:center;background:#f6f8f2;padding:24px"><h1>uretir.com · WhatsApp kanal motoru</h1><p>${escapeHtml(connectionStatus)}</p>${qrImage?`<img style="max-width:90vw;height:auto" width="420" height="420" alt="WhatsApp bot eşleştirme QR kodu" src="${qrImage}"><p>WhatsApp → Bağlı cihazlar → Cihaz bağla</p>`:""}<ul style="max-width:720px;margin:24px auto;text-align:left">${rows}</ul><p>Kontrol aralığı: ${pollMs/60000} dakika</p></body></html>`);
}).listen(port,"0.0.0.0",()=>console.log(`Durum paneli 0.0.0.0:${port} üzerinde hazır.`));

const client=new Client({
  authStrategy:new LocalAuth({dataPath:path.join(dataDir,"auth")}),
  puppeteer:{
    headless:true,
    executablePath:process.env.PUPPETEER_EXECUTABLE_PATH||undefined,
    args:["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage","--disable-gpu"],
  },
});

client.on("qr",async value=>{
  ready=false;
  qrImage=await QRCode.toDataURL(value,{width:480,margin:3});
  connectionStatus="Kanal yöneticisi hesabınızla QR kodunu bir kez okutun";
  console.log("WhatsApp Web QR kodu üretildi.");
  qrcode.generate(value,{small:true});
});
client.on("authenticated",()=>{
  qrImage="";
  connectionStatus="Oturum doğrulandı; kanallar hazırlanıyor";
  console.log("WhatsApp oturumu doğrulandı.");
});
client.on("auth_failure",message=>{
  ready=false;
  connectionStatus="WhatsApp oturum hatası";
  console.error("WhatsApp oturum hatası:",message);
  if(runOnce)setTimeout(()=>process.exit(2),500);
});
client.on("disconnected",reason=>{
  ready=false;
  connectionStatus="WhatsApp bağlantısı koptu; servis yeniden başlatılıyor";
  console.error("WhatsApp bağlantısı koptu:",reason);
  setTimeout(()=>process.exit(1),1000);
});
client.on("ready",async()=>{
  ready=true;
  qrImage="";
  connectionStatus="Bağlandı. Altı Üretir AI kanalı otomatik yayın modunda.";
  console.log(`Hazır. ${targets.map(target=>target.name).join(", ")} için ${runOnce?"tek seferlik":"sürekli"} kontrol başlıyor.`);
  await poll();
  if(runOnce){
    await new Promise(resolve=>setTimeout(resolve,2500));
    await client.destroy();
    process.exit(0);
  }
  setInterval(poll,pollMs);
});

async function readState(){
  try{return JSON.parse(await fs.readFile(statePath,"utf8"));}catch{return {};}
}
async function writeState(state){
  await fs.mkdir(dataDir,{recursive:true});
  await fs.writeFile(statePath,JSON.stringify(state,null,2),"utf8");
}
function istanbulDay(){
  return new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Istanbul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
}
function due(target,state){
  const own=state?.[target.key]||{};
  if(target.dailyLimit&&own.dailyDay===istanbulDay()&&(own.dailyCount||0)>=target.dailyLimit)return false;
  if(!target.minIntervalMs)return true;
  const last=Date.parse(own.lastSentAt||"");
  return !Number.isFinite(last)||Date.now()-last>=target.minIntervalMs;
}
async function resolveChannel(target){
  const channel=await client.getChannelByInviteCode(target.inviteCode);
  if(!channel?.id?._serialized)throw new Error(`${target.name} kanal davet bağlantısı çözülemedi.`);
  if(channel.isChannel!==true||!channel.id._serialized.endsWith("@newsletter")){
    throw new Error(`${target.name} hedefi geçerli bir WhatsApp kanalı değil.`);
  }
  if(channel.isReadOnly===true){
    throw new Error(`${target.name} kanalında bu hesapla gönderim yetkisi yok.`);
  }
  return channel;
}
async function api(endpoint){
  let lastError;
  for(let attempt=0;attempt<3;attempt++){
    try{
      const response=await fetch(`${siteUrl}${endpoint}`,{signal:AbortSignal.timeout(65_000),headers:{"User-Agent":"Uretir-WhatsApp-Publisher/1.0"}});
      if(response.ok)return response.json();
      lastError=new Error(`uretir.com ${endpoint} → HTTP ${response.status}`);
      if(response.status<500&&response.status!==429)break;
    }catch(error){lastError=error;}
    await new Promise(resolve=>setTimeout(resolve,700*(attempt+1)));
  }
  throw lastError||new Error("uretir.com bağlantı hatası");
}
async function sendMessage(channel,body){
  const message=await channel.sendMessage(body);
  if(!message?.id?._serialized)throw new Error("Gönderim sonucu belirsiz; otomatik tekrar yapılmayacak.");
  return message.id._serialized;
}
async function publishSnapshot(target,channel,state){
  if(!due(target,state))return {sent:false,status:"sıradaki yayın saati bekleniyor"};
  const payload=await api(target.endpoint);
  if(!payload?.body)return {sent:false,status:payload?.status||"yayınlanabilir veri yok"};
  const fingerprint=payload.fingerprint||createHash("sha256").update(payload.body).digest("hex").slice(0,24);
  const own=state[target.key]||{};
  if(own.lastFingerprint===fingerprint)return {sent:false,status:"veri değişmedi"};
  const expectedUrl=`https://whatsapp.com/channel/${target.inviteCode}`;
  const actualUrl=payload.channel_url||payload.channel;
  if(actualUrl!==expectedUrl)throw new Error(`${target.name} kanal hedefi uyuşmuyor.`);
  const messageId=await sendMessage(channel,payload.body);
  state[target.key]={...own,lastFingerprint:fingerprint,lastSentAt:new Date().toISOString(),messageId};
  await writeState(state);
  return {sent:true,status:"özet gönderildi",messageId};
}
async function publishQueue(target,channel,state){
  if(!due(target,state))return {sent:false,status:"sıradaki yayın saati bekleniyor"};
  const payload=await api(target.endpoint),items=Array.isArray(payload?.items)?payload.items:[];
  if(!items.length)return {sent:false,status:"yayınlanabilir yeni içerik yok"};
  const expectedUrl=`https://whatsapp.com/channel/${target.inviteCode}`;
  if(payload.channel_url!==expectedUrl)throw new Error(`${target.name} kanal hedefi uyuşmuyor.`);
  const own=state[target.key]||{},sentFingerprints=Array.isArray(own.sentFingerprints)?own.sentFingerprints:[],seen=new Set(sentFingerprints);
  const unseen=items.filter(item=>item?.fingerprint&&item?.body&&!seen.has(item.fingerprint));
  if(!unseen.length)return {sent:false,status:"daha önce gönderilmemiş yeni içerik yok"};
  const groupOf=item=>item.bank||item.brand||item.source||item.city||"";
  const selected=unseen.find(item=>groupOf(item)!==own.lastGroup&&item.category!==own.lastCategory)||unseen[0];
  const messageId=await sendMessage(channel,selected.body),day=istanbulDay();
  state[target.key]={...own,sentFingerprints:[...sentFingerprints,selected.fingerprint].slice(-500),lastGroup:groupOf(selected),lastCategory:selected.category,lastSentAt:new Date().toISOString(),messageId,dailyDay:day,dailyCount:own.dailyDay===day?(own.dailyCount||0)+1:1};
  await writeState(state);
  return {sent:true,status:"içerik gönderildi",messageId};
}
async function pollTarget(target,state){
  try{
    const channel=await resolveChannel(target);
    const result=target.mode==="snapshot"?await publishSnapshot(target,channel,state):await publishQueue(target,channel,state);
    targetStatus[target.key]=`${result.status} · ${new Date().toLocaleString("tr-TR",{timeZone:"Europe/Istanbul"})}`;
    if(result.sent)console.log(`${target.name}: ${result.status} (${result.messageId})`);
  }catch(error){
    const message=String(error instanceof Error?error.message:error);
    targetStatus[target.key]="hata: "+message;
    console.error(`${target.name} kontrolü başarısız:`,message);
  }
}
async function poll(){
  if(busy||!ready)return;
  busy=true;
  try{
    const state=await readState();
    for(const target of targets)await pollTarget(target,state);
    connectionStatus="Son kanal kontrolü: "+new Date().toLocaleString("tr-TR",{timeZone:"Europe/Istanbul"});
  }catch(error){
    connectionStatus="Kontrol başarısız: "+String(error instanceof Error?error.message:error);
    console.error("Kanal kontrolü başarısız:",error instanceof Error?error.message:error);
  }finally{busy=false;}
}

await fs.mkdir(dataDir,{recursive:true});
client.initialize();
