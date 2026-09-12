"use client";

import type { CSSProperties, FocusEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Pause, Play, X } from "lucide-react";
import { useRouter } from "next/navigation";

type PlanetId = "puan-ai" | "haber-ai" | "ai" | "technology" | "atlas" | "articles" | "tools";
type Planet = {
  id: PlanetId;
  title: string;
  label: string;
  description: string;
  stat: string;
  statLabel: string;
  updated: string;
  href: string;
  color: string;
  side: "top" | "bottom";
};

const planets: Planet[] = [
  { id: "haber-ai", title: "HaberAI", label: "Türkiye / Günlük gelişmeler", description: "Şehir şehir Türkiye gündemini harita üzerinden izle.", stat: "81", statLabel: "şehir", updated: "Günlük kaynak akışı", href: "/haber-ai", color: "green", side: "bottom" },
  { id: "puan-ai", title: "PuanAI", label: "Kampanyalar / Avantajlar", description: "Doğrulanmış kampanyaları alışverişine göre karşılaştır.", stat: "Canlı", statLabel: "kural motoru", updated: "Resmî kaynak zorunlu", href: "/puan-ai", color: "blue", side: "top" },
  { id: "ai", title: "Yapay Zeka", label: "AI Araçları / Asistanlar", description: "Fikri hızlandıran yeni nesil araçlar.", stat: "06", statLabel: "planlanan araç", updated: "Yol haritası", href: "/araclar", color: "violet", side: "bottom" },
  { id: "technology", title: "Teknoloji", label: "Araçlar / Bilgi merkezleri", description: "Yarını şekillendiren sistemlerin araştırma merkezlerini keşfet.", stat: "İnceleme", statLabel: "içerik durumu", updated: "Kaynak kontrolü bekliyor", href: "/araclar", color: "cyan", side: "top" },
  { id: "atlas", title: "Üretim Atlası", label: "Şirketler / Sektörler", description: "Türkiye'nin üreten haritasını keşfet.", stat: "İnceleme", statLabel: "profil durumu", updated: "Kaynak kontrolü bekliyor", href: "/ne-uretir", color: "orange", side: "bottom" },
  { id: "articles", title: "Makale Evreni", label: "İçerikler / Rehberler", description: "İyi soruların peşinde derinleş.", stat: "İnceleme", statLabel: "içerik durumu", updated: "Kaynak kontrolü bekliyor", href: "/blog", color: "green", side: "top" },
  { id: "tools", title: "Araçlar", label: "Hesaplayıcılar / Uygulamalar", description: "Üretirken işine yarayacak küçük güçler.", stat: "06", statLabel: "planlanan araç", updated: "Yol haritası", href: "/araclar", color: "white", side: "bottom" },
];

const rings = [
  { className: "orbit-track--near", duration: 46, planets: [planets[0], planets[1]] },
  { className: "orbit-track--mid", duration: 62, planets: [planets[2], planets[3]] },
  { className: "orbit-track--far", duration: 82, planets: [planets[4], planets[5]] },
];

export function HeroArt() {
  const router = useRouter();
  const universeRef = useRef<HTMLDivElement>(null);
  const travelTimeout = useRef<number | null>(null);
  const [activePlanet, setActivePlanet] = useState<PlanetId | null>(null);
  const [travelingPlanet, setTravelingPlanet] = useState<PlanetId | null>(null);
  const [awake, setAwake] = useState(false);
  const [lowPower, setLowPower] = useState(false);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lowDevice = (navigator.hardwareConcurrency || 8) <= 4;
    const syncMotion = () => setLowPower(motionPreference.matches || lowDevice);
    syncMotion();
    motionPreference.addEventListener("change", syncMotion);

    return () => {
      if (travelTimeout.current) window.clearTimeout(travelTimeout.current);
      motionPreference.removeEventListener("change", syncMotion);
    };
  }, []);

  useEffect(() => {
    const surface = universeRef.current;
    if (!surface) return;
    let visible = true;
    const syncVisibility = () => setInView(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncVisibility();
    }, { threshold: 0.05 });
    observer.observe(surface);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  useEffect(() => {
    const surface = universeRef.current;
    if (!surface) return;
    if (lowPower || paused || !inView) {
      surface.style.setProperty("--scene-x", "0px");
      surface.style.setProperty("--scene-y", "0px");
      surface.style.setProperty("--scene-scroll", "0px");
      return;
    }
    let frame = 0;
    let x = 0, y = 0, targetX = 0, targetY = 0, scroll = 0;
    const render = () => {
      x += (targetX - x) * 0.07;
      y += (targetY - y) * 0.07;
      const targetScroll = Math.min(100, Math.max(0, -surface.getBoundingClientRect().top) * 0.16);
      scroll += (targetScroll - scroll) * 0.07;
      surface.style.setProperty("--scene-x", `${x.toFixed(2)}px`);
      surface.style.setProperty("--scene-y", `${y.toFixed(2)}px`);
      surface.style.setProperty("--scene-scroll", `${scroll.toFixed(2)}px`);
      if (Math.abs(targetX - x) + Math.abs(targetY - y) + Math.abs(targetScroll - scroll) > 0.1) frame = requestAnimationFrame(render);
      else frame = 0;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = surface.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 26;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 26;
      schedule();
    };
    const reset = () => { targetX = 0; targetY = 0; schedule(); };
    surface.addEventListener("pointermove", move);
    surface.addEventListener("pointerleave", reset);
    window.addEventListener("scroll", schedule, { passive: true });
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerleave", reset);
      window.removeEventListener("scroll", schedule);
    };
  }, [lowPower, paused, inView]);

  function wakePlanet(planet: Planet) {
    setAwake(true);
    setActivePlanet(planet.id);
    router.prefetch(planet.href);
  }

  function travelTo(planet: Planet) {
    if (travelingPlanet) return;
    setAwake(true);
    setActivePlanet(planet.id);
    if (lowPower) {
      router.push(planet.href);
      return;
    }
    setTravelingPlanet(planet.id);
    travelTimeout.current = window.setTimeout(() => router.push(planet.href), 700);
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!universeRef.current?.contains(event.relatedTarget as Node | null)) {
      setActivePlanet(null);
      setAwake(false);
    }
  }

  const selectedPlanet = planets.find((planet) => planet.id === activePlanet);

  useEffect(() => {
    if (!activePlanet || !window.matchMedia("(max-width: 760px)").matches) return;
    universeRef.current?.querySelector(".universe-card")?.scrollIntoView({ block: "center", behavior: lowPower ? "instant" : "smooth" });
  }, [activePlanet, lowPower]);

  return <section
    ref={universeRef}
    className={`hero-universe hero-universe--immersive noise${lowPower ? " hero-universe--low-power" : ""}${travelingPlanet ? " hero-universe--traveling" : ""}`}
    data-awake={awake}
    data-still={paused || lowPower || !inView}
    data-selected={Boolean(activePlanet)}
    aria-label="Üretir ekosistem haritası"
    onPointerEnter={() => setAwake(true)}
    onPointerLeave={() => { if (!travelingPlanet) setAwake(false); }}
    onKeyDown={(event) => { if (event.key === "Escape") { setActivePlanet(null); setAwake(false); } }}
    onFocusCapture={() => setAwake(true)}
    onBlurCapture={handleBlur}
  >
    <div className="universe-stars" aria-hidden="true" />
    <div className="universe-grid" aria-hidden="true" />
    <div className="universe-signal universe-signal--top" aria-hidden="true"><span>ÜRETİR EVRENİ</span><span>01 — 06</span></div>
    <div className="universe-atmosphere" aria-hidden="true"><span /><span /><span /></div>

    <div className="universe-stage">
      {rings.map((ring) => <div key={ring.className} className={`orbit-track ${ring.className}`} style={{ "--orbit-duration": `${ring.duration}s` } as CSSProperties}>
        {ring.planets.map((planet) => <div key={planet.id} className={`planet-node planet-node--${planet.side}`}>
          <button
            type="button"
            className={`planet-button planet-button--${planet.color}${travelingPlanet === planet.id ? " planet-button--traveling" : ""}`}
            aria-label={`${planet.title}: ${planet.description}`}
            aria-describedby={activePlanet === planet.id ? `planet-card-${planet.id}` : undefined}
            aria-expanded={activePlanet === planet.id}
            disabled={Boolean(travelingPlanet)}
            onPointerEnter={() => wakePlanet(planet)}
            onFocus={() => wakePlanet(planet)}
            onClick={() => wakePlanet(planet)}
          >
            <span className="planet-face" aria-hidden="true"><span className="planet-detail" /></span>
          </button>
        </div>)}
      </div>)}

      <div className="universe-sun" aria-hidden="true">
        <span className="universe-sun__halo" />
        <span className="universe-sun__core">ü.</span>
        <span className="universe-sun__label">BİLGİ<br />ÇEKİRDEĞİ</span>
      </div>
    </div>

    <div className="universe-destinations" aria-label="Keşif alanları">
      {planets.map((planet, index) => <button key={planet.id} type="button" className={`universe-destination universe-destination--${index + 1}`} aria-pressed={activePlanet === planet.id} onClick={() => wakePlanet(planet)} onFocus={() => wakePlanet(planet)}>
        <span className={`universe-card__dot universe-card__dot--${planet.color}`} aria-hidden="true" />
        <span>{planet.title}</span><ArrowUpRight size={13} aria-hidden="true" />
      </button>)}
    </div>
    <div className="universe-toolbar"><span>Bir dünyaya dokun, keşfet.</span><button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused} aria-label={paused ? "Hareketi oynat" : "Hareketi durdur"} disabled={lowPower}>{paused || lowPower ? <Play size={14} /> : <Pause size={14} />}<span>{lowPower ? "Sakin görünüm" : paused ? "Oynat" : "Durdur"}</span></button></div>

    {selectedPlanet && <aside id={`planet-card-${selectedPlanet.id}`} className="universe-card" aria-live="polite">
      <button type="button" className="universe-card__close" aria-label="Gezegen bilgisini kapat" onClick={() => { setActivePlanet(null); setAwake(false); }}><X size={16} /></button>
      <div className="universe-card__topline"><span className={`universe-card__dot universe-card__dot--${selectedPlanet.color}`} /><span>{selectedPlanet.label}</span><span className="universe-card__index">0{planets.indexOf(selectedPlanet) + 1}</span></div>
      <h2>{selectedPlanet.title}</h2>
      <p>{selectedPlanet.description}</p>
      <div className="universe-card__meta">
        <div><strong>{selectedPlanet.stat}</strong><span>{selectedPlanet.statLabel}</span></div>
        <div><strong className="universe-card__live"><i /> Durum</strong><span>{selectedPlanet.updated}</span></div>
      </div>
      <button type="button" className="universe-card__cta" onClick={() => travelTo(selectedPlanet)} disabled={Boolean(travelingPlanet)}>{travelingPlanet === selectedPlanet.id ? "Seyahat başlıyor" : "Gezegene Git"}<ArrowUpRight size={15} /></button>
    </aside>}
  </section>;
}
