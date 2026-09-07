"use client";

import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import { cities, makers, type City, type Product } from "@/lib/marketplace";
import styles from "./marketplace.module.css";

export function ProductMap({ products, city, onCity }: { products: Product[]; city: string; onCity: (city: string) => void }) {
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
        title: name + ": " + count + " ürün — keşfet",
        alt: name + ": " + count + " ürün — keşfet",
      }).bindTooltip(name + " · " + count + " ürün", { direction: "top" }).on("click", () => onCity(name)).addTo(layer.current!);
    });
  }, [products, ready, onCity]);
  useEffect(() => {
    if (!ready) return;
    const center = cities[city as City];
    map.current?.setView(center ? [...center] : [39.2, 34.5], center ? 9 : 6, { animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches });
  }, [city, ready]);
  return <div className={styles.mapWrap}>
    <div ref={container} className={styles.mapCanvas} aria-label="Türkiye merkezli ürün haritası" />
    <button className={styles.recenter} onClick={() => { onCity("Tümü"); map.current?.setView([39.2, 34.5], 6); }}>↗ Türkiye&apos;ye dön</button>
    {error && <p className={styles.mapError} role="status">Harita altlığı yüklenemedi. Aşağıdaki şehir filtreleri ve ürün listesi kullanılabilir.</p>}
    <p className={styles.mapNote}>İşaretler şehir merkezidir; ofis adresi değildir. Sayılar filtreye uyan ürünleri gösterir.</p>
  </div>;
}
