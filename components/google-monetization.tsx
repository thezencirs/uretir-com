import Script from "next/script";

const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const verification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleMonetization() {
  if (!clientId) return null;
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

export function GoogleAnalytics() {
  if (!gaMeasurementId) return null;
  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} window.gtag = gtag; gtag('js', new Date()); gtag('config', '${gaMeasurementId}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}

export function GoogleSiteVerification() {
  return verification ? <meta name="google-site-verification" content={verification} /> : null;
}

export function AdSlot({ slot, format = "auto" }: { slot: string; format?: string }) {
  if (!clientId) return null;
  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", minHeight: 90 }}
      data-ad-client={clientId}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
