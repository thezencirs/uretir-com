const robotsCache = new Map<string, Promise<{mode:"ALLOW"|"DENY"|"RULES";text:string;sitemaps:string[]}>>();

function groups(text:string){
  const out:Array<{agents:string[];rules:Array<{allow:boolean;path:string}>}>=[];
  let current:(typeof out)[number]|null=null;
  for(const raw of text.split(/\r?\n/)){
    const line=raw.replace(/#.*$/,"").trim(); if(!line)continue;
    const [field,...rest]=line.split(":"); const value=rest.join(":").trim();
    const key=field.toLowerCase();
    if(key==="user-agent"){if(!current||current.rules.length){current={agents:[],rules:[]};out.push(current);}current.agents.push(value.toLowerCase());}
    else if(current&&(key==="allow"||key==="disallow"))current.rules.push({allow:key==="allow",path:value});
  }
  return out;
}

function robotsAllows(text:string,pathname:string,agent:string){
  const all=groups(text),needle=agent.toLowerCase();
  const exact=all.filter(g=>g.agents.some(a=>a!=="*"&&needle.includes(a)));
  const rules=(exact.length?exact:all.filter(g=>g.agents.includes("*"))).flatMap(g=>g.rules)
    .filter(r=>r.path&&pathname.startsWith(r.path))
    .sort((a,b)=>b.path.length-a.path.length||Number(b.allow)-Number(a.allow));
  return rules[0]?.allow??true;
}

async function robots(origin:string,agent:string,fetcher:typeof fetch){
  const key=origin+"|"+agent;
  let pending=robotsCache.get(key);
  if(!pending){
    pending=(async()=>{
      try{
        const r=await fetcher(new URL("/robots.txt",origin),{headers:{"User-Agent":agent},signal:AbortSignal.timeout(6000)});
        if(r.status===404||r.status===410)return {mode:"ALLOW" as const,text:"",sitemaps:[]};
        if(!r.ok)return {mode:"DENY" as const,text:"",sitemaps:[]};
        const text=await r.text();
        const sitemaps=text.split(/\r?\n/).map(l=>l.match(/^\s*Sitemap:\s*(https?:\/\/\S+)/i)?.[1]).filter((v):v is string=>Boolean(v));
        return {mode:"RULES" as const,text,sitemaps};
      }catch{return {mode:"DENY" as const,text:"",sitemaps:[]};}
    })();
    robotsCache.set(key,pending);
  }
  return pending;
}

export async function fetchPublicText(url:string|URL,opts:{agent:string;maxBytes?:number;fetcher?:typeof fetch}){
  const fetcher=opts.fetcher??fetch,u=new URL(url);
  if(u.protocol!=="https:")throw new Error("Only HTTPS public sources are allowed.");
  const policy=await robots(u.origin,opts.agent,fetcher);
  if(policy.mode==="DENY"||(policy.mode==="RULES"&&!robotsAllows(policy.text,u.pathname,opts.agent)))throw new Error("robots_policy_denied");
  const r=await fetcher(u,{redirect:"follow",headers:{"User-Agent":opts.agent,"Accept":"text/html,application/xml;q=0.9,*/*;q=0.8"},signal:AbortSignal.timeout(8000)});
  if(!r.ok)throw new Error("HTTP_"+r.status);
  const final=new URL(r.url);
  if(final.protocol!=="https:")throw new Error("unsafe_redirect");
  const text=await r.text(),max=opts.maxBytes??1_500_000;
  if(text.length>max)throw new Error("source_too_large");
  return {text,url:final.toString(),contentType:r.headers.get("content-type")??""};
}

function registrableHost(host:string){
  const parts=host.toLowerCase().split(".").filter(Boolean);
  if(parts.length<=2)return parts.join(".");
  const secondLevel=new Set(["com.tr","net.tr","org.tr","gen.tr","web.tr","biz.tr"]);
  const last2=parts.slice(-2).join(".");
  return secondLevel.has(last2)?parts.slice(-3).join("."):last2;
}
function sameSite(a:URL,b:URL){
  return registrableHost(a.hostname)===registrableHost(b.hostname);
}

function locs(xml:string){
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map(m=>m[1].replace(/&amp;/g,"&").trim()).filter(Boolean);
}

export async function discoverPublicUrls(origin:string,patterns:RegExp[],opts:{agent:string;maxUrls?:number;sitemapCandidates?:string[]}){
  const root=new URL(origin),policy=await robots(root.origin,opts.agent,fetch);
  const seeds=[...new Set([...(policy.sitemaps??[]),...(opts.sitemapCandidates??[]),new URL("/sitemap.xml",root).toString()])];
  const queue=seeds.slice(0,5),seen=new Set<string>(),out:string[]=[];
  while(queue.length&&out.length<(opts.maxUrls??40)){
    const sitemap=queue.shift()!; if(seen.has(sitemap))continue; seen.add(sitemap);
    let doc; try{doc=await fetchPublicText(sitemap,{agent:opts.agent,maxBytes:2_500_000});}catch{continue;}
    const urls=locs(doc.text),looksLikeIndex=/<sitemapindex[\s>]/i.test(doc.text);
    for(const raw of urls){
      let u; try{u=new URL(raw);}catch{continue;}
      if(!sameSite(root,u)||u.protocol!=="https:")continue;
      if(looksLikeIndex&&queue.length<8){queue.push(u.toString());continue;}
      if(patterns.some(p=>p.test(u.pathname+u.search))){out.push(u.toString());if(out.length>=(opts.maxUrls??40))break;}
    }
  }
  return [...new Set(out)];
}

export function stripHtml(html:string){
  return html.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ")
    .replace(/<[^>]+>/g," ").replace(/&nbsp;|&#160;/g," ").replace(/&amp;/g,"&").replace(/\s+/g," ").trim();
}

export function jsonLdObjects(html:string){
  const blocks=[...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
  const out:unknown[]=[];
  const push=(v:unknown)=>{if(Array.isArray(v))v.forEach(push);else if(v&&typeof v==="object"){out.push(v);const g=(v as Record<string,unknown>)["@graph"];if(g)push(g);}};
  for(const block of blocks){try{push(JSON.parse(block.trim()));}catch{}}
  return out as Array<Record<string,unknown>>;
}

export function parseMoney(value:unknown){
  if(typeof value==="number")return Number.isFinite(value)&&value>0?value:null;
  if(typeof value!=="string")return null;
  const raw=value.trim().replace(/\s/g,"");
  const normalized=/,\d{1,2}$/.test(raw)?raw.replace(/\./g,"").replace(",","."):raw.replace(/,(?=\d{3}(?:\D|$))/g,"").replace(/\.(?=\d{3}(?:\D|$))/g,"");
  const n=Number(normalized.replace(/[^0-9.]/g,""));
  return Number.isFinite(n)&&n>0?n:null;
}
