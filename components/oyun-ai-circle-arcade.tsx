"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Gamepad2, Trophy, Share2, RotateCcw, Zap, Play, Sparkles, Monitor } from "lucide-react";

type ArcadeGameId = "skyscraper" | "highway" | "puzzle_2048" | "snake_turbo" | "cyberpong";

type ChampionEntry = {
  name: string;
  score: number;
  host: "Web" | "3dsMax" | "Revit" | "SketchUp";
  updatedAt?: string;
};

type GameMeta = {
  id: ArcadeGameId;
  title: string;
  badge: string;
  controls: string;
  description: string;
  accent: string;
};

const GAMES: GameMeta[] = [
  {
    id: "skyscraper",
    title: "Skyscraper Mimar",
    badge: "Kule İnşası · 60 FPS",
    controls: "Boşluk (Space) / Tıkla: Kat Bırak",
    description: "Vinçle sallanan kat bloklarını milimetrik hizalayarak en yüksek gökdeleni inşa et. Tam hizalamada altın kombo kazan!",
    accent: "#c8f560",
  },
  {
    id: "highway",
    title: "Neon Highway Turbo",
    badge: "Ghost Yarış · 60 FPS",
    controls: "← / → veya A / D: Şerit Değiştir",
    description: "Gece otobanında trafik araçlarından sıyrıl, enerji halkalarını topla ve 3ds Max / Revit hayalet rekorunu geç!",
    accent: "#38bdf8",
  },
  {
    id: "puzzle_2048",
    title: "2048 Mimar",
    badge: "Strateji · Kule Birleştir",
    controls: "Ok Tuşları / WASD / Butonlar",
    description: "Aynı değerdeki mimari kütleleri birleştirerek 2048 Burj zirvesine ulaş.",
    accent: "#f59e0b",
  },
  {
    id: "snake_turbo",
    title: "Snake Turbo Arena",
    badge: "Refleks · Neon Grid",
    controls: "Ok Tuşları / WASD: Yönlendir",
    description: "Neon enerji çekirdeklerini toplayarak hızlanan siber yılanı büyüt, duvarlara ve kendine çarpmadan rekor kır.",
    accent: "#10b981",
  },
  {
    id: "cyberpong",
    title: "CyberPong AI PvP",
    badge: "Yapay Zekâ Düellosu",
    controls: "← / → veya Fare: Raketi Kaydır",
    description: "Circle Render AI rakibine karşı 60 FPS neon masa düellosu. Her rallide top hızı artar!",
    accent: "#ec4899",
  },
];

const HOST_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
  Web: { bg: "rgba(200, 245, 96, 0.18)", fg: "#c8f560", label: "uretir.com" },
  "3dsMax": { bg: "rgba(56, 189, 248, 0.18)", fg: "#38bdf8", label: "3ds Max" },
  Revit: { bg: "rgba(245, 158, 11, 0.2)", fg: "#fbbf24", label: "Revit" },
  SketchUp: { bg: "rgba(236, 72, 153, 0.2)", fg: "#f472b6", label: "SketchUp" },
};

export function OyunAICircleArcade() {
  const [activeGame, setActiveGame] = useState<ArcadeGameId>("skyscraper");
  const [playerName, setPlayerName] = useState("Mimar");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [statusText, setStatusText] = useState("Başlamak için Space veya Oyun Ekranına Tıkla");
  const [isGameOver, setIsGameOver] = useState(false);
  const [leaderboards, setLeaderboards] = useState<Record<string, ChampionEntry[]>>({});
  const [copiedChallenge, setCopiedChallenge] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scoreRef = useRef(0);
  const bestRef = useRef<Record<string, number>>({});
  const playerNameRef = useRef("Mimar");

  useEffect(() => {
    try {
      const savedName = localStorage.getItem("uretir-arcade-name");
      if (savedName) {
        setPlayerName(savedName);
        playerNameRef.current = savedName;
      }
      const savedBest = localStorage.getItem("uretir-arcade-best");
      if (savedBest) {
        bestRef.current = JSON.parse(savedBest);
        setBestScore(bestRef.current[activeGame] || 0);
      }
    } catch {
      // ignore
    }
  }, [activeGame]);

  const fetchArena = useCallback(async () => {
    try {
      const res = await fetch("/api/oyun-ai/arena", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.leaderboards) {
        setLeaderboards(data.leaderboards);
      }
    } catch {
      // ignore offline
    }
  }, []);

  const submitScoreToArena = useCallback(async (gameId: ArcadeGameId, finalScore: number) => {
    if (finalScore <= 0) return;
    try {
      const res = await fetch("/api/oyun-ai/arena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game: gameId,
          name: playerNameRef.current || "Mimar",
          score: finalScore,
          host: "Web",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.leaderboard) {
          setLeaderboards((prev) => ({ ...prev, [gameId]: data.leaderboard }));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchArena();
    const timer = window.setInterval(fetchArena, 15000);
    return () => window.clearInterval(timer);
  }, [fetchArena]);

  const registerScore = useCallback(
    (nextScore: number, gameId: ArcadeGameId, finished = false) => {
      scoreRef.current = nextScore;
      setScore(nextScore);
      const prevBest = bestRef.current[gameId] || 0;
      if (nextScore > prevBest) {
        bestRef.current[gameId] = nextScore;
        setBestScore(nextScore);
        try {
          localStorage.setItem("uretir-arcade-best", JSON.stringify(bestRef.current));
        } catch {
          // ignore
        }
      }
      if (finished && nextScore > 0) {
        submitScoreToArena(gameId, nextScore);
      }
    },
    [submitScoreToArena]
  );

  // Main 60 FPS Game Loop per selected game
  const actionTriggerRef = useRef<() => void>(() => {});
  const dirTriggerRef = useRef<(dir: "left" | "right" | "up" | "down") => void>(() => {});
  const resetTriggerRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let lastTime = performance.now();
    const W = canvas.width;
    const H = canvas.height;

    setScore(0);
    scoreRef.current = 0;
    setBestScore(bestRef.current[activeGame] || 0);
    setIsGameOver(false);

    // =========================================================================
    // 1. SKYSCRAPER MIMAR (Tower Stacker)
    // =========================================================================
    if (activeGame === "skyscraper") {
      type Block = { x: number; w: number; y: number; color: string; perfect?: boolean };
      const BLOCK_H = 22;
      const palette = ["#c8f560", "#38bdf8", "#a78bfa", "#f472b6", "#fbbf24", "#34d399"];
      let stack: Block[] = [{ x: W / 2 - 90, w: 180, y: H - 36, color: "#c8f560" }];
      let swingX = W / 2 - 90;
      let swingW = 180;
      let swingDir = 1;
      let swingSpeed = 210;
      let combo = 0;
      let cameraY = 0;
      let over = false;
      let flashAlpha = 0;

      setStatusText("Vinç bloğu hizalandığında SPACE veya EKRANA TIKLA!");

      const dropBlock = () => {
        if (over) {
          resetGame();
          return;
        }
        const top = stack[stack.length - 1];
        const left = Math.max(top.x, swingX);
        const right = Math.min(top.x + top.w, swingX + swingW);
        const overlap = right - left;

        if (overlap <= 8) {
          over = true;
          setIsGameOver(true);
          setStatusText(`Kule yıkıldı! Skor: ${scoreRef.current} · Tekrar oynamak için tıkla`);
          registerScore(scoreRef.current, "skyscraper", true);
          return;
        }

        const delta = Math.abs(swingX - top.x);
        let newW = overlap;
        let newX = left;
        let isPerfect = false;

        if (delta < 7) {
          combo += 1;
          isPerfect = true;
          newX = top.x;
          newW = Math.min(190, top.w + (combo >= 2 ? 6 : 0));
          flashAlpha = 0.65;
        } else {
          combo = 0;
        }

        const level = stack.length;
        const newY = top.y - BLOCK_H;
        stack.push({
          x: newX,
          w: newW,
          y: newY,
          color: palette[level % palette.length],
          perfect: isPerfect,
        });

        swingW = newW;
        swingSpeed = Math.min(460, 210 + level * 11);
        const pts = scoreRef.current + 25 + (isPerfect ? 20 * combo : 0);
        registerScore(pts, "skyscraper", false);
        setStatusText(
          isPerfect
            ? `🔥 Mükemmel Hiza! (${combo}x Kombo) · ${level}. Kat`
            : `${level}. Kat tamamlandı · Devam et!`
        );
      };

      const resetGame = () => {
        stack = [{ x: W / 2 - 90, w: 180, y: H - 36, color: "#c8f560" }];
        swingX = W / 2 - 90;
        swingW = 180;
        swingSpeed = 210;
        combo = 0;
        cameraY = 0;
        over = false;
        setIsGameOver(false);
        registerScore(0, "skyscraper", false);
        setStatusText("Yeni kule başladı! Kat bırakmak için tıkla veya Space.");
      };

      actionTriggerRef.current = dropBlock;
      dirTriggerRef.current = () => dropBlock();
      resetTriggerRef.current = resetGame;

      const tick = (now: number) => {
        const dt = Math.min(0.05, (now - lastTime) / 1000);
        lastTime = now;

        if (!over) {
          swingX += swingDir * swingSpeed * dt;
          if (swingX + swingW > W - 30) {
            swingX = W - 30 - swingW;
            swingDir = -1;
          } else if (swingX < 30) {
            swingX = 30;
            swingDir = 1;
          }
        }

        const topBlock = stack[stack.length - 1];
        const targetCamY = Math.max(0, H * 0.52 - topBlock.y);
        cameraY += (targetCamY - cameraY) * Math.min(1, dt * 6);
        flashAlpha = Math.max(0, flashAlpha - dt * 2.2);

        // Render background
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, "#050816");
        grad.addColorStop(1, "#0f172a");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Stars & architectural grid
        ctx.strokeStyle = "rgba(148, 163, 184, 0.07)";
        ctx.lineWidth = 1;
        for (let gx = 0; gx < W; gx += 40) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, H);
          ctx.stroke();
        }

        // Draw tower blocks
        ctx.save();
        ctx.translate(0, cameraY);
        for (let i = 0; i < stack.length; i++) {
          const b = stack[i];
          ctx.fillStyle = b.color;
          ctx.fillRect(b.x, b.y, b.w, BLOCK_H - 2);
          // architectural window mullions
          ctx.fillStyle = "rgba(9, 13, 22, 0.36)";
          for (let wx = b.x + 8; wx < b.x + b.w - 10; wx += 16) {
            ctx.fillRect(wx, b.y + 4, 8, BLOCK_H - 10);
          }
          if (b.perfect) {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(b.x, b.y, b.w, BLOCK_H - 2);
          }
        }

        // Swinging crane block
        if (!over) {
          const dropY = topBlock.y - BLOCK_H - 28;
          ctx.strokeStyle = "rgba(200, 245, 96, 0.45)";
          ctx.beginPath();
          ctx.moveTo(swingX + swingW / 2, dropY - 90);
          ctx.lineTo(swingX + swingW / 2, dropY);
          ctx.stroke();

          ctx.fillStyle = "#c8f560";
          ctx.fillRect(swingX, dropY, swingW, BLOCK_H - 2);
        }
        ctx.restore();

        if (flashAlpha > 0) {
          ctx.fillStyle = `rgba(200, 245, 96, ${flashAlpha * 0.22})`;
          ctx.fillRect(0, 0, W, H);
        }

        // HUD
        ctx.fillStyle = "#f8fafc";
        ctx.font = "800 15px system-ui, sans-serif";
        ctx.fillText(`KAT: ${stack.length - 1}   KOMBO: ${combo}x`, 18, 28);

        animId = requestAnimationFrame(tick);
      };

      animId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(animId);
    }

    // =========================================================================
    // 2. NEON HIGHWAY TURBO (3-Lane Synthwave Racer)
    // =========================================================================
    if (activeGame === "highway") {
      const lanes = [W * 0.28, W * 0.5, W * 0.72];
      let playerLane = 1;
      let playerX = lanes[1];
      let speed = 290;
      let distance = 0;
      let over = false;
      type Obstacle = { lane: number; y: number; type: "car" | "boost"; color: string };
      let obstacles: Obstacle[] = [];
      let spawnTimer = 0;

      setStatusText("← / → Tuşları veya Butonlarla Şerit Değiştir, Mavi Halkaları Topla!");

      const resetGame = () => {
        playerLane = 1;
        playerX = lanes[1];
        speed = 290;
        distance = 0;
        obstacles = [];
        over = false;
        setIsGameOver(false);
        registerScore(0, "highway", false);
        setStatusText("Otoban yarışı başladı! Şerit değiştirmek için ← / →");
      };

      actionTriggerRef.current = () => {
        if (over) resetGame();
        else playerLane = (playerLane + 1) % 3;
      };
      dirTriggerRef.current = (dir) => {
        if (over) {
          resetGame();
          return;
        }
        if (dir === "left") playerLane = Math.max(0, playerLane - 1);
        if (dir === "right") playerLane = Math.min(2, playerLane + 1);
      };
      resetTriggerRef.current = resetGame;

      const tick = (now: number) => {
        const dt = Math.min(0.05, (now - lastTime) / 1000);
        lastTime = now;

        if (!over) {
          speed = Math.min(620, speed + dt * 12);
          distance += speed * dt * 0.14;
          const pts = Math.floor(distance);
          if (pts !== scoreRef.current) registerScore(pts, "highway", false);

          playerX += (lanes[playerLane] - playerX) * Math.min(1, dt * 14);
          spawnTimer -= dt;
          if (spawnTimer <= 0) {
            spawnTimer = Math.max(0.42, 1.05 - (speed - 290) / 700);
            const lane = Math.floor(Math.random() * 3);
            const isBoost = Math.random() < 0.26;
            obstacles.push({
              lane,
              y: -50,
              type: isBoost ? "boost" : "car",
              color: isBoost ? "#c8f560" : "#f43f5e",
            });
          }

          for (let i = obstacles.length - 1; i >= 0; i--) {
            const ob = obstacles[i];
            ob.y += speed * dt;
            const ox = lanes[ob.lane];
            if (Math.abs(ob.y - (H - 74)) < 34 && Math.abs(ox - playerX) < 34) {
              if (ob.type === "boost") {
                distance += 45;
                registerScore(Math.floor(distance), "highway", false);
                setStatusText("⚡ +45 Turbo Enerji Halkası Yakalandı!");
                obstacles.splice(i, 1);
                continue;
              } else {
                over = true;
                setIsGameOver(true);
                const finalPts = Math.floor(distance);
                registerScore(finalPts, "highway", true);
                setStatusText(`Çarpışma! Skor: ${finalPts} · Yeniden başlamak için tıkla`);
              }
            }
            if (ob.y > H + 60) obstacles.splice(i, 1);
          }
        }

        // Draw road
        ctx.fillStyle = "#060919";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(W * 0.16, 0, W * 0.68, H);

        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(W * 0.16, 0);
        ctx.lineTo(W * 0.16, H);
        ctx.moveTo(W * 0.84, 0);
        ctx.lineTo(W * 0.84, H);
        ctx.stroke();

        // Dashed lane lines
        ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
        ctx.setLineDash([22, 22]);
        ctx.lineDashOffset = -(distance * 8) % 44;
        [W * 0.39, W * 0.61].forEach((lx) => {
          ctx.beginPath();
          ctx.moveTo(lx, 0);
          ctx.lineTo(lx, H);
          ctx.stroke();
        });
        ctx.setLineDash([]);

        // Obstacles
        for (const ob of obstacles) {
          const ox = lanes[ob.lane];
          if (ob.type === "boost") {
            ctx.strokeStyle = "#c8f560";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(ox, ob.y, 16, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            ctx.fillStyle = ob.color;
            ctx.fillRect(ox - 20, ob.y - 26, 40, 52);
            ctx.fillStyle = "#fde047";
            ctx.fillRect(ox - 15, ob.y + 18, 8, 5);
            ctx.fillRect(ox + 7, ob.y + 18, 8, 5);
          }
        }

        // Player vehicle
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(playerX - 21, H - 98, 42, 56);
        ctx.fillStyle = "#c8f560";
        ctx.fillRect(playerX - 15, H - 92, 30, 14);

        ctx.fillStyle = "#f8fafc";
        ctx.font = "800 15px system-ui, sans-serif";
        ctx.fillText(`HIZ: ${Math.round(speed)} km/h`, 18, 28);

        animId = requestAnimationFrame(tick);
      };

      animId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(animId);
    }

    // =========================================================================
    // 3. 2048 MIMAR (4x4 Architectural Grid)
    // =========================================================================
    if (activeGame === "puzzle_2048") {
      let board = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
      let over = false;

      const addRandomTile = () => {
        const empties: [number, number][] = [];
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            if (board[r][c] === 0) empties.push([r, c]);
          }
        }
        if (empties.length === 0) return;
        const [r, c] = empties[Math.floor(Math.random() * empties.length)];
        board[r][c] = Math.random() < 0.88 ? 2 : 4;
      };

      const drawBoard = () => {
        ctx.fillStyle = "#090d1a";
        ctx.fillRect(0, 0, W, H);
        const size = Math.min(W - 40, H - 40);
        const startX = (W - size) / 2;
        const startY = (H - size) / 2;
        const cell = (size - 40) / 4;

        const colors: Record<number, string> = {
          0: "#1e293b",
          2: "#334155",
          4: "#475569",
          8: "#0284c7",
          16: "#2563eb",
          32: "#7c3aed",
          64: "#db2777",
          128: "#d97706",
          256: "#059669",
          512: "#84cc16",
          1024: "#eab308",
          2048: "#c8f560",
        };

        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            const val = board[r][c];
            const x = startX + 8 + c * (cell + 8);
            const y = startY + 8 + r * (cell + 8);
            ctx.fillStyle = colors[val] || "#c8f560";
            ctx.beginPath();
            ctx.roundRect(x, y, cell, cell, 12);
            ctx.fill();

            if (val > 0) {
              ctx.fillStyle = val >= 512 ? "#090d1a" : "#ffffff";
              ctx.font = `900 ${val >= 1024 ? 20 : 24}px system-ui, sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(String(val), x + cell / 2, y + cell / 2);
            }
          }
        }
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
      };

      const slideRow = (row: number[]) => {
        const filtered = row.filter((v) => v !== 0);
        const merged: number[] = [];
        let gained = 0;
        for (let i = 0; i < filtered.length; i++) {
          if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
            const nextVal = filtered[i] * 2;
            merged.push(nextVal);
            gained += nextVal;
            i++;
          } else {
            merged.push(filtered[i]);
          }
        }
        while (merged.length < 4) merged.push(0);
        return { merged, gained };
      };

      const move = (dir: "left" | "right" | "up" | "down") => {
        if (over) return;
        const prev = JSON.stringify(board);
        let totalGain = 0;

        if (dir === "left" || dir === "right") {
          for (let r = 0; r < 4; r++) {
            const row = dir === "left" ? [...board[r]] : [...board[r]].reverse();
            const { merged, gained } = slideRow(row);
            totalGain += gained;
            board[r] = dir === "left" ? merged : merged.reverse();
          }
        } else {
          for (let c = 0; c < 4; c++) {
            const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
            const ordered = dir === "up" ? col : col.reverse();
            const { merged, gained } = slideRow(ordered);
            totalGain += gained;
            const finalCol = dir === "up" ? merged : merged.reverse();
            for (let r = 0; r < 4; r++) board[r][c] = finalCol[r];
          }
        }

        if (JSON.stringify(board) !== prev) {
          addRandomTile();
          const nextPts = scoreRef.current + totalGain;
          registerScore(nextPts, "puzzle_2048", false);
          drawBoard();

          // Check game over
          let canMove = false;
          for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
              if (board[r][c] === 0) canMove = true;
              if (c < 3 && board[r][c] === board[r][c + 1]) canMove = true;
              if (r < 3 && board[r][c] === board[r + 1][c]) canMove = true;
            }
          }
          if (!canMove) {
            over = true;
            setIsGameOver(true);
            registerScore(nextPts, "puzzle_2048", true);
            setStatusText(`Hamle kalmadı! Skor: ${nextPts} · Yeniden başlatmak için tıkla`);
          }
        }
      };

      const resetGame = () => {
        board = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
        over = false;
        setIsGameOver(false);
        addRandomTile();
        addRandomTile();
        registerScore(0, "puzzle_2048", false);
        setStatusText("Ok tuşları veya aşağıdaki yön butonlarıyla blokları birleştir!");
        drawBoard();
      };

      actionTriggerRef.current = () => {
        if (over) resetGame();
        else move("up");
      };
      dirTriggerRef.current = move;
      resetTriggerRef.current = resetGame;

      resetGame();
      return;
    }

    // =========================================================================
    // 4. SNAKE TURBO ARENA
    // =========================================================================
    if (activeGame === "snake_turbo") {
      const COLS = 24;
      const ROWS = 16;
      const CELL = Math.min(Math.floor(W / COLS), Math.floor(H / ROWS));
      const OX = Math.floor((W - COLS * CELL) / 2);
      const OY = Math.floor((H - ROWS * CELL) / 2);

      let snake = [
        { x: 10, y: 8 },
        { x: 9, y: 8 },
        { x: 8, y: 8 },
      ];
      let dir = { x: 1, y: 0 };
      let nextDir = { x: 1, y: 0 };
      let food = { x: 15, y: 8 };
      let stepTimer = 0;
      let over = false;

      const placeFood = () => {
        food = {
          x: Math.floor(Math.random() * COLS),
          y: Math.floor(Math.random() * ROWS),
        };
      };

      const resetGame = () => {
        snake = [
          { x: 10, y: 8 },
          { x: 9, y: 8 },
          { x: 8, y: 8 },
        ];
        dir = { x: 1, y: 0 };
        nextDir = { x: 1, y: 0 };
        placeFood();
        over = false;
        setIsGameOver(false);
        registerScore(0, "snake_turbo", false);
        setStatusText("Yön tuşlarıyla neon enerji çekirdeklerini topla!");
      };

      actionTriggerRef.current = () => {
        if (over) resetGame();
      };
      dirTriggerRef.current = (d) => {
        if (over) {
          resetGame();
          return;
        }
        if (d === "left" && dir.x === 0) nextDir = { x: -1, y: 0 };
        if (d === "right" && dir.x === 0) nextDir = { x: 1, y: 0 };
        if (d === "up" && dir.y === 0) nextDir = { x: 0, y: -1 };
        if (d === "down" && dir.y === 0) nextDir = { x: 0, y: 1 };
      };
      resetTriggerRef.current = resetGame;
      setStatusText("Yön tuşlarıyla neon enerji çekirdeklerini topla!");

      const tick = (now: number) => {
        const dt = Math.min(0.05, (now - lastTime) / 1000);
        lastTime = now;

        if (!over) {
          stepTimer += dt;
          const interval = Math.max(0.065, 0.13 - snake.length * 0.002);
          if (stepTimer >= interval) {
            stepTimer = 0;
            dir = nextDir;
            const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

            if (
              head.x < 0 ||
              head.x >= COLS ||
              head.y < 0 ||
              head.y >= ROWS ||
              snake.some((s) => s.x === head.x && s.y === head.y)
            ) {
              over = true;
              setIsGameOver(true);
              registerScore(scoreRef.current, "snake_turbo", true);
              setStatusText(`Oyun bitti! Skor: ${scoreRef.current} · Tekrar oynamak için tıkla`);
            } else {
              snake.unshift(head);
              if (head.x === food.x && head.y === food.y) {
                const pts = scoreRef.current + 35;
                registerScore(pts, "snake_turbo", false);
                placeFood();
              } else {
                snake.pop();
              }
            }
          }
        }

        ctx.fillStyle = "#060b16";
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = "rgba(16, 185, 129, 0.15)";
        ctx.strokeRect(OX, OY, COLS * CELL, ROWS * CELL);

        // Food
        ctx.fillStyle = "#c8f560";
        ctx.beginPath();
        ctx.arc(OX + (food.x + 0.5) * CELL, OY + (food.y + 0.5) * CELL, CELL * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Snake
        snake.forEach((seg, idx) => {
          ctx.fillStyle = idx === 0 ? "#10b981" : "#34d399";
          ctx.fillRect(OX + seg.x * CELL + 2, OY + seg.y * CELL + 2, CELL - 4, CELL - 4);
        });

        animId = requestAnimationFrame(tick);
      };

      animId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(animId);
    }

    // =========================================================================
    // 5. CYBERPONG AI ARENA
    // =========================================================================
    if (activeGame === "cyberpong") {
      let paddleX = W / 2 - 48;
      let aiX = W / 2 - 48;
      const PADDLE_W = 96;
      const PADDLE_H = 12;
      let ball = { x: W / 2, y: H / 2, vx: 210, vy: 240 };
      let over = false;

      const resetGame = () => {
        paddleX = W / 2 - 48;
        aiX = W / 2 - 48;
        ball = { x: W / 2, y: H / 2, vx: 210 * (Math.random() < 0.5 ? 1 : -1), vy: 240 };
        over = false;
        setIsGameOver(false);
        registerScore(0, "cyberpong", false);
        setStatusText("Fareyle veya ← / → tuşlarıyla raketi kontrol et!");
      };

      actionTriggerRef.current = () => {
        if (over) resetGame();
      };
      dirTriggerRef.current = (d) => {
        if (over) {
          resetGame();
          return;
        }
        if (d === "left") paddleX = Math.max(16, paddleX - 42);
        if (d === "right") paddleX = Math.min(W - PADDLE_W - 16, paddleX + 42);
      };
      resetTriggerRef.current = resetGame;
      setStatusText("Fareyle veya ← / → tuşlarıyla raketi kontrol et!");

      const onMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const relX = ((e.clientX - rect.left) / rect.width) * W;
        paddleX = Math.max(12, Math.min(W - PADDLE_W - 12, relX - PADDLE_W / 2));
      };
      canvas.addEventListener("mousemove", onMouseMove);

      const tick = (now: number) => {
        const dt = Math.min(0.05, (now - lastTime) / 1000);
        lastTime = now;

        if (!over) {
          ball.x += ball.vx * dt;
          ball.y += ball.vy * dt;

          if (ball.x < 12 || ball.x > W - 12) ball.vx *= -1;

          // AI top paddle
          const targetAi = ball.x - PADDLE_W / 2;
          aiX += (targetAi - aiX) * Math.min(1, dt * 6.5);
          aiX = Math.max(12, Math.min(W - PADDLE_W - 12, aiX));

          // Top bounce
          if (ball.y < 34 && ball.vy < 0) {
            ball.vy *= -1.04;
            ball.y = 34;
          }

          // Player paddle bounce
          if (
            ball.y >= H - 38 &&
            ball.y <= H - 20 &&
            ball.vy > 0 &&
            ball.x >= paddleX - 8 &&
            ball.x <= paddleX + PADDLE_W + 8
          ) {
            const offset = (ball.x - (paddleX + PADDLE_W / 2)) / (PADDLE_W / 2);
            ball.vx = offset * 310;
            ball.vy = -Math.min(540, Math.abs(ball.vy) * 1.06);
            const pts = scoreRef.current + 30;
            registerScore(pts, "cyberpong", false);
          }

          if (ball.y > H) {
            over = true;
            setIsGameOver(true);
            registerScore(scoreRef.current, "cyberpong", true);
            setStatusText(`Ralli bitti! Skor: ${scoreRef.current} · Yeniden oynamak için tıkla`);
          }
        }

        ctx.fillStyle = "#08071b";
        ctx.fillRect(0, 0, W, H);

        // Center net
        ctx.strokeStyle = "rgba(236, 72, 153, 0.22)";
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(0, H / 2);
        ctx.lineTo(W, H / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // AI Paddle
        ctx.fillStyle = "#ec4899";
        ctx.fillRect(aiX, 20, PADDLE_W, PADDLE_H);

        // Player Paddle
        ctx.fillStyle = "#c8f560";
        ctx.fillRect(paddleX, H - 32, PADDLE_W, PADDLE_H);

        // Ball
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 8, 0, Math.PI * 2);
        ctx.fill();

        animId = requestAnimationFrame(tick);
      };

      animId = requestAnimationFrame(tick);
      return () => {
        cancelAnimationFrame(animId);
        canvas.removeEventListener("mousemove", onMouseMove);
      };
    }
  }, [activeGame, registerScore]);

  // Global keyboard listener when arcade is in view
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      if (e.code === "Space") {
        e.preventDefault();
        actionTriggerRef.current();
      } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        dirTriggerRef.current("left");
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        dirTriggerRef.current("right");
      } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        dirTriggerRef.current("up");
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        dirTriggerRef.current("down");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const currentMeta = GAMES.find((g) => g.id === activeGame) || GAMES[0];
  const currentBoard = leaderboards[activeGame] || [];

  const handleShareChallenge = () => {
    const shareScore = Math.max(score, bestScore, 100);
    const url = `https://www.uretir.com/oyun-ai?game=${activeGame}&target=${shareScore}`;
    const text = `${currentMeta.title} oyununda ${shareScore} puan yaptım! Rekorumu geçebilir misin? ${url}`;
    try {
      navigator.clipboard.writeText(text);
      setCopiedChallenge(true);
      window.setTimeout(() => setCopiedChallenge(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <section
      id="circle-render-arcade"
      className="section-wrap"
      style={{ marginBottom: "32px" }}
      aria-labelledby="circle-arcade-heading"
    >
      <div
        style={{
          borderRadius: "24px",
          padding: "24px",
          background: "linear-gradient(145deg, #090d16 0%, #111827 100%)",
          border: "1px solid rgba(200, 245, 96, 0.24)",
          color: "#f8fafc",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: "18px",
          }}
        >
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  background: "rgba(200, 245, 96, 0.16)",
                  color: "#c8f560",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                }}
              >
                <Sparkles size={13} /> CIRCLE RENDER PRO ⇄ URETIR.COM CANLI ARENA
              </span>
              <span style={{ fontSize: "0.78rem", color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <Monitor size={13} /> 3ds Max · Revit · SketchUp · Web Eş Zamanlı Liderlik Tablosu
              </span>
            </div>
            <h2 id="circle-arcade-heading" style={{ fontSize: "1.45rem", fontWeight: 900, color: "#ffffff" }}>
              Circle Render 5-in-1 60 FPS Arcade Stüdyosu
            </h2>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
            <label style={{ fontSize: "0.78rem", color: "#cbd5e1", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
              Oyuncu:
              <input
                type="text"
                value={playerName}
                maxLength={22}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  playerNameRef.current = e.target.value;
                  try {
                    localStorage.setItem("uretir-arcade-name", e.target.value);
                  } catch {
                    // ignore
                  }
                }}
                placeholder="Mimar Adı"
                style={{
                  padding: "6px 10px",
                  borderRadius: "10px",
                  border: "1px solid rgba(148, 163, 184, 0.3)",
                  background: "#0f172a",
                  color: "#c8f560",
                  fontWeight: 800,
                  width: "130px",
                  fontSize: "0.82rem",
                }}
              />
            </label>
            <button
              type="button"
              onClick={handleShareChallenge}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "999px",
                border: "1px solid rgba(200, 245, 96, 0.4)",
                background: copiedChallenge ? "#c8f560" : "rgba(200, 245, 96, 0.12)",
                color: copiedChallenge ? "#090d16" : "#c8f560",
                fontWeight: 800,
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              <Share2 size={14} />
              {copiedChallenge ? "Meydan Okuma Linki Kopyalandı!" : "Arkadaşına Meydan Oku"}
            </button>
          </div>
        </div>

        {/* Game Switcher Tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "18px" }} role="tablist">
          {GAMES.map((g) => {
            const active = g.id === activeGame;
            return (
              <button
                key={g.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveGame(g.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  borderRadius: "14px",
                  border: active ? `1.5px solid ${g.accent}` : "1px solid rgba(148, 163, 184, 0.2)",
                  background: active ? "rgba(255, 255, 255, 0.09)" : "rgba(15, 23, 42, 0.6)",
                  color: active ? "#ffffff" : "#cbd5e1",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                <Gamepad2 size={15} style={{ color: g.accent }} />
                <span>{g.title}</span>
                <span
                  style={{
                    fontSize: "0.68rem",
                    padding: "2px 7px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.08)",
                    color: g.accent,
                  }}
                >
                  {g.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Split Layout: 60 FPS Canvas + Live Cross-Platform Leaderboard */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
            gap: "20px",
            alignItems: "stretch",
          }}
        >
          {/* Left: Game Stage */}
          <div
            style={{
              gridColumn: "span 2",
              display: "flex",
              flexDirection: "column",
              background: "#050811",
              borderRadius: "18px",
              padding: "14px",
              border: "1px solid rgba(148, 163, 184, 0.16)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#ffffff" }}>{currentMeta.title}</div>
                <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{currentMeta.description}</div>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div
                  style={{
                    padding: "6px 12px",
                    borderRadius: "10px",
                    background: "rgba(200, 245, 96, 0.14)",
                    color: "#c8f560",
                    fontWeight: 900,
                    fontSize: "0.9rem",
                  }}
                >
                  SKOR: {score}
                </div>
                <div
                  style={{
                    padding: "6px 12px",
                    borderRadius: "10px",
                    background: "rgba(56, 189, 248, 0.14)",
                    color: "#38bdf8",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                  }}
                >
                  REKOR: {bestScore}
                </div>
                <button
                  type="button"
                  onClick={() => resetTriggerRef.current()}
                  title="Yeniden Başlat"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "7px 12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(148,163,184,0.28)",
                    background: "#1e293b",
                    color: "#f8fafc",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  <RotateCcw size={14} /> Sıfırla
                </button>
              </div>
            </div>

            <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
              <canvas
                ref={canvasRef}
                width={640}
                height={380}
                onClick={() => actionTriggerRef.current()}
                style={{
                  width: "100%",
                  maxWidth: "640px",
                  height: "auto",
                  aspectRatio: "640 / 380",
                  borderRadius: "14px",
                  cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "#050816",
                }}
              />
            </div>

            {/* Touch / Quick Controls Bar */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
                marginTop: "12px",
              }}
            >
              <span style={{ fontSize: "0.8rem", color: isGameOver ? "#fbbf24" : "#cbd5e1", fontWeight: 700 }}>
                {statusText}
              </span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {activeGame === "skyscraper" ? (
                  <button
                    type="button"
                    onClick={() => actionTriggerRef.current()}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 18px",
                      borderRadius: "10px",
                      border: "none",
                      background: "#c8f560",
                      color: "#090d16",
                      fontWeight: 900,
                      fontSize: "0.84rem",
                      cursor: "pointer",
                    }}
                  >
                    <Play size={14} /> KAT BIRAK (SPACE)
                  </button>
                ) : (
                  <>
                    {(["left", "up", "down", "right"] as const).map((dir) => (
                      <button
                        key={dir}
                        type="button"
                        onClick={() => dirTriggerRef.current(dir)}
                        style={{
                          padding: "7px 13px",
                          borderRadius: "10px",
                          border: "1px solid rgba(148,163,184,0.3)",
                          background: "#1e293b",
                          color: "#ffffff",
                          fontWeight: 800,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                        }}
                      >
                        {dir === "left" ? "← Sol" : dir === "right" ? "Sağ →" : dir === "up" ? "↑ Yukarı" : "↓ Aşağı"}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Live Cross-Platform Leaderboard */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              background: "rgba(15, 23, 42, 0.75)",
              borderRadius: "18px",
              padding: "18px",
              border: "1px solid rgba(148, 163, 184, 0.18)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontWeight: 900, fontSize: "0.95rem", color: "#ffffff" }}>
                  <Trophy size={16} style={{ color: "#fbbf24" }} /> Canlı Arena Sıralaması
                </span>
                <span style={{ fontSize: "0.72rem", color: "#c8f560", fontWeight: 800 }}>● EŞ ZAMANLI</span>
              </div>
              <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: "14px", lineHeight: 1.45 }}>
                3ds Max, Revit ve SketchUp içinde Circle Render ile render bekleyen mimarlar ve <strong>uretir.com</strong> oyuncuları aynı tabloda yarışır.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {currentBoard.map((item, idx) => {
                  const hostStyle = HOST_COLORS[item.host] || HOST_COLORS.Web;
                  return (
                    <div
                      key={`${item.name}-${idx}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "9px 12px",
                        borderRadius: "12px",
                        background: idx === 0 ? "rgba(251, 191, 36, 0.12)" : "rgba(30, 41, 59, 0.65)",
                        border: idx === 0 ? "1px solid rgba(251, 191, 36, 0.35)" : "1px solid rgba(148, 163, 184, 0.12)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                        <span
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "999px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.74rem",
                            fontWeight: 900,
                            background: idx === 0 ? "#fbbf24" : "#334155",
                            color: idx === 0 ? "#090d16" : "#e2e8f0",
                          }}
                        >
                          {idx + 1}
                        </span>
                        <span
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: 800,
                            color: "#f8fafc",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.name}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                        <span
                          style={{
                            fontSize: "0.66rem",
                            fontWeight: 800,
                            padding: "2px 7px",
                            borderRadius: "999px",
                            background: hostStyle.bg,
                            color: hostStyle.fg,
                          }}
                        >
                          {hostStyle.label}
                        </span>
                        <span style={{ fontSize: "0.88rem", fontWeight: 900, color: "#c8f560" }}>{item.score}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                borderRadius: "12px",
                background: "rgba(200, 245, 96, 0.08)",
                border: "1px solid rgba(200, 245, 96, 0.2)",
                fontSize: "0.76rem",
                color: "#cbd5e1",
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: "#c8f560", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Zap size={13} /> Cross-Host Köprüsü Aktif:
              </strong>{" "}
              Oyun bittiğinde skorun otomatik olarak canlı liderlik tablosuna kaydedilir.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
