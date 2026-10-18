import { ArrowUpRight, BellRing, MessageCircle, Sparkles } from "lucide-react";
import { channelTools } from "@/lib/channel-tools";

export function WhatsAppGrowthBanner() {
  return (
    <section
      className="section-wrap"
      style={{ paddingTop: "12px", paddingBottom: "16px" }}
      aria-label="WhatsApp Kanalları Erken Bildirim ve Kupon Kancası"
    >
      <div
        style={{
          borderRadius: "22px",
          padding: "22px 24px",
          background: "linear-gradient(135deg, #052e16 0%, #064e3b 55%, #0f172a 100%)",
          color: "#f8fafc",
          border: "1px solid rgba(52, 211, 153, 0.35)",
          boxShadow: "0 16px 40px rgba(5, 46, 22, 0.18)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: "14px",
          }}
        >
          <div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 11px",
                borderRadius: "999px",
                background: "rgba(52, 211, 153, 0.2)",
                color: "#6ee7b7",
                fontSize: "0.74rem",
                fontWeight: 800,
                letterSpacing: "0.04em",
              }}
            >
              <BellRing size={13} /> ÖNCE WHATSAPP&apos;TA · ANLIK KUPON &amp; FİYAT DİBİ BİLDİRİM HATTI
            </span>
            <h2 style={{ fontSize: "clamp(1.2rem, 2.2vw, 1.55rem)", fontWeight: 900, marginTop: "8px", color: "#ffffff" }}>
              Stoklarla sınırlı indirim kuponlarını ve emsal altı ilanları sosyal medyadan 30 dk önce cebine al.
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#cbd5e1", marginTop: "4px" }}>
              Telefon numaranız kimseyle paylaşılmaz (WhatsApp Resmi Kanal Gizliliği). İlgilendiğiniz kategorinin
              kanalına tek dokunuşla ücretsiz katılıp bildirim zilini açın:
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(215px, 1fr))",
            gap: "10px",
          }}
        >
          {channelTools.map((tool) => (
            <a
              key={tool.slug}
              href={tool.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                background: "rgba(255, 255, 255, 0.09)",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                color: "#ffffff",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.9rem", color: "#6ee7b7" }}>
                  <MessageCircle size={15} /> {tool.name} Kanalı
                </strong>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background: "#10b981",
                    color: "#052e16",
                    fontSize: "0.68rem",
                    fontWeight: 900,
                  }}
                >
                  Katıl <ArrowUpRight size={11} style={{ display: "inline" }} />
                </span>
              </div>
              <span style={{ fontSize: "0.75rem", color: "#e2e8f0" }}>{tool.category}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
