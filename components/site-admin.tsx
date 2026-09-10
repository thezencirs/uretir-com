"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Database, LogOut, Pencil, Plus, Save, ShieldAlert, X } from "lucide-react";

type ProductRecord = {
  id: string;
  name: string;
  slug: string;
  makerName: string;
  city: string;
  category: string;
  platform: "WEB" | "MOBILE";
  task: string;
  description: string;
  url: string;
  makerUrl: string;
  locationSourceUrl: string;
  color: string;
  status: "DRAFT" | "PUBLISHED";
};

const blank: Omit<ProductRecord, "id"> = { name: "", slug: "", makerName: "", city: "İstanbul", category: "Mobil uygulama", platform: "MOBILE", task: "", description: "", url: "https://", makerUrl: "https://", locationSourceUrl: "https://", color: "#769d32", status: "DRAFT" };

function slugify(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("tr-TR").replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function SiteAdmin() {
  const [configured, setConfigured] = useState(true);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [records, setRecords] = useState<ProductRecord[]>([]);
  const [form, setForm] = useState({ ...blank });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/yonetim/urunler", { cache: "no-store" });
    const body = await response.json() as { data?: ProductRecord[]; error?: string };
    if (!response.ok) throw new Error(body.error ?? "Kayıtlar yüklenemedi.");
    setRecords(body.data ?? []);
  }, []);

  useEffect(() => {
    void fetch("/api/yonetim/oturum", { cache: "no-store" }).then((response) => response.json()).then(async (body: { configured?: boolean; authenticated?: boolean }) => {
      setConfigured(Boolean(body.configured)); setAuthenticated(Boolean(body.authenticated)); if (body.authenticated) await load().catch(reason => setError(reason instanceof Error ? reason.message : "Kayıtlar yüklenemedi."));
    }).catch(() => { setConfigured(false); setAuthenticated(false); });
  }, [load]);

  function change<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function login(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/yonetim/oturum", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Giriş yapılamadı.");
      setAuthenticated(true); setPassword(""); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Giriş yapılamadı."); }
    finally { setBusy(false); }
  }

  async function logout() {
    await fetch("/api/yonetim/oturum", { method: "DELETE" }); setAuthenticated(false); setRecords([]);
  }

  function edit(record: ProductRecord) {
    const { id, ...values } = record; setEditingId(id); setForm(values); setSlugTouched(true); setError(""); setNotice("");
  }

  function reset() { setEditingId(null); setForm({ ...blank }); setSlugTouched(false); }

  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/yonetim/urunler${editingId ? `/${editingId}` : ""}`, { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Kayıt kaydedilemedi.");
      setNotice(form.status === "PUBLISHED" ? "Kayıt yayımlandı." : "Kayıt taslak olarak saklandı."); reset(); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Kayıt kaydedilemedi."); }
    finally { setBusy(false); }
  }

  async function moveToDraft(record: ProductRecord) {
    if (!window.confirm(`“${record.name}” yayından kaldırılıp taslağa alınsın mı?`)) return;
    setBusy(true); setError("");
    try { const response = await fetch(`/api/yonetim/urunler/${record.id}`, { method: "DELETE" }); if (!response.ok) throw new Error("Kayıt taslağa alınamadı."); await load(); setNotice("Kayıt taslağa alındı."); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "İşlem tamamlanamadı."); }
    finally { setBusy(false); }
  }

  if (authenticated === null) return <div className="section-wrap py-24"><h1>Yönetim alanı hazırlanıyor…</h1></div>;
  if (!authenticated) return <div className="section-wrap py-16 md:py-24"><Link href="/" className="inline-flex items-center gap-2 text-sm text-muted"><ArrowLeft size={14} /> Siteye dön</Link><div className="mt-10 max-w-lg border hairline bg-[color:var(--surface)] p-7 md:p-10"><Database size={24} /><p className="mt-7 eyebrow">Üretir yönetimi</p><h1 className="mt-4 font-display text-5xl">Verinizi<br /><em>kendiniz girin.</em></h1><p className="mt-5 text-sm leading-7 text-muted">Web ve telefon uygulamalarını taslak olarak kaydedin, kaynaklarını kontrol edin ve hazır olduğunda yayımlayın.</p>{configured ? <form onSubmit={login} className="mt-8 grid gap-4"><label className="grid gap-2 text-sm">Yönetici parolası<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required className="min-h-12 border hairline bg-[color:var(--background)] px-4" /></label><button disabled={busy} className="min-h-12 bg-[color:var(--foreground)] px-5 text-sm font-bold text-[color:var(--background)]">Güvenli giriş</button></form> : <div className="mt-8 flex gap-3 border hairline p-4 text-sm"><ShieldAlert size={18} className="shrink-0" /><p>Yönetim erişimi henüz etkinleştirilmemiş. Site yöneticisiyle iletişime geçin.</p></div>}{error && <p className="mt-4 text-sm text-red-600">{error}</p>}</div></div>;

  return <div className="section-wrap py-10 md:py-16">
    <header className="flex flex-wrap items-end justify-between gap-6 border-b hairline pb-8"><div><p className="eyebrow">Üretir yönetimi</p><h1 className="mt-4 font-display text-5xl">Uygulama kayıtları</h1><p className="mt-3 text-sm text-muted">{records.length} yönetilen kayıt · {records.filter((record) => record.status === "PUBLISHED").length} yayında</p></div><div className="flex gap-2"><Link href="/uygulamalar" className="inline-flex min-h-11 items-center gap-2 border hairline px-4 text-xs font-bold">Siteyi gör</Link><button type="button" onClick={() => void logout()} className="inline-flex min-h-11 items-center gap-2 border hairline px-4 text-xs font-bold"><LogOut size={14} /> Çıkış</button></div></header>
    {(error || notice) && <div className={`mt-6 flex items-center gap-2 border p-4 text-sm ${error ? "border-red-300 text-red-700" : "hairline"}`}>{error ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}{error || notice}</div>}
    <div className="mt-8 grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
      <section className="border hairline"><div className="flex items-center justify-between border-b hairline p-5"><h2 className="font-display text-2xl">Kayıtlar</h2><button type="button" onClick={reset} className="inline-flex items-center gap-2 text-xs font-bold"><Plus size={14} /> Yeni kayıt</button></div><div className="divide-y divide-[color:var(--line)]">{records.map((record) => <article key={record.id} className="grid grid-cols-[1fr_auto] gap-4 p-5"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{record.name}</h3><span className="rounded-full border hairline px-2 py-1 text-[9px] font-bold uppercase">{record.status === "PUBLISHED" ? "Yayında" : "Taslak"}</span></div><p className="mt-2 text-xs text-muted">{record.makerName} · {record.city} · {record.platform === "WEB" ? "Web" : "Telefon"}</p></div><div className="flex gap-2"><button type="button" onClick={() => edit(record)} aria-label={`${record.name} kaydını düzenle`}><Pencil size={15} /></button>{record.status === "PUBLISHED" && <button type="button" onClick={() => void moveToDraft(record)} aria-label={`${record.name} kaydını taslağa al`}><X size={15} /></button>}</div></article>)}{records.length === 0 && <p className="p-6 text-sm text-muted">Henüz yönetilen kayıt yok. İlk kaydı sağdaki formdan ekleyin.</p>}</div></section>
      <form onSubmit={save} className="border hairline bg-[color:var(--surface)] p-6 md:p-8"><div className="flex items-start justify-between"><div><p className="eyebrow">{editingId ? "Kaydı düzenle" : "Yeni kayıt"}</p><h2 className="mt-3 font-display text-3xl">Uygulama bilgileri</h2></div>{editingId && <button type="button" onClick={reset} aria-label="Düzenlemeyi kapat"><X size={17} /></button>}</div>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm">Uygulama adı<input required value={form.name} onChange={(event) => { change("name", event.target.value); if (!slugTouched) change("slug", slugify(event.target.value)); }} className="min-h-11 border hairline bg-[color:var(--background)] px-3" /></label>
          <label className="grid gap-2 text-sm">Adres adı<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(event) => { setSlugTouched(true); change("slug", event.target.value); }} className="min-h-11 border hairline bg-[color:var(--background)] px-3" /></label>
          <label className="grid gap-2 text-sm">Üretici / ekip<input required value={form.makerName} onChange={(event) => change("makerName", event.target.value)} className="min-h-11 border hairline bg-[color:var(--background)] px-3" /></label>
          <label className="grid gap-2 text-sm">Şehir<select value={form.city} onChange={(event) => change("city", event.target.value)} className="min-h-11 border hairline bg-[color:var(--background)] px-3">{["İstanbul", "Ankara", "İzmir", "Bursa", "Eskişehir"].map((city) => <option key={city}>{city}</option>)}</select></label>
          <label className="grid gap-2 text-sm">Yayın türü<select value={form.platform} onChange={(event) => change("platform", event.target.value as "WEB" | "MOBILE")} className="min-h-11 border hairline bg-[color:var(--background)] px-3"><option value="WEB">Web uygulaması</option><option value="MOBILE">Telefon uygulaması</option></select></label>
          <label className="grid gap-2 text-sm">Kategori<select value={form.category} onChange={(event) => change("category", event.target.value)} className="min-h-11 border hairline bg-[color:var(--background)] px-3">{["Yapay zekâ", "Oyun", "Mobil uygulama", "İş araçları"].map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="grid gap-2 text-sm sm:col-span-2">Çözdüğü ihtiyaç<input required value={form.task} onChange={(event) => change("task", event.target.value)} placeholder="Örn. Tasarım, öğrenme, işimi büyüt" className="min-h-11 border hairline bg-[color:var(--background)] px-3" /></label>
          <label className="grid gap-2 text-sm sm:col-span-2">Kısa açıklama<textarea required minLength={10} maxLength={1200} rows={4} value={form.description} onChange={(event) => change("description", event.target.value)} className="border hairline bg-[color:var(--background)] p-3" /></label>
          <label className="grid gap-2 text-sm sm:col-span-2">Ürün bağlantısı<input required type="url" value={form.url} onChange={(event) => change("url", event.target.value)} className="min-h-11 border hairline bg-[color:var(--background)] px-3" /></label>
          <label className="grid gap-2 text-sm">Üretici kaynağı<input required type="url" value={form.makerUrl} onChange={(event) => change("makerUrl", event.target.value)} className="min-h-11 border hairline bg-[color:var(--background)] px-3" /></label>
          <label className="grid gap-2 text-sm">Konum kaynağı<input required type="url" value={form.locationSourceUrl} onChange={(event) => change("locationSourceUrl", event.target.value)} className="min-h-11 border hairline bg-[color:var(--background)] px-3" /></label>
          <label className="grid gap-2 text-sm">Kart rengi<input required type="color" value={form.color} onChange={(event) => change("color", event.target.value)} className="h-11 w-full border hairline bg-[color:var(--background)] p-1" /></label>
          <label className="grid gap-2 text-sm">Yayın durumu<select value={form.status} onChange={(event) => change("status", event.target.value as "DRAFT" | "PUBLISHED")} className="min-h-11 border hairline bg-[color:var(--background)] px-3"><option value="DRAFT">Taslak</option><option value="PUBLISHED">Yayımla</option></select></label>
        </div>
        <button disabled={busy} className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[color:var(--foreground)] px-5 text-sm font-bold text-[color:var(--background)]"><Save size={15} /> {busy ? "Kaydediliyor…" : "Kaydet"}</button>
      </form>
    </div>
    <div className="mt-10 flex flex-wrap gap-4 border-t hairline pt-7 text-sm"><Link href="/puan-ai/admin" className="underline">PuanAI kampanya yönetimi</Link><Link href="/" className="inline-flex items-center gap-2 text-muted"><ArrowLeft size={14} /> Ana sayfa</Link></div>
  </div>;
}
