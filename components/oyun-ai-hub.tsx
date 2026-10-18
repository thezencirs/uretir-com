"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Cpu, ExternalLink, Flame, Gamepad2, Globe, Sparkles, Tag, Trophy } from "lucide-react";
import { OyunAIMemoryGame } from "@/components/oyun-ai-memory-game";

type GameFilter = "all" | "indirim" | "turk-studyo" | "espor-donanim";

type GameCardItem = {
  id: string;
  category: Exclude<GameFilter, "all">;
  platform: string;
  discountBadge: string;
  title: string;
  subtitle: string;
  summary: string;
  imageUrl: string;
  currentPrice: string;
  referencePrice: string;
  metacriticOrStat: string;
  sourceUrl: string;
};

const GAME_CARDS: GameCardItem[] = [
  {
    id: "steam-mena-usd-firsatlari",
    category: "indirim",
    platform: "Steam MENA-USD · PC",
    discountBadge: "-%65 Dönem Dibi",
    title: "Baldur's Gate 3, Cyberpunk 2077 & Elden Ring — Steam MENA-USD Bölgesel Fiyat Radarı",
    subtitle: "Türkiye MENA-USD Özel Fiyatlandırması ve Son 90 Günün En Düşük Seviyesi",
    summary:
      "Steam MENA-USD bölgesel fiyatlandırma kapsamında küresel ABD fiyatına göre %45–%65 daha avantajlı listelenen AAA yapımların tarihsel dip karşılaştırması.",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80",
    currentPrice: "$19.99 – $27.99",
    referencePrice: "$59.99 Küresel",
    metacriticOrStat: "96 Metacritic · AAA",
    sourceUrl: "https://store.steampowered.com",
  },
  {
    id: "epic-games-haftalik-ucretsiz",
    category: "indirim",
    platform: "Epic Games Store · TL Fiyat",
    discountBadge: "Ücretsiz & TL Korumalı",
    title: "Epic Games Store Haftanın Ücretsiz Oyunları ve TL Bazlı Mega Kupon İndirimleri",
    subtitle: "Kütüphaneye Kalıcı Eklenen Ücretsiz Yapımlar ve TL Ödeme Avantajı",
    summary:
      "Epic Games Store'un Türkiye'de yerel TL fiyatlandırmasını koruyan mağaza yapısı, haftalık ücretsiz oyun takvimi ve sepet indirimi analizleri.",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80",
    currentPrice: "0 TL / %75 İndirim",
    referencePrice: "1.499 TL Liste",
    metacriticOrStat: "Kalıcı Kütüphane",
    sourceUrl: "https://store.epicgames.com/tr/",
  },
  {
    id: "playstation-plus-ve-game-pass",
    category: "indirim",
    platform: "PS5 · Xbox · PC Game Pass",
    discountBadge: "Abonelik Katalog Analizi",
    title: "PC / Xbox Game Pass ve PlayStation Plus Extra Katalog Değeri Karşılaştırması",
    subtitle: "İlk Gün (Day-One) Eklenen Oyunlar ve Aylık Maliyet / Saat Başına Değer Analizi",
    summary:
      "Tekil oyun satın almak yerine aylık abonelik kütüphanelerinde yer alan 400+ oyunun toplam mağaza değeri ve bu ay kataloğa eklenen yeni yapımlar.",
    imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=900&q=80",
    currentPrice: "Aylık Katalog",
    referencePrice: "45.000 TL+ Kütüphane",
    metacriticOrStat: "400+ Oyun Aktif",
    sourceUrl: "https://www.xbox.com/tr-TR/xbox-game-pass",
  },
  {
    id: "mount-and-blade-bannerlord-turk-studyo",
    category: "turk-studyo",
    platform: "Türk Oyun Ekosistemi · Global İhracat",
    discountBadge: "Yerli Stüdyo Başarısı",
    title: "TaleWorlds (Mount & Blade II: Bannerlord), Peak, Dream Games ve Türk Indie Stüdyoları",
    subtitle: "Ankara, İstanbul ve İzmir Merkezli Oyun Stüdyolarının Küresel Satış ve Yatırım Karnesi",
    summary:
      "Türkiye'nin milyar dolarlık (Unicorn/Decacorn) oyun girişimleri, Steam'de en çok istek listesine (Wishlist) eklenen yerli PC oyunları ve teknopark ekosistem verileri.",
    imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=900&q=80",
    currentPrice: "Global Top 50",
    referencePrice: "5M+ Kopya Satış",
    metacriticOrStat: "%88 Çok Olumlu",
    sourceUrl: "https://www.taleworlds.com",
  },
  {
    id: "valorant-cs2-espor-turkiye",
    category: "espor-donanim",
    platform: "VCT EMEA · CS2 · Espor",
    discountBadge: "Espor & Turnuva Radarı",
    title: "FUT Esports, BBL, Eternal Fire ve Türkiye Espor Takımlarının Uluslararası Turnuva Takibi",
    subtitle: "Valorant Champions Tour (VCT), Counter-Strike 2 Major ve EA FC Pro Sıralamaları",
    summary:
      "Türk espor organizasyonlarının dünya sıralamasındaki yeri, turnuva ödül havuzları, izlenme rekorları ve oyuncu performans istatistikleri.",
    imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=900&q=80",
    currentPrice: "Top 10 Dünya Sırası",
    referencePrice: "$2.25M Ödül Havuzu",
    metacriticOrStat: "Canlı Turnuva Verisi",
    sourceUrl: "https://valorantesports.com",
  },
  {
    id: "fiyat-performans-oyuncu-donanim",
    category: "espor-donanim",
    platform: "Donanım · FPS / TL Oranı",
    discountBadge: "İndirimAI Entegre",
    title: "1080p ve 1440p Oyunculuk İçin En İyi Fiyat/Performans Ekran Kartı ve Monitör Rehberi",
    subtitle: "RTX 4060 / RX 7700 XT Sistemlerde 1 TL Başına Alınan FPS ve 90 Günlük Fiyat Dibi",
    summary:
      "İndirimAI mağaza verileriyle entegre çalışan oyuncu bilgisayarı, 180Hz IPS monitör ve kablosuz espor ekipmanlarında gerçek dönem dibi fırsatlar.",
    imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80",
    currentPrice: "Dönem Dibi Takibi",
    referencePrice: "90 Günlük Grafik",
    metacriticOrStat: "144+ FPS Hedefi",
    sourceUrl: "https://www.uretir.com/indirim-ai",
  },
];

export function OyunAIHub() {
  const [filter, setFilter] = useState<GameFilter>("all");

  const visibleCards = useMemo(() => {
    if (filter === "all") return GAME_CARDS;
    return GAME_CARDS.filter((c) => c.category === filter);
  }, [filter]);

  return (
    <div style={{ paddingBottom: "48px" }}>
      <section className="section-wrap" style={{ paddingTop: "24px", marginBottom: "28px" }} aria-labelledby="oyun-ai-heading">
        <div
          style={{
            borderRadius: "24px",
            padding: "28px",
            background: "linear-gradient(135deg, rgba(76, 29, 149, 0.94), rgba(15, 23, 42, 0.97))",
            color: "#f8fafc",
            boxShadow: "0 20px 50px rgba(76, 29, 149, 0.2)",
            marginBottom: "26px",
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
                background: "rgba(167, 139, 250, 0.22)",
                color: "#ddd6fe",
                fontSize: "0.78rem",
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              <Gamepad2 size={14} /> OYUNAI · OYUN İNDİRİMLERİ, TÜRK STÜDYOLARI VE ZİHİN EGZERSİZİ
            </span>
            <span style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>
              Steam MENA-USD · Epic Games · Game Pass · PlayStation · Yerli Stüdyo Radarı
            </span>
          </div>

          <h1
            id="oyun-ai-heading"
            style={{
              fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)",
              fontWeight: 900,
              lineHeight: 1.18,
              marginBottom: "12px",
              color: "#ffffff",
            }}
          >
            OyunAI: Steam & Epic İndirim Radarı, Türk Oyun Ekosistemi ve İnteraktif Hafıza Oyunu
          </h1>
          <p style={{ fontSize: "1.02rem", lineHeight: 1.65, color: "#e2e8f0", maxWidth: "880px", marginBottom: "20px" }}>
            PC ve konsol mağazalarındaki gerçek dönem dibi oyun indirimlerini, haftanın ücretsiz kütüphane fırsatlarını,
            küresel başarı yakalayan Türk oyun stüdyolarını fotoğraflı vitrin kartlarıyla takip edin; sayfa içindeki
            reklamsız Memo kelime-hafıza oyunuyla hemen zihin egzersizi yapın.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <a
              href="#oyun-indirim-vitrini"
              style={{
                padding: "10px 18px",
                borderRadius: "999px",
                background: "#8b5cf6",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "0.88rem",
                textDecoration: "none",
              }}
            >
              Fotoğraflı Oyun & İndirim Vitrini ↓
            </a>
            <a
              href="#oyun-ai-memo"
              style={{
                padding: "10px 18px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.12)",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "0.88rem",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              Memo Hafıza Oyununu Oyna 🎮
            </a>
          </div>
        </div>

        {/* Filter Pills */}
        <div
          id="oyun-indirim-vitrini"
          style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}
          role="tablist"
          aria-label="OyunAI kategori filtreleri"
        >
          {[
            { id: "all", label: "Tüm Oyun & Donanım Kartları (6)" },
            { id: "indirim", label: "Steam / Epic / Konsol İndirimleri" },
            { id: "turk-studyo", label: "Türk Oyun Stüdyoları" },
            { id: "espor-donanim", label: "Espor & Oyuncu Donanımı" },
          ].map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab.id as GameFilter)}
                style={{
                  padding: "9px 16px",
                  borderRadius: "999px",
                  border: active ? "1px solid #7c3aed" : "1px solid rgba(15, 23, 42, 0.14)",
                  background: active ? "#7c3aed" : "#ffffff",
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

        {/* Photo Preview Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
            gap: "20px",
          }}
        >
          {visibleCards.map((card) => (
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
              <div style={{ position: "relative", height: "196px", overflow: "hidden", background: "#0f172a" }}>
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
                    background: "linear-gradient(to top, rgba(15,23,42,0.86) 0%, rgba(15,23,42,0.12) 60%)",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    padding: "5px 11px",
                    borderRadius: "999px",
                    background: "rgba(124, 58, 237, 0.94)",
                    color: "#ffffff",
                    fontSize: "0.74rem",
                    fontWeight: 800,
                  }}
                >
                  {card.discountBadge}
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
                    fontWeight: 700,
                  }}
                >
                  <span>{card.platform}</span>
                  <span>{card.metacriticOrStat}</span>
                </span>
              </div>

              <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 800, lineHeight: 1.32, color: "#0f172a", marginBottom: "6px" }}>
                  {card.title}
                </h2>
                <p style={{ fontSize: "0.83rem", fontWeight: 700, color: "#7c3aed", marginBottom: "8px" }}>
                  {card.subtitle}
                </p>
                <p style={{ fontSize: "0.88rem", lineHeight: 1.55, color: "#475569", marginBottom: "16px", flex: 1 }}>
                  {card.summary}
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    background: "#f8fafc",
                    marginBottom: "12px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700 }}>GÜNCEL / AVANTAJ</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 900, color: "#7c3aed" }}>{card.currentPrice}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700 }}>REFERANS BAZ</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>{card.referencePrice}</div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Link
                    href="/indirim-ai"
                    style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569", textDecoration: "none" }}
                  >
                    <Tag size={13} style={{ display: "inline", marginRight: "4px" }} />
                    İndirimAI Fiyat Geçmişi
                  </Link>
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
                      color: "#7c3aed",
                      textDecoration: "none",
                    }}
                  >
                    Mağaza / Kaynak <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Embedded Interactive Memory Game */}
      <div id="oyun-ai-memo">
        <OyunAIMemoryGame />
      </div>
    </div>
  );
}
