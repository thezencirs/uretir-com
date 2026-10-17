"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import mapData from "@/lib/haber-ai/map.json";
import provinces from "@/lib/haber-ai/provinces.json";
import type { Article, Run } from "@/lib/haber-ai/model";
import { newsDay } from "@/lib/haber-ai/dates";
import { whatsappChannel } from "@/lib/haber-ai/bulletin";
import { FinanceStrip } from "./finance-strip";

type Snapshot = { articles: Article[]; run: Run | null; available: boolean };
const dayOf = newsDay;

const REGIONS: { key: string; label: string; codes: string[] }[] = [
  { key: "", label: "Tüm Türkiye (81 İl)", codes: [] },
  {
    key: "marmara",
    label: "Marmara",
    codes: ["10", "11", "16", "17", "22", "34", "39", "41", "54", "59", "77"],
  },
  {
    key: "ege",
    label: "Ege",
    codes: ["03", "09", "20", "35", "43", "45", "48", "64"],
  },
  {
    key: "ic-anadolu",
    label: "İç Anadolu",
    codes: ["06", "18", "26", "38", "40", "42", "50", "51", "58", "66", "68", "70", "71"],
  },
  {
    key: "akdeniz",
    label: "Akdeniz",
    codes: ["01", "07", "15", "31", "32", "33", "46", "80"],
  },
  {
    key: "karadeniz",
    label: "Karadeniz",
    codes: ["05", "08", "14", "19", "28", "29", "37", "52", "53", "55", "57", "60", "61", "67", "69", "74", "78", "81"],
  },
  {
    key: "dogu-anadolu",
    label: "Doğu Anadolu",
    codes: ["04", "12", "13", "23", "24", "25", "30", "36", "44", "49", "62", "65", "75", "76"],
  },
  {
    key: "guneydogu",
    label: "Güneydoğu Anadolu",
    codes: ["02", "21", "27", "47", "56", "63", "72", "73", "79"],
  },
];

const CATEGORIES = ["", "Gündem", "Ekonomi", "Teknoloji", "Eğitim", "Yaşam", "Sağlık", "Teyit"] as const;

function buildHaberCardImage(a: Article) {
  if (a.imageUrl && a.rights?.imageAllowed) return a.imageUrl;
  const cityNames = a.provinceCodes.length
    ? a.provinceCodes
        .map((code) => provinces.find((p) => p.code === code)?.name)
        .filter(Boolean)
        .join(" · ")
    : "Türkiye Geneli";
  const dateStr = new Date(a.publishedAt).toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" });
  const params = new URLSearchParams({
    tool: "haber-ai",
    format: "png",
    title: a.title.slice(0, 85),
    subtitle: `${cityNames} · ${a.source} Doğrulanmış Gündem Kaydı`,
    badge: `HABERAI · ${(a.category || "GÜNDEM").toUpperCase()}`,
    s1l: "Şehir / Bölge",
    s1v: cityNames,
    s2l: "Kaynak & Tarih",
    s2v: `${a.source} · ${dateStr}`,
  });
  return `/api/visual-card?${params.toString()}`;
}

export function HaberAI({ initial }: { initial: Snapshot }) {
  const [data, setData] = useState(initial);
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [category, setCategory] = useState("");
  const [day, setDay] = useState(() => newsDay());
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(30);
  const [error, setError] = useState("");
  const [hover, setHover] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const d = params.get("day");
    if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) setDay(d);
    const c = params.get("city");
    if (c && provinces.some((p) => p.code === c)) setCity(c);
    let active = true;
    const refresh = async () => {
      if (document.hidden) return;
      try {
        const r = await fetch("/api/haber-ai", { cache: "no-store" });
        if (!r.ok) throw Error();
        const next = await r.json();
        if (active) {
          setData(next);
          setError("");
        }
      } catch {
        if (active) setError("Yeni veriye ulaşılamadı. Son alınan akış gösteriliyor.");
      }
    };
    void refresh();
    const t = setInterval(refresh, 60000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  const relevant = useMemo(
    () =>
      data.articles.filter(
        (a) =>
          (!day || dayOf(a.publishedAt) === day) &&
          (!category || a.category === category) &&
          (!query ||
            (a.title + " " + (a.summary ?? ""))
              .toLocaleLowerCase("tr-TR")
              .includes(query.toLocaleLowerCase("tr-TR")))
      ),
    [data, day, category, query]
  );

  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    relevant.forEach((a) =>
      a.provinceCodes.forEach((code) => {
        result[code] = (result[code] ?? 0) + 1;
      })
    );
    return result;
  }, [relevant]);

  const activeRegionCodes = useMemo(() => {
    const found = REGIONS.find((r) => r.key === region);
    return found?.codes || [];
  }, [region]);

  const filtered = useMemo(() => {
    return relevant.filter((a) => {
      if (city) return a.provinceCodes.includes(city);
      if (activeRegionCodes.length > 0) {
        return a.provinceCodes.some((code) => activeRegionCodes.includes(code));
      }
      return true;
    });
  }, [relevant, city, activeRegionCodes]);

  const visibleProvinces = useMemo(() => {
    if (activeRegionCodes.length > 0) {
      return provinces.filter((p) => activeRegionCodes.includes(p.code));
    }
    return provinces;
  }, [activeRegionCodes]);

  const selected = provinces.find((p) => p.code === city)?.name;
  const select = (code: string) => {
    setCity(code === city ? "" : code);
    setLimit(30);
  };
  const stamp = data.run?.finishedAt;
  const activeProvinceCount = Object.keys(counts).length;

  return (
    <div className="haber-ai-shell">
      <header className="haber-ai-top">
        <Link href="/" className="haber-ai-back">
          ← Üretir
        </Link>
        <div>
          <span className="eyebrow">HABERAI · 81 İL CANLI GÜNDEM HARİTASI</span>
          <h1>Türkiye’de ne olup bitiyor?</h1>
          <p>81 ilin tamamında şehir şehir doğrulanmış haberler, ekonomi, teknoloji ve üretim gündemi tek haritada.</p>
        </div>
        <div className="haber-ai-live">
          {data.available ? "81 İL CANLI AKIŞ" : "BAĞLANTI BEKLENİYOR"}
          <small>
            {stamp
              ? "Son tarama: " + new Date(stamp).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })
              : "Canlı akış aktif"}
          </small>
          <small>
            {data.run?.status === "partial"
              ? "Bazı kaynaklara ulaşılamadı"
              : data.run?.status === "failed"
              ? "Son tarama başarısız"
              : `${activeProvinceCount}/81 il haritada aktif`}
          </small>
          <Link href="/yonetici">Haber editörü ↗</Link>
        </div>
      </header>

      <section className="haber-whatsapp-cta" aria-label="WhatsApp gündem kanalı">
        <div>
          <span className="eyebrow">GÜNDEMİ KAÇIRMA · 81 İL HARİTASI</span>
          <h2>Türkiye’nin 81 il şehir gündemini WhatsApp ve Instagram’dan takip et.</h2>
          <p>
            HaberAI, doğrulanmış kaynak bağlantılarını, şehir etiketlerini ve fotoğraflı özet kartlarını her gün
            otomatik bültenlerle paylaşır.
          </p>
        </div>
        <a href={whatsappChannel} target="_blank" rel="noreferrer">
          Kanalı takip et <span aria-hidden="true">↗</span>
        </a>
      </section>

      <FinanceStrip />

      <section className="haber-ai-controls">
        <label>
          Bölge
          <select
            aria-label="Coğrafi bölge seç"
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              setCity("");
              setLimit(30);
            }}
          >
            {REGIONS.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Şehir (81 İl)
          <select
            aria-label="Şehir seç"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setLimit(30);
            }}
          >
            <option value="">Türkiye · tüm kayıtlar ({relevant.length})</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.code} - {p.name} ({counts[p.code] ?? 0})
              </option>
            ))}
          </select>
        </label>
        <label>
          Kategori
          <select
            aria-label="Kategori seç"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setLimit(30);
            }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat || "all"} value={cat}>
                {cat || "Tüm kategoriler"}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={() => {
            setDay(newsDay());
            setLimit(30);
          }}
        >
          Bugün
        </button>
        <button
          onClick={() => {
            setDay("");
            setLimit(30);
          }}
        >
          Tüm arşiv
        </button>
        <label>
          Yayın tarihi
          <input
            aria-label="Yayın tarihi"
            type="date"
            value={day}
            onChange={(e) => {
              setDay(e.target.value);
              setLimit(30);
            }}
          />
        </label>
        <label className="haber-ai-search">
          Haber ara
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(30);
            }}
            placeholder="Şehir, konu veya kurum ara..."
          />
        </label>
        <button
          onClick={() => {
            setCity("");
            setRegion("");
            setCategory("");
            setDay(newsDay());
            setQuery("");
            setLimit(30);
          }}
        >
          Filtreleri temizle
        </button>
      </section>

      {error && <p role="status">{error}</p>}

      <section className="haber-ai-grid">
        <div className="haber-ai-map-panel">
          <div className="haber-ai-panel-head">
            <div>
              <span className="eyebrow">81 İL İNTERAKTİF TÜRKİYE HABER HARİTASI</span>
              <h2>{hover || selected || (region ? REGIONS.find((r) => r.key === region)?.label : "Türkiye Geneli (81 İl)")}</h2>
            </div>
            <span>{activeProvinceCount} / 81 ilde haber</span>
          </div>

          <div className="haber-ai-map">
            <svg viewBox="0 0 1007.478 527.323" aria-label="Türkiye 81 il haber haritası">
              {mapData.map((c) => {
                const count = counts[c.code] ?? 0;
                const inSelectedRegion = activeRegionCodes.length === 0 || activeRegionCodes.includes(c.code);
                return (
                  <g
                    key={c.code}
                    role="button"
                    tabIndex={0}
                    aria-label={`${c.name} (${count} haber)`}
                    aria-pressed={city === c.code}
                    data-city={c.code}
                    data-count={count}
                    style={{ opacity: inSelectedRegion ? 1 : 0.35 }}
                    className={
                      "haber-province" +
                      (city === c.code ? " is-selected" : "") +
                      (count > 0 ? " has-news" : "")
                    }
                    onClick={() => select(c.code)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        select(c.code);
                      }
                    }}
                    onMouseEnter={() => setHover(`${c.code} ${c.name} · ${count} doğrulanmış haber`)}
                    onMouseLeave={() => setHover("")}
                  >
                    <title>{`${c.code} ${c.name}: ${count} haber`}</title>
                    {c.paths.map((path, i) => (
                      <path key={i} d={path} />
                    ))}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="haber-ai-map-legend">
            <span>Yeşil: Aktif haber bulunan il ({activeProvinceCount}/81)</span>
            <span>{selected ? `Seçili İl: ${selected} (Tüm Türkiye için tekrar tıklayın)` : "Haritadan veya aşağıdan bir il seçin"}</span>
          </div>

          {/* 81 Province Quick Interactive Directory */}
          <div style={{ marginTop: "14px", maxHeight: "175px", overflowY: "auto", padding: "8px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {visibleProvinces.map((p) => {
                const cnt = counts[p.code] ?? 0;
                const isSel = city === p.code;
                return (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => select(p.code)}
                    style={{
                      padding: "4px 9px",
                      fontSize: "12px",
                      fontWeight: isSel ? 800 : 600,
                      borderRadius: "999px",
                      border: isSel ? "1px solid #c8f560" : "1px solid rgba(255,255,255,0.14)",
                      background: isSel ? "#c8f560" : cnt > 1 ? "rgba(200,245,96,0.14)" : "rgba(255,255,255,0.05)",
                      color: isSel ? "#0a120c" : "inherit",
                      cursor: "pointer",
                    }}
                  >
                    {p.code} {p.name} ({cnt})
                  </button>
                );
              })}
            </div>
          </div>

          <p className="haber-map-note">
            81 ilin tamamı TRT Haber, Anadolu Ajansı ve bölgesel üretim/ekonomi kaynaklarından beslenir. Haritadaki herhangi bir ile tıklayarak o şehrin haberlerini anında filtreleyebilirsiniz.
          </p>

          <div className="haber-source-status">
            <span className="eyebrow">Doğrulanmış Kaynak Durumu</span>
            {data.run?.sources.map((source) => (
              <div key={source.name}>
                <span>{source.name}</span>
                <strong>{source.error ? "Yedek akış" : source.count + " kayıt işlendi"}</strong>
              </div>
            ))}
            <small>
              Günlük otomatik tarama Türkiye saatiyle 09.00, 12.00, 15.00 ve 20.00 yayınlarıyla senkron çalışır. Açık
              ekran, kaydedilen akışı dakikada bir yeniler.
            </small>
          </div>
        </div>

        <div className="haber-ai-feed">
          <div className="haber-ai-panel-head">
            <div>
              <span className="eyebrow">{day || "Biriken haber arşivi"}</span>
              <h2>{selected ? `${selected} Şehir Gündemi` : "81 İl Son Gelişmeler"}</h2>
            </div>
            <span aria-live="polite">{filtered.length} kayıt</span>
          </div>

          <div className="haber-ai-articles">
            {filtered.slice(0, limit).map((a) => (
              <article className="haber-ai-article" key={a.id}>
                <div className="haber-card-body">
                  <div className="haber-ai-meta">
                    <span>{a.category}</span>
                    <time dateTime={a.publishedAt}>
                      {new Date(a.publishedAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}
                    </time>
                  </div>
                  <img
                    loading="lazy"
                    width={640}
                    height={360}
                    className="haber-ai-thumb"
                    src={buildHaberCardImage(a)}
                    alt={a.title}
                  />
                  <h3>{a.title}</h3>
                  {a.summary && <p>{a.summary}</p>}
                  <p>
                    <strong>📍 Şehir:</strong>{" "}
                    {a.provinceCodes.length
                      ? a.provinceCodes
                          .map((code) => provinces.find((p) => p.code === code)?.name)
                          .filter(Boolean)
                          .join(" · ")
                      : "Türkiye Geneli"}
                  </p>
                  <a href={a.url} target="_blank" rel="noreferrer">
                    {a.source} · Kaynağı doğrula ↗
                  </a>
                </div>
              </article>
            ))}

            {!filtered.length && (
              <div className="haber-ai-empty">
                <h3>{data.available ? "Bu seçimde kayıt yok." : "Haber bağlantısına ulaşılamadı."}</h3>
                <p>
                  Tarih, bölge veya şehir filtresini değiştirebilirsiniz. Tüm arşiv düğmesiyle önceki günlerin
                  haberlerini inceleyebilirsiniz.
                </p>
              </div>
            )}

            {filtered.length > limit && (
              <button className="haber-load" onClick={() => setLimit(limit + 30)}>
                30 haber daha göster · {filtered.length - limit} kayıt kaldı
              </button>
            )}
          </div>
        </div>
      </section>

      <footer className="haber-ai-footer">
        <span>
          {data.articles.length} doğrulanmış kayıt · 81 İl İnteraktif Türkiye Haritası · Haber ve görsel hakları
          yayıncılarına aittir
        </span>
        <Link href="/yonetici">Yönetici / HaberAI editörü ↗</Link>
        <a href="/licenses/turkey-map.txt">Harita lisansı</a>
      </footer>
    </div>
  );
}
