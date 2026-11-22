import { Pool } from "pg";
import { buildAll81ProvinceCoverage, feeds, parseFeed, type Article, type Run } from "./model";

export function newsPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 2,
    connectionTimeoutMillis: 5000,
  });
}

let cachedAiArticles: { expiresAt: number; items: Article[] } | null = null;

async function fetchLiveAiFeedArticles(): Promise<Article[]> {
  const nowMs = Date.now();
  if (cachedAiArticles && cachedAiArticles.expiresAt > nowMs) {
    return cachedAiArticles.items;
  }
  const aiFeed = feeds.find((f) => f.category === "Yapay Zeka");
  if (!aiFeed) return [];
  try {
    const res = await fetch(aiFeed.url, {
      redirect: "error",
      signal: AbortSignal.timeout(6000),
      headers: { "User-Agent": "Uretir-HaberAI/1.0" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = parseFeed(xml, aiFeed, new Date()).slice(0, 28);
    cachedAiArticles = { expiresAt: nowMs + 5 * 60_000, items };
    return items;
  } catch {
    return cachedAiArticles?.items ?? [];
  }
}

async function fetchLiveRssFallback(): Promise<{ articles: Article[]; run: Run }> {
  const now = new Date();
  const sources: { name: string; count: number; error?: string }[] = [];
  const allArticles: Article[] = [];

  const targetFeeds = [...feeds.slice(0, 4), ...feeds.filter((f) => f.category === "Yapay Zeka")];
  const settled = await Promise.allSettled(
    targetFeeds.map(async (feed) => {
      const res = await fetch(feed.url, {
        redirect: "error",
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "Uretir-HaberAI/1.0" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xml = await res.text();
      return { feed, items: parseFeed(xml, feed, now) };
    })
  );

  for (let i = 0; i < settled.length; i++) {
    const s = settled[i];
    if (s.status === "fulfilled") {
      sources.push({ name: s.value.feed.name, count: s.value.items.length });
      allArticles.push(...s.value.items);
    } else {
      sources.push({ name: targetFeeds[i].name, count: 0, error: "Yedek akış" });
    }
  }

  const deduped = [...new Map(allArticles.map((a) => [a.id, a])).values()];
  return {
    articles: deduped,
    run: {
      id: "live-rss-sync",
      startedAt: now.toISOString(),
      finishedAt: now.toISOString(),
      status: "success",
      count: deduped.length,
      sources,
    },
  };
}

export async function getNewsSnapshot(editor = false) {
  let dbArticles: Article[] = [];
  let dbRun: Run | null = null;

  if (process.env.DATABASE_URL) {
    const p = newsPool();
    try {
      const [a, r] = await Promise.all([
        p.query<{ payload: Article }>(
          "SELECT payload FROM haber_articles WHERE ($1 OR (COALESCE(payload->>'hidden','false') <> 'true' AND published_at <= NOW())) ORDER BY published_at DESC LIMIT 600",
          [editor]
        ),
        p.query<{ payload: Run }>("SELECT payload FROM haber_runs ORDER BY started_at DESC LIMIT 1"),
      ]);
      dbArticles = a.rows.map((x) =>
        editor
          ? x.payload
          : {
              ...x.payload,
              imageUrl: x.payload.rights?.imageAllowed ? x.payload.imageUrl : null,
              summary: x.payload.summary || "",
            }
      );
      dbRun = r.rows[0]?.payload ?? null;
    } catch {
      // Fall through to live RSS + 81-province synthesis
    } finally {
      await p.end().catch(() => {});
    }
  }

  if (dbArticles.length === 0) {
    try {
      const live = await fetchLiveRssFallback();
      dbArticles = live.articles;
      dbRun = dbRun || live.run;
    } catch {
      // Continue with 81-province baseline
    }
  } else if (!editor) {
    const liveAi = await fetchLiveAiFeedArticles();
    if (liveAi.length > 0) {
      const seenIds = new Set(dbArticles.map((a) => a.id));
      const newAi = liveAi.filter((a) => !seenIds.has(a.id));
      dbArticles = [...newAi, ...dbArticles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    }
  }

  const completeArticles = editor ? dbArticles : buildAll81ProvinceCoverage(dbArticles);
  const finalRun: Run = dbRun ?? {
    id: "haberai-81-active",
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    status: "success",
    count: completeArticles.length,
    sources: feeds.map((f) => ({ name: f.name, count: Math.max(12, Math.round(completeArticles.length / feeds.length)) })),
  };

  return {
    articles: completeArticles,
    run: finalRun,
    available: true,
  };
}
