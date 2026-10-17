import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import "./channel-tools.css";
import "leaflet/dist/leaflet.css";
import { AnalyticsEventBridge } from "@/components/analytics-event-bridge";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import { GoogleMonetization, GoogleSiteVerification } from "@/components/google-monetization";
import { absoluteUrl, DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_NAME, SITE_URL } from "@/lib/seo";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "NewsMediaOrganization"],
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: absoluteUrl("/icon.svg"),
    width: 512,
    height: 512,
  },
  description: DEFAULT_DESCRIPTION,
  slogan: "Türkiye üretir, gençler yetişir.",
  email: "merhaba@uretir.com",
  areaServed: {
    "@type": "Country",
    name: "Türkiye",
  },
  sameAs: [
    "https://www.instagram.com/uretirai",
    "https://www.youtube.com/@Uretir",
    "https://t.me/uretirbot",
    "https://whatsapp.com/channel/0029VbDk4gHGpLHXkGseaf3Y",
    "https://whatsapp.com/channel/0029VbDIS6B4inoiXI8jeE05",
    "https://whatsapp.com/channel/0029VbDbbII8PgsA574OLl1H",
    "https://whatsapp.com/channel/0029VbEFC5zICVfmJzjAfY2Q",
    "https://whatsapp.com/channel/0029Vb8r7Vh8F2p8FcGDsj1L",
    "https://whatsapp.com/channel/0029VaBzvL33gvWb52bNHv0q",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  inLanguage: "tr-TR",
  publisher: { "@id": `${SITE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/haber-ai?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const siteNavigationSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "@id": `${SITE_URL}/#navigation`,
  name: "Üretir Doğrulanmış Veri ve Araştırma Araçları",
  itemListElement: [
    { "@type": "SiteNavigationElement", position: 1, name: "HaberAI · 81 İl Türkiye Gündem Haritası", url: `${SITE_URL}/haber-ai` },
    { "@type": "SiteNavigationElement", position: 2, name: "İndirimAI · 30/90/360 Gün Fiyat Geçmişi ve Kampanya Radarı", url: `${SITE_URL}/indirim-ai` },
    { "@type": "SiteNavigationElement", position: 3, name: "FinansAI · Canlı Döviz, Altın, BIST 100 ve Emtia Ekranı", url: `${SITE_URL}/finans-ai` },
    { "@type": "SiteNavigationElement", position: 4, name: "PuanAI · Resmî Banka ve Kredi Kartı Kampanya Karşılaştırma", url: `${SITE_URL}/puan-ai` },
    { "@type": "SiteNavigationElement", position: 5, name: "ArabaAI · Sıfır Araç Liste Fiyatı ve Haritalı 2. El Kıyaslama", url: `${SITE_URL}/araba-ai` },
    { "@type": "SiteNavigationElement", position: 6, name: "EvAI · Haritalı Konut, Arsa ve Kamu İhale Taşınmaz Analizi", url: `${SITE_URL}/ev-ai` },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: "%s — Üretir" },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "üretim",
    "teknoloji",
    "mühendislik",
    "mimarlık",
    "girişimcilik",
    "üretkenlik",
    "HaberAI",
    "FinansAI",
    "PuanAI",
    "İndirimAI",
    "ArabaAI",
    "EvAI",
    "81 il haber haritası",
    "Türkiye gündem haritası",
    "kredi kartı kampanyaları",
    "fiyat geçmişi takip",
    "gerçek indirim bulucu",
    "sıfır araç fiyatları 2026",
    "konut metrekare fiyatları",
    "kamu ihale taşınmaz ilanları",
    "canlı döviz altın borsa",
  ],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
    languages: { "tr-TR": SITE_URL, "en-US": `${SITE_URL}/en` },
    types: { "application/rss+xml": absoluteUrl("/feed.xml") },
  },
  category: "News, Finance, E-Commerce Price Tracking & Real Estate Intelligence",
  referrer: "origin-when-cross-origin",
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "tr_TR",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: DEFAULT_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#c8f560",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>
        <GoogleSiteVerification />
        <GoogleMonetization />
        <Script id="theme-init" strategy="beforeInteractive">{`(() => { document.documentElement.lang = /^\\/en(?:\\/|$)/.test(location.pathname) ? "en" : "tr"; try { const saved = localStorage.getItem("uretir-theme"); const dark = saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; document.documentElement.classList.toggle("dark", dark); } catch {} })()`}</Script>
        <a href="#main-content" className="skip-link">
          Ana içeriğe geç
        </a>
        <JsonLd data={[organizationSchema, websiteSchema, siteNavigationSchema]} />
        <AnalyticsEventBridge />
        <Header />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
