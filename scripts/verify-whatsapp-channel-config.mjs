const targets = [
  { key:"indirimai", name:"İndirimAI", url:"INDIRIMAI_CHANNEL_URL", invite:"INDIRIMAI_CHANNEL_INVITE_CODE" },
  { key:"arabaai", name:"ArabaAI", url:"ARABAAI_CHANNEL_URL", invite:"ARABAAI_CHANNEL_INVITE_CODE" },
  { key:"evai", name:"EvAI", url:"EVAI_CHANNEL_URL", invite:"EVAI_CHANNEL_INVITE_CODE" },
];

let failed = false;

for (const target of targets) {
  const url = (process.env[target.url] || "").trim();
  const invite = (process.env[target.invite] || "").trim();

  if (!url && !invite) {
    console.log(`[WAIT] ${target.name}: channel authorization not configured yet.`);
    continue;
  }

  if (!url || !invite) {
    failed = true;
    console.error(`[ERROR] ${target.name}: both ${target.url} and ${target.invite} are required.`);
    continue;
  }

  const expected = `https://whatsapp.com/channel/${invite}`;
  if (url.replace(/\/$/, "") !== expected) {
    failed = true;
    console.error(`[ERROR] ${target.name}: URL/invite-code mismatch. Expected ${expected}`);
    continue;
  }

  if (!/^0029[A-Za-z0-9]+$/.test(invite)) {
    failed = true;
    console.error(`[ERROR] ${target.name}: invite code format is unexpected.`);
    continue;
  }

  console.log(`[OK] ${target.name}: configuration is internally consistent.`);
}

if ((process.env.EVAI_ENABLE_PARTNER_SOURCES || "0") !== "0") {
  console.warn("[WARN] EVAI_ENABLE_PARTNER_SOURCES is enabled. Confirm marketplace reuse/API permission before production use.");
}

if (failed) process.exit(1);
console.log("No messages were sent. This command only validates configuration.");
