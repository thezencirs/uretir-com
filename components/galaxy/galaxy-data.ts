export type PlanetKind = "ocean" | "terra" | "gas" | "lava" | "ice" | "violet" | "desert" | "rose";

export type GalaxyPlanet = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  href: string;
  kind: PlanetKind;
  /** Orbit ring index: 0 inner, 1 middle, 2 outer. */
  ring: 0 | 1 | 2;
  /** Start angle in radians. */
  phase: number;
  radius: number;
  ringed?: boolean;
  colors: [string, string, string];
  atmosphere: string;
};

/** Twelve working tools of the Uretir universe across 5 galaxy clusters. */
export const galaxyPlanets: GalaxyPlanet[] = [
  { id: "tesvik-ai", title: "TeşvikAI", tagline: "Aile yardımları & hibe", description: "Hane gelirini yaz; doğum yardımı, SED, 150 bin TL evlilik kredisi ve KOSGEB hibelerinden sana çıkanları gör.", href: "/tesvik-ai", kind: "terra", ring: 0, phase: 0.15, radius: 1.15, ringed: true, colors: ["#064e3b", "#10b981", "#d1fae5"], atmosphere: "#34d399" },
  { id: "memur-ai", title: "MemurAI", tagline: "Memur alımı & KPSS", description: "KPSS şartsız işçi kuralarını, 50-60 KPSS memur ilanlarını, maaş zammını ve emekli promosyonlarını hesapla.", href: "/memur-ai", kind: "gas", ring: 0, phase: 1.75, radius: 1.12, colors: ["#78350f", "#f59e0b", "#fef3c7"], atmosphere: "#fbbf24" },
  { id: "puan-ai", title: "PuanAI", tagline: "Kart kampanyaları", description: "Alışverişini ve kartını yaz; doğrulanmış kampanyayı ve katılman gereken avantajı bulsun.", href: "/puan-ai", kind: "ocean", ring: 0, phase: 3.35, radius: 1.05, colors: ["#0b3a7a", "#2f86d6", "#e8f3ff"], atmosphere: "#6fb6ff" },
  { id: "indirim-ai", title: "İndirimAI", tagline: "Dip fiyat radarı", description: "30/90/360 günlük fiyat geçmişi ve sahte indirim filtresiyle gerçek fırsatı yakala.", href: "/indirim-ai", kind: "lava", ring: 0, phase: 4.9, radius: 0.9, colors: ["#2a0c06", "#d4501a", "#ffc36b"], atmosphere: "#ff8a4a" },
  { id: "insaat-ai", title: "İnşaatAI", tagline: "İnşaat maliyeti & imar", description: "Betonarme, çelik ve prefabrik ev m² maliyetini, demir/beton metrajını, arsa TAKS/KAKS ve Yarısı Bizden hibesini hesapla.", href: "/insaat-ai", kind: "desert", ring: 1, phase: 0.35, radius: 1.18, ringed: true, colors: ["#7c2d12", "#ea580c", "#ffedd5"], atmosphere: "#fb923c" },
  { id: "emlak-ai", title: "EmlakAI", tagline: "TÜFE kira & tapu harcı", description: "TÜİK 12 aylık TÜFE kira zammını, %4 tapu harcını, 120 ay konut kredisi taksitini ve Milli Emlak arsalarını incele.", href: "/emlak-ai", kind: "rose", ring: 1, phase: 1.9, radius: 1.12, colors: ["#881337", "#f43f5e", "#ffe4e6"], atmosphere: "#fb7185" },
  { id: "finans-ai", title: "FinansAI", tagline: "Canlı piyasa & faiz", description: "Dolar, altın, BIST 100 ve 32 günlük net mevduat faizi getirisini tek ekranda hesapla.", href: "/finans-ai", kind: "gas", ring: 1, phase: 3.45, radius: 1.38, ringed: true, colors: ["#6b4a1b", "#d9b36a", "#f6e6bf"], atmosphere: "#ffd98a" },
  { id: "ev-ai", title: "EvAI", tagline: "Kira çarpanı & ihale", description: "Çoklu platform konut ilanlarını, kira amortisman yılını ve kamu ihale konutlarını karşılaştır.", href: "/ev-ai", kind: "rose", ring: 1, phase: 5.0, radius: 1.0, colors: ["#4a1f3a", "#d36aa8", "#ffe1f0"], atmosphere: "#ff9ed2" },
  { id: "haber-ai", title: "HaberAI", tagline: "81 il haber haritası", description: "Şehir şehir Türkiye gündemini resmî kaynaklarla harita üzerinde izle.", href: "/haber-ai", kind: "terra", ring: 2, phase: 0.8, radius: 1.0, colors: ["#16507a", "#3f8b3a", "#d9c78a"], atmosphere: "#8fd6a0" },
  { id: "araba-ai", title: "ArabaAI", tagline: "Araç değerleme", description: "Sıfır araç liste fiyatlarını ve 2. el ekspertiz değer kaybını vitrinde kıyasla.", href: "/araba-ai", kind: "desert", ring: 2, phase: 2.35, radius: 1.12, colors: ["#4a1d0e", "#b4552a", "#f0c79a"], atmosphere: "#ff9f6a" },
  { id: "spor-ai", title: "SporAI", tagline: "Süper Lig ve UEFA", description: "xG beklentisi, UEFA ülke puanı ve spor ekonomisi verilerini incele.", href: "/spor-ai", kind: "ice", ring: 2, phase: 3.9, radius: 1.05, colors: ["#0c4a3a", "#2fa77a", "#d8f0d0"], atmosphere: "#6fe0b0" },
  { id: "oyun-ai", title: "OyunAI", tagline: "Oyun ve hafıza", description: "Steam ve Epic indirimlerini takip et, reklamsız hafıza oyununu oyna.", href: "/oyun-ai", kind: "violet", ring: 2, phase: 5.4, radius: 1.12, colors: ["#2a1260", "#7a4ae0", "#e6d9ff"], atmosphere: "#b69cff" },
];
