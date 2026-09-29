const targets = [
  { key:"haberai", name:"HaberAI", inviteCode:"0029VbDk4gHGpLHXkGseaf3Y" },
  { key:"finansai", name:"FinansAI", inviteCode:"0029VbDIS6B4inoiXI8jeE05" },
  { key:"puanai", name:"PuanAI", inviteCode:"0029VbDbbII8PgsA574OLl1H" },
  { key:"indirimai", name:"İndirimAI", inviteCode:"0029VbEFC5zICVfmJzjAfY2Q", inviteEnv:"INDIRIMAI_CHANNEL_INVITE_CODE", urlEnv:"INDIRIMAI_CHANNEL_URL" },
  { key:"arabaai", name:"ArabaAI", inviteCode:"0029Vb8r7Vh8F2p8FcGDsj1L", inviteEnv:"ARABAAI_CHANNEL_INVITE_CODE", urlEnv:"ARABAAI_CHANNEL_URL" },
  { key:"evai", name:"EvAI", inviteCode:"0029VaBzvL33gvWb52bNHv0q", inviteEnv:"EVAI_CHANNEL_INVITE_CODE", urlEnv:"EVAI_CHANNEL_URL" },
];

let failed=false;
for(const target of targets){
  const invite=(target.inviteEnv&&process.env[target.inviteEnv]?.trim())||target.inviteCode;
  const canonical=`https://whatsapp.com/channel/${invite}`;
  const url=(target.urlEnv&&process.env[target.urlEnv]?.trim())||canonical;
  if(!/^0029[A-Za-z0-9]+$/.test(invite)){
    failed=true;console.error(`[ERROR] ${target.name}: invite code format is unexpected.`);continue;
  }
  if(url.replace(/\/$/,"")!==canonical){
    failed=true;console.error(`[ERROR] ${target.name}: URL/invite-code mismatch. Expected ${canonical}`);continue;
  }
  console.log(`[OK] ${target.name}: ${canonical}`);
}
if((process.env.EVAI_ENABLE_PARTNER_SOURCES||"0")!=="0"){
  console.warn("[WARN] EVAI_ENABLE_PARTNER_SOURCES is enabled. Confirm marketplace reuse/API permission before production use.");
}
if(failed)process.exit(1);
console.log("Six channel targets are internally consistent. No messages were sent.");
