"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="tr">
    <body style={{ margin: 0, background: "#f7f7f3", color: "#10120f", fontFamily: "Arial, sans-serif" }}>
      <main style={{ display: "grid", minHeight: "100vh", placeItems: "center", padding: 32 }}>
        <section style={{ maxWidth: 760, borderTop: "1px solid rgba(16,18,15,.13)", borderBottom: "1px solid rgba(16,18,15,.13)", padding: "64px 0" }}>
          <p style={{ color: "#71756c", fontSize: 11, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase" }}>Üretir / Sistem durumu</p>
          <h1 style={{ margin: "24px 0 0", fontFamily: "Georgia, serif", fontSize: "clamp(48px, 9vw, 88px)", letterSpacing: "-.07em", lineHeight: .9 }}>Beklenmeyen bir sorun oluştu.</h1>
          <p style={{ maxWidth: 560, marginTop: 28, color: "#71756c", fontSize: 15, lineHeight: 1.7 }}>İçeriği güvenli biçimde yeniden yüklemeyi deneyebilirsiniz.</p>
          <button type="button" onClick={reset} style={{ minHeight: 44, marginTop: 28, border: 0, borderRadius: 999, background: "#10120f", color: "#f7f7f3", cursor: "pointer", fontWeight: 700, padding: "0 20px" }}>Yeniden dene</button>
        </section>
      </main>
    </body>
  </html>;
}
