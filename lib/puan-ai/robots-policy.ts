type RobotsDecision = { allowed: boolean; reason: string };
export type RobotsFile = { mode: "RULES" | "ALLOW" | "DENY"; text: string; reason: string };

function rulesFor(text: string, agent: string) {
  const groups: Array<{ agents: string[]; rules: Array<{ allow: boolean; path: string }> }> = [];
  let current: (typeof groups)[number] | null = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const [field, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    if (field.toLocaleLowerCase("en-US") === "user-agent") {
      if (!current || current.rules.length) { current = { agents: [], rules: [] }; groups.push(current); }
      current.agents.push(value.toLocaleLowerCase("en-US"));
    } else if (current && ["allow", "disallow"].includes(field.toLocaleLowerCase("en-US"))) {
      current.rules.push({ allow: field.toLocaleLowerCase("en-US") === "allow", path: value });
    }
  }
  const normalizedAgent = agent.toLocaleLowerCase("en-US");
  const exact = groups.filter((group) => group.agents.some((value) => normalizedAgent.includes(value) && value !== "*"));
  return (exact.length ? exact : groups.filter((group) => group.agents.includes("*"))).flatMap((group) => group.rules);
}

export function evaluateRobotsText(text: string, pathname: string, agent = "PuanAI-SourceVerifier") {
  const matches = rulesFor(text, agent)
    .filter((rule) => rule.path && pathname.startsWith(rule.path))
    .sort((a, b) => b.path.length - a.path.length || Number(b.allow) - Number(a.allow));
  return matches[0]?.allow ?? true;
}

async function loadRobotsFile(origin: string, fetcher: typeof fetch): Promise<RobotsFile> {
  const robotsUrl = new URL("/robots.txt", origin);
  try {
    const response = await fetcher(robotsUrl, { headers: { "User-Agent": "PuanAI-SourceVerifier/2.0" }, signal: AbortSignal.timeout(5_000) });
    if (response.status === 404 || response.status === 410) return { mode: "ALLOW", text: "", reason: "robots.txt bulunmadı; standart gereği erişime açık." };
    if (!response.ok) return { mode: "DENY", text: "", reason: `robots.txt HTTP ${response.status}; otomatik tarama güvenli biçimde durduruldu.` };
    return { mode: "RULES", text: await response.text(), reason: "robots.txt okundu." };
  } catch {
    return { mode: "DENY", text: "", reason: "robots.txt erişilemedi; otomatik tarama güvenli biçimde durduruldu." };
  }
}

export async function checkRobotsPolicy(url: URL, fetcher: typeof fetch = fetch, cache = new Map<string, Promise<RobotsFile>>()): Promise<RobotsDecision> {
  let pending = cache.get(url.origin);
  if (!pending) { pending = loadRobotsFile(url.origin, fetcher); cache.set(url.origin, pending); }
  const file = await pending;
  if (file.mode === "ALLOW") return { allowed: true, reason: file.reason };
  if (file.mode === "DENY") return { allowed: false, reason: file.reason };
  const allowed = evaluateRobotsText(file.text, url.pathname);
  return { allowed, reason: allowed ? "robots.txt otomatik taramaya izin veriyor." : "robots.txt bu yolu otomatik taramaya kapatıyor." };
}
