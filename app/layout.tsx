import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { AnalyticsEventBridge } from "@/components/analytics-event-bridge";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl, DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_NAME, SITE_URL } from "@/lib/seo";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.svg`, width: 512, height: 512 },
  description: DEFAULT_DESCRIPTION,
  slogan: "Türkiye üretir, gençler yetişir.",
  email: "merhaba@uretir.com",
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
  potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/ara?q={search_term_string}`, "query-input": "required name=search_term_string" },
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: "%s — Üretir" },
  description: DEFAULT_DESCRIPTION,
  keywords: ["üretim", "yapay zekâ", "teknoloji", "mühendislik", "mimarlık", "girişimcilik", "üretkenlik"],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: "/", types: { "application/rss+xml": absoluteUrl("/feed.xml") } },
  category: "Manufacturing knowledge platform",
  referrer: "origin-when-cross-origin",
  openGraph: { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, url: SITE_URL, siteName: SITE_NAME, type: "website", locale: "tr_TR", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: DEFAULT_TITLE }] },
  twitter: { card: "summary_large_image", title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, images: ["/opengraph-image"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#c8f560" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr" suppressHydrationWarning data-scroll-behavior="smooth"><body>
    <Script id="theme-init" strategy="beforeInteractive">{`(() => { try { const saved = localStorage.getItem("uretir-theme"); const dark = saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; document.documentElement.classList.toggle("dark", dark); } catch {} })()`}</Script>
    <a href="#main-content" className="skip-link">Ana içeriğe geç</a>
    <JsonLd data={[organizationSchema, websiteSchema]} />
    <AnalyticsEventBridge />
    <Header />
    <main id="main-content" tabIndex={-1}>{children}</main>
    <Footer />
  </body></html>;
}
