"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, RefreshCw, Sparkles } from "lucide-react";
import type { LivePulseItem, SectorPulseKey } from "@/lib/live-ai-pulse";

const TABS: Array<{ key: SectorPulseKey; label: string; href: string }> = [
  { key: "yapay-zeka", label: "🤖 Yapay Zeka Gelişmeleri", href: "/haber-ai" },
  { key: "teknoloji-girisim", label: "🚀 Türkiye Teknoloji & Ar-Ge", href: "/gelismeler" },
  { key: "tesvik-ai", label: "🍼 Teşvik & Aile Yardımı", href: "/tesvik-ai" },
  { key: "memur-ai", label: "🎯 KPSS, Memur & Maaş", href: "/memur-ai" },
  { key: "insaat-ai", label: "🏗️ İnşaat & TOKİ", href: "/insaat-ai" },
  { key: "emlak-ai", label: "🏠 Emlak & Kira", href: "/emlak-ai" },
];

export function LiveSectorNews({
  defaultSector = "yapay-zeka",
  showTabs = false,
  title = "Canlı Yapay Zeka & Sektör Gelişmeleri",
  subtitle = "Resmî ajanslar ve teknoloji kaynaklarından saatlik güncellenen doğrulanmış haber akışı.",
  limit = 6,
  sectionId = "canli-yapay-zeka-akisi",
}: {
  defaultSector?: SectorPulseKey;
  showTabs?: boolean;
  title?: string;
  subtitle?: string;
  limit?: number;
  sectionId?: string;
}) {
  const [sector, setSector] = useState<SectorPulseKey>(defaultSector);
  const [items, setItems] = useState<LivePulseItem[]>([]);
  const [checkedAt, setCheckedAt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/sector-pulse?sector=${encodeURIComponent(sector)}&limit=${limit}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("HTTP error");
        const data = await res.json();
        if (active && Array.isArray(data?.items)) {
          setItems(data.items);
          setCheckedAt(data.checkedAt || new Date().toISOString());
        }
      } catch {
        // Keep existing items if network hiccups
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    const timer = setInterval(load, 5 * 60_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [sector, limit]);

  const activeTab = TABS.find((t) => t.key === sector) || TABS[0];

  return (
    <section
      id={sectionId}
      className="rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-[#0d1914] via-[#0b1318] to-[#111522] p-6 md:p-8 shadow-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold tracking-wider text-emerald-300 uppercase">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Canlı Otonom Haber &amp; Duyuru Radarı
          </div>
          <h2 className="mt-2.5 text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>{title}</span>
          </h2>
          <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          {checkedAt && (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
              <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${loading ? "animate-spin" : ""}`} />
              Son kontrol:{" "}
              {new Date(checkedAt).toLocaleTimeString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          <Link
            href={activeTab.href}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 px-3.5 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-500/30 transition"
          >
            Tüm Akış
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {showTabs && (
        <div className="mt-4 flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const isSelected = tab.key === sector;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSector(tab.key)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  isSelected
                    ? "bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
                    : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4 hover:border-emerald-400/40 hover:bg-white/[0.07] transition"
          >
            <div>
              <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-emerald-300">
                <span className="rounded-md bg-emerald-500/15 px-2 py-0.5">{item.badge}</span>
                <span className="text-slate-400 truncate max-w-[150px]">{item.sourceName}</span>
              </div>
              <h3 className="mt-2.5 text-sm font-bold text-white leading-snug line-clamp-3">
                {item.title}
              </h3>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs">
              <span className="text-slate-400">
                {new Date(item.publishedAt).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-emerald-300 hover:text-emerald-200"
              >
                Kaynağa Git
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </article>
        ))}

        {!items.length && (
          <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-sm text-slate-300">
            Canlı yapay zeka ve sektör gelişmeleri yükleniyor...
          </div>
        )}
      </div>
    </section>
  );
}
