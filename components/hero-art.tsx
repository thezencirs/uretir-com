"use client";

import type { CSSProperties, FocusEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Radio, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

type PlanetId = "puan-ai" | "ai" | "technology" | "atlas" | "articles" | "tools";
type Planet = {
  id: PlanetId;
  title: string;
  label: string;
  description: string;
  stat: number;
  statLabel: string;
  updated: string;
  href: string;
  color: string;
  side: "top" | "bottom";
};

const planets: Planet[] = [
  { id: "puan-ai", title: "PuanAI", label: "Kampanyalar / Avantajlar", description: "Kartlarını ve fırsatlarını daha akıllı keşfet.", stat: 24, statLabel: "aktif kampanya", updated: "2 dk önce", href: "/puan-ai", color: "blue", side: "top" },
  { id: "ai", title: "Yapay Zeka", label: "AI Araçları / Asistanlar", description: "Fikri hızlandıran yeni nesil araçlar.", stat: 6, statLabel: "araç geliştiriliyor", updated: "5 dk önce", href: "/araclar", color: "violet", side: "bottom" },
  { id: "technology", title: "Teknoloji", label: "Haberler / Analizler", description: "Yarını şekillendiren sistemlere yakından bak.", stat: 12, statLabel: "yeni analiz", updated: "18 dk önce", href: "/kategori/teknoloji", color: "cyan", side: "top" },
  { id: "atlas", title: "Üretim Atlası", label: "Şirketler / Sektörler", description: "Türkiye'nin üreten haritasını keşfet.", stat: 6, statLabel: "şirket profili", updated: "1 sa önce", href: "/ne-uretir", color: "orange", side: "bottom" },
  { id: "articles", title: "Makale Evreni", label: "İçerikler / Rehberler", description: "İyi soruların peşinde derinleş.", stat: 6, statLabel: "yayınlanmış yazı", updated: "Bugün", href: "/blog", color: "green", side: "top" },
  { id: "tools", title: "Araçlar", label: "Hesaplayıcılar / Uygulamalar", description: "Üretirken işine yarayacak küçük güçler.", stat: 4, statLabel: "modül", updated: "Bugün", href: "/araclar", color: "white", side: "bottom" },
];

const rings = [
  { className: "orbit-track--near", duration: 46, planets: [planets[0], planets[1]] },
  { className: "orbit-track--mid", duration: 62, planets: [planets[2], planets[3]] },
  { className: "orbit-track--far", duration: 82, planets: [planets[4], planets[5]] },
];

function statFor(planet: Planet, heartbeat: number) {
  const shouldPulse = heartbeat > 0 && heartbeat % 3 === planets.indexOf(planet) % 3;
  return shouldPulse ? planet.stat + 1 : planet.stat;
}

export function HeroArt() {
  const router = useRouter();
  const universeRef = useRef<HTMLDivElement>(null);
  const travelTimeout = useRef<number | null>(null);
  const [activePlanet, setActivePlanet] = useState<PlanetId | null>(null);
  const [travelingPlanet, setTravelingPlanet] = useState<PlanetId | null>(null);
  const [awake, setAwake] = useState(false);
  const [heartbeat, setHeartbeat] = useState(0);
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowDevice = (navigator.hardwareConcurrency || 8) <= 4;
    setLowPower(reducedMotion || lowDevice);

    const interval = window.setInterval(() => setHeartbeat((current) => current + 1), 12000);
    return () => {
      window.clearInterval(interval);
      if (travelTimeout.current) window.clearTimeout(travelTimeout.current);
    };
  }, []);

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

  return <section
    ref={universeRef}
    className={`hero-universe noise${lowPower ? " hero-universe--low-power" : ""}${travelingPlanet ? " hero-universe--traveling" : ""}`}
    data-awake={awake}
    aria-label="Üretir ekosistem haritası"
    onPointerEnter={() => setAwake(true)}
    onPointerLeave={() => {
      if (!travelingPlanet) {
        setAwake(false);
        setActivePlanet(null);
      }
    }}
    onFocusCapture={() => setAwake(true)}
    onBlurCapture={handleBlur}
  >
    <div className="universe-stars" aria-hidden="true" />
    <div className="universe-grid" aria-hidden="true" />
    <div className="universe-signal universe-signal--top" aria-hidden="true"><span>ÜRETİR / 001</span><span>İSTANBUL — 2026</span></div>
    <div className="universe-signal universe-signal--bottom" aria-hidden="true"><span><i /> SİSTEM AKTİF</span><span>06 MODÜL / 01 ÇEKİRDEK</span></div>

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
            onClick={() => travelTo(planet)}
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

    <div className="universe-caption" aria-hidden="true"><span>YAKLAŞ / KEŞFET / ÜRET</span><span>SCROLL TO EXPLORE ↓</span></div>

    {selectedPlanet && <aside id={`planet-card-${selectedPlanet.id}`} className="universe-card" aria-live="polite">
      <div className="universe-card__topline"><span className={`universe-card__dot universe-card__dot--${selectedPlanet.color}`} /><span>{selectedPlanet.label}</span><span className="universe-card__index">0{planets.indexOf(selectedPlanet) + 1}</span></div>
      <h2>{selectedPlanet.title}</h2>
      <p>{selectedPlanet.description}</p>
      <div className="universe-card__meta">
        <div><strong>{statFor(selectedPlanet, heartbeat)}</strong><span>{selectedPlanet.statLabel}</span></div>
        <div><strong className="universe-card__live"><i /> Canlı</strong><span>Güncelleme: {selectedPlanet.updated}</span></div>
      </div>
      <button type="button" className="universe-card__cta" onClick={() => travelTo(selectedPlanet)} disabled={Boolean(travelingPlanet)}>{travelingPlanet === selectedPlanet.id ? "Seyahat başlıyor" : "Gezegene Git"}<ArrowUpRight size={15} /></button>
    </aside>}

    <div className="universe-status" aria-hidden="true"><Radio size={12} /><span>EVRENİ DİNLE</span><Sparkles size={12} /></div>
  </section>;
}
