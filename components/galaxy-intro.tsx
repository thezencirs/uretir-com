"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUpRight, ChevronsDown } from "lucide-react";
import { galaxyPlanets } from "./galaxy/galaxy-data";
import type { GalaxyScene, PlanetScreen } from "./galaxy/galaxy-scene";
import "./galaxy/galaxy-intro.css";

const SEEN_KEY = "uretir-galaxy-intro-v1";
const WHEEL_RANGE = 1500;

type Mode = "loading" | "webgl" | "fallback";

export function GalaxyIntro() {
  const router = useRouter();
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<GalaxyScene | null>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const screensRef = useRef<Record<string, PlanetScreen>>({});
  const targetRef = useRef(0);
  const lockUntil = useRef(0);
  const lockEnabled = useRef(false);
  const reducedRef = useRef(false);
  const activeRef = useRef<string | null>(null);
  const travelingRef = useRef(false);

  const [mode, setMode] = useState<Mode>("loading");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [traveling, setTraveling] = useState(false);

  const activeId = hoverId ?? focusId ?? selectedId;
  const activePlanet = galaxyPlanets.find((planet) => planet.id === activeId) ?? null;
  activeRef.current = activeId;

  const markSeen = useCallback(() => {
    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* storage unavailable */ }
  }, []);

  const setProgress = useCallback((next: number) => {
    const scene = sceneRef.current;
    const prev = targetRef.current;
    const value = Math.min(1, Math.max(0, next));
    targetRef.current = value;
    scene?.setTarget(value);
    const now = performance.now();
    if (value >= 1 && prev < 1) { lockUntil.current = now + 550; markSeen(); }
    if (value <= 0 && prev > 0) lockUntil.current = now + 300;
  }, [markSeen]);

  const travel = useCallback((id: string) => {
    if (travelingRef.current) return;
    const planet = galaxyPlanets.find((item) => item.id === id);
    if (!planet) return;
    travelingRef.current = true;
    setTraveling(true);
    markSeen();
    const go = () => router.push(planet.href);
    const scene = sceneRef.current;
    if (!scene || reducedRef.current) { go(); return; }
    scene.travelTo(id, go);
  }, [markSeen, router]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    let cancelled = false;
    let cleanup = () => {};

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reducedRef.current = reduced;
    const small = window.innerWidth < 760;
    const lowCore = (navigator.hardwareConcurrency || 8) <= 4;
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN_KEY) === "1"; } catch { /* storage unavailable */ }
    const startDone = reduced || seen || window.location.hash.length > 1;
    targetRef.current = startDone ? 1 : 0;

    function updateFrame(info: { progress: number; planets: PlanetScreen[] }) {
      const stage = info.progress < 0.08 ? "enter" : info.progress < 0.9 ? "fly" : "planets";
      if (root!.dataset.stage !== stage) root!.dataset.stage = stage;
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${info.progress.toFixed(4)})`;
      const bounds = root!.getBoundingClientRect();
      for (const planet of info.planets) {
        screensRef.current[planet.id] = planet;
        const el = labelRefs.current[planet.id];
        if (!el) continue;
        el.style.transform = `translate3d(${planet.x.toFixed(1)}px, ${planet.y.toFixed(1)}px, 0)`;
        el.style.setProperty("--r", `${planet.r.toFixed(1)}px`);
        const show = planet.show ? "1" : "0";
        if (el.dataset.show !== show) { el.dataset.show = show; el.tabIndex = planet.show ? 0 : -1; }
      }
      const card = cardRef.current;
      const active = activeRef.current ? screensRef.current[activeRef.current] : null;
      if (card && active) {
        const cardWidth = card.offsetWidth || 280;
        const cardHeight = card.offsetHeight || 150;
        let x = active.x + active.r + 22;
        if (x + cardWidth > bounds.width - 12) x = active.x - active.r - 22 - cardWidth;
        x = Math.max(12, Math.min(bounds.width - cardWidth - 12, x));
        const y = Math.max(12, Math.min(bounds.height - cardHeight - 12, active.y - cardHeight / 2));
        card.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      }
    }

    (async () => {
      try {
        const mod = await import("./galaxy/galaxy-scene");
        if (cancelled) return;
        const scene = mod.createGalaxyScene({
          canvas,
          planets: galaxyPlanets,
          quality: small || lowCore ? "low" : "high",
          reducedMotion: reduced,
          onFrame: updateFrame,
          onHover: (id) => {
            setHoverId(id);
            if (id) { const planet = galaxyPlanets.find((item) => item.id === id); if (planet) router.prefetch(planet.href); }
          },
        });
        sceneRef.current = scene;
        scene.snapTo(targetRef.current);
        lockEnabled.current = !reduced;
        setMode("webgl");

        const resizeObserver = new ResizeObserver(() => scene.resize());
        resizeObserver.observe(root);
        let inView = true;
        const syncActive = () => scene.setActive(inView && !document.hidden);
        const intersection = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncActive(); }, { threshold: 0 });
        intersection.observe(root);
        document.addEventListener("visibilitychange", syncActive);

        const interactive = (node: EventTarget | null) => node instanceof HTMLElement && Boolean(node.closest("a,button,input,textarea,select,[contenteditable='true']"));
        const atTop = () => window.scrollY <= 1;

        const onWheel = (event: WheelEvent) => {
          if (!lockEnabled.current || event.ctrlKey || !atTop()) return;
          const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
          if (delta === 0) return;
          const now = performance.now();
          const target = targetRef.current;
          if (delta > 0) {
            if (target < 1) { event.preventDefault(); setProgress(target + delta / WHEEL_RANGE); }
            else if (now < lockUntil.current) event.preventDefault();
          } else if (target > 0) {
            event.preventDefault();
            if (now >= lockUntil.current) setProgress(target + delta / WHEEL_RANGE);
          }
        };

        const onKey = (event: KeyboardEvent) => {
          if (!lockEnabled.current || !atTop() || event.altKey || event.ctrlKey || event.metaKey || interactive(event.target)) return;
          const target = targetRef.current;
          const down = event.key === "ArrowDown" ? 0.08 : event.key === "PageDown" || event.key === " " ? 0.25 : event.key === "End" ? 1 : 0;
          const up = event.key === "ArrowUp" ? 0.08 : event.key === "PageUp" ? 0.25 : event.key === "Home" ? 1 : 0;
          if (down && target < 1) { event.preventDefault(); setProgress(target + down); }
          else if (up && target > 0 && target < 1) { event.preventDefault(); setProgress(target - up); }
        };

        let touchY = 0;
        const onTouchStart = (event: TouchEvent) => { touchY = event.touches[0]?.clientY ?? 0; };
        const onTouchMove = (event: TouchEvent) => {
          if (!lockEnabled.current || !atTop()) return;
          const y = event.touches[0]?.clientY ?? touchY;
          const delta = touchY - y;
          touchY = y;
          const target = targetRef.current;
          if ((delta > 0 && target < 1) || (delta < 0 && target > 0 && target < 1)) {
            event.preventDefault();
            setProgress(target + delta / (window.innerHeight * 1.1));
          }
        };

        let lastScrollY = window.scrollY;
        const onScroll = () => {
          if (lockEnabled.current && targetRef.current < 1 && window.scrollY > 1) window.scrollTo(0, 0);
          if (lastScrollY > 1 && window.scrollY <= 1) lockUntil.current = performance.now() + 650;
          lastScrollY = window.scrollY;
        };

        window.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("keydown", onKey);
        window.addEventListener("scroll", onScroll, { passive: true });
        root.addEventListener("touchstart", onTouchStart, { passive: true });
        root.addEventListener("touchmove", onTouchMove, { passive: false });

        cleanup = () => {
          window.removeEventListener("wheel", onWheel);
          window.removeEventListener("keydown", onKey);
          window.removeEventListener("scroll", onScroll);
          root.removeEventListener("touchstart", onTouchStart);
          root.removeEventListener("touchmove", onTouchMove);
          document.removeEventListener("visibilitychange", syncActive);
          resizeObserver.disconnect();
          intersection.disconnect();
          scene.dispose();
          sceneRef.current = null;
          lockEnabled.current = false;
        };
      } catch {
        if (cancelled) return;
        targetRef.current = 1;
        root.dataset.stage = "planets";
        setMode("fallback");
      }
    })();

    return () => { cancelled = true; cleanup(); };
  }, [router, setProgress]);

  function pointerToScene(event: React.PointerEvent<HTMLElement>, inside: boolean) {
    const scene = sceneRef.current;
    const canvas = canvasRef.current;
    if (!scene || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    scene.setPointer(((event.clientX - rect.left) / rect.width) * 2 - 1, -(((event.clientY - rect.top) / rect.height) * 2 - 1), inside);
  }

  function handleCanvasPointerUp(event: React.PointerEvent<HTMLElement>) {
    const scene = sceneRef.current;
    if (!scene || traveling || targetRef.current < 1) return;
    pointerToScene(event, true);
    const mouse = event.pointerType === "mouse";
    window.setTimeout(() => {
      const id = scene.pickAt();
      if (!id) { if (!mouse) setSelectedId(null); return; }
      if (mouse || selectedId === id) travel(id);
      else setSelectedId(id);
    }, mouse ? 0 : 48);
  }

  function handleLabelClick(event: ReactMouseEvent<HTMLAnchorElement>, id: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    travel(id);
  }

  const stageHint = mode === "fallback" ? "planets" : undefined;

  return <section
    ref={rootRef}
    className="galaxy-intro"
    data-mode={mode}
    data-stage={stageHint ?? "enter"}
    data-hover={hoverId ? "1" : "0"}
    data-traveling={traveling ? "1" : "0"}
    aria-label="Üretir evreni: tüm araçlara giden gezegenler"
  >
    <canvas
      ref={canvasRef}
      className="galaxy-intro__canvas"
      aria-hidden="true"
      onPointerMove={(event) => pointerToScene(event, true)}
      onPointerLeave={(event) => { pointerToScene(event, false); setHoverId(null); }}
      onPointerUp={handleCanvasPointerUp}
    />
    <div className="galaxy-intro__vignette" aria-hidden="true" />

    <div className="galaxy-copy galaxy-copy--enter">
      <p className="galaxy-eyebrow">ÜRETİR EVRENİ</p>
      <p className="galaxy-title">Bilgi, bir galaksi kadar geniş.</p>
      <p className="galaxy-sub">Kaydır; Samanyolu&apos;ndan çalışan araçlarımızın gezegenlerine yolculuk et.</p>
    </div>
    <div className="galaxy-copy galaxy-copy--fly" aria-hidden="true"><p>Samanyolu&apos;ndan sistemimize yaklaşıyoruz…</p></div>
    <div className="galaxy-copy galaxy-copy--planets"><p className="galaxy-eyebrow">8 GEZEGEN · 8 ARAÇ</p><p className="galaxy-sub">Bir dünyaya dokun, keşfet.</p></div>

    <div className="galaxy-scroll-hint galaxy-scroll-hint--enter" aria-hidden="true"><span className="galaxy-mouse"><i /></span><span>Kaydır</span></div>
    <div className="galaxy-scroll-hint galaxy-scroll-hint--planets" aria-hidden="true"><ChevronsDown size={18} /><span>Siteye devam et</span></div>

    <button type="button" className="galaxy-skip" onClick={() => setProgress(1)}>Atla <ArrowDown size={13} aria-hidden="true" /></button>
    <div className="galaxy-rail" aria-hidden="true"><span ref={fillRef} /></div>

    <nav className="galaxy-labels" aria-label="Üretir araçları">
      {galaxyPlanets.map((planet) => <Link
        key={planet.id}
        href={planet.href}
        prefetch={false}
        ref={(node) => { labelRefs.current[planet.id] = node; }}
        className="galaxy-label"
        data-show={mode === "fallback" ? "1" : "0"}
        tabIndex={mode === "fallback" ? 0 : -1}
        data-active={activeId === planet.id ? "1" : "0"}
        onClick={(event) => handleLabelClick(event, planet.id)}
        onPointerEnter={() => { sceneRef.current?.setHover(planet.id); setFocusId(planet.id); }}
        onPointerLeave={() => { sceneRef.current?.setHover(null); setFocusId(null); }}
        onFocus={() => { sceneRef.current?.setHover(planet.id); setFocusId(planet.id); }}
        onBlur={() => { sceneRef.current?.setHover(null); setFocusId(null); }}
      >
        <span className="galaxy-label__ring" aria-hidden="true" />
        <span className="galaxy-label__text"><strong>{planet.title}</strong><small>{planet.tagline}</small></span>
      </Link>)}
    </nav>

    <div ref={cardRef} className="galaxy-card" data-open={activePlanet ? "1" : "0"} data-touch={selectedId && !hoverId ? "1" : "0"} aria-live="polite">
      {activePlanet && <>
        <span className="galaxy-card__tag">{activePlanet.tagline}</span>
        <strong>{activePlanet.title}</strong>
        <p>{activePlanet.description}</p>
        <Link href={activePlanet.href} className="galaxy-card__cta" onClick={(event) => handleLabelClick(event, activePlanet.id)} tabIndex={selectedId ? 0 : -1}>Gezegene git <ArrowUpRight size={14} aria-hidden="true" /></Link>
      </>}
    </div>
  </section>;
}
