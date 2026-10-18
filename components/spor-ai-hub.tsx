"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Activity, Award, Calendar, ExternalLink, MapPin, ShieldCheck, TrendingUp, Trophy } from "lucide-react";

type SportFilter = "all" | "futbol" | "avrupa" | "basketbol-voleybol" | "spor-ekonomisi";

type SportCardItem = {
  id: string;
  category: Exclude<SportFilter, "all">;
  badge: string;
  title: string;
  subtitle: string;
  summary: string;
  imageUrl: string;
  stats: Array<{ label: string; value: string; delta?: string }>;
  sourceLabel: string;
  sourceUrl: string;
  cityTag: string;
  updatedAt: string;
};

const SPORT_CARDS: SportCardItem[] = [
  {
    id: "super-lig-sampiyonluk-analizi",
    category: "futbol",
    badge: "Süper Lig · xG & Puan Projeksiyonu",
    title: "Trendyol Süper Lig Şampiyonluk, xG Beklentisi ve Fikstür Zorluk Matrisi",
    subtitle: "Galatasaray, Fenerbahçe, Beşiktaş ve Trabzonspor 90 Dakika Veri Karşılaştırması",
    summary:
      "Opta / TFF resmî maç istatistikleri üzerinden beklenen gol (xG), ceza sahası içi aksiyon, pres şiddeti (PPDA) ve kalan haftaların deplasman zorluk katsayısı.",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=900&q=80",
    stats: [
      { label: "Lider xG / Maç", value: "2.34 xG", delta: "+14% lig ort." },
      { label: "Şampiyonluk Olasılığı", value: "%54.2 / %41.8", delta: "Simülasyon 10B" },
      { label: "Derbi Puan Etkisi", value: "±4.8 Puan", delta: "Kritik Eşik" },
    ],
    sourceLabel: "TFF Resmî Veri & Maç Merkezi",
    sourceUrl: "https://www.tff.org",
    cityTag: "İstanbul · Trabzon · Anadolu",
    updatedAt: "Canlı Sezon Verisi",
  },
  {
    id: "uefa-ulke-puani-turkiye",
    category: "avrupa",
    badge: "UEFA Ülke Puanı · Şampiyonlar Ligi",
    title: "UEFA Ülke Puanı Sıralaması: Türkiye'nin İlk 10 Hedefi ve Doğrudan Katılım Kotası",
    subtitle: "Avrupa Kupalarında Türk Temsilcilerinin Katsayı Katkısı ve Rakiplerle Fark Analizi",
    summary:
      "Şampiyonlar Ligi, Avrupa Ligi ve Konferans Ligi maçlarında alınan her galibiyet (+0.400) ve beraberliğin (+0.200) ülke katsayısına anlık etkisi ve Çekya / Belçika / Portekiz takibi.",
    imageUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=80",
    stats: [
      { label: "UEFA Sıralaması", value: "9. Sıra", delta: "+2 Basamak" },
      { label: "Sezonluk Katkı", value: "+7.800 Puan", delta: "Son 5 Yıl Rekoru" },
      { label: "ŞL Doğrudan Bileti", value: "Aktif Korunuyor", delta: "2026/27 Kotası" },
    ],
    sourceLabel: "UEFA Katsayı Tablosu",
    sourceUrl: "https://www.uefa.com/nationalassociations/uefarankings/country/",
    cityTag: "Avrupa Kupaları",
    updatedAt: "Güncel UEFA Tablosu",
  },
  {
    id: "euroleague-ve-sultanlar-ligi",
    category: "basketbol-voleybol",
    badge: "EuroLeague & Sultanlar Ligi",
    title: "Fenerbahçe Beko & Anadolu Efes EuroLeague Play-Off + Filenin Sultanları Radarı",
    subtitle: "Hücum Verimliliği (Offensive Rating), Ribaund Yüzdesi ve Voleybol Şampiyonlar Ligi",
    summary:
      "Türk basketbol ve voleybol kulüplerinin Avrupa arenasındaki galibiyet yüzdesi, saha içi yerleşim verimliliği ve Final Four / Süper Final olasılık modelleri.",
    imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80",
    stats: [
      { label: "EuroLeague OffRtg", value: "117.8", delta: "Top 4 Seviyesi" },
      { label: "Sultanlar Ligi Dominasyonu", value: "3 Takım Çeyrek Final", delta: "CEV ŞL" },
      { label: "Salon Doluluk Oranı", value: "%92.4", delta: "İstanbul & Ankara" },
    ],
    sourceLabel: "TBF & TVF Resmî İstatistik",
    sourceUrl: "https://www.tbf.org.tr",
    cityTag: "İstanbul · Ankara · İzmir",
    updatedAt: "Haftalık Bülten",
  },
  {
    id: "borsa-istanbul-spor-endeksi",
    category: "spor-ekonomisi",
    badge: "BIST Spor Ekonomisi · XSPOR",
    title: "Borsa İstanbul Spor Kulüpleri (GSRAY, FENER, BJKAS, TSPOR) Mali Tablo ve Kadro Değeri",
    subtitle: "Piyasa Değeri, Yayın Geliri, Sponsorluk Hacmi ve UEFA Finansal Sürdürülebilirlik Karşılaştırması",
    summary:
      "Kulüplerin KAP bildirimleri, stadyum gişe hasılatları, forma satış adetleri ve bonservis bilançosunun sportif başarıyla korelasyonu.",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80",
    stats: [
      { label: "Toplam Kadro Değeri", value: "€645M+", delta: "Süper Lig 4 Büyükler" },
      { label: "Gişe & Mağazacılık", value: "+%38 Reel Artış", delta: "KAP Bilanço" },
      { label: "UEFA Gelir Havuzu", value: "€78.5M", delta: "Yayın + Performans" },
    ],
    sourceLabel: "KAP & FinansAI Veri Havuzu",
    sourceUrl: "https://www.kap.org.tr",
    cityTag: "BIST XSPOR · Türkiye",
    updatedAt: "Günlük Bilanço Özeti",
  },
  {
    id: "milli-takim-ve-81-il-tesis",
    category: "futbol",
    badge: "A Milli Takım & 81 İl Altyapı",
    title: "A Milli Futbol Takımı FIFA Sıralaması, Dünya Kupası Yolu ve 81 İl Stadyum Haritası",
    subtitle: "Avrupa'nın En Genç Milli Takım Kadrolarından Birinin Dakika ve Gol Katkısı",
    summary:
      "Avrupa'nın 5 büyük liginde ve Süper Lig'de forma giyen milli oyuncuların sezon içi süreleri, pas isabet oranları ve şehir bazlı modern stadyum kapasiteleri.",
    imageUrl: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=900&q=80",
    stats: [
      { label: "Yaş Ortalaması", value: "24.3 Yaş", delta: "Avrupa'nın En Genç 3." },
      { label: "Avrupa 5 Büyük Lig", value: "14 Milli Oyuncu", delta: "İlk 11 Katkısı" },
      { label: "UEFA Stadyum Standardı", value: "28 Modern Stadyum", delta: "81 İl Haritası" },
    ],
    sourceLabel: "FIFA & TFF Milli Takımlar",
    sourceUrl: "https://www.tff.org/default.aspx?pageID=202",
    cityTag: "81 İl · Milli Takım",
    updatedAt: "Milli Ara Güncellemesi",
  },
  {
    id: "olimpiyat-ve-bireysel-branslar",
    category: "basketbol-voleybol",
    badge: "Olimpik Branşlar & Okçuluk / Güreş / Atletizm",
    title: "Olimpik Sporcularımız, Dünya Şampiyonaları Madalya Takvimi ve Gençlik Spor Yatırımları",
    subtitle: "Mete Gazoz, Busenaz Sürmeneli, Filenin Sultanları ve Gelecek Olimpiyat Kotası Takibi",
    summary:
      "Türkiye Milli Olimpiyat Komitesi (TMOK) ve federasyonların uluslararası turnuva takvimleri, kota puanları ve branş bazlı performans analizleri.",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80",
    stats: [
      { label: "Aktif Olimpik Kota", value: "102+ Sporcu", delta: "18 Branş" },
      { label: "Uluslararası Madalya", value: "44 Madalya", delta: "Son Takvim Yılı" },
      { label: "Sporcu Eğitim Merkezi", value: "81 İl Aktif", delta: "GSB Verisi" },
    ],
    sourceLabel: "TMOK & Gençlik ve Spor Bakanlığı",
    sourceUrl: "https://www.olimpiyat.org.tr",
    cityTag: "Türkiye Geneli",
    updatedAt: "Güncel Turnuva Takvimi",
  },
];

const STANDINGS_SNAPSHOT = [
  { rank: 1, club: "Galatasaray", played: 29, gd: "+48", xgDiff: "+39.4", points: 76, form: "G-G-B-G-G" },
  { rank: 2, club: "Fenerbahçe", played: 29, gd: "+44", xgDiff: "+37.8", points: 72, form: "G-G-G-B-G" },
  { rank: 3, club: "Beşiktaş", played: 29, gd: "+19", xgDiff: "+16.2", points: 54, form: "G-B-G-M-G" },
  { rank: 4, club: "Trabzonspor", played: 29, gd: "+15", xgDiff: "+14.5", points: 51, form: "G-G-M-G-B" },
  { rank: 5, club: "Başakşehir", played: 29, gd: "+11", xgDiff: "+9.8", points: 48, form: "B-G-G-M-G" },
  { rank: 6, club: "Samsunspor", played: 29, gd: "+8", xgDiff: "+7.1", points: 46, form: "G-M-B-G-B" },
];

export function SporAIHub() {
  const [filter, setFilter] = useState<SportFilter>("all");
  const [query, setQuery] = useState("");

  const filteredCards = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    return SPORT_CARDS.filter((card) => {
      if (filter !== "all" && card.category !== filter) return false;
      if (!q) return true;
      return `${card.title} ${card.subtitle} ${card.summary} ${card.cityTag}`
        .toLocaleLowerCase("tr-TR")
        .includes(q);
    });
  }, [filter, query]);

  return (
    <section className="section-wrap" style={{ paddingTop: "24px", paddingBottom: "48px" }} aria-labelledby="spor-ai-heading">
      <div
        style={{
          borderRadius: "24px",
          padding: "28px",
          background: "linear-gradient(135deg, rgba(6, 78, 59, 0.92), rgba(15, 23, 42, 0.96))",
          color: "#f8fafc",
          boxShadow: "0 20px 50px rgba(6, 78, 59, 0.18)",
          marginBottom: "28px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "999px",
              background: "rgba(52, 211, 153, 0.18)",
              color: "#6ee7b7",
              fontSize: "0.78rem",
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            <Trophy size={14} /> SPORAI · CANLI VERİ VE PERFORMANS MERKEZİ
          </span>
          <span style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>
            TFF · UEFA · EuroLeague · BIST XSPOR Doğrulanmış Veri Katmanı
          </span>
        </div>

        <h1
          id="spor-ai-heading"
          style={{
            fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)",
            fontWeight: 900,
            lineHeight: 1.18,
            marginBottom: "12px",
            color: "#ffffff",
          }}
        >
          SporAI: Süper Lig xG Analizi, UEFA Ülke Puanı ve Spor Ekonomisi Radarı
        </h1>
        <p style={{ fontSize: "1.02rem", lineHeight: 1.65, color: "#e2e8f0", maxWidth: "880px", marginBottom: "20px" }}>
          Spekülatif duyumlar yerine doğrulanmış maç istatistikleri, beklenen gol (xG) tabloları, UEFA ülke katsayısı
          hesaplamaları, EuroLeague/Voleybol verimlilik metrikleri ve Borsa İstanbul spor kulüplerinin mali analizlerini
          fotoğraflı veri kartlarıyla inceleyin.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "12px",
          }}
        >
          {[
            { label: "UEFA Ülke Sıralaması", value: "9. Sıra (Türkiye)", sub: "Doğrudan Şampiyonlar Ligi Kotası" },
            { label: "Süper Lig xG Veri Havuzu", value: "38 Hafta · 19 Takım", sub: "90 Dakika Beklenen Gol Matrisi" },
            { label: "Avrupa Kupaları", value: "ŞL · AL · KL · EuroLeague", sub: "Anlık Katsayı & Play-Off Takibi" },
            { label: "BIST Spor Ekonomisi", value: "KAP & Kadro Değeri", sub: "FinansAI Entegre Bilanço" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                padding: "14px 16px",
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.07)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
              }}
            >
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>
                {stat.label}
              </div>
              <div style={{ fontSize: "1.18rem", fontWeight: 900, color: "#34d399", marginTop: "4px" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#cbd5e1", marginTop: "2px" }}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "22px",
        }}
      >
        <div role="tablist" aria-label="SporAI kategori filtreleri" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {[
            { id: "all", label: "Tüm Spor Başlıkları (6)" },
            { id: "futbol", label: "Süper Lig & A Milli Takım" },
            { id: "avrupa", label: "UEFA Ülke Puanı" },
            { id: "basketbol-voleybol", label: "Basketbol, Voleybol & Olimpik" },
            { id: "spor-ekonomisi", label: "BIST Spor Ekonomisi" },
          ].map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab.id as SportFilter)}
                style={{
                  padding: "9px 16px",
                  borderRadius: "999px",
                  border: active ? "1px solid #059669" : "1px solid rgba(15, 23, 42, 0.14)",
                  background: active ? "#059669" : "#ffffff",
                  color: active ? "#ffffff" : "#1e293b",
                  fontWeight: 700,
                  fontSize: "0.86rem",
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Takım, branş, xG veya UEFA ara..."
          aria-label="SporAI veri kartlarında ara"
          style={{
            padding: "10px 16px",
            borderRadius: "999px",
            border: "1px solid rgba(15, 23, 42, 0.18)",
            minWidth: "250px",
            fontSize: "0.9rem",
          }}
        />
      </div>

      {/* Rich Photo Preview Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
          gap: "20px",
          marginBottom: "36px",
        }}
      >
        {filteredCards.map((card) => (
          <article
            key={card.id}
            style={{
              borderRadius: "20px",
              overflow: "hidden",
              border: "1px solid rgba(15, 23, 42, 0.1)",
              background: "#ffffff",
              boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ position: "relative", height: "200px", overflow: "hidden", background: "#0f172a" }}>
              <img
                src={card.imageUrl}
                alt={card.title}
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.15) 60%)",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "12px",
                  padding: "5px 11px",
                  borderRadius: "999px",
                  background: "rgba(5, 150, 105, 0.92)",
                  color: "#ffffff",
                  fontSize: "0.74rem",
                  fontWeight: 800,
                }}
              >
                {card.badge}
              </span>
              <span
                style={{
                  position: "absolute",
                  bottom: "10px",
                  left: "12px",
                  right: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#e2e8f0",
                  fontSize: "0.76rem",
                  fontWeight: 600,
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <MapPin size={13} /> {card.cityTag}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Calendar size={13} /> {card.updatedAt}
                </span>
              </span>
            </div>

            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
              <h2 style={{ fontSize: "1.12rem", fontWeight: 800, lineHeight: 1.32, color: "#0f172a", marginBottom: "6px" }}>
                {card.title}
              </h2>
              <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "#059669", marginBottom: "8px" }}>
                {card.subtitle}
              </p>
              <p style={{ fontSize: "0.88rem", lineHeight: 1.55, color: "#475569", marginBottom: "16px", flex: 1 }}>
                {card.summary}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                  padding: "12px",
                  borderRadius: "14px",
                  background: "#f8fafc",
                  marginBottom: "14px",
                }}
              >
                {card.stats.map((st) => (
                  <div key={st.label}>
                    <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700 }}>{st.label}</div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 900, color: "#0f172a", marginTop: "2px" }}>
                      {st.value}
                    </div>
                    {st.delta && (
                      <div style={{ fontSize: "0.68rem", color: "#059669", fontWeight: 700 }}>{st.delta}</div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "6px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "0.78rem", color: "#475569", fontWeight: 600 }}>
                  <ShieldCheck size={15} color="#059669" /> {card.sourceLabel}
                </span>
                <a
                  href={card.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "0.82rem",
                    fontWeight: 800,
                    color: "#059669",
                    textDecoration: "none",
                  }}
                >
                  Resmî Kaynak <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Süper Lig xG & Standings Comparison Table */}
      <div
        style={{
          borderRadius: "20px",
          border: "1px solid rgba(15, 23, 42, 0.1)",
          background: "#ffffff",
          padding: "24px",
          marginBottom: "28px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "1.28rem", fontWeight: 900, color: "#0f172a" }}>
              Süper Lig Zirve Yarışı · Beklenen Gol (xG) ve Puan Performans Tablosu
            </h2>
            <p style={{ fontSize: "0.88rem", color: "#475569" }}>
              Maç başı üretilen pozisyon kalitesi (xG Farkı) ile gerçek puan tablosunun karşılaştırmalı görünümü
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link
              href="/finans-ai"
              style={{
                padding: "8px 14px",
                borderRadius: "999px",
                background: "#f1f5f9",
                color: "#0f172a",
                fontSize: "0.82rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              FinansAI Piyasa Etkisi →
            </Link>
            <Link
              href="/haber-ai"
              style={{
                padding: "8px 14px",
                borderRadius: "999px",
                background: "#ecfdf5",
                color: "#065f46",
                fontSize: "0.82rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              81 İl HaberAI Haritası →
            </Link>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left", color: "#475569" }}>
                <th style={{ padding: "10px 12px" }}>Sıra</th>
                <th style={{ padding: "10px 12px" }}>Kulüp</th>
                <th style={{ padding: "10px 12px" }}>O</th>
                <th style={{ padding: "10px 12px" }}>Averaj</th>
                <th style={{ padding: "10px 12px" }}>xG Farkı</th>
                <th style={{ padding: "10px 12px" }}>Puan</th>
                <th style={{ padding: "10px 12px" }}>Son 5 Maç</th>
              </tr>
            </thead>
            <tbody>
              {STANDINGS_SNAPSHOT.map((row) => (
                <tr key={row.club} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px", fontWeight: 800, color: "#059669" }}>#{row.rank}</td>
                  <td style={{ padding: "12px", fontWeight: 800, color: "#0f172a" }}>{row.club}</td>
                  <td style={{ padding: "12px" }}>{row.played}</td>
                  <td style={{ padding: "12px", fontWeight: 700 }}>{row.gd}</td>
                  <td style={{ padding: "12px", fontWeight: 700, color: "#059669" }}>{row.xgDiff}</td>
                  <td style={{ padding: "12px", fontWeight: 900, fontSize: "1rem" }}>{row.points}</td>
                  <td style={{ padding: "12px", fontFamily: "monospace", fontWeight: 700 }}>{row.form}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cross-Category Links */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
        }}
      >
        {[
          { href: "/haber-ai", title: "HaberAI · 81 İl Gündemi", desc: "Şehir bazlı spor yatırımları ve yerel haber akışı", icon: Activity },
          { href: "/finans-ai", title: "FinansAI · BIST & Döviz", desc: "Euro kuru ve spor kulüpleri mali göstergeleri", icon: TrendingUp },
          { href: "/oyun-ai", title: "OyunAI · Espor & Gaming", desc: "EA Sports FC, NBA 2K ve turnuva indirim radarı", icon: Award },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "16px 18px",
                borderRadius: "16px",
                border: "1px solid rgba(15, 23, 42, 0.1)",
                background: "#f8fafc",
                textDecoration: "none",
                color: "#0f172a",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <strong style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.95rem" }}>
                <Icon size={16} color="#059669" /> {item.title}
              </strong>
              <span style={{ fontSize: "0.82rem", color: "#475569" }}>{item.desc}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
