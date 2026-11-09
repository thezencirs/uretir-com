import { NextResponse } from "next/server";

export type ArenaChampion = {
  name: string;
  score: number;
  host: "Web" | "3dsMax" | "Revit" | "SketchUp";
  updatedAt: string;
};

export type ArenaPeerState = {
  peerId: string;
  name: string;
  host: "Web" | "3dsMax" | "Revit" | "SketchUp";
  game: string;
  score: number;
  ts: number;
};

const DEFAULT_CHAMPIONS: Record<string, ArenaChampion[]> = {
  skyscraper: [
    { name: "Burj Master [Revit 2027]", score: 720, host: "Revit", updatedAt: "2026-11-09T12:00:00Z" },
    { name: "Zaha AI [3ds Max]", score: 560, host: "3dsMax", updatedAt: "2026-11-09T11:40:00Z" },
    { name: "Skyline Lab [uretir.com]", score: 510, host: "Web", updatedAt: "2026-11-09T11:15:00Z" },
    { name: "Studio Foster [SketchUp]", score: 440, host: "SketchUp", updatedAt: "2026-11-09T10:30:00Z" },
  ],
  highway: [
    { name: "Mimar Sinan [Revit 2027]", score: 640, host: "Revit", updatedAt: "2026-11-09T12:10:00Z" },
    { name: "Turbo Racer [uretir.com]", score: 590, host: "Web", updatedAt: "2026-11-09T11:50:00Z" },
    { name: "Zaha AI [3ds Max]", score: 520, host: "3dsMax", updatedAt: "2026-11-09T11:20:00Z" },
    { name: "Studio Foster [SketchUp]", score: 410, host: "SketchUp", updatedAt: "2026-11-09T10:10:00Z" },
  ],
  puzzle_2048: [
    { name: "Burj 2048 [SketchUp]", score: 2048, host: "SketchUp", updatedAt: "2026-11-09T12:05:00Z" },
    { name: "Matrix Architect [uretir.com]", score: 1760, host: "Web", updatedAt: "2026-11-09T11:45:00Z" },
    { name: "Skyline Lab [3ds Max]", score: 1480, host: "3dsMax", updatedAt: "2026-11-09T11:00:00Z" },
    { name: "Zaha AI [Revit 2027]", score: 1024, host: "Revit", updatedAt: "2026-11-09T09:50:00Z" },
  ],
  snake_turbo: [
    { name: "Neon Viper [3ds Max]", score: 1380, host: "3dsMax", updatedAt: "2026-11-09T12:12:00Z" },
    { name: "Mimar Sinan [Revit 2027]", score: 1140, host: "Revit", updatedAt: "2026-11-09T11:30:00Z" },
    { name: "Cyber Cobra [uretir.com]", score: 980, host: "Web", updatedAt: "2026-11-09T10:55:00Z" },
    { name: "Zaha AI [SketchUp]", score: 920, host: "SketchUp", updatedAt: "2026-11-09T10:05:00Z" },
  ],
  cyberpong: [
    { name: "Cyber Mimar [3ds Max]", score: 550, host: "3dsMax", updatedAt: "2026-11-09T12:02:00Z" },
    { name: "Arena Striker [uretir.com]", score: 490, host: "Web", updatedAt: "2026-11-09T11:35:00Z" },
    { name: "BIM Striker [Revit 2027]", score: 450, host: "Revit", updatedAt: "2026-11-09T11:10:00Z" },
    { name: "SU Pro [SketchUp]", score: 360, host: "SketchUp", updatedAt: "2026-11-09T09:40:00Z" },
  ],
  block_blast: [
    { name: "Crystal Pro [SketchUp]", score: 1620, host: "SketchUp", updatedAt: "2026-11-09T12:15:00Z" },
    { name: "Zaha AI [3ds Max]", score: 1240, host: "3dsMax", updatedAt: "2026-11-09T11:55:00Z" },
    { name: "Voxel Master [uretir.com]", score: 1120, host: "Web", updatedAt: "2026-11-09T11:25:00Z" },
    { name: "BIM Master [Revit 2027]", score: 950, host: "Revit", updatedAt: "2026-11-09T10:20:00Z" },
  ],
};

const globalStore = globalThis as unknown as {
  __uretirArenaLeaderboards?: Record<string, ArenaChampion[]>;
  __uretirArenaPeers?: Map<string, ArenaPeerState>;
};

if (!globalStore.__uretirArenaLeaderboards) {
  globalStore.__uretirArenaLeaderboards = structuredClone(DEFAULT_CHAMPIONS);
}
if (!globalStore.__uretirArenaPeers) {
  globalStore.__uretirArenaPeers = new Map<string, ArenaPeerState>();
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function normalizeHost(raw?: string): "Web" | "3dsMax" | "Revit" | "SketchUp" {
  const s = (raw || "").toLowerCase();
  if (s.includes("max")) return "3dsMax";
  if (s.includes("revit")) return "Revit";
  if (s.includes("sketch")) return "SketchUp";
  return "Web";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const game = searchParams.get("game");
  const boards = globalStore.__uretirArenaLeaderboards!;
  const peersMap = globalStore.__uretirArenaPeers!;

  const now = Date.now();
  for (const [k, peer] of peersMap.entries()) {
    if (now - peer.ts > 45_000) {
      peersMap.delete(k);
    }
  }

  return NextResponse.json(
    {
      ok: true,
      syncedAt: new Date().toISOString(),
      bridge: "Circle Render PRO ⇄ uretir.com/oyun-ai Live Mesh",
      leaderboards: game && boards[game] ? { [game]: boards[game] } : boards,
      activePeers: Array.from(peersMap.values()).slice(0, 20),
    },
    { headers: CORS_HEADERS }
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      game?: string;
      name?: string;
      score?: number;
      host?: string;
      peerId?: string;
    };

    const game = (body.game || "skyscraper").trim();
    const rawName = (body.name || "Mimar").trim().slice(0, 36);
    const score = Math.max(0, Math.min(999_999, Math.round(Number(body.score) || 0)));
    const host = normalizeHost(body.host);
    const peerId = (body.peerId || `${host}_${rawName}`).slice(0, 48);

    const boards = globalStore.__uretirArenaLeaderboards!;
    const peersMap = globalStore.__uretirArenaPeers!;

    peersMap.set(peerId, {
      peerId,
      name: rawName,
      host,
      game,
      score,
      ts: Date.now(),
    });

    if (score > 0) {
      const list = boards[game] ? [...boards[game]] : [];
      const displayTag = rawName.includes("[")
        ? rawName
        : `${rawName} [${host === "Web" ? "uretir.com" : host}]`;

      const existingIdx = list.findIndex(
        (entry) => entry.name.toLowerCase() === displayTag.toLowerCase()
      );
      if (existingIdx >= 0) {
        if (score >= list[existingIdx].score) {
          list[existingIdx] = {
            name: displayTag,
            score,
            host,
            updatedAt: new Date().toISOString(),
          };
        }
      } else {
        list.push({
          name: displayTag,
          score,
          host,
          updatedAt: new Date().toISOString(),
        });
      }

      list.sort((a, b) => b.score - a.score);
      boards[game] = list.slice(0, 8);
    }

    return NextResponse.json(
      {
        ok: true,
        game,
        leaderboard: boards[game] || [],
        activePeers: Array.from(peersMap.values()).slice(0, 20),
      },
      { headers: CORS_HEADERS }
    );
  } catch {
    return NextResponse.json({ ok: false }, { status: 400, headers: CORS_HEADERS });
  }
}
