"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, MapPin, ShieldCheck } from "lucide-react";
import { ListingMap } from "./listing-map";
import { ListingComposer } from "./listing-composer";
import { FavoriteButton } from "./favorite-button";
import type { MarketplaceDashboard, MarketplaceListing } from "@/lib/marketplace/types";

const money = (n: number | null) =>
  n === null
    ? "—"
    : new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);

const PROPERTY_PLATFORMS = [
  { id: "", label: "Tüm Platformlar" },
  { id: "Sahibinden", label: "Sahibinden" },
  { id: "Emlakjet", label: "Emlakjet" },
  { id: "Hepsiemlak", label: "Hepsiemlak" },
  { id: "Letgo", label: "Letgo" },
  { id: "ilan.gov.tr", label: "Kamu İhale (ilan.gov.tr)" },
  { id: "TOKİ", label: "TOKİ & Emlak Konut" },
];

const VEHICLE_PLATFORMS = [
  { id: "", label: "Tüm Platformlar" },
  { id: "Sahibinden", label: "Sahibinden" },
  { id: "Arabam.com", label: "Arabam.com" },
  { id: "Letgo", label: "Letgo" },
  { id: "Resmî", label: "Resmî Marka Listesi" },
];

export function MarketplaceHub({ data }: { data: MarketplaceDashboard }) {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [platform, setPlatform] = useState("");
  const [max, setMax] = useState("");
  const [onlyTrusted, setOnlyTrusted] = useState(false);
  const [refLimit, setRefLimit] = useState(16);

  const cities = [...new Set(data.listings.map((x) => x.city).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "tr")
  );
  const platformOptions = data.kind === "property" ? PROPERTY_PLATFORMS : VEHICLE_PLATFORMS;

  const visible = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr-TR");
    const m = max ? Number(max) : null;
    const p = platform.trim().toLocaleLowerCase("tr-TR");
    return data.listings.filter(
      (x) =>
        (!city || x.city === city) &&
        (!m || x.price <= m) &&
        (!p ||
          `${x.sourceName} ${x.title} ${x.description}`
            .toLocaleLowerCase("tr-TR")
            .includes(p)) &&
        (!q ||
          [x.title, x.city, x.district, x.sourceName, ...Object.values(x.attributes).map(String)]
            .join(" ")
            .toLocaleLowerCase("tr-TR")
            .includes(q)) &&
        (!onlyTrusted ||
          (x.trustBadges.some((b) => b.tone === "good") && !x.trustBadges.some((b) => b.tone === "warn")))
    );
  }, [data.listings, search, city, platform, max, onlyTrusted]);

  return (
    <main className="market-shell section-wrap">
      <header className="market-hero">
        <div>
          <span className="rule-label">
            {data.kind === "property"
              ? "EVAI / ÇOKLU PLATFORM (SAHİBİNDEN · EMLAKJET · HEPSİEMLAK · LETGO · KAMU) HARİTALI VİTRİN"
              : "ARABAAI / ÇOKLU PLATFORM (SAHİBİNDEN · ARABAM.COM · LETGO · RESMÎ MARKA) HARİTALI VİTRİN"}
          </span>
          <h1>
            {data.kind === "property"
              ? "Evi haritada gör.\nVeriyi yanında tut."
              : "Aracı haritada gör.\nFiyatı referansla kıyasla."}
          </h1>
          <p>
            {data.kind === "property"
              ? "Sahibinden, Emlakjet, Hepsiemlak, Letgo ve ilan.gov.tr kamu ihale piyasa referanslarını fotoğraflı önizleme kartları, yerel m² medyanı ve Türkiye haritası üzerinde tek ekranda karşılaştırın."
              : "Sahibinden, Arabam.com ve Letgo ikinci el piyasa referanslarını markaların resmî sıfır araç liste/kampanya fiyatlarıyla fotoğraflı vitrin ve harita üzerinde yan yana kıyaslayın."}
          </p>
        </div>
        <div className="market-trust-promise">
          <strong>Telifsiz Çoklu Platform Radarı · Komisyonsuz Karşılaştırma</strong>
          <p>
            Üretir üzerinden satış komisyonu alınmaz; farklı ilan platformlarındaki piyasa referansları ve resmî kurum
            verileri fotoğraf önizlemeleriyle şeffaf biçimde tek merkezde toplanır.
          </p>
        </div>
      </header>

      <div className="market-stats">
        {data.stats.map((s) => (
          <div key={s.label}>
            <strong>{s.value.toLocaleString("tr-TR")}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <ListingComposer kind={data.kind} />

      <section className="market-browser">
        {/* Platform Quick Filter Bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "14px",
            alignItems: "center",
          }}
          aria-label="Platform filtresi"
        >
          <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#64748b", marginRight: "4px" }}>
            PLATFORM FİLTRESİ:
          </span>
          {platformOptions.map((opt) => {
            const active = platform === opt.id;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => setPlatform(opt.id)}
                aria-pressed={active}
                style={{
                  padding: "7px 14px",
                  borderRadius: "999px",
                  border: active ? "1px solid #0f172a" : "1px solid rgba(15, 23, 42, 0.15)",
                  background: active ? "#0f172a" : "#ffffff",
                  color: active ? "#ffffff" : "#1e293b",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="market-toolbar">
          <label>
            <span>Ara</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                data.kind === "property"
                  ? "Sahibinden, Emlakjet, Letgo, ilçe, oda…"
                  : "Sahibinden, Arabam, Letgo, marka, model…"
              }
            />
          </label>
          <label>
            <span>Şehir</span>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Tümü</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>En yüksek fiyat</span>
            <input
              type="number"
              min="0"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              placeholder="Sınır yok"
            />
          </label>
          <label className="market-check">
            <input type="checkbox" checked={onlyTrusted} onChange={(e) => setOnlyTrusted(e.target.checked)} /> Uyarısız
            ilanlar
          </label>
        </div>

        <div className="market-count">
          <b>{visible.length}</b> sonuç · fotoğraflı vitrin, harita ve tablo aynı filtreyi kullanıyor
        </div>

        {/* Rich Photo Preview Vitrin Grid */}
        {visible.length > 0 && (
          <div style={{ marginBottom: "28px", marginTop: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <h2 style={{ fontSize: "1.15rem", fontWeight: 900, margin: 0 }}>
                Fotoğraflı İlan Önizleme Vitrini ({Math.min(visible.length, 9)} Seçili Vitrin Kaydı)
              </h2>
              <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>
                Sahibinden · Letgo · Emlakjet · Hepsiemlak · Arabam.com · Kamu İhale Telifsiz Referansları
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(295px, 1fr))",
                gap: "16px",
              }}
            >
              {visible.slice(0, 9).map((item) => {
                const ref = item.priceReference;
                const delta = ref ? (item.price / ref - 1) * 100 : null;
                return (
                  <article
                    key={`card-${item.id}`}
                    style={{
                      borderRadius: "18px",
                      overflow: "hidden",
                      border: "1px solid rgba(15, 23, 42, 0.12)",
                      background: "#ffffff",
                      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div style={{ position: "relative", height: "176px", background: "#0f172a", overflow: "hidden" }}>
                      {item.images[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          loading="lazy"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ padding: "24px", color: "#fff" }}>Görsel Yok</div>
                      )}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(to top, rgba(15,23,42,0.86) 0%, rgba(15,23,42,0.12) 60%)",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          top: "10px",
                          left: "10px",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          background: "rgba(15, 23, 42, 0.88)",
                          color: "#f8fafc",
                          fontSize: "0.7rem",
                          fontWeight: 800,
                        }}
                      >
                        {item.sourceType === "member" ? item.sellerName || "Üretir ID" : item.sourceName}
                      </span>
                      {delta !== null && (
                        <span
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            padding: "4px 9px",
                            borderRadius: "999px",
                            background: delta <= 0 ? "#059669" : "#d97706",
                            color: "#ffffff",
                            fontSize: "0.7rem",
                            fontWeight: 800,
                          }}
                        >
                          {delta > 0 ? `+${delta.toFixed(0)}%` : `${delta.toFixed(0)}% Referans`}
                        </span>
                      )}
                      <span
                        style={{
                          position: "absolute",
                          bottom: "10px",
                          left: "12px",
                          right: "12px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          color: "#ffffff",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                        }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <MapPin size={13} /> {item.city} / {item.district}
                        </span>
                        <strong style={{ fontSize: "0.95rem", color: "#fde047" }}>{money(item.price)}</strong>
                      </span>
                    </div>

                    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
                      <h3
                        style={{
                          fontSize: "0.96rem",
                          fontWeight: 800,
                          lineHeight: 1.35,
                          color: "#0f172a",
                          margin: "0 0 6px 0",
                        }}
                      >
                        {item.title}
                      </h3>
                      <p style={{ fontSize: "0.78rem", color: "#475569", margin: "0 0 12px 0", flex: 1 }}>
                        {item.description}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingTop: "8px",
                          borderTop: "1px solid #f1f5f9",
                          fontSize: "0.76rem",
                        }}
                      >
                        <span style={{ color: "#64748b", fontWeight: 600 }}>
                          <ShieldCheck size={13} style={{ display: "inline", marginRight: "3px", color: "#059669" }} />
                          Ref: {ref ? money(ref) : "—"}
                        </span>
                        {item.detailUrl ? (
                          <Link
                            href={item.detailUrl}
                            style={{ fontWeight: 800, color: "#0f172a", textDecoration: "none" }}
                          >
                            İlanı aç →
                          </Link>
                        ) : item.sourceUrl ? (
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontWeight: 800,
                              color: "#059669",
                              textDecoration: "none",
                            }}
                          >
                            Platformda Gör <ExternalLink size={13} />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        <ListingMap items={visible} />

        <div className="market-table-wrap">
          <table className="market-table">
            <thead>
              <tr>
                <th>İlan</th>
                <th>Konum</th>
                <th>Fiyat</th>
                {data.kind === "vehicle" && (
                  <>
                    <th>Sıfır fiyat</th>
                    <th>2. el ort.</th>
                  </>
                )}
                <th>Referans</th>
                <th>Güven</th>
                <th>Güncelleme</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <MarketRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>
        {visible.length === 0 && (
          <div className="market-empty">Bu filtrelerle ilan yok. Filtreleri genişlet veya ilk ilanı sen ekle.</div>
        )}
      </section>

      {data.kind === "vehicle" && (
        <section className="market-reference">
          <div>
            <span className="rule-label">SIFIR ARAÇ REFERANSI</span>
            <h2>Resmî fiyatı yanında tut.</h2>
            <p>İkinci el ilana bakarken aynı modelin güncel resmî fiyatını ayrı sekmede aramana gerek kalmasın.</p>
          </div>
          <div className="market-ref-grid">
            {data.references.slice(0, refLimit).map((r) => (
              <article key={r.label}>
                <span>{r.label}</span>
                <strong>{money(r.value)}</strong>
                <small>{r.detail}</small>
              </article>
            ))}
          </div>
          {data.references.length > refLimit && (
            <button className="market-more" onClick={() => setRefLimit(refLimit + 24)}>
              Daha fazla sıfır araç fiyatı göster
            </button>
          )}
        </section>
      )}

      <aside className="market-safety">
        <strong>Alıcı için güvenli işlem kuralı</strong>
        <p>
          Üretir bir ödeme veya emanet para hizmeti değildir. İlan doğrulama rozetleri mülkiyet garantisi değildir.
          Aracı/taşınmazı görmeden, resmi belgeleri kontrol etmeden ve karşı tarafı doğrulamadan kapora veya ödeme
          yapmayın.
        </p>
      </aside>
    </main>
  );
}

function MarketRow({ item }: { item: MarketplaceListing }) {
  const ref = item.priceReference,
    delta = ref ? (item.price / ref - 1) * 100 : null;
  return (
    <tr>
      <td>
        <div className="market-title-cell">
          {item.images[0] ? (
            <img src={item.images[0]} alt="" />
          ) : (
            <span className="market-no-image">Görsel yok</span>
          )}
          <div>
            <strong>{item.title}</strong>
            <small>{item.sourceType === "member" ? item.sellerName : item.sourceName}</small>
            {item.detailUrl ? (
              <Link href={item.detailUrl}>İlanı aç →</Link>
            ) : item.sourceUrl ? (
              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                Kaynak ↗
              </a>
            ) : null}
          </div>
        </div>
      </td>
      <td>
        {item.city}
        <small>
          {item.district}
          {item.locationPrecision === "approximate" ? " · yaklaşık" : ""}
        </small>
      </td>
      <td>
        <b>{money(item.price)}</b>
      </td>
      {item.kind === "vehicle" && (
        <>
          <td>{money(item.newPrice ?? null)}</td>
          <td>
            {item.usedSample && item.usedSample >= 2 ? money(item.usedAverage ?? null) : "Örnek bekleniyor"}
            <small>{item.usedSample ? item.usedSample + " ilan" : ""}</small>
          </td>
        </>
      )}
      <td>
        {ref ? money(ref) : "—"}
        <small>{delta === null ? "" : (delta > 0 ? "+" : "") + delta.toFixed(0) + "%"}</small>
      </td>
      <td>
        <div className="market-badges">
          {item.trustBadges.slice(0, 3).map((b) => (
            <span key={b.label} data-tone={b.tone} title={b.detail}>
              {b.label}
            </span>
          ))}
        </div>
      </td>
      <td>{new Date(item.updatedAt).toLocaleDateString("tr-TR")}</td>
      <td>
        <FavoriteButton item={item} />
      </td>
    </tr>
  );
}
