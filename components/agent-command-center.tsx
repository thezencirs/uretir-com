"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Activity,
  Bot,
  CheckCircle2,
  ExternalLink,
  Flame,
  Lock,
  LogOut,
  MessageCircle,
  Play,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { AgentStatusItem, CategoryPostPlan, WhatsAppGrowthPlaybook } from "@/lib/agents/engine";

type FleetPayload = {
  authenticated: boolean;
  checkedAt?: string;
  systemMode?: string;
  message?: string;
  instagramAuditSummary?: {
    account: string;
    duplicatePolicy: string;
    backgroundPolicy: string;
    audioPolicy: string;
    categorySeparation: string;
    lastCleanupCount: number;
  };
  agents?: AgentStatusItem[];
  separatePostPlans?: CategoryPostPlan[];
  whatsappPlaybook?: WhatsAppGrowthPlaybook;
};

export function AgentCommandCenter() {
  const [data, setData] = useState<FleetPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "social-viral" | "data-crawler" | "compliance-growth">("all");

  async function loadStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/agents", { cache: "no-store" });
      const json = (await res.json()) as FleetPayload;
      setData(json);
    } catch {
      setAuthError("Ajan servisine bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setAuthError("");
    setBusyId("login");
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAuthError(json.error || "Giriş başarısız.");
      } else {
        setData(json);
        setPassword("");
      }
    } catch {
      setAuthError("Giriş sırasında bağlantı hatası oluştu.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setData({ authenticated: false });
  }

  async function triggerAgent(agentId?: string, categorySlug?: string) {
    const key = categorySlug || agentId || "all";
    setBusyId(key);
    setToast("");
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run-agent", agentId, categorySlug }),
      });
      const json = await res.json();
      if (res.ok) {
        setData(json);
        setToast(json.message || "Ajan görevi tamamlandı.");
      }
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <section className="section-wrap" style={{ padding: "64px 0" }}>
        <div
          style={{
            borderRadius: "24px",
            padding: "40px",
            background: "#0f172a",
            color: "#f8fafc",
            textAlign: "center",
          }}
        >
          <RefreshCw size={28} className="animate-spin" style={{ margin: "0 auto 12px auto", color: "#34d399" }} />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Üretir 12 Ajan Komuta Merkezi Yükleniyor…</h1>
        </div>
      </section>
    );
  }

  if (!data?.authenticated) {
    return (
      <section className="section-wrap" style={{ padding: "48px 0 80px 0" }} aria-labelledby="agent-login-title">
        <div
          style={{
            maxWidth: "520px",
            margin: "0 auto",
            borderRadius: "28px",
            padding: "36px 32px",
            background: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)",
            color: "#f8fafc",
            boxShadow: "0 24px 60px rgba(15, 23, 42, 0.32)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "999px",
              background: "rgba(52, 211, 153, 0.16)",
              color: "#6ee7b7",
              fontSize: "0.76rem",
              fontWeight: 800,
              marginBottom: "16px",
            }}
          >
            <Lock size={14} /> ŞİFRELİ YÖNETİCİ PANELİ · URETIR.COM/AJANLAR
          </div>

          <h1 id="agent-login-title" style={{ fontSize: "1.75rem", fontWeight: 900, lineHeight: 1.2, marginBottom: "10px" }}>
            Üretir 12 Otonom Ajan Komuta Merkezi
          </h1>
          <p style={{ fontSize: "0.92rem", color: "#cbd5e1", lineHeight: 1.6, marginBottom: "24px" }}>
            Sosyal Medya Uzmanı, İhlal & Tekrar Denetçisi, Instagram Viral Uzmanı, Keşfet Uzmanı, WhatsApp Abone
            Büyüme Ajanı ve 6 Veri Ajanını (HaberAI, PuanAI, İndirimAI, FinansAI, EvAI, ArabaAI) canlı izlemek için
            yönetici şifrenizi girin.
          </p>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.84rem", fontWeight: 700 }}>
              <span>Yönetici / Ajan Paneli Şifresi</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi girin..."
                required
                style={{
                  padding: "13px 16px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.22)",
                  background: "rgba(15, 23, 42, 0.8)",
                  color: "#ffffff",
                  fontSize: "1rem",
                }}
              />
            </label>

            {authError && (
              <div
                role="alert"
                style={{
                  padding: "10px 14px",
                  borderRadius: "12px",
                  background: "rgba(239, 68, 68, 0.18)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  color: "#fca5a5",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={busyId === "login"}
              style={{
                padding: "14px 20px",
                borderRadius: "999px",
                background: "#10b981",
                color: "#052e16",
                fontWeight: 900,
                fontSize: "0.95rem",
                border: "none",
                cursor: "pointer",
                marginTop: "4px",
              }}
            >
              {busyId === "login" ? "Doğrulanıyor…" : "Ajan Komuta Merkezini Aç →"}
            </button>
          </form>
        </div>
      </section>
    );
  }

  const agents = data.agents ?? [];
  const filteredAgents = activeTab === "all" ? agents : agents.filter((a) => a.group === activeTab);
  const plans = data.separatePostPlans ?? [];
  const wa = data.whatsappPlaybook;

  return (
    <section className="section-wrap" style={{ paddingTop: "24px", paddingBottom: "64px" }} aria-labelledby="agent-hq-heading">
      {/* Top Command Header */}
      <div
        style={{
          borderRadius: "24px",
          padding: "28px",
          background: "linear-gradient(135deg, #090d16 0%, #0f172a 60%, #064e3b 100%)",
          color: "#f8fafc",
          marginBottom: "24px",
          boxShadow: "0 20px 50px rgba(15, 23, 42, 0.25)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "999px",
              background: "rgba(16, 185, 129, 0.2)",
              color: "#6ee7b7",
              fontSize: "0.78rem",
              fontWeight: 800,
            }}
          >
            <Bot size={15} /> {data.systemMode}
          </span>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => triggerAgent("all")}
              disabled={busyId !== null}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 16px",
                borderRadius: "999px",
                background: "#10b981",
                color: "#052e16",
                fontWeight: 900,
                fontSize: "0.82rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={14} className={busyId === "all" ? "animate-spin" : ""} />
              Tüm 12 Ajanı Şimdi Çalıştır
            </button>
            <Link
              href="/yonetici"
              style={{
                padding: "9px 16px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.1)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "0.82rem",
                textDecoration: "none",
              }}
            >
              Site Editörü (/yonetici)
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "9px 14px",
                borderRadius: "999px",
                background: "rgba(239,68,68,0.18)",
                color: "#fca5a5",
                fontWeight: 700,
                fontSize: "0.82rem",
                border: "1px solid rgba(239,68,68,0.35)",
                cursor: "pointer",
              }}
            >
              <LogOut size={14} /> Çıkış
            </button>
          </div>
        </div>

        <h1 id="agent-hq-heading" style={{ fontSize: "clamp(1.65rem, 3vw, 2.35rem)", fontWeight: 900, marginBottom: "10px" }}>
          Üretir 12 Ajan Canlı İzleme, İhlal Denetimi ve Bağımsız Yayın Paneli
        </h1>
        <p style={{ fontSize: "0.95rem", color: "#cbd5e1", maxWidth: "900px", lineHeight: 1.6, marginBottom: "20px" }}>
          Instagram <strong>@uretirai</strong> hesabındaki tekrarlar temizlendi, yapay zekâ seslendirme (TTS) kapatıldı,
          tam ekran (full-bleed) gerçek fotoğraf arka plan standardı devreye alındı ve <strong>HaberAI, PuanAI,
          İndirimAI, FinansAI, EvAI, ArabaAI, SporAI, OyunAI</strong> paylaşımları birbirinden tamamen ayrıldı.
        </p>

        {toast && (
          <div
            role="status"
            style={{
              padding: "12px 16px",
              borderRadius: "14px",
              background: "rgba(16, 185, 129, 0.22)",
              border: "1px solid #10b981",
              color: "#a7f3d0",
              fontWeight: 800,
              fontSize: "0.88rem",
              marginBottom: "16px",
            }}
          >
            ✅ {toast}
          </div>
        )}

        {/* Audit & Compliance Strip */}
        {data.instagramAuditSummary && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "12px",
            }}
          >
            <div style={{ padding: "14px", borderRadius: "16px", background: "rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 800 }}>TEKRAR & İHLAL DENETİMİ</div>
              <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#34d399", marginTop: "4px" }}>
                {data.instagramAuditSummary.duplicatePolicy}
              </div>
            </div>
            <div style={{ padding: "14px", borderRadius: "16px", background: "rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 800 }}>ARKA PLAN STANDARDI</div>
              <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#38bdf8", marginTop: "4px" }}>
                {data.instagramAuditSummary.backgroundPolicy}
              </div>
            </div>
            <div style={{ padding: "14px", borderRadius: "16px", background: "rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 800 }}>SES POLİTİKASI</div>
              <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#fbbf24", marginTop: "4px" }}>
                {data.instagramAuditSummary.audioPolicy}
              </div>
            </div>
            <div style={{ padding: "14px", borderRadius: "16px", background: "rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 800 }}>KATEGORİ AYRIMI</div>
              <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#f472b6", marginTop: "4px" }}>
                {data.instagramAuditSummary.categorySeparation}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Agent Group Filter Tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
        {[
          { id: "all", label: "Tüm Ajanlar (12 Aktif Ajan)" },
          { id: "social-viral", label: "Sosyal Medya, Viral & Keşfet Ajanları (4)" },
          { id: "compliance-growth", label: "İhlal Denetimi & WhatsApp Büyüme Ajanları (2)" },
          { id: "data-crawler", label: "Veri Çekme Ajanları: Haber, Puan, İndirim, Finans, Ev, Araba (6)" },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                padding: "9px 16px",
                borderRadius: "999px",
                border: active ? "1px solid #059669" : "1px solid rgba(15, 23, 42, 0.15)",
                background: active ? "#059669" : "#ffffff",
                color: active ? "#ffffff" : "#0f172a",
                fontWeight: 800,
                fontSize: "0.84rem",
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 12 Agents Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "18px",
          marginBottom: "36px",
        }}
      >
        {filteredAgents.map((agent) => (
          <article
            key={agent.id}
            style={{
              borderRadius: "20px",
              border: "1px solid rgba(15, 23, 42, 0.12)",
              background: "#ffffff",
              padding: "20px",
              boxShadow: "0 10px 26px rgba(15, 23, 42, 0.05)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "10px" }}>
              <div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    background: "#ecfdf5",
                    color: "#047857",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                  }}
                >
                  <CheckCircle2 size={13} /> AKTİF · SAĞLIK %{agent.healthScore}
                </span>
                <h2 style={{ fontSize: "1.12rem", fontWeight: 900, color: "#0f172a", marginTop: "6px" }}>
                  {agent.name}
                </h2>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#059669" }}>{agent.role}</div>
              </div>

              <button
                type="button"
                onClick={() => triggerAgent(agent.id, agent.targetCategorySlug || undefined)}
                disabled={busyId !== null}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "7px 12px",
                  borderRadius: "999px",
                  background: "#0f172a",
                  color: "#ffffff",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Play size={12} /> Tetikle
              </button>
            </div>

            <p style={{ fontSize: "0.86rem", lineHeight: 1.55, color: "#475569", marginBottom: "14px", flex: 1 }}>
              {agent.summary}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
                padding: "10px",
                borderRadius: "12px",
                background: "#f8fafc",
                marginBottom: "12px",
              }}
            >
              {agent.metrics.map((m) => (
                <div key={m.label}>
                  <div style={{ fontSize: "0.66rem", color: "#64748b", fontWeight: 700 }}>{m.label}</div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 900, color: "#0f172a", marginTop: "2px" }}>
                    {m.value}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: "0.76rem", color: "#334155", background: "#f1f5f9", padding: "10px 12px", borderRadius: "12px" }}>
              <strong style={{ display: "block", marginBottom: "4px", color: "#0f172a" }}>
                Çalışma Sıklığı: {agent.cadence}
              </strong>
              {agent.recentLogs[0] && (
                <span>
                  Son Görev: {agent.recentLogs[0].action} — <em>{agent.recentLogs[0].result}</em>
                </span>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Separate Category Social Post Planner Table */}
      <div
        style={{
          borderRadius: "22px",
          border: "1px solid rgba(15, 23, 42, 0.12)",
          background: "#ffffff",
          padding: "24px",
          marginBottom: "32px",
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#059669", textTransform: "uppercase" }}>
            SOSYAL MEDYA UZMANI & INSTAGRAM VİRAL AJANI ORTAK PLANI
          </span>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 900, color: "#0f172a", marginTop: "4px" }}>
            Kategori Bazlı Ayrı Sosyal Medya Paylaşım Kuyruğu (Her Başlık Ayrı Paylaşılır)
          </h2>
          <p style={{ fontSize: "0.88rem", color: "#475569" }}>
            HaberAI ayrı, PuanAI ayrı, İndirimAI ayrı, FinansAI ayrı, EvAI ayrı, ArabaAI ayrı paylaşım olarak tam ekran
            gerçek fotoğraf arka planla ve yapay ses olmadan yayınlanır.
          </p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left", color: "#475569" }}>
                <th style={{ padding: "10px" }}>Kategori</th>
                <th style={{ padding: "10px" }}>Yayın Kuşağı</th>
                <th style={{ padding: "10px" }}>Planlayan Ajanlar</th>
                <th style={{ padding: "10px" }}>Tam Ekran Arka Plan & Ses</th>
                <th style={{ padding: "10px" }}>Viral Kanca (Hook)</th>
                <th style={{ padding: "10px" }}>İhlal / Tekrar Sorgusu</th>
                <th style={{ padding: "10px" }}>Sayfa</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.categorySlug} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 10px", fontWeight: 900, color: "#0f172a" }}>{p.categoryName}</td>
                  <td style={{ padding: "12px 10px", fontWeight: 700, color: "#059669" }}>{p.scheduledTime}</td>
                  <td style={{ padding: "12px 10px" }}>{p.plannedBy}</td>
                  <td style={{ padding: "12px 10px" }}>
                    <div><strong>Görsel:</strong> {p.visualStyle}</div>
                    <div style={{ color: "#64748b", fontSize: "0.78rem" }}><strong>Ses:</strong> {p.audioMode}</div>
                  </td>
                  <td style={{ padding: "12px 10px", fontWeight: 700 }}>{p.hookHeadline}</td>
                  <td style={{ padding: "12px 10px" }}>
                    <span
                      style={{
                        padding: "4px 9px",
                        borderRadius: "999px",
                        background: "#ecfdf5",
                        color: "#047857",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                      }}
                    >
                      {p.complianceStatus}
                    </span>
                  </td>
                  <td style={{ padding: "12px 10px" }}>
                    <Link href={`/${p.categorySlug}`} style={{ fontWeight: 800, color: "#059669", textDecoration: "none" }}>
                      /{p.categorySlug} →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* WhatsApp 0 -> 1,000 Subscriber Growth Architect Panel */}
      {wa && (
        <div
          style={{
            borderRadius: "22px",
            border: "1px solid rgba(5, 150, 105, 0.3)",
            background: "linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)",
            padding: "24px",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div>
              <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "#047857", textTransform: "uppercase" }}>
                <MessageCircle size={14} style={{ display: "inline", marginRight: "4px" }} />
                WHATSAPP KANAL BÜYÜME & ABONE STRATEJİSİ AJANI
              </span>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 900, color: "#0f172a", marginTop: "4px" }}>
                {wa.currentStatus}
              </h2>
              <p style={{ fontSize: "0.88rem", color: "#334155" }}>Hedef: {wa.targetMilestone}</p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "14px",
              marginBottom: "20px",
            }}
          >
            {wa.activeFunnels.map((f) => (
              <div
                key={f.id}
                style={{
                  padding: "16px",
                  borderRadius: "16px",
                  background: "#ffffff",
                  border: "1px solid rgba(5, 150, 105, 0.2)",
                }}
              >
                <span
                  style={{
                    padding: "3px 8px",
                    borderRadius: "999px",
                    background: "#059669",
                    color: "#ffffff",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                  }}
                >
                  {f.status}
                </span>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", marginTop: "8px", marginBottom: "6px" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: "0.8rem", color: "#475569", lineHeight: 1.5, marginBottom: "8px" }}>
                  {f.mechanism}
                </p>
                <div style={{ fontSize: "0.76rem", fontWeight: 800, color: "#047857" }}>
                  Beklenen Etki: {f.expectedConversion}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
            {wa.channels.map((ch) => (
              <a
                key={ch.slug}
                href={ch.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "12px 14px",
                  borderRadius: "14px",
                  background: "#064e3b",
                  color: "#ffffff",
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <strong style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.88rem" }}>
                  <span>{ch.name} WhatsApp Kanalı</span>
                  <ExternalLink size={14} />
                </strong>
                <span style={{ fontSize: "0.75rem", color: "#a7f3d0" }}>{ch.leadMagnetHook}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
