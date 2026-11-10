"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { galaxyPlanets } from "./galaxy/galaxy-data";
import type { GalaxyScene, PlanetScreen } from "./galaxy/galaxy-scene";
import "./galaxy/galaxy-intro.css";

const WHEEL_RANGE = 1800;

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
        const rightSpace = bounds.width - (active.x + active.r + 24);
        const cx = rightSpace >= cardWidth + 16
          ? active.x + active.r + 20
          : Math.max(16, active.x - active.r - cardWidth - 20);
        const cy = Math.min(bounds.height - cardHeight - 20, Math.max(76, active.y - cardHeight * 0.5));
        card.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
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
            const planet = galaxyPlanets.find((item) => item.id === id);
            if (planet) router.prefetch(planet.href);
          },
        });
        sceneRef.current = scene;
        scene.snapTo(0);
        setMode("webgl");

        const resizeObserver = new ResizeObserver(() => scene.resize());
        resizeObserver.observe(root);

        let visible = true;
        const syncActive = () => scene.setActive(visible && !document.hidden);
        const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncActive(); }, { threshold: 0.05 });
        intersection.observe(root);
        document.addEventListener("visibilitychange", syncActive);

        const interactive = (node: EventTarget | null) =>
          node instanceof HTMLElement && Boolean(node.closest("a,button,input,textarea,select,[contenteditable='true']"));

        const onKey = (event: KeyboardEvent) => {
          if (event.altKey || event.ctrlKey || event.metaKey || interactive(event.target)) return;
          const right = event.key === "ArrowRight" ? 0.1 : 0;
          const left = event.key === "ArrowLeft" ? 0.1 : 0;
          if (right) { event.preventDefault(); setProgress(targetRef.current + right); }
          else if (left) { event.preventDefault(); setProgress(targetRef.current - left); }
        };

        // Gentle autonomous orbit when user isn't hovering a planet
        const autoTimer = !reduced
          ? window.setInterval(() => {
              if (visible && !document.hidden && !activeRef.current && !travelingRef.current) {
                setProgress(targetRef.current + 0.0035);
              }
            }, 90)
          : null;

        let touchX = 0;
        let touchActive = false;
        const onTouchStart = (event: TouchEvent) => {
          if (event.touches.length !== 1) return;
          touchX = event.touches[0].clientX;
          touchActive = true;
        };
        const onTouchMove = (event: TouchEvent) => {
          if (!touchActive || event.touches.length !== 1) return;
          const x = event.touches[0].clientX;
          const dx = touchX - x;
          if (Math.abs(dx) > 6) {
            touchX = x;
            setProgress(targetRef.current + dx / (WHEEL_RANGE * 0.45));
          }
        };
        const onTouchEnd = () => { touchActive = false; };

        window.addEventListener("keydown", onKey, { passive: false });
        root.addEventListener("touchstart", onTouchStart, { passive: true });
        root.addEventListener("touchmove", onTouchMove, { passive: true });
        root.addEventListener("touchend", onTouchEnd, { passive: true });

        cleanup = () => {
          if (autoTimer) window.clearInterval(autoTimer);
          window.removeEventListener("keydown", onKey);
          root.removeEventListener("touchstart", onTouchStart);
          root.removeEventListener("touchmove", onTouchMove);
          root.removeEventListener("touchend", onTouchEnd);
          document.removeEventListener("visibilitychange", syncActive);
          resizeObserver.disconnect();
          intersection.disconnect();
          scene.dispose();
          sceneRef.current = null;
        };
      } catch {
        if (cancelled) return;
        targetRef.current = 1;
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

  function handleCanvasPointerUp(event: React.PointerEvent<HTMLElement>) {
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
    className="galaxy-intro"
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
      onPointerMove={(event) => pointerToScene(event, true)}
      onPointerLeave={(event) => { pointerToScene(event, false); setHoverId(null); }}
      onPointerUp={handleCanvasPointerUp}
    />
    <div className="galaxy-intro__vignette" aria-hidden="true" />

    <div className="galaxy-copy galaxy-copy--orbit">
      <p className="galaxy-eyebrow">ÜRETİR EVRENİ · 8 YAPAY ZEKÂ ARACI</p>
      <p className="galaxy-title">İşimiz dünyayı döndürmek.</p>
      <p className="galaxy-sub">Gezegenlere tıkla veya aşağı kaydırarak canlı hesaplama merkezini kullan.</p>
    </div>

    <div className="galaxy-controls">
      <button
        type="button"
        onClick={() => setProgress(targetRef.current - 0.14)}
        className="galaxy-orbit-btn"
        aria-label="Gezegenleri sola döndür"
      >
        <ChevronLeft size={15} /> Önceki Gezegen
      </button>
      <a href="#canli-merkez" className="galaxy-jump-btn">
        Canlı Hesaplama &amp; Kampanya Merkezi <ArrowDown size={14} />
      </a>
      <button
        type="button"
        onClick={() => setProgress(targetRef.current + 0.14)}
        className="galaxy-orbit-btn"
        aria-label="Gezegenleri sağa döndür"
      >
        Sonraki Gezegen <ChevronRight size={15} />
      </button>
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
