import Script from "next/script";
const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const verification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
export function GoogleMonetization() { if (!clientId) return null; return <Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`} crossOrigin="anonymous" strategy="afterInteractive" />; }
export function GoogleSiteVerification() { return verification ? <meta name="google-site-verification" content={verification} /> : null; }
export function AdSlot({ slot, format = "auto" }: { slot: string; format?: string }) { if (!clientId) return null; return <ins className="adsbygoogle" style={{ display: "block", minHeight: 90 }} data-ad-client={clientId} data-ad-slot={slot} data-ad-format={format} data-full-width-responsive="true" />; }
