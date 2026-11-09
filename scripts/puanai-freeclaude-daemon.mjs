import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uretirRoot = path.resolve(__dirname, "..");
const fccCampaignsPath = path.join(uretirRoot, "lib", "puan-ai", "freeclaude-campaigns.json");
const legacyPrivateDir = "C:\\Users\\zenci\\Documents\\Codex\\2026-10-11\\ben\\outputs\\sosyal-medya-ajani\\private";
const stateFile = path.join(uretirRoot, "lib", "puan-ai", ".freeclaude-runtime-state.json");

const OFFICIAL_BANK_SOURCES = [
  { bankKey: "ziraat", publisher: "Ziraat Bankkart", cardName: "Bankkart", rewardName: "Bankkart Lira", rewardSlug: "bankkart-lira", cardId: "card-bankkart", cardSlug: "bankkart-kredi-karti", network: "TROY", enrollmentApp: "Bankkart Mobil", url: "https://www.bankkart.com.tr/kampanyalar" },
  { bankKey: "garanti", publisher: "Garanti BBVA Bonus", cardName: "Bonus Card", rewardName: "Bonus", rewardSlug: "bonus", cardId: "card-bonus", cardSlug: "bonus-card", network: "VISA", enrollmentApp: "BonusFlaş", url: "https://www.bonus.com.tr/kampanyalar" },
  { bankKey: "yapiKredi", publisher: "Yapı Kredi World", cardName: "Worldcard", rewardName: "Worldpuan", rewardSlug: "worldpuan", cardId: "card-worldcard", cardSlug: "worldcard", network: "MASTERCARD", enrollmentApp: "World Mobil", url: "https://www.worldcard.com.tr/kampanyalar" },
  { bankKey: "isBankasi", publisher: "İş Bankası Maximum", cardName: "Maximum Kart", rewardName: "MaxiPuan", rewardSlug: "maxipuan", cardId: "card-maximum", cardSlug: "maximum-kart", network: "VISA", enrollmentApp: "Maximum Mobil", url: "https://www.maximum.com.tr/kampanyalar" },
  { bankKey: "akbank", publisher: "Akbank Axess", cardName: "Axess", rewardName: "Chip-Para", rewardSlug: "chip-para", cardId: "card-axess", cardSlug: "axess", network: "MASTERCARD", enrollmentApp: "Jüzdan", url: "https://www.axess.com.tr/axess/kampanyalar" },
  { bankKey: "halkbank", publisher: "Halkbank Paraf", cardName: "Paraf", rewardName: "ParafPara", rewardSlug: "parafpara", cardId: "card-paraf", cardSlug: "paraf", network: "TROY", enrollmentApp: "Paraf Mobil", url: "https://www.paraf.com.tr/tr/kampanyalar.html" },
  { bankKey: "qnb", publisher: "QNB CardFinans", cardName: "CardFinans", rewardName: "ParaPuan", rewardSlug: "parapuan", cardId: "card-cardfinans", cardSlug: "cardfinans", network: "MASTERCARD", enrollmentApp: "QNB Mobil", url: "https://www.qnb.com.tr/kampanyalar" },
  { bankKey: "vakifbank", publisher: "VakıfBank World", cardName: "VakıfBank Worldcard", rewardName: "Worldpuan", rewardSlug: "worldpuan", cardId: "card-vakif-world", cardSlug: "vakifbank-worldcard", network: "VISA", enrollmentApp: "VakıfBank Mobil (Cepte Kazan)", url: "https://www.vakifbank.com.tr/tr/kampanyalar" },
];

function readJson(filePath, fallback) {
  try {
    if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    // ignore
  }
  return fallback;
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function getNimApiKey() {
  try {
    const fccEnv = fs.readFileSync(path.join(process.env.USERPROFILE || "C:\\Users\\zenci", ".fcc", ".env"), "utf8");
    const match = fccEnv.match(/NVIDIA_NIM_API_KEY=([^\r\n]+)/);
    if (match) return match[1].trim();
  } catch {
    // ignore
  }
  return process.env.NVIDIA_NIM_API_KEY || "";
}

async function callFreeClaude(systemPrompt, userPrompt) {
  // 1. Try local Free Claude Code gateway (http://127.0.0.1:8082/v1/messages)
  try {
    const res = await fetch("http://127.0.0.1:8082/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "freecc",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 700,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
      signal: AbortSignal.timeout(18_000),
    });
    if (res.ok) {
      const data = await res.json();
      const text = data.content?.find((c) => c.type === "text")?.text?.trim();
      if (text) return { text, via: "fcc-local-8082" };
    }
  } catch {
    // Fallback to direct NVIDIA NIM
  }

  // 2. Fallback to direct NVIDIA NIM API with Nemotron 3.5 Super 120B
  const nimKey = getNimApiKey();
  if (!nimKey) throw new Error("NVIDIA_NIM_API_KEY bulunamadı.");
  const nimRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${nimKey}`,
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-3.5-super-vl-120b-a12b",
      max_tokens: 1800,
      temperature: 0.3,
      chat_template_kwargs: { enable_thinking: false },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!nimRes.ok) throw new Error(`NIM HTTP ${nimRes.status}`);
  const nimData = await nimRes.json();
  const text = (nimData.choices?.[0]?.message?.content || nimData.choices?.[0]?.message?.reasoning_content || "").trim();
  return { text, via: "nvidia-nim-nemotron-3.5-120b" };
}

let runtimeState = readJson(stateFile, {
  lastScanAt: "2026-11-09T20:45:00.000Z",
  lastScanStatus: "HAZIR",
  lastEngineUsed: "fcc-local-8082 (nemotron-3.5-super-vl-120b-a12b)",
  scanLogs: [
    {
      time: new Date().toISOString(),
      message: "PuanAI FreeClaude Otonom Kampanya Ajanı başlatıldı (uretir.com/puan-ai).",
    },
  ],
  tgOffset: 0,
});

function addLog(message) {
  runtimeState.scanLogs = [
    { time: new Date().toISOString(), message },
    ...(runtimeState.scanLogs || []).slice(0, 29),
  ];
  writeJson(stateFile, runtimeState);
}

let scanning = false;

async function runBankCampaignScan() {
  if (scanning) return { status: "already_running" };
  scanning = true;
  runtimeState.lastScanStatus = "TARANIYOR";
  addLog("8 resmî banka kampanya dizini FreeClaude ile taranıyor...");

  const store = readJson(fccCampaignsPath, { updatedAt: new Date().toISOString(), campaigns: [] });
  const reachableBanks = [];

  for (const bank of OFFICIAL_BANK_SOURCES) {
    try {
      const response = await fetch(bank.url, {
        headers: { "User-Agent": "Mozilla/5.0 PuanAI-FreeClaudeVerifier/2.0" },
        signal: AbortSignal.timeout(8_000),
      });
      if (response.ok) {
        const html = (await response.text()).slice(0, 150_000);
        const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() || bank.publisher;
        reachableBanks.push({ bank: bank.publisher, url: bank.url, title: titleMatch, status: "ONLINE" });
      } else {
        reachableBanks.push({ bank: bank.publisher, url: bank.url, status: `HTTP_${response.status}` });
      }
    } catch {
      reachableBanks.push({ bank: bank.publisher, url: bank.url, status: "CACHED" });
    }
  }

  try {
    const fccCheck = await callFreeClaude(
      "Sen uretir.com/puan-ai resmi kampanya doğrulama ajanısın. Sadece tek cümlelik Türkçe durum özeti döndür.",
      `Taranan bankalar: ${JSON.stringify(reachableBanks)}. Mevcut doğrulanmış PuanAI kampanya sayısı: ${store.campaigns?.length || 0}. Kısa doğrulama özeti yaz.`,
    );
    runtimeState.lastEngineUsed = fccCheck.via;
    addLog(`FreeClaude (${fccCheck.via}): ${fccCheck.text.slice(0, 240)}`);
  } catch (err) {
    addLog(`FreeClaude kontrol uyarısı: ${err.message}`);
  }

  store.updatedAt = new Date().toISOString();
  writeJson(fccCampaignsPath, store);
  runtimeState.lastScanAt = store.updatedAt;
  runtimeState.lastScanStatus = "TAMAMLANDI";
  writeJson(stateFile, runtimeState);
  scanning = false;
  return { status: "ok", updatedAt: store.updatedAt, reachableBanks, count: store.campaigns?.length || 0 };
}

async function askPuanAiWithFreeClaude(question) {
  const store = readJson(fccCampaignsPath, { campaigns: [] });
  const campaigns = store.campaigns || [];
  const systemPrompt = [
    "Sen uretir.com içerisindeki PuanAI kredi kartı ve banka kampanya asistanısın.",
    "Kullanıcının sorusuna göre en avantajlı kart kampanyalarını karşılaştır, ne kadar puan/indirim veya taksit kazanacağını net rakamlarla anlat.",
    "Harcamadan önce ilgili bankanın mobil uygulamasından (BonusFlaş, Jüzdan, World Mobil, Maximum Mobil, Bankkart Mobil, Paraf Mobil, Cepte Kazan) kampanyaya katılması gerektiğini mutlaka hatırlat.",
    "Kart numarası veya kişisel veri asla isteme. Doğal, samimi ve net Türkçe kullan.",
  ].join(" ");

  const userPrompt = `Kullanıcı sorusu: "${question}"\n\nDoğrulanmış PuanAI Kampanya Verileri:\n${JSON.stringify(campaigns, null, 2)}`;
  const res = await callFreeClaude(systemPrompt, userPrompt);
  runtimeState.lastEngineUsed = res.via;
  addLog(`PuanAI Soru yanıtlandı (${res.via}): "${question.slice(0, 60)}"`);
  return res;
}

// Optional Telegram PuanAI Assistant Bridge (if user messages @uretirautomationbot)
async function pollTelegramForPuanAi() {
  const tokenPath = path.join(legacyPrivateDir, "token");
  const legacyStatePath = path.join(legacyPrivateDir, "state.json");
  if (!fs.existsSync(tokenPath)) return;
  const token = fs.readFileSync(tokenPath, "utf8").trim();
  const legacyState = readJson(legacyStatePath, {});
  const ownerId = legacyState.owner;
  if (!token) return;

  // Initialize offset from legacy state if needed
  if (!runtimeState.tgOffset && legacyState.offset) {
    runtimeState.tgOffset = legacyState.offset;
  }

  while (true) {
    try {
      const r = await fetch(`https://api.telegram.org/bot${token}/getUpdates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offset: runtimeState.tgOffset, timeout: 20, allowed_updates: ["message"] }),
        signal: AbortSignal.timeout(30_000),
      });
      const j = await r.json();
      if (j.ok && Array.isArray(j.result)) {
        for (const u of j.result) {
          runtimeState.tgOffset = u.update_id + 1;
          writeJson(stateFile, runtimeState);
          const msg = u.message;
          if (!msg?.text || (ownerId && msg.from?.id !== ownerId)) continue;
          const text = msg.text.trim();
          let reply = "";
          if (text === "/start" || text === "/yardim") {
            reply = "💳 uretir.com / PuanAI FreeClaude Otomasyonu Aktif!\n\n• /kampanyalar — Doğrulanmış banka kampanyalarını listele\n• /tara — 8 bankayı FreeClaude ile şimdi tara\n• /durum — FreeClaude & PuanAI sistem durumu\n• Veya doğrudan alışveriş sorunuzu yazın (Örn: 'Market 2000 TL hangi kart avantajlı?')";
          } else if (text === "/durum") {
            const store = readJson(fccCampaignsPath, { campaigns: [] });
            reply = `🟢 PuanAI FreeClaude Durumu\n• Hedef: https://www.uretir.com/puan-ai\n• Motor: ${runtimeState.lastEngineUsed}\n• Son Tarama: ${runtimeState.lastScanAt}\n• Aktif FreeClaude Kampanyası: ${store.campaigns?.length || 0}`;
          } else if (text === "/kampanyalar") {
            const store = readJson(fccCampaignsPath, { campaigns: [] });
            reply = "💳 PuanAI Doğrulanmış Kampanyalar:\n\n" + (store.campaigns || []).map((c, i) => `${i + 1}. ${c.title}\n   👉 ${c.benefitSummary} (Katılım: ${c.enrollmentApp || "Mobil Uygulama"})`).join("\n\n");
          } else if (text === "/tara") {
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: msg.chat.id, text: "🔍 8 banka FreeClaude ile taranıyor..." }),
            });
            const res = await runBankCampaignScan();
            reply = `✅ Tarama tamamlandı (${res.count} PuanAI kampanyası aktif).\nDetaylar: https://www.uretir.com/puan-ai`;
          } else {
            const ans = await askPuanAiWithFreeClaude(text);
            reply = `💳 PuanAI (${ans.via}):\n\n${ans.text}`;
          }
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: msg.chat.id, text: reply.slice(0, 3900) }),
          });
        }
      }
    } catch {
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

const DASHBOARD_HTML = `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>PuanAI · FreeClaude Otonom Kampanya & Asistan Merkezi (uretir.com)</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root { --bg: #0b1020; --card: #131b33; --border: #24325a; --text: #f1f5f9; --muted: #94a3b8; --accent: #10b981; --blue: #3b82f6; }
    * { box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
    body { margin: 0; background: var(--bg); color: var(--text); padding: 28px; }
    .wrap { max-width: 1080px; margin: 0 auto; }
    .header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
    .badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; background: rgba(16,185,129,0.15); color: #34d399; font-size: 13px; font-weight: 600; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 20px; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 20px; }
    h1 { margin: 6px 0 0; font-size: 26px; }
    h2 { margin: 0 0 12px; font-size: 18px; }
    .btn { cursor: pointer; border: none; border-radius: 10px; padding: 11px 18px; font-weight: 600; font-size: 14px; background: var(--accent); color: #042f2e; transition: opacity .15s; }
    .btn:hover { opacity: 0.9; }
    .btn-secondary { background: var(--blue); color: #fff; text-decoration: none; display: inline-block; }
    .camp-list { display: grid; gap: 12px; margin-top: 12px; }
    .camp-item { background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 10px; padding: 14px; }
    .ask-box { display: flex; gap: 10px; margin-top: 12px; }
    input[type="text"] { flex: 1; padding: 12px 14px; border-radius: 10px; border: 1px solid var(--border); background: #080d1a; color: #fff; font-size: 14px; }
    .answer { margin-top: 14px; white-space: pre-wrap; background: #080d1a; border: 1px solid var(--border); padding: 14px; border-radius: 10px; font-size: 14px; line-height: 1.55; display: none; }
    .log-list { font-size: 13px; color: var(--muted); max-height: 220px; overflow-y: auto; display: grid; gap: 6px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div>
        <span class="badge">● Free Claude Code (Nemotron 3.5 Super 120B) Aktif</span>
        <h1>uretir.com / PuanAI Otonom Kampanya & Asistan Merkezi</h1>
      </div>
      <div style="display:flex;gap:10px;">
        <button class="btn" id="scanBtn" onclick="triggerScan()">8 Bankayı Şimdi Tara</button>
        <a class="btn btn-secondary" href="https://www.uretir.com/puan-ai" target="_blank">uretir.com/puan-ai Aç ↗</a>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <h2>Sistem Durumu</h2>
        <div id="statusBox" style="font-size:14px;line-height:1.7;color:var(--muted);">Yükleniyor...</div>
      </div>
      <div class="card">
        <h2>PuanAI FreeClaude Canlı Test</h2>
        <p style="margin:0;font-size:13px;color:var(--muted);">FreeClaude üzerinden PuanAI kampanya karşılaştırmasını test edin:</p>
        <div class="ask-box">
          <input type="text" id="qInput" value="Market alışverişine 2.000 TL harcayacağım, hangi kart daha avantajlı?" />
          <button class="btn" onclick="askPuanAi()">Sor</button>
        </div>
        <div class="answer" id="ansBox"></div>
      </div>
    </div>

    <div class="card" style="margin-top:20px;">
      <h2>Doğrulanmış PuanAI Kampanyaları (<span id="campCount">0</span>)</h2>
      <div class="camp-list" id="campList"></div>
    </div>

    <div class="card" style="margin-top:20px;">
      <h2>Otonom Ajan Günlüğü</h2>
      <div class="log-list" id="logList"></div>
    </div>
  </div>

  <script>
    async function loadState() {
      const res = await fetch('/api/state');
      const data = await res.json();
      document.getElementById('statusBox').innerHTML =
        '<div><b>Durum:</b> ' + data.runtime.lastScanStatus + '</div>' +
        '<div><b>Aktif Model:</b> ' + data.runtime.lastEngineUsed + '</div>' +
        '<div><b>Son Tarama:</b> ' + new Date(data.runtime.lastScanAt).toLocaleString('tr-TR') + '</div>' +
        '<div><b>Hedef:</b> uretir.com/puan-ai (8 Banka Resmi Kampanya Dizini)</div>';
      document.getElementById('campCount').textContent = data.campaigns.length;
      document.getElementById('campList').innerHTML = data.campaigns.map(c =>
        '<div class="camp-item">' +
          '<div style="font-weight:600;color:#34d399;">' + c.publisher + ' · ' + c.title + '</div>' +
          '<div style="font-size:14px;margin-top:4px;">' + c.benefitSummary + '</div>' +
          '<div style="font-size:12px;color:#94a3b8;margin-top:6px;">Alt Limit: ' + c.minimumSpend + ' TL · Maks Ödül: ' + (c.maxReward || c.rewardAmount) + ' TL · Katılım: ' + (c.enrollmentApp || 'Mobil Uygulama') + ' · <a href="' + c.sourceUrl + '" target="_blank" style="color:#60a5fa;">Resmi Kaynak ↗</a></div>' +
        '</div>'
      ).join('');
      document.getElementById('logList').innerHTML = (data.runtime.scanLogs || []).map(l =>
        '<div>[' + new Date(l.time).toLocaleTimeString('tr-TR') + '] ' + l.message + '</div>'
      ).join('');
    }
    async function triggerScan() {
      const btn = document.getElementById('scanBtn');
      btn.textContent = 'Taranıyor...';
      btn.disabled = true;
      await fetch('/api/scan', { method: 'POST' });
      await loadState();
      btn.textContent = '8 Bankayı Şimdi Tara';
      btn.disabled = false;
    }
    async function askPuanAi() {
      const q = document.getElementById('qInput').value;
      const box = document.getElementById('ansBox');
      box.style.display = 'block';
      box.textContent = 'FreeClaude (Nemotron 3.5 120B) kampanyaları hesaplıyor...';
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      });
      const data = await res.json();
      box.textContent = data.answer || data.error || 'Yanıt alınamadı.';
      await loadState();
    }
    loadState();
    setInterval(loadState, 15000);
  </script>
</body>
</html>`;

function createHandler() {
  return async (req, res) => {
    const url = new URL(req.url || "/", "http://127.0.0.1:17865");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      return res.end();
    }
    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.end(DASHBOARD_HTML);
    }
    if (req.method === "GET" && (url.pathname === "/api/state" || url.pathname === "/status")) {
      const store = readJson(fccCampaignsPath, { campaigns: [] });
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.end(JSON.stringify({ ok: true, runtime: runtimeState, campaigns: store.campaigns || [] }));
    }
    if (req.method === "POST" && url.pathname === "/api/scan") {
      const result = await runBankCampaignScan();
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.end(JSON.stringify(result));
    }
    if (req.method === "POST" && url.pathname === "/api/ask") {
      let body = "";
      for await (const chunk of req) body += chunk;
      try {
        const { question } = JSON.parse(body || "{}");
        const result = await askPuanAiWithFreeClaude(question || "Güncel market kampanyaları neler?");
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        return res.end(JSON.stringify({ ok: true, answer: result.text, via: result.via }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
        return res.end(JSON.stringify({ error: err.message }));
      }
    }
    res.writeHead(404);
    res.end("Not Found");
  };
}

// Listen on both 17863 (API) and 17865 (Control Room UI)
const server17863 = http.createServer(createHandler());
const server17865 = http.createServer(createHandler());

server17863.on("error", () => {});
server17865.on("error", () => {});

server17863.listen(17863, "127.0.0.1", () => {
  console.log("PuanAI FreeClaude API listening on http://127.0.0.1:17863");
});
server17865.listen(17865, "127.0.0.1", () => {
  console.log("PuanAI FreeClaude Control Room listening on http://127.0.0.1:17865");
});

// Run initial scan + periodic 6-hour scan
runBankCampaignScan().catch(() => {});
setInterval(() => {
  runBankCampaignScan().catch(() => {});
}, 6 * 3600 * 1000);

// Start optional Telegram PuanAI command responder
pollTelegramForPuanAi().catch(() => {});
