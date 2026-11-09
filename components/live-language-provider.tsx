"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export type SiteLang = "tr" | "en";

type LanguageContextValue = {
  lang: SiteLang;
  setLang: (next: SiteLang) => void;
  toggleLang: () => void;
  isTranslating: boolean;
};

const LanguageContext = createContext<LanguageContextValue>({
  lang: "tr",
  setLang: () => {},
  toggleLang: () => {},
  isTranslating: false,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

const STORAGE_KEY = "uretir-lang";
const CACHE_STORAGE_KEY = "uretir-en-cache-v1";

/** Instant 0ms curated dictionary for Galaxy, Header, Navigation & Core Tools */
const INSTANT_TR_EN: Record<string, string> = {
  // 3D Galaxy Homepage
  "ÜRETİR EVRENİ · 8 YAPAY ZEKÂ ARACI": "ÜRETİR UNIVERSE · 8 AI TOOLS",
  "İşimiz dünyayı döndürmek.": "Our job is to make the world go round.",
  "İŞİMİZ DÜNYAYI DÖNDÜRMEK": "OUR JOB IS TO MAKE THE WORLD GO ROUND",
  "Her gezegen çalışan bir aracımız. Üzerine gel, tıkla, keşfet.":
    "Every planet is a live AI tool we built. Hover, click, and explore.",
  "Gezegene git": "Launch Planet",
  "Kart kampanyaları": "Card Campaigns",
  "Alışverişini ve kartını yaz; doğrulanmış kampanyayı ve katılman gereken avantajı bulsun.":
    "Enter your purchase and card; our AI agent finds verified bank rewards and enrollment steps.",
  "81 il haber haritası": "81-Province News Map",
  "Şehir şehir Türkiye gündemini resmî kaynaklarla harita üzerinde izle.":
    "Track live verified news across all 81 provinces of Türkiye on an interactive map.",
  "Dip fiyat radarı": "Price Drop Radar",
  "30/90/360 günlük fiyat geçmişi ve sahte indirim filtresiyle gerçek fırsatı yakala.":
    "Spot real deals with 30/90/360-day price history charts and fake-discount filtering.",
  "Canlı piyasa": "Live Markets",
  "Dolar, altın, BIST 100 ve kripto verilerini tek ekranda izle.":
    "Monitor USD/TRY, Gold, BIST 100 stocks, and crypto markets in real time.",
  "Süper Lig ve UEFA": "Süper Lig & UEFA",
  "xG beklentisi, UEFA ülke puanı ve spor ekonomisi verilerini incele.":
    "Explore expected goals (xG), UEFA country coefficients, and sports analytics.",
  "Oyun ve hafıza": "Arcade & Gaming AI",
  "Steam ve Epic indirimlerini takip et, reklamsız hafıza oyununu oyna.":
    "Track Steam & Epic regional deals and play 60 FPS Circle Render arcade games live.",
  "Araç karşılaştırma": "Car Price Radar",
  "Sahibinden, Arabam ve resmî distribütör sıfır fiyatlarını vitrinde kıyasla.":
    "Compare official distributor zero-km prices and verified second-hand car listings.",
  "Emlak analizi": "Real Estate AI",
  "Çoklu platform konut ilanlarını ve kamu ihale konutlarını m² medyanıyla karşılaştır.":
    "Analyze housing listings and public auction properties with district m² medians.",

  // Header & Navigation
  "Türkiye üretir,": "Ideas made in Türkiye,",
  "gençler yetişir.": "engineered for the world.",
  "Gelişmeler": "Updates",
  "Gündemi, sporu ve üretimin geleceğini takip edin.": "Follow live news, markets, sports, and the future of production.",
  "Keşfet": "Explore",
  "Ekosistem": "Ecosystem",
  "Türkiye genelindeki bağımsız girişimleri keşfedin.": "Discover independent ventures and makers across Türkiye.",
  "Harita": "Ecosystem Map",
  "81 İl Haritası": "81-Province Map",
  "Çözümler": "AI Solutions",
  "Üretir tarafından geliştirilen 8 ana AI kategorisi ve ürünler.": "8 flagship AI engines and interactive products built by Üretir.",
  "Girişimler": "Ventures",
  "Web ve uygulama dünyasındaki çalışmalarımız.": "Our software studios, web platforms, and desktop tools.",
  "WEB Çözümleri": "Web Solutions",
  "Uygulamalar": "Applications",
  "Araçlar": "Tools",
  "Kaynaklar": "Resources",
  "Öğrenin, paylaşın ve birlikte geliştirin.": "Learn, collaborate, and build together.",
  "Topluluk": "Community",
  "Destek": "Support",
  "Hakkımızda": "About Us",
  "İletişim": "Contact",
  "Ara": "Search",
  "Ana sayfa": "Home",
  "Ana içeriğe geç": "Skip to main content",
  "Tüm gelişmeler": "All updates",
  "Tüm ekosistem": "All ecosystem",
  "Tüm çözümler": "All AI solutions",
  "Tüm girişimler": "All ventures",
  "Tüm kaynaklar": "All resources",

  // Common Tool UI
  "Canlı": "Live",
  "Yenile": "Refresh",
  "Gönder": "Send",
  "Temizle": "Clear",
  "Mağaza / Kaynak": "Store / Source",
  "İndirimAI Fiyat Geçmişi": "İndirimAI Price History",
  "GÜNCEL / AVANTAJ": "CURRENT / DEAL",
  "REFERANS BAZ": "REFERENCE BASE",
};

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "SVG", "CANVAS", "TEXTAREA", "INPUT"]);
const TURKISH_CHAR_RE = /[çğıöşüÇĞİÖŞÜ]/;
const COMMON_TR_WORDS_RE =
  /\b(ve|ile|için|olan|göre|olarak|daha|çok|체|en|bir|bu|şu|tüm|yeni|canlı|fiyat|indirim|kampanya|banka|kart|oyun|haber|şehir|ilçe|konut|araç|altın|dolar|borsa|puan|ücretsiz|hemen|keşfet|oyna|ara|seç|göster|gizle|başla|skor|rekor)\b/i;

function looksTurkish(text: string): boolean {
  const t = text.trim();
  if (t.length < 2) return false;
  if (INSTANT_TR_EN[t]) return true;
  if (TURKISH_CHAR_RE.test(t)) return true;
  if (COMMON_TR_WORDS_RE.test(t)) return true;
  return false;
}

export function LiveLanguageProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [lang, setLangState] = useState<SiteLang>("tr");
  const [isTranslating, setIsTranslating] = useState(false);

  const originalTextMap = useRef<WeakMap<Text, string>>(new WeakMap());
  const translatedSet = useRef<WeakMap<Text, string>>(new WeakMap());
  const originalAttrMap = useRef<WeakMap<Element, Record<string, string>>>(new WeakMap());
  const clientCache = useRef< Map<string, string> >(new Map());
  const pendingNodes = useRef<Map<string, Set<Text>>>(new Map());
  const flushTimer = useRef<number | null>(null);

  // Load saved language & persistent translation cache on mount
  useEffect(() => {
    try {
      const rawCache = localStorage.getItem(CACHE_STORAGE_KEY);
      if (rawCache) {
        const parsed = JSON.parse(rawCache) as Record<string, string>;
        for (const [k, v] of Object.entries(parsed)) {
          clientCache.current.set(k, v);
        }
      }
    } catch {
      // ignore storage errors
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SiteLang | null;
      if (saved === "en" || saved === "tr") {
        setLangState(saved);
        document.documentElement.lang = saved;
      } else if (pathname.startsWith("/en")) {
        setLangState("en");
        document.documentElement.lang = "en";
      }
    } catch {
      // ignore
    }
  }, [pathname]);

  const saveCacheToStorage = useCallback(() => {
    try {
      const obj: Record<string, string> = {};
      let count = 0;
      for (const [k, v] of clientCache.current.entries()) {
        obj[k] = v;
        count++;
        if (count > 800) break;
      }
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(obj));
    } catch {
      // ignore
    }
  }, []);

  const restoreTurkishDOM = useCallback(() => {
    if (typeof document === "undefined") return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode() as Text | null;
    while (node) {
      const orig = originalTextMap.current.get(node);
      if (orig !== undefined && node.nodeValue !== orig) {
        node.nodeValue = orig;
      }
      node = walker.nextNode() as Text | null;
    }

    const elements = document.body.querySelectorAll("[placeholder],[aria-label],[title]");
    elements.forEach((el) => {
      const origAttrs = originalAttrMap.current.get(el);
      if (!origAttrs) return;
      for (const [attr, val] of Object.entries(origAttrs)) {
        if (el.getAttribute(attr) !== val) {
          el.setAttribute(attr, val);
        }
      }
    });
  }, []);

  const flushPendingTranslations = useCallback(async () => {
    if (pendingNodes.current.size === 0) return;
    const entries = Array.from(pendingNodes.current.entries());
    pendingNodes.current.clear();

    const batchSize = 40;
    setIsTranslating(true);
    try {
      for (let i = 0; i < entries.length; i += batchSize) {
        const slice = entries.slice(i, i + batchSize);
        const texts = slice.map(([t]) => t);
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts, to: "en" }),
        });
        if (!res.ok) continue;
        const data = (await res.json()) as { translations?: string[] };
        const translations = data.translations || [];
        slice.forEach(([origTrimmed, nodeSet], idx) => {
          const translated = translations[idx] || origTrimmed;
          clientCache.current.set(origTrimmed, translated);
          nodeSet.forEach((textNode) => {
            const rawOrig = originalTextMap.current.get(textNode) ?? textNode.nodeValue ?? "";
            const leading = rawOrig.match(/^\s*/)?.[0] ?? "";
            const trailing = rawOrig.match(/\s*$/)?.[0] ?? "";
            const nextVal = `${leading}${translated}${trailing}`;
            translatedSet.current.set(textNode, nextVal);
            textNode.nodeValue = nextVal;
          });
        });
      }
      saveCacheToStorage();
    } catch {
      // ignore network error
    } finally {
      setIsTranslating(false);
    }
  }, [saveCacheToStorage]);

  const translateDOMToEnglish = useCallback(() => {
    if (typeof document === "undefined" || !document.body) return;

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode() as Text | null;

    while (node) {
      const parent = node.parentElement;
      if (
        parent &&
        !SKIP_TAGS.has(parent.tagName) &&
        !parent.closest("[data-no-translate='true']")
      ) {
        const currentVal = node.nodeValue ?? "";
        const lastTranslated = translatedSet.current.get(node);

        // If node hasn't been recorded or React updated its text since our last translation
        if (!originalTextMap.current.has(node) || (lastTranslated !== undefined && currentVal !== lastTranslated)) {
          originalTextMap.current.set(node, currentVal);
        }

        const rawOrig = originalTextMap.current.get(node) ?? currentVal;
        const trimmed = rawOrig.trim();

        if (trimmed && looksTurkish(trimmed)) {
          const leading = rawOrig.match(/^\s*/)?.[0] ?? "";
          const trailing = rawOrig.match(/\s*$/)?.[0] ?? "";
          const instant = INSTANT_TR_EN[trimmed] ?? clientCache.current.get(trimmed);

          if (instant) {
            const nextVal = `${leading}${instant}${trailing}`;
            if (node.nodeValue !== nextVal) {
              translatedSet.current.set(node, nextVal);
              node.nodeValue = nextVal;
            }
          } else {
            const setForText = pendingNodes.current.get(trimmed) ?? new Set<Text>();
            setForText.add(node);
            pendingNodes.current.set(trimmed, setForText);
          }
        }
      }
      node = walker.nextNode() as Text | null;
    }

    // Translate placeholders immediately where available
    const elements = document.body.querySelectorAll("[placeholder]");
    elements.forEach((el) => {
      const ph = el.getAttribute("placeholder");
      if (!ph) return;
      let attrs = originalAttrMap.current.get(el);
      if (!attrs) {
        attrs = { placeholder: ph };
        originalAttrMap.current.set(el, attrs);
      }
      const origPh = attrs.placeholder ?? ph;
      const instant = INSTANT_TR_EN[origPh.trim()] ?? clientCache.current.get(origPh.trim());
      if (instant && el.getAttribute("placeholder") !== instant) {
        el.setAttribute("placeholder", instant);
      }
    });

    if (pendingNodes.current.size > 0) {
      if (flushTimer.current) window.clearTimeout(flushTimer.current);
      flushTimer.current = window.setTimeout(() => {
        flushPendingTranslations();
      }, 90);
    }
  }, [flushPendingTranslations]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;

    if (lang === "tr") {
      restoreTurkishDOM();
      return;
    }

    translateDOMToEnglish();

    const observer = new MutationObserver(() => {
      translateDOMToEnglish();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      if (flushTimer.current) window.clearTimeout(flushTimer.current);
    };
  }, [lang, pathname, restoreTurkishDOM, translateDOMToEnglish]);

  const setLang = useCallback((next: SiteLang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next;
    } catch {
      // ignore
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "tr" ? "en" : "tr");
  }, [lang, setLang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
}
