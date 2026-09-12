"use client";

import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import { cities, type City, type MakerRegistry, type Product } from "@/lib/marketplace";
import styles from "./marketplace.module.css";

export function ProductMap({ products, makers, city, onCity, english = false }: { products: Product[]; makers: MakerRegistry; city: string; onCity: (city: string) => void; english?: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const layer = useRef<Leaflet.LayerGroup | null>(null);
  const leaflet = useRef<typeof Leaflet | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !container.current) return;
      leaflet.current = L;
      const instance = L.map(container.current, { scrollWheelZoom: false }).setView([39.2, 34.5], 6);
      map.current = instance;
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).on("tileerror", () => setError(true)).addTo(instance);
      layer.current = L.layerGroup().addTo(instance);
      setReady(true);
      // Recalculate after mobile layout and browser address-bar settling.
      requestAnimationFrame(() => instance.invalidateSize({ animate: false }));
      window.setTimeout(() => instance.invalidateSize({ animate: false }), 250);
      const observer = new ResizeObserver(() => instance.invalidateSize());
      observer.observe(container.current);
      instance.on("unload", () => observer.disconnect());
    }).catch(() => setError(true));
    return () => { cancelled = true; map.current?.remove(); map.current = null; };
  }, []);
  useEffect(() => {
    const L = leaflet.current;
    if (!ready || !L || !layer.current) return;
    layer.current.clearLayers();
    Object.entries(cities).forEach(([name, coordinates]) => {
      const count = products.filter((p) => makers[p.maker].city === name).length;
      if (!count) return;
      L.marker([...coordinates], {
        icon: L.divIcon({ className: styles.mapMarker, html: '<span>' + count + '</span>', iconSize: [42, 42], iconAnchor: [21, 21] }),
        title: name + ": " + count + (english ? " products — explore" : " ürün — keşfet"),
        alt: name + ": " + count + (english ? " products — explore" : " ürün — keşfet"),
      }).bindTooltip(name + " · " + count + (english ? " products" : " ürün"), { direction: "top" }).on("click", () => onCity(name)).addTo(layer.current!);
    });
  }, [products, makers, ready, onCity, english]);
  useEffect(() => {
    if (!ready) return;
    const center = cities[city as City];
    map.current?.setView(center ? [...center] : [39.2, 34.5], center ? 9 : 6, { animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches });
  }, [city, ready]);
  return <div className={styles.mapWrap}>
    <div ref={container} className={styles.mapCanvas} aria-label={english ? "Product map of Türkiye" : "Türkiye merkezli ürün haritası"} />
    <button className={styles.recenter} onClick={() => { onCity("Tümü"); map.current?.setView([39.2, 34.5], 6); }}>{english ? "↗ Back to Türkiye" : "↗ Türkiye’ye dön"}</button>
    {error && <p className={styles.mapError} role="status">{english ? "Map tiles could not load. You can still use the city filters and product list." : "Harita altlığı yüklenemedi. Şehir filtrelerini ve ürün listesini kullanabilirsin."}</p>}
    <p className={styles.mapNote}>{english ? "Markers indicate city centers, not office addresses. Counts reflect the active filters." : "İşaretler şehir merkezidir; ofis adresi değildir. Sayılar filtreye uyan ürünleri gösterir."}</p>
  </div>;
}
