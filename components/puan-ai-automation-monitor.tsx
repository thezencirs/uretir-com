"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, RefreshCcw, ShieldAlert } from "lucide-react";

type Count = { status?: string; health?: string; _count: { _all: number } };
type Run = { id: string; status: string; triggeredBy: string; startedAt: string; completedAt: string | null; error: string | null };
type MonitorData = { runs: Run[]; submissions: Count[]; sources: Count[]; campaigns: Count[]; oldestPendingAt: string | null };

export function PuanAIAutomationMonitor() {
  const [data, setData] = useState<MonitorData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/puan-ai/admin/automation", { cache: "no-store" });
      const body = await response.json() as { data?: MonitorData; error?: string };
      if (!response.ok || !body.data) throw new Error(body.error ?? "Durum yüklenemedi.");
      setData(body.data);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Durum yüklenemedi."); }
    finally { setBusy(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  return <div className="section-wrap py-12 md:py-20">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="pa-kicker">PuanAI operasyon</p><h1 className="mt-2 text-4xl font-semibold">Otomasyon merkezi</h1></div><div className="flex gap-3"><Link href="/puan-ai/admin" className="inline-flex items-center gap-2 rounded-lg border px-4 py-3 text-sm"><ArrowLeft size={15} /> Veri yönetimi</Link><button className="inline-flex items-center gap-2 rounded-lg border px-4 py-3 text-sm" onClick={() => void load()} disabled={busy}><RefreshCcw size={15} className={busy ? "animate-spin" : ""} /> Yenile</button></div></div>
    {error && <div className="mt-8 flex items-center gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800"><ShieldAlert size={18} /> {error}</div>}
    {data && <><div className="mt-10 grid gap-4 md:grid-cols-3"><Metric title="WhatsApp kuyruğu" rows={data.submissions} /><Metric title="Kaynak sağlığı" rows={data.sources} /><Metric title="Kampanyalar" rows={data.campaigns} /></div>
      <section className="mt-10 rounded-xl border p-5"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Son çalışmalar</h2><small className="text-muted">En eski bekleyen: {data.oldestPendingAt ? new Date(data.oldestPendingAt).toLocaleString("tr-TR") : "Yok"}</small></div><div className="mt-5 grid gap-3">{data.runs.map((run) => <article key={run.id} className="grid gap-2 rounded-lg border p-4 text-sm md:grid-cols-[1fr_1fr_1fr]"><strong>{run.status}</strong><span>{run.triggeredBy}</span><span>{new Date(run.startedAt).toLocaleString("tr-TR")}</span>{run.error && <p className="text-red-700 md:col-span-3">{run.error}</p>}</article>)}{!data.runs.length && <p className="text-sm text-muted">Henüz tamamlanmış otomasyon çalışması yok.</p>}</div></section></>}
  </div>;
}

function Metric({ title, rows }: { title: string; rows: Count[] }) {
  return <section className="rounded-xl border p-5"><h2 className="text-sm font-semibold">{title}</h2><div className="mt-4 grid gap-2">{rows.map((row) => <div key={row.status ?? row.health} className="flex justify-between text-sm"><span>{row.status ?? row.health}</span><strong>{row._count._all}</strong></div>)}{!rows.length && <p className="text-sm text-muted">Kayıt yok.</p>}</div></section>;
}
