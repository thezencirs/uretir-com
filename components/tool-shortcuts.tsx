import Link from "next/link";
import { ArrowUpRight, CarFront, ChartNoAxesCombined, Gamepad2, House, MapPinned, MessageCircle, Tags, Trophy, WalletCards } from "lucide-react";
import { categoryHubTools, type CategoryHubSlug } from "@/lib/channel-tools";
import { analyticsAttributes } from "@/lib/analytics";

const icons: Record<CategoryHubSlug, typeof MapPinned> = {
  "haber-ai": MapPinned,
  "puan-ai": WalletCards,
  "indirim-ai": Tags,
  "finans-ai": ChartNoAxesCombined,
  "spor-ai": Trophy,
  "oyun-ai": Gamepad2,
  "araba-ai": CarFront,
  "ev-ai": House,
};

export function ToolShortcuts() {
  return (
    <section id="araclar" className="channel-tools section-wrap" aria-labelledby="channel-tools-title">
      <div className="channel-tools-heading">
        <div>
          <p className="rule-label">ÜRETİR / 8 BAĞIMSIZ YAPAY ZEKÂ KATEGORİSİ VE CANLI VİTRİN</p>
          <h2 id="channel-tools-title">
            Günlük hayatın
            <br />
            <em>sekiz AI merkezi.</em>
          </h2>
        </div>
        <div>
          <p>
            HaberAI, PuanAI, İndirimAI, FinansAI, SporAI, OyunAI, ArabaAI ve EvAI kategorilerini fotoğraflı önizlemelerle
            incele; her başlığı kendi özel sayfasında ve WhatsApp kanalında takip et.
          </p>
          <span>
            <MessageCircle size={15} aria-hidden="true" /> 8 ayrı kategori sayfası · Fotoğraflı canlı veri önizlemesi
          </span>
        </div>
      </div>
      <div className="channel-tool-grid">
        {categoryHubTools.map((tool, index) => {
          const Icon = icons[tool.slug];
          return (
            <article
              key={tool.slug}
              className="channel-tool-card"
              style={{ "--tool-color": tool.color } as React.CSSProperties}
            >
              <Link
                href={`/${tool.slug}`}
                className="channel-tool-open"
                {...analyticsAttributes({ event: "discovery_select", surface: "content_discovery", target: tool.slug })}
              >
                <div
                  style={{
                    position: "relative",
                    height: "148px",
                    margin: "-4px -4px 14px -4px",
                    borderRadius: "14px",
                    overflow: "hidden",
                    background: "#0f172a",
                  }}
                >
                  <img
                    src={tool.previewImage}
                    alt={`${tool.name} — ${tool.category} fotoğraf önizlemesi`}
                    loading={index < 4 ? "eager" : "lazy"}
                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.9 }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(15,23,42,0.84) 0%, rgba(15,23,42,0.12) 65%)",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      background: tool.color,
                      color: "#ffffff",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {tool.badge}
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      left: "12px",
                      right: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      color: "#f8fafc",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                    }}
                  >
                    <span>
                      {String(index + 1).padStart(2, "0")} / {tool.category}
                    </span>
                    <span>/{tool.slug} ↗</span>
                  </span>
                </div>

                <div className="channel-tool-top">
                  <span className="channel-tool-icon">
                    <Icon size={25} aria-hidden="true" />
                  </span>
                  <span>
                    {String(index + 1).padStart(2, "0")} / {tool.category}
                  </span>
                  <ArrowUpRight size={19} aria-hidden="true" />
                </div>
                <h3>{tool.name}</h3>
                <p>{tool.description}</p>
                <ul>
                  {tool.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <span className="channel-tool-action">
                  {tool.name} kategorisini aç <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              </Link>
              <a
                className="channel-tool-whatsapp"
                href={tool.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${tool.name} WhatsApp kanalını aç (yeni sekme)`}
                {...analyticsAttributes({
                  event: "navigation_select",
                  surface: "content_discovery",
                  target: `${tool.slug}-whatsapp`,
                })}
              >
                <MessageCircle size={17} aria-hidden="true" /> WhatsApp kanalını takip et{" "}
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </article>
          );
        })}
      </div>
      <p className="channel-tools-note">
        8 bağımsız kategori sayfası: HaberAI, PuanAI, İndirimAI, FinansAI, SporAI, OyunAI, ArabaAI ve EvAI. Kaynak,
        fotoğraf önizlemesi ve tarih bilgileri her kategorinin kendi sayfasında şeffaf biçimde sunulur.
      </p>
    </section>
  );
}
