import { ImageResponse } from "next/og";

export const alt = "Üretir — Fikri gerçeğe dönüştürenler için";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ background: "#183b4b", color: "#f2f3ed", display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", padding: "64px 72px", position: "relative", width: "100%" }}><div style={{ color: "#c8f560", display: "flex", fontSize: 24, fontWeight: 700, letterSpacing: "-0.06em" }}>üretir<span style={{ color: "#f2f3ed" }}>.</span></div><div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 790 }}><div style={{ color: "#b7c9bd", display: "flex", fontSize: 18, letterSpacing: "0.18em", textTransform: "uppercase" }}>Üretim / Teknoloji / Yapay zekâ</div><div style={{ display: "flex", fontFamily: "Georgia", fontSize: 86, letterSpacing: "-0.07em", lineHeight: .9 }}>Fikri gerçeğe<br /><i style={{ color: "#c8f560" }}>dönüştür.</i></div></div><div style={{ color: "#b7c9bd", display: "flex", fontSize: 16, justifyContent: "space-between", letterSpacing: "0.14em", textTransform: "uppercase" }}><span>Merak edenler için bir yayın</span><span>uretir.com</span></div><div style={{ border: "1px solid rgba(242,243,237,.26)", borderRadius: "50%", display: "flex", height: 370, position: "absolute", right: 70, top: 130, width: 370 }} /></div>, { ...size });
}
