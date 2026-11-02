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

/** Eight working tools of the site. Each planet is a real link into the product. */
export const galaxyPlanets: GalaxyPlanet[] = [
  { id: "puan-ai", title: "PuanAI", tagline: "Kart kampanyaları", description: "Alışverişini ve kartını yaz; doğrulanmış kampanyayı ve katılman gereken avantajı bulsun.", href: "/puan-ai", kind: "ocean", ring: 0, phase: 0.2, radius: 1.05, colors: ["#0b3a7a", "#2f86d6", "#e8f3ff"], atmosphere: "#6fb6ff" },
  { id: "haber-ai", title: "HaberAI", tagline: "81 il haber haritası", description: "Şehir şehir Türkiye gündemini resmî kaynaklarla harita üzerinde izle.", href: "/haber-ai", kind: "terra", ring: 0, phase: 2.35, radius: 1.0, colors: ["#16507a", "#3f8b3a", "#d9c78a"], atmosphere: "#8fd6a0" },
  { id: "indirim-ai", title: "İndirimAI", tagline: "Dip fiyat radarı", description: "30/90/360 günlük fiyat geçmişi ve sahte indirim filtresiyle gerçek fırsatı yakala.", href: "/indirim-ai", kind: "lava", ring: 0, phase: 4.4, radius: 0.85, colors: ["#2a0c06", "#d4501a", "#ffc36b"], atmosphere: "#ff8a4a" },
  { id: "finans-ai", title: "FinansAI", tagline: "Canlı piyasa", description: "Dolar, altın, BIST 100 ve kripto verilerini tek ekranda izle.", href: "/finans-ai", kind: "gas", ring: 1, phase: 0.9, radius: 1.45, ringed: true, colors: ["#6b4a1b", "#d9b36a", "#f6e6bf"], atmosphere: "#ffd98a" },
  { id: "spor-ai", title: "SporAI", tagline: "Süper Lig ve UEFA", description: "xG beklentisi, UEFA ülke puanı ve spor ekonomisi verilerini incele.", href: "/spor-ai", kind: "terra", ring: 1, phase: 3.0, radius: 1.1, colors: ["#0c4a3a", "#2fa77a", "#d8f0d0"], atmosphere: "#6fe0b0" },
  { id: "oyun-ai", title: "OyunAI", tagline: "Oyun ve hafıza", description: "Steam ve Epic indirimlerini takip et, reklamsız hafıza oyununu oyna.", href: "/oyun-ai", kind: "violet", ring: 1, phase: 5.1, radius: 1.2, colors: ["#2a1260", "#7a4ae0", "#e6d9ff"], atmosphere: "#b69cff" },
  { id: "araba-ai", title: "ArabaAI", tagline: "Araç karşılaştırma", description: "Sahibinden, Arabam ve resmî distribütör sıfır fiyatlarını vitrinde kıyasla.", href: "/araba-ai", kind: "desert", ring: 2, phase: 1.55, radius: 1.15, colors: ["#4a1d0e", "#b4552a", "#f0c79a"], atmosphere: "#ff9f6a" },
  { id: "ev-ai", title: "EvAI", tagline: "Emlak analizi", description: "Çoklu platform konut ilanlarını ve kamu ihale konutlarını m² medyanıyla karşılaştır.", href: "/ev-ai", kind: "rose", ring: 2, phase: 4.65, radius: 1.0, colors: ["#4a1f3a", "#d36aa8", "#ffe1f0"], atmosphere: "#ff9ed2" },
];
