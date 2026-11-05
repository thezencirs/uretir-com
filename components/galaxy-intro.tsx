"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { galaxyPlanets } from "./galaxy/galaxy-data";
import type { GalaxyScene, PlanetScreen } from "./galaxy/galaxy-scene";
import "./galaxy/galaxy-intro.css";

const WHEEL_RANGE = 1600;

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
  const renderedRef = useRef(0);
  const reducedRef = useRef(false);
  const activeRef = useRef<string | null>(null);
  const travelingRef = useRef(false);
  const dragRef = useRef<{ active: boolean; x: number; y: number; moved: number }>({
    active: false,
    x: 0,
    y: 0,
    moved: 0,
  });

  const [mode, setMode] = useState<Mode>("loading");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [traveling, setTraveling] = useState(false);

  const activeId = hoverId ?? focusId ?? selectedId;
  const activePlanet = galaxyPlanets.find((planet) => planet.id === activeId) ?? null;
  activeRef.current = activeId;

  const setProgress = useCallback((next: number) => {
    targetRef.current = next;
    sceneRef.current?.setTarget(next);
  }, []);

  const travel = useCallback((id: string) => {
    if (travelingRef.current) return;
    const planet = galaxyPlanets.find((item) => item.id === id);
    if (!planet) return;
    travelingRef.current = true;
    setTraveling(true);
    const go = () => router.push(planet.href);
    const scene = sceneRef.current;
    if (!scene || reducedRef.current) { go(); return; }
    scene.travelTo(id, go);
  }, [router]);

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
    targetRef.current = 0;

    function updateFrame(info: { progress: number; planets: PlanetScreen[] }) {
      renderedRef.current = info.progress;
      if (root!.dataset.stage !== "orbit") root!.dataset.stage = "orbit";
      if (fillRef.current) {
        const cycle = ((info.progress % 1) + 1) % 1;
        fillRef.current.style.transform = `scaleY(${cycle.toFixed(4)})`;
      }
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
        scene.snapTo(0);
        setMode("webgl");

        const resizeObserver = new ResizeObserver(() => scene.resize());
        resizeObserver.observe(root);
        let inView = true;
        const syncActive = () => scene.setActive(inView && !document.hidden);
        const intersection = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncActive(); }, { threshold: 0 });
        intersection.observe(root);
        document.addEventListener("visibilitychange", syncActive);

        const interactive = (node: EventTarget | null) =>
          node instanceof HTMLElement && Boolean(node.closest("a,button,input,textarea,select,details,[contenteditable='true']"));

        const onWheel = (event: WheelEvent) => {
          if (event.ctrlKey) return;
          if (event.target instanceof HTMLElement && event.target.closest(".site-header")) return;
          event.preventDefault();
          const raw = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
          const delta = event.deltaMode === 1 ? raw * 16 : raw;
          if (delta === 0) return;
          setProgress(targetRef.current + delta / WHEEL_RANGE);
        };

        const onKey = (event: KeyboardEvent) => {
          if (event.altKey || event.ctrlKey || event.metaKey || interactive(event.target)) return;
          const step =
            event.key === "ArrowDown" || event.key === "ArrowRight"
              ? 0.08
              : event.key === "PageDown" || event.key === " "
                ? 0.22
                : event.key === "ArrowUp" || event.key === "ArrowLeft"
                  ? -0.08
                  : event.key === "PageUp"
                    ? -0.22
                    : 0;
          if (step !== 0) {
            event.preventDefault();
            setProgress(targetRef.current + step);
          }
        };

        let touchX = 0;
        let touchY = 0;
        const onTouchStart = (event: TouchEvent) => {
          touchX = event.touches[0]?.clientX ?? 0;
          touchY = event.touches[0]?.clientY ?? 0;
        };
        const onTouchMove = (event: TouchEvent) => {
          if (event.target instanceof HTMLElement && event.target.closest(".site-header,.mobile-app-nav")) return;
          event.preventDefault();
          const x = event.touches[0]?.clientX ?? touchX;
          const y = event.touches[0]?.clientY ?? touchY;
          const dx = touchX - x;
          const dy = touchY - y;
          touchX = x;
          touchY = y;
          const primary = Math.abs(dy) >= Math.abs(dx) ? dy : dx;
          setProgress(targetRef.current + primary / (window.innerHeight * 0.95));
        };

        const onScroll = () => {
          if (window.scrollY !== 0) window.scrollTo(0, 0);
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
        };
      } catch {
        if (cancelled) return;
        root.dataset.stage = "orbit";
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

  function handleCanvasPointerDown(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse" && event.button === 0) {
      dragRef.current = { active: true, x: event.clientX, y: event.clientY, moved: 0 };
    }
    pointerToScene(event, true);
  }

  function handleCanvasPointerMove(event: React.PointerEvent<HTMLElement>) {
    pointerToScene(event, true);
    if (dragRef.current.active && event.pointerType === "mouse") {
      const dx = event.clientX - dragRef.current.x;
      const dy = event.clientY - dragRef.current.y;
      dragRef.current.x = event.clientX;
      dragRef.current.y = event.clientY;
      dragRef.current.moved += Math.hypot(dx, dy);
      if (dragRef.current.moved > 4) {
        setProgress(targetRef.current - dx / 900 + dy / 1100);
      }
    }
  }

  function handleCanvasPointerUp(event: React.PointerEvent<HTMLElement>) {
    const wasDragging = dragRef.current.active && dragRef.current.moved > 6;
    dragRef.current.active = false;
    dragRef.current.moved = 0;
    if (wasDragging) return;
    const scene = sceneRef.current;
    if (!scene || traveling) return;
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

  return <section
    ref={rootRef}
    className="galaxy-intro galaxy-intro--fullscreen"
    data-mode={mode}
    data-stage="orbit"
    data-hover={hoverId ? "1" : "0"}
    data-traveling={traveling ? "1" : "0"}
    aria-label="Üretir evreni: tüm araçlara giden gezegenler"
  >
    <canvas
      ref={canvasRef}
      className="galaxy-intro__canvas"
      aria-hidden="true"
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerLeave={(event) => {
        dragRef.current.active = false;
        pointerToScene(event, false);
        setHoverId(null);
      }}
      onPointerUp={handleCanvasPointerUp}
    />
    <div className="galaxy-intro__vignette" aria-hidden="true" />

    <div className="galaxy-copy galaxy-copy--orbit">
      <p className="galaxy-eyebrow">ÜRETİR EVRENİ · 8 YAPAY ZEKÂ ARACI</p>
      <p className="galaxy-title"><span className="galaxy-pointer-only">Tekerleği çevir</span><span className="galaxy-touch-only">Parmağınla kaydır</span>, gezegenler dönsün.</p>
      <p className="galaxy-sub">Her gezegen çalışan bir aracımız. Üzerine gel, tıkla, keşfet.</p>
    </div>

    <div className="galaxy-scroll-hint galaxy-scroll-hint--orbit" aria-hidden="true">
      <span className="galaxy-mouse"><i /></span>
      <span className="galaxy-pointer-only">Tekerleği çevir · Yörüngeyi döndür</span>
      <span className="galaxy-touch-only">Kaydır · Yörüngeyi döndür</span>
    </div>

    <div className="galaxy-dock" aria-label="Hızlı gezegen seçimi">
      {galaxyPlanets.map((planet) => (
        <Link
          key={`dock-${planet.id}`}
          href={planet.href}
          prefetch={false}
          className="galaxy-dock__pill"
          data-active={activeId === planet.id ? "1" : "0"}
          onClick={(event) => handleLabelClick(event, planet.id)}
          onPointerEnter={() => { sceneRef.current?.setHover(planet.id); setFocusId(planet.id); }}
          onPointerLeave={() => { sceneRef.current?.setHover(null); setFocusId(null); }}
          onFocus={() => { sceneRef.current?.setHover(planet.id); setFocusId(planet.id); }}
          onBlur={() => { sceneRef.current?.setHover(null); setFocusId(null); }}
        >
          <span className="galaxy-dock__dot" style={{ backgroundColor: planet.atmosphere }} aria-hidden="true" />
          <span>{planet.title}</span>
        </Link>
      ))}
    </div>

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
